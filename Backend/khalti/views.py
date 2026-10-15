from decimal import Decimal
from io import BytesIO
import logging

import requests
from django.conf import settings
from django.core.mail import EmailMessage
from django.db import transaction
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from reportlab.pdfgen import canvas
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from api.models import Cart, CartOrder as Order
from .models import Transaction


logger = logging.getLogger(__name__)

# user 980000005 pass or mipn 1111 otp 987654

class KhaltiPaymentError(Exception):
    def __init__(self, message, status_code=502, response_data=None):
        super().__init__(message)
        self.status_code = status_code
        self.response_data = response_data


def initiate_payment(order_id, amount, customer_name="Customer", customer_email=""):
    amount = int((Decimal(amount) * 100).quantize(Decimal("1")))
    if amount <= 0:
        raise KhaltiPaymentError("Order total must be greater than zero.", status_code=400)

    return _khalti_request(
        "epayment/initiate/",
        {
            "return_url": settings.KHALTI_RETURN_URL,
            "website_url": settings.KHALTI_WEBSITE_URL,
            "amount": amount,
            "purchase_order_id": str(order_id),
            "purchase_order_name": f"Order {order_id}",
            "customer_info": {
                "name": customer_name or "Customer",
                "email": customer_email or "",
            },
        },
    )


def verify_payment(pidx):
    if not pidx:
        raise KhaltiPaymentError("pidx is required.", status_code=400)
    return _khalti_request("epayment/lookup/", {"pidx": pidx})


def _khalti_request(endpoint, payload):
    secret_key = settings.KHALTI_SECRET_KEY
    if not secret_key:
        raise KhaltiPaymentError("KHALTI_SECRET_KEY is not configured.", status_code=500)

    try:
        response = requests.post(
            f"{settings.KHALTI_API_URL.rstrip('/')}/{endpoint.lstrip('/')}",
            headers={
                "Authorization": f"Key {secret_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=15,
        )
        response_data = response.json()
    except (requests.RequestException, ValueError) as error:
        raise KhaltiPaymentError(
            f"Unable to connect to Khalti: {error}", status_code=502
        ) from error

    if not response.ok:
        raise KhaltiPaymentError(
            "Khalti rejected the payment request.",
            status_code=response.status_code,
            response_data=response_data,
        )
    return response_data


def _error_response(error):
    if error.response_data is not None:
        return Response(error.response_data, status=error.status_code)
    return Response({"detail": str(error)}, status=error.status_code)


def _frontend_checkout_url(order_id, payment_status):
    base = settings.KHALTI_WEBSITE_URL.rstrip("/")
    return f"{base}/checkout/{order_id}?payment={payment_status}"


def _order_amount_paisa(order):
    return int((Decimal(order.total) * 100).quantize(Decimal("1")))


def _build_receipt_pdf(order, khalti_transaction):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)
    y = 800
    pdf.drawString(100, y, "Payment Receipt")
    y -= 20
    pdf.drawString(100, y, f"Order ID: {order.order_id}")
    y -= 20
    pdf.drawString(100, y, f"Customer: {order.full_name or ''}")
    y -= 20
    pdf.drawString(100, y, f"Email: {order.email or ''}")
    y -= 30
    pdf.drawString(100, y, "Purchased products:")
    y -= 20
    for item in order.order.select_related("course"):
        title = item.course.title if item.course else "Course"
        pdf.drawString(100, y, f"- {title}  Qty: 1  Amount: Rs {item.total}")
        y -= 18
        if y < 80:
            pdf.showPage()
            y = 800
    y -= 10
    pdf.drawString(100, y, f"Total amount: Rs {order.total}")
    y -= 20
    pdf.drawString(100, y, f"Transaction ID: {khalti_transaction.transaction_id}")
    y -= 20
    pdf.drawString(100, y, f"Payment status: {order.payment_status}")
    y -= 20
    pdf.drawString(100, y, "Thank you for your purchase.")
    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer


