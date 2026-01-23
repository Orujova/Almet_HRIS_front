// src/services/assetService.js - UPDATED with proper endpoints
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ==================== TOKEN MANAGER ====================
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

// ==================== INTERCEPTORS ====================
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

// ==================== CATEGORY SERVICE ====================
export const categoryService = {
  getCategories: async (params = {}) => {
    const response = await api.get('/assets/categories/', { params });
    return response.data;
  },
  getCategory: async (id) => {
    const response = await api.get(`/assets/categories/${id}/`);
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await api.post('/assets/categories/', categoryData);
    return response.data;
  },
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/assets/categories/${id}/`, categoryData);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/assets/categories/${id}/`);
    return response.data;
  },
  getCategoryStatistics: async (id) => {
    const response = await api.get(`/assets/categories/${id}/statistics/`);
    return response.data;
  }
};

// ==================== BATCH SERVICE ====================
export const batchService = {
  getBatches: async (params = {}) => {
    const response = await api.get('/assets/batches/', { params });
    return response.data;
  },
  getBatch: async (id) => {
    const response = await api.get(`/assets/batches/${id}/`);
    return response.data;
  },
  createBatch: async (batchData) => {
    const response = await api.post('/assets/batches/', batchData);
    return response.data;
  },
  updateBatch: async (id, batchData) => {
    const response = await api.put(`/assets/batches/${id}/`, batchData);
    return response.data;
  },
  deleteBatch: async (id) => {
    const response = await api.delete(`/assets/batches/${id}/`);
    return response.data;
  },
  createAssetsFromBatch: async (batchId, data) => {
    const response = await api.post(`/assets/batches/${batchId}/create-assets/`, data);
    return response.data;
  },
  getBatchAssets: async (batchId) => {
    const response = await api.get(`/assets/batches/${batchId}/assets/`);
    return response.data;
  },
  getBatchStatistics: async () => {
    const response = await api.get('/assets/batches/statistics/');
    return response.data;
  }
};

// ==================== ASSET SERVICE ====================
// ==================== ASSET SERVICE ====================
export const assetService = {
  getAssets: async (params = {}) => {
    const response = await api.get('/assets/assets/', { params });
    return response.data;
  },
  
  getAsset: async (id) => {
    const response = await api.get(`/assets/assets/${id}/`);
    return response.data;
  },
  
  // 🎯 FIXED: Asset yaratma - batch_id tələb olunur
  createAsset: async (assetData) => {
    // Backend tələb edir: batch_id və serial_number
    const payload = {
      batch_id: assetData.batch_id || assetData.batch, // batch_id əlavə et
      serial_number: assetData.serial_number
    };
    
    console.log('🎯 Creating asset with payload:', payload);
    const response = await api.post('/assets/assets/', payload);
    return response.data;
  },
  
  updateAsset: async (id, assetData) => {
    const response = await api.put(`/assets/assets/${id}/`, assetData);
    return response.data;
  },
  
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/assets/${id}/`);
    return response.data;
  },
  
  // 🎯 FIXED: Assign asset - backend endpoint-inə uyğun
  assignToEmployee: async (assignmentData) => {
    const payload = {
      asset_ids: [assignmentData.asset], // Array formatında
      employee_id: assignmentData.employee, // employee_id açarı istifadə et
      check_out_date: assignmentData.check_out_date,
      check_out_notes: assignmentData.check_out_notes || '',
      condition_on_checkout: assignmentData.condition_on_checkout
    };
    
    console.log('🎯 Assignment payload:', payload);
    const response = await api.post('/assets/assets/assign-to-employee/', payload);
    return response.data;
  },
  
  // Alias method - köhnə kodla uyğunluq üçün
  assignAsset: async (assetId, assignmentData) => {
    return await assetService.assignToEmployee(assignmentData);
  },
  
  // 🎯 Employee actions
  acceptAsset: async (data) => {
    const response = await api.post('/assets/assets/accept-assignment/', data);
    return response.data;
  },
  
  requestClarification: async (data) => {
    const response = await api.post('/assets/assets/request-clarification/', data);
    return response.data;
  },
  
  provideClarification: async (data) => {
    const response = await api.post('/assets/assets/provide-clarification/', data);
    return response.data;
  },
  
  // 🎯 Assignment history - GET endpoint
  getAssignments: async (params = {}) => {
    const response = await api.get('/assets/assets/assignments/', { params });
    return response.data;
  },
  
  getAssignmentHistory: async (id) => {
    const response = await api.get(`/assets/assets/${id}/assignment_history/`);
    return response.data;
  },
  
  // 🎯 Activities
  getAssetActivities: async (id) => {
    const response = await api.get(`/assets/assets/${id}/activities/`);
    return response.data;
  },
  
  getMyAssets: async () => {
    const response = await api.get('/assets/assets/my_assets/');
    return response.data;
  },
  
  getStatistics: async () => {
    const response = await api.get('/assets/assets/statistics/');
    return response.data;
  },
  
  getAccessInfo: async () => {
    const response = await api.get('/assets/assets/access_info/');
    return response.data;
  },
  
  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/assets/assets/bulk-upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  exportAssets: async (exportData) => {
    const response = await api.post('/assets/assets/export/', exportData, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // 🎯 FIXED: Export assignments
  exportAssignments: async (params = {}) => {
    const response = await api.post('/assets/assets/assignments/export/', params, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// ==================== OFFBOARDING SERVICE ====================
export const offboardingService = {
  getOffboardings: async (params = {}) => {
    const response = await api.get('/assets/offboarding/', { params });
    return response.data;
  },
  getOffboarding: async (id) => {
    const response = await api.get(`/assets/offboarding/${id}/`);
    return response.data;
  },
  initiateOffboarding: async (data) => {
    const response = await api.post('/assets/offboarding/initiate/', data);
    return response.data;
  },
  getOffboardingAssets: async (offboardingId) => {
    const response = await api.get(`/assets/offboarding/${offboardingId}/assets/`);
    return response.data;
  },
  completeOffboarding: async (offboardingId) => {
    const response = await api.post(`/assets/offboarding/${offboardingId}/complete/`);
    return response.data;
  },
  cancelOffboarding: async (offboardingId, reason) => {
    const response = await api.post(`/assets/offboarding/${offboardingId}/cancel/`, { reason });
    return response.data;
  }
};

// ==================== TRANSFER SERVICE ====================
export const transferService = {
  getTransfers: async (params = {}) => {
    const response = await api.get('/assets/transfers/', { params });
    return response.data;
  },
  getTransfer: async (id) => {
    const response = await api.get(`/assets/transfers/${id}/`);
    return response.data;
  },
  createTransfer: async (data) => {
    const response = await api.post('/assets/transfers/create/', data);
    return response.data;
  },
  approveTransfer: async (transferId, data) => {
    const response = await api.post(`/assets/transfers/${transferId}/approve/`, data);
    return response.data;
  },
  getOffboardingTransfers: async (offboardingId) => {
    const response = await api.get('/assets/transfers/', {
      params: { offboarding_id: offboardingId }
    });
    return response.data;
  }
};

// ==================== EMPLOYEE SERVICE ====================
export const employeeService = {
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees/', { params });
    return response.data;
  },
  getEmployee: async (id) => {
    const response = await api.get(`/employees/${id}/`);
    return response.data;
  },
  searchEmployees: async (searchTerm) => {
    const response = await api.get('/employees/', { 
      params: { search: searchTerm, page_size: 50 } 
    });
    return response.data;
  },
  getEmployeeAssets: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/assets/`);
    return response.data;
  }
};

