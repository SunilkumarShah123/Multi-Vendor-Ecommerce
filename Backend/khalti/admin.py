from django.contrib import admin
from .models import Transaction
# Register your models here.

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('order', 'transaction_id', 'amount', 'user', 'date')
    search_fields = ('transaction_id', 'user')
    list_filter = ('date','id')