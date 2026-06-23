from django.contrib import admin
from django import forms
from django.db import transaction

from accounts.models import User
from .models import Business


class BusinessCreationForm(forms.ModelForm):
    email = forms.EmailField()
    phone = forms.CharField(max_length=20)
    password = forms.CharField(
        min_length=8,
        strip=False,
        widget=forms.PasswordInput,
        help_text="Used by the business to sign in to the dashboard.",
    )

    class Meta:
        model = Business
        exclude = ("user",)

    def clean_email(self):
        email = self.cleaned_data["email"]
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("A user with this email already exists.")
        return email

    @transaction.atomic
    def save(self, commit=True):
        business = super().save(commit=False)
        email = self.cleaned_data["email"]
        business.user = User.objects.create_user(
            email=email,
            username=email,
            password=self.cleaned_data["password"],
            role=User.Role.BUSINESS,
            phone=self.cleaned_data["phone"],
        )
        if commit:
            business.save()
            self.save_m2m()
        return business

@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    add_form = BusinessCreationForm
    list_display = ('user_email', 'user_phone', 'location')
    search_fields = ('user__email', 'user__phone', 'location')
    readonly_fields = ("user",)

    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            kwargs["form"] = self.add_form
        return super().get_form(request, obj, **kwargs)

    def user_email(self, obj):
        return obj.user.email if obj.user else ""

    def user_phone(self, obj):
        return obj.user.phone if obj.user else ""
