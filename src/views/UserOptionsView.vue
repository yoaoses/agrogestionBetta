<template>
  <div class="container mt-5">
    <h1 class="mb-4">Opciones de Usuario</h1>
    <div class="row">
      <!-- Perfil de Usuario -->
      <div class="col-md-6">
        <div class="card mb-4 bg-secondary text-body">
          <div class="card-header bg-primary text-body">
            <h5 class="card-title mb-0">Perfil de Usuario</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="userName" class="form-label">Nombre</label>
              <input v-model="userProfile.name" type="text" class="form-control" id="userName" placeholder="Tu nombre">
            </div>
            <div class="mb-3">
              <label for="userEmail" class="form-label">Correo Electrónico</label>
              <input v-model="userProfile.email" type="email" class="form-control" id="userEmail" placeholder="tu@email.com">
            </div>
            <div class="mb-3">
              <label for="userRole" class="form-label">Rol</label>
              <select v-model="userProfile.role" class="form-select" id="userRole">
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
            <button @click="saveProfile" class="btn btn-primary">Guardar Perfil</button>
          </div>
        </div>
      </div>

      <!-- Cambiar Contraseña -->
      <div class="col-md-6">
        <div class="card mb-4 bg-secondary text-body">
          <div class="card-header bg-primary text-body">
            <h5 class="card-title mb-0">Cambiar Contraseña</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="currentPassword" class="form-label">Contraseña Actual</label>
              <input v-model="passwordData.current" type="password" class="form-control" id="currentPassword">
            </div>
            <div class="mb-3">
              <label for="newPassword" class="form-label">Nueva Contraseña</label>
              <input v-model="passwordData.new" type="password" class="form-control" id="newPassword">
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña</label>
              <input v-model="passwordData.confirm" type="password" class="form-control" id="confirmPassword">
            </div>
            <button @click="changePassword" class="btn btn-primary">Cambiar Contraseña</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preferencias -->
    <div class="row">
      <div class="col-md-6">
        <div class="card mb-4 bg-secondary text-body">
          <div class="card-header bg-primary text-body">
            <h5 class="card-title mb-0">Preferencias</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="language" class="form-label">Idioma</label>
              <select v-model="preferences.language" class="form-select" id="language">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div class="form-check mb-3">
              <input v-model="preferences.notifications" class="form-check-input" type="checkbox" id="notifications">
              <label class="form-check-label" for="notifications">Recibir Notificaciones</label>
            </div>
            <div class="form-check mb-3">
              <input v-model="preferences.darkMode" class="form-check-input" type="checkbox" id="darkMode">
              <label class="form-check-label" for="darkMode">Modo Oscuro</label>
            </div>
            <button @click="savePreferences" class="btn btn-primary">Guardar Preferencias</button>
          </div>
        </div>
      </div>

      <!-- Tema Personalizado -->
      <div class="col-md-6">
        <div class="card mb-4 bg-secondary text-body">
          <div class="card-header bg-primary text-body">
            <h5 class="card-title mb-0">Tema Personalizado</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="paletteJson" class="form-label">Pegar Paleta JSON</label>
              <textarea
                v-model="paletteJson"
                class="form-control"
                rows="6"
                placeholder='Ejemplo: {"primary": "#4CAF50", "secondary": "#FFC107", "accent": "#FF5722", "background": "#FFFFFF", "text": "#000000"}'
              ></textarea>
            </div>
            <button @click="applyPalette" class="btn btn-primary">Aplicar Tema</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const userProfile = ref({
  name: 'Usuario Ejemplo',
  email: 'usuario@ejemplo.com',
  role: 'user'
})

const passwordData = ref({
  current: '',
  new: '',
  confirm: ''
})

const preferences = ref({
  language: 'es',
  notifications: true,
  darkMode: false
})

const paletteJson = ref('')

const saveProfile = () => {
  // Lógica para guardar perfil
  alert('Perfil guardado exitosamente!')
}

const changePassword = () => {
  if (passwordData.value.new !== passwordData.value.confirm) {
    alert('Las contraseñas no coinciden')
    return
  }
  // Lógica para cambiar contraseña
  alert('Contraseña cambiada exitosamente!')
  passwordData.value = { current: '', new: '', confirm: '' }
}

const savePreferences = () => {
  // Lógica para guardar preferencias
  alert('Preferencias guardadas exitosamente!')
}

const applyPalette = () => {
  try {
    const palette = JSON.parse(paletteJson.value)
    const root = document.documentElement
    const mapping = {
      primary: '--bs-primary',
      secondary: '--bs-secondary',
      success: '--bs-success',
      danger: '--bs-danger',
      warning: '--bs-warning',
      info: '--bs-info',
      light: '--bs-light',
      dark: '--bs-dark',
      background: '--bs-body-bg',
      text: '--bs-body-color',
      accent: '--bs-info'
    }
    Object.keys(palette).forEach(key => {
      if (mapping[key]) {
        root.style.setProperty(mapping[key], palette[key])
      }
    })
    alert('Tema aplicado exitosamente!')
  } catch (error) {
    alert('Error al parsear JSON: ' + error.message)
  }
}
</script>

<style scoped>
</style>