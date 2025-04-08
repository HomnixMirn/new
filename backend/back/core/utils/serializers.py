from rest_framework import serializers
from ..models.models import *
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Profile
        fields = ('id', 'user')
        
        
class siteSerializer(serializers.ModelSerializer):
    class Meta:
        model = site
        fields ='__all__'
        

class serviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = service
        fields = '__all__'
        
class dayScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = daySchedule
        fields = '__all__'
        
class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = '__all__'
