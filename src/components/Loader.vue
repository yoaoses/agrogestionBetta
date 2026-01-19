<template>
  <div class="loader-container">
    <div v-if="type === 'dots'" class="dots-loader" :class="{ 'small': size === 'small' }">
      <div class="spinner-grow text-success" :class="{ 'spinner-grow-sm': size === 'small' }" style="animation-delay: 0s;"></div>
      <div class="spinner-grow text-success" :class="{ 'spinner-grow-sm': size === 'small' }" style="animation-delay: 0.25s;"></div>
      <div class="spinner-grow text-success" :class="{ 'spinner-grow-sm': size === 'small' }" style="animation-delay: 0.5s;"></div>
    </div>
    <div v-else-if="type === 'progress'" class="progress-loader">
      <div class="progress">
        <div class="progress-bar bg-success" :style="{ width: value + '%' }" role="progressbar" :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </div>
    <p v-if="computedLabel" class="loader-label">{{ computedLabel }}</p>
  </div>
</template>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.dots-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.dots-loader.small {
  gap: 0.25rem;
}

.spinner-grow {
  background-color: var(--agrotech-green) !important;
}

.progress-loader {
  width: 100%;
  max-width: 300px;
}

.progress-bar {
  background-color: var(--agrotech-green) !important;
}

.loader-label {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}
</style>

<script>
export default {
  name: 'Loader',
  props: {
    type: {
      type: String,
      default: 'dots',
      validator: value => ['dots', 'progress'].includes(value)
    },
    label: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'small',
      validator: value => ['small', 'medium'].includes(value)
    },
    value: {
      type: Number,
      default: 0
    }
  },
  computed: {
    computedLabel() {
      return this.label || (this.type === 'dots' ? 'Esperando al servidor...' : 'Cargando datos... Realizando cálculos...');
    }
  }
}
</script>