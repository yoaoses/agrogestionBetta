import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import EntitiesView from '../views/EntitiesView.vue'
import CampoDataLogin from '../views/CampoDataLogin.vue'
import ConfigView from '../views/ConfigView.vue'
import HomeView from '../views/HomeView.vue'
import UserOptionsView from '../views/UserOptionsView.vue'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: CampoDataLogin
  },
  {
    path: '/entities',
    name: 'Entities',
    component: EntitiesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/:companyId?/:farmId?',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/config',
    name: 'Config',
    component: ConfigView,
    meta: { requiresAuth: true }
  },
  {
    path: '/user-options',
    name: 'UserOptions',
    component: UserOptionsView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guard de navegación
router.beforeEach(async (to, from, next) => {
// console.log('Guard ejecutándose - to:', to.path, 'from:', from.path)
  const authStore = useAuthStore()
// console.log('AuthStore - token:', authStore.token, 'isAuthenticated:', authStore.isAuthenticated, 'isAuth:', authStore.isAuth)

  if (to.path === '/login') {
// console.log('Ruta /login - isAuth:', authStore.isAuth)
    if (authStore.isAuth) {
// console.log('Usuario autenticado en /login, redirigiendo a /entities')
      next('/entities')
    } else {
// console.log('Usuario no autenticado en /login, permitiendo')
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresAuth)) {
    // console.log('Ruta protegida:', to.path, '- isAuth:', authStore.isAuth)
    if (to.path === '/user-options') {
      // console.log('Intentando acceder a /user-options')
      // console.log('isAuth:', authStore.isAuth, 'token:', authStore.token)
    }
    if (!authStore.isAuth) {
      // console.log('No autenticado, guardando intendedRoute:', to.fullPath, 'y redirigiendo a /login')
      authStore.setIntendedRoute(to.fullPath)
      next('/login')
    } else {
      // console.log('Autenticado, permitiendo acceso a:', to.path)
      next()
    }
  } else {
// console.log('Ruta no protegida:', to.path, '- permitiendo')
    next()
  }
})

export default router