from django.contrib.auth import get_user_model
from social.models import Message, LastMessage
from django.utils import timezone
from django.db.models import Q

class MessageService:
    def update_read(self, user_id, correspondent_id):
        objs = LastMessage.objects.filter(user__id=user_id, correspondent__id=correspondent_id)

        if len(objs) == 1:
            obj = objs[0]
            obj.unread_count = 0;
            obj.last_message_read = obj.last_message 
            obj.save()

    def delete(self, user, uuid):
        deleted_message = Message.objects.get(Q(uuid=uuid),Q(from_user=user))

        messages = Message.objects.filter(
            Q(from_user=deleted_message.from_user)|Q(from_user=deleted_message.to_user)).filter(
                Q(to_user=deleted_message.from_user) | Q(to_user=deleted_message.to_user)).order_by('-date')

        last_message = LastMessage.objects.filter(Q(user=deleted_message.to_user), Q(correspondent=deleted_message.from_user)).first()

        if last_message is not None and last_message.unread_count > 0:
            if last_message.unread_count > messages.filter(id__gt=deleted_message.id).count():
                last_message.unread_count -= 1

                last_message.save()

        deleted_message.delete()

        if messages.exists():
            instance = messages.first()

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
        else:
            LastMessage.objects.filter(Q(user=deleted_message.from_user),Q(correspondent=deleted_message.to_user)).delete()
            LastMessage.objects.filter(Q(correspondent=deleted_message.from_user),Q(user=deleted_message.to_user)).delete()

    def update(self, from_user, to_user, message, uuid):
        instance = Message.objects.get(Q(uuid=uuid),Q(from_user=from_user),Q(to_user=to_user))

        if instance is not None:
            instance.message = message
            instance.edited_date = timezone.now()

            instance.save()

    def create(self, from_user, to_user, message, uuid):
        instance = Message.objects.create(from_user=from_user, to_user=to_user,
            message=message, uuid=uuid, date=timezone.now())

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