<!-- src/views/CampoDataLogin.vue - Versión full-screen optimizada -->
<template>
  <div class="d-flex flex-row" style="min-height: 100vh;">
    <!-- Columna izquierda: 1/3, formulario y texto -->
    <div class="col-12 col-lg-6 position-relative d-flex flex-column justify-content-center align-items-center p-3 p-lg-5">
      <!-- Fondo con overlay -->
      <div class="position-absolute top-0 start-0 w-100 h-100"
           :style="{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }">
        <!-- Overlay para transparencia -->
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8);"></div>
      </div>
      <!-- Texto grande -->
      <div class="text-center text-lg-start mb-4 position-relative" style="z-index: 10;">
        <h1 class="display-3 display-lg-1 fw-bold mb-4 text-success">
          <i class="bi bi-tree-fill fs-1 me-2"></i>AgroGestión
        </h1>
        <p class="fs-5 fs-lg-4 text-dark">
          Gestión inteligente para tu campo. Accede a tus datos y optimiza tu producción agrícola.
        </p>
      </div>

      <!-- Formulario de login -->
      <div class="w-100" style="position: relative; z-index: 10;">
        <div class="text-center mb-4">
          <h2 class="display-5 display-lg-4 fw-bold text-success">
            Iniciar Sesión
          </h2>
        </div>

        <form @submit.prevent="handleLogin">

          <div class="mb-3">
            <label class="form-label text-dark">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              required
              class="form-control form-control-lg rounded-pill mx-auto"
              style="width: 90%;"
              placeholder="tu@agrogestion.com"
            />
          </div>

          <div class="mb-3">
            <label class="form-label text-dark">Contraseña</label>
            <input
              v-model="password"
              type="password"
              required
              @focus="isPasswordFocused = true"
              @blur="isPasswordFocused = false"
              @keydown="checkCapsLock"
              @keyup="checkCapsLock"
              class="form-control form-control-lg rounded-pill mx-auto"
              style="width: 90%;"
              placeholder="••••••••"
            />
            <div v-if="capsLockOn && isPasswordFocused" class="alert alert-danger">¡Mayúsculas activadas! (Caps Lock ON)</div>
          </div>

          <div class="mb-3">
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="btn btn-success rounded-pill mx-auto"
              style="width: 100%;"
            >
              {{ authStore.isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}
            </button>
          </div>
        </form>

        <p class="text-center mt-3 text-muted fs-6">
          <a href="#" class="text-primary">¿Olvidaste tu contraseña?</a>
        </p>
      </div>
    </div>

    <!-- Columna derecha: 2/3, imagen de fondo -->
    <div class="col-12 col-lg-6 position-relative"
         :style="{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: '100vh' }">
      <!-- Overlay gradiente para legibilidad -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent);"></div>
    </div>

    <!-- Toast -->
    <Toast v-if="showToast" :message="toastMessage" @close="showToast = false" />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import backgroundImage from '@/assets/images/loginbg.jpeg'
import Toast from '@/components/Toast.vue'

export default {
  components: {
    Toast
  },
  data() {
    return {
      email: '',
      password: '',
      backgroundImage: backgroundImage,
      showToast: false,
      toastMessage: '',
      capsLockOn: false,
      isPasswordFocused: false
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleGlobalKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeydown);
  },
  methods: {
    checkCapsLock(event) {
      this.capsLockOn = event.getModifierState('CapsLock');
    },
    handleGlobalKeydown(event) {
      if (this.isPasswordFocused) {
        this.capsLockOn = event.getModifierState('CapsLock');
      }
    },
    async handleLogin() {
      console.log('Iniciando login con email:', this.email)
      const result = await this.authStore.login({ email: this.email, password: this.password })
      console.log('Resultado del login:', result)
      console.log('Estado del authStore después del login - isAuth:', this.authStore.isAuth, 'token:', this.authStore.token, 'isAuthenticated:', this.authStore.isAuthenticated)
      if (result.success) {
        console.log('Login exitoso, redirigiendo')
        console.log('intendedRoute antes de redirigir:', this.authStore.intendedRoute)
        const route = '/'
        console.log('Ruta a redirigir:', route)
        this.authStore.clearIntendedRoute()
        console.log('intendedRoute después de clear:', this.authStore.intendedRoute)
        console.log('Intentando router.push a:', route)
        try {
          await this.$router.push(route)
          console.log('Router.push ejecutado exitosamente')
        } catch (error) {
          console.error('Error en router.push:', error)
        }
      } else {
        console.log('Login fallido:', result.error)
        this.toastMessage = result.error || "Credenciales incorrectas"
        this.showToast = true
      }
    }
  }
}
</script>