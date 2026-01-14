// API module

const BASE_URL_V1 = import.meta.env.VITE_API_BASE_URL_V1;
const BASE_URL_V2 = import.meta.env.VITE_API_BASE_URL_V2;

let authToken = null;

// Function to set auth token
const setAuthToken = (token) => {
  authToken = token;
};

// ============================================
// COMPANIES ENDPOINTS
// ============================================

/**
 * Lists all companies available to a user
 * @returns {Promise} Fetch response
 */
const getCompanies = () => {
  return fetch(BASE_URL_V1 + '/companies', {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Creates a new company
 * @param {Object} companyData - Company data (name, tax_id, address)
 * @returns {Promise} Fetch response
 */
const createCompany = (companyData) => {
  return fetch(BASE_URL_V1 + '/companies', {
    method: 'POST',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(companyData),
  }).then(r => r.json());
};

// ============================================
// FARMS ENDPOINTS
// ============================================

/**
 * Lists all farms available to a user from a company
 * @param {number} companyId - Company ID
 * @returns {Promise} Fetch response
 */
const getFarms = (companyId) => {
  return fetch(BASE_URL_V1 + `/farms?companyId=${companyId}`, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Creates a new farm
 * @param {Object} farmData - Farm data (companyId, name, location)
 * @returns {Promise} Fetch response
 */
const createFarm = (farmData) => {
  return fetch(BASE_URL_V1 + '/farms', {
    method: 'POST',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(farmData),
  }).then(r => r.json());
};

// ============================================
// GROUPS ENDPOINTS
// ============================================

/**
 * Lists all animal groups available to a user from a farm
 * @param {number} farmId - Farm ID
 * @returns {Promise} Fetch response
 */
const getGroups = (farmId) => {
  return fetch(BASE_URL_V1 + `/groups?farmId=${farmId}`, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Creates a new animal group
 * @param {Object} groupData - Group data (farmId, name, type, production_type, dpGroupId)
 * @returns {Promise} Fetch response
 */
const createGroup = (groupData) => {
  return fetch(BASE_URL_V1 + '/groups', {
    method: 'POST',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(groupData),
  }).then(r => r.json());
};

/**
 * Gets a specific animal group by ID
 * @param {number} groupId - Group ID
 * @returns {Promise} Fetch response
 */
const getGroup = (groupId) => {
  return fetch(BASE_URL_V1 + `/groups/${groupId}`, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Updates an existing animal group
 * @param {number} groupId - Group ID
 * @param {Object} groupData - Updated group data (name, type, production_type, dpGroupId)
 * @returns {Promise} Fetch response
 */
const updateGroup = (groupId, groupData) => {
  return fetch(BASE_URL_V1 + `/groups/${groupId}`, {
    method: 'PUT',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(groupData),
  }).then(r => r.json());
};

/**
 * Deletes an animal group
 * @param {number} groupId - Group ID
 * @returns {Promise} Fetch response
 */
const deleteGroup = (groupId) => {
  return fetch(BASE_URL_V1 + `/groups/${groupId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

// ============================================
// USERS ENDPOINTS
// ============================================

/**
 * User login
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} Fetch response
 */
const login = (credentials) => {
  return fetch(BASE_URL_V1 + '/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  }).then(r => r.json());
};

// ============================================
// STATISTICS ENDPOINTS (V1)
// ============================================

/**
 * Gets inventory statistics for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmInventoryStats = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/inventory`, BASE_URL_V1);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets production statistics for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmProductionStats = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/production`, BASE_URL_V1);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets reproduction statistics for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmReproductionStats = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/reproduction`, BASE_URL_V1);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets health statistics for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmHealthStats = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/health`, BASE_URL_V1);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets inventory statistics for a group
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getGroupInventoryStats = (groupId, params = {}) => {
  const url = new URL(`/statistics/group/${groupId}/inventory`, BASE_URL_V1);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets production statistics for a group
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getGroupProductionStats = (groupId, params = {}) => {
  const url = new URL(`/statistics/group/${groupId}/production`, BASE_URL_V1);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets disposal logs for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmDisposalStats = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/disposal`, BASE_URL_V1);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

// ============================================
// STATISTICS ENDPOINTS (V2)
// ============================================

/**
 * Gets total animals count for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmTotalAnimalsV2 = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/inventory/totalAnimals`, BASE_URL_V2);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets births count for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmBirthsV2 = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/inventory/births`, BASE_URL_V2);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets deaths count for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmDeathsV2 = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/inventory/deaths`, BASE_URL_V2);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets sales count for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmSalesV2 = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/inventory/sales`, BASE_URL_V2);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets milk production for a farm (V2)
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getFarmMilkProductionV2 = (farmId, params = {}) => {
  const url = new URL(`/statistics/farm/${farmId}/production/milkLiters`, BASE_URL_V2);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets total animals count for a group (V2)
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getGroupTotalAnimalsV2 = (groupId, params = {}) => {
  const url = new URL(`/statistics/group/${groupId}/inventory/totalAnimals`, BASE_URL_V2);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets births count for a group (V2)
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getGroupBirthsV2 = (groupId, params = {}) => {
  const url = new URL(`/statistics/group/${groupId}/inventory/births`, BASE_URL_V2);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets deaths count for a group (V2)
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getGroupDeathsV2 = (groupId, params = {}) => {
  const url = new URL(`/statistics/group/${groupId}/inventory/deaths`, BASE_URL_V2);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Gets sales count for a group (V2)
 * @param {number} groupId - Group ID
 * @param {Object} params - Query parameters (from, to)
 * @returns {Promise} Fetch response
 */
const getGroupSalesV2 = (groupId, params = {}) => {
  const url = new URL(`/statistics/group/${groupId}/inventory/sales`, BASE_URL_V2);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

// ============================================
// AI ANALYTICS ENDPOINTS
// ============================================

/**
 * Request AI analysis of farm data
 * @param {Object} analysisRequest - Analysis request data (farmId, startDate, endDate)
 * @returns {Promise} Fetch response
 */
const requestAIAnalysis = (analysisRequest) => {
  return fetch(BASE_URL_V1 + '/ai-analytics/analyze', {
    method: 'POST',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(analysisRequest),
  }).then(r => r.json());
};

/**
 * Retrieve analysis history for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (limit, offset)
 * @returns {Promise} Fetch response
 */
const getAIAnalysisHistory = (farmId, params = {}) => {
  const url = new URL(`/ai-analytics/history/${farmId}`, BASE_URL_V1);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Retrieve a specific analysis by ID
 * @param {number} analysisId - Analysis ID
 * @returns {Promise} Fetch response
 */
const getAIAnalysis = (analysisId) => {
  return fetch(BASE_URL_V1 + `/ai-analytics/analysis/${analysisId}`, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

/**
 * Retrieve the latest analysis for a farm
 * @param {number} farmId - Farm ID
 * @returns {Promise} Fetch response
 */
const getLatestAIAnalysis = (farmId) => {
  return fetch(BASE_URL_V1 + `/ai-analytics/latest/${farmId}`, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

// ============================================
// IMPORT ENDPOINTS
// ============================================

/**
 * Import inventory data from Excel file
 * @param {number} farmId - Farm ID
 * @param {File} file - Excel file
 * @returns {Promise} Fetch response
 */
const importInventory = (farmId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(BASE_URL_V1 + `/import/inventory?farmId=${farmId}`, {
    method: 'POST',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
    },
    body: formData,
  }).then(r => r.json());
};

/**
 * Import production data from Excel file
 * @param {number} farmId - Farm ID
 * @param {File} file - Excel file
 * @returns {Promise} Fetch response
 */
const importProduction = (farmId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(BASE_URL_V1 + `/import/production?farmId=${farmId}`, {
    method: 'POST',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
    },
    body: formData,
  }).then(r => r.json());
};

/**
 * Import reproduction data from Excel file
 * @param {number} farmId - Farm ID
 * @param {File} file - Excel file
 * @returns {Promise} Fetch response
 */
const importReproduction = (farmId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(BASE_URL_V1 + `/import/reproduction?farmId=${farmId}`, {
    method: 'POST',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
    },
    body: formData,
  }).then(r => r.json());
};

/**
 * Import health data from Excel file
 * @param {number} farmId - Farm ID
 * @param {File} file - Excel file
 * @returns {Promise} Fetch response
 */
const importHealth = (farmId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(BASE_URL_V1 + `/import/health?farmId=${farmId}`, {
    method: 'POST',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
    },
    body: formData,
  }).then(r => r.json());
};

/**
 * Import organizational structure from Excel file
 * @param {File} file - Excel file
 * @returns {Promise} Fetch response
 */
const importStructure = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return fetch(BASE_URL_V1 + '/import/structure', {
    method: 'POST',
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
    },
    body: formData,
  }).then(r => r.json());
};

/**
 * Get import logs for a farm
 * @param {number} farmId - Farm ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} Fetch response
 */
const getImportLogs = (farmId, params = {}) => {
  const url = new URL(`/import/logs/${farmId}`, BASE_URL_V1);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, {
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
};

// Export API functions
export {
  setAuthToken,
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
