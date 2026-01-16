<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div class="toast show" :class="`toast-${type}`" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">Notificación</strong>
        <button type="button" class="btn-close" @click="closeToast"></button>
      </div>
      <div class="toast-body">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 3000 // 3 seconds
    },
    type: {
      type: String,
      default: 'info'
    }
  },
  mounted() {
    setTimeout(() => {
      this.closeToast();
    }, this.duration);
  },
  methods: {
    closeToast() {
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
.toast-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
}

.toast-success {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.toast-warning {
  background-color: #fff3cd;
  border-color: #ffeaa7;
}

.toast-danger {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
</style>