def _email_receipt(order, khalti_transaction):
    if not order.email:
        return
    pdf_buffer = _build_receipt_pdf(order, khalti_transaction)
    email = EmailMessage(
        subject=f"Payment receipt for order {order.order_id}",
        body=(
            f"Dear {order.full_name or 'Customer'},\n\n"
            f"Your Khalti payment for order {order.order_id} was successful.\n"
            f"Total amount: Rs {order.total}\n"
            f"Transaction ID: {khalti_transaction.transaction_id}\n"
            f"Payment status: {order.payment_status}\n\n"
            "Your PDF receipt is attached.\n\n"
            "Thank you for shopping with us.\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[order.email],
    )
    email.attach(
        f"receipt_{order.order_id}.pdf",
        pdf_buffer.getvalue(),
        "application/pdf",
    )
    pdf_buffer.close()
    email.send()


def _complete_paid_order(order, lookup_data):
    transaction_id = lookup_data.get("transaction_id") or lookup_data.get("pidx")
    user_label = ""
    if order.student_id:
        user_label = order.student.username or order.student.email or ""
    user_label = user_label or order.email or order.full_name or "customer"

    with transaction.atomic():
        order.payment_status = "paid"
        order.save(update_fields=["payment_status", "updated_date"])
        khalti_transaction, created = Transaction.objects.get_or_create(
            transaction_id=transaction_id,
            defaults={
                "order": order,
                "amount": str(order.total),
                "user": user_label,
            },
        )
        from api.views import finalize_paid_order

        enrollments = finalize_paid_order(order)
        if order.cart_id:
            Cart.objects.filter(cart_id=order.cart_id).delete()

    if created:
        try:
            _email_receipt(order, khalti_transaction)
        except Exception:
            pass
    return khalti_transaction, enrollments


def _verify_and_fulfill(pidx, requested_order_id=None):
    lookup_data = verify_payment(pidx)
    khalti_order_id = lookup_data.get("purchase_order_id") or requested_order_id
    if requested_order_id and khalti_order_id and requested_order_id != khalti_order_id:
        raise KhaltiPaymentError(
            "Payment does not belong to this order.", status_code=400
        )
    if not khalti_order_id:
        raise KhaltiPaymentError("Order reference is missing.", status_code=400)

    order = get_object_or_404(Order, order_id=khalti_order_id)
    lookup_amount = lookup_data.get("total_amount", lookup_data.get("amount"))
    expected_amount = _order_amount_paisa(order)
    if lookup_amount is not None and int(lookup_amount) != expected_amount:
        logger.warning(
            "Khalti amount mismatch for order %s: received %s paisa, expected %s paisa",
            order.order_id,
            lookup_amount,
            expected_amount,
        )
        raise KhaltiPaymentError(
            "Payment amount does not match the order total.", status_code=400
        )

    payment_status = lookup_data.get("status")
    if payment_status != "Completed":
        if order.payment_status.lower() != "paid":
            order.payment_status = "failed"
            order.save(update_fields=["payment_status", "updated_date"])
        raise KhaltiPaymentError(
            "Payment has not completed.",
            status_code=400,
            response_data={"detail": "Payment has not completed.", "payment": lookup_data},
        )

    if order.payment_status.lower() == "paid":
        khalti_transaction = Transaction.objects.filter(
            transaction_id=lookup_data.get("transaction_id") or lookup_data.get("pidx")
        ).first()
        if khalti_transaction:
            return order, lookup_data, []
        _, enrollments = _complete_paid_order(order, lookup_data)
        return order, lookup_data, enrollments

    _, enrollments = _complete_paid_order(order, lookup_data)
    return order, lookup_data, enrollments


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def initiate_khalti_payment(request, id=None):
    order_id = id or request.data.get("order_id")
    if not order_id:
        return Response(
            {"detail": "order_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    order = get_object_or_404(Order, order_id=order_id)
    if order.payment_status.lower() == "paid":
        return Response(
            {"detail": "This order has already been paid."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        response_data = initiate_payment(
            order_id=order.order_id,
            amount=order.total,
            customer_name=order.full_name,
            customer_email=order.email,
        )
        logger.info(
            "Initiated Khalti payment for order %s with amount %s paisa",
            order.order_id,
            _order_amount_paisa(order),
        )
    except KhaltiPaymentError as error:
        return _error_response(error)

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def verifyKhalti(request):
    payload = request.data if request.method == "POST" else request.query_params
    pidx = payload.get("pidx")
    order_id = payload.get("purchase_order_id") or payload.get("order_id")
    callback_status = payload.get("status")

    if callback_status and callback_status != "Completed" and not pidx:
        if order_id:
            order = Order.objects.filter(order_id=order_id).first()
            if order and order.payment_status.lower() != "paid":
                order.payment_status = "failed"
                order.save(update_fields=["payment_status", "updated_date"])
            if request.method == "GET" and order_id:
                return HttpResponseRedirect(_frontend_checkout_url(order_id, "failed"))
        return Response(
            {"detail": "Payment was canceled or failed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        order, lookup_data, enrollments = _verify_and_fulfill(pidx, order_id)
    except KhaltiPaymentError as error:
        logger.warning(
            "Khalti verification failed for order %s: %s",
            order_id or "<unknown>",
            error,
        )
        if request.method == "GET" and order_id:
            return HttpResponseRedirect(_frontend_checkout_url(order_id, "failed"))
        return _error_response(error)

    if request.method == "GET":
        return HttpResponseRedirect(_frontend_checkout_url(order.order_id, "success"))

    return Response(
        {
            "message": "Payment verified successfully.",
            "order_id": order.order_id,
            "payment_status": order.payment_status,
            "enrollment_ids": [enrollment.enrollment_id for enrollment in enrollments],
            "payment": lookup_data,
        },
        status=status.HTTP_200_OK,
    )
