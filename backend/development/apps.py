from django.apps import AppConfig


class DevelopmentConfig(AppConfig):
    name = 'development'

    def ready(self):
        import development.signals
