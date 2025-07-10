// src/services/api.js - Complete API Service with all endpoints
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

// Response interceptor - token refresh və error handling
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

    // Digər error handling
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data);
    }

    return Promise.reject(error);
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
  // EMPLOYEE ENDPOINTS - TAM CRUD İŞLEMLERİ
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

  // Employee Statistics və Filter Options
  getEmployeeStatistics: () => api.get("/employees/statistics/"),
  getEmployeeFilterOptions: () => api.get("/employees/filter_options/"),

  // Bulk Operations
  bulkUpdateEmployees: (data) => api.post("/employees/bulk_update/", data),
  bulkDeleteEmployees: (employeeIds) => api.post("/employees/bulk_delete/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),
  softDeleteEmployees: (employeeIds) => api.post("/employees/soft_delete/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),
  restoreEmployees: (employeeIds) => api.post("/employees/restore/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),
  bulkCreateEmployees: (data) => api.post("/employees/bulk_create/", data),

  // Tag Management
  addEmployeeTag: (data) => api.post("/employees/add_tag/", data),
  removeEmployeeTag: (data) => api.post("/employees/remove_tag/", data),
  bulkAddTags: (employeeIds, tagIds) => api.post("/employees/bulk_add_tag/", { 
    employee_ids: employeeIds, 
    tag_ids: tagIds 
  }),
  bulkRemoveTags: (employeeIds, tagIds) => api.post("/employees/bulk_remove_tag/", { 
    employee_ids: employeeIds, 
    tag_ids: tagIds 
  }),

  // Status Management - Avtomatik status dəyişikliyi
  updateEmployeeStatus: (employeeIds) => api.post("/employees/update_status/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),
  autoUpdateStatuses: () => api.post("/employees/auto_update_status/"),

  // Line Manager Management
  getLineManagers: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/employees/line_managers/?${queryString}`);
  },
  updateLineManager: (employeeId, lineManagerId) => api.post("/employees/update_single_line_manager/", { 
    employee_id: employeeId, 
    line_manager_id: lineManagerId 
  }),
  bulkUpdateLineManager: (employeeIds, lineManagerId) => api.post("/employees/bulk_update_line_manager/", { 
    employee_ids: employeeIds, 
    line_manager_id: lineManagerId 
  }),

  // Export - Yalnız seçilmiş məlumatları export et
  exportEmployees: (params = {}) => {
    return api.post("/employees/export_selected/", params, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  },

  // Download Employee Template
  downloadEmployeeTemplate: () => {
    return api.get("/employees/download_template/", {
      responseType: 'blob'
    });
  },

  // ========================================
  // EMPLOYEE GRADING ENDPOINTS
  // ========================================
  getEmployeeGrading: () => api.get("/employee-grading/"),
  bulkUpdateEmployeeGrades: (updates) => api.post("/employee-grading/bulk_update_grades/", { updates }),


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
  // ORG CHART ENDPOINTS (əgər ayrıca endpoint varsa)
  // ========================================
  getOrgChart: (params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`/org-chart/?${queryString}`);
  },
  getOrgChartNode: (id) => api.get(`/org-chart/${id}/`),
  getOrgChartFullTree: () => api.get("/org-chart/full_tree/"),

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

  // Download file helper
  downloadFile: (endpoint, filename, params = {}) => {
    const queryString = buildQueryParams(params);
    return api.get(`${endpoint}${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob'
    }).then(response => {
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return response;
    });
  }
};

// Export default axios instance
export default api;

// Export token manager
export { TokenManager };