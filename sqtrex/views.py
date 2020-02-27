from django.contrib.contenttypes.models import ContentType
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from sqtrex.serializers import ContentTypeSerializer
from django_filters.rest_framework import DjangoFilterBackend

class ContentTypeList(generics.ListAPIView):
    queryset = ContentType.objects.all()
    serializer_class = ContentTypeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['model']
