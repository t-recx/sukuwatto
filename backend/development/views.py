from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from development.models import Feature
from development.serializers import FeatureSerializer
from rest_framework import viewsets
from rest_framework import generics, status, mixins
from datetime import datetime
from sqtrex.pagination import StandardResultsSetPagination
from sqtrex.permissions import StandardPermissionsMixin
from django.shortcuts import render
from rest_framework.filters import SearchFilter, OrderingFilter, BaseFilterBackend

class FeatureViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    """
    """
    queryset = Feature.objects.all().order_by('-likes')
    serializer_class = FeatureSerializer
    filter_backends = [SearchFilter]
    # filter_backends = [DjangoFilterBackend]
    # filterset_fields = ['user__username']
    search_fields = ['title', 'text']
    pagination_class = StandardResultsSetPagination
