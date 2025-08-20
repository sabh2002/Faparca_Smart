# areas/views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Area
from .serializers import AreaSerializer, AreaListSerializer

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.filter(activa=True)
    serializer_class = AreaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AreaListSerializer
        return AreaSerializer
    
    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        """Obtener áreas agrupadas por tipo"""
        empaque = Area.objects.filter(tipo='empaque', activa=True)
        prensa = Area.objects.filter(tipo='prensa', activa=True)
        
        return Response({
            'empaque': AreaListSerializer(empaque, many=True).data,
            'prensa': AreaListSerializer(prensa, many=True).data
        })