import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'

export function useAuth() {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuth)
  const isLoading = computed(() => authStore.isLoading)

  const login = async (credentials) => {
    return await authStore.login(credentials)
  }

  const logout = () => {
    authStore.logout()
  }

  const verifyToken = async () => {
    return await authStore.verifyToken()
  }

  // Verificar token al montar el composable si hay token
  onMounted(async () => {
    if (authStore.token && !authStore.isAuthenticated) {
      await verifyToken()
    }
  })

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    verifyToken
  }
}