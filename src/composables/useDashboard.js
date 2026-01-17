import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useFarmStore } from '../stores/farm.js'

export function useDashboard() {
  const authStore = useAuthStore()
  const farmStore = useFarmStore()
  const currentSection = ref('company')

  const selectedCompanyId = computed(() => farmStore.selectedCompanyId)
  const selectedFarmId = computed(() => farmStore.selectedFarmId)

  const companies = computed(() => farmStore.getUnifiedCompanies)
  const farms = computed(() => {
    if (selectedCompanyId.value) {
      return farmStore.getUnifiedFarmsByCompany(selectedCompanyId.value)
    }
    return []
  })

  const loadInitialData = async () => {
    if (!authStore.isAuth) {
      console.warn('Usuario no autenticado, no se pueden cargar datos')
      return
    }
    await farmStore.fetchCompanies()
    if (companies.value.length > 0) {
      let companyIdToSelect = companies.value[0].id
      if (farmStore.selectedCompanyId && companies.value.find(c => c.id === farmStore.selectedCompanyId)) {
        companyIdToSelect = farmStore.selectedCompanyId
      } else {
        farmStore.setSelectedCompany(companyIdToSelect)
      }
      await farmStore.fetchFarms(companyIdToSelect)
      localStorage.setItem('agrogestion_farms', JSON.stringify(farms.value))
      if (farms.value.length > 0 && !farmStore.selectedFarmId) {
        farmStore.setSelectedFarmId(farms.value[0].id)
      }
    }
  }


  const getCompanyData = () => {
    return companies.value.map(company => {
      // Status basado en datos reales: si la compañía tiene nombre, activo
      const status = { color: 'green', outline: false, icon: 'fas fa-building', text: 'Activo' } // Status por defecto
      return {
        ...company,
        status
      }
    })
  }

  const getFarmData = () => {
    const farmsByCompany = {}
    // Get all farms from store
    Object.keys(farmStore.farms).forEach(companyId => {
      farmsByCompany[companyId] = farmStore.getUnifiedFarmsByCompany(companyId)
    })
    return Object.keys(farmsByCompany).map(companyId => {
      const company = companies.value.find(c => c.id == companyId)
      const companyName = company ? company.name : `Compañía ${companyId}`
      return {
        companyName,
        farms: farmsByCompany[companyId]
      }
    })
  }

  const navigateToSection = (section) => {
    currentSection.value = section
  }

  const selectCompany = async (companyId) => {
    if (selectedCompanyId.value !== companyId) {
      if (!authStore.isAuth) {
        console.warn('Usuario no autenticado, no se pueden cargar farms')
        return
      }
      farmStore.setSelectedCompanyId(companyId)
      await farmStore.fetchFarms(companyId)
      localStorage.setItem('agrogestion_farms', JSON.stringify(farms.value))
      farmStore.setSelectedFarmId(farms.value.length > 0 ? farms.value[0].id : null)
    }
  }

  const selectFarm = (farmId) => {
    farmStore.setSelectedFarmId(farmId)
  }

  return {
    currentSection,
    companies,
    farms,
    selectedCompanyId,
    selectedFarmId,
    loadInitialData,
    getCompanyData,
    getFarmData,
    navigateToSection,
    selectCompany,
    selectFarm
  }
}
