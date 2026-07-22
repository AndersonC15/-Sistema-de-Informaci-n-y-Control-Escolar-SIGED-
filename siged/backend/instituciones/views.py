from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from usuarios.models import InstitucionEducativa, Rol, Usuario, UsuarioRol
from usuarios.serializers import (
    AutoridadAcademicaSerializer,
    InstitucionEducativaListSerializer,
)
from instituciones.serializers import (
    AutoridadAcademicaInputSerializer,
    InstitucionEducativaInputSerializer,
    UsuarioOptionSerializer,
)
from instituciones.services import (
    AutoridadesService,
    InstitucionesService,
    MisInstitucionesService,
)


class RolPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 100


class EsAdministradorMixin:
    def check_administrador(self):
        if self.request.user.is_superuser:
            return
        roles = self.request.user.get_roles_activos()
        if Rol.ADMINISTRADOR not in roles:
            self.permission_denied(self.request)


class InstitucionEducativaViewSet(EsAdministradorMixin, viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        self.check_administrador()
        search = request.query_params.get('search', '').strip() or None
        ordering = request.query_params.get('ordering', None)
        qs = InstitucionesService.listar_instituciones(
            search=search, ordering=ordering,
        )

        paginator = RolPagination()
        page = paginator.paginate_queryset(qs, request)
        field = ordering.lstrip('-') if ordering else 'nombre'
        reverse = bool(ordering) and ordering.startswith('-')
        key_map = {'nombre': 'nombre', 'codigo': 'codigo', 'ruc': 'ruc'}
        key = key_map.get(field, 'nombre')
        instituciones = list(
            InstitucionEducativa.objects.filter(
                id__in=[i.id for i in page],
            ).prefetch_related('autoridades__usuario', 'autoridades__rol')
        )
        instituciones.sort(key=lambda i: getattr(i, key), reverse=reverse)
        serializer = InstitucionEducativaListSerializer(instituciones, many=True)
        return paginator.get_paginated_response(serializer.data)

    def create(self, request):
        self.check_administrador()
        serializer = InstitucionEducativaInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            institucion = InstitucionesService.crear_institucion(
                serializer.validated_data,
            )
        except Exception as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            InstitucionEducativaListSerializer(institucion).data,
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None):
        self.check_administrador()
        institucion = InstitucionEducativa.objects.filter(pk=pk).first()
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(InstitucionEducativaListSerializer(institucion).data)

    def update(self, request, pk=None):
        self.check_administrador()
        institucion = InstitucionEducativa.objects.filter(pk=pk).first()
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = InstitucionEducativaInputSerializer(
            institucion, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        try:
            InstitucionesService.actualizar_institucion(
                institucion, serializer.validated_data,
            )
        except Exception as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(InstitucionEducativaListSerializer(institucion).data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk=pk)

    def destroy(self, request, pk=None):
        self.check_administrador()
        institucion = InstitucionEducativa.objects.filter(pk=pk).first()
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        InstitucionesService.eliminar_institucion(institucion)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'post'], url_path='autoridades')
    def autoridades(self, request, pk=None):
        self.check_administrador()
        institucion = InstitucionEducativa.objects.filter(pk=pk).first()
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == 'GET':
            autoridades = AutoridadesService.listar_por_institucion(institucion)
            return Response(
                AutoridadAcademicaSerializer(autoridades, many=True).data,
            )

        serializer = AutoridadAcademicaInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            asignacion = AutoridadesService.crear_asignacion(
                institucion, serializer.validated_data,
            )
        except ValueError as exc:
            return Response(
                {'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            AutoridadAcademicaSerializer(asignacion).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'], url_path='usuarios')
    def usuarios_disponibles(self, request):
        self.check_administrador()
        usuarios = Usuario.objects.filter(is_active=True).order_by(
            'first_name', 'last_name',
        )
        return Response(UsuarioOptionSerializer(usuarios, many=True).data)

    @action(
        detail=True, methods=['patch', 'put', 'delete'],
        url_path=r'autoridades/(?P<asignacion_id>\d+)',
    )
    def autoridades_detalle(self, request, pk=None, asignacion_id=None):
        self.check_administrador()
        institucion = InstitucionEducativa.objects.filter(pk=pk).first()
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        asignacion = UsuarioRol.objects.filter(
            pk=asignacion_id, institucion=institucion,
        ).first()
        if asignacion is None:
            return Response(
                {'error': 'Asignación no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == 'DELETE':
            AutoridadesService.eliminar_asignacion(asignacion)
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = AutoridadAcademicaInputSerializer(
            asignacion, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        try:
            AutoridadesService.actualizar_asignacion(asignacion, validated)
        except ValueError as exc:
            return Response(
                {'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(AutoridadAcademicaSerializer(asignacion).data)

    @action(
        detail=True, methods=['post'],
        url_path=r'autoridades/(?P<asignacion_id>\d+)/toggle-activo',
    )
    def toggle_activo_autoridad(self, request, pk=None, asignacion_id=None):
        self.check_administrador()
        institucion = InstitucionEducativa.objects.filter(pk=pk).first()
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        asignacion = UsuarioRol.objects.filter(
            pk=asignacion_id, institucion=institucion,
        ).first()
        if asignacion is None:
            return Response(
                {'error': 'Asignación no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        AutoridadesService.toggle_activo(asignacion)
        return Response(AutoridadAcademicaSerializer(asignacion).data)


class MisInstitucionesView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        instituciones = MisInstitucionesService.instituciones_asignadas(
            request.user,
        )
        return Response(
            InstitucionEducativaListSerializer(instituciones, many=True).data,
        )
