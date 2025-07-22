// src/hooks/useEmployees.js - Backend endpointlərinə uyğun yenilənilib
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
  fetchEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchStatistics,
  softDeleteEmployees,
  restoreEmployees,
  addEmployeeTag,
  removeEmployeeTag,
  bulkAddTags,
  bulkRemoveTags,
  assignLineManager,
  bulkAssignLineManager,
  extendEmployeeContract,
  bulkExtendContracts,
  getContractExpiryAlerts,
  getContractsExpiringSoon,
  fetchEmployeeGrading,
  bulkUpdateEmployeeGrades,
  updateSingleEmployeeGrade,
  exportEmployees,
  downloadEmployeeTemplate,
  bulkUploadEmployees,
  fetchEmployeeActivities,
  fetchEmployeeDirectReports,
  fetchEmployeeStatusPreview,
  fetchOrganizationalHierarchy,
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
  selectSelectedEmployees,
  selectCurrentFilters,
  selectAppliedFilters,
  selectStatistics,
  selectPagination,
  selectSorting,
  selectGradingData,
  selectGradingStatistics,
  selectAllGradingLevels,
  selectActivities,
  selectDirectReports,
  selectStatusPreviews,
  selectViewMode,
  selectShowAdvancedFilters,
  selectShowGradingPanel,
  selectGradingMode,
  selectContractExpiryAlerts,
  selectContractsExpiringSoon,
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

// Reference data import
import {
  fetchBusinessFunctions,
  fetchJobFunctions,
  fetchPositionGroups,
  fetchEmployeeStatuses,
  fetchEmployeeTags
} from '../store/slices/referenceDataSlice';

