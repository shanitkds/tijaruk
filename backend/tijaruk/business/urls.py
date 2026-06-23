from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminBusinessUserView,
    BusinessViewSet,
    BusinessUserProfileView,
    BusinessUserSettingsView,
)

router = DefaultRouter()
router.register(r'businesses', BusinessViewSet, basename='business')

urlpatterns = [
    path('business-profile/', BusinessUserProfileView.as_view()),
    path('user-settings/', BusinessUserSettingsView.as_view()),
    path('business-users/<str:user_id>/', AdminBusinessUserView.as_view()),
    path('', include(router.urls)),
]
