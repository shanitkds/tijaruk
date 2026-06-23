import base64
from datetime import date
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from django.test import TestCase

from accounts.models import InternalStaff, User
from notifications.models import UserNotification
from supplier.models import ProductType, Supplier
from accounts.models import PermissionModule, Role, RolePermission
from rfqs.models import RFQ, Unit

from .models import Category, Product, ProductInternalImage, Service


class ProductAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(category_name="Electronics")
        self.service = Service.objects.create(service_name="Delivery")
        self.unit = Unit.objects.create(name="Pieces")
        self.supplier_user = User.objects.create_user(
            email="supplier@example.com",
            username="supplier",
            password="password",
            role=User.Role.SUPPLIER,
        )
        self.supplier_product_type = ProductType.objects.create(name="Electronics")
        self.supplier = Supplier.objects.create(
            user=self.supplier_user,
            full_name="Supplier Contact",
            date_of_birth=date(1990, 1, 1),
            gender=Supplier.Gender.OTHER,
            location="Dubai",
            phone="123456789",
            supplier_name="Supplier Company",
            product_type=self.supplier_product_type,
            email="supplier-contact@example.com",
            supplier_status=Supplier.SupplierStatus.ACTIVE,
        )
        self.active_product = self.create_product("Active", Product.ProductStatus.ACTIVE)
        self.inactive_product = self.create_product(
            "Inactive",
            Product.ProductStatus.INACTIVE,
        )
        self.business_user = User.objects.create_user(
            email="buyer@example.com",
            username="buyer",
            password="password",
            role=User.Role.BUSINESS,
        )
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="password",
            role=User.Role.ADMIN,
        )
        self.staff_role = Role.objects.create(role_name="Product staff")
        self.staff_user = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password="password",
            role=User.Role.INTERNAL_STAFF,
        )
        InternalStaff.objects.create(
            user=self.staff_user,
            role_obj=self.staff_role,
            full_name="Product Staff",
            date_of_birth=date(1990, 1, 1),
            gender=InternalStaff.Gender.OTHER,
            location="Dubai",
            phone="987654321",
        )

    def create_product(self, name, status):
        product = Product.objects.create(
            product_name=name,
            category=self.category,
            description="Description",
            price="100.00",
            stock_quantity=10,
            supplier=self.supplier,
            status=status,
            shipping_cost="5.00",
        )
        product.services.set([self.service])
        return product

    def product_data(self, name="Created product"):
        return {
            "product_name": name,
            "product_type": Product.ProductType.DOMESTIC,
            "category": self.category.pk,
            "description": "Description",
            "price": "150.00",
            "stock_quantity": 20,
            "unit": self.unit.pk,
            "supplier": self.supplier.pk,
            "services": [self.service.pk],
            "status": Product.ProductStatus.ACTIVE,
            "shipping_cost": "10.00",
        }

    def test_supplier_cannot_list_products_without_staff_permission(self):
        self.client.force_authenticate(self.supplier_user)

        response = self.client.get("/api/products/")

        self.assertEqual(response.status_code, 403)

    def test_business_lists_only_active_products(self):
        self.client.force_authenticate(self.business_user)

        response = self.client.get("/api/products/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in response.data], [self.active_product.pk])

    def test_public_domestic_list_requires_no_auth_and_filters_products(self):
        international_product = self.create_product(
            "International",
            Product.ProductStatus.ACTIVE,
        )
        international_product.product_type = Product.ProductType.INTERNATIONAL
        international_product.save(update_fields=["product_type"])
        archived_product = self.create_product(
            "Archived",
            Product.ProductStatus.ACTIVE,
        )
        archived_product.is_archived = True
        archived_product.save(update_fields=["is_archived"])

        response = self.client.get("/api/products/public/domestic/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["id"] for item in response.data],
            [self.active_product.pk],
        )

    def test_public_international_list_requires_no_auth_and_filters_products(self):
        international_product = self.create_product(
            "International",
            Product.ProductStatus.ACTIVE,
        )
        international_product.product_type = Product.ProductType.INTERNATIONAL
        international_product.save(update_fields=["product_type"])
        inactive_international = self.create_product(
            "Inactive International",
            Product.ProductStatus.INACTIVE,
        )
        inactive_international.product_type = Product.ProductType.INTERNATIONAL
        inactive_international.save(update_fields=["product_type"])

        response = self.client.get("/api/products/public/international/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["id"] for item in response.data],
            [international_product.pk],
        )

    def test_archived_supplier_products_are_hidden_from_list_and_detail(self):
        self.supplier_user.is_archived = True
        self.supplier_user.save(update_fields=["is_archived"])
        self.client.force_authenticate(self.admin_user)

        list_response = self.client.get("/api/products/")
        detail_response = self.client.get(
            f"/api/products/{self.active_product.pk}/"
        )

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.data, [])
        self.assertEqual(detail_response.status_code, 404)

    def test_product_cannot_be_created_for_archived_supplier(self):
        self.supplier_user.is_archived = True
        self.supplier_user.save(update_fields=["is_archived"])
        self.client.force_authenticate(self.admin_user)

        response = self.client.post(
            "/api/products/",
            self.product_data(),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("supplier", response.data)

    def test_supplier_cannot_access_products_or_create(self):
        self.client.force_authenticate(self.supplier_user)

        detail_response = self.client.get(
            f"/api/products/{self.active_product.pk}/"
        )
        create_response = self.client.post(
            "/api/products/",
            self.product_data(),
            format="json",
        )

        self.assertEqual(detail_response.status_code, 403)
        self.assertEqual(create_response.status_code, 403)

    def test_internal_staff_needs_view_permission(self):
        self.client.force_authenticate(self.staff_user)

        denied_response = self.client.get("/api/products/")
        RolePermission.objects.create(
            role=self.staff_role,
            module=PermissionModule.PRODUCTS,
            can_view=True,
        )
        allowed_response = self.client.get("/api/products/")

        self.assertEqual(denied_response.status_code, 403)
        self.assertEqual(allowed_response.status_code, 200)
        self.assertEqual(len(allowed_response.data), 2)

    def test_top_products_by_rfq_volume_uses_real_counts(self):
        for _ in range(2):
            RFQ.objects.create(
                created_by=self.business_user,
                product=self.active_product,
                quantity_required=2,
                unit=self.unit,
                target_delivery_date=date.today(),
            )
        RFQ.objects.create(
            created_by=self.business_user,
            product=self.inactive_product,
            quantity_required=1,
            unit=self.unit,
            target_delivery_date=date.today(),
        )
        archived_rfq = RFQ.objects.create(
            created_by=self.business_user,
            product=self.inactive_product,
            quantity_required=1,
            unit=self.unit,
            target_delivery_date=date.today(),
        )
        archived_rfq.is_archived = True
        archived_rfq.save(update_fields=["is_archived"])
        self.client.force_authenticate(self.admin_user)

        response = self.client.get("/api/products/top-by-rfq-volume/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [(item["id"], item["rfq_count"]) for item in response.data],
            [(self.active_product.pk, 2), (self.inactive_product.pk, 1)],
        )

    def test_top_products_by_rfq_volume_requires_product_view_permission(self):
        self.client.force_authenticate(self.business_user)
        self.assertEqual(
            self.client.get("/api/products/top-by-rfq-volume/").status_code,
            403,
        )

        self.client.force_authenticate(self.staff_user)
        denied_response = self.client.get("/api/products/top-by-rfq-volume/")
        RolePermission.objects.create(
            role=self.staff_role,
            module=PermissionModule.PRODUCTS,
            can_view=True,
        )
        allowed_response = self.client.get("/api/products/top-by-rfq-volume/")

        self.assertEqual(denied_response.status_code, 403)
        self.assertEqual(allowed_response.status_code, 200)

    def test_internal_staff_permissions_control_create_edit_and_delete(self):
        permission = RolePermission.objects.create(
            role=self.staff_role,
            module=PermissionModule.PRODUCTS,
            can_view=True,
            can_create=True,
            can_edit=True,
            can_delete=True,
        )
        self.client.force_authenticate(self.staff_user)

        create_response = self.client.post(
            "/api/products/",
            self.product_data(),
            format="json",
        )
        product_id = create_response.data["id"]
        edit_response = self.client.patch(
            f"/api/products/{product_id}/",
            {"product_name": "Updated product"},
            format="json",
        )
        delete_response = self.client.delete(f"/api/products/{product_id}/")

        self.assertTrue(permission.can_create)
        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(edit_response.status_code, 200)
        self.assertEqual(edit_response.data["product_name"], "Updated product")
        self.assertEqual(delete_response.status_code, 204)
        self.assertTrue(Product.objects.get(pk=product_id).is_archived)
        self.assertNotIn(
            product_id,
            [item["id"] for item in self.client.get("/api/products/").data],
        )
        self.assertEqual(
            self.client.get(f"/api/products/{product_id}/").status_code,
            404,
        )

    def test_admin_can_list_and_create_without_role_permission(self):
        self.client.force_authenticate(self.admin_user)

        list_response = self.client.get("/api/products/")
        create_response = self.client.post(
            "/api/products/",
            self.product_data("Admin product"),
            format="json",
        )

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 2)
        self.assertEqual(create_response.status_code, 201)
        notification = UserNotification.objects.get(user=self.business_user)
        self.assertEqual(notification.notification.title, "New product available")
        self.assertIn("Admin product", notification.notification.message)

    def test_admin_can_create_product_with_internal_images(self):
        self.client.force_authenticate(self.admin_user)
        image_content = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
        )
        data = self.product_data("Product with images")
        data["internal_images"] = [
            SimpleUploadedFile(
                f"internal-{index}.png",
                image_content,
                content_type="image/png",
            )
            for index in range(2)
        ]

        image_storage = ProductInternalImage._meta.get_field("image").storage
        with patch.object(
            image_storage,
            "save",
            side_effect=lambda name, content, max_length=None: name,
        ):
            response = self.client.post(
                "/api/products/",
                data,
                format="multipart",
            )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            ProductInternalImage.objects.filter(product_id=response.data["id"]).count(),
            2,
        )
        self.assertEqual(len(response.data["internal_images"]), 2)

    def test_product_create_rejects_more_than_four_internal_images(self):
        self.client.force_authenticate(self.admin_user)
        data = self.product_data("Too many images")
        data["internal_images"] = [
            SimpleUploadedFile(
                f"internal-{index}.png",
                b"image",
                content_type="image/png",
            )
            for index in range(5)
        ]

        response = self.client.post(
            "/api/products/",
            data,
            format="multipart",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Product.objects.filter(product_name="Too many images").count(), 0)

    def test_admin_can_list_product_creation_lookups(self):
        self.client.force_authenticate(self.admin_user)

        category_response = self.client.get("/api/products/categories/")
        supplier_response = self.client.get("/api/products/suppliers/")
        service_response = self.client.get("/api/products/services/")

        self.assertEqual(category_response.status_code, 200)
        self.assertEqual(category_response.data[0]["name"], self.category.category_name)
        self.assertEqual(supplier_response.status_code, 200)
        self.assertEqual(supplier_response.data[0]["name"], self.supplier.supplier_name)
        self.assertEqual(service_response.status_code, 200)
        self.assertEqual(service_response.data[0]["name"], self.service.service_name)

    def test_admin_can_update_product_with_full_multipart_payload(self):
        self.client.force_authenticate(self.admin_user)
        data = self.product_data("Updated through edit form")

        response = self.client.put(
            f"/api/products/{self.active_product.pk}/",
            data,
            format="multipart",
        )

        self.assertEqual(response.status_code, 200)
        self.active_product.refresh_from_db()
        self.assertEqual(
            self.active_product.product_name,
            "Updated through edit form",
        )
        self.assertEqual(self.active_product.unit, self.unit)
