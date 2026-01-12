// IIFE to avoid polluting global scope
import axios from 'axios';
(function() {
  console.log('API module loading...');
  // Base URLs
  const BASE_URL_LOCAL_V1 = 'http://localhost:3000/v1';
  const BASE_URL_ONLINE_V1 = 'http://agrogestionbackend-development.up.railway.app/v1';
  const BASE_URL_LOCAL_V2 = 'http://localhost:3000/v2';
  const BASE_URL_ONLINE_V2 = 'http://agrogestionbackend-development.up.railway.app/v2';

  // Default to online servers
  let USE_LOCAL = true;

  // Axios instances
  const apiV1 = axios.create({
    baseURL: USE_LOCAL ? BASE_URL_LOCAL_V1 : BASE_URL_ONLINE_V1,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const apiV2 = axios.create({
    baseURL: USE_LOCAL ? BASE_URL_LOCAL_V2 : BASE_URL_ONLINE_V2,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Function to set auth token
  const setAuthToken = (token) => {
    apiV1.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    apiV2.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Function to switch between local and online servers
  const setUseLocal = (useLocal) => {
    USE_LOCAL = useLocal;
    apiV1.defaults.baseURL = useLocal ? BASE_URL_LOCAL_V1 : BASE_URL_ONLINE_V1;
    apiV2.defaults.baseURL = useLocal ? BASE_URL_LOCAL_V2 : BASE_URL_ONLINE_V2;
  };

// ============================================
// COMPANIES ENDPOINTS
// ============================================

/**
 * Lists all companies available to a user
 * @returns {Promise} Axios response
 */
const getCompanies = () => {
  return apiV1.get('/companies');
};

/**
 * Creates a new company
 * @param {Object} companyData - Company data (name, tax_id, address)
 * @returns {Promise} Axios response
 */
const createCompany = (companyData) => {
  return apiV1.post('/companies', companyData);
};

// ============================================
// FARMS ENDPOINTS
// ============================================

/**
 * Lists all farms available to a user from a company
 * @param {number} companyId - Company ID
 * @returns {Promise} Axios response
 */
const getFarms = (companyId) => {
  return apiV1.get('/farms', { params: { companyId } });
};

/**
 * Creates a new farm
 * @param {Object} farmData - Farm data (companyId, name, location)
 * @returns {Promise} Axios response
 */
const createFarm = (farmData) => {
  return apiV1.post('/farms', farmData);
};

// ============================================
// GROUPS ENDPOINTS
// ============================================

/**
 * Lists all animal groups available to a user from a farm
 * @param {number} farmId - Farm ID
 * @returns {Promise} Axios response
 */
const getGroups = (farmId) => {
  return apiV1.get('/groups', { params: { farmId } });
};

/**
 * Creates a new animal group
 * @param {Object} groupData - Group data (farmId, name, type, production_type, dpGroupId)
 * @returns {Promise} Axios response
 */
const createGroup = (groupData) => {
  return apiV1.post('/groups', groupData);
};

/**
 * Gets a specific animal group by ID
 * @param {number} groupId - Group ID
 * @returns {Promise} Axios response
 */
const getGroup = (groupId) => {
  return apiV1.get(`/groups/${groupId}`);
};

/**
 * Updates an existing animal group
 * @param {number} groupId - Group ID
 * @param {Object} groupData - Updated group data (name, type, production_type, dpGroupId)
 * @returns {Promise} Axios response
 */
const updateGroup = (groupId, groupData) => {
  return apiV1.put(`/groups/${groupId}`, groupData);
};

/**
 * Deletes an animal group
 * @param {number} groupId - Group ID
 * @returns {Promise} Axios response
 */
const deleteGroup = (groupId) => {
  return apiV1.delete(`/groups/${groupId}`);
};

// ============================================
// USERS ENDPOINTS
// ============================================

/**
 * User login
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} Axios response
 */
const login = (credentials) => {
  return apiV1.post('/users/login', credentials);
};

// ============================================
// STATISTICS ENDPOINTS (V1)
// ============================================

/**
 * Gets inventory statistics for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmInventoryStats = (farmId, params = {}) => {
  return apiV1.get(`/statistics/farm/${farmId}/inventory`, { params });
};

/**
 * Gets production statistics for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmProductionStats = (farmId, params = {}) => {
  return apiV1.get(`/statistics/farm/${farmId}/production`, { params });
};

/**
 * Gets reproduction statistics for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmReproductionStats = (farmId, params = {}) => {
  return apiV1.get(`/statistics/farm/${farmId}/reproduction`, { params });
};

/**
 * Gets health statistics for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmHealthStats = (farmId, params = {}) => {
  return apiV1.get(`/statistics/farm/${farmId}/health`, { params });
};

/**
 * Gets inventory statistics for a group
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getGroupInventoryStats = (groupId, params = {}) => {
  return apiV1.get(`/statistics/group/${groupId}/inventory`, { params });
};

/**
 * Gets production statistics for a group
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getGroupProductionStats = (groupId, params = {}) => {
  return apiV1.get(`/statistics/group/${groupId}/production`, { params });
};

/**
 * Gets disposal logs for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmDisposalStats = (farmId, params = {}) => {
  return apiV1.get(`/statistics/farm/${farmId}/disposal`, { params });
};

// ============================================
// STATISTICS ENDPOINTS (V2)
// ============================================

/**
 * Gets total animals count for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmTotalAnimalsV2 = (farmId, params = {}) => {
  return apiV2.get(`/statistics/farm/${farmId}/inventory/totalAnimals`, { params });
};

/**
 * Gets births count for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmBirthsV2 = (farmId, params = {}) => {
  return apiV2.get(`/statistics/farm/${farmId}/inventory/births`, { params });
};

/**
 * Gets deaths count for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmDeathsV2 = (farmId, params = {}) => {
  return apiV2.get(`/statistics/farm/${farmId}/inventory/deaths`, { params });
};

/**
 * Gets sales count for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmSalesV2 = (farmId, params = {}) => {
  return apiV2.get(`/statistics/farm/${farmId}/inventory/sales`, { params });
};

/**
 * Gets milk production for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getFarmMilkProductionV2 = (farmId, params = {}) => {
  return apiV2.get(`/statistics/farm/${farmId}/production/milkLiters`, { params });
};

/**
 * Gets total animals count for a group (V2)
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getGroupTotalAnimalsV2 = (groupId, params = {}) => {
  return apiV2.get(`/statistics/group/${groupId}/inventory/totalAnimals`, { params });
};

/**
 * Gets births count for a group (V2)
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getGroupBirthsV2 = (groupId, params = {}) => {
  return apiV2.get(`/statistics/group/${groupId}/inventory/births`, { params });
};

/**
 * Gets deaths count for a group (V2)
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getGroupDeathsV2 = (groupId, params = {}) => {
  return apiV2.get(`/statistics/group/${groupId}/inventory/deaths`, { params });
};

/**
 * Gets sales count for a group (V2)
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Axios response
 */
const getGroupSalesV2 = (groupId, params = {}) => {
  return apiV2.get(`/statistics/group/${groupId}/inventory/sales`, { params });
};

// ============================================
// AI ANALYTICS ENDPOINTS
// ============================================

/**
 * Request AI analysis of farm data
 * @param {Object} analysisRequest - Analysis request data (farmId, startDate, endDate)
 * @returns {Promise} Axios response
 */
const requestAIAnalysis = (analysisRequest) => {
  return apiV1.post('/ai-analytics/analyze', analysisRequest);
};

/**
 * Retrieve analysis history for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (limit, offset)
 * @returns {Promise} Axios response
 */
const getAIAnalysisHistory = (farmId, params = {}) => {
  return apiV1.get(`/ai-analytics/history/${farmId}`, { params });
};

/**
 * Retrieve a specific analysis by ID
 * @param {number} analysisId - Analysis ID
 * @returns {Promise} Axios response
 */
const getAIAnalysis = (analysisId) => {
  return apiV1.get(`/ai-analytics/analysis/${analysisId}`);
};

/**
 * Retrieve the latest analysis for a farm
 * @param {number} farmId - Farm ID
 * @returns {Promise} Axios response
 */
const getLatestAIAnalysis = (farmId) => {
  return apiV1.get(`/ai-analytics/latest/${farmId}`);
};

// ============================================
// IMPORT ENDPOINTS
// ============================================

/**
 * Import inventory data from Excel file
 * @param {number} farmId - Farm ID
 * @param {File} file - Excel file
 * @returns {Promise} Axios response
 */
const importInventory = (farmId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiV1.post('/import/inventory', formData, {
    params: { farmId },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Import production data from Excel file
 * @param {number} farmId - Farm ID
 * @param {File} file - Excel file
 * @returns {Promise} Axios response
 */
const importProduction = (farmId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiV1.post('/import/production', formData, {
    params: { farmId },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Import reproduction data from Excel file
 * @param {number} farmId - Farm ID
 * @param {File} file - Excel file
 * @returns {Promise} Axios response
 */
const importReproduction = (farmId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiV1.post('/import/reproduction', formData, {
    params: { farmId },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Import health data from Excel file
 * @param {number} farmId - Farm ID
 * @param {File} file - Excel file
 * @returns {Promise} Axios response
 */
const importHealth = (farmId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiV1.post('/import/health', formData, {
    params: { farmId },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Import organizational structure from Excel file
 * @param {File} file - Excel file
 * @returns {Promise} Axios response
 */
const importStructure = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiV1.post('/import/structure', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Get import logs for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} Axios response
 */
const getImportLogs = (farmId, params = {}) => {
  return apiV1.get(`/import/logs/${farmId}`, { params });
};

// Expose API functions globally
window.api = {
  setAuthToken,
  setUseLocal,
  getCompanies,
  createCompany,
  getFarms,
  createFarm,
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  login,
  getFarmInventoryStats,
  getFarmProductionStats,
  getFarmReproductionStats,
  getFarmHealthStats,
  getGroupInventoryStats,
  getGroupProductionStats,
  getFarmDisposalStats,
  getFarmTotalAnimalsV2,
  getFarmBirthsV2,
  getFarmDeathsV2,
  getFarmSalesV2,
  getFarmMilkProductionV2,
  getGroupTotalAnimalsV2,
  getGroupBirthsV2,
  getGroupDeathsV2,
  getGroupSalesV2,
  requestAIAnalysis,
  getAIAnalysisHistory,
  getAIAnalysis,
  getLatestAIAnalysis,
  importInventory,
  importProduction,
  importReproduction,
  importHealth,
  importStructure,
  getImportLogs,
};

console.log('API module loaded successfully');
})();
