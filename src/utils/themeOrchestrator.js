import { useDateRangeStore } from '../stores/dateRange.js'
import {
  getFarmMilkProductionV2,
  getFarmBirths
} from '../api/api.js'
import { useKPIService } from '../composables/useKPIService.js'

// Dedicated mock data generator function
const generateMockData = (count = 30, valueKey = 'milkLiters', valueRange = [0, 100]) => {
  const now = new Date()
  const data = []
  for (let i = 0; i < count; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now)
    date.setDate(date.getDate() - randomDaysAgo)
    const dateStr = date.toISOString().split('T')[0]
    const value = Math.random() * (valueRange[1] - valueRange[0]) + valueRange[0]
    data.push({ date: dateStr, [valueKey]: value })
  }
  return data
}

// Convertir datos de API a ChartData con propiedad configurable
const transformDataToChartFormat = (data, valueKey = 'value') => {
  if (!data || !Array.isArray(data)) {
    return { labels: [], values: [], lastRecordDate: null, name: null }
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
  const name = data[0] && data[0].name ? data[0].name : null
  return { labels, values, lastRecordDate, name }
}

const themeDisplayNames = {
  'milk_production': 'Producción de Leche',
  'financial_analysis': 'Análisis Financiero',
  'corporate_finances': 'Finanzas Corporativas',
  'farm_management': 'Gestión de Granjas',
  'market_analysis': 'Análisis de Mercado'
}

// Configurations for each theme
const themeDefinitions = {
  milk_production: {
    apiFunc: getFarmMilkProductionV2,
    valueKey: 'value',
    additionalApis: {
      births: getFarmBirths
    },
    process: async (data, additionalData, entityId, signal, groupId = null) => {
      const { calculateKPIsForTheme } = useKPIService()
      let milkData = data
      const birthsData = additionalData.births
      
      let processedBirthsData = birthsData
      if (processedBirthsData && typeof processedBirthsData === 'object' && processedBirthsData.dailyStatistics) {
        processedBirthsData = processedBirthsData.dailyStatistics
      }
      
      // Generate mock data if no real data or all values are zero
      let isMockMilk = false
      if (!milkData || milkData.length === 0 || milkData.every(item => item.value === 0)) {
        milkData = generateMockData(30, 'value')
        isMockMilk = true
      }

      const chartData = transformDataToChartFormat(milkData, 'value')
      chartData.name = isMockMilk ? 'Producción de Leche MOCK' : 'Producción de Leche'
      const lastRecord = {
        date: chartData.lastRecordDate ? chartData.lastRecordDate.toISOString() : new Date().toISOString(),
        value: chartData.values[chartData.values.length - 1] || 0,
        description: 'Último registro válido'
      }

      let weeklyChartData, weeklyLastRecord
      if (birthsData && Array.isArray(birthsData)) {
        weeklyChartData = transformDataToChartFormat(birthsData, 'value')
        weeklyChartData.name = 'Nacimientos'
        weeklyLastRecord = {
          date: weeklyChartData.lastRecordDate ? weeklyChartData.lastRecordDate.toISOString() : new Date().toISOString(),
          value: weeklyChartData.values[weeklyChartData.values.length - 1] || 0,
          description: 'Último nacimiento'
        }
      } else {
        // Fallback to weekly milk aggregation
        const sorted = milkData.sort((a, b) => new Date(a.date) - new Date(b.date))
        const n = sorted.length
        const partSize = Math.ceil(n / 4)
        const values = []
        for (let i = 0; i < 4; i++) {
          const start = i * partSize
          const end = Math.min((i + 1) * partSize, n)
          const sum = sorted.slice(start, end).reduce((s, d) => s + (d.value || 0), 0)
          values.push(sum)
        }
        weeklyChartData = {
          labels: ['Sem1', 'Sem2', 'Sem3', 'Sem4'],
          values,
          lastRecordDate: sorted.length > 0 ? new Date(sorted[sorted.length - 1].date) : null,
          name: 'Nacimientos'
        }
        weeklyLastRecord = {
          date: weeklyChartData.lastRecordDate ? weeklyChartData.lastRecordDate.toISOString() : new Date().toISOString(),
          value: values[3] || 0,
          description: 'Registro semanal'
        }
      }

      const tabs = [
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

      const kpisData = calculateKPIsForTheme('milk_production', milkData, birthsData, milkData)
      return { tabs, kpisData }
    }
  }
  // Add other themes as needed
}

class ThemeOrchestrator {
  constructor() {
    this.configs = themeDefinitions
  }

  async generateThemeData(themeName, entityId, type, signal, groupId = null) {
    const config = this.configs[themeName]
    if (!config) {
      // Fallback for simulated themes
      return this.createMockThemeData(themeName)
    }

    const theme = themeDisplayNames[themeName] || themeName
    const dateRangeStore = useDateRangeStore()

    // Removed special handling for group_production, now uses standard process

    // Fetch main data
    let data = null
    if (config.apiFunc && type === 'farm') {
      const params = {
        entityId: entityId.toString(),
        dateRange: {
          from: dateRangeStore.startDate,
          to: dateRangeStore.endDate
        }
      }
      const response = await config.apiFunc(params.entityId, params.dateRange.from, params.dateRange.to, signal)
      data = response.data.data
      // Handle API response structure: if data has dailyStatistics, use it
      if (data && typeof data === 'object' && data.dailyStatistics) {
        data = data.dailyStatistics
      }
    }

    // Fetch additional data
    const additionalData = {}
    if (config.additionalApis) {
      for (const [key, apiFunc] of Object.entries(config.additionalApis)) {
        try {
          const response = await apiFunc(entityId, dateRangeStore.startDate, dateRangeStore.endDate, signal)
          additionalData[key] = response.data.data
        } catch (err) {
          additionalData[key] = null
        }
      }
    }

    // Process data
    const { tabs, kpisData } = await config.process(data, additionalData, entityId, signal, groupId)

    // Ensure kpisData is an array of KPI objects
    let formattedKpisData = kpisData
    if (!Array.isArray(kpisData)) {
      if (typeof kpisData === 'object' && kpisData !== null) {
        formattedKpisData = Object.entries(kpisData).map(([key, value]) => ({
          name: key,
          value: value,
          expected: 0,
          unit: '',
          desc: 'Valor calculado',
          icon: 'fa-chart-bar'
        }))
      } else {
        formattedKpisData = []
      }
    }

    return { theme, tabs, kpisData: formattedKpisData }
  }

  createMockThemeData(themeName) {
    const theme = themeDisplayNames[themeName] || themeName
    const chartData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      values: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
      lastRecordDate: new Date()
    }
    const lastRecord = {
      date: new Date().toISOString(),
      value: chartData.values[chartData.values.length - 1],
      description: 'Último registro válido'
    }
    const tabs = [
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
    const { calculateKPIsForTheme } = useKPIService()
    let kpisData = calculateKPIsForTheme(themeName, null, null, [{ value: chartData.values[0] }, { value: chartData.values[1] }])

    // Ensure kpisData is an array of KPI objects
    if (!Array.isArray(kpisData)) {
      if (typeof kpisData === 'object' && kpisData !== null) {
        kpisData = Object.entries(kpisData).map(([key, value]) => ({
          name: key,
          value: value,
          expected: 0,
          unit: '',
          desc: 'Valor calculado',
          icon: 'fa-chart-bar'
        }))
      } else {
        kpisData = []
      }
    }

    return { theme, tabs, kpisData }
  }
}

export default new ThemeOrchestrator()