from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.generics import RetrieveAPIView
from .models import *
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.generics import CreateAPIView
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ecom import settings
import uuid
from .serializers import *


# Create your views here.
class MyTokenObtainView(TokenObtainPairView):
    serializer_class = MyTokenObtainPariSerializer
    permission_classes = [AllowAny]


class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MyRefreshTokenObtainView(TokenRefreshView):
    token_refresh = TokenRefreshView.as_view()


def generate_otp_code():
    return uuid.uuid4().hex[:6]


class PasswordResetEmailVerification(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def get_object(self):
        email = self.kwargs["email"]
        user = User.objects.get(email=email)
        if user:
            user.otp = generate_otp_code()
            user.save()

            user_id = user.pk
            user_otp = user.otp
            link = (
                f"http://localhost:5173/password-reset/?otp={user_otp}&uuid={user_id}"
            )
            send_mail(
                subject="Password Reset",
                message=f"""
                Hello,

                You requested to reset your password.

                Click the link below:

                {link}

                This link will expire in 15 minutes.

                If you did not request this, you can ignore this email.
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )
        return user

class PasswordResetView(APIView):

    def post(self, request):

        user_id = request.data.get("uuid")
        otp = request.data.get("otp")
        password = request.data.get("password")

        if user_id is None or otp is None or password is None:
            return Response(
                {"msg": "User ID, OTP and Password should not be empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(pk=user_id)

        except User.DoesNotExist:
            return Response(
                {"error": "Invalid reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if str(otp) != str(user.otp):
            return Response(
                {"error": "Invalid reset link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(password)
        user.otp = None
        user.save()

        return Response(
            {"msg": "Password reset successfully"},
            status=status.HTTP_200_OK
        )