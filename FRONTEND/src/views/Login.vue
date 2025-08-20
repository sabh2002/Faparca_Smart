<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo y título -->
      <div class="flex justify-center">
        <div class="flex items-center">
          <div class="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-lg">OEE</span>
          </div>
          <span class="ml-3 text-2xl font-bold text-gray-900">{{ appTitle }}</span>
        </div>
      </div>

      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Iniciar Sesión
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Accede al sistema de monitoreo OEE
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-200">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Campo de usuario -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <div class="mt-1 relative">
              <input
                id="username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                required
                class="input-industrial"
                :class="{ 'border-red-500': errors.username }"
                placeholder="Ingresa tu usuario"
                :disabled="authStore.isLoading || isRateLimited"
                @input="clearFieldError('username')"
                @keydown.enter="handleEnterKey"
              />
              <div v-if="errors.username" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- Campo de contraseña -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                ref="passwordInput"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="input-industrial pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Ingresa tu contraseña"
                :disabled="authStore.isLoading || isRateLimited"
                @input="clearFieldError('password')"
                @keydown.enter="handleEnterKey"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
                tabindex="-1"
                :disabled="authStore.isLoading || isRateLimited"
              >
                <svg v-if="!showPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <!-- Recordar usuario y ayuda -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                :disabled="authStore.isLoading || isRateLimited"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Recordar usuario
              </label>
            </div>

            <div class="text-sm">
              <button
                type="button"
                @click="showHelp = !showHelp"
                class="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                :disabled="authStore.isLoading || isRateLimited"
              >
                ¿Necesitas ayuda?
              </button>
            </div>
          </div>

          <!-- Mensajes de Error/Éxito -->
          <transition name="fade">
            <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Error de autenticación</h3>
                  <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
                  <div v-if="loginAttempts >= 3" class="mt-2">
                    <p class="text-xs text-red-600">
                      Has intentado {{ loginAttempts }} veces.
                      <span v-if="loginAttempts >= 5">
                        Por favor, verifica tus credenciales o contacta al administrador.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <transition name="fade">
            <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">{{ successMessage }}</h3>
                </div>
              </div>
            </div>
          </transition>

          <!-- Rate Limiting Warning -->
          <transition name="fade">
            <div v-if="isRateLimited" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">Intentos temporalmente bloqueados</h3>
                  <p class="text-sm text-yellow-700 mt-1">
                    Espera {{ rateLimitRemaining }} segundos antes de intentar de nuevo.
                  </p>
                </div>
              </div>
            </div>
          </transition>

          <!-- Botón de login -->
          <div>
            <button
              type="submit"
              :disabled="authStore.isLoading || isRateLimited || !isFormValid"
              class="btn-industrial w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="authStore.isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
              <span v-else-if="isRateLimited">
                Bloqueado ({{ rateLimitRemaining }}s)
              </span>
              <span v-else>Iniciar Sesión</span>
            </button>
          </div>
        </form>

        <!-- Panel de ayuda -->
        <transition name="slide-down">
          <div v-if="showHelp" class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Información de acceso</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><strong>Usuarios por defecto:</strong></p>
              <ul class="list-disc list-inside space-y-1 text-xs">
                <li><strong>Administrador:</strong> admin / admin123</li>
                <li><strong>Supervisor:</strong> supervisor / super123</li>
                <li><strong>Operador:</strong> operador / oper123</li>
              </ul>
              <p class="text-xs text-gray-500 mt-3">
                Si tienes problemas para acceder, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </transition>

        <!-- Información del sistema (solo en desarrollo) -->
        <div v-if="isDevelopment" class="mt-6 pt-6 border-t border-gray-200">
          <div class="text-center text-xs text-gray-500">
            <p>Entorno: {{ config.environment }}</p>
            <p>Versión: {{ config.version }}</p>
            <p>API: {{ config.apiUrl }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { config } from '@/config'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Estado del formulario
const form = ref({
  username: '',
  password: ''
})

const passwordInput = ref<HTMLInputElement | null>(null)
const showPassword = ref(false)
const rememberMe = ref(false)
const showHelp = ref(false)

// Control de errores
const errors = ref<Record<string, string>>({})
const errorMessage = ref('')
const successMessage = ref('')
const loginAttempts = ref(0)

// Rate limiting
const isRateLimited = ref(false)
const rateLimitRemaining = ref(0)
let rateLimitTimer: number | null = null

// Configuración
const appTitle = computed(() => config.appTitle)
const isDevelopment = computed(() => config.environment === 'development')

// Validación del formulario
const isFormValid = computed(() => {
  return form.value.username.trim().length > 0 &&
         form.value.password.length > 0 &&
         Object.keys(errors.value).length === 0
})

// Métodos principales
const handleLogin = async () => {
  // Limpiar mensajes anteriores
  clearErrors()

  // Validación básica
  if (!validateForm()) {
    return
  }

  try {
    const success = await authStore.login(form.value)

    if (success) {
      successMessage.value = 'Login exitoso. Redirigiendo...'
      loginAttempts.value = 0

      // Guardar username si "recordarme" está activo
      if (rememberMe.value) {
        localStorage.setItem('remembered_username', form.value.username)
      } else {
        localStorage.removeItem('remembered_username')
      }

      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        // Redirigir a la ruta guardada o al dashboard
        const redirectTo = route.query.redirect as string ||
                          sessionStorage.getItem('redirect_after_login') ||
                          '/dashboard'
        sessionStorage.removeItem('redirect_after_login')
        router.push(redirectTo)
      }, 500)
    }
  } catch (error: any) {
    loginAttempts.value++
    handleLoginError(error)
  }
}

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!form.value.username.trim()) {
    newErrors.username = 'El usuario es requerido'
  } else if (form.value.username.length < 3) {
    newErrors.username = 'Usuario debe tener al menos 3 caracteres'
  }

  if (!form.value.password) {
    newErrors.password = 'La contraseña es requerida'
  } else if (form.value.password.length < 6) {
    newErrors.password = 'Contraseña debe tener al menos 6 caracteres'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleLoginError = (error: any) => {
  // Analizar el tipo de error
  const errorData = error.response?.data || error

  // Manejar rate limiting
  if (error.response?.status === 429) {
    handleRateLimit(error.response)
    return
  }

  // Manejar errores específicos del campo
  if (errorData.errors) {
    if (errorData.errors.username) {
      errors.value.username = Array.isArray(errorData.errors.username)
        ? errorData.errors.username[0]
        : errorData.errors.username
    }

    if (errorData.errors.password) {
      errors.value.password = Array.isArray(errorData.errors.password)
        ? errorData.errors.password[0]
        : errorData.errors.password
    }

    if (errorData.errors.non_field_errors) {
      errorMessage.value = Array.isArray(errorData.errors.non_field_errors)
        ? errorData.errors.non_field_errors[0]
        : errorData.errors.non_field_errors
    }
  } else if (errorData.message) {
    errorMessage.value = errorData.message
  } else if (typeof errorData === 'string') {
    errorMessage.value = errorData
  } else {
    // Error genérico basado en el número de intentos
    if (loginAttempts.value >= 5) {
      errorMessage.value = 'Demasiados intentos fallidos. Por favor, verifica tus credenciales o contacta al administrador.'
    } else if (loginAttempts.value >= 3) {
      errorMessage.value = 'Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.'
    } else {
      errorMessage.value = 'Error al iniciar sesión. Por favor, intenta nuevamente.'
    }
  }

  // Auto-limpiar mensaje de error después de 10 segundos
  setTimeout(() => {
    if (errorMessage.value) {
      errorMessage.value = ''
    }
  }, 10000)
}

const handleRateLimit = (response: any) => {
  const retryAfter = response.headers['retry-after'] || 60
  isRateLimited.value = true
  rateLimitRemaining.value = parseInt(retryAfter)

  errorMessage.value = `Demasiados intentos de login. Intenta de nuevo en ${retryAfter} segundos.`

  // Countdown timer
  rateLimitTimer = setInterval(() => {
    rateLimitRemaining.value--
    if (rateLimitRemaining.value <= 0) {
      isRateLimited.value = false
      clearInterval(rateLimitTimer!)
      rateLimitTimer = null
      errorMessage.value = ''
    }
  }, 1000)
}

// Utilidades
const clearErrors = () => {
  errors.value = {}
  errorMessage.value = ''
  successMessage.value = ''
}

const clearFieldError = (field: string) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const handleEnterKey = (event: KeyboardEvent) => {
  // Si estamos en el campo de usuario, enfocar contraseña
  if (event.target === document.getElementById('username')) {
    event.preventDefault()
    passwordInput.value?.focus()
  }
  // Si estamos en contraseña y el formulario es válido, enviar
  else if (event.target === passwordInput.value && isFormValid.value) {
    event.preventDefault()
    handleLogin()
  }
}

// Inicialización
onMounted(async () => {
  // Si ya está autenticado, redirigir
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
    return
  }

  // Cargar usuario recordado si existe
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    form.value.username = rememberedUsername
    rememberMe.value = true

    // Enfocar campo de contraseña
    await nextTick()
    passwordInput.value?.focus()
  }

  // Auto-limpiar mensajes de error al hacer click fuera
  document.addEventListener('click', (event) => {
    const target = event.target as Element
    if (!target.closest('.bg-red-50') && errorMessage.value) {
      setTimeout(() => {
        errorMessage.value = ''
      }, 100)
    }
  })
})

// Cleanup
onUnmounted(() => {
  if (rateLimitTimer) {
    clearInterval(rateLimitTimer)
  }
})
</script>

<style scoped>
/* Estilos de componentes industriales */
.input-industrial {
  @apply appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200;
}

.input-industrial:disabled {
  @apply bg-gray-100 cursor-not-allowed;
}

.btn-industrial {
  @apply group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

/* Animación de spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
