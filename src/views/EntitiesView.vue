<template>
  <div class="selection-view">
    <h2>Selecciona una Compañía o Granja</h2>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFarmStore } from '../stores/farm.js'
import CompanyCard from '../components/CompanyCard.vue'

const router = useRouter()
const farmStore = useFarmStore()
const companies = ref([])
const farms = ref([])

onMounted(async () => {
  try {
    companies.value = await farmStore.fetchCompanies()
// console.log('Companies:', companies.value)
    for (const company of companies.value) {
      const farmsForCompany = await farmStore.fetchFarms(company.id)
      farms.value.push(...(farmsForCompany || []))
    }
// console.log('Farms:', farms.value)
  } catch (error) {
    console.error('Error loading data:', error)
  }
})

const companiesWithFarms = computed(() => {
  return companies.value && Array.isArray(companies.value) ? companies.value.map(company => {
    const farmsForCompany = farms.value.filter(f => f.companyId == company.id)
    return {
      id: company.id,
      name: company.name,
      location: company.address,
      farms: farmsForCompany.map(f => ({ id: f.id, name: f.name, location: f.location }))
    }
  }) : []
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
  padding: 20px;
}

.companies-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>