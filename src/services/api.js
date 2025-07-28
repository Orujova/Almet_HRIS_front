// src/services/api.js - UPDATED: Yeni endpointlər və genişləndirilmiş funksionallıq
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

// Enhanced query parameters helper - Multiple Sorting və Advanced Filtering dəstəyi
const buildQueryParams = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // Handle arrays - for multiple selections and sorting
        if (key === 'ordering' || key === 'sort') {
          // Special handling for sorting arrays
          if (value.length > 0) {
            const sortString = value.map(sortObj => {
              if (typeof sortObj === 'object' && sortObj.field && sortObj.direction) {
                return sortObj.direction === 'desc' ? `-${sortObj.field}` : sortObj.field;
              }
              return sortObj;
            }).join(',');
            searchParams.append('ordering', sortString);
          }
        } else {
          // Regular array handling for filters
          searchParams.append(key, value.join(','));
        }
      } else if (typeof value === 'object') {
        // Handle objects (like date ranges)
        if (value.from && value.to) {
          searchParams.append(`${key}_from`, value.from);
          searchParams.append(`${key}_to`, value.to);
        } else if (value.min !== null && value.max !== null) {
          searchParams.append(`${key}_min`, value.min);
          searchParams.append(`${key}_max`, value.max);
        } else {
          // Other object types, serialize as JSON
          searchParams.append(key, JSON.stringify(value));
        }
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

// API Service - Backend endpointlərinə uyğun və yenilənmiş
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
  // EMPLOYEES - Enhanced with comprehensive filtering and sorting
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
  // BULK OPERATIONS - Enhanced
  // ========================================
  softDeleteEmployees: (employeeIds) => api.post("/employees/soft-delete/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),
  restoreEmployees: (employeeIds) => api.post("/employees/restore/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),

  // ========================================
  // ORG CHART VISIBILITY - YENİ ENDPOİNTLƏR
  // ========================================
  toggleOrgChartVisibility: (employeeId) => api.post("/employees/toggle-org-chart-visibility/", {
    employee_id: employeeId
  }),
  
  bulkToggleOrgChartVisibility: (employeeIds, setVisible) => api.post("/employees/bulk-toggle-org-chart-visibility/", {
    employee_ids: employeeIds,
    set_visible: setVisible
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
  // ADVANCED SEARCH & FILTERING METHODS - YENİ
  // ========================================
  
  // Comprehensive employee search with all filter options
  searchEmployeesAdvanced: (searchParams = {}) => {
    // Process advanced search parameters
    const processedParams = {
      // Text-based searches
      search: searchParams.search,
      employee_search: searchParams.employee_search,
      line_manager_search: searchParams.line_manager_search,
      job_title_search: searchParams.job_title_search,
      
      // Multi-select filters
      business_function: searchParams.business_function,
      department: searchParams.department,
      unit: searchParams.unit,
      job_function: searchParams.job_function,
      position_group: searchParams.position_group,
      status: searchParams.status,
      grading_level: searchParams.grading_level,
      contract_duration: searchParams.contract_duration,
      line_manager: searchParams.line_manager,
      tags: searchParams.tags,
      gender: searchParams.gender,
      
      // Date ranges
      start_date_from: searchParams.start_date_range?.from,
      start_date_to: searchParams.start_date_range?.to,
      contract_end_date_from: searchParams.contract_end_date_range?.from,
      contract_end_date_to: searchParams.contract_end_date_range?.to,
      
      // Numeric ranges
      years_of_service_min: searchParams.years_of_service_range?.min,
      years_of_service_max: searchParams.years_of_service_range?.max,
      
      // Boolean filters
      is_active: searchParams.is_active,
      is_visible_in_org_chart: searchParams.is_visible_in_org_chart,
      is_deleted: searchParams.is_deleted,
      
      // Special filters
      status_needs_update: searchParams.status_needs_update,
      contract_expiring_days: searchParams.contract_expiring_days,
      
      // Sorting - Enhanced multiple sorting support
      ordering: searchParams.sorting || searchParams.ordering,
      
      // Pagination
      page: searchParams.page,
      page_size: searchParams.page_size
    };

    return apiService.getEmployees(processedParams);
  },

  // Multiple sorting helper
  buildSortingParams: (sortingArray) => {
    if (!Array.isArray(sortingArray) || sortingArray.length === 0) {
      return '';
    }
    
    return sortingArray.map(sort => {
      if (typeof sort === 'object' && sort.field && sort.direction) {
        return sort.direction === 'desc' ? `-${sort.field}` : sort.field;
      } else if (typeof sort === 'string') {
        return sort;
      }
      return '';
    }).filter(Boolean).join(',');
  },

  // Filter presets
  applyFilterPreset: (presetName, additionalParams = {}) => {
    const presets = {
      'active_employees': {
        status: ['ACTIVE'],
        is_active: true
      },
      'new_hires': {
        years_of_service_range: { min: 0, max: 0.25 }
      },
      'probation_employees': {
        status: ['PROBATION']
      },
      'onboarding_employees': {
        status: ['ONBOARDING']
      },
      'on_leave': {
        status: ['ON_LEAVE']
      },
      'no_line_manager': {
        line_manager: null
      },
      'needs_grading': {
        grading_level: []
      },
      'contract_ending_soon': {
        contract_expiring_days: 30
      },
      'org_chart_visible': {
        is_visible_in_org_chart: true
      },
      'org_chart_hidden': {
        is_visible_in_org_chart: false
      }
    };

    const presetParams = presets[presetName] || {};
    return apiService.searchEmployeesAdvanced({ ...presetParams, ...additionalParams });
  },

  // ========================================
  // UTILITY FUNCTIONS - Enhanced
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
  },

  // ========================================
  // BATCH OPERATIONS - Enhanced
  // ========================================
  batchOperation: async (operation, employeeIds, data = {}) => {
    const operations = {
      'delete': () => apiService.softDeleteEmployees(employeeIds),
      'restore': () => apiService.restoreEmployees(employeeIds),
      'add_tag': (tagId) => apiService.bulkAddTags(employeeIds, tagId),
      'remove_tag': (tagId) => apiService.bulkRemoveTags(employeeIds, tagId),
      'assign_manager': (managerId) => apiService.bulkAssignLineManager({
        employee_ids: employeeIds,
        line_manager_id: managerId
      }),
      'extend_contracts': (contractData) => apiService.bulkExtendContracts({
        employee_ids: employeeIds,
        ...contractData
      }),
      'show_in_org_chart': () => apiService.bulkToggleOrgChartVisibility(employeeIds, true),
      'hide_from_org_chart': () => apiService.bulkToggleOrgChartVisibility(employeeIds, false),
      'update_grades': (updates) => apiService.bulkUpdateEmployeeGrades(updates)
    };

    const operationFn = operations[operation];
    if (!operationFn) {
      throw new Error(`Unknown batch operation: ${operation}`);
    }

    if (operation === 'add_tag' || operation === 'remove_tag') {
      return operationFn(data.tagId);
    } else if (operation === 'assign_manager') {
      return operationFn(data.managerId);
    } else if (operation === 'extend_contracts') {
      return operationFn(data);
    } else if (operation === 'update_grades') {
      return operationFn(data.updates);
    } else {
      return operationFn();
    }
  }
};

export default api;
export { TokenManager };