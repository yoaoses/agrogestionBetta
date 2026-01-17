<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Highcharts from 'highcharts/highstock'

const props = defineProps({
  data: [Object, Array],
  title: String,
  yTitle: String
})

const chartRef = ref(null)
const chartInstance = ref(null)

watch([() => props.data, () => props.title, () => props.yTitle], () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  if (chartRef.value) {
    chartInstance.value = Highcharts.chart(chartRef.value, chartOptions.value)
  }
}, { deep: true })

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
  if (!dataset || !dataset.labels || !dataset.values || dataset.labels.length === 0) {
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
  // Intentar parsear labels como fechas
  const timeSeries = dataset.labels.map((label, index) => {
    let timestamp
    if (typeof label === 'string') {
      const parsed = parseSpanishDate(label)
      if (!isNaN(parsed)) {
        timestamp = parsed.getTime()
      } else {
        // Si no se puede parsear, usar índice
        timestamp = new Date() - (dataset.labels.length - index) * 24 * 60 * 60 * 1000
      }
    } else if (typeof label === 'number') {
      timestamp = label
    } else {
      timestamp = new Date() - (dataset.labels.length - index) * 24 * 60 * 60 * 1000
    }
    return [timestamp, dataset.values[index]]
  })
  return timeSeries
}

const chartOptions = computed(() => {
    const datasets = Array.isArray(props.data) ? props.data : [props.data]

    const options = {
      chart: {
        type: 'column',
        zoomType: 'x',
        responsive: true,
        maintainAspectRatio: false,
        zooming: {
          mouseWheel: {
            enabled: true
          }
        },
        resetZoomButton: {
          theme: {
            display: 'none'
          }
        }
      },
      accessibility: {
        enabled: false
      },
      title: { text: null },
      legend: { enabled: true },
      plotOptions: {
        column: {
          stacking: 'normal'
        }
      },
      xAxis: {
        type: 'datetime',
        title: { text: 'Fecha' }
      },
      yAxis: {
        title: { text: props.yTitle },
        maxPadding: 0.1
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

// Agregar listener de resize para redimensionar el gráfico
onMounted(() => {
   if (chartRef.value) {
     chartInstance.value = Highcharts.chart(chartRef.value, chartOptions.value)
   }
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

</script>

<style scoped>
.chart {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
}
</style>
