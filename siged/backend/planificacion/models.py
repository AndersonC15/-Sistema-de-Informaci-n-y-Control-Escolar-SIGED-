from django.db import models

from usuarios.models import InstitucionEducativa


class EducacionNivel(models.Model):
    nombre = models.CharField(
        max_length=150, unique=True, verbose_name='nombre',
    )
    minutos_periodo = models.PositiveIntegerField(
        verbose_name='minutos por período pedagógico',
    )
    periodos_minimos_semana = models.PositiveIntegerField(
        verbose_name='períodos pedagógicos mínimos semanales',
    )

    class Meta:
        verbose_name = 'nivel educativo'
        verbose_name_plural = 'niveles educativos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

    def carga_minima_semanal(self):
        return self.periodos_minimos_semana


class EducacionSubNivel(models.Model):
    nivel = models.ForeignKey(
        EducacionNivel, on_delete=models.CASCADE,
        related_name='subniveles', verbose_name='nivel educativo',
    )
    nombre = models.CharField(
        max_length=150, unique=True, verbose_name='nombre',
    )
    minutos_periodo = models.PositiveIntegerField(
        verbose_name='minutos por período pedagógico',
    )
    periodos_minimos_semana = models.PositiveIntegerField(
        verbose_name='períodos pedagógicos mínimos semanales',
    )

    class Meta:
        verbose_name = 'subnivel educativo'
        verbose_name_plural = 'subniveles educativos'
        ordering = ['nivel__nombre', 'nombre']

    def __str__(self):
        return self.nombre

    def carga_minima_semanal(self):
        return self.periodos_minimos_semana


class PlanEstudio(models.Model):
    VIGENTE = 'VIGENTE'
    NO_VIGENTE = 'NO_VIGENTE'

    ESTADO_CHOICES = [
        (VIGENTE, 'Vigente'),
        (NO_VIGENTE, 'No vigente'),
    ]

    institucion = models.ForeignKey(
        InstitucionEducativa, on_delete=models.CASCADE,
        related_name='planes_estudio', verbose_name='institución educativa',
    )
    nombre = models.CharField(max_length=200, verbose_name='nombre')
    estado = models.CharField(
        max_length=20, choices=ESTADO_CHOICES,
        default=NO_VIGENTE, verbose_name='estado',
    )

    class Meta:
        verbose_name = 'plan de estudio'
        verbose_name_plural = 'planes de estudio'
        ordering = ['nombre']

    def __str__(self):
        return f'{self.nombre} - {self.institucion.nombre}'


class GradoEscolar(models.Model):
    plan_estudio = models.ForeignKey(
        PlanEstudio, on_delete=models.CASCADE,
        related_name='grados_escolares', verbose_name='plan de estudio',
    )
    nivel = models.ForeignKey(
        EducacionNivel, on_delete=models.PROTECT,
        related_name='grados_escolares', verbose_name='nivel educativo',
    )
    subnivel = models.ForeignKey(
        EducacionSubNivel, on_delete=models.PROTECT,
        related_name='grados_escolares', verbose_name='subnivel educativo',
        null=True, blank=True,
    )
    nombre = models.CharField(max_length=150, verbose_name='nombre')
    orden = models.PositiveIntegerField(verbose_name='orden')

    class Meta:
        verbose_name = 'grado escolar'
        verbose_name_plural = 'grados escolares'
        ordering = ['orden', 'nombre']

    def __str__(self):
        return self.nombre

    def carga_minima_semanal(self):
        if self.subnivel_id:
            return self.subnivel.carga_minima_semanal()
        return self.nivel.carga_minima_semanal()

    def carga_actual_semanal(self):
        return sum(a.periodos_minimos_semana for a in self.asignaturas.all())


class Asignatura(models.Model):
    grado_escolar = models.ForeignKey(
        GradoEscolar, on_delete=models.CASCADE,
        related_name='asignaturas', verbose_name='grado escolar',
    )
    nombre = models.CharField(max_length=150, verbose_name='nombre')
    periodos_minimos_semana = models.PositiveIntegerField(
        verbose_name='períodos pedagógicos mínimos semanales',
    )

    class Meta:
        verbose_name = 'asignatura'
        verbose_name_plural = 'asignaturas'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre
