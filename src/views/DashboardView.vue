<template>
  <div ref="dashboardContainerRef" class="dashboard-container">
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
            </ul>
          </div>
        </div>
      </nav>
      <div class="themes-container">
        <div v-if="loading" class="loading-section d-flex align-items-center justify-content-center">
          <div class="text-center">
            <DotsLoader />
            <p class="mt-3 text-muted">Cargando datos del dashboard...</p>
          </div>
        </div>

        <div v-else-if="error" class="error-section text-center py-5">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error al cargar datos</h4>
            <p>{{ error }}</p>
          </div>
        </div>

        <div v-else>
           <ThematicCard
             v-if="themesData.length > 0"
             :themeData="themesData[currentThemeIndex]"
             :index="currentThemeIndex + 1"
             :loading="cardLoadingStates.get(currentThemeIndex)"
             :progress="cardProgressStates.get(currentThemeIndex) || 0"
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
import { useDateRangeStore } from '../stores/dateRange.js'
import { useNavigationStore } from '../stores/navigation.js'
import ThematicCard from '../components/ThematicCard.vue'
import DotsLoader from '../components/DotsLoader.vue'

const route = useRoute()
const { companies, farms, loadInitialData, selectCompany, selectFarm } = useDashboard()
const { loading, error, themesData, getThemesData } = useDashboardService()
const { getGroups } = useFarmData()
const dateRangeStore = useDateRangeStore()
const navigationStore = useNavigationStore()

// Estado para carga por card
const cardLoadingStates = ref(new Map())
const cardProgressStates = ref(new Map())
const dashboardContainerRef = ref(null)
const navbarRef = ref(null)
const activeLinkIndex = ref(0)
const currentThemeIndex = ref(0)

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
   // Calcular altura del navbar interno y setear variable CSS
   if (navbarRef.value) {
     const navbarHeight = navbarRef.value.offsetHeight
     document.documentElement.style.setProperty('--inner-nav-height', `${navbarHeight}px`)
   }

   // Agregar listener para date range execute
   window.addEventListener('dateRangeExecute', handleDateRangeExecute)
 })

onUnmounted(() => {
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
</script>

<style scoped>
.dashboard-container {
   height: 100vh;
}

.navbar {
  background-color: #00C853 !important;
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
  color: #0288D1 !important;
}

.themes-container {
    height: calc(100vh - var(--inner-nav-height, 60px));
}

.loading-section {
   height: 100%;
   position: relative;
   z-index: 1030;
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
  color: #0288D1 !important;
  font-weight: bold;
  border-bottom: 2px solid #0288D1;
}

.nav-spinner {
  display: inline-block;
  margin-right: 5px;
}
</style>
