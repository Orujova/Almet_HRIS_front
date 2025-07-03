// src/hooks/useEmployees.js - Complete Employee Management Hook with Grading
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchFilterOptions,
  fetchStatistics,
  bulkUpdateEmployees,
  bulkDeleteEmployees,
  softDeleteEmployees,
  restoreEmployees,
  addEmployeeTag,
  removeEmployeeTag,
  bulkAddTags,
  bulkRemoveTags,
  updateEmployeeStatus,
  autoUpdateAllStatuses,
  getLineManagers,
  updateLineManager,
  bulkUpdateLineManager,
  fetchEmployeeGrading,
  bulkUpdateEmployeeGrades,
  updateSingleEmployeeGrade,
  exportEmployees,
  downloadEmployeeTemplate,
  fetchEmployeeActivities,
  fetchOrgChart,
  fetchOrgChartFullTree,
  fetchHeadcountSummaries,
  fetchVacantPositions,
  setSelectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  selectAllVisible,
  clearSelection,
  setCurrentFilters,
  addFilter,
  removeFilter,
  clearFilters,
  updateFilter,
  setSorting,
  addSort,
  removeSort,
  clearSorting,
  toggleSort,
  setCurrentPage,
  setPageSize,
  goToNextPage,
  goToPreviousPage,
  toggleAdvancedFilters,
  setShowAdvancedFilters,
  setViewMode,
  setShowGradingPanel,
  toggleGradingPanel,
  setGradingMode,
  clearErrors,
  clearError,
  setError,
  clearCurrentEmployee,
  setQuickFilter,
  optimisticUpdateEmployee,
  optimisticDeleteEmployee,
  optimisticUpdateEmployeeGrade,
  selectEmployees,
  selectCurrentEmployee,
  selectEmployeeLoading,
  selectEmployeeError,
  selectFilterOptions,
  selectSelectedEmployees,
  selectCurrentFilters,
  selectAppliedFilters,
  selectStatistics,
  selectOrgChart,
  selectPagination,
  selectSorting,
  selectGradingData,
  selectGradingStatistics,
  selectAllGradingLevels,
  selectActivities,
  selectLineManagers,
  selectViewMode,
  selectShowAdvancedFilters,
  selectShowGradingPanel,
  selectGradingMode,
  selectHeadcountSummaries,
  selectVacantPositions,
  selectFormattedEmployees,
  selectSortingForBackend,
  selectFilteredEmployeesCount,
  selectGetSortDirection,
  selectIsSorted,
  selectGetSortIndex,
  selectApiParams,
  selectSelectionInfo,
  selectEmployeesNeedingGrades,
  selectEmployeesByGradeLevel,
  selectEmployeesByPositionGroup,
  selectGradingProgress,
  selectGradingDistribution,
  selectEmployeesByStatus,
  selectEmployeesByDepartment,
  selectNewHires,
  selectEmployeesNeedingAttention,
  selectIsAnyLoading,
  selectHasAnyError,
  selectDashboardSummary,
  selectEmployeeMetrics
} from '../store/slices/employeeSlice';

