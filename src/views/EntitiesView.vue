<template>
  <div class="selection-view">
    <div class="companies-container">
      <CompanyCard
        v-for="company in companiesWithFarms"
        :key="company.id"
        :company="company"
        @go-to-company-dashboard="goToCompanyDashboard"
        @go-to-farm-dashboard="goToFarmDashboard"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEntitiesData } from '../composables/useEntitiesData.js'
import CompanyCard from '../components/CompanyCard.vue'

const router = useRouter()
const { getEntities } = useEntitiesData()
const entities = ref([])

onMounted(async () => {
  try {
    entities.value = await getEntities()
  } catch (error) {
    console.error('Error loading data:', error)
  }
  await nextTick()
})

const companiesWithFarms = computed(() => {
  return entities.value && Array.isArray(entities.value) ? entities.value.map(company => ({
    id: company.id,
    name: company.name,
    location: company.location,
    farms: company.farms
  })) : []
})

const goToCompanyDashboard = (companyId) => {
  router.push(`/dashboard/${companyId}`)
}

const goToFarmDashboard = ({ companyId, farmId }) => {
  router.push(`/dashboard/${companyId}/${farmId}`)
}
</script>

<style scoped>
.selection-view {
  padding: 10px 0px;
  height: 100%;
  overflow: hidden;
}

.companies-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  height: 100%;
}
</style>