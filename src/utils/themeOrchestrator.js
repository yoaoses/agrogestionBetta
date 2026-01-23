import { useDateRangeStore } from '../stores/dateRange.js'
import {
  getMilkProductionForFarm,
  getBirthsForFarm,
  getFarmPopulationDynamics,
  getGroups,
  getGroupMilkProduction
} from '../api/api.js'
import { useKPIService } from '../composables/useKPIService.js'
import { generateMockGroupData, generateMockPopulationData } from './mockData.js'


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
  'group_production': 'Prod. por Grupos',
  'population_dynamics': 'Demografía',
  'financial_analysis': 'Análisis Financiero',
  'corporate_finances': 'Finanzas Corporativas',
  'farm_management': 'Gestión de Granjas',
  'market_analysis': 'Análisis de Mercado'
}

// Configurations for each theme
const themeDefinitions = {
  milk_production: {
    apiFunc: getMilkProductionForFarm,
    valueKey: 'value',
    additionalApis: {
      births: getBirthsForFarm
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
        milkData = generateMockGroupData({ date: '', value: 0 }, [0, 100])
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
          lastRecord,
          yTitle: 'Litros'
        },
        {
          title: 'Nacimientos',
          chartData: weeklyChartData,
          lastRecord: weeklyLastRecord,
          yTitle: 'Nacimientos'
        }
      ]

      const kpisData = calculateKPIsForTheme('milk_production', milkData, birthsData, milkData)
      return { tabs, kpisData }
    }
  },
  group_production: {
    apiFunc: getGroups,
    valueKey: 'milkLiters',
    process: async function(data, additionalData, entityId, signal, groupId = null) {
      const dateRangeStore = useDateRangeStore()
      let tabs = []
      let kpisData = []
      try {
        const groups = data
        const filteredGroups = groups.filter(g => ['estanque', 'descarte'].includes(g.productionType))
        const productions = await Promise.all(filteredGroups.map(g => this.cachedApiCall(getGroupMilkProduction, g.id, dateRangeStore.startDate, dateRangeStore.endDate)))

        // Procesar respuestas: distinguir grupos con y sin información
        const processedProductions = productions.map((prod, index) => {
          const dailyStats = prod?.data?.data?.dailyStatistics || []
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
            kpis: [],
            yTitle: 'Litros',
            xTitle: 'Produccion Lechera'
          }
        })
        // Combined - Stacked Column Chart
        const allDates = new Set()
        processedProductions.forEach(p => p.data.forEach(d => allDates.add(d.date)))
        const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b))

        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40']

        let combinedSeries = processedProductions.map((p, index) => {
          const groupName = p.group.name
          const color = colors[index % colors.length]
          const data = sortedDates.map(date => {
            const entry = p.data.find(d => d.date === date)
            return [new Date(date).getTime(), entry ? entry.milkLiters || 0 : 0]
          })
          return { name: groupName, color, data }
        })

        let isCombinedMock = false
        if (combinedSeries.length === 0 || combinedSeries.every(s => s.data.every(([_, v]) => v === 0))) {
          // Generate mock series
          combinedSeries = [
            { name: 'Grupo 1', color: colors[0], data: generateMockGroupData(model, [50, 150]).map(d => [new Date(d.date).getTime(), d.milkLiters]) },
            { name: 'Grupo 2', color: colors[1], data: generateMockGroupData(model, [30, 100]).map(d => [new Date(d.date).getTime(), d.milkLiters]) }
          ]
          isCombinedMock = true
        }

        let combinedTitle = 'Combinado'
        if (isCombinedMock) {
          combinedTitle += ' (Mock)'
        }

        const latestDate = sortedDates.length > 0 ? new Date(sortedDates[sortedDates.length - 1]) : new Date()
        const combinedTab = {
          title: combinedTitle,
          chartData: combinedSeries,
          lastRecord: {
            date: latestDate.toISOString(),
            value: combinedSeries.reduce((sum, s) => sum + (s.data[s.data.length - 1]?.[1] || 0), 0),
            description: 'Último registro'
          },
          kpis: [],
          yTitle: 'Litros'
        }
        tabs.push(combinedTab)
 
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
          name: `${g.name}`,
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
          name: `${g.name}`,
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
          name: `${g.name}`,
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

      } catch (err) {
        tabs = []
      }
      return { tabs, kpisData }
    }
  },
  population_dynamics: {
    apiFunc: getFarmPopulationDynamics,
    valueKey: 'total_population',
    process: async (data, additionalData, entityId, signal) => {
      const { calculateKPIsForTheme } = useKPIService()
      let populationData = data

      // Generate mock data if no real data
      if (!populationData || populationData.length === 0) {
        populationData = generateMockPopulationData()
      }

      // Create tabs for different metrics
      const tabs = []

      // Población Total tab
      const totalPopulationChartData = transformDataToChartFormat(populationData, 'total_population')
      totalPopulationChartData.name = 'Población Total'
      const lastTotalRecord = {
        date: totalPopulationChartData.lastRecordDate ? totalPopulationChartData.lastRecordDate.toISOString() : new Date().toISOString(),
        value: totalPopulationChartData.values[totalPopulationChartData.values.length - 1] || 0,
        description: 'Población actual'
      }
      tabs.push({
        title: 'Población Total',
        chartData: totalPopulationChartData,
        lastRecord: lastTotalRecord,
        yTitle: 'Número de Animales'
      })

      // Nacimientos tab
      const birthsChartData = transformDataToChartFormat(populationData, 'births')
      birthsChartData.name = 'Nacimientos'
      const lastBirthsRecord = {
        date: birthsChartData.lastRecordDate ? birthsChartData.lastRecordDate.toISOString() : new Date().toISOString(),
        value: birthsChartData.values[birthsChartData.values.length - 1] || 0,
        description: 'Últimos nacimientos'
      }
      tabs.push({
        title: 'Nacimientos',
        chartData: birthsChartData,
        lastRecord: lastBirthsRecord,
        yTitle: 'Nacimientos'
      })

      // Muertes tab
      const deathsChartData = transformDataToChartFormat(populationData, 'deaths')
      deathsChartData.name = 'Muertes'
      const lastDeathsRecord = {
        date: deathsChartData.lastRecordDate ? deathsChartData.lastRecordDate.toISOString() : new Date().toISOString(),
        value: deathsChartData.values[deathsChartData.values.length - 1] || 0,
        description: 'Últimas muertes'
      }
      tabs.push({
        title: 'Muertes',
        chartData: deathsChartData,
        lastRecord: lastDeathsRecord,
        yTitle: 'Muertes'
      })

      // Entradas/Salidas tab (stacked chart with entries and exits)
      const sortedPopulationData = populationData.sort((a, b) => new Date(a.date) - new Date(b.date))
      const colors = ['#36A2EB', '#FF6384'] // Blue for entries, red for exits

      const entriesSeries = {
        name: 'Entradas',
        color: colors[0],
        data: sortedPopulationData.map(d => [new Date(d.date).getTime(), d.entries || 0])
      }
      const exitsSeries = {
        name: 'Salidas',
        color: colors[1],
        data: sortedPopulationData.map(d => [new Date(d.date).getTime(), d.exits || 0])
      }
      const combinedSeries = [entriesSeries, exitsSeries]

      const latestDate = sortedPopulationData.length > 0 ? new Date(sortedPopulationData[sortedPopulationData.length - 1].date) : new Date()
      const lastEntries = sortedPopulationData.length > 0 ? sortedPopulationData[sortedPopulationData.length - 1].entries || 0 : 0
      const lastExits = sortedPopulationData.length > 0 ? sortedPopulationData[sortedPopulationData.length - 1].exits || 0 : 0

      tabs.push({
        title: 'Entradas/Salidas',
        chartData: combinedSeries,
        lastRecord: {
          date: latestDate.toISOString(),
          value: lastEntries - lastExits,
          description: `Entradas: ${lastEntries}, Salidas: ${lastExits}`
        },
        yTitle: 'Cantidad'
      })

      // Calculate KPIs
      const kpisData = calculateKPIsForTheme('population_dynamics', null, null, populationData)

      return { tabs, kpisData }
    }
  }
  // Add other themes as needed
}

