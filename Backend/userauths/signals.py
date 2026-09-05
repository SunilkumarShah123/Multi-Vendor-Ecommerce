from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import User,Profile

@receiver(post_save,sender=User)
def Profile_create(sender,instance,created,*args, **kwargs):
   if created:
      return Profile.objects.create(user=instance)
  