/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
  readonly VITE_SESSION_TIMEOUT: string
  readonly VITE_SESSION_WARNING_TIME: string
  readonly VITE_TOKEN_REFRESH_INTERVAL: string
  readonly VITE_DEFAULT_PAGE_SIZE: string
  readonly VITE_MAX_PAGE_SIZE: string
  readonly VITE_TOKEN_STORAGE_KEY: string
  readonly VITE_USER_STORAGE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
