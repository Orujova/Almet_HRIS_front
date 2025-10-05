import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
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

  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
};

// Axios instance for vacation API
const vacationApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});


// Request interceptor to add auth token
vacationApi.interceptors.request.use(
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

// Response interceptor for error handling
vacationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      // Redirect to login or refresh token
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Vacation Services
export const VacationService = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await vacationApi.get('/vacation/dashboard/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // All Vacation Records
  getAllVacationRecords: async (params = {}) => {
    try {
      const response = await vacationApi.get('/vacation/all-vacation-records', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export All Vacation Records
  exportAllVacationRecords: async (params = {}) => {
    try {
      const response = await vacationApi.get('/vacation/all-records/export/', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // My All Requests & Schedules
  getMyAllVacations: async () => {
    try {
      const response = await vacationApi.get('/vacation/my-all/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export My Vacations
  exportMyVacations: async () => {
    try {
      const response = await vacationApi.get('/vacation/my-all/export/', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Calculate Working Days
  calculateWorkingDays: async (data) => {
    try {
      const response = await vacationApi.post('/vacation/calculate-working-days/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

// vacationService.js-də
searchEmployees: async () => {
  try {
    const response = await vacationApi.get('/employees/', { 
      params: { 
        page_size: 100  // Daha çox employee üçün limiti artırın
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},
 getCurrentUserEmail: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("user_email");
    }
    return null;
  },
  
  // Find employee by email
  findEmployeeByEmail: async (email) => {
    try {
      const response = await vacationApi.get('/employees/', { 
        params: { 
          page_size: 100,
          search: email // API-də email search dəstəklənirsə
        }
      });
      // Email ilə uyğun employee tap
      const employee = response.data.results?.find(emp => 
        emp.email?.toLowerCase() === email?.toLowerCase()
      );
      return employee;
    } catch (error) {
      throw error;
    }
  },
  // === SCHEDULES ===
  
  // Create Schedule
  createSchedule: async (data) => {
    try {
      const response = await vacationApi.post('/vacation/schedules/create/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Edit Schedule
  editSchedule: async (id, data) => {
    try {
      const response = await vacationApi.put(`/vacation/schedules/${id}/edit/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete Schedule
  deleteSchedule: async (id) => {
    try {
      const response = await vacationApi.delete(`/vacation/schedules/${id}/delete/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register Schedule
  registerSchedule: async (id) => {
    try {
      const response = await vacationApi.post(`/vacation/schedules/${id}/register/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Schedule Tabs
  getScheduleTabs: async () => {
    try {
      const response = await vacationApi.get('/vacation/schedules/tabs/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === REQUESTS ===
  
  // Create Immediate Request
  createImmediateRequest: async (data) => {
    try {
      const response = await vacationApi.post('/vacation/requests/immediate/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve/Reject Request
  approveRejectRequest: async (id, data) => {
    try {
      const response = await vacationApi.post(`/vacation/requests/${id}/approve-reject/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === APPROVAL ===
  
  // Get Pending Requests
  getPendingRequests: async () => {
    try {
      const response = await vacationApi.get('/vacation/approval/pending/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Approval History
  getApprovalHistory: async () => {
    try {
      const response = await vacationApi.get('/vacation/approval/history/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === VACATION TYPES ===
  
  // Get Vacation Types
  getVacationTypes: async (params = {}) => {
    try {
      const response = await vacationApi.get('/vacation/types/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create Vacation Type
  createVacationType: async (data) => {
    try {
      const response = await vacationApi.post('/vacation/types/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Vacation Type by ID
  getVacationType: async (id) => {
    try {
      const response = await vacationApi.get(`/vacation/types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update Vacation Type
  updateVacationType: async (id, data) => {
    try {
      const response = await vacationApi.put(`/vacation/types/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete Vacation Type
  deleteVacationType: async (id) => {
    try {
      const response = await vacationApi.delete(`/vacation/types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === NOTIFICATION TEMPLATES ===
  
  // Get Notification Templates
  getNotificationTemplates: async (params = {}) => {
    try {
      const response = await vacationApi.get('/vacation/notification-templates/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create Notification Template
  createNotificationTemplate: async (data) => {
    try {
      const response = await vacationApi.post('/vacation/notification-templates/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Notification Template by ID
  getNotificationTemplate: async (id) => {
    try {
      const response = await vacationApi.get(`/vacation/notification-templates/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update Notification Template
  updateNotificationTemplate: async (id, data) => {
    try {
      const response = await vacationApi.put(`/vacation/notification-templates/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Partial Update Notification Template
  partialUpdateNotificationTemplate: async (id, data) => {
    try {
      const response = await vacationApi.patch(`/vacation/notification-templates/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete Notification Template
  deleteNotificationTemplate: async (id) => {
    try {
      const response = await vacationApi.delete(`/vacation/notification-templates/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === SETTINGS ===
  
  // Get General Settings
  getGeneralSettings: async () => {
    try {
      const response = await vacationApi.get('/vacation/settings/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Set General Settings
  setGeneralSettings: async (data) => {
    try {
      const response = await vacationApi.post('/vacation/settings/set/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update General Settings
  updateGeneralSettings: async (data) => {
    try {
      const response = await vacationApi.put('/vacation/settings/update/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === PRODUCTION CALENDAR ===
  
  // Get Production Calendar
  getProductionCalendar: async () => {
    try {
      const response = await vacationApi.get('/vacation/production-calendar/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Set Non-Working Days
  setNonWorkingDays: async (data) => {
    try {
      const response = await vacationApi.post('/vacation/production-calendar/set/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update Non-Working Days
  updateNonWorkingDays: async (data) => {
    try {
      const response = await vacationApi.put('/vacation/production-calendar/update/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === HR REPRESENTATIVES ===
  
  // Get HR Representatives
  getHRRepresentatives: async () => {
    try {
      const response = await vacationApi.get('/vacation/hr-representatives/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Set Default HR Representative
  setDefaultHRRepresentative: async (data) => {
    try {
      const response = await vacationApi.post('/vacation/hr-representatives/set-default/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update Default HR Representative
  updateDefaultHRRepresentative: async (data) => {
    try {
      const response = await vacationApi.put('/vacation/hr-representatives/update-default/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === BALANCES ===
  
  // Export Balances
  exportBalances: async (params = {}) => {
    try {
      const response = await vacationApi.get('/vacation/balances/export/', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download Balance Template
  downloadBalanceTemplate: async () => {
    try {
      const response = await vacationApi.get('/vacation/balances/template/', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk Upload Balances
  bulkUploadBalances: async (formData) => {
    try {
      const response = await vacationApi.post('/vacation/balances/bulk-upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update Individual Balance
  updateIndividualBalance: async (data) => {
    try {
      const response = await vacationApi.put('/vacation/balances/update/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset Employee Balance
  resetEmployeeBalance: async (data) => {
    try {
      const response = await vacationApi.put('/vacation/balances/reset/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Helper functions for common operations
export const VacationHelpers = {
  // Format schedule data for creation
  formatScheduleData: (data) => {
    return {
      requester_type: data.requester_type,
      employee_id: data.employee_id || undefined,
      employee_manual: data.employee_manual || undefined,
      vacation_type_id: data.vacation_type_id,
      start_date: data.start_date,
      end_date: data.end_date,
      comment: data.comment || ''
    };
  },

  // Format immediate request data
  formatImmediateRequestData: (data) => {
    return {
      requester_type: data.requester_type,
      employee_id: data.employee_id || undefined,
      employee_manual: data.employee_manual || undefined,
      vacation_type_id: data.vacation_type_id,
      start_date: data.start_date,
      end_date: data.end_date,
      comment: data.comment || '',
      hr_representative_id: data.hr_representative_id || undefined
    };
  },

  // Download blob file
  downloadBlobFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Format date for API
  formatDate: (date) => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  },

  // Parse vacation status
  parseVacationStatus: (status) => {
    const statusMap = {
      'SCHEDULED': 'Scheduled',
      'PENDING_HR': 'Pending HR',
      'PENDING_LINE_MANAGER': 'Pending Line Manager',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'REGISTERED': 'Registered'
    };
    return statusMap[status] || status;
  }
};

export default VacationService;