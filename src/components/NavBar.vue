<template>
  <!-- Toggle button for mobile drawer -->
  <button @click="toggleDrawer" class="drawer-toggle d-lg-none" type="button" aria-label="Toggle sidebar">
    <i class="bi bi-list"></i>
  </button>

  <!-- Sidebar -->
  <aside ref="sidebarRef" :class="['sidebar', 'bg-body', 'text-body', themeStore.theme, { 'drawer-open': isDrawerOpen }]">
    <div class="sidebar-content d-flex flex-column h-100">
      <!-- Logo -->
      <div class="sidebar-logo d-flex align-items-center">
        <div>
          <h6 class="mb-0 fs-4"><i :class="'bi ' + dynamicTitle.icon"></i> {{ dynamicTitle.title }}</h6>
          <p v-if="dynamicTitle.text" class="mb-0 small text-muted">{{ dynamicTitle.text }}</p>
        </div>
      </div>

      <!-- Ubicación -->
      <div class="sidebar-location">
        <p v-if="navigationStore.selectedCompany" class="mb-1">{{ navigationStore.selectedCompany.name }}</p>
        <p v-if="navigationStore.selectedFarm" class="mb-1">{{ navigationStore.selectedFarm.name }}</p>
        <p v-else-if="!navigationStore.selectedCompany" class="mb-1 text-muted">Selecciona una empresa</p>
      </div>

      <hr>

      <!-- Navigation -->
      <nav class="sidebar-nav flex-grow-1">
        <ul class="nav flex-column">
          <!-- Inicio -->
          <li class="nav-item">
            <router-link to="/home" class="nav-link" :class="{ active: $route.path === '/home' }" @click="closeDrawerOnMobile">Inicio</router-link>
          </li>

          <!-- Dashboard -->
          <li class="nav-item">
            <router-link to="/entities" class="nav-link" :class="{ active: $route.path.startsWith('/entities') }" @click="closeDrawerOnMobile">Entidades</router-link>
          </li>

          <!-- Companies and Farms -->
          <li class="nav-item">
            <ul class="list-unstyled">
              <li v-for="company in navigationStore.companies" :key="company.id">
                <a @click="selectCompany(company)" class="nav-link company-link" :class="{ active: $route.params.companyId == company.id }">{{ company.name }}</a>
                <ul class="list-unstyled ms-3">
                  <li v-for="farm in (groupedFarms[company.name] || [])" :key="farm.id">
                    <a @click="selectFarm(farm)" class="nav-link farm-link" :class="{ active: $route.params.farmId == farm.id }">{{ farm.name }}</a>
                  </li>
                </ul>
              </li>
            </ul>
          </li>

          <!-- Conf IA -->
          <li class="nav-item">
            <router-link to="/config" class="nav-link" :class="{ active: $route.path === '/config' }" @click="closeDrawerOnMobile">Conf IA</router-link>
          </li>
        </ul>
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
.nav-link {
  padding: 0.375rem 0.75rem;
}

.nav-link:hover {
  background-color: var(--neutral-light);
  border-radius: 0.25rem;
  font-size: 1.1em;
  font-weight: bold;
}

.nav-link.active {
  border-bottom: 2px solid var(--neutral-dark);
}

.nav-link:focus {
  outline: none;
}

.company-link, .farm-link {
  cursor: pointer;
}

.btn:focus {
  outline: none;
}

/* Tree styles */
.tree-toggle-btn {
  border: none;
  background: none;
  color: inherit;
  font-size: inherit;
}

.tree-toggle-btn:hover {
  text-decoration: underline;
}

.tree-link {
  padding-left: 1rem;
  font-size: 0.9rem;
}

.tree-farms {
  padding-top: 0.25rem;
}

/* Slide transition */
.slide-enter-active, .slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.slide-enter-to, .slide-leave-from {
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.tree-company-header {
  padding: 0.375rem 0.75rem;
  font-weight: 500;
  color: var(--bs-body-color);
}

.tree-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tree-header i {
  transition: transform 0.3s ease;
}

.tree-header i.rotated {
  transform: rotate(90deg);
}

.company-separator {
  margin: 0.5rem 0;
  border: 0;
  border-top: 1px solid var(--bs-border-color);
}
</style>
