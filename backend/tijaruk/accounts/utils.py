from django.conf import settings


def set_auth_cookies(response, access_token, refresh_token):
    secure = not settings.DEBUG

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure,
        samesite="Lax",
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite="Lax",
        path="/",
    )

    return response


def clear_auth_cookies(response):
    secure = not settings.DEBUG

    response.delete_cookie(
        "access_token",
        path="/",
        samesite="Lax",
    )
    response.delete_cookie(
        "refresh_token",
        path="/",
        samesite="Lax",
    )

    if secure:
        response.cookies["access_token"]["secure"] = True
        response.cookies["refresh_token"]["secure"] = True

    return response

