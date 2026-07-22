from django.urls import include, path
from rest_framework.routers import DefaultRouter

from instituciones.views import (
    InstitucionEducativaViewSet,
    MisInstitucionesView,
)

router = DefaultRouter()
router.register('instituciones', InstitucionEducativaViewSet, basename='instituciones')
router.register('mis-instituciones', MisInstitucionesView, basename='mis-instituciones')

urlpatterns = [
    path('', include(router.urls)),
]
