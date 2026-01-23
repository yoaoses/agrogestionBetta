import { useDateRangeStore } from '../stores/dateRange.js'

// Helper function to generate mock data for a group when no real data is available
export const generateMockGroupData = (model = { date: '', milkLiters: 0 }, valueRange = [50, 150]) => {
  const dateRangeStore = useDateRangeStore()
  const startDate = new Date(dateRangeStore.startDate)
  const endDate = new Date(dateRangeStore.endDate)
  const msPerDay = 1000 * 60 * 60 * 24
  const days = Math.floor((endDate - startDate) / msPerDay) + 1
  const data = []
  let currentDate = new Date(startDate)
  const keys = Object.keys(model)
  for (let i = 0; i < days; i++) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const obj = { date: dateStr }
    keys.forEach(key => {
      if (key !== 'date') {
        if (typeof model[key] === 'number') {
          obj[key] = Math.random() * (valueRange[1] - valueRange[0]) + valueRange[0]
        } else {
          obj[key] = model[key]
        }
      }
    })
    data.push(obj)
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return data
}

// Helper function to generate mock data for population dynamics when no real data is available
export const generateMockPopulationData = (model = { date: '', births: 0, deaths: 0, entries: 0, exits: 0, total_population: 0 }, valueRanges = { births: [1, 10], deaths: [0, 5], entries: [0, 5], exits: [0, 3], total_population: [1000, 1500] }) => {
  const dateRangeStore = useDateRangeStore()
  const startDate = new Date(dateRangeStore.startDate)
  const endDate = new Date(dateRangeStore.endDate)
  const msPerDay = 1000 * 60 * 60 * 24
  const days = Math.floor((endDate - startDate) / msPerDay) + 1
  const data = []
  let currentDate = new Date(startDate)
  const keys = Object.keys(model)
  for (let i = 0; i < days; i++) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const obj = { date: dateStr }
    keys.forEach(key => {
      if (key !== 'date') {
        if (typeof model[key] === 'number') {
          const range = valueRanges[key] || [0, 100]
          obj[key] = Math.floor(Math.random() * (range[1] - range[0]) + range[0])
        } else {
          obj[key] = model[key]
        }
      }
    })
    data.push(obj)
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return data
}