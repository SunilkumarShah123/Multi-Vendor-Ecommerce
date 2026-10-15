from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
from .models import Profile, User


class RemovedGoogleLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_google_login_endpoint_is_removed(self):
        response = self.client.post("/api/auth/google/", {}, format="json")

        self.assertEqual(response.status_code, 404)


class RegistrationRoleTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def registration_data(self, role):
        return {
            "full_name": "Test User",
            "email": f"{role}@example.com",
            "phone": "1234567890",
            "role": role,
            "password": "Strong-Test-Password-923!",
            "password2": "Strong-Test-Password-923!",
        }

    def test_registration_saves_selected_profile_role(self):
        for role in ("student", "teacher"):
            with self.subTest(role=role):
                response = self.client.post(
                    "/api/register/", self.registration_data(role), format="json"
                )

                self.assertEqual(response.status_code, 201)
                self.assertEqual(
                    Profile.objects.get(user__email=f"{role}@example.com").role,
                    role,
                )

    def test_registration_does_not_allow_admin_role(self):
        response = self.client.post(
            "/api/register/", self.registration_data("admin"), format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_registration_requires_role(self):
        data = self.registration_data("student")
        data.pop("role")

        response = self.client.post("/api/register/", data, format="json")

        self.assertEqual(response.status_code, 400)

    def test_login_returns_profile_role_in_response_and_token(self):
        user = User.objects.create_user(
            username="teacher",
            email="teacher@example.com",
            password="Strong-Test-Password-923!",
        )
        Profile.objects.update_or_create(user=user, defaults={"role": "teacher"})

        response = self.client.post(
            "/api/token/",
            {
                "email": "teacher@example.com",
                "password": "Strong-Test-Password-923!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["role"], "teacher")
        self.assertEqual(AccessToken(response.data["access"])["role"], "teacher")
