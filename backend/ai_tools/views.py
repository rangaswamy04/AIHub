import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from conversations.models import Conversation, Message
from subscriptions.models import Usage

from config.throttles import AIRateThrottle

from .services import (
    AIServiceUnavailable,
    generate_ai_response,
    generate_text,
    summarize_text,
    analyze_code,
    analyze_resume
)


logger = logging.getLogger(__name__)


# ==========================================
# RECORD USAGE
# ==========================================

def record_usage(user):

    usage, created = Usage.objects.get_or_create(
        user=user
    )

    usage.requests_used += 1
    usage.credits_used += 1

    usage.save()

    return usage


# ==========================================
# GET REQUEST LIMIT
# ==========================================

def get_request_limit(user):

    try:

        subscription = user.subscription

        if (
            subscription.plan == "pro"
            and subscription.status == "active"
        ):
            return 100

    except Exception:

        pass

    return 10


# ==========================================
# CHECK REQUEST LIMIT
# ==========================================

def has_available_requests(user):

    usage, created = Usage.objects.get_or_create(
        user=user
    )

    request_limit = get_request_limit(user)

    return usage.requests_used < request_limit


# ==========================================
# INPUT VALIDATION
# ==========================================

def valid_input(
    value,
    max_length=5000
):

    if not value:
        return False

    if not isinstance(value, str):
        return False

    if not value.strip():
        return False

    if len(value) > max_length:
        return False

    return True


# ==========================================
# AI CHAT
# ==========================================

class AIChatView(APIView):

    permission_classes = [IsAuthenticated]

    throttle_classes = [AIRateThrottle]

    def post(self, request):

        prompt = request.data.get(
            "prompt"
        )

        conversation_id = request.data.get(
            "conversation_id"
        )


        if not has_available_requests(
            request.user
        ):

            return Response(
                {
                    "error":
                    "AI request limit reached. Please upgrade your plan."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        if not valid_input(prompt):

            return Response(
                {
                    "error":
                    "Prompt is required and must be less than 5000 characters."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        try:

            if conversation_id:

                conversation = Conversation.objects.get(
                    id=conversation_id,
                    user=request.user
                )

            else:

                conversation = Conversation.objects.create(
                    user=request.user,
                    title=prompt[:50]
                )


            Message.objects.create(
                conversation=conversation,
                role="user",
                content=prompt
            )


            answer = generate_ai_response(
                prompt
            )


            record_usage(
                request.user
            )


            Message.objects.create(
                conversation=conversation,
                role="assistant",
                content=answer
            )


            return Response(
                {
                    "conversation_id":
                        conversation.id,

                    "prompt":
                        prompt,

                    "response":
                        answer
                },
                status=status.HTTP_200_OK
            )


        except Conversation.DoesNotExist:

            return Response(
                {
                    "error":
                    "Conversation not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )


        except Exception:
            logger.exception("AI chat request failed for user %s", request.user.pk)

            return Response(
                {
                    "error":
                    "AI service is currently unavailable."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==========================================
# TEXT GENERATOR
# ==========================================

class TextGeneratorView(APIView):

    permission_classes = [IsAuthenticated]

    throttle_classes = [AIRateThrottle]

    def post(self, request):

        topic = request.data.get(
            "topic"
        )


        if not valid_input(topic):

            return Response(
                {
                    "error":
                    "Topic is required and must be less than 5000 characters."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if not has_available_requests(
            request.user
        ):

            return Response(
                {
                    "error":
                    "AI request limit reached. Please upgrade your plan."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        try:

            result = generate_text(
                topic
            )


            record_usage(
                request.user
            )


            return Response(
                {
                    "result":
                    result
                },
                status=status.HTTP_200_OK
            )


        except AIServiceUnavailable:
            logger.warning("Text generation unavailable for user %s", request.user.pk)
            return Response(
                {"error": "AI service is temporarily unavailable. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except Exception:
            logger.exception("Text generation failed for user %s", request.user.pk)

            return Response(
                {
                    "error":
                    "AI service is currently unavailable."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==========================================
# SUMMARIZER
# ==========================================

class SummarizerView(APIView):

    permission_classes = [IsAuthenticated]

    throttle_classes = [AIRateThrottle]

    def post(self, request):

        text = request.data.get(
            "text"
        )


        if not valid_input(text):

            return Response(
                {
                    "error":
                    "Text is required and must be less than 5000 characters."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if not has_available_requests(
            request.user
        ):

            return Response(
                {
                    "error":
                    "AI request limit reached. Please upgrade your plan."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        try:

            result = summarize_text(
                text
            )


            record_usage(
                request.user
            )


            return Response(
                {
                    "result":
                    result
                },
                status=status.HTTP_200_OK
            )


        except AIServiceUnavailable:
            logger.warning("Text summarization unavailable for user %s", request.user.pk)
            return Response(
                {"error": "AI service is temporarily unavailable. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except Exception:
            logger.exception("Text summarization failed for user %s", request.user.pk)

            return Response(
                {
                    "error":
                    "AI service is currently unavailable."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==========================================
# CODE ASSISTANT
# ==========================================

class CodeAssistantView(APIView):

    permission_classes = [IsAuthenticated]

    throttle_classes = [AIRateThrottle]

    def post(self, request):

        code = request.data.get(
            "code"
        )


        if not valid_input(code):

            return Response(
                {
                    "error":
                    "Code is required and must be less than 5000 characters."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if not has_available_requests(
            request.user
        ):

            return Response(
                {
                    "error":
                    "AI request limit reached. Please upgrade your plan."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        try:

            result = analyze_code(
                code
            )


            record_usage(
                request.user
            )


            return Response(
                {
                    "result":
                    result
                },
                status=status.HTTP_200_OK
            )


        except AIServiceUnavailable:
            logger.warning("Code analysis unavailable for user %s", request.user.pk)
            return Response(
                {"error": "AI service is temporarily unavailable. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except Exception:
            logger.exception("Code analysis failed for user %s", request.user.pk)

            return Response(
                {
                    "error":
                    "AI service is currently unavailable."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==========================================
# RESUME ANALYZER
# ==========================================

class ResumeAnalyzerView(APIView):

    permission_classes = [IsAuthenticated]

    throttle_classes = [AIRateThrottle]

    def post(self, request):

        resume = request.data.get(
            "resume"
        )


        if not valid_input(resume):

            return Response(
                {
                    "error":
                    "Resume text is required and must be less than 5000 characters."
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        if not has_available_requests(
            request.user
        ):

            return Response(
                {
                    "error":
                    "AI request limit reached. Please upgrade your plan."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        try:

            result = analyze_resume(
                resume
            )


            record_usage(
                request.user
            )


            return Response(
                {
                    "result":
                    result
                },
                status=status.HTTP_200_OK
            )


        except AIServiceUnavailable:
            logger.warning("Resume analysis unavailable for user %s", request.user.pk)
            return Response(
                {"error": "AI service is temporarily unavailable. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except Exception:
            logger.exception("Resume analysis failed for user %s", request.user.pk)

            return Response(
                {
                    "error":
                    "AI service is currently unavailable."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
