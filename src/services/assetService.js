// src/services/assetService.js - Enhanced with all API endpoints including new ones and fixes
import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  
  setAccessToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("accessToken", token);
    }
  },
  
  removeAccessToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
    }
  }
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeAccessToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Asset Service - Enhanced with all endpoints
export const assetService = {
  // Get all assets with filtering
  getAssets: async (params = {}) => {
    try {
      const response = await api.get('/assets/assets/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single asset by ID
  getAsset: async (id) => {
    try {
      const response = await api.get(`/assets/assets/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new asset
  createAsset: async (assetData) => {
    try {
      const response = await api.post('/assets/assets/', assetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update asset
  updateAsset: async (id, assetData) => {
    try {
      const response = await api.put(`/assets/assets/${id}/`, assetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete asset
  deleteAsset: async (id) => {
    try {
      const response = await api.delete(`/assets/assets/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Assign asset to employee - FIXED
  assignAsset: async (id, assignmentData) => {
    try {
      // Create proper assignment payload
      const payload = {
        employee: assignmentData.employee,
        check_out_date: assignmentData.check_out_date,
        check_out_notes: assignmentData.check_out_notes || '',
        condition_on_checkout: assignmentData.condition_on_checkout || 'EXCELLENT'
      };
      
      const response = await api.post(`/assets/assets/${id}/assign_to_employee/`, payload);
      return response.data;
    } catch (error) {
      console.error('Assignment error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Check in asset
  checkInAsset: async (id, checkInData) => {
    try {
      const response = await api.post(`/assets/assets/${id}/check_in_asset/`, checkInData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change asset status
  changeAssetStatus: async (id, statusData) => {
    try {
      const response = await api.post(`/assets/assets/${id}/change_status/`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get asset activities
  getAssetActivities: async (id) => {
    try {
      const response = await api.get(`/assets/assets/${id}/activities/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get asset assignment history
  getAssetAssignmentHistory: async (id) => {
    try {
      const response = await api.get(`/assets/assets/${id}/assignment_history/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export assets
  exportAssets: async (exportData) => {
    try {
      const response = await api.post('/assets/assets/export/', exportData, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get asset statistics
  getAssetStatistics: async () => {
    try {
      const response = await api.get('/assets/assets/statistics/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Category Service - Enhanced with full CRUD
export const categoryService = {
  // Get all categories
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/assets/categories/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single category
  getCategory: async (id) => {
    try {
      const response = await api.get(`/assets/categories/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/assets/categories/', categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/assets/categories/${id}/`, categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/assets/categories/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Employee Asset Service - Enhanced with all new APIs including missing ones
export const employeeAssetService = {
  // Get employee details with assets
  getEmployee: async (id) => {
    try {
      const response = await api.get(`/employees/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Accept assigned asset
  acceptAsset: async (employeeId, assetData) => {
    try {
      const response = await api.post(`/employees/${employeeId}/accept-asset/`, assetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Request asset clarification
  requestClarification: async (employeeId, clarificationData) => {
    try {
      const response = await api.post(`/employees/${employeeId}/request-asset-clarification/`, clarificationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Provide clarification - NEW API
  provideClarification: async (employeeId, clarificationData) => {
    try {
      const response = await api.post(`/employees/${employeeId}/provide-clarification/`, clarificationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel assignment - NEW API
  cancelAssignment: async (employeeId, cancellationData) => {
    try {
      const response = await api.post(`/employees/${employeeId}/cancel-assignment/`, cancellationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee asset history
  getEmployeeAssetHistory: async (employeeId) => {
    try {
      const response = await api.get(`/employees/${employeeId}/asset-history/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee pending asset actions
  getEmployeePendingActions: async (employeeId) => {
    try {
      const response = await api.get(`/employees/${employeeId}/pending-asset-actions/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Employee Service for general employee operations
export const employeeService = {
  // Get all employees for dropdowns
  getEmployees: async (params = {}) => {
    try {
      const response = await api.get('/employees/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get employee by ID
  getEmployee: async (id) => {
    try {
      const response = await api.get(`/employees/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search employees
  searchEmployees: async (searchTerm) => {
    try {
      const response = await api.get('/employees/', { 
        params: { search: searchTerm, page_size: 50 } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;