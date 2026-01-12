<template>
  <nav ref="navRef" :class="['navbar', 'navbar-expand-lg', 'bg-body', 'text-body', themeStore.theme]">
    <div class="container-fluid">
      <!-- Logo -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <svg class="me-2" width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clip-rule="evenodd"></path>
        </svg>
        <span class="fs-4 fw-semibold">CampoData</span>
      </router-link>

      <!-- Mobile menu button -->
      <button @click="toggleMobileMenu" class="navbar-toggler" type="button" aria-controls="navbarNav" :aria-expanded="showMobileMenu" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menu items -->
      <div :class="['navbar-collapse', showMobileMenu ? 'show' : 'collapse']" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <!-- Inicio -->
          <li class="nav-item">
            <router-link to="/" class="nav-link" @click="showMobileMenu = false">Inicio</router-link>
          </li>

          <!-- Companies Dropdown -->
           <li class="nav-item dropdown">
             <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false" @click="showMobileMenu = false">
               Companies
             </a>
             <ul class="dropdown-menu">
               <li><a class="dropdown-item disabled" href="#" style="cursor: default;">Selecciona una empresa</a></li>
               <li v-for="company in companies" :key="company.id">
                 <a class="dropdown-item" href="#" @click="selectCompany(company)" style="cursor: pointer;">{{ company.name }}</a>
               </li>
             </ul>
           </li>

          <!-- Farms Dropdown -->
           <li class="nav-item dropdown">
             <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false" @click="showMobileMenu = false">
               Farms
             </a>
             <ul class="dropdown-menu">
               <li><a class="dropdown-item disabled" href="#" style="cursor: default;">Selecciona una finca</a></li>
               <li v-for="farm in farms" :key="farm.id">
                 <a class="dropdown-item" href="#" @click="selectFarm(farm)" style="cursor: pointer;">{{ farm.name }}</a>
               </li>
             </ul>
           </li>

          <!-- Conf IA -->
          <li class="nav-item">
            <router-link to="/config" class="nav-link" @click="showMobileMenu = false">Conf IA</router-link>
          </li>

          <!-- Pruebas Tema -->
          <li class="nav-item">
            <router-link to="/theme-test" class="nav-link" @click="showMobileMenu = false">Pruebas Tema</router-link>
          </li>
        </ul>

        <!-- Theme Switch and User Dropdown -->
        <div class="d-flex ms-auto me-4">
          <div class="btn-group" role="group" aria-label="Theme selector">
            <input type="radio" class="btn-check" name="theme" id="light-theme" autocomplete="off" :checked="!isDark" @change="themeStore.setTheme('light', true)">
            <label class="btn btn-outline" for="light-theme">
              <i class="bi bi-brightness-high-fill"></i>
            </label>
            <input type="radio" class="btn-check" name="theme" id="dark-theme" autocomplete="off" :checked="isDark" @change="themeStore.setTheme('dark', true)">
            <label class="btn btn-outline" for="dark-theme">
              <i class="bi bi-moon-stars-fill"></i>
            </label>
          </div>
        </div>
            <button type="button" :class="['btn', 'btn-outline-primary']" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle"></i>
            </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><h6 class="dropdown-header">{{ userName }}</h6></li>
            <li><span class="dropdown-item-text">{{ userEmail }}</span></li>
            <li><hr class="dropdown-divider"></li>
            <li><router-link class="dropdown-item" to="/config">Settings</router-link></li>
            <li><a class="dropdown-item" href="#" @click="handleLogout" style="cursor: pointer;">Sign out</a></li>
          </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useThemeStore } from '../stores/theme.js'
import { useFarmData } from '../composables/useFarmData.js'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
const { getCompanies, getFarms } = useFarmData()

const showMobileMenu = ref(false)
const navRef = ref(null)

const companies = ref([])
const farms = ref([])
const selectedCompany = ref(null)
const selectedFarm = ref(null)

const userName = 'Usuario Demo'
const userEmail = 'demo@campodata.com'

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const selectCompany = (company) => {
  selectedCompany.value = company
  // Cuando se selecciona una compañía, resetear la finca seleccionada
  selectedFarm.value = null
  // Redirigir al dashboard con la compañía seleccionada
  router.push('/dashboard/' + company.id)
  showMobileMenu.value = false
  // Opcional: actualizar farms para la nueva compañía
  getFarms(company.id).then(farmsData => {
    farms.value = farmsData
  })
}

const selectFarm = (farm) => {
  selectedFarm.value = farm
  // Redirigir al dashboard con compañía y finca seleccionadas
  router.push('/dashboard/' + selectedCompany.value.id + '/' + farm.id)
  showMobileMenu.value = false
}

onMounted(async () => {
  console.log('NavBar mounted, window width:', window.innerWidth)
  console.log('Theme:', themeStore.theme)
  console.log('NavBar: Llamando getCompanies desde NavBar')

  try {
    companies.value = await getCompanies()
    console.log('NavBar: getCompanies exitoso, llamando getFarms')
    if (companies.value.length > 0) {
      farms.value = await getFarms(companies.value[0].id)
      console.log('NavBar: getFarms exitoso')
    }
  } catch (err) {
    console.error('Error fetching data:', err)
  }

  // Medir altura real del navbar y actualizar --nav-height
  await nextTick()
  document.documentElement.style.setProperty('--nav-height', navRef.value.offsetHeight + 'px')
  console.log('NavBar height set to:', navRef.value.offsetHeight + 'px')
})

// Watch for route changes to update selectedCompany and selectedFarm
watch(route, () => {
  if (route.params.companyId) {
    selectedCompany.value = companies.value.find(c => c.id == route.params.companyId) || null
  } else {
    selectedCompany.value = null
  }
  if (route.params.farmId) {
    selectedFarm.value = farms.value.find(f => f.id == route.params.farmId) || null
  } else {
    selectedFarm.value = null
  }
}, { immediate: true })
</script>

<style scoped>
.nav-link {
  padding: 0.375rem 0.75rem;
}

.nav-link:hover {
  background-color: var(--neutral-light);
  border-radius: 0.25rem;
}

.nav-link.active {
  border-bottom: 2px solid var(--neutral-dark);
}

.nav-link:focus {
  outline: none;
}

.btn:focus {
  outline: none;
}
</style>
