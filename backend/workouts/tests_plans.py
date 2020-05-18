import json
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from workouts.models import Plan
from sqtrex.tests import CRUDTestCaseMixin

class PlanTestCase(CRUDTestCaseMixin, APITestCase):
    def get_resource_model(self):
        return Plan

    def get_resource_endpoint(self):
        return '/api/plans/'
   
    def get_resource_data(self):
        return { 'short_name': 'initial', 'name': 'test plan' }

    def get_updated_resource_data(self, resource_id):
        return { 'id': resource_id, 'short_name': 'updated', 'name': 'altered plan' }

    def assert_resource_updated(self):
        self.assertEqual(Plan.objects.first().short_name, 'updated')

    def assert_resource_not_updated(self):
        self.assertEqual(Plan.objects.first().short_name, 'initial')