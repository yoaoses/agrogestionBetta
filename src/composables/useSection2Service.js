import { ref, computed, readonly } from 'vue'
import { useDateRangeStore } from '../stores/dateRange.js'
// Aquí se pueden importar APIs futuras para participación real
// import { getParticipationData } from '../api/api.js'

// Función para simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Generar datos de participación simulados (hasta que haya API real)
const generateParticipationData = (entityId, type) => {
  if (type === 'farm') {
    return [
      { farm: 'Granja A', percent: 30 + Math.random() * 20 },
      { farm: 'Granja B', percent: 25 + Math.random() * 15 },
      { farm: 'Granja C', percent: 20 + Math.random() * 10 },
      { farm: 'KPIs', percent: 15 + Math.random() * 5 }
    ]
  } else if (type === 'company') {
    return [
      { kpi: 'Finanzas', percent: 40 + Math.random() * 20 },
      { kpi: 'Mercado', percent: 30 + Math.random() * 15 },
      { kpi: 'Granjas', percent: 20 + Math.random() * 10 },
      { kpi: 'Otros', percent: 10 + Math.random() * 5 }
    ]
  }
  return []
}

export function useSection2Service() {
  const loading = ref(false)
  const error = ref(null)
  const section2Data = ref({})
  const cache = ref({})
  const TTL = 5 * 60 * 1000 // 5 minutes

  const isExpired = (timestamp) => Date.now() - timestamp > TTL

  // Función principal para obtener datos de sección 2
  const getSection2Data = async (entityId, type, theme) => {
    if (!entityId || !type || !theme) return { type: 'participation', data: [] }

    const cacheKey = `${type}-${entityId}-${theme}`
    if (cache.value[cacheKey] && !isExpired(cache.value[cacheKey].timestamp)) {
      return cache.value[cacheKey].data
    }

    loading.value = true
    error.value = null

    try {
      // Simular delay de API
      await delay(500)

      // Aquí se integrará la API real cuando esté disponible
      // const response = await getParticipationData(entityId, type, theme)
      // const data = convertParticipationData(response.data)

      const data = generateParticipationData(entityId, type)

      const result = {
        type: 'participation',
        data: data
      }

      cache.value[cacheKey] = {
        data: result,
        timestamp: Date.now()
      }
      section2Data.value = result
      return result
    } catch (err) {
      error.value = 'Error al cargar datos de participación'
      console.error('Section2 service error:', err)
      return { type: 'participation', data: [] }
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    section2Data: readonly(section2Data),
    getSection2Data
  }
}