<template>
  <div class="dashboard-view">
    <h2>Dashboard</h2>
    <p>Compañía: {{ selectedCompany?.name }} {{ selectedFarm ? `- Granja: ${selectedFarm.name}` : '' }}</p>
    <div v-if="!route.params.farmId">
      <h3>Granjas de la Compañía</h3>
      <ul>
        <li v-for="farm in companyFarms" :key="farm.id">
          <router-link :to="`/dashboard/${route.params.companyId}/${farm.id}`">{{ farm.name }}</router-link>
        </li>
      </ul>
    </div>
    <div v-else>
      <StatsChart :data="chartData" title="Estadísticas" yTitle="Valor" />
      <!-- Aquí puedes incluir más componentes como tablas, KPIs, etc. -->
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboard } from '../composables/useDashboard.js'
import { getFarmInventoryStats } from '../api/api.js'
import StatsChart from '../components/StatsChart.vue'

const route = useRoute()
const { companies, farms, loadInitialData, selectCompany, selectFarm } = useDashboard()
const inventoryStats = ref(null)

onMounted(async () => {
  await loadInitialData()
  if (route.params.companyId) {
    await selectCompany(route.params.companyId)
  }
  if (route.params.farmId) {
    await selectFarm(route.params.farmId)
    // Obtener estadísticas de inventario para la granja
    try {
      const stats = await getFarmInventoryStats(route.params.farmId)
      inventoryStats.value = stats.data || stats
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
    }
  }
})

const selectedCompany = computed(() => {
  return companies.value.find(c => c.id == route.params.companyId)
})

const selectedFarm = computed(() => {
  return farms.value.find(f => f.id == route.params.farmId)
})

const companyFarms = computed(() => {
  return farms.value.filter(f => f.companyId == route.params.companyId)
})

const chartData = computed(() => {
  if (inventoryStats.value && inventoryStats.value.dailyStatistics) {
    const daily = inventoryStats.value.dailyStatistics
    return {
      labels: daily.map(d => d.date),
      values: daily.map(d => d.totalAnimals)
    }
  }
  return {
    labels: [],
    values: []
  }
})
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
}
</style>
