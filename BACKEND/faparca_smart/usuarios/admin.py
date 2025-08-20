from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """
    Configuración personalizada del admin para el modelo Usuario
    """
    # Campos a mostrar en la lista de usuarios
    list_display = (
        'username', 
        'email', 
        'first_name', 
        'last_name', 
        'rol', 
        'area_asignada',
        'activo',
        'is_staff',
        'ultimo_acceso'
    )
    
    # Campos por los que se puede filtrar
    list_filter = (
        'rol',
        'activo',
        'is_staff',
        'is_superuser',
        'area_asignada',
        'date_joined',
        'ultimo_acceso'
    )
    
    # Campos por los que se puede buscar
    search_fields = ('username', 'first_name', 'last_name', 'email', 'telefono')
    
    # Ordenamiento por defecto
    ordering = ('-date_joined',)
    
    # Campos editables desde la lista
    list_editable = ('activo', 'rol')
    
    # Configuración de los fieldsets para el formulario de edición
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Información Personal'), {
            'fields': ('first_name', 'last_name', 'email', 'telefono')
        }),
        (_('Configuración del Sistema'), {
            'fields': ('rol', 'area_asignada', 'activo')
        }),
        (_('Permisos'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)  # Colapsado por defecto
        }),
        (_('Fechas Importantes'), {
            'fields': ('last_login', 'date_joined', 'ultimo_acceso'),
            'classes': ('collapse',)
        }),
    )
    
    # Configuración para crear nuevo usuario
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 
                'password1', 
                'password2',
                'email',
                'first_name',
                'last_name',
                'rol',
                'area_asignada',
                'telefono',
                'activo'
            ),
        }),
    )
    
    # Acciones personalizadas
    actions = ['activar_usuarios', 'desactivar_usuarios', 'resetear_ultimo_acceso']
    
    def activar_usuarios(self, request, queryset):
        """Activa los usuarios seleccionados"""
        updated = queryset.update(activo=True)
        self.message_user(request, f'{updated} usuario(s) activado(s) exitosamente.')
    activar_usuarios.short_description = "Activar usuarios seleccionados"
    
    def desactivar_usuarios(self, request, queryset):
        """Desactiva los usuarios seleccionados"""
        updated = queryset.update(activo=False)
        self.message_user(request, f'{updated} usuario(s) desactivado(s) exitosamente.')
    desactivar_usuarios.short_description = "Desactivar usuarios seleccionados"
    
    def resetear_ultimo_acceso(self, request, queryset):
        """Resetea el último acceso de los usuarios seleccionados"""
        updated = queryset.update(ultimo_acceso=None)
        self.message_user(request, f'Último acceso reseteado para {updated} usuario(s).')
    resetear_ultimo_acceso.short_description = "Resetear último acceso"
    
    # Personalización de la visualización
    def get_readonly_fields(self, request, obj=None):
        """Hace algunos campos de solo lectura en edición"""
        if obj:  # Editando un usuario existente
            return self.readonly_fields + ('date_joined', 'last_login', 'ultimo_acceso')
        return self.readonly_fields
