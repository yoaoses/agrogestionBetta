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

// Request interceptor for debug logs
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debug logs and error handling with retries
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error(`API Error: ${error.response?.status || 'Network'} ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.message}`);

    const config = error.config;
    if (!config) return Promise.reject(error);

    config._retry = config._retry || 0;

    // Retry on network errors (timeout, connection issues)
    if ((error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || !error.response) && config._retry < 3) {
      config._retry++;
      await new Promise(resolve => setTimeout(resolve, 1000 * config._retry)); // progressive delay
      return apiClient(config);
    }

    // Handle 401 with retry after potential renewal
    if (error.response?.status === 401 && authStoreInstance && !authStoreInstance.isRenewingToken) {
      authStoreInstance.isRenewingToken = true;
      authStoreInstance.showTokenRenewalModal = true;

      // Wait for potential token renewal
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (authStoreInstance.token && !authStoreInstance.isRenewingToken) {
        config.headers.Authorization = `Bearer ${authStoreInstance.token}`;
        config._retry++;
        if (config._retry < 3) {
          return apiClient(config);
        }
      }
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
const getMilkProductionForFarm = async (farmId, from, to, signal) => {
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
const getTotalAnimalsForFarm = async (farmId, from, to, signal) => {
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
const getBirthsForFarm = async (farmId, from, to, signal) => {
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
 * Get deaths stats for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {AbortSignal} [signal] - Abort signal for request cancellation
 * @returns {Promise} API response
 */
const getDeathsForFarm = async (farmId, from, to, signal) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V2}/statistics/farm/${farmId}/inventory/deaths`, {
      params: { from, to },
      signal
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get entries stats for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {AbortSignal} [signal] - Abort signal for request cancellation
 * @returns {Promise} API response
 */
const getEntriesForFarm = async (farmId, from, to, signal) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V2}/statistics/farm/${farmId}/inventory/entries`, {
      params: { from, to },
      signal
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get exits stats for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {AbortSignal} [signal] - Abort signal for request cancellation
 * @returns {Promise} API response
 */
const getExitsForFarm = async (farmId, from, to, signal) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V2}/statistics/farm/${farmId}/inventory/exits`, {
      params: { from, to },
      signal
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get sales stats for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {AbortSignal} [signal] - Abort signal for request cancellation
 * @returns {Promise} API response
 */
const getSalesForFarm = async (farmId, from, to, signal) => {
  try {
    const response = await apiClient.get(`${BASE_URL_V2}/statistics/farm/${farmId}/inventory/sales`, {
      params: { from, to },
      signal
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get population dynamics stats for a farm (combines births, deaths, totalAnimals)
 * @param {number} farmId - Farm ID
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {AbortSignal} [signal] - Abort signal for request cancellation
 * @returns {Promise} API response with combined data
 */
const getFarmPopulationDynamics = async (farmId, from, to, signal) => {
  try {
    // Fetch all population-related data in parallel
    const results = await Promise.allSettled([
      getBirthsForFarm(farmId, from, to, signal),
      getDeathsForFarm(farmId, from, to, signal),
      getEntriesForFarm(farmId, from, to, signal),
      getExitsForFarm(farmId, from, to, signal),
      getTotalAnimalsForFarm(farmId, from, to, signal)
    ]);

    const [birthsRes, deathsRes, entriesRes, exitsRes, totalAnimalsRes] = results.map(r => r.status === 'fulfilled' ? r.value : null);

    // Extract daily statistics from each response
    const birthsData = birthsRes ? (birthsRes.data.data || []).map(d => ({ date: d.date, births: d.value || 0 })) : [];
    const deathsData = deathsRes ? (deathsRes.data.data || []).map(d => ({ date: d.date, deaths: d.value || 0 })) : [];
    const entriesData = entriesRes ? (entriesRes.data.data || []).map(d => ({ date: d.date, entries: d.value || 0 })) : [];
    const exitsData = exitsRes ? (exitsRes.data.data || []).map(d => ({ date: d.date, exits: d.value || 0 })) : [];
    const totalAnimalsData = totalAnimalsRes ? (totalAnimalsRes.data.data || []).map(d => ({ date: d.date, total_population: d.value || 0 })) : [];

    // Create a map of all dates
    const dateMap = new Map();

    // Helper function to add data to dateMap
    const addToDateMap = (data, key) => {
      data.forEach(item => {
        const date = item.date;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date, births: 0, deaths: 0, total_population: 0 });
        }
        dateMap.get(date)[key] = item[key] || 0;
      });
    };

    // Add data from each source
    addToDateMap(birthsData, 'births');
    addToDateMap(deathsData, 'deaths');
    addToDateMap(entriesData, 'entries');
    addToDateMap(exitsData, 'exits');
    addToDateMap(totalAnimalsData, 'total_population');

    // Convert map to array and sort by date
    const combinedData = Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Return in the expected format
    return {
      data: {
        data: combinedData
      }
    };
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
export { login, setAuthToken, getCompanies, getFarms, getMilkProductionForFarm, getFarmHealthStats, getFarmInventoryStats, getTotalAnimalsForFarm, getBirthsForFarm, getDeathsForFarm, getEntriesForFarm, getExitsForFarm, getSalesForFarm, getFarmPopulationDynamics, getGroups, getFarmGroups, getGroupMilkProduction };

