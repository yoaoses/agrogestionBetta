<template>
  <nav :class="['navbar', 'navbar-expand-lg', 'bg-body', 'text-body', themeStore.theme]">
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
            <a @click.prevent="navigateTo('/')" :class="['nav-link', { active: route.path === '/' }]" style="cursor: pointer;">Inicio</a>
          </li>

          <!-- Companies Dropdown -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">
              Companies
            </a>
            <ul class="dropdown-menu">
              <li v-for="company in mockCompanies" :key="company">
                <a class="dropdown-item" href="#" style="cursor: pointer;">{{ company }}</a>
              </li>
            </ul>
          </li>

          <!-- Farms Dropdown -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">
              Farms
            </a>
            <ul class="dropdown-menu">
              <li v-for="farm in mockFarms" :key="farm">
                <a class="dropdown-item" href="#" style="cursor: pointer;">{{ farm }}</a>
              </li>
            </ul>
          </li>

          <!-- Conf IA -->
          <li class="nav-item">
            <a @click.prevent="navigateTo('/config')" :class="['nav-link', { active: route.path === '/config' }]" style="cursor: pointer;">Conf IA</a>
          </li>

          <!-- Pruebas Tema -->
          <li class="nav-item">
            <a @click.prevent="navigateTo('/theme-test')" :class="['nav-link', { active: route.path === '/theme-test' }]" style="cursor: pointer;">Pruebas Tema</a>
          </li>
        </ul>

        <!-- ThemeSelector and User Dropdown -->
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <ThemeSelector />
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">
              <svg class="me-2" width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
              </svg>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><h6 class="dropdown-header">{{ userName }}</h6></li>
              <li><span class="dropdown-item-text">{{ userEmail }}</span></li>
              <li><hr class="dropdown-divider"></li>
              <li><router-link class="dropdown-item" to="/dashboard">Dashboard</router-link></li>
              <li><router-link class="dropdown-item" to="/config">Settings</router-link></li>
              <li><a class="dropdown-item" href="#" @click="handleLogout" style="cursor: pointer;">Sign out</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useThemeStore } from '../stores/theme.js'
import ThemeSelector from './ThemeSelector.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const showMobileMenu = ref(false)

const mockCompanies = ['Empresa A', 'Empresa B', 'Empresa C']
const mockFarms = ['Finca 1', 'Finca 2', 'Finca 3']

const userName = 'Usuario Demo'
const userEmail = 'demo@campodata.com'

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const navigateTo = (path) => {
  router.push(path)
  showMobileMenu.value = false
}

onMounted(() => {
  console.log('NavBar mounted, window width:', window.innerWidth)
  console.log('Theme:', themeStore.theme)
})
</script>

<style scoped>
.nav-link:hover {
  background-color: lightgray;
  border-radius: 0.25rem;
}

.nav-link.active {
  background-color: #e9ecef;
  border-radius: 0.25rem;
}
</style>
