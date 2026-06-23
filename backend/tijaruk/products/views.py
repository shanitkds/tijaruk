from decimal import Decimal, InvalidOperation

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import models, transaction
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_204_NO_CONTENT
from rest_framework.views import APIView

from accounts.models import PermissionModule
from superadmin.permissions import has_permission
from common.models import validate_image_file
from supplier.models import Supplier
from notifications.services import notify_businesses_of_new_product

from .models import Category, Product, ProductInternalImage, Service
from .serializers import ProductSerializer
from rfqs.models import Unit


def _get_role(user):
    role = getattr(user, "role", "")
    return str(role).upper() if role else ""


def _check_product_permission(user, action):
    if not has_permission(user, PermissionModule.PRODUCTS, action):
        raise PermissionDenied("You do not have permission to perform this action.")


class ProductListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = _get_role(request.user)
        products = Product.objects.filter(
            is_archived=False,
        ).filter(
            models.Q(supplier__isnull=True)
            | models.Q(supplier__user__is_archived=False)
        ).select_related(
            "category",
            "unit",
            "supplier",
        ).prefetch_related("internal_images", "services")

        if role == "BUSINESS":
            products = products.filter(status=Product.ProductStatus.ACTIVE)
        else:
            _check_product_permission(request.user, "view")

        serializer = ProductSerializer(
            products,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    def post(self, request):
        _check_product_permission(request.user, "create")
        internal_images = request.FILES.getlist("internal_images")
        if len(internal_images) > 4:
            raise ValidationError(
                {"internal_images": "A maximum of 4 internal images is allowed."}
            )
        try:
            for image in internal_images:
                validate_image_file(image)
        except DjangoValidationError as error:
            raise ValidationError({"internal_images": error.messages}) from error

        serializer = ProductSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            product = serializer.save()
            for image in internal_images:
                ProductInternalImage.objects.create(product=product, image=image)
            notify_businesses_of_new_product(product, request.user)
        product = Product.objects.prefetch_related("internal_images").get(pk=product.pk)
        return Response(
            ProductSerializer(product, context={"request": request}).data,
            status=HTTP_201_CREATED,
        )


class TopProductsByRfqVolumeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _check_product_permission(request.user, "view")

        products = (
            Product.objects.filter(
                is_archived=False,
            )
            .filter(
                models.Q(supplier__isnull=True)
                | models.Q(supplier__user__is_archived=False)
            )
            .select_related("category")
            .annotate(
                rfq_count=models.Count(
                    "rfqs",
                    filter=models.Q(
                        rfqs__is_archived=False,
                        rfqs__created_by__is_archived=False,
                    ),
                    distinct=True,
                )
            )
            .filter(rfq_count__gt=0)
            .order_by("-rfq_count", "product_name")[:10]
        )

        return Response([
            {
                "id": product.id,
                "product_name": product.product_name,
                "category_name": product.category.category_name,
                "image_url": (
                    request.build_absolute_uri(product.image.url)
                    if product.image
                    else ""
                ),
                "rfq_count": product.rfq_count,
            }
            for product in products
        ])


class PublicDomesticProductListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(
            product_type=Product.ProductType.DOMESTIC,
            status=Product.ProductStatus.ACTIVE,
            is_archived=False,
        ).filter(
            models.Q(supplier__isnull=True)
            | models.Q(supplier__user__is_archived=False)
        ).select_related(
            "category",
            "unit",
            "supplier",
        ).prefetch_related("internal_images", "services").order_by("-created_at")

        return Response(
            ProductSerializer(
                products,
                many=True,
                context={"request": request},
            ).data
        )


class PublicInternationalProductListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(
            product_type=Product.ProductType.INTERNATIONAL,
            status=Product.ProductStatus.ACTIVE,
            is_archived=False,
        ).filter(
            models.Q(supplier__isnull=True)
            | models.Q(supplier__user__is_archived=False)
        ).select_related(
            "category",
            "unit",
            "supplier",
        ).prefetch_related("internal_images", "services").order_by("-created_at")

        return Response(
            ProductSerializer(
                products,
                many=True,
                context={"request": request},
            ).data
        )


class ProductUnitListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _check_product_permission(request.user, "view")
        return Response(Unit.objects.order_by("name").values("id", "name"))

    def post(self, request):
        _check_product_permission(request.user, "create")
        name = str(request.data.get("name", "")).strip()

        if not name:
            raise ValidationError({"name": "This field is required."})
        if Unit.objects.filter(name__iexact=name).exists():
            raise ValidationError({"name": "Unit already exists."})

        unit = Unit.objects.create(name=name)
        return Response(
            {
                "id": unit.id,
                "name": unit.name,
            },
            status=HTTP_201_CREATED,
        )


class ProductCategoryListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _check_product_permission(request.user, "view")
        return Response(
            Category.objects.order_by("category_name").values(
                "id",
                name=models.F("category_name"),
            )
        )

    def post(self, request):
        _check_product_permission(request.user, "create")
        category_name = str(request.data.get("category_name", "")).strip()

        if not category_name:
            raise ValidationError({"category_name": "This field is required."})
        if Category.objects.filter(category_name__iexact=category_name).exists():
            raise ValidationError({"category_name": "Category already exists."})

        category = Category.objects.create(category_name=category_name)
        return Response(
            {
                "id": category.id,
                "name": category.category_name,
            },
            status=HTTP_201_CREATED,
        )


class ProductServiceListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if _get_role(request.user) != "BUSINESS":
            _check_product_permission(request.user, "view")
        return Response(
            Service.objects.order_by("service_name").values(
                "id",
                "service_price",
                "short_description",
                name=models.F("service_name"),
            )
        )

    def post(self, request):
        _check_product_permission(request.user, "create")
        service_name = str(request.data.get("service_name", "")).strip()
        service_price = request.data.get("service_price")
        short_description = str(request.data.get("short_description", "")).strip()

        if not service_name:
            raise ValidationError({"service_name": "This field is required."})
        if service_price in (None, ""):
            raise ValidationError({"service_price": "This field is required."})
        try:
            service_price = Decimal(str(service_price))
        except (InvalidOperation, ValueError):
            raise ValidationError({"service_price": "Enter a valid price."})
        if service_price < 0:
            raise ValidationError({"service_price": "Price cannot be negative."})
        if Service.objects.filter(service_name__iexact=service_name).exists():
            raise ValidationError({"service_name": "Service already exists."})

        service = Service.objects.create(
            service_name=service_name,
            service_price=service_price,
            short_description=short_description,
        )
        return Response(
            {
                "id": service.id,
                "name": service.service_name,
                "service_price": service.service_price,
                "short_description": service.short_description,
            },
            status=HTTP_201_CREATED,
        )


class ProductSupplierListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        _check_product_permission(request.user, "view")
        return Response(
            Supplier.objects.filter(
                user__is_archived=False,
            ).order_by("supplier_name").values(
                "id",
                name=models.F("supplier_name"),
            )
        )


class ProductDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, action):
        role = _get_role(user)
        products = Product.objects.filter(
            is_archived=False,
        ).filter(
            models.Q(supplier__isnull=True)
            | models.Q(supplier__user__is_archived=False)
        ).select_related(
            "category",
            "unit",
            "supplier",
        ).prefetch_related("internal_images", "services")

        if role == "BUSINESS" and action == "view":
            return products.filter(status=Product.ProductStatus.ACTIVE)

        _check_product_permission(user, action)
        return products

    def get(self, request, pk):
        products = self.get_object(request.user, "view")
        product = get_object_or_404(products, pk=pk)
        return Response(
            ProductSerializer(
                product,
                context={"request": request},
            ).data
        )

    def put(self, request, pk):
        products = self.get_object(request.user, "edit")
        product = get_object_or_404(products, pk=pk)
        internal_images = request.FILES.getlist("internal_images")
        if len(internal_images) > 4:
            raise ValidationError(
                {"internal_images": "A maximum of 4 internal images is allowed."}
            )
        try:
            for image in internal_images:
                validate_image_file(image)
        except DjangoValidationError as error:
            raise ValidationError({"internal_images": error.messages}) from error

        serializer = ProductSerializer(
            product,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            product = serializer.save()
            if internal_images:
                product.internal_images.all().delete()
                for image in internal_images:
                    ProductInternalImage.objects.create(product=product, image=image)
        product = Product.objects.prefetch_related("internal_images").get(pk=product.pk)
        return Response(
            ProductSerializer(product, context={"request": request}).data
        )

    def patch(self, request, pk):
        products = self.get_object(request.user, "edit")
        product = get_object_or_404(products, pk=pk)
        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        products = self.get_object(request.user, "delete")
        product = get_object_or_404(products, pk=pk)
        product.is_archived = True
        product.save(update_fields=["is_archived"])
        return Response(status=HTTP_204_NO_CONTENT)
