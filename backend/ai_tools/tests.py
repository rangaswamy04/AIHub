import os
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from google.genai.errors import ServerError
from rest_framework.test import APIClient

from .services import AIServiceUnavailable, MODELS, generate_ai_response


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


class GeminiFallbackTests(TestCase):
    def setUp(self):
        self.unavailable = ServerError(
            503,
            {
                "error": {
                    "status": "UNAVAILABLE",
                    "message": "The model is temporarily unavailable.",
                }
            },
        )

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.time.sleep")
    @patch("ai_tools.services.genai.Client")
    def test_primary_503_uses_fallback_model(self, client_factory, _sleep):
        fallback_response = type("Response", (), {"text": "Fallback answer"})()
        client_factory.return_value.models.generate_content.side_effect = [
            self.unavailable,
            fallback_response,
        ]

        with self.assertLogs("ai_tools.services", level="WARNING"):
            answer = generate_ai_response("Test prompt")

        self.assertEqual(answer, "Fallback answer")
        calls = client_factory.return_value.models.generate_content.call_args_list
        self.assertEqual([call.kwargs["model"] for call in calls], MODELS)

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.time.sleep")
    @patch("ai_tools.services.genai.Client")
    def test_all_model_failures_raise_clean_service_error(self, client_factory, _sleep):
        client_factory.return_value.models.generate_content.side_effect = [
            self.unavailable,
            self.unavailable,
        ]

        with self.assertLogs("ai_tools.services", level="WARNING"):
            with self.assertRaises(AIServiceUnavailable):
                generate_ai_response("Test prompt")


class AIToolEndpointTests(TestCase):
    tool_cases = (
        ("/api/ai/generate-text/", "topic", "ai_tools.views.generate_text"),
        ("/api/ai/summarize/", "text", "ai_tools.views.summarize_text"),
        ("/api/ai/code-assistant/", "code", "ai_tools.views.analyze_code"),
        ("/api/ai/resume-analyzer/", "resume", "ai_tools.views.analyze_resume"),
    )

    def setUp(self):
        user = get_user_model().objects.create_user(
            username="ai-tools-test-user",
            password="test-password-123",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=user)

    def test_each_tool_accepts_its_field_and_returns_result_json(self):
        for path, field, service_path in self.tool_cases:
            with self.subTest(path=path):
                with patch(service_path, return_value="Tool result") as service:
                    response = self.client.post(
                        path,
                        {field: "Test input"},
                        format="json",
                    )

                self.assertEqual(response.status_code, 200)
                self.assertEqual(response["Content-Type"], "application/json")
                self.assertEqual(response.json(), {"result": "Tool result"})
                service.assert_called_once_with("Test input")

    def test_each_tool_logs_provider_failure_and_returns_json_error(self):
        for path, field, service_path in self.tool_cases:
            with self.subTest(path=path):
                with patch(
                    service_path,
                    side_effect=RuntimeError("simulated tool failure"),
                ):
                    with self.assertLogs("ai_tools.views", level="ERROR") as captured:
                        response = self.client.post(
                            path,
                            {field: "Test input"},
                            format="json",
                        )

                self.assertEqual(response.status_code, 500)
                self.assertEqual(
                    response.json()["error"],
                    "AI service is currently unavailable.",
                )
                self.assertIn("simulated tool failure", captured.output[0])

    def test_all_model_failures_return_clean_json_503(self):
        for path, field, service_path in self.tool_cases:
            with self.subTest(path=path):
                with patch(
                    service_path,
                    side_effect=AIServiceUnavailable("provider unavailable"),
                ):
                    response = self.client.post(
                        path,
                        {field: "Test input"},
                        format="json",
                    )

                self.assertEqual(response.status_code, 503)
                self.assertEqual(
                    response.json(),
                    {"error": "AI service is temporarily unavailable. Please try again."},
                )
