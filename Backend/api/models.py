import math
from datetime import timedelta
from django.db import models
from userauths.models import User, Profile
from django.utils.text import slugify
from shortuuid.django_fields import ShortUUIDField
from moviepy import VideoFileClip


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(
        upload_to="course-file", blank=True, null=True, default="default.jpg"
    )
    full_name = models.CharField(max_length=100)
    bio = models.CharField(max_length=100, null=True, blank=True)
    facebook = models.URLField(null=True, blank=True)
    twitter = models.URLField(null=True, blank=True)
    linkedin = models.URLField(null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name

    def students(self):
        return CartOrderItem.objects.filter(teacher=self)

    def courses(self):
        return Course.objects.filter(teacher=self)

    def review(self):
        return Course.objects.filter(teacher=self)


class Category(models.Model):
 
    title = models.CharField(max_length=100)
    image = models.FileField(
        upload_to="course-file", default="category.jpg", null=True, blank=True
    )
    active=models.BooleanField(default=True)
    slug = models.SlugField(unique=True, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Category"
        ordering = ["title"]

    def __str__(self):
        return self.title

    def course_count(self):
        return Course.objects.filter(category=self).count()

    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title)
        return super().save(*args, **kwargs)


class Course(models.Model):
    LANGUAGE = (
        ("English", "English"),
        ("Spanish", "Spanish"),
        ("French", "French"),
    )

    LEVEL = (
        ("Beginner", "Beginner"),
        ("Intemediate", "Intemediate"),
        ("Advanved", "Advanved"),
    )

    TEACHER_STATUS = (
        ("Draft", "Draft"),
        ("Disabled", "Disabled"),
        ("Published", "Published"),
    )

    PLATFORM_STATUS = (
        ("Review", "Review"),
        ("Disabled", "Disabled"),
        ("Drafted", "Drafted"),
        ("Rejected", "Rejected"),
        ("Published", "Published"),
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    file = models.FileField(upload_to="course-file", blank=True, null=True)
    image = models.FileField(upload_to="course-file", blank=True, null=True)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    language = models.CharField(choices=LANGUAGE, default="English")
    level = models.CharField(choices=LEVEL, default="Beginner")
    # below field says what is the coruse status form platform side
    platform_status = models.CharField(choices=PLATFORM_STATUS, default="Published")
    # below field say what is the course status form teacher side
    teacher_course_status = models.CharField(
        choices=TEACHER_STATUS, default="Published"
    )
    # featuring me keeping this course highlighted or featured in home page
    featured = models.BooleanField(default=False)
    course_id = ShortUUIDField(
        unique=True, length=6, max_length=20, alphabet="1234567890"
    )
    slug = models.SlugField(unique=True, null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title)
        return super().save(*args, **kwargs)

    def students(self):
        return EnrolledCourse.objects.filter(course=self)

    def curriculum(self):
        return VariantItem.objects.filter(variant__course=self)

    def lectures(self):
        return VariantItem.objects.filter(variant__course=self)

    """first set of item will be filter out connecting with this course then agggreate function will pass on by one time from thes set then AVG function will fetch the reating value of each passing object step by step and count the final average the return the dictionary name  {
          avg_rating: value
          }
        """

    def average_rating(self):
        average_rating = Review.objects.filter(course=self, active=True).aggregate(
            avg_rating=models.Avg("rating")
        )
        return average_rating["avg_rating"]

    def rating_count(self):
        return Review.objects.filter(course=self, active=True).count()

    def reviews(self):
        return Review.objects.filter(course=self, active=True)


# different verison of course if variant like begineer, advance and intermdeiate
class Variant(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=1000)
    variant_id = ShortUUIDField(
        unique=True, length=6, max_length=20, alphabet="1234567890"
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def variant_items(self):
        return VariantItem.objects.filter(variant=self)


# different course content or syllabus or audio video material inside specfici variant like introudction(varient item 1), Function(varient item 2 ) similarly
class VariantItem(models.Model):
    variant = models.ForeignKey(
        Variant, on_delete=models.CASCADE, related_name="variant_items"
    )
    title = models.CharField(max_length=1000)
    description = models.TextField(null=True, blank=True)
    # stores the relative path of any pdf video image etc
    file = models.FileField(upload_to="course-file")
    # stores the duration of audio vidoe in acutal calculaable interger based format in database so that further can be utilize in time calculation
    duration = models.DurationField(null=True, blank=True)
    # store the time of audio and video in text or string format in database
    content_duration = models.CharField(max_length=1000, null=True, blank=True)
    # preview decides wheather the varient item can be viwed by user or not before it is enrolled in the course
    preview = models.BooleanField(default=False)
    variant_item_id = ShortUUIDField(
        unique=True, length=6, max_length=20, alphabet="1234567890"
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.variant.title} - {self.title}"

    def save(self, *args, **kwargs):
        if self.file:
            targeted_video_clip = VideoFileClip(self.file.path)
            total_video_duration_in_seconds = targeted_video_clip.duration
            # storing the total video during second in actual time format in database
            self.duration = timedelta(seconds=(int(total_video_duration_in_seconds)))
            # divmod is inbuilt fucntion that perform division and return the quotient and remainder for eg 7/2 quotient 3 and reminder will be 1
            total_min_duration, remaining_second = divmod(
                total_video_duration_in_seconds, 60
            )
            # process to achieve the nearest integer avoiding decimal
            total_min_duration = math.floor(total_min_duration)
            remaining_second = math.floor(remaining_second)
            # now converting the achieved min and second in string to store in content_duraiton
            duration_in_text = f"{total_min_duration}m {remaining_second}s"
            self.content_duration = duration_in_text

            return super().save(*args, **kwargs)


class Question_Answer(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=1000, null=True, blank=True)
    qa_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"

    class Meta:
        ordering = ["-created_date"]

    def messages(self):
        return Question_Answer_Message.objects.filter(question=self)

    def profile(self):
        return Profile.objects.get(user=self.user)


class Question_Answer_Message(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    question = models.ForeignKey(Question_Answer, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField(null=True, blank=True)
    qam_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"

    class Meta:
        ordering = ["created_date"]

    def profile(self):
        return Profile.objects.get(user=self.user)


class Cart(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    tax_fee = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    country = models.CharField(max_length=100, null=True, blank=True)
    cart_id = ShortUUIDField(
        unique=True, length=6, max_length=20, alphabet="1234567890"
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.course.title


class CartOrder(models.Model):
    PAYMENT_STATUS = (
        ("paid", "paid"),
        ("processing", "processing"),
        ("failed", "failed"),
    )
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    teachers = models.ManyToManyField(Teacher, blank=True)
    # contains the total calculated amount beofre the tax reduction
    sub_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)

    tax_fee = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    # contain the total amount after tax redcution
    total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    # contain origin total mount before applyling discount or cupon
    initial_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    # cotains the saved amount after applying discount or cupon
    saved = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)

    payment_status = models.CharField(choices=PAYMENT_STATUS, default="Processing")

    full_name = models.CharField(max_length=100, null=True, blank=True)

    email = models.CharField(max_length=100, null=True, blank=True)

    country = models.CharField(max_length=100, null=True, blank=True)

    coupons = models.ManyToManyField("api.Coupon", blank=True)

    stripe_session_id = models.CharField(max_length=1000, null=True, blank=True)

    oid = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")

    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_date"]

    def order_items(self):
        return CartOrderItem.objects.filter(order=self)

    def __str__(self):
        return self.oid


class CartOrderItem(models.Model):
    order = models.ForeignKey(CartOrder, on_delete=models.CASCADE, related_name="order")
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="ordered_item"
    )
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    tax_fee = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    initial_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    saved = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
    coupons = models.ForeignKey(
        "api.Coupon", on_delete=models.SET_NULL, null=True, blank=True
    )
    applied_coupon = models.BooleanField(default=False)
    oid = ShortUUIDField(unique=True, length=6, max_length=20, alphabet="1234567890")
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_date"]

    def order_id(self):
        return f"Order ID #{self.order.oid}"

    def payment_status(self):
        return f"{self.order.payment_status}"

    def __str__(self):
        return self.oid


class Certificate(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    certificate_id = ShortUUIDField(
        unique=True, length=6, max_length=20, alphabet="1234567890"
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.course.title


class CompletedLesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    variant_item = models.ForeignKey(VariantItem, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.course.title


class EnrolledCourse(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    teacher = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, blank=True
    )
    order_item = models.ForeignKey(CartOrderItem, on_delete=models.CASCADE)
    enrollment_id = ShortUUIDField(
        unique=True, length=6, max_length=20, alphabet="1234567890"
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def lectures(self):
        return VariantItem.objects.filter(variant__course=self.course)

    def completed_lesson(self):
        return CompletedLesson.objects.filter(course=self.course, user=self.user)

    def curriculum(self):
        return Variant.objects.filter(course=self.course)

    def note(self):
        return Note.objects.filter(course=self.course, user=self.user)

    def question_answer(self):
        return Question_Answer.objects.filter(course=self.course)

    def review(self):
        return Review.objects.filter(course=self.course, user=self.user).first()


class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=1000, null=True, blank=True)
    note = models.TextField()
    note_id = ShortUUIDField(
        unique=True, length=6, max_length=20, alphabet="1234567890"
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Review(models.Model):
    RATING = (
        (1, "1 star"),
        (2, "2 star"),
        (3, "3 star"),
        (4, "4 star"),
        (5, "5 star"),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    review = models.TextField()
    rating = models.IntegerField(choices=RATING, default=None)
    repy = models.CharField(null=True, blank=True, max_length=1000)
    active = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title.course

    def profile(self):
        return Profile.objects.get(user=self.user)


class Notification(models.Model):
    
    NOTI_TYPE = (
    ("New Order", "New Order"),
    ("New Review", "New Review"),
    ("New Course Question", "New Course Question"),
    ("Draft", "Draft"),
    ("Course Published", "Course Published"),
)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    teacher = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, blank=True
    )
    order = models.ForeignKey(
        CartOrder, on_delete=models.SET_NULL, null=True, blank=True
    )
    order_item = models.ForeignKey(
        CartOrderItem, on_delete=models.SET_NULL, null=True, blank=True
    )
    review = models.ForeignKey(Review, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.CharField(max_length=100, choices=NOTI_TYPE)
    seen = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.type


class Coupon(models.Model):
    teacher = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, blank=True
    )
    used_by = models.ManyToManyField(User, blank=True)
    code = models.CharField(max_length=50)
    discount = models.IntegerField(default=1)
    active = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.code


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
        return self.code


class Country(models.Model):
    name = models.CharField(max_length=100)
    tax_rate = models.IntegerField(default=5)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
