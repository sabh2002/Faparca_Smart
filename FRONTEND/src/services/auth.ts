import api, { setAuthToken, clearAuthToken, isTokenExpired, extractErrorMessage } from './api'
import type { LoginData, LoginResponse, Usuario } from '@/types/oee'
import { STORAGE_KEYS } from '@/config'

const SESSION_TIMEOUT = Number(import.meta.env.VITE_SESSION_TIMEOUT) || 86400000 // 24 horas
const TOKEN_REFRESH_INTERVAL = Number(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 3600000 // 1 hora

export class AuthService {
  private static refreshTimer: number | null = null
  private static sessionTimer: number | null = null

  static async login(credentials: LoginData): Promise<LoginResponse> {
    try {
      console.log('🔄 INICIO: Intentando login...')

      const response = await api.post('/auth/login/', credentials)
      const { token, expires_at, expires_in, user, message } = response.data

      console.log('✅ Login exitoso:', {
        user: user.username,
        token: token.substring(0, 8) + '...',
      })

      // Guardar token con información de expiración
      setAuthToken(token, expires_at)

      // Guardar datos de usuario
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      // Configurar auto-refresh del token si existe expires_in
      if (expires_in) {
        this.setupTokenRefresh(expires_in)
      }

      // Configurar timeout de sesión
      this.setupSessionTimeout()

      return {
        token,
        user,
        expires_at,
        message: message || 'Login exitoso',
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error)
      const errorMessage = extractErrorMessage(error)

      // Limpiar cualquier dato residual
      this.clearAuthData()

      throw new Error(errorMessage)
    }
  }

  static async logout(): Promise<void> {
    try {
      // Intentar logout en el servidor
      await api.post('/auth/logout/')
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error)
    } finally {
      // Limpiar datos locales independientemente del resultado
      this.clearAuthData()
    }
  }

  static async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post('/auth/refresh/')
      const { token, expires_at, expires_in } = response.data

      // Actualizar token
      setAuthToken(token, expires_at)

      // Reconfigurar auto-refresh si existe expires_in
      if (expires_in) {
        this.setupTokenRefresh(expires_in)
      }

      console.log('Token refrescado exitosamente')
      return token
    } catch (error) {
      console.error('Error al refrescar token:', error)

      // Si falla el refresh, hacer logout
      this.clearAuthData()
      window.location.href = '/login'
      return null
    }
  }

  static async verifyToken(): Promise<boolean> {
    try {
      const response = await api.get('/auth/verify/')

      if (response.data.valid && response.data.user) {
        // Actualizar datos de usuario
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user))
        return true
      }

      return false
    } catch (error) {
      console.error('Error al verificar token:', error)
      return false
    }
  }

  static async changePassword(
    oldPassword: string,
    newPassword: string,
    newPassword2: string,
  ): Promise<void> {
    try {
      const user = this.getCurrentUser()
      if (!user) throw new Error('No hay usuario autenticado')

      await api.post(`/usuarios/${user.id}/change_password/`, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      })

      // Después de cambiar la contraseña, el token se revoca
      // así que limpiamos y redirigimos al login
      this.clearAuthData()
    } catch (error: any) {
      throw new Error(extractErrorMessage(error))
    }
  }

  static getCurrentUser(): Usuario | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error al obtener usuario actual:', error)
      return null
    }
  }

  static getToken(): string | null {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
      if (!token) return null

      // Intentar parsear como JSON primero
      try {
        const tokenData = JSON.parse(token)
        return tokenData.key || tokenData
      } catch {
        // Si no es JSON válido, retornar el token como string
        return token
      }
    } catch (error) {
      console.error('Error al obtener token:', error)
      return null
    }
  }

  // ✅ MÉTODO PRINCIPAL CORREGIDO - SIN parseTokenPayload
  static isAuthenticated(): boolean {
    try {
      const token = this.getToken()
      const hasValidToken = !!token && !isTokenExpired()

      console.log('🔍 AuthService.isAuthenticated():', {
        hasToken: !!token,
        isExpired: isTokenExpired(),
        result: hasValidToken,
      })

      return hasValidToken
    } catch (error) {
      console.error('❌ Error al verificar token:', error)
      return false
    }
  }

  static hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    return user?.rol === role
  }

  static hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser()
    return user ? roles.includes(user.rol) : false
  }

  static canAccessArea(areaId: number): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Administradores y supervisores pueden acceder a todo
    if (['administrador', 'supervisor'].includes(user.rol)) return true

    // Operadores solo a su área asignada
    if (user.rol === 'operador') {
      return user.area_asignada === areaId
    }

    // Viewers pueden ver todo pero no modificar
    return user.rol === 'viewer'
  }

  static canModifyArea(areaId: number): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Viewers no pueden modificar
    if (user.rol === 'viewer') return false

    // Administradores y supervisores pueden modificar todo
    if (['administrador', 'supervisor'].includes(user.rol)) return true

    // Operadores solo su área
    return user.rol === 'operador' && user.area_asignada === areaId
  }

  // ===== ✅ MÉTODOS AGREGADOS PARA COMPATIBILIDAD CON STORE =====

  /**
   * Inicializar autenticación (requerido por el store)
   */
  static async initializeAuth(): Promise<boolean> {
    console.log('🔧 Inicializando AuthService...')

    try {
      if (this.isAuthenticated()) {
        // Verificar token con el servidor
        const isValid = await this.verifyToken()

        if (isValid) {
          // Configurar timers
          this.setupSessionTimeout()

          // Programar refresh si hay información de expiración
          const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
          if (token) {
            try {
              const tokenData = JSON.parse(token)
              if (tokenData.expires_at) {
                const expiresAt = new Date(tokenData.expires_at)
                const now = new Date()
                const expiresIn = (expiresAt.getTime() - now.getTime()) / 1000

                if (expiresIn > 0) {
                  this.setupTokenRefresh(expiresIn)
                }
              }
            } catch {
              // Token simple sin información de expiración
            }
          }

          console.log('✅ AuthService inicializado - Usuario autenticado')
          return true
        } else {
          // Token inválido, limpiar
          console.log('❌ Token inválido - Limpiando datos')
          this.clearAuthData()
          return false
        }
      } else {
        console.log('ℹ️ AuthService inicializado - Sin usuario autenticado')
        return false
      }
    } catch (error) {
      console.error('❌ Error inicializando AuthService:', error)
      return false
    }
  }

  /**
   * Obtener perfil del usuario actual (requerido por el store)
   */
  static async getProfile(): Promise<Usuario> {
    try {
      const response = await api.get('/auth/profile/')
      return response.data
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      throw error
    }
  }

  /**
   * Verificar acceso a recurso (requerido por el store)
   */
  static canAccess(resource: string, action: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Lógica básica de permisos
    switch (user.rol) {
      case 'administrador':
        return true // Admin puede todo

      case 'supervisor':
        // Supervisores pueden leer todo y modificar algunos recursos
        if (action === 'read') return true
        return ['registros', 'reportes'].includes(resource)

      case 'operador':
        // Operadores pueden leer y crear registros
        if (resource === 'registros') return ['read', 'create', 'update'].includes(action)
        if (resource === 'dashboard') return action === 'read'
        return false

      case 'viewer':
        // Viewers solo pueden leer
        return action === 'read'

      default:
        return false
    }
  }

  /**
   * Extender sesión (requerido por el store)
   */
  static async extendSession(): Promise<void> {
    try {
      await api.post('/auth/extend/')
      console.log('Sesión extendida exitosamente')
    } catch (error) {
      console.error('Error extendiendo sesión:', error)
      throw error
    }
  }

  // ===== MÉTODOS PRIVADOS =====

  private static setupTokenRefresh(expiresIn: number) {
    // Limpiar timer anterior si existe
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    // Calcular cuándo refrescar (a la mitad del tiempo de expiración)
    const refreshTime = Math.max((expiresIn * 1000) / 2, TOKEN_REFRESH_INTERVAL)

    // Configurar nuevo timer
    this.refreshTimer = window.setTimeout(() => {
      this.refreshToken()
    }, refreshTime)
  }

  private static setupSessionTimeout() {
    // Limpiar timer anterior si existe
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer)
    }

    // Configurar timeout de sesión
    this.sessionTimer = window.setTimeout(() => {
      console.warn('Sesión expirada por inactividad')
      this.clearAuthData()
      window.location.href = '/login'
    }, SESSION_TIMEOUT)
  }

  static resetSessionTimeout() {
    // Reiniciar el timer de sesión cuando hay actividad
    this.setupSessionTimeout()
  }

  private static clearAuthData() {
    // Limpiar timers
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer)
      this.sessionTimer = null
    }

    // Limpiar storage
    clearAuthToken()
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
}

// Detectar actividad del usuario para reset de timeout
if (typeof window !== 'undefined') {
  ;['mousedown', 'keydown', 'scroll', 'touchstart'].forEach((event) => {
    window.addEventListener(
      event,
      () => {
        if (AuthService.isAuthenticated()) {
          AuthService.resetSessionTimeout()
        }
      },
      { passive: true },
    )
  })
}

export default AuthService
