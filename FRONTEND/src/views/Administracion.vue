<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Administración del Sistema</h1>
        <p class="mt-1 text-sm text-gray-600">
          Gestión de usuarios, áreas y configuración del sistema OEE
        </p>
      </div>

      <!-- Tabs de navegación -->
      <div class="mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
              </svg>
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Contenido de tabs -->
      <div class="space-y-6">
        <!-- Tab: Usuarios -->
        <div v-if="activeTab === 'usuarios'" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">Gestión de Usuarios</h2>
            <button @click="showUserModal = true" class="btn-primary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Usuario
            </button>
          </div>

          <!-- Filtros de usuarios -->
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Buscar</label>
                <input
                  v-model="userFilters.search"
                  type="text"
                  placeholder="Nombre o usuario..."
                  class="mt-1 input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Rol</label>
                <select v-model="userFilters.rol" class="mt-1 input-field">
                  <option value="">Todos los roles</option>
                  <option value="administrador">Administrador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="operador">Operador</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Estado</label>
                <select v-model="userFilters.activo" class="mt-1 input-field">
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
              <div class="flex items-end">
                <button @click="loadUsers" class="btn-secondary w-full">
                  Filtrar
                </button>
              </div>
            </div>
          </div>

          <!-- Tabla de usuarios -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área Asignada
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ getUserInitials(user) }}
                        </span>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ user.first_name }} {{ user.last_name }}
                        </div>
                        <div class="text-sm text-gray-500">{{ user.username }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getRoleBadgeClass(user.rol)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ getRoleDisplayName(user.rol) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getAreaName(user.area_asignada) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.last_login) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="user.activo ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'"
                          class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ user.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="toggleUserStatus(user)" :class="user.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'">
                        <svg v-if="user.activo" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Mostrando {{ (currentUserPage - 1) * pageSize + 1 }} a
                {{ Math.min(currentUserPage * pageSize, totalUsers) }} de {{ totalUsers }} usuarios
              </div>
              <div class="flex space-x-2">
                <button
                  @click="currentUserPage--"
                  :disabled="currentUserPage === 1"
                  class="btn-outline disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  @click="currentUserPage++"
                  :disabled="currentUserPage * pageSize >= totalUsers"
                  class="btn-outline disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Áreas -->
        <div v-if="activeTab === 'areas'" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-medium text-gray-900">Gestión de Áreas</h2>
            <button @click="showAreaModal = true" class="btn-primary">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nueva Área
            </button>
          </div>

          <!-- Grid de áreas -->
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="area in areas" :key="area.id" class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900">{{ area.nombre }}</h3>
                  <span :class="area.activa ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
                        class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ area.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </div>

                <div class="space-y-2 text-sm text-gray-600">
                  <div><strong>Código:</strong> {{ area.codigo }}</div>
                  <div><strong>Tipo:</strong> {{ area.tipo }}</div>
                  <div><strong>Capacidad teórica:</strong> {{ area.capacidad_teorica }} {{ area.tipo === 'empaque' ? 'bultos/h' : 'kg/h' }}</div>
                  <div><strong>Capacidad real:</strong> {{ area.capacidad_real }} {{ area.tipo === 'empaque' ? 'bultos/h' : 'kg/h' }}</div>
                </div>

                <div class="mt-4 flex space-x-2">
                  <button @click="editArea(area)" class="btn-outline flex-1">
                    Editar
                  </button>
                  <button
                    @click="toggleAreaStatus(area)"
                    :class="area.activa ? 'btn-danger' : 'btn-success'"
                  >
                    {{ area.activa ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Configuración -->
        <div v-if="activeTab === 'configuracion'" class="space-y-6">
          <!-- Configuración General -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Configuración General</h2>
            </div>
            <div class="px-6 py-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nombre del Sistema</label>
                  <input v-model="systemConfig.appTitle" type="text" class="mt-1 input-field" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Zona Horaria</label>
                  <select v-model="systemConfig.timezone" class="mt-1 input-field">
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/Monterrey">Monterrey</option>
                    <option value="America/Tijuana">Tijuana</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end">
                <button @click="saveSystemConfig" class="btn-primary">
                  Guardar Configuración
                </button>
              </div>
            </div>
          </div>

          <!-- Metas OEE -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Metas OEE</h2>
            </div>
            <div class="px-6 py-4">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Excelente (≥)</label>
                  <div class="mt-1 relative">
                    <input v-model.number="oeeTargets.excellent" type="number" min="0" max="100" class="input-field" />
                    <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Bueno (≥)</label>
                  <div class="mt-1 relative">
                    <input v-model.number="oeeTargets.good" type="number" min="0" max="100" class="input-field" />
                    <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Aceptable (≥)</label>
                  <div class="mt-1 relative">
                    <input v-model.number="oeeTargets.acceptable" type="number" min="0" max="100" class="input-field" />
                    <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div class="flex items-end">
                  <button @click="saveOEETargets" class="btn-primary w-full">
                    Actualizar Metas
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Respaldo y Mantenimiento -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Respaldo y Mantenimiento</h2>
            </div>
            <div class="px-6 py-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <h3 class="text-sm font-medium text-gray-900">Respaldo de Datos</h3>
                  <div class="space-y-2">
                    <button @click="createBackup" class="btn-outline w-full">
                      Crear Respaldo Manual
                    </button>
                    <button @click="downloadBackup" class="btn-outline w-full">
                      Descargar Último Respaldo
                    </button>
                  </div>
                </div>
                <div class="space-y-4">
                  <h3 class="text-sm font-medium text-gray-900">Mantenimiento</h3>
                  <div class="space-y-2">
                    <button @click="clearCache" class="btn-outline w-full">
                      Limpiar Cache
                    </button>
                    <button @click="optimizeDatabase" class="btn-outline w-full">
                      Optimizar Base de Datos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Usuario -->
    <div v-if="showUserModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h3>

          <form @submit.prevent="saveUser" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                <input v-model="userForm.first_name" type="text" required class="mt-1 input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Apellido</label>
                <input v-model="userForm.last_name" type="text" required class="mt-1 input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Usuario</label>
                <input v-model="userForm.username" type="text" required class="mt-1 input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="userForm.email" type="email" required class="mt-1 input-field" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Rol</label>
                <select v-model="userForm.rol" required class="mt-1 input-field">
                  <option value="operador">Operador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="administrador">Administrador</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Área Asignada</label>
                <select v-model="userForm.area_asignada" class="mt-1 input-field">
                  <option value="">Sin área específica</option>
                  <option v-for="area in areas" :key="area.id" :value="area.id">
                    {{ area.nombre }}
                  </option>
                </select>
              </div>
              <div v-if="!editingUser" class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Contraseña</label>
                <input v-model="userForm.password" type="password" :required="!editingUser" class="mt-1 input-field" />
              </div>
            </div>

            <div class="flex justify-end space-x-4 mt-6">
              <button type="button" @click="closeUserModal" class="btn-outline">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                {{ editingUser ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Área -->
    <div v-if="showAreaModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingArea ? 'Editar Área' : 'Nueva Área' }}
          </h3>

          <form @submit.prevent="saveArea" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input v-model="areaForm.nombre" type="text" required class="mt-1 input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Código</label>
              <input v-model="areaForm.codigo" type="text" required class="mt-1 input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tipo</label>
              <select v-model="areaForm.tipo" required class="mt-1 input-field">
                <option value="empaque">Empaque</option>
                <option value="prensa">Prensa</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Capacidad Teórica</label>
              <input v-model.number="areaForm.capacidad_teorica" type="number" min="0" required class="mt-1 input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Capacidad Real</label>
              <input v-model.number="areaForm.capacidad_real" type="number" min="0" required class="mt-1 input-field" />
            </div>

            <div class="flex justify-end space-x-4 mt-6">
              <button type="button" @click="closeAreaModal" class="btn-outline">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                {{ editingArea ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useOEEStore } from '@/stores/oee'
import type { Usuario, Area, UsuarioFormData, AreaFormData } from '@/types/oee'

const oeeStore = useOEEStore()
const notify = inject<Function>('notify')

// Estado principal
const activeTab = ref('usuarios')
const isLoading = ref(false)

// Datos
const users = ref<Usuario[]>([])
const areas = ref<Area[]>([])

// Paginación
const currentUserPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)

// Filtros
const userFilters = ref({
  search: '',
  rol: '',
  activo: ''
})

// Modales
const showUserModal = ref(false)
const showAreaModal = ref(false)
const editingUser = ref<Usuario | null>(null)
const editingArea = ref<Area | null>(null)

// Formularios
const userForm = ref<UsuarioFormData>({
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  rol: 'operador',
  area_asignada: undefined,
  telefono: '',
  activo: true
})

const areaForm = ref<AreaFormData>({
  nombre: '',
  codigo: '',
  tipo: 'empaque',
  capacidad_teorica: 0,
  capacidad_real: 0,
  activa: true
})

// Configuración del sistema
const systemConfig = ref({
  appTitle: 'Sistema OEE FAPARCA',
  timezone: 'America/Mexico_City'
})

const oeeTargets = ref({
  excellent: 85,
  good: 75,
  acceptable: 65
})

// Configuración de tabs
const tabs = [
  {
    id: 'usuarios',
    name: 'Usuarios',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
  },
  {
    id: 'areas',
    name: 'Áreas',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
  },
  {
    id: 'configuracion',
    name: 'Configuración',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  }
]

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  if (userFilters.value.search) {
    const search = userFilters.value.search.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(search) ||
      user.first_name.toLowerCase().includes(search) ||
      user.last_name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }

  if (userFilters.value.rol) {
    filtered = filtered.filter(user => user.rol === userFilters.value.rol)
  }

  if (userFilters.value.activo !== '') {
    const isActive = userFilters.value.activo === 'true'
    filtered = filtered.filter(user => user.activo === isActive)
  }

  return filtered
})

// Métodos para usuarios
const loadUsers = async () => {
  isLoading.value = true
  try {
    // Aquí harías la petición real a la API
    // const response = await api.get('/usuarios/', { params: userFilters.value })
    // users.value = response.data.results
    // totalUsers.value = response.data.count

    // Mock data por ahora
    users.value = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@faparca.com',
        first_name: 'Administrador',
        last_name: 'Sistema',
        rol: 'administrador',
        activo: true,
        last_login: '2025-01-08T10:30:00Z',
        date_joined: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        username: 'supervisor1',
        email: 'supervisor@faparca.com',
        first_name: 'María',
        last_name: 'García',
        rol: 'supervisor',
        area_asignada: 1,
        activo: true,
        last_login: '2025-01-08T09:15:00Z',
        date_joined: '2025-01-02T00:00:00Z'
      }
    ]
    totalUsers.value = users.value.length
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al cargar usuarios'
    })
  } finally {
    isLoading.value = false
  }
}

