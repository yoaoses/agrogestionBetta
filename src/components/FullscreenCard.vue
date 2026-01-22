<template>
  <div class="fullscreen-card">
    <!-- Nav interno -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div class="container-fluid">
        <span class="navbar-brand fw-bold text-success">{{ dynamicTitle }}</span>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item" v-for="(theme, index) in themesData" :key="index">
              <a class="nav-link" :class="{ active: currentThemeIndex === index }" @click.prevent="setCurrentTheme(index)">
                <span v-if="cardLoadingStates.get(index)" class="nav-spinner">
                  <div class="spinner-border spinner-border-sm text-light" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                </span>
                {{ theme.theme }}
              </a>
            </li>
            <li class="nav-item">
              <button @click="$emit('exitFullscreen')" class="btn btn-link nav-link d-flex justify-content-center align-items-center" title="Salir de pantalla completa">
                <i class="bi bi-fullscreen-exit"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Loader overlay -->
    <div v-if="loading" class="fullscreen-loading-overlay">
      <div class="loading-content">
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

    <!-- Error section -->
    <div v-else-if="componentError || themeData.error" class="fullscreen-error">
      <div class="alert alert-danger">
        <h4 class="alert-heading">Error en el tema {{ themeData.theme }}</h4>
        <p>{{ componentError || 'No se pudieron cargar los datos de este tema.' }}</p>
      </div>
    </div>

    <!-- Main content -->
    <div v-else class="fullscreen-content">
      <!-- Card header -->
      <div class="fullscreen-header">
        <h2 class="theme-title">{{ themeData.theme }}</h2>
        <div class="tabs-container">
          <button
            v-for="(tab, index) in themeData.tabs"
            :key="index"
            @click="setActiveTab(index)"
            :class="{ 'tab-btn': true, 'active': activeTab === index }"
          >
            {{ tab.title }}
          </button>
        </div>
      </div>

      <!-- Card body -->
      <div class="fullscreen-body">
        <!-- Chart arriba -->
        <div class="chart-section">
          <StatsChart
            :data="themeData.tabs[activeTab]?.chartData"
            :title="themeData.tabs[activeTab]?.title"
            :yTitle="themeData.tabs[activeTab]?.yTitle || 'Valor'"
            :mode="'fullscreen'"
            :height="chartHeight"
          />
        </div>
        <!-- KPIs abajo -->
        <div class="kpis-section">
          <div class="kpis-grid">
            <div v-if="themeData.tabs[activeTab]?.kpisData && themeData.tabs[activeTab].kpisData.length > 0" class="kpis-container">
              <div v-for="kpi in themeData.tabs[activeTab].kpisData" :key="kpi.name" class="kpi-card">
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
                <div class="kpi-visualization">
                  <div v-if="kpi.type === 'efficiency'" class="efficiency-circle">
                    <svg width="40" height="40">
                      <circle cx="20" cy="20" r="16" stroke="#e9ecef" stroke-width="3" fill="none" />
                      <circle cx="20" cy="20" r="16" stroke="#00C853" stroke-width="3" fill="none" stroke-dasharray="100.5" :stroke-dashoffset="100.5 - (100.5 * Math.min(100, (kpi.value / kpi.expected) * 100) / 100)" transform="rotate(-90 20 20)" />
                    </svg>
                    <div class="efficiency-text">{{ Math.round(Math.min(100, (kpi.value / kpi.expected) * 100)) }}%</div>
                  </div>
                  <div v-else-if="kpi.type === 'participation'" class="participation-bar">
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ width: Math.min(100, kpi.value) + '%' }"></div>
                    </div>
                    <div class="participation-text">{{ Math.round(kpi.value) }}%</div>
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

      <!-- Card footer -->
      <div class="fullscreen-footer">
        <p>Último registro válido: {{ getLastRecord() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import StatsChart from './StatsChart.vue'
import Loader from './Loader.vue'

const emit = defineEmits(['update:activeTab', 'update:currentThemeIndex', 'exitFullscreen'])

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
  activeTab: {
    type: Number,
    default: 0
  },
  themesData: {
    type: Array,
    required: true
  },
  currentThemeIndex: {
    type: Number,
    required: true
  },
  dynamicTitle: {
    type: String,
    required: true
  },
  cardLoadingStates: {
    type: Map,
    default: () => new Map()
  }
})

const componentError = ref(null)

const chartHeight = ref(400) // Altura fija para el chart en fullscreen

