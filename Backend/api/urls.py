from django.urls import path
from . views import home
from userauths import views as auth_views
urlpatterns = [
   path('home/',home,name="home"),
   path('register/',auth_views.RegisterView.as_view(),name="register"),
   path('token/',auth_views.MyTokenObtainView.as_view(),name="token"),
   path('refresh/',auth_views.MyRefreshTokenObtainView.as_view(),name="refresh"),
   path('reset-password-email/<email>/',auth_views.PasswordResetEmailVerification.as_view(),name="password-reset-email"),
   path('reset-password/',auth_views.PasswordResetView.as_view(),name="password-reset"),
]


