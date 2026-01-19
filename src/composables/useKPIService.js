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
      icon: 'fa-tint'
    },
    {
      name: 'Promedio Diario',
      value: Math.round(avgMilk),
      expected: TARGETS.avgMilk,
      unit: 'L/día',
      desc: 'Producción promedio de leche por día.',
      icon: 'fa-calendar-day'
    },
    {
      name: 'Total Nacimientos',
      value: Math.round(totalBirths),
      expected: TARGETS.totalBirths,
      unit: '',
      desc: 'Número total de nacimientos en el período.',
      icon: 'fa-baby'
    },
    {
      name: 'Tasa Natalidad',
      value: Math.round(birthRate),
      expected: TARGETS.birthRate,
      unit: '/mes',
      desc: 'Tasa de nacimientos mensual.',
      icon: 'fa-chart-line'
    },
    {
      name: 'Leche por Nacimiento',
      value: Math.round(milkPerBirth),
      expected: TARGETS.milkPerBirth,
      unit: 'L',
      desc: 'Litros de leche producidos por nacimiento (menor es mejor eficiencia).',
      icon: 'fa-balance-scale'
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
  // Agregar otros temas aquí
  'default': calculateGenericKPIs
}

export function useKPIService() {
  const calculateKPIsForTheme = (theme, milkData, birthsData, data) => {
    const calculator = kpiCalculators[theme] || kpiCalculators.default
    if (theme === 'milk_production') {
      return calculator(milkData, birthsData)
    } else {
      return calculator(data)
    }
  }

  return {
    calculateKPIsForTheme
  }
}