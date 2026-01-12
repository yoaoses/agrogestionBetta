import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import CampoDataLogin from '../views/CampoDataLogin.vue'
import ConfigView from '../views/ConfigView.vue'
import ThemeTestView from '../views/ThemeTestView.vue'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: CampoDataLogin // or a placeholder, but we'll redirect
  },
  {
    path: '/login',
    name: 'Login',
    component: CampoDataLogin
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: LandingView,
    meta: { requiresAuth: true }
  },
  {
    path: '/config',
    name: 'Config',
    component: ConfigView,
    meta: { requiresAuth: true }
  },
  {
    path: '/theme-test',
    name: 'ThemeTest',
    component: ThemeTestView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guard de navegación
router.beforeEach(async (to, from, next) => {
  console.log('Guard ejecutándose - to:', to.path, 'from:', from.path)
  const authStore = useAuthStore()
  console.log('AuthStore - token:', authStore.token, 'isAuthenticated:', authStore.isAuthenticated, 'isAuth:', authStore.isAuth)
  // Verificar token si hay token pero no está autenticado
  if (authStore.token && !authStore.isAuthenticated) {
    console.log('Verificando token...')
    await authStore.verifyToken()
    console.log('Después de verifyToken - isAuthenticated:', authStore.isAuthenticated, 'isAuth:', authStore.isAuth)
  }

  if (to.path === '/') {
    console.log('Ruta / - isAuth:', authStore.isAuth)
    if (authStore.isAuth) {
      console.log('Redirigiendo a /dashboard desde /')
      next('/dashboard')
    } else {
      console.log('Redirigiendo a /login desde /')
      next('/login')
    }
  } else if (to.path === '/login') {
    console.log('Ruta /login - isAuth:', authStore.isAuth)
    if (authStore.isAuth) {
      console.log('Usuario autenticado en /login, redirigiendo a /dashboard')
      next('/dashboard')
    } else {
      console.log('Usuario no autenticado en /login, permitiendo')
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresAuth)) {
    console.log('Ruta protegida:', to.path, '- isAuth:', authStore.isAuth)
    if (!authStore.isAuth) {
      console.log('No autenticado, guardando intendedRoute:', to.fullPath, 'y redirigiendo a /login')
      authStore.setIntendedRoute(to.fullPath)
      next('/login')
    } else {
      console.log('Autenticado, permitiendo acceso a:', to.path)
      next()
    }
  } else {
    console.log('Ruta no protegida:', to.path, '- permitiendo')
    next()
  }
})

export default router