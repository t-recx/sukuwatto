from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class PercentSignValidator:
    def validate(self, password, user=None):
        if "%" in password:
            raise ValidationError(
                _("This password contains an illegal character: %."),
                code='password_illegal_character'
            )

    def get_help_text(self):
        return _(
            "Your password must not contain the % character.")