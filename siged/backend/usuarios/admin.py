from django.contrib import admin

from usuarios.models import InstitucionEducativa, Rol, Usuario, UsuarioRol


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ['numero_identificacion', 'first_name', 'last_name', 'is_active', 'is_staff']
    search_fields = ['numero_identificacion', 'first_name', 'last_name']


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'requiere_institucion']
    search_fields = ['nombre']


@admin.register(InstitucionEducativa)
class InstitucionEducativaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'codigo', 'ruc']
    search_fields = ['nombre', 'codigo', 'ruc']


@admin.register(UsuarioRol)
class UsuarioRolAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'rol', 'institucion', 'activo', 'fecha_inicio', 'fecha_fin']
    list_filter = ['rol', 'activo']
    search_fields = [
        'usuario__numero_identificacion',
        'usuario__first_name',
        'usuario__last_name',
        'institucion__nombre',
    ]
