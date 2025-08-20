<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Registro de Datos OEE</h1>
            <p class="mt-1 text-sm text-gray-600">
              {{ isEditMode ? 'Editando registro existente' : 'Crear nuevo registro de producción' }}
            </p>
          </div>
          <router-link
            to="/dashboard"
            class="btn-secondary flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ isEditMode ? 'Cargando registro...' : 'Cargando formulario...' }}</p>
      </div>

      <!-- Formulario Principal -->
      <div v-else class="bg-white shadow-lg rounded-lg overflow-hidden">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Información Básica -->
          <div class="px-6 py-8 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Información Básica</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Área -->
              <div>
                <label for="area" class="block text-sm font-medium text-gray-700 mb-2">
                  Área de Producción *
                </label>
                <select
                  id="area"
                  v-model="form.area"
                  required
                  class="input-field"
                  :class="{ 'border-red-500': errors.area }"
                  :disabled="isSubmitting"
                  @change="onAreaChange"
                >
                  <option value="">Selecciona un área</option>
                  <option
                    v-for="area in areas"
                    :key="area.id"
                    :value="area.id"
                  >
                    {{ area.nombre }} ({{ area.codigo }})
                  </option>
                </select>
                <p v-if="errors.area" class="mt-1 text-sm text-red-600">{{ errors.area }}</p>
              </div>

              <!-- Fecha -->
              <div>
                <label for="fecha" class="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  id="fecha"
                  v-model="form.fecha"
                  type="date"
                  required
                  class="input-field"
                  :class="{ 'border-red-500': errors.fecha }"
                  :disabled="isSubmitting"
                  :max="today"
                />
                <p v-if="errors.fecha" class="mt-1 text-sm text-red-600">{{ errors.fecha }}</p>
              </div>

              <!-- Turno -->
              <div>
                <label for="turno" class="block text-sm font-medium text-gray-700 mb-2">
                  Turno *
                </label>
                <select
                  id="turno"
                  v-model="form.turno"
                  required
                  class="input-field"
                  :class="{ 'border-red-500': errors.turno }"
                  :disabled="isSubmitting"
                >
                  <option value="">Selecciona turno</option>
                  <option value="A">Turno A (06:00 - 14:00)</option>
                  <option value="B">Turno B (14:00 - 22:00)</option>
                  <option value="C">Turno C (22:00 - 06:00)</option>
                </select>
                <p v-if="errors.turno" class="mt-1 text-sm text-red-600">{{ errors.turno }}</p>
              </div>
            </div>
          </div>

          <!-- Horarios -->
          <div class="px-6 py-8 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Horarios de Operación</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Hora Inicio -->
              <div>
                <label for="hora_inicio" class="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Inicio *
                </label>
                <input
                  id="hora_inicio"
                  v-model="form.hora_inicio"
                  type="time"
                  required
                  class="input-field"
                  :class="{ 'border-red-500': errors.hora_inicio }"
                  :disabled="isSubmitting"
                />
                <p v-if="errors.hora_inicio" class="mt-1 text-sm text-red-600">{{ errors.hora_inicio }}</p>
              </div>

              <!-- Hora Fin -->
              <div>
                <label for="hora_fin" class="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fin *
                </label>
                <input
                  id="hora_fin"
                  v-model="form.hora_fin"
                  type="time"
                  required
                  class="input-field"
                  :class="{ 'border-red-500': errors.hora_fin }"
                  :disabled="isSubmitting"
                />
                <p v-if="errors.hora_fin" class="mt-1 text-sm text-red-600">{{ errors.hora_fin }}</p>
              </div>
            </div>

            <!-- Tiempo calculado -->
            <div v-if="horasOperacion > 0" class="mt-4 p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-blue-800">
                <strong>Tiempo de operación:</strong> {{ horasOperacion.toFixed(1) }} horas
              </p>
            </div>
          </div>

          <!-- Producción -->
          <div class="px-6 py-8 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Datos de Producción</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Plan de Producción -->
              <div>
                <label for="plan_produccion" class="block text-sm font-medium text-gray-700 mb-2">
                  Plan de Producción *
                </label>
                <div class="relative">
                  <input
                    id="plan_produccion"
                    v-model.number="form.plan_produccion"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="input-field pr-16"
                    :class="{ 'border-red-500': errors.plan_produccion }"
                    :disabled="isSubmitting"
                    placeholder="0.00"
                  />
                  <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                    {{ selectedArea?.tipo === 'empaque' ? 'Bultos' : 'KG' }}
                  </span>
                </div>
                <p v-if="errors.plan_produccion" class="mt-1 text-sm text-red-600">{{ errors.plan_produccion }}</p>
              </div>

              <!-- Producción Real -->
              <div>
                <label for="produccion_real" class="block text-sm font-medium text-gray-700 mb-2">
                  Producción Real *
                </label>
                <div class="relative">
                  <input
                    id="produccion_real"
                    v-model.number="form.produccion_real"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="input-field pr-16"
                    :class="{ 'border-red-500': errors.produccion_real }"
                    :disabled="isSubmitting"
                    placeholder="0.00"
                  />
                  <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                    {{ selectedArea?.tipo === 'empaque' ? 'Bultos' : 'KG' }}
                  </span>
                </div>
                <p v-if="errors.produccion_real" class="mt-1 text-sm text-red-600">{{ errors.produccion_real }}</p>
              </div>
            </div>

            <!-- Rendimiento calculado -->
            <div v-if="form.plan_produccion > 0 && form.produccion_real > 0" class="mt-4 p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-green-800">
                <strong>Rendimiento:</strong> {{ rendimientoCalculado.toFixed(1) }}%
                <span class="ml-2" :class="rendimientoColor">
                  {{ rendimientoStatus }}
                </span>
              </p>
            </div>
          </div>

          <!-- Campos específicos por tipo de área -->
          <div v-if="selectedArea" class="px-6 py-8 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              {{ selectedArea.tipo === 'empaque' ? 'Datos de Empaque' : 'Datos de Prensa' }}
            </h2>

            <!-- Campos para EMPAQUE -->
            <div v-if="selectedArea.tipo === 'empaque'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="formato_producto" class="block text-sm font-medium text-gray-700 mb-2">
                  Formato del Producto
                </label>
                <input
                  id="formato_producto"
                  v-model="form.formato_producto"
                  type="text"
                  class="input-field"
                  :disabled="isSubmitting"
                  placeholder="Ej: 1kg, 500g, 25kg"
                />
              </div>

              <div>
                <label for="produccion_kg" class="block text-sm font-medium text-gray-700 mb-2">
                  Producción en KG
                </label>
                <input
                  id="produccion_kg"
                  v-model.number="form.produccion_kg"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :disabled="isSubmitting"
                  placeholder="0.00"
                />
              </div>
            </div>

            <!-- Campos para PRENSA -->
            <div v-if="selectedArea.tipo === 'prensa'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="lectura_inicial" class="block text-sm font-medium text-gray-700 mb-2">
                  Lectura Inicial del Contador
                </label>
                <input
                  id="lectura_inicial"
                  v-model.number="form.lectura_inicial"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :disabled="isSubmitting"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label for="lectura_final" class="block text-sm font-medium text-gray-700 mb-2">
                  Lectura Final del Contador
                </label>
                <input
                  id="lectura_final"
                  v-model.number="form.lectura_final"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field"
                  :disabled="isSubmitting"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <!-- Paradas y Observaciones -->
          <div class="px-6 py-8 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Paradas y Observaciones</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="paradas" class="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Paradas (minutos)
                </label>
                <input
                  id="paradas"
                  v-model.number="form.paradas"
                  type="number"
                  min="0"
                  class="input-field"
                  :disabled="isSubmitting"
                  placeholder="0"
                />
              </div>

              <div>
                <label for="motivo_parada" class="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de Parada
                </label>
                <select
                  id="motivo_parada"
                  v-model="form.motivo_parada"
                  class="input-field"
                  :disabled="isSubmitting"
                >
                  <option value="">Sin paradas</option>
                  <option value="mantenimiento">Mantenimiento Programado</option>
                  <option value="averia">Avería/Falla</option>
                  <option value="cambio_producto">Cambio de Producto</option>
                  <option value="falta_material">Falta de Material</option>
                  <option value="falta_personal">Falta de Personal</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>

            <div class="mt-6">
              <label for="observaciones" class="block text-sm font-medium text-gray-700 mb-2">
                Observaciones Adicionales
              </label>
              <textarea
                id="observaciones"
                v-model="form.observaciones"
                rows="4"
                class="input-field"
                :disabled="isSubmitting"
                placeholder="Describe cualquier incidencia, mejora o información relevante del turno..."
              ></textarea>
            </div>
          </div>

          <!-- Preview de cálculos OEE -->
          <div v-if="showOEEPreview" class="px-6 py-8 bg-gray-50">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Vista Previa del OEE</h2>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="text-sm text-gray-600">Disponibilidad</div>
                <div class="text-2xl font-bold" :class="getOEEColor(disponibilidadCalculada)">
                  {{ disponibilidadCalculada.toFixed(1) }}%
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="text-sm text-gray-600">Rendimiento</div>
                <div class="text-2xl font-bold" :class="getOEEColor(rendimientoCalculado)">
                  {{ rendimientoCalculado.toFixed(1) }}%
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm">
                <div class="text-sm text-gray-600">Calidad</div>
                <div class="text-2xl font-bold text-green-600">
                  100.0%
                </div>
                <div class="text-xs text-gray-500">Por defecto</div>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border-2 border-blue-200">
                <div class="text-sm text-gray-600">OEE Total</div>
                <div class="text-3xl font-bold" :class="getOEEColor(oeeCalculado)">
                  {{ oeeCalculado.toFixed(1) }}%
                </div>
                <div class="text-xs" :class="getOEEColor(oeeCalculado)">
                  {{ getOEEStatus(oeeCalculado) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="px-6 py-8 bg-gray-50 flex justify-between">
            <button
              type="button"
              @click="resetForm"
              class="btn-secondary"
              :disabled="isSubmitting"
            >
              Limpiar Formulario
            </button>

            <div class="flex space-x-4">
              <button
                type="button"
                @click="saveAsDraft"
                class="btn-outline"
                :disabled="isSubmitting"
              >
                Guardar Borrador
              </button>

              <button
                type="submit"
                class="btn-primary"
                :disabled="isSubmitting || !isFormValid"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isEditMode ? 'Actualizando...' : 'Guardando...' }}
                </span>
                <span v-else>
                  {{ isEditMode ? 'Actualizar Registro' : 'Crear Registro' }}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOEEStore } from '@/stores/oee'
