import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFarmData } from '../composables/useFarmData.js'

export const useNavigationStore = defineStore('navigation', () => {
  const companies = ref([])
  const farms = ref([])
  const allFarms = ref([])
  const selectedCompany = ref(null)
  const selectedFarm = ref(null)

  const { getCompanies, getFarms } = useFarmData()

  const loadCompanies = async () => {
    try {
      companies.value = await getCompanies()
    } catch (err) {
      console.error('Error loading companies:', err)
    }
  }

  const loadFarms = async (companyId) => {
    try {
      farms.value = await getFarms(companyId)
    } catch (err) {
      console.error('Error loading farms:', err)
    }
  }

  const loadAllFarms = async () => {
    try {
      allFarms.value = []
      for (const company of companies.value) {
        const companyFarms = await getFarms(company.id)
        allFarms.value.push(...companyFarms.map(farm => ({ ...farm, companyName: company.name })))
      }
    } catch (err) {
      console.error('Error loading all farms:', err)
    }
  }

  const selectCompany = (company) => {
    selectedCompany.value = company
    selectedFarm.value = null
    loadFarms(company.id)
  }

  const selectFarm = (farm) => {
    selectedFarm.value = farm
    selectedCompany.value = companies.value.find(c => c.id == farm.companyId)
  }

  const setSelectedFromRoute = (companyId, farmId) => {
    if (companyId) {
      selectedCompany.value = companies.value.find(c => c.id == companyId) || null
    } else {
      selectedCompany.value = null
    }
    if (farmId && selectedCompany.value) {
      selectedFarm.value = farms.value.find(f => f.id == farmId) || null
    } else {
      selectedFarm.value = null
    }
  }

  return {
    companies,
    farms,
    allFarms,
    selectedCompany,
    selectedFarm,
    loadCompanies,
    loadFarms,
    loadAllFarms,
    selectCompany,
    selectFarm,
    setSelectedFromRoute
  }
})