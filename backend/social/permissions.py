from rest_framework import permissions
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from sqtrex.permissions import IsIntermediateUser
import json

# WARNING: see comments above
class IsIntermediateUserAndStateAllowsEdit(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user.is_authenticated:
            return False
            
        if request.user.is_staff:
            return True
            
        return obj.user == request.user and (obj.target_feature is None or request.user.tier != 'n')

class CommentPermissionsMixin():
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsAuthenticated]
        elif self.action == 'update' or self.action == 'partial_update':
            permission_classes = [IsIntermediateUserAndStateAllowsEdit]
        elif self.action == 'destroy':
            permission_classes = [IsIntermediateUserAndStateAllowsEdit]
        elif self.action == 'list' or self.action == 'retrieve':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]

class ReportPermissionsMixin():
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]