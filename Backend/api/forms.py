from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget

from .models import Course

class CourseAdminForm(forms.ModelForm):
    description = forms.CharField(
        required=False,
        widget=CKEditor5Widget(
            config_name="extends"
        )
    )

    class Meta:
        model = Course
        fields = "__all__"