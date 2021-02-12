import json
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from workouts.models import UserBioData
from sqtrex.tests import CRUDTestCaseMixin

class UserBioDataTestCase(CRUDTestCaseMixin, APITestCase):
    def get_resource_model(self):
        return UserBioData

    def get_resource_endpoint(self):
        return '/api/user-bio-datas/'
   
    def get_resource_data(self):
        return { 'notes': 'initial', 'weight': 50, 'date': "2014-01-01T23:28:56.782Z" }

    def get_updated_resource_data(self, resource_id):
        return { 'id': resource_id, 'notes': 'updated', 'weight': 100, 'date': "2014-01-01T23:28:56.782Z" } 

    def assert_resource_updated(self):
        self.assertEqual(UserBioData.objects.first().notes, 'updated')
        self.assertEqual(UserBioData.objects.first().weight, 100)

    def assert_resource_not_updated(self):
        self.assertEqual(UserBioData.objects.first().notes, 'initial')
        self.assertEqual(UserBioData.objects.first().weight, 50)
    
    def test_create_resource_when_existing_record_with_same_date_should_delete_older_record(self):
        first_id = self.create_resource(self.user1, {'weight': 1, 'date': "2014-01-01T23:28:56.782Z" })
        another_user_first_id = self.create_resource(self.user2, {'weight': 1, 'date': "2014-01-01T23:28:56.782Z" })

        second_id = self.create_resource(self.user1, {'weight': 1, 'date': "2014-01-01T23:28:56.782Z" })

        self.assertEqual(UserBioData.objects.count(), 2)
        UserBioData.objects.get(pk=another_user_first_id)
        UserBioData.objects.get(pk=second_id)
    
    def test_update_resource_when_existing_record_with_same_date_should_delete_older_record(self):
        first_id = self.create_resource(self.user1, {'weight': 1, 'date': "2014-01-01T23:28:56.782Z" })
        another_user_first_id = self.create_resource(self.user2, {'weight': 1, 'date': "2014-01-01T23:28:56.782Z" })
        second_id = self.create_resource(self.user1, {'weight': 1, 'date': "2015-01-01T23:28:56.782Z" })

        response = self.update_resource(second_id, {'weight': 1, 'date': "2014-01-01T23:28:56.782Z" })

        self.assertEqual(UserBioData.objects.count(), 2)
        UserBioData.objects.get(pk=another_user_first_id)
        UserBioData.objects.get(pk=second_id)

    def test_get_last_user_bio_data_should_return_correct_results(self):
        url = '/api/user-bio-data-last/'

        one = self.create_resource(self.user1, {'weight': 1, 'date': "2014-01-01 00:00" })
        two = self.create_resource(self.user1, {'weight': 2, 'date': "2016-01-01 00:00" })
        three = self.create_resource(self.user1, {'weight': 3, 'date': "2018-01-01 00:00" })
        four = self.create_resource(self.user2, {'weight': 4, 'date': "2014-01-01 00:00" })
        five = self.create_resource(self.user2, {'weight': 5, 'date': "2016-01-01 00:00" })
        six = self.create_resource(self.user2, {'weight': 6, 'date': "2018-01-01 00:00" })

        response = self.client.get(f'{url}?username={self.user1["username"]}&date_lte=''2017-01-01T23:28:56.782Z''')

        data = json.loads(response.content)

        self.assertEqual(data['id'], two)

        response = self.client.get(f'{url}?username={self.user2["username"]}&date_lte=''2020-01-01T21:21:21.782Z''')

        data = json.loads(response.content)

        self.assertEqual(data['id'], six)

        response = self.client.get(f'{url}?username=nonexistent&date_lte=''2020-01-01T21:21:21.782Z''')

        data = json.loads(response.content)

        self.assertEqual(data['date'], None)