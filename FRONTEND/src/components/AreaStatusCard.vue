<template>
  <div class="bg-white rounded-lg shadow-md p-4 border-l-4 transition-all duration-200 hover:shadow-lg"
       :class="statusClasses">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ area.nombre }}</h3>
        <div class="flex items-center space-x-2">
          <span class="text-2xl font-bold" :class="oeeTextColor">{{ formatOEE(area.oee) }}%</span>
          <div class="flex items-center">
            <div class="w-2 h-2 rounded-full mr-1" :class="statusDotColor"></div>
            <span class="text-xs font-medium text-gray-600 uppercase tracking-wide">{{ statusText }}</span>
          </div>
        </div>
      </div>

      <div class="flex-shrink-0">
        <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="statusIconBg">
          <svg class="w-6 h-6" :class="statusIconColor" fill="currentColor" viewBox="0 0 20 20">
            <!-- Icono Excellent (≥85%) -->
            <path v-if="area.status === 'excellent'"
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd" />

            <!-- Icono Good (75-84%) -->
            <path v-else-if="area.status === 'good'"
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clip-rule="evenodd" />

            <!-- Icono Warning (65-74%) -->
            <path v-else-if="area.status === 'warning'"
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />

            <!-- Icono Critical (<65%) -->
            <path v-else
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="mt-3 pt-3 border-t border-gray-100">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>Turno: <span class="font-medium">{{ area.turno_actual }}</span></span>
        <span v-if="area.ultima_actualizacion" class="text-xs">
          {{ formatLastUpdate(area.ultima_actualizacion) }}
        </span>
      </div>
    </div>

    <!-- Barra de progreso OEE -->
    <div class="mt-2">
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all duration-300"
          :class="progressBarColor"
          :style="{ width: `${Math.min(area.oee, 100)}%` }">
        </div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { AreaStatus } from '@/types/oee'

interface Props {
  area: AreaStatus
}

const props = defineProps<Props>()

// Computed properties para estilos dinámicos
const statusClasses = computed(() => {
  switch (props.area.status) {
    case 'excellent':
      return 'border-green-500'
    case 'good':
      return 'border-blue-500'
    case 'warning':
      return 'border-yellow-500'
    case 'critical':
      return 'border-red-500'
    default:
      return 'border-gray-300'
  }
})

const oeeTextColor = computed(() => {
  switch (props.area.status) {
    case 'excellent':
      return 'text-green-600'
    case 'good':
      return 'text-blue-600'
    case 'warning':
      return 'text-yellow-600'
    case 'critical':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
})

const statusDotColor = computed(() => {
  switch (props.area.status) {
    case 'excellent':
      return 'bg-green-500'
    case 'good':
      return 'bg-blue-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'critical':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
})

const statusIconBg = computed(() => {
  switch (props.area.status) {
    case 'excellent':
      return 'bg-green-100'
    case 'good':
      return 'bg-blue-100'
    case 'warning':
      return 'bg-yellow-100'
    case 'critical':
      return 'bg-red-100'
    default:
      return 'bg-gray-100'
  }
})

const statusIconColor = computed(() => {
  switch (props.area.status) {
    case 'excellent':
      return 'text-green-600'
    case 'good':
      return 'text-blue-600'
    case 'warning':
      return 'text-yellow-600'
    case 'critical':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
})

const progressBarColor = computed(() => {
  switch (props.area.status) {
    case 'excellent':
      return 'bg-green-500'
    case 'good':
      return 'bg-blue-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'critical':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
})

const statusText = computed(() => {
  switch (props.area.status) {
    case 'excellent':
      return 'Excelente'
    case 'good':
      return 'Bueno'
    case 'warning':
      return 'Advertencia'
    case 'critical':
      return 'Crítico'
    default:
      return 'Sin datos'
  }
})

// Utility functions
const formatOEE = (oee: number): string => {
  return oee ? oee.toFixed(1) : '0.0'
}

const formatLastUpdate = (dateStr: string): string => {
  if (!dateStr) return 'Sin datos'

  try {
    const date = parseISO(dateStr)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: es })
    } else {
      return format(date, 'd MMM yyyy', { locale: es })
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Fecha inválida'
  }
}
</script>

<style scoped>
/* Animaciones personalizadas */
.hover\:shadow-lg:hover {
  transform: translateY(-1px);
}

/* Transiciones suaves para la barra de progreso */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
