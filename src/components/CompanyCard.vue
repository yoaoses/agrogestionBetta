<template>
  <div class="company-card">
    <div class="company-details">
      <h3>{{ company.name }}</h3>
      <p class="company-location">{{ company.location }}</p>
      <div class="status-indicator">
        <i :class="statusIcon" :style="{ color: statusColor }"></i>
        <span>{{ statusText }}</span>
      </div>
      <button @click="$emit('go-to-company-dashboard', company.id)">Dashboard Compañía</button>
    </div>
    <div class="farms-section">
      <div v-for="farm in company.farms" :key="farm.id" class="farm-mini-card" @click="$emit('go-to-farm-dashboard', { companyId: company.id, farmId: farm.id })">
        <h4>{{ farm.name }}</h4>
        <p class="farm-location">{{ farm.location }}</p>
        <div class="status-indicator">
          <i :class="getStatusIcon(farm)" :style="{ color: getStatusColor(farm) }"></i>
          <span>{{ getStatusText(farm) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const { company } = defineProps({
  company: {
    type: Object,
    required: true,
    default: () => ({ name: '', location: '', farms: [] })
  }
})

defineEmits(['go-to-company-dashboard', 'go-to-farm-dashboard'])

const checkIssues = (obj) => {
  // Para compañía, si tiene farms, green, sino warning
  if (obj.farms) {
    return obj.farms.length > 0 ? 'green' : 'warning'
  }
  // Para farm, por ahora green
  return 'green'
}

const status = computed(() => checkIssues(company))

const statusIcon = computed(() => {
  if (status.value === 'green') return 'bi bi-check-circle'
  if (status.value === 'warning') return 'bi bi-exclamation-triangle'
  if (status.value === 'red') return 'bi bi-x-circle'
})

const statusColor = computed(() => {
  if (status.value === 'green') return 'green'
  if (status.value === 'warning') return 'orange'
  if (status.value === 'red') return 'red'
})

const statusText = computed(() => {
  if (status.value === 'green') return 'All ok'
  if (status.value === 'warning') return 'Verifying problems'
  if (status.value === 'red') return 'Problems'
})

const getStatusIcon = (farm) => {
  const farmStatus = checkIssues(farm)
  if (farmStatus === 'green') return 'bi bi-check-circle'
  if (farmStatus === 'warning') return 'bi bi-exclamation-triangle'
  if (farmStatus === 'red') return 'bi bi-x-circle'
}

const getStatusColor = (farm) => {
  const farmStatus = checkIssues(farm)
  if (farmStatus === 'green') return 'green'
  if (farmStatus === 'warning') return 'orange'
  if (farmStatus === 'red') return 'red'
}

const getStatusText = (farm) => {
  const farmStatus = checkIssues(farm)
  if (farmStatus === 'green') return 'All ok'
  if (farmStatus === 'warning') return 'Verifying problems'
  if (farmStatus === 'red') return 'Problems'
}
</script>

<style scoped>
.company-card {
  display: flex;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
}

.company-details {
  flex: 1;
  margin-right: 20px;
}

.company-details h3 {
  margin: 0 0 12px 0;
}

.company-location {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
}

.farms-section {
  flex: 2;
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

.farm-mini-card {
  min-width: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  background-color: #fff;
  cursor: pointer;
}

.farm-mini-card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.farm-location {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

button {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>