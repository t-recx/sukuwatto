from django.db import models
from django.contrib.auth import get_user_model

class Unit(models.IntegerChoices):
    KILOGRAM = 1
    POUND = 2
    CENTIMETER = 3
    FEET = 4
    KILOMETER = 5
    MILE = 6
    MINUTE = 7
    METER = 8
    SECOND = 9
    YARD = 10
    KMH = 11
    MPH = 12
    MILLISECOND = 13
    HOUR = 14

class UserBioData(models.Model):
    date = models.DateTimeField()
    weight = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    weight_unit = models.IntegerField(choices=Unit.choices, null=True)
    height = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    height_unit = models.IntegerField(choices=Unit.choices, null=True)
    body_fat_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    water_weight_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    muscle_mass_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    bone_mass_weight = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    bone_mass_weight_unit = models.IntegerField(choices=Unit.choices, null=True)
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
    PULL_PUSH = 'x'
    FORCES = [
        (PULL, 'Pull'),
        (PUSH, 'Push'),
        (STATIC, 'Static'),
        (PULL_PUSH, 'Pull and push'),
    ]

    FREE_WEIGHTS = 'f'
    CABLE = 'c'
    MACHINE = 'm'
    CALISTHENICS = 'x'
    MODALITIES = [
        (FREE_WEIGHTS, 'Free weights'),
        (CABLE, 'Cable'),
        (MACHINE, 'Machine'),
        (CALISTHENICS, 'Calisthenics'),
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
    likes = models.IntegerField(default=0)
    comment_number = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class MetabolicEquivalentTask(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, blank= True, null=True)

    exercise_type = models.CharField(max_length=1, blank= True, null=True, choices=Exercise.EXERCISE_TYPES)
    mechanics = models.CharField(max_length=1, blank= True, null=True, choices=Exercise.MECHANICS)
    force = models.CharField(max_length=1, blank= True, null=True, choices=Exercise.FORCES)
    modality = models.CharField(max_length=1, blank= True, null=True, choices=Exercise.MODALITIES)
    section = models.CharField(max_length=1, blank= True, null=True, choices=Exercise.SECTIONS)

    code = models.CharField(max_length=20, null=True, blank=True)
    description = models.CharField(max_length=200, null=True, blank=True)
    met = models.DecimalField(max_digits=4, decimal_places=2)
    from_value = models.DecimalField(max_digits=4, decimal_places=2, blank= True, null=True)
    to_value = models.DecimalField(max_digits=4, decimal_places=2, blank= True, null=True)
    unit = models.IntegerField(choices=Unit.choices, blank= True, null=True)

    can_be_automatically_selected = models.BooleanField(default=False)

class Plan(models.Model):
    # Example: PPL, SS, SL
    short_name = models.CharField(max_length=200, help_text='Enter the workout plan template''s short name (ex: PPL, SS, SL)', blank=True)
    name = models.CharField(max_length=200, help_text='Enter the workout plan template''s name (ex: Push Pull Legs, Starting Strength)')
    description = models.TextField(null=True, blank=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    parent_plan = models.ForeignKey('self', on_delete=models.SET_NULL, null=True)
    creation = models.DateTimeField(auto_now_add=True)
    public = models.BooleanField(default=False)
    likes = models.IntegerField(default=0)
    comment_number = models.IntegerField(default=0)

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
    speed_unit = models.IntegerField(choices=Unit.choices, null=True)
    distance_unit = models.IntegerField(choices=Unit.choices, null=True)
    time_unit = models.IntegerField(choices=Unit.choices, null=True)

class PlanSessionGroupWarmUp(AbstractGroupActivity):
    plan_session_group = models.ForeignKey(PlanSessionGroup, related_name="warmups", on_delete=models.CASCADE)
    speed_unit = models.IntegerField(choices=Unit.choices, null=True)
    distance_unit = models.IntegerField(choices=Unit.choices, null=True)
    time_unit = models.IntegerField(choices=Unit.choices, null=True)

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
    initial_value = models.DecimalField(max_digits=10, decimal_places=5, null=True)
    unit = models.IntegerField(choices=Unit.choices, null=True)
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

    EVERYONE = 'e'
    REGISTERED_USERS = 'r'
    FOLLOWERS = 'f'
    OWN_USER = 'u'

    VISIBILITIES =  [
        (EVERYONE, 'Everyone'),
        (REGISTERED_USERS, 'Registered users'),
        (FOLLOWERS, 'Followers'),
        (OWN_USER, 'Own user')
    ]

    start = models.DateTimeField()
    end = models.DateTimeField(null=True)
    name = models.CharField(max_length=200, null=True)
    notes = models.TextField(null=True)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    plan_session = models.ForeignKey(PlanSession, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    status = models.CharField(default=INPROGRESS, max_length=1, choices=STATUS)

    calories = models.DecimalField(max_digits=8, decimal_places=3, null=True);

    visibility = models.CharField(max_length=1, choices=VISIBILITIES, default=EVERYONE)

    likes = models.IntegerField(default=0)
    comment_number = models.IntegerField(default=0)

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
    in_progress = models.BooleanField(default=False)
    done = models.BooleanField(default=False)
    working_weight_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)

    weight = models.DecimalField(max_digits=7, decimal_places=3, null=True)
    expected_weight = models.DecimalField(max_digits=7, decimal_places=3, null=True)

    speed_type = models.CharField(max_length=1, null=True, choices=AbstractGroupActivity.SPEED_TYPES)
    expected_speed = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    expected_speed_up_to = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    speed = models.DecimalField(null=True, max_digits=6, decimal_places=3)

    vo2max_type = models.CharField(max_length=1, null=True, choices=AbstractGroupActivity.VO2MAX_TYPES)
    expected_vo2max = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    expected_vo2max_up_to = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    vo2max = models.DecimalField(null=True, max_digits=6, decimal_places=3)

    distance_type = models.CharField(max_length=1, null=True, choices=AbstractGroupActivity.DISTANCE_TYPES)
    expected_distance = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    expected_distance_up_to = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    distance = models.DecimalField(null=True, max_digits=6, decimal_places=3)

    time_type = models.CharField(max_length=1, null=True, choices=AbstractGroupActivity.TIME_TYPES)
    expected_time = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    expected_time_up_to = models.DecimalField(null=True, max_digits=6, decimal_places=3)
    time = models.DecimalField(null=True, max_digits=6, decimal_places=3)

    working_distance_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    working_time_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)
    working_speed_percentage = models.DecimalField(max_digits=6, decimal_places=3, null=True)

    tracking = models.BooleanField(null=True)

    calories = models.DecimalField(max_digits=9, decimal_places=3, null=True);

    met = models.ForeignKey(MetabolicEquivalentTask, null=True, on_delete=models.SET_NULL)
    met_set_by_user = models.BooleanField(null=True)

    class Meta:
        abstract = True

class WorkoutSet(AbstractWorkoutActivity):
    workout_group = models.ForeignKey(WorkoutGroup, related_name="sets", on_delete=models.CASCADE)
    plan_session_group_activity = models.ForeignKey(PlanSessionGroupExercise, on_delete=models.SET_NULL, null=True)

    weight_unit = models.IntegerField(choices=Unit.choices, null=True)
    speed_unit = models.IntegerField(choices=Unit.choices, null=True)
    distance_unit = models.IntegerField(choices=Unit.choices, null=True)
    time_unit = models.IntegerField(choices=Unit.choices, null=True)
    plan_weight_unit = models.IntegerField(choices=Unit.choices, null=True)
    plan_speed_unit = models.IntegerField(choices=Unit.choices, null=True)
    plan_distance_unit = models.IntegerField(choices=Unit.choices, null=True)
    plan_time_unit = models.IntegerField(choices=Unit.choices, null=True)

class WorkoutWarmUp(AbstractWorkoutActivity):
    workout_group = models.ForeignKey(WorkoutGroup, related_name="warmups", on_delete=models.CASCADE)
    plan_session_group_activity = models.ForeignKey(PlanSessionGroupWarmUp, on_delete=models.SET_NULL, null=True)

    weight_unit = models.IntegerField(choices=Unit.choices, null=True)
    speed_unit = models.IntegerField(choices=Unit.choices, null=True)
    distance_unit = models.IntegerField(choices=Unit.choices, null=True)
    plan_weight_unit = models.IntegerField(choices=Unit.choices, null=True)
    time_unit = models.IntegerField(choices=Unit.choices, null=True)
    plan_speed_unit = models.IntegerField(choices=Unit.choices, null=True)
    plan_distance_unit = models.IntegerField(choices=Unit.choices, null=True)
    plan_time_unit = models.IntegerField(choices=Unit.choices, null=True)

class AbstractActivityTimeSegment(models.Model):
    start = models.DateTimeField(null=True)
    end = models.DateTimeField(null=True)

    class Meta:
        abstract = True

class WorkoutWarmUpTimeSegment(AbstractActivityTimeSegment):
    workout_activity = models.ForeignKey(WorkoutWarmUp, related_name="segments", on_delete=models.CASCADE)

class WorkoutSetTimeSegment(AbstractActivityTimeSegment):
    workout_activity = models.ForeignKey(WorkoutSet, related_name="segments", on_delete=models.CASCADE)

class AbstractActivityPosition(models.Model):
    altitude = models.DecimalField(max_digits=28, decimal_places=20, null=True)
    latitude = models.DecimalField(max_digits=28, decimal_places=20, null=True)
    longitude = models.DecimalField(max_digits=28, decimal_places=20, null=True)

    class Meta:
        abstract = True

class WorkoutSetPosition(AbstractActivityPosition):
    workout_activity = models.ForeignKey(WorkoutSet, related_name="positions", on_delete=models.CASCADE)

class WorkoutWarmUpPosition(AbstractActivityPosition):
    workout_activity = models.ForeignKey(WorkoutWarmUp, related_name="positions", on_delete=models.CASCADE)

class WorkingParameter(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="working_parameters")
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT)
    parameter_value = models.DecimalField(max_digits=8, decimal_places=3, null=True)
    parameter_type = models.CharField(max_length=1, choices=AbstractProgressionStrategy.PARAMETER_TYPES)
    unit = models.IntegerField(choices=Unit.choices, null=True)
    previous_parameter_value = models.DecimalField(max_digits=8, decimal_places=3, null=True)
    previous_unit = models.IntegerField(choices=Unit.choices, null=True)
    manually_changed = models.BooleanField(default=False)
