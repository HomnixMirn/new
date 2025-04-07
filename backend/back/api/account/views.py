from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from rest_framework.request import Request
from core.models.models import authorizedToken, Profile
from core.utils.serializers import ProfileSerializer
from core.utils.auth_decor import token_required
from rest_framework.decorators import api_view


@api_view(['GET'])
@token_required
def info(request: Request):
    if request.method == 'GET':
        user = request.user
        try:
            profile = Profile.objects.get(user=user)
            data = ProfileSerializer(profile).data
            return Response(data, status=status.HTTP_200_OK)
            
        except Profile.DoesNotExist:
            return Response({'message': 'Профиль не обнаружен'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@token_required
def set_icon(request: Request):
    if request.method == 'POST':
        user = request.user
        try:
            profile = Profile.objects.get(user=user)
            data = request.data
            
            profile.icon.delete()
            profile.icon = data['icon']
            profile.save()
            return Response('Фото профиля обновлено', status=status.HTTP_200_OK)
            
        except Profile.DoesNotExist:
            return Response({'message': 'Профиль не обнаружен'}, status=status.HTTP_404_NOT_FOUND)
            
        