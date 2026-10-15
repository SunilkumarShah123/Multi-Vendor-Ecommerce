from django.test import TestCase
from rest_framework.test import APIClient


class RemovedGoogleLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_google_login_endpoint_is_removed(self):
        response = self.client.post("/api/auth/google/", {}, format="json")

        self.assertEqual(response.status_code, 404)
