from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


def generate_profile_id():
    return uuid.uuid4().hex[:10]


class User(AbstractUser):

    username = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True
    )

    email = models.EmailField(
        unique=True
    )

    full_name = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    phone = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):

        text = self.email.split("@")[0]
        email_username=''.join([char for char in text if not char.isdigit()])

        if not self.full_name:
            self.full_name = email_username

        if not self.username:
            self.username =text

        return super().save(*args, **kwargs)


class Profile(models.Model):

    gender_choice=(
        ("Male","Male"),
        ("Female","Female"),
        ("Others","Others"),
    )
    
    profile_id = models.CharField(
        max_length=10,
        primary_key=True,
        default=generate_profile_id,
        editable=False
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    image = models.FileField(
        upload_to="image/profile/",
        null=True,
        blank=True,
        default="images/default.png"
    )

    full_name = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    about = models.TextField(
        null=True,
        blank=True
    )

    gender = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        choices=gender_choice
    )

    country = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    state = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    city = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    address = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    date = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.full_name or self.user.email

    def save(self, *args, **kwargs):
        #logic for extracting out AlphaNumeric value before @ from email
        text = self.user.email.split("@")[0]
        #logic for just extracting out alphabetic value form the extracted alpha numeric value
        email_username=''.join([char for char in text if not char.isdigit()])
        
        if not self.full_name:
                    self.full_name = email_username

        return super().save(*args, **kwargs)