from django.db import models
from django.contrib.auth import get_user_model

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

class WorkoutPlanTemplate(models.Model):
    # Example: PPL, SS, SL
    short_name = models.CharField(max_length=200, help_text='Enter the workout plan template''s short name (ex: PPL, SS, SL)')
    name = models.CharField(max_length=200, help_text='Enter the workout plan template''s name (ex: Push Pull Legs, Starting Strength)')
    description = models.TextField(null=True)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f'{self.short_name} - {self.name}'

class WorkoutPlanSessionTemplate(models.Model):
    # A plan session template details how a workout would be done 
    # (ex: Push, Pull, Legs, Upper, Lower, A, B)
    name = models.CharField(max_length=200, help_text='Enter the workout plan session template''s name (ex: Push, Pull, Legs, Upper, Lower, A, B)')
    workout_plan_template = models.ForeignKey(WorkoutPlanTemplate, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class WorkoutPlanSessionTemplateSchedule(models.Model):
    # same order used in two records means they'll alternate
    order = models.PositiveIntegerField()

    workout_plan_template = models.ForeignKey(WorkoutPlanTemplate, on_delete=models.CASCADE)
    # a null in the session template indicates a resting day
    workout_plan_session_template = models.ForeignKey(WorkoutPlanSessionTemplate, on_delete=models.CASCADE, null=True)

    def __str__(self):
        description_str = self.order

        if self.workout_plan_session_template:
            description_str += f' {self.workout_plan_session_template.name}'
        else:
            description_str += f' Rest';

        return description_str

class WorkoutPlanSessionExerciseTemplate(models.Model):
    # same order used in two records means they'll alternate
    order = models.PositiveIntegerField()
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    number_of_sets = models.PositiveIntegerField()
    number_of_repetitions = models.PositiveIntegerField()
    number_of_repetitions_up_to = models.PositiveIntegerField(null=True)
    workout_plan_session_template = models.ForeignKey(WorkoutPlanSessionTemplate, on_delete=models.CASCADE)

    def __str__(self):
        description_str =  f'{self.number_of_sets}x{self.number_of_repetitions}'

        if self.number_of_repetitions_up_to:
            description_str += f'-{self.number_of_repetitions_up_to}'

        description_str += f' {self.exercise.name}'

        return description_str