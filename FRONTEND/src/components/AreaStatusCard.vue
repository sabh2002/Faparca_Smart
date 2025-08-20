<template>
  <div class="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
    <div>
      <p class="font-semibold text-gray-800">{{ area.nombre }}</p>
      <p class="text-2xl font-bold" :class="oeeColorClass">
        {{ area.ultimo_oee?.toFixed(1) || 'N/A' }}%
      </p>
    </div>
    <div class="flex items-center">
      <div class="w-24 h-10 bg-gray-100 rounded-md mr-4 flex items-center justify-center text-xs text-gray-400">
        Trend
      </div>
      <span class="w-4 h-4 rounded-full" :class="semaphoreColorClass" :title="`OEE: ${area.ultimo_oee?.toFixed(1)}%`"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AreaWithStatus } from '@/stores/oee';
import { THEME } from '@/config';

const props = defineProps<{
  area: AreaWithStatus;
}>();

const oeeColorStyles = computed(() => {
  const value = props.area.ultimo_oee;
  if (value === undefined || value === null) {
    return { text: 'text-gray-500', bg: 'bg-gray-400' };
  }
  if (value >= 85) {
    return { text: `text-[${THEME.colors.oeeExcellent}]`, bg: `bg-[${THEME.colors.oeeExcellent}]` };
  }
  if (value >= 70) {
    return { text: `text-[${THEME.colors.oeeGood}]`, bg: `bg-[${THEME.colors.oeeGood}]` };
  }
  if (value >= 60) {
    return { text: `text-[${THEME.colors.oeeRegular}]`, bg: `bg-[${THEME.colors.oeeRegular}]` };
  }
  return { text: `text-[${THEME.colors.oeePoor}]`, bg: `bg-[${THEME.colors.oeePoor}]` };
});

const oeeColorClass = computed(() => oeeColorStyles.value.text);
const semaphoreColorClass = computed(() => oeeColorStyles.value.bg);
</script>
