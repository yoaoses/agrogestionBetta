<template>
  <button
    @click="toggleTheme"
    class="btn btn-outline-secondary ms-3"
    :aria-label="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
  >
    <!-- Icono de sol para tema claro -->
    <i v-if="!isDark" class="bi bi-sun text-warning"></i>
    <!-- Icono de luna para tema oscuro -->
    <i v-else class="bi bi-moon text-secondary"></i>
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