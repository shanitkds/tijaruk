from django.contrib import admin
from supplier.models import Supplier

from .models import Product, ProductInternalImage, Category, Service

# Register your models here.


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            is_archived=False,
            supplier__user__is_archived=False,
        )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "supplier":
            kwargs["queryset"] = Supplier.objects.filter(user__is_archived=False)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


admin.site.register(Category)
admin.site.register(Service)
admin.site.register(ProductInternalImage)
