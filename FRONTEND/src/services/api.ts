// services/api.ts - SERVICIO API COMPLETO
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig
} from 'axios'
import { config, STORAGE_KEYS, API_CONFIG } from '@/config'

// ===== CONFIGURACIÓN PRINCIPAL =====

// Crear instancia de Axios
export const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// ===== INTERFACES =====

interface RetryConfig {
  attempts: number
  delay: number
  maxDelay: number
  exponentialBase: number
}

interface RequestState {
  retryCount: number
  startTime: number
}

// ===== ESTADO GLOBAL =====

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
}> = []

const retryConfig: RetryConfig = {
  attempts: API_CONFIG.RETRY_ATTEMPTS,
  delay: API_CONFIG.RETRY_DELAY,
  maxDelay: 10000,
  exponentialBase: 2
}

// ===== UTILIDADES =====

/**
 * Calcula el delay para el próximo intento de retry
 */
const calculateRetryDelay = (retryNumber: number): number => {
  const delay = retryConfig.delay * Math.pow(retryConfig.exponentialBase, retryNumber)
  return Math.min(delay, retryConfig.maxDelay)
}

/**
 * Determina si un error es candidato para retry
 */
const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Errores de red o timeout
    return true
  }

  const status = error.response.status
  // Retry en errores del servidor y algunos errores específicos
  return status >= 500 || status === 408 || status === 429
}

/**
 * Delay asíncrono
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Obtiene el token de autenticación
 */
const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

/**
 * Establece el token en los headers
 */
const setAuthHeader = (token: string): void => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
/**
 * Limpia la autenticación
 */
const clearAuth = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  delete api.defaults.headers.common['Authorization']
}

// ===== INTERCEPTORES DE REQUEST =====

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Agregar timestamp para prevenir cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    // Agregar token de autenticación si existe
    const token = getToken()
    if (token && !config.headers['Authorization']) {
  config.headers['Authorization'] = `Bearer ${token}`
}

    // Logging en desarrollo
    if (config.url && import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      })
    }

    // Inicializar estado de retry
    if (!config.metadata) {
      config.metadata = {}
    }
    config.metadata.requestState = {
      retryCount: 0,
      startTime: Date.now()
    } as RequestState

    return config
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error)
    return Promise.reject(error)
  }
)

// ===== INTERCEPTORES DE RESPONSE =====

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de respuestas exitosas en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      const duration = Date.now() - (response.config.metadata?.requestState?.startTime || 0)
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        data: response.data
      })
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      metadata?: { requestState?: RequestState }
      _retry?: boolean
    }

    // Log de errores en desarrollo
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      })
    }

    // Manejo específico por código de error
    if (error.response) {
      switch (error.response.status) {
        case 401:
          return handleUnauthorized(error, originalRequest)

        case 403:
          handleForbidden(error)
          break

        case 404:
          console.warn('🔍 Recurso no encontrado:', originalRequest?.url)
          break

        case 422:
          console.warn('📝 Error de validación:', error.response.data)
          break

        case 429:
          return handleRateLimited(error, originalRequest)

        case 500:
        case 502:
        case 503:
        case 504:
          return handleServerError(error, originalRequest)

        default:
          console.error('🚨 Error no manejado:', error.response.status, error.response.data)
      }
    } else if (error.request) {
      // Error de red - intentar retry
      console.error('🌐 Error de red - no hay respuesta del servidor')
      return handleNetworkError(error, originalRequest)
    } else {
      console.error('⚙️ Error al configurar la petición:', error.message)
    }

    return Promise.reject(error)
  }
)

// ===== HANDLERS DE ERRORES =====

/**
 * Maneja errores 401 (No autorizado)
 */
// async function handleUnauthorized(
//   error: AxiosError,
//   originalRequest?: InternalAxiosRequestConfig & { _retry?: boolean }
// ): Promise<any> {
//   if (!originalRequest || originalRequest._retry) {
//     clearAuth()
//     redirectToLogin()
//     return Promise.reject(error)
//   }

//   if (isRefreshing) {
//     // Agregar a la cola de peticiones fallidas
//     return new Promise((resolve, reject) => {
//       failedQueue.push({ resolve, reject })
//     })
//   }

//   originalRequest._retry = true
//   isRefreshing = true

//   try {
//     // Intentar refrescar el token
//     const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
//     if (!refreshToken) {
//       throw new Error('No refresh token available')
//     }

//     const response = await axios.post(`${config.apiUrl}/auth/refresh/`, {
//       refresh: refreshToken
//     })

//     const { access, refresh } = response.data

//     // Guardar nuevos tokens
//     localStorage.setItem(STORAGE_KEYS.TOKEN, access)
//     if (refresh) {
//       localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
//     }

//     // Actualizar header
//     setAuthHeader(access)

//     // Procesar cola de peticiones fallidas
//     failedQueue.forEach(({ resolve }) => resolve(access))
//     failedQueue = []

//     // Reenviar petición original
//     originalRequest.headers['Authorization'] = `Bearer ${access}`
//     return api(originalRequest)

//   } catch (refreshError) {
//     // Fallo en refresh - limpiar todo y redirigir
//     failedQueue.forEach(({ reject }) => reject(refreshError))
//     failedQueue = []

//     clearAuth()
//     redirectToLogin()

