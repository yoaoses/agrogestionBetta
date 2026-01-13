import { useFarmStore } from '../stores/farm.js'

export function useFarmData() {
  const store = useFarmStore()

  const getCompanies = async () => {
    await store.fetchCompanies()
    return store.getUnifiedCompanies
  }

  const getFarms = async (companyId) => {
    await store.fetchFarms(companyId)
    return store.getUnifiedFarmsByCompany(companyId)
  }

  // Agregar más métodos según necesidad

  return {
    getCompanies,
    getFarms
  }
}