const setActiveTab = (index) => {
  emit('update:activeTab', index)
}

const setCurrentTheme = (index) => {
  emit('update:currentThemeIndex', index)
}

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

onMounted(() => {
  // Calcular altura del chart basada en el viewport
  const updateChartHeight = () => {
    const navHeight = 60 // Altura aproximada del nav
    const headerHeight = 80 // Altura aproximada del header
    const footerHeight = 40 // Altura aproximada del footer
    const kpisHeight = 200 // Altura aproximada de KPIs
    chartHeight.value = window.innerHeight - navHeight - headerHeight - footerHeight - kpisHeight - 40 // Margins
  }
  updateChartHeight()
  window.addEventListener('resize', updateChartHeight)
})
</script>

<style scoped>
.fullscreen-card {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--bs-body-bg);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.fullscreen-nav {
  background: var(--agrotech-blue-dark);
  color: white;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  flex: 0;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-right {
  flex: 0;
}

.nav-title {
  font-weight: bold;
  font-size: 1.2rem;
}

.exit-btn {
  border-color: rgba(255,255,255,0.5);
  color: white;
}

.exit-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: white;
  color: white;
}

.fullscreen-loading-overlay {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.9);
}

.loading-content {
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

.fullscreen-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.fullscreen-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fullscreen-header {
  padding: 0.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.theme-title {
  margin: 0;
  color: var(--agrotech-blue-dark);
}

.tabs-container {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #6c757d;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #f8f9fa;
}

.tab-btn.active {
  background: var(--agrotech-blue-dark);
  color: white;
  border-color: var(--agrotech-blue-dark);
}

.fullscreen-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-section {
  flex: 1;
  padding: 0.25rem 0.5rem;
  overflow: hidden;
}

.kpis-section {
  padding: 0.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.kpis-grid {
  max-height: 150px;
  overflow-y: auto;
}

.kpis-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.kpi-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 150px;
}

.kpi-content {
  flex: 1;
}

.kpi-header {
  display: flex;
  align-items: center;
  width: 100%;
}

.kpi-icon {
  color: #00C853;
  font-size: 1.2em;
}

.kpi-name {
  margin-left: 8px;
  font-weight: bold;
  font-size: 0.8em;
  color: #333;
  flex: 1;
  text-align: left;
}

.kpi-info-icon {
  color: #0288D1;
  cursor: pointer;
  font-size: 1em;
  margin-left: 8px;
}

.kpi-value {
  font-size: 1.1em;
  font-weight: bold;
  color: #00C853;
  padding-left: 44px; /* align with name */
}

.kpi-visualization {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.efficiency-circle {
  position: relative;
  display: inline-block;
}

.efficiency-circle svg circle {
  transition: stroke-dashoffset 0.3s ease;
}

.efficiency-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7em;
  font-weight: bold;
  color: #333;
}

.participation-bar {
  position: relative;
  width: 100%;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bar-container {
  width: 100%;
  height: 16px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.bar-fill {
  height: 100%;
  background: #00C853;
  transition: width 0.3s ease;
}

.participation-text {
  font-size: 0.7em;
  font-weight: bold;
  color: #00C853;
}

.fullscreen-footer {
  padding: 0.25rem 0.5rem;
  background: white;
  border-top: 1px solid #dee2e6;
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
}


.theme-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.theme-tabs::-webkit-scrollbar {
  display: none;
}

.theme-tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255,255,255,0.3);
  background: transparent;
  color: white;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.theme-tab-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.5);
}

.theme-tab-btn.active {
  background: var(--agrotech-blue-light);
  color: white;
  border-color: var(--agrotech-blue-light);
}

.navbar {
  background-color: var(--agrotech-blue-dark) !important;
  position: sticky;
  top: 0;
  z-index: 1020;
}

.navbar-brand {
  color: #fff !important;
}

.nav-link {
  color: #fff !important;
  font-weight: 500;
}

.nav-link:hover {
  color: var(--agrotech-blue-light) !important;
}

.navbar .nav-link.active {
  color: var(--agrotech-blue-light) !important;
  font-weight: bold;
  border-bottom: 2px solid var(--agrotech-blue-light);
}

.nav-spinner {
  display: inline-block;
  margin-right: 5px;
}

/* Responsive */
@media (max-width: 768px) {
  .fullscreen-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .tabs-container {
    justify-content: center;
  }

  .kpis-container {
    flex-direction: column;
  }

  .theme-tabs {
    justify-content: center;
  }
}
</style>