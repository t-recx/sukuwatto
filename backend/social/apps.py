from django.apps import AppConfig

class SocialConfig(AppConfig):
    name = 'social'

    def ready(self):
        from actstream import registry
        registry.register(self.get_model('Post'))
        registry.register(self.get_model('Comment'))

        import social.signals