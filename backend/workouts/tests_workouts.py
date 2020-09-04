import json
from rest_framework.test import APITestCase
from workouts.models import Workout
from sqtrex.tests import CRUDTestCaseMixin, VisibilityTestCaseMixin
from users.models import CustomUser
from social.models import UserAction
from django.contrib.contenttypes.models import ContentType

class WorkoutTestCase(VisibilityTestCaseMixin, APITestCase):
    def get_resource_model(self):
        return Workout

    def get_resource_endpoint(self):
        return '/api/workouts/'
   
    def get_resource_data(self):
        return { 'name': 'initial', 'start': "2014-01-01T23:28:56.782Z" }
   
    def get_resource_data_with_visibility(self, visibility):
        return { 'name': 'initial', 'start': "2014-01-01T23:28:56.782Z", 'visibility': visibility }

    def get_updated_resource_data(self, resource_id):
        return { 'id': resource_id, 'name': 'changed', 'start': "2014-01-01T23:28:56.782Z" } 

    def assert_resource_updated(self):
        self.assertEqual(Workout.objects.first().name, 'changed')

    def assert_resource_not_updated(self):
        self.assertEqual(Workout.objects.first().name, 'initial')
    
    def test_get_workouts_should_not_bring_sensitive_information_in_their_user_nested_representation(self):
        self.authenticate(self.user1)
        self.create_resource(self.user1, self.get_resource_data())

        response = self.client.get(self.get_resource_endpoint())

        data = json.loads(response.content)['results']

        self.assertFalse(any('password' in x['user'] for x in data))
        self.assertFalse(any('email' in x['user'] for x in data))

    def test_saving_workout_with_status_finished_should_create_action(self):
        self.authenticate(self.user1)
        uid = CustomUser.objects.get(username=self.user1['username']).id
        data = self.get_resource_data()
        data['status'] = Workout.FINISHED
        wid = self.create_resource(self.user1, data)
        ctid = ContentType.objects.get(model='workout').id

        self.assertEqual(UserAction.objects.count(), 1) 