from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from functools import wraps
from core.models.models import authorizedToken

def token_required(view_func):
    @wraps(view_func)
    def wrapper(request: Request, *args, **kwargs):
        if not request.headers.get('Authorization'):
            return Response(
                'Необходимо авторизоваться',
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Извлекаем токен
        try:
            auth_header = request.headers.get('Authorization')
            token = auth_header.split(' ')[1]  # Берём второй элемент (Bearer <token>)
        except IndexError:
            return Response(
                'Неверный формат токена',
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем токен
        try:
            user = authorizedToken.objects.get(key=token).user
            
        except authorizedToken.DoesNotExist:
            return Response(
                'Не удалось обнаружить такого пользователя',
                status=status.HTTP_406_NOT_ACCEPTABLE
            )

        # Добавляем пользователя в запрос для дальнейшего использования

        request.user = user
        return view_func(request, *args, **kwargs)

    return wrapper

def admin_required(view_func):
    @wraps(view_func)
    def wrapper(request: Request, *args, **kwargs):
        if not request.headers.get('Authorization'):
            return Response(
                'Необходимо авторизоваться',
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Извлекаем токен и проверяем, является ли он админом
        try:
            auth_header = request.headers.get('Authorization')
            token = auth_header.split(' ')[1]  
            user = authorizedToken.objects.get(key=token).user
            if user.is_superuser == False:
                return Response(
                    'У вас недостаточно прав',
                    status=status.HTTP_406_NOT_ACCEPTABLE
                )
        except authorizedToken.DoesNotExist:
            return Response(
                'Не удалось обнаружить такого пользователя',
                status=status.HTTP_406_NOT_ACCEPTABLE
            )

        # Добавляем пользователя в запрос для дальнейшего использования
        request.user = user
        return view_func(request, *args, **kwargs)

    return wrapper
    