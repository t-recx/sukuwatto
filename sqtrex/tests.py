import json
from rest_framework.test import APITestCase
from users.models import CustomUser

class AuthTestCaseMixin():
    def authenticate(self, credentials):
        response = self.client.post('/api/token/', credentials)
        token = json.loads(response.content)['access']

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

    def logout(self):
        self.client.credentials()