from django.urls import path
from users.views import UserProfileView, ChangePasswordView, RegisterView, LogoutView, ActivationView, PasswordResetView, PasswordResetConfirmView
from messaging.views import search_user


urlpatterns = [
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(),
      name='password-reset-confirm'
    ),
    path('activate/<uidb64>/<token>/', ActivationView.as_view(), name='activate'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('search/', search_user, name='user-search'),
]