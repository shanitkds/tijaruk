from django.urls import path

from .views import (
    ProductTypeListAPIView,
    SupplierDetailAPIView,
    SupplierListCreateAPIView,
)


urlpatterns = [
    path("", SupplierListCreateAPIView.as_view(), name="supplier-list-create"),
    path(
        "product-types/",
        ProductTypeListAPIView.as_view(),
        name="supplier-product-type-list",
    ),
    path("<int:pk>/", SupplierDetailAPIView.as_view(), name="supplier-detail"),
]
