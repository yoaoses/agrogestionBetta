import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDateRangeStore = defineStore('dateRange', () => {
  // Set default to 1 year from today
  const today = new Date()
  const defaultEndDate = today.toISOString().split('T')[0]
  const defaultStartDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString().split('T')[0]

  const startDate = ref(localStorage.getItem('startDate') || defaultStartDate)
  const endDate = ref(localStorage.getItem('endDate') || defaultEndDate)
  const isLoading = ref(false)

  const dateRange = computed(() => ({
    start: startDate.value,
    end: endDate.value
  }))

  const setDateRange = (start, end) => {
    startDate.value = start
    endDate.value = end
    localStorage.setItem('startDate', start)
    localStorage.setItem('endDate', end)
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const reset = () => {
    startDate.value = defaultStartDate
    endDate.value = defaultEndDate
    isLoading.value = false
    localStorage.removeItem('startDate')
    localStorage.removeItem('endDate')
  }

  return {
    startDate,
    endDate,
    isLoading,
    dateRange,
    setDateRange,
    setLoading,
    reset
  }
})