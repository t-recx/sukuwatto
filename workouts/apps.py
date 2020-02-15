from django.apps import AppConfig

class WorkoutsConfig(AppConfig):
    name = 'workouts'

    def ready(self):
        from actstream import registry
        registry.register(self.get_model('Workout'))

        import workouts.signals