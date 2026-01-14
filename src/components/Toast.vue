<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
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
