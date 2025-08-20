# areas/serializers.py
from rest_framework import serializers
from .models import Area

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = '__all__'
        
class AreaListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listas"""
    class Meta:
        model = Area
        fields = ['id', 'nombre', 'codigo', 'tipo', 'activa']