import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@popperjs/core'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.scss'
import { createPinia } from 'pinia'
import App from './App.vue'
import './api/api.js'
import router from './router'
import HighchartsVue from 'highcharts-vue'
import Highcharts from 'highcharts/highstock'
import Loader from './components/Loader.vue'

const app = createApp(App).use(createPinia()).use(router).use(HighchartsVue, { Highcharts })

app.component('Loader', Loader)

// Initialize theme store
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()
themeStore.initTheme()

// Set auth store instance for API interceptors
import { setAuthStoreInstance } from './api/api.js'
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
setAuthStoreInstance(authStore)

app.mount('#app')
