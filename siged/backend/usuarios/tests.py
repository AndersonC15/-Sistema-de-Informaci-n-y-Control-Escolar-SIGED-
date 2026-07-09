from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from usuarios.models import Usuario


class AuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            numero_identificacion='1234567890',
            password='testpass123',
            first_name='Test',
            last_name='User',
            is_active=True,
        )

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'numero_identificacion': '1234567890',
            'password': 'testpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

    def test_login_empty_fields(self):
        response = self.client.post('/api/auth/login/', {
            'numero_identificacion': '',
            'password': '',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_wrong_credentials(self):
        response = self.client.post('/api/auth/login/', {
            'numero_identificacion': '1234567890',
            'password': 'wrongpass',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_inactive_user(self):
        self.user.is_active = False
        self.user.save()
        response = self.client.post('/api/auth/login/', {
            'numero_identificacion': '1234567890',
            'password': 'testpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('inactiva', response.data['error'].lower())

    def test_logout(self):
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.post('/api/auth/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_me_authenticated(self):
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['numero_identificacion'], '1234567890')

    def test_me_unauthenticated(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
