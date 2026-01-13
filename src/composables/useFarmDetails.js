import { reactive } from 'vue'
import api from '../api/api.js'
import { useFarmStore } from '../stores/farm.js'

export function useFarmDetails() {
  const store = useFarmStore()
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
      console.log('Response from getFarmMilkProductionV2:', milkResponse);
      console.log('Response from getFarmBirthsV2:', birthsResponse);

      // Procesar datos
      const milkData = { labels: [], values: [] } // placeholder
      const birthsData = { labels: [], values: [] }

      let farmInfo = store.getFarmById(farmId) || {
        id: farmId,
        name: `Finca ${farmId}`,
        location: 'Ubicación no disponible',
        description: ''
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
