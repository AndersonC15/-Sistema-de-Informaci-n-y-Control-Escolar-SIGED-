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

    def __str__(self):
        nombre_completo = f'{self.first_name} {self.last_name}'.strip()
        return nombre_completo or self.numero_identificacion
