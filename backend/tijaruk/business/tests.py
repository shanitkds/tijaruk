from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory, TestCase
from rest_framework.test import APIClient

from accounts.models import User

from .admin import BusinessAdmin
from .models import Business


class BusinessCreationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="password",
            role=User.Role.ADMIN,
        )

    def business_data(self):
        return {
            "location": "Riyadh",
            "email": "business@example.com",
            "phone": "+966500000000",
            "password": "strong-password",
        }

    def test_api_creates_business_login_user(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.post(
            "/api/businesses/",
            self.business_data(),
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        business = Business.objects.select_related("user").get(pk=response.data["id"])
        self.assertEqual(business.user.email, "business@example.com")
        self.assertEqual(business.user.phone, "+966500000000")
        self.assertEqual(business.user.role, User.Role.BUSINESS)
        self.assertTrue(business.user.check_password("strong-password"))
        self.assertNotIn("password", response.data)

    def test_api_requires_password_when_creating_business(self):
        self.client.force_authenticate(self.admin_user)
        data = self.business_data()
        data.pop("password")

        response = self.client.post("/api/businesses/", data, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)

    def test_api_lists_backend_business_data_and_archives_business(self):
        self.client.force_authenticate(self.admin_user)
        create_response = self.client.post(
            "/api/businesses/",
            self.business_data(),
            format="json",
        )

        list_response = self.client.get("/api/businesses/?page_size=100")
        delete_response = self.client.delete(
            f"/api/businesses/{create_response.data['id']}/"
        )
        list_after_delete = self.client.get("/api/businesses/?page_size=100")

        self.assertEqual(list_response.status_code, 200, list_response.data)
        row = list_response.data["results"][0]
        self.assertEqual(row["email"], "business@example.com")
        self.assertEqual(row["location"], "Riyadh")
        self.assertIn("created_at", row)
        self.assertEqual(delete_response.status_code, 204)
        self.assertEqual(list_after_delete.data["results"], [])
        business = Business.objects.select_related("user").get(
            pk=create_response.data["id"]
        )
        self.assertTrue(business.is_archived)
        self.assertTrue(business.user.is_archived)

    def test_api_lists_user_photo(self):
        self.client.force_authenticate(self.admin_user)
        create_response = self.client.post(
            "/api/businesses/",
            self.business_data(),
            format="json",
        )
        business = Business.objects.select_related("user").get(
            pk=create_response.data["id"]
        )
        business.user.photo = "users/photos/profile.jpg"
        business.user.save(update_fields=["photo"])

        response = self.client.get("/api/businesses/?page_size=100")

        self.assertEqual(response.status_code, 200)
        row = response.data["results"][0]
        self.assertTrue(row["user_photo"].endswith("/media/users/photos/profile.jpg"))

    def test_admin_can_archive_user_without_business_profile(self):
        self.client.force_authenticate(self.admin_user)
        business_user = User.objects.create_user(
            email="delete-user@example.com",
            username="delete-user",
            password="password",
            role=User.Role.BUSINESS,
        )

        response = self.client.delete(f"/api/business-users/{business_user.user_id}/")

        self.assertEqual(response.status_code, 204)
        business_user.refresh_from_db()
        self.assertTrue(business_user.is_archived)
        self.assertFalse(business_user.is_active)

    def test_admin_can_create_profile_for_existing_business_user(self):
        self.client.force_authenticate(self.admin_user)
        business_user = User.objects.create_user(
            email="complete-user@example.com",
            username="complete-user",
            password="password",
            role=User.Role.BUSINESS,
        )
        data = self.business_data()
        data["email"] = business_user.email
        data.pop("password")

        response = self.client.patch(
            f"/api/business-users/{business_user.user_id}/",
            data,
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        business = Business.objects.get(user=business_user)
        self.assertEqual(business.location, "Riyadh")
        business_user.refresh_from_db()
        self.assertEqual(business_user.email, "complete-user@example.com")
        self.assertEqual(business_user.phone, "+966500000000")

    def test_business_user_profile_returns_and_updates_user_and_business_data(self):
        business_user = User.objects.create_user(
            email="profile@example.com",
            username="profile-user",
            password="password",
            full_name="Profile User",
            phone="+966500000010",
            role=User.Role.BUSINESS,
        )
        business = Business.objects.create(
            user=business_user,
            location="Riyadh",
            language="English (EN)",
        )
        self.client.force_authenticate(business_user)

        get_response = self.client.get("/api/business-profile/")

        self.assertEqual(get_response.status_code, 200, get_response.data)
        self.assertEqual(get_response.data["user"]["name"], "Profile User")
        self.assertEqual(get_response.data["user"]["username"], "profile-user")
        self.assertEqual(get_response.data["user"]["role"], User.Role.BUSINESS)
        self.assertEqual(get_response.data["user"]["email"], "profile@example.com")
        self.assertEqual(get_response.data["user"]["phone"], "+966500000010")
        self.assertEqual(get_response.data["company"]["location"], "Riyadh")
        self.assertEqual(get_response.data["company"]["totalRfqs"], 0)

        patch_response = self.client.patch(
            "/api/business-profile/",
            {
                "full_name": "Updated User",
                "username": "updated-profile-user",
                "email": "updated-profile@example.com",
                "phone": "+966500000011",
                "location": "Jeddah",
                "language": "Arabic (AR)",
            },
            format="json",
        )

        self.assertEqual(patch_response.status_code, 200, patch_response.data)
        business_user.refresh_from_db()
        business.refresh_from_db()
        self.assertEqual(business_user.full_name, "Updated User")
        self.assertEqual(business_user.username, "updated-profile-user")
        self.assertEqual(business_user.email, "updated-profile@example.com")
        self.assertEqual(business_user.phone, "+966500000011")
        self.assertEqual(business.location, "Jeddah")
        self.assertEqual(business.language, "Arabic (AR)")

    def test_non_business_user_cannot_access_business_profile(self):
        self.client.force_authenticate(self.admin_user)

        response = self.client.get("/api/business-profile/")

        self.assertEqual(response.status_code, 403)

    def test_profile_endpoint_does_not_create_business_for_any_login_type(self):
        for login_type, google_id in (
            ("password", None),
            ("google", "google-business-id"),
        ):
            user = User.objects.create_user(
                email=f"{login_type}@example.com",
                username=f"{login_type}-user",
                password=None if google_id else "password",
                full_name=f"{login_type.title()} User",
                role=User.Role.BUSINESS,
                google_id=google_id,
            )
            self.client.force_authenticate(user)

            response = self.client.get("/api/business-profile/")

            self.assertEqual(response.status_code, 200, response.data)
            self.assertEqual(
                response.data["user"]["name"],
                f"{login_type.title()} User",
            )
            self.assertEqual(response.data["company"]["location"], "")
            self.assertFalse(Business.objects.filter(user=user).exists())

    def test_business_user_can_create_missing_business_profile(self):
        business_user = User.objects.create_user(
            email="setup-user@example.com",
            username="setup-user",
            password="password",
            full_name="Setup User",
            phone="+966500000020",
            role=User.Role.BUSINESS,
        )
        self.client.force_authenticate(business_user)

        response = self.client.patch(
            "/api/business-profile/",
            {
                "email": "setup-user-updated@example.com",
                "phone": "+966 50 000 0021",
                "location": "Riyadh",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        business = Business.objects.get(user=business_user)
        self.assertEqual(business.location, "Riyadh")
        business_user.refresh_from_db()
        self.assertEqual(business_user.email, "setup-user-updated@example.com")
        self.assertEqual(business_user.phone, "+966500000021")
        self.assertTrue(response.data["profileComplete"])

    def test_existing_business_api_lists_unlinked_business_users(self):
        password_user = User.objects.create_user(
            email="password-user@example.com",
            username="password-user",
            password="password",
            full_name="Password User",
            role=User.Role.BUSINESS,
        )
        google_user = User.objects.create_user(
            email="google-user@example.com",
            username="google-user",
            password=None,
            full_name="Google User",
            role=User.Role.BUSINESS,
            google_id="google-user-id",
        )
        self.client.force_authenticate(self.admin_user)

        response = self.client.get("/api/businesses/?page_size=100")

        self.assertEqual(response.status_code, 200, response.data)
        rows = {
            row["user_id"]: row
            for row in response.data["results"]
            if row.get("profile_complete") is False
        }
        self.assertEqual(set(rows), {password_user.user_id, google_user.user_id})
        self.assertIsNone(rows[password_user.user_id]["id"])
        self.assertFalse(
            Business.objects.filter(user__in=[password_user, google_user]).exists()
        )

    def test_admin_creation_form_includes_password_and_creates_user(self):
        request = RequestFactory().get("/admin/business/business/add/")
        request.user = self.admin_user
        model_admin = BusinessAdmin(Business, AdminSite())
        form_class = model_admin.get_form(request)
        form = form_class(data=self.business_data())

        self.assertIn("password", form.fields)
        self.assertTrue(form.is_valid(), form.errors)
        business = form.save()
        self.assertEqual(business.user.role, User.Role.BUSINESS)
        self.assertTrue(business.user.check_password("strong-password"))
