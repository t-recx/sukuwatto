import json
from abc import ABC, abstractmethod
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import CustomUser

class AuthTestCaseMixin():
    def authenticate(self, credentials):
        response = self.client.post('/api/token/', credentials)
        token = json.loads(response.content)['access']

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

    def logout(self):
        self.client.credentials()

class UserTestCaseMixin():
    def create_user(self, user):
        email = None

        if 'email' in user:
            email = user['email']

        return CustomUser.objects.create_user(username=user['username'], email=email, password=user['password'])

class CRUDTestCaseMixin(ABC, UserTestCaseMixin, AuthTestCaseMixin):
    def setUp(self):
        self.user1 = { 'username': 'test', 'password': 'test', 'email': 'test@test.org'}
        self.user2 = { 'username': 'test2', 'password': 'test2', 'email': 'test@test.org'}
        self.create_user(self.user1)
        self.create_user(self.user2)

    @abstractmethod
    def get_resource_model(self):
        pass

    @abstractmethod
    def get_resource_endpoint(self):
        pass
   
    @abstractmethod
    def get_resource_data(self):
        pass

    @abstractmethod
    def get_updated_resource_data(self, resource_id):
        pass

    @abstractmethod
    def assert_resource_updated(self):
        pass

    @abstractmethod
    def assert_resource_not_updated(self):
        pass

    def create_resource(self, user, data):
        self.authenticate(user)

        response = self.client.post(self.get_resource_endpoint(), data, format='json')
        return json.loads(response.content)['id']

    def update_resource(self, resource_id, data):
        return self.client.put(f'{self.get_resource_endpoint()}{resource_id}/', data, format='json')

    def test_create_resource_when_user_not_authenticated_should_return_unauthorized(self):
        response = self.client.post(self.get_resource_endpoint(), self.get_resource_data(), format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.get_resource_model().objects.count(), 0)

    def test_create_resource_when_user_authenticated_should_create_record(self):
        self.authenticate(self.user1)

        response = self.client.post(self.get_resource_endpoint(), self.get_resource_data(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.get_resource_model().objects.count(), 1)

    def test_update_resource_when_user_not_authenticated_should_return_unauthorized(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        self.logout()

        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assert_resource_not_updated()

    def test_update_resource_when_user_not_owner_should_return_forbidden(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        self.authenticate(self.user2)

        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assert_resource_not_updated()

    def test_update_resource_when_user_is_owner_should_update_correctly(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        self.logout()
        self.authenticate(self.user1)

        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_resource_updated()

    def test_destroy_resource_when_user_not_authenticated_should_return_unauthorized(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        self.logout()

        response = self.client.delete(f'{self.get_resource_endpoint()}{resource_id}/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.get_resource_model().objects.count(), 1)

    def test_destroy_resource_when_user_is_not_owner_should_return_forbidden(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        self.logout()
        self.authenticate(self.user2)

        response = self.client.delete(f'{self.get_resource_endpoint()}{resource_id}/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.get_resource_model().objects.count(), 1)

    def test_destroy_resource_when_user_is_owner_should_delete_object(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())

        response = self.client.delete(f'{self.get_resource_endpoint()}{resource_id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.get_resource_model().objects.count(), 0)