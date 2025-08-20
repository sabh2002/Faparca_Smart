<template>
  <div class="bg-white rounded-lg shadow overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turno</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OEE</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-if="!records || records.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No hay registros recientes.</td>
        </tr>
        <tr v-for="record in records" :key="record.id" class="hover:bg-gray-50 cursor-pointer" @click="viewRecord(record.id)">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ record.area_nombre }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(record.fecha) }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-center font-mono font-bold text-gray-700">{{ record.turno }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getOEEBadgeClass(record.oee)">
                  {{ record.oee.toFixed(1) }}%
              </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EnrichedRegistroOEE } from '@/stores/oee'

defineProps<{
  records: EnrichedRegistroOEE[]
}>()

const router = useRouter()

const formatDate = (dateString: string) => {
  // Se añade una 'T00:00:00' para asegurar que la fecha se interprete como local y no UTC
  return format(new Date(`${dateString}T00:00:00`), "d MMM yyyy", { locale: es })
}

const getOEEBadgeClass = (value: number) => {
  if (value >= 85) return 'bg-green-100 text-green-800'
  if (value >= 70) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const viewRecord = (id?: number) => {
  if (id) {
    console.log(`Navegar al detalle del registro ID: ${id}`)
    // router.push(`/registros/${id}`) // Descomentar cuando la ruta exista
  }
}
</script>
