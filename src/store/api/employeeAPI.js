import { apiService } from '../../services/api';

export const employeeAPI = {
  // Employee CRUD operations
  getEmployees: (params = {}) => {
    const searchParams = new URLSearchParams();
    
    // Add all filter parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        if (Array.isArray(params[key])) {
          params[key].forEach(value => searchParams.append(key, value));
        } else {
          searchParams.append(key, params[key]);
        }
      }
    });
    
    return apiService.get(`/employees/?${searchParams.toString()}`);
  },

  getEmployee: (id) => apiService.get(`/employees/${id}/`),
  
  createEmployee: (data) => apiService.post('/employees/', data),
  
  updateEmployee: (id, data) => apiService.put(`/employees/${id}/`, data),
  
  deleteEmployee: (id) => apiService.delete(`/employees/${id}/`),

  // Filter options
  getFilterOptions: () => apiService.get('/employees/filter_options/'),

  // Dropdown search
  dropdownSearch: (field, search, limit = 50) => 
    apiService.get(`/employees/dropdown_search/?field=${field}&search=${search}&limit=${limit}`),

  // Org chart
  getOrgChart: () => apiService.get('/employees/org_chart/'),

  updateOrgChartVisibility: (employeeIds, isVisible) => 
    apiService.patch('/employees/update_org_chart_visibility/', {
      employee_ids: employeeIds,
      is_visible_in_org_chart: isVisible
    }),

  updateSingleOrgChartVisibility: (id, isVisible) => 
    apiService.patch(`/employees/${id}/org_chart_visibility/`, {
      is_visible_in_org_chart: isVisible
    }),

  // Statistics
  getStatistics: () => apiService.get('/employees/statistics/'),

  // Bulk operations
  bulkUpdate: (employeeIds, updates) => 
    apiService.post('/employees/bulk_update/', {
      employee_ids: employeeIds,
      updates: updates
    }),

  // Export
  exportData: (format = 'csv', filters = {}) => {
    const searchParams = new URLSearchParams({ format, ...filters });
    return apiService.get(`/employees/export_data/?${searchParams.toString()}`);
  }
};