const editUser = (user: Usuario) => {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    rol: user.rol,
    area_asignada: user.area_asignada,
    telefono: user.telefono || '',
    activo: user.activo
  }
  showUserModal.value = true
}

const saveUser = async () => {
  try {
    if (editingUser.value) {
      // await api.patch(`/usuarios/${editingUser.value.id}/`, userForm.value)
      notify?.({
        type: 'success',
        title: 'Usuario actualizado',
        message: 'El usuario ha sido actualizado correctamente'
      })
    } else {
      // await api.post('/usuarios/', userForm.value)
      notify?.({
        type: 'success',
        title: 'Usuario creado',
        message: 'El usuario ha sido creado correctamente'
      })
    }

    closeUserModal()
    loadUsers()
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al guardar usuario'
    })
  }
}

const toggleUserStatus = async (user: Usuario) => {
  try {
    // await api.patch(`/usuarios/${user.id}/toggle_active/`)
    user.activo = !user.activo
    notify?.({
      type: 'success',
      title: 'Estado actualizado',
      message: `Usuario ${user.activo ? 'activado' : 'desactivado'} correctamente`
    })
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al cambiar estado del usuario'
    })
  }
}

const closeUserModal = () => {
  showUserModal.value = false
  editingUser.value = null
  userForm.value = {
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    rol: 'operador',
    area_asignada: undefined,
    telefono: '',
    activo: true
  }
}

