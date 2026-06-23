from django.urls import path

from .views import (
    ProductCategoryListAPIView,
    ProductDetailAPIView,
    ProductListCreateAPIView,
    PublicDomesticProductListAPIView,
    PublicInternationalProductListAPIView,
    ProductServiceListAPIView,
    ProductSupplierListAPIView,
    TopProductsByRfqVolumeAPIView,
    ProductUnitListAPIView,
)


urlpatterns = [
    path("", ProductListCreateAPIView.as_view(), name="product-list-create"),
    path(
        "public/domestic/",
        PublicDomesticProductListAPIView.as_view(),
        name="public-domestic-product-list",
    ),
    path(
        "public/international/",
        PublicInternationalProductListAPIView.as_view(),
        name="public-international-product-list",
    ),
    path("categories/", ProductCategoryListAPIView.as_view(), name="product-category-list"),
    path("services/", ProductServiceListAPIView.as_view(), name="product-service-list"),
    path("suppliers/", ProductSupplierListAPIView.as_view(), name="product-supplier-list"),
    path(
        "top-by-rfq-volume/",
        TopProductsByRfqVolumeAPIView.as_view(),
        name="top-products-by-rfq-volume",
    ),
    path("units/", ProductUnitListAPIView.as_view(), name="product-unit-list"),
    path("<int:pk>/", ProductDetailAPIView.as_view(), name="product-detail"),
]
