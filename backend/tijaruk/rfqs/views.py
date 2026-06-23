from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_204_NO_CONTENT
from rest_framework.views import APIView

from accounts.models import PermissionModule
from superadmin.permissions import has_permission
from notifications.services import notify_rfq_status_changed, notify_rfq_submitted
from products.models import Product

from .models import Country, RFQ, Unit
from .serializers import RFQSerializer, RFQStatusSerializer


def _get_role(user):
    role = getattr(user, "role", "")
    return str(role).upper() if role else ""


def _check_rfq_permission(user, action):
    if not has_permission(user, PermissionModule.RFQS, action):
        raise PermissionDenied("You do not have permission to perform this action.")


def _rfq_queryset():
    return RFQ.objects.filter(
        is_archived=False,
        created_by__is_archived=False,
    ).filter(
        Q(product__isnull=True)
        | Q(
            product__is_archived=False,
            product__supplier__user__is_archived=False,
        )
    ).select_related(
        "created_by",
        "created_by__business_profile",
        "product",
        "product__category",
        "product__supplier",
        "product__unit",
        "additional_service",
        "unit",
        "preferred_country_of_origin",
    )


def _update_rfq_stock_for_status(rfq, next_status):
    if not rfq.product_id:
        return

    if next_status == RFQ.Status.APPROVED and not rfq.stock_deducted:
        product = Product.objects.select_for_update().get(pk=rfq.product_id)
        if product.stock_quantity < rfq.quantity_required:
            unit_name = getattr(product.unit, "name", "") or getattr(rfq.unit, "name", "") or "units"
            raise ValidationError({
                "detail": (
                    f"Cannot approve this RFQ. Only {product.stock_quantity} "
                    f"{unit_name} available, but {rfq.quantity_required} requested."
                )
            })

        product.stock_quantity -= rfq.quantity_required
        product.save(update_fields=["stock_quantity"])
        rfq.stock_deducted = True

    if next_status != RFQ.Status.APPROVED and rfq.stock_deducted:
        product = Product.objects.select_for_update().get(pk=rfq.product_id)
        product.stock_quantity += rfq.quantity_required
        product.save(update_fields=["stock_quantity"])
        rfq.stock_deducted = False


class RFQListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rfqs = _rfq_queryset()
        if _get_role(request.user) == "BUSINESS":
            rfqs = rfqs.filter(created_by=request.user)
        else:
            _check_rfq_permission(request.user, "view")

        return Response(
            RFQSerializer(
                rfqs.order_by("-created_at"),
                many=True,
                context={"request": request},
            ).data
        )

    def post(self, request):
        if _get_role(request.user) != "BUSINESS":
            _check_rfq_permission(request.user, "create")

        serializer = RFQSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            rfq = serializer.save(
                created_by=request.user,
                status=RFQ.Status.PENDING,
            )
            notify_rfq_submitted(rfq, request.user)
        return Response(
            RFQSerializer(rfq, context={"request": request}).data,
            status=HTTP_201_CREATED,
        )


class RFQUnitListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(Unit.objects.order_by("name").values("id", "name"))


class RFQCountryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(Country.objects.order_by("name").values("id", "name"))


class RFQDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_rfq(self, user, action, pk):
        rfqs = _rfq_queryset()
        if _get_role(user) == "BUSINESS":
            return get_object_or_404(rfqs, pk=pk, created_by=user)

        _check_rfq_permission(user, action)
        return get_object_or_404(rfqs, pk=pk)

    def get(self, request, pk):
        rfq = self.get_rfq(request.user, "view", pk)
        return Response(
            RFQSerializer(rfq, context={"request": request}).data
        )

    def patch(self, request, pk):
        rfq = self.get_rfq(request.user, "edit", pk)
        serializer = RFQSerializer(
            rfq,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            rfq = RFQ.objects.select_for_update().select_related("product", "unit").get(pk=rfq.pk)
            _update_rfq_stock_for_status(rfq, RFQ.Status.PENDING)
            serializer = RFQSerializer(
                rfq,
                data=request.data,
                partial=True,
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(status=RFQ.Status.PENDING, stock_deducted=rfq.stock_deducted)
        return Response(
            RFQSerializer(serializer.instance, context={"request": request}).data
        )

    def delete(self, request, pk):
        rfq = self.get_rfq(request.user, "delete", pk)
        rfq.is_archived = True
        rfq.save(update_fields=["is_archived"])
        return Response(status=HTTP_204_NO_CONTENT)


class RFQStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        _check_rfq_permission(request.user, "approve")
        rfq = get_object_or_404(_rfq_queryset(), pk=pk)
        serializer = RFQStatusSerializer(
            rfq,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        next_status = serializer.validated_data.get("status", rfq.status)
        with transaction.atomic():
            rfq = RFQ.objects.select_for_update().select_related("product", "unit").get(pk=rfq.pk)
            previous_status = rfq.status
            _update_rfq_stock_for_status(rfq, next_status)
            rfq.status = next_status
            rfq.save(update_fields=["status", "stock_deducted", "updated_at"])
            if (
                rfq.status != previous_status
                and rfq.status in {RFQ.Status.APPROVED, RFQ.Status.REJECTED}
            ):
                notify_rfq_status_changed(rfq, request.user)
            rfq.refresh_from_db()
        return Response(
            RFQSerializer(rfq, context={"request": request}).data
        )
