import { ref } from 'vue'

// Targets (podrían ser configurables)
const TARGETS = {
  totalMilk: 20000, // L/mes
  avgMilk: 600, // L/día
  totalBirths: 60, // /mes
  birthRate: 50, // /mes
  milkPerBirth: 250 // L/nacimiento
}

// Función para calcular KPIs de producción de leche
function calculateMilkKPIs(milkData, birthsData) {
  if (!milkData || milkData.length === 0) return []

  const totalMilk = milkData.reduce((sum, d) => {
    return sum + (d.value || 0);
  }, 0)
  const days = new Set(milkData.map(d => d.date)).size || 1
  const avgMilk = totalMilk / days
  const totalBirths = birthsData ? birthsData.reduce((sum, d) => {
    return sum + (d.value || 0);
  }, 0) : 0
  const birthRate = (totalBirths / days) * 30 // mensual
  const milkPerBirth = totalBirths > 0 ? totalMilk / totalBirths : 0

  return [
    {
      name: 'Producción Total',
      value: Math.round(totalMilk),
      expected: TARGETS.totalMilk,
      unit: 'L',
      desc: 'Suma total de leche producida en el período seleccionado.',
      icon: 'fa-tint',
      type: 'efficiency'
    },
    {
      name: 'Promedio Diario',
      value: Math.round(avgMilk),
      expected: TARGETS.avgMilk,
      unit: 'L/día',
      desc: 'Producción promedio de leche por día.',
      icon: 'fa-calendar-day',
      type: 'efficiency'
    },
    {
      name: 'Total Nacimientos',
      value: Math.round(totalBirths),
      expected: TARGETS.totalBirths,
      unit: '',
      desc: 'Número total de nacimientos en el período.',
      icon: 'fa-baby',
      type: 'efficiency'
    },
    {
      name: 'Tasa Natalidad',
      value: Math.round(birthRate),
      expected: TARGETS.birthRate,
      unit: '/mes',
      desc: 'Tasa de nacimientos mensual.',
      icon: 'fa-chart-line',
      type: 'efficiency'
    },
    {
      name: 'Leche por Nacimiento',
      value: Math.round(milkPerBirth),
      expected: TARGETS.milkPerBirth,
      unit: 'L',
      desc: 'Litros de leche producidos por nacimiento (menor es mejor eficiencia).',
      icon: 'fa-balance-scale',
      type: 'efficiency'
    }
  ]
}

// Función para calcular KPIs de dinámicas poblacionales
function calculatePopulationKPIs(populationData) {
  if (!populationData || populationData.length === 0) return []

  const totalBirths = populationData.reduce((sum, d) => sum + (d.births || 0), 0)
  const totalDeaths = populationData.reduce((sum, d) => sum + (d.deaths || 0), 0)
  const totalEntries = populationData.reduce((sum, d) => sum + (d.entries || 0), 0)
  const totalExits = populationData.reduce((sum, d) => sum + (d.exits || 0), 0)
  const avgPopulation = populationData.reduce((sum, d) => sum + (d.total_population || 0), 0) / populationData.length

  // Tasa de Natalidad: (Nacimientos / Población Total) * 100
  const birthRate = avgPopulation > 0 ? (totalBirths / avgPopulation) * 100 : 0

  // Tasa de Mortalidad: (Muertes / Población Total) * 100
  const deathRate = avgPopulation > 0 ? (totalDeaths / avgPopulation) * 100 : 0

  // Crecimiento Diario: ((Nacimientos - Muertes + Entradas - Salidas) / Población Total) * 100
  const netGrowth = totalBirths - totalDeaths + totalEntries - totalExits
  const dailyGrowthRate = avgPopulation > 0 ? (netGrowth / avgPopulation) * 100 : 0

  // Eficiencia Reproductiva: Nacimientos / Población (simplificada)
  const reproductiveEfficiency = avgPopulation > 0 ? totalBirths / avgPopulation : 0

  return [
    {
      name: 'Tasa de Natalidad',
      value: Math.round(birthRate * 100) / 100,
      expected: 5.0, // target aproximado
      unit: '%',
      desc: 'Porcentaje de nacimientos respecto a la población total.',
      icon: 'fa-baby',
      type: 'efficiency'
    },
    {
      name: 'Tasa de Mortalidad',
      value: Math.round(deathRate * 100) / 100,
      expected: 2.0, // target aproximado
      unit: '%',
      desc: 'Porcentaje de muertes respecto a la población total.',
      icon: 'fa-skull-crossbones',
      type: 'efficiency'
    },
    {
      name: 'Crecimiento Diario',
      value: Math.round(dailyGrowthRate * 100) / 100,
      expected: 0.5, // target aproximado
      unit: '%',
      desc: 'Cambio porcentual diario en la población.',
      icon: 'fa-chart-line',
      type: 'efficiency'
    },
    {
      name: 'Eficiencia Reproductiva',
      value: Math.round(reproductiveEfficiency * 100) / 100,
      expected: 0.05, // target aproximado
      unit: '',
      desc: 'Nacimientos por animal (eficiencia reproductiva).',
      icon: 'fa-seedling',
      type: 'efficiency'
    }
  ]
}

// Función para calcular KPIs genéricos (para otros temas)
function calculateGenericKPIs(data) {
  if (!data || data.length === 0) return []

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0)
  const avg = total / data.length

  return [
    {
      name: 'Total',
      value: Math.round(total),
      expected: 1000, // target genérico
      unit: '',
      desc: 'Suma total de valores.',
      icon: 'fa-calculator'
    },
    {
      name: 'Promedio',
      value: Math.round(avg),
      expected: 50, // target genérico
      unit: '',
      desc: 'Valor promedio.',
      icon: 'fa-chart-bar'
    }
  ]
}

// Mapa de calculadores por tema
const kpiCalculators = {
  'milk_production': calculateMilkKPIs,
  'population_dynamics': calculatePopulationKPIs,
  // Agregar otros temas aquí
  'default': calculateGenericKPIs
}

export function useKPIService() {
  const calculateKPIsForTheme = (theme, milkData, birthsData, data) => {
    const calculator = kpiCalculators[theme] || kpiCalculators.default
    if (theme === 'milk_production') {
      return calculator(milkData, birthsData)
    } else if (theme === 'population_dynamics') {
      return calculator(data)
    } else {
      return calculator(data)
    }
  }

  return {
    calculateKPIsForTheme
  }
}