// src/services/api.js - ENHANCED: Complete headcount API integration
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

// API Methods - Complete backend integration
export const apiService = {
  // Auth endpoints
  getCurrentUser: () => api.get("/me/"),
  
  // Employee endpoints with comprehensive filtering and sorting
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
  
  // Employee specific endpoints
  getEmployeeFilterOptions: () => api.get("/employees/filter_options/"),
  getEmployeeStatistics: () => api.get("/employees/statistics/"),
  
  // Bulk operations
  bulkUpdateEmployees: (data) => api.post("/employees/bulk_update/", data),
  bulkDeleteEmployees: (ids) => api.post("/employees/bulk_delete/", { employee_ids: ids }),
  
  // Export functionality with filters
  exportEmployees: (format = 'csv', params = {}) => {
    const searchParams = new URLSearchParams({
      format,
      ...params
    });
    return api.get(`/employees/export_data/?${searchParams.toString()}`, {
      responseType: format === 'excel' ? 'blob' : 'json'
    });
  },
  
  // Advanced search with dropdown suggestions
  dropdownSearch: (field, search, limit = 50) => 
    api.get(`/employees/dropdown_search/?field=${field}&search=${search}&limit=${limit}`),
  
  // Org chart endpoints
  getOrgChart: () => api.get("/employees/org_chart/"),
  updateOrgChartVisibility: (data) => api.patch("/employees/update_org_chart_visibility/", data),
  updateSingleOrgChartVisibility: (id, data) => api.patch(`/employees/${id}/org_chart_visibility/`, data),
  
  // Status management with automatic transitions
  getStatusDashboard: () => api.get("/employees/status-dashboard/"),
  updateEmployeeStatus: (id) => api.post(`/employees/${id}/update-status/`),
  getStatusPreview: (id) => api.get(`/employees/${id}/status-preview/`),
  bulkUpdateStatuses: (employeeIds = []) => api.post("/employees/bulk-update-statuses/", { employee_ids: employeeIds }),
  getStatusRules: () => api.get("/employees/status-rules/"),
  
  // Employee Tags Management
  getEmployeeTags: (tagType = null) => {
    const params = tagType ? `?tag_type=${tagType}` : '';
    return api.get(`/employee-tags/dropdown_options/${params}`);
  },
  createEmployeeTag: (data) => api.post("/employee-tags/", data),
  updateEmployeeTag: (id, data) => api.put(`/employee-tags/${id}/`, data),
  deleteEmployeeTag: (id) => api.delete(`/employee-tags/${id}/`),
  
  // Employee Tag Assignment
  addEmployeeTag: (employeeId, tagData) => api.post(`/employees/${employeeId}/add_tag/`, tagData),
  removeEmployeeTag: (employeeId, tagId) => api.delete(`/employees/${employeeId}/remove_tag/${tagId}/`),
  bulkAddTags: (employeeIds, tagIds) => api.post("/employees/bulk_add_tags/", { 
    employee_ids: employeeIds, 
    tag_ids: tagIds 
  }),
  bulkRemoveTags: (employeeIds, tagIds) => api.post("/employees/bulk_remove_tags/", { 
    employee_ids: employeeIds, 
    tag_ids: tagIds 
  }),
  
  // Reference data endpoints with hierarchical dependencies
  getBusinessFunctions: () => api.get("/business-functions/"),
  getBusinessFunctionDropdown: () => api.get("/business-functions/dropdown_options/"),
  
  getDepartments: (businessFunctionId = null) => {
    const params = businessFunctionId ? `?business_function=${businessFunctionId}` : '';
    return api.get(`/departments/dropdown_options/${params}`);
  },
  
  getUnits: (departmentId = null) => {
    const params = departmentId ? `?department=${departmentId}` : '';
    return api.get(`/units/dropdown_options/${params}`);
  },
  
  getJobFunctions: () => api.get("/job-functions/dropdown_options/"),
  getPositionGroups: () => api.get("/position-groups/dropdown_options/"),
  getEmployeeStatuses: () => api.get("/employee-statuses/dropdown_options/"),
  
  // Position Group Grading Integration
  getPositionGroupGradingLevels: (positionGroupId) => 
    api.get(`/position-groups/${positionGroupId}/grading_levels/`),
  
  // Employee Grading Management
  getEmployeeGrading: () => api.get("/employee-grading/"),
  bulkUpdateEmployeeGrades: (updates) => api.post("/employee-grading/bulk_update_grades/", { updates }),
  
  // Documents Management (Optional)
  getEmployeeDocuments: (employeeId = null) => {
    const params = employeeId ? `?employee=${employeeId}` : '';
    return api.get(`/employee-documents/${params}`);
  },
  uploadEmployeeDocument: (formData) => {
    return api.post("/employee-documents/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteEmployeeDocument: (id) => api.delete(`/employee-documents/${id}/`),
  
  // Activities and Audit Trail
  getEmployeeActivities: (employeeId = null) => {
    const params = employeeId ? `?employee=${employeeId}` : '';
    return api.get(`/employee-activities/${params}`);
  },
  getRecentActivities: (limit = 50) => api.get(`/employee-activities/recent_activities/?limit=${limit}`),
  getActivitySummary: () => api.get("/employee-activities/activity_summary/"),
  
  // Headcount Analytics
  getHeadcountSummaries: () => api.get("/headcount-summaries/"),
  getLatestHeadcountSummary: () => api.get("/headcount-summaries/latest/"),
  generateCurrentHeadcountSummary: () => api.post("/headcount-summaries/generate_current/"),
  
  // Vacant Positions Management
  getVacantPositions: () => api.get("/vacant-positions/"),
  createVacantPosition: (data) => api.post("/vacant-positions/", data),
  updateVacantPosition: (id, data) => api.put(`/vacant-positions/${id}/`, data),
  deleteVacantPosition: (id) => api.delete(`/vacant-positions/${id}/`),
  markPositionFilled: (id, employeeData) => api.post(`/vacant-positions/${id}/mark_filled/`, employeeData),
  
  // Grading System Integration
  getGradingSystems: () => api.get("/grading/systems/"),
  getCurrentGradingStructure: () => api.get("/grading/scenarios/current/"),
  getGradingScenarios: () => api.get("/grading/scenarios/"),
  
  // Test endpoints
  testConnection: () => api.get("/employees/"),
  testAuth: () => api.get("/me/"),
};

// Specialized API for Reference Data
export const referenceDataAPI = {
  getBusinessFunctionDropdown: () => apiService.getBusinessFunctionDropdown(),
  getDepartmentDropdown: (businessFunctionId) => apiService.getDepartments(businessFunctionId),
  getUnitDropdown: (departmentId) => apiService.getUnits(departmentId),
  getJobFunctionDropdown: () => apiService.getJobFunctions(),
  getPositionGroupDropdown: () => apiService.getPositionGroups(),
  getEmployeeStatusDropdown: () => apiService.getEmployeeStatuses(),
  getEmployeeTagDropdown: (tagType) => apiService.getEmployeeTags(tagType),
};

// Employee API with enhanced features
export const employeeAPI = {
  // Basic CRUD
  getAll: (params) => apiService.getEmployees(params),
  getById: (id) => apiService.getEmployee(id),
  create: (data) => apiService.createEmployee(data),
  update: (id, data) => apiService.updateEmployee(id, data),
  delete: (id) => apiService.deleteEmployee(id),
  
  // Advanced features
  getFilterOptions: () => apiService.getEmployeeFilterOptions(),
  getStatistics: () => apiService.getEmployeeStatistics(),
  export: (format, params) => apiService.exportEmployees(format, params),
  
  // Bulk operations
  bulkUpdate: (data) => apiService.bulkUpdateEmployees(data),
  bulkDelete: (ids) => apiService.bulkDeleteEmployees(ids),
  
  // Tags management
  addTag: (employeeId, tagData) => apiService.addEmployeeTag(employeeId, tagData),
  removeTag: (employeeId, tagId) => apiService.removeEmployeeTag(employeeId, tagId),
  bulkAddTags: (employeeIds, tagIds) => apiService.bulkAddTags(employeeIds, tagIds),
  bulkRemoveTags: (employeeIds, tagIds) => apiService.bulkRemoveTags(employeeIds, tagIds),
  
  // Status management
  updateStatus: (id) => apiService.updateEmployeeStatus(id),
  getStatusPreview: (id) => apiService.getStatusPreview(id),
  bulkUpdateStatuses: (employeeIds) => apiService.bulkUpdateStatuses(employeeIds),
  
  // Grading
  getWithGrading: () => apiService.getEmployeeGrading(),
  bulkUpdateGrades: (updates) => apiService.bulkUpdateEmployeeGrades(updates),
  
  // Documents
  getDocuments: (employeeId) => apiService.getEmployeeDocuments(employeeId),
  uploadDocument: (formData) => apiService.uploadEmployeeDocument(formData),
  deleteDocument: (id) => apiService.deleteEmployeeDocument(id),
  
  // Activities
  getActivities: (employeeId) => apiService.getEmployeeActivities(employeeId),
  getRecentActivities: (limit) => apiService.getRecentActivities(limit),
};

// Tag Management API
export const tagAPI = {
  getAll: (tagType) => apiService.getEmployeeTags(tagType),
  create: (data) => apiService.createEmployeeTag(data),
  update: (id, data) => apiService.updateEmployeeTag(id, data),
  delete: (id) => apiService.deleteEmployeeTag(id),
};

// Grading API
export const gradingAPI = {
  getEmployeeGrading: () => apiService.getEmployeeGrading(),
  getPositionGroupLevels: (positionGroupId) => apiService.getPositionGroupGradingLevels(positionGroupId),
  bulkUpdateGrades: (updates) => apiService.bulkUpdateEmployeeGrades(updates),
  getCurrentStructure: () => apiService.getCurrentGradingStructure(),
};

export default api;