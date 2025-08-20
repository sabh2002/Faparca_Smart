# registros/serializers.py
from rest_framework import serializers
from .models import RegistroOEE
from areas.serializers import AreaListSerializer

class RegistroOEESerializer(serializers.ModelSerializer):
    area_nombre = serializers.CharField(source='area.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    
    class Meta:
        model = RegistroOEE
        fields = '__all__'
        read_only_fields = ['disponibilidad', 'rendimiento', 'calidad', 'oee', 'usuario']

class RegistroOEEListSerializer(serializers.ModelSerializer):
    area_nombre = serializers.CharField(source='area.nombre', read_only=True)
    
    class Meta:
        model = RegistroOEE
        fields = ['id', 'area', 'area_nombre', 'fecha', 'turno', 
                 'produccion_real', 'disponibilidad', 'rendimiento', 'oee']