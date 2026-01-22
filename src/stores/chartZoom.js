import { defineStore } from 'pinia'

export const useChartZoomStore = defineStore('chartZoom', {
  state: () => ({
    currentZoomIndex: 1 // Default to "3m"
  }),
  actions: {
    setZoom(index) {
      this.currentZoomIndex = index
    }
  }
})