from django.urls import include, path, re_path
from rest_framework.routers import DefaultRouter

from planificacion.views import (
    EducacionNivelViewSet,
    GradoEscolarViewSet,
    PlanEstudioViewSet,
)

router = DefaultRouter()

institucion_patterns = [
    path('planes/', PlanEstudioViewSet.as_view({
        'get': 'list',
        'post': 'create',
    })),
    path('planes/<int:pk>/', PlanEstudioViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    })),
    path('planes/<int:pk>/grados/', PlanEstudioViewSet.as_view({
        'get': 'grados',
        'post': 'grados',
    })),
    re_path(
        r'^planes/(?P<pk>\d+)/grados/(?P<grado_id>\d+)/$',
        PlanEstudioViewSet.as_view({
            'patch': 'grados_detalle',
            'put': 'grados_detalle',
            'delete': 'grados_detalle',
        }),
        name='plan-grado-detail',
    ),
    re_path(
        r'^grados/(?P<grado_id>\d+)/asignaturas/$',
        GradoEscolarViewSet.as_view({
            'get': 'asignaturas_por_grado',
            'post': 'asignaturas_por_grado',
        }),
        name='grado-asignaturas',
    ),
    re_path(
        r'^grados/(?P<grado_id>\d+)/asignaturas/(?P<asignatura_id>\d+)/$',
        GradoEscolarViewSet.as_view({
            'patch': 'asignaturas_detalle',
            'put': 'asignaturas_detalle',
            'delete': 'asignaturas_detalle',
        }),
        name='grado-asignatura-detail',
    ),
]

router.register('niveles', EducacionNivelViewSet, basename='niveles')

urlpatterns = [
    path('instituciones/<int:institucion_id>/', include(institucion_patterns)),
    path('', include(router.urls)),
]
