// services/jobDescriptionService.js - Complete API Integration with All Methods
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
 * Job Description Service - Complete API Integration
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
    if (!data.job_function) {
      errors.push('job_function is required');
    }
    if (!data.position_group) {
      errors.push('position_group is required');
    }
    
    // Employee validation - either assigned_employee OR manual employee info
    const hasAssignedEmployee = data.assigned_employee;
    const hasManualEmployee = data.manual_employee_name?.trim();
    
    if (!hasAssignedEmployee && !hasManualEmployee) {
      console.log('ℹ️ No employee assigned - this will be a vacant position');
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
      job_function: parseInt(data.job_function) || null,
      position_group: parseInt(data.position_group) || null,
      
      // Optional ID fields
      grading_level: data.grading_level?.trim() || null,
      reports_to: data.reports_to ? parseInt(data.reports_to) : null,
      assigned_employee: data.assigned_employee ? parseInt(data.assigned_employee) : null,
      
      // Manual employee fields
      manual_employee_name: data.manual_employee_name?.trim() || '',
      manual_employee_phone: data.manual_employee_phone?.trim() || '',
      
      // Arrays
      sections: Array.isArray(data.sections) ? data.sections : [],
      required_skills_data: Array.isArray(data.required_skills_data) ? data.required_skills_data : [],
      behavioral_competencies_data: Array.isArray(data.behavioral_competencies_data) ? data.behavioral_competencies_data : [],
      business_resources_ids: Array.isArray(data.business_resources_ids) ? data.business_resources_ids.map(id => parseInt(id)).filter(id => !isNaN(id)) : [],
      access_rights_ids: Array.isArray(data.access_rights_ids) ? data.access_rights_ids.map(id => parseInt(id)).filter(id => !isNaN(id)) : [],
      company_benefits_ids: Array.isArray(data.company_benefits_ids) ? data.company_benefits_ids.map(id => parseInt(id)).filter(id => !isNaN(id)) : []
    };
    
    // Only include unit if it has a valid value
    if (data.unit && parseInt(data.unit)) {
      cleaned.unit = parseInt(data.unit);
    }
    
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
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
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
      
      const response = await api.post('/job-descriptions/', cleanedData);
      
      console.log('✅ API Response success:', response.status);
      console.log('3. Response data:', JSON.stringify(response.data, null, 2));
      console.log('=== END DEBUG ===');
      
      return response.data;
    } catch (error) {
      console.log('=== ERROR DEBUG ===');
      console.error('❌ Full error object:', error);
      
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data && typeof error.response.data === 'object') {
          console.error('❌ API validation errors:');
          Object.keys(error.response.data).forEach(field => {
            console.error(`  - ${field}: ${error.response.data[field]}`);
          });
        }
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
      
      const validationErrors = this.validateJobDescriptionData(data);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
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
  // JOB DESCRIPTION WORKFLOW ENDPOINTS
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

  async approveByLineManager(id, data = {}) {
    try {
      console.log('=== APPROVE BY LINE MANAGER ===');
      console.log('Job ID:', id);
      console.log('Input approval data:', JSON.stringify(data, null, 2));
      
      const approvalData = {
        comments: data.comments?.trim() || ''
      };
      
      console.log('Cleaned approval data:', JSON.stringify(approvalData, null, 2));
      
      const response = await api.post(`/job-descriptions/${id}/approve_by_line_manager/`, approvalData);
      console.log('✅ Line manager approval successful:', response.status);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error approving as line manager:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async approveAsEmployee(id, data = {}) {
    try {
      console.log('=== APPROVE AS EMPLOYEE ===');
      console.log('Job ID:', id);
      console.log('Input approval data:', JSON.stringify(data, null, 2));
      
      const approvalData = {
        comments: data.comments?.trim() || ''
      };
      
      console.log('Cleaned approval data:', JSON.stringify(approvalData, null, 2));
      
      const response = await api.post(`/job-descriptions/${id}/approve_as_employee/`, approvalData);
      console.log('✅ Employee approval successful:', response.status);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error approving as employee:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async rejectJobDescription(id, data = {}) {
    try {
      console.log('=== REJECT JOB DESCRIPTION ===');
      console.log('Job ID:', id);
      console.log('Input rejection data:', JSON.stringify(data, null, 2));
      
      const rejectionData = {
        reason: data.reason?.trim() || data.comments?.trim() || ''
      };
      
      if (!rejectionData.reason) {
        throw new Error('Reason for rejection is required');
      }
      
      console.log('Cleaned rejection data:', JSON.stringify(rejectionData, null, 2));
      
      const response = await api.post(`/job-descriptions/${id}/reject/`, rejectionData);
      console.log('✅ Rejection successful:', response.status);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error rejecting job description:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async requestRevision(id, data) {
    try {
      console.log('=== REQUEST REVISION ===');
      console.log('Job ID:', id);
      console.log('Revision data:', JSON.stringify(data, null, 2));
      
      const response = await api.post(`/job-descriptions/${id}/request_revision/`, data);
      console.log('✅ Revision request successful');
      return response.data;
    } catch (error) {
      console.error('Error requesting revision:', error);
      if (error.response) {
        console.error('API Error Details:', error.response.data);
      }
      throw error;
    }
  }

  // ========================================
  // EMPLOYEE RELATED JOB DESCRIPTIONS
  // ========================================

  async getEmployeeJobDescriptions(employeeId) {
    try {
      console.log('📋 Fetching job descriptions for employee:', employeeId);
      const response = await api.get(`/employees/${employeeId}/job_descriptions/`);
      console.log('📋 Employee job descriptions response:', response.data);
      
      // Return the job_descriptions array from the response
      return response.data.job_descriptions || [];
    } catch (error) {
      console.error('Error fetching employee job descriptions:', error);
      throw error;
    }
  }

  async getTeamJobDescriptions(managerId) {
    try {
      console.log('👥 Fetching team job descriptions for manager:', managerId);
      const response = await api.get(`/employees/${managerId}/team_job_descriptions/`);
      console.log('👥 Team job descriptions response:', response.data);
      
      // The API might return different structures, handle them all
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.team_job_descriptions) {
        return response.data.team_job_descriptions;
      } else if (response.data.results) {
        return response.data.results;
      } else {
        // If it's an object, try to find an array property
        const teamJobs = Object.values(response.data).find(value => Array.isArray(value)) || [];
        return teamJobs;
      }
    } catch (error) {
      console.error('Error fetching team job descriptions:', error);
      throw error;
    }
  }

  // ========================================
  // JOB DESCRIPTION ACTIVITY AND HISTORY
  // ========================================

  async getJobDescriptionActivities(id) {
    try {
      const response = await api.get(`/job-descriptions/${id}/activities/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job description activities:', error);
      throw error;
    }
  }

  // ========================================
  // PDF EXPORT FUNCTIONALITY
  // ========================================

  async downloadJobDescriptionPDF(id) {
    try {
      console.log('📄 Downloading PDF for job description:', id);
      const response = await api.get(`/job-descriptions/${id}/download_pdf/`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `job-description-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ PDF download successful');
      return response.data;
    } catch (error) {
      console.error('Error downloading job description PDF:', error);
      throw error;
    }
  }

  async exportBulkJobDescriptionsPDF(jobDescriptionIds) {
    try {
      console.log('📤 Exporting bulk PDFs for job IDs:', jobDescriptionIds);
      
      // The API expects: {"job_description_ids": ["uuid1", "uuid2", ...]}
      const response = await api.post('/job-descriptions/export-bulk-pdf/', {
        job_description_ids: jobDescriptionIds
      }, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `bulk_job_descriptions_${timestamp}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Bulk PDF export completed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error exporting bulk PDFs:', error);
      
      // Enhanced error handling
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 500) {
          throw new Error('Server error occurred while generating PDF. Please try again or contact support.');
        } else if (error.response.status === 400) {
          throw new Error('Invalid job description IDs provided. Please refresh the page and try again.');
        } else if (error.response.status === 404) {
          throw new Error('Export service not found. Please contact support.');
        }
      }
      
      throw error;
    }
  }

  // ========================================
  // NEW: EXPORT ALL JOB DESCRIPTIONS AS PDF
  // ========================================
  
  async exportAllJobDescriptionsPDF() {
    try {
      console.log('📤 Exporting ALL job descriptions as PDF...');
      
      // Send the complex object structure as per API documentation
      const exportData = {
        job_title: "string",
        job_purpose: "stringstringstringstringstringstringstringstringst",
        grading_level: "string",
        version: 2147483647,
        is_active: true,
        business_function: {
          name: "string",
          code: "string"
        },
        department: {
          name: "string",
          business_function: {
            name: "string",
            code: "string"
          }
        },
        unit: {
          name: "string",
          department: {
            name: "string",
            business_function: {
              name: "string",
              code: "string"
            }
          }
        },
        job_function: {
          name: "string"
        },
        position_group: {
          name: "VC",
          hierarchy_level: 2147483647
        },
        reports_to: {
          employee_id: "string",
          job_title: "string"
        },
        assigned_employee: {
          employee_id: "string",
          job_title: "string"
        },
        manual_employee_name: "string",
        manual_employee_phone: "string",
        status: "DRAFT"
      };
      
      const response = await api.post('/job-descriptions/export-bulk-pdf/', exportData, {
        responseType: 'blob',
        timeout: 120000  // 2 minutes timeout for large exports
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `all_job_descriptions_${timestamp}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ All PDFs export completed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error exporting all PDFs:', error);
      
      // Enhanced error handling
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 500) {
          throw new Error('Server error occurred while generating PDF. This might be due to a large number of job descriptions. Please try exporting in smaller batches or contact support.');
        } else if (error.response.status === 404) {
          throw new Error('Export service not found. Please contact support.');
        } else if (error.response.status === 403) {
          throw new Error('You do not have permission to export all job descriptions.');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Export is taking too long. Please try exporting in smaller batches.');
      }
      
      throw error;
    }
  }

  // ========================================
  // SUPPORTING DATA ENDPOINTS - ACCESS MATRIX
  // ========================================

  async getAccessMatrix(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      const response = await api.get(`/job-description/access-matrix/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching access matrix:', error);
      throw error;
    }
  }

  async getAccessMatrixById(id) {
    try {
      const response = await api.get(`/job-description/access-matrix/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching access matrix item:', error);
      throw error;
    }
  }

  async createAccessMatrix(data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post('/job-description/access-matrix/', cleanData);
      return response.data;
    } catch (error) {
      console.error('Error creating access matrix:', error);
      throw error;
    }
  }

  async updateAccessMatrix(id, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/access-matrix/${id}/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating access matrix:', error);
      throw error;
    }
  }

  async deleteAccessMatrix(id) {
    try {
      const response = await api.delete(`/job-description/access-matrix/${id}/`);
      return response;
    } catch (error) {
      console.error('Error deleting access matrix:', error);
      throw error;
    }
  }

  // ========================================
  // SUPPORTING DATA ENDPOINTS - BUSINESS RESOURCES
  // ========================================

  async getBusinessResources(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      const response = await api.get(`/job-description/business-resources/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business resources:', error);
      throw error;
    }
  }

  async getBusinessResourceById(id) {
    try {
      const response = await api.get(`/job-description/business-resources/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business resource:', error);
      throw error;
    }
  }

  async createBusinessResource(data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post('/job-description/business-resources/', cleanData);
      return response.data;
    } catch (error) {
      console.error('Error creating business resource:', error);
      throw error;
    }
  }

  async updateBusinessResource(id, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/business-resources/${id}/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating business resource:', error);
      throw error;
    }
  }

  async deleteBusinessResource(id) {
    try {
      const response = await api.delete(`/job-description/business-resources/${id}/`);
      return response;
    } catch (error) {
      console.error('Error deleting business resource:', error);
      throw error;
    }
  }

  // ========================================
  // SUPPORTING DATA ENDPOINTS - COMPANY BENEFITS
  // ========================================

  async getCompanyBenefits(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      const response = await api.get(`/job-description/company-benefits/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company benefits:', error);
      throw error;
    }
  }

  async getCompanyBenefitById(id) {
    try {
      const response = await api.get(`/job-description/company-benefits/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company benefit:', error);
      throw error;
    }
  }

  async createCompanyBenefit(data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post('/job-description/company-benefits/', cleanData);
      return response.data;
    } catch (error) {
      console.error('Error creating company benefit:', error);
      throw error;
    }
  }

  async updateCompanyBenefit(id, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/company-benefits/${id}/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating company benefit:', error);
      throw error;
    }
  }

  async deleteCompanyBenefit(id) {
    try {
      const response = await api.delete(`/job-description/company-benefits/${id}/`);
      return response;
    } catch (error) {
      console.error('Error deleting company benefit:', error);
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
  // EMPLOYEE HELPERS
  // ========================================

  async getEmployeeManager(employeeId) {
    try {
      const response = await api.get(`/employees/${employeeId}/`);
      const employee = response.data;
      
      if (employee.line_manager_detail) {
        return {
          id: employee.line_manager_detail.id,
          name: employee.line_manager_detail.name || employee.line_manager_detail.full_name,
          employee_id: employee.line_manager_detail.employee_id,
          job_title: employee.line_manager_detail.job_title
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching employee manager:', error);
      return null;
    }
  }

  async validateEmployeeStructure(employeeId, businessFunction, department, unit = null) {
    try {
      const response = await api.get(`/employees/${employeeId}/`);
      const employee = response.data;
      
      const validations = {
        business_function: employee.business_function === parseInt(businessFunction),
        department: employee.department === parseInt(department),
        unit: unit ? employee.unit === parseInt(unit) : true
      };
      
      return {
        isValid: Object.values(validations).every(v => v),
        validations,
        employee_structure: {
          business_function: employee.business_function_detail?.name,
          department: employee.department_detail?.name,
          unit: employee.unit_detail?.name
        }
      };
    } catch (error) {
      console.error('Error validating employee structure:', error);
      return { isValid: false, error: error.message };
    }
  }

  // ========================================
  // DEPARTMENT-UNIT VALIDATION HELPERS
  // ========================================

  getUnitsForDepartment(departmentId, allUnits) {
    try {
      console.log('🔍 Filtering units for department:', departmentId);
      
      if (!departmentId || !allUnits || !Array.isArray(allUnits)) {
        return { results: [], count: 0 };
      }

      const departmentUnits = allUnits.filter(unit => 
        unit.department === parseInt(departmentId)
      );
      
      console.log(`✅ Found ${departmentUnits.length} units for department ${departmentId}`);
      
      return {
        results: departmentUnits,
        count: departmentUnits.length
      };
    } catch (error) {
      console.error('❌ Error filtering units for department:', error);
      return { results: [], count: 0 };
    }
  }

  validateUnitDepartment(unitId, departmentId, allUnits) {
    try {
      if (!unitId || !departmentId || !allUnits) {
        return true;
      }

      const unitsForDept = this.getUnitsForDepartment(departmentId, allUnits);
      const isValid = unitsForDept.results.some(unit => unit.id === parseInt(unitId));
      
      console.log(`${isValid ? '✅' : '❌'} Unit ${unitId} ${isValid ? 'belongs to' : 'does not belong to'} department ${departmentId}`);
      
      return isValid;
    } catch (error) {
      console.error('❌ Error validating unit-department relationship:', error);
      return false;
    }
  }

  // ========================================
  // PERMISSION UTILITIES - CLIENT-SIDE LOGIC
  // ========================================

canApproveAsLineManager(jobDescription) {
    // Everyone can approve if status is correct
    const validStatuses = ['PENDING_LINE_MANAGER', 'PENDING_APPROVAL'];
    return validStatuses.includes(jobDescription.status);
  }

  canApproveAsEmployee(jobDescription) {
    // Everyone can approve if status is correct
    return jobDescription.status === 'PENDING_EMPLOYEE';
  }

  canReject(jobDescription) {
    // Everyone can reject if status allows
    const validStatuses = ['PENDING_LINE_MANAGER', 'PENDING_EMPLOYEE', 'PENDING_APPROVAL'];
    return validStatuses.includes(jobDescription.status);
  }

  // ========================================
  // STATUS UTILITIES
  // ========================================

  getStatusInfo(status) {
    const statusMap = {
      'DRAFT': {
        label: 'Draft',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        darkBgColor: '#374151',
        description: 'Job description is being prepared'
      },
      'PENDING_LINE_MANAGER': {
        label: 'Pending Line Manager Approval',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        darkBgColor: '#92400E',
        description: 'Waiting for line manager approval'
      },
      'PENDING_EMPLOYEE': {
        label: 'Pending Employee Approval',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        darkBgColor: '#1E40AF',
        description: 'Waiting for employee approval'
      },
      'APPROVED': {
        label: 'Approved',
        color: '#10B981',
        bgColor: '#D1FAE5',
        darkBgColor: '#047857',
        description: 'Job description is fully approved'
      },
      'ACTIVE': {
        label: 'Active',
        color: '#10B981',
        bgColor: '#D1FAE5',
        darkBgColor: '#047857',
        description: 'Job description is active and in use'
      },
      'REJECTED': {
        label: 'Rejected',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        darkBgColor: '#DC2626',
        description: 'Job description has been rejected'
      },
      'REVISION_REQUIRED': {
        label: 'Revision Required',
        color: '#F97316',
        bgColor: '#FED7AA',
        darkBgColor: '#EA580C',
        description: 'Job description needs revision'
      }
    };

    return statusMap[status] || statusMap['DRAFT'];
  }

  getUrgencyInfo(jobDescription) {
    if (!jobDescription.created_at) return { level: 'normal', label: 'Normal', color: '#6B7280' };
    
    const createdDate = new Date(jobDescription.created_at);
    const now = new Date();
    const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 7) {
      return { level: 'high', label: 'Urgent', color: '#EF4444' };
    } else if (daysDiff >= 3) {
      return { level: 'medium', label: 'Medium Priority', color: '#F59E0B' };
    }
    
    return { level: 'normal', label: 'Normal', color: '#6B7280' };
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });
    } catch (error) {
      return "Invalid Date";
    }
  }

  /**
   * Calculate days since creation
   */
  getDaysSinceCreation(dateString) {
    if (!dateString) return 0;
    try {
      const createdDate = new Date(dateString);
      const now = new Date();
      return Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get display name for employee info
   */
  getEmployeeDisplayName(jobDescription) {
    if (jobDescription.employee_info?.name) {
      return jobDescription.employee_info.name;
    }
    if (jobDescription.assigned_employee?.full_name) {
      return jobDescription.assigned_employee.full_name;
    }
    if (jobDescription.manual_employee_name) {
      return jobDescription.manual_employee_name;
    }
    return 'Vacant Position';
  }

  /**
   * Check if position is vacant
   */
  isVacantPosition(jobDescription) {
    return !jobDescription.employee_info?.id && 
           !jobDescription.assigned_employee?.id && 
           !jobDescription.manual_employee_name?.trim();
  }

  /**
   * Get next action required for job description
   */
  getNextAction(jobDescription) {
    switch (jobDescription.status) {
      case 'DRAFT':
        return 'Submit for approval';
      case 'PENDING_LINE_MANAGER':
        return 'Awaiting line manager approval';
      case 'PENDING_EMPLOYEE':
        return 'Awaiting employee approval';
      case 'APPROVED':
      case 'ACTIVE':
        return 'No action required';
      case 'REJECTED':
        return 'Review and resubmit';
      case 'REVISION_REQUIRED':
        return 'Make required revisions';
      default:
        return 'Unknown status';
    }
  }

  /**
   * Filter and search job descriptions
   */
  filterJobDescriptions(jobDescriptions, filters) {
    if (!Array.isArray(jobDescriptions)) return [];
    
    let filtered = [...jobDescriptions];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.job_title?.toLowerCase().includes(searchTerm) ||
        this.getEmployeeDisplayName(job).toLowerCase().includes(searchTerm) ||
        job.business_function?.toLowerCase().includes(searchTerm) ||
        job.department?.toLowerCase().includes(searchTerm) ||
        job.job_function?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(job => 
        job.department === filters.department || 
        job.department_name === filters.department
      );
    }

    // Business function filter
    if (filters.businessFunction) {
      filtered = filtered.filter(job => 
        job.business_function === filters.businessFunction || 
        job.business_function_name === filters.businessFunction
      );
    }

    // Urgency filter
    if (filters.urgency) {
      filtered = filtered.filter(job => {
        const urgency = this.getUrgencyInfo(job);
        return urgency.level === filters.urgency;
      });
    }

    // Vacant positions filter
    if (filters.vacantOnly) {
      filtered = filtered.filter(job => this.isVacantPosition(job));
    }

    // Pending approvals filter
    if (filters.pendingOnly) {
      filtered = filtered.filter(job => 
        job.status === 'PENDING_LINE_MANAGER' || 
        job.status === 'PENDING_EMPLOYEE'
      );
    }

    return filtered;
  }

  /**
   * Sort job descriptions
   */
  sortJobDescriptions(jobDescriptions, sortBy, sortOrder = 'asc') {
    if (!Array.isArray(jobDescriptions)) return [];
    
    const sorted = [...jobDescriptions].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'job_title':
          aValue = a.job_title || '';
          bValue = b.job_title || '';
          break;
        case 'employee_name':
          aValue = this.getEmployeeDisplayName(a);
          bValue = this.getEmployeeDisplayName(b);
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'department':
          aValue = a.department || a.department_name || '';
          bValue = b.department || b.department_name || '';
          break;
        case 'urgency':
          const urgencyA = this.getUrgencyInfo(a);
          const urgencyB = this.getUrgencyInfo(b);
          const urgencyOrder = { 'high': 3, 'medium': 2, 'normal': 1 };
          aValue = urgencyOrder[urgencyA.level] || 0;
          bValue = urgencyOrder[urgencyB.level] || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  /**
   * Get unique values for filters
   */
  getUniqueFilterValues(jobDescriptions, field) {
    if (!Array.isArray(jobDescriptions)) return [];
    
    const values = new Set();
    
    jobDescriptions.forEach(job => {
      let value;
      switch (field) {
        case 'status':
          value = job.status;
          break;
        case 'department':
          value = job.department || job.department_name;
          break;
        case 'business_function':
          value = job.business_function || job.business_function_name;
          break;
        case 'job_function':
          value = job.job_function || job.job_function_name;
          break;
        default:
          value = job[field];
      }
      
      if (value) values.add(value);
    });
    
    return Array.from(values).sort();
  }

  /**
   * Paginate job descriptions
   */
  paginateJobDescriptions(jobDescriptions, page = 1, itemsPerPage = 10) {
    if (!Array.isArray(jobDescriptions)) return { items: [], totalPages: 0, totalItems: 0 };
    
    const totalItems = jobDescriptions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = jobDescriptions.slice(startIndex, endIndex);
    
    return {
      items,
      totalPages,
      totalItems,
      currentPage: page,
      itemsPerPage,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  // ========================================
  // LEGACY SUPPORT METHODS
  // ========================================

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
          case 'MAIN_KPIS':
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
      job_function: apiData.job_function?.id,
      job_function_name: apiData.job_function?.name,
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