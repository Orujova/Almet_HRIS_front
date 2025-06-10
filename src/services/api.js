// src/services/api.js - Backend integration
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// API instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          redirectToLogin();
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/refresh/`, {
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

// API Methods - Backend URL structure
export const apiService = {
  // Auth endpoints
  getCurrentUser: () => api.get("/me/"),
  
  // Employee endpoints with proper backend field mapping
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
  bulkUpdateEmployees: (data) => api.post("/employees/bulk_update/", data),
  exportEmployees: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/employees/export_data/?${searchParams.toString()}`);
  },
  
  // Dropdown search
  dropdownSearch: (field, search, limit = 50) => 
    api.get(`/employees/dropdown_search/?field=${field}&search=${search}&limit=${limit}`),
  
  // Org chart endpoints
  getOrgChart: () => api.get("/employees/org_chart/"),
  updateOrgChartVisibility: (data) => api.patch("/employees/update_org_chart_visibility/", data),
  updateSingleOrgChartVisibility: (id, data) => api.patch(`/employees/${id}/org_chart_visibility/`, data),
  
  // Status management
  getStatusDashboard: () => api.get("/employees/status-dashboard/"),
  updateEmployeeStatus: (id) => api.post(`/employees/${id}/update-status/`),
  getStatusPreview: (id) => api.get(`/employees/${id}/status-preview/`),
  bulkUpdateStatuses: (employeeIds = []) => api.post("/employees/bulk-update-statuses/", { employee_ids: employeeIds }),
  getStatusRules: () => api.get("/employees/status-rules/"),
  
  // Reference data endpoints
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
  getEmployeeTags: (tagType = null) => {
    const params = tagType ? `?tag_type=${tagType}` : '';
    return api.get(`/employee-tags/dropdown_options/${params}`);
  },
  
  // Documents
  getEmployeeDocuments: (employeeId = null) => {
    const params = employeeId ? `?employee=${employeeId}` : '';
    return api.get(`/employee-documents/${params}`);
  },
  uploadEmployeeDocument: (data) => api.post("/employee-documents/", data),
  deleteEmployeeDocument: (id) => api.delete(`/employee-documents/${id}/`),
  
  // Activities
  getEmployeeActivities: (employeeId = null) => {
    const params = employeeId ? `?employee=${employeeId}` : '';
    return api.get(`/employee-activities/${params}`);
  },
  getRecentActivities: (limit = 50) => api.get(`/employee-activities/recent_activities/?limit=${limit}`),
  getActivitySummary: () => api.get("/employee-activities/activity_summary/"),
  
  // Test endpoints
  testConnection: () => api.get("/employees/"),
  testAuth: () => api.get("/me/"),
};

export default api;