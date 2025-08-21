// services/auth.ts
import { api } from './api'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/config'
import type { Usuario, LoginData, LoginResponse } from '@/types/oee'

/**
 * Servicio de autenticación
 * Maneja login, logout, verificación de tokens y gestión de sesión
 */
class AuthService {
  private static instance: AuthService
  private refreshTimer: number | null = null

  constructor() {
    if (AuthService.instance) {
      return AuthService.instance
    }
    AuthService.instance = this
  }

  /**
   * Realizar login
   */
  async login(credentials: LoginData): Promise<LoginResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials)
      const data: LoginResponse = response.data

      if (data.token && data.user) {
        // Guardar token y usuario
        this.setToken(data.token)
        this.setUser(data.user)

        // Configurar header de autorización
        this.setAuthHeader(data.token)

        // Iniciar refresh automático si hay tiempo de expiración
        if (data.expires_at) {
          this.startTokenRefresh(data.expires_at)
        }

        return data
      } else {
        throw new Error('Respuesta de login inválida')
      }
    } catch (error: any) {
      console.error('Error en login:', error)

      // Limpiar datos en caso de error
      this.clearAuthData()

      throw {
        message: error.response?.data?.message || 'Error al iniciar sesión',
        errors: error.response?.data?.errors || {},
        status: error.response?.status
      }
    }
  }

  /**
   * Realizar logout
   */
  async logout(): Promise<void> {
    try {
      // Intentar notificar al servidor
      if (this.getToken()) {
        await api.post(API_ENDPOINTS.LOGOUT)
      }
    } catch (error) {
      console.warn('Error al notificar logout al servidor:', error)
    } finally {
      // Limpiar datos locales siempre
      this.clearAuthData()
      this.stopTokenRefresh()
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getCurrentUser()

    if (!token || !user) {
      return false
    }

    // Verificar si el token no ha expirado
    try {
      const payload = this.parseTokenPayload(token)
      if (payload && payload.exp) {
        const now = Math.floor(Date.now() / 1000)
        return payload.exp > now
      }
    } catch (error) {
      console.warn('Error al verificar token:', error)
      return false
    }

    return true
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Usuario | null {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER)
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error al obtener usuario:', error)
      return null
    }
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * Refrescar token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const currentToken = this.getToken()
      if (!currentToken) {
        throw new Error('No hay token para refrescar')
      }

      const response = await api.post(API_ENDPOINTS.REFRESH, {
        token: currentToken
      })

      const newToken = response.data.token
      if (newToken) {
        this.setToken(newToken)
        this.setAuthHeader(newToken)

        // Reiniciar timer de refresh
        if (response.data.expires_at) {
          this.startTokenRefresh(response.data.expires_at)
        }

        return newToken
      }

      return null
    } catch (error: any) {
      console.error('Error al refrescar token:', error)

      // Si falla el refresh, hacer logout
      this.clearAuthData()

      throw error
    }
  }

  /**
   * Verificar token con el servidor
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken()
      if (!token) return false

      await api.post(API_ENDPOINTS.VERIFY, { token })
      return true
    } catch (error) {
      console.warn('Token inválido:', error)
      return false
    }
  }

  /**
   * Inicializar autenticación desde localStorage
   */
  async initializeAuth(): Promise<boolean> {
    const token = this.getToken()
    const user = this.getCurrentUser()

    if (!token || !user) {
      return false
    }

    // Configurar header de autorización
    this.setAuthHeader(token)

    // Verificar si el token sigue siendo válido
    const isValid = await this.verifyToken()

    if (!isValid) {
      // Intentar refrescar token
      try {
        await this.refreshToken()
        return true
      } catch (error) {
        this.clearAuthData()
        return false
      }
    }

    return true
  }

  /**
   * Obtener información del perfil del usuario
   */
  async getProfile(): Promise<Usuario> {
    try {
      const response = await api.get(API_ENDPOINTS.ME)
      const userData = response.data

      // Actualizar usuario en localStorage
      this.setUser(userData)

      return userData
    } catch (error: any) {
      console.error('Error al obtener perfil:', error)
      throw error
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = this.getCurrentUser()
      if (!user) throw new Error('Usuario no autenticado')

      await api.post(API_ENDPOINTS.CHANGE_PASSWORD(user.id), {
        current_password: currentPassword,
        new_password: newPassword
      })
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error)
      throw error
    }
  }

  // Métodos privados

  private setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  }

  private setUser(user: Usuario): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  private setAuthHeader(token: string): void {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    delete api.defaults.headers.common['Authorization']
  }

  static parseTokenPayload(token: string): any {
    try {
      // Verificar si es un token JWT (contiene puntos)
      if (token.includes('.')) {
        // Es un JWT, parsear normalmente
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = parts[1];
          const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
          return JSON.parse(decoded);
        }
      }

      // Si no es JWT, retornar objeto vacío (token simple de Django)
      return {};
    } catch (error) {
      console.error('Error al parsear token:', error);
      return {};
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Para tokens simples de Django, solo verificar que exista
    // No hay payload para verificar expiración
    try {
      const payload = this.parseTokenPayload(token);

      // Si tiene exp (JWT), verificar expiración
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
      }

      // Si no tiene exp (token simple), verificar si no está expirado por isTokenExpired
      return !isTokenExpired();
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }

  static getToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return null;

    try {
      const tokenData = JSON.parse(token);
      return tokenData.key || tokenData;
    } catch {
      // Si no es JSON, retornar el token tal como está
      return token;
    }
  }

  private startTokenRefresh(expiresAt: string): void {
    this.stopTokenRefresh()

    const expirationTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()
    const refreshTime = expirationTime - currentTime - (5 * 60 * 1000) // 5 minutos antes

    if (refreshTime > 0) {
      this.refreshTimer = window.setTimeout(() => {
        this.refreshToken().catch(error => {
          console.error('Error en refresh automático:', error)
        })
      }, refreshTime)
    }
  }

  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Verificar permisos del usuario
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    return user?.rol === role
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser()
    return user ? roles.includes(user.rol) : false
  }

  canAccess(resource: string, action: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    // Lógica de permisos básica
    switch (user.rol) {
      case 'administrador':
        return true // Admin puede todo

      case 'supervisor':
        return action !== 'delete' || resource !== 'usuarios'

      case 'operador':
        return resource === 'registros' && ['create', 'read', 'update'].includes(action)

      case 'viewer':
        return action === 'read'

      default:
        return false
    }
  }

  /**
   * Obtener tiempo restante de sesión
   */
  getSessionTimeRemaining(): number | null {
    const token = this.getToken()
    if (!token) return null

    try {
      const payload = this.parseTokenPayload(token)
      if (payload && payload.exp) {
        const expirationTime = payload.exp * 1000 // Convertir a ms
        const currentTime = Date.now()
        const remaining = expirationTime - currentTime

        return remaining > 0 ? remaining : 0
      }
    } catch (error) {
      console.error('Error al calcular tiempo de sesión:', error)
    }

    return null
  }

  /**
   * Extender sesión
   */
  async extendSession(): Promise<void> {
    await this.refreshToken()
  }
}

// Crear instancia singleton
const authService = new AuthService()

export default authService
