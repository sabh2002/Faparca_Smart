// services/api.ts - VERSIÓN LIMPIA SIN DUPLICADOS
import axios from 'axios'
import type { AxiosResponse, AxiosError } from 'axios'

// Obtener configuración desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const TOKEN_STORAGE_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token'
const USER_STORAGE_KEY = import.meta.env.VITE_USER_STORAGE_KEY || 'user_data'
const API_RETRY_ATTEMPTS = Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3
const API_RETRY_DELAY = Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000

// Crear instancia de axios con configuración base
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos de timeout
  withCredentials: true, // Enviar cookies si es necesario
})

// ===== ✅ FUNCIONES REQUERIDAS POR AUTH.TS (UNA SOLA VEZ) =====

/**
 * Establece el token de autenticación
 */
export const setAuthToken = (token: string, expiresAt?: string): void => {
  const tokenData = expiresAt ? JSON.stringify({ key: token, expires_at: expiresAt }) : token
  localStorage.setItem(TOKEN_STORAGE_KEY, tokenData)

  // Configurar header para futuras peticiones
  const actualToken = expiresAt ? token : tokenData
  api.defaults.headers.common['Authorization'] = `Token ${actualToken}`
}

/**
 * Limpia el token de autenticación
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  delete api.defaults.headers.common['Authorization']
}

/**
 * Obtiene el token actual
 */
export const getAuthToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) return null

  try {
    const tokenData = JSON.parse(token)
    return tokenData.key || tokenData
  } catch {
    return token
  }
}

/**
 * Verifica si el token ha expirado
 */
export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) return true

  try {
    const tokenData = JSON.parse(token)
    if (tokenData.expires_at) {
      return new Date(tokenData.expires_at) < new Date()
    }
  } catch {
    // Si no hay información de expiración, asumir que no ha expirado
  }

  return false
}

/**
 * Extrae mensaje de error de respuesta de API
 */
export const extractErrorMessage = (error: any): string => {
  if (error.response?.data) {
    const data = error.response.data

    // Buscar mensaje de error en diferentes formatos
    if (typeof data === 'string') return data
    if (data.message) return data.message
    if (data.detail) return data.detail
    if (data.error) return data.error
    if (data.non_field_errors) return data.non_field_errors[0]

    // Si hay errores de campo, tomar el primero
    if (data.errors) {
      const firstError = Object.values(data.errors)[0]
      if (Array.isArray(firstError)) return firstError[0]
      return String(firstError)
    }

    // Intentar convertir a string
    return JSON.stringify(data)
  }

  if (error.message) return error.message

  return 'Ha ocurrido un error inesperado'
}

// ===== LÓGICA DE REINTENTOS =====

// Función helper para reintentos
const retryRequest = async (error: AxiosError, retries = API_RETRY_ATTEMPTS): Promise<any> => {
  if (retries === 0) {
    return Promise.reject(error)
  }

  // Solo reintentar en errores de red o 5xx
  if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
    await new Promise((resolve) => setTimeout(resolve, API_RETRY_DELAY))

    try {
      return await api.request(error.config!)
    } catch (retryError) {
      return retryRequest(retryError as AxiosError, retries - 1)
    }
  }

  return Promise.reject(error)
}

// ===== INTERCEPTORES =====

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (token) {
      // Verificar si el token está en formato JSON (con información de expiración)
      try {
        const tokenData = JSON.parse(token)

        // Verificar si el token ha expirado
        if (tokenData.expires_at) {
          const expiresAt = new Date(tokenData.expires_at)
          if (expiresAt < new Date()) {
            // Token expirado, limpiar y redirigir
            localStorage.removeItem(TOKEN_STORAGE_KEY)
            localStorage.removeItem(USER_STORAGE_KEY)
            window.location.href = '/login'
            return Promise.reject(new Error('Token expirado'))
          }
        }

        config.headers.Authorization = `Token ${tokenData.key || tokenData}`
      } catch {
        // Si no es JSON, asumir que es solo el token
        config.headers.Authorization = `Token ${token}`
      }
    }

    // Agregar timestamp para cache busting si es necesario
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }

    // Logging en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }

    return config
  },
  (error) => {
    console.error('Error en request interceptor:', error)
    return Promise.reject(error)
  },
)

// Interceptor para manejo de errores y respuestas
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de respuestas exitosas en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data,
      )
    }

    return response
  },
  async (error: AxiosError) => {
    // Log de errores en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error)
    }

    // Manejo específico por código de error
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expirado o inválido
          handleUnauthorized()
          break

        case 403:
          // Sin permisos
          handleForbidden()
          break

        case 404:
          // Recurso no encontrado
          console.error('Recurso no encontrado:', error.config?.url)
          break

        case 422:
          // Error de validación
          console.error('Error de validación:', error.response.data)
          break

        case 429:
          // Rate limiting
          handleRateLimited(error)
          break

        case 500:
        case 502:
        case 503:
        case 504:
          // Errores del servidor - intentar reintento
          return retryRequest(error)

        default:
          console.error('Error no manejado:', error.response.status)
      }
    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta
      console.error('Error de red - no hay respuesta del servidor')

      // Intentar reintento para errores de red
      return retryRequest(error)
    } else {
      // Error al configurar la petición
      console.error('Error al configurar la petición:', error.message)
    }

    return Promise.reject(error)
  },
)

// ===== MANEJADORES DE ERRORES =====

// Funciones helper para manejo de errores específicos
function handleUnauthorized() {
  // Limpiar datos de autenticación
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)

  // Mostrar mensaje si no estamos ya en login
  if (window.location.pathname !== '/login') {
    console.warn('Sesión expirada. Redirigiendo al login...')

    // Guardar la ruta actual para redirigir después del login
    sessionStorage.setItem('redirect_after_login', window.location.pathname)

    // Redirigir al login
    window.location.href = '/login'
  }
}

function handleForbidden() {
  console.error('No tienes permisos para realizar esta acción')

  // Aquí podrías mostrar un toast o notificación
  // Por ejemplo: toast.error('No tienes permisos para realizar esta acción');
}

function handleRateLimited(error: AxiosError) {
  const retryAfter = error.response?.headers['retry-after']
  const message = retryAfter
    ? `Demasiadas peticiones. Intenta de nuevo en ${retryAfter} segundos.`
    : 'Demasiadas peticiones. Por favor, intenta más tarde.'

  console.error(message)

  // Aquí podrías mostrar un toast o notificación
  // Por ejemplo: toast.warning(message);
}

// ===== FUNCIONES ADICIONALES =====

/**
 * Inicializa el servicio API
 */
export function initializeApi(): void {
  // Configurar token inicial si existe
  const token = getAuthToken()
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`
  }

  // Log de inicialización
  if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    console.log('🔧 API Service initialized', {
      baseURL: API_BASE_URL,
      hasToken: !!token,
    })
  }
}

// Inicializar automáticamente
initializeApi()

export default api
