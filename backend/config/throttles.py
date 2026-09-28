from rest_framework.throttling import UserRateThrottle


# ==========================================
# AI API RATE LIMIT
# ==========================================

class AIRateThrottle(UserRateThrottle):

    scope = "ai"

    rate = "30/min"


# ==========================================
# SUBSCRIPTION UPGRADE RATE LIMIT
# ==========================================

class UpgradeRateThrottle(UserRateThrottle):

    scope = "upgrade"

    rate = "5/min"