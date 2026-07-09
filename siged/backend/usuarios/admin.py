from django.contrib import admin

from usuarios.models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['numero_identificacion', 'first_name', 'last_name', 'is_active', 'is_staff']
    search_fields = ['numero_identificacion', 'first_name', 'last_name']
