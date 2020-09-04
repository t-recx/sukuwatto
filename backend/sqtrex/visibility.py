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
            queryset = queryset.exclude(Q(visibility=Visibility.OWN_USER), ~Q(user=user))

            queryset = queryset.exclude(Q(visibility=Visibility.FOLLOWERS), ~Q(user__followers__id=user.id), ~Q(user=user))

        return queryset
