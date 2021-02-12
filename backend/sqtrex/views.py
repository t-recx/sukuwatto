from django.contrib.contenttypes.models import ContentType
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from sqtrex.serializers import ContentTypeSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.decorators import api_view

class ContentTypeList(generics.ListAPIView):
    queryset = ContentType.objects.all()
    serializer_class = ContentTypeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['model']
