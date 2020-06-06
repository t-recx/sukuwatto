from django.db import models
from django.contrib.auth import get_user_model

class Unit(models.Model):
    METRIC = 'm'
    IMPERIAL = 'i'
    SYSTEMS = [
        (METRIC, 'Metric'),
        (IMPERIAL, 'Imperial'),
    ]

    WEIGHT = 'w'
    HEIGHT = 'h'
    DISTANCE = 'd'
    TIME = 't'
    SPEED = 's'
    MEASUREMENT_TYPE = [
        (WEIGHT, 'Weight'),
        (HEIGHT, 'Height'),
        (DISTANCE, 'Distance'),
        (TIME, 'Time'),
        (SPEED, 'Speed'),
    ]

    name = models.CharField(max_length=200)
    abbreviation = models.CharField(max_length=200)
    system = models.CharField(max_length=1, null=True, choices=SYSTEMS)
    measurement_type = models.CharField(max_length=1, null=True, choices=MEASUREMENT_TYPE)

class UserBioData(models.Model):
    date = models.DateTimeField()
    weight = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    weight_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, related_name="weight_unit")
    height = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    height_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, related_name="height_unit")
    body_fat_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    water_weight_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    muscle_mass_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    bone_mass_weight = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    bone_mass_weight_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, related_name="bone_mass_weight_unit")
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    notes = models.TextField(null=True, blank=True)

class Exercise(models.Model):
    CARDIO = 'c'
    STRENGTH = 's'
    EXERCISE_TYPES = [
        (CARDIO, 'Cardio'),
        (STRENGTH, 'Strength'),
    ]

    COMPOUND = 'c'
    ISOLATED = 'i'
    MECHANICS= [
        (COMPOUND, 'Compound'),
        (ISOLATED, 'Isolated'),
    ]

    PULL = 'p'
    PUSH = 'q'
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

    BEGINNER = 'b'
    INTERMEDIATE = 'i'
    ADVANCED = 'a'
    LEVELS = [
        (BEGINNER, 'Beginner'),
        (INTERMEDIATE, 'Intermediate'),
        (ADVANCED, 'Advanced'),
    ]

    exercise_type = models.CharField(max_length=1, choices=EXERCISE_TYPES)
    short_name = models.CharField(max_length=200, null=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    mechanics = models.CharField(max_length=1, null=True, choices=MECHANICS)
    force = models.CharField(max_length=1, null=True, choices=FORCES)
    modality = models.CharField(max_length=1, null=True, choices=MODALITIES)
    section = models.CharField(max_length=1, null=True, choices=SECTIONS)
    user = models.ForeignKey(get_user_model(), null=True, on_delete=models.CASCADE)
    muscle = models.CharField(max_length=200, null=True, blank=True)
    level = models.CharField(max_length=1, null=True, choices=LEVELS)
    creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Plan(models.Model):
    # Example: PPL, SS, SL
    short_name = models.CharField(max_length=200, help_text='Enter the workout plan template''s short name (ex: PPL, SS, SL)')
    name = models.CharField(max_length=200, help_text='Enter the workout plan template''s name (ex: Push Pull Legs, Starting Strength)')
    description = models.TextField(null=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    parent_plan = models.ForeignKey('self', on_delete=models.SET_NULL, null=True)
    website = models.CharField(max_length=400, null=True)
    creation = models.DateTimeField(auto_now_add=True)
    public = models.BooleanField(default=False)

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
    REPETITION_TYPE_STANDARD = 's'
    REPETITION_TYPE_RANGE = 'r'
    REPETITION_TYPE_TO_FAILURE = 'f'
    REPETITION_TYPE_AMRAP = 'a'
    REPETITION_TYPE_NONE = 'n'
    REPETITION_TYPES = [
        (REPETITION_TYPE_STANDARD, 'Standard'),
        (REPETITION_TYPE_RANGE, 'Range'),
        (REPETITION_TYPE_TO_FAILURE, 'To Failure'),
        (REPETITION_TYPE_AMRAP, 'As Many Repetitions as Possible'),
        (REPETITION_TYPE_NONE, 'None'),
    ]

    SPEED_TYPE_NONE = 'n'
    SPEED_TYPE_STANDARD = 's'
    SPEED_TYPE_RANGE = 'r'
    SPEED_TYPE_AFAP = 'a'
    SPEED_TYPE_PARAMETER = 'p'
    SPEED_TYPES = [
        (SPEED_TYPE_NONE, 'None'),
        (SPEED_TYPE_STANDARD, 'Standard'),
        (SPEED_TYPE_RANGE, 'Range'),
        (SPEED_TYPE_AFAP, 'As Fast as Possible'),
        (SPEED_TYPE_PARAMETER, 'Use working parameter'),
    ]

    VO2MAX_TYPE_NONE = 'n'
    VO2MAX_TYPE_STANDARD = 's'
    VO2MAX_TYPE_RANGE = 'r'
    VO2MAX_TYPES = [
        (VO2MAX_TYPE_NONE, 'None'),
        (VO2MAX_TYPE_STANDARD, 'Standard'),
        (VO2MAX_TYPE_RANGE, 'Range'),
    ]

    DISTANCE_TYPE_NONE = 'n'
    DISTANCE_TYPE_STANDARD = 's'
    DISTANCE_TYPE_RANGE = 'r'
    DISTANCE_TYPE_PARAMETER = 'p'
    DISTANCE_TYPES = [
        (DISTANCE_TYPE_NONE, 'None'),
        (DISTANCE_TYPE_STANDARD, 'Standard'),
        (DISTANCE_TYPE_RANGE, 'Range'),
        (DISTANCE_TYPE_PARAMETER, 'Parameter'),
    ]

    TIME_TYPE_NONE = 'n'
    TIME_TYPE_STANDARD = 's'
    TIME_TYPE_RANGE = 'r'
    TIME_TYPE_PARAMETER = 'p'
    TIME_TYPES = [
        (TIME_TYPE_NONE, 'None'),
        (TIME_TYPE_STANDARD, 'Standard'),
        (TIME_TYPE_RANGE, 'Range'),
        (TIME_TYPE_PARAMETER, 'Parameter'),
    ]

    # same order used in two records means they'll alternate
    order = models.PositiveIntegerField()

    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT)
    number_of_sets = models.PositiveIntegerField()

    repetition_type = models.CharField(max_length=1, null=True, choices=REPETITION_TYPES)
    number_of_repetitions = models.PositiveIntegerField(null=True)
    number_of_repetitions_up_to = models.PositiveIntegerField(null=True)

    speed_type = models.CharField(max_length=1, null=True, choices=SPEED_TYPES)
    speed = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    speed_up_to = models.DecimalField(null=True, max_digits=6, decimal_places=3)

    vo2max_type = models.CharField(max_length=1, null=True, choices=VO2MAX_TYPES)
    vo2max = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    vo2max_up_to = models.DecimalField(null=True, max_digits=6, decimal_places=3)

    distance_type = models.CharField(max_length=1, null=True, choices=DISTANCE_TYPES)
    distance = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    distance_up_to = models.DecimalField(null=True, max_digits=6, decimal_places=3)

    time_type = models.CharField(max_length=1, null=True, choices=TIME_TYPES)
    time = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    time_up_to = models.DecimalField(null=True, max_digits=6, decimal_places=3)

    working_weight_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    working_distance_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    working_time_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    working_speed_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)

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
    speed_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, related_name='exercise_speed_unit')
    distance_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, related_name='exercise_distance_unit')
    time_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, related_name='exercise_time_unit')

