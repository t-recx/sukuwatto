from django.db.models import Q
from actstream.models import Follow
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

            queryset_followers = queryset.filter(Q(visibility=Visibility.FOLLOWERS), ~Q(user=user))

            # todo: this will not be very performant because I'll need to load the queryset_followers into memory
            # and then check if I'm following each of the users there:
            # suggestions include using a distinct on the column (but that only works on postgres, 
            # so I'd need to change the test to use a postgres db too)
            # or making the query myself by hand:
            not_followed_users = [user__id for user__id in queryset_followers.order_by('user__id').values_list('user__id', flat=True).distinct() if not Follow.objects.is_following(user, CustomUser.objects.get(pk=user__id))]
            # --

            queryset = queryset.exclude(Q(visibility=Visibility.FOLLOWERS), Q(user__id__in=not_followed_users))

        return queryset
