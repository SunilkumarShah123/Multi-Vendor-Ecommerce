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
   path('course/course-list/',CategoryListAPIView.as_view(),name="course-list"),
   path('course/course-detail/<slug>/',CategoryListAPIView.as_view(),name="course-list"),
   path('course/cart/',CartAPIView.as_view(),name="cart"),
   path('course/cart-list/',SpecifiCartCartItemsListAPIView.as_view(),name="cart-list"),
   path('course/cart-object-delete/<cart_id>/<item_id>/',SpecifiCartCartitemDelete.as_view(),name="cart-object-delete"),
   path('course/cart-item-in-cart-total-statistic/<cart_id>/',CartItemsInSpecificCartCalculation.as_view(),name="cart-item-in-cart-total-statistic"),
   path('course/create-order/<cart_id>/',CreateOrderAPIView.as_view(),name="create-order"),
   path('course/order-checkout/<order_id>/',CheckOutAPIView.as_view(),name="order-checkout"),
   path('course/apply-coupon/',CuponApplyAPIView.as_view(),name="apply-coupon"),
   path('payment/khalti/initiate/',KhaltiInitiateAPIView.as_view(),name="khalti-initiate"),
   path('payment/khalti/verify/',KhaltiVerifyAPIView.as_view(),name="khalti-verify"),
   
]



