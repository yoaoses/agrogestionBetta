// API module

import axios from 'axios';

const BASE_URL_V1 = import.meta.env.VITE_API_BASE_URL_V1;
const BASE_URL_V2 = import.meta.env.VITE_API_BASE_URL_V2;

let authToken = null;
let authStoreInstance = null;

export const setAuthStoreInstance = (store) => {
  authStoreInstance = store;
};

// Axios instance
const apiClient = axios.create({
});

// Function to set auth token
const setAuthToken = (token) => {
  authToken = token;
  apiClient.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined;
};

// Interceptor de respuesta para manejar 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (authStoreInstance && error.response?.status === 401 && !authStoreInstance.isRenewingToken) {
      // Evitar loops: marcar que estamos intentando renovar
      authStoreInstance.isRenewingToken = true;
      // Mostrar modal de renovación
      authStoreInstance.showTokenRenewalModal = true;
      // Rechazar la promesa original para que el componente sepa que falló
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * Login user
 * @param {Object} credentials - {email, password}
 * @returns {Promise} API response
 */
const login = async (credentials) => {
  try {
    const response = await apiClient.post(`${BASE_URL_V1}/users/login`, credentials);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all companies available to the user
 * @returns {Promise} API response
 */
const getCompanies = async () => {
  try {
    const response = await apiClient.get(`${BASE_URL_V1}/companies`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all farms for a company
 * @param {number} companyId - Company ID
 * @returns {Promise} API response
 */
const getFarms = async (companyId) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V1}/farms`, {
      params: { companyId }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get milk production stats for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {AbortSignal} [signal] - Abort signal for request cancellation
 * @returns {Promise} API response
 */
const getFarmMilkProductionV2 = async (farmId, from, to, signal) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V2}/statistics/farm/${farmId}/production/milkLiters`, {
      params: { from, to },
      signal
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get health stats for a farm
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @returns {Promise} API response
 */
const getFarmHealthStats = async (farmId, from, to) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V1}/statistics/farm/${farmId}/health`, {
      params: { from, to }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get inventory stats for a farm
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @returns {Promise} API response
 */
const getFarmInventoryStats = async (farmId, from, to) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V1}/statistics/farm/${farmId}/inventory`, {
      params: { from, to }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get total animals count for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {AbortSignal} [signal] - Abort signal for request cancellation
 * @returns {Promise} API response
 */
const getFarmTotalAnimalsV2 = async (farmId, from, to, signal) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V2}/statistics/farm/${farmId}/inventory/totalAnimals`, {
      params: { from, to },
      signal
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get births stats for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {AbortSignal} [signal] - Abort signal for request cancellation
 * @returns {Promise} API response
 */
const getFarmBirths = async (farmId, from, to, signal) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V2}/statistics/farm/${farmId}/inventory/births`, {
      params: { from, to },
      signal
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get animal groups for a farm
 * @param {number} farmId - Farm ID
 * @returns {Promise} API response
 */
const getGroups = async (farmId) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V1}/groups`, {
      params: { farmId }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get farm groups for a farm
 * @param {number} farmId - Farm ID
 * @returns {Promise} API response
 */
const getFarmGroups = async (farmId) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V1}/groups`, {
      params: { farmId }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get milk production stats for a group
 * @param {number} groupId - Group ID
 * @param {string} [from] - Start date (YYYY-MM-DD)
 * @param {string} [to] - End date (YYYY-MM-DD)
 * @returns {Promise} API response
 */
const getGroupMilkProduction = async (groupId, from, to) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V1}/statistics/group/${groupId}/production`, {
      params: { from, to }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================

export { login, setAuthToken, getCompanies, getFarms, getFarmMilkProductionV2, getFarmHealthStats, getFarmInventoryStats, getFarmTotalAnimalsV2, getFarmBirths, getGroups, getFarmGroups, getGroupMilkProduction };
