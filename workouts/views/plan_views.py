from django.contrib.auth.models import AnonymousUser
from rest_framework import viewsets, status
from django_filters.rest_framework import DjangoFilterBackend
from workouts.serializers.plan_serializer import PlanSerializer
from workouts.models import Plan, PlanSession, PlanSessionGroup, PlanSessionGroupExercise, PlanSessionGroupWarmUp, PlanProgressionStrategy, PlanSessionProgressionStrategy, PlanSessionGroupProgressionStrategy
from rest_framework.decorators import api_view
from rest_framework.response import Response

class PlanViewSet(viewsets.ModelViewSet):
    """
    """
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['public', 'owner__username']

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
            return Response(status=status.HTTP_403_FORBIDDEN)

        plan.pk = None
        plan.id = None
        plan.parent_plan_id = pk
        plan.owner = user
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

        updated_plan = Plan.objects.get(pk=plan.pk)

        serializer = PlanSerializer(updated_plan)

        return Response(serializer.data)