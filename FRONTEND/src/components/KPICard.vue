<template>
  <div class="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
    <div>
      <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">{{ title }}</h3>
      <p class="text-3xl font-bold text-gray-900 mt-2">
        {{ value }}<span class="text-xl font-medium text-gray-500">{{ suffix }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  suffix?: string;
}>();
</script>
