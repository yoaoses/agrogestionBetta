<template>
  <div class="dots-loader" :class="{ 'small': size === 'small' }">
    <div class="spinner-grow" :class="{ 'spinner-grow-sm': size === 'small' }" style="animation-delay: 0s;"></div>
    <div class="spinner-grow" :class="{ 'spinner-grow-sm': size === 'small' }" style="animation-delay: 0.25s;"></div>
    <div class="spinner-grow" :class="{ 'spinner-grow-sm': size === 'small' }" style="animation-delay: 0.5s;"></div>
  </div>
</template>

<style scoped>
.dots-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.dots-loader.small {
  gap: 0.25rem;
}
</style>

<script>
export default {
  name: 'DotsLoader',
  props: {
    size: {
      type: String,
      default: 'medium'
    }
  }
}
</script>