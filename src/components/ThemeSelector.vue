<template>
  <button
    @click="toggleTheme"
    class="btn btn-outline d-flex justify-content-center align-items-center"
    style="width: 32px; height: 32px;"
    :aria-label="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
  >
    <!-- Icono de luna para tema claro -->
    <i v-if="!isDark" class="bi bi-moon-stars-fill"></i>
    <!-- Icono de sol para tema oscuro -->
    <i v-else class="bi bi-brightness-high-fill"></i>
  </button>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
const { toggleTheme } = themeStore

onMounted(() => {
  themeStore.initTheme()
})
</script>