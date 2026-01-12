<script setup>
import NavBar from './components/NavBar.vue'
import { useRoute } from 'vue-router'
import { onMounted, watch } from 'vue'
import { useThemeStore } from './stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

onMounted(() => {
  const appEl = document.getElementById('app')
  updatePadding(appEl)
  // Aplicar tema inicial
  themeStore.setTheme(themeStore.theme)
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
  <div>
    <NavBar class="sticky-top" v-if="route.path !== '/login' && route.path !== '/'" />
    <router-view :class="{ 'full-screen': route.path === '/login' }" />
  </div>
</template>

<style scoped>
</style>
