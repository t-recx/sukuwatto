import json
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from django.contrib.contenttypes.models import ContentType
from social.models import Post, Comment, UserAction
from sqtrex.tests import CRUDTestCaseMixin, UserTestCaseMixin, AuthTestCaseMixin
from users.models import CustomUser
from social.message_service import MessageService
from django.utils.timezone import now

class PostTestCase(CRUDTestCaseMixin, APITestCase):
    def get_resource_model(self):
        return Post

    def get_resource_endpoint(self):
        return '/api/posts/'
   
    def get_resource_data(self):
        return { 'text': 'initial' }

    def get_updated_resource_data(self, resource_id):
        return { 'id': resource_id, 'text': 'updated' } 

    def assert_resource_updated(self):
        self.assertEqual(Post.objects.first().text, 'updated')

    def assert_resource_not_updated(self):
        self.assertEqual(Post.objects.first().text, 'initial')

class CommentTestCase(CRUDTestCaseMixin, APITestCase):
    def get_resource_model(self):
        return Comment

    def get_resource_endpoint(self):
        return '/api/comments/'
   
    def get_resource_data(self):
        content_type = ContentType.objects.get(model='customuser')
        comment_target = CustomUser.objects.get(username=self.user1['username'])

        return { 'text': 'initial', 
            'comment_target_content_type': content_type.id,
            'comment_target_object_id': comment_target.id}

    def get_updated_resource_data(self, resource_id):
        content_type = ContentType.objects.get(model='customuser')
        comment_target = CustomUser.objects.get(username=self.user1['username'])

        return { 'id': resource_id, 'text': 'updated', 
            'comment_target_content_type': content_type.id,
            'comment_target_object_id': comment_target.id}

    def assert_resource_updated(self):
        self.assertEqual(Comment.objects.first().text, 'updated')

    def assert_resource_not_updated(self):
        self.assertEqual(Comment.objects.first().text, 'initial')

class LikesTestCase(UserTestCaseMixin, AuthTestCaseMixin, APITestCase):
    def setUp(self):
        self.user1 = { 'username': 'test', 'password': 'test', 'email': 'test@test.org'}
        self.user2 = { 'username': 'test2', 'password': 'test2', 'email': 'test@test.org'}
        self.create_user(self.user1)
        self.create_user(self.user2)

        Post.objects.create(text='aaa', date=now(), user=CustomUser.objects.get(username='test'))
        content_type = ContentType.objects.get(model='post')
        like_target = Post.objects.get(text='aaa')

        self.endpoint = '/api/toggle-like/'
        self.data = { 
            'content_type_id': content_type.id,
            'object_id': like_target.id }

        # posting creates a useraction object, so let's delete that one first:
        UserAction.objects.all().delete()

    def toggle_like(self):
        return self.client.post(self.endpoint, self.data, format='json')

    def test_toggle_like_when_user_not_authenticated_should_return_unauthorized(self):
        response = self.toggle_like()

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(UserAction.objects.count(), 0)

    def test_toggle_like_when_user_authenticated_should_create_like_action(self):
        self.authenticate(self.user1)

        response = self.toggle_like()

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(UserAction.objects.count(), 1)

    def test_toggle_like_when_like_already_exists_for_object_and_from_user_should_remove_existing_action(self):
        self.authenticate(self.user1)

        self.toggle_like()
        response = self.toggle_like()

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(UserAction.objects.count(), 0)

    def test_toggle_like_when_like_already_exists_for_object_and_from_user_should_not_remove_other_users_likes(self):
        self.authenticate(self.user1)
        self.toggle_like()

        self.authenticate(self.user2)
        response = self.toggle_like()

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(UserAction.objects.count(), 2)

class MessageTestCase(UserTestCaseMixin, AuthTestCaseMixin, APITestCase):
    def setUp(self):
        self.message_service = MessageService()
        self.user1 = { 'username': 'test', 'password': 'test', 'email': 'test@test.org'}
        self.user2 = { 'username': 'test2', 'password': 'test2', 'email': 'test@test.org'}
        self.user1_instance = self.create_user(self.user1)
        self.user2_instance = self.create_user(self.user2)

        self.message_service.create(self.user1_instance, self.user2_instance, 
            'hello!')

    def test_listing_last_messages_when_user_not_authenticated_should_return_unauthorized(self):
        response = self.client.get('/api/last-messages/')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_listing_last_messages_should_not_bring_back_sensitive_information(self):
        self.authenticate(self.user1)

        response = self.client.get('/api/last-messages/')

        data = json.loads(response.content)
        self.assertTrue(len(data), 1)
        self.assertFalse(any('password' in x['user'] for x in data))
        self.assertFalse(any('email' in x['user'] for x in data))
        self.assertFalse(any('password' in x['correspondent'] for x in data))
        self.assertFalse(any('email' in x['correspondent'] for x in data))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
