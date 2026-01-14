<template>
  <div ref="dashboardContainerRef" class="dashboard-container">
    <!-- Contenido scrollable -->
    <div ref="scrollableContentRef" class="scrollable-content" data-bs-spy="scroll" data-bs-target="#navbar-scrollspy" data-bs-offset="100" tabindex="0">
      <!-- Navegación interna sticky -->
      <nav id="navbar-scrollspy" class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div class="container-fluid">
          <span class="navbar-brand fw-bold text-success">Dashboard Temático</span>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item" v-for="(theme, index) in themesData" :key="index">
                <a class="nav-link" :href="`#card-${index + 1}`">Tema {{ index + 1 }}</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div class="content-wrapper" ref="contentWrapperRef">
        <div class="header-section text-center py-5 bg-primary text-white" ref="headerSectionRef">
          <h1 class="display-4 fw-bold">Dashboard Interactivo</h1>
          <p class="lead">Compañía: {{ selectedCompany?.name }} {{ selectedFarm ? `- Granja: ${selectedFarm.name}` : '' }}</p>
        </div>

        <div v-if="!route.params.farmId" ref="farmSelectionRef" class="farm-selection py-5">
          <div class="container">
            <h3 class="text-center mb-4 text-info">Selecciona una Granja</h3>
            <div class="row justify-content-center">
              <div class="col-md-6">
                <ul class="list-group">
                  <li class="list-group-item" v-for="farm in companyFarms" :key="farm.id">
                    <router-link :to="`/dashboard/${route.params.companyId}/${farm.id}`" class="text-decoration-none">
                      {{ farm.name }}
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="loading" ref="loadingSectionRef" class="loading-section text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3 text-muted">Cargando datos del dashboard...</p>
        </div>

        <div v-else-if="error" class="error-section text-center py-5">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error al cargar datos</h4>
            <p>{{ error }}</p>
          </div>
        </div>

        <div v-else class="cards-section" ref="cardsSectionRef">
          <transition-group name="slide" tag="div" class="cards-container">
            <ThematicCard
              v-for="(theme, index) in visibleThemes"
              :key="`theme-${index}`"
              :themeData="theme"
              :index="index + 1"
              :data-index="index"
              class="card-wrapper"
            />
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, reactive, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboard } from '../composables/useDashboard.js'
import { useDashboardService } from '../composables/useDashboardService.js'
import ThematicCard from '../components/ThematicCard.vue'

const route = useRoute()
const { companies, farms, loadInitialData, selectCompany, selectFarm } = useDashboard()
const { loading, error, themesData, getThemesData } = useDashboardService()

// Estado para carga progresiva
const visibleThemes = ref([])
const observer = ref(null)
const cardElements = ref(new Map())
const dashboardContainerRef = ref(null)
const scrollableContentRef = ref(null)
const contentWrapperRef = ref(null)
const headerSectionRef = ref(null)
const cardsSectionRef = ref(null)
const farmSelectionRef = ref(null)
const loadingSectionRef = ref(null)

onMounted(async () => {
  await loadInitialData()
  if (route.params.companyId) {
    await selectCompany(route.params.companyId)
  }
  if (route.params.farmId) {
    await selectFarm(route.params.farmId)
    // Cargar datos temáticos
    await getThemesData(route.params.farmId)
    // Inicializar carga progresiva
    initializeProgressiveLoading()
  }
  await nextTick()
  console.log('window.innerHeight:', window.innerHeight)
  console.log('dashboard-container:', dashboardContainerRef.value.offsetHeight)
  console.log('scrollable-content:', scrollableContentRef.value.offsetHeight)
  console.log('content-wrapper:', contentWrapperRef.value?.offsetHeight)
  console.log('header-section:', headerSectionRef.value?.offsetHeight)
  console.log('cards-section:', cardsSectionRef.value?.offsetHeight)
  if (farmSelectionRef.value) console.log('farm-selection:', farmSelectionRef.value.offsetHeight)
  if (loadingSectionRef.value) console.log('loading-section:', loadingSectionRef.value.offsetHeight)
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

const initializeProgressiveLoading = () => {
  // Mostrar la primera card inmediatamente
  visibleThemes.value = themesData.value.slice(0, 1)

  // Configurar IntersectionObserver para cargar progresivamente
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.index)
        // Cuando la última card visible entra en viewport, cargar la siguiente
        if (index === visibleThemes.value.length - 1 && visibleThemes.value.length < themesData.value.length) {
          visibleThemes.value.push(themesData.value[visibleThemes.value.length])
          // Después de agregar, observar la nueva última
          nextTick(() => {
            const newCards = document.querySelectorAll('.card-wrapper')
            if (newCards.length > index + 1) {
              observer.value.observe(newCards[index + 1])
            }
          })
        }
      }
    })
  }, {
    rootMargin: '100px'
  })

  // Observar la primera card
  nextTick(() => {
    const cards = document.querySelectorAll('.card-wrapper')
    if (cards.length > 0) {
      observer.value.observe(cards[0])
    }
  })
}


const selectedCompany = computed(() => {
  return companies.value.find(c => c.id == route.params.companyId)
})

const selectedFarm = computed(() => {
  return farms.value.find(f => f.id == route.params.farmId)
})

const companyFarms = computed(() => {
  return farms.value.filter(f => f.companyId == route.params.companyId)
})
</script>

<style scoped>
.dashboard-container {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.navbar {
  background-color: #00C853 !important;
  position: sticky;
  top: 0;
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

.scrollable-content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

.content-wrapper {
  min-height: 100%;
}

.header-section {
  background: linear-gradient(135deg, #00C853 0%, #0288D1 100%) !important;
  padding: 4rem 0;
}

.farm-selection {
  background-color: #f8f9fa;
}

.cards-section {
  padding: 2rem 0;
}

.cards-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.card-wrapper {
  margin-bottom: 2rem;
}

/* Animaciones slide up/down */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
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
</style>
