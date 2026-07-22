"""Comando que crea datos iniciales para SIGED: roles, usuario admin y datos de muestra."""
from datetime import date

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand

from planificacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubNivel,
    GradoEscolar,
    PlanEstudio,
)
from usuarios.models import InstitucionEducativa, Rol, Usuario, UsuarioRol


ADMIN_DATA = {
    'numero_identificacion': '000000001',
    'email': 'admin@example.com',
    'password': 'admin123',
    'first_name': 'Administrador',
    'last_name': 'Sistema',
}

ROLES = [
    Rol.ADMINISTRADOR,
    Rol.AUTORIDAD_ACADEMICA,
    Rol.DOCENTE,
    Rol.SECRETARIA,
    Rol.ESTUDIANTE,
    Rol.DECE,
]

ROLES_CON_INSTITUCION = [Rol.AUTORIDAD_ACADEMICA]

NIVELES_EDUCATIVOS = [
    {
        'nombre': 'Educación inicial',
        'minutos_periodo': 40,
        'periodos_minimos_semana': 5,
    },
    {
        'nombre': 'Educación General Básica',
        'minutos_periodo': 40,
        'periodos_minimos_semana': 20,
    },
    {
        'nombre': 'Bachillerato General Unificado',
        'minutos_periodo': 45,
        'periodos_minimos_semana': 30,
    },
]

SUBNIVELES_EDUCATIVOS = [
    {
        'nivel_nombre': 'Educación General Básica',
        'nombre': 'Preparatoria',
        'minutos_periodo': 40,
        'periodos_minimos_semana': 10,
    },
    {
        'nivel_nombre': 'Educación General Básica',
        'nombre': 'Elemental',
        'minutos_periodo': 40,
        'periodos_minimos_semana': 15,
    },
]

INSTITUCIONES_SHOWCASE = [
    {'nombre': 'Escuela Municipal Capulí Loma', 'codigo': '07H00574', 'ruc': '110215483001'},
    {'nombre': 'Unidad Educativa del Milenio "Amazonas"', 'codigo': '08H11923', 'ruc': '179213847201'},
    {'nombre': 'Colegio Nacional Sucre', 'codigo': '09H23218', 'ruc': '110374852001'},
    {'nombre': 'Escuela Municipal Borja', 'codigo': '07H00612', 'ruc': '110215493002'},
    {'nombre': 'Unidad Educativa Pradera', 'codigo': '07H00723', 'ruc': '110215524003'},
    {'nombre': 'Instituto Técnico Ambato', 'codigo': '09H24516', 'ruc': '110374924001'},
    {'nombre': 'Escuela Juan Pío Montúfar', 'codigo': '10H01328', 'ruc': '110395150001'},
]

AUTORIDADES_DE_MUESTRA = [
    {'nombres': 'Lissette', 'apellidos': 'Maldonado', 'numero': '1102145830'},
    {'nombres': 'Ricardo', 'apellidos': 'Cevallos', 'numero': '1792138472'},
    {'nombres': 'Israel', 'apellidos': 'López', 'numero': '1103951400'},
    {'nombres': 'Susana', 'apellidos': 'Moreno', 'numero': '1104151234'},
]


