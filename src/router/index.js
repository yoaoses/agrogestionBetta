import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import EntitiesView from '../views/EntitiesView.vue'
import CampoDataLogin from '../views/CampoDataLogin.vue'
import ConfigView from '../views/ConfigView.vue'
import HomeView from '../views/HomeView.vue'
import UserOptionsView from '../views/UserOptionsView.vue'
import ApiTestView from '../views/ApiTestView.vue'
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
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: ApiTestView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guard de navegación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.path === '/login') {
    if (authStore.isAuth) {
      next('/entities')
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresAuth)) {
    if (to.path === '/user-options') {
    }
    if (!authStore.isAuth) {
      authStore.setIntendedRoute(to.fullPath)
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router