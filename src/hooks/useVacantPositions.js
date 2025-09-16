// src/hooks/useVacantPositions.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { vacantPositionsService, archiveEmployeesService, bulkOperationsService } from '../services/vacantPositionsService';

/**
 * Custom hook for managing vacant positions, archive data, and bulk operations
 * Provides comprehensive state management and API integration
 */
export const useVacantPositions = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // Vacant Positions State
  const [vacantPositions, setVacantPositions] = useState([]);
  const [vacantPositionsStats, setVacantPositionsStats] = useState({});
  
  // Archive State
  const [archivedEmployees, setArchivedEmployees] = useState([]);
  const [archiveStats, setArchiveStats] = useState({});
  
  // Selection State
  const [selectedVacantPositions, setSelectedVacantPositions] = useState([]);
  const [selectedArchivedEmployees, setSelectedArchivedEmployees] = useState([]);
  
  // Loading States
  const [loading, setLoading] = useState({
    vacantPositions: false,
    archivedEmployees: false,
    statistics: false,
    creating: false,
    updating: false,
    deleting: false,
    converting: false,
    bulkOperations: false
  });
  
  // Error States
  const [errors, setErrors] = useState({});
  
  // Pagination States
  const [vacantPagination, setVacantPagination] = useState({
    page: 1,
    pageSize: 25,
    totalPages: 0,
    count: 0
  });
  
  const [archivePagination, setArchivePagination] = useState({
    page: 1,
    pageSize: 25,
    totalPages: 0,
    count: 0
  });
  
  // Filter and Search States
  const [vacantFilters, setVacantFilters] = useState({});
  const [archiveFilters, setArchiveFilters] = useState({});

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  // Update loading state for specific operation
  const updateLoading = useCallback((operation, value) => {
    setLoading(prev => ({ ...prev, [operation]: value }));
  }, []);

  // Update error state
  const updateError = useCallback((operation, error) => {
    setErrors(prev => ({ 
      ...prev, 
      [operation]: error ? {
        message: error.message || 'An error occurred',
        status: error.status || 500,
        timestamp: new Date().toISOString()
      } : null 
    }));
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // ========================================
  // VACANT POSITIONS API FUNCTIONS
  // ========================================

  // Fetch vacant positions
  const fetchVacantPositions = useCallback(async (params = {}) => {
    updateLoading('vacantPositions', true);
    updateError('vacantPositions', null);
    
    try {
      const response = await vacantPositionsService.getVacantPositions({
        page: vacantPagination.page,
        page_size: vacantPagination.pageSize,
        ...params
      });
      
      setVacantPositions(response.results || []);
      setVacantPagination({
        page: response.pagination.currentPage,
        pageSize: response.pagination.pageSize,
        totalPages: response.pagination.totalPages,
        count: response.pagination.count
      });
      
      return response;
    } catch (error) {
      console.error('Failed to fetch vacant positions:', error);
      updateError('vacantPositions', error);
      setVacantPositions([]);
      throw error;
    } finally {
      updateLoading('vacantPositions', false);
    }
  }, [vacantPagination.page, vacantPagination.pageSize, updateLoading, updateError]);

  // Create vacant position
  const createVacantPosition = useCallback(async (vacantPositionData) => {
    updateLoading('creating', true);
    updateError('creating', null);
    
    try {
      const response = await vacantPositionsService.createVacantPosition(vacantPositionData);
      
      // Refresh the list
      await fetchVacantPositions();
      
      return response;
    } catch (error) {
      console.error('Failed to create vacant position:', error);
      updateError('creating', error);
      throw error;
    } finally {
      updateLoading('creating', false);
    }
  }, [fetchVacantPositions, updateLoading, updateError]);

  // Update vacant position
  const updateVacantPosition = useCallback(async (id, updateData) => {
    updateLoading('updating', true);
    updateError('updating', null);
    
    try {
      const response = await vacantPositionsService.updateVacantPosition(id, updateData);
      
      // Update local state
      setVacantPositions(prev => 
        prev.map(vp => vp.id === id ? { ...vp, ...response.data } : vp)
      );
      
      return response;
    } catch (error) {
      console.error('Failed to update vacant position:', error);
      updateError('updating', error);
      throw error;
    } finally {
      updateLoading('updating', false);
    }
  }, [updateLoading, updateError]);

  // Delete vacant position
  const deleteVacantPosition = useCallback(async (id) => {
    updateLoading('deleting', true);
    updateError('deleting', null);
    
    try {
      const response = await vacantPositionsService.deleteVacantPosition(id);
      
      // Remove from local state
      setVacantPositions(prev => prev.filter(vp => vp.id !== id));
      setSelectedVacantPositions(prev => prev.filter(vpId => vpId !== id));
      
      return response;
    } catch (error) {
      console.error('Failed to delete vacant position:', error);
      updateError('deleting', error);
      throw error;
    } finally {
      updateLoading('deleting', false);
    }
  }, [updateLoading, updateError]);

  // Convert vacant position to employee
  const convertToEmployee = useCallback(async (id, employeeData, document = null, profilePhoto = null) => {
    updateLoading('converting', true);
    updateError('converting', null);
    
    try {
      const response = await vacantPositionsService.convertToEmployee(
        id, 
        employeeData, 
        document, 
        profilePhoto
      );
      
      // Remove from vacant positions list
      setVacantPositions(prev => prev.filter(vp => vp.id !== id));
      setSelectedVacantPositions(prev => prev.filter(vpId => vpId !== id));
      
      return response;
    } catch (error) {
      console.error('Failed to convert vacant position to employee:', error);
      updateError('converting', error);
      throw error;
    } finally {
      updateLoading('converting', false);
    }
  }, [updateLoading, updateError]);

  // Fetch vacant positions statistics
  const fetchVacantPositionsStatistics = useCallback(async () => {
    updateLoading('statistics', true);
    updateError('statistics', null);
    
    try {
      const response = await vacantPositionsService.getVacantPositionsStatistics();
      setVacantPositionsStats(response.data);
      return response;
    } catch (error) {
      console.error('Failed to fetch vacant positions statistics:', error);
      updateError('statistics', error);
      throw error;
    } finally {
      updateLoading('statistics', false);
    }
  }, [updateLoading, updateError]);

  // ========================================
  // ARCHIVE EMPLOYEES API FUNCTIONS
  // ========================================

  // Fetch archived employees
  const fetchArchivedEmployees = useCallback(async (params = {}) => {
    updateLoading('archivedEmployees', true);
    updateError('archivedEmployees', null);
    
    try {
      const response = await archiveEmployeesService.getArchivedEmployees({
        page: archivePagination.page,
        page_size: archivePagination.pageSize,
        ...params
      });
      
      setArchivedEmployees(response.results || []);
      setArchivePagination({
        page: response.pagination.page,
        pageSize: response.pagination.pageSize,
        totalPages: response.pagination.totalPages,
        count: response.pagination.count
      });
      
      return response;
    } catch (error) {
      console.error('Failed to fetch archived employees:', error);
      updateError('archivedEmployees', error);
      setArchivedEmployees([]);
      throw error;
    } finally {
      updateLoading('archivedEmployees', false);
    }
  }, [archivePagination.page, archivePagination.pageSize, updateLoading, updateError]);

  // Fetch archive statistics
  const fetchArchiveStatistics = useCallback(async () => {
    updateLoading('statistics', true);
    updateError('statistics', null);
    
    try {
      const response = await archiveEmployeesService.getArchivedEmployeesStatistics();
      setArchiveStats(response.data);
      return response;
    } catch (error) {
      console.error('Failed to fetch archive statistics:', error);
      updateError('statistics', error);
      throw error;
    } finally {
      updateLoading('statistics', false);
    }
  }, [updateLoading, updateError]);

  // ========================================
  // BULK OPERATIONS
  // ========================================

  // Bulk hard delete with archives
  const bulkHardDeleteWithArchives = useCallback(async (employeeIds, notes = '') => {
    updateLoading('bulkOperations', true);
    updateError('bulkOperations', null);
    
    try {
      const response = await bulkOperationsService.bulkHardDeleteWithArchives(employeeIds, notes);
      
      // Refresh archive data
      await fetchArchivedEmployees();
      
      return response;
    } catch (error) {
      console.error('Failed to bulk hard delete employees:', error);
      updateError('bulkOperations', error);
      throw error;
    } finally {
      updateLoading('bulkOperations', false);
    }
  }, [fetchArchivedEmployees, updateLoading, updateError]);

  // Bulk soft delete with vacancies
  const bulkSoftDeleteWithVacancies = useCallback(async (employeeIds, reason = '') => {
    updateLoading('bulkOperations', true);
    updateError('bulkOperations', null);
    
    try {
      const response = await bulkOperationsService.bulkSoftDeleteWithVacancies(employeeIds, reason);
      
      // Refresh both vacant positions and archive data
      await Promise.all([
        fetchVacantPositions(),
        fetchArchivedEmployees()
      ]);
      
      return response;
    } catch (error) {
      console.error('Failed to bulk soft delete employees:', error);
      updateError('bulkOperations', error);
      throw error;
    } finally {
      updateLoading('bulkOperations', false);
    }
  }, [fetchVacantPositions, fetchArchivedEmployees, updateLoading, updateError]);

  // Bulk restore employees
  const bulkRestoreEmployees = useCallback(async (employeeIds, restoreToActive = false) => {
    updateLoading('bulkOperations', true);
    updateError('bulkOperations', null);
    
    try {
      const response = await bulkOperationsService.bulkRestoreEmployees(employeeIds, restoreToActive);
      
      // Refresh archive data
      await fetchArchivedEmployees();
      
      return response;
    } catch (error) {
      console.error('Failed to bulk restore employees:', error);
      updateError('bulkOperations', error);
      throw error;
    } finally {
      updateLoading('bulkOperations', false);
    }
  }, [fetchArchivedEmployees, updateLoading, updateError]);

  // ========================================
  // SELECTION HELPERS
  // ========================================

  // Toggle vacant position selection
  const toggleVacantPositionSelection = useCallback((id) => {
    setSelectedVacantPositions(prev =>
      prev.includes(id)
        ? prev.filter(vpId => vpId !== id)
        : [...prev, id]
    );
  }, []);

  // Toggle archived employee selection
  const toggleArchivedEmployeeSelection = useCallback((id) => {
    setSelectedArchivedEmployees(prev =>
      prev.includes(id)
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  }, []);

  // Clear vacant positions selection
  const clearVacantPositionsSelection = useCallback(() => {
    setSelectedVacantPositions([]);
  }, []);

  // Clear archived employees selection
  const clearArchivedEmployeesSelection = useCallback(() => {
    setSelectedArchivedEmployees([]);
  }, []);

  // Select all vacant positions
  const selectAllVacantPositions = useCallback(() => {
    const allIds = vacantPositions.map(vp => vp.id);
    setSelectedVacantPositions(allIds);
  }, [vacantPositions]);

  // Select all archived employees
  const selectAllArchivedEmployees = useCallback(() => {
    const allIds = archivedEmployees.map(emp => emp.id);
    setSelectedArchivedEmployees(allIds);
  }, [archivedEmployees]);

  // ========================================
  // PAGINATION HELPERS
  // ========================================

  // Set vacant positions page
  const setVacantPositionsPage = useCallback((page) => {
    setVacantPagination(prev => ({ ...prev, page }));
  }, []);

  // Set vacant positions page size
  const setVacantPositionsPageSize = useCallback((pageSize) => {
    setVacantPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // Set archive page
  const setArchivePage = useCallback((page) => {
    setArchivePagination(prev => ({ ...prev, page }));
  }, []);

  // Set archive page size
  const setArchivePageSize = useCallback((pageSize) => {
    setArchivePagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Check if any operations are loading
  const isLoading = useMemo(() => {
    return Object.values(loading).some(value => value === true);
  }, [loading]);

  // Check if there are any errors
  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== null);
  }, [errors]);

  // ========================================
  // RETURN HOOK INTERFACE
  // ========================================

  return {
    // Data
    vacantPositions,
    archivedEmployees,
    vacantPositionsStats,
    archiveStats,
    
    // Selection
    selectedVacantPositions,
    selectedArchivedEmployees,
    
    // Loading states
    loading,
    isLoading,
    
    // Error states
    errors,
    hasErrors,
    
    // Pagination
    vacantPagination,
    archivePagination,
    
    // Filters
    vacantFilters,
    archiveFilters,
    
    // Vacant Positions API
    fetchVacantPositions,
    createVacantPosition,
    updateVacantPosition,
    deleteVacantPosition,
    convertToEmployee,
    fetchVacantPositionsStatistics,
    
    // Archive API
    fetchArchivedEmployees,
    fetchArchiveStatistics,
    
    // Bulk Operations
    bulkHardDeleteWithArchives,
    bulkSoftDeleteWithVacancies,
    bulkRestoreEmployees,
    
    // Selection Helpers
    toggleVacantPositionSelection,
    toggleArchivedEmployeeSelection,
    clearVacantPositionsSelection,
    clearArchivedEmployeesSelection,
    selectAllVacantPositions,
    selectAllArchivedEmployees,
    
    // Pagination Helpers
    setVacantPositionsPage,
    setVacantPositionsPageSize,
    setArchivePage,
    setArchivePageSize,
    
    // Filter Helpers
    setVacantFilters,
    setArchiveFilters,
    
    // Utility Functions
    clearErrors,
    updateError,
    updateLoading
  };
};

export default useVacantPositions;