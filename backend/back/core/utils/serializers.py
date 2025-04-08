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
    sites = siteSerializer(many=True)
    services = serviceSerializer(many=True)
    daySchedules = dayScheduleSerializer(many=True)
    souring = serializers.SerializerMethodField()
    
    def get_souring(self,obj):
        translate = {
            "MONDAY":'ПН',
            "TUESDAY":"ВТ",
            "WEDNESDAY":"СР",
            "THURSDAY":"ЧТ",
            "FRIDAY":"ПТ",
            "SATURDAY":"СБ",
            "SUNDAY":"ВС"
            
        }
        if obj.daySchedules:
            lastStart = ''
            lastEnd= ''
            dayStart =''
            rasp = []
            for i in obj.daySchedules.all():
                if lastStart =='':
                    lastStart,lastEnd = i.openTime,i.closeTime
                    dayStart = i.day
                elif lastEnd == i.closeTime and lastStart ==i.openTime:
                    continue
                else:
                    rasp.append(f'{translate[dayStart]} - {translate[i.day]}: {lastStart} - {lastEnd}')
                    lastStart,lastEnd = i.openTime,i.closeTime
            rasp.append(f'{translate[dayStart]} - {translate[obj.daySchedules.all().last().day]}: {lastStart} - {lastEnd}')
            return '\n'.join(rasp)
    class Meta:
        model = Office
        fields = '__all__'
