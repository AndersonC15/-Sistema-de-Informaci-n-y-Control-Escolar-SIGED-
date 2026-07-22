from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('usuarios.urls')),
    path('api/', include('instituciones.urls')),
    path('api/', include('planificacion.urls')),
]
