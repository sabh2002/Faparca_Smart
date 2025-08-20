/// <reference types="vite/client" />

// ===== DECLARACIONES DE MÓDULOS VUE =====
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// ===== VARIABLES DE ENTORNO VITE =====
interface ImportMetaEnv {
  // Configuración general
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production' | 'testing'
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string

  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_RETRY_ATTEMPTS: string
  readonly VITE_API_RETRY_DELAY: string

  // Autenticación
  readonly VITE_TOKEN_STORAGE_KEY: string
  readonly VITE_USER_STORAGE_KEY: string
  readonly VITE_REFRESH_TOKEN_KEY: string

  // Sesión
  readonly VITE_SESSION_TIMEOUT: string
  readonly VITE_SESSION_WARNING_TIME: string
  readonly VITE_TOKEN_REFRESH_INTERVAL: string
  readonly VITE_MAX_REFRESH_RETRIES: string

  // Feature Flags
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
  readonly VITE_ENABLE_AUTO_REFRESH: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_ENABLE_ADVANCED_REPORTS: string

  // Paginación
  readonly VITE_DEFAULT_PAGE_SIZE: string
  readonly VITE_MAX_PAGE_SIZE: string
  readonly VITE_SHOW_PAGE_SIZE_OPTIONS: string

  // UI Configuration
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_DEFAULT_LANGUAGE: string
  readonly VITE_DATE_FORMAT: string
  readonly VITE_TIME_FORMAT: string
  readonly VITE_CURRENCY: string
  readonly VITE_AUTO_SAVE: string
  readonly VITE_COMPACT_MODE: string

  // Archivos
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_ALLOWED_FILE_TYPES: string

  // Cache
  readonly VITE_CACHE_TTL: string

  // Validación
  readonly VITE_PASSWORD_MIN_LENGTH: string
  readonly VITE_PASSWORD_REQUIRE_UPPERCASE: string
  readonly VITE_PASSWORD_REQUIRE_LOWERCASE: string
  readonly VITE_PASSWORD_REQUIRE_NUMBERS: string
  readonly VITE_PASSWORD_REQUIRE_SYMBOLS: string
  readonly VITE_USERNAME_MIN_LENGTH: string
  readonly VITE_USERNAME_MAX_LENGTH: string

  // Notificaciones
  readonly VITE_MAX_NOTIFICATIONS: string
  readonly VITE_NOTIFICATION_DURATION: string
  readonly VITE_NOTIFICATION_POSITION: string
  readonly VITE_NOTIFICATION_SOUND: string
  readonly VITE_NOTIFICATION_VIBRATION: string

  // URLs Externas
  readonly VITE_DOCS_URL: string
  readonly VITE_SUPPORT_URL: string
  readonly VITE_FEEDBACK_URL: string
  readonly VITE_CHANGELOG_URL: string
  readonly VITE_API_DOCS_URL: string

  // Desarrollo y Testing
  readonly VITE_MOCK_API: string
  readonly VITE_MOCK_DELAY: string
  readonly VITE_ENABLE_LOGGER: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_SHOW_PERFORMANCE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// ===== DECLARACIONES GLOBALES =====

// Extensiones de Window para APIs personalizadas
declare global {
  interface Window {
    // API personalizada para eventos del sistema
    dispatchEvent(event: CustomEvent): boolean

    // Posibles APIs de terceros
    gtag?: (...args: any[]) => void
    dataLayer?: any[]

    // Desarrollo
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: any
    __VUE_OPTIONS_API__?: boolean
    __VUE_PROD_DEVTOOLS__?: boolean
  }

  // Variables globales de la aplicación
  var APP_VERSION: string
  var APP_BUILD_TIME: string
  var API_BASE_URL: string
}

// ===== DECLARACIONES DE MÓDULOS EXTERNOS =====

// Chart.js
declare module 'chart.js/auto' {
  export * from 'chart.js'
}

// Date-fns locales
declare module 'date-fns/locale' {
  export const es: any
}

// Vue Router meta fields
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
    title?: string
    description?: string
    keywords?: string[]
    layout?: string
    showInMenu?: boolean
    menuIcon?: string
    menuOrder?: number
    breadcrumb?: string
    permissions?: string[]
    cache?: boolean
    keepAlive?: boolean
  }
}

// ===== DECLARACIONES DE TIPOS AUXILIARES =====

// Tipos para eventos personalizados
interface CustomEventMap {
  'api:forbidden': CustomEvent<{
    url: string
    message: string
  }>
  'auth:logout': CustomEvent<{
    reason: 'token_expired' | 'manual' | 'inactivity'
  }>
  'notification:show': CustomEvent<{
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>
  'oee:data-updated': CustomEvent<{
    area?: number
    timestamp: Date
  }>
  'user:activity': CustomEvent<{
    action: string
    resource: string
    timestamp: Date
  }>
}

// Extender EventTarget para eventos tipados
declare global {
  interface EventTarget {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: EventTarget, ev: CustomEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
    ): void

    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: EventTarget, ev: CustomEventMap[K]) => any,
      options?: boolean | EventListenerOptions
    ): void
  }
}

// ===== DECLARACIONES PARA WORKERS =====

// Service Worker
declare module '*.worker.ts' {
  class WebpackWorker extends Worker {
    constructor()
  }
  export default WebpackWorker
}

// ===== DECLARACIONES PARA ASSETS =====

// Imágenes
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

// Fonts
declare module '*.woff' {
  const src: string
  export default src
}

declare module '*.woff2' {
  const src: string
  export default src
}

declare module '*.ttf' {
  const src: string
  export default src
}

declare module '*.eot' {
  const src: string
  export default src
}

// Audio/Video
declare module '*.mp3' {
  const src: string
  export default src
}

declare module '*.mp4' {
  const src: string
  export default src
}

declare module '*.wav' {
  const src: string
  export default src
}

// Datos
declare module '*.json' {
  const content: Record<string, any>
  export default content
}

declare module '*.csv' {
  const src: string
  export default src
}

declare module '*.xml' {
  const src: string
  export default src
}

// Estilos (CSS Modules)
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

declare module '*.module.scss' {
  const classes: Record<string, string>
  export default classes
}

declare module '*.module.sass' {
  const classes: Record<string, string>
  export default classes
}

// ===== DECLARACIONES PARA UTILIDADES =====

// Utility types para el proyecto
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys]

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

// Tipos para APIs
type APIResponse<T = any> = {
  data: T
  status: number
  message?: string
  errors?: Record<string, string[]>
}

type PaginatedAPIResponse<T = any> = {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

// ===== DECLARACIONES PARA DESARROLLO =====

// Hot Module Replacement
interface ViteHotContext {
  readonly data: any
  accept(): void
  accept(cb: (mod: any) => void): void
  accept(dep: string, cb: (mod: any) => void): void
  accept(deps: readonly string[], cb: (mods: any[]) => void): void
  dispose(cb: (data: any) => void): void
  decline(): void
  invalidate(): void
  on<T extends string>(event: T, cb: (data: any) => void): void
}

declare global {
  interface ImportMeta {
    readonly hot?: ViteHotContext
  }
}

// ===== EXPORTS =====

export {}

// Nota: Este archivo debe estar en la raíz del proyecto frontend
// y ser incluido en el tsconfig para que TypeScript reconozca
// todas las declaraciones de tipos y módulos.
