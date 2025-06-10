// src/store/api/employeeAPI.js - Complete backend integration
import { apiService } from '../../services/api';

export const employeeAPI = {
  // Employee CRUD operations with proper field mapping
  getEmployees: (params = {}) => {
    // Map frontend filter parameters to backend field names
    const backendParams = {};
    
    // Basic pagination
    if (params.page) backendParams.page = params.page;
    if (params.page_size) backendParams.page_size = params.page_size;
    
    // Search
    if (params.search) backendParams.search = params.search;
    
    // Sorting
    if (params.ordering) backendParams.ordering = params.ordering;
    
    // Employee specific filters
    if (params.employee_id) backendParams.employee_id = params.employee_id;
    if (params.name) backendParams.search = params.name; // Map name search to global search
    if (params.email) backendParams.user__email = params.email;
    
    // Organizational filters - map to backend field names
    if (params.business_function) {
      backendParams.business_function = Array.isArray(params.business_function) 
        ? params.business_function.join(',') 
        : params.business_function;
    }
    if (params.department) {
      backendParams.department = Array.isArray(params.department) 
        ? params.department.join(',') 
        : params.department;
    }
    if (params.unit) {
      backendParams.unit = Array.isArray(params.unit) 
        ? params.unit.join(',') 
        : params.unit;
    }
    if (params.job_function) {
      backendParams.job_function = Array.isArray(params.job_function) 
        ? params.job_function.join(',') 
        : params.job_function;
    }
    if (params.position_group) {
      backendParams.position_group = Array.isArray(params.position_group) 
        ? params.position_group.join(',') 
        : params.position_group;
    }
    
    // Status and tags
    if (params.status) {
      backendParams.status = Array.isArray(params.status) 
        ? params.status.join(',') 
        : params.status;
    }
    if (params.tags) {
      backendParams.tags = Array.isArray(params.tags) 
        ? params.tags.join(',') 
        : params.tags;
    }
    
    // Line manager filters
    if (params.line_manager) backendParams.line_manager = params.line_manager;
    if (params.line_manager_name) backendParams.line_manager_name = params.line_manager_name;
    if (params.line_manager_hc) backendParams.line_manager_hc = params.line_manager_hc;
    
    // Job details
    if (params.job_title) backendParams.job_title = params.job_title;
    if (params.grade) {
      backendParams.grade = Array.isArray(params.grade) 
        ? params.grade.join(',') 
        : params.grade;
    }
    if (params.grade_min) backendParams.grade_min = params.grade_min;
    if (params.grade_max) backendParams.grade_max = params.grade_max;
    
    // Personal information
    if (params.gender) {
      backendParams.gender = Array.isArray(params.gender) 
        ? params.gender.join(',') 
        : params.gender;
    }
    
    // Date filters
    if (params.start_date) backendParams.start_date = params.start_date;
    if (params.start_date_from) backendParams.start_date_from = params.start_date_from;
    if (params.start_date_to) backendParams.start_date_to = params.start_date_to;
    if (params.end_date) backendParams.end_date = params.end_date;
    if (params.end_date_from) backendParams.end_date_from = params.end_date_from;
    if (params.end_date_to) backendParams.end_date_to = params.end_date_to;
    if (params.birth_date_from) backendParams.birth_date_from = params.birth_date_from;
    if (params.birth_date_to) backendParams.birth_date_to = params.birth_date_to;
    
    // Contract duration
    if (params.contract_duration) {
      backendParams.contract_duration = Array.isArray(params.contract_duration) 
        ? params.contract_duration.join(',') 
        : params.contract_duration;
    }
    
    // Years of service
    if (params.years_of_service_min) backendParams.years_of_service_min = params.years_of_service_min;
    if (params.years_of_service_max) backendParams.years_of_service_max = params.years_of_service_max;
    
    // Visibility
    if (params.is_visible_in_org_chart !== undefined) {
      backendParams.is_visible_in_org_chart = params.is_visible_in_org_chart;
    }
    
    return apiService.getEmployees(backendParams);
  },

  getEmployee: (id) => apiService.getEmployee(id),
  
  createEmployee: (data) => {
    // Ensure proper field mapping for creation
    const backendData = {
      ...data,
      // Ensure boolean fields are properly set
      is_visible_in_org_chart: data.is_visible_in_org_chart ?? true,
      // Ensure array fields are arrays
      tag_ids: Array.isArray(data.tag_ids) ? data.tag_ids : [],
      // Handle null values for foreign keys
      unit: data.unit || null,
      line_manager: data.line_manager || null,
    };
    
    return apiService.createEmployee(backendData);
  },
  
  updateEmployee: (id, data) => {
    // Ensure proper field mapping for updates
    const backendData = {
      ...data,
      // Ensure boolean fields are properly set
      is_visible_in_org_chart: data.is_visible_in_org_chart ?? true,
      // Ensure array fields are arrays
      tag_ids: Array.isArray(data.tag_ids) ? data.tag_ids : [],
      // Handle null values for foreign keys
      unit: data.unit || null,
      line_manager: data.line_manager || null,
    };
    
    return apiService.updateEmployee(id, backendData);
  },
  
  deleteEmployee: (id) => apiService.deleteEmployee(id),

  // Filter options - use backend endpoint
  getFilterOptions: () => apiService.getEmployeeFilterOptions(),

  // Dropdown search with backend field mapping
  dropdownSearch: (field, search, limit = 50) => {
    // Map frontend field names to backend field names
    const fieldMapping = {
      'line_managers': 'line_managers',
      'job_titles': 'job_titles',
      'employees': 'employees'
    };
    
    const backendField = fieldMapping[field] || field;
    return apiService.dropdownSearch(backendField, search, limit);
  },

  // Org chart operations
  getOrgChart: () => apiService.getOrgChart(),

  updateOrgChartVisibility: (employeeIds, isVisible) => 
    apiService.updateOrgChartVisibility({
      employee_ids: employeeIds,
      is_visible_in_org_chart: isVisible
    }),

  updateSingleOrgChartVisibility: (id, isVisible) => 
    apiService.updateSingleOrgChartVisibility(id, {
      is_visible_in_org_chart: isVisible
    }),

  // Statistics
  getStatistics: () => apiService.getEmployeeStatistics(),

  // Bulk operations
  bulkUpdate: (employeeIds, updates) => {
    const backendData = {
      employee_ids: employeeIds,
      updates: updates
    };
    
    return apiService.bulkUpdateEmployees(backendData);
  },

  // Export with proper parameter mapping
  exportData: (format = 'csv', filters = {}) => {
    const params = {
      format,
      ...filters
    };
    
    return apiService.exportEmployees(params);
  },

  // Status management operations
  getStatusDashboard: () => apiService.getStatusDashboard(),
  
  updateEmployeeStatus: (id, forceUpdate = false) => 
    apiService.updateEmployeeStatus(id, { force_update: forceUpdate }),
  
  getStatusPreview: (id) => apiService.getStatusPreview(id),
  
  bulkUpdateStatuses: (employeeIds = []) => 
    apiService.bulkUpdateStatuses(employeeIds),
  
  getStatusRules: () => apiService.getStatusRules(),

  // Document operations
  getEmployeeDocuments: (employeeId) => 
    apiService.getEmployeeDocuments(employeeId),
  
  uploadDocument: (employeeId, documentData) => {
    const formData = new FormData();
    formData.append('employee', employeeId);
    formData.append('name', documentData.name);
    formData.append('document_type', documentData.document_type);
    
    if (documentData.file) {
      formData.append('file', documentData.file);
    } else if (documentData.file_path) {
      formData.append('file_path', documentData.file_path);
    }
    
    if (documentData.file_size) {
      formData.append('file_size', documentData.file_size);
    }
    if (documentData.mime_type) {
      formData.append('mime_type', documentData.mime_type);
    }
    
    return apiService.uploadEmployeeDocument(formData);
  },
  
  deleteDocument: (documentId) => apiService.deleteEmployeeDocument(documentId),

  // Activity operations
  getEmployeeActivities: (employeeId, limit = 50) => {
    const params = employeeId ? { employee: employeeId, limit } : { limit };
    return apiService.getEmployeeActivities(params);
  },
  
  getRecentActivities: (limit = 50) => 
    apiService.getRecentActivities(limit),
  
  getActivitySummary: () => apiService.getActivitySummary(),

  // Validation helpers
  validateEmployeeData: (data) => {
    const errors = {};
    
    // Required field validation
    if (!data.employee_id?.trim()) {
      errors.employee_id = 'Employee ID is required';
    }
    if (!data.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!data.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Email is invalid';
    }
    if (!data.start_date) {
      errors.start_date = 'Start date is required';
    }
    if (!data.business_function) {
      errors.business_function = 'Business function is required';
    }
    if (!data.department) {
      errors.department = 'Department is required';
    }
    if (!data.job_function) {
      errors.job_function = 'Job function is required';
    }
    if (!data.job_title?.trim()) {
      errors.job_title = 'Job title is required';
    }
    if (!data.position_group) {
      errors.position_group = 'Position group is required';
    }
    if (!data.grade) {
      errors.grade = 'Grade is required';
    }
    
    // Date validation
    if (data.end_date && data.start_date) {
      if (new Date(data.end_date) <= new Date(data.start_date)) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    if (data.contract_start_date && data.start_date) {
      if (new Date(data.contract_start_date) < new Date(data.start_date)) {
        errors.contract_start_date = 'Contract start date cannot be before employment start date';
      }
    }
    
    return errors;
  },

  // Helper to format employee data for display
  formatEmployeeForDisplay: (employee) => {
    return {
      ...employee,
      full_name: employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
      display_name: employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
      business_function_name: employee.business_function_name || employee.business_function?.name,
      department_name: employee.department_name || employee.department?.name,
      unit_name: employee.unit_name || employee.unit?.name,
      job_function_name: employee.job_function_name || employee.job_function?.name,
      position_group_name: employee.position_group_name || employee.position_group?.name,
      status_name: employee.status_name || employee.status?.name,
      status_color: employee.status_color || employee.status?.color,
      line_manager_name: employee.line_manager_name || employee.line_manager?.name,
      line_manager_hc_number: employee.line_manager_hc_number || employee.line_manager?.employee_id,
      tag_names: employee.tag_names || employee.tags?.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        type: tag.tag_type
      })) || []
    };
  },

  // Helper to prepare employee data for backend submission
  prepareEmployeeForSubmission: (formData) => {
    return {
      employee_id: formData.employee_id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || '',
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || '',
      address: formData.address || '',
      emergency_contact: formData.emergency_contact || '',
      profile_image: formData.profile_image || null,
      
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      business_function: formData.business_function,
      department: formData.department,
      unit: formData.unit || null,
      job_function: formData.job_function,
      job_title: formData.job_title,
      position_group: formData.position_group,
      grade: parseInt(formData.grade),
      contract_duration: formData.contract_duration || 'PERMANENT',
      contract_start_date: formData.contract_start_date || formData.start_date,
      
      line_manager: formData.line_manager || null,
      tag_ids: Array.isArray(formData.tag_ids) ? formData.tag_ids : [],
      notes: formData.notes || '',
      is_visible_in_org_chart: formData.is_visible_in_org_chart ?? true
    };
  }
};