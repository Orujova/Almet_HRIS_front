// src/services/vacantPositionsService.js
import axios from 'axios';

// Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Axios instance for vacant positions
const vacantApi = axios.create({
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
vacantApi.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
vacantApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      TokenManager.removeTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================================
// VACANT POSITIONS SERVICE
// ========================================

class VacantPositionsService {
  
  // ========================================
  // CRUD OPERATIONS
  // ========================================

  /**
   * Get all vacant positions with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response with vacant positions data
   */
  async getVacantPositions(params = {}) {
    try {
      const response = await vacantApi.get('/vacant-positions/', { params });
      return {
        success: true,
        data: response.data,
        count: response.data.count,
        results: response.data.results,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          currentPage: params.page || 1,
          pageSize: params.page_size || 25,
          totalPages: Math.ceil(response.data.count / (params.page_size || 25))
        }
      };
    } catch (error) {
      console.error('Failed to fetch vacant positions:', error);
      throw this.handleError(error, 'Failed to fetch vacant positions');
    }
  }

  /**
   * Get a single vacant position by ID
   * @param {string|number} id - Vacant position ID
   * @returns {Promise<Object>} Vacant position data
   */
  async getVacantPositionById(id) {
    try {
      const response = await vacantApi.get(`/vacant-positions/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Failed to fetch vacant position ${id}:`, error);
      throw this.handleError(error, 'Failed to fetch vacant position details');
    }
  }

  /**
   * Create a new vacant position
   * @param {Object} vacantPositionData - Vacant position creation data
   * @returns {Promise<Object>} Created vacant position
   */
  async createVacantPosition(vacantPositionData) {
    try {
      const response = await vacantApi.post('/vacant-positions/', vacantPositionData);
      return {
        success: true,
        data: response.data,
        message: 'Vacant position created successfully'
      };
    } catch (error) {
      console.error('Failed to create vacant position:', error);
      throw this.handleError(error, 'Failed to create vacant position');
    }
  }

  /**
   * Update a vacant position
   * @param {string|number} id - Vacant position ID
   * @param {Object} updateData - Updated vacant position data
   * @returns {Promise<Object>} Updated vacant position
   */
  async updateVacantPosition(id, updateData) {
    try {
      const response = await vacantApi.put(`/vacant-positions/${id}/`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Vacant position updated successfully'
      };
    } catch (error) {
      console.error(`Failed to update vacant position ${id}:`, error);
      throw this.handleError(error, 'Failed to update vacant position');
    }
  }

  /**
   * Delete a vacant position
   * @param {string|number} id - Vacant position ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteVacantPosition(id) {
    try {
      await vacantApi.delete(`/vacant-positions/${id}/`);
      return {
        success: true,
        message: 'Vacant position deleted successfully'
      };
    } catch (error) {
      console.error(`Failed to delete vacant position ${id}:`, error);
      throw this.handleError(error, 'Failed to delete vacant position');
    }
  }

  // ========================================
  // CONVERT TO EMPLOYEE
  // ========================================

  /**
   * Convert vacant position to employee
   * @param {string|number} id - Vacant position ID
   * @param {Object} employeeData - Employee data for conversion
   * @param {File} [document] - Optional document file
   * @param {File} [profilePhoto] - Optional profile photo
   * @returns {Promise<Object>} Conversion result
   */
  async convertToEmployee(id, employeeData, document = null, profilePhoto = null) {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add required employee data
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key] !== null && employeeData[key] !== undefined) {
          formData.append(key, employeeData[key]);
        }
      });

      // Add optional files
      if (document) {
        formData.append('document', document);
      }
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }

      const response = await vacantApi.post(
        `/vacant-positions/${id}/convert_to_employee/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        employee: response.data.employee,
        message: response.data.message || 'Vacant position converted to employee successfully'
      };
    } catch (error) {
      console.error(`Failed to convert vacant position ${id} to employee:`, error);
      throw this.handleError(error, 'Failed to convert vacant position to employee');
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  /**
   * Bulk delete vacant positions
   * @param {Array<number>} ids - Array of vacant position IDs
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkDeleteVacantPositions(ids) {
    try {
      const deletePromises = ids.map(id => this.deleteVacantPosition(id));
      await Promise.all(deletePromises);
      
      return {
        success: true,
        message: `Successfully deleted ${ids.length} vacant position${ids.length !== 1 ? 's' : ''}`
      };
    } catch (error) {
      console.error('Failed to bulk delete vacant positions:', error);
      throw this.handleError(error, 'Failed to delete selected vacant positions');
    }
  }

  /**
   * Bulk convert vacant positions to employees
   * @param {Array<Object>} conversions - Array of conversion data objects
   * @returns {Promise<Object>} Bulk conversion result
   */
  async bulkConvertToEmployees(conversions) {
    try {
      const conversionPromises = conversions.map(conversion => 
        this.convertToEmployee(
          conversion.vacantPositionId,
          conversion.employeeData,
          conversion.document,
          conversion.profilePhoto
        )
      );
      
      const results = await Promise.allSettled(conversionPromises);
      
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');
      
      return {
        success: true,
        message: `Converted ${successful.length} vacant position${successful.length !== 1 ? 's' : ''} to employee${successful.length !== 1 ? 's' : ''}`,
        results: {
          successful: successful.length,
          failed: failed.length,
          total: conversions.length,
          failedReasons: failed.map(result => result.reason?.message || 'Unknown error')
        }
      };
    } catch (error) {
      console.error('Failed to bulk convert vacant positions:', error);
      throw this.handleError(error, 'Failed to convert selected vacant positions');
    }
  }

  // ========================================
  // SEARCH AND FILTER UTILITIES
  // ========================================

  /**
   * Search vacant positions by various criteria
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchVacantPositions(searchParams) {
    const params = {
      search: searchParams.search || '',
      business_function: searchParams.businessFunction,
      department: searchParams.department,
      position_group: searchParams.positionGroup,
      job_function: searchParams.jobFunction,
      grading_level: searchParams.gradingLevel,
      reporting_to: searchParams.reportingTo,
      page: searchParams.page || 1,
      page_size: searchParams.pageSize || 25,
      ordering: searchParams.ordering || '-created_at'
    };

    return this.getVacantPositions(params);
  }

  /**
   * Get vacant positions by department
   * @param {string|number} departmentId - Department ID
   * @returns {Promise<Object>} Vacant positions in department
   */
  async getVacantPositionsByDepartment(departmentId) {
    return this.getVacantPositions({ department: departmentId });
  }

  /**
   * Get vacant positions by business function
   * @param {string|number} businessFunctionId - Business function ID
   * @returns {Promise<Object>} Vacant positions in business function
   */
  async getVacantPositionsByBusinessFunction(businessFunctionId) {
    return this.getVacantPositions({ business_function: businessFunctionId });
  }

  /**
   * Get vacant positions by position group
   * @param {string|number} positionGroupId - Position group ID
   * @returns {Promise<Object>} Vacant positions in position group
   */
  async getVacantPositionsByPositionGroup(positionGroupId) {
    return this.getVacantPositions({ position_group: positionGroupId });
  }

  // ========================================
  // STATISTICS AND ANALYTICS
  // ========================================

  /**
   * Get vacant positions statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getVacantPositionsStatistics() {
    try {
      const response = await this.getVacantPositions({ page_size: 1000 }); // Get all for stats
      const vacantPositions = response.results || [];
      
      // Calculate statistics
      const stats = {
        total_vacant_positions: vacantPositions.length,
        by_department: {},
        by_business_function: {},
        by_position_group: {},
        by_grading_level: {},
        recent_vacancies: vacantPositions.filter(vp => {
          const createdDate = new Date(vp.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate >= thirtyDaysAgo;
        }).length
      };

      // Group by various categories
      vacantPositions.forEach(vp => {
        // By department
        const dept = vp.department_name || 'Unknown';
        stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;

        // By business function
        const bf = vp.business_function_name || 'Unknown';
        stats.by_business_function[bf] = (stats.by_business_function[bf] || 0) + 1;

        // By position group
        const pg = vp.position_group_name || 'Unknown';
        stats.by_position_group[pg] = (stats.by_position_group[pg] || 0) + 1;

        // By grading level
        const gl = vp.grading_level || 'Unknown';
        stats.by_grading_level[gl] = (stats.by_grading_level[gl] || 0) + 1;
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Failed to get vacant positions statistics:', error);
      throw this.handleError(error, 'Failed to get vacant positions statistics');
    }
  }

  // ========================================
  // ERROR HANDLING
  // ========================================

  /**
   * Handle API errors consistently
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        error.message || 
                        defaultMessage;
    
    const errorCode = error.response?.status || 500;
    
    const formattedError = new Error(errorMessage);
    formattedError.status = errorCode;
    formattedError.originalError = error;
    
    return formattedError;
  }
}

// ========================================
// ARCHIVE EMPLOYEES SERVICE
// ========================================

class ArchiveEmployeesService {
  
  /**
   * Get archived employees with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response with archived employees data
   */
  async getArchivedEmployees(params = {}) {
    try {
      const response = await vacantApi.get('/employees/archived-employees/', { params });
      return {
        success: true,
        data: response.data,
        count: response.data.count,
        results: response.data.results,
        pagination: {
          count: response.data.count,
          page: response.data.page,
          pageSize: response.data.page_size,
          totalPages: response.data.total_pages
        }
      };
    } catch (error) {
      console.error('Failed to fetch archived employees:', error);
      throw this.handleError(error, 'Failed to fetch archived employees');
    }
  }

  /**
   * Search archived employees
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchArchivedEmployees(searchParams) {
    const params = {
      search: searchParams.search || '',
      page: searchParams.page || 1,
      page_size: searchParams.pageSize || 25,
      ordering: searchParams.ordering || '-deleted_at'
    };

    return this.getArchivedEmployees(params);
  }

  /**
   * Get archived employees statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getArchivedEmployeesStatistics() {
    try {
      const response = await this.getArchivedEmployees({ page_size: 1000 });
      const archivedEmployees = response.results || [];
      
      const stats = {
        total_archived: archivedEmployees.length,
        by_deletion_type: {},
        by_department: {},
        by_business_function: {},
        recent_deletions: archivedEmployees.filter(emp => {
          const deletedDate = new Date(emp.deleted_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return deletedDate >= thirtyDaysAgo;
        }).length,
        restorable_count: archivedEmployees.filter(emp => emp.can_be_restored).length
      };

      archivedEmployees.forEach(emp => {
        // By deletion type
        const delType = emp.deletion_type_display || 'Unknown';
        stats.by_deletion_type[delType] = (stats.by_deletion_type[delType] || 0) + 1;

        // By department
        const dept = emp.department_name || 'Unknown';
        stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;

        // By business function
        const bf = emp.business_function_name || 'Unknown';
        stats.by_business_function[bf] = (stats.by_business_function[bf] || 0) + 1;
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Failed to get archived employees statistics:', error);
      throw this.handleError(error, 'Failed to get archived employees statistics');
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        error.message || 
                        defaultMessage;
    
    const errorCode = error.response?.status || 500;
    
    const formattedError = new Error(errorMessage);
    formattedError.status = errorCode;
    formattedError.originalError = error;
    
    return formattedError;
  }
}

// ========================================
// BULK OPERATIONS SERVICE
// ========================================

class BulkOperationsService {
  
  /**
   * Bulk hard delete employees with archives
   * @param {Array<number>} employeeIds - Array of employee IDs
   * @param {string} notes - Deletion notes
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkHardDeleteWithArchives(employeeIds, notes = '') {
    try {
      const response = await vacantApi.post('/employees/bulk-hard-delete-with-archives/', {
        employee_ids: employeeIds,
        confirm_hard_delete: true,
        notes
      });

      return {
        success: true,
        data: response.data,
        message: `Successfully hard deleted ${employeeIds.length} employee${employeeIds.length !== 1 ? 's' : ''}`
      };
    } catch (error) {
      console.error('Failed to bulk hard delete employees:', error);
      throw this.handleError(error, 'Failed to bulk delete employees');
    }
  }

  /**
   * Bulk soft delete employees with vacancies
   * @param {Array<number>} employeeIds - Array of employee IDs
   * @param {string} reason - Deletion reason
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkSoftDeleteWithVacancies(employeeIds, reason = '') {
    try {
      const response = await vacantApi.post('/employees/bulk-soft-delete-with-vacancies/', {
        employee_ids: employeeIds,
        reason
      });

      return {
        success: true,
        data: response.data,
        message: `Successfully soft deleted ${employeeIds.length} employee${employeeIds.length !== 1 ? 's' : ''} and created vacancies`
      };
    } catch (error) {
      console.error('Failed to bulk soft delete employees:', error);
      throw this.handleError(error, 'Failed to bulk soft delete employees');
    }
  }

  /**
   * Bulk restore employees
   * @param {Array<number>} employeeIds - Array of employee IDs
   * @param {boolean} restoreToActive - Whether to restore to active status
   * @returns {Promise<Object>} Bulk restoration result
   */
  async bulkRestoreEmployees(employeeIds, restoreToActive = false) {
    try {
      const response = await vacantApi.post('/employees/bulk-restore-employees/', {
        employee_ids: employeeIds,
        restore_to_active: restoreToActive
      });

      return {
        success: true,
        data: response.data,
        message: `Successfully restored ${employeeIds.length} employee${employeeIds.length !== 1 ? 's' : ''}`
      };
    } catch (error) {
      console.error('Failed to bulk restore employees:', error);
      throw this.handleError(error, 'Failed to bulk restore employees');
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.detail || 
                        error.message || 
                        defaultMessage;
    
    const errorCode = error.response?.status || 500;
    
    const formattedError = new Error(errorMessage);
    formattedError.status = errorCode;
    formattedError.originalError = error;
    
    return formattedError;
  }
}

// Create service instances
export const vacantPositionsService = new VacantPositionsService();
export const archiveEmployeesService = new ArchiveEmployeesService();
export const bulkOperationsService = new BulkOperationsService();

// Export individual services
export { VacantPositionsService, ArchiveEmployeesService, BulkOperationsService };

// Default export
export default {
  vacantPositions: vacantPositionsService,
  archive: archiveEmployeesService,
  bulkOperations: bulkOperationsService
};