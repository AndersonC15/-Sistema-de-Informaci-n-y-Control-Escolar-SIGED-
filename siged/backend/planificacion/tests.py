from datetime import date

from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from planificacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubNivel,
    GradoEscolar,
    PlanEstudio,
)
from usuarios.models import InstitucionEducativa, Rol, Usuario, UsuarioRol


class PlanificacionBaseTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        Rol.objects.create(nombre=Rol.ADMINISTRADOR, requiere_institucion=False)
        Rol.objects.create(
            nombre=Rol.AUTORIDAD_ACADEMICA, requiere_institucion=True,
        )

        self.admin = Usuario.objects.create_user(
            numero_identificacion='000000001', password='admin123',
            first_name='Administrador', last_name='Sistema', is_active=True,
        )
        self.rol_admin = Rol.objects.get(nombre=Rol.ADMINISTRADOR)
        UsuarioRol.objects.create(
            usuario=self.admin, rol=self.rol_admin,
            activo=True, fecha_inicio=date.today(),
        )

        self.autoridad = Usuario.objects.create_user(
            numero_identificacion='1102145830', password='autoridad123',
            first_name='Lissette', last_name='Maldonado', is_active=True,
        )
        self.rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)
        self.institucion = InstitucionEducativa.objects.create(
            nombre='Escuela Municipal Capulí Loma',
            codigo='07H00574', ruc='110215483001',
        )
        UsuarioRol.objects.create(
            usuario=self.autoridad, rol=self.rol_autoridad,
            institucion=self.institucion, activo=True, fecha_inicio=date.today(),
        )

        self.otra_institucion = InstitucionEducativa.objects.create(
            nombre='Unidad Educativa del Milenio "Amazonas"',
            codigo='08H11923', ruc='179213847201',
        )

        self.nivel_inicial = EducacionNivel.objects.create(
            nombre='Educación inicial',
            minutos_periodo=40, periodos_minimos_semana=5,
        )
        self.nivel_ebasica = EducacionNivel.objects.create(
            nombre='Educación General Básica',
            minutos_periodo=40, periodos_minimos_semana=20,
        )
        self.subnivel_prep = EducacionSubNivel.objects.create(
            nivel=self.nivel_ebasica, nombre='Preparatoria',
            minutos_periodo=40, periodos_minimos_semana=10,
        )

        self.token_admin = Token.objects.create(user=self.admin)
        self.token_autoridad = Token.objects.create(user=self.autoridad)


