from decimal import Decimal

from django.shortcuts import get_object_or_404
from django.db import transaction
from khalti_payment.views import KhaltiPaymentError, initiate_payment, verify_payment

from .serializers import *
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    DestroyAPIView,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import *


@transaction.atomic
def finalize_paid_order(order):
    """Create the enrollment and teacher notification for each paid item."""
    enrollments = []

    for order_item in order.order.select_related("course", "teacher"):
        enrollment, _ = EnrolledCourse.objects.get_or_create(
            order_item=order_item,
            defaults={
                "course": order_item.course,
                "user": order.student,
                "teacher": order_item.teacher,
            },
        )
        Notification.objects.get_or_create(
            user=order.student,
            teacher=order_item.teacher,
            order=order,
            order_item=order_item,
            type="New Order",
            defaults={"seen": False},
        )
        enrollments.append(enrollment)

    return enrollments


class CategoryListAPIView(ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CourseListAPIView(ListAPIView):
    queryset = Course.objects.filter(
        platform_status="published", teacher_course_status="published"
    )
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]


class CourseDetailAPIView(RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    # by default it will demand /1/ id or pk to fetch specific course but using get object will provide us power to use slug in search query to search the object pass the object

    def get_object(self):
        slug = self.kwargs["slug"]
        course = Course.objects.filter(
            slug=slug, platform_status="published", teacher_course_status="published"
        )
        return course


class CartAPIView(CreateAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [AllowAny]

    # create method is used to perform validation , manipulaiton on the forntend provided value before direclty saving any object in data base
    def create(self, request, *args, **kwargs):
        course_id = request.data["course_id"]
        user_id = request.data["user_id"]
        price = request.data["price"]
        country_name = request.data["country_name"]
        cart_id = request.data["cart_id"]

        # Now fetching items one by one from databse
        course = Course.objects.filter(course_id=course_id).first()

        # some time if user is not authenticated it from forntend side user id might come undefined
        if user_id == "undefined":
            user = None
        else:
            user = User.objects.filter(id=user_id).first()

        try:
            country = Country.objects.filter(name=country_name).first()
        except:
            country = None
            country_name = "Nepal"

        if country:
            tax_rate = country.tax_rate / 100
        else:
            tax_rate = 0

        # some time user may update the existing cart with updated information and code for that
        cart = Cart.objects.filter(cart_id=cart_id, course_id=course_id)

        if cart:
            cart.course = course
            cart.user = user
            cart.price = price
            # using decimal fields because some time frontend can send interger value in the form of string so to be in safer side using Decimal() python function
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id
            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()
            return Response(
                {"message": "Cart Updated Successfully"}, status=status.HTTP_200_0K
            )

        # But sometime user may wanted to create new cart with cart infromation insteading of udating the existing cart so code for that
        else:
            cart = Cart.objects.create(
                course=course,
                user=user,
                price=price,
                tax_fee=Decimal(price) * Decimal(tax_rate),
                country=country,
                cart_id=cart_id,
                total=Decimal(price) + (Decimal(price) * Decimal(tax_rate)),
            )
        return Response(
            {"message": "Cart created successfully"}, status=status.HTTP_201_CREATED
        )

    # purpose of list api view is list down all the cart items of specific cart created by user at a time (like user create multiple cart items and each will have it own set of cart items with unique cart id)


class SpecifiCartCartItemsListAPIView(ListAPIView):
    serializer_class = CartSerializer
    permission_classes = [AllowAny]

    # Pervisoly we used get object to retreive object based on slug for retreiv and for list option we will use get query set and demand cart id as url input to fetch the cart items in tis and return the query  set
    def get_queryset(self):
        cart_id = self.kwargs["cart_id"]
        queryset = Cart.objects.filter(cart_id=cart_id)
        return queryset


# this class will basically retrieve the cart_id field value and cart object primary key delete the specific cart object also know as cart item
class SpecifiCartCartitemDelete(DestroyAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        cart_id = self.kwargs["cart_id"]
        cart_object_pk = self.kwargs["item_id"]
        return Cart.objects.filter(cart_id=cart_id, id=cart_object_pk).first()


class CartItemsInSpecificCartCalculation(RetrieveAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [AllowAny]

    # below functin fetch all the order cart product in specific cart sharing the common cart id and then passed it to get method to do further calculation
    def get_queryset(self):
        cart_id = self.kwargs["cart_id"]
        return Cart.objects.filter(cart_id=cart_id)

    def get(self, request, *args, **kwargs):
        total_cart_items_in_cart = self.get_queryset()

        total_price_of_all_items_in_cart = 0
        tax = 0

        for items in total_cart_items_in_cart:
            total_price_of_all_items_in_cart += items.price
            tax = items.tax_fee

        total_amount_after_tax = round(float(total_price_of_all_items_in_cart + tax), 2)

        data = {
            "price": total_price_of_all_items_in_cart,
            "tax": tax,
            "grand_total": total_amount_after_tax,
        }
        return Response(data)


class CreateOrderAPIView(CreateAPIView):
    """
                 STUDENT
                │
                │ adds courses
                ↓
          ┌───────────┐
          │   CART    │
          └─────┬─────┘
                │
       cart_id = 123456
                │
       ┌────────┼────────┐
       ↓        ↓        ↓
    Python    Django    React
       │        │        │
       └────────┼────────┘
                │
             CHECKOUT
                │
                ↓
         ┌─────────────┐
         │  CART ORDER │
         │  Order #123 │
         └──────┬──────┘
                │
       ┌────────┼────────┐
       ↓        ↓        ↓
    ORDER      ORDER     ORDER
    ITEM       ITEM      ITEM
       │        │        │
    Python    Django    React
    """

    serializer_class = CartOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # below informations to create order
        full_name = request.data["full_name"]
        email = request.data["email"]
        country = request.data["country"]
        cart_id = request.data["cart_id"]
        user_id = request.user.id
        user = User.objects.filter(id=user_id).first() if user_id else None

        # fetched the cart times
        cart_items = Cart.objects.filter(cart_id=cart_id)

        # order created based on the information came from front end
        order = CartOrder.objects.create(
            full_name=full_name, email=email, country=country, student=user
        )
        # now creating the differnt orderitems for specific order id based on different cart items in the cart by iterating over the cart items in the created cart
        total_price = Decimal("0")
        total_tax = Decimal("0")
        total_initial_total = Decimal("0")

        for c in cart_items:
            CartOrderItem.objects.create(
                order=order,
                course=c.course,
                tax_fee=c.tax_fee,
                total=c.total,
                initial_total=c.total,
                teacher=c.course.teacher,
            )
            total_price += c.price
            total_tax += c.tax_fee
            total_initial_total += c.total

        order.sub_total = total_price
        order.tax_fee = total_tax
        order.total = total_initial_total
        order.initial_total = total_initial_total
        order.save()
        return Response(
            {"message": "Order Created Successfully", "order_oid": order.order_id},
            status=status.HTTP_201_CREATED,
        )


class CheckOutAPIView(RetrieveAPIView):
    serializer_class = CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = CartOrder.objects.all()
    # Look if i had used the get query set method then via self.kwarg i have prermsiion to set which paramter input i want lookup purpose but if dont use that then i have to use looked field explicitly
    lookup_field = "order_id"
    
class CuponApplyAPIView(CreateAPIView):

    serializer_class = CouponApplySerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):

        order_id = request.data["order_id"]
        coupon_code = request.data.get("code") or request.data.get("coupon")
        if not coupon_code:
            return Response(
                {"detail": "Coupon code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the actual CartOrder
        order = CartOrder.objects.get(order_id=order_id)

        # Get the CartOrderItems belonging to this order
        order_items = CartOrderItem.objects.filter(order=order)

        # Find the existing coupon
        coupon = Coupon.objects.get(code=coupon_code)

        if coupon:

            # Loop through every item in the order
            for i in order_items:

                # Check whether this coupon is already on this item
                if not i.coupons.filter(id=coupon.id).exists():

                    discount = i.total * coupon.discount / 100

                    i.total -= discount
                    i.price -= discount
                    i.saved += discount
                    i.applied_coupon = True

                    i.coupons.add(coupon)

                    # Update parent order
                    order.coupons.add(coupon)
                    order.total -= discount
                    order.sub_total -= discount
                    order.saved += discount

                    i.save()
                    order.save()

                    coupon.used_by.add(order.student)

                else:
                    return Response(
                        "Cupon has been already applied",
                        status=status.HTTP_200_OK
                    )

            return Response(
                {"message": "cupon applied successfully"},
                status=status.HTTP_201_CREATED
            )

        else:
            return Response(
                {"message": "Cupon doesn't found or is expired"},
                status=status.HTTP_404_NOT_FOUND
            )


class KhaltiInitiateAPIView(CreateAPIView):
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response(
                {"detail": "order_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = get_object_or_404(CartOrder, order_id=order_id)
        if order.payment_status == "paid":
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
        except KhaltiPaymentError as error:
            if error.response_data is not None:
                return Response(error.response_data, status=error.status_code)
            return Response(
                {"detail": str(error)},
                status=error.status_code,
            )

        return Response(response_data, status=status.HTTP_200_OK)


class KhaltiVerifyAPIView(CreateAPIView):
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        return self._verify(request.data)

    def _verify(self, request_data):
        pidx = request_data.get("pidx")
        requested_order_id = request_data.get("order_id")
        if not pidx:
            return Response(
                {"detail": "pidx is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            response_data = verify_payment(pidx)
        except KhaltiPaymentError as error:
            if error.response_data is not None:
                return Response(error.response_data, status=error.status_code)
            return Response(
                {"detail": str(error)},
                status=error.status_code,
            )

        khalti_order_id = response_data.get("purchase_order_id")
        if requested_order_id and requested_order_id != khalti_order_id:
            return Response(
                {"detail": "Payment does not belong to this order."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = get_object_or_404(CartOrder, order_id=khalti_order_id)
        expected_amount = int((Decimal(order.total) * 100).quantize(Decimal("1")))
        if response_data.get("amount") != expected_amount:
            return Response(
                {"detail": "Payment amount does not match the order total."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if response_data.get("status") != "Completed":
            return Response(
                {"detail": "Payment has not completed.", "payment": response_data},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            order.payment_status = "paid"
            order.save(update_fields=["payment_status", "updated_date"])
            enrollments = finalize_paid_order(order)
        return Response(
            {
                "message": "Payment verified successfully.",
                "order_id": order.order_id,
                "enrollment_ids": [enrollment.enrollment_id for enrollment in enrollments],
            },
            status=status.HTTP_200_OK,
        )

    def get(self, request, *args, **kwargs):
        return self._verify(request.query_params)
    

            
