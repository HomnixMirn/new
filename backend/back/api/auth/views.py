from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate  
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.request import Request
from core.models.models import *
from core.utils.validators import validate_email
from rest_framework.decorators import api_view



# import json


# file_path = r'D:\pusto\перенос\python\Thonny\Thony\2025\new\backend\parser\pars.json'

# # Открываем файл с помощью контекстного менеджера
# with open(file_path, 'r', encoding='utf-8') as f:
#     pars = json.load(f)
# Office.objects.all().delete()
# daySchedule.objects.all().delete()
# service.objects.all().delete()
# site.objects.all().delete()

# for i in pars:
#     if "daySchedules" in i:
#         days =[]
#         for day in  i["daySchedules"]:
#             del day['id']
#             if daySchedule.objects.filter(**day).exists():
#                 newDay= daySchedule.objects.get(**day)
#             else:
#                 newDay=daySchedule.objects.create(day=day["day"], openTime=day["openTime"], closeTime=day["closeTime"], dayOff=day["dayOff"])
                
#             days.append(newDay)
#         del i["daySchedules"]
#     if 'services' in i:
#         services = []
#         for servic in i['services']:
#             del servic['id']
#             if service.objects.filter(**servic).exists():
#                 newService= service.objects.get(**servic)
#             else:
#                 newService=service.objects.create(**servic)
#             services.append(newService)
#         del i['services']
#     if 'sites' in i:
#         sites = []
#         for sit in i['sites']:
#             del sit['id']
#             if site.objects.filter(**sit).exists():
#                 newSite= site.objects.get(**sit)
#             else:
#                 newSite=site.objects.create(**sit)
#             sites.append(newSite)
#         del i['sites']
#     del i['id']
#     newOffice = Office.objects.create(**i)
#     for j in days:
#         newOffice.daySchedules.add(j)
#     for k in services:
#         newOffice.services.add(k)
#     for l in sites:
#         newOffice.sites.add(l)
#     print("СОздался офис") 
            
@api_view(['POST'])
def register(request:Request): 
    if request.method == 'POST':
        data = request.data  
        print(data)
        
        try :
            login = data['login']
            password = data['password']
            email = data['email']
            password2 = data['password2']
            if password == password2:
                if User.objects.filter(Q(username=login) | Q(email=email)).exists():
                    return Response('Такой пользователь уже существует',status=status.HTTP_406_NOT_ACCEPTABLE)
                else:
                    if not validate_email(email):
                        return Response('Некорректный email',status=status.HTTP_406_NOT_ACCEPTABLE)
                    user = User.objects.create_user(login, email, password)
                    try :
                        profile = Profile.objects.create(user=user)
                        
                    except:
                        user.delete()
                        return Response('Ошибка регистрации',status=status.HTTP_406_NOT_ACCEPTABLE)
                    return Response('Пользователь успешно зарегистрирован',status=status.HTTP_201_CREATED)
            else:
                return Response('Пароли не совпадают',status=status.HTTP_406_NOT_ACCEPTABLE)
        except:
            return Response('Ошибка регистрации',status=status.HTTP_406_NOT_ACCEPTABLE)
            
            
    else:
        return Response('Метод не поддерживается',status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    
@api_view(['POST'])
def login(request:Request):
    if request.method == 'POST':
        data = request.data
        if "login" in data and "password" in data:
            try:
                user = authenticate(username=data['login'], password=data['password'])
                token = authorizedToken.objects.get_or_create(user=user)[0].key
                return Response({'token':token},status=status.HTTP_200_OK)
            except:
                return Response('Неверный логин или пароль',status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            return Response('Не все поля заполнены',status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        return Response('Метод не поддерживается',status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
@api_view(['GET'])
def logout(request:Request):
    if request.method == 'GET':
        if request.headers.get('Authorization'):
            token = request.headers.get('Authorization').split(' ')[1]
            try:
                authorizedToken.objects.get(key=token).delete()
                return Response('Вы вышли из аккаунта',status=status.HTTP_200_OK)
            except:
                return Response('Не удалось выйти из аккаунта',status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            return Response('Необходимо авторизоваться',status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response('Метод не поддерживается',status=status.HTTP_405_METHOD_NOT_ALLOWED)