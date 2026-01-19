<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Highcharts from 'highcharts/highstock'

const props = defineProps({
  data: [Object, Array],
  title: String,
  yTitle: String
})

const chartRef = ref(null)
const chartInstance = ref(null)

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  if (isNaN(date)) return dateStr
  const day = date.getDate().toString().padStart(2, '0')
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear().toString().slice(-2)
  return `${day}/${month}/${year}`
}

const parseSpanishDate = (dateStr) => {
  // Map Spanish months to English
  const spanishToEnglish = {
    'ene': 'Jan',
    'feb': 'Feb',
    'mar': 'Mar',
    'abr': 'Apr',
    'may': 'May',
    'jun': 'Jun',
    'jul': 'Jul',
    'ago': 'Aug',
    'sep': 'Sep',
    'oct': 'Oct',
    'nov': 'Nov',
    'dic': 'Dec'
  }
  // Replace Spanish month with English
  let englishStr = dateStr
  for (const [spa, eng] of Object.entries(spanishToEnglish)) {
    englishStr = englishStr.replace(new RegExp(spa, 'i'), eng)
  }
  return new Date(englishStr)
}

// Convertir datos para series de tiempo
const convertToTimeSeriesData = (dataset) => {
  if (!dataset || !dataset.labels || !dataset.values || dataset.labels.length === 0 || dataset.values.length === 0) {
    // Crear datos de prueba para series de tiempo (2 años diarios)
    const now = new Date()
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
    const dataPoints = []
    for (let d = new Date(twoYearsAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const value = Math.random() * 100 + 50 // Valores aleatorios entre 50-150
      dataPoints.push([d.getTime(), value])
    }
    return dataPoints
  }
  const minLength = Math.min(dataset.labels.length, dataset.values.length)
  const timeSeries = []
  for (let i = 0; i < minLength; i++) {
    const label = dataset.labels[i]
    const value = parseFloat(dataset.values[i])
    if (isNaN(value)) continue // skip invalid values
    let timestamp
    if (typeof label === 'string') {
      const parsed = parseSpanishDate(label)
      if (!isNaN(parsed)) {
        timestamp = parsed.getTime()
      } else {
        timestamp = new Date() - (minLength - i) * 24 * 60 * 60 * 1000
      }
    } else if (typeof label === 'number') {
      timestamp = label
    } else {
      timestamp = new Date() - (minLength - i) * 24 * 60 * 60 * 1000
    }
    timeSeries.push([timestamp, value])
  }
  return timeSeries
}

const chartOptions = computed(() => {
    const datasets = Array.isArray(props.data) ? props.data : [props.data]

    const options = {
      chart: {
        type: 'column',
        zoomType: 'x',
        height: 350
      },
      accessibility: {
        enabled: false
      },
      title: { text: null },
      rangeSelector: {
        selected: 1,
        inputEnabled: false,
        buttonTheme: {
          fill: '#f2f2f2',
          stroke: '#bfc8d1',
          'stroke-width': 1,
          r: 7
        },
        buttons: [{
          type: 'month',
          count: 1,
          text: '1m'
        }, {
          type: 'month',
          count: 3,
          text: '3m'
        }, {
          type: 'month',
          count: 6,
          text: '6m'
        }, {
          type: 'ytd',
          text: 'YTD'
        }, {
          type: 'year',
          count: 1,
          text: '1y'
        }, {
          type: 'all',
          text: 'All'
        }]
      },
      navigator: {
        enabled: true,
        height: 40,
        maskFill: 'rgba(102,133,194,0.3)',
        series: {
          type: 'column',
          color: '#bfc8d1'
        },
        xAxis: {
          gridLineWidth: 0
        }
      },
      legend: { enabled: true },
      plotOptions: {
        column: {
        }
      },
      xAxis: {
        type: 'datetime',
        title: { text: 'Fecha' }
      },
      yAxis: {
        title: { text: props.yTitle },
        maxPadding: 0.1,
        opposite: false,
        tickAmount: 4
      },
      series: datasets.map(dataset => ({
        name: dataset.name || props.yTitle,
        data: convertToTimeSeriesData(dataset),
        dataGrouping: {
          enabled: true,
          units: [['day', [1]], ['week', [1]], ['month', [1, 3, 6]]]
        }
      })),
      tooltip: {
        xDateFormat: '%d/%m/%Y'
      }
    }

    return options
})

const createChart = () => {
  if (!chartRef.value) return
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  try {
    chartInstance.value = Highcharts.stockChart(chartRef.value, chartOptions.value)
  } catch (error) {
    console.error('Error creating chart:', error)
  }
}

onMounted(() => {
   nextTick(() => {
     createChart()
   })
   const resizeHandler = () => {
     if (chartInstance.value) {
       chartInstance.value.reflow()
     }
   }
   window.addEventListener('resize', resizeHandler)

   onUnmounted(() => {
     window.removeEventListener('resize', resizeHandler)
     if (chartInstance.value) {
       chartInstance.value.destroy()
     }
   })
})

watch([() => props.data, () => props.title, () => props.yTitle], () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

</script>

<style scoped>
.chart {
   position: relative;
   width: 100%;
   height: 100%;
   border-radius: 8px;
   overflow: hidden;
}
</style>
