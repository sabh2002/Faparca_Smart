from django.db import models

# Create your models here.
# areas/models.py
from django.db import models

class Area(models.Model):
    TIPOS_AREA = [
        ('empaque', 'Empaque'),
        ('prensa', 'Prensa'),
    ]
    
    nombre = models.CharField(max_length=100, unique=True)
    codigo = models.CharField(max_length=20, unique=True)  # EMPAQUE_COBRA
    tipo = models.CharField(max_length=20, choices=TIPOS_AREA)
    capacidad_teorica = models.FloatField(help_text="KG/H o Bultos/H")
    capacidad_real = models.FloatField(help_text="Capacidad real promedio")
    activa = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Área de Producción"
        verbose_name_plural = "Áreas de Producción"
        
    def __str__(self):
        return f"{self.nombre} ({self.tipo})"