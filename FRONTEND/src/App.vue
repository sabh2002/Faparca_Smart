<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navegación Principal -->
    <nav v-if="authStore.isAuthenticated" class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo y navegación -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/dashboard" class="flex items-center">
                <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-sm">OEE</span>
                </div>
                <span class="ml-2 text-xl font-semibold text-gray-900">FAPARCA</span>
              </router-link>
            </div>

            <!-- Menú de navegación -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/dashboard"
                class="nav-link"
                :class="{ 'nav-link-active': $route.name === 'Dashboard' }"
              >
                Dashboard
              </router-link>

              <router-link
                v-if="authStore.canEdit"
                to="/registro"
                class="nav-link"
                :class="{ 'nav-link-active': $route.name === 'Registro' }"
              >
                Registro
              </router-link>

              <router-link
                to="/reportes"
                class="nav-link"
                :class="{ 'nav-link-active': $route.name === 'Reportes' }"
              >
                Reportes
              </router-link>

              <router-link
                v-if="authStore.isAdmin"
                to="/admin"
                class="nav-link"
                :class="{ 'nav-link-active': $route.name === 'Administracion' }"
              >
                Administración
              </router-link>
            </div>
          </div>

          <!-- Usuario y logout -->
          <div class="flex items-center">
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span class="text-white text-sm font-medium">{{ authStore.userInitials }}</span>
                </div>
                <span class="ml-2 text-gray-700 hidden sm:block">{{ authStore.userName }}</span>
                <svg class="ml-1 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Dropdown del usuario -->
              <transition name="dropdown">
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                  @click="showUserMenu = false"
                >
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    <div class="font-medium">{{ authStore.userName }}</div>
                    <div class="text-gray-500">{{ authStore.userRole }}</div>
                  </div>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido Principal -->
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Loading Global -->
    <transition name="fade">
      <div
        v-if="authStore.isLoading"
        class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 flex items-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-900">Cargando...</span>
        </div>
      </div>
    </transition>

    <!-- Notificaciones Toast -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <transition-group name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto"
          :class="{
            'border-l-4 border-green-400': notification.type === 'success',
            'border-l-4 border-red-400': notification.type === 'error',
            'border-l-4 border-yellow-400': notification.type === 'warning',
            'border-l-4 border-blue-400': notification.type === 'info'
          }"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5"
                  :class="{
                    'text-green-400': notification.type === 'success',
                    'text-red-400': notification.type === 'error',
                    'text-yellow-400': notification.type === 'warning',
                    'text-blue-400': notification.type === 'info'
                  }"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path v-if="notification.type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  <path v-else-if="notification.type === 'error'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  <path v-else fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ notification.message }}</p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  @click="removeNotification(notification.id)"
                  class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Estado de la aplicación
const showUserMenu = ref(false)
const notifications = ref<Array<{
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}>>([])

// Funciones de notificación
const addNotification = (notification: {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}) => {
  const id = Date.now().toString()
  notifications.value.push({ ...notification, id })

  // Auto-remover después de la duración especificada
  setTimeout(() => {
    removeNotification(id)
  }, notification.duration || 5000)
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// Proporcionar función de notificación a componentes hijos
provide('notify', addNotification)

// Logout
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error durante logout:', error)
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'Error al cerrar sesión'
    })
  }
}

// Inicialización
onMounted(async () => {
  // Inicializar autenticación si hay token guardado
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
})

// Cerrar menú de usuario al hacer click afuera
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Estilos de navegación */
.nav-link {
  @apply border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200;
}

.nav-link-active {
  @apply border-blue-500 text-gray-900;
}

/* Transiciones */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
