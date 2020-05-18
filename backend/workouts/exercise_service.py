from workouts.models import Exercise, PlanSessionGroupExercise, PlanSessionGroupWarmUp, WorkoutSet, WorkoutWarmUp, WorkingWeight

class ExerciseService():
    def in_use_on_other_users_resources(self, exid, user):
        if PlanSessionGroupExercise.objects.filter(exercise__id=exid).exclude(plan_session_group__plan_session__plan__user=user).exists():
            return True

        if PlanSessionGroupWarmUp.objects.filter(exercise__id=exid).exclude(plan_session_group__plan_session__plan__user=user).exists():
            return True

        if WorkingWeight.objects.filter(exercise__id=exid).exclude(workout__user=user).exists():
            return True

        if WorkoutSet.objects.filter(exercise__id=exid).exclude(workout_group__workout__user=user).exists():
            return True

        if WorkoutWarmUp.objects.filter(exercise__id=exid).exclude(workout_group__workout__user=user).exists():
            return True

        return False

    def in_use(self, exid):
        if PlanSessionGroupExercise.objects.filter(exercise__id=exid).exists():
            return True

        if PlanSessionGroupWarmUp.objects.filter(exercise__id=exid).exists():
            return True

        if WorkingWeight.objects.filter(exercise__id=exid).exists():
            return True

        if WorkoutSet.objects.filter(exercise__id=exid).exists():
            return True

        if WorkoutWarmUp.objects.filter(exercise__id=exid).exists():
            return True

        return False