// ==================== EMPLOYEE ASSET SERVICE - ADDED ====================
export const employeeAssetService = {
  provideClarification: async (employeeId, data) => {
    const response = await api.post(`/employees/${employeeId}/provide-clarification/`, data);
    return response.data;
  },
  cancelAssignment: async (employeeId, data) => {
    const response = await api.post(`/employees/${employeeId}/cancel-assignment/`, data);
    return response.data;
  }
};

// ==================== HELPER FUNCTIONS ====================
export const getAssetStatusColor = (status) => {
  const colors = {
    'IN_STOCK': '#6B7280',
    'ASSIGNED': '#F59E0B',
    'IN_USE': '#10B981',
    'NEED_CLARIFICATION': '#8B5CF6',
    'IN_REPAIR': '#EF4444',
    'OUT_OF_STOCK': '#DC2626',
    'ARCHIVED': '#7F1D1D',
  };
  return colors[status] || '#6B7280';
};

export const getAssetStatusDisplay = (status) => {
  const displays = {
    'IN_STOCK': 'Anbarda',
    'ASSIGNED': 'Təyin edilib (Təsdiq gözlənilir)',
    'IN_USE': 'İstifadədə',
    'NEED_CLARIFICATION': 'Aydınlaşdırma lazımdır',
    'IN_REPAIR': 'Təmirdə',
    'OUT_OF_STOCK': 'Xarab/İtirilmiş',
    'ARCHIVED': 'Arxivləşdirilmiş',
  };
  return displays[status] || status;
};

export const getBatchStatusColor = (status) => {
  const colors = {
    'ACTIVE': '#10B981',
    'OUT_OF_STOCK': '#DC2626',
    'ARCHIVED': '#6B7280',
  };
  return colors[status] || '#6B7280';
};

export const formatQuantitySummary = (quantitySummary) => {
  if (!quantitySummary) return null;
  
  return {
    total: quantitySummary.initial,
    available: quantitySummary.available,
    assigned: quantitySummary.assigned,
    outOfStock: quantitySummary.out_of_stock,
    usageRate: quantitySummary.percentage_available,
    displayText: `${quantitySummary.available}/${quantitySummary.initial} mövcuddur`
  };
};

export default {
  categoryService,
  batchService,
  assetService,
  offboardingService,
  transferService,
  employeeService,
  employeeAssetService, // ADDED
  getAssetStatusColor,
  getAssetStatusDisplay,
  getBatchStatusColor,
  formatQuantitySummary,
};