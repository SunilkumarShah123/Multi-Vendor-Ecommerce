from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from api.models import Cart, CartOrder, CartOrderItem, Category, Course, EnrolledCourse, Notification, Teacher
from khalti.models import Transaction


User = get_user_model()


@override_settings(
    KHALTI_SECRET_KEY="test-secret",
    KHALTI_API_URL="https://khalti.test/api/v2",
    KHALTI_RETURN_URL="http://127.0.0.1:8000/api/khalti/verify-khalti/",
    KHALTI_WEBSITE_URL="http://127.0.0.1:5173",
    DEFAULT_FROM_EMAIL="store@example.com",
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
class KhaltiPaymentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username="student", email="student@example.com", password="password"
        )
        teacher_user = User.objects.create_user(
            username="teacher", email="teacher@example.com", password="password"
        )
        self.teacher = Teacher.objects.create(user=teacher_user, full_name="Teacher")
        category = Category.objects.create(title="Programming")
        self.course = Course.objects.create(
            category=category,
            teacher=self.teacher,
            title="Django",
            price="100.00",
        )
        self.order = CartOrder.objects.create(
            student=self.student,
            total=Decimal("165.00"),
            full_name="Student",
            email="student@example.com",
        )
        CartOrderItem.objects.create(
            order=self.order,
            course=self.course,
            teacher=self.teacher,
            total="165.00",
            initial_total="165.00",
        )

    def test_initiate_payment_returns_khalti_url(self):
        with patch(
            "khalti.views.initiate_payment",
            return_value={"payment_url": "https://pay.khalti.com/test", "pidx": "pidx-1"},
        ) as initiate:
            response = self.client.post(
                "/api/khalti/initiate-khalti-payment/",
                {"order_id": self.order.order_id},
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["payment_url"], "https://pay.khalti.com/test")
        initiate.assert_called_once()

    def test_verify_creates_transaction_marks_paid_and_emails_once(self):
        from django.core import mail

        self.order.cart_id = "123456"
        self.order.save(update_fields=["cart_id"])
        paid_cart_item = Cart.objects.create(
            course=self.course,
            user=self.student,
            price=Decimal("100.00"),
            total=Decimal("100.00"),
            cart_id=self.order.cart_id,
        )
        other_cart_item = Cart.objects.create(
            course=self.course,
            user=self.student,
            price=Decimal("100.00"),
            total=Decimal("100.00"),
            cart_id="654321",
        )
        lookup = {
            "pidx": "test-pidx",
            "purchase_order_id": self.order.order_id,
            "amount": 16500,
            "status": "Completed",
            "transaction_id": "txn-123",
        }
        with patch("khalti.views.verify_payment", return_value=lookup), patch(
            "khalti.views._email_receipt"
        ) as send_receipt:
            first = self.client.post(
                "/api/khalti/verify-khalti/",
                {"pidx": "test-pidx", "order_id": self.order.order_id},
                format="json",
            )
            second = self.client.post(
                "/api/khalti/verify-khalti/",
                {"pidx": "test-pidx", "order_id": self.order.order_id},
                format="json",
            )

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, "paid")
        self.assertEqual(Transaction.objects.filter(order=self.order).count(), 1)
        self.assertEqual(EnrolledCourse.objects.filter(order_item__order=self.order).count(), 1)
        self.assertEqual(Notification.objects.filter(order=self.order, type="New Order").count(), 1)
        self.assertEqual(send_receipt.call_count, 1)
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(Cart.objects.filter(pk=paid_cart_item.pk).exists())
        self.assertTrue(Cart.objects.filter(pk=other_cart_item.pk).exists())

    def test_verify_rejects_amount_mismatch(self):
        lookup = {
            "pidx": "test-pidx",
            "purchase_order_id": self.order.order_id,
            "amount": 100,
            "status": "Completed",
            "transaction_id": "txn-bad",
        }
        with patch("khalti.views.verify_payment", return_value=lookup):
            response = self.client.post(
                "/api/khalti/verify-khalti/",
                {"pidx": "test-pidx", "order_id": self.order.order_id},
                format="json",
            )

        self.assertEqual(response.status_code, 400)
        self.order.refresh_from_db()
        self.assertNotEqual(self.order.payment_status.lower(), "paid")
        self.assertEqual(Transaction.objects.count(), 0)

    def test_receipt_pdf_is_emailed_to_customer(self):
        from django.core import mail
        from khalti.models import Transaction
        from khalti.views import _email_receipt

        txn = Transaction.objects.create(
            order=self.order,
            transaction_id="txn-email",
            amount=str(self.order.total),
            user=self.student.username,
        )
        self.order.payment_status = "paid"
        self.order.save(update_fields=["payment_status"])
        _email_receipt(self.order, txn)

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["student@example.com"])
        self.assertTrue(mail.outbox[0].attachments)

    def test_canceled_payment_marks_order_failed(self):
        response = self.client.get(
            "/api/khalti/verify-khalti/",
            {"status": "User canceled", "purchase_order_id": self.order.order_id},
        )

        self.assertEqual(response.status_code, 302)
        self.assertIn("payment=failed", response.url)
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, "failed")

    def test_successful_payment_redirects_to_frontend_checkout(self):
        lookup = {
            "pidx": "test-pidx",
            "purchase_order_id": str(self.order.order_id),
            "amount": 16500,
            "status": "Completed",
            "transaction_id": "txn-redirect",
        }
        with patch("khalti.views.verify_payment", return_value=lookup), patch(
            "khalti.views._email_receipt"
        ):
            response = self.client.get(
                "/api/khalti/verify-khalti/",
                {"pidx": "test-pidx", "purchase_order_id": self.order.order_id},
            )

        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.url,
            f"http://127.0.0.1:5173/checkout/{self.order.order_id}?payment=success",
        )
