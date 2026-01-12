<template>
  <div class="modal fade" :class="{ 'show d-block': showModal }" tabindex="-1" @click.self="closeModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Reingresar</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label class="form-label">Usuario</label>
              <input v-model="username" type="text" class="form-control" placeholder="Usuario" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Contraseña</label>
              <input v-model="password" type="password" class="form-control" placeholder="Contraseña" required>
            </div>
            <button type="submit" :disabled="isLoading" class="btn btn-primary w-100">Iniciar Sesión</button>
          </form>
          <p v-if="error" class="text-danger mt-2">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showModal" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useAuthStore } from '../stores/auth.js'

const { login, isLoading } = useAuth()
const authStore = useAuthStore()

const showModal = computed(() => authStore.showLoginModal)
const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  const result = await login({ username: username.value, password: password.value })
  if (result.success) {
    authStore.showLoginModal = false
    username.value = ''
    password.value = ''
    const router = useRouter()
    const route = authStore.intendedRoute || '/dashboard'
    authStore.clearIntendedRoute()
    router.push(route)
  } else {
    error.value = result.error
  }
}

const closeModal = () => {
  authStore.showLoginModal = false
}
</script>
