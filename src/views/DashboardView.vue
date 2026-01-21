<template>
  <div ref="dashboardContainerRef" class="dashboard-container" :class="{ 'fullscreen-active': mode === 'fullscreen' }">
    <!-- Contenido scrollable -->
    <div ref="scrollableContentRef" class="scrollable-content" tabindex="0">
      <!-- Navegación interna sticky -->
      <nav ref="navbarRef" class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div class="container-fluid">
          <span class="navbar-brand fw-bold text-success">{{ dynamicTitle }}</span>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item" v-for="(theme, index) in themesData" :key="index">
                <a class="nav-link" :class="{ active: activeLinkIndex === index }" @click.prevent="switchTheme(index)">
                  <span v-if="cardLoadingStates.get(index)" class="nav-spinner">
                    <div class="spinner-border spinner-border-sm text-light" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                  </span>
                  {{ theme.theme }}
                </a>
              </li>
              <li class="nav-item">
                <button @click="toggleFullScreen" class="btn btn-link nav-link d-flex justify-content-center align-items-center" :title="mode === 'fullscreen' ? 'Salir de pantalla completa' : 'Pantalla completa'">
                  <i :class="mode === 'fullscreen' ? 'bi bi-fullscreen-exit' : 'bi bi-fullscreen'"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div class="themes-container" :style="{ height: contentHeightManual + 'px' }">
        <div v-if="loading" class="loading-overlay d-flex align-items-center justify-content-center">
          <div class="text-center">
            <Loader />
            <p class="mt-3 text-muted">Cargando datos del dashboard...</p>
          </div>
        </div>

        <div v-if="error" class="error-section text-center py-5">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error al cargar datos</h4>
            <p>{{ error }}</p>
          </div>
        </div>

        <div v-else>
            <ThematicCard
              v-if="themesData.length > 0 && mode !== 'fullscreen'"
              :themeData="themesData[currentThemeIndex]"
              :index="currentThemeIndex + 1"
              :loading="cardLoadingStates.get(currentThemeIndex)"
              :progress="cardProgressStates.get(currentThemeIndex) || 0"
              :mode="mode"
              v-model:activeTab="activeTab"
            />
            <FullscreenCard
              v-else-if="mode === 'fullscreen' && themesData.length > 0"
              :themeData="themesData[currentThemeIndex]"
              :index="currentThemeIndex + 1"
              :loading="cardLoadingStates.get(currentThemeIndex)"
              :progress="cardProgressStates.get(currentThemeIndex) || 0"
              :activeTab="activeTab"
              :themesData="themesData"
              :currentThemeIndex="currentThemeIndex"
              :dynamicTitle="dynamicTitle"
              :cardLoadingStates="cardLoadingStates"
              @update:activeTab="activeTab = $event"
              @update:currentThemeIndex="currentThemeIndex = $event"
              @exitFullscreen="toggleFullScreen"
            />
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, reactive, nextTick, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboard } from '../composables/useDashboard.js'
import { useDashboardService } from '../composables/useDashboardService.js'
import { useFarmData } from '../composables/useFarmData.js'
import { useFullscreen } from '../composables/useFullscreen.js'
import { useDynamicHeights } from '../composables/useDynamicHeights.js'
import { useDateRangeStore } from '../stores/dateRange.js'
import { useNavigationStore } from '../stores/navigation.js'
import ThematicCard from '../components/ThematicCard.vue'
import FullscreenCard from '../components/FullscreenCard.vue'
import Loader from '../components/Loader.vue'

const route = useRoute()
const { farms, loadInitialData, selectCompany, selectFarm } = useDashboard()
const { loading, error, themesData, getThemesData } = useDashboardService()
const { getGroups } = useFarmData()
const { mode, toggleFullScreen } = useFullscreen()
const dateRangeStore = useDateRangeStore()
const navigationStore = useNavigationStore()

// Alturas calculadas manualmente
const innerNavHeight = ref(0)
const windowHeight = ref(window.innerHeight)
const headerHeight = 60 // Altura fija del navbar principal (Header.vue)
const contentHeightManual = computed(() => windowHeight.value - headerHeight - innerNavHeight.value)

// Estado para carga por card
const cardLoadingStates = ref(new Map())
const cardProgressStates = ref(new Map())
const dashboardContainerRef = ref(null)
const navbarRef = ref(null)
const scrollableContentRef = ref(null)
const activeLinkIndex = ref(0)
const currentThemeIndex = ref(0)
const activeTab = ref(0)

const handleDateRangeExecute = async (event) => {
  const dateRange = event.detail
  dateRangeStore.setDateRange(dateRange.start, dateRange.end)
  dateRangeStore.setLoading(true)
  // Recargar datos
  const type = route.params.farmId ? 'farm' : 'company'
  const entityId = route.params.farmId || route.params.companyId
  await getThemesData(entityId, type)
  dateRangeStore.setLoading(false)
}

