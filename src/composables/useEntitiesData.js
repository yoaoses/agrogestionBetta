import { ref } from 'vue'
import { useNavigationStore } from '../stores/navigation.js'

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
  const store = useNavigationStore()
  const cache = ref({})
  const TTL = 5 * 60 * 1000 // 5 minutes

  const isExpired = (timestamp) => Date.now() - timestamp > TTL

  const getEntities = async () => {
    if (cache.value.entities && !isExpired(cache.value.timestamp)) {
      return cache.value.entities
    }

    try {
      await store.fetchCompanies()
      const companies = store.getUnifiedCompanies().map(c => ({
        id: c.id,
        name: c.name,
        location: c.location,
        farms: []
      }))

      for (const company of companies) {
        await store.fetchFarms(company.id)
        company.farms = store.getUnifiedFarmsByCompany(company.id).map(f => ({
          id: f.id,
          name: f.name,
          location: f.location
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