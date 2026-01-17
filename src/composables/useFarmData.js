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

  const getGroups = async (farmId) => {
    await store.fetchGroups(farmId)
    return store.getGroupsByFarm(farmId)
  }

  return {
    getCompanies,
    getFarms,
    getGroups
  }
}
