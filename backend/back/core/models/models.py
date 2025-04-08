from django.db import models
from django.contrib.auth.models import User

from rest_framework.authtoken.models import Token


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=50, null=True, blank=True,unique=True)
    icon = models.ImageField(null=True, blank=True, upload_to='profile_icons/')
    
    def __str__(self):
        return self.user.username
    
    
class Office(models.Model):
    name = models.CharField(max_length=50)
    locationType = models.CharField(max_length=50)
    title = models.CharField(max_length=50, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    city = models.CharField(max_length=50, null=True, blank=True)
    cityId = models.CharField(max_length=50, null=True, blank=True)
    address = models.CharField(max_length=50, null=True, blank=True)
    subwayStation = models.CharField(max_length=50, null=True, blank=True)
    landmarks = models.CharField(max_length=50, null=True, blank=True)
    daySchedules = models.ManyToManyField('daySchedule')
    services = models.ManyToManyField('service')
    salePointId = models.CharField(max_length=50, null=True, blank=True)
    phoneNumberOrdering = models.CharField(max_length=50, null=True, blank=True)
    mnpOrdering = models.CharField(max_length=50, null=True, blank=True)
    deviceOrdering = models.CharField(max_length=50, null=True, blank=True)
    esimOrdering = models.CharField(max_length=50, null=True, blank=True)
    b2bShopAvailability = models.CharField(max_length=50, null=True, blank=True)
    tele2Store = models.CharField(max_length=50, null=True, blank=True)
    amountThreshold = models.CharField(max_length=50, null=True, blank=True)
    sites = models.ManyToManyField('site')
    externalLocationId = models.CharField(max_length=50, null=True, blank=True)
    email = models.CharField(max_length=50, null=True, blank=True)
    showcaseId = models.CharField(max_length=50, null=True, blank=True)
    comments = models.ManyToManyField('comments')
    
    def __str__(self):
        return self.name
    
class daySchedule(models.Model):
    day = models.CharField(max_length=50)
    openTime = models.CharField(max_length=50, null=True, blank=True)
    closeTime = models.CharField(max_length=50, null=True, blank=True)
    dayOff = models.BooleanField()
    
    
class service(models.Model):
    name = models.CharField(max_length=50)
    weight = models.IntegerField()
    
class site(models.Model):
    name = models.CharField(max_length=50)
    contextRoot = models.CharField(max_length=50)
    productionUrl = models.CharField(max_length=50)
    lkEnabled = models.BooleanField()
    shopEnabled = models.BooleanField()
    shopDomainPilot = models.BooleanField()
    defaultLanguage = models.CharField(max_length=50)
        
        
class comments(models.Model):
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    rating = models.IntegerField()
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    

class authorizedToken(Token):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.user.username
    
    def token(self):
        return self.key