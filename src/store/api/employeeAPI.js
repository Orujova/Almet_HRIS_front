// src/store/api/employeeAPI.js - Complete backend integration with all features
import { apiService } from '../../services/api';

export const employeeAPI = {
  // Employee CRUD operations with proper field mapping
  getAll: (params = {}) => {
    // Map frontend filter parameters to backend field names
    const backendParams = {};
    
    // Basic pagination
    if (params.page) backendParams.page = params.page;
    if (params.page_size) backendParams.page_size = params.page_size;
    
    // Search
    if (params.search) backendParams.search = params.search;
    
    // Sorting - Excel-style multi-sort support
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
    
    // Status and tags - Multiple selection support
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
    if (params.nationality) {
      backendParams.nationality = Array.isArray(params.nationality) 
        ? params.nationality.join(',') 
        : params.nationality;
    }
    
    // Contract information
    if (params.contract_duration) {
      backendParams.contract_duration = Array.isArray(params.contract_duration) 
        ? params.contract_duration.join(',') 
        : params.contract_duration;
    }
    if (params.contract_type) {
      backendParams.contract_type = Array.isArray(params.contract_type) 
        ? params.contract_type.join(',') 
        : params.contract_type;
    }
    
    // Date filters
    if (params.start_date_from) backendParams.start_date_from = params.start_date_from;
    if (params.start_date_to) backendParams.start_date_to = params.start_date_to;
    if (params.end_date_from) backendParams.end_date_from = params.end_date_from;
    if (params.end_date_to) backendParams.end_date_to = params.end_date_to;
    
    // Special filters
    if (params.active_only !== undefined) backendParams.active_only = params.active_only;
    if (params.org_chart_visible !== undefined) backendParams.org_chart_visible = params.org_chart_visible;
    if (params.has_documents !== undefined) backendParams.has_documents = params.has_documents;
    if (params.is_line_manager !== undefined) backendParams.is_line_manager = params.is_line_manager;
    
    return apiService.getEmployees(backendParams);
  },

  getById: (id) => apiService.getEmployee(id),
  
  create: (data) => {
    // Map frontend form data to backend expected format
    const backendData = {
      // Basic Information
      employee_id: data.employeeId || data.employee_id,
      name: data.name,
      surname: data.surname,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      nationality: data.nationality,
      date_of_birth: data.dateOfBirth || data.date_of_birth,
      
      // Job Information
      job_title: data.jobTitle || data.job_title,
      business_function: data.businessFunction || data.business_function,
      department: data.department,
      unit: data.unit,
      job_function: data.jobFunction || data.job_function,
      position_group: data.positionGroup || data.position_group,
      
      // Grading - Use position group grading levels
      grading_level: data.gradingLevel || data.grading_level || '', // Default to empty, will be set based on position group
      
      // Management
      line_manager: data.lineManager || data.line_manager,
      
      // Contract Information
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      contract_duration: data.contractDuration || data.contract_duration,
      contract_type: data.contractType || data.contract_type,
      
      // Status is auto-determined based on contract, not manually set
      // status: Will be automatically set by backend based on contract
      
      // Tags
      tags: data.tags || [],
      
      // Documents (optional)
      documents: data.documents || [],
      
      // Additional fields
      notes: data.notes,
      emergency_contact: data.emergencyContact || data.emergency_contact,
      emergency_contact_phone: data.emergencyContactPhone || data.emergency_contact_phone,
      
      // System fields
      org_chart_visible: data.orgChartVisible !== undefined ? data.orgChartVisible : true,
    };
    
    return apiService.createEmployee(backendData);
  },
  
  update: (id, data) => {
    // Similar mapping for update
    const backendData = {
      employee_id: data.employeeId || data.employee_id,
      name: data.name,
      surname: data.surname,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      nationality: data.nationality,
      date_of_birth: data.dateOfBirth || data.date_of_birth,
      job_title: data.jobTitle || data.job_title,
      business_function: data.businessFunction || data.business_function,
      department: data.department,
      unit: data.unit,
      job_function: data.jobFunction || data.job_function,
      position_group: data.positionGroup || data.position_group,
      grading_level: data.gradingLevel || data.grading_level,
      line_manager: data.lineManager || data.line_manager,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      contract_duration: data.contractDuration || data.contract_duration,
      contract_type: data.contractType || data.contract_type,
      tags: data.tags || [],
      notes: data.notes,
      emergency_contact: data.emergencyContact || data.emergency_contact,
      emergency_contact_phone: data.emergencyContactPhone || data.emergency_contact_phone,
      org_chart_visible: data.orgChartVisible,
    };
    
    return apiService.updateEmployee(id, backendData);
  },
  
  delete: (id) => apiService.deleteEmployee(id),
  
  // Advanced features
  getFilterOptions: () => apiService.getEmployeeFilterOptions(),
  getStatistics: () => apiService.getEmployeeStatistics(),
  
  // Export with comprehensive filter support
  export: (format = 'csv', params = {}) => {
    return apiService.exportEmployees(format, params);
  },
  
  // Bulk operations
  bulkUpdate: (data) => apiService.bulkUpdateEmployees(data),
  bulkDelete: (ids) => apiService.bulkDeleteEmployees(ids),
  
  // Tag management
  addTag: (employeeId, tagData) => apiService.addEmployeeTag(employeeId, tagData),
  removeTag: (employeeId, tagId) => apiService.removeEmployeeTag(employeeId, tagId),
  bulkAddTags: (employeeIds, tagIds) => apiService.bulkAddTags(employeeIds, tagIds),
  bulkRemoveTags: (employeeIds, tagIds) => apiService.bulkRemoveTags(employeeIds, tagIds),
  
  // Status management with automatic transitions
  updateStatus: (id) => apiService.updateEmployeeStatus(id),
  getStatusPreview: (id) => apiService.getStatusPreview(id),
  bulkUpdateStatuses: (employeeIds) => apiService.bulkUpdateStatuses(employeeIds),
  getStatusRules: () => apiService.getStatusRules(),
  
  // Document management (optional)
  getDocuments: (employeeId) => apiService.getEmployeeDocuments(employeeId),
  uploadDocument: (formData) => apiService.uploadEmployeeDocument(formData),
  deleteDocument: (id) => apiService.deleteEmployeeDocument(id),
  
  // Activities and audit trail
  getActivities: (employeeId) => apiService.getEmployeeActivities(employeeId),
  getRecentActivities: (limit) => apiService.getRecentActivities(limit),
  
  // Org chart
  getOrgChart: () => apiService.getOrgChart(),
  updateOrgChartVisibility: (data) => apiService.updateOrgChartVisibility(data),
  
  // Advanced search
  dropdownSearch: (field, search, limit) => apiService.dropdownSearch(field, search, limit),
};

