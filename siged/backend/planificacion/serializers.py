from rest_framework import serializers

from planificacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubNivel,
    GradoEscolar,
    PlanEstudio,
)


class EducacionNivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionNivel
        fields = ['id', 'nombre', 'minutos_periodo', 'periodos_minimos_semana']


class EducacionSubNivelSerializer(serializers.ModelSerializer):
    nivel_nombre = serializers.CharField(source='nivel.nombre', read_only=True)

    class Meta:
        model = EducacionSubNivel
        fields = [
            'id', 'nivel', 'nivel_nombre', 'nombre',
            'minutos_periodo', 'periodos_minimos_semana',
        ]


class AsignaturaSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(allow_blank=True, required=True)

    class Meta:
        model = Asignatura
        fields = ['id', 'grado_escolar', 'nombre', 'periodos_minimos_semana']

    def validate_nombre(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('El nombre de la asignatura es obligatorio.')
        return value

    def validate_periodos_minimos_semana(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError(
                'Los períodos pedagógicos mínimos semanales deben ser un valor mayor a 0.',
            )
        return value


class GradoEscolarListSerializer(serializers.ModelSerializer):
    nivel_nombre = serializers.CharField(source='nivel.nombre', read_only=True)
    subnivel_nombre = serializers.SerializerMethodField()
    carga_minima_semanal = serializers.SerializerMethodField()
    carga_actual_semanal = serializers.SerializerMethodField()
    alerta_carga = serializers.SerializerMethodField()

    class Meta:
        model = GradoEscolar
        fields = [
            'id', 'plan_estudio', 'nivel', 'nivel_nombre',
            'subnivel', 'subnivel_nombre', 'nombre', 'orden',
            'carga_minima_semanal', 'carga_actual_semanal', 'alerta_carga',
        ]

    def get_subnivel_nombre(self, obj):
        return obj.subnivel.nombre if obj.subnivel_id else None

    def get_carga_minima_semanal(self, obj):
        return obj.carga_minima_semanal()

    def get_carga_actual_semanal(self, obj):
        return obj.carga_actual_semanal()

    def get_alerta_carga(self, obj):
        return obj.carga_actual_semanal() < obj.carga_minima_semanal()


class GradoEscolarInputSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(allow_blank=True, required=True)

    class Meta:
        model = GradoEscolar
        fields = [
            'id', 'plan_estudio', 'nivel', 'subnivel', 'nombre', 'orden',
        ]

    def validate_nombre(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('El nombre del grado escolar es obligatorio.')
        return value

    def validate_orden(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError(
                'El orden del grado escolar debe ser un entero positivo.',
            )
        return value

    def validate_nivel(self, value):
        if value is None:
            raise serializers.ValidationError('El nivel educativo es obligatorio.')
        return value

    def validate(self, data):
        nivel = data.get('nivel') or getattr(self.instance, 'nivel', None)
        subnivel = data.get('subnivel', None)
        if self.instance is not None and 'subnivel' not in data:
            subnivel = self.instance.subnivel

        if subnivel is not None and nivel is not None and subnivel.nivel_id != nivel.id:
            raise serializers.ValidationError(
                {'subnivel': 'El subnivel seleccionado debe pertenecer al nivel educativo elegido.'}
            )
        return data


class PlanEstudioListSerializer(serializers.ModelSerializer):
    institucion_nombre = serializers.CharField(
        source='institucion.nombre', read_only=True,
    )

    class Meta:
        model = PlanEstudio
        fields = [
            'id', 'institucion', 'institucion_nombre', 'nombre', 'estado',
        ]


class PlanEstudioInputSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(allow_blank=True, required=True)

    class Meta:
        model = PlanEstudio
        fields = ['id', 'institucion', 'nombre', 'estado']

    def validate_nombre(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('El nombre del plan de estudio es obligatorio.')
        return value

    def validate_estado(self, value):
        valores_validos = [PlanEstudio.VIGENTE, PlanEstudio.NO_VIGENTE]
        if value not in valores_validos:
            raise serializers.ValidationError(
                'El estado del plan de estudio debe ser "Vigente" o "No vigente".',
            )
        return value
