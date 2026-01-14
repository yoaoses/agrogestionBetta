import { ref } from 'vue'
import { getCompanies, getFarms } from '../api/api.js'

/**
 * @typedef {Object} FarmEntity
 * @property {number} id
 * @property {string} name
 * @property {string} location
 */

/**
 * @typedef {Object} CompanyEntity
 * @property {number} id
 * @property {string} name
 * @property {string} location
 * @property {FarmEntity[]} farms
 */

export function useEntitiesData() {
  const cache = ref({})
  const TTL = 5 * 60 * 1000 // 5 minutes

  const isExpired = (timestamp) => Date.now() - timestamp > TTL

  const getEntities = async () => {
    if (cache.value.entities && !isExpired(cache.value.timestamp)) {
      return cache.value.entities
    }

    try {
      const companiesResponse = await getCompanies()
      const companies = companiesResponse.data.map(c => ({
        id: c.id,
        name: c.name,
        location: c.address || 'Dirección no especificada',
        farms: []
      }))

      for (const company of companies) {
        const farmsResponse = await getFarms(company.id)
        company.farms = farmsResponse.data.map(f => ({
          id: f.id,
          name: f.name,
          location: f.location || 'Ubicación no especificada'
        }))
      }

      cache.value = {
        entities: companies,
        timestamp: Date.now()
      }
      return companies
    } catch (error) {
      console.error('Error fetching entities:', error)
      throw error
    }
  }

  return {
    getEntities
  }
}