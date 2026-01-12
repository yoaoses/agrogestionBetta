<template>
  <div ref="chartContainer" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Highcharts from 'highcharts'

const props = defineProps({
  data: Object,
  title: String,
  yTitle: String
})

const chartContainer = ref(null)
let chart = null

onMounted(() => {
  chart = Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'bar',
      zoomType: 'x',
      panning: true,
      panKey: 'shift'
    },
    title: { text: props.title },
    xAxis: {
      categories: props.data.labels,
      title: { text: 'Fecha' },
      scrollbar: { enabled: true }
    },
    yAxis: {
      title: { text: props.yTitle }
    },
    series: [{
      name: props.yTitle,
      data: props.data.values
    }]
  })
})

watch(() => props.data, (newData) => {
  if (chart) {
    chart.xAxis[0].setCategories(newData.labels)
    chart.series[0].setData(newData.values)
  }
}, { deep: true })
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
