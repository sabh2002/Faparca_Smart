import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')

  // Determinar si estamos en desarrollo
  const isDevelopment = mode === 'development'
  const isProduction = mode === 'production'

  return {
    // Plugins de Vite
    plugins: [
      // Plugin de Vue 3
      vue({
        template: {
          compilerOptions: {
            // Optimizaciones del compilador
            hoistStatic: true,
            cacheHandlers: true
          }
        }
      }),

      // Vue DevTools solo en desarrollo
      ...(isDevelopment ? [vueDevTools()] : [])
    ],

    // Resolución de alias y módulos
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
        '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
        '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
        '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@config': fileURLToPath(new URL('./src/config', import.meta.url))
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json']
    },

    // Configuración del servidor de desarrollo
    server: {
      port: 5173,
      host: true,
      open: true,
      cors: true,
      // Proxy para API en desarrollo
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },

    // Configuración de preview
    preview: {
      port: 4173,
      host: true,
      cors: true
    },

    // Configuración de build
    build: {
      // Directorio de salida
      outDir: 'dist',

      // Directorio de assets
      assetsDir: 'assets',

      // Tamaño máximo de chunk (500kb)
      chunkSizeWarningLimit: 500,

      // Optimizaciones
      minify: isProduction ? 'esbuild' : false,
      sourcemap: isDevelopment ? true : false,

      // División de código
      rollupOptions: {
        output: {
          // Separar vendor libraries
          manualChunks: {
            // Vue ecosystem
            'vue-vendor': ['vue', 'vue-router', 'pinia'],

            // UI libraries
            'ui-vendor': ['@headlessui/vue', '@heroicons/vue'],

            // Charts y gráficos
            'chart-vendor': ['chart.js', 'vue-chartjs'],

            // Utilities
            'utils-vendor': ['axios', 'date-fns'],

            // Tailwind (si es muy grande)
            // 'tailwind': ['tailwindcss']
          },

          // Nombres de archivos
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              const fileName = facadeModuleId.split('/').pop()?.replace('.vue', '')
              return `js/${fileName}-[hash].js`
            }
            return 'js/[name]-[hash].js'
          },

          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]

            if (/\.(css)$/.test(assetInfo.name || '')) {
              return 'css/[name]-[hash].[ext]'
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name || '')) {
              return 'images/[name]-[hash].[ext]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
              return 'fonts/[name]-[hash].[ext]'
            }

            return 'assets/[name]-[hash].[ext]'
          }
        }
      },

      // Optimización de dependencias
      commonjsOptions: {
        include: [/node_modules/]
      }
    },

    // Optimización de dependencias
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        'date-fns',
        'chart.js',
        'vue-chartjs'
      ],
      exclude: [
        // Excluir dependencias que no necesitan optimización
      ]
    },

    // Variables de entorno que se exponen al cliente
    define: {
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    // Configuración de CSS
    css: {
      // PostCSS config se carga automáticamente desde postcss.config.js
      devSourcemap: isDevelopment,

      // Preprocesadores CSS
      preprocessorOptions: {
        scss: {
          // Variables SCSS globales si las necesitas
          additionalData: `
            // Variables globales SCSS aquí si las necesitas
          `
        }
      }
    },

    // Worker configuration
    worker: {
      format: 'es'
    },

    // Configuración JSON
    json: {
      namedExports: true,
      stringify: false
    },

    // ESBuild configuration
    esbuild: {
      // Remover console.log en producción
      ...(isProduction && {
        drop: ['console', 'debugger']
      })
    },

    // Configuración de logs
    logLevel: isDevelopment ? 'info' : 'warn',

    // Base path para deployment
    base: env.VITE_BASE_PATH || '/',

    // Configuración experimental
    experimental: {
      // Renderizado optimizado
      renderBuiltUrl(filename) {
        // Personalizar URLs de assets si es necesario
        return filename
      }
    }
  }
})
