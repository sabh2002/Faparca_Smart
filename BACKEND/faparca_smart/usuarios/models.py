from django.db import models

# Create your models here.
# usuarios/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    ROLES = [
        ('administrador', 'Administrador'),
        ('supervisor', 'Supervisor'),
        ('operador', 'Operador'),
        ('viewer', 'Solo Lectura'),
    ]
    
    rol = models.CharField(max_length=20, choices=ROLES, default='operador')
    area_asignada = models.ForeignKey(
        'areas.Area', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Área específica del usuario"
    )
    telefono = models.CharField(max_length=20, blank=True)
    activo = models.BooleanField(default=True)
    ultimo_acceso = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"