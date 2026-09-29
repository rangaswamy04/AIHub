from google import genai
import logging
import os
import httpx
from google.genai import types


logger = logging.getLogger(__name__)


MODELS = [
    "gemini-3.6-flash",
    "gemma-4-26b-a4b-it",
    "gemini-3.5-flash-lite",
]

# HttpOptions.timeout is in milliseconds. A 10 second bound per model keeps a
# primary attempt plus its fallback comfortably below Gunicorn's default limit.
GEMINI_TIMEOUT_MS = 10_000


class AIServiceUnavailable(RuntimeError):
    """Raised when no configured Gemini model can generate a response."""


def _failure_category(error):
    """Return safe provider status metadata without logging exception contents."""
    status_code = getattr(error, "code", None)
    provider_status = getattr(error, "status", None)

    if status_code is not None:
        return f"HTTP {status_code}" + (
            f" {provider_status}" if provider_status else ""
        )
    if isinstance(error, (httpx.TimeoutException, TimeoutError)):
        return "timeout"
    return type(error).__name__


def generate_ai_response(prompt):

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise AIServiceUnavailable("GEMINI_API_KEY is not configured")

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            timeout=GEMINI_TIMEOUT_MS,
            retry_options=types.HttpRetryOptions(attempts=1),
        ),
    )

    last_error = None

    for model_index, model in enumerate(MODELS):

        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )

            return response.text

        except Exception as error:
            last_error = error

            category = _failure_category(error)
            if model_index < len(MODELS) - 1:
                logger.warning(
                    "Gemini model %s failed (%s); trying configured fallback model",
                    model,
                    category,
                )
            else:
                logger.error(
                    "Gemini model %s failed (%s); no configured models remain",
                    model,
                    category,
                )

    raise AIServiceUnavailable(
        "All configured Gemini models are temporarily unavailable"
    ) from last_error


def generate_text(topic):

    prompt = f"""
Generate high-quality content about the following topic:

{topic}

Write clear, useful, and well-structured content.
"""

    return generate_ai_response(prompt)


def summarize_text(text):

    prompt = f"""
Summarize the following text clearly and concisely:

{text}

Keep the important points and remove unnecessary details.
"""

    return generate_ai_response(prompt)


def analyze_code(code):

    prompt = f"""
You are a helpful programming assistant.

Analyze the following code:

{code}

Provide:

1. What the code does
2. Problems or bugs
3. Suggestions for improvement
4. Improved code if necessary
"""

    return generate_ai_response(prompt)


def analyze_resume(resume):

    prompt = f"""
You are a professional resume analyzer.

Analyze the following resume:

{resume}

Provide:

1. Strengths
2. Weaknesses
3. Missing skills or information
4. Suggestions for improvement
5. ATS-friendly recommendations
"""

    return generate_ai_response(prompt)
