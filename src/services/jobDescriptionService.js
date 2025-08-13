// services/jobDescriptionService.js - Fixed version with proper unit filtering
import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

// Request interceptor to add auth token
api.interceptors.request.use(
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

/**
 * Job Description Service - CRUD operations with enhanced validation and debugging
 */
class JobDescriptionService {
  
  // ========================================
  // VALIDATION METHODS
  // ========================================
  
  validateJobDescriptionData(data) {
    const errors = [];
    
    // Required string fields
    if (!data.job_title?.trim()) {
      errors.push('job_title is required');
    }
    if (!data.job_purpose?.trim()) {
      errors.push('job_purpose is required');
    }
    
    // Required ID fields
    if (!data.business_function) {
      errors.push('business_function is required');
    }
    if (!data.department) {
      errors.push('department is required');
    }
    if (!data.position_group) {
      errors.push('position_group is required');
    }
    
    // Unit validation - only if unit is provided, it should be valid
    if (data.unit && !data.department) {
      errors.push('department is required when unit is specified');
    }
    
    // Sections validation
    if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
      errors.push('At least one section is required');
    } else {
      data.sections.forEach((section, index) => {
        if (!section.section_type) {
          errors.push(`Section ${index + 1}: section_type is required`);
        }
        if (!section.title) {
          errors.push(`Section ${index + 1}: title is required`);
        }
        if (!section.content?.trim()) {
          errors.push(`Section ${index + 1}: content is required`);
        }
        if (typeof section.order !== 'number') {
          errors.push(`Section ${index + 1}: order must be a number`);
        }
      });
    }
    
    // Skills validation
    if (data.required_skills_data && Array.isArray(data.required_skills_data)) {
      data.required_skills_data.forEach((skill, index) => {
        if (!skill.skill_id) {
          errors.push(`Required skill ${index + 1}: skill_id is required`);
        }
        if (!skill.proficiency_level) {
          errors.push(`Required skill ${index + 1}: proficiency_level is required`);
        }
        if (typeof skill.is_mandatory !== 'boolean') {
          errors.push(`Required skill ${index + 1}: is_mandatory must be boolean`);
        }
      });
    }
    
    // Competencies validation
    if (data.behavioral_competencies_data && Array.isArray(data.behavioral_competencies_data)) {
      data.behavioral_competencies_data.forEach((comp, index) => {
        if (!comp.competency_id) {
          errors.push(`Behavioral competency ${index + 1}: competency_id is required`);
        }
        if (!comp.proficiency_level) {
          errors.push(`Behavioral competency ${index + 1}: proficiency_level is required`);
        }
        if (typeof comp.is_mandatory !== 'boolean') {
          errors.push(`Behavioral competency ${index + 1}: is_mandatory must be boolean`);
        }
      });
    }
    
    return errors;
  }
  
  cleanJobDescriptionData(data) {
    const cleaned = {
      // Required string fields
      job_title: data.job_title?.trim() || '',
      job_purpose: data.job_purpose?.trim() || '',
      
      // Required ID fields
      business_function: parseInt(data.business_function) || null,
      department: parseInt(data.department) || null,
      position_group: parseInt(data.position_group) || null,
      
      // Optional ID fields - IMPORTANT: Only include unit if it has a value
      grading_level: data.grading_level?.trim() || null,
      reports_to: data.reports_to ? parseInt(data.reports_to) : null,
      assigned_employee: data.assigned_employee ? parseInt(data.assigned_employee) : null,
      
      // Manual employee fields
      manual_employee_name: data.manual_employee_name?.trim() || '',
      manual_employee_phone: data.manual_employee_phone?.trim() || '',
      
      // Arrays - ensure they're arrays
      sections: Array.isArray(data.sections) ? data.sections : [],
      required_skills_data: Array.isArray(data.required_skills_data) ? data.required_skills_data : [],
      behavioral_competencies_data: Array.isArray(data.behavioral_competencies_data) ? data.behavioral_competencies_data : [],
      business_resources_ids: Array.isArray(data.business_resources_ids) ? data.business_resources_ids.map(id => parseInt(id)).filter(id => !isNaN(id)) : [],
      access_rights_ids: Array.isArray(data.access_rights_ids) ? data.access_rights_ids.map(id => parseInt(id)).filter(id => !isNaN(id)) : [],
      company_benefits_ids: Array.isArray(data.company_benefits_ids) ? data.company_benefits_ids.map(id => parseInt(id)).filter(id => !isNaN(id)) : []
    };
    
    // CRITICAL FIX: Only include unit if it has a valid value
    if (data.unit && parseInt(data.unit)) {
      cleaned.unit = parseInt(data.unit);
    }
    // Don't include unit field at all if it's empty - this prevents the validation error
    
    // Clean sections
    cleaned.sections = cleaned.sections.map((section, index) => ({
      section_type: section.section_type?.trim() || '',
      title: section.title?.trim() || '',
      content: section.content?.trim() || '',
      order: typeof section.order === 'number' ? section.order : index + 1
    })).filter(section => section.section_type && section.title && section.content);
    
    // Clean skills data
    cleaned.required_skills_data = cleaned.required_skills_data.map(skill => ({
      skill_id: parseInt(skill.skill_id),
      proficiency_level: skill.proficiency_level?.trim() || 'INTERMEDIATE',
      is_mandatory: Boolean(skill.is_mandatory)
    })).filter(skill => skill.skill_id && !isNaN(skill.skill_id));
    
    // Clean competencies data
    cleaned.behavioral_competencies_data = cleaned.behavioral_competencies_data.map(comp => ({
      competency_id: parseInt(comp.competency_id),
      proficiency_level: comp.proficiency_level?.trim() || 'INTERMEDIATE',
      is_mandatory: Boolean(comp.is_mandatory)
    })).filter(comp => comp.competency_id && !isNaN(comp.competency_id));
    
    return cleaned;
  }

  // ========================================
  // JOB DESCRIPTIONS MAIN ENDPOINTS
  // ========================================
  
  async getJobDescriptions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.ordering) queryParams.append('ordering', params.ordering);
      if (params.page) queryParams.append('page', params.page);
      
      const response = await api.get(`/job-descriptions/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
      throw error;
    }
  }

  async getJobDescription(id) {
    try {
      const response = await api.get(`/job-descriptions/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job description:', error);
      throw error;
    }
  }

  async createJobDescription(data) {
    try {
      console.log('=== CREATE JOB DESCRIPTION DEBUG ===');
      console.log('1. Raw input data:', JSON.stringify(data, null, 2));
      
      // Validate data
      const validationErrors = this.validateJobDescriptionData(data);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      console.log('✅ Data validation passed');
      
      // Clean data
      const cleanedData = this.cleanJobDescriptionData(data);
      console.log('2. Cleaned data for API:', JSON.stringify(cleanedData, null, 2));
      
      // Log the request details
      console.log('3. Making API request to:', `${API_BASE_URL}/job-descriptions/`);
      
      const response = await api.post('/job-descriptions/', cleanedData);
      
      console.log('✅ API Response success:', response.status);
      console.log('4. Response data:', JSON.stringify(response.data, null, 2));
      console.log('=== END DEBUG ===');
      
      return response.data;
    } catch (error) {
      console.log('=== ERROR DEBUG ===');
      console.error('❌ Full error object:', error);
      
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response headers:', error.response.headers);
        console.error('❌ Response data:', JSON.stringify(error.response.data, null, 2));
        
        // Log specific validation errors from API
        if (error.response.data && typeof error.response.data === 'object') {
          console.error('❌ API validation errors:');
          Object.keys(error.response.data).forEach(field => {
            console.error(`  - ${field}: ${error.response.data[field]}`);
          });
        }
      } else if (error.request) {
        console.error('❌ No response received:', error.request);
      } else {
        console.error('❌ Error setting up request:', error.message);
      }
      console.log('=== END ERROR DEBUG ===');
      
      throw error;
    }
  }

  async updateJobDescription(id, data) {
    try {
      console.log('=== UPDATE JOB DESCRIPTION DEBUG ===');
      console.log('1. Job ID:', id);
      console.log('2. Raw input data:', JSON.stringify(data, null, 2));
      
      // Validate data
      const validationErrors = this.validateJobDescriptionData(data);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      // Clean data
      const cleanedData = this.cleanJobDescriptionData(data);
      console.log('3. Cleaned data for API:', JSON.stringify(cleanedData, null, 2));
      
      const response = await api.put(`/job-descriptions/${id}/`, cleanedData);
      console.log('✅ Update successful');
      console.log('=== END UPDATE DEBUG ===');
      
      return response.data;
    } catch (error) {
      console.error('Error updating job description:', error);
      if (error.response) {
        console.error('API Error Details:', error.response.data);
      }
      throw error;
    }
  }

  async deleteJobDescription(id) {
    try {
      const response = await api.delete(`/job-descriptions/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job description:', error);
      throw error;
    }
  }

  // ========================================
  // JOB DESCRIPTION APPROVAL WORKFLOW
  // ========================================

  async submitForApproval(id, data) {
    try {
      console.log('=== SUBMIT FOR APPROVAL DEBUG ===');
      console.log('Job ID:', id);
      console.log('Submission data:', JSON.stringify(data, null, 2));
      
      const response = await api.post(`/job-descriptions/${id}/submit_for_approval/`, data);
      console.log('✅ Submission successful');
      return response.data;
    } catch (error) {
      console.error('Error submitting for approval:', error);
      if (error.response) {
        console.error('API Error Details:', error.response.data);
      }
      throw error;
    }
  }

  async approveAsLineManager(id, data) {
    try {
      const response = await api.post(`/job-descriptions/${id}/approve_as_line_manager/`, data);
      return response.data;
    } catch (error) {
      console.error('Error approving as line manager:', error);
      throw error;
    }
  }

  async approveAsEmployee(id, data) {
    try {
      const response = await api.post(`/job-descriptions/${id}/approve_as_employee/`, data);
      return response.data;
    } catch (error) {
      console.error('Error approving as employee:', error);
      throw error;
    }
  }

  async rejectJobDescription(id, data) {
    try {
      const response = await api.post(`/job-descriptions/${id}/reject/`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting job description:', error);
      throw error;
    }
  }

  async requestRevision(id, data) {
    try {
      const response = await api.post(`/job-descriptions/${id}/request_revision/`, data);
      return response.data;
    } catch (error) {
      console.error('Error requesting revision:', error);
      throw error;
    }
  }

  // ========================================
  // EMPLOYEE RELATED JOB DESCRIPTIONS
  // ========================================

  async getEmployeeJobDescriptions(employeeId) {
    try {
      const response = await api.get(`/employees/${employeeId}/job_descriptions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee job descriptions:', error);
      throw error;
    }
  }

  async getTeamJobDescriptions(managerId) {
    try {
      const response = await api.get(`/employees/${managerId}/team_job_descriptions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team job descriptions:', error);
      throw error;
    }
  }

  async approveMyJobDescription(employeeId, data) {
    try {
      const response = await api.post(`/employees/${employeeId}/approve_my_job_description/`, data);
      return response.data;
    } catch (error) {
      console.error('Error approving my job description:', error);
      throw error;
    }
  }

  async approveTeamJobDescription(employeeId, data) {
    try {
      const response = await api.post(`/employees/${employeeId}/approve_team_job_description/`, data);
      return response.data;
    } catch (error) {
      console.error('Error approving team job description:', error);
      throw error;
    }
  }

  async rejectJobDescriptionFromEmployee(employeeId, data) {
    try {
      const response = await api.post(`/employees/${employeeId}/reject_job_description/`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting job description from employee:', error);
      throw error;
    }
  }

  // ========================================
  // PENDING APPROVALS
  // ========================================

  async getPendingApprovals() {
    try {
      const response = await api.get('/job-descriptions/pending_approvals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  // ========================================
  // JOB DESCRIPTION STATISTICS
  // ========================================

  async getJobDescriptionStats() {
    try {
      const response = await api.get('/job-description/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching job description stats:', error);
      throw error;
    }
  }

  // ========================================
  // SUPPORTING DATA (DROPDOWN OPTIONS)
  // ========================================

  async getAccessMatrix(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      
      const response = await api.get(`/job-description/access-matrix/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching access matrix:', error);
      throw error;
    }
  }

  async getBusinessResources(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      
      const response = await api.get(`/job-description/business-resources/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business resources:', error);
      throw error;
    }
  }

  async getCompanyBenefits(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      
      const response = await api.get(`/job-description/company-benefits/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company benefits:', error);
      throw error;
    }
  }

  // ========================================
  // DEPARTMENT-UNIT VALIDATION HELPERS (COMPLETELY FIXED)
  // ========================================

  /**
   * Get units that belong to a specific department
   * FIXED: Use client-side filtering with all units data
   */
  getUnitsForDepartment(departmentId, allUnits) {
    try {
      console.log('🔍 Filtering units for department:', departmentId);
      console.log('📦 All available units:', allUnits);
      
      if (!departmentId || !allUnits || !Array.isArray(allUnits)) {
        console.log('❌ Invalid inputs for unit filtering');
        return { results: [], count: 0 };
      }

      // Filter units by department ID from already loaded data
      const departmentUnits = allUnits.filter(unit => 
        unit.department === parseInt(departmentId)
      );
      
      console.log(`✅ Found ${departmentUnits.length} units for department ${departmentId}:`, departmentUnits);
      
      return {
        results: departmentUnits,
        count: departmentUnits.length
      };
    } catch (error) {
      console.error('❌ Error filtering units for department:', error);
      return { results: [], count: 0 };
    }
  }

  /**
   * Validate if a unit belongs to a department
   * FIXED: Use client-side validation with already loaded data
   */
  validateUnitDepartment(unitId, departmentId, allUnits) {
    try {
      console.log('🔍 Validating unit-department relationship:', { unitId, departmentId });
      
      if (!unitId || !departmentId || !allUnits) {
        console.log('❌ Missing parameters for unit validation');
        return true; // Allow if no unit selected
      }

      const unitsForDept = this.getUnitsForDepartment(departmentId, allUnits);
      const departmentUnits = unitsForDept.results || [];
      
      const isValid = departmentUnits.some(unit => unit.id === parseInt(unitId));
      
      console.log(`${isValid ? '✅' : '❌'} Unit ${unitId} ${isValid ? 'belongs to' : 'does not belong to'} department ${departmentId}`);
      
      return isValid;
    } catch (error) {
      console.error('❌ Error validating unit-department relationship:', error);
      return false;
    }
  }

  // ========================================
  // LEGACY HELPER METHODS (kept for backward compatibility)
  // ========================================

  prepareJobDescriptionData(formData) {
    console.log('⚠️  Using legacy prepareJobDescriptionData method. Consider using the new cleanJobDescriptionData method.');
    
    const apiData = {
      job_title: formData.job_title,
      job_purpose: formData.job_purpose,
      business_function: formData.business_function,
      department: formData.department,
      position_group: formData.position_group,
      grading_level: formData.grading_level,
      reports_to: formData.reports_to || null,
      assigned_employee: formData.assigned_employee || null,
      manual_employee_name: formData.manual_employee_name || '',
      manual_employee_phone: formData.manual_employee_phone || '',
      sections: [],
      required_skills_data: formData.required_skills_data || [],
      behavioral_competencies_data: formData.behavioral_competencies_data || [],
      business_resources_ids: formData.business_resources_ids || [],
      access_rights_ids: formData.access_rights_ids || [],
      company_benefits_ids: formData.company_benefits_ids || []
    };

    // CRITICAL FIX: Only include unit if it has a value
    if (formData.unit && parseInt(formData.unit)) {
      apiData.unit = formData.unit;
    }

    // Process sections
    const sectionTypes = [
      { type: 'CRITICAL_DUTIES', title: 'Critical Duties', content: formData.criticalDuties },
      { type: 'POSITION_MAIN_KPIS', title: 'Position Main KPIs', content: formData.positionMainKpis },
      { type: 'JOB_DUTIES', title: 'Job Duties', content: formData.jobDuties },
      { type: 'REQUIREMENTS', title: 'Requirements', content: formData.requirements }
    ];

    sectionTypes.forEach((section, index) => {
      if (section.content && Array.isArray(section.content) && section.content.length > 0) {
        const validContent = section.content.filter(item => item && item.trim() !== '');
        if (validContent.length > 0) {
          apiData.sections.push({
            section_type: section.type,
            title: section.title,
            content: validContent.map(item => `• ${item.trim()}`).join('\n'),
            order: index + 1
          });
        }
      }
    });

    return apiData;
  }

  transformJobDescriptionResponse(apiData) {
    const sections = {
      criticalDuties: [],
      positionMainKpis: [],
      jobDuties: [],
      requirements: []
    };

    // Process sections
    if (apiData.sections) {
      apiData.sections.forEach(section => {
        const content = section.content.split('\n• ').filter(item => item.trim());
        
        switch (section.section_type) {
          case 'CRITICAL_DUTIES':
            sections.criticalDuties = content;
            break;
          case 'POSITION_MAIN_KPIS':
            sections.positionMainKpis = content;
            break;
          case 'JOB_DUTIES':
            sections.jobDuties = content;
            break;
          case 'REQUIREMENTS':
            sections.requirements = content;
            break;
        }
      });
    }

    return {
      id: apiData.id,
      job_title: apiData.job_title,
      job_purpose: apiData.job_purpose,
      business_function: apiData.business_function?.id,
      business_function_name: apiData.business_function?.name,
      department: apiData.department?.id,
      department_name: apiData.department?.name,
      unit: apiData.unit?.id,
      unit_name: apiData.unit?.name,
      position_group: apiData.position_group?.id,
      position_group_name: apiData.position_group?.name,
      grading_level: apiData.grading_level,
      reports_to: apiData.reports_to?.id,
      reports_to_name: apiData.reports_to?.full_name,
      assigned_employee: apiData.assigned_employee?.id,
      assigned_employee_name: apiData.assigned_employee?.full_name,
      manual_employee_name: apiData.manual_employee_name,
      manual_employee_phone: apiData.manual_employee_phone,
      status: apiData.status,
      status_display: apiData.status_display,
      version: apiData.version,
      created_at: apiData.created_at,
      updated_at: apiData.updated_at,
      ...sections,
      required_skills_data: (apiData.required_skills || []).map(skill => skill.skill?.id || skill.id),
      behavioral_competencies_data: (apiData.behavioral_competencies || []).map(comp => comp.competency?.id || comp.id),
      business_resources_ids: (apiData.business_resources || []).map(res => res.id),
      access_rights_ids: (apiData.access_rights || []).map(access => access.id),
      company_benefits_ids: (apiData.company_benefits || []).map(benefit => benefit.id),
      line_manager_approved: !!apiData.line_manager_approved_at,
      employee_approved: !!apiData.employee_approved_at,
      line_manager_comments: apiData.line_manager_comments,
      employee_comments: apiData.employee_comments
    };
  }
}

// Create and export singleton instance
const jobDescriptionService = new JobDescriptionService();
export default jobDescriptionService;