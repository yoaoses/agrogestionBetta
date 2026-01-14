<template>
  <nav ref="navbarRef" class="navbar navbar-expand-lg navbar-light bg-body border-bottom fixed-top">
    <div class="container-fluid">
      <!-- Logo -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <svg class="me-2" width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clip-rule="evenodd"></path>
        </svg>
        <span class="fs-4 fw-semibold">CampoData</span>
      </router-link>

      <!-- Breadcrumbs -->
      <nav aria-label="breadcrumb" class="flex-grow-1">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none">
              <i class="bi bi-house-door"></i> Inicio
            </router-link>
          </li>
          <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item" :class="{ active: index === breadcrumbs.length - 1 }">
            <span v-if="index === breadcrumbs.length - 1">{{ crumb.label }}</span>
            <router-link v-else :to="crumb.path" class="text-decoration-none">{{ crumb.label }}</router-link>
          </li>
        </ol>
      </nav>

      <!-- Theme Switch and User Dropdown -->
      <div class="d-flex align-items-center gap-2">
        <div class="btn-group" role="group" aria-label="Theme selector">
          <input type="radio" class="btn-check" name="theme" id="light-theme" autocomplete="off" :checked="!isDark" @change="themeStore.setTheme('light', true)">
          <label class="btn btn-outline w-50" for="light-theme">
            <i class="bi bi-brightness-high-fill"></i>
          </label>
          <input type="radio" class="btn-check" name="theme" id="dark-theme" autocomplete="off" :checked="isDark" @change="themeStore.setTheme('dark', true)">
          <label class="btn btn-outline w-50" for="dark-theme">
            <i class="bi bi-moon-stars-fill"></i>
          </label>
        </div>
        <div class="dropdown">
          <button type="button" class="btn btn-outline-primary" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><h6 class="dropdown-header">{{ userName }}</h6></li>
            <li><hr class="dropdown-divider"></li>
            <li><router-link class="dropdown-item" to="/user-options">Opciones de usuario</router-link></li>
            <li><a class="dropdown-item" href="#" @click="handleLogout" style="cursor: pointer;">Sign out</a></li>
          </ul>
        </div>
      </div>
    </div>
  </nav>

</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNavigationStore } from '../stores/navigation.js'
import { useAuthStore } from '../stores/auth.js'
import { useThemeStore } from '../stores/theme.js'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const navigationStore = useNavigationStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const { userName: storedUserName } = storeToRefs(authStore)

const navbarRef = ref(null)

const userName = computed(() => storedUserName.value || 'Usuario')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const breadcrumbs = computed(() => {
  const crumbs = []
  const pathSegments = route.path.split('/').filter(segment => segment)

  // Always start with Home, but since it's already in template, start from route

  if (route.name === 'Entities') {
    crumbs.push({ label: 'Entidades', path: '/entities' })
  } else if (route.name === 'Dashboard') {
    crumbs.push({ label: 'Entidades', path: '/entities' })
    if (route.params.companyId && navigationStore.selectedCompany) {
      crumbs.push({ label: navigationStore.selectedCompany.name, path: `/dashboard/${route.params.companyId}` })
    }
    if (route.params.farmId && navigationStore.selectedFarm) {
      crumbs.push({ label: navigationStore.selectedFarm.name, path: `/dashboard/${route.params.companyId}/${route.params.farmId}` })
    }
  } else if (route.name === 'Config') {
    crumbs.push({ label: 'Config', path: '/config' })
  } else if (route.name === 'UserOptions') {
    crumbs.push({ label: 'Opciones de Usuario', path: '/user-options' })
  }

  return crumbs
})

onMounted(async () => {
   await nextTick()
   console.log('Header.vue navbar offsetHeight:', navbarRef.value.offsetHeight)
})
</script>

<style scoped>
.navbar {
  height: 60px; /* Fixed header height */
  z-index: 1030; /* Above sidebar */
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
}
</style>