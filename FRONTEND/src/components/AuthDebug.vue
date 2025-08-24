<!-- AuthDebug.vue - Versión SEGURA sin imports problemáticos -->
<template>
  <div v-if="showDebug" class="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md text-xs font-mono z-50">
    <div class="flex justify-between items-center mb-2">
      <span class="font-bold text-green-400">🔧 AUTH DEBUG</span>
      <button @click="toggleDebug" class="text-gray-400 hover:text-white">✕</button>
    </div>

    <div class="space-y-2">
      <div>
        <span class="text-blue-300">Token:</span>
        <span class="ml-2" :class="tokenStatus.color">{{ tokenStatus.text }}</span>
      </div>

      <div>
        <span class="text-blue-300">Usuario:</span>
        <span class="ml-2" :class="userStatus.color">{{ userStatus.text }}</span>
      </div>

      <div>
        <span class="text-blue-300">isAuthenticated():</span>
        <span class="ml-2" :class="authStatus.color">{{ authStatus.text }}</span>
      </div>

      <div>
        <span class="text-blue-300">Store Auth:</span>
        <span class="ml-2" :class="storeAuthStatus.color">{{ storeAuthStatus.text }}</span>
      </div>

      <div class="border-t border-gray-700 pt-2 mt-2">
        <div class="text-gray-400 text-xs mb-1">Último check: {{ lastCheck }}</div>
        <button @click="refreshData" class="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs">
          🔄 Refresh
        </button>
        <button @click="clearAuth" class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs ml-2">
          🗑️ Clear Auth
        </button>
      </div>

      <!-- Información detallada del token -->
      <div v-if="tokenDetails" class="border-t border-gray-700 pt-2 mt-2">
        <div class="text-gray-400 text-xs mb-1">Token Details:</div>
        <pre class="text-xs text-gray-300 whitespace-pre-wrap">{{ tokenDetails }}</pre>
      </div>
    </div>
  </div>

  <!-- Botón para mostrar debug -->
  <button
    v-else
    @click="toggleDebug"
    class="fixed bottom-4 right-4 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 z-50"
    title="Mostrar Auth Debug"
  >
    🔧
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AuthService from '@/services/auth'

const authStore = useAuthStore()
const showDebug = ref(false)
const lastCheck = ref(new Date().toLocaleTimeString())
const refreshInterval = ref<number | null>(null)

// Datos reactivos
const tokenValue = ref<string | null>(null)
const currentUser = ref<any>(null)
const isAuthenticatedValue = ref<boolean>(false)

const toggleDebug = () => {
  showDebug.value = !showDebug.value
  if (showDebug.value) {
    refreshData()
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// ✅ Función isTokenExpired INTEGRADA (no importada)
const isTokenExpiredLocal = (): boolean => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return true;

    const tokenData = JSON.parse(token);
    if (tokenData.expires_at) {
      return new Date(tokenData.expires_at) < new Date();
    }
  } catch {
    // Si no hay información de expiración, asumir que no ha expirado
  }

  return false;
}

const refreshData = () => {
  try {
    tokenValue.value = AuthService.getToken()
    currentUser.value = AuthService.getCurrentUser()
    isAuthenticatedValue.value = AuthService.isAuthenticated()
    lastCheck.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('Error refreshing debug data:', error)
  }
}

const clearAuth = () => {
  localStorage.clear()
  sessionStorage.clear()
  authStore.logout()
  refreshData()
}

// Estados computados
const tokenStatus = computed(() => {
  if (!tokenValue.value) return { text: 'NO TOKEN', color: 'text-red-400' }
  if (tokenValue.value.length < 20) return { text: 'INVALID', color: 'text-red-400' }
  return { text: `${tokenValue.value.substring(0, 8)}...`, color: 'text-green-400' }
})

const userStatus = computed(() => {
  if (!currentUser.value) return { text: 'NO USER', color: 'text-red-400' }
  return {
    text: `${currentUser.value.username} (${currentUser.value.rol})`,
    color: 'text-green-400'
  }
})

const authStatus = computed(() => {
  return isAuthenticatedValue.value
    ? { text: 'TRUE', color: 'text-green-400' }
    : { text: 'FALSE', color: 'text-red-400' }
})

const storeAuthStatus = computed(() => {
  return authStore.isAuthenticated
    ? { text: 'TRUE', color: 'text-green-400' }
    : { text: 'FALSE', color: 'text-red-400' }
})

const tokenDetails = computed(() => {
  if (!tokenValue.value) return null

  try {
    const parsed = JSON.parse(tokenValue.value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return `String token: ${tokenValue.value.length} chars`
  }
})

const startAutoRefresh = () => {
  refreshInterval.value = window.setInterval(refreshData, 1000) // Refresh cada segundo
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

onMounted(() => {
  refreshData()

  // Solo mostrar en desarrollo
  if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    console.log('🔧 AuthDebug component loaded')
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>
