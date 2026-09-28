from django.conf import settings
from django.db import models


# ==========================================
# USAGE MODEL
# ==========================================

class Usage(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="usage"
    )

    requests_used = models.PositiveIntegerField(
        default=0
    )

    credits_used = models.PositiveIntegerField(
        default=0
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    def __str__(self):

        return f"{self.user.username} Usage"


# ==========================================
# SUBSCRIPTION MODEL
# ==========================================

class Subscription(models.Model):


    # --------------------------------------
    # PLAN OPTIONS
    # --------------------------------------

    PLAN_CHOICES = [

        ("free", "Free"),

        ("pro", "Pro"),

        ("premium", "Premium"),

    ]


    # --------------------------------------
    # SUBSCRIPTION STATUS
    # --------------------------------------

    STATUS_CHOICES = [

        ("active", "Active"),

        ("cancelled", "Cancelled"),

        ("expired", "Expired"),

        ("pending", "Pending"),

    ]


    # --------------------------------------
    # PAYMENT STATUS
    # --------------------------------------

    PAYMENT_STATUS_CHOICES = [

        ("not_required", "Not Required"),

        ("pending", "Pending"),

        ("successful", "Successful"),

        ("failed", "Failed"),

        ("refunded", "Refunded"),

    ]


    # --------------------------------------
    # USER
    # --------------------------------------

    user = models.OneToOneField(

        settings.AUTH_USER_MODEL,

        on_delete=models.CASCADE,

        related_name="subscription"

    )


    # --------------------------------------
    # PLAN
    # --------------------------------------

    plan = models.CharField(

        max_length=20,

        choices=PLAN_CHOICES,

        default="free"

    )


    # --------------------------------------
    # SUBSCRIPTION STATUS
    # --------------------------------------

    status = models.CharField(

        max_length=20,

        choices=STATUS_CHOICES,

        default="active"

    )


    # --------------------------------------
    # PAYMENT STATUS
    # --------------------------------------

    payment_status = models.CharField(

        max_length=20,

        choices=PAYMENT_STATUS_CHOICES,

        default="not_required"

    )


    # --------------------------------------
    # PAYMENT ID
    # --------------------------------------

    payment_id = models.CharField(

        max_length=255,

        blank=True,

        null=True

    )


    # --------------------------------------
    # SUBSCRIPTION DATES
    # --------------------------------------

    start_date = models.DateTimeField(

        auto_now_add=True

    )


    end_date = models.DateTimeField(

        null=True,

        blank=True

    )


    # --------------------------------------
    # CREATED DATE
    # --------------------------------------

    created_at = models.DateTimeField(

        auto_now_add=True

    )


    # --------------------------------------
    # UPDATED DATE
    # --------------------------------------

    updated_at = models.DateTimeField(

        auto_now=True

    )


    # --------------------------------------
    # DISPLAY
    # --------------------------------------

    def __str__(self):

        return (
            f"{self.user.username} - "
            f"{self.plan}"
        )