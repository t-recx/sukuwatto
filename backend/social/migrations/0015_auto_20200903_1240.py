# Generated by Django 3.0.5 on 2020-09-03 12:40

from django.db import migrations

def migrate_from_actstream(apps, schema_editor):
    ContentType = apps.get_model('contenttypes', 'ContentType')
    Action = apps.get_model('actstream', 'Action')
    Follow = apps.get_model('actstream', 'Follow')
    UserAction = apps.get_model('social', 'UserAction')
    CustomUser = apps.get_model('users', 'CustomUser')

    Post = apps.get_model('social', 'Post')
    Comment = apps.get_model('social', 'Comment')
    Workout = apps.get_model('workouts', 'Workout')
    Exercise = apps.get_model('workouts', 'Exercise')
    Plan = apps.get_model('workouts', 'Plan')

    for follow in Follow.objects.all():
        followed_user = CustomUser.objects.get(pk=int(follow.object_id))

        followed_user.followers.add(follow.user)
        follow.user.following.add(followed_user)

    for action in Action.objects.all():
        user_action = UserAction()

        user_action.user = CustomUser.objects.get(pk=int(action.actor_object_id))
        user_action.verb = action.verb
        user_action.description = action.description
        user_action.timestamp = action.timestamp

        if action.target_content_type:
            if action.target_content_type.model == 'post':
                user_action.target_post = Post.objects.get(pk=int(action.target_object_id))
            elif action.target_content_type.model == 'comment':
                user_action.target_comment = Comment.objects.get(pk=int(action.target_object_id))
            elif action.target_content_type.model == 'workout':
                user_action.target_workout = Workout.objects.get(pk=int(action.target_object_id))
            elif action.target_content_type.model == 'exercise':
                user_action.target_exercise = Exercise.objects.get(pk=int(action.target_object_id))
            elif action.target_content_type.model == 'plan':
                user_action.target_plan = Plan.objects.get(pk=int(action.target_object_id))
            elif action.target_content_type.model == 'customuser':
                user_action.target_user = CustomUser.objects.get(pk=int(action.target_object_id))

        if action.action_object_content_type:
            if action.action_object_content_type.model == 'post':
                user_action.action_object_post = Post.objects.get(pk=int(action.action_object_object_id))
            elif action.action_object_content_type.model == 'comment':
                user_action.action_object_comment = Comment.objects.get(pk=int(action.action_object_object_id))
            elif action.action_object_content_type.model == 'workout':
                user_action.action_object_workout = Workout.objects.get(pk=int(action.action_object_object_id))
            elif action.action_object_content_type.model == 'exercise':
                user_action.action_object_exercise = Exercise.objects.get(pk=int(action.action_object_object_id))
            elif action.action_object_content_type.model == 'plan':
                user_action.action_object_plan = Plan.objects.get(pk=int(action.action_object_object_id))
            elif action.action_object_content_type.model == 'customuser':
                user_action.action_object_user = CustomUser.objects.get(pk=int(action.action_object_object_id))

        user_action.save()
        
def rollback_from_actstream(apps, schema_editor):
    ContentType = apps.get_model('contenttypes', 'ContentType')
    Action = apps.get_model('actstream', 'Action')
    Follow = apps.get_model('actstream', 'Follow')
    UserAction = apps.get_model('social', 'UserAction')
    CustomUser = apps.get_model('users', 'CustomUser')

    UserAction.objects.all().delete()
    
    for user in CustomUser.objects.all():
        user.followers.clear()
        user.following.clear()

class Migration(migrations.Migration):

    dependencies = [
        ('social', '0014_auto_20200902_2229'),
        ('users', '0010_auto_20200902_1410'),
    ]

    operations = [
        # migrations.RunPython(migrate_from_actstream, rollback_from_actstream),
    ]
