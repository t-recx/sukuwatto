from django.db.models import Q
from users.models import CustomUser

class Visibility:
    EVERYONE = 'e'
    REGISTERED_USERS = 'r'
    FOLLOWERS = 'f'
    OWN_USER = 'u'

    OPTIONS =  [
        (EVERYONE, 'Everyone'),
        (REGISTERED_USERS, 'Registered users'),
        (FOLLOWERS, 'Followers'),
        (OWN_USER, 'Own user')
    ]

class VisibilityQuerysetMixin():
    def get_queryset_visibility(self, queryset, user):
        if not user or not user.is_authenticated:
            queryset = queryset.filter(visibility=Visibility.EVERYONE)
        else:
            queryset = queryset.exclude(user__blocked_users__id=user.id)

            queryset = queryset.exclude(Q(visibility=Visibility.OWN_USER), ~Q(user=user))

            queryset = queryset.exclude(Q(visibility=Visibility.FOLLOWERS), ~Q(user__followers__id=user.id), ~Q(user=user))

        return queryset

    def get_queryset_visibility_user_model(self, queryset, user):
        if not user or not user.is_authenticated:
            queryset = queryset.filter(visibility=Visibility.EVERYONE)
        else:
            queryset = queryset.exclude(Q(visibility=Visibility.OWN_USER), ~Q(pk=user.pk))

            queryset = queryset.exclude(Q(visibility=Visibility.FOLLOWERS), ~Q(followers__id=user.id), ~Q(pk=user.pk))

        return queryset