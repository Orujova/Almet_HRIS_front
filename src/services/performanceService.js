// services/performanceervice.js
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
  
  removeTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }
};

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = TokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Build query params
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

// ===================== DASHBOARD =====================
export const dashboardService = {
  getStatistics: (year) => 
    api.get('/performance/performance/dashboard/statistics/', { params: { year } }),
};

// ===================== PERFORMANCE YEARS =====================
export const performanceYearService = {
  list: () => api.get('/performance/performance/years/'),
  create: (data) => api.post('/performance/performance/years/', data),
  get: (id) => api.get(`/performance/performance/years/${id}/`),
  update: (id, data) => api.put(`/performance/performance/years/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/performance/performance/years/${id}/`, data),
  delete: (id) => api.delete(`/performance/performance/years/${id}/`),
  getActiveYear: () => api.get('/performance/performance/years/active_year/'),
  setActive: (id) => api.post(`/performance/performance/years/${id}/set_active/`),
};

// ===================== WEIGHT CONFIGS =====================
export const weightConfigService = {
  list: () => api.get('/performance/performance/weight-configs/'),
  create: (data) => api.post('/performance/performance/weight-configs/', data),
  get: (id) => api.get(`/performance/performance/weight-configs/${id}/`),
  update: (id, data) => api.put(`/performance/performance/weight-configs/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/performance/performance/weight-configs/${id}/`, data),
  delete: (id) => api.delete(`/performance/performance/weight-configs/${id}/`),
};

// ===================== GOAL LIMITS =====================
export const goalLimitService = {
  list: () => api.get('/performance/performance/goal-limits/'),
  create: (data) => api.post('/performance/performance/goal-limits/', data),
  get: (id) => api.get(`/performance/performance/goal-limits/${id}/`),
  update: (id, data) => api.put(`/performance/performance/goal-limits/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/performance/performance/goal-limits/${id}/`, data),
  delete: (id) => api.delete(`/performance/performance/goal-limits/${id}/`),
  getActiveConfig: () => api.get('/performance/performance/goal-limits/active_config/'),
};

// ===================== DEPARTMENT OBJECTIVES =====================
export const departmentObjectiveService = {
  list: (params) => api.get('/performance/performance/department-objectives/', { params }),
  create: (data) => api.post('/performance/performance/department-objectives/', data),
  get: (id) => api.get(`/performance/performance/department-objectives/${id}/`),
  update: (id, data) => api.put(`/performance/performance/department-objectives/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/performance/performance/department-objectives/${id}/`, data),
  delete: (id) => api.delete(`/performance/performance/department-objectives/${id}/`),
};

// ===================== EVALUATION SCALES =====================
export const evaluationScaleService = {
  list: () => api.get('/performance/performance/evaluation-scales/'),
  create: (data) => api.post('/performance/performance/evaluation-scales/', data),
  get: (id) => api.get(`/performance/performance/evaluation-scales/${id}/`),
  update: (id, data) => api.put(`/performance/performance/evaluation-scales/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/performance/performance/evaluation-scales/${id}/`, data),
  delete: (id) => api.delete(`/performance/performance/evaluation-scales/${id}/`),
  getByPercentage: (percentage) => 
    api.get('/performance/performance/evaluation-scales/by_percentage/', { params: { percentage } }),
};

// ===================== EVALUATION TARGETS =====================
export const evaluationTargetService = {
  list: () => api.get('/performance/performance/evaluation-targets/'),
  create: (data) => api.post('/performance/performance/evaluation-targets/', data),
  get: (id) => api.get(`/performance/performance/evaluation-targets/${id}/`),
  update: (id, data) => api.put(`/performance/performance/evaluation-targets/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/performance/evaluation-targets/${id}/`, data),
  delete: (id) => api.delete(`/performance/performance/evaluation-targets/${id}/`),
  getActiveConfig: () => api.get('/performance/performance/evaluation-targets/active_config/'),
};

// ===================== OBJECTIVE STATUSES =====================
export const objectiveStatusService = {
  list: () => api.get('/performance/performance/objective-statuses/'),
  create: (data) => api.post('/performance/performance/objective-statuses/', data),
  get: (id) => api.get(`/performance/performance/objective-statuses/${id}/`),
  update: (id, data) => api.put(`/performance/performance/objective-statuses/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/performance/performance/objective-statuses/${id}/`, data),
  delete: (id) => api.delete(`/performance/performance/objective-statuses/${id}/`),
};

// ===================== NOTIFICATION TEMPLATES =====================
export const notificationTemplateService = {
  list: () => api.get('/performance/performance/notification-templates/'),
  create: (data) => api.post('/performance/performance/notification-templates/', data),
  get: (id) => api.get(`/performance/performance/notification-templates/${id}/`),
  update: (id, data) => api.put(`/performance/performance/notification-templates/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/performance/performance/notification-templates/${id}/`, data),
  delete: (id) => api.delete(`/performance/performance/notification-templates/${id}/`),
};

