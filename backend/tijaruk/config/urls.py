"""
URL configuration for the Tijaruk backend.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('business.urls')),
    path('api/products/', include('products.urls')),
    path('api/suppliers/', include('supplier.urls')),
    path('api/rfqs/', include('rfqs.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/messages/', include('message.urls')),
]

# Serve media files in all environments.
# NOTE: For production at scale, replace this with a cloud storage backend
# (e.g. AWS S3 via django-storages). Render's disk is ephemeral — uploaded
# files are lost on redeploy unless you attach a Render Persistent Disk.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
