import { useNavigationStore } from '../stores/navigation.js'

export function useFarmData() {
  const store = useNavigationStore()

  const getCompanies = async () => {
    await store.fetchCompanies()
    const result = store.getUnifiedCompanies()
    return result
  }

  const getFarms = async (companyId) => {
    await store.fetchFarms(companyId)
    const result = store.getUnifiedFarmsByCompany(companyId)
    return result
  }

  const getGroups = async (farmId) => {
    await store.fetchGroups(farmId)
    const result = store.getGroupsByFarm(farmId)
    return result
  }

  return {
    getCompanies,
    getFarms,
    getGroups
  }
}
