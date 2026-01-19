<template>
  <div class="thematic-card dashboard-section-row p-1 rounded" :id="`card-${index}`" ref="cardRef">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-container">
        <Loader :label="`Cargando datos de ${themeData.theme}... Calculando KPIs y métricas...`" />
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-text">{{ Math.round(progress) }}%</p>
      </div>
    </div>
    <div v-else-if="componentError || themeData.error" class="error-section">
      <div class="alert alert-danger" role="alert">
        <h5 class="alert-heading">Error en el tema {{ themeData.theme }}</h5>
        <p>{{ componentError || 'No se pudieron cargar los datos de este tema.' }}</p>
      </div>
    </div>
    <div v-if="!loading && !componentError && !themeData.error" class="header d-flex justify-content-between align-items-center">
      <h3 class="theme-title">{{ themeData.theme }}</h3>
      <div class="btn-group">
        <button
          v-for="(tab, index) in themeData.tabs"
          :key="index"
          @click="setActiveTab(index)"
          :class="{ 'btn': true, 'btn-outline-sm': true, 'active': activeTab === index }"
        >
          {{ tab.title }}
        </button>
      </div>
    </div>
    <div v-if="!loading && !componentError && !themeData.error" class="content-wrapper" ref="contentWrapperRef">
          <div class="charts-section" ref="chartsSectionRef" style="min-height: 100px;">
            <StatsChart
              :data="themeData.tabs[activeTab]?.chartData"
              :title="themeData.tabs[activeTab]?.title"
              :yTitle="themeData.tabs[activeTab]?.yTitle || 'Valor'"
            />
          </div>
      <div class="data-placeholder" ref="dataPlaceholderRef">
        <div class="dynamic-content">
          <div v-if="themeData.kpisData && themeData.kpisData.length > 0" class="kpis-section">
            <div v-for="kpi in themeData.kpisData" :key="kpi.name" class="kpi-card">
              <div class="kpi-content">
                <div class="kpi-header">
                  <i :class="`fas ${kpi.icon}`" class="kpi-icon"></i>
                  <i class="bi bi-info-circle kpi-info-icon" :title="kpi.desc"></i>
                  <span class="kpi-name">{{ kpi.name }}</span>
                </div>
                <div class="kpi-value">
                  {{ kpi.value }} {{ kpi.unit }}
                </div>
              </div>
              <div class="kpi-efficiency">
                <div class="efficiency-circle">
                  <svg width="40" height="40">
                    <circle cx="20" cy="20" r="16" stroke="#e9ecef" stroke-width="3" fill="none" />
                    <circle cx="20" cy="20" r="16" stroke="#00C853" stroke-width="3" fill="none" stroke-dasharray="100.5" :stroke-dashoffset="100.5 - (100.5 * Math.min(100, (kpi.value / kpi.expected) * 100) / 100)" transform="rotate(-90 20 20)" />
                  </svg>
                  <div class="efficiency-text">{{ Math.round(Math.min(100, (kpi.value / kpi.expected) * 100)) }}%</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No hay KPIs disponibles</p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer" ref="footerRef">
      <p>Último registro válido: {{ getLastRecord() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onErrorCaptured } from 'vue'
import StatsChart from './StatsChart.vue'
import Loader from './Loader.vue'

const props = defineProps({
  themeData: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  }
})

const cardRef = ref(null)
const contentWrapperRef = ref(null)
const chartsSectionRef = ref(null)
const dataPlaceholderRef = ref(null)
const footerRef = ref(null)
const activeTab = ref(0)
const componentError = ref(null)

const setActiveTab = (index) => {
  activeTab.value = index
}

onErrorCaptured((err, instance, info) => {
  console.error('Error in ThematicCard:', err, info)
  componentError.value = `Error al renderizar el tema: ${err.message}`
  return false // Prevent the error from propagating
})

onMounted(() => {
    nextTick(() => {
      window.dispatchEvent(new Event('resize'))
    })
    nextTick(() => {
      // Log dimensions of thematic-card, content-wrapper, charts-section, data-placeholder, and chart div
      if (cardRef.value) {
        const rect = cardRef.value.getBoundingClientRect()
        console.log('thematic-card dimensions:', { width: rect.width, height: rect.height })
      }
      if (contentWrapperRef.value) {
        const rect = contentWrapperRef.value.getBoundingClientRect()
        console.log('content-wrapper dimensions:', { width: rect.width, height: rect.height })
      }
      if (chartsSectionRef.value) {
        const rect = chartsSectionRef.value.getBoundingClientRect()
        console.log('charts-section dimensions:', { width: rect.width, height: rect.height })
      }
      if (dataPlaceholderRef.value) {
        const rect = dataPlaceholderRef.value.getBoundingClientRect()
        console.log('data-placeholder dimensions:', { width: rect.width, height: rect.height })
      }
      // Log chart div dimensions
      const chartDiv = document.querySelector('.chart')
      if (chartDiv) {
        const rect = chartDiv.getBoundingClientRect()
        console.log('chart div dimensions:', { width: rect.width, height: rect.height })
      }
      if (footerRef.value) {
        const rect = footerRef.value.getBoundingClientRect()
        console.log('footer dimensions:', { width: rect.width, height: rect.height })
      }
    })
})

const getLastRecord = () => {
  if (props.themeData.tabs && props.themeData.tabs.length > 0) {
    const lastTab = props.themeData.tabs[props.themeData.tabs.length - 1]
    if (!lastTab.lastRecord || !lastTab.lastRecord.date) return 'N/A'
    const dateStr = lastTab.lastRecord.date
    const date = new Date(dateStr)
    if (isNaN(date)) return 'N/A'

    // Formatear fecha: dd-mes-yy
    const day = date.getDate().toString().padStart(2, '0')
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear().toString().slice(-2)
    const formattedDate = `${day}-${month}-${year}`

    // Calcular tiempo transcurrido
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMonths = Math.floor(diffDays / 30)

    let timeAgo = ''
    if (diffMonths > 0) {
      timeAgo = `hace ${diffMonths} meses`
    } else if (diffDays > 0) {
      timeAgo = `hace ${diffDays} días`
    } else if (diffHours > 0) {
      timeAgo = `hace ${diffHours} horas`
    } else {
      timeAgo = 'hace menos de una hora'
    }

    return `${formattedDate}, ${timeAgo}`
  }
  return 'N/A'
}
</script>

