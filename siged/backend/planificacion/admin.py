from django.contrib import admin

from planificacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubNivel,
    GradoEscolar,
    PlanEstudio,
)


@admin.register(EducacionNivel)
class EducacionNivelAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'minutos_periodo', 'periodos_minimos_semana']
    search_fields = ['nombre']


@admin.register(EducacionSubNivel)
class EducacionSubNivelAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'nivel', 'minutos_periodo', 'periodos_minimos_semana']
    list_filter = ['nivel']
    search_fields = ['nombre']


@admin.register(PlanEstudio)
class PlanEstudioAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'institucion', 'estado']
    list_filter = ['estado', 'institucion']
    search_fields = ['nombre', 'institucion__nombre']


@admin.register(GradoEscolar)
class GradoEscolarAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'orden', 'plan_estudio', 'nivel', 'subnivel']
    list_filter = ['nivel', 'subnivel', 'plan_estudio__institucion']
    search_fields = ['nombre', 'plan_estudio__nombre']


@admin.register(Asignatura)
class AsignaturaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'grado_escolar', 'periodos_minimos_semana']
    search_fields = ['nombre', 'grado_escolar__nombre']
