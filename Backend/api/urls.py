from django.urls import path
from userauths import views as auth_views
from .views import *
urlpatterns = [
   #authentication Routes
   path('register/',auth_views.RegisterView.as_view(),name="register"),
   path('token/',auth_views.MyTokenObtainView.as_view(),name="token"),
   path('refresh/',auth_views.MyRefreshTokenObtainView.as_view(),name="refresh"),
   path('reset-password-email/<email>/',auth_views.PasswordResetEmailVerification.as_view(),name="password-reset-email"),
   path('reset-password/',auth_views.PasswordResetView.as_view(),name="password-reset"),
   
   #core routes
   path('course/category/',CategoryListAPIView.as_view(),name="category-list"),
]



