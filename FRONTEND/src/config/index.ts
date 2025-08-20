// config/index.ts - CONFIGURACIÓN COMPLETA
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
    enableAutoRefresh: import.meta.env.VITE_ENABLE_AUTO_REFRESH !== 'false', // Por defecto true
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false', // Por defecto true
    enableAdvancedReports: import.meta.env.VITE_ENABLE_ADVANCED_REPORTS === 'true',
  },

  // Session Configuration
  session: {
    timeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 86400000, // 24 horas
    warningTime: Number(import.meta.env.VITE_SESSION_WARNING_TIME) || 300000, // 5 minutos
    refreshInterval: Number(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 3600000, // 1 hora
    maxRetries: Number(import.meta.env.VITE_MAX_REFRESH_RETRIES) || 3,
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 50,
    maxPageSize: Number(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
    showSizeOptions: import.meta.env.VITE_SHOW_PAGE_SIZE_OPTIONS !== 'false',
    sizeOptions: [10, 25, 50, 100]
  },

  // UI Configuration
  ui: {
    theme: (import.meta.env.VITE_DEFAULT_THEME || 'light') as 'light' | 'dark' | 'auto',
    language: (import.meta.env.VITE_DEFAULT_LANGUAGE || 'es') as 'es' | 'en',
    dateFormat: import.meta.env.VITE_DATE_FORMAT || 'dd/MM/yyyy',
    timeFormat: import.meta.env.VITE_TIME_FORMAT || 'HH:mm',
    currency: import.meta.env.VITE_CURRENCY || 'MXN',
    autoSave: import.meta.env.VITE_AUTO_SAVE !== 'false',
    compactMode: import.meta.env.VITE_COMPACT_MODE === 'true'
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token',
  USER: import.meta.env.VITE_USER_STORAGE_KEY || 'user_data',
  REFRESH_TOKEN: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  SIDEBAR_STATE: 'sidebar_collapsed',
  REMEMBERED_USERNAME: 'remembered_username',
  LAST_VISITED_PAGE: 'last_visited_page',
  FORM_DRAFT_PREFIX: 'form_draft_',
  FILTERS_PREFIX: 'filters_',
  UI_PREFERENCES: 'ui_preferences'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // ===== AUTENTICACIÓN =====
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  REFRESH: '/auth/refresh/',
  VERIFY: '/auth/verify/',
  REGISTER: '/auth/register/',
  PASSWORD_RESET: '/auth/password-reset/',
  PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm/',

  // ===== USUARIOS =====
  USUARIOS: '/usuarios/',
  USUARIO_DETAIL: (id: number) => `/usuarios/${id}/`,
  CHANGE_PASSWORD: (id: number) => `/usuarios/${id}/change_password/`,
  TOGGLE_ACTIVE: (id: number) => `/usuarios/${id}/toggle_active/`,
  ME: '/usuarios/me/',
  USER_PROFILE: '/usuarios/profile/',
  USER_PREFERENCES: '/usuarios/preferences/',

  // ===== ÁREAS =====
  AREAS: '/areas/',
  AREA_DETAIL: (id: number) => `/areas/${id}/`,
  AREA_TOGGLE_ACTIVE: (id: number) => `/areas/${id}/toggle_active/`,
  AREA_STATS: (id: number) => `/areas/${id}/stats/`,

  // ===== REGISTROS OEE =====
  REGISTROS: '/registros/',
  REGISTRO_DETAIL: (id: number) => `/registros/${id}/`,
  REGISTROS_BY_AREA: (areaId: number) => `/registros/?area=${areaId}`,
  REGISTROS_BY_DATE: (fecha: string) => `/registros/?fecha=${fecha}`,
  REGISTROS_BY_TURNO: (turno: string) => `/registros/?turno=${turno}`,
  REGISTROS_DASHBOARD: '/registros/dashboard/',
  REGISTROS_STATS: '/registros/stats/',
  REGISTROS_EXPORT: '/registros/export/',
  REGISTROS_IMPORT: '/registros/import/',

  // ===== REPORTES =====
  REPORTES: '/reportes/',
  REPORTE_DIARIO: '/reportes/diario/',
  REPORTE_SEMANAL: '/reportes/semanal/',
  REPORTE_MENSUAL: '/reportes/mensual/',
  REPORTE_PERSONALIZADO: '/reportes/personalizado/',
  REPORTE_EXPORT: (tipo: string) => `/reportes/${tipo}/export/`,
  REPORTE_PREVIEW: '/reportes/preview/',

  // ===== DASHBOARD =====
  DASHBOARD: '/dashboard/',
  DASHBOARD_SUMMARY: '/dashboard/summary/',
  DASHBOARD_TRENDS: '/dashboard/trends/',
  DASHBOARD_ALERTS: '/dashboard/alerts/',
  DASHBOARD_KPI: '/dashboard/kpi/',

  // ===== ANÁLISIS Y MÉTRICAS =====
  ANALYTICS: '/analytics/',
  TRENDS: '/analytics/trends/',
  BENCHMARKS: '/analytics/benchmarks/',
  PREDICTIONS: '/analytics/predictions/',

  // ===== CONFIGURACIÓN =====
  SETTINGS: '/settings/',
  SYSTEM_CONFIG: '/settings/system/',
  NOTIFICATION_CONFIG: '/settings/notifications/',
  BACKUP: '/settings/backup/',
  RESTORE: '/settings/restore/',

  // ===== UTILIDADES =====
  HEALTH_CHECK: '/health/',
  VERSION: '/version/',
  STATUS: '/status/',
  PING: '/ping/',

  // ===== LOGS Y AUDITORÍA =====
  AUDIT_LOGS: '/audit/',
  ERROR_LOGS: '/logs/errors/',
  ACTIVITY_LOGS: '/logs/activity/',
  SYSTEM_LOGS: '/logs/system/',

  // ===== NOTIFICACIONES =====
  NOTIFICATIONS: '/notifications/',
  NOTIFICATION_DETAIL: (id: number) => `/notifications/${id}/`,
  MARK_AS_READ: (id: number) => `/notifications/${id}/read/`,
  MARK_ALL_READ: '/notifications/mark-all-read/',

  // ===== ARCHIVOS =====
  UPLOAD: '/files/upload/',
  DOWNLOAD: (fileId: string) => `/files/download/${fileId}/`,
  DELETE_FILE: (fileId: string) => `/files/${fileId}/delete/`,

  // ===== BÚSQUEDA =====
  SEARCH: '/search/',
  SEARCH_REGISTROS: '/search/registros/',
  SEARCH_USUARIOS: '/search/usuarios/',
  SEARCH_AREAS: '/search/areas/',

  // ===== WEBHOOKS =====
  WEBHOOKS: '/webhooks/',
  WEBHOOK_TEST: '/webhooks/test/',
  WEBHOOK_LOGS: '/webhooks/logs/'
} as const;

// Configuración de la API
export const API_CONFIG = {
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000, // 30 segundos
  RETRY_ATTEMPTS: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: Number(import.meta.env.VITE_API_RETRY_DELAY) || 1000, // 1 segundo
  MAX_FILE_SIZE: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_FILE_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'xlsx,xls,csv,pdf').split(','),
  CACHE_TTL: Number(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutos
};

// Constantes de validación
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: Number(import.meta.env.VITE_PASSWORD_MIN_LENGTH) || 8,
    REQUIRE_UPPERCASE: import.meta.env.VITE_PASSWORD_REQUIRE_UPPERCASE === 'true',
    REQUIRE_LOWERCASE: import.meta.env.VITE_PASSWORD_REQUIRE_LOWERCASE === 'true',
    REQUIRE_NUMBERS: import.meta.env.VITE_PASSWORD_REQUIRE_NUMBERS === 'true',
    REQUIRE_SYMBOLS: import.meta.env.VITE_PASSWORD_REQUIRE_SYMBOLS === 'true',
  },
  USERNAME: {
    MIN_LENGTH: Number(import.meta.env.VITE_USERNAME_MIN_LENGTH) || 3,
    MAX_LENGTH: Number(import.meta.env.VITE_USERNAME_MAX_LENGTH) || 30,
    ALLOWED_CHARS: /^[a-zA-Z0-9._-]+$/,
  },
  OEE: {
    MIN_VALUE: 0,
    MAX_VALUE: 150, // Permitir valores sobre 100% para casos especiales
    DECIMAL_PLACES: 1,
  },
  PRODUCTION: {
    MIN_VALUE: 0,
    MAX_VALUE: 999999,
    DECIMAL_PLACES: 2,
  }
} as const;

