from django.contrib import admin
from core.models.models import *

# Register your models here.


admin.site.register(Profile)
admin.site.register(Office) 
admin.site.register(cells) 
@admin.register(service)
class serviceAdmin(admin.ModelAdmin):
    list_display =('name',)