from django.contrib.auth.models import AnonymousUser
from rest_framework import viewsets, status
from django_filters.rest_framework import DjangoFilterBackend
from workouts.serializers.plan_serializer import PlanSerializer
from workouts.models import Plan, PlanSession, PlanSessionGroup, PlanSessionGroupExercise, PlanSessionGroupWarmUp, PlanProgressionStrategy, PlanSessionProgressionStrategy, PlanSessionGroupProgressionStrategy
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sqtrex.permissions import StandardPermissionsMixin
from sqtrex.pagination import StandardResultsSetPagination
from rest_framework.generics import ListAPIView
from users.views import CanSeeUserPermission
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.filters import SearchFilter, OrderingFilter, BaseFilterBackend

@api_view(['GET'])
def plan_adopted(request):
    user_id = request.query_params.get('user_id', None)
    plan_id = request.query_params.get('plan_id', None)

    return Response(Plan.objects.filter(Q(id=plan_id), Q(adoption_users__id=user_id)).exists())

class OwnedPlansPaginatedList(ListAPIView):
    pagination_class = StandardResultsSetPagination
    permission_classes = [CanSeeUserPermission]
    filter_backends = [SearchFilter]
    search_fields = ['short_name', 'name', 'description']
    queryset = Plan.objects.all()

    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        username = request.query_params.get('username', None)

        user = get_object_or_404(get_user_model(), username=username)

        queryset = queryset.filter(~Q(adoption_users__id=user.id), Q(user=user)).order_by('-creation')

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = PlanSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = PlanSerializer(queryset, many=True)

        return Response(serializer.data)

class AdoptedPlansPaginatedList(ListAPIView):
    pagination_class = StandardResultsSetPagination
    permission_classes = [CanSeeUserPermission]
    filter_backends = [SearchFilter]
    search_fields = ['short_name', 'name', 'description']
    queryset = Plan.objects.all()

    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        username = request.query_params.get('username', None)

        user = get_object_or_404(get_user_model(), username=username)

        queryset = queryset.filter(adoption_users__id=user.id).order_by('-creation')

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = PlanSerializer(page, many=True)

            return self.get_paginated_response(serializer.data)

        serializer = PlanSerializer(queryset, many=True)

        return Response(serializer.data)

class AdoptedPlansList(ListAPIView):
    # pagination_class = StandardResultsSetPagination
    permission_classes = [CanSeeUserPermission]

    def list(self, request):
        username = request.query_params.get('username', None)

        user = get_object_or_404(get_user_model(), username=username)

        queryset = Plan.objects.filter(adoption_users__id=user.id).order_by('-creation')

        # page = self.paginate_queryset(queryset)

        # if page is not None:
        #     serializer = PlanSerializer(page, many=True)

        #     return self.get_paginated_response(serializer.data)

        serializer = PlanSerializer(queryset, many=True)

        return Response(serializer.data)

class PlanPaginatedList(ListAPIView):
    """
    """
    queryset = Plan.objects.all().order_by('-creation')
    serializer_class = PlanSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['public', 'user__username']
    search_fields = ['short_name', 'name', 'description']
    pagination_class = StandardResultsSetPagination

class PlanViewSet(StandardPermissionsMixin, viewsets.ModelViewSet):
    """
    """
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['public', 'user__username']

@api_view(['POST'])
def leave_plan(request, pk):
    try:
        plan = Plan.objects.get(pk=pk)
    except Plan.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    user = None
    if request and hasattr(request, "user"):
        user = request.user

    if user is None or isinstance(user, AnonymousUser):
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    plan.adoption_users.remove(user)

    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def adopt_plan(request, pk):
    try:
        plan = Plan.objects.get(pk=pk)
    except Plan.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        user = None
        if request and hasattr(request, "user"):
            user = request.user

        if user is None or isinstance(user, AnonymousUser):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        adopted_plan = None

        if plan.user == user and plan.parent_plan_id is not None and not plan.adoption_users.exists():
            # this plan has been cloned before by this user, but has no adopted users
            # so instead of cloning again, we'll just re-use it
            adopted_plan = plan
        else:
            adopted_plan = clone_plan(plan, pk, user)

        adopted_plan.adoption_users.add(user)

        serializer = PlanSerializer(adopted_plan)

        return Response(serializer.data)

def clone_plan(plan, pk, user):
    plan.pk = None
    plan.id = None
    plan.parent_plan_id = pk
    plan.user = user
    plan.public = False
    plan.save()

    plan_progressions = PlanProgressionStrategy.objects.filter(plan__id=pk)
    for plan_progression in plan_progressions:
        plan_progression.pk = None
        plan_progression.id = None
        plan_progression.plan = plan
        plan_progression.save()

    sessions = PlanSession.objects.filter(plan__id=pk)
    for session in sessions:
        plan_session_progressions = PlanSessionProgressionStrategy.objects.filter(plan_session__id=session.id)
        groups = PlanSessionGroup.objects.filter(plan_session__id=session.id)

        session.pk = None
        session.id = None
        session.plan = plan
        session.save()

        for plan_session_progression in plan_session_progressions:
            plan_session_progression.pk = None
            plan_session_progression.id = None
            plan_session_progression.plan_session = session
            plan_session_progression.save()

        for group in groups:
            plan_session_group_progressions = PlanSessionGroupProgressionStrategy.objects.filter(plan_session_group__id=group.id)

            exercises = PlanSessionGroupExercise.objects.filter(plan_session_group__id=group.id)
            warmups = PlanSessionGroupWarmUp.objects.filter(plan_session_group__id=group.id)

            group.pk = None
            group.id = None
            group.plan_session = session
            group.save()

            for exercise in exercises:
                exercise.pk = None
                exercise.id = None
                exercise.plan_session_group = group
                exercise.save()

            for warmup in warmups:
                warmup.pk = None
                warmup.id = None
                warmup.plan_session_group = group
                warmup.save()

            for plan_session_group_progression in plan_session_group_progressions:
                plan_session_group_progression.pk = None
                plan_session_group_progression.id = None
                plan_session_group_progression.plan_session_group = group
                plan_session_group_progression.save()

    cloned_plan = Plan.objects.get(pk=plan.pk)

    return cloned_plan