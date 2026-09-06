from django.urls import path
from .views import *
urlpatterns = [
    path('token/',MyTokenObtainView.as_view(),name="token_obtain_pair"),
    path('register/',RegisterView.as_view(),name="register"),
]

