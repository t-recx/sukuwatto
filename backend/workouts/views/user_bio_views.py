from workouts.serializers.serializers import UserBioDataSerializer
from workouts.models import UserBioData
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sqtrex.pagination import StandardResultsSetPagination
from rest_framework import viewsets, generics
from sqtrex.permissions import StandardPermissionsMixin
from rest_framework.filters import OrderingFilter 
from rest_framework.generics import ListAPIView
from sqtrex.visibility import VisibilityQuerysetMixin
from django.db.models import Q
from django.shortcuts import get_object_or_404

class UserBioDataList(VisibilityQuerysetMixin, ListAPIView):
    """
    API endpoint that allows users bio data to be viewed or edited.
    """
    queryset = UserBioData.objects.all()
    serializer_class = UserBioDataSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {'user__username':['exact'], 'date':['gte', 'lte']}

    def get_queryset(self):
        return self.get_queryset_visibility(UserBioData.objects.all().order_by('-date'), self.request.user)

    def get_object(self):
        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )

        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}

        queryset = self.get_queryset_visibility(UserBioData.objects.filter(**filter_kwargs), self.request.user)

        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj


class UserBioDataViewSet(StandardPermissionsMixin, VisibilityQuerysetMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows users bio data to be viewed or edited.
    """
    queryset = UserBioData.objects.all()
    serializer_class = UserBioDataSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['user__username']
    pagination_class = StandardResultsSetPagination
    ordering_fields = ['date', 'weight','height',
        'body_fat_percentage', 'water_weight_percentage', 'muscle_mass_percentage',
        'bone_mass_weight']

    def get_queryset(self):
        return self.get_queryset_visibility(UserBioData.objects.all().order_by('-date'), self.request.user)

    def get_object(self):
        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )

        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}

        queryset = self.get_queryset_visibility(UserBioData.objects.filter(**filter_kwargs), self.request.user)

        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj

@api_view(['GET'])
def get_last_user_bio_data(request):
    visibility_provider = VisibilityQuerysetMixin()

    queryset = UserBioData.objects.all()

    username = request.query_params.get('username', None)

    if username is not None:
        queryset = queryset.filter(user__username=username)

    date_lte = request.query_params.get('date_lte', None)

    if date_lte is not None:
        queryset = queryset.filter(date__lte=date_lte)

    queryset = visibility_provider.get_queryset_visibility(queryset.order_by('-date'), request.user)

    queryset = queryset.first()

    serializer = UserBioDataSerializer(queryset)

    return Response(serializer.data)

@api_view(['GET'])
def get_last_user_body_composition(request):
    visibility_provider = VisibilityQuerysetMixin()

    queryset = UserBioData.objects.filter(Q(body_fat_percentage__isnull=False) | 
            Q(muscle_mass_percentage__isnull=False) |
            Q(water_weight_percentage__isnull=False))

    username = request.query_params.get('username', None)

    if username is not None:
        queryset = queryset.filter(user__username=username)

    date_lte = request.query_params.get('date_lte', None)

    if date_lte is not None:
        queryset = queryset.filter(date__lte=date_lte)

    queryset = visibility_provider.get_queryset_visibility(queryset.order_by('-date'), request.user)

    queryset = queryset.first()

    serializer = UserBioDataSerializer(queryset)

    return Response(serializer.data)