export const useEmployees = () => {
  const dispatch = useDispatch();
  
  // Refs to prevent infinite loops
  const isInitialized = useRef(false);
  const lastFetchParams = useRef(null);
  
  // Main data selectors
  const employees = useSelector(selectEmployees);
  const formattedEmployees = useSelector(selectFormattedEmployees);
  const currentEmployee = useSelector(selectCurrentEmployee);
  const loading = useSelector(selectEmployeeLoading);
  const error = useSelector(selectEmployeeError);
  const selectedEmployees = useSelector(selectSelectedEmployees);
  const currentFilters = useSelector(selectCurrentFilters);
  const appliedFilters = useSelector(selectAppliedFilters);
  const statistics = useSelector(selectStatistics);
  const pagination = useSelector(selectPagination);
  const sorting = useSelector(selectSorting);
  const activities = useSelector(selectActivities);
  const directReports = useSelector(selectDirectReports);
  const statusPreviews = useSelector(selectStatusPreviews);
  const viewMode = useSelector(selectViewMode);
  const showAdvancedFilters = useSelector(selectShowAdvancedFilters);
  
  // Grading data selectors
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
  
  // Analytics & statistics selectors
  const contractExpiryAlerts = useSelector(selectContractExpiryAlerts);
  const contractsExpiringSoon = useSelector(selectContractsExpiringSoon);
  const employeesByStatus = useSelector(selectEmployeesByStatus);
  const employeesByDepartment = useSelector(selectEmployeesByDepartment);
  const newHires = useSelector(selectNewHires);
  const employeesNeedingAttention = useSelector(selectEmployeesNeedingAttention);
  const dashboardSummary = useSelector(selectDashboardSummary);
  const employeeMetrics = useSelector(selectEmployeeMetrics);
  
  // Computed selectors
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

  // CRUD actions - backend endpointlərinə uyğun
  const actions = {
    // Fetch operations
    fetchEmployees: useCallback((params) => dispatch(fetchEmployees(params)), [dispatch]),
    fetchEmployee: useCallback((id) => dispatch(fetchEmployee(id)), [dispatch]),
    
    // Filter options loading
    fetchFilterOptions: useCallback(() => {
      console.log('🔄 Loading filter options...');
      
      if (isInitialized.current) {
        console.log('⚠️ Filter options already loaded');
        return Promise.resolve();
      }
      
      isInitialized.current = true;
      
      return Promise.all([
        dispatch(fetchBusinessFunctions()),
        dispatch(fetchJobFunctions()), 
        dispatch(fetchPositionGroups()),
        dispatch(fetchEmployeeStatuses()),
        dispatch(fetchEmployeeTags())
      ]).catch(error => {
        console.error('❌ Failed to load filter options:', error);
        isInitialized.current = false;
        throw error;
      });
    }, [dispatch]),
    
    // Create/Update/Delete
    createEmployee: useCallback((data) => dispatch(createEmployee(data)), [dispatch]),
    updateEmployee: useCallback((id, data) => dispatch(updateEmployee({ id, data })), [dispatch]),
    deleteEmployee: useCallback((id) => dispatch(deleteEmployee(id)), [dispatch]),
    
    // Statistics
    fetchStatistics: useCallback(() => dispatch(fetchStatistics()), [dispatch]),
    
    // Bulk Operations - backend endpointlərinə uyğun
    softDeleteEmployees: useCallback((ids) => dispatch(softDeleteEmployees(ids)), [dispatch]),
    restoreEmployees: useCallback((ids) => dispatch(restoreEmployees(ids)), [dispatch]),
    
    // Tag management
    addEmployeeTag: useCallback((employee_id, tag_id) => 
      dispatch(addEmployeeTag({ employee_id, tag_id })), [dispatch]),
    removeEmployeeTag: useCallback((employee_id, tag_id) => 
      dispatch(removeEmployeeTag({ employee_id, tag_id })), [dispatch]),
    bulkAddTags: useCallback((employee_ids, tag_id) => 
      dispatch(bulkAddTags({ employee_ids, tag_id })), [dispatch]),
    bulkRemoveTags: useCallback((employee_ids, tag_id) => 
      dispatch(bulkRemoveTags({ employee_ids, tag_id })), [dispatch]),
    
    // Line manager management
    assignLineManager: useCallback((employee_id, line_manager_id) => 
      dispatch(assignLineManager({ employee_id, line_manager_id })), [dispatch]),
    bulkAssignLineManager: useCallback((employee_ids, line_manager_id) => 
      dispatch(bulkAssignLineManager({ employee_ids, line_manager_id })), [dispatch]),
    
    // Contract management
    extendEmployeeContract: useCallback((data) => dispatch(extendEmployeeContract(data)), [dispatch]),
    bulkExtendContracts: useCallback((data) => dispatch(bulkExtendContracts(data)), [dispatch]),
    getContractExpiryAlerts: useCallback((params) => dispatch(getContractExpiryAlerts(params)), [dispatch]),
    getContractsExpiringSoon: useCallback((params) => dispatch(getContractsExpiringSoon(params)), [dispatch]),
    
    // Grading management
    fetchEmployeeGrading: useCallback(() => dispatch(fetchEmployeeGrading()), [dispatch]),
    bulkUpdateEmployeeGrades: useCallback((updates) => dispatch(bulkUpdateEmployeeGrades(updates)), [dispatch]),
    updateSingleEmployeeGrade: useCallback((employee_id, grading_level) => 
      dispatch(updateSingleEmployeeGrade({ employee_id, grading_level })), [dispatch]),
    
    // Export & template
    exportEmployees: useCallback((format, params) => dispatch(exportEmployees({ format, params })), [dispatch]),
    downloadEmployeeTemplate: useCallback(() => dispatch(downloadEmployeeTemplate()), [dispatch]),
    bulkUploadEmployees: useCallback((file) => dispatch(bulkUploadEmployees(file)), [dispatch]),
    
    // Activities & org chart
    fetchEmployeeActivities: useCallback((employeeId) => dispatch(fetchEmployeeActivities(employeeId)), [dispatch]),
    fetchEmployeeDirectReports: useCallback((employeeId) => dispatch(fetchEmployeeDirectReports(employeeId)), [dispatch]),
    fetchEmployeeStatusPreview: useCallback((employeeId) => dispatch(fetchEmployeeStatusPreview(employeeId)), [dispatch]),
    fetchOrganizationalHierarchy: useCallback((params) => dispatch(fetchOrganizationalHierarchy(params)), [dispatch]),
    
    // Selection management
    setSelectedEmployees: useCallback((employees) => dispatch(setSelectedEmployees(employees)), [dispatch]),
    toggleEmployeeSelection: useCallback((employeeId) => dispatch(toggleEmployeeSelection(employeeId)), [dispatch]),
    selectAllEmployees: useCallback(() => dispatch(selectAllEmployees()), [dispatch]),
    selectAllVisible: useCallback(() => dispatch(selectAllVisible()), [dispatch]),
    clearSelection: useCallback(() => dispatch(clearSelection()), [dispatch]),
    
    // Filter management
    setCurrentFilters: useCallback((filters) => dispatch(setCurrentFilters(filters)), [dispatch]),
    addFilter: useCallback((filter) => dispatch(addFilter(filter)), [dispatch]),
    removeFilter: useCallback((key) => dispatch(removeFilter(key)), [dispatch]),
    clearFilters: useCallback(() => dispatch(clearFilters()), [dispatch]),
    updateFilter: useCallback((key, value) => dispatch(updateFilter({ key, value })), [dispatch]),
    
    // Sorting management
    setSorting: useCallback((field, direction) => dispatch(setSorting({ field, direction })), [dispatch]),
    addSort: useCallback((field, direction) => dispatch(addSort({ field, direction })), [dispatch]),
    removeSort: useCallback((field) => dispatch(removeSort(field)), [dispatch]),
    clearSorting: useCallback(() => dispatch(clearSorting()), [dispatch]),
    toggleSort: useCallback((field) => dispatch(toggleSort(field)), [dispatch]),
    
    // Pagination
    setPageSize: useCallback((size) => dispatch(setPageSize(size)), [dispatch]),
    setCurrentPage: useCallback((page) => dispatch(setCurrentPage(page)), [dispatch]),
    goToNextPage: useCallback(() => dispatch(goToNextPage()), [dispatch]),
    goToPreviousPage: useCallback(() => dispatch(goToPreviousPage()), [dispatch]),
    
    // UI state
    toggleAdvancedFilters: useCallback(() => dispatch(toggleAdvancedFilters()), [dispatch]),
    setShowAdvancedFilters: useCallback((show) => dispatch(setShowAdvancedFilters(show)), [dispatch]),
    setViewMode: useCallback((mode) => dispatch(setViewMode(mode)), [dispatch]),
    setShowGradingPanel: useCallback((show) => dispatch(setShowGradingPanel(show)), [dispatch]),
    toggleGradingPanel: useCallback(() => dispatch(toggleGradingPanel()), [dispatch]),
    setGradingMode: useCallback((mode) => dispatch(setGradingMode(mode)), [dispatch]),
    
    // Error management
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    clearError: useCallback((key) => dispatch(clearError(key)), [dispatch]),
    setError: useCallback((key, message) => dispatch(setError({ key, message })), [dispatch]),
    clearCurrentEmployee: useCallback(() => dispatch(clearCurrentEmployee()), [dispatch]),
    
    // Quick actions
    setQuickFilter: useCallback((type, value) => dispatch(setQuickFilter({ type, value })), [dispatch]),
    optimisticUpdateEmployee: useCallback((id, updates) => dispatch(optimisticUpdateEmployee({ id, updates })), [dispatch]),
    optimisticDeleteEmployee: useCallback((id) => dispatch(optimisticDeleteEmployee(id)), [dispatch]),
    optimisticUpdateEmployeeGrade: useCallback((employee_id, grading_level) => 
      dispatch(optimisticUpdateEmployeeGrade({ employee_id, grading_level })), [dispatch]),
  };

  // Computed values
  const computed = {
    // Loading states
    isLoading: loading.employees || loading.creating || loading.updating || loading.deleting,
    isCreating: loading.creating,
    isUpdating: loading.updating,
    isDeleting: loading.deleting,
    isExporting: loading.exporting,
    isLoadingTemplate: loading.template,
    isLoadingGrading: loading.grading,
    isLoadingUpload: loading.upload,
    isLoadingContractAlerts: loading.contractAlerts,
    
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
    statusUpdateCount: employeesNeedingAttention.statusUpdate.length,
    
    // Contract alerts
    totalExpiringContracts: contractExpiryAlerts.total_expiring,
    urgentContracts: contractExpiryAlerts.urgent_employees?.length || 0,
  };

  // Helper functions
  const helpers = {
    // Data refresh helpers
    refreshEmployees: useCallback(() => {
      const currentParams = JSON.stringify(apiParams);
      if (lastFetchParams.current !== currentParams) {
        lastFetchParams.current = currentParams;
        dispatch(fetchEmployees(apiParams));
      }
    }, [dispatch, apiParams]),
    
    refreshStatistics: useCallback(() => {
      dispatch(fetchStatistics());
    }, [dispatch]),
    
    refreshGradingData: useCallback(() => {
      dispatch(fetchEmployeeGrading());
    }, [dispatch]),
    
    refreshContractAlerts: useCallback(() => {
      dispatch(getContractExpiryAlerts());
      dispatch(getContractsExpiringSoon());
    }, [dispatch]),
    
    refreshAll: useCallback(() => {
      const currentParams = JSON.stringify(apiParams);
      if (lastFetchParams.current !== currentParams) {
        lastFetchParams.current = currentParams;
        dispatch(fetchEmployees(apiParams));
      }
      dispatch(fetchStatistics());
      dispatch(fetchEmployeeGrading());
      dispatch(getContractExpiryAlerts());
    }, [dispatch, apiParams]),
    
    // Filter helpers
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
        'contractEnding': { contract_ending_30_days: true },
        'statusUpdate': { status_needs_update: true }
      };
      
      if (filterConfig[filterType]) {
        dispatch(setCurrentFilters({ ...currentFilters, ...filterConfig[filterType] }));
      }
    }, [dispatch, currentFilters]),
    
    searchEmployees: useCallback((searchTerm) => {
      dispatch(updateFilter({ key: 'search', value: searchTerm }));
    }, [dispatch]),
    
    // Sorting helpers
    getSortDirection: useCallback((field) => getSortDirection(field), [getSortDirection]),
    isSorted: useCallback((field) => isSorted(field), [isSorted]),
    getSortIndex: useCallback((field) => getSortIndex(field), [getSortIndex]),
    
    // Selection helpers
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
            case 'contract_ending':
              if (!emp.contract_end_date) return false;
              const endDate = new Date(emp.contract_end_date);
              const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              return value ? endDate <= thirtyDaysFromNow : endDate > thirtyDaysFromNow;
            default:
              return true;
          }
        });
      });
      
      dispatch(setSelectedEmployees(matchingEmployees.map(emp => emp.id)));
    }, [employees, dispatch]),
    
    // Export helpers
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
    
    // Validation helpers
    validateEmployee: useCallback((employeeData) => {
      const errors = {};
      
      // Basic validation
      if (!employeeData.first_name?.trim()) {
        errors.first_name = 'First name is required';
      }
      if (!employeeData.last_name?.trim()) {
        errors.last_name = 'Last name is required';
      }
      if (!employeeData.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
        errors.email = 'Invalid email format';
      }
      if (!employeeData.employee_id?.trim()) {
        errors.employee_id = 'Employee ID is required';
      }
      
      // Business logic validation
      if (!employeeData.business_function) {
        errors.business_function = 'Business function is required';
      }
      if (!employeeData.job_title?.trim()) {
        errors.job_title = 'Job title is required';
      }
      if (!employeeData.start_date) {
        errors.start_date = 'Start date is required';
      }
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    }, []),
    
    // Employee status helpers
    getEmployeeStatusInfo: useCallback((employee) => {
      const status = employee.status_name || employee.status || 'Unknown';
      const color = employee.status_color || '#gray';
      const affectsHeadcount = employee.status_affects_headcount !== false;
      
      return {
        status,
        color,
        affectsHeadcount,
        isActive: status === 'ACTIVE',
        isOnLeave: status === 'ON_LEAVE',
        isOnboarding: status === 'ONBOARDING',
        isProbation: status === 'PROBATION',
        isInactive: status === 'INACTIVE'
      };
    }, []),
    
    // Contract helpers
    getContractInfo: useCallback((employee) => {
      const duration = employee.contract_duration || 'UNKNOWN';
      const startDate = employee.contract_start_date || employee.start_date;
      const endDate = employee.contract_end_date || employee.end_date;
      const isPermanent = duration === 'PERMANENT';
      
      let urgency = 'normal';
      if (!isPermanent && endDate) {
        const today = new Date();
        const contractEnd = new Date(endDate);
        const diffTime = contractEnd - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) urgency = 'expired';
        else if (diffDays <= 7) urgency = 'critical';
        else if (diffDays <= 30) urgency = 'urgent';
        else if (diffDays <= 60) urgency = 'attention';
      }
      
      return {
        duration,
        startDate,
        endDate,
        isPermanent,
        isTemporary: !isPermanent,
        urgency,
        daysRemaining: endDate ? Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
      };
    }, []),
    
    // Grading helpers
    getGradingInfo: useCallback((employee) => {
      const level = employee.grading_level;
      const display = employee.grading_display || (level ? level : 'No Grade');
      const hasGrade = !!level;
      
      return {
        level,
        display,
        hasGrade,
        needsGrade: !hasGrade
      };
    }, [])
  };

  // Initialization - controlled to prevent loops
  useEffect(() => {
    if (!isInitialized.current) {
      console.log('🚀 Initializing useEmployees hook...');
      actions.fetchFilterOptions().catch(error => {
        console.error('❌ Failed to initialize useEmployees:', error);
      });
    }
  }, []);

  // Controlled fetching with parameter comparison
  useEffect(() => {
    if (isInitialized.current) {
      const currentParams = JSON.stringify(apiParams);
      if (lastFetchParams.current !== currentParams) {
        console.log('🔄 API params changed, fetching employees...', apiParams);
        lastFetchParams.current = currentParams;
        dispatch(fetchEmployees(apiParams));
      }
    }
  }, [apiParams, dispatch]);

  // Initialize statistics and grading data only once
  useEffect(() => {
    if (isInitialized.current && statistics.total_employees === 0) {
      console.log('📊 Fetching initial statistics and grading data...');
      dispatch(fetchStatistics());
      dispatch(fetchEmployeeGrading());
      dispatch(getContractExpiryAlerts());
    }
  }, [isInitialized.current]);

  // Return hook interface
  return {
    // Data
    employees,
    formattedEmployees,
    currentEmployee,
    selectedEmployees,
    currentFilters,
    appliedFilters,
    statistics,
    pagination,
    sorting,
    activities,
    directReports,
    statusPreviews,
    viewMode,
    showAdvancedFilters,
    
    // Grading data
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
    
    // Analytics data
    contractExpiryAlerts,
    contractsExpiringSoon,
    employeesByStatus,
    employeesByDepartment,
    newHires,
    employeesNeedingAttention,
    dashboardSummary,
    employeeMetrics,
    
    // Loading & error states
    loading,
    error,
    isAnyLoading,
    hasAnyError,
    
    // Computed values
    ...computed,
    
    // Actions
    ...actions,
    
    // Helper functions
    ...helpers,
    
    // Raw selectors for advanced usage
    getSortDirection,
    isSorted,
    getSortIndex,
    sortingForBackend,
    apiParams,
    selectionInfo,
    filteredEmployeesCount
  };
};