//     return Promise.reject(refreshError)
//   } finally {
//     isRefreshing = false
//   }
// }
function handleUnauthorized(
  error: AxiosError,
  originalRequest?: InternalAxiosRequestConfig & { _retry?: boolean }
): Promise<any> {
  console.warn('Token inválido o sesión expirada. Componente debe manejar la redirección.');

  const isLoginPage = window.location.pathname === '/login';
  const isDashboardPage = window.location.pathname === '/dashboard';

  if (!isLoginPage && !isDashboardPage) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);  // ✅ Corregido
    localStorage.removeItem(STORAGE_KEYS.USER);   // ✅ Corregido

    sessionStorage.setItem('redirect_after_login', window.location.pathname);
    window.location.href = '/login';
  }
  return Promise.reject(error);
}
/**
 * Maneja errores 403 (Prohibido)
 */
function handleForbidden(error: AxiosError): void {
  console.warn('🚫 Acceso prohibido:', error.config?.url)

  // Mostrar notificación si está disponible
  if (window.dispatchEvent) {
    const event = new CustomEvent('api:forbidden', {
      detail: {
        url: error.config?.url,
        message: 'No tienes permisos para realizar esta acción'
      }
    })
    window.dispatchEvent(event)
  }
}

/**
 * Maneja errores 429 (Rate Limiting)
 */
async function handleRateLimited(
  error: AxiosError,
  originalRequest?: InternalAxiosRequestConfig
): Promise<any> {
  if (!originalRequest) return Promise.reject(error)

  const retryAfter = error.response?.headers['retry-after']
  const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000

  console.warn(`⏳ Rate limited. Waiting ${waitTime}ms before retry...`)

  await delay(waitTime)
  return api(originalRequest)
}

/**
 * Maneja errores del servidor (5xx)
 */
async function handleServerError(
  error: AxiosError,
  originalRequest?: InternalAxiosRequestConfig & { metadata?: { requestState?: RequestState } }
): Promise<any> {
  if (!originalRequest?.metadata?.requestState) {
    return Promise.reject(error)
  }

  const { retryCount } = originalRequest.metadata.requestState

  if (retryCount >= retryConfig.attempts) {
    console.error(`🔥 Server error after ${retryCount} retries:`, error.response?.status)
    return Promise.reject(error)
  }

  const waitTime = calculateRetryDelay(retryCount)
  console.warn(`🔄 Server error. Retry ${retryCount + 1}/${retryConfig.attempts} in ${waitTime}ms...`)

  originalRequest.metadata.requestState.retryCount++

  await delay(waitTime)
  return api(originalRequest)
}

/**
 * Maneja errores de red
 */
async function handleNetworkError(
  error: AxiosError,
  originalRequest?: InternalAxiosRequestConfig & { metadata?: { requestState?: RequestState } }
): Promise<any> {
  if (!originalRequest?.metadata?.requestState) {
    return Promise.reject(error)
  }

  const { retryCount } = originalRequest.metadata.requestState

  if (retryCount >= retryConfig.attempts) {
    console.error(`🌐 Network error after ${retryCount} retries`)
    return Promise.reject(error)
  }

  const waitTime = calculateRetryDelay(retryCount)
  console.warn(`🔄 Network error. Retry ${retryCount + 1}/${retryConfig.attempts} in ${waitTime}ms...`)

  originalRequest.metadata.requestState.retryCount++

  await delay(waitTime)
  return api(originalRequest)
}

/**
 * Redirige al login
 */
function redirectToLogin(): void {
  // Guardar ruta actual para redirigir después del login
  if (window.location.pathname !== '/login') {
    sessionStorage.setItem('redirect_after_login', window.location.pathname)
  }

  // Notificar a la aplicación sobre logout
  if (window.dispatchEvent) {
    const event = new CustomEvent('auth:logout', {
      detail: { reason: 'token_expired' }
    })
    window.dispatchEvent(event)
  }

  // Redirigir
  window.location.href = '/login'
}

// ===== API HELPERS =====

/**
 * Wrapper para peticiones GET con tipo
 */
export async function apiGet<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  const response = await api.get<T>(url, { params })
  return response.data
}

/**
 * Wrapper para peticiones POST con tipo
 */
export async function apiPost<T = any>(url: string, data?: any): Promise<T> {
  const response = await api.post<T>(url, data)
  return response.data
}

/**
 * Wrapper para peticiones PUT con tipo
 */
export async function apiPut<T = any>(url: string, data?: any): Promise<T> {
  const response = await api.put<T>(url, data)
  return response.data
}

/**
 * Wrapper para peticiones PATCH con tipo
 */
export async function apiPatch<T = any>(url: string, data?: any): Promise<T> {
  const response = await api.patch<T>(url, data)
  return response.data
}

/**
 * Wrapper para peticiones DELETE con tipo
 */
export async function apiDelete<T = any>(url: string): Promise<T> {
  const response = await api.delete<T>(url)
  return response.data
}

/**
 * Upload de archivos con progreso
 */
export async function apiUpload<T = any>(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })

  return response.data
}

/**
 * Download de archivos
 */
export async function apiDownload(url: string, filename?: string): Promise<void> {
  const response = await api.get(url, {
    responseType: 'blob'
  })

  const blob = new Blob([response.data])
  const downloadUrl = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  window.URL.revokeObjectURL(downloadUrl)
}

// ===== CONFIGURACIÓN INICIAL =====

/**
 * Inicializa el servicio API
 */
export function initializeApi(): void {
  // Configurar token inicial si existe
  const token = getToken()
  if (token) {
    setAuthHeader(token)
  }

  // Log de inicialización
  if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    console.log('🔧 API Service initialized', {
      baseURL: config.apiUrl,
      timeout: API_CONFIG.TIMEOUT,
      retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
      hasToken: !!token
    })
  }
}

// Inicializar automáticamente
initializeApi()

// ===== EXPORTACIONES =====

export default api
export { setAuthHeader, clearAuth, getToken }
