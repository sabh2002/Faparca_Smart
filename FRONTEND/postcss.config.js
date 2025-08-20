// postcss.config.js
export default {
  plugins: {
    // Tailwind CSS - Framework de utilidades CSS
    tailwindcss: {},

    // Autoprefixer - Añade prefijos de navegador automáticamente
    autoprefixer: {},

    // PostCSS Import - Permite importar archivos CSS
    'postcss-import': {},

    // PostCSS Nested - Permite CSS anidado (como Sass)
    'postcss-nested': {},

    // PostCSS Custom Properties - Variables CSS mejoradas
    'postcss-custom-properties': {
      // Preservar las variables CSS personalizadas
      preserve: true,
      // Importar variables desde archivos
      importFrom: [
        'src/assets/variables.css'
      ]
    },

    // PostCSS Preset Env - Características CSS modernas con fallbacks
    'postcss-preset-env': {
      // Etapa de características CSS a usar
      stage: 3,
      // Características específicas a habilitar/deshabilitar
      features: {
        'custom-properties': false, // Ya manejado por postcss-custom-properties
        'nesting-rules': false,     // Ya manejado por postcss-nested
        'custom-media-queries': true,
        'media-query-ranges': true
      },
      // Navegadores objetivo
      browsers: [
        'last 2 versions',
        '> 1%',
        'not dead',
        'not ie 11'
      ]
    },

    // CSSnano - Minificación CSS solo en producción
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          // Opciones de minificación
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: true,
          colormin: true,
          convertValues: {
            length: false // Evitar conversión de unidades que puede romper el diseño
          },
          calc: {
            precision: 3
          }
        }]
      }
    } : {})
  }
}