// Métodos para áreas
const editArea = (area: Area) => {
  editingArea.value = area
  areaForm.value = {
    nombre: area.nombre,
    codigo: area.codigo,
    tipo: area.tipo,
    capacidad_teorica: area.capacidad_teorica,
    capacidad_real: area.capacidad_real,
    activa: area.activa
  }
  showAreaModal.value = true
}

const saveArea = async () => {
  try {
    if (editingArea.value) {
      // await api.patch(`/areas/${editingArea.value.id}/`, areaForm.value)
      notify?.({
        type: 'success',
        title: 'Área actualizada',
        message: 'El área ha sido actualizada correctamente'
      })
    } else {
      // await api.post('/areas/', areaForm.value)
      notify?.({
        type: 'success',
        title: 'Área creada',
        message: 'El área ha sido creada correctamente'
      })
    }

    closeAreaModal()
    loadAreas()
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al guardar área'
    })
  }
}

const toggleAreaStatus = async (area: Area) => {
  try {
    // await api.patch(`/areas/${area.id}/toggle_active/`)
    area.activa = !area.activa
    notify?.({
      type: 'success',
      title: 'Estado actualizado',
      message: `Área ${area.activa ? 'activada' : 'desactivada'} correctamente`
    })
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al cambiar estado del área'
    })
  }
}

