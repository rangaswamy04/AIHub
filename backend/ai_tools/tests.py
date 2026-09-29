import os
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
import httpx
from google.genai.errors import ServerError
from rest_framework.test import APIClient

from .services import AIServiceUnavailable, GEMINI_TIMEOUT_MS, MODELS, generate_ai_response


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
        self.deadline_exceeded = ServerError(
            504,
            {
                "error": {
                    "status": "DEADLINE_EXCEEDED",
                    "message": "The operation deadline expired.",
                }
            },
        )

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.genai.Client")
    def test_primary_success_returns_without_fallback(self, client_factory):
        client_factory.return_value.models.generate_content.return_value.text = "Primary answer"

        answer = generate_ai_response("Test prompt")

        self.assertEqual(answer, "Primary answer")
        calls = client_factory.return_value.models.generate_content.call_args_list
        self.assertEqual([call.kwargs["model"] for call in calls], [MODELS[0]])

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.genai.Client")
    def test_primary_503_uses_fallback_model(self, client_factory):
        fallback_response = type("Response", (), {"text": "Fallback answer"})()
        client_factory.return_value.models.generate_content.side_effect = [
            self.unavailable,
            fallback_response,
        ]

        with self.assertLogs("ai_tools.services", level="WARNING"):
            answer = generate_ai_response("Test prompt")

        self.assertEqual(answer, "Fallback answer")
        calls = client_factory.return_value.models.generate_content.call_args_list
        self.assertEqual([call.kwargs["model"] for call in calls], MODELS[:2])
        options = client_factory.call_args.kwargs["http_options"]
        self.assertEqual(options.timeout, GEMINI_TIMEOUT_MS)
        self.assertEqual(options.retry_options.attempts, 1)

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.genai.Client")
    def test_primary_timeout_uses_fallback_model(self, client_factory):
        fallback_response = type("Response", (), {"text": "Fallback answer"})()
        client_factory.return_value.models.generate_content.side_effect = [
            httpx.ReadTimeout("provider request timed out"),
            fallback_response,
        ]

        with self.assertLogs("ai_tools.services", level="WARNING"):
            answer = generate_ai_response("Test prompt")

        self.assertEqual(answer, "Fallback answer")
        calls = client_factory.return_value.models.generate_content.call_args_list
        self.assertEqual([call.kwargs["model"] for call in calls], MODELS[:2])

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.genai.Client")
    def test_primary_and_first_fallback_failure_use_second_fallback(self, client_factory):
        final_response = type("Response", (), {"text": "Second fallback answer"})()
        client_factory.return_value.models.generate_content.side_effect = [
            self.unavailable,
            self.deadline_exceeded,
            final_response,
        ]

        with self.assertLogs("ai_tools.services", level="WARNING") as captured:
            answer = generate_ai_response("Test prompt")

        self.assertEqual(answer, "Second fallback answer")
        calls = client_factory.return_value.models.generate_content.call_args_list
        self.assertEqual([call.kwargs["model"] for call in calls], MODELS)
        self.assertIn("HTTP 504 DEADLINE_EXCEEDED", captured.output[1])

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.genai.Client")
    def test_504_deadline_exceeded_moves_to_next_model(self, client_factory):
        fallback_response = type("Response", (), {"text": "Fallback answer"})()
        client_factory.return_value.models.generate_content.side_effect = [
            self.deadline_exceeded,
            fallback_response,
        ]

        with self.assertLogs("ai_tools.services", level="WARNING") as captured:
            answer = generate_ai_response("Test prompt")

        self.assertEqual(answer, "Fallback answer")
        self.assertIn("HTTP 504 DEADLINE_EXCEEDED", captured.output[0])

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.genai.Client")
    def test_primary_timeout_and_fallback_failure_raise_service_error(self, client_factory):
        client_factory.return_value.models.generate_content.side_effect = [
            httpx.ReadTimeout("provider request timed out"),
            self.unavailable,
            self.unavailable,
        ]

        with self.assertLogs("ai_tools.services", level="WARNING"):
            with self.assertRaises(AIServiceUnavailable):
                generate_ai_response("Test prompt")

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.genai.Client")
    def test_all_model_failures_raise_clean_service_error(self, client_factory):
        client_factory.return_value.models.generate_content.side_effect = [
            self.unavailable,
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

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("ai_tools.services.genai.Client")
    def test_all_timeouts_return_clean_tool_503(self, client_factory):
        client_factory.return_value.models.generate_content.side_effect = [
            httpx.ReadTimeout("provider request timed out"),
            httpx.ReadTimeout("fallback request timed out"),
            httpx.ReadTimeout("second fallback request timed out"),
        ]

        with self.assertLogs("ai_tools.services", level="WARNING"):
            response = self.client.post(
                "/api/ai/generate-text/",
                {"topic": "Test input"},
                format="json",
            )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json(),
            {"error": "AI service is temporarily unavailable. Please try again."},
        )
