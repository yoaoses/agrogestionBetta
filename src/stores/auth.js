import { defineStore } from 'pinia'
import { login, setAuthToken } from '../api/api.js'

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null
    try {
      user = JSON.parse(localStorage.getItem('user')) || null
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
    }
    return {
      token: localStorage.getItem('token') || null,
      user,
      userEmail: localStorage.getItem('userEmail') || null,
      userName: localStorage.getItem('userName') || null,
      isAuthenticated: false,
      isLoading: false,
      showLoginModal: false,
      intendedRoute: null,
      isRenewingToken: false,
      showTokenRenewalModal: false
    }
  },
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
        try {
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('userEmail', this.userEmail)
          localStorage.setItem('userName', this.userName)
        } catch (error) {
          console.error('Error saving to localStorage in login:', error)
        }
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
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
      } catch (error) {
        console.error('Error removing from localStorage in logout:', error)
      }
      setAuthToken(null)
    },
    async verifyToken() {
      if (!this.token) {
        this.isAuthenticated = false
        return false
      }
      setAuthToken(this.token)
      try {
        this.user = JSON.parse(localStorage.getItem('user')) || null
      } catch (error) {
        console.error('Error parsing user from localStorage in verifyToken:', error)
        this.user = null
      }
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
