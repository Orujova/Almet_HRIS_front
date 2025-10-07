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

// Axios instance for business trip API
const businessTripApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
businessTripApi.interceptors.request.use(
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
businessTripApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Business Trip Services
export const BusinessTripService = {
  // === PERMISSIONS ===
  getMyPermissions: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/permissions/my/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === DASHBOARD ===
  getDashboard: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/dashboard/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === CONFIGURATION OPTIONS ===
  getAllOptions: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/options/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === TRAVEL TYPES ===
  getTravelTypes: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/travel-types/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTravelType: async (data) => {
    try {
      const response = await businessTripApi.post('/business-trips/travel-types/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTravelType: async (id) => {
    try {
      const response = await businessTripApi.get(`/business-trips/travel-types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTravelType: async (id, data) => {
    try {
      const response = await businessTripApi.put(`/business-trips/travel-types/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  partialUpdateTravelType: async (id, data) => {
    try {
      const response = await businessTripApi.patch(`/business-trips/travel-types/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTravelType: async (id) => {
    try {
      const response = await businessTripApi.delete(`/business-trips/travel-types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === TRANSPORT TYPES ===
  getTransportTypes: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/transport-types/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTransportType: async (data) => {
    try {
      const response = await businessTripApi.post('/business-trips/transport-types/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTransportType: async (id) => {
    try {
      const response = await businessTripApi.get(`/business-trips/transport-types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTransportType: async (id, data) => {
    try {
      const response = await businessTripApi.put(`/business-trips/transport-types/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  partialUpdateTransportType: async (id, data) => {
    try {
      const response = await businessTripApi.patch(`/business-trips/transport-types/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTransportType: async (id) => {
    try {
      const response = await businessTripApi.delete(`/business-trips/transport-types/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === TRIP PURPOSES ===
  getTripPurposes: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/purposes/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTripPurpose: async (data) => {
    try {
      const response = await businessTripApi.post('/business-trips/purposes/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTripPurpose: async (id) => {
    try {
      const response = await businessTripApi.get(`/business-trips/purposes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTripPurpose: async (id, data) => {
    try {
      const response = await businessTripApi.put(`/business-trips/purposes/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  partialUpdateTripPurpose: async (id, data) => {
    try {
      const response = await businessTripApi.patch(`/business-trips/purposes/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTripPurpose: async (id) => {
    try {
      const response = await businessTripApi.delete(`/business-trips/purposes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === SETTINGS - HR REPRESENTATIVE ===
  getHRRepresentatives: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/settings/hr-representatives/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateHRRepresentative: async (data) => {
    try {
      const response = await businessTripApi.put('/business-trips/settings/hr-representative/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === SETTINGS - FINANCE APPROVER ===
  getFinanceApprovers: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/settings/finance-approvers/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateFinanceApprover: async (data) => {
    try {
      const response = await businessTripApi.put('/business-trips/settings/finance-approver/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === SETTINGS - GENERAL ===
  getGeneralSettings: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/settings/general/get/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateGeneralSettings: async (data) => {
    try {
      const response = await businessTripApi.put('/business-trips/settings/general/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === REQUESTS ===
  createTripRequest: async (data) => {
    try {
      const response = await businessTripApi.post('/business-trips/requests/create/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyTripRequests: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/requests/my/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllTripRequests: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/requests/all/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  exportMyTrips: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/requests/export/', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  exportAllTrips: async (params = {}) => {
    try {
      const response = await businessTripApi.get('/business-trips/requests/export-all/', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancelTrip: async (id) => {
    try {
      const response = await businessTripApi.post(`/business-trips/requests/${id}/cancel/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === APPROVAL ===
  getPendingApprovals: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/approval/pending/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveRejectRequest: async (id, data) => {
    try {
      const response = await businessTripApi.post(`/business-trips/approval/${id}/action/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getApprovalHistory: async () => {
    try {
      const response = await businessTripApi.get('/business-trips/approval/history/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // === EMPLOYEES ===
  searchEmployees: async () => {
    try {
      const response = await businessTripApi.get('/employees/', { 
        params: { 
          page_size: 100
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
};

// Helper functions
export const BusinessTripHelpers = {
  // Format trip request data
  formatTripRequestData: (data) => {
    return {
      requester_type: data.requester_type,
      employee_id: data.employee_id || undefined,
      employee_manual: data.employee_manual || undefined,
      travel_type_id: data.travel_type_id,
      transport_type_id: data.transport_type_id,
      purpose_id: data.purpose_id,
      start_date: data.start_date,
      end_date: data.end_date,
      comment: data.comment || '',
      schedules: data.schedules || [],
      hotels: data.hotels || [],
      finance_approver_id: data.finance_approver_id || undefined,
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

  // Parse trip status
  parseTripStatus: (status) => {
    const statusMap = {
      'SUBMITTED': 'Submitted',
      'PENDING_LINE_MANAGER': 'Pending Line Manager',
      'PENDING_FINANCE': 'Pending Finance',
      'PENDING_HR': 'Pending HR',
      'APPROVED': 'Approved',
      'REJECTED_LINE_MANAGER': 'Rejected by Line Manager',
      'REJECTED_FINANCE': 'Rejected by Finance',
      'REJECTED_HR': 'Rejected by HR',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  },

  // Check if user is admin
  isAdmin: (userPermissions) => {
    return userPermissions?.is_admin === true;
  },

  // Check if user can approve
  canApprove: (userPermissions) => {
    if (userPermissions?.is_admin) return true;
    
    return userPermissions?.permissions?.includes('business_trips.request.approve');
  },

  // Check if user can cancel trip
  canCancelTrip: (trip, userPermissions, currentUserId) => {
    if (userPermissions?.is_admin) return true;
    if (trip.status !== 'APPROVED') return false;
    if (trip.employee_id === currentUserId) return true;
    
    return userPermissions?.permissions?.includes('business_trips.request.cancel');
  },

  // Calculate trip duration
  calculateTripDuration: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  },

  // Validate schedule dates
  validateScheduleDates: (schedules) => {
    const errors = [];
    schedules.forEach((schedule, index) => {
      if (!schedule.date || !schedule.from_location || !schedule.to_location) {
        errors.push(`Schedule ${index + 1}: All fields are required`);
      }
    });
    return errors;
  },

  // Validate hotel dates
  validateHotelDates: (hotels) => {
    const errors = [];
    hotels.forEach((hotel, index) => {
      if (!hotel.hotel_name || !hotel.check_in_date || !hotel.check_out_date) {
        errors.push(`Hotel ${index + 1}: All required fields must be filled`);
      }
      if (hotel.check_in_date && hotel.check_out_date) {
        const checkIn = new Date(hotel.check_in_date);
        const checkOut = new Date(hotel.check_out_date);
        if (checkOut <= checkIn) {
          errors.push(`Hotel ${index + 1}: Check-out must be after check-in`);
        }
      }
    });
    return errors;
  }
};

export default BusinessTripService;