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
import math
from datetime import datetime


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
        print(request.GET)
        offices = Office.objects.all()
        if 'search' in request.GET:
                offices = offices.filter(address__iregex=request.GET['search']).distinct()
        if 'services' in request.GET:
            for service in request.GET['services'].split(','):
                offices = offices.filter(services__name__iregex=service).distinct()
        if 'filters' in request.GET:
            translate ={
                0:"MONDAy",
                1:"Tuesday",
                2:"Wednesday",
                3:"Thursday",
                4:"Friday",
                5:"Saturday",
                6:"Sunday"
            }
            time = request.GET['filters']+":00"
            date = datetime.now().weekday()
            print(date)
            res =[]
            for office in offices:
                for day in office.daySchedules.all():
                    if day.day == translate[date].upper():
                        print( f' {int(''.join(time.split(":")))} , {int(''.join(day.closeTime.split(":")))} , {int(''.join(day.openTime.split(":"))) }')
                        if int(''.join(time.split(":"))) < int(''.join(day.closeTime.split(":"))) and int(''.join(time.split(":"))) > int(''.join(day.openTime.split(":"))) :
                            res.append(office)
            offices = res
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
    
    
   
def approximate_distance_km(lat1, lon1, lat2, lon2):
    """Приближенный расчет расстояния в километрах между двумя точками."""
    avg_lat = (lat1 + lat2) / 2
    km_per_deg_lat = 111.32
    km_per_deg_lon = 111.32 * math.cos(math.radians(avg_lat))
    delta_lat = abs(lat2 - lat1)
    delta_lon = abs(lon2 - lon1)
    km_lat = delta_lat * km_per_deg_lat
    km_lon = delta_lon * km_per_deg_lon
    return math.sqrt(km_lat**2 + km_lon**2)
 
    
@api_view(["POST"])
def get_cells(request: Request):
    if request.method == 'POST':
        try:
            left_bottom = list(map(float, request.data['left_bottom']))
            right_top = list(map(float, request.data['right_top']))

            # Определяем границы с учетом любого порядка координат
            lat_min = min(left_bottom[0], right_top[0])
            lat_max = max(left_bottom[0], right_top[0])
            lon_min = min(left_bottom[1], right_top[1])
            lon_max = max(left_bottom[1], right_top[1])

            # Фильтруем объекты в прямоугольнике
            cells_in_area = cells.objects.filter(
                latitude__gte=lat_min,
                latitude__lte=lat_max,
                longitude__gte=lon_min,
                longitude__lte=lon_max
                )
            
            selected = []
            min_distance_km= 2.5
            
            for cell in cells_in_area:
                too_close = False
                for selected_cell in selected:
                    dist = approximate_distance_km(
                        cell.latitude, cell.longitude,
                        selected_cell.latitude, selected_cell.longitude
                    )
                    if dist < min_distance_km:
                        too_close = True
                        break
                if not too_close:
                    selected.append(cell)
                    if len(selected) >= 400:
                        break
            
            data = CellsSerializer(selected, many=True).data
            return Response(data, status=status.HTTP_200_OK)
        except:
            return Response('Произошла ошибка при получении вышек', status=status.HTTP_406_NOT_ACCEPTABLE)
            
       
    
    else:
        return Response('Метод не поддерживается',status=status.HTTP_405_METHOD_NOT_ALLOWED)
    

@api_view(["POST"])
@token_required
def addNetworkComment(request: Request):
    if request.method == 'POST':
        data = request.data
        try:
            text = data['text']
            latitude = data['latitude']
            longitude = data['longitude']
            rating = data['rating']
            newComment = NetworkComments.objects.create(text=text, latitude=latitude, longitude=longitude, rating=rating, user=request.user)
            return Response('Комментарий добавлен', status=status.HTTP_200_OK)
        except:
            return Response('Произошла ошибка при добавлении комментария', status=status.HTTP_406_NOT_ACCEPTABLE)