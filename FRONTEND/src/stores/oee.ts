// stores/oee.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import { API_ENDPOINTS } from '@/config'
import type {
  RegistroOEE,
  Area,
  DashboardData,
  ChartData,
  AreaStatus
} from '@/types/oee'

export const useOEEStore = defineStore('oee', () => {
  // State
  const dashboardData = ref<DashboardData | null>(null)
  const registros = ref<RegistroOEE[]>([])
  const areas = ref<Area[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdate = ref<Date | null>(null)

  // Getters
  const recentRecords = computed(() => {
    return registros.value.slice(0, 10) // Últimos 10 registros
  })

  const areasStatus = computed((): AreaStatus[] => {
    if (!dashboardData.value || !areas.value.length) return []

    return areas.value.map(area => {
      // Buscar registros recientes para esta área
      const areaRecords = registros.value.filter(r => r.area === area.id)
      const latestRecord = areaRecords[0] // El más reciente

      let status: 'excellent' | 'good' | 'warning' | 'critical' = 'critical'
      let oee = 0

      if (latestRecord) {
        oee = latestRecord.oee
        if (oee >= 85) status = 'excellent'
        else if (oee >= 75) status = 'good'
        else if (oee >= 65) status = 'warning'
        else status = 'critical'
      }

      return {
        id: area.id,
        nombre: area.nombre,
        oee: oee,
        status: status,
        ultima_actualizacion: latestRecord?.fecha || '',
        turno_actual: latestRecord?.turno || 'A'
      }
    })
  })

  const lineChartData = computed((): ChartData => {
    if (!registros.value.length) {
      return {
        labels: [],
        datasets: []
      }
    }

    // Obtener los últimos 7 días de datos
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentRecords = registros.value.filter(record => {
      const recordDate = new Date(record.fecha)
      return recordDate >= sevenDaysAgo && recordDate <= today
    })

    // Agrupar por fecha
    const dataByDate = recentRecords.reduce((acc, record) => {
      const date = record.fecha
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(record.oee)
      return acc
    }, {} as Record<string, number[]>)

    // Crear labels y calcular promedios
    const labels: string[] = []
    const oeeData: number[] = []

    Object.keys(dataByDate)
      .sort()
      .slice(-7) // Últimos 7 días
      .forEach(date => {
        const records = dataByDate[date]
        const average = records.reduce((sum, oee) => sum + oee, 0) / records.length

        labels.push(new Date(date).toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric'
        }))
        oeeData.push(Math.round(average * 10) / 10)
      })

    return {
      labels,
      datasets: [
        {
          label: 'OEE Promedio',
          data: oeeData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2
        }
      ]
    }
  })

  const totalRegistros = computed(() => registros.value.length)

  const promedioOEE = computed(() => {
    if (!registros.value.length) return 0
    const sum = registros.value.reduce((acc, record) => acc + record.oee, 0)
    return Math.round((sum / registros.value.length) * 10) / 10
  })

  // Actions
  async function fetchDashboardData() {
    isLoading.value = true
    error.value = null

    try {
      // Hacer peticiones en paralelo
      const [dashboardResponse, registrosResponse, areasResponse] = await Promise.all([
        api.get(API_ENDPOINTS.REGISTROS + 'dashboard/'),
        api.get(API_ENDPOINTS.REGISTROS + '?page_size=50&ordering=-fecha,-id'),
        api.get(API_ENDPOINTS.AREAS)
      ])

      // Actualizar estado
      dashboardData.value = dashboardResponse.data
      registros.value = registrosResponse.data.results || registrosResponse.data
      areas.value = areasResponse.data.results || areasResponse.data
      lastUpdate.value = new Date()

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      error.value = err.response?.data?.message || 'Error al cargar datos del dashboard'

      // Si no hay datos previos, inicializar con datos vacíos
      if (!dashboardData.value) {
        dashboardData.value = {
          oee_promedio: 0,
          disponibilidad_promedio: 0,
          rendimiento_promedio: 0,
          calidad_promedio: 0,
          total_registros: 0
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRegistros(params?: {
    area?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    page?: number;
  }) {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()

      if (params?.area) queryParams.set('area', params.area.toString())
      if (params?.fecha_inicio) queryParams.set('fecha_inicio', params.fecha_inicio)
      if (params?.fecha_fin) queryParams.set('fecha_fin', params.fecha_fin)
      if (params?.page) queryParams.set('page', params.page.toString())

      queryParams.set('ordering', '-fecha,-id')

      const response = await api.get(`${API_ENDPOINTS.REGISTROS}?${queryParams}`)

      if (params?.page && params.page > 1) {
        // Append para paginación
        registros.value.push(...(response.data.results || []))
      } else {
        // Replace para nueva búsqueda
        registros.value = response.data.results || response.data
      }

      return response.data

    } catch (err: any) {
      console.error('Error fetching registros:', err)
      error.value = err.response?.data?.message || 'Error al cargar registros'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createRegistro(registroData: Partial<RegistroOEE>) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post(API_ENDPOINTS.REGISTROS, registroData)

      // Agregar el nuevo registro al inicio de la lista
      registros.value.unshift(response.data)

      // Actualizar dashboard data
      await fetchDashboardData()

      return response.data

    } catch (err: any) {
      console.error('Error creating registro:', err)
      error.value = err.response?.data?.message || 'Error al crear registro'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateRegistro(id: number, registroData: Partial<RegistroOEE>) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.patch(API_ENDPOINTS.REGISTRO_DETAIL(id), registroData)

      // Actualizar en la lista local
      const index = registros.value.findIndex(r => r.id === id)
      if (index !== -1) {
        registros.value[index] = response.data
      }

      // Actualizar dashboard data
      await fetchDashboardData()

      return response.data

    } catch (err: any) {
      console.error('Error updating registro:', err)
      error.value = err.response?.data?.message || 'Error al actualizar registro'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteRegistro(id: number) {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(API_ENDPOINTS.REGISTRO_DETAIL(id))

      // Remover de la lista local
      registros.value = registros.value.filter(r => r.id !== id)

      // Actualizar dashboard data
      await fetchDashboardData()

    } catch (err: any) {
      console.error('Error deleting registro:', err)
      error.value = err.response?.data?.message || 'Error al eliminar registro'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAreas() {
    try {
      const response = await api.get(API_ENDPOINTS.AREAS)
      areas.value = response.data.results || response.data
      return areas.value
    } catch (err: any) {
      console.error('Error fetching areas:', err)
      error.value = err.response?.data?.message || 'Error al cargar áreas'
      throw err
    }
  }

  // Utility functions
  function clearError() {
    error.value = null
  }

  function getRegistrosByArea(areaId: number) {
    return registros.value.filter(registro => registro.area === areaId)
  }

  function getRegistrosByDateRange(fechaInicio: string, fechaFin: string) {
    return registros.value.filter(registro => {
      const fecha = new Date(registro.fecha)
      const inicio = new Date(fechaInicio)
      const fin = new Date(fechaFin)
      return fecha >= inicio && fecha <= fin
    })
  }

  // Auto-refresh function
  function startAutoRefresh(intervalMs: number = 30000) {
    return setInterval(() => {
      if (!isLoading.value) {
        fetchDashboardData()
      }
    }, intervalMs)
  }

  return {
    // State
    dashboardData,
    registros,
    areas,
    isLoading,
    error,
    lastUpdate,

    // Getters
    recentRecords,
    areasStatus,
    lineChartData,
    totalRegistros,
    promedioOEE,

    // Actions
    fetchDashboardData,
    fetchRegistros,
    createRegistro,
    updateRegistro,
    deleteRegistro,
    fetchAreas,
    clearError,
    getRegistrosByArea,
    getRegistrosByDateRange,
    startAutoRefresh
  }
})
