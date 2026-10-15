from django.db import models
from api.models import CartOrder as Order


class Transaction(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    transaction_id = models.CharField(max_length=200, unique=True)
    amount = models.CharField(max_length=200)
    user = models.CharField(max_length=200)
    date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.transaction_id