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

  

   // === USER PERMISSIONS ===
  getMyPermissions: async () => {
    try {
      const response = await vacationApi.get('/vacation/my-permissions/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === SETTINGS - ADD THESE ===
  // Get all settings combined
  getAllSettings: async () => {
    try {
      const [general, calendar, hrReps] = await Promise.all([
        vacationApi.get('/vacation/settings/'),
        vacationApi.get('/vacation/production-calendar/'),
        vacationApi.get('/vacation/hr-representatives/')
      ]);
      
      return {
        general: general.data,
        calendar: calendar.data,
        hrRepresentatives: hrReps.data
      };
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
  createImmediateRequest: async (data, files = []) => {
  try {
    const formData = new FormData();
    
    // Append all form fields
    formData.append('requester_type', data.requester_type);
    formData.append('vacation_type_id', data.vacation_type_id);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    
    if (data.comment) {
      formData.append('comment', data.comment);
    }
    
    if (data.requester_type === 'for_my_employee') {
      if (data.employee_id) {
        formData.append('employee_id', data.employee_id);
      } else if (data.employee_manual) {
        formData.append('employee_manual', JSON.stringify(data.employee_manual));
      }
    }
    
    if (data.hr_representative_id) {
      formData.append('hr_representative_id', data.hr_representative_id);
    }
    
    // Append files (max 10MB each, multiple files allowed)
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await vacationApi.post('/vacation/requests/immediate/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
},

// Add these methods to VacationService in vacationService.js

// === ATTACHMENTS ===

// Get Request Details (includes attachments)
getRequestDetail: async (id) => {
  try {
    const response = await vacationApi.get(`/vacation/requests/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
},

// Get Schedule Details
getScheduleDetail: async (id) => {
  try {
    const response = await vacationApi.get(`/vacation/vacation-schedules/${id}/detail/`);
    return response.data;
  } catch (error) {
    throw error;
  }
},

// Get Request Attachments
getRequestAttachments: async (requestId) => {
  try {
    const response = await vacationApi.get(`/vacation/vacation-requests/${requestId}/attachments/`);
    return response.data;
  } catch (error) {
    throw error;
  }
},

// Bulk Upload Attachments to Request
bulkUploadAttachments: async (requestId, files) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await vacationApi.post(
      `/vacation/vacation-requests/${requestId}/attachments/bulk-upload/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
},

// Get Attachment Details
getAttachmentDetails: async (attachmentId) => {
  try {
    const response = await vacationApi.get(`/vacation/vacation-attachments/${attachmentId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
},

// Delete Attachment
deleteAttachment: async (attachmentId) => {
  try {
    const response = await vacationApi.delete(`/vacation/vacation-attachments/${attachmentId}/delete/`);
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

  // Check if user can edit schedule based on settings
  canEditSchedule: (schedule, maxEdits) => {
    if (schedule.status !== 'SCHEDULED') return false;
    if (schedule.edit_count >= maxEdits) return false;
    return true;
  },

  // Check if request can be created with current balance
  canCreateRequest: (balance, requestDays, allowNegativeBalance) => {
    if (allowNegativeBalance) return true;
    return balance.remaining_balance >= requestDays;
  },

  isAdmin: (userPermissions) => {
    return userPermissions?.is_admin === true;
  },

  // Check if user can approve as line manager or HR
  canApprove: (userPermissions) => {
    if (userPermissions?.is_admin) return true;
    
    const approvalPermissions = [
      'vacation.request.approve_as_line_manager',
      'vacation.request.approve_as_hr'
    ];
    
    return userPermissions?.permissions?.some(p => approvalPermissions.includes(p));
  },

  // Format schedule edit data
  formatScheduleEditData: (data) => {
    return {
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
// Validate file before upload
validateFile: (file) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `"${file.name}" exceeds 10MB limit`
    };
  }

  const extension = '.' + file.name.split('.').pop().toLowerCase();
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
  
  if (!ALLOWED_TYPES.includes(file.type) && !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `"${file.name}" has unsupported format`
    };
  }

  return { valid: true };
},

// Format file size
formatFileSize: (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
},

// Get file icon type
getFileIcon: (fileType) => {
  if (fileType.includes('image')) return 'image';
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('word') || fileType.includes('document')) return 'doc';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'xls';
  return 'file';
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