<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg class="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Página No Encontrada</h2>
      <p class="text-gray-600 mb-8">
        La página que buscas no existe o no tienes permisos para acceder a ella.
      </p>
      
      <div class="space-y-4">
        <router-link
          to="/dashboard"
          class="btn-industrial bg-blue-600 text-white hover:bg-blue-700 w-full"
        >
          Volver al Dashboard
        </router-link>
        
        <button
          @click="$router.go(-1)"
          class="btn-industrial bg-gray-600 text-white hover:bg-gray-700 w-full"
        >
          Página Anterior
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Componente 404 simple
</script>
