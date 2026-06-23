from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import filters, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from accounts.models import PermissionModule
from superadmin.permissions import has_permission
from .models import Business, BusinessUserSettings
from .serializers import (
    BusinessSerializer,
    BusinessUserSettingsSerializer,
    BusinessUserProfileSerializer,
)


class BusinessUserSettingsView(APIView):
    def get_settings(self, request):
        if request.user.role != User.Role.BUSINESS:
            raise PermissionDenied("Only business users can access these settings.")
        settings_obj, _ = BusinessUserSettings.objects.get_or_create(user=request.user)
        return settings_obj

    def get(self, request, *args, **kwargs):
        return Response(BusinessUserSettingsSerializer(self.get_settings(request)).data)

    def patch(self, request, *args, **kwargs):
        settings_obj = self.get_settings(request)
        serializer = BusinessUserSettingsSerializer(
            settings_obj,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BusinessUserProfileView(APIView):
    def get_user(self, request):
        if request.user.role != User.Role.BUSINESS:
            raise PermissionDenied("Only business users can access this profile.")
        return request.user

    def get(self, request, *args, **kwargs):
        serializer = BusinessUserProfileSerializer(
            self.get_user(request),
            context={"request": request},
        )
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        serializer = BusinessUserProfileSerializer(
            self.get_user(request),
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminBusinessUserView(APIView):
    def get_user(self, request, user_id):
        if not has_permission(request.user, PermissionModule.USERS, "edit"):
            raise PermissionDenied(
                "You do not have permission to perform this action."
            )
        return get_object_or_404(
            User,
            user_id=user_id,
            role=User.Role.BUSINESS,
            is_archived=False,
        )

    def patch(self, request, user_id, *args, **kwargs):
        user = self.get_user(request, user_id)

        serializer = BusinessSerializer(
            getattr(user, "business_profile", None),
            data=request.data,
            partial=False,
            context={
                "request": request,
                "existing_user": True,
                "existing_user_obj": user,
            },
        )
        serializer.is_valid(raise_exception=True)
        business = serializer.save(user=user)

        return Response(
            BusinessSerializer(business, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, user_id, *args, **kwargs):
        user = self.get_user(request, user_id)
        if not has_permission(request.user, PermissionModule.USERS, "delete"):
            raise PermissionDenied(
                "You do not have permission to perform this action."
            )
        user.is_archived = True
        user.is_active = False
        user.save(update_fields=["is_archived", "is_active", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    def user_row(self, user, request):
        return {
            "id": None,
            "user_id": user.user_id,
            "user_email": user.email,
            "location": "",
            "user_photo": (
                request.build_absolute_uri(user.photo.url) if user.photo else ""
            ),
            "email": user.email,
            "phone": user.phone,
            "created_at": user.date_joined,
            "profile_complete": False,
        }


class BusinessViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Businesses to be viewed or edited.
    """
    queryset = Business.objects.all().order_by('-created_at')
    serializer_class = BusinessSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__email', 'user__phone', 'location']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if request.user.role == User.Role.BUSINESS:
            return response

        users = User.objects.filter(
            role=User.Role.BUSINESS,
            is_archived=False,
            business_profile__isnull=True,
        ).order_by("-date_joined")
        user_rows = [
            {
                "id": None,
                "user_id": user.user_id,
                "user_email": user.email,
                "location": "",
                "user_photo": (
                    request.build_absolute_uri(user.photo.url)
                    if user.photo
                    else ""
                ),
                "email": user.email,
                "phone": user.phone,
                "created_at": user.date_joined,
                "profile_complete": False,
            }
            for user in users
        ]

        if isinstance(response.data, dict) and "results" in response.data:
            response.data["results"] = [*user_rows, *response.data["results"]]
            response.data["count"] += len(user_rows)
        else:
            response.data = [*user_rows, *response.data]
        return response

    def get_queryset(self):
        queryset = super().get_queryset().filter(
            is_archived=False,
        ).filter(
            Q(user__isnull=True) | Q(user__is_archived=False)
        )
        user = self.request.user

        if user.role == User.Role.BUSINESS:
            return queryset.filter(user=user)

        action = {
            "list": "view",
            "retrieve": "view",
            "create": "create",
            "update": "edit",
            "partial_update": "edit",
            "destroy": "delete",
        }.get(self.action, "view")
        if not has_permission(user, PermissionModule.USERS, action):
            raise PermissionDenied(
                "You do not have permission to perform this action."
            )

        return queryset

    def perform_create(self, serializer):
        if self.request.user.role == User.Role.BUSINESS:
            raise PermissionDenied(
                "Business accounts cannot create another business."
            )
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role == User.Role.BUSINESS:
            raise PermissionDenied(
                "Business accounts cannot delete their business."
            )
        instance.is_archived = True
        instance.save(update_fields=["is_archived"])
        if instance.user_id:
            instance.user.is_archived = True
            instance.user.save(update_fields=["is_archived"])
