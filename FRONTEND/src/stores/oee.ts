// FRONTEND/src/stores/oee.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { DashboardData, RegistroOEE, Area } from '@/types/oee';
import { API_ENDPOINTS } from '@/config';

// Tipos extendidos para enriquecer los datos en la UI
export interface EnrichedRegistroOEE extends RegistroOEE {
  id: number;
  usuario_nombre?: string;
}

export interface AreaWithStatus extends Area {
    ultimo_oee?: number;
    trendData?: number[]; // Para la mini-gráfica (sparkline)
}

export const useOEEStore = defineStore('oee', () => {
  // --- STATE ---
  const dashboardData = ref<DashboardData | null>(null);
  const recentRecords = ref<EnrichedRegistroOEE[]>([]);
  const areasStatus = ref<AreaWithStatus[]>([]);
  const lineChartData = ref<any>({ labels: [], datasets: [] });
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // --- ACTIONS ---
  async function fetchDashboardData() {
    isLoading.value = true;
    error.value = null;
    try {
      // Optimizamos las llamadas para que se ejecuten en paralelo
      const [dashResponse, recordsResponse, areasResponse] = await Promise.all([
        api.get<DashboardData>(API_ENDPOINTS.DASHBOARD),
        api.get<{ results: EnrichedRegistroOEE[] }>(API_ENDPOINTS.REGISTROS, {
          params: { limit: 10, ordering: '-fecha,-turno' },
        }),
        api.get<Area[]>(API_ENDPOINTS.AREAS),
      ]);

      dashboardData.value = dashResponse.data;
      recentRecords.value = recordsResponse.data.results;

      // Asumo que el backend no provee el último OEE por área, así que lo simulo.
      // En un caso real, esto vendría de un endpoint específico.
      areasStatus.value = areasResponse.data
        .filter(area => area.activa)
        .map(area => ({
            ...area,
            ultimo_oee: Math.random() * (95 - 60) + 60, // Simulación: OEE aleatorio
        }));

      // Procesamiento de datos para el gráfico de tendencias.
      // Se necesitaría un endpoint que devuelva datos agregados por día.
      const labels = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short'});
      }).reverse();

      lineChartData.value = {
        labels,
        datasets: areasStatus.value.map((area, index) => {
            const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            return {
                label: area.nombre,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length],
                data: Array.from({length: 7}, () => Math.random() * (90 - 65) + 65), // Simulación de datos
                tension: 0.3,
            }
        })
      };

    } catch (e: any) {
      error.value = 'Error al cargar los datos del dashboard. Por favor, intente de nuevo más tarde.';
      console.error("Error en fetchDashboardData:", e);
    } finally {
      isLoading.value = false;
    }
  }

  // --- GETTERS ---
  // (podrían añadirse aquí si se necesita lógica computada compleja)

  return {
    dashboardData,
    recentRecords,
    areasStatus,
    lineChartData,
    isLoading,
    error,
    fetchDashboardData,
  };
});