import { useAuthStore } from '@/stores/auth'
import type { RegistroFormData, Area } from '@/types/oee'

const router = useRouter()
const route = useRoute()
const oeeStore = useOEEStore()
const authStore = useAuthStore()
const notify = inject<Function>('notify')

// Estado del componente
const isLoading = ref(true)
const isSubmitting = ref(false)
const areas = ref<Area[]>([])
const errors = ref<Record<string, string>>({})

// Determinar si estamos en modo edición
const isEditMode = computed(() => !!route.query.edit)
const editId = computed(() => route.query.edit ? Number(route.query.edit) : null)

// Fecha de hoy para validación
const today = computed(() => new Date().toISOString().split('T')[0])

// Formulario
const form = ref<RegistroFormData>({
  area: 0,
  fecha: today.value,
  turno: 'A',
  plan_produccion: 0,
  produccion_real: 0,
  hora_inicio: '06:00',
  hora_fin: '14:00',
  observaciones: '',
  formato_producto: '',
  produccion_kg: 0,
  lectura_inicial: 0,
  lectura_final: 0,
  paradas: 0,
  motivo_parada: ''
})

// Computed properties
const selectedArea = computed(() => {
  return areas.value.find(area => area.id === form.value.area)
})

const horasOperacion = computed(() => {
  if (!form.value.hora_inicio || !form.value.hora_fin) return 0

  const inicio = new Date(`2000-01-01T${form.value.hora_inicio}:00`)
  let fin = new Date(`2000-01-01T${form.value.hora_fin}:00`)

  // Manejar turnos nocturnos
  if (fin < inicio) {
    fin = new Date(`2000-01-02T${form.value.hora_fin}:00`)
  }

  const diffMs = fin.getTime() - inicio.getTime()
  return diffMs / (1000 * 60 * 60) // Convertir a horas
})

