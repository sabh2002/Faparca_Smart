<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Módulo en Desarrollo</h2>
      <p class="text-gray-600 mb-6">Esta funcionalidad será implementada en la siguiente fase</p>
      <router-link
        to="/dashboard"
        class="btn-industrial bg-blue-600 text-white hover:bg-blue-700"
      >
        Volver al Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Placeholder para módulos en desarrollo
</script>
