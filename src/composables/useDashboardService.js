import { ref, computed, readonly } from 'vue'
import { useNavigationStore } from '../stores/navigation.js'
import { useDateRangeStore } from '../stores/dateRange.js'
import themeOrchestrator from '../utils/themeOrchestrator.js'
import { generateGroupProductionTheme } from '../composables/useGroupProductionService.js'
import { useSection2Service } from '../composables/useSection2Service.js'
import { useKPIService } from '../composables/useKPIService.js'

// Función para simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export function useDashboardService() {
  const loading = ref(false)
  const error = ref(null)
  const themesData = ref([])
  const cache = ref({})
  const TTL = 5 * 60 * 1000 // 5 minutes
  const currentAbortController = ref(null)

  const isExpired = (timestamp) => Date.now() - timestamp > TTL

  // Función principal para obtener datos por tema
  const getThemesData = async (entityId, type) => {
    if (!entityId || !type) return []

    const dateRangeStore = useDateRangeStore()
    const cacheKey = `${type}-${entityId}-${dateRangeStore.startDate}-${dateRangeStore.endDate}`
    if (cache.value[cacheKey] && !isExpired(cache.value[cacheKey].timestamp)) {
      return cache.value[cacheKey].data
    }

    // Abort previous request if exists
    if (currentAbortController.value) {
      currentAbortController.value.abort()
    }
    currentAbortController.value = new AbortController()

    loading.value = true
    error.value = null

    try {
      // Simular delay de API
      await delay(1000)

      const themes = type === 'company'
        ? ['corporate_finances', 'farm_management', 'market_analysis']
        : ['milk_production', 'group_production']
      const data = []
      for (const apiFunctionName of themes) {
        try {
          const themeData = await themeOrchestrator.generateThemeData(apiFunctionName, entityId, type, currentAbortController.value.signal)
          data.push(themeData)
        } catch (themeErr) {
          console.error(`Failed to load theme: ${apiFunctionName}`, themeErr)
          // Push a fallback theme data to avoid breaking the array
          data.push({
            theme: apiFunctionName,
            tabs: [],
            kpisData: [],
            error: true
          })
        }
      }

      cache.value[cacheKey] = {
        data,
        timestamp: Date.now()
      }
      themesData.value = data
      return data
    } catch (err) {
      if (err.name === 'AbortError') {
        return []
      } else {
        error.value = 'Error al cargar datos de temas'
        console.error('Dashboard service error:', err)
        return []
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    themesData: readonly(themesData),
    getThemesData
  }
}