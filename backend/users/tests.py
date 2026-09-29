from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class LoginViewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.username = "login-test-user"
        cls.password = "a-long-test-password-123"
        get_user_model().objects.create_user(
            username=cls.username,
            email="login-test@example.com",
            password=cls.password,
        )

    def setUp(self):
        self.client = APIClient(raise_request_exception=False)

    def test_valid_credentials_return_token_json(self):
        response = self.client.post(
            "/api/users/login/",
            {"username": self.username, "password": self.password},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(response.json()["username"], self.username)
        self.assertTrue(response.json()["token"])

    def test_invalid_credentials_return_json_401(self):
        response = self.client.post(
            "/api/users/login/",
            {"username": self.username, "password": "incorrect-password"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(
            response.json()["message"], "Invalid username or password."
        )

    def test_unhandled_login_exception_is_logged_with_traceback(self):
        with patch(
            "users.views.authenticate",
            side_effect=RuntimeError("simulated login failure"),
        ):
            with self.assertLogs("django.request", level="ERROR") as captured:
                response = self.client.post(
                    "/api/users/login/",
                    {"username": self.username, "password": self.password},
                    format="json",
                )

        self.assertEqual(response.status_code, 500)
        self.assertIn("Traceback (most recent call last)", captured.output[0])
        self.assertIn("simulated login failure", captured.output[0])