// Constantes de UI
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
  TOOLTIP_DELAY: 1000,
} as const;

// Colores del tema OEE
export const OEE_COLORS = {
  EXCELLENT: {
    primary: '#10B981', // green-500
    light: '#D1FAE5',   // green-100
    dark: '#047857',    // green-700
  },
  GOOD: {
    primary: '#3B82F6', // blue-500
    light: '#DBEAFE',   // blue-100
    dark: '#1D4ED8',    // blue-700
  },
  WARNING: {
    primary: '#F59E0B', // yellow-500
    light: '#FEF3C7',   // yellow-100
    dark: '#D97706',    // yellow-600
  },
  CRITICAL: {
    primary: '#EF4444', // red-500
    light: '#FEE2E2',   // red-100
    dark: '#DC2626',    // red-600
  },
  NEUTRAL: {
    primary: '#6B7280', // gray-500
    light: '#F3F4F6',   // gray-100
    dark: '#374151',    // gray-700
  }
} as const;

// Configuración de gráficos
export const CHART_CONFIG = {
  DEFAULT_HEIGHT: 300,
  COLORS: [
    '#3B82F6', // blue-500
    '#10B981', // green-500
    '#F59E0B', // yellow-500
    '#EF4444', // red-500
    '#8B5CF6', // purple-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
  ],
  ANIMATION_DURATION: 750,
  RESPONSIVE_BREAKPOINTS: {
    xs: 480,
    sm: 768,
    md: 1024,
    lg: 1280,
  }
} as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  MAX_NOTIFICATIONS: Number(import.meta.env.VITE_MAX_NOTIFICATIONS) || 10,
  DEFAULT_DURATION: Number(import.meta.env.VITE_NOTIFICATION_DURATION) || 5000,
  POSITION: (import.meta.env.VITE_NOTIFICATION_POSITION || 'top-right') as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  ENABLE_SOUND: import.meta.env.VITE_NOTIFICATION_SOUND === 'true',
  ENABLE_VIBRATION: import.meta.env.VITE_NOTIFICATION_VIBRATION === 'true',
} as const;

