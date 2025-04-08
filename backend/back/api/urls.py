from django.urls import include, path


urlpatterns = [
    path('auth/', include('api.auth.urls')),  
    path('account/', include('api.account.urls')),
    path('map/', include('api.map.urls')),
]
