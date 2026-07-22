"""Capa de lógica de negocio para la planificación académica."""
from django.core.exceptions import ValidationError as DjangoValidationError

from planificacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubNivel,
    GradoEscolar,
    PlanEstudio,
)
from usuarios.models import InstitucionEducativa, Rol, UsuarioRol


class PlanesEstudioService:
    @staticmethod
    def listar_por_institucion(institucion, search=None, ordering=None):
        qs = PlanEstudio.objects.filter(institucion=institucion)
        if search:
            qs = qs.filter(nombre__icontains=search)
        if ordering:
            ordering_raw = ordering.lstrip('-')
            if ordering_raw in ('nombre', 'estado'):
                qs = qs.order_by(ordering)
            else:
                qs = qs.order_by('nombre')
        else:
            qs = qs.order_by('nombre')
        return qs

    @staticmethod
    def crear_plan(institucion, data):
        plan = PlanEstudio(
            institucion=institucion,
            nombre=data.get('nombre', '').strip(),
            estado=data.get('estado', PlanEstudio.NO_VIGENTE),
        )
        try:
            plan.full_clean()
        except DjangoValidationError as exc:
            raise ValueError(
                exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            )

        if plan.estado == PlanEstudio.VIGENTE:
            PlanEstudio.objects.filter(
                institucion=institucion, estado=PlanEstudio.VIGENTE,
            ).exclude(pk=plan.pk).update(estado=PlanEstudio.NO_VIGENTE)

        plan.save()
        return plan

    @staticmethod
    def actualizar_plan(plan, data):
        if 'nombre' in data:
            plan.nombre = data['nombre'].strip()
        if 'estado' in data:
            plan.estado = data['estado']
        try:
            plan.full_clean()
        except DjangoValidationError as exc:
            raise ValueError(
                exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            )

        if plan.estado == PlanEstudio.VIGENTE:
            PlanEstudio.objects.filter(
                institucion=plan.institucion, estado=PlanEstudio.VIGENTE,
            ).exclude(pk=plan.pk).update(estado=PlanEstudio.NO_VIGENTE)

        plan.save()
        return plan

    @staticmethod
    def eliminar_plan(plan):
        plan.delete()


class GradosEscolaresService:
    @staticmethod
    def listar_por_plan(plan, search=None, ordering=None):
        qs = GradoEscolar.objects.filter(plan_estudio=plan)
        if search:
            qs = qs.filter(nombre__icontains=search)
        if ordering:
            ordering_raw = ordering.lstrip('-')
            if ordering_raw in ('nombre', 'orden', 'nivel', 'subnivel'):
                if ordering_raw == 'nivel':
                    qs = qs.order_by(
                        ordering.replace('nivel', 'nivel__nombre'),
                    )
                elif ordering_raw == 'subnivel':
                    qs = qs.order_by(
                        ordering.replace('subnivel', 'subnivel__nombre'),
                    )
                else:
                    qs = qs.order_by(ordering)
            else:
                qs = qs.order_by('orden', 'nombre')
        else:
            qs = qs.order_by('orden', 'nombre')
        return qs

    @staticmethod
    def crear_grado(plan, data):
        grado = GradoEscolar(
            plan_estudio=plan,
            nivel=data['nivel'],
            subnivel=data.get('subnivel'),
            nombre=data.get('nombre', '').strip(),
            orden=data['orden'],
        )
        try:
            grado.full_clean()
        except DjangoValidationError as exc:
            raise ValueError(
                exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            )
        grado.save()
        return grado

    @staticmethod
    def actualizar_grado(grado, data):
        if 'nivel' in data:
            grado.nivel = data['nivel']
        if 'subnivel' in data:
            grado.subnivel = data['subnivel']
        if 'nombre' in data:
            grado.nombre = data['nombre'].strip()
        if 'orden' in data:
            grado.orden = data['orden']
        try:
            grado.full_clean()
        except DjangoValidationError as exc:
            raise ValueError(
                exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            )
        grado.save()
        return grado

    @staticmethod
    def eliminar_grado(grado):
        grado.delete()


class AsignaturasService:
    @staticmethod
    def listar_por_grado(grado):
        return Asignatura.objects.filter(grado_escolar=grado).order_by('nombre')

    @staticmethod
    def crear_asignatura(grado, data):
        asignatura = Asignatura(
            grado_escolar=grado,
            nombre=data.get('nombre', '').strip(),
            periodos_minimos_semana=data['periodos_minimos_semana'],
        )
        try:
            asignatura.full_clean()
        except DjangoValidationError as exc:
            raise ValueError(
                exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            )
        asignatura.save()
        return asignatura

    @staticmethod
    def actualizar_asignatura(asignatura, data):
        if 'nombre' in data:
            asignatura.nombre = data['nombre'].strip()
        if 'periodos_minimos_semana' in data:
            asignatura.periodos_minimos_semana = data['periodos_minimos_semana']
        try:
            asignatura.full_clean()
        except DjangoValidationError as exc:
            raise ValueError(
                exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            )
        asignatura.save()
        return asignatura

    @staticmethod
    def eliminar_asignatura(asignatura):
        asignatura.delete()


class InstitucionAccesoService:
    """Valida que un usuario tenga acceso a una institución como autoridad académica activa."""

    @staticmethod
    def institucion_asignada(usuario, institucion_id):
        return (
            InstitucionEducativa.objects.filter(
                pk=institucion_id,
                autoridades__usuario=usuario,
                autoridades__activo=True,
                autoridades__rol__nombre=Rol.AUTORIDAD_ACADEMICA,
            ).first()
        )