onMounted(async () => {
   await loadInitialData()
    if (route.params.companyId) {
      await selectCompany(route.params.companyId)
      // Cargar farms en navigationStore para que setSelectedFromRoute pueda encontrar la farm
      await navigationStore.loadFarms(route.params.companyId)
    }
    if (route.params.farmId) {
      selectFarm(route.params.farmId)
    }
    // Sincronizar navigationStore con route
    navigationStore.setSelectedFromRoute(route.params.companyId, route.params.farmId)
    const type = route.params.farmId ? 'farm' : 'company'
    const entityId = route.params.farmId || route.params.companyId
    if (entityId) {
      await getThemesData(entityId, type)
    }
    // Llamar al endpoint de grupos si hay farmId
    if (route.params.farmId) {
      try {
        const groups = await getGroups(route.params.farmId)
      } catch (error) {
        console.error('Error al obtener grupos:', error)
      }
    }
   await nextTick()
   // Inicializar estados de carga para el tema actual
   if (themesData.value && themesData.value.length > 0) {
     cardLoadingStates.value.set(currentThemeIndex.value, true)
     cardProgressStates.value.set(currentThemeIndex.value, 0)
     // Simular carga
     const loadInterval = setInterval(() => {
       const current = cardProgressStates.value.get(currentThemeIndex.value) || 0
       if (current < 100) {
         cardProgressStates.value.set(currentThemeIndex.value, Math.min(100, current + Math.random() * 20))
       } else {
         cardLoadingStates.value.set(currentThemeIndex.value, false)
         clearInterval(loadInterval)
       }
     }, 200 + Math.random() * 300)
   }
   // Actualizar alturas manualmente
   updateHeights()

   // Agregar listener para resize
   window.addEventListener('resize', updateHeights)

   // Agregar listener para date range execute
   window.addEventListener('dateRangeExecute', handleDateRangeExecute)
 })

onUnmounted(() => {
  window.removeEventListener('resize', updateHeights)
  window.removeEventListener('dateRangeExecute', handleDateRangeExecute)
})

// Watcher para cambios en route
watch(() => route.params, async (newParams, oldParams) => {
  // Si cambió companyId, seleccionar compañía
  if (newParams.companyId !== oldParams.companyId) {
    await selectCompany(newParams.companyId)
    // Cargar farms en navigationStore
    await navigationStore.loadFarms(newParams.companyId)
  }
  // Si cambió farmId, seleccionar farm
  if (newParams.farmId !== oldParams.farmId) {
    if (newParams.farmId) {
      selectFarm(newParams.farmId)
    }
  }
  // Sincronizar navigationStore
  navigationStore.setSelectedFromRoute(newParams.companyId, newParams.farmId)
  // Recargar datos del dashboard
  const type = newParams.farmId ? 'farm' : 'company'
  const entityId = newParams.farmId || newParams.companyId
  if (entityId) {
    await getThemesData(entityId, type)
    // Reset to first theme
    currentThemeIndex.value = 0
    activeLinkIndex.value = 0
  }
  // Llamar al endpoint de grupos si hay farmId
  if (newParams.farmId) {
    try {
      const groups = await getGroups(newParams.farmId)
    } catch (error) {
      console.error('Error al obtener grupos:', error)
    }
  }
}, { immediate: false })

const switchTheme = (index) => {
    currentThemeIndex.value = index
    activeLinkIndex.value = index
}

const selectedCompany = computed(() => {
  return navigationStore.selectedCompany
})

const selectedFarm = computed(() => {
  return navigationStore.selectedFarm
})

const companyFarms = computed(() => {
  return farms.value.filter(f => f.companyId == route.params.companyId)
})

const dynamicTitle = computed(() => {
  if (route.params.farmId && selectedFarm.value) {
    return selectedFarm.value.name
  } else if (selectedCompany.value) {
    return selectedCompany.value.name
  } else {
    return 'Dashboard Temático'
  }
})

// Función para actualizar alturas
const updateHeights = () => {
  windowHeight.value = window.innerHeight
  if (navbarRef.value) {
    innerNavHeight.value = navbarRef.value.offsetHeight
  }
  console.log('DashboardView - updateHeights - Estado:', mode.value);
  console.log('1) Altura del viewport inicial:', windowHeight.value);
  console.log('2) Altura del dashboard (viewport - nav header):', windowHeight.value - headerHeight);
  console.log('3) Altura del contenido (viewport - header - inner nav):', contentHeightManual.value);
  if (dashboardContainerRef.value) {
    console.log('4) Dashboard container - offsetHeight:', dashboardContainerRef.value.offsetHeight, 'clientHeight:', dashboardContainerRef.value.clientHeight);
  }
  if (scrollableContentRef.value) {
    console.log('5) Scrollable content - offsetHeight:', scrollableContentRef.value.offsetHeight, 'clientHeight:', scrollableContentRef.value.clientHeight);
  }
  if (navbarRef.value) {
    console.log('6) Navbar - offsetHeight:', navbarRef.value.offsetHeight, 'clientHeight:', navbarRef.value.clientHeight);
  }
  const themesContainer = document.querySelector('.themes-container');
  if (themesContainer) {
    console.log('7) Themes container - offsetHeight:', themesContainer.offsetHeight, 'clientHeight:', themesContainer.clientHeight);
  }
}

</script>

<style scoped>
.dashboard-container {
   position: relative;
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

.themes-container {
      display: flex;
      flex-direction: column;
      position: relative;
   }

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  z-index: 10;
}

/* Responsive */
@media (max-width: 768px) {
   .header-section h1 {
     font-size: 2rem;
   }

   .navbar-nav {
     text-align: center;
   }

   .nav-link {
     padding: 0.5rem;
   }
 }

/* Scrollspy active state */
.navbar .nav-link.active {
  color: var(--agrotech-blue-light) !important;
  font-weight: bold;
  border-bottom: 2px solid var(--agrotech-blue-light);
}

.nav-spinner {
  display: inline-block;
  margin-right: 5px;
}
</style>
