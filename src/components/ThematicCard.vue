<template>
  <div class="card thematic-card dashboard-section-row p-1 rounded" :class="{ 'fullscreen': mode === 'fullscreen' }" :id="`card-${index}`" ref="cardRef">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-container">
        <Loader :label="`Cargando datos de ${themeData.theme}... Calculando KPIs y métricas...`" />
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-text">{{ Math.round(progress) }}%</p>
        <!-- Checks para pasos -->
        <div class="loading-checks">
          <div class="check-item" :class="{ completed: progress >= 25 }">
            <i :class="progress >= 25 ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
            <span>Cargando datos</span>
          </div>
          <div class="check-item" :class="{ completed: progress >= 50 }">
            <i :class="progress >= 50 ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
            <span>Procesando métricas</span>
          </div>
          <div class="check-item" :class="{ completed: progress >= 75 }">
            <i :class="progress >= 75 ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
            <span>Calculando KPIs</span>
          </div>
          <div class="check-item" :class="{ completed: progress >= 100 }">
            <i :class="progress >= 100 ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
            <span>Finalizando</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="componentError || themeData.error" class="error-section">
      <div class="alert alert-danger" role="alert">
        <h5 class="alert-heading">Error en el tema {{ themeData.theme }}</h5>
        <p>{{ componentError || 'No se pudieron cargar los datos de este tema.' }}</p>
      </div>
    </div>
    <div v-if="!loading && !componentError && !themeData.error" class="card-header d-flex justify-content-between align-items-center">
      <h3 class="theme-title">{{ themeData.theme }}</h3>
      <div class="btn-group">
        <button
          v-for="(tab, index) in themeData.tabs"
          :key="index"
          @click="setActiveTab(index)"
          :class="{ 'btn': true, 'btn-outline-sm': true, 'active': props.activeTab === index }"
        >
          {{ tab.title }}
        </button>
      </div>
    </div>
    <div v-if="!loading && !componentError && !themeData.error" class="card-body">
      <div class="card-body-content" :class="{ 'fullscreen': mode === 'fullscreen' }">
        <div class="charts-column">
          <div class="charts-section">
            <StatsChart
              :data="themeData.tabs[props.activeTab]?.chartData"
              :title="themeData.tabs[props.activeTab]?.title"
              :yTitle="themeData.tabs[props.activeTab]?.yTitle || 'Valor'"
              :mode="mode"
              :height="mode === 'fullscreen' ? fullscreenHeight : contentHeight"
            />
          </div>
        </div>
        <div class="kpis-column">
          <div class="data-placeholder">
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
      </div>
    </div>
    <div class="card-footer">
      <p>Último registro válido: {{ getLastRecord() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onErrorCaptured, onUnmounted, watch, computed } from 'vue'
import StatsChart from './StatsChart.vue'
import Loader from './Loader.vue'
import { useDynamicHeights } from '../composables/useDynamicHeights.js'

const emit = defineEmits(['update:activeTab'])

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
  },
  mode: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'fullscreen'].includes(value)
  },
  activeTab: {
    type: Number,
    default: 0
  }
})

const cardRef = ref(null)
const componentError = ref(null)

const { contentHeight, fullscreenHeight } = useDynamicHeights()

watch(() => props.mode, (newVal) => {
  console.log('ThematicCard - Watcher mode - Cambio a:', newVal);
  if (cardRef.value) {
    console.log('ThematicCard - Card - offsetHeight:', cardRef.value.offsetHeight, 'clientHeight:', cardRef.value.clientHeight, 'scrollHeight:', cardRef.value.scrollHeight);
  }
  const chartsSection = cardRef.value?.querySelector('.charts-section');
  if (chartsSection) {
    console.log('ThematicCard - Charts section - offsetHeight:', chartsSection.offsetHeight, 'clientHeight:', chartsSection.clientHeight);
  }
  const kpisColumn = cardRef.value?.querySelector('.kpis-column');
  if (kpisColumn) {
    console.log('ThematicCard - KPIs column - offsetHeight:', kpisColumn.offsetHeight, 'clientHeight:', kpisColumn.clientHeight);
  }
  nextTick(() => {
    window.dispatchEvent(new Event('resize'))
  })
})

const setActiveTab = (index) => {
  emit('update:activeTab', index)
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

<style scoped>
.thematic-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding-top: 200px;
}

.spinner-container {
  text-align: center;
  max-width: 400px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background: var(--agrotech-green);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: bold;
  color: var(--agrotech-green);
  margin-bottom: 1rem;
}

.loading-checks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.check-item.completed {
  opacity: 1;
}

.check-item i {
  font-size: 1.2rem;
}

.check-item.completed i {
  color: var(--agrotech-green);
}

.card-header {
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-body-content {
  flex: 1;
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 1rem;
}

.card-body-content.fullscreen {
  grid-template-columns: 5fr 1fr;
}

.charts-column {
  display: flex;
  flex-direction: column;
}

.charts-section {
  flex: 1;
  min-height: 0;
}

.kpis-column {
  display: flex;
  flex-direction: column;
}

.data-placeholder {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.card-footer {
  flex-shrink: 0;
}

.thematic-card.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  background: var(--bs-body-bg) !important;
}
</style>
