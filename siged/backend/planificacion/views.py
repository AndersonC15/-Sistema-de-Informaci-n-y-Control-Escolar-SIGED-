from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from planificacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubNivel,
    GradoEscolar,
    PlanEstudio,
)
from planificacion.serializers import (
    AsignaturaSerializer,
    EducacionNivelSerializer,
    EducacionSubNivelSerializer,
    GradoEscolarInputSerializer,
    GradoEscolarListSerializer,
    PlanEstudioInputSerializer,
    PlanEstudioListSerializer,
)
from planificacion.services import (
    AsignaturasService,
    GradosEscolaresService,
    InstitucionAccesoService,
    PlanesEstudioService,
)


class PlanificacionPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100


class EsAutoridadMixin:
    def get_institucion_accesible(self, institucion_id):
        institucion = InstitucionAccesoService.institucion_asignada(
            self.request.user, institucion_id,
        )
        return institucion


class EducacionNivelViewSet(viewsets.ReadOnlyModelViewSet):
    """Listado de niveles y subniveles educativos para usar en formularios."""
    permission_classes = [IsAuthenticated]
    queryset = EducacionNivel.objects.all()
    serializer_class = EducacionNivelSerializer

    @action(detail=True, methods=['get'], url_path='subniveles')
    def subniveles(self, request, pk=None):
        nivel = self.get_object()
        subniveles = EducacionSubNivel.objects.filter(nivel=nivel).order_by('nombre')
        return Response(
            EducacionSubNivelSerializer(subniveles, many=True).data,
        )


