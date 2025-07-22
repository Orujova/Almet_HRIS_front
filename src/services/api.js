// src/services/api.js - UPDATED: Backend endpointlərinə uyğun API service
import axios from "axios";

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Token management utility
const TokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("accessToken");
    }
    return null;
  },
  
  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("refreshToken");
    }
    return null;
  },
  
  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
    }
  },
  
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },
  
  redirectToLogin: () => {
    TokenManager.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = "/login";
    }
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRFTOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized - token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const newAccessToken = refreshResponse.data.access;
        TokenManager.setTokens(newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        TokenManager.redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // Error handling for different response types
    if (error.response?.status >= 500) {
      let errorData = error.response?.data;
      
      if (errorData instanceof Blob) {
        try {
          const text = await errorData.text();
          errorData = text ? JSON.parse(text) : { message: 'Server error' };
        } catch (blobError) {
          errorData = { message: 'Server error - unable to parse response' };
        }
      }
      
      console.error('Server error:', errorData);
    }

    // Serializable error for Redux
    const serializableError = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
    };

    if (error.response?.data) {
      const responseData = error.response.data;
      
      if (responseData instanceof Blob) {
        try {
          const text = await responseData.text();
          serializableError.data = text ? JSON.parse(text) : { message: 'Unknown error' };
        } catch (blobError) {
          serializableError.data = { message: 'Error parsing response' };
        }
      } else {
        serializableError.data = responseData;
      }
    }

    return Promise.reject(serializableError);
  }
);

// Query parameters helper
const buildQueryParams = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
};

// File download helper
const handleFileDownload = async (response, filename) => {
  try {
    if (!response || response.status !== 200) {
      throw new Error('Failed to download file');
    }

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    console.error('File download failed:', error);
    throw new Error(`Download failed: ${error.message}`);
  }
};

