import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

console.log('🚀 Inicializando aplicación...')

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Manejar errores no capturados
app.config.errorHandler = (err, vm, info) => {
  console.error('🚨 Error no capturado:', err, info)
}

// Montar la aplicación
app.mount('#app')

console.log('✅ Aplicación montada exitosamente')
