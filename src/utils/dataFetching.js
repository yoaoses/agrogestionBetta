import { ref } from 'vue'

export const useDataCache = () => {
  const cache = ref({})
  const get = (key) => {
    const value = cache.value[key]
    return value
  }
  const set = (key, value) => {
    cache.value[key] = value
  }
  const has = (key) => {
    const result = key in cache.value
    return result
  }
  return { cache, get, set, has }
}

export const useLoadingState = () => {
  const isLoading = ref(false)
  const loadingPromise = ref(null)
  const startLoading = (promise) => {
    isLoading.value = true
    loadingPromise.value = promise
    return promise.finally(() => {
      isLoading.value = false
      loadingPromise.value = null
    })
  }
  return { isLoading, loadingPromise, startLoading }
}

export const standardizeCompany = (company) => {
  const result = {
    id: Number(company.id),
    name: company.name,
    address: company.address || 'Dirección no especificada',
    description: company.description || '',
    taxId: company.tax_id,
    createdAt: company.created_at,
    updatedAt: company.updated_at
  }
  return result
}

export const standardizeFarm = (farm) => {
  const result = {
    id: Number(farm.id),
    name: farm.name,
    location: farm.location || 'Ubicación no especificada',
    description: farm.description || '',
    companyId: Number(farm.companyId),
    createdAt: farm.created_at,
    updatedAt: farm.updated_at
  }
  return result
}

export const standardizeGroup = (group) => {
  const result = {
    id: Number(group.id),
    name: group.name,
    description: group.description || '',
    farmId: Number(group.farmId),
    createdAt: group.created_at,
    updatedAt: group.updated_at
  }
  return result
}