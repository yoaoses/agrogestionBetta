import { useDateRangeStore } from '../stores/dateRange.js'
import { getGroups, getGroupMilkProduction } from '../api/api.js'

// Función para convertir datos de API a ChartData con propiedad configurable
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

export async function generateGroupProductionTheme(entityId) {
  const dateRangeStore = useDateRangeStore()
  const theme = 'Producción por Grupos'
  let tabs = []
  let kpisData = []

  console.log('Construyendo tema de producción por grupos')

  try {
    // Obtener grupos
    const groupsResponse = await getGroups(entityId)

    // Ajustar lógica para manejar si data es el array o si la respuesta completa es el array
    let groupsData = groupsResponse.data?.data || [];
    const groups = groupsData.filter(g => ['descarte', 'estanque', 'combinado'].includes(g.productionType))

    console.log('Grupos filtrados:', groups)

    // Obtener producciones para cada grupo
    const productions = await Promise.all(groups.map(g => getGroupMilkProduction(g.id, dateRangeStore.startDate, dateRangeStore.endDate)))

    // Agrupar producciones por tipo
    const aggregatedByType = {
      descarte: {},
      estanque: {},
      combinado: {}
    }

    groups.forEach((g, index) => {
      const prodData = productions[index].data.data.dailyStatistics
      const type = g.productionType
      prodData.forEach(d => {
        const date = d.date
        if (!aggregatedByType[type][date]) aggregatedByType[type][date] = 0
        aggregatedByType[type][date] += d.milkLiters || 0
      })
    })

    // Crear tabs para cada tipo
    const types = ['estanque', 'descarte', 'combinado']
    tabs = types.map(type => {
      let datasets = []
      let lastRecord = null

      if (type === 'combinado') {
        // Para combinado, crear barras apiladas con Estanque y Descarte
        // Recopilar todas las fechas únicas de estanque y descarte
        const allDates = new Set([...Object.keys(aggregatedByType['estanque']), ...Object.keys(aggregatedByType['descarte'])])
        const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b))

        // Crear labels comunes
        const labels = sortedDates.map(date => {
          const d = new Date(date)
          const dd = String(d.getDate()).padStart(2, '0')
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
          const mm = monthNames[d.getMonth()]
          const yyyy = String(d.getFullYear())
          return `${dd}-${mm}-${yyyy}`
        })

        // Valores para Estanque
        const estanqueValues = sortedDates.map(date => aggregatedByType['estanque'][date] || 0)
        // Valores para Descarte
        let descarteValues = sortedDates.map(date => aggregatedByType['descarte'][date] || 0)
        let descarteName = 'Descarte'

        // Si no hay datos reales para descarte, generar mock basados en estanque * 0.1 y cambiar nombre a 'Descarte Mock-data'
        const hasRealDescarteData = Object.keys(aggregatedByType['descarte']).length > 0 && descarteValues.some(v => v > 0)
        if (!hasRealDescarteData) {
          descarteValues = estanqueValues.map(v => v * 0.1)
          descarteName = 'Descarte Mock-data'
        }

        datasets = [
          { name: 'Estanque', labels, values: estanqueValues },
          { name: descarteName, labels, values: descarteValues }
        ]

        // Último registro basado en la última fecha
        const lastDate = sortedDates[sortedDates.length - 1]
        const lastValue = (aggregatedByType['estanque'][lastDate] || 0) + (aggregatedByType['descarte'][lastDate] || 0)
        lastRecord = {
          date: lastDate || new Date().toISOString(),
          value: lastValue,
          description: 'Último registro combinado'
        }
      } else {
        const data = Object.keys(aggregatedByType[type]).map(date => ({ date, milkLiters: aggregatedByType[type][date] })).sort((a, b) => new Date(a.date) - new Date(b.date))
        const chartData = convertToChartData(data, 'milkLiters')
        let title = type.charAt(0).toUpperCase() + type.slice(1)
        let name = type.charAt(0).toUpperCase() + type.slice(1)
        if (type === 'descarte' && chartData.values.length === 0) {
          title = 'Mock Data'
          name = 'Descarte Mock-data'
        }
        datasets = [{ name: name, labels: chartData.labels, values: chartData.values }]
        lastRecord = {
          date: chartData.lastRecordDate ? chartData.lastRecordDate.toISOString() : new Date().toISOString(),
          value: chartData.values[chartData.values.length - 1] || 0,
          description: 'Último registro'
        }
      }

      return {
        title: type.charAt(0).toUpperCase() + type.slice(1),
        chartData: datasets,
        lastRecord
      }
    })

    console.log('Tabs resultantes:', tabs)
  } catch (err) {
    console.error('Error in group_production:', err)
    tabs = []
    kpisData = []
  }

  return { theme, tabs, kpisData }
}