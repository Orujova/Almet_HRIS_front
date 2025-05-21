// src/services/api.js
import axios from 'axios';

<<<<<<< HEAD
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
=======
const API_URL = 'http://localhost:8000/api';
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72

const api = axios.create({
  baseURL: API_URL,
});

<<<<<<< HEAD
=======
// Request interceptor
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
<<<<<<< HEAD
      console.log('Attaching token to request:', token); // Add logging
    } else {
      console.log('No token found in localStorage');
=======
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
    }
    return config;
  },
  (error) => Promise.reject(error)
);

<<<<<<< HEAD
=======
// Response interceptor
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
<<<<<<< HEAD
=======
    // Token expired - refresh işi
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
<<<<<<< HEAD
        if (!refreshToken) {
          console.error('No refresh token found, redirecting to login');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        console.log('Attempting to refresh token');
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        console.log('Token refreshed successfully:', response.data);
        localStorage.setItem('accessToken', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
=======
        
        if (!refreshToken) {
          window.location.href = '/';
          return Promise.reject(error);
        }
        
        // Refresh token ilə yeni access token alırıq
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken
        });
        
        // Yeni token-i saxlayırıq
        localStorage.setItem('accessToken', response.data.access);
        
        // Orijinal sorğunu təkrarlayırıq
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh token də işləmirsə, çıxış edirik
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
        return Promise.reject(refreshError);
      }
    }
    
<<<<<<< HEAD
    console.error('API request error:', error.response?.data || error.message);
=======
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
    return Promise.reject(error);
  }
);

export default api;