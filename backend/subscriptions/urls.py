from django.urls import path

from .views import (
    UsageView,
    SubscriptionView,
    UpgradeSubscriptionView
)


urlpatterns = [
    path('usage/', UsageView.as_view(), name='usage'),
    path('subscription/', SubscriptionView.as_view(), name='subscription'),
    path('upgrade/', UpgradeSubscriptionView.as_view(), name='upgrade'),
]