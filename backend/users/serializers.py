from django.contrib.auth import get_user_model, authenticate
from .models import File, UserInterest
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers, exceptions
from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken, SlidingToken, UntypedToken
from drf_recaptcha.fields import ReCaptchaV2Field
from users.tasks import delete_image_file

class ExpressInterestSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[UniqueValidator(queryset=UserInterest.objects.all())])

    class Meta:
        model = UserInterest
        fields = ['email']

class UserHiddenSerializer(serializers.ModelSerializer):
    hidden = serializers.ReadOnlyField(default='true')

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'profile_filename', 'followers_number', 'followings_number', 'hidden']

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username','profile_filename']

class UserRegistrationSerializer(serializers.ModelSerializer):
    recaptcha = ReCaptchaV2Field()

    def validate(self, data):
        data.pop("recaptcha")

        if "password" in data:
            errors = dict()

            try:
                password_validation.validate_password(password=data.get('password'), user=get_user_model()(**data))
            except ValidationError as e:
                errors['password'] = list(e.messages)

            if errors:
                raise serializers.ValidationError(errors)

        return super(UserRegistrationSerializer, self).validate(data)

    def create(self, validated_data):
        validated_data['username'] = validated_data['username'].lower()
        validated_data['email'] = validated_data['email'].lower()
        return get_user_model().objects.create(**validated_data)

    class Meta:
        model = get_user_model()
        fields = ['id', 'password', 'email', 'first_name', 'last_name', 
        'month_birth', 'year_birth', 'username', 'gender', 'groups', 
        'system', 'biography', 'location', 'profile_filename',
        'follow_approval_required',
        'default_weight_unit', 'default_speed_unit', 'default_distance_unit',
        'default_energy_unit',
        'is_staff', 'default_visibility_workouts', 'visibility', 'default_visibility_user_bio_datas',
        'followers_number', 'followings_number', 'tier', 'recaptcha']
        extra_kwargs = {'password': {'write_only': True, 'required': False},
            'email': {'write_only': True, 'required': False},
            'tier': {'read_only': True, 'required': False},
            'is_staff': { 'read_only': True, 'required': False},
            'followers_number': {'read_only': True, 'required': False},
            'followings_number': {'read_only': True, 'required': False},
            'recaptcha': {'write_only': True}
            }

class UserSerializer(serializers.ModelSerializer):
    def update(self, instance, validated_data):
        if instance.profile_filename is not None and (validated_data.get('profile_filename', None) is None or validated_data.get('profile_filename', None) != instance.profile_filename):
            delete_image_file(instance.profile_filename, instance)

        instance.email = validated_data.get('email', instance.email).lower()
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.month_birth = validated_data.get('month_birth', instance.month_birth)
        instance.year_birth = validated_data.get('year_birth', instance.year_birth)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.system = validated_data.get('system', instance.system)
        instance.biography = validated_data.get('biography', instance.biography)
        instance.location = validated_data.get('location', instance.location)
        instance.profile_filename = validated_data.get('profile_filename', instance.profile_filename)
        instance.default_weight_unit = validated_data.get('default_weight_unit', instance.default_weight_unit)
        instance.default_speed_unit = validated_data.get('default_speed_unit', instance.default_speed_unit)
        instance.default_distance_unit = validated_data.get('default_distance_unit', instance.default_distance_unit)
        instance.default_energy_unit = validated_data.get('default_energy_unit', instance.default_energy_unit)
        instance.default_visibility_workouts = validated_data.get('default_visibility_workouts', instance.default_visibility_workouts)
        instance.default_visibility_user_bio_datas = validated_data.get('default_visibility_user_bio_datas', instance.default_visibility_user_bio_datas)
        instance.follow_approval_required = validated_data.get('follow_approval_required', instance.follow_approval_required)
        instance.visibility = validated_data.get('visibility', instance.visibility)

        if instance.tier == 'a' or instance.is_staff:
            instance.custom_class = validated_data.get('custom_class', instance.custom_class)
            instance.primary_class = validated_data.get('primary_class', instance.primary_class)
            instance.secondary_class = validated_data.get('secondary_class', instance.secondary_class)

        instance.save()

        return instance

    class Meta:
        model = get_user_model()
        fields = ['id', 'password', 'email', 'first_name', 'last_name', 
        'month_birth', 'year_birth', 'username', 'gender', 'groups', 
        'system', 'biography', 'location', 'profile_filename',
        'follow_approval_required',
        'default_weight_unit', 'default_speed_unit', 'default_distance_unit',
        'default_energy_unit',
        'is_staff', 'default_visibility_workouts', 'visibility', 'default_visibility_user_bio_datas',
        'followers_number', 'followings_number', 'tier',
        'experience', 'level',
        'primary_class', 'secondary_class', 'custom_class', 'is_active',
        'primary_class_computed', 'secondary_class_computed']
        extra_kwargs = {'password': {'write_only': True, 'required': False},
            'email': {'write_only': True, 'required': False},
            'tier': {'read_only': True, 'required': False},
            'is_staff': { 'read_only': True, 'required': False},
            'is_active': { 'read_only': True, 'required': False},
            'followers_number': {'read_only': True, 'required': False},
            'followings_number': {'read_only': True, 'required': False},
            'experience': {'read_only': True, 'required': False},
            'level': {'read_only': True, 'required': False},
            'primary_class_computed': {'read_only': True, 'required': False},
            'secondary_class_computed': {'read_only': True, 'required': False},
            }

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = "__all__"

class CustomTokenObtainSerializer(TokenObtainSerializer):
    def validate(self, attrs):
        username_value = attrs[self.username_field]
        
        if "@" in username_value:
            user_by_email = get_user_model().objects.filter(email=username_value).first()

            if user_by_email is None or not user_by_email.is_active: 
                raise exceptions.AuthenticationFailed(
                    self.error_messages['no_active_account'],
                    'no_active_account',
                )

            username_value = user_by_email.username

        authenticate_kwargs = {
            self.username_field: username_value,
            'password': attrs['password'],
        }
        try:
            authenticate_kwargs['request'] = self.context['request']
        except KeyError:
            pass

        self.user = authenticate(**authenticate_kwargs)

        # Prior to Django 1.10, inactive users could be authenticated with the
        # default `ModelBackend`.  As of Django 1.10, the `ModelBackend`
        # prevents inactive users from authenticating.  App designers can still
        # allow inactive users to authenticate by opting for the new
        # `AllowAllUsersModelBackend`.  However, we explicitly prevent inactive
        # users from authenticating to enforce a reasonable policy and provide
        # sensible backwards compatibility with older Django versions.
        if self.user is None or not self.user.is_active:
            raise exceptions.AuthenticationFailed(
                self.error_messages['no_active_account'],
                'no_active_account',
            )

        return {}

class CustomTokenObtainPairSerializer(CustomTokenObtainSerializer):
    @classmethod
    def get_token(cls, user):
        return RefreshToken.for_user(user)

    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['user'] = UserSerializer(self.user).data

        return data