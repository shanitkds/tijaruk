from django.urls import path

from .views import (
    RFQCountryListAPIView,
    RFQDetailAPIView,
    RFQListCreateAPIView,
    RFQStatusAPIView,
    RFQUnitListAPIView,
)


urlpatterns = [
    path("", RFQListCreateAPIView.as_view(), name="rfq-list-create"),
    path("units/", RFQUnitListAPIView.as_view(), name="rfq-unit-list"),
    path("countries/", RFQCountryListAPIView.as_view(), name="rfq-country-list"),
    path("<int:pk>/", RFQDetailAPIView.as_view(), name="rfq-detail"),
    path("<int:pk>/status/", RFQStatusAPIView.as_view(), name="rfq-status"),
]
