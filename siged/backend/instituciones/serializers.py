from rest_framework import serializers

from usuarios.models import InstitucionEducativa, Usuario


class InstitucionEducativaInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitucionEducativa
        fields = ['id', 'nombre', 'codigo', 'ruc']

    def validate_nombre(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('El nombre es obligatorio.')
        return value

    def validate_codigo(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('El código es obligatorio.')
        return value

    def validate_ruc(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('El RUC es obligatorio.')
        return value


class UsuarioOptionSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'numero_identificacion', 'nombre_completo']

    def get_nombre_completo(self, obj):
        return str(obj)


class AutoridadAcademicaInputSerializer(serializers.Serializer):
    usuario = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all())
    fecha_inicio = serializers.DateField()
    fecha_fin = serializers.DateField(required=False, allow_null=True)
    activo = serializers.BooleanField(required=False, default=True)
