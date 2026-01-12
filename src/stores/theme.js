import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'light',
    mediaQuery: null,
    listener: null
  }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    initTheme() {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.setTheme(savedTheme, true)
      } else {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        this.listener = (e) => {
          this.setTheme(e.matches ? 'dark' : 'light', false)
        }
        this.mediaQuery.addEventListener('change', this.listener)
        this.setTheme(this.mediaQuery.matches ? 'dark' : 'light', false)
      }
    },
    setTheme(theme, isManual = false) {
      console.log('Setting theme to:', theme)
      this.theme = theme
      if (isManual) {
        localStorage.setItem('theme', theme)
        if (this.listener) {
          this.mediaQuery.removeEventListener('change', this.listener)
          this.listener = null
          this.mediaQuery = null
        }
      }
      document.body.setAttribute('data-bs-theme', theme)
      // Also toggle .dark class for custom CSS
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      console.log('data-bs-theme set to:', document.body.getAttribute('data-bs-theme'))
      console.log('html classList:', document.documentElement.classList.toString())
    },
    toggleTheme() {
      const newTheme = this.theme === 'light' ? 'dark' : 'light'
      this.setTheme(newTheme, true)
    }
  }
})