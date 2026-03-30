from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = "apps.accounts"

    def ready(self):
        """
        Import signals when app is ready.
        """
        import apps.accounts.signals