// URLs de recursos externos
export const EXTERNAL_URLS = {
  DOCUMENTATION: import.meta.env.VITE_DOCS_URL || 'https://docs.example.com',
  SUPPORT: import.meta.env.VITE_SUPPORT_URL || 'https://support.example.com',
  FEEDBACK: import.meta.env.VITE_FEEDBACK_URL || 'https://feedback.example.com',
  CHANGELOG: import.meta.env.VITE_CHANGELOG_URL || 'https://changelog.example.com',
  API_DOCS: import.meta.env.VITE_API_DOCS_URL || 'http://localhost:8000/api/docs/',
} as const;

// Configuración de desarrollo
export const DEV_CONFIG = {
  MOCK_API: import.meta.env.VITE_MOCK_API === 'true',
  MOCK_DELAY: Number(import.meta.env.VITE_MOCK_DELAY) || 1000,
  ENABLE_LOGGER: import.meta.env.VITE_ENABLE_LOGGER === 'true',
  LOG_LEVEL: (import.meta.env.VITE_LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
  SHOW_PERFORMANCE: import.meta.env.VITE_SHOW_PERFORMANCE === 'true',
} as const;

// Exportar todo como un objeto para fácil importación
export default {
  config,
  STORAGE_KEYS,
  API_ENDPOINTS,
  API_CONFIG,
  VALIDATION_RULES,
  UI_CONSTANTS,
  OEE_COLORS,
  CHART_CONFIG,
  NOTIFICATION_CONFIG,
  EXTERNAL_URLS,
  DEV_CONFIG
};
