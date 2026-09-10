from rest_framework.response import Response
from .serializers import *
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from .models import *

class CategoryListAPIView(ListAPIView):
    queryset=Category.objects.filter(active=True)
    serializer_class=CategorySerializer
    permission_classes=[AllowAny]
    
    

   

