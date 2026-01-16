<template>
  <div v-if="!loading" class="header-section">
    <div class="row align-items-center">
      <div class="col">
        <h6>{{ themeData.theme }}</h6>
      </div>
      <div class="col-auto">
        <div class="btn-group" role="group" aria-label="Basic example">
          <button
            v-for="(tab, index) in themeData.tabs"
            :key="index"
            type="button"
            class="btn btn-outline-primary btn-sm"
            :class="{ active: activeTab === index }"
            @click="activeTab = index"
          >
            {{ tab.title }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="dashboard-section-row" :id="`card-${index}`" ref="cardRef">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-container">
        <DotsLoader />
        <p class="loading-text">Cargando datos de {{ themeData.theme }}...</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-text">{{ Math.round(progress) }}%</p>
      </div>
    </div>
    <div v-if="!loading" class="charts-section">
      <StatsChart
        v-show="activeTab === 0"
        :data="themeData.tabs[0]?.chartData"
        :title="themeData.tabs[0]?.title"
        :yTitle="themeData.tabs[0]?.yTitle || 'Valor'"
      />
      <StatsChart
        v-show="activeTab === 1"
        :data="themeData.tabs[1]?.chartData"
        :title="themeData.tabs[1]?.title"
        :yTitle="themeData.tabs[1]?.yTitle || 'Valor'"
      />
    </div>
    <div v-if="!loading" class="data-placeholder">
      <div class="dynamic-content">
        <div v-if="themeData.section2Data.type === 'participation'">
          <h4>Participación Farms/KPIs</h4>
          <div class="participation">
            <div v-for="item in themeData.section2Data.data" :key="item.farm || item.kpi" class="participation-item">
              <span class="item-name">{{ item.farm || item.kpi }}</span>
              <span class="item-value">{{ item.percent ? item.percent.toFixed(1) + '%' : item.value }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="themeData.section2Data.type === 'summary'">
          <h4>Resumen</h4>
          <div v-if="Array.isArray(themeData.section2Data.data)">
            <ul>
              <li v-for="item in themeData.section2Data.data" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div v-else>
            <p>{{ themeData.section2Data.data }}</p>
          </div>
        </div>
        <div v-else>
          <h4>{{ themeData.section2Data.type }}</h4>
          <pre>{{ JSON.stringify(themeData.section2Data.data, null, 2) }}</pre>
        </div>
      </div>
      <div class="footer">
        <p>Último registro válido: {{ getLastRecord() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import StatsChart from './StatsChart.vue'
import DotsLoader from './DotsLoader.vue'

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
const activeTab = ref(0)

onMounted(() => {
  nextTick(() => {
    window.dispatchEvent(new Event('resize'))
    console.log('Altura de la tarjeta:', cardRef.value.offsetHeight)
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
.dashboard-section-row {
   position: relative;
   display: grid;
   grid-template-columns: 2fr 1fr;
   gap: 0;
   margin-bottom: 0;
   min-height: 460px;
   max-height: 460px;
   padding: 0.25rem;
}

.header-section {
   padding: 5px;
}

.header-section h6 {
  margin: 0;
  padding: 8px 16px;
  border: none;
  background: none;
  border-bottom: 2px solid #0288D1;
  color: #0288D1;
  font-weight: normal;
  cursor: default;
}

.charts-section, .data-placeholder {
   padding: 5px;
}

.charts-section {
   position: relative;
   height: 100%;
}

.data-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dynamic-content {
  flex: 1;
}

.separator {
  width: 1px;
  background-color: #00C853;
  flex-shrink: 0;
}

.participation-section h4 {
  margin: 0 0 12px 0;
  color: #00C853;
}

.participation {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.participation-item {
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 4px solid #0288D1;
}

.item-name {
  font-weight: bold;
  font-size: 0.9em;
  color: #333;
}

.item-value {
  font-size: 1.1em;
  color: #00C853;
  font-weight: 600;
}

.footer {
  border-top: 2px solid #00C853;
  padding-top: 12px;
  font-size: 0.9em;
  color: #666;
}

.loading-overlay {
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: rgba(255, 255, 255, 0.9);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 10;
}

.spinner-container {
  text-align: center;
}

.loading-text {
  margin: 10px 0;
  font-size: 0.9em;
  color: #00C853;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
}

.progress-fill {
  height: 100%;
  background: #00C853;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 5px;
  font-size: 0.8em;
  color: #666;
}

/* No responsive height adjustments needed */
</style>