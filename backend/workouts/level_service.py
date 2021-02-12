import datetime
from decimal import Decimal
from workouts.models import Workout, WorkoutGroup, WorkoutSet, WorkoutWarmUp, SkillExercise, UserSkill, Unit, Exercise, WeeklyLeaderboardPosition, YearlyLeaderboardPosition, MonthlyLeaderboardPosition, AllTimeLeaderboardPosition
from django.db.models import Max, F, Q
from django.db.models.expressions import Window
from django.contrib.auth import get_user_model
from math import floor
from workouts.rank_service import RankService

class LevelService():
    def get_level_experience(self, level):
        # When changing here, don't forget to update 
        # the same method on the level.service.ts
        exponent = 1.5
        base_experience = 1000

        if level <= 1:
            return base_experience

        return floor(base_experience * (level ** exponent))

    def convert(self, value, from_unit, to_unit):
        if from_unit == to_unit:
            return value

        if from_unit == Unit.POUND and to_unit == Unit.KILOGRAM:
            return value * Decimal(0.45359237)

        if from_unit == Unit.KILOGRAM and to_unit == Unit.POUND:
            return value * Decimal(2.20462262)

        if from_unit == Unit.KCAL and to_unit == Unit.KJOULES:
            return value * Decimal(4.18400)

        if from_unit == Unit.KJOULES and to_unit == Unit.KCAL:
            return value * Decimal(0.239005736)

        raise ValueError

    def get_experience_strength(self, reps, weight_kg):
        return floor((reps * weight_kg) / 5)

    def get_experience_cardio(self, calories_kcal):
        return floor(calories_kcal * Decimal(2.5))

    # When changing here, don't forget to update 
    # the same method on the level.service.ts
    def get_experience(self, activity):
        if not activity.done:
            return 0

        if activity.exercise.exercise_type == Exercise.STRENGTH:
            weight = 0

            if activity.exercise.modality == Exercise.CALISTHENICS:
                weight = 70 # we'll use the average european weight
            elif activity.weight is None or activity.weight <= 0:
                return 0
            else:
                weight = activity.weight

            return self.get_experience_strength(activity.number_of_repetitions, self.convert(weight, activity.weight_unit, Unit.KILOGRAM))
        else:
            return self.get_experience_cardio(self.convert(activity.calories, activity.energy_unit, Unit.KCAL))

    def create_experience_workout(self, workout):
        # When changing here, don't forget to update 
        # the same method on the level.service.ts
        experience = 0

        groups = WorkoutGroup.objects.filter(workout=workout)
        for group in groups:
            sets = WorkoutSet.objects.filter(workout_group=group)
            for workout_set in sets:
                experience += self.create_experience_from_activity(workout_set, workout.user)

            warmups = WorkoutWarmUp.objects.filter(workout_group=group)
            for workout_warmup in warmups:
                experience += self.create_experience_from_activity(workout_warmup, workout.user)

        workout.experience = experience
        workout.in_leaderboard = True
        workout.save()

        workout.user.experience += experience
        self.recalculate_level(workout.user)
        self.set_class(workout.user)

        workout.user.save()

        self.create_experience_on_leaderboards(workout)

    def create_experience_on_leaderboards(self, workout):
        rank_service = RankService()

        position = AllTimeLeaderboardPosition.objects.filter(user=workout.user).first()

        if position is None:
            position = AllTimeLeaderboardPosition.objects.create(user=workout.user, experience=workout.experience)
        else:
            position.experience += workout.experience
            position.save()

        rank_service.rank_records(AllTimeLeaderboardPosition, position)

        if self.in_current_year(workout.start):
            position = YearlyLeaderboardPosition.objects.filter(user=workout.user).first()

            if position is None:
                position = YearlyLeaderboardPosition.objects.create(user=workout.user, experience=workout.experience)
            else:
                position.experience += workout.experience
                position.save()

            rank_service.rank_records(YearlyLeaderboardPosition, position)

            if self.in_current_month(workout.start):
                position = MonthlyLeaderboardPosition.objects.filter(user=workout.user).first()

                if position is None:
                    position = MonthlyLeaderboardPosition.objects.create(user=workout.user, experience=workout.experience)
                else:
                    position.experience += workout.experience
                    position.save()

                rank_service.rank_records(MonthlyLeaderboardPosition, position)

                if self.in_current_week(workout.start):
                    position = WeeklyLeaderboardPosition.objects.filter(user=workout.user).first()

                    if position is None:
                        position = WeeklyLeaderboardPosition.objects.create(user=workout.user, experience=workout.experience)
                    else:
                        position.experience += workout.experience
                        position.save()

                    rank_service.rank_records(WeeklyLeaderboardPosition, position)

    def set_class(self, user):
        skills = UserSkill.objects.filter(user=user).order_by('-experience')

        user.primary_class_computed = None
        user.secondary_class_computed = None

        nskills = len(skills)

        if nskills > 0:
            primary_skill = skills.first()
            user.primary_class_computed = primary_skill.skill.class_name

            if nskills > 1:
                secondary_skill = skills.filter(~Q(id=primary_skill.id)).first()

                if secondary_skill.experience > primary_skill.experience / 2:
                    user.secondary_class_computed = secondary_skill.skill.class_name

        if not user.custom_class:
            user.primary_class = user.primary_class_computed
            user.secondary_class = user.secondary_class_computed

    def recalculate_level(self, instance):
        while self.get_level_experience(instance.level) > instance.experience:
            instance.level -= 1

            if instance.level <= 1:
                return

        while self.get_level_experience(instance.level + 1) <= instance.experience:
            instance.level += 1

    def get_skill_exercise(self, exercise, number_of_repetitions, distance, distance_unit, speed, speed_unit):
        queryset = SkillExercise.objects.filter(exercise=exercise)

        if not queryset.exists():
            queryset = SkillExercise.objects.filter(exercise__isnull=True)

            if exercise.modality is not None:
                specific = queryset.filter(Q(modality=exercise.modality))
                
                if specific.exists():
                    queryset = specific
                else:
                    queryset = queryset.filter(modality__isnull=True)
            else:
                queryset = queryset.filter(modality__isnull=True)

            if exercise.mechanics is not None:
                specific = queryset.filter(Q(mechanics=exercise.mechanics))
                
                if specific.exists():
                    queryset = specific
                else:
                    queryset = queryset.filter(mechanics__isnull=True)
            else:
                queryset = queryset.filter(mechanics__isnull=True)

            if exercise.exercise_type is not None:
                specific = queryset.filter(Q(exercise_type=exercise.exercise_type))
                
                if specific.exists():
                    queryset = specific
                else:
                    queryset = queryset.filter(exercise_type__isnull=True)
            else:
                queryset = queryset.filter(exercise_type__isnull=True)

        if not queryset.exists():
            return None

        if number_of_repetitions is not None:
            specific = queryset.filter(Q(parameter_type=SkillExercise.PARAMETER_TYPE_REPETITIONS),
                Q(parameter_from__lte=number_of_repetitions),
                Q(parameter_to__gte=number_of_repetitions)
                )

            if specific.exists():
                return specific.first()

            specific = queryset.filter(Q(parameter_type=SkillExercise.PARAMETER_TYPE_REPETITIONS),
                Q(parameter_from__lte=number_of_repetitions),
                Q(parameter_to__isnull=True)
                )

            if specific.exists():
                return specific.first()

            specific = queryset.filter(Q(parameter_type=SkillExercise.PARAMETER_TYPE_REPETITIONS),
                Q(parameter_from__isnull=True),
                Q(parameter_to__gte=number_of_repetitions)
                )

            if specific.exists():
                return specific.first()

            specific = queryset.filter(
                Q(parameter_from__isnull=True),
                Q(parameter_to__isnull=True)
                )

            if specific.exists():
                return specific.first()

        if distance is not None:
            specific = queryset.filter(Q(parameter_type=SkillExercise.PARAMETER_TYPE_DISTANCE),
                Q(unit=distance_unit),
                Q(parameter_from__lte=distance),
                Q(parameter_to__gte=distance)
                )

            if specific.exists():
                return specific.first()

            specific = queryset.filter(Q(parameter_type=SkillExercise.PARAMETER_TYPE_DISTANCE),
                Q(unit=distance_unit),
                Q(parameter_from__lte=distance),
                Q(parameter_to__isnull=True)
                )

            if specific.exists():
                return specific.first()

            specific = queryset.filter(Q(parameter_type=SkillExercise.PARAMETER_TYPE_DISTANCE),
                Q(unit=distance_unit),
                Q(parameter_from__isnull=True),
                Q(parameter_to__gte=distance)
                )

            if specific.exists():
                return specific.first()

        if speed is not None:
            specific = queryset.filter(Q(parameter_type=SkillExercise.PARAMETER_TYPE_SPEED),
                Q(unit=speed_unit),
                Q(parameter_from__lte=speed),
                Q(parameter_to__gte=speed)
                )

            if specific.exists():
                return specific.first()

            specific = queryset.filter(Q(parameter_type=SkillExercise.PARAMETER_TYPE_SPEED),
                Q(unit=speed_unit),
                Q(parameter_from__lte=speed),
                Q(parameter_to__isnull=True)
                )

            if specific.exists():
                return specific.first()

            specific = queryset.filter(Q(parameter_type=SkillExercise.PARAMETER_TYPE_SPEED),
                Q(unit=speed_unit),
                Q(parameter_from__isnull=True),
                Q(parameter_to__gte=speed)
                )

            if specific.exists():
                return specific.first()

        if len(queryset) > 1:
            return None

        return queryset.first()

    def remove_experience_from_activity(self, activity, user):
        skill_exercise = self.get_skill_exercise(activity.exercise, activity.number_of_repetitions, activity.distance, activity.distance_unit, activity.speed, activity.speed_unit)

        if skill_exercise is not None:        
            user_skill = UserSkill.objects.filter(user=user, skill=skill_exercise.skill).first()

            if user_skill is not None:
                user_skill.experience -= activity.experience

                self.recalculate_level(user_skill)

                user_skill.save()

    def in_current_week(self, date):
        return self.in_current_year(date) and self.in_current_month(date) and datetime.date.today().isocalendar()[1] == date.isocalendar()[1]

    def in_current_month(self, date):
        return self.in_current_year(date) and date.month == datetime.date.today().month

    def in_current_year(self, date):
        return date.year == datetime.date.today().year

    def remove_experience_from_leaderboards(self, workout):
        if not workout.in_leaderboard:
            return

        rank_service = RankService()
        
        position = AllTimeLeaderboardPosition.objects.filter(user=workout.user).first()

        if position is not None:
            position.experience -= workout.experience

            position.save()

            rank_service.rank_records(AllTimeLeaderboardPosition, position)

        if self.in_current_year(workout.start):
            position = YearlyLeaderboardPosition.objects.filter(user=workout.user).first()

            if position is not None:
                position.experience -= workout.experience

                position.save()

                rank_service.rank_records(YearlyLeaderboardPosition, position)

            if self.in_current_month(workout.start):
                position = MonthlyLeaderboardPosition.objects.filter(user=workout.user).first()

                if position is not None:
                    position.experience -= workout.experience

                    position.save()

                    rank_service.rank_records(MonthlyLeaderboardPosition, position)

                if self.in_current_week(workout.start):
                    position = WeeklyLeaderboardPosition.objects.filter(user=workout.user).first()

                    if position is not None:
                        position.experience -= workout.experience

                        position.save()

                        rank_service.rank_records(WeeklyLeaderboardPosition, position)

    def remove_experience_workout(self, workout):
        workout.user.experience -= workout.experience
        
        self.recalculate_level(workout.user)

        self.remove_experience_from_leaderboards(workout)

        groups = WorkoutGroup.objects.filter(workout=workout)
        for group in groups:
            sets = WorkoutSet.objects.filter(workout_group=group)
            for workout_set in sets:
                self.remove_experience_from_activity(workout_set, workout.user)

            warmups = WorkoutWarmUp.objects.filter(workout_group=group)
            for workout_warmup in warmups:
                self.remove_experience_from_activity(workout_warmup, workout.user)

        self.set_class(workout.user)
        workout.user.save()

    def create_experience_from_activity(self, activity, user):
        activity.experience = self.get_experience(activity)

        skill_exercise = self.get_skill_exercise(activity.exercise, activity.number_of_repetitions, activity.distance, activity.distance_unit, activity.speed, activity.speed_unit)

        if skill_exercise is not None:        
            user_skill = UserSkill.objects.filter(user=user, skill=skill_exercise.skill).first()

            if user_skill is None:
                user_skill = UserSkill.objects.create(user=user, skill=skill_exercise.skill)

            user_skill.experience += activity.experience

            self.recalculate_level(user_skill)

            user_skill.save()

        activity.save()

        return activity.experience
