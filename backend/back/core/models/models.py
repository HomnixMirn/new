from django.db import models
from django.contrib.auth.models import User

from rest_framework.authtoken.models import Token


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    icon = models.ImageField(null=True, blank=True, upload_to='profile_icons/')
    
    def __str__(self):
        return self.user.username


class authorizedToken(Token):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.user.username
    
    def token(self):
        return self.key