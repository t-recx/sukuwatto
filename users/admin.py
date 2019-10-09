from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ['email', 'username', 'gender']

    fieldsets = UserAdmin.fieldsets + (
        (None, {
            'fields': ('gender',),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
