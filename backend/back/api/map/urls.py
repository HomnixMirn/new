from django.urls import re_path
from .views import *

urlpatterns = [
    re_path(r'^all_office$', all_office),
    re_path(r'^get_comments$', get_comments),
    re_path(r'^add_comment$', add_comment),
    re_path(r'^all_cells$', get_cells),
    re_path(r'^add_network_comment$', addNetworkComment),
]
