// services/policyService.js

import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Axios instance with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== POLICY CRUD ====================

/**
 * Get all policies with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getAllPolicies = async (params = {}) => {
  try {
    const response = await api.get('/api/policies/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get single policy details
 * @param {number} id - Policy ID
 * @returns {Promise}
 */
export const getPolicyDetail = async (id) => {
  try {
    const response = await api.get(`/api/policies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new policy with PDF file
 * @param {Object} policyData - Policy data including file
 * @returns {Promise}
 */
export const createPolicy = async (policyData) => {
  try {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(policyData).forEach((key) => {
      if (policyData[key] !== null && policyData[key] !== undefined) {
        formData.append(key, policyData[key]);
      }
    });
    
    const response = await api.post('/api/policies/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update existing policy
 * @param {number} id - Policy ID
 * @param {Object} policyData - Updated policy data
 * @returns {Promise}
 */
export const updatePolicy = async (id, policyData) => {
  try {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(policyData).forEach((key) => {
      if (policyData[key] !== null && policyData[key] !== undefined) {
        formData.append(key, policyData[key]);
      }
    });
    
    const response = await api.put(`/api/policies/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Partially update policy
 * @param {number} id - Policy ID
 * @param {Object} policyData - Partial policy data
 * @returns {Promise}
 */
export const partialUpdatePolicy = async (id, policyData) => {
  try {
    const formData = new FormData();
    
    Object.keys(policyData).forEach((key) => {
      if (policyData[key] !== null && policyData[key] !== undefined) {
        formData.append(key, policyData[key]);
      }
    });
    
    const response = await api.patch(`/api/policies/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete policy
 * @param {number} id - Policy ID
 * @returns {Promise}
 */
export const deletePolicy = async (id) => {
  try {
    const response = await api.delete(`/api/policies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== POLICY FOLDERS ====================

/**
 * Get all policy folders
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getAllFolders = async (params = {}) => {
  try {
    const response = await api.get('/api/policy-folders/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get folder details
 * @param {number} id - Folder ID
 * @returns {Promise}
 */
export const getFolderDetail = async (id) => {
  try {
    const response = await api.get(`/api/policy-folders/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new folder
 * @param {Object} folderData - Folder data
 * @returns {Promise}
 */
export const createFolder = async (folderData) => {
  try {
    const response = await api.post('/api/policy-folders/', folderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update folder
 * @param {number} id - Folder ID
 * @param {Object} folderData - Updated folder data
 * @returns {Promise}
 */
export const updateFolder = async (id, folderData) => {
  try {
    const response = await api.put(`/api/policy-folders/${id}/`, folderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete folder
 * @param {number} id - Folder ID
 * @returns {Promise}
 */
export const deleteFolder = async (id) => {
  try {
    const response = await api.delete(`/api/policy-folders/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get folders by business function
 * @param {number} bfId - Business function ID
 * @returns {Promise}
 */
export const getFoldersByBusinessFunction = async (bfId) => {
  try {
    const response = await api.get(`/api/policy-folders/by-business-function/${bfId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get policies in folder
 * @param {number} folderId - Folder ID
 * @returns {Promise}
 */
export const getPoliciesInFolder = async (folderId) => {
  try {
    const response = await api.get(`/api/policy-folders/${folderId}/policies/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get folder statistics
 * @param {number} folderId - Folder ID
 * @returns {Promise}
 */
export const getFolderStatistics = async (folderId) => {
  try {
    const response = await api.get(`/api/policy-folders/${folderId}/statistics/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== POLICY ACTIONS ====================

/**
 * Get policies by folder
 * @param {number} folderId - Folder ID
 * @returns {Promise}
 */
export const getPoliciesByFolder = async (folderId) => {
  try {
    const response = await api.get(`/api/policies/by-folder/${folderId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Track policy view
 * @param {number} policyId - Policy ID
 * @returns {Promise}
 */
export const trackPolicyView = async (policyId) => {
  try {
    const response = await api.post(`/api/policies/${policyId}/view/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Track policy download
 * @param {number} policyId - Policy ID
 * @returns {Promise}
 */
export const trackPolicyDownload = async (policyId) => {
  try {
    const response = await api.post(`/api/policies/${policyId}/download/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get policy access logs
 * @param {number} policyId - Policy ID
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getPolicyAccessLogs = async (policyId, params = {}) => {
  try {
    const response = await api.get(`/api/policies/${policyId}/access_logs/`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Acknowledge policy
 * @param {number} policyId - Policy ID
 * @param {string} notes - Optional notes
 * @returns {Promise}
 */
export const acknowledgePolicy = async (policyId, notes = '') => {
  try {
    const response = await api.post(`/api/policies/${policyId}/acknowledge/`, { notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get policy acknowledgments
 * @param {number} policyId - Policy ID
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getPolicyAcknowledgments = async (policyId, params = {}) => {
  try {
    const response = await api.get(`/api/policies/${policyId}/acknowledgments/`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get policy version history
 * @param {number} policyId - Policy ID
 * @returns {Promise}
 */
export const getPolicyVersionHistory = async (policyId) => {
  try {
    const response = await api.get(`/api/policies/${policyId}/version_history/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create policy version
 * @param {number} policyId - Policy ID
 * @param {string} changesSummary - Changes summary
 * @returns {Promise}
 */
export const createPolicyVersion = async (policyId, changesSummary = '') => {
  try {
    const response = await api.post(`/api/policies/${policyId}/create_version/`, {
      changes_summary: changesSummary,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Change policy status
 * @param {number} policyId - Policy ID
 * @param {string} status - New status (DRAFT, REVIEW, APPROVED, PUBLISHED, ARCHIVED)
 * @returns {Promise}
 */
export const changePolicyStatus = async (policyId, status) => {
  try {
    const response = await api.post(`/api/policies/${policyId}/change_status/`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== BUSINESS FUNCTIONS ====================

/**
 * Get all business functions with policies
 * @returns {Promise}
 */
export const getBusinessFunctionsWithPolicies = async () => {
  try {
    const response = await api.get('/api/business-functions-policies/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get business function policies detail
 * @param {number} id - Business function ID
 * @returns {Promise}
 */
export const getBusinessFunctionPoliciesDetail = async (id) => {
  try {
    const response = await api.get(`/api/business-functions-policies/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get business functions with statistics
 * @returns {Promise}
 */
export const getBusinessFunctionsWithStats = async () => {
  try {
    const response = await api.get('/api/business-functions-policies/with_stats/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== STATISTICS ====================

/**
 * Get policy statistics overview
 * @returns {Promise}
 */
export const getPolicyStatisticsOverview = async () => {
  try {
    const response = await api.get('/api/policy-statistics/overview/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get statistics by business function
 * @returns {Promise}
 */
export const getStatisticsByBusinessFunction = async () => {
  try {
    const response = await api.get('/api/policy-statistics/by_business_function/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get most viewed policies
 * @param {number} limit - Number of policies to return
 * @returns {Promise}
 */
export const getMostViewedPolicies = async (limit = 10) => {
  try {
    const response = await api.get('/api/policy-statistics/most_viewed/', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get most downloaded policies
 * @param {number} limit - Number of policies to return
 * @returns {Promise}
 */
export const getMostDownloadedPolicies = async (limit = 10) => {
  try {
    const response = await api.get('/api/policy-statistics/most_downloaded/', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get acknowledgment status statistics
 * @returns {Promise}
 */
export const getAcknowledgmentStatus = async () => {
  try {
    const response = await api.get('/api/policy-statistics/acknowledgment_status/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Download policy file
 * @param {string} fileUrl - Policy file URL
 * @param {string} filename - Desired filename
 */
export const downloadPolicyFile = (fileUrl, filename) => {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get policy status badge color
 * @param {string} status - Policy status
 * @returns {string} - Tailwind color class
 */
export const getPolicyStatusColor = (status) => {
  const statusColors = {
    DRAFT: 'gray',
    REVIEW: 'yellow',
    APPROVED: 'green',
    PUBLISHED: 'blue',
    ARCHIVED: 'red',
  };
  return statusColors[status] || 'gray';
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate PDF file
 * @param {File} file - File to validate
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validatePDFFile = (file) => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  // Check file type
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 10MB (current: ${formatFileSize(file.size)})`,
    };
  }
  
  return { valid: true, error: null };
};

export default {
  // CRUD
  getAllPolicies,
  getPolicyDetail,
  createPolicy,
  updatePolicy,
  partialUpdatePolicy,
  deletePolicy,
  
  // Folders
  getAllFolders,
  getFolderDetail,
  createFolder,
  updateFolder,
  deleteFolder,
  getFoldersByBusinessFunction,
  getPoliciesInFolder,
  getFolderStatistics,
  
  // Actions
  getPoliciesByFolder,
  trackPolicyView,
  trackPolicyDownload,
  getPolicyAccessLogs,
  acknowledgePolicy,
  getPolicyAcknowledgments,
  getPolicyVersionHistory,
  createPolicyVersion,
  changePolicyStatus,
  
  // Business Functions
  getBusinessFunctionsWithPolicies,
  getBusinessFunctionPoliciesDetail,
  getBusinessFunctionsWithStats,
  
  // Statistics
  getPolicyStatisticsOverview,
  getStatisticsByBusinessFunction,
  getMostViewedPolicies,
  getMostDownloadedPolicies,
  getAcknowledgmentStatus,
  
  // Utilities
  downloadPolicyFile,
  getPolicyStatusColor,
  formatFileSize,
  validatePDFFile,
};