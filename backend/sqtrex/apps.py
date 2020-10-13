from django.apps import AppConfig


class SqtrexConfig(AppConfig):
    name = 'sqtrex'

    def ready(self):
        import sqtrex.handlers
