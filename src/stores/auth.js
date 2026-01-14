import { defineStore } from 'pinia'
import { login, setAuthToken } from '../api/api.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    userEmail: localStorage.getItem('userEmail') || null,
    userName: localStorage.getItem('userName') || null,
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
        const response = await login(credentials)
        console.log('Respuesta de API login:', response)
        console.log('response.data:', JSON.stringify(response.data, null, 2))
        const { token, user } = response.data
        console.log('Token extraído:', token)
        console.log('Usuario extraído:', user)
        this.token = token
        this.user = user
        this.userEmail = user.email || user.userEmail
        this.userName = user.name || user.userName
        this.isAuthenticated = true
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('userEmail', this.userEmail)
        localStorage.setItem('userName', this.userName)
        setAuthToken(token)
        console.log('Login exitoso, estado actualizado - token:', this.token, 'userName:', this.userName, 'isAuthenticated:', this.isAuthenticated, 'isAuth:', this.isAuth)
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
      this.userEmail = null
      this.userName = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userName')
      setAuthToken(null)
    },
    async verifyToken() {
      if (!this.token) {
        this.isAuthenticated = false
        return false
      }
      setAuthToken(this.token)
      this.isAuthenticated = true
      return true
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
