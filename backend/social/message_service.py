from django.contrib.auth import get_user_model
from social.models import Message, LastMessage
from django.utils import timezone

class MessageService:
    def update_read(self, user_id, correspondent_id):
        objs = LastMessage.objects.filter(user__id=user_id, correspondent__id=correspondent_id)

        if len(objs) == 1:
            obj = objs[0]
            obj.unread_count = 0;
            obj.last_message_read = obj.last_message 
            obj.save()

    def create(self, from_user, to_user, message):
        instance = Message.objects.create(from_user=from_user, to_user=to_user,
            message=message, date=timezone.now())

        obj, created = LastMessage.objects.update_or_create(
            user=instance.from_user,
            correspondent=instance.to_user,
            defaults={
                'date': instance.date,
                'last_message': instance,
                'last_read_message': instance,
                'unread_count': 0
            }
        )

        obj, created = LastMessage.objects.update_or_create(
            user=instance.to_user,
            correspondent=instance.from_user,
            defaults={
                'date': instance.date,
                'last_message': instance
            }
        )

        obj.unread_count += 1
        obj.save()

        return instance