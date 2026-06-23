from datetime import date, timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import InternalStaff, User
from notifications.models import UserNotification
from products.models import Category, Product, Service
from supplier.models import ProductType, Supplier
from accounts.models import PermissionModule, Role, RolePermission

from .models import Country, RFQ, Unit


class RFQAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.unit = Unit.objects.create(name="Pieces")
        self.country = Country.objects.create(name="Saudi Arabia")
        self.category = Category.objects.create(category_name="Electronics")
        self.service = Service.objects.create(service_name="Delivery")
        self.supplier = User.objects.create_user(
            email="supplier@example.com",
            username="supplier",
            password="password",
            role=User.Role.SUPPLIER,
        )
        supplier_product_type = ProductType.objects.create(name="Electronics")
        self.supplier_profile = Supplier.objects.create(
            user=self.supplier,
            full_name="Supplier Contact",
            date_of_birth=date(1990, 1, 1),
            gender=Supplier.Gender.OTHER,
            location="Riyadh",
            phone="123456789",
            supplier_name="Supplier Company",
            product_type=supplier_product_type,
            email="supplier-contact@example.com",
            supplier_status=Supplier.SupplierStatus.ACTIVE,
        )
        self.product = Product.objects.create(
            product_name="Industrial Product",
            category=self.category,
            price="100.00",
            supplier=self.supplier_profile,
            stock_quantity=500,
        )
        self.product.services.set([self.service])
        self.other_supplier = User.objects.create_user(
            email="other-supplier@example.com",
            username="other-supplier",
            password="password",
            role=User.Role.SUPPLIER,
        )
        self.business_user = User.objects.create_user(
            email="buyer@example.com",
            username="buyer",
            password="password",
            role=User.Role.BUSINESS,
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="password",
            role=User.Role.ADMIN,
        )
        self.staff_role = Role.objects.create(role_name="RFQ staff")
        self.staff = User.objects.create_user(
            email="staff@example.com",
            username="staff",
            password="password",
            role=User.Role.INTERNAL_STAFF,
        )
        InternalStaff.objects.create(
            user=self.staff,
            role_obj=self.staff_role,
            full_name="RFQ Staff",
            date_of_birth=date(1990, 1, 1),
            gender=InternalStaff.Gender.OTHER,
            location="Riyadh",
            phone="123456789",
        )

    def rfq_data(self, **overrides):
        data = {
            "quantity_required": 100,
            "product": self.product.pk,
            "unit": self.unit.pk,
            "target_delivery_date": timezone.localdate() + timedelta(days=30),
            "preferred_country_of_origin": self.country.pk,
            "additional_service": self.service.pk,
            "additional_details": "Standard packaging required.",
        }
        data.update(overrides)
        return data

    def create_rfq(self, owner=None, status=RFQ.Status.PENDING, product=None):
        return RFQ.objects.create(
            created_by=owner or self.supplier,
            product=self.product if product is None else product,
            status=status,
            quantity_required=50,
            unit=self.unit,
            target_delivery_date=timezone.localdate() + timedelta(days=20),
            preferred_country_of_origin=self.country,
            additional_details="Existing RFQ",
        )

    def test_supplier_cannot_manage_rfqs_without_staff_permission(self):
        rfq = self.create_rfq(owner=self.supplier)
        self.client.force_authenticate(self.supplier)

        create_response = self.client.post(
            "/api/rfqs/",
            self.rfq_data(status=RFQ.Status.APPROVED),
            format="json",
        )
        list_response = self.client.get("/api/rfqs/")
        detail_response = self.client.get(f"/api/rfqs/{rfq.pk}/")
        edit_response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/",
            {
                "quantity_required": 125,
                "status": RFQ.Status.APPROVED,
            },
            format="json",
        )
        delete_response = self.client.delete(f"/api/rfqs/{rfq.pk}/")

        self.assertEqual(create_response.status_code, 403)
        self.assertEqual(list_response.status_code, 403)
        self.assertEqual(detail_response.status_code, 403)
        self.assertEqual(edit_response.status_code, 403)
        self.assertEqual(delete_response.status_code, 403)

    def test_business_can_create_and_list_own_rfqs(self):
        permitted_staff = RolePermission.objects.create(
            role=self.staff_role,
            module=PermissionModule.RFQS,
            can_view=True,
        )
        self.client.force_authenticate(self.business_user)

        create_response = self.client.post(
            "/api/rfqs/",
            self.rfq_data(),
            format="json",
        )
        list_response = self.client.get("/api/rfqs/")

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(
            create_response.data["rfq_id"],
            f"RFQ-{create_response.data['id']:05d}",
        )
        self.assertEqual(create_response.data["created_by"], self.business_user.pk)
        self.assertEqual(
            [item["id"] for item in list_response.data],
            [create_response.data["id"]],
        )
        self.assertTrue(permitted_staff.can_view)
        self.assertEqual(
            UserNotification.objects.filter(user=self.business_user).count(),
            1,
        )
        self.assertEqual(
            UserNotification.objects.filter(user=self.admin).count(),
            1,
        )
        self.assertEqual(
            UserNotification.objects.filter(user=self.staff).count(),
            1,
        )

    def test_rfq_notification_excludes_staff_without_view_or_edit_permission(self):
        RolePermission.objects.create(
            role=self.staff_role,
            module=PermissionModule.RFQS,
            can_create=True,
        )
        self.client.force_authenticate(self.business_user)

        response = self.client.post("/api/rfqs/", self.rfq_data(), format="json")

        self.assertEqual(response.status_code, 201)
        self.assertFalse(
            UserNotification.objects.filter(user=self.staff).exists()
        )

    def test_public_can_load_rfq_lookups(self):
        units_response = self.client.get("/api/rfqs/units/")
        countries_response = self.client.get("/api/rfqs/countries/")

        self.assertEqual(units_response.status_code, 200)
        self.assertEqual(
            list(units_response.data),
            [{"id": self.unit.pk, "name": self.unit.name}],
        )
        self.assertEqual(countries_response.status_code, 200)
        self.assertEqual(
            list(countries_response.data),
            [{"id": self.country.pk, "name": self.country.name}],
        )

    def test_business_can_create_multipart_rfq_with_additional_service(self):
        self.client.force_authenticate(self.business_user)
        data = self.rfq_data()

        response = self.client.post("/api/rfqs/", data, format="multipart")

        self.assertEqual(response.status_code, 201)
        rfq = RFQ.objects.get(pk=response.data["id"])
        self.assertEqual(rfq.additional_service, self.service)

    def test_rfq_quantity_must_meet_product_minimum_quantity(self):
        self.product.minimum_quantity = 150
        self.product.unit = self.unit
        self.product.save(update_fields=["minimum_quantity", "unit"])
        self.client.force_authenticate(self.business_user)

        response = self.client.post(
            "/api/rfqs/",
            self.rfq_data(quantity_required=100),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("quantity_required", response.data)

    def test_supplier_cannot_use_status_endpoint(self):
        rfq = self.create_rfq()
        self.client.force_authenticate(self.supplier)

        response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/status/",
            {"status": RFQ.Status.APPROVED},
            format="json",
        )

        rfq.refresh_from_db()
        self.assertEqual(response.status_code, 403)
        self.assertEqual(rfq.status, RFQ.Status.PENDING)

    def test_approving_rfq_decreases_product_stock(self):
        rfq = self.create_rfq(owner=self.business_user)
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/status/",
            {"status": RFQ.Status.APPROVED},
            format="json",
        )

        rfq.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(rfq.status, RFQ.Status.APPROVED)
        self.assertTrue(rfq.stock_deducted)
        self.assertEqual(self.product.stock_quantity, 450)
        self.assertEqual(response.data["product_stock_quantity"], 450)

    def test_rfq_cannot_be_approved_without_enough_stock(self):
        self.product.stock_quantity = 25
        self.product.save(update_fields=["stock_quantity"])
        rfq = self.create_rfq(owner=self.business_user)
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/status/",
            {"status": RFQ.Status.APPROVED},
            format="json",
        )

        rfq.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        self.assertIn("Cannot approve this RFQ", response.data["detail"])
        self.assertEqual(rfq.status, RFQ.Status.PENDING)
        self.assertFalse(rfq.stock_deducted)
        self.assertEqual(self.product.stock_quantity, 25)

    def test_admin_can_manage_all_rfqs_and_edit_resets_status_to_pending(self):
        rfq = self.create_rfq(status=RFQ.Status.APPROVED)
        self.client.force_authenticate(self.admin)

        list_response = self.client.get("/api/rfqs/")
        status_response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/status/",
            {"status": RFQ.Status.REJECTED},
            format="json",
        )
        approve_response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/status/",
            {"status": RFQ.Status.APPROVED},
            format="json",
        )
        edit_response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/",
            {"additional_details": "Admin edited this RFQ."},
            format="json",
        )
        create_response = self.client.post(
            "/api/rfqs/",
            self.rfq_data(),
            format="json",
        )
        delete_response = self.client.delete(
            f"/api/rfqs/{create_response.data['id']}/"
        )

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.data["status"], RFQ.Status.REJECTED)
        self.assertEqual(approve_response.status_code, 200)
        self.assertEqual(approve_response.data["status"], RFQ.Status.APPROVED)
        self.assertEqual(edit_response.status_code, 200)
        self.assertEqual(edit_response.data["status"], RFQ.Status.PENDING)
        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(create_response.data["created_by"], self.admin.pk)
        self.assertEqual(create_response.data["status"], RFQ.Status.PENDING)
        self.assertEqual(delete_response.status_code, 204)

    def test_approved_or_rejected_rfq_notifies_submitter(self):
        rfq = self.create_rfq(owner=self.business_user)
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/status/",
            {"status": RFQ.Status.REJECTED},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        notification = UserNotification.objects.get(user=self.business_user)
        self.assertEqual(notification.notification.title, "RFQ rejected")
        self.assertIn(rfq.rfq_id, notification.notification.message)

    def test_internal_staff_permissions_control_each_action(self):
        rfq = self.create_rfq()
        permission = RolePermission.objects.create(
            role=self.staff_role,
            module=PermissionModule.RFQS,
        )
        self.client.force_authenticate(self.staff)

        self.assertEqual(self.client.get("/api/rfqs/").status_code, 403)
        permission.can_view = True
        permission.save(update_fields=["can_view"])
        self.assertEqual(self.client.get("/api/rfqs/").status_code, 200)

        self.assertEqual(
            self.client.post("/api/rfqs/", self.rfq_data(), format="json").status_code,
            403,
        )
        permission.can_create = True
        permission.save(update_fields=["can_create"])
        create_response = self.client.post(
            "/api/rfqs/",
            self.rfq_data(),
            format="json",
        )
        self.assertEqual(create_response.status_code, 201)

        self.assertEqual(
            self.client.patch(
                f"/api/rfqs/{rfq.pk}/",
                {"quantity_required": 75},
                format="json",
            ).status_code,
            403,
        )
        permission.can_edit = True
        permission.save(update_fields=["can_edit"])
        self.assertEqual(
            self.client.patch(
                f"/api/rfqs/{rfq.pk}/",
                {"quantity_required": 75},
                format="json",
            ).status_code,
            200,
        )

        self.assertEqual(
            self.client.patch(
                f"/api/rfqs/{rfq.pk}/status/",
                {"status": RFQ.Status.APPROVED},
                format="json",
            ).status_code,
            403,
        )
        permission.can_approve = True
        permission.save(update_fields=["can_approve"])
        status_response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/status/",
            {"status": RFQ.Status.APPROVED},
            format="json",
        )
        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.data["status"], RFQ.Status.APPROVED)

        self.assertEqual(
            self.client.delete(f"/api/rfqs/{rfq.pk}/").status_code,
            403,
        )
        permission.can_delete = True
        permission.save(update_fields=["can_delete"])
        self.assertEqual(
            self.client.delete(f"/api/rfqs/{rfq.pk}/").status_code,
            204,
        )

    def test_invalid_status_is_rejected(self):
        rfq = self.create_rfq()
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/rfqs/{rfq.pk}/status/",
            {"status": "UNKNOWN"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_rfqs_for_archived_users_are_hidden(self):
        rfq = self.create_rfq()
        self.supplier.is_archived = True
        self.supplier.save(update_fields=["is_archived"])
        self.client.force_authenticate(self.admin)

        list_response = self.client.get("/api/rfqs/")
        detail_response = self.client.get(f"/api/rfqs/{rfq.pk}/")

        self.assertNotIn(rfq.pk, [item["id"] for item in list_response.data])
        self.assertEqual(detail_response.status_code, 404)

    def test_rfqs_for_archived_products_are_hidden(self):
        rfq = self.create_rfq()
        self.product.is_archived = True
        self.product.save(update_fields=["is_archived"])
        self.client.force_authenticate(self.admin)

        list_response = self.client.get("/api/rfqs/")
        detail_response = self.client.get(f"/api/rfqs/{rfq.pk}/")

        self.assertNotIn(rfq.pk, [item["id"] for item in list_response.data])
        self.assertEqual(detail_response.status_code, 404)

    def test_archived_supplier_products_are_hidden_from_rfqs(self):
        rfq = self.create_rfq()
        self.supplier.is_archived = True
        self.supplier.save(update_fields=["is_archived"])
        self.client.force_authenticate(self.admin)

        list_response = self.client.get("/api/rfqs/")
        detail_response = self.client.get(f"/api/rfqs/{rfq.pk}/")
        create_response = self.client.post(
            "/api/rfqs/",
            self.rfq_data(),
            format="json",
        )

        self.assertNotIn(rfq.pk, [item["id"] for item in list_response.data])
        self.assertEqual(detail_response.status_code, 404)
        self.assertEqual(create_response.status_code, 400)
