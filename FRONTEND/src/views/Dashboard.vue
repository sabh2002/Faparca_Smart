<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-14 0h2m-2 0h-2m16 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Dashboard OEE</h1>
              <p class="text-sm text-gray-600">Fábrica de Pasta Rosana C.A.</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Usuario info -->
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ authStore.userName }}</p>
              <p class="text-xs text-gray-500">{{ authStore.userRole }}</p>
            </div>
            
            <!-- Logout -->
            <button
              @click="handleLogout"
              class="btn-industrial bg-red-600 text-white hover:bg-red-700 py-2 px-4"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Estado de conexión con API -->
      <div class="px-4 py-6 sm:px-0">
        <div v-if="isLoading" class="text-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-gray-600">Cargando datos...</p>
        </div>

        <div v-else>
          <!-- Test de conexión API -->
          <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Estado de Conexión API
              </h3>
              <div class="flex items-center space-x-4">
                <div class="flex-1">
                  <div class="flex items-center">
                    <div
                      :class="apiStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'"
                      class="h-3 w-3 rounded-full mr-2"
                    ></div>
                    <span class="text-sm font-medium">
                      {{ apiStatus === 'connected' ? 'Conectado' : 'Desconectado' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Django API: {{ apiStatus === 'connected' ? 'Funcionando' : 'No disponible' }}
                  </p>
                </div>
                <button
                  @click="testConnection"
                  class="btn-industrial bg-blue-600 text-white hover:bg-blue-700 text-sm py-2 px-3"
                >
                  Probar Conexión
                </button>
              </div>
            </div>
          </div>

          <!-- Áreas cargadas -->
          <div v-if="areas.length > 0" class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Áreas de Producción ({{ areas.length }})
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="area in areas"
                  :key="area.id"
                  class="card-oee border-l-blue-500"
                >
                  <h4 class="font-semibold text-gray-900">{{ area.nombre }}</h4>
                  <p class="text-sm text-gray-600">{{ area.tipo }}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    Capacidad: {{ area.capacidad_teorica }} 
                    {{ area.tipo === 'prensa' ? 'KG/H' : 'Bultos/H' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje si no hay áreas -->
          <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800">
              No se pudieron cargar las áreas de producción. 
              Verifica que el backend Django esté funcionando.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import type { Area } from '@/types/oee';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const apiStatus = ref<'connected' | 'disconnected'>('disconnected');
const areas = ref<Area[]>([]);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const testConnection = async () => {
  try {
    const response = await api.get('/areas/');
    apiStatus.value = 'connected';
    areas.value = response.data;
  } catch (error) {
    console.error('Error de conexión:', error);
    apiStatus.value = 'disconnected';
    areas.value = [];
  }
};

const loadInitialData = async () => {
  isLoading.value = true;
  
  await testConnection();
  
  isLoading.value = false;
};

onMounted(() => {
  // Verificar autenticación
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  loadInitialData();
});
</script>
