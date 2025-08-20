# oee_system/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from areas.views import AreaViewSet
from usuarios.views import UsuarioViewSet, AuthViewSet
from registros.views import RegistroOEEViewSet

router = DefaultRouter()
router.register(r'areas', AreaViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'registros', RegistroOEEViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]