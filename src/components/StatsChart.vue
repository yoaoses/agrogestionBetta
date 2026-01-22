<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Highcharts from 'highcharts/highstock'
import { useChartZoomStore } from '../stores/chartZoom.js'

const props = defineProps({
  data: [Object, Array],
  title: String,
  yTitle: String,
  mode: String,
  height: Number
})

const chartZoomStore = useChartZoomStore()

const chartRef = ref(null)
const chartInstance = ref(null)

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

const calculateMaxValue = (datasets) => {
  console.log('calculateMaxValue - datasets:', datasets);
  let max = 0;
  datasets.forEach((dataset, index) => {
    console.log(`calculateMaxValue - dataset ${index}:`, dataset);
    if (dataset && dataset.data && Array.isArray(dataset.data)) {
      // Nuevo formato: data es array de [timestamp, value]
      dataset.data.forEach(point => {
        if (Array.isArray(point) && point.length >= 2) {
          const val = parseFloat(point[1]);
          if (!isNaN(val) && val > max) max = val;
        }
      });
    } else if (dataset && dataset.values) {
      // Formato antiguo: values array
      dataset.values.forEach(val => {
        const num = parseFloat(val);
        if (!isNaN(num) && num > max) max = num;
      });
    } else {
      console.warn('calculateMaxValue - dataset no tiene data ni values:', dataset);
    }
  });
  console.log('calculateMaxValue - max calculado:', max);
  return max;
}

// Convertir datos para series de tiempo
const convertToTimeSeriesData = (dataset) => {
  if (!dataset || !dataset.labels || !dataset.values || dataset.labels.length === 0 || dataset.values.length === 0) {
    // Crear datos de prueba para series de tiempo (2 años diarios) - Comentado para producción
    /*
    const now = new Date()
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
    const dataPoints = []
    for (let d = new Date(twoYearsAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const value = Math.random() * 100 + 50 // Valores aleatorios entre 50-150
      dataPoints.push([d.getTime(), value])
    }
    return dataPoints
    */
    return [] // Retornar array vacío si no hay datos
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

    const maxValue = calculateMaxValue(datasets);
    let tickInterval;
    if (maxValue > 100000) tickInterval = 25000;
    else if (maxValue > 10000) tickInterval = 5000;
    else if (maxValue > 1000) tickInterval = 1000;
    else tickInterval = undefined;

    const options = {
      chart: {
        type: 'column',
        zoomType: 'x'
      },
      accessibility: {
        enabled: false
      },
      title: { text: null },
      rangeSelector: {
        selected: chartZoomStore.currentZoomIndex,
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
        column: datasets.length > 1 ? { stacking: 'normal' } : {}
      },
      xAxis: {
        type: 'datetime',
        title: { text: 'Fecha' }
      },
      yAxis: {
        title: { text: props.yTitle },
        min: 0,
        maxPadding: 0.1,
        opposite: false,
        tickAmount: 4
      },
      series: datasets.map(dataset => {
        let data
        if (Array.isArray(dataset.data) && dataset.data.length > 0 && Array.isArray(dataset.data[0])) {
          // Already time series data
          data = dataset.data
        } else {
          data = convertToTimeSeriesData(dataset)
        }
        return {
          name: dataset.name || props.yTitle,
          color: dataset.color,
          data,
          dataGrouping: {
            enabled: true,
            units: [['day', [1]], ['week', [1]], ['month', [1, 3, 6]]]
          }
        }
      }),
      tooltip: {
        xDateFormat: '%d/%m/%Y'
      }
    }

    return options
})

const createChart = () => {
  console.log('createChart - chartRef exists:', !!chartRef.value)
  if (!chartRef.value) return
  if (chartInstance.value) {
    try {
      chartInstance.value.destroy()
      console.log('createChart - old chart destroyed')
    } catch (error) {
      console.error('createChart - Error destroying old chart:', error)
    }
  }
  try {
    chartInstance.value = Highcharts.stockChart(chartRef.value, chartOptions.value)
    console.log('createChart - new chart created, chartInstance exists:', !!chartInstance.value)
    // Add event listeners to rangeSelector buttons to update store on user clicks
    if (chartInstance.value && chartInstance.value.rangeSelector && chartInstance.value.rangeSelector.buttons) {
      chartInstance.value.rangeSelector.buttons.forEach((btn, idx) => {
        btn.element.addEventListener('click', () => chartZoomStore.setZoom(idx))
      })
    }
  } catch (error) {
    console.error('Error creating chart:', error)
    chartInstance.value = null // Reset on error
  }
}

onMounted(() => {
   nextTick(() => {
     createChart()
   })
   const resizeHandler = () => {
     // console.log('Window resize event fired, chartInstance exists:', !!chartInstance.value)
     if (chartInstance.value) {
       try {
         chartInstance.value.reflow()
       } catch (error) {
         console.error('Error in window resize reflow:', error)
       }
     }
   }
   window.addEventListener('resize', resizeHandler)

   // ResizeObserver for container size changes
   const resizeObserver = new ResizeObserver(() => {
     // console.log('StatsChart - ResizeObserver fired, chartInstance exists:', !!chartInstance.value)
     if (chartRef.value) {
       // console.log('StatsChart - ResizeObserver - Chart container - offsetHeight:', chartRef.value.offsetHeight, 'clientHeight:', chartRef.value.clientHeight, 'scrollHeight:', chartRef.value.scrollHeight)
     }
     if (chartInstance.value) {
       try {
         chartInstance.value.reflow()
       } catch (error) {
         console.error('Error in ResizeObserver reflow:', error)
       }
     }
   })
   if (chartRef.value) {
     resizeObserver.observe(chartRef.value)
   }

   onUnmounted(() => {
     console.log('StatsChart - onUnmounted - chartInstance exists:', !!chartInstance.value)
     window.removeEventListener('resize', resizeHandler)
     resizeObserver.disconnect()
     if (chartInstance.value) {
       try {
         chartInstance.value.destroy()
         console.log('StatsChart - chart destroyed successfully')
       } catch (error) {
         console.error('StatsChart - Error destroying chart:', error)
       }
     } else {
       console.warn('StatsChart - chartInstance is undefined during unmount')
     }
   })
})

watch([() => props.data, () => props.title, () => props.yTitle], () => {
   nextTick(() => {
     createChart()
   })
 }, { deep: true })

watch(() => props.mode, (newMode) => {
     // console.log('StatsChart - Watcher mode - Cambio a:', newMode, 'height:', props.height);
     if (chartRef.value) {
       // console.log('StatsChart - Chart container - offsetHeight:', chartRef.value.offsetHeight, 'clientHeight:', chartRef.value.clientHeight, 'scrollHeight:', chartRef.value.scrollHeight);
     }
     nextTick(() => {
       if (chartInstance.value) {
         chartInstance.value.setSize(null, parseInt(props.height))
         if (newMode === 'normal') {
           chartInstance.value.zoomOut()
           chartInstance.value.redraw()
         }
       }
     })
   })

watch(() => chartZoomStore.currentZoomIndex, (newIndex) => {
  if (chartInstance.value) {
    chartInstance.value.rangeSelector.clickButton(newIndex)
  }
})

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
