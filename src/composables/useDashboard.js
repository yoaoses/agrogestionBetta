import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useNavigationStore } from '../stores/navigation.js'

export function useDashboard() {
  const authStore = useAuthStore()
  const navigationStore = useNavigationStore()
  const currentSection = ref('company')

  const selectedCompanyId = computed(() => navigationStore.selectedCompanyId)
  const selectedFarmId = computed(() => navigationStore.selectedFarmId)

  const companies = computed(() => navigationStore.getUnifiedCompanies)
  const farms = computed(() => {
    if (selectedCompanyId.value) {
      return navigationStore.getUnifiedFarmsByCompany(selectedCompanyId.value)
    }
    return []
  })

  const loadInitialData = async () => {
    if (!authStore.isAuth) {
      console.warn('Usuario no autenticado, no se pueden cargar datos')
      return
    }
    await navigationStore.fetchCompanies()
    if (companies.value.length > 0) {
      let companyIdToSelect = companies.value[0].id
      if (navigationStore.selectedCompanyId && companies.value.find(c => c.id === navigationStore.selectedCompanyId)) {
        companyIdToSelect = navigationStore.selectedCompanyId
      } else {
        navigationStore.setSelectedCompany(companyIdToSelect)
      }
      await navigationStore.fetchFarms(companyIdToSelect)
      localStorage.setItem('agrogestion_farms', JSON.stringify(farms.value))
      if (farms.value.length > 0 && !navigationStore.selectedFarmId) {
        navigationStore.setSelectedFarmId(farms.value[0].id)
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
    Object.keys(navigationStore.farms).forEach(companyId => {
      farmsByCompany[companyId] = navigationStore.getUnifiedFarmsByCompany(companyId)
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
      navigationStore.setSelectedCompanyId(companyId)
      await navigationStore.fetchFarms(companyId)
      localStorage.setItem('agrogestion_farms', JSON.stringify(farms.value))
      navigationStore.setSelectedFarmId(farms.value.length > 0 ? farms.value[0].id : null)
    }
  }

  const selectFarm = (farmId) => {
    navigationStore.setSelectedFarmId(farmId)
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
