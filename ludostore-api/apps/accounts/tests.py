from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.constants import AccountStatus
from apps.accounts.models import User


class LocalStorageTokenAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="customer@example.com",
            password="StrongPassword123",
        )

    def test_login_returns_tokens_in_response_body(self):
        response = self.client.post(
            "/api/v1/accounts/login/",
            {
                "email": "customer@example.com",
                "password": "StrongPassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.data["data"])
        self.assertIn("refresh_token", response.data["data"])
        self.assertNotIn("tkn.sid", response.cookies)
        self.assertNotIn("tkn.sidcc", response.cookies)

    def test_refresh_token_returns_new_access_token(self):
        refresh_token = str(RefreshToken.for_user(self.user))

        response = self.client.post(
            "/api/v1/accounts/token/refresh/",
            {"refresh_token": refresh_token},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.data["data"])
        self.assertIn("refresh_token", response.data["data"])


class BlockedAccountAuthenticationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="blocked@example.com",
            password="StrongPassword123",
        )
        self.user.account.account_status = AccountStatus.BLOCKED
        self.user.account.block_reason = "Policy violation"
        self.user.account.save(update_fields=["account_status", "block_reason"])
        self.access_token = str(RefreshToken.for_user(self.user).access_token)

    def test_blocked_user_with_bearer_token_is_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

        response = self.client.get("/api/v1/accounts/me/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["code"], "PERMISSION_DENIED")
        self.assertIn("blocked", response.data["message"].lower())

    def test_blocked_user_with_cookie_token_is_rejected(self):
        self.client.cookies["tkn.sid"] = self.access_token

        response = self.client.get("/api/v1/accounts/me/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["code"], "PERMISSION_DENIED")
        self.assertIn("blocked", response.data["message"].lower())
