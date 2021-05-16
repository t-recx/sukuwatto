from rest_framework import permissions
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser

class IsOwnerAndFeatureStateAllowsEdit(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated and (request.user.is_staff or (obj.state == 'o' and obj.user == request.user))

class FeaturePermissionsMixin():
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsAuthenticated]
        elif self.action == 'update' or self.action == 'partial_update':
            permission_classes = [IsOwnerAndFeatureStateAllowsEdit]
        elif self.action == 'destroy':
            permission_classes = [IsOwnerAndFeatureStateAllowsEdit]
        elif self.action == 'list' or self.action == 'retrieve':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]