// src/services/api.js - ENHANCED: Complete API integration with your backend
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await api.post("/auth/refresh/", {
          refresh: refreshToken,
        });
        
        const newAccessToken = response.data.access;
        localStorage.setItem("accessToken", newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const redirectToLogin = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  if (typeof window !== 'undefined') {
    window.location.href = "/login";
  }
};

// ENHANCED API Service with complete backend integration
export const apiService = {
  // Auth endpoints
  getCurrentUser: () => api.get("/me/"),
  
  // Employee endpoints - comprehensive with all features
  getEmployees: (params = {}) => {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        if (Array.isArray(params[key])) {
          searchParams.append(key, params[key].join(','));
        } else {
          searchParams.append(key, params[key]);
        }
      }
    });
    
    return api.get(`/employees/?${searchParams.toString()}`);
  },
  
  getEmployee: (id) => api.get(`/employees/${id}/`),
  createEmployee: (data) => api.post("/employees/", data),
  updateEmployee: (id, data) => api.put(`/employees/${id}/`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}/`),
  
  // Employee statistics and filter options
  getEmployeeStatistics: () => api.get("/employees/statistics/"),
  getEmployeeFilterOptions: () => api.get("/employees/filter_options/"),
  
  // Enhanced bulk operations
  bulkUpdateEmployees: (data) => api.post("/employees/bulk_update/", data),
  bulkDeleteEmployees: (ids) => api.post("/employees/bulk_delete/", { employee_ids: ids }),
  softDeleteEmployees: (ids) => api.post("/employees/soft_delete/", { employee_ids: ids }),
  restoreEmployees: (ids) => api.post("/employees/restore/", { employee_ids: ids }),

  // Tag management - easy add/remove
  addEmployeeTag: (employeeId, tagData) => api.post("/employees/add_tag/", { 
    employee_id: employeeId, 
    ...tagData 
  }),
  removeEmployeeTag: (employeeId, tagId) => api.post("/employees/remove_tag/", { 
    employee_id: employeeId, 
    tag_id: tagId 
  }),
  bulkAddTags: (employeeIds, tagIds) => api.post("/employees/bulk_add_tag/", { 
    employee_ids: employeeIds, 
    tag_ids: tagIds 
  }),
  bulkRemoveTags: (employeeIds, tagIds) => api.post("/employees/bulk_remove_tag/", { 
    employee_ids: employeeIds, 
    tag_ids: tagIds 
  }),

  // Status management - automatic transitions based on contract
  updateEmployeeStatus: (employeeIds) => api.post("/employees/update_status/", { 
    employee_ids: Array.isArray(employeeIds) ? employeeIds : [employeeIds] 
  }),
  autoUpdateStatuses: () => api.post("/employees/auto_update_status/"),
  
  // Line manager management
  getLineManagers: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/employees/line_managers/?${searchParams.toString()}`);
  },
  updateLineManager: (employeeId, lineManagerId) => api.post("/employees/update_single_line_manager/", { 
    employee_id: employeeId, 
    line_manager_id: lineManagerId 
  }),
  bulkUpdateLineManager: (employeeIds, lineManagerId) => api.post("/employees/bulk_update_line_manager/", { 
    employee_ids: employeeIds, 
    line_manager_id: lineManagerId 
  }),

  // Enhanced export with field selection
  exportEmployees: (params = {}) => {
    return api.post("/employees/export_selected/", params, {
      responseType: 'blob'
    });
  },

  // Employee activities and audit trail
  getEmployeeActivities: (employeeId) => api.get(`/employees/${employeeId}/activities/`),

  // Business Functions
  getBusinessFunctions: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/business-functions/?${searchParams.toString()}`);
  },
  getBusinessFunction: (id) => api.get(`/business-functions/${id}/`),
  createBusinessFunction: (data) => api.post("/business-functions/", data),
  updateBusinessFunction: (id, data) => api.put(`/business-functions/${id}/`, data),
  deleteBusinessFunction: (id) => api.delete(`/business-functions/${id}/`),

  // Departments - hierarchical with business function dependency
  getDepartments: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/departments/?${searchParams.toString()}`);
  },
  getDepartment: (id) => api.get(`/departments/${id}/`),
  createDepartment: (data) => api.post("/departments/", data),
  updateDepartment: (id, data) => api.put(`/departments/${id}/`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}/`),

  // Units - hierarchical with department dependency
  getUnits: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/units/?${searchParams.toString()}`);
  },
  getUnit: (id) => api.get(`/units/${id}/`),
  createUnit: (data) => api.post("/units/", data),
  updateUnit: (id, data) => api.put(`/units/${id}/`, data),
  deleteUnit: (id) => api.delete(`/units/${id}/`),

  // Job Functions
  getJobFunctions: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/job-functions/?${searchParams.toString()}`);
  },
  getJobFunction: (id) => api.get(`/job-functions/${id}/`),
  createJobFunction: (data) => api.post("/job-functions/", data),
  updateJobFunction: (id, data) => api.put(`/job-functions/${id}/`, data),
  deleteJobFunction: (id) => api.delete(`/job-functions/${id}/`),

  // Position Groups with grading levels
  getPositionGroups: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/position-groups/?${searchParams.toString()}`);
  },
  getPositionGroup: (id) => api.get(`/position-groups/${id}/`),
  getPositionGroupGradingLevels: (id) => api.get(`/position-groups/${id}/grading_levels/`),
  createPositionGroup: (data) => api.post("/position-groups/", data),
  updatePositionGroup: (id, data) => api.put(`/position-groups/${id}/`, data),
  deletePositionGroup: (id) => api.delete(`/position-groups/${id}/`),

  // Employee Statuses with duration configuration
  getEmployeeStatuses: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/employee-statuses/?${searchParams.toString()}`);
  },
  getEmployeeStatus: (id) => api.get(`/employee-statuses/${id}/`),
  createEmployeeStatus: (data) => api.post("/employee-statuses/", data),
  updateEmployeeStatus: (id, data) => api.put(`/employee-statuses/${id}/`, data),
  deleteEmployeeStatus: (id) => api.delete(`/employee-statuses/${id}/`),

  // Employee Tags with types
  getEmployeeTags: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/employee-tags/?${searchParams.toString()}`);
  },
  getEmployeeTag: (id) => api.get(`/employee-tags/${id}/`),
  createEmployeeTag: (data) => api.post("/employee-tags/", data),
  updateEmployeeTag: (id, data) => api.put(`/employee-tags/${id}/`, data),
  deleteEmployeeTag: (id) => api.delete(`/employee-tags/${id}/`),

  // Employee Grading
  getEmployeeGrading: () => api.get("/employee-grading/"),
  bulkUpdateEmployeeGrades: (updates) => api.post("/employee-grading/bulk_update_grades/", { updates }),

  // Org Chart
  getOrgChart: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/org-chart/?${searchParams.toString()}`);
  },
  getOrgChartNode: (id) => api.get(`/org-chart/${id}/`),
  getOrgChartFullTree: () => api.get("/org-chart/full_tree/"),

  // Headcount Analytics
  getHeadcountSummaries: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/headcount-summaries/?${searchParams.toString()}`);
  },
  getHeadcountSummary: (id) => api.get(`/headcount-summaries/${id}/`),
  generateCurrentHeadcountSummary: () => api.post("/headcount-summaries/generate_current/"),
  getLatestHeadcountSummary: () => api.get("/headcount-summaries/latest/"),

  // Vacant Positions
  getVacantPositions: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/vacant-positions/?${searchParams.toString()}`);
  },
  getVacantPosition: (id) => api.get(`/vacant-positions/${id}/`),
  createVacantPosition: (data) => api.post("/vacant-positions/", data),
  updateVacantPosition: (id, data) => api.put(`/vacant-positions/${id}/`, data),
  deleteVacantPosition: (id) => api.delete(`/vacant-positions/${id}/`),
  markPositionFilled: (id, data) => api.post(`/vacant-positions/${id}/mark_filled/`, data),
  getVacantPositionStatistics: () => api.get("/vacant-positions/statistics/"),

  // Test endpoints
  testConnection: () => api.get("/"),
  testAuth: () => api.get("/me/"),
};

// Specialized APIs for better organization
export const referenceDataAPI = {
  // Business Functions
  getBusinessFunctions: () => apiService.getBusinessFunctions(),
  getBusinessFunction: (id) => apiService.getBusinessFunction(id),
  createBusinessFunction: (data) => apiService.createBusinessFunction(data),
  updateBusinessFunction: (id, data) => apiService.updateBusinessFunction(id, data),
  deleteBusinessFunction: (id) => apiService.deleteBusinessFunction(id),

  // Departments with business function filtering
  getDepartments: (businessFunctionId = null) => {
    const params = businessFunctionId ? { business_function: businessFunctionId } : {};
    return apiService.getDepartments(params);
  },
  getDepartment: (id) => apiService.getDepartment(id),
  createDepartment: (data) => apiService.createDepartment(data),
  updateDepartment: (id, data) => apiService.updateDepartment(id, data),
  deleteDepartment: (id) => apiService.deleteDepartment(id),

  // Units with department filtering
  getUnits: (departmentId = null) => {
    const params = departmentId ? { department: departmentId } : {};
    return apiService.getUnits(params);
  },
  getUnit: (id) => apiService.getUnit(id),
  createUnit: (data) => apiService.createUnit(data),
  updateUnit: (id, data) => apiService.updateUnit(id, data),
  deleteUnit: (id) => apiService.deleteUnit(id),

  // Job Functions
  getJobFunctions: () => apiService.getJobFunctions(),
  getJobFunction: (id) => apiService.getJobFunction(id),
  createJobFunction: (data) => apiService.createJobFunction(data),
  updateJobFunction: (id, data) => apiService.updateJobFunction(id, data),
  deleteJobFunction: (id) => apiService.deleteJobFunction(id),

  // Position Groups
  getPositionGroups: () => apiService.getPositionGroups(),
  getPositionGroup: (id) => apiService.getPositionGroup(id),
  getPositionGroupGradingLevels: (id) => apiService.getPositionGroupGradingLevels(id),
  createPositionGroup: (data) => apiService.createPositionGroup(data),
  updatePositionGroup: (id, data) => apiService.updatePositionGroup(id, data),
  deletePositionGroup: (id) => apiService.deletePositionGroup(id),

  // Employee Statuses
  getEmployeeStatuses: () => apiService.getEmployeeStatuses(),
  getEmployeeStatus: (id) => apiService.getEmployeeStatus(id),
  createEmployeeStatus: (data) => apiService.createEmployeeStatus(data),
  updateEmployeeStatus: (id, data) => apiService.updateEmployeeStatus(id, data),
  deleteEmployeeStatus: (id) => apiService.deleteEmployeeStatus(id),

  // Employee Tags with type filtering
  getEmployeeTags: (tagType = null) => {
    const params = tagType ? { tag_type: tagType } : {};
    return apiService.getEmployeeTags(params);
  },
  getEmployeeTag: (id) => apiService.getEmployeeTag(id),
  createEmployeeTag: (data) => apiService.createEmployeeTag(data),
  updateEmployeeTag: (id, data) => apiService.updateEmployeeTag(id, data),
  deleteEmployeeTag: (id) => apiService.deleteEmployeeTag(id),
};

export const employeeAPI = {
  // Basic CRUD
  getAll: (params) => apiService.getEmployees(params),
  getById: (id) => apiService.getEmployee(id),
  create: (data) => apiService.createEmployee(data),
  update: (id, data) => apiService.updateEmployee(id, data),
  delete: (id) => apiService.deleteEmployee(id),
  
  // Statistics and filter options
  getStatistics: () => apiService.getEmployeeStatistics(),
  getFilterOptions: () => apiService.getEmployeeFilterOptions(),
  
  // Bulk operations
  bulkUpdate: (data) => apiService.bulkUpdateEmployees(data),
  bulkDelete: (ids) => apiService.bulkDeleteEmployees(ids),
  softDelete: (ids) => apiService.softDeleteEmployees(ids),
  restore: (ids) => apiService.restoreEmployees(ids),
  
  // Tag management
  addTag: (employeeId, tagData) => apiService.addEmployeeTag(employeeId, tagData),
  removeTag: (employeeId, tagId) => apiService.removeEmployeeTag(employeeId, tagId),
  bulkAddTags: (employeeIds, tagIds) => apiService.bulkAddTags(employeeIds, tagIds),
  bulkRemoveTags: (employeeIds, tagIds) => apiService.bulkRemoveTags(employeeIds, tagIds),
  
  // Status management
  updateStatus: (employeeIds) => apiService.updateEmployeeStatus(employeeIds),
  autoUpdateStatuses: () => apiService.autoUpdateStatuses(),
  
  // Line manager management
  getLineManagers: (params) => apiService.getLineManagers(params),
  updateLineManager: (employeeId, lineManagerId) => apiService.updateLineManager(employeeId, lineManagerId),
  bulkUpdateLineManager: (employeeIds, lineManagerId) => apiService.bulkUpdateLineManager(employeeIds, lineManagerId),
  
  // Export
  export: (params) => apiService.exportEmployees(params),
  
  // Activities
  getActivities: (employeeId) => apiService.getEmployeeActivities(employeeId),
};

export const gradingAPI = {
  getEmployeeGrading: () => apiService.getEmployeeGrading(),
  bulkUpdateGrades: (updates) => apiService.bulkUpdateEmployeeGrades(updates),
  getPositionGroupLevels: (positionGroupId) => apiService.getPositionGroupGradingLevels(positionGroupId),
};

export const orgChartAPI = {
  getOrgChart: (params) => apiService.getOrgChart(params),
  getOrgChartNode: (id) => apiService.getOrgChartNode(id),
  getFullTree: () => apiService.getOrgChartFullTree(),
};

export const headcountAPI = {
  getSummaries: (params) => apiService.getHeadcountSummaries(params),
  getSummary: (id) => apiService.getHeadcountSummary(id),
  generateCurrent: () => apiService.generateCurrentHeadcountSummary(),
  getLatest: () => apiService.getLatestHeadcountSummary(),
};

export const vacancyAPI = {
  getAll: (params) => apiService.getVacantPositions(params),
  getById: (id) => apiService.getVacantPosition(id),
  create: (data) => apiService.createVacantPosition(data),
  update: (id, data) => apiService.updateVacantPosition(id, data),
  delete: (id) => apiService.deleteVacantPosition(id),
  markFilled: (id, data) => apiService.markPositionFilled(id, data),
  getStatistics: () => apiService.getVacantPositionStatistics(),
};

export default api;