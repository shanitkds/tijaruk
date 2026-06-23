from django.contrib import admin

from .models import ProductType, Supplier


admin.site.register(ProductType)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        return super().get_queryset(request).filter(user__is_archived=False)
