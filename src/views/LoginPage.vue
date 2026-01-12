<template>
  <div class="min-h-screen bg-gradient-to-br from-agrotech-green to-agrotech-blue flex items-center justify-center p-4">
    <div class="bg-white bg-opacity-95 rounded-lg shadow-xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      <!-- Left Column -->
      <div class="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-agrotech-green/20 to-agrotech-blue/20">
        <img src="@/assets/images/logo.jpeg" alt="Logo Agrotech" class="w-32 h-32 mb-6 rounded-full shadow-lg">
        <h1 class="text-3xl font-bold text-neutral-dark mb-2 text-center">Bienvenido a AgroTech</h1>
        <p class="text-lg text-neutral-medium text-center">Innovación en agricultura sostenible</p>
      </div>
      <!-- Right Column -->
      <div class="flex flex-col justify-center p-8">
        <h2 class="text-2xl font-semibold text-neutral-dark mb-6 text-center">Iniciar Sesión</h2>
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="relative">
            <label for="username" class="block text-sm font-medium text-neutral-dark mb-2">Usuario</label>
            <div class="relative">
              <img src="@/assets/images/logo.jpeg" alt="Icon" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full">
              <input id="username" v-model="username" type="text" placeholder="Ingresa tu usuario" required class="w-full pl-12 pr-3 py-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-agrotech-blue focus:border-transparent bg-white shadow-sm">
            </div>
          </div>
          <div class="relative">
            <label for="password" class="block text-sm font-medium text-neutral-dark mb-2">Contraseña</label>
            <div class="relative">
              <img src="@/assets/images/logo.jpeg" alt="Icon" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full">
              <input id="password" v-model="password" type="password" placeholder="Ingresa tu contraseña" required class="w-full pl-12 pr-3 py-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-agrotech-blue focus:border-transparent bg-white shadow-sm">
            </div>
          </div>
          <button type="submit" :disabled="isLoading" class="w-full bg-gradient-to-r from-agrotech-blue to-agrotech-blue-light hover:from-agrotech-blue-light hover:to-agrotech-blue text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            {{ isLoading ? 'Cargando...' : 'Iniciar Sesión' }}
          </button>
        </form>
        <p v-if="error" class="mt-4 text-red-600 text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'
import logo from '../assets/images/logo.jpeg'

const { login, isLoading } = useAuth()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  const result = await login({ username: username.value, password: password.value })
  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>