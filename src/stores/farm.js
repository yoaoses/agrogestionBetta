import { defineStore } from 'pinia'
import { getCompanies as apiGetCompanies, getFarms as apiGetFarms, getFarmGroups as apiGetFarmGroups } from '../api/api.js'

export const useFarmStore = defineStore('farm', {
  state: () => ({
    companies: [],
    farms: {}, // keyed by companyId
    groups: {}, // keyed by farmId
    cache: {}, // for additional caching if needed
    isLoadingCompanies: false,
    loadingCompaniesPromise: null,
    isLoadingFarms: {}, // keyed by companyId
    loadingFarmsPromises: {}, // keyed by companyId
    isLoadingGroups: {}, // keyed by farmId
    loadingGroupsPromises: {}, // keyed by farmId
    selectedCompanyId: (() => {
      const val = localStorage.getItem('selectedCompanyId');
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    })(),
    selectedFarmId: (() => {
      const val = localStorage.getItem('selectedFarmId');
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    })()
  }),
  getters: {
    getCompanies: (state) => state.companies,
    getFarmsByCompany: (state) => (companyId) => state.farms[companyId] || [],
    getGroupsByFarm: (state) => (farmId) => state.groups[farmId] || [],
    getUnifiedCompanies: (state) => state.companies.map(company => ({
      ...company,
      location: company.address
    })),
    getUnifiedFarmsByCompany: (state) => (companyId) => (state.farms[companyId] || []).map(farm => ({
      ...farm,
      location: farm.location
    })),
    getFarmById: (state) => (farmId) => {
      for (const companyId in state.farms) {
        const farm = state.farms[companyId].find(f => f.id === farmId)
        if (farm) return { ...farm, location: farm.location }
      }
      return null
    },
    getSelectedCompanyId: (state) => state.selectedCompanyId,
    getSelectedFarmId: (state) => state.selectedFarmId,
    getSelectedCompany: (state) => state.companies.find(c => c.id === state.selectedCompanyId) || null,
    getSelectedFarm: (state) => {
      for (const companyId in state.farms) {
        const farm = state.farms[companyId].find(f => f.id === state.selectedFarmId)
        if (farm) return farm
      }
      return null
    }
  },
  actions: {
    async fetchCompanies() {
      if (this.companies.length > 0) {
        return this.companies // already cached
      }
      if (this.isLoadingCompanies) {
        return this.loadingCompaniesPromise // return the ongoing promise
      }
      this.isLoadingCompanies = true
      this.loadingCompaniesPromise = (async () => {
        try {
          const response = await apiGetCompanies()
          const standardized = response.data.data.map(company => ({
            id: Number(company.id),
            name: company.name,
            address: company.address || 'Dirección no especificada',
            description: company.description || '',
            taxId: company.tax_id,
            createdAt: company.created_at,
            updatedAt: company.updated_at
          }))
          this.companies = standardized
          return standardized
        } catch (error) {
          console.error('Error fetching companies:', error)
          throw error
        } finally {
          this.isLoadingCompanies = false
          this.loadingCompaniesPromise = null
        }
      })()
      return this.loadingCompaniesPromise
    },
    async fetchFarms(companyId) {
      if (this.farms[companyId]) {
        return this.farms[companyId] // cached
      }
      if (this.isLoadingFarms[companyId]) {
        return this.loadingFarmsPromises[companyId] // return the ongoing promise
      }
      this.isLoadingFarms[companyId] = true
      this.loadingFarmsPromises[companyId] = (async () => {
        try {
          const response = await apiGetFarms(companyId)
          const standardized = response.data.data.map(farm => ({
            id: Number(farm.id),
            name: farm.name,
            location: farm.location || 'Ubicación no especificada',
            description: farm.description || '',
            companyId: Number(farm.companyId),
            createdAt: farm.created_at,
            updatedAt: farm.updated_at
          }))
          this.farms[companyId] = standardized
          return standardized
        } catch (error) {
          console.error('Error fetching farms:', error)
          throw error
        } finally {
          this.isLoadingFarms[companyId] = false
          delete this.loadingFarmsPromises[companyId]
        }
      })()
      return this.loadingFarmsPromises[companyId]
    },
    setSelectedCompanyId(companyId) {
      this.selectedCompanyId = companyId
      localStorage.setItem('selectedCompanyId', companyId)
      this.selectedFarmId = null;
      localStorage.removeItem('selectedFarmId');
    },
    setSelectedFarmId(farmId) {
      this.selectedFarmId = farmId
      localStorage.setItem('selectedFarmId', farmId)
    },
    async fetchGroups(farmId) {
      if (this.groups[farmId]) {
        return this.groups[farmId] // cached
      }
      if (this.isLoadingGroups[farmId]) {
        return this.loadingGroupsPromises[farmId] // return the ongoing promise
      }
      this.isLoadingGroups[farmId] = true
      this.loadingGroupsPromises[farmId] = (async () => {
        try {
          const response = await apiGetFarmGroups(farmId)
          const standardized = response.data.data.map(group => ({
            id: Number(group.id),
            name: group.name,
            description: group.description || '',
            farmId: Number(group.farmId),
            createdAt: group.created_at,
            updatedAt: group.updated_at
          }))
          this.groups[farmId] = standardized
          return standardized
        } catch (error) {
          console.error('Error fetching groups:', error)
          throw error
        } finally {
          this.isLoadingGroups[farmId] = false
          delete this.loadingGroupsPromises[farmId]
        }
      })()
      return this.loadingGroupsPromises[farmId]
    }
  }
})