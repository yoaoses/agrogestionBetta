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