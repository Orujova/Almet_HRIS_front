// services/jobDescriptionService.js - COMPLETE API Integration with Item Management
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
       
      });
    }
    
    // Competencies validation
    if (data.behavioral_competencies_data && Array.isArray(data.behavioral_competencies_data)) {
      data.behavioral_competencies_data.forEach((comp, index) => {
        if (!comp.competency_id) {
          errors.push(`Behavioral competency ${index + 1}: competency_id is required`);
        }
       
      });
    }
    
    return errors;
  }
  
  // FIXED cleanJobDescriptionData in jobDescriptionService.js
// Replace the existing cleanJobDescriptionData function with this version

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
    ...(data.grading_levels && Array.isArray(data.grading_levels) && data.grading_levels.length > 0 && {
      grading_levels: data.grading_levels
        .map(level => level?.trim())
        .filter(level => level && level.length > 0)
    }),
    
    // 🔥 Fallback: Convert single grading_level to array if grading_levels not provided
    ...((!data.grading_levels || data.grading_levels.length === 0) && 
        data.grading_level && data.grading_level.trim() && {
      grading_levels: [data.grading_level.trim()]
    }),
    
    // Employee selection support
    selected_employee_ids: Array.isArray(data.selected_employee_ids) 
      ? data.selected_employee_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
      : [],
    
    // Arrays
    sections: Array.isArray(data.sections) ? data.sections : [],
    required_skills_data: Array.isArray(data.required_skills_data) ? data.required_skills_data : [],
    behavioral_competencies_data: Array.isArray(data.behavioral_competencies_data) ? data.behavioral_competencies_data : []
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
  })).filter(skill => skill.skill_id && !isNaN(skill.skill_id));
  
  // Clean competencies data
  cleaned.behavioral_competencies_data = cleaned.behavioral_competencies_data.map(comp => ({
    competency_id: parseInt(comp.competency_id),
  })).filter(comp => comp.competency_id && !isNaN(comp.competency_id));
  
  // ✅ FIX: Handle both _ids and _with_items formats for resources
  // Business Resources
  if (data.business_resources_with_items && Array.isArray(data.business_resources_with_items)) {
    cleaned.business_resources_with_items = data.business_resources_with_items.map(item => ({
      resource_id: parseInt(item.resource_id),
      item_ids: Array.isArray(item.item_ids) 
        ? item.item_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
        : []
    })).filter(item => !isNaN(item.resource_id));
  } else if (data.business_resources_ids && Array.isArray(data.business_resources_ids)) {
    cleaned.business_resources_ids = data.business_resources_ids
      .map(id => parseInt(id))
      .filter(id => !isNaN(id));
  }
  
  // Access Rights
  if (data.access_rights_with_items && Array.isArray(data.access_rights_with_items)) {
    cleaned.access_rights_with_items = data.access_rights_with_items.map(item => ({
      access_matrix_id: parseInt(item.access_matrix_id),
      item_ids: Array.isArray(item.item_ids) 
        ? item.item_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
        : []
    })).filter(item => !isNaN(item.access_matrix_id));
  } else if (data.access_rights_ids && Array.isArray(data.access_rights_ids)) {
    cleaned.access_rights_ids = data.access_rights_ids
      .map(id => parseInt(id))
      .filter(id => !isNaN(id));
  }
  
  // Company Benefits
  if (data.company_benefits_with_items && Array.isArray(data.company_benefits_with_items)) {
    cleaned.company_benefits_with_items = data.company_benefits_with_items.map(item => ({
      benefit_id: parseInt(item.benefit_id),
      item_ids: Array.isArray(item.item_ids) 
        ? item.item_ids.map(id => parseInt(id)).filter(id => !isNaN(id))
        : []
    })).filter(item => !isNaN(item.benefit_id));
  } else if (data.company_benefits_ids && Array.isArray(data.company_benefits_ids)) {
    cleaned.company_benefits_ids = data.company_benefits_ids
      .map(id => parseInt(id))
      .filter(id => !isNaN(id));
  }
  

  
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

  async previewEligibleEmployees(criteria) {
    try {
    
      
      if (!criteria.job_title || !criteria.business_function || !criteria.department || 
          !criteria.job_function || !criteria.position_group) {
        throw new Error('Missing required criteria fields');
      }

      const cleanedCriteria = {
        job_title: criteria.job_title?.trim(),
        business_function: parseInt(criteria.business_function),
        department: parseInt(criteria.department),
        job_function: parseInt(criteria.job_function),
        position_group: parseInt(criteria.position_group),
       
      // 🔥 UPDATED: Handle grading_levels array
      ...(criteria.grading_levels && Array.isArray(criteria.grading_levels) && criteria.grading_levels.length > 0 && {
        grading_levels: criteria.grading_levels.map(level => level?.trim()).filter(Boolean)
      }),
      
      // 🔥 Fallback: Single grading_level to array
      ...((!criteria.grading_levels || criteria.grading_levels.length === 0) && 
          criteria.grading_level && criteria.grading_level.trim() && {
        grading_levels: [criteria.grading_level.trim()]
      }),
        max_preview: criteria.max_preview || 50,
        include_vacancies: true
      };

      if (criteria.unit && parseInt(criteria.unit)) {
        cleanedCriteria.unit = parseInt(criteria.unit);
      } else {
        cleanedCriteria.unit = null;
      }

      Object.keys(cleanedCriteria).forEach(key => {
        if (cleanedCriteria[key] === null || cleanedCriteria[key] === undefined || 
            cleanedCriteria[key] === '' || (typeof cleanedCriteria[key] === 'number' && isNaN(cleanedCriteria[key]))) {
          delete cleanedCriteria[key];
        }
      });

     
      
      const response = await api.post('/job-descriptions/preview_eligible_employees/', cleanedCriteria);
      
     
      return response.data;
    } catch (error) {
      console.error('❌ Error previewing eligible employees:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;

        
        let errorMessage = 'Invalid request parameters';
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData)) {
          errorMessage = errorData.join(', ');
        } else if (typeof errorData === 'object') {
          const fieldErrors = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors.push(`${field}: ${errorData[field].join(', ')}`);
            } else {
              fieldErrors.push(`${field}: ${errorData[field]}`);
            }
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          }
        }
        
        throw new Error(`Preview request failed: ${errorMessage}`);
      }
      
      throw error;
    }
  }

  async createJobDescription(data) {
    try {
  
      
      const validationErrors = this.validateJobDescriptionData(data);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const cleanedData = this.cleanJobDescriptionData(data);
    
      
      const response = await api.post('/job-descriptions/', cleanedData);
      
    
      return response.data;
    } catch (error) {

      
      if (error.response?.status === 422 && error.response.data?.requires_employee_selection) {
      
        throw {
          requiresEmployeeSelection: true,
          eligibleEmployees: error.response.data.eligible_employees,
          message: error.response.data.message,
          eligibleCount: error.response.data.eligible_count,
          originalData: data
        };
      }
      
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
      }
      console.log('=== END CREATE ERROR DEBUG ===');
      
      throw error;
    }
  }

  async updateJobDescription(id, data) {
    try {
   
      
      const validationErrors = this.validateJobDescriptionData(data);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      const cleanedData = this.cleanJobDescriptionData(data);
    
      
      const response = await api.put(`/job-descriptions/${id}/`, cleanedData);
    
      
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
   
      
      const response = await api.post(`/job-descriptions/${id}/submit_for_approval/`, data);
    
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
   
      
      const approvalData = {
        comments: data.comments?.trim() || ''
      };
      

      
      const response = await api.post(`/job-descriptions/${id}/approve_by_line_manager/`, approvalData);

      
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
  
      
      const approvalData = {
        comments: data.comments?.trim() || ''
      };

      
      const response = await api.post(`/job-descriptions/${id}/approve_as_employee/`, approvalData);

      
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

      const rejectionData = {
        reason: data.reason?.trim() || data.comments?.trim() || ''
      };
      
      if (!rejectionData.reason) {
        throw new Error('Reason for rejection is required');
      }
      

      
      const response = await api.post(`/job-descriptions/${id}/reject/`, rejectionData);
   
      
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
    
      
      const response = await api.post(`/job-descriptions/${id}/request_revision/`, data);
   
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

      const response = await api.get(`/employees/${employeeId}/job_descriptions/`);
    
      
      return response.data.job_descriptions || [];
    } catch (error) {
      console.error('Error fetching employee job descriptions:', error);
      throw error;
    }
  }

  async getTeamJobDescriptions(managerId) {
    try {

      const response = await api.get(`/employees/${managerId}/team_job_descriptions/`);

      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.team_job_descriptions) {
        return response.data.team_job_descriptions;
      } else if (response.data.results) {
        return response.data.results;
      } else {
        const teamJobs = Object.values(response.data).find(value => Array.isArray(value)) || [];
        return teamJobs;
      }
    } catch (error) {
      console.error('Error fetching team job descriptions:', error);
      throw error;
    }
  }



  // ========================================
  // PDF EXPORT FUNCTIONALITY
  // ========================================

  async downloadJobDescriptionPDF(id) {
    try {

      const response = await api.get(`/job-descriptions/${id}/download_pdf/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `job-description-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
   
      return response.data;
    } catch (error) {
      console.error('Error downloading job description PDF:', error);
      throw error;
    }
  }

  async downloadMultipleJobDescriptionsPDF(jobIds) {
    try {
   
      
      const response = await api.post('/job-descriptions/download_multiple_pdfs/', {
        job_description_ids: jobIds
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `job-descriptions-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      

      return response.data;
    } catch (error) {
      console.error('Error downloading multiple job descriptions PDFs:', error);
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

  // ADDED: Access Matrix Item Management
  async getAccessMatrixItems(matrixId) {
    try {
      const response = await api.get(`/job-description/access-matrix/${matrixId}/items/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching access matrix items:', error);
      throw error;
    }
  }

  async addAccessMatrixItem(matrixId, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post(`/job-description/access-matrix/${matrixId}/add_item/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error adding access matrix item:', error);
      throw error;
    }
  }

  async updateAccessMatrixItem(matrixId, itemId, data) {
    try {
      const cleanData = {
        item_id: parseInt(itemId),
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/access-matrix/${matrixId}/update_item/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating access matrix item:', error);
      throw error;
    }
  }

  async deleteAccessMatrixItem(matrixId, itemId) {
    try {
      const response = await api.delete(`/job-description/access-matrix/${matrixId}/delete_item/`, {
        data: { item_id: parseInt(itemId) }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting access matrix item:', error);
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

  // ADDED: Business Resource Item Management
  async getBusinessResourceItems(resourceId) {
    try {
      const response = await api.get(`/job-description/business-resources/${resourceId}/items/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business resource items:', error);
      throw error;
    }
  }

  async addBusinessResourceItem(resourceId, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post(`/job-description/business-resources/${resourceId}/add_item/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error adding business resource item:', error);
      throw error;
    }
  }

  async updateBusinessResourceItem(resourceId, itemId, data) {
    try {
      const cleanData = {
        item_id: parseInt(itemId),
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/business-resources/${resourceId}/update_item/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating business resource item:', error);
      throw error;
    }
  }

  async deleteBusinessResourceItem(resourceId, itemId) {
    try {
      const response = await api.delete(`/job-description/business-resources/${resourceId}/delete_item/`, {
        data: { item_id: parseInt(itemId) }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting business resource item:', error);
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

  // ADDED: Company Benefit Item Management
  async getCompanyBenefitItems(benefitId) {
    try {
      const response = await api.get(`/job-description/company-benefits/${benefitId}/items/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company benefit items:', error);
      throw error;
    }
  }

  async addCompanyBenefitItem(benefitId, data) {
    try {
      const cleanData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.post(`/job-description/company-benefits/${benefitId}/add_item/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error adding company benefit item:', error);
      throw error;
    }
  }

  async updateCompanyBenefitItem(benefitId, itemId, data) {
    try {
      const cleanData = {
        item_id: parseInt(itemId),
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        is_active: Boolean(data.is_active !== false)
      };
      
      const response = await api.put(`/job-description/company-benefits/${benefitId}/update_item/`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating company benefit item:', error);
      throw error;
    }
  }

  async deleteCompanyBenefitItem(benefitId, itemId) {
    try {
      const response = await api.delete(`/job-description/company-benefits/${benefitId}/delete_item/`, {
        data: { item_id: parseInt(itemId) }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting company benefit item:', error);
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
 
      
      if (!departmentId || !allUnits || !Array.isArray(allUnits)) {
        return { results: [], count: 0 };
      }

      const departmentUnits = allUnits.filter(unit => 
        unit.department === parseInt(departmentId)
      );
      

      
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
    const validStatuses = ['PENDING_LINE_MANAGER', 'PENDING_APPROVAL'];
    return validStatuses.includes(jobDescription.status);
  }

  canApproveAsEmployee(jobDescription) {
    return jobDescription.status === 'PENDING_EMPLOYEE';
  }

  canReject(jobDescription) {
    const validStatuses = ['PENDING_LINE_MANAGER', 'PENDING_EMPLOYEE', 'PENDING_APPROVAL'];
    return validStatuses.includes(jobDescription.status);
  }

  canEdit(jobDescription) {
    const editableStatuses = ['DRAFT', 'REVISION_REQUIRED'];
    return editableStatuses.includes(jobDescription.status);
  }

  canDelete(jobDescription) {
    const deletableStatuses = ['DRAFT'];
    return deletableStatuses.includes(jobDescription.status);
  }

  canSubmitForApproval(jobDescription) {
    return jobDescription.status === 'DRAFT';
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

  formatDateTime(dateString) {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "Invalid Date";
    }
  }

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

  isVacantPosition(jobDescription) {
    return !jobDescription.employee_info?.id && 
           !jobDescription.assigned_employee?.id && 
           !jobDescription.manual_employee_name?.trim();
  }

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

  // ========================================
  // FILTERING AND SEARCHING UTILITIES
  // ========================================

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

    // Company filter
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
  if (!apiData) {
    return {
      job_title: '',
      job_purpose: '',
      business_function: '',
      department: '',
      unit: '',
      job_function: '',
      position_group: '',
      grading_level: '',
      criticalDuties: [''],
      positionMainKpis: [''],
      jobDuties: [''],
      requirements: [''],
      required_skills_data: [],
      behavioral_competencies_data: [],
      business_resources_ids: [],
      access_rights_ids: [],
      company_benefits_ids: []
    };
  }

 

  // Process sections
  const sections = {
    criticalDuties: [''],
    positionMainKpis: [''],
    jobDuties: [''],
    requirements: ['']
  };

  if (apiData.sections && Array.isArray(apiData.sections)) {
    apiData.sections.forEach(section => {
      if (!section || !section.content) return;
      
      const content = section.content
        .split('\n')
        .map(item => item.replace(/^[\d]+\.\s*/, '').replace(/^•\s*/, '').trim())
        .filter(item => item.length > 0);
      
      switch (section.section_type) {
        case 'CRITICAL_DUTIES':
          sections.criticalDuties = content.length > 0 ? content : [''];
          break;
        case 'MAIN_KPIS':
          sections.positionMainKpis = content.length > 0 ? content : [''];
          break;
        case 'JOB_DUTIES':
          sections.jobDuties = content.length > 0 ? content : [''];
          break;
        case 'REQUIREMENTS':
          sections.requirements = content.length > 0 ? content : [''];
          break;
      }
    });
  }

  // FIXED: Extract ALL selected IDs (both parent and child)
  const businessResourcesIds = [];
  if (apiData.business_resources && Array.isArray(apiData.business_resources)) {
    apiData.business_resources.forEach(item => {
      // Each item represents either a parent or a child that was selected
      // Store the actual item's ID (not the parent ID)
      if (item.id && !isNaN(parseInt(item.id))) {
        const itemId = String(item.id);
        if (!businessResourcesIds.includes(itemId)) {
          businessResourcesIds.push(itemId);
        }
      }
    });
  }

  const accessRightsIds = [];
  if (apiData.access_rights && Array.isArray(apiData.access_rights)) {
    apiData.access_rights.forEach(item => {
      if (item.id && !isNaN(parseInt(item.id))) {
        const itemId = String(item.id);
        if (!accessRightsIds.includes(itemId)) {
          accessRightsIds.push(itemId);
        }
      }
    });
  }

  const companyBenefitsIds = [];
  if (apiData.company_benefits && Array.isArray(apiData.company_benefits)) {
    apiData.company_benefits.forEach(item => {
      if (item.id && !isNaN(parseInt(item.id))) {
        const itemId = String(item.id);
        if (!companyBenefitsIds.includes(itemId)) {
          companyBenefitsIds.push(itemId);
        }
      }
    });
  }



  // Extract skills
  const skillsData = [];
  if (apiData.required_skills && Array.isArray(apiData.required_skills)) {
    apiData.required_skills.forEach(skill => {
      let skillId = null;
      
      if (skill?.skill_detail?.id) {
        skillId = skill.skill_detail.id;
      } else if (skill?.skill_id) {
        skillId = skill.skill_id;
      } else if (skill?.skill) {
        skillId = skill.skill;
      } else if (skill?.id) {
        skillId = skill.id;
      }
      
      if (skillId) {
        skillsData.push(String(skillId));
      }
    });
  }

  // Extract competencies
  const competenciesData = [];
  if (apiData.behavioral_competencies && Array.isArray(apiData.behavioral_competencies)) {
    apiData.behavioral_competencies.forEach(comp => {
      let compId = null;
      
      if (comp?.competency_detail?.id) {
        compId = comp.competency_detail.id;
      } else if (comp?.competency_id) {
        compId = comp.competency_id;
      } else if (comp?.competency) {
        compId = comp.competency;
      } else if (comp?.id) {
        compId = comp.id;
      }
      
      if (compId) {
        competenciesData.push(String(compId));
      }
    });
  }

  const result = {
    id: apiData.id,
    job_title: apiData.job_title || '',
    job_purpose: apiData.job_purpose || '',
    
    business_function: apiData.business_function?.name || apiData.business_function_name || '',
    department: apiData.department?.name || apiData.department_name || '',
    unit: apiData.unit?.name || apiData.unit_name || '',
    job_function: apiData.job_function?.name || apiData.job_function_name || '',
    position_group: apiData.position_group?.name || apiData.position_group_name || '',
    grading_level: apiData.grading_level || '',
    
    reports_to: apiData.reports_to?.id,
    reports_to_name: apiData.reports_to?.full_name,
    assigned_employee: apiData.assigned_employee?.id,
    assigned_employee_name: apiData.assigned_employee?.full_name,
    manual_employee_name: apiData.manual_employee_name || '',
    manual_employee_phone: apiData.manual_employee_phone || '',
    
    status: apiData.status,
    status_display: apiData.status_display,
    version: apiData.version,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at,
    
    ...sections,
    
    required_skills_data: skillsData,
    behavioral_competencies_data: competenciesData,
    business_resources_ids: businessResourcesIds,
    access_rights_ids: accessRightsIds,
    company_benefits_ids: companyBenefitsIds,
    
    line_manager_approved: !!apiData.line_manager_approved_at,
    employee_approved: !!apiData.employee_approved_at,
    line_manager_comments: apiData.line_manager_comments || '',
    employee_comments: apiData.employee_comments || ''
  };

  return result;
}
}

// Create and export singleton instance
const jobDescriptionService = new JobDescriptionService();
export default jobDescriptionService;