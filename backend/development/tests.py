import json
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from development.models import Feature, Release
from sqtrex.tests import CRUDTestCaseMixin, AuthTestCaseMixin, UserTestCaseMixin

class FeatureTestCase(CRUDTestCaseMixin, APITestCase):
    def setUp(self):
        self.staff_user = { 'username': 'staff', 'password': 'test', 'email': 'test@test.org'}
        self.user1 = { 'username': 'test', 'password': 'test', 'email': 'test@test.org'}
        self.user2 = { 'username': 'test2', 'password': 'test2', 'email': 'test@test.org'}
        self.user_novice = { 'username': 'novice', 'password': 'novice', 'email': 'test@test.org'}
        self.create_user(self.user1, tier='a')
        self.create_user(self.user2, tier='a')
        self.create_user(self.user_novice, tier='n')
        self.create_user(self.staff_user, True)

    def get_resource_model(self):
        return Feature

    def get_resource_endpoint(self):
        return '/api/features/'
   
    def get_resource_data(self):
        return { 'title': 'initial', 'text': 'test feature' }

    def get_updated_resource_data(self, resource_id):
        return { 'id': resource_id, 'title': 'updated', 'text': 'altered feature' }

    def assert_resource_updated(self):
        self.assertEqual(Feature.objects.first().title, 'updated')

    def assert_resource_not_updated(self):
        self.assertEqual(Feature.objects.first().title, 'initial')

    def test_create_resource_when_user_not_advanced_should_return_unauthorized(self):
        self.authenticate(self.user_novice)

        response = self.client.post(self.get_resource_endpoint(), self.get_resource_data(), format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.get_resource_model().objects.count(), 0)

    def test_update_resource_when_state_not_open_should_return_unauthorized(self):
        self.authenticate(self.user1)

        response = self.client.post(self.get_resource_endpoint(), self.get_resource_data(), format='json')

        resource_id = json.loads(response.content)['id']

        resource = Feature.objects.get(pk=resource_id)
        
        resource.state = 'c'
        resource.save()

        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_resource_when_state_not_open_should_return_unauthorized(self):
        self.authenticate(self.user1)

        response = self.client.post(self.get_resource_endpoint(), self.get_resource_data(), format='json')

        resource_id = json.loads(response.content)['id']

        resource = Feature.objects.get(pk=resource_id)
        
        resource.state = 'd'
        resource.save()

        response = self.delete_resource(resource_id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class ReleaseTestCase(AuthTestCaseMixin, UserTestCaseMixin, APITestCase):
    def setUp(self):
        self.staff_user = { 'username': 'staff', 'password': 'test', 'email': 'test@test.org'}
        self.regular_user = { 'username': 'novice', 'password': 'novice', 'email': 'test@test.org'}
        self.create_user(self.staff_user, True)
        self.create_user(self.regular_user)

    def get_resource_model(self):
        return Release

    def get_resource_endpoint(self):
        return '/api/releases/'
   
    def get_resource_data(self):
        return { 'version': 'initial', 'description': 'test release' }

    def get_updated_resource_data(self, resource_id):
        return { 'id': resource_id, 'version': 'updated', 'description': 'altered release' }

    def assert_resource_updated(self):
        self.assertEqual(Release.objects.first().version, 'updated')

    def assert_resource_not_updated(self):
        self.assertEqual(Release.objects.first().version, 'initial')

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
        self.authenticate(self.staff_user)

        response = self.client.post(self.get_resource_endpoint(), self.get_resource_data(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.get_resource_model().objects.count(), 1)

    def test_update_resource_when_user_not_authenticated_should_return_unauthorized(self):
        resource_id = self.create_resource(self.staff_user, self.get_resource_data())
        self.logout()

        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assert_resource_not_updated()

    def test_create_resource_when_user_not_staff_should_return_unauthorized(self):
        self.authenticate(self.regular_user)

        response = self.client.post(self.get_resource_endpoint(), self.get_resource_data(), format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.get_resource_model().objects.count(), 0)

    def test_update_resource_when_user_not_staff_should_return_forbidden(self):
        resource_id = self.create_resource(self.staff_user, self.get_resource_data())
        self.authenticate(self.regular_user)

        response = self.update_resource(resource_id, self.get_updated_resource_data(resource_id))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assert_resource_not_updated()

    def test_destroy_resource_when_user_not_authenticated_should_return_unauthorized(self):
        resource_id = self.create_resource(self.staff_user, self.get_resource_data())
        self.logout()

        response = self.delete_resource(resource_id)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.get_resource_model().objects.count(), 1)

    def test_destroy_resource_when_user_is_not_staff_should_return_forbidden(self):
        resource_id = self.create_resource(self.staff_user, self.get_resource_data())
        self.logout()
        self.authenticate(self.regular_user)

        response = self.delete_resource(resource_id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.get_resource_model().objects.count(), 1)

    def test_destroy_resource_when_user_is_staff_should_delete_object(self):
        resource_id = self.create_resource(self.staff_user, self.get_resource_data())

        response = self.delete_resource(resource_id)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.get_resource_model().objects.count(), 0)

    def test_associating_features_with_release_should_change_features_state(self):
        self.authenticate(self.staff_user)
        response = self.client.post('/api/features/', { 'title': 'initial', 'text': 'test feature' })

        feature_id = json.loads(response.content)['id']

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'o')

        response = self.client.post('/api/releases/', { 'version': 'initial', 'description': 'test release', 'features': [{'id': feature_id, 'text': 'xsfds', 'title': 'gfdgf'}] }, format='json')

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'p')

    def test_removing_feature_from_release_should_reopen_feature(self):
        self.authenticate(self.staff_user)
        response = self.client.post('/api/features/', { 'title': 'initial', 'text': 'test feature' })

        feature_id = json.loads(response.content)['id']

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'o')

        response = self.client.post('/api/releases/', { 'version': 'initial', 'description': 'test release', 'features': [{'id': feature_id, 'text': 'xsfds', 'title': 'gfdgf'}] }, format='json')

        release_id = json.loads(response.content)['id']

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'p')

        response = self.client.put(f'{self.get_resource_endpoint()}{release_id}/', { 'id': release_id, 'version': 'initial', 'description': 'test release', 'features': [] }, format='json')

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'o')

    def test_closing_release_should_close_associated_feature(self):
        self.authenticate(self.staff_user)
        response = self.client.post('/api/features/', { 'title': 'initial', 'text': 'test feature' })

        feature_id = json.loads(response.content)['id']

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'o')

        response = self.client.post('/api/releases/', { 'version': 'initial', 'description': 'test release', 'features': [{'id': feature_id, 'text': 'xsfds', 'title': 'gfdgf'}] }, format='json')

        release_id = json.loads(response.content)['id']

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'p')

        response = self.client.put(f'{self.get_resource_endpoint()}{release_id}/', { 'id': release_id, 'state': 'd', 'version': 'initial', 'description': 'test release', 'features': [{'id': feature_id, 'text': 'xsfds', 'title': 'gfdgf'}] }, format='json')

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'd')

    def test_deleting_release_with_associated_feature_should_reopen_feature(self):
        self.authenticate(self.staff_user)
        response = self.client.post('/api/features/', { 'title': 'initial', 'text': 'test feature' })

        feature_id = json.loads(response.content)['id']

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'o')

        response = self.client.post('/api/releases/', { 'version': 'initial', 'description': 'test release', 'features': [{'id': feature_id, 'text': 'xsfds', 'title': 'gfdgf'}] }, format='json')

        release_id = json.loads(response.content)['id']

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'p')

        self.delete_resource(release_id)

        feature = Feature.objects.get(pk=feature_id)
        self.assertEqual(feature.state, 'o')



    
