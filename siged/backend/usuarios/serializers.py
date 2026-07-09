from rest_framework import serializers

from usuarios.models import Usuario


class LoginSerializer(serializers.Serializer):
    numero_identificacion = serializers.CharField()
    password = serializers.CharField()


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'numero_identificacion', 'first_name', 'last_name', 'email', 'is_active']