// Employee form management hook
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

// Contract management hook
export const useContractManagement = () => {
  const dispatch = useDispatch();
  const contractExpiryAlerts = useSelector(selectContractExpiryAlerts);
  const contractsExpiringSoon = useSelector(selectContractsExpiringSoon);
  const loading = useSelector(selectEmployeeLoading);
  const error = useSelector(selectEmployeeError);

  const refreshAlerts = useCallback(() => {
    dispatch(getContractExpiryAlerts());
    dispatch(getContractsExpiringSoon());
  }, [dispatch]);

  const extendContract = useCallback((data) => {
    return dispatch(extendEmployeeContract(data));
  }, [dispatch]);

  const bulkExtendContracts = useCallback((data) => {
    return dispatch(bulkExtendContracts(data));
  }, [dispatch]);

  const getContractUrgency = useCallback((employee) => {
    if (!employee.contract_end_date || employee.contract_duration === 'PERMANENT') {
      return 'none';
    }
    
    const endDate = new Date(employee.contract_end_date);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 1000));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 7) return 'critical';
    if (diffDays <= 30) return 'urgent';
    if (diffDays <= 60) return 'attention';
    return 'normal';
  }, []);

  const getContractsByUrgency = useCallback(() => {
    const contracts = contractExpiryAlerts.all_employees || [];
    
    return contracts.reduce((acc, emp) => {
      const urgency = getContractUrgency(emp);
      if (!acc[urgency]) acc[urgency] = [];
      acc[urgency].push(emp);
      return acc;
    }, {});
  }, [contractExpiryAlerts, getContractUrgency]);

  // Initialize only once
  useEffect(() => {
    let isInitialized = false;
    if (!isInitialized) {
      isInitialized = true;
      refreshAlerts();
    }
  }, []);

  return {
    contractExpiryAlerts,
    contractsExpiringSoon,
    loading: loading.contractAlerts,
    error: error.contractAlerts,
    refreshAlerts,
    extendContract,
    bulkExtendContracts,
    getContractUrgency,
    getContractsByUrgency,
    hasExpiringContracts: contractExpiryAlerts.total_expiring > 0,
    urgentContractsCount: contractExpiryAlerts.urgent_employees?.length || 0,
    totalExpiringCount: contractExpiryAlerts.total_expiring || 0
  };
};

