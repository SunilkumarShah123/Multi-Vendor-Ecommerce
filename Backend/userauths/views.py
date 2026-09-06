from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from .models import *
from rest_framework.permissions import AllowAny
from rest_framework.generics import CreateAPIView
from .serializers import *

# Create your views here.
class MyTokenObtainView(TokenObtainPairView):
    serializer_class=MyTokenObtainPariSerializer
    permission_classes=[AllowAny]

class RegisterView(CreateAPIView):
    queryset=User.objects.all()
    serializer_class=RegisterSerializer
    permission_classes=[AllowAny]
    
class MyRefreshTokenObtainView(TokenRefreshView):
    token_refresh = TokenRefreshView.as_view()
    