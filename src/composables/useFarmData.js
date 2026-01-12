import { reactive } from 'vue'
import api from '../api/api.js'

export function useFarmData() {
  const cache = reactive({})

  const getCached = (key) => cache[key]
  const setCached = (key, value) => { cache[key] = value }

  const getCompanies = async () => {
    const cacheKey = 'companies'
    const cached = getCached(cacheKey)
    if (cached) return cached

    try {
      const response = await api.getCompanies()
      const standardized = response.data.data.map(company => ({
        id: company.id,
        name: company.name,
        address: company.address || 'Dirección no especificada',
        taxId: company.tax_id,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      }))
      setCached(cacheKey, standardized)
      return standardized
    } catch (error) {
      console.error('Error fetching companies:', error)
      throw error
    }
  }

  const getFarms = async (companyId) => {
    const cacheKey = `farms_${companyId}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    try {
      const response = await api.getFarms(companyId)
      const standardized = response.data.data.map(farm => ({
        id: farm.id,
        name: farm.name,
        location: farm.location || 'Ubicación no especificada',
        companyId: farm.companyId,
        createdAt: farm.created_at,
        updatedAt: farm.updated_at
      }))
      setCached(cacheKey, standardized)
      return standardized
    } catch (error) {
      console.error('Error fetching farms:', error)
      throw error
    }
  }

  // Agregar más métodos según necesidad

  return {
    getCompanies,
    getFarms
  }
}
