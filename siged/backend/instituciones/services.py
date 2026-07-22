"""Capa de lógica de negocio para la gestión de instituciones y autoridades."""
from django.core.exceptions import ValidationError as DjangoValidationError

from usuarios.models import InstitucionEducativa, Rol, UsuarioRol


class InstitucionesService:
    @staticmethod
    def listar_instituciones(search=None, ordering=None):
        qs = InstitucionEducativa.objects.all()
        if search:
            qs = qs.filter(nombre__icontains=search)
        if ordering:
            ordering_raw = ordering.lstrip('-')
            if ordering_raw in ('nombre', 'codigo', 'ruc'):
                qs = qs.order_by(ordering)
            else:
                qs = qs.order_by('nombre')
        else:
            qs = qs.order_by('nombre')
        return qs

    @staticmethod
    def crear_institucion(data):
        institucion = InstitucionEducativa(
            nombre=data.get('nombre', '').strip(),
            codigo=data.get('codigo', '').strip(),
            ruc=data.get('ruc', '').strip(),
        )
        institucion.full_clean()
        institucion.save()
        return institucion

    @staticmethod
    def actualizar_institucion(institucion, data):
        if 'nombre' in data:
            institucion.nombre = data['nombre'].strip()
        if 'codigo' in data:
            institucion.codigo = data['codigo'].strip()
        if 'ruc' in data:
            institucion.ruc = data['ruc'].strip()
        institucion.full_clean()
        institucion.save()
        return institucion

    @staticmethod
    def eliminar_institucion(institucion):
        institucion.delete()


class AutoridadesService:
    @staticmethod
    def listar_por_institucion(institucion):
        return (
            UsuarioRol.objects.filter(institucion=institucion)
            .select_related('usuario', 'rol', 'institucion')
            .order_by('-fecha_inicio')
        )

    @staticmethod
    def crear_asignacion(institucion, data):
        rol_autoridad = (
            Rol.objects.filter(nombre=Rol.AUTORIDAD_ACADEMICA).first()
        )
        asignacion = UsuarioRol(
            usuario=data['usuario'],
            rol=rol_autoridad,
            institucion=institucion,
            activo=bool(data.get('activo', True)),
            fecha_inicio=data['fecha_inicio'],
            fecha_fin=data.get('fecha_fin'),
        )
        try:
            asignacion.full_clean()
        except DjangoValidationError as exc:
            raise ValueError(exc.message_dict if hasattr(exc, 'message_dict') else exc.messages)
        asignacion.save()
        return asignacion

    @staticmethod
    def actualizar_asignacion(asignacion, data):
        if 'usuario' in data:
            asignacion.usuario = data['usuario']
        if 'fecha_inicio' in data:
            asignacion.fecha_inicio = data['fecha_inicio']
        if 'fecha_fin' in data:
            asignacion.fecha_fin = data['fecha_fin']
        if 'activo' in data:
            asignacion.activo = bool(data['activo'])
        try:
            asignacion.full_clean()
        except DjangoValidationError as exc:
            raise ValueError(exc.message_dict if hasattr(exc, 'message_dict') else exc.messages)
        asignacion.save()
        return asignacion

    @staticmethod
    def eliminar_asignacion(asignacion):
        asignacion.delete()

    @staticmethod
    def toggle_activo(asignacion):
        asignacion.activo = not asignacion.activo
        asignacion.save()
        return asignacion


class MisInstitucionesService:
    @staticmethod
    def instituciones_asignadas(usuario):
        qs = (
            InstitucionEducativa.objects.filter(
                autoridades__usuario=usuario,
                autoridades__activo=True,
                autoridades__rol__nombre=Rol.AUTORIDAD_ACADEMICA,
            )
            .distinct()
            .order_by('nombre')
        )
        return qs
