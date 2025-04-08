from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate  
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.request import Request
from core.models.models import *
from core.utils.validators import validate_email
from rest_framework.decorators import api_view
from core.utils.serializers import OfficeSerializer,commentsSerializer,CellsSerializer
from core.utils.auth_decor import token_required

# import json
# url = 'D:/pusto/перенос/python/Thonny/Thony/2025/new/backend/parser/ceils.json'
# with open(url, 'r', encoding='utf-8') as f:
#     pars = json.load(f)
    
# cells.objects.all().delete()
# for i in pars['Enbs']:
#     for sector in i['Sectors']:
#         cells.objects.create(latitude = sector['Latitude'], longitude = sector['Longitude'], type = "4G")
#         print("Создана ячейка")


@api_view(['GET'])
def all_office(request: Request):
    if request.method == 'GET':
        offices = Office.objects.all()
        data = OfficeSerializer(offices, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    else:
        return Response('Метод не поддерживается',status=status.HTTP_405_METHOD_NOT_ALLOWED)
    

@api_view(['POST'])
@token_required
def add_comment(request: Request):
    if request.method == 'POST':
        data = request.data
        try:
            office = Office.objects.get(id=data['id'])
            author = Profile.objects.get(user=request.user)
            newComment = comments.objects.create(author = author, rating=data['rating'], text=data['text'])
            office.comments.add(newComment)
            return Response('Комментарий добавлен', status=status.HTTP_200_OK)
        except :
            return Response('Произошла ошибка при добавлении комментария', status=status.HTTP_406_NOT_ACCEPTABLE)
    else:
        return Response('Метод не поддерживается',status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
@api_view(['GET'])
def get_comments(request: Request):
    if request.method == 'GET':
        try:
            office = Office.objects.get(id=request.GET['id'])    
            comments = office.comments.all()
            data = commentsSerializer(comments, many=True).data       
            return Response(data, status=status.HTTP_200_OK)
        except:
            return Response('Произошла ошибка при получении комментариев', status=status.HTTP_404_NOT_FOUND)
    else:
        return Response('Метод не поддерживается',status=status.HTTP_405_METHOD_NOT_ALLOWED) 
    
@api_view(["POST"])
def get_cells(request: Request):
    if request.method == 'POST':
        left_top = request.POST['left_top']
        right_bottom = request.POST['right_bottom']
        
        cell = cells.objects.filters(Q(latitude__gte=left_top['latitude']) & Q(latitude__lte=right_bottom['latitude']) & Q(longitude__gte=left_top['longitude']) & Q(longitude__lte=right_bottom['longitude']))
        data = CellsSerializer(cell, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    else:
        return Response('Метод не поддерживается',status=status.HTTP_405_METHOD_NOT_ALLOWED)