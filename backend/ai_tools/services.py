from google import genai
import os
import time


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


MODELS = [
    "gemini-3.6-flash",
    "gemma-4-26b-a4b-it",
]


def generate_ai_response(prompt):

    last_error = None

    for model in MODELS:

        try:
            print(f"Trying AI model: {model}")

            response = client.models.generate_content(
                model=model,
                contents=prompt
            )

            print(f"AI model succeeded: {model}")

            return response.text

        except Exception as error:

            last_error = error

            print(
                f"AI model failed: {model} -> {error}"
            )

            time.sleep(1)

    print(
        f"All AI models failed: {last_error}"
    )

    raise Exception(
        "AI service is temporarily unavailable."
    )


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