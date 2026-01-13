<script setup>
import NavBar from './components/NavBar.vue'
import Header from './components/Header.vue'
import { useRoute } from 'vue-router'
import { onMounted, watch } from 'vue'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()

onMounted(async () => {
  const appEl = document.getElementById('app')
  updatePadding(appEl)
  // Aplicar tema inicial
  themeStore.setTheme(themeStore.theme)
  // Verificar token si existe
  if (authStore.token) {
    await authStore.verifyToken()
  }
})

watch(route, (newRoute) => {
  const appEl = document.getElementById('app')
  updatePadding(appEl)
})

function updatePadding(appEl) {
  if (route.path === '/login') {
    appEl.classList.add('no-padding')
  } else {
    appEl.classList.remove('no-padding')
  }
}

</script>

<template>
  <div class="app-layout">
    <Header v-if="route.path !== '/login' && (route.path !== '/' || authStore.isAuth)" />
    <div class="content-area">
      <NavBar v-if="route.path !== '/login' && (route.path !== '/' || authStore.isAuth)" />
      <main class="main-content" :class="{ 'with-sidebar': route.path !== '/login' && (route.path !== '/' || authStore.isAuth) }">
        <router-view :class="{ 'full-screen': route.path === '/login' }" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.content-area {
  display: flex;
  min-height: calc(100vh - 60px);
  margin-top: 60px;
}

.main-content {
  flex: 1;
  transition: margin-left 0.3s ease;
}

.main-content.with-sidebar {
  margin-left: 250px; /* Ancho del sidebar */
}
</style>
