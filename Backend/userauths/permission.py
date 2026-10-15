from rest_framework.permissions import BasePermission
from django.core.exceptions import ObjectDoesNotExist


class IsStudent(BasePermission):
    message= "Only For Authenticated Student Role"
    
    def has_permission(self, request, view):
        user=request.user
        
        if not user or not user.is_authenticated:
            return False
        
        try:
            profile=user.profile
        except ObjectDoesNotExist:
            return False
    
        return ( profile.role == 'student')

class IsTeacher(BasePermission):
    message= "Only For Authenticated Teaher Role"
    
    def has_permission(self, request, view):
        user=request.user
        
        if not user or not user.is_authenticated:
            return False
        
        try:
            profile=user.profile
        except ObjectDoesNotExist:
            return False
    
        return ( profile.role == 'teacher')
    
class IsAdmin(BasePermission):
    message= "Only For Super Admin"
    
    def has_permission(self, request, view):
        user=request.user
        
        if not user or not user.is_authenticated:
            return False
        
        try:
            profile=user.profile
        except ObjectDoesNotExist:
            return False
    
        return ( profile.role == 'admin')