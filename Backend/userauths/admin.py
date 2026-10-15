from django.contrib import admin
from .models import *

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display=["profile_id","full_name",'user__email']

admin.site.register(User)
