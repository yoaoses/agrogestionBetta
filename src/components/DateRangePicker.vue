<template>
  <div class="presets btn-group mb-3 d-flex justify-content-center" role="group">
    <button class="btn btn-outline-primary btn-sm" :class="{ active: selectedPreset === 'months-3' }" @click="setPreset('months', 3)">3 meses</button>
    <button class="btn btn-outline-primary btn-sm" :class="{ active: selectedPreset === 'months-6' }" @click="setPreset('months', 6)">6 meses</button>
    <button class="btn btn-outline-primary btn-sm" :class="{ active: selectedPreset === 'years-1' }" @click="setPreset('years', 1)">1 año</button>
    <button class="btn btn-outline-primary btn-sm" :class="{ active: selectedPreset === 'years-2' }" @click="setPreset('years', 2)">2 años</button>
    <button class="btn btn-outline-primary btn-sm" :class="{ active: selectedPreset === 'years-3' }" @click="setPreset('years', 3)">3 años</button>
  </div>
  <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
    <label class="form-label mb-0">Desde:</label>
    <input
      type="date"
      class="form-control form-control-sm"
      v-model="startDate"
      lang="es-CL"
      @change="handleStartChange"
    />
    <label class="form-label mb-0">Hasta:</label>
    <input
      type="date"
      class="form-control form-control-sm"
      v-model="endDate"
      lang="es-CL"
      @change="handleEndChange"
    />
  </div>
  <div v-if="message" :class="alertClass" class="mt-2 text-center">
    {{ message }}
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useDateRangeStore } from '../stores/dateRange.js'

const dateRangeStore = useDateRangeStore()

const startDate = ref(dateRangeStore.startDate)
const endDate = ref(dateRangeStore.endDate)
const selectedPreset = ref(null)

const getMatchingPreset = () => {
  const today = new Date();
  const end = today.toISOString().split('T')[0];
  if (endDate.value !== end) return null;

  // Check months presets
  for (const months of [3, 6]) {
    const startDateVal = new Date(today.getFullYear(), today.getMonth() - months, today.getDate());
    const start = startDateVal.toISOString().split('T')[0];
    if (startDate.value === start) {
      return `months-${months}`;
    }
  }

  // Check years presets
  for (const years of [1, 2, 3]) {
    const startDateVal = new Date(today.getFullYear() - years, today.getMonth(), today.getDate());
    const start = startDateVal.toISOString().split('T')[0];
    if (startDate.value === start) {
      return `years-${years}`;
    }
  }

  return null;
}

const diffYears = computed(() => {
  if (!startDate.value || !endDate.value) return 0;
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const diffTime = end - start;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays / 365.25;
})

const message = computed(() => {
  if (diffYears.value >= 3) {
    return "Rango de 3 años o más seleccionado. La carga de datos puede ser lenta."
  } else if (selectedPreset.value === 'years-1') {
    return "A mayor tiempo de la serie más larga la carga de datos."
  } else if (selectedPreset.value === 'years-2') {
    return "Tiempo moderado de recarga para rango de 2 años."
  } else if (selectedPreset.value === 'months-3' || selectedPreset.value === 'months-6') {
    return "Rango de tiempo corto seleccionado. Carga rápida de datos."
  } else {
    return null
  }
})

const alertClass = computed(() => {
  if (diffYears.value >= 3) {
    return 'alert alert-danger'
  } else if (selectedPreset.value === 'years-2') {
    return 'alert alert-warning'
  } else {
    return 'alert alert-info'
  }
})

const handleStartChange = () => {
  selectedPreset.value = null
  dateRangeStore.setDateRange(startDate.value, endDate.value)
  emit('dateRangeChanged', { start: startDate.value, end: endDate.value })
}

const handleEndChange = () => {
  selectedPreset.value = null
  dateRangeStore.setDateRange(startDate.value, endDate.value)
  emit('dateRangeChanged', { start: startDate.value, end: endDate.value })
}

const handleExecute = () => {
  emit('execute', {
    start: startDate.value,
    end: endDate.value
  })
}

const setPreset = (type, value) => {
  const today = new Date()
  const end = today.toISOString().split('T')[0]
  let startDateVal
  if (type === 'months') {
    startDateVal = new Date(today.getFullYear(), today.getMonth() - value, today.getDate())
  } else if (type === 'years') {
    startDateVal = new Date(today.getFullYear() - value, today.getMonth(), today.getDate())
  }
  const start = startDateVal.toISOString().split('T')[0]
  dateRangeStore.setDateRange(start, end)
  selectedPreset.value = `${type}-${value}`
}

// Sincronizar con el store
watch(() => dateRangeStore.startDate, (newVal) => {
  startDate.value = newVal
})

watch(() => dateRangeStore.endDate, (newVal) => {
  endDate.value = newVal
})

onMounted(() => {
  selectedPreset.value = getMatchingPreset();
})

// Definir emits
const emit = defineEmits(['dateRangeChanged', 'execute'])
</script>

<style scoped>
.date-range-picker {
  background-color: var(--bs-body-bg);
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--bs-border-color);
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.form-control {
  width: auto;
  min-width: 140px;
}

.btn {
  white-space: nowrap;
}

.alert {
  padding: 0.25rem 0.5rem;
}
</style>