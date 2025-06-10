// src/services/gradingApi.js - Backend integration for grading system
import api from './api';

export const gradingApi = {
  // Grading Systems
  getGradingSystems: () => api.get('/grading/systems/'),
  createGradingSystem: (data) => api.post('/grading/systems/', data),
  updateGradingSystem: (id, data) => api.put(`/grading/systems/${id}/`, data),
  deleteGradingSystem: (id) => api.delete(`/grading/systems/${id}/`),
  getGradingDropdowns: () => api.get('/grading/systems/dropdowns/'),

  // Salary Grades (Current structure)
  getSalaryGrades: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/grading/salary-grades/?${searchParams.toString()}`);
  },
  getSalaryGradesBySystem: (gradingSystemId) => 
    api.get(`/grading/salary-grades/by_system/?grading_system=${gradingSystemId}`),

  // Growth Rates (Vertical)
  getGrowthRates: (gradingSystemId) => 
    api.get(`/grading/growth-rates/?grading_system=${gradingSystemId}`),
  createGrowthRate: (data) => api.post('/grading/growth-rates/', data),
  updateGrowthRate: (id, data) => api.put(`/grading/growth-rates/${id}/`, data),
  deleteGrowthRate: (id) => api.delete(`/grading/growth-rates/${id}/`),
  bulkCreateGrowthRates: (data) => api.post('/grading/growth-rates/bulk_create/', data),

  // Horizontal Rates
  getHorizontalRates: (gradingSystemId) => 
    api.get(`/grading/horizontal-rates/?grading_system=${gradingSystemId}`),
  createHorizontalRate: (data) => api.post('/grading/horizontal-rates/', data),
  updateHorizontalRate: (id, data) => api.put(`/grading/horizontal-rates/${id}/`, data),
  deleteHorizontalRate: (id) => api.delete(`/grading/horizontal-rates/${id}/`),
  bulkCreateHorizontalRates: (data) => api.post('/grading/horizontal-rates/bulk_create/', data),

  // Scenarios
  getScenarios: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/grading/scenarios/?${searchParams.toString()}`);
  },
  getScenario: (id) => api.get(`/grading/scenarios/${id}/`),
  createScenario: (data) => api.post('/grading/scenarios/', data),
  updateScenario: (id, data) => api.put(`/grading/scenarios/${id}/`, data),
  deleteScenario: (id) => api.delete(`/grading/scenarios/${id}/`),
  
  // Scenario Actions
  calculateScenario: (id) => api.post(`/grading/scenarios/${id}/calculate/`),
  applyScenario: (id) => api.post(`/grading/scenarios/${id}/apply/`),
  archiveScenario: (id) => api.post(`/grading/scenarios/${id}/archive/`),
  duplicateScenario: (id) => api.post(`/grading/scenarios/${id}/duplicate/`),
  
  // Current scenario and statistics
  getCurrentScenario: (gradingSystemId) => 
    api.get(`/grading/scenarios/current/?grading_system=${gradingSystemId}`),
  getScenarioStatistics: (gradingSystemId) => 
    api.get(`/grading/scenarios/statistics/?grading_system=${gradingSystemId}`),

  // History
  getScenarioHistory: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/grading/history/?${searchParams.toString()}`);
  },
  getRecentHistory: (limit = 20, gradingSystemId) => {
    const params = { limit };
    if (gradingSystemId) params.grading_system = gradingSystemId;
    const searchParams = new URLSearchParams(params);
    return api.get(`/grading/history/recent/?${searchParams.toString()}`);
  },

  // Helper methods for data formatting
  formatScenarioForBackend: (scenarioData) => {
    return {
      name: scenarioData.name,
      description: scenarioData.description || '',
      grading_system: scenarioData.gradingSystemId,
      base_position: scenarioData.basePosition,
      base_value: parseFloat(scenarioData.baseValue),
      custom_vertical_rates: scenarioData.customVerticalRates || {},
      custom_horizontal_rates: scenarioData.customHorizontalRates || {}
    };
  },

  formatScenarioFromBackend: (backendData) => {
    return {
      id: backendData.id,
      name: backendData.name,
      description: backendData.description,
      status: backendData.status,
      gradingSystemId: backendData.grading_system?.id,
      gradingSystemName: backendData.grading_system?.name,
      basePosition: backendData.base_position?.id,
      basePositionName: backendData.base_position?.display_name,
      baseValue: backendData.base_value,
      customVerticalRates: backendData.custom_vertical_rates || {},
      customHorizontalRates: backendData.custom_horizontal_rates || {},
      calculatedGrades: backendData.calculated_grades || {},
      isCalculated: backendData.is_calculated,
      calculationTimestamp: backendData.calculation_timestamp,
      createdAt: backendData.created_at,
      appliedAt: backendData.applied_at,
      createdByName: backendData.created_by_name,
      appliedByName: backendData.applied_by_name
    };
  },

  // Validation helpers
  validateScenarioData: (data) => {
    const errors = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Scenario name is required';
    }
    
    if (!data.gradingSystemId) {
      errors.gradingSystemId = 'Grading system is required';
    }
    
    if (!data.basePosition) {
      errors.basePosition = 'Base position is required';
    }
    
    if (!data.baseValue || parseFloat(data.baseValue) <= 0) {
      errors.baseValue = 'Base value must be greater than 0';
    }
    
    // Validate custom vertical rates
    if (data.customVerticalRates) {
      Object.entries(data.customVerticalRates).forEach(([posId, rate]) => {
        if (isNaN(rate) || rate < 0) {
          errors[`verticalRate_${posId}`] = 'Vertical rate must be a non-negative number';
        }
      });
    }
    
    // Validate custom horizontal rates
    if (data.customHorizontalRates) {
      Object.entries(data.customHorizontalRates).forEach(([posId, rates]) => {
        if (typeof rates === 'object') {
          Object.entries(rates).forEach(([transition, rate]) => {
            if (isNaN(rate) || rate < 0) {
              errors[`horizontalRate_${posId}_${transition}`] = 'Horizontal rate must be a non-negative number';
            }
          });
        }
      });
    }
    
    return errors;
  }
};