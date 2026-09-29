from google import genai
import logging
import os
import time


logger = logging.getLogger(__name__)


MODELS = [
    "gemini-3.6-flash",
    "gemma-4-26b-a4b-it",
]


class AIServiceUnavailable(RuntimeError):
    """Raised when no configured Gemini model can generate a response."""


def generate_ai_response(prompt):

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise AIServiceUnavailable("GEMINI_API_KEY is not configured")

    client = genai.Client(api_key=api_key)

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

            if model_index < len(MODELS) - 1:
                logger.warning(
                    "Gemini model %s failed; trying configured fallback model",
                    model,
                    exc_info=True,
                )
                time.sleep(1)
            else:
                logger.exception("Gemini fallback model %s also failed", model)

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