class PlanEstudioTestCase(PlanificacionBaseTestCase):
    def test_listar_planes_autoridad_asignada(self):
        PlanEstudio.objects.create(
            institucion=self.institucion,
            nombre='Bachillerato General Unificado',
            estado=PlanEstudio.VIGENTE,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/planes/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_listar_planes_institucion_no_asignada(self):
        PlanEstudio.objects.create(
            institucion=self.otra_institucion, nombre='Plan ajeno',
            estado=PlanEstudio.VIGENTE,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get(
            f'/api/instituciones/{self.otra_institucion.id}/planes/'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_listar_planes_sin_token(self):
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/planes/'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_crear_plan_estudio(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.post(
            f'/api/instituciones/{self.institucion.id}/planes/',
            {'nombre': 'Plan 2026', 'estado': PlanEstudio.NO_VIGENTE},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], 'Plan 2026')

    def test_solo_un_plan_vigente_por_institucion(self):
        PlanEstudio.objects.create(
            institucion=self.institucion, nombre='Plan Vigente Viejo',
            estado=PlanEstudio.VIGENTE,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.post(
            f'/api/instituciones/{self.institucion.id}/planes/',
            {'nombre': 'Plan Vigente Nuevo', 'estado': PlanEstudio.VIGENTE},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        vigentes = PlanEstudio.objects.filter(
            institucion=self.institucion, estado=PlanEstudio.VIGENTE,
        )
        self.assertEqual(vigentes.count(), 1)
        self.assertEqual(vigentes.first().nombre, 'Plan Vigente Nuevo')

    def test_editar_plan_estudio(self):
        plan = PlanEstudio.objects.create(
            institucion=self.institucion, nombre='Plan Original',
            estado=PlanEstudio.NO_VIGENTE,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.patch(
            f'/api/instituciones/{self.institucion.id}/planes/{plan.id}/',
            {'nombre': 'Plan Actualizado'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Plan Actualizado')

    def test_eliminar_plan_estudio(self):
        plan = PlanEstudio.objects.create(
            institucion=self.institucion, nombre='Plan a Eliminar',
            estado=PlanEstudio.NO_VIGENTE,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.delete(
            f'/api/instituciones/{self.institucion.id}/planes/{plan.id}/'
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(PlanEstudio.objects.filter(id=plan.id).exists())

    def test_buscar_planes_por_nombre(self):
        PlanEstudio.objects.create(
            institucion=self.institucion, nombre='Bachillerato',
            estado=PlanEstudio.VIGENTE,
        )
        PlanEstudio.objects.create(
            institucion=self.institucion, nombre='Básica Superior',
            estado=PlanEstudio.NO_VIGENTE,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/planes/?search=bach'
        )
        self.assertEqual(response.data['count'], 1)
        self.assertIn('Bachillerato', response.data['results'][0]['nombre'])

    def test_ordenar_planes_por_nombre_desc(self):
        PlanEstudio.objects.create(
            institucion=self.institucion, nombre='Alpha',
            estado=PlanEstudio.VIGENTE,
        )
        PlanEstudio.objects.create(
            institucion=self.institucion, nombre='Zeta',
            estado=PlanEstudio.NO_VIGENTE,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/planes/?ordering=-nombre'
        )
        nombres = [r['nombre'] for r in response.data['results']]
        self.assertEqual(nombres, sorted(nombres, reverse=True))


class GradoEscolarTestCase(PlanificacionBaseTestCase):
    def setUp(self):
        super().setUp()
        self.plan = PlanEstudio.objects.create(
            institucion=self.institucion, nombre='BGU',
            estado=PlanEstudio.VIGENTE,
        )

    def test_listar_grados_por_plan(self):
        GradoEscolar.objects.create(
            plan_estudio=self.plan, nivel=self.nivel_inicial,
            nombre='Inicial uno', orden=1,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/planes/{self.plan.id}/grados/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_crear_grado_escolar(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.post(
            f'/api/instituciones/{self.institucion.id}/planes/{self.plan.id}/grados/',
            {'nivel': self.nivel_ebasica.id, 'subnivel': self.subnivel_prep.id,
             'nombre': 'Primero de Básica', 'orden': 2},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], 'Primero de Básica')

    def test_crear_grado_subnivel_inconsistente(self):
        otro_nivel = EducacionNivel.objects.create(
            nombre='Bachillerato', minutos_periodo=45, periodos_minimos_semana=30,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.post(
            f'/api/instituciones/{self.institucion.id}/planes/{self.plan.id}/grados/',
            {'nivel': otro_nivel.id, 'subnivel': self.subnivel_prep.id,
             'nombre': 'Grado Inválido', 'orden': 1},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_grado_escolar(self):
        grado = GradoEscolar.objects.create(
            plan_estudio=self.plan, nivel=self.nivel_inicial,
            nombre='Inicial uno', orden=1,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.patch(
            f'/api/instituciones/{self.institucion.id}/planes/{self.plan.id}/grados/{grado.id}/',
            {'nombre': 'Inicial uno editado'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Inicial uno editado')

    def test_eliminar_grado_escolar(self):
        grado = GradoEscolar.objects.create(
            plan_estudio=self.plan, nivel=self.nivel_inicial,
            nombre='Inicial uno', orden=1,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.delete(
            f'/api/instituciones/{self.institucion.id}/planes/{self.plan.id}/grados/{grado.id}/'
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(GradoEscolar.objects.filter(id=grado.id).exists())

    def test_buscar_grados_por_nombre(self):
        GradoEscolar.objects.create(
            plan_estudio=self.plan, nivel=self.nivel_inicial,
            nombre='Inicial uno', orden=1,
        )
        GradoEscolar.objects.create(
            plan_estudio=self.plan, nivel=self.nivel_ebasica,
            nombre='Segundo grado', orden=2,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/planes/{self.plan.id}/grados/?search=inicial'
        )
        self.assertEqual(response.data['count'], 1)
        self.assertIn('Inicial', response.data['results'][0]['nombre'])


class AsignaturaTestCase(PlanificacionBaseTestCase):
    def setUp(self):
        super().setUp()
        self.plan = PlanEstudio.objects.create(
            institucion=self.institucion, nombre='BGU',
            estado=PlanEstudio.VIGENTE,
        )
        self.grado = GradoEscolar.objects.create(
            plan_estudio=self.plan, nivel=self.nivel_inicial,
            nombre='Inicial uno', orden=1,
        )

    def test_listar_asignaturas(self):
        Asignatura.objects.create(
            grado_escolar=self.grado, nombre='Matemáticas',
            periodos_minimos_semana=5,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/grados/{self.grado.id}/asignaturas/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Matemáticas')

    def test_crear_asignatura(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.post(
            f'/api/instituciones/{self.institucion.id}/grados/{self.grado.id}/asignaturas/',
            {'nombre': 'Lengua y Literatura', 'periodos_minimos_semana': 4},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['periodos_minimos_semana'], 4)

    def test_editar_asignatura(self):
        asig = Asignatura.objects.create(
            grado_escolar=self.grado, nombre='Inglés',
            periodos_minimos_semana=2,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.patch(
            f'/api/instituciones/{self.institucion.id}/grados/{self.grado.id}/asignaturas/{asig.id}/',
            {'periodos_minimos_semana': 3},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['periodos_minimos_semana'], 3)

    def test_eliminar_asignatura(self):
        asig = Asignatura.objects.create(
            grado_escolar=self.grado, nombre='Ciencias',
            periodos_minimos_semana=3,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.delete(
            f'/api/instituciones/{self.institucion.id}/grados/{self.grado.id}/asignaturas/{asig.id}/'
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Asignatura.objects.filter(id=asig.id).exists())


class AlertaCargaPedagogicaTestCase(PlanificacionBaseTestCase):
    def setUp(self):
        super().setUp()
        self.plan = PlanEstudio.objects.create(
            institucion=self.institucion, nombre='BGU',
            estado=PlanEstudio.VIGENTE,
        )
        self.grado = GradoEscolar.objects.create(
            plan_estudio=self.plan, nivel=self.nivel_inicial,
            nombre='Inicial uno', orden=1,
        )

    def test_alerta_true_cuando_carga_insuficiente(self):
        Asignatura.objects.create(
            grado_escolar=self.grado, nombre='Música',
            periodos_minimos_semana=1,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/planes/{self.plan.id}/grados/'
        )
        grado_data = response.data['results'][0]
        self.assertTrue(grado_data['alerta_carga'])
        self.assertEqual(grado_data['carga_minima_semanal'], 5)
        self.assertEqual(grado_data['carga_actual_semanal'], 1)

    def test_alerta_false_cuando_carga_suficiente(self):
        Asignatura.objects.create(
            grado_escolar=self.grado, nombre='Matemáticas',
            periodos_minimos_semana=5,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/planes/{self.plan.id}/grados/'
        )
        grado_data = response.data['results'][0]
        self.assertFalse(grado_data['alerta_carga'])
