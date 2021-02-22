import json
from abc import ABC, abstractmethod
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import CustomUser
from sqtrex.visibility import Visibility

class AuthTestCaseMixin():
    def authenticate(self, credentials):
        response = self.client.post('/api/token/', credentials)
        token = json.loads(response.content)['access']

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

    def logout(self):
        self.client.logout()

class UserTestCaseMixin():
    def create_user(self, user, is_staff = False, tier='n'):
        email = None

        if 'email' in user:
            email = user['email']

        return CustomUser.objects.create_user(username=user['username'], email=email, password=user['password'], 
            is_staff = is_staff, tier = tier)

class CRUDTestCaseMixin(ABC, UserTestCaseMixin, AuthTestCaseMixin):
    def setUp(self):
        self.staff_user = { 'username': 'staff', 'password': 'test', 'email': 'test@test.org'}
        self.user1 = { 'username': 'test', 'password': 'test', 'email': 'test1@test.org'}
        self.user2 = { 'username': 'test2', 'password': 'test2', 'email': 'test2@test.org'}
        self.create_user(self.user1)
        self.create_user(self.user2)
        self.create_user(self.staff_user, True)

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

    def delete_resource(self, resource_id):
        return self.client.delete(f'{self.get_resource_endpoint()}{resource_id}/')

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

        response = self.delete_resource(resource_id)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.get_resource_model().objects.count(), 1)

    def test_destroy_resource_when_user_is_not_owner_should_return_forbidden(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        self.logout()
        self.authenticate(self.user2)

        response = self.delete_resource(resource_id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.get_resource_model().objects.count(), 1)

    def test_destroy_resource_when_user_is_owner_should_delete_object(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())

        response = self.delete_resource(resource_id)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.get_resource_model().objects.count(), 0)

class VisibilityTestCaseMixin(CRUDTestCaseMixin):
    @abstractmethod
    def get_resource_data_with_visibility(self, visibility):
        pass

    def follow_user(self, user, followed_user):
        u = CustomUser.objects.get(username=user['username'])
        fu = CustomUser.objects.get(username=followed_user['username'])

        fu.followers.add(u)
        u.following.add(fu)

    def exercise_visibility(self, visibility, anonymous_can_view, follower_can_view, another_user_can_view):
        resource_id = self.create_resource(self.user1, self.get_resource_data_with_visibility(visibility))
        self.logout()

        # anonymous user:
        response = self.client.get(self.get_resource_endpoint())

        self.assertEqual(len(json.loads(response.content)['results']), 1 if anonymous_can_view else 0)

        response = self.client.get(self.get_resource_endpoint() + str(resource_id) + '/')

        self.assertEqual(response.status_code, status.HTTP_200_OK if anonymous_can_view else status.HTTP_404_NOT_FOUND)

        # another user:
        self.authenticate(self.user2)

        response = self.client.get(self.get_resource_endpoint())

        self.assertEqual(len(json.loads(response.content)['results']), 1 if another_user_can_view else 0)

        response = self.client.get(self.get_resource_endpoint() + str(resource_id) + '/')

        self.assertEqual(response.status_code, status.HTTP_200_OK if another_user_can_view else status.HTTP_404_NOT_FOUND)

        self.logout()

        # followed user:
        self.follow_user(self.user2, self.user1)

        self.authenticate(self.user2)

        response = self.client.get(self.get_resource_endpoint())

        self.assertEqual(len(json.loads(response.content)['results']), 1 if follower_can_view else 0)

        response = self.client.get(self.get_resource_endpoint() + str(resource_id) + '/')

        self.assertEqual(response.status_code, status.HTTP_200_OK if follower_can_view else status.HTTP_404_NOT_FOUND)

        self.logout()

        # own user:
        self.authenticate(self.user1)

        response = self.client.get(self.get_resource_endpoint())

        self.assertEqual(len(json.loads(response.content)['results']), 1)

        response = self.client.get(self.get_resource_endpoint() + str(resource_id) + '/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_visibility_own_user(self):
        self.exercise_visibility(Visibility.OWN_USER, False, False, False)

    def test_visibility_everyone(self):
        self.exercise_visibility(Visibility.EVERYONE, True, True, True)

    def test_visibility_registered_users(self):
        self.exercise_visibility(Visibility.REGISTERED_USERS, False, True, True)

    def test_visibility_followers(self):
        self.exercise_visibility(Visibility.FOLLOWERS, False, True, False)