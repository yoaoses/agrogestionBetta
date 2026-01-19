<template>
  <div class="api-test-view">
    <div class="auth-info mb-3">
      <h5>Información de Autenticación</h5>
      <p><strong>Usuario:</strong> {{ authStore.userName || 'N/A' }} ({{ authStore.userEmail || 'N/A' }})</p>
      <p><strong>Token:</strong> {{ authStore.token ? authStore.token.substring(0, 20) + '...' : 'N/A' }}</p>
    </div>

    <div class="selectors mb-3">
      <div class="row">
        <div class="col-md-4">
          <label for="companySelect" class="form-label">Empresa</label>
          <select id="companySelect" class="form-select" v-model="selectedCompanyId" @change="onCompanyChange">
            <option value="">Seleccionar Empresa</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label for="farmSelect" class="form-label">Granja</label>
          <select id="farmSelect" class="form-select" v-model="selectedFarmId" @change="onFarmChange" :disabled="!selectedCompanyId">
            <option value="">Seleccionar Granja</option>
            <option v-for="farm in farms" :key="farm.id" :value="farm.id">
              {{ farm.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label for="groupSelect" class="form-label">Grupo</label>
          <select id="groupSelect" class="form-select" v-model="selectedGroupId" :disabled="!selectedFarmId">
            <option value="">Seleccionar Grupo</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="date-range mb-3">
      <DateRangePicker @dateRangeChanged="onDateRangeChange" />
    </div>

    <div class="main-content">
      <div class="left-panel">
        <h5>Endpoints</h5>
        <div class="buttons">
          <button class="btn btn-primary mb-2" @click="callEndpoint('getFarmMilkProductionV2')" :disabled="!selectedFarmId || loading">getFarmMilkProductionV2</button>
          <button class="btn btn-primary mb-2" @click="callEndpoint('getFarmBirths')" :disabled="!selectedFarmId || loading">getFarmBirths</button>
          <button class="btn btn-primary mb-2" @click="callEndpoint('getFarmInventory')" :disabled="!selectedFarmId || loading">getFarmInventory</button>
          <button class="btn btn-primary mb-2" @click="callEndpoint('getFarmGroups')" :disabled="!selectedFarmId || loading">getFarmGroups</button>
          <button class="btn btn-primary mb-2" @click="callEndpoint('getGroupProduction')" :disabled="!selectedGroupId || loading">getGroupProduction</button>
          <button class="btn btn-primary mb-2" @click="callEndpoint('getFarmKPIs')" :disabled="!selectedFarmId || loading">getFarmKPIs</button>
          <button class="btn btn-primary mb-2" @click="callEndpoint('getFarmSection2')" :disabled="!selectedFarmId || loading">getFarmSection2</button>
        </div>
      </div>
      <div class="right-panel">
        <h5>Respuesta JSON</h5>
        <Loader v-if="loading" type="dots" label="Cargando..." />
        <div v-else-if="error" class="alert alert-danger">
          <strong>Error:</strong> {{ error }}
        </div>
        <pre v-else-if="response" class="json-response">{{ JSON.stringify(response, null, 2) }}</pre>
        <p v-else class="text-muted">Selecciona un endpoint para ver la respuesta.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useNavigationStore } from '../stores/navigation.js'
import { useDateRangeStore } from '../stores/dateRange.js'
import DateRangePicker from '../components/DateRangePicker.vue'
import Loader from '../components/Loader.vue'
import {
  getFarmMilkProductionV2,
  getFarmBirths,
  getFarmInventoryStats as getFarmInventory,
  getFarmGroups,
  getGroupMilkProduction as getGroupProduction,
  getFarmHealthStats as getFarmKPIs,
  getFarmTotalAnimalsV2 as getFarmSection2
} from '../api/api.js'

const authStore = useAuthStore()
const navStore = useNavigationStore()
const dateRangeStore = useDateRangeStore()

const companies = ref([])
const farms = ref([])
const groups = ref([])
const selectedCompanyId = ref('')
const selectedFarmId = ref('')
const selectedGroupId = ref('')
const loading = ref(false)
const error = ref('')
const response = ref(null)
const dateRange = ref({ start: '', end: '' })

onMounted(async () => {
  await loadCompanies()
})

const loadCompanies = async () => {
  try {
    companies.value = await navStore.fetchCompanies()
  } catch (err) {
    error.value = 'Error cargando empresas: ' + err.message
  }
}

const onCompanyChange = async () => {
  selectedFarmId.value = ''
  selectedGroupId.value = ''
  farms.value = []
  groups.value = []
  if (selectedCompanyId.value) {
    try {
      farms.value = await navStore.fetchFarms(selectedCompanyId.value)
    } catch (err) {
      error.value = 'Error cargando granjas: ' + err.message
    }
  }
}

const onFarmChange = async () => {
  selectedGroupId.value = ''
  groups.value = []
  if (selectedFarmId.value) {
    try {
      groups.value = await navStore.fetchGroups(selectedFarmId.value)
    } catch (err) {
      error.value = 'Error cargando grupos: ' + err.message
    }
  }
}

const onDateRangeChange = (range) => {
  dateRange.value = range
}

const callEndpoint = async (endpoint) => {
  loading.value = true
  error.value = ''
  response.value = null

  try {
    let result
    const from = dateRange.value.start || dateRangeStore.startDate
    const to = dateRange.value.end || dateRangeStore.endDate

    switch (endpoint) {
      case 'getFarmMilkProductionV2':
        result = await getFarmMilkProductionV2(selectedFarmId.value, from, to)
        break
      case 'getFarmBirths':
        result = await getFarmBirths(selectedFarmId.value, from, to)
        break
      case 'getFarmInventory':
        result = await getFarmInventory(selectedFarmId.value, from, to)
        break
      case 'getFarmGroups':
        result = await getFarmGroups(selectedFarmId.value)
        break
      case 'getGroupProduction':
        result = await getGroupProduction(selectedGroupId.value, from, to)
        break
      case 'getFarmKPIs':
        result = await getFarmKPIs(selectedFarmId.value, from, to)
        break
      case 'getFarmSection2':
        result = await getFarmSection2(selectedFarmId.value, from, to)
        break
    }

    response.value = result.data
  } catch (err) {
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.api-test-view {
  padding: 1rem;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.auth-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.selectors {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.date-range {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.main-content {
  display: flex;
  gap: 1rem;
}

.left-panel {
  flex: 1;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.right-panel {
  flex: 2;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.buttons {
  display: flex;
  flex-direction: column;
}

.json-response {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 1rem;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 400px;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.875rem;
}
</style>