class PlanEstudioViewSet(EsAutoridadMixin, viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request, institucion_id=None):
        institucion = self.get_institucion_accesible(institucion_id)
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada o no asignada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        search = request.query_params.get('search', '').strip() or None
        ordering = request.query_params.get('ordering', None)
        qs = PlanesEstudioService.listar_por_institucion(
            institucion, search=search, ordering=ordering,
        )
        paginator = PlanificacionPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = PlanEstudioListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def create(self, request, institucion_id=None):
        institucion = self.get_institucion_accesible(institucion_id)
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada o no asignada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        data = dict(request.data)
        data['institucion'] = institucion.id
        serializer = PlanEstudioInputSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            plan = PlanesEstudioService.crear_plan(
                institucion, serializer.validated_data,
            )
        except ValueError as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            PlanEstudioListSerializer(plan).data,
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None, institucion_id=None):
        institucion = self.get_institucion_accesible(institucion_id)
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada o no asignada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        plan = PlanEstudio.objects.filter(pk=pk, institucion=institucion).first()
        if plan is None:
            return Response(
                {'error': 'Plan de estudio no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(PlanEstudioListSerializer(plan).data)

    def update(self, request, pk=None, institucion_id=None):
        return self._partial_update(request, pk=pk, institucion_id=institucion_id, partial=False)

    def partial_update(self, request, pk=None, institucion_id=None):
        return self._partial_update(request, pk=pk, institucion_id=institucion_id, partial=True)

    def _partial_update(self, request, pk=None, institucion_id=None, partial=True):
        institucion = self.get_institucion_accesible(institucion_id)
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada o no asignada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        plan = PlanEstudio.objects.filter(pk=pk, institucion=institucion).first()
        if plan is None:
            return Response(
                {'error': 'Plan de estudio no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PlanEstudioInputSerializer(
            plan, data=request.data, partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        try:
            PlanesEstudioService.actualizar_plan(plan, serializer.validated_data)
        except ValueError as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(PlanEstudioListSerializer(plan).data)

    def destroy(self, request, pk=None, institucion_id=None):
        institucion = self.get_institucion_accesible(institucion_id)
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada o no asignada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        plan = PlanEstudio.objects.filter(pk=pk, institucion=institucion).first()
        if plan is None:
            return Response(
                {'error': 'Plan de estudio no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        PlanesEstudioService.eliminar_plan(plan)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=True, methods=['get', 'post'],
        url_path='grados',
    )
    def grados(self, request, pk=None, institucion_id=None):
        institucion = self.get_institucion_accesible(institucion_id)
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada o no asignada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        plan = PlanEstudio.objects.filter(pk=pk, institucion=institucion).first()
        if plan is None:
            return Response(
                {'error': 'Plan de estudio no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == 'GET':
            search = request.query_params.get('search', '').strip() or None
            ordering = request.query_params.get('ordering', None)
            qs = GradosEscolaresService.listar_por_plan(
                plan, search=search, ordering=ordering,
            )
            paginator = PlanificacionPagination()
            page = paginator.paginate_queryset(qs, request)
            serializer = GradoEscolarListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        data = dict(request.data)
        data['plan_estudio'] = plan.id
        serializer = GradoEscolarInputSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            grado = GradosEscolaresService.crear_grado(
                plan, serializer.validated_data,
            )
        except ValueError as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            GradoEscolarListSerializer(grado).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True, methods=['patch', 'put', 'delete'],
        url_path=r'grados/(?P<grado_id>\d+)',
    )
    def grados_detalle(self, request, pk=None, grado_id=None, institucion_id=None):
        institucion = self.get_institucion_accesible(institucion_id)
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada o no asignada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        plan = PlanEstudio.objects.filter(pk=pk, institucion=institucion).first()
        if plan is None:
            return Response(
                {'error': 'Plan de estudio no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        grado = GradoEscolar.objects.filter(pk=grado_id, plan_estudio=plan).first()
        if grado is None:
            return Response(
                {'error': 'Grado escolar no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == 'DELETE':
            GradosEscolaresService.eliminar_grado(grado)
            return Response(status=status.HTTP_204_NO_CONTENT)

        partial = request.method == 'PATCH'
        serializer = GradoEscolarInputSerializer(
            grado, data=request.data, partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        try:
            GradosEscolaresService.actualizar_grado(grado, serializer.validated_data)
        except ValueError as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(GradoEscolarListSerializer(grado).data)


class GradoEscolarViewSet(EsAutoridadMixin, viewsets.ViewSet):
    """ViewSet auxiliar para gestionar asignaturas de un grado de forma directa."""
    permission_classes = [IsAuthenticated]

    def _get_grado(self, request, institucion_id, grado_id):
        institucion = self.get_institucion_accesible(institucion_id)
        if institucion is None:
            return None, None
        grado = GradoEscolar.objects.filter(
            pk=grado_id, plan_estudio__institucion=institucion,
        ).first()
        return institucion, grado

    @action(
        detail=False, methods=['get', 'post'],
        url_path=r'grados/(?P<grado_id>\d+)/asignaturas',
    )
    def asignaturas_por_grado(self, request, institucion_id=None, grado_id=None):
        institucion, grado = self._get_grado(request, institucion_id, grado_id)
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada o no asignada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if grado is None:
            return Response(
                {'error': 'Grado escolar no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == 'GET':
            asignaturas = AsignaturasService.listar_por_grado(grado)
            return Response(
                AsignaturaSerializer(asignaturas, many=True).data,
            )

        data = dict(request.data)
        data['grado_escolar'] = grado.id
        serializer = AsignaturaSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        try:
            asignatura = AsignaturasService.crear_asignatura(
                grado, serializer.validated_data,
            )
        except ValueError as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            AsignaturaSerializer(asignatura).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False, methods=['patch', 'put', 'delete'],
        url_path=r'grados/(?P<grado_id>\d+)/asignaturas/(?P<asignatura_id>\d+)',
    )
    def asignaturas_detalle(
        self, request, institucion_id=None, grado_id=None, asignatura_id=None,
    ):
        institucion, grado = self._get_grado(request, institucion_id, grado_id)
        if institucion is None:
            return Response(
                {'error': 'Institución no encontrada o no asignada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if grado is None:
            return Response(
                {'error': 'Grado escolar no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        asignatura = Asignatura.objects.filter(
            pk=asignatura_id, grado_escolar=grado,
        ).first()
        if asignatura is None:
            return Response(
                {'error': 'Asignatura no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == 'DELETE':
            AsignaturasService.eliminar_asignatura(asignatura)
            return Response(status=status.HTTP_204_NO_CONTENT)

        partial = request.method == 'PATCH'
        serializer = AsignaturaSerializer(
            asignatura, data=request.data, partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        try:
            AsignaturasService.actualizar_asignatura(
                asignatura, serializer.validated_data,
            )
        except ValueError as exc:
            return Response(
                {'error': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(AsignaturaSerializer(asignatura).data)
