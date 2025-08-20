# usuarios/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.validators import RegexValidator
from django.contrib.auth.password_validation import validate_password
from .models import Usuario
import re

class UsuarioSerializer(serializers.ModelSerializer):
    area_nombre = serializers.CharField(source='area_asignada.nombre', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'rol', 'area_asignada', 'area_nombre', 'telefono', 
            'activo', 'ultimo_acceso', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'ultimo_acceso': {'read_only': True},
            'date_joined': {'read_only': True}
        }

class UsuarioCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear nuevos usuarios con validaciones robustas"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Confirmar contraseña'
    )
    telefono = serializers.CharField(
        required=False,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Número de teléfono inválido. Debe tener entre 9 y 15 dígitos.'
            )
        ]
    )
    
    class Meta:
        model = Usuario
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'rol', 'area_asignada', 
            'telefono'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True}
        }
    
    def validate_username(self, value):
        """Valida el formato del username"""
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError(
                'El username solo puede contener letras, números y @/./+/-/_'
            )
        if len(value) < 4:
            raise serializers.ValidationError(
                'El username debe tener al menos 4 caracteres'
            )
        return value.lower()  # Convertir a minúsculas para evitar duplicados
    
    def validate_email(self, value):
        """Valida que el email no esté en uso"""
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'Ya existe un usuario con este email'
            )
        return value.lower()
    
    def validate(self, attrs):
        """Valida que las contraseñas coincidan"""
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({
                'password': 'Las contraseñas no coinciden'
            })
        return attrs
    
    def create(self, validated_data):
        """Crea el usuario con la contraseña hasheada"""
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(
            **validated_data,
            password=password,
            activo=True
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        min_length=1,
        error_messages={
            'required': 'El nombre de usuario es requerido',
            'blank': 'El nombre de usuario no puede estar vacío',
            'min_length': 'El nombre de usuario debe tener al menos 1 caracter'
        }
    )
    password = serializers.CharField(
        required=True,
        min_length=1,
        style={'input_type': 'password'},
        error_messages={
            'required': 'La contraseña es requerida',
            'blank': 'La contraseña no puede estar vacía',
            'min_length': 'La contraseña debe tener al menos 1 caracter'
        }
    )
    
    # Para tracking de intentos de login
    ip_address = serializers.CharField(required=False, allow_blank=True)
    user_agent = serializers.CharField(required=False, allow_blank=True)
    
    def validate_username(self, value):
        """Sanitiza y valida el username"""
        # Eliminar espacios en blanco
        value = value.strip()
        
        # Validar longitud
        if len(value) < 1:
            raise serializers.ValidationError('El username no puede estar vacío')
        if len(value) > 150:
            raise serializers.ValidationError('El username es demasiado largo')
        
        return value
    
    def validate_password(self, value):
        """Valida básicamente la contraseña"""
        if len(value) < 1:
            raise serializers.ValidationError('La contraseña no puede estar vacía')
        if len(value) > 128:
            raise serializers.ValidationError('La contraseña es demasiado larga')
        
        return value
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        # Intentar autenticar
        if username and password:
            # Buscar usuario primero para dar mensajes más específicos
            try:
                user_obj = Usuario.objects.get(username__iexact=username)
                
                # Verificar si el usuario está activo antes de autenticar
                if not user_obj.activo:
                    raise serializers.ValidationError({
                        'non_field_errors': 'Esta cuenta ha sido desactivada. Contacte al administrador.'
                    })
                
                if not user_obj.is_active:
                    raise serializers.ValidationError({
                        'non_field_errors': 'Esta cuenta está inactiva en el sistema.'
                    })
                
                # Intentar autenticar
                user = authenticate(username=user_obj.username, password=password)
                
                if not user:
                    # Contraseña incorrecta
                    raise serializers.ValidationError({
                        'password': 'Contraseña incorrecta'
                    })
                
                attrs['user'] = user
                return attrs
                
            except Usuario.DoesNotExist:
                # Usuario no existe
                raise serializers.ValidationError({
                    'username': 'No existe un usuario con este nombre'
                })
        else:
            raise serializers.ValidationError({
                'non_field_errors': 'Debe proporcionar username y password'
            })

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para cambio de contraseña"""
    old_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'},
        label='Contraseña actual'
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
        label='Nueva contraseña'
    )
    new_password2 = serializers.CharField(
        required=True,
        style={'input_type': 'password'},
        label='Confirmar nueva contraseña'
    )
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({
                'new_password': 'Las nuevas contraseñas no coinciden'
            })
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Contraseña actual incorrecta')
        return value
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
