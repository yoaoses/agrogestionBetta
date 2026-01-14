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
          <p v-if="dynamicTitle.text" class="mb-0 small text-muted">{{ dynamicTitle.text }}</p>
          <div class="location-info">
            <p v-if="navigationStore.selectedCompany" class="mb-0 small">{{ navigationStore.selectedCompany.name }}</p>
            <p v-if="navigationStore.selectedFarm" class="mb-0 small">{{ navigationStore.selectedFarm.name }}</p>
            <p v-else-if="!navigationStore.selectedCompany" class="mb-0 small text-muted">Selecciona una empresa</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav flex-grow-1">
        <div class="sidebar-nav-container">
          <ul class="nav flex-column">
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
              <div v-for="company in navigationStore.companies" :key="company.id">
                <div class="tree-header">
                  <a @click="selectCompany(company)" class="nav-link company-link flex-grow-1" :class="{ active: $route.params.companyId == company.id }">
                    <i class="bi bi-building"></i> {{ company.name }}
                  </a>
                </div>
                <ul v-if="groupedFarms[company.name] && groupedFarms[company.name].length > 0" class="list-unstyled ms-3 tree-farms">
                  <li v-for="farm in groupedFarms[company.name]" :key="farm.id">
                    <a @click="selectFarm(farm)" class="nav-link farm-link" :class="{ active: $route.params.farmId == farm.id }">
                      <i class="bi bi-tree"></i> {{ farm.name }}
                    </a>
                  </li>
                </ul>
              </div>
            </li>

            <!-- Conf IA -->
            <li class="nav-item">
              <router-link to="/config" class="nav-link" :class="{ active: $route.path === '/config' }" @click="closeDrawerOnMobile">
                <i class="bi bi-gear"></i> Conf IA
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

    </div>
  </aside>
</template>

<script setup>
// console.log('NavBar script: Starting execution')
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useThemeStore } from '../stores/theme'
import { useNavigationStore } from '../stores/navigation.js'

// console.log('NavBar script: Imports done')

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const navigationStore = useNavigationStore()

// console.log('NavBar script: Variables initialized')

const sidebarRef = ref(null)
const isDrawerOpen = ref(false)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const closeDrawerOnMobile = () => {
  if (window.innerWidth < 992) {
    isDrawerOpen.value = false
  }
}

const selectCompany = (company) => {
  navigationStore.selectCompany(company)
  // Redirigir al dashboard con la compañía seleccionada
  router.push('/dashboard/' + company.id)
  closeDrawerOnMobile()
}

const selectFarm = (farm) => {
  navigationStore.selectFarm(farm)
  // Redirigir al dashboard con compañía y finca seleccionadas
  router.push('/dashboard/' + navigationStore.selectedCompany.id + '/' + farm.id)
  closeDrawerOnMobile()
}

onMounted(async () => {
// console.log('SideBar mounted, window width:', window.innerWidth)
// console.log('Theme:', themeStore.theme)
// console.log('SideBar: Llamando loadCompanies desde SideBar')

  try {
    await navigationStore.loadCompanies()
// console.log('SideBar: loadCompanies exitoso, llamando loadAllFarms')
    await navigationStore.loadAllFarms()
// console.log('SideBar: loadAllFarms exitoso')
    if (navigationStore.companies.length > 0) {
      await navigationStore.loadFarms(navigationStore.companies[0].id)
// console.log('SideBar: loadFarms exitoso')
    }
  } catch (err) {
// console.error('Error fetching data:', err)
  }

  await nextTick()
  console.log('NavBar.vue sidebar offsetHeight:', sidebarRef.value.offsetHeight)
})

// Watch for route changes to update selectedCompany and selectedFarm
watch(route, () => {
  navigationStore.setSelectedFromRoute(route.params.companyId, route.params.farmId)
}, { immediate: true })

const dynamicTitle = computed(() => {
  if (route.name === 'Dashboard') {
    if (navigationStore.selectedFarm) {
      return { title: 'Entidades', text: navigationStore.selectedFarm.name, icon: 'bi-speedometer2' }
    } else if (navigationStore.selectedCompany) {
      return { title: 'Entidades', text: navigationStore.selectedCompany.name, icon: 'bi-speedometer2' }
    } else {
      return { title: 'Inicio', text: '', icon: 'bi-house' }
    }
  } else if (route.name === 'Config') {
    return { title: 'Configuración IA', text: '', icon: 'bi-gear' }
  } else if (route.name === 'UserOptions') {
    return { title: 'Configuración Personal', text: '', icon: 'bi-gear' }
  } else {
    return { title: 'Inicio', text: '', icon: 'bi-house' }
  }
})

const groupedFarms = computed(() => {
  const groups = {}
  navigationStore.allFarms.forEach(farm => {
    if (!groups[farm.companyName]) {
      groups[farm.companyName] = []
    }
    groups[farm.companyName].push(farm)
  })
  return groups
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
  border-bottom: 2px solid var(--neutral-dark);
  font-weight: 600;
}

.nav-link:focus {
  outline: none;
}

.company-link, .farm-link {
  cursor: pointer;
  width: 100%;
}

.farm-link {
  padding-left: 2rem;
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

.entities-link.active {
  border-bottom: none;
}

.nav-item:first-child .nav-link {
  padding-top: 0;
}

.company-separator {
  margin: 0.5rem 0;
  border: 0;
  border-top: 1px solid var(--bs-border-color);
}
</style>
