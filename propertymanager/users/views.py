from django.shortcuts import render
from .serializers import RegisterSerializer, ChangePasswordSerializer, UserProfileSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from .models import UserProfile


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(
            profile,
            context={'request': request}       # <-- tu
        )
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request}       # <-- i tu
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(serializer.data['old_password']):
                return Response({"old_password": ["Nieprawidłowe hasło"]}, status=400)
            
            request.user.set_password(serializer.data['new_password'])
            request.user.save()
            update_session_auth_hash(request, request.user)
            return Response({"status": "success"})
        return Response(serializer.errors, status=400)
    
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()

        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        activate_url = f"http://localhost:3000/activate/{uidb64}/{token}/"

        subject = 'Aktywuj swoje konto w PropertyManager'
        message = (
            f"Cześć {user.first_name},\n\n"
            f"Dziękujemy za rejestrację. Kliknij w link, aby aktywować konto:\n\n"
            f"{activate_url}\n\n"
            "Jeśli to nie Ty się rejestrowałeś, zignoruj tę wiadomość."
        )
        send_mail(subject, message, None, [user.email], fail_silently=False)
    
    
class ActivationView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'detail': 'Link aktywacyjny jest nieprawidłowy.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Token jest nieprawidłowy lub wygasł.'},
                            status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save()

        return Response({'detail': 'Konto zostało aktywowane. Możesz się teraz zalogować.'},
                        status=status.HTTP_200_OK)

    
class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email, is_active=True)
            except User.DoesNotExist:
                # Zwracamy 200, by nie zdradzać istnienia konta
                return Response(
                    {"detail": "Jeśli konto istnieje, został wysłany link resetujący."},
                    status=status.HTTP_200_OK
                )

            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"http://localhost:3000/reset-password-confirm/{uidb64}/{token}/"

            subject = 'Reset hasła w PropertyManager'
            message = (
                f"Cześć {user.first_name},\n\n"
                f"Aby zresetować hasło, kliknij w link:\n{reset_url}\n\n"
                "Jeśli to nie Ty prosiłeś o reset, zignoruj tę wiadomość."
            )
            send_mail(subject, message, None, [user.email], fail_silently=False)

            return Response(
                {"detail": "Jeśli konto istnieje, został wysłany link resetujący."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response(
                    {"detail": "Link jest nieprawidłowy lub wygasł."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not default_token_generator.check_token(user, token):
                return Response(
                    {"detail": "Link jest nieprawidłowy lub wygasł."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {"detail": "Hasło zostało zresetowane. Możesz się teraz zalogować."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=200)
        except Exception as e:
            return Response(status=400)