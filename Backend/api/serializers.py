from rest_framework import serializers
from userauths.serializers import ProfileSerializer

from .models import (
    Cart,
    CartOrder,
    CartOrderItem,
    Category,
    Certificate,
    CompletedLesson,
    Course,
    Country,
    Coupon,
    EnrolledCourse,
    Note,
    Notification,
    Question_Answer,
    Question_Answer_Message,
    Review,
    Teacher,
    Variant,
    VariantItem,
    Wishlist,
)


class VariantItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = VariantItem
        fields = [
            "id", "variant", "title", "description", "file", "duration",
            "content_duration", "preview", "variant_item_id", "created_date", "updated_date",
        ]


class VariantSerializer(serializers.ModelSerializer):
    variant_items = VariantItemSerializer(many=True, read_only=True)

    class Meta:
        model = Variant
        fields = ["id", "course", "title", "variant_id", "created_date", "updated_date", "variant_items"]


class ReviewSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id", "user", "course", "review", "rating", "repy", "active",
            "created_date", "updated_date", "profile",
        ]


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "user", "course", "title", "note", "note_id", "created_date", "updated_date"]


class CompletedLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompletedLesson
        fields = ["id", "course", "user", "variant_item", "created_date", "updated_date"]


class Question_Answer_MessageSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = Question_Answer_Message
        fields = [
            "id", "course", "question", "user", "message", "qam_id", "created_date", "updated_date",
            "profile",
        ]


class Question_AnswerSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageSerializer(many=True, read_only=True)
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = Question_Answer
        fields = [
            "id", "course", "user", "title", "qa_id", "created_date", "updated_date",
            "messages", "profile",
        ]


class CartOrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.CharField(read_only=True)
    payment_status = serializers.CharField(read_only=True)

    class Meta:
        model = CartOrderItem
        fields = [
            "id", "order", "course", "teacher", "tax_fee", "total", "initial_total", "saved",
            "coupons", "applied_coupon", "oid", "created_date", "updated_date",
            "order_id", "payment_status",
        ]


class CartOrderSerializer(serializers.ModelSerializer):
    order_items = CartOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = CartOrder
        fields = [
            "id", "student", "teachers", "sub_total", "tax_fee", "total", "initial_total",
            "saved", "payment_status", "full_name", "email", "country", "coupons",
            "stripe_session_id", "oid", "created_date", "updated_date", "order_items",
        ]


class EnrolledCourseSerializer(serializers.ModelSerializer):
    lectures = VariantItemSerializer(many=True, read_only=True)
    completed_lesson = CompletedLessonSerializer(many=True, read_only=True)
    curriculum = VariantSerializer(many=True, read_only=True)
    note = NoteSerializer(many=True, read_only=True)
    question_answer = Question_AnswerSerializer(many=True, read_only=True)
    review = ReviewSerializer(read_only=True)

    class Meta:
        model = EnrolledCourse
        fields = [
            "id", "course", "user", "teacher", "order_item", "enrollment_id",
            "created_date", "updated_date", "lectures", "completed_lesson", "curriculum",
            "note", "question_answer", "review",
        ]


class CourseSerializer(serializers.ModelSerializer):
    students = EnrolledCourseSerializer(many=True, read_only=True)
    curriculum = VariantItemSerializer(many=True, read_only=True)
    lectures = VariantItemSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True, allow_null=True)
    rating_count = serializers.IntegerField(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "category", "teacher", "file", "image", "title", "description",
            "price", "language", "level", "platform_status", "teacher_course_status",
            "featured", "course_id", "slug", "created_date", "updated_date", "students",
            "curriculum", "lectures", "average_rating", "rating_count", "reviews",
        ]


class TeacherSerializer(serializers.ModelSerializer):
    students = CartOrderItemSerializer(many=True, read_only=True)
    courses = CourseSerializer(many=True, read_only=True)
    review = CourseSerializer(many=True, read_only=True)

    class Meta:
        model = Teacher
        fields = [
            "id", "user", "image", "full_name", "bio", "facebook", "twitter",
            "linkedin", "about", "country", "created_date", "updated_date", "students",
            "courses", "review",
        ]


class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "title", "image", "slug", "created_date", "updated_date", "course_count"]


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = [
            "id", "course", "user", "price", "tax_fee", "total", "country", "cart_id",
            "created_date", "updated_date",
        ]


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ["id", "course", "user", "certificate_id", "created_date", "updated_date"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id", "user", "teacher", "order", "order_item", "review", "type", "seen",
            "created_date", "updated_date",
        ]


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ["id", "teacher", "used_by", "code", "discount", "active", "created_date", "updated_date"]


class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = ["id", "user", "course"]


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["id", "name", "tax_rate", "active"]
