import { ref, computed, readonly } from 'vue'
import { useFarmStore } from '../stores/farm.js'
import { useDateRangeStore } from '../stores/dateRange.js'
import {
   getFarmMilkProductionV2,
   getFarmTotalAnimalsV2,
   getGroups,
   getGroupMilkProduction
} from '../api/api.js'
import { getFarmBirths } from '../api/api.js'
import { useSection2Service } from './useSection2Service.js'
import { useKPIService } from './useKPIService.js'
import { generateGroupProductionTheme } from './useGroupProductionService.js'

const themeMapping = {
   'milk_production': 'Producción de Leche',
   'financial_analysis': 'Análisis Financiero',
   'corporate_finances': 'Finanzas Corporativas',
   'farm_management': 'Gestión de Granjas',
   'market_analysis': 'Análisis de Mercado',
   'group_production': 'Producción por Grupos'
}

// Función para simular delay de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Convertir datos de API a ChartData con propiedad configurable
const convertToChartData = (data, valueKey = 'value') => {
    if (!data || !Array.isArray(data)) {
      return { labels: [], values: [], lastRecordDate: null }
    }

    const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date))
   const labels = sorted.map(d => {
     const date = new Date(d.date)
     const dd = String(date.getDate()).padStart(2, '0')
     const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
     const mm = monthNames[date.getMonth()]
     const yyyy = String(date.getFullYear())
     return `${dd}-${mm}-${yyyy}`
   })
   const values = sorted.map(d => d[valueKey] || 0)
   const lastRecordDate = sorted.length > 0 ? new Date(sorted[sorted.length - 1].date) : null
   return { labels, values, lastRecordDate }
}

// Mapa de temas a funciones API
const themeAPIs = {
   'milk_production': getFarmMilkProductionV2,
   'financial_analysis': null, // simulado
}

// Generar datos por tema
const generateThemeData = async (apiFunctionName, entityId, type, signal) => {
   const dateRangeStore = useDateRangeStore()
   const { getSection2Data } = useSection2Service()
   const { calculateKPIsForTheme } = useKPIService()
   const theme = themeMapping[apiFunctionName] || apiFunctionName
   let apiFunc = null
   if (type === 'farm') {
     apiFunc = themeAPIs[apiFunctionName]
   }

   if (apiFunctionName === 'group_production' && type === 'farm') {
     return await generateGroupProductionTheme(entityId)
   }
   let chartData = { labels: [], values: [], lastRecordDate: null }
   let lastRecord = {
     date: new Date().toISOString(),
     value: 0,
     description: 'Último registro válido'
   }
   let milkData = null
   let birthsData = null
   let tabs = []
   let kpisData = []

  if (apiFunc && type === 'farm') {
    try {
      const params = {
        entityId: entityId.toString(),
        dateRange: {
          from: dateRangeStore.startDate,
          to: dateRangeStore.endDate
        }
      }
      const response = await apiFunc(params.entityId, params.dateRange.from, params.dateRange.to, signal)
      const data = response.data
      if (apiFunctionName === 'milk_production') {
        milkData = data.data // El array está en data.data
        chartData = convertToChartData(data.data, 'milkLiters')
        // También obtener births para la serie temporal
        try {
          const birthsResponse = await getFarmBirths(entityId, dateRangeStore.startDate, dateRangeStore.endDate, signal)
          birthsData = birthsResponse.data.data
        } catch (err) {
          birthsData = null
        }
      } else {
        chartData = convertToChartData(data.data, 'value')
      }
      if (chartData.lastRecordDate) {
        lastRecord.date = chartData.lastRecordDate.toISOString()
        lastRecord.value = chartData.values[chartData.values.length - 1] || 0
      }
      // Calcular KPIs
      kpisData = calculateKPIsForTheme(apiFunctionName, milkData, birthsData, data.data)
    } catch (err) {
      console.error(`Error fetching data for ${theme}:`, err)
    }
  } else {
    // Simulated for company themes or themes without API
    chartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      values: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
      lastRecordDate: new Date()
    }
    lastRecord.value = chartData.values[chartData.values.length - 1]
    // KPIs genéricos
    kpisData = calculateKPIsForTheme(apiFunctionName, null, null, [{ value: chartData.values[0] }, { value: chartData.values[1] }])
  }

if (milkData && Array.isArray(milkData)) {
   let weeklyChartData = null
   let weeklyLastRecord = null

   if (birthsData && Array.isArray(birthsData)) {
     // Usar births para la serie temporal
     weeklyChartData = convertToChartData(birthsData, 'births')
     weeklyLastRecord = {
       date: weeklyChartData.lastRecordDate ? weeklyChartData.lastRecordDate.toISOString() : new Date().toISOString(),
       value: weeklyChartData.values[weeklyChartData.values.length - 1] || 0,
       description: 'Último nacimiento'
     }
   } else {
     // Fallback a agrupar milkLiters semanalmente
     const sorted = milkData.sort((a, b) => new Date(a.date) - new Date(b.date))
     const n = sorted.length
     const partSize = Math.ceil(n / 4)
     const values = []
     for (let i = 0; i < 4; i++) {
       const start = i * partSize
       const end = Math.min((i + 1) * partSize, n)
       const sum = sorted.slice(start, end).reduce((s, d) => s + (d.milkLiters || 0), 0)
       values.push(sum)
     }
     weeklyChartData = {
       labels: ['Sem1', 'Sem2', 'Sem3', 'Sem4'],
       values,
       lastRecordDate: sorted.length > 0 ? new Date(sorted[sorted.length - 1].date) : null
     }
     weeklyLastRecord = {
       date: weeklyChartData.lastRecordDate ? weeklyChartData.lastRecordDate.toISOString() : new Date().toISOString(),
       value: values[3] || 0,
       description: 'Registro semanal'
     }
   }

   tabs = [
     {
       title: 'Producción',
       chartData,
       lastRecord
     },
     {
       title: 'Nacimientos',
       chartData: weeklyChartData,
       lastRecord: weeklyLastRecord
     }
   ]
} else {
  tabs = [
    {
      title: 'Producción',
      chartData,
      lastRecord
    },
    {
      title: 'Nacimientos',
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
}
// const section2Data = await getSection2Data(entityId, type, theme)

return { theme, tabs, kpisData }
}

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

    const cacheKey = `${type}-${entityId}`
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
        data.push(await generateThemeData(apiFunctionName, entityId, type, currentAbortController.value.signal))
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

export { convertToChartData };