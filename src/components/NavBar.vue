<template>
  <!-- Toggle button for mobile drawer -->
  <button @click="toggleDrawer" class="drawer-toggle d-lg-none" type="button" aria-label="Toggle sidebar">
    <i class="bi bi-list"></i>
  </button>

  <!-- Sidebar -->
  <aside ref="sidebarRef" :class="['sidebar', 'bg-body', 'text-body', themeStore.theme, { 'drawer-open': isDrawerOpen }]">
    <div class="sidebar-content d-flex flex-column h-100">
      <!-- Logo and Location -->
      <div class="sidebar-logo d-flex align-items-center">
        <div class="w-100">
          <h6 class="mb-0 fs-4"><i :class="'bi ' + dynamicTitle.icon"></i> {{ dynamicTitle.title }}</h6>
          <p v-if="selectedEntityName" class="mb-0 text-muted" style="font-size: 0.8rem; padding-left: 1.5rem;">{{ selectedEntityName }}</p>
          <p v-if="formattedDateRange" class="mb-0 text-muted" style="font-size: 0.8rem;"><i class="bi bi-calendar"></i> {{ formattedDateRange }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav flex-grow-1">
        <div class="sidebar-nav-container">
          <ul class="nav flex-column">
            <!-- Rango de Fechas -->
            <li class="nav-item">
              <button data-bs-toggle="modal" data-bs-target="#dateRangeModal" class="nav-link date-range-button" @click="closeDrawerOnMobile">
                <i class="bi bi-calendar"></i> Rango de Fechas
              </button>
            </li>

            <!-- Inicio -->
            <li class="nav-item">
              <router-link to="/home" class="nav-link" :class="{ active: $route.path === '/home' }" @click="closeDrawerOnMobile">
                <i class="bi bi-house"></i> Inicio
              </router-link>
            </li>

            <!-- Dashboard -->
            <li class="nav-item">
              <router-link to="/entities" class="nav-link entities-link" :class="{ active: $route.path.startsWith('/entities') }" @click="closeDrawerOnMobile">
                <i class="bi bi-diagram-3"></i> Entidades
              </router-link>
            </li>

            <!-- Companies and Farms -->
            <li class="nav-item">
              <Loader v-if="isLoading" size="small" />
              <div v-else>
                <div v-for="company in navigationStore.companies" :key="company.id">
                  <div class="tree-header">
                    <button @click="toggleCompany(company)" class="nav-link company-link flex-grow-1 d-flex align-items-center">
                      <i class="bi" :class="collapsedCompanies[company.id] ? 'bi-chevron-right' : 'bi-chevron-down'"></i>
                      <span><i class="bi bi-building"></i> {{ company.name }}</span>
                    </button>
                  </div>
                  <ul v-if="!collapsedCompanies[company.id]" class="list-unstyled ms-3 tree-farms bg-light">
                    <li>
                      <router-link :to="'/dashboard/' + company.id" class="nav-link" :class="{ active: $route.params.companyId == company.id && !$route.params.farmId }" @click="handlePanelClick(company)">
                        <i class="bi bi-bar-chart"></i> Panel
                      </router-link>
                    </li>
                    <li v-for="farm in navigationStore.allFarms.filter(f => f.companyId === company.id)" :key="farm.id">
                      <a @click="selectFarm(farm)" class="nav-link farm-link" :class="{ 'active': $route.params.farmId == farm.id }">
                        <i class="bi bi-tree"></i> {{ farm.name }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </li>

            <!-- Conf IA -->
            <li class="nav-item">
              <router-link to="/config" class="nav-link" :class="{ active: $route.path === '/config' }" @click="closeDrawerOnMobile">
                <i class="bi bi-gear"></i> Conf IA
              </router-link>
            </li>

            <!-- API Test -->
            <li class="nav-item">
              <router-link to="/api-test" class="nav-link" :class="{ active: $route.path === '/api-test' }" @click="closeDrawerOnMobile">
                <i class="bi bi-code"></i> API Test
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

    </div>
  </aside>

  <!-- Date Range Modal -->
  <div class="modal fade" id="dateRangeModal" tabindex="-1" aria-labelledby="dateRangeModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="dateRangeModalLabel">Seleccionar Rango de Fechas</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <DateRangePicker @execute="handleDateRangeExecute" />
        </div>
        <div class="modal-footer d-flex justify-content-between align-items-center">
          <small class="text-muted">{{ formattedDateRangeModal }}</small>
          <button
            class="btn btn-primary btn-sm"
            data-bs-dismiss="modal"
            :disabled="dateRangeStore.isLoading"
            @click="handleDateRangeExecute({ start: dateRangeStore.startDate, end: dateRangeStore.endDate })"
          >
            <span v-if="dateRangeStore.isLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Establecer rango
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useNavigationStore } from '../stores/navigation.js'
import { useDateRangeStore } from '../stores/dateRange.js'
import DateRangePicker from './DateRangePicker.vue'
import Loader from './Loader.vue'
import { Modal } from 'bootstrap'


const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const navigationStore = useNavigationStore()
const dateRangeStore = useDateRangeStore()


const sidebarRef = ref(null)
const isDrawerOpen = ref(false)
const collapsedCompanies = reactive({})
const isLoading = ref(true)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const closeDrawerOnMobile = () => {
  if (window.innerWidth < 992) {
    isDrawerOpen.value = false
  }
}

const toggleCompany = (company) => {
  closeDrawerOnMobile()
  const isCurrentlyCollapsed = collapsedCompanies[company.id]
  if (isCurrentlyCollapsed) {
    // Abrir esta compañía, cerrar las demás
    navigationStore.companies.forEach(c => {
      collapsedCompanies[c.id] = true
    })
    collapsedCompanies[company.id] = false
  } else {
    // Cerrar esta compañía
    collapsedCompanies[company.id] = true
  }
}

const handlePanelClick = (company) => {
  if (!navigationStore.selectedCompany || navigationStore.selectedCompany.id !== company.id) {
    navigationStore.selectCompany(company)
  }
  closeDrawerOnMobile()
}

const selectFarm = async (farm) => {
  await navigationStore.selectFarm(farm)
  closeDrawerOnMobile()
}

const handleDateRangeExecute = (dateRange) => {
  // Emitir evento global para que DashboardView lo maneje
  window.dispatchEvent(new CustomEvent('dateRangeExecute', { detail: dateRange }))
  closeDrawerOnMobile()
  // Cerrar el modal
  const modal = Modal.getInstance(document.getElementById('dateRangeModal'))
  if (modal) modal.hide()
}

onMounted(async () => {
  try {
    await navigationStore.loadCompanies()
    await navigationStore.loadAllFarms()
    if (navigationStore.companies.length > 0) {
      navigationStore.selectedCompany = navigationStore.companies[0]
      await navigationStore.loadFarms(navigationStore.companies[0].id)
    }
  } catch (err) {
    console.error('Error fetching data:', err)
  }
  isLoading.value = false

  navigationStore.companies.forEach(company => {
    collapsedCompanies[company.id] = true
  })
  if (navigationStore.selectedCompany) {
    collapsedCompanies[navigationStore.selectedCompany.id] = false
  }

  await nextTick()
})

// Watch for route changes to update selectedCompany and selectedFarm
watch(route, () => {
  navigationStore.setSelectedFromRoute(route.params.companyId, route.params.farmId)
  if (navigationStore.selectedCompany) {
    collapsedCompanies[navigationStore.selectedCompany.id] = false
  }
}, { immediate: true })

const selectedEntityName = computed(() => {
  return navigationStore.selectedFarm ? navigationStore.selectedFarm.name : ''
})

const dynamicTitle = computed(() => {
  if (route.name === 'Dashboard') {
    return { title: 'Panel', icon: 'bi-bar-chart' }
  } else if (route.name === 'Config') {
    return { title: 'Configuración IA', icon: 'bi-gear' }
  } else if (route.name === 'UserOptions') {
    return { title: 'Configuración Personal', icon: 'bi-gear' }
  } else {
    return { title: 'Inicio', icon: 'bi-house' }
  }
})

const formattedDateRange = computed(() => {
  if (!dateRangeStore.startDate || !dateRangeStore.endDate) return ''
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  return `${formatDate(dateRangeStore.startDate)} - ${formatDate(dateRangeStore.endDate)}`
})

const formattedDateRangeModal = computed(() => {
  return formattedDateRange.value
})

</script>

<style scoped>
.sidebar-logo {
  position: sticky;
  top: 0;
  background-color: var(--bs-body-bg);
  border-bottom: 1px solid var(--bs-border-color);
  z-index: 10;
  padding-bottom: 0;
}

hr {
  margin: 0;
}

.location-info {
  margin-top: 0.25rem;
}

.sidebar-nav-container {
  overflow-y: auto;
  flex-grow: 1;
}

.nav-link {
  padding: 0.25rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link:hover {
  background-color: var(--neutral-light);
  border-radius: 0.25rem;
  font-weight: 500;
}

.nav-link.active {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.25rem;
  font-weight: 600;
  border-bottom: 2px solid var(--bs-primary);
}

.nav-link:focus {
  outline: none;
}

.company-link, .farm-link, .date-range-button {
  cursor: pointer;
  width: 100%;
}

.company-link {
  border: none;
  background: none;
  text-align: left;
}

.farm-link {
  padding-left: 1rem;
  font-size: 0.95rem;
}

/* Tree styles */
.tree-farms {
  padding-top: 0.25rem;
}

.tree-company-header {
  padding: 0.5rem 1rem;
  font-weight: 500;
  color: var(--bs-body-color);
}

.tree-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}


.nav-item:first-child .nav-link {
  padding-top: 0;
}

.company-separator {
  margin: 0.5rem 0;
  border: 0;
  border-top: 1px solid var(--bs-border-color);
}

.date-range-section {
  margin-top: 1rem;
  padding: 0.5rem;
  border-top: 1px solid var(--bs-border-color);
}

.sidebar-subtitle {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--bs-body-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
