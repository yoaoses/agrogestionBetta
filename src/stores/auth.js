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
    intendedRoute: null,
    isRenewingToken: false,
    showTokenRenewalModal: false
  }),
  getters: {
    isAuth: (state) => !!state.token && state.isAuthenticated
  },
  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await login(credentials)
        const { token, user } = response.data.data
        this.token = token
        this.user = user
        this.userEmail = user.email || user.userEmail
        this.userName = user.name || user.userName
        this.isAuthenticated = true
        this.isRenewingToken = false // Resetear flag de renovación
        this.showTokenRenewalModal = false // Cerrar modal
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('userEmail', this.userEmail)
        localStorage.setItem('userName', this.userName)
        setAuthToken(token)
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
      this.user = JSON.parse(localStorage.getItem('user')) || null
      this.userEmail = localStorage.getItem('userEmail') || null
      this.userName = localStorage.getItem('userName') || null
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
