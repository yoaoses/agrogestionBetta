console.log('Starting main.js');
import { createApp } from 'vue'
console.log('Imported Vue');
import 'bootstrap/dist/css/bootstrap.min.css'
console.log('Imported Bootstrap CSS');
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
console.log('Imported Bootstrap JS');
import '@popperjs/core'
console.log('Imported Popper.js');
import 'bootstrap-icons/font/bootstrap-icons.css'
console.log('Imported Bootstrap Icons CSS');
import './style.css'
console.log('Imported style.css');
import { createPinia } from 'pinia'
console.log('Pinia imported');
import App from './App.vue'
console.log('App imported');
import './api/api.js'
console.log('Attempting to import router');
import router from './router'
console.log('Router imported successfully');

console.log('Creating app');
const app = createApp(App).use(createPinia()).use(router)
console.log('App created');

// Initialize theme store
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
console.log('App mounted');
