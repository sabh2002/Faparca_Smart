<template>
  <div class="chart-container" style="height: 40vh;">
    <Line :data="data" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    y: {
      beginAtZero: false,
      suggestedMin: 60,
      suggestedMax: 100,
      title: { display: true, text: 'OEE (%)' }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
};

defineProps<{
  data: ChartData<'line'>;
}>();
</script>
