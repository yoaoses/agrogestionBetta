<script setup>
import NavBar from './components/NavBar.vue'
import Header from './components/Header.vue'
import { useRoute } from 'vue-router'
import { onMounted, watch, ref, nextTick } from 'vue'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const mainContentRef = ref(null)
const appLayoutRef = ref(null)
const contentAreaRef = ref(null)

onMounted(async () => {
   console.log('window.innerHeight:', window.innerHeight)
   const appEl = document.getElementById('app')
   updatePadding(appEl)
   // Aplicar tema inicial
   themeStore.setTheme(themeStore.theme)
   // Verificar token si existe
   if (authStore.token) {
     await authStore.verifyToken()
   }
   await nextTick()
   console.log('app-layout:', appLayoutRef.value.offsetHeight)
   console.log('content-area:', contentAreaRef.value.offsetHeight)
   console.log('main-content:', mainContentRef.value.offsetHeight)
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
  <div ref="appLayoutRef" class="app-layout">
    <Header v-if="route.path !== '/login' && (route.path !== '/' || authStore.isAuth)" />
    <div ref="contentAreaRef" :class="route.path === '/login' ? 'campo-content-area' : 'content-area'">
      <NavBar v-if="route.path !== '/login' && (route.path !== '/' || authStore.isAuth)" />
      <main ref="mainContentRef" :class="[route.path === '/login' ? 'campo-main-content' : 'main-content', { 'with-sidebar': route.path !== '/login' && (route.path !== '/' || authStore.isAuth) }]">
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
  max-height: calc(100vh - 60px);
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.main-content.with-sidebar {
  margin-left: 250px; /* Ancho del sidebar */
}

.campo-content-area {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
}

.campo-main-content {
  flex: 1;
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
