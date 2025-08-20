<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-14 0h2m-2 0h-2m16 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
          </svg>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          {{ appTitle }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      <!-- Formulario -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <!-- Usuario -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="input-industrial"
              :class="{ 'border-red-500': errors.username }"
              placeholder="Ingresa tu usuario"
              :disabled="authStore.isLoading"
              @input="clearFieldError('username')"
              @keydown.enter="focusPassword"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- Contraseña -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div class="relative">
              <input
                ref="passwordInput"
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-industrial pr-10"
                :class="{ 'border-red-500': errors.password }"
                placeholder="Ingresa tu contraseña"
                :disabled="authStore.isLoading"
                @input="clearFieldError('password')"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
                tabindex="-1"
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
                <p class="text-sm text-green-800">{{ successMessage }}</p>
              </div>
            </div>
          </div>
        </transition>

        <!-- Botón Login -->
        <div>
          <button
            type="submit"
            :disabled="authStore.isLoading || !form.username || !form.password || isRateLimited"
            class="btn-industrial w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            <div v-if="authStore.isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </div>
            <span v-else-if="isRateLimited">
              Espera {{ rateLimitRemaining }} segundos...
            </span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </div>

        <!-- Opciones adicionales -->
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-gray-600">Recordarme</span>
          </label>
          
          <a href="#" class="text-blue-600 hover:text-blue-500" @click.prevent="showHelp = true">
            ¿Necesitas ayuda?
          </a>
        </div>

        <!-- Credenciales de prueba (solo en desarrollo) -->
        <div v-if="isDevelopment" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="text-sm font-medium text-blue-800 mb-2">Credenciales de Prueba:</h4>
          <div class="text-xs text-blue-700 space-y-1">
            <button
              type="button"
              class="block hover:underline"
              @click="fillCredentials('admin', 'admin123')"
            >
              <strong>Admin:</strong> admin / admin123
            </button>
            <button
              type="button"
              class="block hover:underline"
              @click="fillCredentials('operador1', 'oper123')"
            >
              <strong>Operador:</strong> operador1 / oper123
            </button>
          </div>
        </div>
      </form>

      <!-- Modal de ayuda -->
      <transition name="modal">
        <div v-if="showHelp" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-lg max-w-md w-full p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Ayuda para iniciar sesión</h3>
            <div class="space-y-3 text-sm text-gray-600">
              <p>Si tienes problemas para iniciar sesión:</p>
              <ul class="list-disc list-inside space-y-1">
                <li>Verifica que tu usuario y contraseña sean correctos</li>
                <li>Asegúrate de que tu cuenta esté activa</li>
                <li>Si olvidaste tu contraseña, contacta al administrador</li>
                <li>Si el problema persiste, revisa tu conexión a internet</li>
              </ul>
              <div class="mt-4 p-3 bg-gray-50 rounded">
                <p class="font-medium text-gray-700">Contacto de soporte:</p>
                <p>Email: soporte@faparca.com</p>
                <p>Tel: (555) 123-4567</p>
              </div>
            </div>
            <button
              type="button"
              class="mt-6 w-full btn-industrial bg-gray-600 text-white hover:bg-gray-700"
              @click="showHelp = false"
            >
              Cerrar
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Estado del formulario
const form = ref({
  username: '',
  password: ''
});

const passwordInput = ref<HTMLInputElement | null>(null);
const showPassword = ref(false);
const rememberMe = ref(false);
const showHelp = ref(false);

// Control de errores
const errors = ref<Record<string, string>>({});
const errorMessage = ref('');
const successMessage = ref('');
const loginAttempts = ref(0);

// Rate limiting
const isRateLimited = ref(false);
const rateLimitRemaining = ref(0);
let rateLimitTimer: number | null = null;

// Configuración
const appTitle = computed(() => import.meta.env.VITE_APP_TITLE || 'Sistema OEE FAPARCA');
const isDevelopment = computed(() => import.meta.env.VITE_APP_ENV === 'development');

// Métodos
const handleLogin = async () => {
  // Limpiar mensajes anteriores
  clearErrors();
  
  // Validación básica
  if (!validateForm()) {
    return;
  }
  
  try {
    const success = await authStore.login(form.value);
    
    if (success) {
      successMessage.value = 'Login exitoso. Redirigiendo...';
      loginAttempts.value = 0;
      
      // Guardar username si "recordarme" está activo
      if (rememberMe.value) {
        localStorage.setItem('remembered_username', form.value.username);
      } else {
        localStorage.removeItem('remembered_username');
      }
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        // Redirigir a la ruta guardada o al dashboard
        const redirectTo = route.query.redirect as string || sessionStorage.getItem('redirect_after_login') || '/dashboard';
        sessionStorage.removeItem('redirect_after_login');
        router.push(redirectTo);
      }, 500);
    }
  } catch (error: any) {
    loginAttempts.value++;
    handleLoginError(error);
  }
};

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  if (!form.value.username.trim()) {
    newErrors.username = 'El usuario es requerido';
  } else if (form.value.username.length < 1) {
    newErrors.username = 'Usuario inválido';
  }
  
  if (!form.value.password) {
    newErrors.password = 'La contraseña es requerida';
  } else if (form.value.password.length < 1) {
    newErrors.password = 'Contraseña inválida';
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleLoginError = (error: any) => {
  // Analizar el tipo de error
  const errorData = error.response?.data || error;
  
  // Manejar rate limiting
  if (error.response?.status === 429) {
    handleRateLimit(error.response);
    return;
  }
  
  // Manejar errores específicos del campo
  if (errorData.errors) {
    if (errorData.errors.username) {
      errors.value.username = Array.isArray(errorData.errors.username) 
        ? errorData.errors.username[0] 
        : errorData.errors.username;
    }
    
    if (errorData.errors.password) {
      errors.value.password = Array.isArray(errorData.errors.password)
        ? errorData.errors.password[0]
        : errorData.errors.password;
    }
    
    if (errorData.errors.non_field_errors) {
      errorMessage.value = Array.isArray(errorData.errors.non_field_errors)
        ? errorData.errors.non_field_errors[0]
        : errorData.errors.non_field_errors;
    }
  } else if (errorData.message) {
    errorMessage.value = errorData.message;
  } else if (typeof errorData === 'string') {
    errorMessage.value = errorData;
  } else {
    // Error genérico basado en el número de intentos
    if (loginAttempts.value >= 5) {
      errorMessage.value = 'Demasiados intentos fallidos. Por favor, verifica tus credenciales o contacta al administrador.';
    } else if (loginAttempts.value >= 3) {
      errorMessage.value = 'Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.';
    } else {
      errorMessage.value = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
    }
  }
  
  // Auto-limpiar mensaje de error después de 10 segundos
  setTimeout(() => {
    if (errorMessage.value) {
      errorMessage.value = '';
    }
  }, 10000);
};

const handleRateLimit = (response: any) => {
  const retryAfter = response.headers['retry-after'] || 60;
  isRateLimited.value = true;
  rateLimitRemaining.value = parseInt(retryAfter);
  
  errorMessage.value = `Demasiados intentos de login. Por favor, espera ${rateLimitRemaining.value} segundos.`;
  
  // Contador regresivo
  rateLimitTimer = window.setInterval(() => {
    rateLimitRemaining.value--;
    
    if (rateLimitRemaining.value <= 0) {
      isRateLimited.value = false;
      errorMessage.value = '';
      
      if (rateLimitTimer) {
        clearInterval(rateLimitTimer);
        rateLimitTimer = null;
      }
    }
  }, 1000);
};

const clearErrors = () => {
  errors.value = {};
  errorMessage.value = '';
  successMessage.value = '';
  authStore.clearError();
};

const clearFieldError = (field: string) => {
  delete errors.value[field];
  
  // Si no hay más errores de campo, limpiar el mensaje general
  if (Object.keys(errors.value).length === 0) {
    errorMessage.value = '';
  }
};

const fillCredentials = (username: string, password: string) => {
  form.value.username = username;
  form.value.password = password;
  clearErrors();
};

const focusPassword = () => {
  passwordInput.value?.focus();
};

// Lifecycle
onMounted(() => {
  // Limpiar errores anteriores
  clearErrors();
  
  // Si ya está autenticado, redirigir
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
    return;
  }
  
  // Cargar username recordado
  const rememberedUsername = localStorage.getItem('remembered_username');
  if (rememberedUsername) {
    form.value.username = rememberedUsername;
    rememberMe.value = true;
    // Enfocar en password si hay username recordado
    setTimeout(() => passwordInput.value?.focus(), 100);
  }
  
  // Mostrar mensaje si viene de logout
  if (route.query.message) {
    successMessage.value = route.query.message as string;
    
    // Limpiar el mensaje después de 5 segundos
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  }
});

onUnmounted(() => {
  // Limpiar timer de rate limit si existe
  if (rateLimitTimer) {
    clearInterval(rateLimitTimer);
  }
});
</script>

<style scoped>
/* Transiciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white {
  transform: scale(0.9);
}

.modal-leave-to .bg-white {
  transform: scale(0.9);
}

/* Estilos personalizados */
.input-industrial {
  @apply appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm;
}

.btn-industrial {
  @apply group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200;
}
</style>