// ===================== EMPLOYEE performance =====================
export const performanceervice = {
  // Basic CRUD
  list: (params) => api.get('/performance/performance/performances/', { params }),
  create: (data) => api.post('/performance/performance/performances/', data),
  get: (id) => api.get(`/performance/performance/performances/${id}/`),
  update: (id, data) => api.put(`/performance/performance/performances/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/performance/performance/performances/${id}/`, data),
  delete: (id) => api.delete(`/performance/performance/performances/${id}/`),

  // Initialize
  initialize: (data) => api.post('/performance/performance/performances/initialize/', data),

  // Objectives
  saveObjectivesDraft: (id, data) => 
    api.post(`/performance/performance/performances/${id}/save_objectives_draft/`, data),
  submitObjectives: (id) => 
    api.post(`/performance/performance/performances/${id}/submit_objectives/`),
  approveObjectivesEmployee: (id) => 
    api.post(`/performance/performance/performances/${id}/approve_objectives_employee/`),
  approveObjectivesManager: (id) => 
    api.post(`/performance/performance/performances/${id}/approve_objectives_manager/`),
  cancelObjective: (id, data) => 
    api.post(`/performance/performance/performances/${id}/cancel_objective/`, data),

  // Competencies
  saveCompetenciesDraft: (id, data) => 
    api.post(`/performance/performance/performances/${id}/save_competencies_draft/`, data),
  submitCompetencies: (id) => 
    api.post(`/performance/performance/performances/${id}/submit_competencies/`),

  // Mid-Year Review
  saveMidYearDraft: (id, data) => 
    api.post(`/performance/performance/performances/${id}/save_mid_year_draft/`, data),
  submitMidYearEmployee: (id, data) => 
    api.post(`/performance/performance/performances/${id}/submit_mid_year_employee/`, data),
  submitMidYearManager: (id, data) => 
    api.post(`/performance/performance/performances/${id}/submit_mid_year_manager/`, data),

  // End-Year Review
  saveEndYearDraft: (id, data) => 
    api.post(`/performance/performance/performances/${id}/save_end_year_draft/`, data),
  submitEndYearEmployee: (id, data) => 
    api.post(`/performance/performance/performances/${id}/submit_end_year_employee/`, data),
  completeEndYear: (id, data) => 
    api.post(`/performance/performance/performances/${id}/complete_end_year/`, data),

  // Development Needs
  saveDevelopmentNeedsDraft: (id, data) => 
    api.post(`/performance/performance/performances/${id}/save_development_needs_draft/`, data),
  submitDevelopmentNeeds: (id) => 
    api.post(`/performance/performance/performances/${id}/submit_development_needs/`),

  // Clarification & Approval
  requestClarification: (id, data) => 
    api.post(`/performance/performance/performances/${id}/request_clarification/`, data),
  approveFinalEmployee: (id) => 
    api.post(`/performance/performance/performances/${id}/approve_final_employee/`),
  approveFinalManager: (id) => 
    api.post(`/performance/performance/performances/${id}/approve_final_manager/`),

  // Utilities
  recalculateScores: (id) => 
    api.post(`/performance/performance/performances/${id}/recalculate_scores/`),
  getActivityLog: (id) => 
    api.get(`/performance/performance/performances/${id}/activity_log/`),
  exportExcel: (id) => 
    api.get(`/performance/performance/performances/${id}/export_excel/`, { 
      responseType: 'blob' 
    }),
};

// ===================== HELPER FUNCTIONS =====================

export const downloadExcel = async (performanceId, filename) => {
  try {
    const response = await performanceervice.exportExcel(performanceId);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'performance-report.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

export const getMyTeamperformance = (year) => {
  return performanceervice.list({ my_team: true, year });
};

export const getEmployeePerformance = (employeeId, year) => {
  return performanceervice.list({ employee_id: employeeId, year });
};

// ===================== EXPORT ALL SERVICES =====================
const performanceApi = {
  dashboard: dashboardService,
  years: performanceYearService,
  weightConfigs: weightConfigService,
  goalLimits: goalLimitService,
  departmentObjectives: departmentObjectiveService,
  evaluationScales: evaluationScaleService,
  evaluationTargets: evaluationTargetService,
  objectiveStatuses: objectiveStatusService,
  notificationTemplates: notificationTemplateService,
  performance: performanceervice,
  
  // Helper functions
  downloadExcel,
  getMyTeamperformance,
  getEmployeePerformance,
};

export default performanceApi;