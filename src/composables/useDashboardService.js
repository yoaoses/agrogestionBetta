import { ref, computed, readonly } from 'vue'
import {
  getFarmMilkProductionV2,
  getFarmHealthStats,
  getFarmInventoryStats,
  getFarmTotalAnimalsV2
} from '../api/api.js'

// Función para simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Convertir datos de API a ChartData estandarizado
const convertToChartData = (data) => {
  if (!data || !Array.isArray(data)) return { labels: [], values: [], lastRecordDate: null }

  const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date))
  const labels = sorted.map(d => {
    const date = new Date(d.date)
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yy = String(date.getFullYear()).slice(-2)
    return `${dd}-${mm}-${yy}`
  })
  const values = sorted.map(d => d.value)
  const lastRecordDate = sorted.length > 0 ? new Date(sorted[sorted.length - 1].date) : null
  return { labels, values, lastRecordDate }
}

// Mapa de temas a funciones API
const themeAPIs = {
  'Producción Lechera': getFarmMilkProductionV2,
  'Salud Animal': getFarmHealthStats,
  'Inventario': getFarmInventoryStats,
  'Análisis Financiero': null, // simulado
  'Gestión de Recursos': getFarmTotalAnimalsV2
}

// Generar datos por tema
const generateThemeData = async (theme, farmId) => {
  const apiFunc = themeAPIs[theme]
  let chartData = { labels: [], values: [], lastRecordDate: null }
  let lastRecord = {
    date: new Date().toISOString(),
    value: 0,
    description: 'Último registro válido'
  }

  if (apiFunc) {
    try {
      const response = await apiFunc(farmId)
      chartData = convertToChartData(response.data)
      if (chartData.lastRecordDate) {
        lastRecord.date = chartData.lastRecordDate.toISOString()
        lastRecord.value = chartData.values[chartData.values.length - 1] || 0
      }
    } catch (err) {
      console.error(`Error fetching data for ${theme}:`, err)
      // Fallback to simulated
      chartData = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
        values: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
        lastRecordDate: new Date()
      }
      lastRecord.value = chartData.values[chartData.values.length - 1]
    }
  } else {
    // Simulated for themes without API
    chartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      values: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
      lastRecordDate: new Date()
    }
    lastRecord.value = chartData.values[chartData.values.length - 1]
  }

  const tabs = [
    {
      title: 'Gráfico Principal',
      chartData,
      lastRecord
    },
    {
      title: 'Serie Temporal',
      chartData: {
        labels: ['Sem1', 'Sem2', 'Sem3', 'Sem4'],
        values: Array.from({ length: 4 }, () => Math.floor(Math.random() * 200))
      },
      lastRecord: {
        date: new Date().toISOString(),
        value: Math.floor(Math.random() * 500),
        description: 'Registro semanal'
      }
    }
  ]

  const participation = [
    { farm: 'Granja A', percent: 30 + Math.random() * 20 },
    { farm: 'Granja B', percent: 25 + Math.random() * 15 },
    { farm: 'Granja C', percent: 20 + Math.random() * 10 },
    { farm: 'KPIs', percent: 15 + Math.random() * 5 }
  ]

  return { theme, tabs, participation }
}

export function useDashboardService() {
  const loading = ref(false)
  const error = ref(null)
  const cache = ref({})
  const TTL = 5 * 60 * 1000 // 5 minutes

  const isExpired = (timestamp) => Date.now() - timestamp > TTL

  // Función principal para obtener datos por tema
  const getThemesData = async (farmId) => {
    if (!farmId) return []

    if (cache.value[farmId] && !isExpired(cache.value[farmId].timestamp)) {
      return cache.value[farmId].data
    }

    loading.value = true
    error.value = null

    try {
      // Simular delay de API
      await delay(1000)

      const themes = ['Producción Lechera', 'Salud Animal', 'Inventario', 'Análisis Financiero', 'Gestión de Recursos']
      const data = []
      for (const theme of themes) {
        data.push(await generateThemeData(theme, farmId))
      }

      cache.value[farmId] = {
        data,
        timestamp: Date.now()
      }
      return data
    } catch (err) {
      error.value = 'Error al cargar datos de temas'
      console.error('Dashboard service error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    getThemesData
  }
}