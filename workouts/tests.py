import json
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from workouts.models import Workout
from users.models import CustomUser
from users.tests import UserTestCaseMixin
from sqtrex.tests import AuthTestCaseMixin

class WorkoutTestCase(UserTestCaseMixin, AuthTestCaseMixin, APITestCase):
    def setUp(self):
        self.workout_data = { 'name': 'test', 'start': "2014-01-01T23:28:56.782Z" }
        self.user1 = { 'username': 'test', 'password': 'test', 'email': 'test@test.org'}
        self.user2 = { 'username': 'test2', 'password': 'test2', 'email': 'test@test.org'}
        self.create_user(self.user1)
        self.create_user(self.user2)

    def test_create_workout_when_user_not_authenticated_should_return_unauthorized(self):
        response = self.client.post('/api/workouts/', self.workout_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Workout.objects.count(), 0)

    def test_create_workout_when_user_authenticated_should_create_record(self):
        self.authenticate(self.user1)

        response = self.client.post('/api/workouts/', self.workout_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workout.objects.count(), 1)

    def create_workout(self, user, data):
        self.authenticate(user)

        response = self.client.post('/api/workouts/', data, format='json')
        return json.loads(response.content)['id']

    def test_update_workout_when_user_not_authenticated_should_return_unauthorized(self):
        wid = self.create_workout(self.user1, self.workout_data)
        self.logout()
        response = self.client.put(f'/api/workouts/{wid}/', { 'id': wid, 'name': 'changed', 'start': "2014-01-01T23:28:56.782Z" }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Workout.objects.first().name, self.workout_data['name'])

    def test_update_workout_when_user_not_owner_should_return_forbidden(self):
        wid = self.create_workout(self.user1, self.workout_data)
        self.authenticate(self.user2)
        response = self.client.put(f'/api/workouts/{wid}/', { 'id': wid, 'name': 'changed', 'start': "2014-01-01T23:28:56.782Z" }, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Workout.objects.first().name, self.workout_data['name'])

    def test_update_workout_when_user_is_owner_should_update_correctly(self):
        wid = self.create_workout(self.user1, self.workout_data)
        self.logout()
        self.authenticate(self.user1)
        response = self.client.put(f'/api/workouts/{wid}/', { 'id': wid, 'name': 'changed', 'start': "2014-01-01T23:28:56.782Z" }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Workout.objects.first().name, 'changed')

    def test_destroy_workout_when_user_not_authenticated_should_return_unauthorized(self):
        wid = self.create_workout(self.user1, self.workout_data)
        self.logout()
        response = self.client.delete(f'/api/workouts/{wid}/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Workout.objects.count(), 1)

    def test_destroy_workout_when_user_is_not_owner_should_return_forbidden(self):
        wid = self.create_workout(self.user1, self.workout_data)
        self.logout()
        self.authenticate(self.user2)
        response = self.client.delete(f'/api/workouts/{wid}/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Workout.objects.count(), 1)

    def test_destroy_workout_when_user_is_owner_should_delete_object(self):
        wid = self.create_workout(self.user1, self.workout_data)
        response = self.client.delete(f'/api/workouts/{wid}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Workout.objects.count(), 0)

    def test_get_workouts_should_not_bring_sensitive_information_in_their_user_nested_representation(self):
        self.authenticate(self.user1)
        self.create_workout(self.user1, self.workout_data)

        response = self.client.get(f'/api/workouts/')

        data = json.loads(response.content)['results']

        self.assertFalse(any('password' in x['user'] for x in data))
        self.assertFalse(any('email' in x['user'] for x in data))