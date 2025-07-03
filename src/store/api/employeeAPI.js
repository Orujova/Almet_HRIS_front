// src/store/api/employeeAPI.js - Complete Employee API with all endpoints including grading
import { apiService } from '../../services/api';

export const employeeAPI = {
  // ========================================
  // EMPLOYEE CRUD OPERATIONS
  // ========================================
  
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
    
    // Personal information
    if (params.gender) {
      backendParams.gender = Array.isArray(params.gender) 
        ? params.gender.join(',') 
        : params.gender;
    }
    
    // Contract information
    if (params.contract_duration) {
      backendParams.contract_duration = Array.isArray(params.contract_duration) 
        ? params.contract_duration.join(',') 
        : params.contract_duration;
    }
    
    // Date filters
    if (params.start_date_from) backendParams.start_date_from = params.start_date_from;
    if (params.start_date_to) backendParams.start_date_to = params.start_date_to;
    if (params.end_date_from) backendParams.end_date_from = params.end_date_from;
    if (params.end_date_to) backendParams.end_date_to = params.end_date_to;
    
    // Special filters
    if (params.active_only !== undefined) backendParams.active_only = params.active_only;
    if (params.org_chart_visible !== undefined) backendParams.org_chart_visible = params.org_chart_visible;
    if (params.is_line_manager !== undefined) backendParams.is_line_manager = params.is_line_manager;
    
    return apiService.getEmployees(backendParams);
  },

  getById: (id) => apiService.getEmployee(id),
  
  create: (data) => {
    // Map frontend form data to backend expected format
    const backendData = {
      // Basic Information
      employee_id: data.employeeId || data.employee_id,
      first_name: data.firstName || data.first_name || data.name,
      last_name: data.lastName || data.last_name || data.surname,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      date_of_birth: data.dateOfBirth || data.date_of_birth,
      address: data.address,
      emergency_contact: data.emergencyContact || data.emergency_contact,
      profile_image: data.profileImage || data.profile_image,
      
      // Job Information
      job_title: data.jobTitle || data.job_title,
      business_function: data.businessFunction || data.business_function,
      department: data.department,
      unit: data.unit,
      job_function: data.jobFunction || data.job_function,
      position_group: data.positionGroup || data.position_group,
      
      // Grading - Use position group grading levels
      grading_level: data.gradingLevel || data.grading_level || '',
      
      // Management
      line_manager: data.lineManager || data.line_manager,
      
      // Contract Information
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      contract_duration: data.contractDuration || data.contract_duration,
      contract_start_date: data.contractStartDate || data.contract_start_date,
      contract_end_date: data.contractEndDate || data.contract_end_date,
      
      // Visibility
      is_visible_in_org_chart: data.isVisibleInOrgChart !== undefined ? data.isVisibleInOrgChart : true,
      
      // Notes
      notes: data.notes || '',
      
      // Tags (will be handled separately via tag API)
      tag_ids: data.tags || data.tagIds || [],
    };
    
    return apiService.createEmployee(backendData);
  },
  
  update: (id, data) => {
    // Similar mapping for update
    const backendData = {
      employee_id: data.employeeId || data.employee_id,
      first_name: data.firstName || data.first_name || data.name,
      last_name: data.lastName || data.last_name || data.surname,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      date_of_birth: data.dateOfBirth || data.date_of_birth,
      address: data.address,
      emergency_contact: data.emergencyContact || data.emergency_contact,
      profile_image: data.profileImage || data.profile_image,
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
      contract_start_date: data.contractStartDate || data.contract_start_date,
      contract_end_date: data.contractEndDate || data.contract_end_date,
      is_visible_in_org_chart: data.isVisibleInOrgChart,
      notes: data.notes,
      tag_ids: data.tags || data.tagIds || [],
    };
    
    return apiService.updateEmployee(id, backendData);
  },

  partialUpdate: (id, data) => {
    return apiService.partialUpdateEmployee(id, data);
  },
  
  delete: (id) => apiService.deleteEmployee(id),
  
  // ========================================
  // EMPLOYEE STATISTICS AND ANALYTICS
  // ========================================
  getStatistics: () => apiService.getEmployeeStatistics(),
  getFilterOptions: () => apiService.getEmployeeFilterOptions(),
  
  // ========================================
  // BULK OPERATIONS
  // ========================================
  bulkUpdate: (data) => apiService.bulkUpdateEmployees(data),
  bulkDelete: (ids) => apiService.bulkDeleteEmployees(ids),
  softDelete: (ids) => apiService.softDeleteEmployees(ids),
  restore: (ids) => apiService.restoreEmployees(ids),
  bulkCreate: (data) => apiService.bulkCreateEmployees(data),
  
  // ========================================
  // TAG MANAGEMENT
  // ========================================
  addTag: (data) => apiService.addEmployeeTag(data),
  removeTag: (data) => apiService.removeEmployeeTag(data),
  bulkAddTags: (employeeIds, tagIds) => apiService.bulkAddTags(employeeIds, tagIds),
  bulkRemoveTags: (employeeIds, tagIds) => apiService.bulkRemoveTags(employeeIds, tagIds),
  
  // ========================================
  // STATUS MANAGEMENT
  // ========================================
  updateStatus: (employeeIds) => apiService.updateEmployeeStatus(employeeIds),
  autoUpdateStatuses: () => apiService.autoUpdateStatuses(),
  
  // ========================================
  // LINE MANAGER MANAGEMENT
  // ========================================
  getLineManagers: (params) => apiService.getLineManagers(params),
  updateLineManager: (employeeId, lineManagerId) => apiService.updateLineManager(employeeId, lineManagerId),
  bulkUpdateLineManager: (employeeIds, lineManagerId) => apiService.bulkUpdateLineManager(employeeIds, lineManagerId),
  
  // ========================================
  // EXPORT AND TEMPLATES
  // ========================================
  export: (params = {}) => apiService.exportEmployees(params),
  downloadTemplate: () => apiService.downloadEmployeeTemplate(),
  
  // ========================================
  // ACTIVITIES AND AUDIT TRAIL
  // ========================================
  getActivities: (employeeId) => apiService.getEmployeeActivities(employeeId),

  // ========================================
  // GRADING MANAGEMENT
  // ========================================
  getEmployeeGrading: () => apiService.getEmployeeGrading(),
  bulkUpdateGrades: (updates) => apiService.bulkUpdateEmployeeGrades(updates),
  updateSingleGrade: (employeeId, gradingLevel) => {
    const updates = [{ employee_id: employeeId, grading_level: gradingLevel }];
    return apiService.bulkUpdateEmployeeGrades(updates);
  },
  
  // ========================================
  // ORG CHART MANAGEMENT
  // ========================================
  getOrgChart: (params) => apiService.getOrgChart(params),
  getOrgChartNode: (id) => apiService.getOrgChartNode(id),
  getOrgChartFullTree: () => apiService.getOrgChartFullTree(),
};

// ========================================
// HEADCOUNT ANALYTICS API
// ========================================
export const headcountAPI = {
  getSummaries: (params) => apiService.getHeadcountSummaries(params),
  getSummary: (id) => apiService.getHeadcountSummary(id),
  getLatest: () => apiService.getLatestHeadcountSummary(),
  generateCurrent: () => apiService.generateCurrentHeadcountSummary(),
};

// ========================================
// VACANCY MANAGEMENT API
// ========================================
export const vacancyAPI = {
  getAll: (params) => apiService.getVacantPositions(params),
  getById: (id) => apiService.getVacantPosition(id),
  create: (data) => apiService.createVacantPosition(data),
  update: (id, data) => apiService.updateVacantPosition(id, data),
  partialUpdate: (id, data) => apiService.partialUpdateVacantPosition(id, data),
  delete: (id) => apiService.deleteVacantPosition(id),
  markFilled: (id, employeeData) => apiService.markPositionFilled(id, employeeData),
  getStatistics: () => apiService.getVacantPositionStatistics(),
};

export { employeeAPI as default };