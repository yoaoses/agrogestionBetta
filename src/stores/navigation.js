import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCompanies as apiGetCompanies, getFarms as apiGetFarms, getFarmGroups as apiGetFarmGroups } from '../api/api.js'
import { standardizeCompany, standardizeFarm, standardizeGroup } from '../utils/dataFetching.js'
import router from '../router/index.js'

export const useNavigationStore = defineStore('navigation', () => {
  const companies = ref([])
  const farms = ref({}) // keyed by companyId
  const groups = ref({}) // keyed by farmId
  const selectedCompany = ref(null)
  const selectedFarm = ref(null)

  // Persistir en localStorage
  const loadFromStorage = () => {
    try {
      const storedCompany = localStorage.getItem('selectedCompany')
      const storedFarm = localStorage.getItem('selectedFarm')
      if (storedCompany) {
        selectedCompany.value = JSON.parse(storedCompany)
      }
      if (storedFarm) {
        selectedFarm.value = JSON.parse(storedFarm)
      }
    } catch (error) {
      console.error('[DEBUG] Navigation Store: Error loading from localStorage:', error)
      // Reset to null on error
      selectedCompany.value = null
      selectedFarm.value = null
    }
  }

  const saveToStorage = () => {
    try {
      if (selectedCompany.value) {
        localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany.value))
      } else {
        localStorage.removeItem('selectedCompany')
      }
      if (selectedFarm.value) {
        localStorage.setItem('selectedFarm', JSON.stringify(selectedFarm.value))
      } else {
        localStorage.removeItem('selectedFarm')
      }
    } catch (error) {
      console.error('[DEBUG] Navigation Store: Error saving to localStorage:', error)
    }
  }

  const allFarms = computed(() => {
    const result = []
    for (const companyId in farms.value) {
      const company = companies.value.find(c => c.id == companyId)
      if (company) {
        farms.value[companyId].forEach(farm => {
          result.push({ ...farm, companyName: company.name, companyId: company.id })
        })
      }
    }
    return result
  })

  const groupedFarms = computed(() => {
    const groups = {}
    allFarms.value.forEach(farm => {
      if (!groups[farm.companyName]) {
        groups[farm.companyName] = []
      }
      groups[farm.companyName].push(farm)
    })
    return groups
  })

  // Loading states
  const isLoadingCompanies = ref(false)
  const loadingCompaniesPromise = ref(null)
  const isLoadingFarms = ref({})
  const loadingFarmsPromises = ref({})
  const isLoadingGroups = ref({})
  const loadingGroupsPromises = ref({})

  const fetchCompanies = async () => {
    if (companies.value.length > 0) {
      return companies.value
    }
    if (isLoadingCompanies.value) {
      return loadingCompaniesPromise.value
    }
    isLoadingCompanies.value = true
    loadingCompaniesPromise.value = (async () => {
      try {
        const response = await apiGetCompanies()
        companies.value = response.data.data.map(standardizeCompany)
        return companies.value
      } catch (error) {
        console.error('Error fetching companies:', error)
        throw error
      } finally {
        isLoadingCompanies.value = false
        loadingCompaniesPromise.value = null
      }
    })()
    return loadingCompaniesPromise.value
  }

  const fetchFarms = async (companyId) => {
    if (farms.value[companyId]) {
      return farms.value[companyId]
    }
    if (isLoadingFarms.value[companyId]) {
      return loadingFarmsPromises.value[companyId]
    }
    isLoadingFarms.value[companyId] = true
    loadingFarmsPromises.value[companyId] = (async () => {
      try {
        const response = await apiGetFarms(companyId)
        const standardized = response.data.data.map(standardizeFarm)
        farms.value[companyId] = standardized
        return standardized
      } catch (error) {
        console.error('Error fetching farms:', error)
        throw error
      } finally {
        isLoadingFarms.value[companyId] = false
        delete loadingFarmsPromises.value[companyId]
      }
    })()
    return loadingFarmsPromises.value[companyId]
  }

  const fetchGroups = async (farmId) => {
    if (groups.value[farmId]) {
      return groups.value[farmId]
    }
    if (isLoadingGroups.value[farmId]) {
      return loadingGroupsPromises.value[farmId]
    }
    isLoadingGroups.value[farmId] = true
    loadingGroupsPromises.value[farmId] = (async () => {
      try {
        const response = await apiGetFarmGroups(farmId)
        const standardized = response.data.data.map(standardizeGroup)
        groups.value[farmId] = standardized
        return standardized
      } catch (error) {
        console.error('Error fetching groups:', error)
        throw error
      } finally {
        isLoadingGroups.value[farmId] = false
        delete loadingGroupsPromises.value[farmId]
      }
    })()
    return loadingGroupsPromises.value[farmId]
  }

  const loadCompanies = async () => {
    try {
      await fetchCompanies()
    } catch (err) {
      console.error('Error loading companies:', err)
    }
  }

  const loadFarms = async (companyId) => {
    try {
      await fetchFarms(companyId)
    } catch (err) {
      console.error('Error loading farms:', err)
    }
  }

  const loadAllFarms = async () => {
    try {
      await loadCompanies()
      for (const company of companies.value) {
        try {
          await fetchFarms(company.id)
        } catch (farmErr) {
          console.error('Error loading farms for company', company.name, ':', farmErr)
        }
      }
    } catch (err) {
      console.error('Error loading all farms:', err)
    }
  }

  const selectCompany = (company) => {
    selectedCompany.value = company
    selectedFarm.value = null
    saveToStorage()
    loadFarms(company.id)
    router.push(`/dashboard/${company.id}`)
  }

  const selectFarm = async (farm) => {
    selectedFarm.value = farm
    selectedCompany.value = companies.value.find(c => c.id == farm.companyId) || selectedCompany.value
    saveToStorage()
    await loadFarms(selectedCompany.value.id)
    router.push(`/dashboard/${selectedCompany.value.id}/${farm.id}`)
  }

  const setSelectedFromRoute = (companyId, farmId) => {
    if (companyId) {
      selectedCompany.value = companies.value.find(c => c.id == companyId) || null
    } else {
      selectedCompany.value = null
    }
    if (farmId && selectedCompany.value) {
      selectedFarm.value = farms.value[selectedCompany.value.id]?.find(f => f.id == farmId) || null
    } else {
      selectedFarm.value = null
    }
    saveToStorage()
  }

  const setSelectedCompanyId = (companyId) => {
    selectedCompany.value = companies.value.find(c => c.id == companyId) || null
    selectedFarm.value = null
    saveToStorage()
  }

  const setSelectedFarmId = (farmId) => {
    for (const companyId in farms.value) {
      const farm = farms.value[companyId].find(f => f.id == farmId)
      if (farm) {
        selectedFarm.value = farm
        selectedCompany.value = companies.value.find(c => c.id == companyId) || selectedCompany.value
        saveToStorage()
        return
      }
    }
    selectedFarm.value = null
    saveToStorage()
  }

  // Computed for compatibility
  const selectedCompanyId = computed(() => selectedCompany.value?.id)
  const selectedFarmId = computed(() => selectedFarm.value?.id)

  // Cargar desde storage al inicializar
  loadFromStorage()

  return {
    companies,
    farms,
    groups,
    allFarms,
    groupedFarms,
    selectedCompany,
    selectedFarm,
    selectedCompanyId,
    selectedFarmId,
    loadCompanies,
    loadFarms,
    loadAllFarms,
    selectCompany,
    selectFarm,
    setSelectedFromRoute,
    setSelectedCompanyId,
    setSelectedFarmId,
    fetchCompanies,
    fetchFarms,
    fetchGroups,
    getCompanies: () => companies.value,
    getFarmsByCompany: (companyId) => farms.value[companyId] || [],
    getGroupsByFarm: (farmId) => groups.value[farmId] || [],
    getUnifiedCompanies: () => companies.value.map(company => ({ ...company, location: company.address })),
    getUnifiedFarmsByCompany: (companyId) => (farms.value[companyId] || []).map(farm => ({ ...farm, location: farm.location })),
    getFarmById: (farmId) => {
      for (const companyId in farms.value) {
        const farm = farms.value[companyId].find(f => f.id === farmId)
        if (farm) return { ...farm, location: farm.location }
      }
      return null
    },
    getSelectedCompanyId: () => selectedCompany.value?.id,
    getSelectedFarmId: () => selectedFarm.value?.id,
    getSelectedCompany: () => selectedCompany.value,
    getSelectedFarm: () => selectedFarm.value
  }
})