class ThemeOrchestrator {
  constructor() {
    this.configs = themeDefinitions
    this.cache = new Map()
    this.cacheTTL = 5 * 60 * 1000 // 5 minutes
  }

  async cachedApiCall(apiFunc, ...args) {
    const isSignal = args.length > 0 && args[args.length - 1] instanceof AbortSignal
    const keyArgs = isSignal ? args.slice(0, -1) : args
    const key = apiFunc.name + '_' + keyArgs.map(arg => String(arg)).join('_')

    if (this.cache.has(key)) {
      const cached = this.cache.get(key)
      if (cached.expires > Date.now()) {
        return cached.data
      } else {
        this.cache.delete(key)
      }
    }

    const promise = apiFunc(...args)
    this.cache.set(key, { data: promise, expires: Date.now() + this.cacheTTL })

    try {
      const result = await promise
      this.cache.set(key, { data: result, expires: Date.now() + this.cacheTTL })
      return result
    } catch (e) {
      this.cache.delete(key)
      throw e
    }
  }

  async generateThemeData(themeName, entityId, type, signal, groupId = null) {
    const config = this.configs[themeName]
    if (!config) {
      // Fallback for simulated themes
      return this.createMockThemeData(themeName)
    }

    const theme = themeDisplayNames[themeName] || themeName
    const dateRangeStore = useDateRangeStore()

    // Fetch main data
    let data = null
    if (config.apiFunc && type === 'farm') {
      if (themeName === 'group_production') {
        const response = await this.cachedApiCall(config.apiFunc, entityId)
        data = response.data.data
      } else {
        const params = {
          entityId: entityId.toString(),
          dateRange: {
            from: dateRangeStore.startDate,
            to: dateRangeStore.endDate
          }
        }
        const response = await this.cachedApiCall(config.apiFunc, params.entityId, params.dateRange.from, params.dateRange.to, signal)
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
          const response = await this.cachedApiCall(apiFunc, entityId, dateRangeStore.startDate, dateRangeStore.endDate, signal)
          additionalData[key] = response.data.data
        } catch (err) {
          additionalData[key] = null
        }
      }
    }

    // Process data
    const { tabs, kpisData } = await config.process.call(this, data, additionalData, entityId, signal, groupId)

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
    const mockData = generateMockGroupData({ date: '', value: 0 }, [0, 100])
    const chartData = transformDataToChartFormat(mockData, 'value')
    const lastRecord = {
      date: chartData.lastRecordDate ? chartData.lastRecordDate.toISOString() : new Date().toISOString(),
      value: chartData.values[chartData.values.length - 1] || 0,
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
    let kpisData = calculateKPIsForTheme(themeName, null, null, mockData)

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