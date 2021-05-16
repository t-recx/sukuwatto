from rest_framework import permissions
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from sqtrex.permissions import IsOwnerOrReadOnly
import json

class CommentPermissionsMixin():
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsAuthenticated]
        elif self.action == 'update' or self.action == 'partial_update':
            permission_classes = [IsOwnerOrReadOnly]
        elif self.action == 'destroy':
            permission_classes = [IsOwnerOrReadOnly]
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