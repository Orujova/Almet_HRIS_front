// src/store/api/employeeAPI.js - Backend endpointlərinə uyğun employee API
import { apiService } from '../../services/api';

export const employeeAPI = {
  // ========================================
  // EMPLOYEE CRUD OPERATIONS
  // ========================================
  
  getAll: (params = {}) => {
    // Backend field names ilə map edilir
    const backendParams = {};
    
    // Pagination
    if (params.page) backendParams.page = params.page;
    if (params.page_size) backendParams.page_size = params.page_size;
    
    // Search
    if (params.search) backendParams.search = params.search;
    
    // Sorting
    if (params.ordering) backendParams.ordering = params.ordering;
    
    // Filters - backend field names
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
    
    // İlave parametrlər
    if (params.line_manager) backendParams.line_manager = params.line_manager;
    if (params.job_title) backendParams.job_title = params.job_title;
    if (params.gender) backendParams.gender = params.gender;
    if (params.contract_duration) backendParams.contract_duration = params.contract_duration;
    if (params.start_date_from) backendParams.start_date_from = params.start_date_from;
    if (params.start_date_to) backendParams.start_date_to = params.start_date_to;
    if (params.active_only !== undefined) backendParams.active_only = params.active_only;
    if (params.org_chart_visible !== undefined) backendParams.org_chart_visible = params.org_chart_visible;
    
    return apiService.getEmployees(backendParams);
  },

  getById: (id) => apiService.getEmployee(id),
  
  create: (data) => {
    // Frontend form data-nı backend format-na map edilir
    const formData = new FormData();
    
    // Basic Information
    if (data.employeeId || data.employee_id) {
      formData.append('employee_id', data.employeeId || data.employee_id);
    }
    if (data.firstName || data.first_name) {
      formData.append('first_name', data.firstName || data.first_name);
    }
    if (data.lastName || data.last_name) {
      formData.append('last_name', data.lastName || data.last_name);
    }
    if (data.email) {
      formData.append('email', data.email);
    }
    if (data.phone) {
      formData.append('phone', data.phone);
    }
    if (data.gender) {
      formData.append('gender', data.gender);
    }
    if (data.dateOfBirth || data.date_of_birth) {
      formData.append('date_of_birth', data.dateOfBirth || data.date_of_birth);
    }
    if (data.fatherName || data.father_name) {
      formData.append('father_name', data.fatherName || data.father_name);
    }
    if (data.address) {
      formData.append('address', data.address);
    }
    if (data.emergencyContact || data.emergency_contact) {
      formData.append('emergency_contact', data.emergencyContact || data.emergency_contact);
    }
    
    // Job Information
    if (data.jobTitle || data.job_title) {
      formData.append('job_title', data.jobTitle || data.job_title);
    }
    if (data.businessFunction || data.business_function) {
      formData.append('business_function', data.businessFunction || data.business_function);
    }
    if (data.department) {
      formData.append('department', data.department);
    }
    if (data.unit) {
      formData.append('unit', data.unit);
    }
    if (data.jobFunction || data.job_function) {
      formData.append('job_function', data.jobFunction || data.job_function);
    }
    if (data.positionGroup || data.position_group) {
      formData.append('position_group', data.positionGroup || data.position_group);
    }
    if (data.gradingLevel || data.grading_level) {
      formData.append('grading_level', data.gradingLevel || data.grading_level);
    }
    
    // Management
    if (data.lineManager || data.line_manager) {
      formData.append('line_manager', data.lineManager || data.line_manager);
    }
    
    // Contract Information
    if (data.startDate || data.start_date) {
      formData.append('start_date', data.startDate || data.start_date);
    }
    if (data.endDate || data.end_date) {
      formData.append('end_date', data.endDate || data.end_date);
    }
    if (data.contractDuration || data.contract_duration) {
      formData.append('contract_duration', data.contractDuration || data.contract_duration);
    }
    if (data.contractStartDate || data.contract_start_date) {
      formData.append('contract_start_date', data.contractStartDate || data.contract_start_date);
    }
    
    // Visibility
    if (data.isVisibleInOrgChart !== undefined) {
      formData.append('is_visible_in_org_chart', data.isVisibleInOrgChart);
    }
    
    // Notes
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    
    // Tags
    if (data.tags || data.tagIds) {
      const tagIds = data.tags || data.tagIds || [];
      tagIds.forEach(tagId => {
        formData.append('tag_ids', tagId);
      });
    }
    
    // Files
    if (data.profilePhoto || data.profile_photo) {
      formData.append('profile_photo', data.profilePhoto || data.profile_photo);
    }
    if (data.document) {
      formData.append('document', data.document);
      if (data.documentType || data.document_type) {
        formData.append('document_type', data.documentType || data.document_type);
      }
      if (data.documentName || data.document_name) {
        formData.append('document_name', data.documentName || data.document_name);
      }
    }
    
    return apiService.createEmployee(formData);
  },
  
  update: (id, data) => {
    // Update üçün oxşar FormData mapping
    const formData = new FormData();
    
    // Basic Information
    if (data.employeeId || data.employee_id) {
      formData.append('employee_id', data.employeeId || data.employee_id);
    }
    if (data.firstName || data.first_name) {
      formData.append('first_name', data.firstName || data.first_name);
    }
    if (data.lastName || data.last_name) {
      formData.append('last_name', data.lastName || data.last_name);
    }
    if (data.email) {
      formData.append('email', data.email);
    }
    if (data.phone) {
      formData.append('phone', data.phone);
    }
    if (data.gender) {
      formData.append('gender', data.gender);
    }
    if (data.dateOfBirth || data.date_of_birth) {
      formData.append('date_of_birth', data.dateOfBirth || data.date_of_birth);
    }
    if (data.fatherName || data.father_name) {
      formData.append('father_name', data.fatherName || data.father_name);
    }
    if (data.address) {
      formData.append('address', data.address);
    }
    if (data.emergencyContact || data.emergency_contact) {
      formData.append('emergency_contact', data.emergencyContact || data.emergency_contact);
    }
    
    // Job Information
    if (data.jobTitle || data.job_title) {
      formData.append('job_title', data.jobTitle || data.job_title);
    }
    if (data.businessFunction || data.business_function) {
      formData.append('business_function', data.businessFunction || data.business_function);
    }
    if (data.department) {
      formData.append('department', data.department);
    }
    if (data.unit) {
      formData.append('unit', data.unit);
    }
    if (data.jobFunction || data.job_function) {
      formData.append('job_function', data.jobFunction || data.job_function);
    }
    if (data.positionGroup || data.position_group) {
      formData.append('position_group', data.positionGroup || data.position_group);
    }
    if (data.gradingLevel || data.grading_level) {
      formData.append('grading_level', data.gradingLevel || data.grading_level);
    }
    
    // Management
    if (data.lineManager || data.line_manager) {
      formData.append('line_manager', data.lineManager || data.line_manager);
    }
    
    // Contract Information
    if (data.startDate || data.start_date) {
      formData.append('start_date', data.startDate || data.start_date);
    }
    if (data.endDate || data.end_date) {
      formData.append('end_date', data.endDate || data.end_date);
    }
    if (data.contractDuration || data.contract_duration) {
      formData.append('contract_duration', data.contractDuration || data.contract_duration);
    }
    if (data.contractStartDate || data.contract_start_date) {
      formData.append('contract_start_date', data.contractStartDate || data.contract_start_date);
    }
    
    // Visibility
    if (data.isVisibleInOrgChart !== undefined) {
      formData.append('is_visible_in_org_chart', data.isVisibleInOrgChart);
    }
    
    // Notes
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    
    // Tags
    if (data.tags || data.tagIds) {
      const tagIds = data.tags || data.tagIds || [];
      tagIds.forEach(tagId => {
        formData.append('tag_ids', tagId);
      });
    }
    
    // Files
    if (data.profilePhoto || data.profile_photo) {
      formData.append('profile_photo', data.profilePhoto || data.profile_photo);
    }
    if (data.document) {
      formData.append('document', data.document);
      if (data.documentType || data.document_type) {
        formData.append('document_type', data.documentType || data.document_type);
      }
      if (data.documentName || data.document_name) {
        formData.append('document_name', data.documentName || data.document_name);
      }
    }
    
    return apiService.updateEmployee(id, formData);
  },

  delete: (id) => apiService.deleteEmployee(id),
  
  // ========================================
  // EMPLOYEE SPECIFIC DETAILS
  // ========================================
  getActivities: (employeeId) => apiService.getEmployeeActivities(employeeId),
  getDirectReports: (employeeId) => apiService.getEmployeeDirectReports(employeeId),
  getStatusPreview: (employeeId) => apiService.getEmployeeStatusPreview(employeeId),
  
  // ========================================
  // EMPLOYEE STATISTICS
  // ========================================
  getStatistics: () => apiService.getEmployeeStatistics(),
  
  // ========================================
  // BULK OPERATIONS
  // ========================================
  softDelete: (ids) => apiService.softDeleteEmployees(ids),
  restore: (ids) => apiService.restoreEmployees(ids),
  bulkUpload: (file) => apiService.bulkUploadEmployees(file),
  
  // ========================================
  // TAG MANAGEMENT
  // ========================================
  addTag: (data) => apiService.addEmployeeTag(data),
  removeTag: (data) => apiService.removeEmployeeTag(data),
  bulkAddTags: (employeeIds, tagId) => apiService.bulkAddTags(employeeIds, tagId),
  bulkRemoveTags: (employeeIds, tagId) => apiService.bulkRemoveTags(employeeIds, tagId),
  
  // ========================================
  // LINE MANAGER MANAGEMENT
  // ========================================
  assignLineManager: (data) => apiService.assignLineManager(data),
  bulkAssignLineManager: (data) => apiService.bulkAssignLineManager(data),
  
  // ========================================
  // CONTRACT MANAGEMENT
  // ========================================
  extendContract: (data) => apiService.extendEmployeeContract(data),
  bulkExtendContracts: (data) => apiService.bulkExtendContracts(data),
  getContractExpiryAlerts: (params) => apiService.getContractExpiryAlerts(params),
  getContractsExpiringSoon: (params) => apiService.getContractsExpiringSoon(params),
  
  // ========================================
  // EXPORT AND TEMPLATES
  // ========================================
  export: (params = {}) => apiService.exportEmployees(params),
  downloadTemplate: () => apiService.downloadEmployeeTemplate(),
  
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
  // ORGANIZATIONAL HIERARCHY
  // ========================================
  getOrganizationalHierarchy: (params) => apiService.getOrganizationalHierarchy(params),
  
  // ========================================
  // PROFILE IMAGES
  // ========================================
  uploadProfileImage: (employeeId, file) => apiService.uploadProfileImage(employeeId, file),
  deleteProfileImage: (employeeId) => apiService.deleteProfileImage(employeeId),
  
  // ========================================
  // ADVANCED SEARCH HELPERS
  // ========================================
  searchEmployees: (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    };
    return employeeAPI.getAll(params);
  },
  
  getEmployeesByStatus: (statusIds) => {
    const params = {
      status: Array.isArray(statusIds) ? statusIds : [statusIds]
    };
    return employeeAPI.getAll(params);
  },
  
  getEmployeesByDepartment: (departmentIds) => {
    const params = {
      department: Array.isArray(departmentIds) ? departmentIds : [departmentIds]
    };
    return employeeAPI.getAll(params);
  },
  
  getEmployeesByBusinessFunction: (businessFunctionIds) => {
    const params = {
      business_function: Array.isArray(businessFunctionIds) ? businessFunctionIds : [businessFunctionIds]
    };
    return employeeAPI.getAll(params);
  },
  
  getNewHires: (daysBack = 30) => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);
    
    const params = {
      start_date_from: fromDate.toISOString().split('T')[0]
    };
    return employeeAPI.getAll(params);
  },
  
  getEmployeesWithContractEnding: (daysAhead = 30) => {
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + daysAhead);
    
    const params = {
      contract_end_date_to: toDate.toISOString().split('T')[0],
      contract_duration__ne: 'PERMANENT'
    };
    return employeeAPI.getAll(params);
  },
  
  // ========================================
  // BATCH OPERATIONS HELPERS
  // ========================================
  batchUpdateStatus: (employeeIds, statusId) => {
    // Since we don't have bulk status update endpoint, we can do individual updates
    const updates = employeeIds.map(id => ({
      id,
      status: statusId
    }));
    
    return Promise.all(updates.map(update => 
      employeeAPI.update(update.id, { status: update.status })
    ));
  },
  
  batchUpdateGrades: (employeeGradeUpdates) => {
    return employeeAPI.bulkUpdateGrades(employeeGradeUpdates);
  },
  
  batchAssignManager: (employeeIds, managerId) => {
    return employeeAPI.bulkAssignLineManager({
      employee_ids: employeeIds,
      line_manager_id: managerId
    });
  },
  
  batchAddTags: (employeeIds, tagIds) => {
    if (Array.isArray(tagIds)) {
      return Promise.all(tagIds.map(tagId => 
        employeeAPI.bulkAddTags(employeeIds, tagId)
      ));
    } else {
      return employeeAPI.bulkAddTags(employeeIds, tagIds);
    }
  },
  
  batchRemoveTags: (employeeIds, tagIds) => {
    if (Array.isArray(tagIds)) {
      return Promise.all(tagIds.map(tagId => 
        employeeAPI.bulkRemoveTags(employeeIds, tagId)
      ));
    } else {
      return employeeAPI.bulkRemoveTags(employeeIds, tagIds);
    }
  },
  
  // ========================================
  // VALIDATION HELPERS
  // ========================================
  validateEmployeeData: (data) => {
    const errors = {};
    
    // Required fields validation
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email format';
    }
    if (!data.job_title?.trim()) {
      errors.job_title = 'Job title is required';
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
    if (!data.position_group) {
      errors.position_group = 'Position group is required';
    }
    if (!data.start_date) {
      errors.start_date = 'Start date is required';
    }
    if (!data.contract_duration) {
      errors.contract_duration = 'Contract duration is required';
    }
    
    // Date validation
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      if (endDate <= startDate) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    // Contract validation
    if (data.contract_start_date && data.start_date) {
      const contractStart = new Date(data.contract_start_date);
      const employeeStart = new Date(data.start_date);
      if (contractStart < employeeStart) {
        errors.contract_start_date = 'Contract start date cannot be before employee start date';
      }
    }
    
    // Phone validation
    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  // ========================================
  // DATA TRANSFORMATION HELPERS
  // ========================================
  transformEmployeeData: (rawData) => {
    return {
      id: rawData.id,
      employeeId: rawData.employee_id,
      firstName: rawData.first_name,
      lastName: rawData.last_name,
      fullName: `${rawData.first_name} ${rawData.last_name}`,
      email: rawData.email,
      phone: rawData.phone,
      gender: rawData.gender,
      dateOfBirth: rawData.date_of_birth,
      fatherName: rawData.father_name,
      address: rawData.address,
      emergencyContact: rawData.emergency_contact,
      jobTitle: rawData.job_title,
      businessFunction: rawData.business_function,
      businessFunctionName: rawData.business_function_name,
      department: rawData.department,
      departmentName: rawData.department_name,
      unit: rawData.unit,
      unitName: rawData.unit_name,
      jobFunction: rawData.job_function,
      jobFunctionName: rawData.job_function_name,
      positionGroup: rawData.position_group,
      positionGroupName: rawData.position_group_name,
      gradingLevel: rawData.grading_level,
      gradingDisplay: rawData.grading_display,
      lineManager: rawData.line_manager,
      lineManagerName: rawData.line_manager_name,
      startDate: rawData.start_date,
      endDate: rawData.end_date,
      contractDuration: rawData.contract_duration,
      contractStartDate: rawData.contract_start_date,
      contractEndDate: rawData.contract_end_date,
      yearsOfService: rawData.years_of_service,
      status: rawData.status_name,
      statusColor: rawData.status_color,
      tags: rawData.tag_names || [],
      isVisibleInOrgChart: rawData.is_visible_in_org_chart,
      profileImageUrl: rawData.profile_image_url,
      createdAt: rawData.created_at,
      updatedAt: rawData.updated_at
    };
  },
  
  // ========================================
  // ANALYTICS HELPERS
  // ========================================
  getEmployeeAnalytics: async () => {
    try {
      const [statistics, employees] = await Promise.all([
        employeeAPI.getStatistics(),
        employeeAPI.getAll({ page_size: 1000 }) // Get large sample for analysis
      ]);
      
      const employeeData = employees.data.results || employees.data;
      
      return {
        statistics: statistics.data,
        demographics: {
          byGender: employeeData.reduce((acc, emp) => {
            const gender = emp.gender || 'Not Specified';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
          }, {}),
          byDepartment: employeeData.reduce((acc, emp) => {
            const dept = emp.department_name || 'Unknown';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
          }, {}),
          byStatus: employeeData.reduce((acc, emp) => {
            const status = emp.status_name || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {})
        },
        trends: {
          newHires: employeeData.filter(emp => emp.years_of_service < 0.25).length,
          veteranEmployees: employeeData.filter(emp => emp.years_of_service >= 5).length,
          contractEnding: employeeData.filter(emp => {
            if (!emp.contract_end_date) return false;
            const endDate = new Date(emp.contract_end_date);
            const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            return endDate <= thirtyDaysFromNow;
          }).length
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch employee analytics: ' + error.message);
    }
  }
};

export { employeeAPI as default };