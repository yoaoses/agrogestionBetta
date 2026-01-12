import { reactive } from 'vue'
import api from '../api/api.js'

export function useFarmDetails() {
  const cache = reactive({})

  const getCached = (key) => cache[key]
  const setCached = (key, value) => { cache[key] = value }

  const getFarmData = async (farmId) => {
    const cacheKey = `farmData_${farmId}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    try {
      // Asumir dateService y api adaptados
      const dateRange = { from: '2023-01-01', to: '2023-12-31' } // placeholder
      const [milkResponse, birthsResponse] = await Promise.all([
        api.getFarmMilkProductionV2(farmId, dateRange),
        api.getFarmBirthsV2(farmId, dateRange)
      ])

      // Procesar datos
      const milkData = { labels: [], values: [] } // placeholder
      const birthsData = { labels: [], values: [] }

      const farmsData = localStorage.getItem('agrogestion_farms')
      let farmInfo = {
        id: farmId,
        name: `Finca ${farmId}`,
        location: 'Ubicación no disponible'
      }

      if (farmsData) {
        const farms = JSON.parse(farmsData)
        const farm = farms.find(f => f.id == farmId)
        if (farm) farmInfo = farm
      }

      const result = {
        ...farmInfo,
        stats: {
          milkProduction: milkData,
          births: birthsData
        }
      }

      setCached(cacheKey, result)
      return result
    } catch (error) {
      console.error('Error fetching farm data:', error)
      throw error
    }
  }

  const getFarmMilkingData = async (farmId, category) => {
    const cacheKey = `farmMilking_${farmId}_${category}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    try {
      // Placeholder
      const result = {
        chartData: { labels: [], values: [] },
        groups: [],
        totalProduction: 0,
        lastRecordDate: null,
        category
      }

      setCached(cacheKey, result)
      return result
    } catch (error) {
      console.error(`Error fetching milking data for ${category}:`, error)
      throw error
    }
  }

  return {
    getFarmData,
    getFarmMilkingData
  }
}