// Employee grading hook
export const useEmployeeGrading = () => {
  const dispatch = useDispatch();
  const gradingData = useSelector(selectGradingData);
  const gradingStatistics = useSelector(selectGradingStatistics);
  const allGradingLevels = useSelector(selectAllGradingLevels);
  const employeesNeedingGrades = useSelector(selectEmployeesNeedingGrades);
  const employeesByGradeLevel = useSelector(selectEmployeesByGradeLevel);
  const gradingProgress = useSelector(selectGradingProgress);
  const loading = useSelector(selectEmployeeLoading);
  const error = useSelector(selectEmployeeError);

  const refreshGradingData = useCallback(() => {
    dispatch(fetchEmployeeGrading());
  }, [dispatch]);

  const updateSingleGrade = useCallback((employee_id, grading_level) => {
    // Optimistic update
    dispatch(optimisticUpdateEmployeeGrade({ employee_id, grading_level }));
    // Actual API call
    return dispatch(updateSingleEmployeeGrade({ employee_id, grading_level }));
  }, [dispatch]);

  const bulkUpdateGrades = useCallback((updates) => {
    // Optimistic updates
    updates.forEach(({ employee_id, grading_level }) => {
      dispatch(optimisticUpdateEmployeeGrade({ employee_id, grading_level }));
    });
    // Actual API call
    return dispatch(bulkUpdateEmployeeGrades(updates));
  }, [dispatch]);

  const gradeAllInPositionGroup = useCallback((positionGroupId, gradingLevel) => {
    const employeesInGroup = gradingData.employees?.filter(
      emp => emp.position_group === positionGroupId
    ) || [];
    
    if (employeesInGroup.length === 0) {
      throw new Error('No employees found in this position group');
    }

    const updates = employeesInGroup.map(emp => ({
      employee_id: emp.id || emp.employee_id,
      grading_level: gradingLevel
    }));

    return bulkUpdateGrades(updates);
  }, [gradingData, bulkUpdateGrades]);

  const getGradingRecommendations = useCallback(() => {
    const employees = gradingData.employees || [];
    const recommendations = [];

    employees.forEach(emp => {
      if (!emp.grading_level) {
        let recommendedLevel = '_M'; // Default to median
        
        // Basic logic for recommendations based on service years and position
        const serviceYears = emp.years_of_service || 0;
        const isManager = emp.direct_reports_count > 0;
        
        if (isManager && serviceYears > 2) {
          recommendedLevel = '_UQ';
        } else if (serviceYears > 5) {
          recommendedLevel = '_UQ';
        } else if (serviceYears > 2) {
          recommendedLevel = '_M';
        } else {
          recommendedLevel = '_LQ';
        }

        recommendations.push({
          employee_id: emp.id || emp.employee_id,
          employee_name: emp.name,
          current_level: emp.grading_level,
          recommended_level: recommendedLevel,
          reason: `Based on ${serviceYears} years of service${isManager ? ' and management role' : ''}`
        });
      }
    });

    return recommendations;
  }, [gradingData]);

  // Fetch if data is empty
  useEffect(() => {
    if (!gradingData.employees || gradingData.employees.length === 0) {
      refreshGradingData();
    }
  }, []);

  return {
    gradingData,
    gradingStatistics,
    allGradingLevels,
    employeesNeedingGrades,
    employeesByGradeLevel,
    gradingProgress,
    loading: loading.grading,
    error: error.grading,
    refreshGradingData,
    updateSingleGrade,
    bulkUpdateGrades,
    gradeAllInPositionGroup,
    getGradingRecommendations,
    hasUngradedEmployees: employeesNeedingGrades.length > 0,
    gradingCompletionRate: gradingProgress,
    totalEmployeesCount: gradingStatistics.totalEmployees,
    gradedEmployeesCount: gradingStatistics.gradedEmployees,
    ungradedEmployeesCount: gradingStatistics.ungradedEmployees
  };
};

