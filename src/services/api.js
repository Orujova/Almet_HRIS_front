// src/services/api.js
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// API instance yaradın
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 saniyə timeout
});

// Request interceptor - hər request-ə token əlavə edir
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token request-ə əlavə edildi");
    } else {
      console.log("⚠️ Token tapılmadı");
    }
    
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - token yenilənməsi və error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);

    // 401 error - token expired ola bilər
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Token yenilənməyə cəhd edilir...");
        
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.log("❌ Refresh token tapılmadı");
          redirectToLogin();
          return Promise.reject(error);
        }

        // Token yenilə
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem("accessToken", newAccessToken);
        
        console.log("✅ Token yeniləndi");

        // Original request-i yenidən göndər
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
        
      } catch (refreshError) {
        console.error("❌ Token yenilənmədi:", refreshError);
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Login səhifəsinə yönləndir
const redirectToLogin = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
};

// API Methods
export const apiService = {
  // User məlumatları
  getCurrentUser: () => api.get("/me/"),
  
  // Employee API-ləri
  getEmployees: () => api.get("/employees/"),
  getEmployee: (id) => api.get(`/employees/${id}/`),
  createEmployee: (data) => api.post("/employees/", data),
  updateEmployee: (id, data) => api.put(`/employees/${id}/`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}/`),
  
  // Department API-ləri
  getDepartments: () => api.get("/departments/"),
  getDepartment: (id) => api.get(`/departments/${id}/`),
  createDepartment: (data) => api.post("/departments/", data),
  updateDepartment: (id, data) => api.put(`/departments/${id}/`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}/`),
  
  // Test API-ləri
  testConnection: () => api.get("/health/"),
  testAuth: () => api.get("/me/"),
};

// Raw axios instance (əgər custom request lazımdırsa)
export default api;