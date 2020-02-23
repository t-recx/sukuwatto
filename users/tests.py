import json
from django.db.models import Q
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from workouts.models import Workout
from users.models import CustomUser
from sqtrex.tests import AuthTestCaseMixin
from django.contrib.contenttypes.models import ContentType

class UserTestCaseMixin():
    def create_user(self, user):
        email = None

        if 'email' in user:
            email = user['email']

        CustomUser.objects.create_user(username=user['username'], email=email, password=user['password'])

class UserTestCase(AuthTestCaseMixin, UserTestCaseMixin, APITestCase):
    def setUp(self):
        self.user1 = { 'username': 'test', 'password': 'test', 'email': 'test@test.org'}
        self.user2 = { 'username': 'test2', 'password': 'test2', 'email': 'test2@test2.org'}
        self.create_user(self.user1)
        self.create_user(self.user2)

    def test_listing_data_should_not_bring_back_sensitive_information(self):
        response = self.client.get('/api/users/')

        data = json.loads(response.content)
        self.assertFalse(any('password' in x for x in data))
        self.assertFalse(any('email' in x for x in data))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_email_when_user_not_authenticated_should_return_nothing(self):
        response = self.client.get('/api/user-email/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_email_when_user_authenticated_should_return_own_email(self):
        self.authenticate(self.user1)

        response = self.client.get('/api/user-email/')

        data = json.loads(response.content)
        self.assertEqual(data, self.user1['email'])

    def test_create_should_allow_creation_to_anyone(self):
        response = self.client.post('/api/users/', { 'username': 'new', 'email': 'new@new.com', 'password': 'new' }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.count(), 3)
        self.assertNotEqual(CustomUser.objects.get(Q(username='new'), Q(email='new@new.com')), None)

    def test_update_user_when_user_not_object_should_return_forbidden(self):
        self.authenticate(self.user1)
        other_uid = CustomUser.objects.get(username=self.user2['username']).id

        response = self.client.put(f'/api/users/{other_uid}/', { 'id': other_uid, 'email': 'changed@changed.org' }, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(CustomUser.objects.get(pk=other_uid).email, self.user2['email'])

    def test_update_user_when_user_same_as_updated_object_should_update(self):
        self.authenticate(self.user1)
        uid = CustomUser.objects.get(username=self.user1['username']).id

        response = self.client.put(f'/api/users/{uid}/', { 'id': uid, 
            'username': self.user1['username'], 
            'email': 'changed@changed.org' }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CustomUser.objects.get(pk=uid).email, 'changed@changed.org')

    def test_destroy_user_when_user_not_authenticated_should_return_unauthorized(self):
        uid = CustomUser.objects.get(username=self.user1['username']).id

        response = self.client.delete(f'/api/users/{uid}/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(CustomUser.objects.count(), 2)

    def test_destroy_user_when_user_not_same_as_object_should_return_forbidden(self):
        self.authenticate(self.user2)
        uid = CustomUser.objects.get(username=self.user1['username']).id

        response = self.client.delete(f'/api/users/{uid}/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(CustomUser.objects.count(), 2)

    def test_destroy_user_when_user_same_as_object_should_delete(self):
        self.authenticate(self.user1)
        uid = CustomUser.objects.get(username=self.user1['username']).id

        response = self.client.delete(f'/api/users/{uid}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CustomUser.objects.count(), 1)

    def test_get_followers_should_not_return_sensitive_information_in_user_nested_representation(self):
        ctid = ContentType.objects.get(model='customuser').id
        uid = CustomUser.objects.get(username=self.user2['username']).id
        self.authenticate(self.user1)

        self.client.post('/api/follow/', {
            'content_type_id': ctid,
            'object_id': uid})
        response = self.client.get(f'/api/followers/?username={self.user2["username"]}')
        data = json.loads(response.content)

        self.assertFalse(any('password' in x for x in data))
        self.assertFalse(any('email' in x for x in data))