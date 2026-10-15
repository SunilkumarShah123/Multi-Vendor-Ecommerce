from django.urls import path

from .views import initiate_khalti_payment, verifyKhalti

urlpatterns = [
    path(
        "initiate-khalti-payment/",
        initiate_khalti_payment,
        name="initiate_khalti_payment",
    ),
    path(
        "initiate-khalti-payment/<str:id>/",
        initiate_khalti_payment,
        name="initiate_khalti_payment_by_id",
    ),
    path("verify-khalti/", verifyKhalti, name="verify_khalti"),
]