class Command(BaseCommand):
    help = 'Crea datos iniciales: roles, usuario administrador, instituciones y autoridades de muestra.'

    def handle(self, *args, **options):
        self._crear_roles()
        admin = self._crear_administrador()
        self._asignar_rol_admin(admin)
        instituciones = self._crear_instituciones()
        self._crear_autoridades(instituciones)
        self._crear_niveles_subniveles()
        self._crear_planificacion_demo(instituciones[0])
        self.stdout.write(self.style.SUCCESS('Datos iniciales cargados correctamente.'))

    def _crear_roles(self):
        for nombre in ROLES:
            Rol.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'requiere_institucion': nombre in ROLES_CON_INSTITUCION,
                },
            )

    def _crear_administrador(self):
        admin, created = Usuario.objects.get_or_create(
            numero_identificacion=ADMIN_DATA['numero_identificacion'],
            defaults={
                'email': ADMIN_DATA['email'],
                'first_name': ADMIN_DATA['first_name'],
                'last_name': ADMIN_DATA['last_name'],
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'password': make_password(ADMIN_DATA['password']),
            },
        )
        if not created:
            admin.set_password(ADMIN_DATA['password'])
            admin.is_staff = True
            admin.is_superuser = True
            admin.is_active = True
            admin.email = ADMIN_DATA['email']
            admin.first_name = ADMIN_DATA['first_name']
            admin.last_name = ADMIN_DATA['last_name']
            admin.save()
        return admin

    def _asignar_rol_admin(self, admin):
        rol_admin = Rol.objects.get(nombre=Rol.ADMINISTRADOR)
        UsuarioRol.objects.get_or_create(
            usuario=admin, rol=rol_admin,
            defaults={'activo': True, 'fecha_inicio': date.today()},
        )

    def _crear_instituciones(self):
        creadas = []
        for data in INSTITUCIONES_SHOWCASE:
            inst, _ = InstitucionEducativa.objects.get_or_create(
                codigo=data['codigo'],
                defaults={'nombre': data['nombre'], 'ruc': data['ruc']},
            )
            creadas.append(inst)
        return creadas

    def _crear_autoridades(self, instituciones):
        rol_autoridad = Rol.objects.get(nombre=Rol.AUTORIDAD_ACADEMICA)
        for i, base in enumerate(AUTORIDADES_DE_MUESTRA):
            usuario, _ = Usuario.objects.get_or_create(
                numero_identificacion=base['numero'],
                defaults={
                    'first_name': base['nombres'],
                    'last_name': base['apellidos'],
                    'is_active': True,
                    'password': make_password('autoridad123'),
                },
            )
            institucion = instituciones[i % len(instituciones)]
            UsuarioRol.objects.get_or_create(
                usuario=usuario, rol=rol_autoridad, institucion=institucion,
                defaults={
                    'activo': True,
                    'fecha_inicio': date.today(),
                },
            )

    def _crear_niveles_subniveles(self):
        nivel_map = {}
        for nivel_data in NIVELES_EDUCATIVOS:
            nivel, _ = EducacionNivel.objects.get_or_create(
                nombre=nivel_data['nombre'],
                defaults={
                    'minutos_periodo': nivel_data['minutos_periodo'],
                    'periodos_minimos_semana': nivel_data['periodos_minimos_semana'],
                },
            )
            nivel_map[nivel.nombre] = nivel
        for sub_data in SUBNIVELES_EDUCATIVOS:
            nivel = nivel_map.get(sub_data['nivel_nombre'])
            if nivel is None:
                continue
            EducacionSubNivel.objects.get_or_create(
                nombre=sub_data['nombre'],
                defaults={
                    'nivel': nivel,
                    'minutos_periodo': sub_data['minutos_periodo'],
                    'periodos_minimos_semana': sub_data['periodos_minimos_semana'],
                },
            )

    def _crear_planificacion_demo(self, institucion):
        nivel_inicial = EducacionNivel.objects.filter(
            nombre='Educación inicial').first()
        nivel_ebasica = EducacionNivel.objects.filter(
            nombre='Educación General Básica').first()
        nivel_bgu = EducacionNivel.objects.filter(
            nombre='Bachillerato General Unificado').first()
        subnivel_prep = EducacionSubNivel.objects.filter(
            nombre='Preparatoria').first()

        plan_vigente, _ = PlanEstudio.objects.get_or_create(
            institucion=institucion, nombre='Bachillerato General Unificado',
            defaults={'estado': PlanEstudio.VIGENTE},
        )
        plan_vigente.estado = PlanEstudio.VIGENTE
        plan_vigente.save()

        plan_basica, _ = PlanEstudio.objects.get_or_create(
            institucion=institucion, nombre='Educación Básica Superior',
            defaults={'estado': PlanEstudio.NO_VIGENTE},
        )

        plan_piloto, _ = PlanEstudio.objects.get_or_create(
            institucion=institucion, nombre='Plan Piloto Internacional',
            defaults={'estado': PlanEstudio.NO_VIGENTE},
        )

        if nivel_inicial:
            grado_inicial, _ = GradoEscolar.objects.get_or_create(
                plan_estudio=plan_vigente, nombre='Inicial uno',
                defaults={'nivel': nivel_inicial, 'orden': 1},
            )
            Asignatura.objects.get_or_create(
                grado_escolar=grado_inicial, nombre='Matemáticas',
                defaults={'periodos_minimos_semana': 3},
            )
            Asignatura.objects.get_or_create(
                grado_escolar=grado_inicial, nombre='Lengua y Literatura',
                defaults={'periodos_minimos_semana': 1},
            )
            Asignatura.objects.get_or_create(
                grado_escolar=grado_inicial, nombre='Inglés',
                defaults={'periodos_minimos_semana': 1},
            )

        if nivel_ebasica and subnivel_prep:
            GradoEscolar.objects.get_or_create(
                plan_estudio=plan_basica, nombre='Primer grado',
                defaults={
                    'nivel': nivel_ebasica, 'subnivel': subnivel_prep,
                    'orden': 2,
                },
            )

        if nivel_bgu:
            GradoEscolar.objects.get_or_create(
                plan_estudio=plan_piloto, nombre='Tercer curso BGU',
                defaults={'nivel': nivel_bgu, 'orden': 3},
            )
