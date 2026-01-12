import { ref } from 'vue'

export function useDashboard() {
  const currentSection = ref('company')
  const companies = ref([])
  const farms = ref([])
  const selectedCompanyId = ref(null)
  const selectedFarmId = ref(null)

  const loadInitialData = async () => {
    companies.value = getMockCompanies()
    if (companies.value.length > 0) {
      selectedCompanyId.value = companies.value[0].id
      farms.value = getMockFarms()
      localStorage.setItem('agrogestion_farms', JSON.stringify(farms.value))
    }
  }

  const getMockCompanies = () => [
    { id: 1, name: 'Los Molinos' },
    { id: 2, name: 'AgroSur' },
    { id: 3, name: 'CampoVerde' },
    { id: 4, name: 'San Jose' }
  ]

  const getMockFarms = () => [
    { id: 1, name: 'Finca Los Alamos', location: 'Región Metropolitana', companyId: 1 },
    { id: 2, name: 'Finca El Valle', location: 'Región del Maule', companyId: 1 },
    { id: 3, name: 'Finca Patagonia', location: 'Región de Los Lagos', companyId: 2 },
    { id: 4, name: 'Finca Norte', location: 'Región de Coquimbo', companyId: 3 },
    { id: 5, name: 'Finca Central', location: 'Región Metropolitana', companyId: 4 },
    { id: 6, name: 'Finca Sur', location: 'Región del Biobío', companyId: 4 }
  ]

  const getMockStatuses = () => ({
    'Los Molinos': { color: 'green', outline: true, icon: 'fas fa-chart-line', text: 'En desarrollo' },
    'San Jose': { color: 'blue', outline: false, icon: 'fas fa-building', text: 'Activo' },
    default: { color: 'yellow', outline: false, icon: 'fas fa-clock', text: 'Pendiente' }
  })

  const getCompanyData = () => {
    return companies.value.map(company => {
      const statuses = getMockStatuses()
      const status = statuses[company.name] || statuses.default
      let mockAddress, mockRut
      if (company.name === 'Los Molinos') {
        mockAddress = 'Calle Principal 123, Santiago'
        mockRut = '12.345.678-9'
      } else if (company.name === 'San Jose') {
        mockAddress = 'Avenida Central 456, Valparaíso'
        mockRut = '23.456.789-0'
      } else {
        mockAddress = 'Dirección Mock ' + company.id
        mockRut = '98.765.432-1'
      }
      return {
        ...company,
        mockAddress,
        mockRut,
        status
      }
    })
  }

  const getFarmData = () => {
    const farmsByCompany = {}
    farms.value.forEach(farm => {
      const companyId = farm.companyId || 1
      if (!farmsByCompany[companyId]) farmsByCompany[companyId] = []
      farmsByCompany[companyId].push(farm)
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
      selectedCompanyId.value = companyId
      // farms.value = await dataService.getFarms(companyId)
      localStorage.setItem('agrogestion_farms', JSON.stringify(farms.value))
      selectedFarmId.value = farms.value.length > 0 ? farms.value[0].id : null
    }
  }

  const selectFarm = (farmId) => {
    selectedFarmId.value = farmId
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
