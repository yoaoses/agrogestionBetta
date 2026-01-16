import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFarmData } from '../composables/useFarmData.js'
import router from '../router/index.js'

export const useNavigationStore = defineStore('navigation', () => {
  const companies = ref([])
  const farms = ref([])
  const allFarms = ref([])
  const selectedCompany = ref(null)
  const selectedFarm = ref(null)

  // Persistir en localStorage
  const loadFromStorage = () => {
    const storedCompany = localStorage.getItem('selectedCompany')
    const storedFarm = localStorage.getItem('selectedFarm')
    if (storedCompany) {
      selectedCompany.value = JSON.parse(storedCompany)
    }
    if (storedFarm) {
      selectedFarm.value = JSON.parse(storedFarm)
    }
  }

  const saveToStorage = () => {
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
  }

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
        try {
          const companyFarms = await getFarms(company.id)
          const mappedFarms = companyFarms.map(farm => ({ ...farm, companyName: company.name, companyId: company.id }))
          allFarms.value.push(...mappedFarms)
        } catch (farmErr) {
          console.error('Error loading farms for company', company.name, ':', farmErr)
        }
      }
      // Remove duplicates by id
      allFarms.value = [...new Map(allFarms.value.map(f => [f.id, f])).values()]
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
      selectedFarm.value = farms.value.find(f => f.id == farmId) || null
    } else {
      selectedFarm.value = null
    }
    saveToStorage()
  }

  // Cargar desde storage al inicializar
  loadFromStorage()

  return {
    companies,
    farms,
    allFarms,
    groupedFarms,
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