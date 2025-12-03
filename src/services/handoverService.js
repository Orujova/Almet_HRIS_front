// services/handoverService.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Token management
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

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
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

// ==========================================
// HANDOVER SERVICE
// ==========================================

const handoverService = {
  
  // ==========================================
  // HANDOVER TYPES
  // ==========================================
  
  /**
   * Get all handover types
   */
  getHandoverTypes: async () => {
    try {
      const response = await api.get('/handovers/types/');
      return response.data;
    } catch (error) {
      console.error('Error fetching handover types:', error);
      throw error;
    }
  },
  
  /**
   * Create new handover type
   */
  createHandoverType: async (data) => {
    try {
      const response = await api.post('/handovers/types/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating handover type:', error);
      throw error;
    }
  },
  
  // ==========================================
  // HANDOVER REQUESTS
  // ==========================================
  
  /**
   * Get all handover requests (filtered by user)
   */
  getAllHandovers: async () => {
    try {
      const response = await api.get('/handovers/requests/');
      return response.data;
    } catch (error) {
      console.error('Error fetching handovers:', error);
      throw error;
    }
  },
  
  /**
   * Get my handovers (given & received)
   */
  getMyHandovers: async () => {
    try {
      const response = await api.get('/handovers/requests/my_handovers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my handovers:', error);
      throw error;
    }
  },
  
  /**
   * Get pending approval handovers
   */
  getPendingApprovals: async () => {
    try {
      const response = await api.get('/handovers/requests/pending_approval/');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  },
  
  /**
   * Get handover statistics
   */
  getStatistics: async () => {
    try {
      const response = await api.get('/handovers/requests/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },
  
  /**
   * Get handover detail by ID
   */
  getHandoverDetail: async (id) => {
    try {
      const response = await api.get(`/handovers/requests/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching handover detail:', error);
      throw error;
    }
  },
  
  /**
   * Create new handover request
   */
  createHandover: async (data) => {
    try {
      const response = await api.post('/handovers/requests/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating handover:', error);
      throw error;
    }
  },
  
  /**
   * Update handover request
   */
  updateHandover: async (id, data) => {
    try {
      const response = await api.patch(`/handovers/requests/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating handover:', error);
      throw error;
    }
  },
  
  /**
   * Delete handover request
   */
  deleteHandover: async (id) => {
    try {
      const response = await api.delete(`/handovers/requests/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting handover:', error);
      throw error;
    }
  },
  
  /**
   * Get activity log for handover
   */
  getActivityLog: async (id) => {
    try {
      const response = await api.get(`/handovers/requests/${id}/activity_log/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }
  },
  
  // ==========================================
  // HANDOVER ACTIONS
  // ==========================================
  
  /**
   * Sign as Handing Over employee
   */
  signAsHandingOver: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/sign_ho/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error signing as HO:', error);
      throw error;
    }
  },
  
  /**
   * Sign as Taking Over employee
   */
  signAsTakingOver: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/sign_to/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error signing as TO:', error);
      throw error;
    }
  },
  
  /**
   * Approve as Line Manager
   */
  approveAsLineManager: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/approve_lm/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error approving as LM:', error);
      throw error;
    }
  },
  
  /**
   * Reject as Line Manager
   */
  rejectAsLineManager: async (id, reason) => {
    try {
      const response = await api.post(`/handovers/requests/${id}/reject_lm/`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting as LM:', error);
      throw error;
    }
  },
  
  /**
   * Request clarification as Line Manager
   */
  requestClarification: async (id, clarification_comment) => {
    try {
      const response = await api.post(`/handovers/requests/${id}/request_clarification/`, { 
        clarification_comment 
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting clarification:', error);
      throw error;
    }
  },
  
  /**
   * Resubmit after clarification
   */
  resubmit: async (id, response_comment) => {
    try {
      const response = await api.post(`/handovers/requests/${id}/resubmit/`, { 
        response_comment 
      });
      return response.data;
    } catch (error) {
      console.error('Error resubmitting:', error);
      throw error;
    }
  },
  
  /**
   * Takeover as Taking Over employee
   */
  takeover: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/takeover/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error taking over:', error);
      throw error;
    }
  },
  
  /**
   * Takeback as Handing Over employee
   */
  takeback: async (id, comment = '') => {
    try {
      const response = await api.post(`/handovers/requests/${id}/takeback/`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error taking back:', error);
      throw error;
    }
  },
  
  // ==========================================
  // HANDOVER TASKS
  // ==========================================
  
  /**
   * Get all tasks for user's handovers
   */
  getTasks: async () => {
    try {
      const response = await api.get('/handovers/tasks/');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  
  /**
   * Create new task
   */
  createTask: async (data) => {
    try {
      const response = await api.post('/handovers/tasks/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  
  /**
   * Update task
   */
  updateTask: async (id, data) => {
    try {
      const response = await api.patch(`/handovers/tasks/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  /**
   * Update task status
   */
  updateTaskStatus: async (id, status, comment = '') => {
    try {
      const response = await api.post(`/handovers/tasks/${id}/update_status/`, {
        status,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },
  
  /**
   * Delete task
   */
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/handovers/tasks/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  // ==========================================
  // HANDOVER ATTACHMENTS
  // ==========================================
  
  /**
   * Get all attachments for user's handovers
   */
  getAttachments: async () => {
    try {
      const response = await api.get('/handovers/attachments/');
      return response.data;
    } catch (error) {
      console.error('Error fetching attachments:', error);
      throw error;
    }
  },
  
  /**
   * Upload attachment
   */
  uploadAttachment: async (handoverId, file) => {
    try {
      const formData = new FormData();
      formData.append('handover', handoverId);
      formData.append('file', file);
      
      const response = await api.post('/handovers/attachments/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },
  
  /**
   * Delete attachment
   */
  deleteAttachment: async (id) => {
    try {
      const response = await api.delete(`/handovers/attachments/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },
  
  // ==========================================
  // EMPLOYEE LOOKUP (for dropdowns)
  // ==========================================
  
  /**
   * Get all employees for selection
   */
  getEmployees: async () => {
    try {
      const response = await api.get('/employees/');
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },
  
  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
};

export default handoverService;
export { TokenManager };