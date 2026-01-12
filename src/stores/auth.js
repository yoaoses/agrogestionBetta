import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    showLoginModal: false,
    intendedRoute: null
  }),
  getters: {
    isAuth: (state) => !!state.token && state.isAuthenticated
  },
  actions: {
    async login(credentials) {
      console.log('AuthStore login iniciado con credentials:', credentials)
      this.isLoading = true
      try {
        const response = await window.api.login(credentials)
        console.log('Respuesta de API login:', response)
        console.log('response.data:', JSON.stringify(response.data, null, 2))
        const { token, user } = response.data.data
        console.log('Token y user extraídos:', token, user)
        this.token = token
        this.user = user
        this.isAuthenticated = true
        localStorage.setItem('token', token)
        window.api.setAuthToken(token)
        console.log('Login exitoso, estado actualizado - token:', this.token, 'isAuthenticated:', this.isAuthenticated, 'isAuth:', this.isAuth)
        return { success: true }
      } catch (error) {
        console.error('Error en login:', error)
        this.logout()
        return { success: false, error: error.response?.data?.message || 'Error al iniciar sesión' }
      } finally {
        this.isLoading = false
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      window.api.setAuthToken(null)
    },
    async verifyToken() {
      console.log('verifyToken iniciado - token:', this.token)
      if (!this.token) {
        console.log('No hay token, isAuthenticated = false')
        this.isAuthenticated = false
        return false
      }
      this.isLoading = true
      try {
        window.api.setAuthToken(this.token)
        console.log('Llamando a getCompanies para verificar token')
        await window.api.getCompanies()
        console.log('getCompanies exitoso, isAuthenticated = true')
        this.isAuthenticated = true
        return true
      } catch (error) {
        console.error('Error en verifyToken:', error)
        this.logout()
        return false
      } finally {
        this.isLoading = false
      }
    },
    showLoginModal() {
      this.showLoginModal = true
    },
    setIntendedRoute(route) {
      this.intendedRoute = route
    },
    clearIntendedRoute() {
      this.intendedRoute = null
    }
  }
})
