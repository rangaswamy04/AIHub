from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from config.throttles import UpgradeRateThrottle

from .models import Usage, Subscription


# ==========================================
# USAGE API
# ==========================================

class UsageView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        usage, created = Usage.objects.get_or_create(
            user=request.user
        )

        return Response({

            "requests_used":
                usage.requests_used,

            "credits_used":
                usage.credits_used,

            "updated_at":
                usage.updated_at,

        })


# ==========================================
# SUBSCRIPTION API
# ==========================================

class SubscriptionView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        subscription, created = (
            Subscription.objects.get_or_create(
                user=request.user
            )
        )

        return Response({

            "plan":
                subscription.plan,

            "status":
                subscription.status,

            "payment_status":
                subscription.payment_status,

            "payment_id":
                subscription.payment_id,

            "start_date":
                subscription.start_date,

            "end_date":
                subscription.end_date,

            "created_at":
                subscription.created_at,

            "updated_at":
                subscription.updated_at,

        })


# ==========================================
# DEVELOPMENT UPGRADE API
# ==========================================

class UpgradeSubscriptionView(APIView):

    permission_classes = [IsAuthenticated]

    throttle_classes = [UpgradeRateThrottle]

    def post(self, request):

        subscription, created = (
            Subscription.objects.get_or_create(
                user=request.user
            )
        )


        if subscription.plan == "pro":

            return Response({

                "message":
                    "You already have a Pro subscription.",

                "plan":
                    subscription.plan,

                "status":
                    subscription.status,

                "payment_status":
                    subscription.payment_status,

            })


        subscription.plan = "pro"

        subscription.status = "active"

        subscription.payment_status = "pending"

        subscription.save()


        return Response({

            "message":
                "Subscription upgraded successfully.",

            "plan":
                subscription.plan,

            "status":
                subscription.status,

            "payment_status":
                subscription.payment_status,

        })