import { defineStore } from 'pinia'
import { getCompanies as apiGetCompanies, getFarms as apiGetFarms } from '../api/api.js'

export const useFarmStore = defineStore('farm', {
  state: () => ({
    companies: [],
    farms: {}, // keyed by companyId
    cache: {}, // for additional caching if needed
    isLoadingCompanies: false,
    loadingCompaniesPromise: null,
    isLoadingFarms: {} // keyed by companyId
  }),
  getters: {
    getCompanies: (state) => state.companies,
    getFarmsByCompany: (state) => (companyId) => state.farms[companyId] || [],
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
          console.log('Response from getCompanies:', response)
          const standardized = response.data.data.map(company => ({
            id: company.id,
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
        return // prevent simultaneous calls
      }
      this.isLoadingFarms[companyId] = true
      try {
        const response = await apiGetFarms(companyId)
        console.log('Response from getFarms:', response)
        if (!response.data || !Array.isArray(response.data.data)) {
          return []
        }
        const standardized = response.data.data.map(farm => ({
          id: farm.id,
          name: farm.name,
          location: farm.location || 'Ubicación no especificada',
          description: farm.description || '',
          companyId: farm.companyId,
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
      }
    }
  }
})