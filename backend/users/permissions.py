from rest_framework import permissions
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from sqtrex.visibility import Visibility

def can_see_user(request_user, user):
    if request_user.is_authenticated:
        if user.visibility == Visibility.OWN_USER and user != request_user:
            return False
        elif user.visibility == Visibility.FOLLOWERS and not user == request_user and not user.followers.filter(id=request_user.id):
            return False

        return True
    else:
        return user.visibility == Visibility.EVERYONE

class CanSeeUserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        username = request.query_params.get('username', None)

        user = get_object_or_404(get_user_model(), username=username)

        return can_see_user(request.user, user)

