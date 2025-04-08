from django.urls import re_path, path
from .views import *

urlpatterns = [
    re_path(r'^info$', info),
    re_path(r'^set_icon$', set_icon),
    

]
