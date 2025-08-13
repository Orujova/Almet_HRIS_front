// services/jobDescriptionService.js
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
 * Job Description Service - CRUD operations without Redux
 */
class JobDescriptionService {
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
      const response = await api.post('/job-descriptions/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating job description:', error);
      throw error;
    }
  }

  async updateJobDescription(id, data) {
    try {
      const response = await api.put(`/job-descriptions/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating job description:', error);
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
      const response = await api.post(`/job-descriptions/${id}/submit_for_approval/`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting for approval:', error);
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
  // HELPER METHODS
  // ========================================

  prepareJobDescriptionData(formData) {
    const apiData = {
      job_title: formData.job_title,
      job_purpose: formData.job_purpose,
      business_function: formData.business_function,
      department: formData.department,
      unit: formData.unit || null,
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

    // Process sections
    const sectionTypes = [
      { type: 'CRITICAL_DUTIES', title: 'Critical Duties', content: formData.criticalDuties },
      { type: 'MAIN_KPIS', title: 'Position Main KPIs', content: formData.positionMainKpis },
      { type: 'JOB_DUTIES', title: 'Job Duties', content: formData.jobDuties },
      { type: 'REQUIREMENTS', title: 'Requirements', content: formData.requirements }
    ];

    sectionTypes.forEach((section, index) => {
      if (section.content && Array.isArray(section.content) && section.content.length > 0) {
        apiData.sections.push({
          section_type: section.type,
          title: section.title,
          content: section.content.filter(item => item.trim()).join('\n• '),
          order: index + 1
        });
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
      required_skills: apiData.required_skills || [],
      behavioral_competencies: apiData.behavioral_competencies || [],
      business_resources: apiData.business_resources || [],
      access_rights: apiData.access_rights || [],
      company_benefits: apiData.company_benefits || [],
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