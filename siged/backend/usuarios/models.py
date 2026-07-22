from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UsuarioManager(BaseUserManager):
    def create_user(self, numero_identificacion, password=None, **extra_fields):
        if not numero_identificacion:
            raise ValueError('El número de identificación es obligatorio')
        user = self.model(numero_identificacion=numero_identificacion, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, numero_identificacion, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(numero_identificacion, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    numero_identificacion = models.CharField(
        max_length=20, unique=True, verbose_name='número de identificación'
    )
    email = models.EmailField(blank=True, null=True, verbose_name='correo electrónico')
    first_name = models.CharField(max_length=150, blank=True, verbose_name='nombres')
    last_name = models.CharField(max_length=150, blank=True, verbose_name='apellidos')
    is_active = models.BooleanField(default=True, verbose_name='activo')
    is_staff = models.BooleanField(default=False, verbose_name='staff')
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name='fecha de registro')

    objects = UsuarioManager()

    USERNAME_FIELD = 'numero_identificacion'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'
        ordering = ['first_name', 'last_name']

    def __str__(self):
        nombre_completo = f'{self.first_name} {self.last_name}'.strip()
        return nombre_completo or self.numero_identificacion

    def get_roles_activos(self):
        """Devuelve los nombres de roles activos asignados al usuario."""
        return list(
            self.usuario_rol_instances.filter(activo=True).values_list(
                'rol__nombre', flat=True
            )
        )


class Rol(models.Model):
    ADMINISTRADOR = 'ADMINISTRADOR'
    AUTORIDAD_ACADEMICA = 'AUTORIDAD_ACADEMICA'
    DOCENTE = 'DOCENTE'
    SECRETARIA = 'SECRETARIA'
    ESTUDIANTE = 'ESTUDIANTE'
    DECE = 'DECE'

    NOMBRE_CHOICES = [
        (ADMINISTRADOR, 'Administrador'),
        (AUTORIDAD_ACADEMICA, 'Autoridad académica'),
        (DOCENTE, 'Docente'),
        (SECRETARIA, 'Secretaria'),
        (ESTUDIANTE, 'Estudiante'),
        (DECE, 'DECE'),
    ]

    nombre = models.CharField(
        max_length=50, choices=NOMBRE_CHOICES, unique=True,
        verbose_name='nombre del rol',
    )
    requiere_institucion = models.BooleanField(
        default=False, verbose_name='requiere institución',
    )

    class Meta:
        verbose_name = 'rol'
        verbose_name_plural = 'roles'
        ordering = ['nombre']

    def __str__(self):
        return self.get_nombre_display()


class InstitucionEducativa(models.Model):
    nombre = models.CharField(max_length=200, verbose_name='nombre')
    codigo = models.CharField(
        max_length=20, unique=True, verbose_name='código',
    )
    ruc = models.CharField(
        max_length=20, unique=True, verbose_name='ruc',
    )

    class Meta:
        verbose_name = 'institución educativa'
        verbose_name_plural = 'instituciones educativas'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class UsuarioRol(models.Model):
    usuario = models.ForeignKey(
        Usuario, on_delete=models.CASCADE,
        related_name='usuario_rol_instances', verbose_name='usuario',
    )
    rol = models.ForeignKey(
        Rol, on_delete=models.PROTECT,
        related_name='usuario_rol_instances', verbose_name='rol',
    )
    institucion = models.ForeignKey(
        InstitucionEducativa, on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='autoridades', verbose_name='institución educativa',
    )
    activo = models.BooleanField(default=True, verbose_name='activo')
    fecha_inicio = models.DateField(verbose_name='fecha de inicio')
    fecha_fin = models.DateField(
        null=True, blank=True, verbose_name='fecha de fin',
    )

    class Meta:
        verbose_name = 'asignación de rol'
        verbose_name_plural = 'asignaciones de rol'
        ordering = ['-fecha_inicio']

    def __str__(self):
        institucion_txt = f' ({self.institucion})' if self.institucion else ''
        return f'{self.usuario} - {self.rol}{institucion_txt}'

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.rol_id is not None and self.rol.requiere_institucion and not self.institucion_id:
            raise ValidationError(
                {'institucion': 'El rol seleccionado requiere una institución.'}
            )
