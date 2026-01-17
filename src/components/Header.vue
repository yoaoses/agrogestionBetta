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
          <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item" :class="{ active: index === breadcrumbs.length - 1 }">
            <span v-if="index === breadcrumbs.length - 1">
              <i v-if="index === 0" class="bi bi-house-door"></i> {{ crumb.label }}
            </span>
            <router-link v-else :to="crumb.path" class="text-decoration-none">
              <i v-if="index === 0" class="bi bi-house-door"></i> {{ crumb.label }}
            </router-link>
          </li>
        </ol>
      </nav>


      <!-- Theme Switch and User Dropdown -->
      <div class="d-flex align-items-center gap-2 flex-shrink-0">
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
        <div ref="dropdownContainerRef" class="dropdown">
           <button ref="dropdownButtonRef" type="button" class="btn btn-outline-primary dropdown-toggle" aria-expanded="false" @click="handleDropdownClick">
             <i class="bi bi-person-circle me-1"></i>{{ userName }}
           </button>
           <ul class="dropdown-menu dropdown-menu-end">
              <li><router-link class="dropdown-item" to="/user-options" @click="safeHideDropdown()">Opciones de usuario</router-link></li>
             <li><hr class="dropdown-divider"></li>
             <li><a class="dropdown-item" href="#" @click="handleLogout(); safeHideDropdown()" style="cursor: pointer;">Cerrar sesión</a></li>
           </ul>
         </div>
      </div>
    </div>
  </nav>

</template>

<script setup>
import { computed, ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNavigationStore } from '../stores/navigation.js'
import { useAuthStore } from '../stores/auth.js'
import { useThemeStore } from '../stores/theme.js'
import { storeToRefs } from 'pinia'
import * as bootstrap from 'bootstrap'

const route = useRoute()
const router = useRouter()
const navigationStore = useNavigationStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const { userName: storedUserName } = storeToRefs(authStore)

const navbarRef = ref(null)
const dropdownButtonRef = ref(null)
const dropdownRef = ref(null)
const dropdownContainerRef = ref(null)
const isDropdownOpen = ref(false)
const userName = computed(() => storedUserName.value || 'Usuario')


const handleLogout = () => {

  authStore.logout()
  router.push('/login')
}

const handleDropdownClick = () => {
  if (dropdownRef.value) {
    dropdownRef.value.toggle()
  } else {
    console.warn('dropdownRef.value is null')
  }
}

const safeHideDropdown = () => {
  if (dropdownRef.value) {
    dropdownRef.value.hide()
  }
}

const handleClickOutside = (event) => {
  if (isDropdownOpen.value && dropdownContainerRef.value && !dropdownContainerRef.value.contains(event.target)) {
    safeHideDropdown()
  }
}


const breadcrumbs = computed(() => {
  const crumbs = [{ label: 'Inicio', path: '/' }]

  if (route.name === 'Entities') {
    crumbs.push({ label: 'Entidades', path: '/entities' })
  } else if (route.name === 'Dashboard') {
    crumbs.push({ label: 'Entidades', path: '/entities' })
    if (navigationStore.selectedCompany) {
      crumbs.push({ label: navigationStore.selectedCompany.name, path: `/dashboard/${navigationStore.selectedCompany.id}` })
    }
    if (navigationStore.selectedFarm) {
      crumbs.push({ label: navigationStore.selectedFarm.name, path: `/dashboard/${navigationStore.selectedCompany?.id}/${navigationStore.selectedFarm.id}` })
    }
  } else if (route.name === 'Config') {
    crumbs.push({ label: 'Config', path: '/config' })
  } else if (route.name === 'UserOptions') {
    crumbs.push({ label: 'Opciones de Usuario', path: '/user-options' })
  } else {
    // Para otras vistas, mostrar selección actual si existe
    if (navigationStore.selectedCompany) {
      crumbs.push({ label: 'Entidades', path: '/entities' })
      crumbs.push({ label: navigationStore.selectedCompany.name, path: `/dashboard/${navigationStore.selectedCompany.id}` })
      if (navigationStore.selectedFarm) {
        crumbs.push({ label: navigationStore.selectedFarm.name, path: `/dashboard/${navigationStore.selectedCompany.id}/${navigationStore.selectedFarm.id}` })
      }
    }
  }

  return crumbs
})

watch(() => navigationStore.selectedCompany, (newVal, oldVal) => {
})

watch(() => navigationStore.selectedFarm, (newVal, oldVal) => {
})

onMounted(async () => {
    await nextTick()
    if (dropdownButtonRef.value) {
      try {
        dropdownRef.value = new bootstrap.Dropdown(dropdownButtonRef.value)
        dropdownButtonRef.value.addEventListener('shown.bs.dropdown', () => {
          isDropdownOpen.value = true
        })
        dropdownButtonRef.value.addEventListener('hidden.bs.dropdown', () => {
          isDropdownOpen.value = false
        })
        document.addEventListener('click', handleClickOutside)
      } catch (error) {
        console.error('Error creating dropdown:', error)
      }
    }
    if (navigationStore.companies.length === 0) {
      await navigationStore.loadCompanies()
      await navigationStore.loadAllFarms()
    }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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