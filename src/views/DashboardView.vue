<template>
  <div class="dashboard-layout">
    <!-- Panel lateral (1/4) -->
    <div class="sidebar">
      <h2>Panel Lateral</h2>
      <p>Contenido del panel lateral aquí.</p>
      <!-- Puedes agregar navegación o información adicional -->
    </div>

    <!-- Contenido principal (3/4) -->
    <div class="main-content">
      <h2>Dashboard</h2>
      <p>Contenido principal del dashboard aquí.</p>
      <!-- Aquí puedes incluir componentes como gráficos, tablas, etc. -->
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// Puedes acceder a route.params.companyId y route.params.farmId aquí
console.log('Company ID:', route.params.companyId)
console.log('Farm ID:', route.params.farmId)
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  height: var(--content-height);
  overflow: auto;
}

.sidebar {
  flex: 1;
  padding: 1rem;
  border-right: 1px solid var(--neutral-medium);
  overflow: auto;
}

.main-content {
  flex: 3;
  padding: 1rem;
  overflow: auto;
}
</style>