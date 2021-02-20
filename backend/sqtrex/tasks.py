import json
import uuid
import os
from zipfile import ZipFile
from huey import crontab
from huey.contrib.djhuey import db_periodic_task, db_task
from django.contrib.auth import get_user_model
from email.mime.text import MIMEText
from django.core import serializers
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.core.mail import EmailMultiAlternatives
from users.serializers import UserSerializer, UserMinimalSerializer
from users.models import UserDataRequest
from development.models import Feature
from development.serializers import FeatureSerializer
from social.models import Post, Comment, Message
from social.serializers import PostSerializer, CommentSerializer, MessageSerializer
from django.db.models import Q
from workouts.models import UserBioData, Exercise, Plan, UserSkill, Workout, WeeklyLeaderboardPosition, MonthlyLeaderboardPosition, YearlyLeaderboardPosition, AllTimeLeaderboardPosition
from workouts.serializers.serializers import UserBioDataSerializer, ExerciseSerializer, UserSkillSerializer, WeeklyLeaderboardSerializer, MonthlyLeaderboardSerializer, YearlyLeaderboardSerializer, AllTimeLeaderboardSerializer
from workouts.serializers.workout_serializer import WorkoutSerializer  
from workouts.serializers.plan_serializer import PlanSerializer
from django.conf import settings

@db_task()
def email_user_data(data_request_id):
    request = UserDataRequest.objects.get(pk=data_request_id)

    try:
        user = request.user

        host = settings.HOST

        # send an e-mail to the user
        context = {
            'username': user.username
        }

        # render email text
        email_html_message = render_to_string('user_personal_data.html', context)
        email_plaintext_message = render_to_string('user_personal_data.txt', context)

        msg = EmailMultiAlternatives(
            # title:
            "Your personal data in {title}".format(title=settings.WEBAPP_NAME),
            # message:
            email_plaintext_message,
            # from:
            "noreply@" + host,
            # to:
            [user.email]
        )

        msg.attach_alternative(email_html_message, "text/html")

        request_id = str(uuid.uuid4())

        data = dict()

        data['user'] = UserSerializer(user).data

        data['followers'] = UserMinimalSerializer(user.followers, many=True).data

        data['following'] = UserMinimalSerializer(user.following, many=True).data

        features = Feature.objects.filter(user=user)
        data['features'] = FeatureSerializer(features, many=True).data

        posts = Post.objects.filter(user=user)
        data['posts'] = PostSerializer(posts, many=True).data

        comments = Comment.objects.filter(user=user)
        data['comments'] = CommentSerializer(comments, many=True).data

        messages = Message.objects.filter(Q(from_user=user) | Q(to_user=user))
        data['messages'] = MessageSerializer(messages, many=True).data

        plans = Plan.objects.filter(user=user)
        data['plans'] = PlanSerializer(plans, many=True).data

        userskills = UserSkill.objects.filter(user=user)
        data['userskills'] = UserSkillSerializer(userskills, many=True).data

        workouts = Workout.objects.filter(user=user)
        data['workouts'] = WorkoutSerializer(workouts, many=True).data

        exercises = Exercise.objects.filter(user=user)
        data['exercises'] = ExerciseSerializer(exercises, many=True).data

        weeklyleaderboards = WeeklyLeaderboardPosition.objects.filter(user=user)
        data['weeklyleaderboards'] = WeeklyLeaderboardSerializer(weeklyleaderboards, many=True).data

        monthlyleaderboards = MonthlyLeaderboardPosition.objects.filter(user=user)
        data['monthlyleaderboards'] = MonthlyLeaderboardSerializer(monthlyleaderboards, many=True).data

        yearlyleaderboards = YearlyLeaderboardPosition.objects.filter(user=user)
        data['yearlyleaderboards'] = YearlyLeaderboardSerializer(yearlyleaderboards, many=True).data

        allTimeleaderboards = AllTimeLeaderboardPosition.objects.filter(user=user)
        data['alltimeleaderboards'] = AllTimeLeaderboardSerializer(allTimeleaderboards, many=True).data

        attach_file(msg, request_id, data)
    
        msg.send()
    except:
        request.delete()

        raise

    request.delete()

def attach_file(msg, request_id, data):
    filename_json = write_file(request_id, json.dumps(data))

    filename = request_id + '.zip'

    with ZipFile(filename, 'w') as zipped:
        zipped.write(filename_json)

    msg.attach_file(filename)

    os.remove(filename_json)
    os.remove(filename)

def write_file(request_id, s):
    filename = request_id + '.json'

    text_file = open(filename, 'w')
    text_file.write(s)
    text_file.close() 

    return filename