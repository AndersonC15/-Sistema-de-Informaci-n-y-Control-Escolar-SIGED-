from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from usuarios.serializers import LoginSerializer, UsuarioSerializer


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    numero_identificacion = serializer.validated_data['numero_identificacion']
    password = serializer.validated_data['password']

    user = authenticate(
        username=numero_identificacion, password=password
    )

    if user is None:
        return Response(
            {'error': 'Número de identificación o contraseña incorrectos.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {'error': 'La cuenta está inactiva. Contacte al administrador.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {
            'token': token.key,
            'user': UsuarioSerializer(user).data,
        }
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    request.user.auth_token.delete()
    return Response({'message': 'Sesión cerrada correctamente.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UsuarioSerializer(request.user).data)
