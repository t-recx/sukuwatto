from rest_framework import permissions

# WARNING: There's a bug in django when you use OR |
# with a custom permission that only implements has_object_permission
# It will basically not work if that's the case
# Checkout this: https://github.com/encode/django-rest-framework/issues/7117
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.user == request.user

# WARNING: see comments above
class IsUserOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj == request.user