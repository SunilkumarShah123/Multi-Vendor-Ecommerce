from django.contrib import admin

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


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
	list_display = (
		"id", "user", "full_name", "image", "bio", "facebook", "twitter",
		"linkedin", "about", "country", "created_date", "updated_date",
	)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
	list_display = ("id", "title", "image", "active", "slug", "created_date", "updated_date")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
	list_display = (
		"id", "category", "teacher", "title", "price", "language", "level",
		"platform_status", "teacher_course_status", "featured", "course_id",
		"slug", "created_date", "updated_date",
	)


@admin.register(Variant)
class VariantAdmin(admin.ModelAdmin):
	list_display = ("id", "course", "title", "variant_id", "created_date", "updated_date")


@admin.register(VariantItem)
class VariantItemAdmin(admin.ModelAdmin):
	list_display = (
		"id", "variant", "title", "file", "duration", "content_duration", "preview",
		"variant_item_id", "created_date", "updated_date",
	)


@admin.register(Question_Answer)
class QuestionAnswerAdmin(admin.ModelAdmin):
	list_display = ("id", "course", "user", "title", "qa_id", "created_date", "updated_date")


@admin.register(Question_Answer_Message)
class QuestionAnswerMessageAdmin(admin.ModelAdmin):
	list_display = (
		"id", "course", "question", "user", "message", "qam_id", "created_date", "updated_date",
	)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
	list_display = (
		"id", "course", "user", "price", "tax_fee", "total", "country", "cart_id",
		"created_date", "updated_date",
	)


@admin.register(CartOrder)
class CartOrderAdmin(admin.ModelAdmin):
	list_display = (
		"id", "student", "display_teachers", "sub_total", "tax_fee", "total", "initial_total",
		"saved", "payment_status", "full_name", "email", "country", "stripe_session_id",
		"oid", "created_date", "updated_date",
	)

	@admin.display(description="teachers")
	def display_teachers(self, obj):
		return ", ".join(teacher.full_name for teacher in obj.teachers.all())


@admin.register(CartOrderItem)
class CartOrderItemAdmin(admin.ModelAdmin):
	list_display = (
		"id", "order", "course", "teacher", "tax_fee", "total", "initial_total", "saved",
		"coupons", "applied_coupon", "oid", "created_date", "updated_date",
	)


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
	list_display = ("id", "course", "user", "certificate_id", "created_date", "updated_date")


@admin.register(CompletedLesson)
class CompletedLessonAdmin(admin.ModelAdmin):
	list_display = ("id", "course", "user", "variant_item", "created_date", "updated_date")


@admin.register(EnrolledCourse)
class EnrolledCourseAdmin(admin.ModelAdmin):
	list_display = (
		"id", "course", "user", "teacher", "order_item", "enrollment_id", "created_date", "updated_date",
	)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "course", "title", "note_id", "created_date", "updated_date")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
	list_display = (
		"id", "user", "course", "review", "rating", "repy", "active", "created_date", "updated_date",
	)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
	list_display = (
		"id", "user", "teacher", "order", "order_item", "review", "type", "seen",
		"created_date", "updated_date",
	)


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
	list_display = (
		"id", "teacher", "code", "discount", "active", "created_date", "updated_date",
	)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "course")


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "tax_rate", "active")
