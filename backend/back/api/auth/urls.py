from django.urls import re_path
from .views import *

urlpatterns = [
    re_path(r'^login$', login),
    re_path(r'^logout$', logout),
    re_path(r'^register$', register), 
]
