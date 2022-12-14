from rest_framework.test import APITestCase
from rest_framework import status
from workouts.models import Exercise, PlanSessionGroupExercise, PlanSessionGroupWarmUp, WorkoutSet, WorkoutWarmUp, PlanProgressionStrategy, WorkingParameter, Workout, Plan
from sqtrex.tests import CRUDTestCaseMixin
from django.db.models.deletion import ProtectedError

class ExerciseTestCase(CRUDTestCaseMixin, APITestCase):
    def get_resource_model(self):
        return Exercise

    def get_resource_endpoint(self):
        return '/api/exercises/'
   
    def get_resource_data(self):
        return { 'short_name':'short', 'name': 'initial', "exercise_type":"s" }

    def get_updated_resource_data(self, resource_id):
        return { 'id': resource_id, 'short_name':'short', 'name': 'changed', "exercise_type":"s" } 

    def assert_resource_updated(self):
        self.assertEqual(Exercise.objects.first().name, 'changed')

    def assert_resource_not_updated(self):
        self.assertEqual(Exercise.objects.first().name, 'initial')

    def create_plan(self, exid):
        self.client.post('/api/plans/', 
            {"sessions":[{"groups":[{"exercises":[{"exercise": {"id": exid, "short_name":"short", "name":"initial", "exercise_type":"s"},"order":1,"number_of_sets":1,"repetition_type":"a","working_weight_percentage":100}],"warmups":[{"order":1,"exercise":{"id": exid, "short_name":"short", "name":"initial", "exercise_type":"s"},"number_of_sets":1,"repetition_type":"a","working_weight_percentage":100}],"progressions":[],"short_name":"short", "name":"g","order":1}],"progressions":[],"short_name":"short", "name":"s"}],"progressions":[{"progression_type":"e", "parameter_type":"w","exercise":{"id":exid,"short_name":"short", "name":"initial", "exercise_type":"s"},"percentage_increase":100,"validations":{}}],"short_name":"short", "name":"n","description":"d"}
            , format='json')

    def test_updating_exercise_when_user_is_null_should_return_forbidden(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        resource = Exercise.objects.get(pk=resource_id)
        resource.user = None
        resource.save()

        self.authenticate(self.user1)
        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assert_resource_not_updated()

    def test_deleting_exercise_when_user_is_null_should_return_forbidden(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        resource = Exercise.objects.get(pk=resource_id)
        resource.user = None
        resource.save()

        self.authenticate(self.user1)
        response = self.delete_resource(resource_id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.get_resource_model().objects.count(), 1)

    def test_updating_exercise_when_authenticated_as_staff_and_when_user_is_null_should_update(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        resource = Exercise.objects.get(pk=resource_id)
        resource.user = None
        resource.save()

        self.authenticate(self.staff_user)
        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_resource_updated()

    def test_deleting_exercise_when_authenticated_as_staff_and_when_user_is_null_should_return_forbidden(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        resource = Exercise.objects.get(pk=resource_id)
        resource.user = None
        resource.save()

        self.authenticate(self.staff_user)
        response = self.delete_resource(resource_id)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.get_resource_model().objects.count(), 0)

    def test_updating_exercise_when_it_is_being_used_in_a_plan_owned_by_exercise_creator_should_update(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        self.create_plan(resource_id)

        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_resource_updated()

    def test_updating_exercise_when_it_is_being_used_in_a_plan_not_owned_by_exercise_creator_should_not_update(self):
        resource_id = self.create_resource(self.user1, self.get_resource_data())
        self.authenticate(self.user2)
        self.create_plan(resource_id)
        self.logout()

        self.authenticate(self.user1)
        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assert_resource_not_updated()

    def test_deleting_exercise_when_it_is_being_used_in_plans_should_not_delete(self):
        exid = self.create_resource(self.user1, self.get_resource_data())

        self.create_plan(exid)

        try:
            self.delete_resource(exid)
        except Exception as inst:
            self.assertEqual(type(inst), ProtectedError)

        self.assertEqual(Plan.objects.count(), 1)
        self.assertEqual(PlanSessionGroupExercise.objects.count(), 1)
        self.assertEqual(PlanSessionGroupWarmUp.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 1)

    def test_deleting_exercise_when_it_is_being_used_in_workouts_should_not_delete(self):
        exid = self.create_resource(self.user1, self.get_resource_data())

        self.client.post('/api/workouts/', 
            {
                "groups":[
                    {"sets":[
                        {"exercise":{"id":exid, "short_name":"short", "name":"n", "exercise_type":"s"},"order":1,"repetition_type":"a"}],
                     "warmups":[
                         {"exercise":{"id":exid, "short_name":"short", "name":"n", "exercise_type":"s"},"order":1,"weight":1,"repetition_type":"a"}],
                         "short_name":"short", "name":"g"}],
                "working_parameters":[
                    {"exercise":{"id": exid, "short_name":"short", "name":"initial", "exercise_type":"s"},"parameter_value":3, "parameter_type": "w", "previous_parameter_value":1}],
                "status":"p","start":"2020-03-02T19:25:53.753Z","short_name":"short", "name":"n"}, format='json')

        try:
            self.delete_resource(exid)
        except Exception as inst:
            self.assertEqual(type(inst), ProtectedError)

        self.assertEqual(Workout.objects.count(), 1)
        self.assertEqual(WorkoutSet.objects.count(), 1)
        self.assertEqual(WorkingParameter.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 1)

