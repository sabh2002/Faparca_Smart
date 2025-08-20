import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import AuthService from '@/services/auth';
import type { Usuario, LoginData } from '@/types/oee';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<Usuario | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);
  const lastActivity = ref<Date>(new Date());
  const tokenExpiry = ref<Date | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value && AuthService.isAuthenticated());
  
  const userRole = computed(() => user.value?.rol);
  
  const userName = computed(() => {
    if (!user.value) return '';
    return `${user.value.first_name} ${user.value.last_name}`.trim() || user.value.username;
  });
  
  const userInitials = computed(() => {
    if (!user.value) return '';
    
    const firstName = user.value.first_name || '';
    const lastName = user.value.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    
    return user.value.username.substring(0, 2).toUpperCase();
  });
  
  const isAdmin = computed(() => user.value?.rol === 'administrador');
  const isSupervisor = computed(() => user.value?.rol === 'supervisor');
  const isOperator = computed(() => user.value?.rol === 'operador');
  const isViewer = computed(() => user.value?.rol === 'viewer');
  
  const canEdit = computed(() => {
    return isAdmin.value || isSupervisor.value || isOperator.value;
  });
  
  const sessionTimeRemaining = computed(() => {
    if (!tokenExpiry.value) return null;
    
    const now = new Date();
    const remaining = tokenExpiry.value.getTime() - now.getTime();
    
    if (remaining <= 0) return 0;
    
    // Retornar tiempo en minutos
    return Math.floor(remaining / 60000);
  });

  // Actions
  async function login(credentials: LoginData) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await AuthService.login(credentials);
      
      // Actualizar estado
      user.value = response.user;
      
      // Guardar tiempo de expiración si está disponible
      if (response.expires_at) {
        tokenExpiry.value = new Date(response.expires_at);
      }
      
      // Actualizar última actividad
      lastActivity.value = new Date();
      
      // Sincronizar con localStorage
      syncWithStorage();
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión';
      user.value = null;
      tokenExpiry.value = null;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    
    try {
      await AuthService.logout();
    } catch (err) {
      console.error('Error en logout:', err);
    } finally {
      // Limpiar estado independientemente del resultado
      user.value = null;
      tokenExpiry.value = null;
      error.value = null;
      isLoading.value = false;
      
      // Limpiar storage
      clearStorage();
    }
  }
  
  async function refreshToken() {
    try {
      await AuthService.refreshToken();
      
      // Actualizar última actividad
      lastActivity.value = new Date();
      
      // Re-sincronizar con storage
      await checkAuth();
      
      return true;
    } catch (err) {
      console.error('Error al refrescar token:', err);
      
      // Si falla el refresh, hacer logout
      await logout();
      return false;
    }
  }
  
  async function verifySession() {
    try {
      const isValid = await AuthService.verifyToken();
      
      if (!isValid) {
        await logout();
        return false;
      }
      
      // Actualizar última actividad
      lastActivity.value = new Date();
      return true;
    } catch (err) {
      console.error('Error al verificar sesión:', err);
      await logout();
      return false;
    }
  }

  async function checkAuth() {
    if (isInitialized.value) return;
    
    isLoading.value = true;
    
    try {
      const currentUser = AuthService.getCurrentUser();
      
      if (currentUser && AuthService.isAuthenticated()) {
        // Verificar token con el servidor
        const isValid = await AuthService.verifyToken();
        
        if (isValid) {
          user.value = currentUser;
          
          // Obtener información de expiración del token
          const tokenData = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token');
          if (tokenData) {
            try {
              const parsed = JSON.parse(tokenData);
              if (parsed.expires_at) {
                tokenExpiry.value = new Date(parsed.expires_at);
              }
            } catch {
              // Token simple sin información de expiración
            }
          }
          
          lastActivity.value = new Date();
        } else {
          // Token inválido, limpiar
          user.value = null;
          tokenExpiry.value = null;
          clearStorage();
        }
      } else {
        user.value = null;
        tokenExpiry.value = null;
      }
    } catch (err) {
      console.error('Error al verificar autenticación:', err);
      user.value = null;
      tokenExpiry.value = null;
    } finally {
      isLoading.value = false;
      isInitialized.value = true;
    }
  }
  
  async function changePassword(oldPassword: string, newPassword: string, newPassword2: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      await AuthService.changePassword(oldPassword, newPassword, newPassword2);
      
      // El cambio de contraseña revoca el token, así que hacemos logout
      await logout();
      
      return {
        success: true,
        message: 'Contraseña cambiada exitosamente. Por favor, inicia sesión con tu nueva contraseña.'
      };
    } catch (err: any) {
      error.value = err.message || 'Error al cambiar la contraseña';
      return {
        success: false,
        message: error.value
      };
    } finally {
      isLoading.value = false;
    }
  }

  function hasRole(role: string): boolean {
    return user.value?.rol === role;
  }
  
  function hasAnyRole(roles: string[]): boolean {
    return user.value ? roles.includes(user.value.rol) : false;
  }

  function canAccessArea(areaId: number): boolean {
    return AuthService.canAccessArea(areaId);
  }
  
  function canModifyArea(areaId: number): boolean {
    return AuthService.canModifyArea(areaId);
  }

  function clearError() {
    error.value = null;
  }
  
  function updateActivity() {
    lastActivity.value = new Date();
    AuthService.resetSessionTimeout();
  }
  
  function syncWithStorage() {
    // Sincronizar estado con localStorage
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      user.value = currentUser;
    }
  }
  
  function clearStorage() {
    // Limpiar todo el almacenamiento relacionado con auth
    const tokenKey = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token';
    const userKey = import.meta.env.VITE_USER_STORAGE_KEY || 'user_data';
    
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    sessionStorage.removeItem('redirect_after_login');
  }

  // Watchers
  // Observar cambios en el localStorage (para sincronización entre pestañas)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      const tokenKey = import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token';
      const userKey = import.meta.env.VITE_USER_STORAGE_KEY || 'user_data';
      
      if (e.key === tokenKey || e.key === userKey) {
        // Sincronizar con los cambios en storage
        if (e.newValue) {
          syncWithStorage();
        } else {
          // Si se eliminó el token o usuario, hacer logout
          user.value = null;
          tokenExpiry.value = null;
        }
      }
    });
    
    // Verificar periódicamente la validez del token
    setInterval(() => {
      if (isAuthenticated.value) {
        // Verificar si el token está por expirar
        if (tokenExpiry.value) {
          const now = new Date();
          const timeUntilExpiry = tokenExpiry.value.getTime() - now.getTime();
          
          // Si quedan menos de 5 minutos, mostrar advertencia
          if (timeUntilExpiry < 300000 && timeUntilExpiry > 0) {
            console.warn('Tu sesión está por expirar. Se refrescará automáticamente.');
            refreshToken();
          } else if (timeUntilExpiry <= 0) {
            // Token expirado
            console.error('Token expirado');
            logout();
          }
        }
        
        // Verificar inactividad (opcional)
        const inactivityTime = Date.now() - lastActivity.value.getTime();
        const maxInactivity = Number(import.meta.env.VITE_SESSION_TIMEOUT) || 86400000; // 24 horas
        
        if (inactivityTime > maxInactivity) {
          console.warn('Sesión cerrada por inactividad');
          logout();
        }
      }
    }, 60000); // Verificar cada minuto
  }

  // Inicializar store
  checkAuth();

  // Inicializar el servicio de autenticación
  AuthService.initialize();

  return {
    // State
    user,
    isLoading,
    error,
    isInitialized,
    lastActivity,
    tokenExpiry,
    
    // Getters
    isAuthenticated,
    userRole,
    userName,
    userInitials,
    isAdmin,
    isSupervisor,
    isOperator,
    isViewer,
    canEdit,
    sessionTimeRemaining,
    
    // Actions
    login,
    logout,
    refreshToken,
    verifySession,
    checkAuth,
    changePassword,
    hasRole,
    hasAnyRole,
    canAccessArea,
    canModifyArea,
    clearError,
    updateActivity,
    syncWithStorage
  };
});
