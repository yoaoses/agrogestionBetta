import { useDateRangeStore } from '../stores/dateRange.js'
import { getGroupMilkProduction, getFarmGroups } from '../api/api.js'

// Función para generar datos mock si no hay datos del endpoint
const generateMockData = () => {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push({ date: date.toISOString().split('T')[0], milkLiters: Math.floor(Math.random() * 100) + 50 })
  }
  return dates
}

// Función para convertir datos de API a ChartData con propiedad configurable
const convertToChartData = (data, valueKey = 'value') => {
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

export async function generateGroupProductionTheme(entityId) {
  const dateRangeStore = useDateRangeStore()
  const theme = 'Producción por Grupos'
  let tabs = []
  let kpisData = []

  try {
    // Obtener grupos
    const groups = await getFarmGroups(entityId)
    console.log('Grupos obtenidos:', groups)
    console.log('groups.data:', groups.data)
    console.log('Proceso de filtrado: filtrando grupos con productionType estanque o descarte')
    const filteredGroups = groups.data.data.filter(g => ['estanque', 'descarte'].includes(g.productionType))
    console.log('Grupos filtrados:', filteredGroups)

    // Obtener producciones para cada grupo
    const productions = await Promise.all(filteredGroups.map(g => getGroupMilkProduction(g.id, dateRangeStore.startDate, dateRangeStore.endDate)))

    // Agrupar producciones por tipo
    const aggregatedByType = {
      estanque: {},
      descarte: {}
    }

    filteredGroups.forEach((g, index) => {
      const prodData = productions[index].data.data.dailyStatistics
      const type = g.productionType
      prodData.forEach(d => {
        const date = d.date
        if (!aggregatedByType[type][date]) aggregatedByType[type][date] = 0
        aggregatedByType[type][date] += d.milkLiters || 0
      })
    })

    // Crear tabs para cada tipo
    const types = ['estanque', 'descarte']
    tabs = types.map(type => {
      let data = Object.keys(aggregatedByType[type]).map(date => ({ date, milkLiters: aggregatedByType[type][date] })).sort((a, b) => new Date(a.date) - new Date(b.date))
      let isMock = false
      if (data.length === 0) {
        data = generateMockData()
        isMock = true
      }
      const chartData = convertToChartData(data, 'milkLiters')
      let title = type.charAt(0).toUpperCase() + type.slice(1)
      let seriesName = chartData.name || type.charAt(0).toUpperCase() + type.slice(1)
      if (isMock) {
        title = `${type.charAt(0).toUpperCase() + type.slice(1)} (Mock)`
        seriesName = `${type.charAt(0).toUpperCase() + type.slice(1)} (Mock)`
      }
      const datasets = [{ name: seriesName, labels: chartData.labels, values: chartData.values, type: 'participation' }]
      const lastRecord = {
        date: chartData.lastRecordDate ? chartData.lastRecordDate.toISOString() : new Date().toISOString(),
        value: chartData.values[chartData.values.length - 1] || 0,
        description: 'Último registro'
      }

      return {
        title,
        chartData: datasets,
        lastRecord
      }
    })

    // Crear tab combinado
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
      combinedDataArray = generateMockData()
      isCombinedMock = true
    }
    const combinedChartData = convertToChartData(combinedDataArray, 'milkLiters')
    let combinedTitle = 'Combinado'
    if (isCombinedMock) {
      combinedTitle = 'Combinado (Mock)'
    }
    const combinedTab = {
      title: combinedTitle,
      chartData: [{ name: combinedTitle, labels: combinedChartData.labels, values: combinedChartData.values, type: 'participation' }],
      lastRecord: {
        date: combinedChartData.lastRecordDate ? combinedChartData.lastRecordDate.toISOString() : new Date().toISOString(),
        value: combinedChartData.values[combinedChartData.values.length - 1] || 0,
        description: 'Último registro'
      }
    }
    tabs.push(combinedTab)

  } catch (err) {
    console.error('Error in group_production:', err)
    tabs = []
    kpisData = []
  }

  return { theme, tabs, kpisData }
}