// Employee analytics hook
export const useEmployeeAnalytics = () => {
  const statistics = useSelector(selectStatistics);
  const employeesByStatus = useSelector(selectEmployeesByStatus);
  const employeesByDepartment = useSelector(selectEmployeesByDepartment);
  const employeeMetrics = useSelector(selectEmployeeMetrics);
  const dashboardSummary = useSelector(selectDashboardSummary);
  const newHires = useSelector(selectNewHires);
  const employeesNeedingAttention = useSelector(selectEmployeesNeedingAttention);

  const getAnalyticsData = useCallback(() => {
    return {
      overview: {
        totalEmployees: statistics.total_employees,
        activeEmployees: statistics.active_employees,
        inactiveEmployees: statistics.inactive_employees,
        newHires: statistics.recent_hires_30_days,
        contractEnding: statistics.upcoming_contract_endings_30_days
      },
      distribution: {
        byStatus: statistics.by_status,
        byBusinessFunction: statistics.by_business_function,
        byPositionGroup: statistics.by_position_group,
        byContractDuration: statistics.by_contract_duration
      },
      trends: {
        monthlyHires: newHires.length,
        retentionIndicators: {
          noLineManager: employeesNeedingAttention.noLineManager.length,
          onLeave: employeesNeedingAttention.onLeave.length,
          statusUpdatesNeeded: employeesNeedingAttention.statusUpdate.length
        }
      },
      performance: {
        gradingProgress: employeeMetrics.performance.gradingProgress,
        averageServiceYears: employeeMetrics.performance.averageServiceYears
      },
      demographics: {
        genderDistribution: employeeMetrics.diversity.genderDistribution,
        averageAge: employeeMetrics.diversity.averageAge
      }
    };
  }, [statistics, employeeMetrics, newHires, employeesNeedingAttention]);

  const getKPIs = useCallback(() => {
    const analytics = getAnalyticsData();
    
    return {
      headcount: {
        total: analytics.overview.totalEmployees,
        active: analytics.overview.activeEmployees,
        growth: analytics.trends.monthlyHires
      },
      engagement: {
        retention: 100 - ((analytics.trends.retentionIndicators.onLeave / analytics.overview.totalEmployees) * 100),
        managementCoverage: 100 - ((analytics.trends.retentionIndicators.noLineManager / analytics.overview.totalEmployees) * 100)
      },
      performance: {
        gradingCompletion: analytics.performance.gradingProgress,
        averageTenure: analytics.performance.averageServiceYears
      },
      risk: {
        contractRisk: (analytics.overview.contractEnding / analytics.overview.totalEmployees) * 100,
        statusRisk: (analytics.trends.retentionIndicators.statusUpdatesNeeded / analytics.overview.totalEmployees) * 100
      }
    };
  }, [getAnalyticsData]);

  return {
    statistics,
    employeesByStatus,
    employeesByDepartment,
    employeeMetrics,
    dashboardSummary,
    getAnalyticsData,
    getKPIs,
    hasData: statistics.total_employees > 0
  };
};

export default useEmployees;