export const useEmployees = () => {
  const dispatch = useDispatch();
  
  // ========================================
  // MAIN DATA SELECTORS
  // ========================================
  const employees = useSelector(selectEmployees);
  const formattedEmployees = useSelector(selectFormattedEmployees);
  const currentEmployee = useSelector(selectCurrentEmployee);
  const loading = useSelector(selectEmployeeLoading);
  const error = useSelector(selectEmployeeError);
  const filterOptions = useSelector(selectFilterOptions);
  const selectedEmployees = useSelector(selectSelectedEmployees);
  const currentFilters = useSelector(selectCurrentFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const statistics = useSelector(selectStatistics);
  const orgChart = useSelector(selectOrgChart);
  const pagination = useSelector(selectPagination);
  const sorting = useSelector(selectSorting);
  const activities = useSelector(selectActivities);
  const lineManagers = useSelector(selectLineManagers);
  const viewMode = useSelector(selectViewMode);
  const showAdvancedFilters = useSelector(selectShowAdvancedFilters);
  
  // ========================================
  // GRADING DATA SELECTORS
  // ========================================
  const gradingData = useSelector(selectGradingData);
  const gradingStatistics = useSelector(selectGradingStatistics);
  const allGradingLevels = useSelector(selectAllGradingLevels);
  const showGradingPanel = useSelector(selectShowGradingPanel);
  const gradingMode = useSelector(selectGradingMode);
  const employeesNeedingGrades = useSelector(selectEmployeesNeedingGrades);
  const employeesByGradeLevel = useSelector(selectEmployeesByGradeLevel);
  const employeesByPositionGroup = useSelector(selectEmployeesByPositionGroup);
  const gradingProgress = useSelector(selectGradingProgress);
  const gradingDistribution = useSelector(selectGradingDistribution);
  
  // ========================================
  // ANALYTICS & STATISTICS SELECTORS
  // ========================================
  const headcountSummaries = useSelector(selectHeadcountSummaries);
  const vacantPositions = useSelector(selectVacantPositions);
  const employeesByStatus = useSelector(selectEmployeesByStatus);
  const employeesByDepartment = useSelector(selectEmployeesByDepartment);
  const newHires = useSelector(selectNewHires);
  const employeesNeedingAttention = useSelector(selectEmployeesNeedingAttention);
  const dashboardSummary = useSelector(selectDashboardSummary);
  const employeeMetrics = useSelector(selectEmployeeMetrics);
  
  // ========================================
  // COMPUTED SELECTORS
  // ========================================
  const filteredEmployeesCount = useSelector(selectFilteredEmployeesCount);
  const sortingForBackend = useSelector(selectSortingForBackend);
  const apiParams = useSelector(selectApiParams);
  const selectionInfo = useSelector(selectSelectionInfo);
  const isAnyLoading = useSelector(selectIsAnyLoading);
  const hasAnyError = useSelector(selectHasAnyError);

  // Helper functions
  const getSortDirection = useSelector(selectGetSortDirection);
  const isSorted = useSelector(selectIsSorted);
  const getSortIndex = useSelector(selectGetSortIndex);

  // ========================================
  // BASIC CRUD ACTIONS
  // ========================================
  const actions = {
    // Fetch operations
    fetchEmployees: useCallback((params) => dispatch(fetchEmployees(params)), [dispatch]),
    fetchEmployee: useCallback((id) => dispatch(fetchEmployee(id)), [dispatch]),
    
    // Create/Update/Delete
    createEmployee: useCallback((data) => dispatch(createEmployee(data)), [dispatch]),
    updateEmployee: useCallback((id, data) => dispatch(updateEmployee({ id, data })), [dispatch]),
    deleteEmployee: useCallback((id) => dispatch(deleteEmployee(id)), [dispatch]),
    
    // Filter and Statistics
    fetchFilterOptions: useCallback(() => dispatch(fetchFilterOptions()), [dispatch]),
    fetchStatistics: useCallback(() => dispatch(fetchStatistics()), [dispatch]),
    
    // Bulk Operations
    bulkUpdateEmployees: useCallback((data) => dispatch(bulkUpdateEmployees(data)), [dispatch]),
    bulkDeleteEmployees: useCallback((ids) => dispatch(bulkDeleteEmployees(ids)), [dispatch]),
    softDeleteEmployees: useCallback((ids) => dispatch(softDeleteEmployees(ids)), [dispatch]),
    restoreEmployees: useCallback((ids) => dispatch(restoreEmployees(ids)), [dispatch]),
    
    // ========================================
    // TAG MANAGEMENT ACTIONS
    // ========================================
    addEmployeeTag: useCallback((employeeId, tagData) => 
      dispatch(addEmployeeTag({ employeeId, tagData })), [dispatch]),
    removeEmployeeTag: useCallback((employeeId, tagId) => 
      dispatch(removeEmployeeTag({ employeeId, tagId })), [dispatch]),
    bulkAddTags: useCallback((employeeIds, tagIds) => 
      dispatch(bulkAddTags({ employeeIds, tagIds })), [dispatch]),
    bulkRemoveTags: useCallback((employeeIds, tagIds) => 
      dispatch(bulkRemoveTags({ employeeIds, tagIds })), [dispatch]),
    
    // ========================================
    // STATUS MANAGEMENT ACTIONS
    // ========================================
    updateEmployeeStatus: useCallback((employeeIds) => {
      const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
      return dispatch(updateEmployeeStatus(ids));
    }, [dispatch]),
    autoUpdateAllStatuses: useCallback(() => dispatch(autoUpdateAllStatuses()), [dispatch]),
    
    // ========================================
    // LINE MANAGER MANAGEMENT ACTIONS
    // ========================================
    getLineManagers: useCallback((params) => dispatch(getLineManagers(params)), [dispatch]),
    updateLineManager: useCallback((employeeId, lineManagerId) => 
      dispatch(updateLineManager({ employeeId, lineManagerId })), [dispatch]),
    bulkUpdateLineManager: useCallback((employeeIds, lineManagerId) => 
      dispatch(bulkUpdateLineManager({ employeeIds, lineManagerId })), [dispatch]),
    
    // ========================================
    // GRADING MANAGEMENT ACTIONS
    // ========================================
    fetchEmployeeGrading: useCallback(() => dispatch(fetchEmployeeGrading()), [dispatch]),
    bulkUpdateEmployeeGrades: useCallback((updates) => dispatch(bulkUpdateEmployeeGrades(updates)), [dispatch]),
    updateSingleEmployeeGrade: useCallback((employeeId, gradingLevel) => 
      dispatch(updateSingleEmployeeGrade({ employeeId, gradingLevel })), [dispatch]),
    
    // ========================================
    // EXPORT & TEMPLATE ACTIONS
    // ========================================
    exportEmployees: useCallback((format, params) => dispatch(exportEmployees({ format, params })), [dispatch]),
    downloadEmployeeTemplate: useCallback(() => dispatch(downloadEmployeeTemplate()), [dispatch]),
    
    // ========================================
    // ACTIVITIES & ORG CHART ACTIONS
    // ========================================
    fetchEmployeeActivities: useCallback((employeeId) => dispatch(fetchEmployeeActivities(employeeId)), [dispatch]),
    fetchOrgChart: useCallback((params) => dispatch(fetchOrgChart(params)), [dispatch]),
    fetchOrgChartFullTree: useCallback(() => dispatch(fetchOrgChartFullTree()), [dispatch]),
    
    // ========================================
    // HEADCOUNT & VACANCY ACTIONS
    // ========================================
    fetchHeadcountSummaries: useCallback((params) => dispatch(fetchHeadcountSummaries(params)), [dispatch]),
    fetchVacantPositions: useCallback((params) => dispatch(fetchVacantPositions(params)), [dispatch]),
    
    // ========================================
    // SELECTION MANAGEMENT ACTIONS
    // ========================================
    setSelectedEmployees: useCallback((employees) => dispatch(setSelectedEmployees(employees)), [dispatch]),
    toggleEmployeeSelection: useCallback((employeeId) => dispatch(toggleEmployeeSelection(employeeId)), [dispatch]),
    selectAllEmployees: useCallback(() => dispatch(selectAllEmployees()), [dispatch]),
    selectAllVisible: useCallback(() => dispatch(selectAllVisible()), [dispatch]),
    clearSelection: useCallback(() => dispatch(clearSelection()), [dispatch]),
    
    // ========================================
    // FILTER MANAGEMENT ACTIONS
    // ========================================
    setCurrentFilters: useCallback((filters) => dispatch(setCurrentFilters(filters)), [dispatch]),
    addFilter: useCallback((filter) => dispatch(addFilter(filter)), [dispatch]),
    removeFilter: useCallback((key) => dispatch(removeFilter(key)), [dispatch]),
    clearFilters: useCallback(() => dispatch(clearFilters()), [dispatch]),
    updateFilter: useCallback((key, value) => dispatch(updateFilter({ key, value })), [dispatch]),
    
    // ========================================
    // SORTING MANAGEMENT ACTIONS
    // ========================================
    setSorting: useCallback((field, direction) => dispatch(setSorting({ field, direction })), [dispatch]),
    addSort: useCallback((field, direction) => dispatch(addSort({ field, direction })), [dispatch]),
    removeSort: useCallback((field) => dispatch(removeSort(field)), [dispatch]),
    clearSorting: useCallback(() => dispatch(clearSorting()), [dispatch]),
    toggleSort: useCallback((field) => dispatch(toggleSort(field)), [dispatch]),
    
    // ========================================
    // PAGINATION ACTIONS
    // ========================================
    setPageSize: useCallback((size) => dispatch(setPageSize(size)), [dispatch]),
    setCurrentPage: useCallback((page) => dispatch(setCurrentPage(page)), [dispatch]),
    goToNextPage: useCallback(() => dispatch(goToNextPage()), [dispatch]),
    goToPreviousPage: useCallback(() => dispatch(goToPreviousPage()), [dispatch]),
    
    // ========================================
    // UI STATE ACTIONS
    // ========================================
    toggleAdvancedFilters: useCallback(() => dispatch(toggleAdvancedFilters()), [dispatch]),
    setShowAdvancedFilters: useCallback((show) => dispatch(setShowAdvancedFilters(show)), [dispatch]),
    setViewMode: useCallback((mode) => dispatch(setViewMode(mode)), [dispatch]),
    setShowGradingPanel: useCallback((show) => dispatch(setShowGradingPanel(show)), [dispatch]),
    toggleGradingPanel: useCallback(() => dispatch(toggleGradingPanel()), [dispatch]),
    setGradingMode: useCallback((mode) => dispatch(setGradingMode(mode)), [dispatch]),
    
    // ========================================
    // ERROR MANAGEMENT ACTIONS
    // ========================================
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    clearError: useCallback((key) => dispatch(clearError(key)), [dispatch]),
    setError: useCallback((key, message) => dispatch(setError({ key, message })), [dispatch]),
    clearCurrentEmployee: useCallback(() => dispatch(clearCurrentEmployee()), [dispatch]),
    
    // ========================================
    // QUICK ACTIONS
    // ========================================
    setQuickFilter: useCallback((type, value) => dispatch(setQuickFilter({ type, value })), [dispatch]),
    optimisticUpdateEmployee: useCallback((id, updates) => dispatch(optimisticUpdateEmployee({ id, updates })), [dispatch]),
    optimisticDeleteEmployee: useCallback((id) => dispatch(optimisticDeleteEmployee(id)), [dispatch]),
    optimisticUpdateEmployeeGrade: useCallback((employeeId, gradingLevel) => 
      dispatch(optimisticUpdateEmployeeGrade({ employeeId, gradingLevel })), [dispatch]),
  };

  // ========================================
  // COMPUTED VALUES
  // ========================================
  const computed = {
    // Loading states
    isLoading: loading.employees || loading.creating || loading.updating || loading.deleting,
    isCreating: loading.creating,
    isUpdating: loading.updating,
    isDeleting: loading.deleting,
    isExporting: loading.exporting,
    isLoadingTemplate: loading.template,
    isLoadingGrading: loading.grading,
    
    // Selection
    hasSelection: selectedEmployees.length > 0,
    selectionCount: selectedEmployees.length,
    isAllSelected: selectionInfo.isAllSelected,
    isPartialSelection: selectionInfo.isPartialSelection,
    
    // Filters
    hasActiveFilters: Object.keys(currentFilters).length > 0 || appliedFilters.length > 0,
    activeFilterCount: Object.keys(currentFilters).length + appliedFilters.length,
    
    // Sorting
    hasSorting: sorting.length > 0,
    sortingCount: sorting.length,
    
    // Pagination
    hasNextPage: pagination.hasNext,
    hasPreviousPage: pagination.hasPrevious,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    
    // Data
    isEmpty: formattedEmployees.length === 0,
    filteredCount: filteredEmployeesCount,
    totalEmployees: employees.length,
    
    // Grading
    gradingProgress: gradingProgress,
    needsGradingCount: employeesNeedingGrades.length,
    gradedEmployeesCount: gradingStatistics.gradedEmployees,
    
    // Analytics
    activeEmployeesCount: statistics.active_employees,
    newHiresCount: statistics.recent_hires_30_days,
    onLeaveCount: employeesByStatus['ON_LEAVE'] || 0,
    contractEndingCount: employeesNeedingAttention.contractEnding.length,
  };

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const helpers = {
    // ========================================
    // DATA REFRESH HELPERS
    // ========================================
    refreshEmployees: useCallback(() => {
      dispatch(fetchEmployees(apiParams));
    }, [dispatch, apiParams]),
    
    refreshStatistics: useCallback(() => {
      dispatch(fetchStatistics());
    }, [dispatch]),
    
    refreshGradingData: useCallback(() => {
      dispatch(fetchEmployeeGrading());
    }, [dispatch]),
    
    refreshAll: useCallback(() => {
      dispatch(fetchEmployees(apiParams));
      dispatch(fetchStatistics());
      dispatch(fetchEmployeeGrading());
      dispatch(fetchFilterOptions());
    }, [dispatch, apiParams]),
    
    // ========================================
    // FILTER HELPERS
    // ========================================
    buildQueryParams: useCallback(() => apiParams, [apiParams]),
    
    hasActiveFilters: useCallback(() => {
      return Object.keys(currentFilters).length > 0 || appliedFilters.length > 0;
    }, [currentFilters, appliedFilters]),
    
    applyQuickFilter: useCallback((filterType, value) => {
      const filterConfig = {
        'active': { status: ['ACTIVE'] },
        'onboarding': { status: ['ONBOARDING'] },
        'onLeave': { status: ['ON_LEAVE'] },
        'probation': { status: ['PROBATION'] },
        'noManager': { line_manager: null },
        'hasDocuments': { has_documents: true },
        'noGrade': { grading_level: '' },
        'newHires': { years_of_service_max: 0.25 },
        'contractEnding': { contract_ending_30_days: true }
      };
      
      if (filterConfig[filterType]) {
        dispatch(setCurrentFilters({ ...currentFilters, ...filterConfig[filterType] }));
      }
    }, [dispatch, currentFilters]),
    
    searchEmployees: useCallback((searchTerm) => {
      dispatch(updateFilter({ key: 'search', value: searchTerm }));
    }, [dispatch]),
    
    // ========================================
    // SORTING HELPERS
    // ========================================
    getSortDirection: useCallback((field) => getSortDirection(field), [getSortDirection]),
    isSorted: useCallback((field) => isSorted(field), [isSorted]),
    getSortIndex: useCallback((field) => getSortIndex(field), [getSortIndex]),
    
    // ========================================
    // SELECTION HELPERS
    // ========================================
    isSelected: useCallback((employeeId) => selectedEmployees.includes(employeeId), [selectedEmployees]),
    
    selectByFilter: useCallback((filterCriteria) => {
      const matchingEmployees = employees.filter(emp => {
        return Object.entries(filterCriteria).every(([key, value]) => {
          switch (key) {
            case 'status':
              return emp.status_name === value;
            case 'department':
              return emp.department === value;
            case 'position_group':
              return emp.position_group === value;
            case 'needs_grading':
              return value ? !emp.grading_level : !!emp.grading_level;
            case 'no_line_manager':
              return value ? !emp.line_manager : !!emp.line_manager;
            default:
              return true;
          }
        });
      });
      
      dispatch(setSelectedEmployees(matchingEmployees.map(emp => emp.id)));
    }, [employees, dispatch]),
    
    // ========================================
    // EXPORT HELPERS
    // ========================================
    exportWithCurrentFilters: useCallback((format = 'excel') => {
      return dispatch(exportEmployees({ format, params: apiParams }));
    }, [dispatch, apiParams]),
    
    exportSelected: useCallback((format = 'excel') => {
      if (selectedEmployees.length === 0) {
        throw new Error('No employees selected for export');
      }
      
      const params = { 
        employee_ids: selectedEmployees,
        format: format
      };
      return dispatch(exportEmployees({ format, params }));
    }, [dispatch, selectedEmployees]),
    
    exportAll: useCallback((format = 'excel') => {
      return dispatch(exportEmployees({ format, params: { all: true } }));
    }, [dispatch]),
    
    // ========================================
    // BULK ACTION HELPERS
    // ========================================
    bulkActionOnSelected: useCallback((action, data = {}) => {
      if (selectedEmployees.length === 0) {
        throw new Error('No employees selected');
      }
      
      switch (action) {
        case 'delete':
          return dispatch(bulkDeleteEmployees(selectedEmployees));
        case 'softDelete':
          return dispatch(softDeleteEmployees(selectedEmployees));
        case 'restore':
          return dispatch(restoreEmployees(selectedEmployees));
        case 'updateStatus':
          return dispatch(updateEmployeeStatus(selectedEmployees));
        case 'addTags':
          if (!data.tagIds || data.tagIds.length === 0) {
            throw new Error('No tags specified');
          }
          return dispatch(bulkAddTags({ employeeIds: selectedEmployees, tagIds: data.tagIds }));
        case 'removeTags':
          if (!data.tagIds || data.tagIds.length === 0) {
            throw new Error('No tags specified');
          }
          return dispatch(bulkRemoveTags({ employeeIds: selectedEmployees, tagIds: data.tagIds }));
        case 'updateGrades':
          if (!data.updates || data.updates.length === 0) {
            throw new Error('No grade updates specified');
          }
          return dispatch(bulkUpdateEmployeeGrades(data.updates));
        case 'updateLineManager':
          if (!data.lineManagerId) {
            throw new Error('No line manager specified');
          }
          return dispatch(bulkUpdateLineManager({ employeeIds: selectedEmployees, lineManagerId: data.lineManagerId }));
        default:
          throw new Error(`Unknown bulk action: ${action}`);
      }
    }, [dispatch, selectedEmployees]),
    
    // ========================================
    // GRADING HELPERS
    // ========================================
    bulkGradeSelected: useCallback((gradingLevel) => {
      if (selectedEmployees.length === 0) {
        throw new Error('No employees selected for grading');
      }
      
      const updates = selectedEmployees.map(employeeId => ({
        employee_id: employeeId,
        grading_level: gradingLevel
      }));
      
      return dispatch(bulkUpdateEmployeeGrades(updates));
    }, [dispatch, selectedEmployees]),
    
    gradeEmployeesByPositionGroup: useCallback((positionGroupId, gradingLevel) => {
      const employeesInPositionGroup = employees.filter(emp => emp.position_group === positionGroupId);
      
      if (employeesInPositionGroup.length === 0) {
        throw new Error('No employees found in this position group');
      }
      
      const updates = employeesInPositionGroup.map(emp => ({
        employee_id: emp.id,
        grading_level: gradingLevel
      }));
      
      return dispatch(bulkUpdateEmployeeGrades(updates));
    }, [dispatch, employees]),
    
    getEligibleEmployeesForGrading: useCallback(() => {
      return employees.filter(emp => {
        // Filter out employees who can't be graded
        if (emp.status_name === 'INACTIVE' || emp.status_name === 'TERMINATED') {
          return false;
        }
        
        // Check if employee is in probation (configurable rule)
        if (emp.status_name === 'PROBATION') {
          return false; // Can be made configurable
        }
        
        return true;
      });
    }, [employees]),
    
    // ========================================
    // ANALYTICS HELPERS
    // ========================================
    calculateRetentionRate: useCallback((periodInMonths = 12) => {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - periodInMonths);
      
      const employeesAtStart = employees.filter(emp => {
        const startDate = new Date(emp.start_date);
        return startDate <= cutoffDate;
      });
      
      const stillEmployed = employeesAtStart.filter(emp => {
        return emp.status_name === 'ACTIVE' || emp.status_name === 'ON_LEAVE';
      });
      
      return employeesAtStart.length > 0 ? (stillEmployed.length / employeesAtStart.length) * 100 : 0;
    }, [employees]),
    
    calculateAverageTimeToGrade: useCallback(() => {
      const gradedEmployees = employees.filter(emp => emp.grading_level && emp.start_date);
      
      if (gradedEmployees.length === 0) return 0;
      
      const totalDays = gradedEmployees.reduce((sum, emp) => {
        const startDate = new Date(emp.start_date);
        const gradingDate = new Date(emp.updated_at || emp.created_at);
        const diffTime = Math.abs(gradingDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      
      return Math.round(totalDays / gradedEmployees.length);
    }, [employees]),
    
    getPerformanceMetrics: useCallback(() => {
      return {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(emp => emp.status_name === 'ACTIVE').length,
        gradingCompletion: gradingProgress,
        averageServiceYears: employees.reduce((sum, emp) => sum + (emp.years_of_service || 0), 0) / employees.length || 0,
        retentionRate: helpers.calculateRetentionRate(),
        averageTimeToGrade: helpers.calculateAverageTimeToGrade(),
        departmentDistribution: employeesByDepartment,
        statusDistribution: employeesByStatus,
        gradingDistribution: gradingDistribution
      };
    }, [employees, gradingProgress, employeesByDepartment, employeesByStatus, gradingDistribution]),
    
    // ========================================
    // NAVIGATION HELPERS
    // ========================================
    goToPage: useCallback((page) => {
      dispatch(setCurrentPage(page));
    }, [dispatch]),
    
    goToNextPage: useCallback(() => {
      if (computed.hasNextPage) {
        dispatch(goToNextPage());
      }
    }, [dispatch, computed.hasNextPage]),
    
    goToPreviousPage: useCallback(() => {
      if (computed.hasPreviousPage) {
        dispatch(goToPreviousPage());
      }
    }, [dispatch, computed.hasPreviousPage]),
    
    // ========================================
    // VALIDATION HELPERS
    // ========================================
    validateEmployee: useCallback((employeeData) => {
      const errors = {};
      
      // Required fields validation
      if (!employeeData.first_name || !employeeData.first_name.trim()) {
        errors.first_name = 'First name is required';
      }
      
      if (!employeeData.last_name || !employeeData.last_name.trim()) {
        errors.last_name = 'Last name is required';
      }
      
      if (!employeeData.email || !employeeData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!employeeData.employee_id || !employeeData.employee_id.trim()) {
        errors.employee_id = 'Employee ID is required';
      }
      
      if (!employeeData.job_title || !employeeData.job_title.trim()) {
        errors.job_title = 'Job title is required';
      }
      
      if (!employeeData.business_function) {
        errors.business_function = 'Business function is required';
      }
      
      if (!employeeData.department) {
        errors.department = 'Department is required';
      }
      
      if (!employeeData.job_function) {
        errors.job_function = 'Job function is required';
      }
      
      if (!employeeData.position_group) {
        errors.position_group = 'Position group is required';
      }
      
      if (!employeeData.start_date) {
        errors.start_date = 'Start date is required';
      }
      
      if (!employeeData.contract_duration) {
        errors.contract_duration = 'Contract duration is required';
      }
      
      // Date validation
      if (employeeData.start_date && employeeData.end_date) {
        const startDate = new Date(employeeData.start_date);
        const endDate = new Date(employeeData.end_date);
        
        if (endDate <= startDate) {
          errors.end_date = 'End date must be after start date';
        }
      }
      
      // Contract validation
      if (employeeData.contract_start_date && employeeData.contract_end_date) {
        const contractStart = new Date(employeeData.contract_start_date);
        const contractEnd = new Date(employeeData.contract_end_date);
        
        if (contractEnd <= contractStart) {
          errors.contract_end_date = 'Contract end date must be after contract start date';
        }
      }
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    }, []),
    
    validateGradeAssignment: useCallback((employeeData, gradingLevel) => {
      const validation = { isValid: true, errors: [], warnings: [] };
      
      if (!employeeData || !gradingLevel) {
        validation.isValid = false;
        validation.errors.push('Employee data and grading level are required');
        return validation;
      }
      
      // Check if employee is active
      if (employeeData.status_name !== 'ACTIVE') {
        validation.warnings.push('Employee is not currently active');
      }
      
      // Check if employee has been with company long enough
      if ((employeeData.years_of_service || 0) < 0.25) {
        validation.warnings.push('Employee has less than 3 months of service');
      }
      
      // Check if employee has line manager
      if (!employeeData.line_manager) {
        validation.warnings.push('Employee does not have a line manager assigned');
      }
      
      return validation;
    }, []),
    
    // ========================================
    // UTILITY HELPERS
    // ========================================
    formatEmployeeDisplayName: useCallback((employee) => {
      if (employee.name) return employee.name;
      return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown Employee';
    }, []),
    
    getEmployeeAge: useCallback((employee) => {
      if (!employee.date_of_birth) return null;
      const birthDate = new Date(employee.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
      }
      
      return age;
    }, []),
    
    getServiceDuration: useCallback((employee) => {
      if (!employee.start_date) return null;
      
      const startDate = new Date(employee.start_date);
      const today = new Date();
      const diffTime = Math.abs(today - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      
      if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
      } else {
        return `${months} month${months > 1 ? 's' : ''}`;
      }
    }, []),
    
    getContractStatus: useCallback((employee) => {
      if (!employee.contract_end_date) return 'Permanent';
      
      const endDate = new Date(employee.contract_end_date);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return 'Expired';
      } else if (diffDays <= 30) {
        return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else {
        return 'Active';
      }
    }, [])
  };

  // ========================================
  // AUTO-FETCH EFFECTS
  // ========================================
  
  // Auto-fetch on mount and when params change
  useEffect(() => {
    actions.fetchEmployees(apiParams);
  }, [apiParams]);

  // Auto-fetch filter options and statistics on mount
  useEffect(() => {
    actions.fetchFilterOptions();
    actions.fetchStatistics();
    actions.fetchEmployeeGrading();
  }, []);

  // Auto-refresh statistics when employees change
  useEffect(() => {
    if (employees.length > 0) {
      // Debounce statistics refresh
      const timer = setTimeout(() => {
        actions.fetchStatistics();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [employees.length]);

  // ========================================
  // RETURN HOOK INTERFACE
  // ========================================
  return {
    // ========================================
    // DATA
    // ========================================
    employees,
    formattedEmployees,
    currentEmployee,
    filterOptions,
    selectedEmployees,
    currentFilters,
    appliedFilters,
    statistics,
    orgChart,
    pagination,
    sorting,
    activities,
    lineManagers,
    viewMode,
    showAdvancedFilters,
    
    // ========================================
    // GRADING DATA
    // ========================================
    gradingData,
    gradingStatistics,
    allGradingLevels,
    showGradingPanel,
    gradingMode,
    employeesNeedingGrades,
    employeesByGradeLevel,
    employeesByPositionGroup,
    gradingProgress,
    gradingDistribution,
    
    // ========================================
    // ANALYTICS DATA
    // ========================================
    headcountSummaries,
    vacantPositions,
    employeesByStatus,
    employeesByDepartment,
    newHires,
    employeesNeedingAttention,
    dashboardSummary,
    employeeMetrics,
    
    // ========================================
    // LOADING & ERROR STATES
    // ========================================
    loading,
    error,
    isAnyLoading,
    hasAnyError,
    
    // ========================================
    // COMPUTED VALUES
    // ========================================
    ...computed,
    
    // ========================================
    // ACTIONS
    // ========================================
    ...actions,
    
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    ...helpers,
    
    // ========================================
    // RAW SELECTORS FOR ADVANCED USAGE
    // ========================================
    getSortDirection,
    isSorted,
    getSortIndex,
    sortingForBackend,
    apiParams,
    selectionInfo,
    filteredEmployeesCount
  };
};

// ========================================
// ADDITIONAL SPECIALIZED HOOKS
// ========================================

// Hook for line manager selection and management
export const useLineManagers = (searchTerm = '') => {
  const dispatch = useDispatch();
  const [lineManagers, setLineManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchLineManagers = useCallback(async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dispatch(getLineManagers({ search }));
      
      if (response.type.endsWith('/fulfilled')) {
        setLineManagers(response.payload);
      } else {
        setError(response.payload);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch line managers');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);
  
  useEffect(() => {
    fetchLineManagers(searchTerm);
  }, [fetchLineManagers, searchTerm]);
  
  return {
    lineManagers,
    loading,
    error,
    refetch: fetchLineManagers
  };
};

// Hook for employee form management with validation
export const useEmployeeForm = (initialData = null) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { validateEmployee } = useEmployees();
  
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);
  
  const updateMultipleFields = useCallback((fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
    setIsDirty(true);
  }, []);
  
  const validateForm = useCallback(() => {
    const validation = validateEmployee(formData);
    setErrors(validation.errors);
    return validation;
  }, [formData, validateEmployee]);
  
  const resetForm = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialData]);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const setSubmitting = useCallback((submitting) => {
    setIsSubmitting(submitting);
  }, []);
  
  return {
    formData,
    errors,
    isDirty,
    isSubmitting,
    updateField,
    updateMultipleFields,
    validateForm,
    resetForm,
    clearErrors,
    setFormData,
    setSubmitting,
    hasErrors: Object.keys(errors).length > 0,
    isValid: Object.keys(errors).length === 0 && isDirty
  };
};

export default useEmployees;