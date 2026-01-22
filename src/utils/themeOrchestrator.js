import { useDateRangeStore } from '../stores/dateRange.js'
import {
  getFarmMilkProductionV2,
  getFarmBirths,
  getFarmGroups,
  getGroupMilkProduction
} from '../api/api.js'
import { useKPIService } from '../composables/useKPIService.js'
import { generateMockGroupData } from './mockData.js'

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
  'milk_production': 'Prod. Lechera',
  'group_production': 'Prod. por grupos',
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
  },
  group_production: {
    apiFunc: getFarmGroups,
    valueKey: 'milkLiters',
    process: async (data, additionalData, entityId, signal, groupId = null) => {
      const dateRangeStore = useDateRangeStore()
      let tabs = []
      let kpisData = []
      try {
        const groups = data
        const filteredGroups = groups.filter(g => ['estanque', 'descarte'].includes(g.productionType))
        console.log('Grupos filtrados:', filteredGroups.map(g => ({ id: g.id, name: g.name })))
        console.log('IDs enviados a getGroupMilkProduction:', filteredGroups.map(g => g.id))
        console.log('Confirmación: Usando g.id, no g.farmId')
        const productions = await Promise.all(filteredGroups.map(g => getGroupMilkProduction(g.id, dateRangeStore.startDate, dateRangeStore.endDate)))
        console.log('Respuestas crudas de getGroupMilkProduction:', productions)

        console.log('Antes de procesar respuestas:', productions)

        // Procesar respuestas: distinguir grupos con y sin información
        const processedProductions = productions.map((prod, index) => {
          const dailyStats = prod.data.data.dailyStatistics
          return {
            group: filteredGroups[index],
            hasData: dailyStats.length > 0,
            data: dailyStats
          }
        })

        // Encontrar modelo: primer objeto de un grupo con datos
        let model = { date: '', milkLiters: 0 }
        const firstWithData = processedProductions.find(p => p.hasData)
        if (firstWithData && firstWithData.data.length > 0) {
          model = { ...firstWithData.data[0] }
        }

        // Generar mock para grupos sin información usando el modelo
        processedProductions.forEach(p => {
          if (!p.hasData) {
            p.data = generateMockGroupData(model)
          }
        })

        const aggregatedByType = {
          estanque: {},
          descarte: {}
        }
        processedProductions.forEach((p) => {
          const prodData = p.data
          const type = p.group.productionType
          prodData.forEach(d => {
            const date = d.date
            if (!aggregatedByType[type][date]) aggregatedByType[type][date] = 0
            aggregatedByType[type][date] += d.milkLiters || 0
          })
        })
        const types = ['estanque', 'descarte']
        tabs = types.map(type => {
          let dataArray = Object.keys(aggregatedByType[type]).map(date => ({ date, milkLiters: aggregatedByType[type][date] })).sort((a, b) => new Date(a.date) - new Date(b.date))
          let isMock = false
          if (dataArray.length === 0) {
            dataArray = generateMockGroupData(model, [50, 150])
            isMock = true
          }
          const chartData = transformDataToChartFormat(dataArray, 'milkLiters')
          let title = type.charAt(0).toUpperCase() + type.slice(1)
          if (isMock) {
            title += ' (Mock)'
            chartData.name = title
          }
          const lastRecord = {
            date: chartData.lastRecordDate ? chartData.lastRecordDate.toISOString() : new Date().toISOString(),
            value: chartData.values[chartData.values.length - 1] || 0,
            description: 'Último registro'
          }
          return {
            title,
            chartData,
            lastRecord,
            kpis: [] // Placeholder, will be assigned later
          }
        })
        // Combined
        const combined = {}
        Object.keys(aggregatedByType.estanque).forEach(date => {
          combined[date] = (aggregatedByType.estanque[date] || 0) + (aggregatedByType.descarte[date] || 0)
        })
        Object.keys(aggregatedByType.descarte).forEach(date => {
          if (!combined[date]) combined[date] = aggregatedByType.descarte[date]
        })
        let combinedDataArray = Object.keys(combined).map(date => ({ date, milkLiters: combined[date] })).sort((a, b) => new Date(a.date) - new Date(b.date))
        let isCombinedMock = false
        if (combinedDataArray.length === 0) {
          combinedDataArray = generateMockGroupData(model, [100, 300])
          isCombinedMock = true
        }
        const combinedChartData = transformDataToChartFormat(combinedDataArray, 'milkLiters')
        let combinedTitle = 'Combinado'
        if (isCombinedMock) {
          combinedTitle += ' (Mock)'
          combinedChartData.name = combinedTitle
        }
        const combinedTab = {
          title: combinedTitle,
          chartData: combinedChartData,
          lastRecord: {
            date: combinedChartData.lastRecordDate ? combinedChartData.lastRecordDate.toISOString() : new Date().toISOString(),
            value: combinedChartData.values[combinedChartData.values.length - 1] || 0,
            description: 'Último registro'
          },
          kpis: [] // Placeholder, will be assigned later
        }
        tabs.push(combinedTab)

        console.log('Después de calcular tabs:', tabs)

        // Calcular sumas por grupo
        const groupSums = {}
        processedProductions.forEach(p => {
          const groupId = p.group.id
          const sum = p.data.reduce((acc, d) => acc + (d.milkLiters || 0), 0)
          groupSums[groupId] = { name: p.group.name, sum, type: p.group.productionType }
        })

        // Calcular participaciones para cada tab
        const estanqueGroups = Object.values(groupSums).filter(g => g.type === 'estanque')
        const totalEstanque = estanqueGroups.reduce((acc, g) => acc + g.sum, 0)
        const estanqueKpis = estanqueGroups.map(g => ({
          name: `<i class="bi bi-cow"></i> ${g.name}`,
          value: totalEstanque > 0 ? (g.sum / totalEstanque) * 100 : 0,
          expected: 100,
          unit: '%',
          icon: 'bi-cow',
          desc: 'Participación',
          type: 'participation'
        })).sort((a, b) => b.value - a.value).slice(0, 5)

        const descarteGroups = Object.values(groupSums).filter(g => g.type === 'descarte')
        const totalDescarte = descarteGroups.reduce((acc, g) => acc + g.sum, 0)
        const descarteKpis = descarteGroups.map(g => ({
          name: `<i class="bi bi-cow"></i> ${g.name}`,
          value: totalDescarte > 0 ? (g.sum / totalDescarte) * 100 : 0,
          expected: 100,
          unit: '%',
          icon: 'bi-cow',
          desc: 'Participación',
          type: 'participation'
        })).sort((a, b) => b.value - a.value).slice(0, 5)

        const allGroups = Object.values(groupSums)
        const totalCombined = allGroups.reduce((acc, g) => acc + g.sum, 0)
        const combinedKpis = allGroups.map(g => ({
          name: `<i class="bi bi-cow"></i> ${g.name}`,
          value: totalCombined > 0 ? (g.sum / totalCombined) * 100 : 0,
          expected: 100,
          unit: '%',
          icon: 'bi-cow',
          desc: 'Participación',
          type: 'participation'
        })).sort((a, b) => b.value - a.value).slice(0, 5)

        // Assign KPIs to respective tabs
        tabs[0].kpisData = estanqueKpis  // Estanque tab
        tabs[1].kpisData = descarteKpis  // Descarte tab
        tabs[2].kpisData = combinedKpis  // Combinado tab

        kpisData = []

        console.log('Grupos filtrados:', filteredGroups.map(g => ({ id: g.id, name: g.name, productionType: g.productionType })))
        console.log('Tabs generados:', tabs.map(tab => ({
          title: tab.title,
          chartData: {
            labelsCount: tab.chartData.labels.length,
            valuesCount: tab.chartData.values.length,
            lastRecordDate: tab.chartData.lastRecordDate
          },
          lastRecord: tab.lastRecord
        })))
      } catch (err) {
        console.error('Error in group_production:', err)
        tabs = []
      }
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

    if (themeName === 'group_production') {
      console.log('Inicio de generateThemeData para group_production')
    }

    const theme = themeDisplayNames[themeName] || themeName
    const dateRangeStore = useDateRangeStore()

    // Removed special handling for group_production, now uses standard process

    // Fetch main data
    let data = null
    if (config.apiFunc && type === 'farm') {
      if (themeName === 'group_production') {
        const response = await config.apiFunc(entityId)
        data = response.data.data
      } else {
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
    if (themeName === 'group_production') {
      console.log('Antes de llamar a process')
    }
    const { tabs, kpisData } = await config.process(data, additionalData, entityId, signal, groupId)
    if (themeName === 'group_production') {
      console.log('Después de llamar a process:', { tabs, kpisData })
    }

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