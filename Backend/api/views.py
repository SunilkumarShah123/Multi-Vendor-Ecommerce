from decimal import Decimal

from django.shortcuts import get_object_or_404
from django.db import transaction

from .serializers import *
from rest_framework.mixins import UpdateModelMixin
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    DestroyAPIView,
)

from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from .models import *


@transaction.atomic
def finalize_paid_order(order):
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
        platform_status="Published", teacher_course_status="Published"
    )
    serializer_class=CourseSerializer
    permission_classes = [AllowAny]


class CourseDetailAPIView(RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    # by default it will demand /1/ id or pk to fetch specific course but using get object will provide us power to use slug in search query to search the object pass the object

    def get_object(self):
        slug = self.kwargs["slug"]
        return get_object_or_404(
            Course,
            slug=slug,
            platform_status="Published",
            teacher_course_status="Published",
        )


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
        print("course_id received:", course_id)
        print("course object:", course)

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
        cart = Cart.objects.filter(cart_id=cart_id, course__course_id=course_id).first()
        print("existing cart",cart)

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
                {"message": "Cart Updated Successfully"}, status=status.HTTP_200_OK
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
            print('cart_id',cart.cart_id)
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
        print(f"cart id is {cart_id} and item_deleting_id is {cart_object_pk}")
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


class CreateOrUpdateOrderAPIView(CreateAPIView, UpdateModelMixin):
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
    queryset = CartOrder.objects.all()
    lookup_field = "order_id"

    def create(self, request, *args, **kwargs):
        # below informations to create order
        full_name = request.data["full_name"]
        email = request.data["email"]
        country = request.data["country"]
        cart_id = request.data["cart_id"]
        user_id = request.data["user_id"]
        user = User.objects.filter(id=user_id).first() if user_id else None

        # fetched the cart times
        cart_items = Cart.objects.filter(cart_id=cart_id)

        # order created based on the information came from front end
        order = CartOrder.objects.create(
            full_name=full_name,
            email=email,
            country=country,
            student=user,
            cart_id=cart_id,
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

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        order = serializer.instance
        cart_id = self.request.data.get("cart_id")
        if not cart_id:
            raise ValidationError({"cart_id": "This field is required."})
        if order.payment_status.lower() == "paid":
            raise ValidationError({"detail": "A paid order cannot be edited."})

        cart_items = list(
            Cart.objects.filter(cart_id=cart_id).select_related(
                "course", "course__teacher"
            )
        )
        if not cart_items:
            raise ValidationError({"cart_id": "Your cart is empty."})

        with transaction.atomic():
            existing_items = {
                item.course_id: item for item in order.order.all()
            }
            cart_course_ids = {item.course_id for item in cart_items}

            for course_id, order_item in existing_items.items():
                if course_id not in cart_course_ids:
                    order_item.delete()

            updated_items = []
            for cart_item in cart_items:
                order_item = existing_items.get(cart_item.course_id)
                if order_item is None:
                    order_item = CartOrderItem.objects.create(
                        order=order,
                        course=cart_item.course,
                        teacher=cart_item.course.teacher,
                        tax_fee=cart_item.tax_fee,
                        total=cart_item.total,
                        initial_total=cart_item.total,
                    )
                else:
                    order_item.course = cart_item.course
                    order_item.teacher = cart_item.course.teacher
                    order_item.tax_fee = cart_item.tax_fee
                    order_item.initial_total = cart_item.total
                    order_item.total = cart_item.total - order_item.saved
                    order_item.save(
                        update_fields=[
                            "course",
                            "teacher",
                            "tax_fee",
                            "initial_total",
                            "total",
                            "updated_date",
                        ]
                    )
                updated_items.append(order_item)

            serializer.save(cart_id=cart_id)
            order.sub_total = sum(
                (item.total - item.tax_fee for item in updated_items),
                Decimal("0"),
            )
            order.tax_fee = sum(
                (item.tax_fee for item in updated_items), Decimal("0")
            )
            order.initial_total = sum(
                (item.initial_total for item in updated_items), Decimal("0")
            )
            order.total = sum(
                (item.total for item in updated_items), Decimal("0")
            )
            order.teachers.set({item.teacher_id for item in updated_items})
            order.save(
                update_fields=[
                    "sub_total",
                    "tax_fee",
                    "initial_total",
                    "total",
                    "cart_id",
                    "updated_date",
                ]
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
        try:
            coupon = Coupon.objects.get(code=coupon_code)
        except Coupon.DoesNotExist:
            return Response(
            {"message": "Coupon doesn't exist or has expired"},
        status=status.HTTP_404_NOT_FOUND,
            )

        if coupon:

            # Loop through every item in the order
            for i in order_items:

                # Check whether this coupon is already on this item
                if not i.coupons.filter(id=coupon.id).exists():

                    discount = (
                        (i.total - i.tax_fee)
                        * Decimal(coupon.discount)
                        / Decimal("100")
                    ).quantize(Decimal("0.01"))

                    i.total -= discount
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


class SearchCourseView(ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        search = self.request.query_params.get('query', '').strip()

        if search:
            return self.queryset.filter(
                platform_status="Published",
                teacher_course_status="Published",
            ).filter(Q(title__icontains=search) | Q(description__icontains=search))

        return self.queryset.none()
    
    

            
