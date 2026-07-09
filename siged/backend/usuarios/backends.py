from django.contrib.auth.backends import ModelBackend

from usuarios.models import Usuario


class UsuarioBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = Usuario.objects.get(numero_identificacion=username)
        except Usuario.DoesNotExist:
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def user_can_authenticate(self, user):
        return True
