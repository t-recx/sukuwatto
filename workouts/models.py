# TODO: add 2 new models for progression strategies on session and on group
# to ease serializing?
from django.db import models
from django.contrib.auth import get_user_model

class Unit(models.Model):
    METRIC = 'm'
    IMPERIAL = 'i'
    SYSTEMS = [
        (METRIC, 'Metric'),
        (IMPERIAL, 'Imperial'),
    ]

    name = models.CharField(max_length=200)
    abbreviation = models.CharField(max_length=200)
    system = models.CharField(max_length=1, null=True, choices=SYSTEMS)

class UnitConversion(models.Model):
    from_unit = models.ForeignKey(Unit, related_name='from_unit', on_delete=models.CASCADE)
    to_unit = models.ForeignKey(Unit, related_name='to_unit', on_delete=models.CASCADE)
    ratio = models.DecimalField(max_digits=12, decimal_places=9)

class Exercise(models.Model):
    COMPOUND = 'c'
    ISOLATED = 'i'
    MECHANICS_CHOICES = [
        (COMPOUND, 'Compound'),
        (ISOLATED, 'Isolated'),
    ]

    PULL = 'p'
    PUSH = 'h'
    STATIC = 's'
    FORCES = [
        (PULL, 'Pull'),
        (PUSH, 'Push'),
        (STATIC, 'Static'),
    ]

    FREE_WEIGHTS = 'f'
    CABLE = 'c'
    MACHINE = 'm'
    MODALITIES = [
        (FREE_WEIGHTS, 'Free weights'),
        (CABLE, 'Cable'),
        (MACHINE, 'Machine'),
    ]

    UPPER = 'u'
    LOWER = 'l'
    CORE = 'c'
    SECTIONS = [
        (UPPER, 'Upper'),
        (LOWER, 'Lower'),
        (CORE, 'Core'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(null=True)
    mechanics = models.CharField(max_length=1, null=True, choices=MECHANICS_CHOICES)
    force = models.CharField(max_length=1, null=True, choices=FORCES)
    modality = models.CharField(max_length=1, null=True, choices=MODALITIES)
    section = models.CharField(max_length=1, null=True, choices=SECTIONS)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.name

class Plan(models.Model):
    # Example: PPL, SS, SL
    short_name = models.CharField(max_length=200, help_text='Enter the workout plan template''s short name (ex: PPL, SS, SL)')
    name = models.CharField(max_length=200, help_text='Enter the workout plan template''s name (ex: Push Pull Legs, Starting Strength)')
    description = models.TextField(null=True)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f'{self.short_name} - {self.name}'

class PlanSession(models.Model):
    # A plan session template details how a workout would be done 
    # (ex: Push, Pull, Legs, Upper, Lower, A, B)
    name = models.CharField(max_length=200, help_text='Enter the workout plan session template''s name (ex: Push, Pull, Legs, Upper, Lower, A, B)')
    plan = models.ForeignKey(Plan, related_name="sessions", on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class PlanSessionGroup(models.Model):
    # same order used in two records means they'll alternate
    order = models.PositiveIntegerField()
    name = models.CharField(max_length=200)
    plan_session = models.ForeignKey(PlanSession, related_name="groups", on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class AbstractGroupActivity(models.Model):
    # same order used in two records means they'll alternate
    order = models.PositiveIntegerField()
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    number_of_sets = models.PositiveIntegerField()
    number_of_repetitions = models.PositiveIntegerField()
    number_of_repetitions_up_to = models.PositiveIntegerField(null=True)
    working_weight_percentage = models.DecimalField(max_digits=6, decimal_places=3)

    class Meta:
        abstract = True

    def __str__(self):
        description_str =  f'{self.number_of_sets}x{self.number_of_repetitions}'

        if self.number_of_repetitions_up_to:
            description_str += f'-{self.number_of_repetitions_up_to}'

        description_str += f' {self.exercise.name}'

        return description_str

class PlanSessionGroupExercise(AbstractGroupActivity):
    plan_session_group = models.ForeignKey(PlanSessionGroup, related_name="exercises", on_delete=models.CASCADE)

class PlanSessionGroupWarmUp(AbstractGroupActivity):
    plan_session_group = models.ForeignKey(PlanSessionGroup, related_name="warmups", on_delete=models.CASCADE)

class AbstractProgressionStrategy(models.Model):
    TYPE_EXERCISE = 'e'
    TYPE_CHARACTERISTICS = 'c'
    TYPES = [
        (TYPE_EXERCISE, 'By Exercise'),
        (TYPE_CHARACTERISTICS, 'By Characteristics'),
    ]

    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, null=True)
    percentage_increase = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    weight_increase = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True)
    mechanics = models.CharField(max_length=1, null=True, choices=Exercise.MECHANICS_CHOICES)
    force = models.CharField(max_length=1, null=True, choices=Exercise.FORCES)
    modality = models.CharField(max_length=1, null=True, choices=Exercise.MODALITIES)
    section = models.CharField(max_length=1, null=True, choices=Exercise.SECTIONS)
    progression_type = models.CharField(max_length=1, null=True, choices=TYPES)

    class Meta:
        abstract = True

class PlanProgressionStrategy(AbstractProgressionStrategy):
    plan = models.ForeignKey(Plan, related_name="progressions", on_delete=models.CASCADE)

class PlanSessionProgressionStrategy(AbstractProgressionStrategy):
    plan_session = models.ForeignKey(PlanSession, related_name="progressions", on_delete=models.CASCADE, null=True)

class PlanSessionGroupProgressionStrategy(AbstractProgressionStrategy):
    plan_session_group = models.ForeignKey(PlanSessionGroup, related_name="progressions", on_delete=models.CASCADE, null=True)

class Workout(models.Model):
    start = models.DateTimeField()
    end = models.DateTimeField()
    plan_session = models.ForeignKey(PlanSession, on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

class WorkoutGroup(models.Model):
    order = models.PositiveIntegerField()
    name = models.CharField(max_length=200)
    workout = models.ForeignKey(Workout, related_name="groups", on_delete=models.CASCADE)

class AbstractWorkoutActivity(models.Model):
    order = models.PositiveIntegerField()
    start = models.DateTimeField()
    end = models.DateTimeField()
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    number_of_repetitions = models.PositiveIntegerField()
    weight = models.DecimalField(max_digits=6, decimal_places=2)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)

    class Meta:
        abstract = True

class WorkoutSet(AbstractWorkoutActivity):
    workout_group = models.ForeignKey(WorkoutGroup, related_name="sets", on_delete=models.CASCADE)

class WorkoutWarmUp(AbstractWorkoutActivity):
    workout_group = models.ForeignKey(WorkoutGroup, related_name="warmups", on_delete=models.CASCADE)
