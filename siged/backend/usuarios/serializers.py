from rest_framework import serializers

from usuarios.models import InstitucionEducativa, Rol, Usuario, UsuarioRol


class LoginSerializer(serializers.Serializer):
    numero_identificacion = serializers.CharField()
    password = serializers.CharField()


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'requiere_institucion']


class InstitucionEducativaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitucionEducativa
        fields = ['id', 'nombre', 'codigo', 'ruc']


class UsuarioRolSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    usuario_numero_identificacion = serializers.CharField(
        source='usuario.numero_identificacion', read_only=True,
    )
    rol_nombre = serializers.CharField(
        source='rol.get_nombre_display', read_only=True,
    )
    rol_nombre_codigo = serializers.CharField(
        source='rol.nombre', read_only=True,
    )
    institucion_nombre = serializers.CharField(
        source='institucion.nombre', read_only=True, default=None,
    )
    institucion_codigo = serializers.CharField(
        source='institucion.codigo', read_only=True, default=None,
    )
    institucion_ruc = serializers.CharField(
        source='institucion.ruc', read_only=True, default=None,
    )

    class Meta:
        model = UsuarioRol
        fields = [
            'id',
            'usuario',
            'usuario_nombre',
            'usuario_numero_identificacion',
            'rol',
            'rol_nombre',
            'rol_nombre_codigo',
            'institucion',
            'institucion_nombre',
            'institucion_codigo',
            'institucion_ruc',
            'activo',
            'fecha_inicio',
            'fecha_fin',
        ]

    def get_usuario_nombre(self, obj):
        return str(obj.usuario)

    def validate(self, data):
        rol = data.get('rol') or getattr(self.instance, 'rol', None)
        institucion = data.get('institucion', None)
        if self.instance is not None and 'institucion' not in data:
            institucion = self.instance.institucion

        if rol is not None and rol.requiere_institucion and not institucion:
            raise serializers.ValidationError(
                {'institucion': 'El rol seleccionado requiere una institución.'}
            )
        return data


class AutoridadAcademicaSerializer(serializers.ModelSerializer):
    """Serializer simplificado de UsuarioRol para coordinar autoridades por institución."""
    usuario_nombre = serializers.SerializerMethodField()
    usuario_numero_identificacion = serializers.CharField(
        source='usuario.numero_identificacion', read_only=True,
    )
    rol_nombre = serializers.CharField(
        source='rol.get_nombre_display', read_only=True,
    )

    class Meta:
        model = UsuarioRol
        fields = [
            'id',
            'usuario',
            'usuario_nombre',
            'usuario_numero_identificacion',
            'rol',
            'rol_nombre',
            'institucion',
            'activo',
            'fecha_inicio',
            'fecha_fin',
        ]

    def get_usuario_nombre(self, obj):
        return str(obj.usuario)

    def validate(self, data):
        rol = data.get('rol') or getattr(self.instance, 'rol', None)
        if (
            'institucion' in data and data['institucion'] is None
            and rol is not None and rol.requiere_institucion
        ):
            raise serializers.ValidationError(
                {'institucion': 'El rol seleccionado requiere una institución.'}
            )
        return data


class UsuarioSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'numero_identificacion', 'first_name', 'last_name',
            'email', 'is_active', 'roles',
        ]

    def get_roles(self, obj):
        return obj.get_roles_activos()


class InstitucionEducativaListSerializer(serializers.ModelSerializer):
    autoridades_activas = serializers.SerializerMethodField()

    class Meta:
        model = InstitucionEducativa
        fields = ['id', 'nombre', 'codigo', 'ruc', 'autoridades_activas']

    def get_autoridades_activas(self, obj):
        activas = obj.autoridades.filter(activo=True).select_related(
            'usuario', 'rol', 'institucion',
        )
        return [
            {
                'id': a.id,
                'usuario': a.usuario.id,
                'usuario_nombre': str(a.usuario),
                'usuario_numero_identificacion': a.usuario.numero_identificacion,
            }
            for a in activas
        ]
