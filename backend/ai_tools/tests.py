import os
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class AIChatViewTests(TestCase):
    def setUp(self):
        user = get_user_model().objects.create_user(
            username="ai-chat-test-user",
            password="test-password-123",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=user)

    @patch("ai_tools.views.generate_ai_response", return_value="Test reply")
    def test_chat_returns_generated_reply(self, generate_response):
        response = self.client.post(
            "/api/ai/chat/",
            {"prompt": "Say hello"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["response"], "Test reply")
        generate_response.assert_called_once_with("Say hello")

    @patch(
        "ai_tools.views.generate_ai_response",
        side_effect=RuntimeError("simulated Gemini failure"),
    )
    def test_chat_provider_error_is_logged_and_returns_json(self, _generate_response):
        with self.assertLogs("ai_tools.views", level="ERROR") as captured:
            response = self.client.post(
                "/api/ai/chat/",
                {"prompt": "Say hello"},
                format="json",
            )

        self.assertEqual(response.status_code, 500)
        self.assertEqual(
            response.json()["error"],
            "AI service is currently unavailable.",
        )
        self.assertIn("simulated Gemini failure", captured.output[0])


class GeminiConfigurationTests(TestCase):
    @patch.dict(os.environ, {"GEMINI_API_KEY": ""})
    @patch("ai_tools.services.genai.Client")
    def test_missing_api_key_fails_clearly_without_constructing_client(self, client):
        from ai_tools.services import generate_ai_response

        with self.assertRaisesRegex(RuntimeError, "GEMINI_API_KEY is not configured"):
            generate_ai_response("Say hello")

        client.assert_not_called()