// Reference Data API
export const referenceDataAPI = {
  getBusinessFunctionDropdown: () => apiService.getBusinessFunctionDropdown(),
  getDepartmentDropdown: (businessFunctionId) => apiService.getDepartments(businessFunctionId),
  getUnitDropdown: (departmentId) => apiService.getUnits(departmentId),
  getJobFunctionDropdown: () => apiService.getJobFunctions(),
  getPositionGroupDropdown: () => apiService.getPositionGroups(),
  getEmployeeStatusDropdown: () => apiService.getEmployeeStatuses(),
  getEmployeeTagDropdown: (tagType) => apiService.getEmployeeTags(tagType),
};

// Tag Management API
export const tagAPI = {
  getAll: (tagType) => apiService.getEmployeeTags(tagType),
  create: (data) => apiService.createEmployeeTag(data),
  update: (id, data) => apiService.updateEmployeeTag(id, data),
  delete: (id) => apiService.deleteEmployeeTag(id),
};

// Grading API Integration
export const gradingAPI = {
  getEmployeeGrading: () => apiService.getEmployeeGrading(),
  getPositionGroupLevels: (positionGroupId) => apiService.getPositionGroupGradingLevels(positionGroupId),
  bulkUpdateGrades: (updates) => apiService.bulkUpdateEmployeeGrades(updates),
  getCurrentStructure: () => apiService.getCurrentGradingStructure(),
};

// Headcount Analytics API
export const headcountAPI = {
  getSummaries: () => apiService.getHeadcountSummaries(),
  getLatest: () => apiService.getLatestHeadcountSummary(),
  generateCurrent: () => apiService.generateCurrentHeadcountSummary(),
};

// Vacancy Management API
export const vacancyAPI = {
  getAll: () => apiService.getVacantPositions(),
  create: (data) => apiService.createVacantPosition(data),
  update: (id, data) => apiService.updateVacantPosition(id, data),
  delete: (id) => apiService.deleteVacantPosition(id),
  markFilled: (id, employeeData) => apiService.markPositionFilled(id, employeeData),
};

export { employeeAPI as default };