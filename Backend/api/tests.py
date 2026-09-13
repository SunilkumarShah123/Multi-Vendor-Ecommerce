from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from unittest.mock import patch

from .models import Cart, CartOrder, CartOrderItem, Category, Course, EnrolledCourse, Notification, Teacher
from .views import finalize_paid_order


User = get_user_model()


class PaidOrderFinalizationTests(TestCase):
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

	def test_paid_order_creates_enrollment_and_teacher_notification_once(self):
		finalize_paid_order(self.order)
		finalize_paid_order(self.order)

		self.assertEqual(EnrolledCourse.objects.filter(order_item=self.order_item).count(), 1)
		self.assertEqual(
			Notification.objects.filter(
				order=self.order,
				order_item=self.order_item,
				teacher=self.teacher,
				type="New Order",
			).count(),
			1,
		)

	def test_two_cart_items_complete_order_payment_and_finalization(self):
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
			"/api/course/create-order/123456/",
			{
				"full_name": "Student",
				"email": "student@example.com",
				"country": "Nepal",
				"cart_id": "123456",
			},
			format="json",
		)

		self.assertEqual(create_order_response.status_code, 201)
		order = CartOrder.objects.get(order_id=create_order_response.data["order_oid"])
		self.assertEqual(order.order.count(), 2)
		self.assertEqual(order.total, 165)

		with patch(
			"api.views.verify_payment",
			return_value={
				"purchase_order_id": order.order_id,
				"amount": 16500,
				"status": "Completed",
			},
		):
			verify_response = client.post(
				"/api/payment/khalti/verify/",
				{"pidx": "test-pidx", "order_id": order.order_id},
				format="json",
			)

		self.assertEqual(verify_response.status_code, 200)
		self.assertEqual(CartOrder.objects.get(pk=order.pk).payment_status, "paid")
		self.assertEqual(EnrolledCourse.objects.filter(order_item__order=order).count(), 2)
		self.assertEqual(Notification.objects.filter(order=order, type="New Order").count(), 2)

# Create your tests here.