const closeAreaModal = () => {
  showAreaModal.value = false
  editingArea.value = null
  areaForm.value = {
    nombre: '',
    codigo: '',
    tipo: 'empaque',
    capacidad_teorica: 0,
    capacidad_real: 0,
    activa: true
  }
}

const loadAreas = async () => {
  try {
    await oeeStore.fetchAreas()
    areas.value = oeeStore.areas
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al cargar áreas'
    })
  }
}

// Métodos de configuración
const saveSystemConfig = async () => {
  try {
    // await api.patch('/settings/system/', systemConfig.value)
    notify?.({
      type: 'success',
      title: 'Configuración guardada',
      message: 'La configuración del sistema ha sido actualizada'
    })
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al guardar configuración'
    })
  }
}

const saveOEETargets = async () => {
  try {
    // await api.patch('/settings/oee-targets/', oeeTargets.value)
    notify?.({
      type: 'success',
      title: 'Metas actualizadas',
      message: 'Las metas OEE han sido actualizadas'
    })
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al actualizar metas OEE'
    })
  }
}

// Métodos de mantenimiento
const createBackup = async () => {
  try {
    // await api.post('/settings/backup/')
    notify?.({
      type: 'success',
      title: 'Respaldo creado',
      message: 'Se ha creado un respaldo de la base de datos'
    })
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al crear respaldo'
    })
  }
}

const downloadBackup = async () => {
  try {
    // Implement download logic
    notify?.({
      type: 'info',
      title: 'Descarga iniciada',
      message: 'Se está descargando el último respaldo'
    })
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al descargar respaldo'
    })
  }
}

const clearCache = async () => {
  try {
    // await api.post('/settings/clear-cache/')
    notify?.({
      type: 'success',
      title: 'Cache limpiado',
      message: 'Se ha limpiado el cache del sistema'
    })
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al limpiar cache'
    })
  }
}

const optimizeDatabase = async () => {
  try {
    // await api.post('/settings/optimize-db/')
    notify?.({
      type: 'success',
      title: 'Base de datos optimizada',
      message: 'Se ha optimizado la base de datos'
    })
  } catch (error) {
    notify?.({
      type: 'error',
      title: 'Error',
      message: 'Error al optimizar base de datos'
    })
  }
}

// Utilidades
const getUserInitials = (user: Usuario): string => {
  return `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase()
}

const getRoleBadgeClass = (rol: string): string => {
  const classes = {
    administrador: 'bg-purple-100 text-purple-800',
    supervisor: 'bg-blue-100 text-blue-800',
    operador: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800'
  }
  return classes[rol as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getRoleDisplayName = (rol: string): string => {
  const names = {
    administrador: 'Administrador',
    supervisor: 'Supervisor',
    operador: 'Operador',
    viewer: 'Visualizador'
  }
  return names[rol as keyof typeof names] || rol
}

const getAreaName = (areaId?: number): string => {
  if (!areaId) return 'Sin área asignada'
  const area = areas.value.find(a => a.id === areaId)
  return area?.nombre || 'Área desconocida'
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Nunca'
  try {
    return format(parseISO(dateStr), 'd MMM yyyy, HH:mm', { locale: es })
  } catch {
    return 'Fecha inválida'
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadUsers(),
    loadAreas()
  ])
})
</script>

<style scoped>
.input-field {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200;
}

.btn-outline {
  @apply border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium py-2 px-4 rounded-md transition-colors duration-200;
}

.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200;
}

.btn-success {
  @apply bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200;
}
</style>