class PlanSessionGroupWarmUp(AbstractGroupActivity):
    plan_session_group = models.ForeignKey(PlanSessionGroup, related_name="warmups", on_delete=models.CASCADE)
    speed_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, related_name='warmup_speed_unit')
    distance_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, related_name='warmup_distance_unit')
    time_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, related_name='warmup_time_unit')

class AbstractProgressionStrategy(models.Model):
    TYPE_EXERCISE = 'e'
    TYPE_CHARACTERISTICS = 'c'
    TYPES = [
        (TYPE_EXERCISE, 'By Exercise'),
        (TYPE_CHARACTERISTICS, 'By Characteristics'),
    ]

    PARAMETER_TYPE_WEIGHT = 'w'
    PARAMETER_TYPE_DISTANCE = 'd'
    PARAMETER_TYPE_TIME = 't'
    PARAMETER_TYPE_SPEED = 's'
    PARAMETER_TYPES = [
        (PARAMETER_TYPE_WEIGHT, 'Weight'),
        (PARAMETER_TYPE_DISTANCE, 'Distance'),
        (PARAMETER_TYPE_TIME, 'Time'),
        (PARAMETER_TYPE_SPEED, 'Speed'),
    ]

    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT, null=True)
    percentage_increase = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    parameter_type = models.CharField(max_length=1, choices=PARAMETER_TYPES)
    parameter_increase = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True)
    mechanics = models.CharField(max_length=1, null=True, choices=Exercise.MECHANICS)
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
    INPROGRESS = 'p'
    FINISHED = 'f'
    STATUS = [
        (INPROGRESS, 'In progress'),
        (FINISHED, 'Finished'),
    ]

    start = models.DateTimeField()
    end = models.DateTimeField(null=True)
    name = models.CharField(max_length=200, null=True)
    notes = models.TextField(null=True)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    plan_session = models.ForeignKey(PlanSession, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    status = models.CharField(default=INPROGRESS, max_length=1, choices=STATUS)

class WorkoutGroup(models.Model):
    order = models.PositiveIntegerField(default=1)
    name = models.CharField(max_length=200, null=True)
    plan_session_group = models.ForeignKey(PlanSessionGroup, on_delete=models.SET_NULL, null=True)
    workout = models.ForeignKey(Workout, related_name="groups", on_delete=models.CASCADE)

class AbstractWorkoutActivity(models.Model):
    order = models.PositiveIntegerField(default=1)
    start = models.DateTimeField(null=True)
    end = models.DateTimeField(null=True)
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT)
    repetition_type = models.CharField(max_length=1, null=True, choices=AbstractGroupActivity.REPETITION_TYPES)
    expected_number_of_repetitions = models.PositiveIntegerField(null=True)
    expected_number_of_repetitions_up_to = models.PositiveIntegerField(null=True)
    number_of_repetitions = models.PositiveIntegerField(null=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True)
    in_progress = models.BooleanField(default=False)
    done = models.BooleanField(default=False)
    working_weight_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)

    class Meta:
        abstract = True

class WorkoutSet(AbstractWorkoutActivity):
    workout_group = models.ForeignKey(WorkoutGroup, related_name="sets", on_delete=models.CASCADE)
    plan_session_group_activity = models.ForeignKey(PlanSessionGroupExercise, on_delete=models.SET_NULL, null=True)

class WorkoutWarmUp(AbstractWorkoutActivity):
    workout_group = models.ForeignKey(WorkoutGroup, related_name="warmups", on_delete=models.CASCADE)
    plan_session_group_activity = models.ForeignKey(PlanSessionGroupWarmUp, on_delete=models.SET_NULL, null=True)

class WorkingParameter(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="working_parameters")
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT)
    parameter_value = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True)
    previous_parameter_value = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    previous_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="previous_unit", null=True)
    manually_changed = models.BooleanField(default=False)
