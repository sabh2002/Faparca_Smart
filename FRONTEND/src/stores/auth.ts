// stores/auth.ts - VERSIÓN COMPLETADA
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

  const canDelete = computed(() => {
    return isAdmin.value || isSupervisor.value;
  });

  const canManageUsers = computed(() => {
    return isAdmin.value;
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

  /**
   * Realizar login
   */
  async function login(credentials: LoginData): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await AuthService.login(credentials);

      // Actualizar estado
      user.value = response.user;
      lastActivity.value = new Date();

      // Guardar tiempo de expiración si está disponible
      if (response.expires_at) {
        tokenExpiry.value = new Date(response.expires_at);
      }

      return true;

    } catch (err: any) {
      console.error('Error en login:', err);
      error.value = err.message || 'Error al iniciar sesión';
      user.value = null;
      tokenExpiry.value = null;
      throw err;

    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Realizar logout
   */
  async function logout(): Promise<void> {
    isLoading.value = true;

    try {
      await AuthService.logout();
    } catch (err) {
      console.warn('Error en logout:', err);
    } finally {
      // Limpiar estado local
      user.value = null;
      error.value = null;
      tokenExpiry.value = null;
      lastActivity.value = new Date();
      isLoading.value = false;
    }
  }

  /**
   * Inicializar autenticación desde localStorage
   */
  async function initializeAuth(): Promise<boolean> {
    if (isInitialized.value) return isAuthenticated.value;

    isLoading.value = true;

    try {
      const success = await AuthService.initializeAuth();

      if (success) {
        // Cargar datos del usuario
        const userData = AuthService.getCurrentUser();
        if (userData) {
          user.value = userData;
          lastActivity.value = new Date();

          // Obtener perfil actualizado del servidor
          try {
            await refreshProfile();
          } catch (err) {
            console.warn('No se pudo actualizar el perfil:', err);
          }
        }
      }

      return success;

    } catch (err: any) {
      console.error('Error inicializando auth:', err);
      error.value = 'Error al inicializar sesión';
      return false;

    } finally {
      isInitialized.value = true;
      isLoading.value = false;
    }
  }

  /**
   * Refrescar perfil del usuario
   */
  async function refreshProfile(): Promise<void> {
    try {
      const userData = await AuthService.getProfile();
      user.value = userData;
      lastActivity.value = new Date();
    } catch (err: any) {
      console.error('Error refreshing profile:', err);
      throw err;
    }
  }

  /**
   * Cambiar contraseña
   */
  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      await AuthService.changePassword(currentPassword, newPassword);
      // Actualizar última actividad
      lastActivity.value = new Date();

    } catch (err: any) {
      console.error('Error changing password:', err);
      error.value = err.response?.data?.message || 'Error al cambiar contraseña';
      throw err;

    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Refrescar token
   */
  async function refreshToken(): Promise<boolean> {
    try {
      const newToken = await AuthService.refreshToken();
      if (newToken) {
        lastActivity.value = new Date();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error refreshing token:', err);

      // Si falla el refresh, hacer logout
      await logout();
      return false;
    }
  }

  /**
   * Verificar permisos
   */
  function hasRole(role: string): boolean {
    return AuthService.hasRole(role);
  }

  function hasAnyRole(roles: string[]): boolean {
    return AuthService.hasAnyRole(roles);
  }

  function canAccess(resource: string, action: string): boolean {
    return AuthService.canAccess(resource, action);
  }

  /**
   * Actualizar última actividad
   */
  function updateActivity(): void {
    lastActivity.value = new Date();
  }

  /**
   * Limpiar errores
   */
  function clearError(): void {
    error.value = null;
  }

  /**
   * Verificar si la sesión está por expirar
   */
  function isSessionExpiringSoon(): boolean {
    const remaining = sessionTimeRemaining.value;
    return remaining !== null && remaining < 5; // Menos de 5 minutos
  }

  /**
   * Extender sesión
   */
  async function extendSession(): Promise<boolean> {
    try {
      await AuthService.extendSession();
      lastActivity.value = new Date();
      return true;
    } catch (err) {
      console.error('Error extending session:', err);
      return false;
    }
  }

  /**
   * Verificar si el usuario puede acceder a una ruta
   */
  function canAccessRoute(routeName: string, requiredRoles?: string[]): boolean {
    if (!isAuthenticated.value) return false;

    if (!requiredRoles || requiredRoles.length === 0) return true;

    return hasAnyRole(requiredRoles);
  }

  // Watchers

  // Auto-logout si la sesión expira
  watch(sessionTimeRemaining, (remaining) => {
    if (remaining === 0 && isAuthenticated.value) {
      console.warn('Sesión expirada, haciendo logout automático');
      logout();
    }
  });

  // Auto-refresh del token cuando está por expirar
  watch(sessionTimeRemaining, (remaining) => {
    if (remaining !== null && remaining < 10 && remaining > 5) {
      console.log('Token por expirar, refrescando automáticamente');
      refreshToken();
    }
  });

  // Estado de desarrollo - Logging
  if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
    watch(user, (newUser) => {
      console.log('Auth Store - Usuario actualizado:', newUser);
    });

    watch(isAuthenticated, (authenticated) => {
      console.log('Auth Store - Estado autenticación:', authenticated);
    });
  }

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
    canDelete,
    canManageUsers,
    sessionTimeRemaining,

    // Actions
    login,
    logout,
    initializeAuth,
    refreshProfile,
    changePassword,
    refreshToken,
    hasRole,
    hasAnyRole,
    canAccess,
    updateActivity,
    clearError,
    isSessionExpiringSoon,
    extendSession,
    canAccessRoute
  };
});
