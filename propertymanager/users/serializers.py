from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from django.contrib.auth.password_validation import validate_password


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class UserProfileSerializer(serializers.ModelSerializer):
    # dane z User
    username     = serializers.CharField(source='user.username', read_only=True)
    first_name   = serializers.CharField(source='user.first_name', required=False)
    last_name    = serializers.CharField(source='user.last_name', required=False)
    email        = serializers.EmailField(source='user.email', required=False)
    # avatar zwraca pełny URL
    avatar       = serializers.ImageField(use_url=True, allow_null=True, required=False)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = UserProfile
        fields = [
            'username',
            'first_name',
            'last_name',
            'email',
            'phone_number',
            'avatar',
        ]

    def update(self, instance, validated_data):
        # 1) aktualizacja User
        user_data = validated_data.pop('user', {})
        user = instance.user
        for attr, val in user_data.items():
            setattr(user, attr, val)
        user.save()
        # 2) reszta pól profilu
        return super().update(instance, validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name':  {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Hasła nie są identyczne"})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Ta nazwa użytkownika jest już zajęta"})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Ten adres e-mail jest już używany"})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username   = validated_data['username'],
            email      = validated_data['email'],
            first_name = validated_data['first_name'],
            last_name  = validated_data['last_name'],
            is_active  = False,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password    = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    re_new_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['re_new_password']:
            raise serializers.ValidationError({"re_new_password": "Hasła nie są identyczne"})
        return attrs
