import json
from django.db.models import Q
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from users.models import CustomUser
from sqtrex.tests import AuthTestCaseMixin, UserTestCaseMixin
from django.contrib.contenttypes.models import ContentType
from django.test import override_settings

@override_settings(DRF_RECAPTCHA_TESTING=True)
class UserTestCase(AuthTestCaseMixin, UserTestCaseMixin, APITestCase):
    def setUp(self):
        self.user1 = { 'username': 'test', 'password': 'test', 'email': 'test@test.org'}
        self.user2 = { 'username': 'test2', 'password': 'test2', 'email': 'test2@test2.org'}
        self.create_user(self.user1)
        self.create_user(self.user2)

    def test_change_password_when_old_password_not_correct_should_return_bad_request(self):
        self.authenticate(self.user1)

        response = self.client.post('/api/user-change-password/', { 'old_password': 'wrong', 'new_password': '43928409328fdshrewui2309'})

        self.assertEqual(response.data, ['Wrong password specified'])
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_when_new_password_does_not_validate_should_return_bad_request(self):
        self.authenticate(self.user1)

        response = self.client.post('/api/user-change-password/', { 'old_password': self.user1['password'], 'new_password': '0'})

        self.assertEqual(response.data, ['This password is too short. It must contain at least 8 characters.', 'This password is too common.', 'This password is entirely numeric.'])
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_should_change_password(self):
        new_password = '94382fdhs90342fdhjew'
        self.authenticate(self.user1)

        response = self.client.post('/api/user-change-password/', { 'old_password': self.user1['password'], 'new_password': new_password})

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(CustomUser.objects.get(username=self.user1['username']).check_password(new_password))

    def test_listing_data_should_not_bring_back_sensitive_information(self):
        self.authenticate(self.user1)

        response = self.client.get(f'/api/users-search/?page=1&page_size=10')

        data = json.loads(response.content)
        self.assertFalse(any('password' in x for x in data['results']))
        self.assertFalse(any('email' in x for x in data['results']))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_should_not_bring_back_sensitive_information(self):
        response = self.client.get(f'/api/get-user/?username={self.user1["username"]}')

        data = json.loads(response.content)
        if 'password' in data:
            self.fail('password present erroneously')
        if 'email' in data:
            self.fail('email present erroneously')
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
        response = self.client.post('/api/sign-up/', { 'username': 'new', 'email': 'new@new.com', 'password': 'new9834098432', 'system': 'm', 'recaptcha': 'test' }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.count(), 3)
        self.assertNotEqual(CustomUser.objects.get(Q(username='new'), Q(email='new@new.com')), None)

    def test_create_should_ignore_is_staff(self):
        response = self.client.post('/api/sign-up/', { 'is_staff': 'true', 'username': 'new', 'email': 'new@new.com', 'password': 'new9834098432', 'system': 'm', 'recaptcha': 'test' }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CustomUser.objects.count(), 3)
        self.assertNotEqual(CustomUser.objects.get(Q(username='new'), Q(email='new@new.com'), Q(is_staff=False)), None)

    def test_create_should_not_allow_short_passwords(self):
        response = self.client.post('/api/sign-up/', { 'password': 's@AAt', 'username': 'new', 'email': 'new@new.com', 'system': 'm', 'recaptcha': 'test' }, format='json')

        self.assertContains(response, 
            'This password is too short. It must contain at least 8 characters.'
            , status_code=400)

    def test_create_should_not_allow_common_passwords(self):
        response = self.client.post('/api/sign-up/', { 'password': 'pineapple', 'username': 'new', 'email': 'new@new.com', 'system': 'm', 'recaptcha': 'test' }, format='json')

        self.assertContains(response, 
            'This password is too common.'
            , status_code=400)

    def test_create_should_not_allow_passwords_with_elements_of_the_user_data(self):
        response = self.client.post('/api/sign-up/', { 'password': 'ghost02193', 'username': 'ghost02193', 'email': 'new@new.com', 'system': 'm', 'recaptcha': 'test' }, format='json')

        self.assertContains(response, 
            'The password is too similar to the username.'
            , status_code=400)

    def test_create_should_not_allow_exclusively_numeric_passwords(self):
        response = self.client.post('/api/sign-up/', { 'password': '2493284098324', 'username': 'new', 'email': 'new@new.com', 'system': 'm', 'recaptcha': 'test' }, format='json')

        self.assertContains(response, 
            'This password is entirely numeric.'
            , status_code=400)

    def test_create_should_not_allow_percentage_signs_on_passwords(self):
        response = self.client.post('/api/sign-up/', { 'password': "2fdksiREfd@%%adf%eo", 'username': 'new', 'email': 'new@new.com', 'system': 'm', 'recaptcha': 'test' }, format='json')

        self.assertContains(response, 
            'This password contains an illegal character: %.'
            , status_code=400)

    def test_update_user_when_user_not_object_should_return_forbidden(self):
        self.authenticate(self.user1)
        other_uid = CustomUser.objects.get(username=self.user2['username']).id

        response = self.client.put(f'/api/users/{other_uid}/', { 'id': other_uid, 'email': 'changed@changed.org', 'system': 'm' }, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(CustomUser.objects.get(pk=other_uid).email, self.user2['email'])

    def test_update_user_when_user_same_as_updated_object_should_update(self):
        self.authenticate(self.user1)
        uid = CustomUser.objects.get(username=self.user1['username']).id

        response = self.client.put(f'/api/users/{uid}/', { 'id': uid, 
            'username': self.user1['username'], 
            'email': 'changed@changed.org', 'system': 'm' }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CustomUser.objects.get(pk=uid).email, 'changed@changed.org')

    def test_update_user_should_ignore_is_staff(self):
        self.authenticate(self.user1)
        uid = CustomUser.objects.get(username=self.user1['username']).id

        response = self.client.put(f'/api/users/{uid}/', { 'id': uid, 
            'username': self.user1['username'], 
            'is_staff': 'true',
            'email': 'changed@changed.org', 'system': 'm' }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CustomUser.objects.get(pk=uid).email, 'changed@changed.org')
        self.assertEqual(CustomUser.objects.get(pk=uid).is_staff, False)

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