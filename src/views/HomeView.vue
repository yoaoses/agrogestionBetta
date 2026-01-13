<template>
  <div class="w-100 d-flex flex-column" :style="{ backgroundColor: 'var(--bg-primary)', minHeight: 'var(--content-height)' }">
    <main class="flex-grow-1 d-flex align-items-center justify-content-center p-3">
      <div class="container text-center">
        <h1 :style="{ color: 'var(--text-primary)' }" class="mb-5">Bienvenido a AgroGestión</h1>
        <div class="cards-container">
          <div class="card" @click="goToDashboard">
            <h3>Dashboard</h3>
            <p>Accede al panel de control principal</p>
          </div>
          <div class="card" @click="goToConfig">
            <h3>Configuración</h3>
            <p>Configura tu sistema</p>
          </div>
          <div class="card" @click="goToHelp">
            <h3>Ayuda</h3>
            <p>Obtén asistencia y soporte</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToConfig = () => {
  router.push('/config')
}

const goToHelp = () => {
  router.push('/user-options')
}
</script>

<style scoped>
.cards-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  width: 250px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card h3 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.card p {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>