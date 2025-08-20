// src/config/index.ts
import type { AppConfig } from '@/types/oee';

/**
 * Configuración centralizada de la aplicación
 * Todas las variables de entorno se acceden desde aquí
 */
export const config: AppConfig = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  
  // App Information
  appTitle: import.meta.env.VITE_APP_TITLE || 'Sistema OEE FAPARCA',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: (import.meta.env.VITE_APP_ENV || 'development') as AppConfig['environment'],
  
  // Feature Flags
  features: {
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  },
  
  // Session Configuration
  session: {
    timeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 86400000, // 24 horas
    warningTime: Number(import.meta.env.VITE_SESSION_WARNING_TIME) || 300000, // 5 minutos
    refreshInterval: Number(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 3600000, // 1 hora
  },
  
  // Pagination Configuration
  pagination: {
    defaultPageSize: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 50,
    maxPageSize: Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token',
  USER: import.meta.env.VITE_USER_STORAGE_KEY || 'user_data',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  SIDEBAR_STATE: 'sidebar_collapsed',
  REMEMBERED_USERNAME: 'remembered_username',
  LAST_VISITED_PAGE: 'last_visited_page',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  REFRESH: '/auth/refresh/',
  VERIFY: '/auth/verify/',
  REGISTER: '/auth/register/',
  
  // Usuarios
  USUARIOS: '/usuarios/',
  CHANGE_PASSWORD: (id: number) => `/usuarios/${id}/change_password/`,
  TOGGLE_ACTIVE: (id: number) => `/usuarios/${id}/toggle_active/`,
  ME: '/usuarios/me/',
  
  // Areas
  AREAS: '/areas/',
  AREA_DETAIL: (id: number) => `/areas/${id}/`,
  
  // Registros
  REGISTROS: '/registros/',
  REGISTRO_DETAIL: (id: number) => `/registros/${id}/`,
  REGISTROS_BY_AREA: (areaId: number) => `/registros/?area=${areaId}`,
  
  // Reportes
  DASHBOARD: '/dashboard/',
  REPORTS: '/reports/',
  EXPORT: '/export/',
} as const;

// Colores del tema
export const THEME = {
  colors: {
    primary: '#2563eb', // blue-600
    secondary: '#64748b', // slate-500
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
    
    // OEE específicos
    oeeExcellent: '#10b981', // >= 85%
    oeeGood: '#84cc16', // >= 70%
    oeeRegular: '#f59e0b', // >= 60%
    oeePoor: '#ef4444', // < 60%
  },
  
  // Breakpoints para responsive
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Valores por defecto para formularios
export const FORM_DEFAULTS = {
  TURNO: 'A',
  PLAN_PRODUCCION: 1000,
  PRODUCCION_REAL: 0,
  DISPONIBILIDAD: 100,
  RENDIMIENTO: 100,
  CALIDAD: 100,
} as const;

// Configuración de validación
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 4,
  USERNAME_MAX_LENGTH: 150,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_PATTERN: /^\+?1?\d{9,15}$/,
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.',
} as const;

// Mensajes de éxito comunes
export const SUCCESS_MESSAGES = {
  LOGIN: 'Inicio de sesión exitoso',
  LOGOUT: 'Sesión cerrada exitosamente',
  SAVE: 'Datos guardados exitosamente',
  UPDATE: 'Datos actualizados exitosamente',
  DELETE: 'Eliminado exitosamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
} as const;

// Configuración de gráficos
export const CHART_CONFIG = {
  defaultType: 'line',
  colors: [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
  ],
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
  },
} as const;

// Helpers
export const isDevelopment = () => config.environment === 'development';
export const isProduction = () => config.environment === 'production';
export const isStaging = () => config.environment === 'staging';

// Función para logging condicional
export const debugLog = (...args: any[]) => {
  if (config.features.enableDebug) {
    console.log('[DEBUG]', ...args);
  }
};

export const debugError = (...args: any[]) => {
  if (config.features.enableDebug) {
    console.error('[ERROR]', ...args);
  }
};

export const debugWarn = (...args: any[]) => {
  if (config.features.enableDebug) {
    console.warn('[WARN]', ...args);
  }
};

// Export default
export default config;
