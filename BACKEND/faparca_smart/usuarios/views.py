from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.contrib.auth import login
from django.utils import timezone
from django.db import transaction
from .models import Usuario
from .serializers import (
    UsuarioSerializer, 
    LoginSerializer, 
    UsuarioCreateSerializer,
    ChangePasswordSerializer
)
from .authentication import TokenManager, ExpiringTokenAuthentication

# Create your views here.

class LoginThrottle(AnonRateThrottle):
    """Throttle específico para intentos de login"""
    rate = '10/hour'  # 10 intentos por hora
    
    def get_cache_key(self, request, view):
        # Usar IP + username para el rate limiting
        username = request.data.get('username', '')
        ident = self.get_ident(request)
        return f'login_throttle_{ident}_{username}'


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios
    """
    queryset = Usuario.objects.filter(activo=True)
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'create':
            return UsuarioCreateSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        return UsuarioSerializer
    
    def get_permissions(self):
        """Permisos personalizados por acción"""
        if self.action in ['create', 'destroy']:
            # Solo administradores pueden crear o eliminar usuarios
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        elif self.action in ['update', 'partial_update']:
            # Administradores o el propio usuario
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        """Cambiar contraseña del usuario"""
        user = self.get_object()
        
        # Verificar que es el mismo usuario o un admin
        if request.user != user and not request.user.is_staff:
            return Response(
                {'error': 'No tiene permisos para cambiar esta contraseña'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Revocar token actual para forzar nuevo login
            TokenManager.revoke_token(user)
            
            return Response(
                {'message': 'Contraseña actualizada exitosamente. Por favor, inicie sesión nuevamente.'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Activar/Desactivar usuario"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Solo administradores pueden activar/desactivar usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        user.activo = not user.activo
        user.save()
        
        # Si se desactiva, revocar su token
        if not user.activo:
            TokenManager.revoke_token(user)
        
        action_text = 'activado' if user.activo else 'desactivado'
        return Response(
            {'message': f'Usuario {action_text} exitosamente'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener información del usuario actual"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet para autenticación
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginThrottle]  # Rate limiting para login
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Endpoint de login con token expiración
        """
        # Agregar información adicional al serializer
        login_data = request.data.copy()
        login_data['ip_address'] = self.get_client_ip(request)
        login_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        serializer = LoginSerializer(data=login_data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Crear o refrescar token
            with transaction.atomic():
                token_data = TokenManager.create_token(user)
                
                # Actualizar último acceso
                user.ultimo_acceso = timezone.now()
                user.save(update_fields=['ultimo_acceso'])
            
            # Preparar respuesta
            response_data = {
                'token': token_data['key'],
                'expires_at': token_data['expires_at'].isoformat(),
                'expires_in': token_data['expires_in'],
                'user': UsuarioSerializer(user).data,
                'message': 'Login exitoso'
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        # Error de login
        return Response(
            {
                'errors': serializer.errors,
                'message': 'Error en el inicio de sesión'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        """
        Endpoint de logout - revoca el token
        """
        if request.user.is_authenticated:
            TokenManager.revoke_token(request.user)
            
            return Response(
                {'message': 'Sesión cerrada exitosamente'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'message': 'No hay sesión activa'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def refresh(self, request):
        """
        Refresca el token si es necesario
        """
        token_data = TokenManager.refresh_token(request.user)
        
        return Response({
            'token': token_data['key'],
            'expires_at': token_data['expires_at'].isoformat(),
            'expires_in': token_data['expires_in'],
            'message': 'Token refrescado exitosamente' if token_data.get('refreshed') else 'Token aún válido'
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def verify(self, request):
        """
        Verifica si el token es válido y retorna información del usuario
        """
        return Response({
            'valid': True,
            'user': UsuarioSerializer(request.user).data
        })
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        Registro de nuevos usuarios (si está habilitado)
        """
        # Verificar si el registro público está habilitado
        # Por ahora solo admins pueden crear usuarios
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response(
                {'error': 'Registro no permitido. Contacte al administrador.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UsuarioCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                user = serializer.save()
                token_data = TokenManager.create_token(user)
            
            return Response({
                'message': 'Usuario creado exitosamente',
                'user': UsuarioSerializer(user).data,
                'token': token_data['key'],
                'expires_at': token_data['expires_at'].isoformat()
            }, status=status.HTTP_201_CREATED)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def get_client_ip(self, request):
        """
        Obtiene la IP del cliente
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
