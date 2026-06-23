from datetime import date

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import InternalStaff, User
from accounts.models import PermissionModule, Role, RolePermission

from .models import ProductType, Supplier


class SupplierAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product_type = ProductType.objects.create(name="Machinery")
        self.supplier_user = User.objects.create_user(
            email="supplier@example.com",
            username="supplier",
            password="password",
            role=User.Role.SUPPLIER,
        )
        self.second_supplier_user = User.objects.create_user(
            email="supplier2@example.com",
            username="supplier2",
            password="password",
            role=User.Role.SUPPLIER,
        )
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="password",
            role=User.Role.ADMIN,
        )
        self.staff_role = Role.objects.create(role_name="Supplier staff")
        self.staff_user = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password="password",
            role=User.Role.INTERNAL_STAFF,
        )
        InternalStaff.objects.create(
            user=self.staff_user,
            role_obj=self.staff_role,
            full_name="Supplier Staff",
            date_of_birth=date(1990, 1, 1),
            gender=InternalStaff.Gender.OTHER,
            location="Dubai",
            phone="123456789",
        )

    def supplier_data(self, user=None):
        return {
            "user": (user or self.supplier_user).pk,
            "full_name": "Supplier Contact",
            "date_of_birth": "1990-01-01",
            "gender": "OTHER",
            "location": "Riyadh",
            "phone": "123456789",
            "supplier_name": "Supplier Company",
            "product_type": self.product_type.pk,
            "supplier_description": "Supplier description",
            "email": "contact@example.com",
            "website": "https://example.com",
            "supplier_status": Supplier.SupplierStatus.ACTIVE,
            "supplier_rating": "4.5",
            "payment_terms": "Net 30",
            "minimum_order_quantity": 10,
        }

    def test_admin_can_create_list_update_and_archive_supplier(self):
        self.client.force_authenticate(self.admin_user)

        create_response = self.client.post(
            "/api/suppliers/",
            self.supplier_data(),
            format="json",
        )
        supplier_id = create_response.data["id"]
        list_response = self.client.get("/api/suppliers/")
        update_response = self.client.patch(
            f"/api/suppliers/{supplier_id}/",
            {"supplier_name": "Updated Supplier"},
            format="json",
        )
        put_response = self.client.put(
            f"/api/suppliers/{supplier_id}/",
            self.supplier_data(self.second_supplier_user),
            format="json",
        )
        delete_response = self.client.delete(f"/api/suppliers/{supplier_id}/")

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(create_response.data["user_email"], self.supplier_user.email)
        self.assertEqual(create_response.data["user_id"], self.supplier_user.user_id)
        self.assertIn("user_date_joined", create_response.data)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data["supplier_name"], "Updated Supplier")
        self.assertEqual(put_response.status_code, 405)
        self.assertEqual(delete_response.status_code, 204)
        self.assertTrue(
            Supplier.objects.filter(
                pk=supplier_id,
                user__is_archived=True,
            ).exists()
        )
        self.assertEqual(self.client.get("/api/suppliers/").data, [])

    def test_supplier_user_relation_requires_supplier_role(self):
        self.client.force_authenticate(self.admin_user)
        data = self.supplier_data()
        data["user"] = self.admin_user.pk

        response = self.client.post("/api/suppliers/", data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("user", response.data)

    def test_admin_can_create_supplier_and_login_user_with_password(self):
        self.client.force_authenticate(self.admin_user)
        data = self.supplier_data()
        data.pop("user")
        data["email"] = "new-supplier@example.com"
        data["password"] = "strong-password"

        response = self.client.post("/api/suppliers/", data, format="json")

        self.assertEqual(response.status_code, 201)
        supplier = Supplier.objects.select_related("user").get(pk=response.data["id"])
        self.assertEqual(supplier.user.email, data["email"])
        self.assertEqual(supplier.user.role, User.Role.SUPPLIER)
        self.assertTrue(supplier.user.check_password(data["password"]))
        self.assertNotIn("password", response.data)

    def test_internal_staff_permissions_control_supplier_crud(self):
        permission = RolePermission.objects.create(
            role=self.staff_role,
            module=PermissionModule.SUPPLIERS,
            can_view=True,
            can_create=True,
            can_edit=True,
            can_delete=True,
        )
        self.client.force_authenticate(self.staff_user)

        create_response = self.client.post(
            "/api/suppliers/",
            self.supplier_data(),
            format="json",
        )
        supplier_id = create_response.data["id"]
        update_response = self.client.patch(
            f"/api/suppliers/{supplier_id}/",
            {"supplier_status": Supplier.SupplierStatus.INACTIVE},
            format="json",
        )
        delete_response = self.client.delete(f"/api/suppliers/{supplier_id}/")

        self.assertTrue(permission.can_create)
        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(delete_response.status_code, 204)
        self.assertTrue(Supplier.objects.get(pk=supplier_id).user.is_archived)

    def test_internal_staff_without_permission_is_denied(self):
        self.client.force_authenticate(self.staff_user)

        list_response = self.client.get("/api/suppliers/")
        create_response = self.client.post(
            "/api/suppliers/",
            self.supplier_data(),
            format="json",
        )

        self.assertEqual(list_response.status_code, 403)
        self.assertEqual(create_response.status_code, 403)

    def test_product_type_list_returns_names(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.get("/api/suppliers/product-types/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["name"], self.product_type.name)

    def test_supplier_cannot_access_supplier_profiles(self):
        own_supplier = Supplier.objects.create(
            **{
                key: value
                for key, value in self.supplier_data().items()
                if key not in {"user", "product_type"}
            },
            user=self.supplier_user,
            product_type=self.product_type,
        )
        other_supplier = Supplier.objects.create(
            **{
                key: value
                for key, value in self.supplier_data(self.second_supplier_user).items()
                if key not in {"user", "product_type", "email"}
            },
            user=self.second_supplier_user,
            product_type=self.product_type,
            email="other-contact@example.com",
        )
        self.client.force_authenticate(self.supplier_user)

        own_get_response = self.client.get(f"/api/suppliers/{own_supplier.pk}/")
        own_patch_response = self.client.patch(
            f"/api/suppliers/{own_supplier.pk}/",
            {"payment_terms": "Net 45"},
            format="json",
        )
        other_get_response = self.client.get(f"/api/suppliers/{other_supplier.pk}/")
        other_patch_response = self.client.patch(
            f"/api/suppliers/{other_supplier.pk}/",
            {"payment_terms": "Net 90"},
            format="json",
        )
        delete_response = self.client.delete(f"/api/suppliers/{own_supplier.pk}/")

        self.assertEqual(own_get_response.status_code, 403)
        self.assertEqual(own_patch_response.status_code, 403)
        self.assertEqual(other_get_response.status_code, 403)
        self.assertEqual(other_patch_response.status_code, 403)
        self.assertEqual(delete_response.status_code, 403)
