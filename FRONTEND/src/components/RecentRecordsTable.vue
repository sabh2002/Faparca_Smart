<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">Registros Recientes</h3>
      <router-link
        to="/registro"
        class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Registro
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="px-6 py-12 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">Cargando registros...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!records.length" class="px-6 py-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay registros</h3>
      <p class="mt-1 text-sm text-gray-500">Comienza creando tu primer registro OEE.</p>
      <div class="mt-6">
        <router-link
          to="/registro"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear Registro
        </router-link>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Área
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha/Turno
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              OEE
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producción
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="record in records"
            :key="record.id"
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <!-- Área -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">
                {{ getAreaName(record.area) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ getAreaCode(record.area) }}
              </div>
            </td>

            <!-- Fecha/Turno -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">
                {{ formatDate(record.fecha) }}
              </div>
              <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Turno {{ record.turno }}
              </div>
            </td>

            <!-- OEE -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium" :class="getOEEColor(record.oee)">
                  {{ record.oee.toFixed(1) }}%
                </div>
                <div class="ml-2 flex items-center">
                  <div
                    class="w-2 h-2 rounded-full"
                    :class="getOEEStatusColor(record.oee)"
                  ></div>
                </div>
              </div>
              <!-- Mini barra de progreso -->
              <div class="mt-1 w-16 bg-gray-200 rounded-full h-1">
                <div
                  class="h-1 rounded-full transition-all duration-300"
                  :class="getOEEProgressColor(record.oee)"
                  :style="{ width: `${Math.min(record.oee, 100)}%` }"
                ></div>
              </div>
            </td>

            <!-- Producción -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div>{{ record.produccion_real }} / {{ record.plan_produccion }}</div>
              <div class="text-xs text-gray-500">
                {{ getProductionPercentage(record.produccion_real, record.plan_produccion) }}%
              </div>
            </td>

            <!-- Estado -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                :class="getStatusBadgeClass(record.oee)"
              >
                {{ getStatusText(record.oee) }}
              </span>
            </td>

            <!-- Usuario -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ record.usuario_nombre || 'N/A' }}
            </td>

            <!-- Acciones -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center space-x-2">
                <button
                  @click="viewRecord(record)"
                  class="text-blue-600 hover:text-blue-900 transition-colors"
                  title="Ver detalles"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                <button
                  v-if="canEdit"
                  @click="editRecord(record)"
                  class="text-green-600 hover:text-green-900 transition-colors"
                  title="Editar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                <button
                  v-if="canDelete"
                  @click="deleteRecord(record)"
                  class="text-red-600 hover:text-red-900 transition-colors"
                  title="Eliminar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer con estadísticas -->
    <div v-if="records.length" class="px-6 py-3 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <span>Mostrando {{ records.length }} registros recientes</span>
        <router-link
          to="/reportes"
          class="text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todos los registros →
        </router-link>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación para eliminar -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mt-2">Confirmar Eliminación</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">
            ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="flex justify-center space-x-4 mt-4">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/stores/auth'
import { useOEEStore } from '@/stores/oee'
import type { RegistroOEE } from '@/types/oee'

interface Props {
  records: RegistroOEE[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const router = useRouter()
const authStore = useAuthStore()
const oeeStore = useOEEStore()
const notify = inject<Function>('notify')

// Estado
const showDeleteModal = ref(false)
const recordToDelete = ref<RegistroOEE | null>(null)

// Computed
const canEdit = computed(() => authStore.canEdit)
const canDelete = computed(() => authStore.canDelete)

// Métodos
const getAreaName = (areaId: number): string => {
  const area = oeeStore.areas.find(a => a.id === areaId)
  return area?.nombre || 'Área desconocida'
}

const getAreaCode = (areaId: number): string => {
  const area = oeeStore.areas.find(a => a.id === areaId)
  return area?.codigo || 'N/A'
}

const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), 'd MMM yyyy', { locale: es })
  } catch {
    return dateStr
  }
}

const getProductionPercentage = (real: number, plan: number): number => {
  return plan > 0 ? Math.round((real / plan) * 100) : 0
}

const getOEEColor = (oee: number): string => {
  if (oee >= 85) return 'text-green-600'
  if (oee >= 75) return 'text-blue-600'
  if (oee >= 65) return 'text-yellow-600'
  return 'text-red-600'
}

const getOEEStatusColor = (oee: number): string => {
  if (oee >= 85) return 'bg-green-500'
  if (oee >= 75) return 'bg-blue-500'
  if (oee >= 65) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getOEEProgressColor = (oee: number): string => {
  if (oee >= 85) return 'bg-green-500'
  if (oee >= 75) return 'bg-blue-500'
  if (oee >= 65) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getStatusBadgeClass = (oee: number): string => {
  if (oee >= 85) return 'bg-green-100 text-green-800'
  if (oee >= 75) return 'bg-blue-100 text-blue-800'
  if (oee >= 65) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getStatusText = (oee: number): string => {
  if (oee >= 85) return 'Excelente'
  if (oee >= 75) return 'Bueno'
  if (oee >= 65) return 'Advertencia'
  return 'Crítico'
}

// Acciones
const viewRecord = (record: RegistroOEE) => {
  // Aquí podrías abrir un modal o navegar a una página de detalles
  console.log('Ver registro:', record)
  // router.push(`/registros/${record.id}`)
}

const editRecord = (record: RegistroOEE) => {
  router.push(`/registro?edit=${record.id}`)
}

const deleteRecord = (record: RegistroOEE) => {
  recordToDelete.value = record
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!recordToDelete.value) return

  try {
    await oeeStore.deleteRegistro(recordToDelete.value.id)

    notify?.({
      type: 'success',
      title: 'Registro eliminado',
      message: 'El registro ha sido eliminado correctamente'
    })

  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'No se pudo eliminar el registro'
    })
  } finally {
    showDeleteModal.value = false
    recordToDelete.value = null
  }
}
</script>

<style scoped>
/* Estilos adicionales si es necesario */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
