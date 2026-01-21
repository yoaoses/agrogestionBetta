<template>
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
  </div>
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