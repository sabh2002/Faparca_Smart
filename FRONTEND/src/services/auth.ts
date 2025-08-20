import api, { setAuthToken, clearAuthToken, isTokenExpired, extractErrorMessage } from './api';
import type { LoginData, AuthResponse, Usuario } from '@/types/oee';

const USER_STORAGE_KEY = import.meta.env.VITE_USER_STORAGE_KEY || 'user_data';
const TOKEN_STORAGE_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token';
const SESSION_TIMEOUT = Number(import.meta.env.VITE_SESSION_TIMEOUT) || 86400000; // 24 horas
const TOKEN_REFRESH_INTERVAL = Number(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 3600000; // 1 hora

export class AuthService {
  private static refreshTimer: number | null = null;
  private static sessionTimer: number | null = null;
  
  static async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { token, expires_at, expires_in, user, message } = response.data;
      
      // Guardar token con información de expiración
      setAuthToken(token, expires_at);
      
      // Guardar datos de usuario
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      // Configurar auto-refresh del token
      this.setupTokenRefresh(expires_in);
      
      // Configurar timeout de sesión
      this.setupSessionTimeout();
      
      return { 
        token, 
        user,
        expires_at,
        message: message || 'Login exitoso'
      };
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      
      // Limpiar cualquier dato residual
      this.clearAuthData();
      
      throw new Error(errorMessage);
    }
  }

  static async logout(): Promise<void> {
    try {
      // Intentar logout en el servidor
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado
      this.clearAuthData();
    }
  }
  
  static async refreshToken(): Promise<void> {
    try {
      const response = await api.post('/auth/refresh/');
      const { token, expires_at, expires_in } = response.data;
      
      // Actualizar token
      setAuthToken(token, expires_at);
      
      // Reconfigurar auto-refresh
      this.setupTokenRefresh(expires_in);
      
      console.log('Token refrescado exitosamente');
    } catch (error) {
      console.error('Error al refrescar token:', error);
      
      // Si falla el refresh, hacer logout
      this.clearAuthData();
      window.location.href = '/login';
    }
  }
  
  static async verifyToken(): Promise<boolean> {
    try {
      const response = await api.get('/auth/verify/');
      
      if (response.data.valid && response.data.user) {
        // Actualizar datos de usuario
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token inválido:', error);
      return false;
    }
  }
  
  static async changePassword(oldPassword: string, newPassword: string, newPassword2: string): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No hay usuario autenticado');
      
      await api.post(`/usuarios/${user.id}/change_password/`, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2
      });
      
      // Después de cambiar la contraseña, el token se revoca
      // así que limpiamos y redirigimos al login
      this.clearAuthData();
      
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  }

  static getCurrentUser(): Usuario | null {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static getToken(): string | null {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;
    
    try {
      const tokenData = JSON.parse(token);
      return tokenData.key || tokenData;
    } catch {
      return token;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken() && !isTokenExpired();
  }

  static hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.rol === role;
  }
  
  static hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.rol) : false;
  }

  static canAccessArea(areaId: number): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Administradores y supervisores pueden acceder a todo
    if (['administrador', 'supervisor'].includes(user.rol)) return true;
    
    // Operadores solo a su área asignada
    if (user.rol === 'operador') {
      return user.area_asignada === areaId;
    }
    
    // Viewers pueden ver todo pero no modificar
    return user.rol === 'viewer';
  }
  
  static canModifyArea(areaId: number): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Viewers no pueden modificar
    if (user.rol === 'viewer') return false;
    
    // Administradores y supervisores pueden modificar todo
    if (['administrador', 'supervisor'].includes(user.rol)) return true;
    
    // Operadores solo su área
    return user.rol === 'operador' && user.area_asignada === areaId;
  }
  
  private static setupTokenRefresh(expiresIn: number) {
    // Limpiar timer anterior si existe
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    // Calcular cuándo refrescar (a la mitad del tiempo de expiración)
    const refreshTime = Math.max((expiresIn * 1000) / 2, TOKEN_REFRESH_INTERVAL);
    
    // Configurar nuevo timer
    this.refreshTimer = window.setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }
  
  private static setupSessionTimeout() {
    // Limpiar timer anterior si existe
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    // Configurar timeout de sesión
    this.sessionTimer = window.setTimeout(() => {
      console.warn('Sesión expirada por inactividad');
      this.clearAuthData();
      window.location.href = '/login';
    }, SESSION_TIMEOUT);
  }
  
  static resetSessionTimeout() {
    // Reiniciar el timer de sesión cuando hay actividad
    this.setupSessionTimeout();
  }
  
  private static clearAuthData() {
    // Limpiar timers
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    // Limpiar storage
    clearAuthToken();
    localStorage.removeItem(USER_STORAGE_KEY);
  }
  
  // Método para inicializar el servicio cuando la app carga
  static async initialize() {
    if (this.isAuthenticated()) {
      // Verificar token al cargar
      const isValid = await this.verifyToken();
      
      if (isValid) {
        // Configurar timers
        this.setupSessionTimeout();
        
        // Programar refresh
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          try {
            const tokenData = JSON.parse(token);
            if (tokenData.expires_at) {
              const expiresAt = new Date(tokenData.expires_at);
              const now = new Date();
              const expiresIn = (expiresAt.getTime() - now.getTime()) / 1000;
              
              if (expiresIn > 0) {
                this.setupTokenRefresh(expiresIn);
              }
            }
          } catch {
            // Token simple sin información de expiración
          }
        }
      } else {
        // Token inválido, limpiar
        this.clearAuthData();
      }
    }
  }
}

// Detectar actividad del usuario para reset de timeout
if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, () => {
      if (AuthService.isAuthenticated()) {
        AuthService.resetSessionTimeout();
      }
    }, { passive: true });
  });
}

export default AuthService;
