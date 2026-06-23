from django.contrib import admin
from django.db import models

from products.models import Product

from .models import Country, RFQ, Unit

admin.site.register(Country)


@admin.register(RFQ)
class RFQAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            is_archived=False,
            created_by__is_archived=False,
        ).filter(
            models.Q(product__isnull=True)
            | models.Q(
                product__is_archived=False,
                product__supplier__user__is_archived=False,
            )
        )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "product":
            kwargs["queryset"] = Product.objects.filter(
                is_archived=False,
                supplier__user__is_archived=False,
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


admin.site.register(Unit)
