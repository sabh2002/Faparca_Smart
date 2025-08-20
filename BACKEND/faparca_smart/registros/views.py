from django.shortcuts import render

# Create your views here.
# registros/views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg
from .models import RegistroOEE
from .serializers import RegistroOEESerializer, RegistroOEEListSerializer

class RegistroOEEViewSet(viewsets.ModelViewSet):
    queryset = RegistroOEE.objects.all().order_by('-fecha', '-turno')
    serializer_class = RegistroOEESerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RegistroOEEListSerializer
        return RegistroOEESerializer
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Datos para el dashboard"""
        registros = RegistroOEE.objects.all()
        
        oee_promedio = registros.aggregate(
            oee_avg=Avg('oee'),
            disponibilidad_avg=Avg('disponibilidad'),
            rendimiento_avg=Avg('rendimiento'),
            calidad_avg=Avg('calidad')
        )
        
        return Response({
            'oee_promedio': round(oee_promedio['oee_avg'] or 0, 1),
            'disponibilidad_promedio': round(oee_promedio['disponibilidad_avg'] or 0, 1),
            'rendimiento_promedio': round(oee_promedio['rendimiento_avg'] or 0, 1),
            'calidad_promedio': round(oee_promedio['calidad_avg'] or 0, 1),
            'total_registros': registros.count()
        })