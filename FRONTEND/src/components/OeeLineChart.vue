<template>
  <div class="relative">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Cargando gráfico...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasData" class="flex flex-col items-center justify-center h-64 text-gray-500">
      <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p class="text-sm">No hay datos disponibles para mostrar</p>
      <p class="text-xs text-gray-400 mt-1">Los datos aparecerán cuando se registren valores OEE</p>
    </div>

    <!-- Chart container -->
    <div v-else class="relative">
      <canvas
        ref="chartCanvas"
        class="w-full"
        :style="{ height: chartHeight + 'px' }"
      ></canvas>

      <!-- Chart legend -->
      <div class="mt-4 flex flex-wrap items-center justify-center space-x-6 text-sm">
        <div class="flex items-center">
          <div class="w-3 h-0.5 bg-blue-500 mr-2"></div>
          <span class="text-gray-600">OEE Promedio</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-0.5 bg-red-400 border-b border-dashed mr-2"></div>
          <span class="text-gray-600">Meta (85%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-0.5 bg-yellow-400 border-b border-dashed mr-2"></div>
          <span class="text-gray-600">Aceptable (70%)</span>
        </div>
      </div>

      <!-- Chart stats -->
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="text-lg font-semibold text-gray-900">{{ averageOEE }}%</div>
          <div class="text-xs text-gray-500">Promedio del período</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="text-lg font-semibold" :class="trendColor">{{ maxOEE }}%</div>
          <div class="text-xs text-gray-500">Mejor resultado</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="text-lg font-semibold text-gray-900">{{ trendText }}</div>
          <div class="text-xs text-gray-500">Tendencia</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, type ChartConfiguration, type ChartOptions } from 'chart.js/auto'
import type { ChartData } from '@/types/oee'

interface Props {
  data: ChartData
  height?: number
  isLoading?: boolean
  showGoalLines?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  isLoading: false,
  showGoalLines: true
})

// Refs
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Computed properties
const chartHeight = computed(() => props.height)

const hasData = computed(() => {
  return props.data?.labels?.length > 0 && props.data?.datasets?.length > 0
})

const oeeValues = computed(() => {
  if (!hasData.value) return []
  return props.data.datasets[0]?.data || []
})

const averageOEE = computed(() => {
  if (!oeeValues.value.length) return 0
  const sum = oeeValues.value.reduce((acc, val) => acc + Number(val), 0)
  return Math.round((sum / oeeValues.value.length) * 10) / 10
})

const maxOEE = computed(() => {
  if (!oeeValues.value.length) return 0
  return Math.max(...oeeValues.value.map(val => Number(val)))
})

const minOEE = computed(() => {
  if (!oeeValues.value.length) return 0
  return Math.min(...oeeValues.value.map(val => Number(val)))
})

const trendText = computed(() => {
  if (oeeValues.value.length < 2) return 'Sin datos'

  const first = Number(oeeValues.value[0])
  const last = Number(oeeValues.value[oeeValues.value.length - 1])
  const diff = last - first

  if (diff > 2) return '↗ Mejorando'
  if (diff < -2) return '↘ Declinando'
  return '→ Estable'
})

const trendColor = computed(() => {
  if (maxOEE.value >= 85) return 'text-green-600'
  if (maxOEE.value >= 75) return 'text-blue-600'
  if (maxOEE.value >= 65) return 'text-yellow-600'
  return 'text-red-600'
})

// Chart configuration
const getChartConfig = (): ChartConfiguration => {
  const goalLineColor = 'rgba(239, 68, 68, 0.8)' // red-500
  const acceptableLineColor = 'rgba(251, 191, 36, 0.8)' // yellow-400

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'Fecha',
          font: {
            size: 12,
            weight: 'normal'
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'OEE (%)',
          font: {
            size: 12,
            weight: 'normal'
          }
        },
        ticks: {
          callback: function(value) {
            return value + '%'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false // Usamos leyenda personalizada
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `OEE: ${context.parsed.y.toFixed(1)}%`
          },
          afterLabel: function(context) {
            const value = context.parsed.y
            if (value >= 85) return '✓ Excelente'
            if (value >= 75) return '○ Bueno'
            if (value >= 65) return '△ Advertencia'
            return '✗ Crítico'
          }
        }
      },
      annotation: props.showGoalLines ? {
        annotations: {
          goalLine: {
            type: 'line',
            yMin: 85,
            yMax: 85,
            borderColor: goalLineColor,
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: 'Meta 85%',
              position: 'end',
              backgroundColor: goalLineColor,
              color: 'white',
              font: {
                size: 10
              }
            }
          },
          acceptableLine: {
            type: 'line',
            yMin: 70,
            yMax: 70,
            borderColor: acceptableLineColor,
            borderWidth: 1,
            borderDash: [3, 3],
            label: {
              display: true,
              content: 'Aceptable 70%',
              position: 'start',
              backgroundColor: acceptableLineColor,
              color: 'white',
              font: {
                size: 10
              }
            }
          }
        }
      } : undefined
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 3
      },
      line: {
        tension: 0.2,
        borderWidth: 3
      }
    }
  }

  return {
    type: 'line',
    data: {
      labels: props.data.labels,
      datasets: [
        {
          label: 'OEE Promedio',
          data: props.data.datasets[0]?.data || [],
          borderColor: '#3B82F6', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.1)', // blue-500 with opacity
          fill: true,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#1D4ED8', // blue-700
          pointHoverBorderColor: '#ffffff'
        }
      ]
    },
    options
  }
}

// Methods
const createChart = async () => {
  if (!chartCanvas.value || !hasData.value) return

  await nextTick()

  try {
    // Destroy existing chart
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }

    // Create new chart
    const config = getChartConfig()
    chartInstance = new Chart(chartCanvas.value, config)

  } catch (error) {
    console.error('Error creating chart:', error)
  }
}

const updateChart = () => {
  if (!chartInstance || !hasData.value) return

  try {
    chartInstance.data.labels = props.data.labels
    chartInstance.data.datasets[0].data = props.data.datasets[0]?.data || []
    chartInstance.update('active')
  } catch (error) {
    console.error('Error updating chart:', error)
    // If update fails, recreate chart
    createChart()
  }
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

// Watchers
watch(() => props.data, () => {
  if (hasData.value && chartInstance) {
    updateChart()
  } else if (hasData.value && !chartInstance) {
    createChart()
  }
}, { deep: true })

watch(() => props.isLoading, (isLoading) => {
  if (!isLoading && hasData.value && !chartInstance) {
    nextTick(() => createChart())
  }
})

// Lifecycle
onMounted(() => {
  if (!props.isLoading && hasData.value) {
    createChart()
  }
})

onUnmounted(() => {
  destroyChart()
})

// Handle window resize
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Estilos específicos del componente */
canvas {
  border-radius: 8px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
