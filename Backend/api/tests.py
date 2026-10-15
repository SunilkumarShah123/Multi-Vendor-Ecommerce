from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import (
	Cart,
	CartOrder,
	CartOrderItem,
	Category,
	Course,
	Coupon,
	EnrolledCourse,
	Notification,
	Teacher,
)


User = get_user_model()


class CheckoutOrderTests(TestCase):
	def setUp(self):
		self.student = User.objects.create_user(
			username="student", email="student@example.com", password="password"
		)
		teacher_user = User.objects.create_user(
			username="teacher", email="teacher@example.com", password="password"
		)
		self.teacher = Teacher.objects.create(user=teacher_user, full_name="Teacher")
		category = Category.objects.create(title="Programming")
		course = Course.objects.create(
			category=category,
			teacher=self.teacher,
			title="Django",
			price="100.00",
		)
		self.order = CartOrder.objects.create(
			student=self.student,
			total="100.00",
			full_name="Student",
			email="student@example.com",
		)
		self.order_item = CartOrderItem.objects.create(
			order=self.order,
			course=course,
			teacher=self.teacher,
			total="100.00",
			initial_total="100.00",
		)

	def test_course_search_returns_matching_published_courses(self):
		unpublished_course = Course.objects.create(
			category=self.order_item.course.category,
			teacher=self.teacher,
			title="Django Draft",
			platform_status="Drafted",
		)

		response = APIClient().get("/api/search/", {"query": "Django"})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]["slug"], self.order_item.course.slug)
		self.assertNotEqual(response.data[0]["id"], unpublished_course.id)

	def test_checkout_contact_update_updates_existing_order(self):
		removed_course = Course.objects.create(
			category=self.order_item.course.category,
			teacher=self.teacher,
			title="Removed course",
			price="25.00",
		)
		removed_item = CartOrderItem.objects.create(
			order=self.order,
			course=removed_course,
			teacher=self.teacher,
			total="25.00",
			initial_total="25.00",
		)
		Cart.objects.create(
			course=self.order_item.course,
			user=self.student,
			price="100.00",
			tax_fee="10.00",
			total="110.00",
			cart_id="123456",
		)
		client = APIClient()

		response = client.patch(
			f"/api/course/order-update/{self.order.order_id}/",
			{
				"full_name": "Updated Student",
				"email": "updated@example.com",
				"country": "Nepal",
				"cart_id": "123456",
			},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		self.order.refresh_from_db()
		self.assertEqual(self.order.cart_id, "123456")
		self.assertEqual(CartOrder.objects.count(), 1)
		self.assertEqual(self.order.full_name, "Updated Student")
		self.assertEqual(self.order.email, "updated@example.com")
		self.assertEqual(self.order.country, "Nepal")
		self.assertFalse(CartOrderItem.objects.filter(pk=removed_item.pk).exists())
		self.assertEqual(list(self.order.order.values_list("course_id", flat=True)), [
			self.order_item.course_id,
		])
		self.assertEqual(self.order.sub_total, 100)
		self.assertEqual(self.order.tax_fee, 10)
		self.assertEqual(self.order.total, 110)

	def test_checkout_update_creates_new_order_item_with_decimal_saved_amount(self):
		new_course = Course.objects.create(
			category=self.order_item.course.category,
			teacher=self.teacher,
			title="New course",
			price="50.00",
		)
		for course, price, tax_fee, total in (
			(self.order_item.course, "100.00", "10.00", "110.00"),
			(new_course, "50.00", "5.00", "55.00"),
		):
			Cart.objects.create(
				course=course,
				user=self.student,
				price=price,
				tax_fee=tax_fee,
				total=total,
				cart_id="654321",
			)

		response = APIClient().patch(
			f"/api/course/order-update/{self.order.order_id}/",
			{"cart_id": "654321"},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		new_item = CartOrderItem.objects.get(order=self.order, course=new_course)
		self.assertEqual(new_item.saved, Decimal("0.00"))
		self.order.refresh_from_db()
		self.assertEqual(self.order.sub_total, Decimal("150.00"))
		self.assertEqual(self.order.total, Decimal("165.00"))

	def test_coupon_discount_reduces_subtotal_and_survives_checkout_update(self):
		self.order.sub_total = Decimal("100.00")
		self.order.tax_fee = Decimal("10.00")
		self.order.total = Decimal("110.00")
		self.order.initial_total = Decimal("110.00")
		self.order.save()
		self.order_item.tax_fee = Decimal("10.00")
		self.order_item.total = Decimal("110.00")
		self.order_item.initial_total = Decimal("110.00")
		self.order_item.save()
		Cart.objects.create(
			course=self.order_item.course,
			user=self.student,
			price="100.00",
			tax_fee="10.00",
			total="110.00",
			cart_id="coupon1",
		)
		Coupon.objects.create(code="SAVE10", discount=10, active=True)
		client = APIClient()

		coupon_response = client.post(
			"/api/course/apply-coupon/",
			{"order_id": self.order.order_id, "coupon": "SAVE10"},
			format="json",
		)

		self.assertEqual(coupon_response.status_code, 201)
		self.order.refresh_from_db()
		self.assertEqual(self.order.sub_total, Decimal("90.00"))
		self.assertEqual(self.order.total, Decimal("100.00"))

		update_response = client.patch(
			f"/api/course/order-update/{self.order.order_id}/",
			{"cart_id": "coupon1"},
			format="json",
		)

		self.assertEqual(update_response.status_code, 200)
		self.order.refresh_from_db()
		self.assertEqual(self.order.sub_total, Decimal("90.00"))
		self.assertEqual(self.order.total, Decimal("100.00"))

	def test_two_cart_items_create_order(self):
		second_teacher_user = User.objects.create_user(
			username="teacher-two", email="teacher-two@example.com", password="password"
		)
		second_teacher = Teacher.objects.create(
			user=second_teacher_user, full_name="Teacher Two"
		)
		second_course = Course.objects.create(
			category=self.order_item.course.category,
			teacher=second_teacher,
			title="Django REST Framework",
			price="50.00",
		)
		Cart.objects.create(
			course=self.order_item.course,
			user=self.student,
			price="100.00",
			tax_fee="10.00",
			total="110.00",
			cart_id="123456",
		)
		Cart.objects.create(
			course=second_course,
			user=self.student,
			price="50.00",
			tax_fee="5.00",
			total="55.00",
			cart_id="123456",
		)

		client = APIClient()
		client.force_authenticate(user=self.student)
		create_order_response = client.post(
			"/api/course/create-order/",
			{
				"full_name": "Student",
				"email": "student@example.com",
				"country": "Nepal",
				"cart_id": "123456",
				"user_id": self.student.id,
			},
			format="json",
		)

		self.assertEqual(create_order_response.status_code, 201)
		order = CartOrder.objects.get(order_id=create_order_response.data["order_oid"])
		self.assertEqual(order.cart_id, "123456")
		self.assertEqual(order.order.count(), 2)
		self.assertEqual(order.total, 165)

		with patch(
			"khalti.views.verify_payment",
			return_value={
				"purchase_order_id": order.order_id,
				"amount": 16500,
				"status": "Completed",
				"transaction_id": "txn-order",
			},
		):
			verify_response = client.post(
				"/api/khalti/verify-khalti/",
				{"pidx": "test-pidx", "order_id": order.order_id},
				format="json",
			)

		self.assertEqual(verify_response.status_code, 200)
		self.assertEqual(CartOrder.objects.get(pk=order.pk).payment_status, "paid")
		self.assertEqual(EnrolledCourse.objects.filter(order_item__order=order).count(), 2)
		self.assertEqual(Notification.objects.filter(order=order, type="New Order").count(), 2)

# Create your tests here.
