from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate  
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.request import Request
from core.models.models import *
from core.utils.validators import validate_email
from rest_framework.decorators import api_view
from core.utils.serializers import OfficeSerializer


@api_view(['GET'])
def all_offices(request: Request):
    if request.method == 'GET':
        offices = Office.objects.all()
        data = OfficeSerializer(offices, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    else:
        return Response('Метод не поддерживается',status=status.HTTP_405_METHOD_NOT_ALLOWED)