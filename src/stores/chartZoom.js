import { defineStore } from 'pinia'

export const useChartZoomStore = defineStore('chartZoom', {
  state: () => ({
    currentZoomIndex: 5 // Default to "All"
  }),
  actions: {
    setZoom(index) {
      this.currentZoomIndex = index
    }
  }
})