// API Service - Backend endpointlərinə uyğun
export const apiService = {
  // ========================================
  // AUTH ENDPOINTS
  // ========================================
  login: (credentials) => api.post("/auth/login/", credentials),
  logout: () => api.post("/auth/logout/"),
  refreshToken: (refreshToken) => api.post("/auth/refresh/", { refresh: refreshToken }),

  // ========================================
  // BUSINESS FUNCTIONS
  // ========================================
  getBusinessFunctions: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/business-functions/?${queryString}`);
  },
  getBusinessFunction: (id) => api.get(`/business-functions/${id}/`),
  createBusinessFunction: (data) => api.post("/business-functions/", data),
  updateBusinessFunction: (id, data) => api.put(`/business-functions/${id}/`, data),
  deleteBusinessFunction: (id) => api.delete(`/business-functions/${id}/`),

  // ========================================
  // DEPARTMENTS
  // ========================================
  getDepartments: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/departments/?${queryString}`);
  },
  getDepartment: (id) => api.get(`/departments/${id}/`),
  createDepartment: (data) => api.post("/departments/", data),
  updateDepartment: (id, data) => api.put(`/departments/${id}/`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}/`),

  // ========================================
  // UNITS
  // ========================================
  getUnits: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/units/?${queryString}`);
  },
  getUnit: (id) => api.get(`/units/${id}/`),
  createUnit: (data) => api.post("/units/", data),
  updateUnit: (id, data) => api.put(`/units/${id}/`, data),
  deleteUnit: (id) => api.delete(`/units/${id}/`),

  // ========================================
  // JOB FUNCTIONS
  // ========================================
  getJobFunctions: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/job-functions/?${queryString}`);
  },
  getJobFunction: (id) => api.get(`/job-functions/${id}/`),
  createJobFunction: (data) => api.post("/job-functions/", data),
  updateJobFunction: (id, data) => api.put(`/job-functions/${id}/`, data),
  deleteJobFunction: (id) => api.delete(`/job-functions/${id}/`),

  // ========================================
  // POSITION GROUPS
  // ========================================
  getPositionGroups: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/position-groups/?${queryString}`);
  },
  getPositionGroup: (id) => api.get(`/position-groups/${id}/`),
  getPositionGroupGradingLevels: (id) => api.get(`/position-groups/${id}/grading_levels/`),
  createPositionGroup: (data) => api.post("/position-groups/", data),
  updatePositionGroup: (id, data) => api.put(`/position-groups/${id}/`, data),
  deletePositionGroup: (id) => api.delete(`/position-groups/${id}/`),

  // ========================================
  // EMPLOYEE STATUSES
  // ========================================
  getEmployeeStatuses: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employee-statuses/?${queryString}`);
  },
  getEmployeeStatus: (id) => api.get(`/employee-statuses/${id}/`),
  createEmployeeStatus: (data) => api.post("/employee-statuses/", data),
  updateEmployeeStatus: (id, data) => api.put(`/employee-statuses/${id}/`, data),
  deleteEmployeeStatus: (id) => api.delete(`/employee-statuses/${id}/`),

  // ========================================
  // EMPLOYEE TAGS
  // ========================================
  getEmployeeTags: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employee-tags/?${queryString}`);
  },
  getEmployeeTag: (id) => api.get(`/employee-tags/${id}/`),
  createEmployeeTag: (data) => api.post("/employee-tags/", data),
  updateEmployeeTag: (id, data) => api.put(`/employee-tags/${id}/`, data),
  deleteEmployeeTag: (id) => api.delete(`/employee-tags/${id}/`),

  // ========================================
  // CONTRACT CONFIGS
  // ========================================
  getContractConfigs: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/contract-configs/?${queryString}`);
  },
  getContractConfig: (id) => api.get(`/contract-configs/${id}/`),
  testContractCalculations: (id) => api.get(`/contract-configs/${id}/test_calculations/`),
  createContractConfig: (data) => api.post("/contract-configs/", data),
  updateContractConfig: (id, data) => api.put(`/contract-configs/${id}/`, data),
  deleteContractConfig: (id) => api.delete(`/contract-configs/${id}/`),

  // ========================================
  // EMPLOYEES - Backend endpointlərinə uyğun
  // ========================================
  getEmployees: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/?${queryString}`);
  },
  
  getEmployee: (id) => api.get(`/employees/${id}/`),
  
  createEmployee: (data) => {
    if (data instanceof FormData) {
      return api.post("/employees/", data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post("/employees/", data);
  },
  
  updateEmployee: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/employees/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/employees/${id}/`, data);
  },
  
  deleteEmployee: (id) => api.delete(`/employees/${id}/`),

  // Employee Activities
  getEmployeeActivities: (employeeId) => {
    // Backend-də activities endpoint yoxdur, lakin employee detail-da activities var
    return api.get(`/employees/${employeeId}/`).then(response => ({
      data: response.data.activities || []
    }));
  },

  // Employee Direct Reports
  getEmployeeDirectReports: (employeeId) => api.get(`/employees/${employeeId}/direct_reports/`),

  // Employee Status Preview
  getEmployeeStatusPreview: (employeeId) => api.get(`/employees/${employeeId}/status_preview/`),

  // Employee Statistics
  getEmployeeStatistics: () => api.get("/employees/statistics/"),

  // ========================================
  // BULK OPERATIONS
  // ========================================
  softDeleteEmployees: (employeeIds) => api.post("/employees/soft-delete/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),
  restoreEmployees: (employeeIds) => api.post("/employees/restore/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),

  // ========================================
  // TAG MANAGEMENT
  // ========================================
  addEmployeeTag: (data) => api.post("/employees/add-tag/", data),
  removeEmployeeTag: (data) => api.post("/employees/remove-tag/", data),
  bulkAddTags: (employeeIds, tagId) => api.post("/employees/bulk-add-tag/", { 
    employee_ids: employeeIds, 
    tag_id: tagId 
  }),
  bulkRemoveTags: (employeeIds, tagId) => api.post("/employees/bulk-remove-tag/", { 
    employee_ids: employeeIds, 
    tag_id: tagId 
  }),

  // ========================================
  // LINE MANAGER MANAGEMENT
  // ========================================
  assignLineManager: (data) => api.post("/employees/assign-line-manager/", data),
  bulkAssignLineManager: (data) => api.post("/employees/bulk-assign-line-manager/", data),

  // ========================================
  // CONTRACT MANAGEMENT
  // ========================================
  extendEmployeeContract: (data) => api.post("/employees/extend-contract/", data),
  bulkExtendContracts: (data) => api.post("/employees/bulk-extend-contracts/", data),
  getContractExpiryAlerts: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/contract-expiry-alerts/?${queryString}`);
  },
  getContractsExpiringSoon: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/contracts_expiring_soon/?${queryString}`);
  },

  // ========================================
  // EXPORT & TEMPLATE
  // ========================================
  exportEmployees: async (params = {}) => {
    try {
      const response = await api.post("/employees/export_selected/", params, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      const filename = `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      await handleFileDownload(response, filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },

  downloadEmployeeTemplate: async () => {
    try {
      const response = await api.get("/bulk-upload/download_template/", {
        responseType: 'blob'
      });
      
      const filename = 'employee_template.xlsx';
      await handleFileDownload(response, filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Template download failed:', error);
      throw error;
    }
  },

  // ========================================
  // BULK UPLOAD
  // ========================================
  bulkUploadEmployees: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      return await api.post("/bulk-upload/", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Bulk upload failed:', error);
      throw error;
    }
  },

  // ========================================
  // EMPLOYEE GRADING
  // ========================================
  getEmployeeGrading: () => api.get("/employee-grading/"),
  bulkUpdateEmployeeGrades: (updates) => api.post("/employee-grading/bulk_update_grades/", { updates }),

  // ========================================
  // ORGANIZATIONAL HIERARCHY
  // ========================================
  getOrganizationalHierarchy: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/organizational_hierarchy/?${queryString}`);
  },

  // ========================================
  // PROFILE IMAGES
  // ========================================
  uploadProfileImage: (employeeId, file) => {
    const formData = new FormData();
    formData.append('employee_id', employeeId);
    formData.append('profile_image', file);
    
    return api.post("/profile-images/upload/", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteProfileImage: (employeeId) => api.post("/profile-images/delete/", { employee_id: employeeId }),

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  get: (endpoint, params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`${endpoint}${queryString ? `?${queryString}` : ''}`);
  },

  post: (endpoint, data, options = {}) => {
    return api.post(endpoint, data, options);
  },

  put: (endpoint, data, options = {}) => {
    return api.put(endpoint, data, options);
  },

  delete: (endpoint, options = {}) => {
    return api.delete(endpoint, options);
  },

  uploadFile: (endpoint, file, additionalData = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  downloadFile: async (endpoint, filename, params = {}) => {
    try {
      const queryString = buildQueryParams(params);
      const response = await api.get(`${endpoint}${queryString ? `?${queryString}` : ''}`, {
        responseType: 'blob'
      });
      
      await handleFileDownload(response, filename);
      return response;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
};

export default api;
export { TokenManager };