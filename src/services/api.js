// src/services/api.js - FIXED: Better error handling and Blob response handling
import axios from "axios";

// Base URL - environment dəyişkənindən və ya localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Axios instance yaradılması
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 saniyə timeout
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

// Request interceptor - hər request-ə token əlavə et
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // CSRF token əgər varsa
    const csrfToken = TokenManager.getCSRFToken?.() || null;
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

// FIXED: Response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized - token refresh et
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
        
        // Orijinal request-i yenidən göndər
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        TokenManager.redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // FIXED: Better error handling for different response types
    if (error.response?.status >= 500) {
      // Handle different content types for server errors
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

    // FIXED: Ensure error object is serializable for Redux
    const serializableError = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
    };

    // Handle specific error responses
    if (error.response?.data) {
      const responseData = error.response.data;
      
      // If it's a Blob, convert to text
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

// Helper function - query parameters yaratmaq üçün
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

// FIXED: File download helper with better error handling
const handleFileDownload = async (response, filename) => {
  try {
    // Check if response is successful
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

// Ana API Service obyekti
export const apiService = {
  // ========================================
  // AUTH ENDPOINTS
  // ========================================
  getCurrentUser: () => api.get("/me/"),
  login: (credentials) => api.post("/auth/login/", credentials),
  logout: () => api.post("/auth/logout/"),
  refreshToken: (refreshToken) => api.post("/auth/refresh/", { refresh: refreshToken }),

  // ========================================
  // BUSINESS FUNCTIONS ENDPOINTS
  // ========================================
  getBusinessFunctions: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/business-functions/?${queryString}`);
  },
  getBusinessFunction: (id) => api.get(`/business-functions/${id}/`),
  createBusinessFunction: (data) => api.post("/business-functions/", data),
  updateBusinessFunction: (id, data) => api.put(`/business-functions/${id}/`, data),
  partialUpdateBusinessFunction: (id, data) => api.patch(`/business-functions/${id}/`, data),
  deleteBusinessFunction: (id) => api.delete(`/business-functions/${id}/`),

  // ========================================
  // DEPARTMENTS ENDPOINTS
  // ========================================
  getDepartments: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/departments/?${queryString}`);
  },
  getDepartment: (id) => api.get(`/departments/${id}/`),
  createDepartment: (data) => api.post("/departments/", data),
  updateDepartment: (id, data) => api.put(`/departments/${id}/`, data),
  partialUpdateDepartment: (id, data) => api.patch(`/departments/${id}/`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}/`),

  // ========================================
  // UNITS ENDPOINTS
  // ========================================
  getUnits: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/units/?${queryString}`);
  },
  getUnit: (id) => api.get(`/units/${id}/`),
  createUnit: (data) => api.post("/units/", data),
  updateUnit: (id, data) => api.put(`/units/${id}/`, data),
  partialUpdateUnit: (id, data) => api.patch(`/units/${id}/`, data),
  deleteUnit: (id) => api.delete(`/units/${id}/`),

  // ========================================
  // JOB FUNCTIONS ENDPOINTS
  // ========================================
  getJobFunctions: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/job-functions/?${queryString}`);
  },
  getJobFunction: (id) => api.get(`/job-functions/${id}/`),
  createJobFunction: (data) => api.post("/job-functions/", data),
  updateJobFunction: (id, data) => api.put(`/job-functions/${id}/`, data),
  partialUpdateJobFunction: (id, data) => api.patch(`/job-functions/${id}/`, data),
  deleteJobFunction: (id) => api.delete(`/job-functions/${id}/`),

  // ========================================
  // POSITION GROUPS ENDPOINTS
  // ========================================
  getPositionGroups: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/position-groups/?${queryString}`);
  },
  getPositionGroup: (id) => api.get(`/position-groups/${id}/`),
  getPositionGroupGradingLevels: (id) => api.get(`/position-groups/${id}/grading_levels/`),
  createPositionGroup: (data) => api.post("/position-groups/", data),
  updatePositionGroup: (id, data) => api.put(`/position-groups/${id}/`, data),
  partialUpdatePositionGroup: (id, data) => api.patch(`/position-groups/${id}/`, data),
  deletePositionGroup: (id) => api.delete(`/position-groups/${id}/`),

  // ========================================
  // EMPLOYEE STATUSES ENDPOINTS
  // ========================================
  getEmployeeStatuses: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employee-statuses/?${queryString}`);
  },
  getEmployeeStatus: (id) => api.get(`/employee-statuses/${id}/`),
  createEmployeeStatus: (data) => api.post("/employee-statuses/", data),
  updateEmployeeStatus: (id, data) => api.put(`/employee-statuses/${id}/`, data),
  partialUpdateEmployeeStatus: (id, data) => api.patch(`/employee-statuses/${id}/`, data),
  deleteEmployeeStatus: (id) => api.delete(`/employee-statuses/${id}/`),

  // ========================================
  // EMPLOYEE TAGS ENDPOINTS
  // ========================================
  getEmployeeTags: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employee-tags/?${queryString}`);
  },
  getEmployeeTag: (id) => api.get(`/employee-tags/${id}/`),
  createEmployeeTag: (data) => api.post("/employee-tags/", data),
  updateEmployeeTag: (id, data) => api.put(`/employee-tags/${id}/`, data),
  partialUpdateEmployeeTag: (id, data) => api.patch(`/employee-tags/${id}/`, data),
  deleteEmployeeTag: (id) => api.delete(`/employee-tags/${id}/`),

  // ========================================
  // CONTRACT CONFIGS ENDPOINTS
  // ========================================
  getContractConfigs: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/contract-configs/?${queryString}`);
  },
  getContractConfig: (id) => api.get(`/contract-configs/${id}/`),
  createContractConfig: (data) => api.post("/contract-configs/", data),
  updateContractConfig: (id, data) => api.put(`/contract-configs/${id}/`, data),
  partialUpdateContractConfig: (id, data) => api.patch(`/contract-configs/${id}/`, data),
  deleteContractConfig: (id) => api.delete(`/contract-configs/${id}/`),
  testContractCalculations: (id) => api.get(`/contract-configs/${id}/test_calculations/`),

  // ========================================
  // EMPLOYEE ENDPOINTS - FIXED with better error handling
  // ========================================
  
  // Basic CRUD
  getEmployees: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/?${queryString}`);
  },
  
  getEmployee: (id) => api.get(`/employees/${id}/`),
  
  createEmployee: (data) => {
    // Fayl yükləməsi üçün FormData istifadə et
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
  
  partialUpdateEmployee: (id, data) => {
    if (data instanceof FormData) {
      return api.patch(`/employees/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.patch(`/employees/${id}/`, data);
  },
  
  deleteEmployee: (id) => api.delete(`/employees/${id}/`),

  // Employee Activities və Audit Trail
  getEmployeeActivities: (employeeId) => api.get(`/employees/${employeeId}/activities/`),

  // Employee Direct Reports
  getEmployeeDirectReports: (employeeId) => api.get(`/employees/${employeeId}/direct_reports/`),

  // Employee Status Preview
  getEmployeeStatusPreview: (employeeId) => api.get(`/employees/${employeeId}/status_preview/`),

  // Employee Statistics və Filter Options
  getEmployeeStatistics: () => api.get("/employees/statistics/"),

  // Bulk Operations
  bulkUpdateEmployees: (data) => api.post("/employees/bulk_update/", data),
  bulkDeleteEmployees: (employeeIds) => api.post("/employees/bulk-delete/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),
  softDeleteEmployees: (employeeIds) => api.post("/employees/soft-delete/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),
  restoreEmployees: (employeeIds) => api.post("/employees/restore/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),

  // Tag Management
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

  // Line Manager Management
  assignLineManager: (data) => api.post("/employees/assign-line-manager/", data),
  bulkAssignLineManager: (data) => api.post("/employees/bulk-assign-line-manager/", data),

  // Contract Management
  extendEmployeeContract: (data) => api.post("/employees/extend-contract/", data),
  bulkExtendContracts: (data) => api.post("/employees/bulk-extend-contracts/", data),

  // FIXED: Export with better error handling
  exportEmployees: async (params = {}) => {
    try {
      const response = await api.post("/employees/export_selected/", params, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      // Handle the file download
      const filename = `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      await handleFileDownload(response, filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },

  // Contract Expiry Alerts
  getContractExpiryAlerts: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/contract-expiry-alerts/?${queryString}`);
  },

  // Contracts Expiring Soon
  getContractsExpiringSoon: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/contracts_expiring_soon/?${queryString}`);
  },

  // Organizational Hierarchy
  getOrganizationalHierarchy: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/organizational_hierarchy/?${queryString}`);
  },

  // ========================================
  // EMPLOYEE GRADING ENDPOINTS
  // ========================================
  getEmployeeGrading: () => api.get("/employee-grading/"),
  bulkUpdateEmployeeGrades: (updates) => api.post("/employee-grading/bulk_update_grades/", { updates }),

  // ========================================
  // BULK UPLOAD ENDPOINTS - FIXED
  // ========================================
  bulkUploadEmployees: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post("/bulk-upload/", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response;
    } catch (error) {
      console.error('Bulk upload failed:', error);
      throw error;
    }
  },

  // FIXED: Download Employee Template with proper file handling
  downloadEmployeeTemplate: async () => {
    try {
      const response = await api.get("/bulk-upload/download_template/", {
        responseType: 'blob'
      });
      
      // Handle the file download
      const filename = 'employee_template.xlsx';
      await handleFileDownload(response, filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Template download failed:', error);
      throw error;
    }
  },

  // ========================================
  // VACANT POSITIONS ENDPOINTS
  // ========================================
  getVacantPositions: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/vacant-positions/?${queryString}`);
  },
  getVacantPosition: (id) => api.get(`/vacant-positions/${id}/`),
  createVacantPosition: (data) => api.post("/vacant-positions/", data),
  updateVacantPosition: (id, data) => api.put(`/vacant-positions/${id}/`, data),
  partialUpdateVacantPosition: (id, data) => api.patch(`/vacant-positions/${id}/`, data),
  deleteVacantPosition: (id) => api.delete(`/vacant-positions/${id}/`),
  markPositionFilled: (id, data) => api.post(`/vacant-positions/${id}/mark_filled/`, data),
  getVacantPositionStatistics: () => api.get("/vacant-positions/statistics/"),

  // ========================================
  // ORG CHART ENDPOINTS
  // ========================================
  getOrgChart: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/org-chart/?${queryString}`);
  },
  getOrgChartNode: (id) => api.get(`/org-chart/${id}/`),
  getOrgChartFullTree: () => api.get("/org-chart/full_tree/"),

  // ========================================
  // EMPLOYEE ANALYTICS ENDPOINTS
  // ========================================
  getEmployeeAnalytics: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employee-analytics/?${queryString}`);
  },

  // ========================================
  // GRADING ENDPOINTS
  // ========================================
  getGrading: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/grading/?${queryString}`);
  },

  // ========================================
  // CONTRACT STATUS ENDPOINTS
  // ========================================
  getContractStatus: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/contract-status/?${queryString}`);
  },

  // ========================================
  // TEST ENDPOINTS
  // ========================================
  testConnection: () => api.get("/"),
  testAuth: () => api.get("/me/"),

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  // Generic GET request with params
  get: (endpoint, params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`${endpoint}${queryString ? `?${queryString}` : ''}`);
  },

  // Generic POST request
  post: (endpoint, data, options = {}) => {
    return api.post(endpoint, data, options);
  },

  // Generic PUT request
  put: (endpoint, data, options = {}) => {
    return api.put(endpoint, data, options);
  },

  // Generic PATCH request
  patch: (endpoint, data, options = {}) => {
    return api.patch(endpoint, data, options);
  },

  // Generic DELETE request
  delete: (endpoint, options = {}) => {
    return api.delete(endpoint, options);
  },

  // File upload helper
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

  // FIXED: Download file helper with better error handling
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

// Export default axios instance
export default api;

// Export token manager
export { TokenManager };