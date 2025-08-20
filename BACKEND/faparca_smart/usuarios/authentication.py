# usuarios/authentication.py
"""
Módulo de autenticación personalizada con tokens expirables
"""
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authtoken.models import Token

class ExpiringTokenAuthentication(TokenAuthentication):
    """
    Autenticación con tokens que expiran después de un tiempo determinado
    """
    
    def authenticate_credentials(self, key):
        """
        Valida el token y verifica su expiración
        """
        try:
            token = Token.objects.select_related('user').get(key=key)
        except Token.DoesNotExist:
            raise AuthenticationFailed('Token inválido.')
        
        if not token.user.is_active:
            raise AuthenticationFailed('Usuario inactivo o eliminado.')
        
        if not token.user.activo:
            raise AuthenticationFailed('Usuario desactivado por el administrador.')
        
        # Verificar expiración del token
        if self.is_token_expired(token):
            token.delete()
            raise AuthenticationFailed('Token expirado. Por favor, inicie sesión nuevamente.')
        
        # Actualizar último acceso
        token.user.ultimo_acceso = timezone.now()
        token.user.save(update_fields=['ultimo_acceso'])
        
        return (token.user, token)
    
    def is_token_expired(self, token):
        """
        Verifica si el token ha expirado
        """
        time_elapsed = timezone.now() - token.created
        expiry_time = timedelta(
            seconds=getattr(settings, 'TOKEN_EXPIRED_AFTER_SECONDS', 86400)
        )
        return time_elapsed > expiry_time
    
    @staticmethod
    def token_expire_handler(token):
        """
        Retorna el tiempo de expiración del token
        """
        time_elapsed = timezone.now() - token.created
        expiry_time = timedelta(
            seconds=getattr(settings, 'TOKEN_EXPIRED_AFTER_SECONDS', 86400)
        )
        left_time = expiry_time - time_elapsed
        
        is_expired = left_time.total_seconds() < 0
        
        if is_expired:
            return {
                'is_expired': True,
                'expired_at': token.created + expiry_time
            }
        
        return {
            'is_expired': False,
            'expires_in': left_time.total_seconds(),
            'expires_at': token.created + expiry_time
        }


class TokenManager:
    """
    Manejador de tokens con funcionalidad adicional
    """
    
    @staticmethod
    def create_token(user):
        """
        Crea un nuevo token para el usuario, eliminando el anterior si existe
        """
        # Eliminar token anterior si existe
        Token.objects.filter(user=user).delete()
        
        # Crear nuevo token
        token = Token.objects.create(user=user)
        
        # Calcular expiración
        expiry_time = timedelta(
            seconds=getattr(settings, 'TOKEN_EXPIRED_AFTER_SECONDS', 86400)
        )
        expires_at = token.created + expiry_time
        
        return {
            'key': token.key,
            'created': token.created,
            'expires_at': expires_at,
            'expires_in': expiry_time.total_seconds()
        }
    
    @staticmethod
    def refresh_token(user):
        """
        Refresca el token del usuario si es necesario
        """
        try:
            token = Token.objects.get(user=user)
            
            # Verificar si necesita refresh
            time_elapsed = timezone.now() - token.created
            refresh_time = timedelta(
                seconds=getattr(settings, 'TOKEN_REFRESH_AFTER_SECONDS', 3600)
            )
            
            if time_elapsed > refresh_time:
                # Crear nuevo token
                token.delete()
                return TokenManager.create_token(user)
            
            # Token aún válido
            expiry_time = timedelta(
                seconds=getattr(settings, 'TOKEN_EXPIRED_AFTER_SECONDS', 86400)
            )
            expires_at = token.created + expiry_time
            
            return {
                'key': token.key,
                'created': token.created,
                'expires_at': expires_at,
                'expires_in': (expires_at - timezone.now()).total_seconds()
            }
            
        except Token.DoesNotExist:
            return TokenManager.create_token(user)
    
    @staticmethod
    def revoke_token(user):
        """
        Revoca el token del usuario
        """
        try:
            token = Token.objects.get(user=user)
            token.delete()
            return True
        except Token.DoesNotExist:
            return False
    
    @staticmethod
    def cleanup_expired_tokens():
        """
        Limpia tokens expirados de la base de datos
        Puede ser llamado por un cron job o celery task
        """
        expiry_time = timedelta(
            seconds=getattr(settings, 'TOKEN_EXPIRED_AFTER_SECONDS', 86400)
        )
        expired_time = timezone.now() - expiry_time
        
        # Eliminar tokens expirados
        deleted_count = Token.objects.filter(created__lt=expired_time).delete()[0]
        
        return deleted_count
