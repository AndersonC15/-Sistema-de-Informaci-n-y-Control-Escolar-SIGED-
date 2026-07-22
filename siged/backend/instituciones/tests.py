from datetime import date

from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from usuarios.models import InstitucionEducativa, Rol, Usuario, UsuarioRol


class InstitucionesBaseTestCase(TestCase):
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

        self.token_admin = Token.objects.create(user=self.admin)
        self.token_autoridad = Token.objects.create(user=self.autoridad)


class InstitucionesListTestCase(InstitucionesBaseTestCase):
    def test_listar_instituciones_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.get('/api/instituciones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertEqual(response.data['count'], 1)

    def test_listar_instituciones_autoridad_denegado(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get('/api/instituciones/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_listar_sin_token_no_autorizado(self):
        response = self.client.get('/api/instituciones/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class InstitucionesSearchOrdenTestCase(InstitucionesBaseTestCase):
    def setUp(self):
        super().setUp()
        InstitucionEducativa.objects.create(
            nombre='Unidad Educativa del Milenio Amazonas',
            codigo='08H11923', ruc='179213847201',
        )
        InstitucionEducativa.objects.create(
            nombre='Colegio Nacional Sucre',
            codigo='09H23218', ruc='110374852001',
        )

    def test_search_por_nombre(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.get('/api/instituciones/?search=amazonas')
        self.assertEqual(response.data['count'], 1)
        self.assertIn('Amazonas', response.data['results'][0]['nombre'])

    def test_ordenamiento_por_codigo_desc(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.get('/api/instituciones/?ordering=-codigo&page_size=10')
        codigos = [r['codigo'] for r in response.data['results']]
        self.assertEqual(codigos, sorted(codigos, reverse=True))


class InstitucionesCRUDTestCase(InstitucionesBaseTestCase):
    def test_crear_institucion(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.post(
            '/api/instituciones/',
            {'nombre': 'Nuevo Colegio', 'codigo': 'NEW001', 'ruc': '999999999001'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['codigo'], 'NEW001')

    def test_crear_institucion_codigo_duplicado(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.post(
            '/api/instituciones/',
            {'nombre': 'Dup', 'codigo': '07H00574', 'ruc': '999999999009'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_institucion(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.patch(
            f'/api/instituciones/{self.institucion.id}/',
            {'nombre': 'Escuela Editada'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Escuela Editada')

    def test_eliminar_institucion(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.delete(
            f'/api/instituciones/{self.institucion.id}/',
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            InstitucionEducativa.objects.filter(id=self.institucion.id).exists()
        )


class AutoridadesTestCase(InstitucionesBaseTestCase):
    def setUp(self):
        super().setUp()
        self.otra_institucion = InstitucionEducativa.objects.create(
            nombre='Otra Institución', codigo='O01', ruc='O01',
        )
        self.nuevo_usuario = Usuario.objects.create_user(
            numero_identificacion='0999999999', password='pass1234',
            first_name='Ricardo', last_name='Cevallos', is_active=True,
        )

    def test_listar_autoridades_por_institucion(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.get(
            f'/api/instituciones/{self.institucion.id}/autoridades/',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['usuario_nombre'], 'Lissette Maldonado')

    def test_crear_autoridad(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.post(
            f'/api/instituciones/{self.otra_institucion.id}/autoridades/',
            {
                'usuario': self.nuevo_usuario.id,
                'fecha_inicio': '2026-01-01',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['activo'])
        self.assertEqual(response.data['rol_nombre'], 'Autoridad académica')

    def test_crear_autoridad_usuario_inexistente(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.post(
            f'/api/instituciones/{self.otra_institucion.id}/autoridades/',
            {'usuario': 9999999, 'fecha_inicio': '2026-01-01'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_editar_autoridad(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        asignacion = UsuarioRol.objects.get(
            usuario=self.autoridad, institucion=self.institucion,
        )
        response = self.client.patch(
            f'/api/instituciones/{self.institucion.id}/autoridades/{asignacion.id}/',
            {'fecha_fin': '2026-12-31'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['fecha_fin'], '2026-12-31')

    def test_toggle_activo_autoridad(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        asignacion = UsuarioRol.objects.get(
            usuario=self.autoridad, institucion=self.institucion,
        )
        self.assertTrue(asignacion.activo)
        response = self.client.post(
            f'/api/instituciones/{self.institucion.id}/autoridades/{asignacion.id}/toggle-activo/',
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['activo'])

    def test_eliminar_autoridad(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        asignacion = UsuarioRol.objects.get(
            usuario=self.autoridad, institucion=self.institucion,
        )
        response = self.client.delete(
            f'/api/instituciones/{self.institucion.id}/autoridades/{asignacion.id}/',
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UsuarioRol.objects.filter(id=asignacion.id).exists())


class MisInstitucionesTestCase(InstitucionesBaseTestCase):
    def test_autoridad_ve_sus_instituciones(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response = self.client.get('/api/mis-instituciones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Escuela Municipal Capulí Loma')

    def test_autoridad_no_ve_institucion_inactiva(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_autoridad.key}')
        response_before = self.client.get('/api/mis-instituciones/')
        self.assertEqual(len(response_before.data), 1)

        UsuarioRol.objects.filter(
            usuario=self.autoridad, institucion=self.institucion,
        ).update(activo=False)

        response_after = self.client.get('/api/mis-instituciones/')
        self.assertEqual(len(response_after.data), 0)

    def test_admin_ve_mis_instituciones_vacio(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.get('/api/mis-instituciones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class MeRolesTestCase(InstitucionesBaseTestCase):
    def test_me_devuelve_roles(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token_admin.key}')
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('roles', response.data)
        self.assertIn(Rol.ADMINISTRADOR, response.data['roles'])