const disponibilidadCalculada = computed(() => {
  if (horasOperacion.value === 0) return 0

  const tiempoTotalMinutos = horasOperacion.value * 60
  const tiempoParadas = form.value.paradas || 0
  const tiempoOperacion = tiempoTotalMinutos - tiempoParadas

  return Math.min((tiempoOperacion / tiempoTotalMinutos) * 100, 100)
})

const rendimientoCalculado = computed(() => {
  if (form.value.plan_produccion === 0) return 0
  return Math.min((form.value.produccion_real / form.value.plan_produccion) * 100, 150)
})

const oeeCalculado = computed(() => {
  return (disponibilidadCalculada.value * rendimientoCalculado.value * 100) / 10000
})

const showOEEPreview = computed(() => {
  return form.value.area &&
         form.value.plan_produccion > 0 &&
         form.value.produccion_real > 0 &&
         horasOperacion.value > 0
})

const isFormValid = computed(() => {
  return form.value.area > 0 &&
         form.value.fecha &&
         form.value.turno &&
         form.value.plan_produccion > 0 &&
         form.value.produccion_real >= 0 &&
         form.value.hora_inicio &&
         form.value.hora_fin &&
         Object.keys(errors.value).length === 0
})

const rendimientoColor = computed(() => {
  return getOEEColor(rendimientoCalculado.value)
})

const rendimientoStatus = computed(() => {
  return getOEEStatus(rendimientoCalculado.value)
})

