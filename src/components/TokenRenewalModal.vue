<!-- src/components/TokenRenewalModal.vue - Modal para renovación de token -->
<template>
  <div class="modal fade" id="tokenRenewalModal" tabindex="-1" aria-labelledby="tokenRenewalModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body p-0">
          <div class="row g-0">
            <!-- Columna izquierda: imagen -->
            <div class="col-md-6 position-relative" :style="{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: '400px' }">
              <!-- Overlay para legibilidad -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5);"></div>
            </div>

            <!-- Columna derecha: formulario -->
            <div class="col-md-6 d-flex flex-column justify-content-center p-4">
              <h2 class="text-center mb-4 text-agrotech-green fw-bold">Sesión expirada</h2>

              <form @submit.prevent="handleRenewal">
                <div class="mb-3">
                  <label class="form-label text-dark">Correo electrónico</label>
                  <input
                    v-model="email"
                    type="email"
                    required
                    class="form-control rounded-pill"
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
                    class="form-control rounded-pill"
                    placeholder="••••••••"
                  />
                  <div v-if="capsLockOn && isPasswordFocused" class="alert alert-danger mt-2">¡Mayúsculas activadas! (Caps Lock ON)</div>
                </div>

                <div class="mb-3">
                  <button
                    type="submit"
                    :disabled="authStore.isLoading"
                    class="btn btn-success rounded-pill w-100"
                  >
                    {{ authStore.isLoading ? 'Renovando...' : 'Renovar Sesión' }}
                  </button>
                </div>

                <div class="mb-3">
                  <button
                    type="button"
                    class="btn btn-secondary rounded-pill w-100"
                    data-bs-dismiss="modal"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

              <!-- Toast dentro del modal -->
              <Toast v-if="showToast" :message="toastMessage" @close="showToast = false" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import backgroundImage from '@/assets/images/loginbg.jpeg'
import Toast from '@/components/Toast.vue'
import * as bootstrap from 'bootstrap'

export default {
  name: 'TokenRenewalModal',
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
    // Mostrar el modal si está activado
    if (this.authStore.showTokenRenewalModal) {
      this.showModal();
    }
    // Escuchar cuando se oculta el modal para resetear flags
    document.getElementById('tokenRenewalModal').addEventListener('hidden.bs.modal', () => {
      this.authStore.showTokenRenewalModal = false;
      this.authStore.isRenewingToken = false;
    });
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeydown);
    document.getElementById('tokenRenewalModal').removeEventListener('hidden.bs.modal', () => {
      this.authStore.showTokenRenewalModal = false;
      this.authStore.isRenewingToken = false;
    });
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
    showModal() {
      const modal = new bootstrap.Modal(document.getElementById('tokenRenewalModal'));
      modal.show();
    },
    async handleRenewal() {
      const result = await this.authStore.login({ email: this.email, password: this.password })
      if (result.success) {
        // Cerrar el modal después de renovación exitosa
        const modal = bootstrap.Modal.getInstance(document.getElementById('tokenRenewalModal'));
        if (modal) {
          modal.hide();
          modal.dispose();
        }
        // Limpiar campos
        this.email = '';
        this.password = '';
      } else {
        this.toastMessage = result.error || "Credenciales incorrectas"
        this.showToast = true
      }
    }
  }
}
</script>

<style scoped>
.modal-content {
  border: none;
  border-radius: 10px;
  overflow: hidden;
}
</style>