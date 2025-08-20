from datetime import datetime, timedelta
from django.db import models

# Create your models here.
# registros/models.py
from django.db import models
from django.conf import settings

class RegistroOEE(models.Model):
    TURNOS = [
        ('A', 'Turno A (06:00-14:00)'),
        ('B', 'Turno B (14:00-22:00)'),
        ('C', 'Turno C (22:00-06:00)'),
    ]
    
    # Información básica
    area = models.ForeignKey('areas.Area', on_delete=models.CASCADE)
    fecha = models.DateField()
    turno = models.CharField(max_length=1, choices=TURNOS)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Datos producción (común)
    plan_produccion = models.FloatField()
    produccion_real = models.FloatField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    observaciones = models.TextField(blank=True)
    
    # Datos específicos empaque
    formato_producto = models.CharField(max_length=100, blank=True)
    produccion_kg = models.FloatField(null=True, blank=True)
    
    # Datos específicos prensa  
    lectura_inicial = models.FloatField(null=True, blank=True)
    lectura_final = models.FloatField(null=True, blank=True)
    paradas = models.IntegerField(default=0)
    motivo_parada = models.CharField(max_length=200, blank=True)
    
    # Cálculos OEE (automáticos)
    disponibilidad = models.FloatField(default=0)
    rendimiento = models.FloatField(default=0)
    calidad = models.FloatField(default=100)
    oee = models.FloatField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['area', 'fecha', 'turno']
        verbose_name = "Registro OEE"
        verbose_name_plural = "Registros OEE"
        
    def save(self, *args, **kwargs):
        self.calcular_oee()
        super().save(*args, **kwargs)
        
    def calcular_oee(self):
        """Calcula automáticamente los indicadores OEE"""
        if not all([self.hora_inicio, self.hora_fin, self.plan_produccion, self.produccion_real]):
            return
            
        # 1. DISPONIBILIDAD
        hora_inicio = datetime.combine(self.fecha, self.hora_inicio)
        hora_fin = datetime.combine(self.fecha, self.hora_fin)
        
        # Manejar turnos que cruzan medianoche
        if hora_fin < hora_inicio:
            hora_fin += timedelta(days=1)
            
        horas_reales = (hora_fin - hora_inicio).total_seconds() / 3600
        horas_planificadas = 8  # Turno estándar
        
        self.disponibilidad = min((horas_reales / horas_planificadas) * 100, 100)
        
        # 2. RENDIMIENTO
        if self.area.tipo == 'prensa':
            # Para prensas: usar lecturas y capacidad teórica
            if self.lectura_inicial is not None and self.lectura_final is not None:
                produccion_real_kg = self.lectura_final - self.lectura_inicial
                produccion_teorica = self.area.capacidad_teorica * horas_reales
                self.rendimiento = (produccion_real_kg / produccion_teorica) * 100 if produccion_teorica > 0 else 0
            else:
                self.rendimiento = 0
        else:
            # Para empaque: comparar con plan
            self.rendimiento = (self.produccion_real / self.plan_produccion) * 100 if self.plan_produccion > 0 else 0
        
        # 3. CALIDAD (por defecto 100%, ajustable manualmente)
        if self.calidad == 0:
            self.calidad = 100
            
        # 4. OEE FINAL
        self.oee = (self.disponibilidad * self.rendimiento * self.calidad) / 10000
        
        # Limitar valores máximos
        self.disponibilidad = min(self.disponibilidad, 100)
        self.rendimiento = min(self.rendimiento, 100)
        self.calidad = min(self.calidad, 100)
        self.oee = min(self.oee, 100)
        
    def __str__(self):
        return f"{self.area.nombre} - {self.fecha} - {self.turno}"