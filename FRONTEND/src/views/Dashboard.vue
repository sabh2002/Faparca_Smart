<template>
  <div class="min-h-screen bg-gray-100">

    <div v-if="oeeStore.isLoading && !oeeStore.dashboardData" class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Cargando datos...</p>
    </div>

    <div v-if="oeeStore.error" class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
            <p class="font-bold">Error de Conexión</p>
            <p>{{ oeeStore.error }}</p>
        </div>
    </div>

    <div v-if="oeeStore.dashboardData" class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard OEE</h1>
          <p class="text-gray-600 mt-1">
            Monitoreo en tiempo real - <span class="font-medium">{{ currentDate }}</span>
          </p>
        </div>
        <button @click="oeeStore.fetchDashboardData" :disabled="oeeStore.isLoading" class="mt-4 sm:mt-0 p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Refrescar datos">
            <svg class="w-6 h-6 text-gray-600" :class="{'animate-spin': oeeStore.isLoading}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5"></path></svg>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="OEE Promedio"
          :value="oeeStore.dashboardData.oee_promedio.toFixed(1)"
          suffix="%"
        />
        <KPICard
          title="Disponibilidad"
          :value="oeeStore.dashboardData.disponibilidad_promedio.toFixed(1)"
          suffix="%"
        />
        <KPICard
          title="Rendimiento"
          :value="oeeStore.dashboardData.rendimiento_promedio.toFixed(1)"
          suffix="%"
        />
        <KPICard
          title="Calidad"
          :value="oeeStore.dashboardData.calidad_promedio.toFixed(1)"
          suffix="%"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Estado por Área</h2>
          <div class="space-y-4">
            <AreaStatusCard
              v-for="area in oeeStore.areasStatus"
              :key="area.id"
              :area="area"
            />
          </div>
        </div>

        <div class="lg:col-span-2">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Registros Recientes</h2>
          <RecentRecordsTable :records="oeeStore.recentRecords" />
        </div>
      </div>

      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">Tendencia OEE - Últimos 7 días</h2>
        <OeeLineChart :data="oeeStore.lineChartData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useOEEStore } from '@/stores/oee'

// Importación de Componentes
import KPICard from '@/components/KPICard.vue'
import AreaStatusCard from '@/components/AreaStatusCard.vue'
import RecentRecordsTable from '@/components/RecentRecordsTable.vue'
import OeeLineChart from '@/components/OeeLineChart.vue'

const oeeStore = useOEEStore()
let refreshInterval: number | undefined

// --- Propiedades Computadas ---
const currentDate = computed(() =>
  format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
)

// --- Ciclo de Vida ---
onMounted(() => {
  if (!oeeStore.dashboardData) {
    oeeStore.fetchDashboardData()
  }
  // Configuro el refresco automático cada 30 segundos
  refreshInterval = setInterval(() => {
    console.log("Refrescando datos del dashboard...")
    oeeStore.fetchDashboardData()
  }, 30000)
})

onUnmounted(() => {
  // Limpio el intervalo al destruir el componente para evitar memory leaks
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
