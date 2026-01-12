<template>
  <div class="tabs">
    <div class="d-flex">
      <div v-for="tab in tabs" :key="tab" @click="$emit('update:modelValue', tab)" :class="['p-2', modelValue === tab ? 'bg-primary text-white' : 'bg-light']">
        {{ tab }}
      </div>
    </div>
    <div class="tab-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: Array,
  modelValue: String
})

defineEmits(['update:modelValue'])
</script>