// Métodos
const onAreaChange = () => {
  // Limpiar campos específicos del área anterior
  form.value.formato_producto = ''
  form.value.produccion_kg = 0
  form.value.lectura_inicial = 0
  form.value.lectura_final = 0

  // Establecer horarios por defecto según el turno
  setDefaultTimes()
}

const setDefaultTimes = () => {
  switch (form.value.turno) {
    case 'A':
      form.value.hora_inicio = '06:00'
      form.value.hora_fin = '14:00'
      break
    case 'B':
      form.value.hora_inicio = '14:00'
      form.value.hora_fin = '22:00'
      break
    case 'C':
      form.value.hora_inicio = '22:00'
      form.value.hora_fin = '06:00'
      break
  }
}

const getOEEColor = (value: number): string => {
  if (value >= 85) return 'text-green-600'
  if (value >= 75) return 'text-blue-600'
  if (value >= 65) return 'text-yellow-600'
  return 'text-red-600'
}

const getOEEStatus = (value: number): string => {
  if (value >= 85) return 'Excelente'
  if (value >= 75) return 'Bueno'
  if (value >= 65) return 'Aceptable'
  return 'Necesita Mejora'
}

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!form.value.area) {
    newErrors.area = 'Área es requerida'
  }

  if (!form.value.fecha) {
    newErrors.fecha = 'Fecha es requerida'
  } else if (form.value.fecha > today.value) {
    newErrors.fecha = 'No se puede registrar fecha futura'
  }

  if (!form.value.turno) {
    newErrors.turno = 'Turno es requerido'
  }

  if (form.value.plan_produccion <= 0) {
    newErrors.plan_produccion = 'Plan de producción debe ser mayor a 0'
  }

  if (form.value.produccion_real < 0) {
    newErrors.produccion_real = 'Producción real no puede ser negativa'
  }

  if (!form.value.hora_inicio) {
    newErrors.hora_inicio = 'Hora de inicio es requerida'
  }

  if (!form.value.hora_fin) {
    newErrors.hora_fin = 'Hora de fin es requerida'
  }

  if (horasOperacion.value <= 0) {
    newErrors.hora_fin = 'El tiempo de operación debe ser positivo'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    notify?.({
      type: 'error',
      title: 'Error de validación',
      message: 'Por favor corrige los errores en el formulario'
    })
    return
  }

  isSubmitting.value = true

  try {
    if (isEditMode.value && editId.value) {
      await oeeStore.updateRegistro(editId.value, form.value)
      notify?.({
        type: 'success',
        title: 'Registro actualizado',
        message: 'El registro ha sido actualizado correctamente'
      })
    } else {
      await oeeStore.createRegistro(form.value)
      notify?.({
        type: 'success',
        title: 'Registro creado',
        message: 'El registro ha sido creado correctamente'
      })
    }

    router.push('/dashboard')

  } catch (error: any) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: error.message || 'Error al guardar el registro'
    })
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    area: 0,
    fecha: today.value,
    turno: 'A',
    plan_produccion: 0,
    produccion_real: 0,
    hora_inicio: '06:00',
    hora_fin: '14:00',
    observaciones: '',
    formato_producto: '',
    produccion_kg: 0,
    lectura_inicial: 0,
    lectura_final: 0,
    paradas: 0,
    motivo_parada: ''
  }
  errors.value = {}
}

const saveAsDraft = () => {
  const draftKey = `form_draft_registro_${authStore.user?.id || 'temp'}`
  localStorage.setItem(draftKey, JSON.stringify(form.value))

  notify?.({
    type: 'info',
    title: 'Borrador guardado',
    message: 'Los datos han sido guardados como borrador'
  })
}

const loadDraft = () => {
  const draftKey = `form_draft_registro_${authStore.user?.id || 'temp'}`
  const draft = localStorage.getItem(draftKey)

  if (draft) {
    try {
      const draftData = JSON.parse(draft)
      Object.assign(form.value, draftData)
    } catch (error) {
      console.warn('Error loading draft:', error)
    }
  }
}

// Watchers
watch(() => form.value.turno, () => {
  setDefaultTimes()
})

// Lifecycle
onMounted(async () => {
  try {
    // Cargar áreas
    await oeeStore.fetchAreas()
    areas.value = oeeStore.areas

    // Si estamos en modo edición, cargar el registro
    if (isEditMode.value && editId.value) {
      // Aquí cargarías el registro específico
      // const registro = await oeeStore.getRegistro(editId.value)
      // Object.assign(form.value, registro)
    } else {
      // Cargar borrador si existe
      loadDraft()
    }

  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al cargar los datos del formulario'
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.input-field {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-outline {
  @apply border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
