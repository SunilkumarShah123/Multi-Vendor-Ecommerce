from django.apps import AppConfig


class UserauthsConfig(AppConfig):
    name = 'userauths'

    #compulsorly overriding ready method to intiate automatic profile creation after user creation

    def ready(self):
        import userauths.signals
