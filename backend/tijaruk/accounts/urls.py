from django.urls import path
from .views import (
    AdminUserDetailView,
    AdminUserListCreateView,
    BecomeUserView,
    GoogleLoginView,
    LoginView,
    LogoutView,
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RefreshView,
    RegisterView,
    ResendOTPView,
    RoleDetailView,
    RoleListCreateView,
    UserProfileView,
    VerifyOTPView,
)


urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('google/', GoogleLoginView.as_view()),
    path('password-reset/request/', PasswordResetRequestView.as_view()),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view()),
    path('change-password/', PasswordChangeView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('resend-otp/', ResendOTPView.as_view()),
    path('refresh/', RefreshView.as_view()),
    path('become-user/', BecomeUserView.as_view()),
    path('me/', UserProfileView.as_view()),
    path('admin-users/', AdminUserListCreateView.as_view()),
    path('admin-users/<int:pk>/', AdminUserDetailView.as_view()),
    path('roles/', RoleListCreateView.as_view()),
    path('roles/<int:pk>/', RoleDetailView.as_view()),
]
