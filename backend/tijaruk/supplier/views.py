from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_204_NO_CONTENT
from rest_framework.views import APIView

from accounts.models import PermissionModule
from superadmin.permissions import has_permission

from .models import ProductType, Supplier
from .serializers import ProductTypeSerializer, SupplierSerializer


def _check_supplier_permission(user, action):
    if not has_permission(user, PermissionModule.SUPPLIERS, action):
        raise PermissionDenied("You do not have permission to perform this action.")


class SupplierListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _check_supplier_permission(request.user, "view")
        suppliers = Supplier.objects.filter(user__is_archived=False).select_related(
            "user",
            "product_type",
        )
        return Response(
            SupplierSerializer(
                suppliers,
                many=True,
                context={"request": request},
            ).data
        )

    def post(self, request):
        _check_supplier_permission(request.user, "create")
        serializer = SupplierSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=HTTP_201_CREATED)


class SupplierDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_supplier(self, user, action, pk):
        _check_supplier_permission(user, action)
        return get_object_or_404(
            Supplier.objects.select_related("user", "product_type"),
            pk=pk,
        )

    def get(self, request, pk):
        supplier = self.get_supplier(request.user, "view", pk)
        return Response(
            SupplierSerializer(
                supplier,
                context={"request": request},
            ).data
        )

    def patch(self, request, pk):
        supplier = self.get_supplier(request.user, "edit", pk)
        serializer = SupplierSerializer(
            supplier,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        supplier = self.get_supplier(request.user, "delete", pk)
        supplier.user.is_archived = True
        supplier.user.save(update_fields=["is_archived"])
        return Response(status=HTTP_204_NO_CONTENT)


class ProductTypeListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _check_supplier_permission(request.user, "view")
        product_types = ProductType.objects.order_by("name")
        return Response(ProductTypeSerializer(product_types, many=True).data)
