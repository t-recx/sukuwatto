from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from development.models import Feature, Release
from development.serializers import FeatureSerializer, ReleaseSerializer
from rest_framework import viewsets
from rest_framework import generics, status, mixins
from datetime import datetime
from development.permissions import FeaturePermissionsMixin
from sqtrex.pagination import StandardResultsSetPagination
from sqtrex.permissions import StandardPermissionsMixin, AdminCreationOnlyPermissionsMixin
from django.shortcuts import render
from rest_framework.filters import SearchFilter, OrderingFilter, BaseFilterBackend
from rest_framework.permissions import IsAdminUser

class FeatureViewSet(FeaturePermissionsMixin, viewsets.ModelViewSet):
    """
    """
    queryset = Feature.objects.all().order_by('-likes')
    serializer_class = FeatureSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend]
    filterset_fields = ['state']
    search_fields = ['title', 'text']
    pagination_class = StandardResultsSetPagination

class ReleaseViewSet(AdminCreationOnlyPermissionsMixin, viewsets.ModelViewSet):
    """
    """
    queryset = Release.objects.all().order_by('-date')
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['state']
    serializer_class = ReleaseSerializer
    pagination_class = StandardResultsSetPagination

@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_feature(request):
    feature_id = request.data.get('id', None)
        
    feature = Feature.objects.get(pk=feature_id)

    if feature.state == 'c':
        feature.state = 'o' 
    elif feature.state == 'o':
        feature.state = 'c' 

    feature.save()

    return Response(feature.state)