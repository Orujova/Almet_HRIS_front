// src/hooks/useEmployees.js - UPDATED with complete backend integration
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
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
  addEmployeeTag,
  removeEmployeeTag,
  bulkAddTags,
  bulkRemoveTags,
  updateEmployeeStatus,
  bulkUpdateStatuses,
  fetchEmployeeGrading,
  bulkUpdateEmployeeGrades,
  fetchOrgChart,
  exportEmployees,
  setSelectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  clearSelection,
  setCurrentFilters,
  addFilter,
  removeFilter,
  clearFilters,
  setSorting,
  addSort,
  removeSort,
  clearSorting,
  setPageSize,
  setCurrentPage,
  toggleAdvancedFilters,
  setShowAdvancedFilters,
  clearErrors,
  clearCurrentEmployee,
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
  selectFormattedEmployees,
  selectSortingForBackend,
  selectFilteredEmployeesCount,
  selectGetSortDirection,
  selectIsSorted,
  selectGetSortIndex,
  selectApiParams
} from '../store/slices/employeeSlice';

export const useEmployees = () => {
  const dispatch = useDispatch();
  
  // Main selectors
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
  const gradingData = useSelector(selectGradingData);
  const filteredEmployeesCount = useSelector(selectFilteredEmployeesCount);
  const sortingForBackend = useSelector(selectSortingForBackend);
  const apiParams = useSelector(selectApiParams);

  // Helper functions
  const getSortDirection = useSelector(selectGetSortDirection);
  const isSorted = useSelector(selectIsSorted);
  const getSortIndex = useSelector(selectGetSortIndex);

  // Basic CRUD Actions
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
    
    // Tag Management - Enhanced with backend integration
    addEmployeeTag: useCallback((employeeId, tagData) => 
      dispatch(addEmployeeTag({ employeeId, tagData })), [dispatch]),
    removeEmployeeTag: useCallback((employeeId, tagId) => 
      dispatch(removeEmployeeTag({ employeeId, tagId })), [dispatch]),
    bulkAddTags: useCallback((employeeIds, tagIds) => 
      dispatch(bulkAddTags({ employeeIds, tagIds })), [dispatch]),
    bulkRemoveTags: useCallback((employeeIds, tagIds) => 
      dispatch(bulkRemoveTags({ employeeIds, tagIds })), [dispatch]),
    
    // Status Management - Automatic transitions
    updateEmployeeStatus: useCallback((employeeIds) => {
      const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
      return dispatch(updateEmployeeStatus(ids));
    }, [dispatch]),
    bulkUpdateStatuses: useCallback((employeeIds) => dispatch(bulkUpdateStatuses(employeeIds)), [dispatch]),
    
    // Auto-update all employee statuses based on contract dates
    autoUpdateAllStatuses: useCallback(() => {
      // This will update all employees whose status should change based on dates
      return dispatch(updateEmployeeStatus([])); // Empty array means update all eligible
    }, [dispatch]),
    
    // Grading Management
    fetchEmployeeGrading: useCallback(() => dispatch(fetchEmployeeGrading()), [dispatch]),
    bulkUpdateEmployeeGrades: useCallback((updates) => dispatch(bulkUpdateEmployeeGrades(updates)), [dispatch]),
    
    // Org Chart
    fetchOrgChart: useCallback(() => dispatch(fetchOrgChart()), [dispatch]),
    
    // Export with Filters
    exportEmployees: useCallback((format, params) => dispatch(exportEmployees({ format, params })), [dispatch]),
    
    // Selection Management
    setSelectedEmployees: useCallback((employees) => dispatch(setSelectedEmployees(employees)), [dispatch]),
    toggleEmployeeSelection: useCallback((employeeId) => dispatch(toggleEmployeeSelection(employeeId)), [dispatch]),
    selectAllEmployees: useCallback(() => dispatch(selectAllEmployees()), [dispatch]),
    clearSelection: useCallback(() => dispatch(clearSelection()), [dispatch]),
    
    // Filter Management
    setCurrentFilters: useCallback((filters) => dispatch(setCurrentFilters(filters)), [dispatch]),
    addFilter: useCallback((filter) => dispatch(addFilter(filter)), [dispatch]),
    removeFilter: useCallback((key) => dispatch(removeFilter(key)), [dispatch]),
    clearFilters: useCallback(() => dispatch(clearFilters()), [dispatch]),
    
    // Excel-style Sorting
    setSorting: useCallback((field, direction) => dispatch(setSorting({ field, direction })), [dispatch]),
    addSort: useCallback((field, direction) => dispatch(addSort({ field, direction })), [dispatch]),
    removeSort: useCallback((field) => dispatch(removeSort(field)), [dispatch]),
    clearSorting: useCallback(() => dispatch(clearSorting()), [dispatch]),
    
    // Pagination
    setPageSize: useCallback((size) => dispatch(setPageSize(size)), [dispatch]),
    setCurrentPage: useCallback((page) => dispatch(setCurrentPage(page)), [dispatch]),
    
    // UI State
    toggleAdvancedFilters: useCallback(() => dispatch(toggleAdvancedFilters()), [dispatch]),
    setShowAdvancedFilters: useCallback((show) => dispatch(setShowAdvancedFilters(show)), [dispatch]),
    
    // Error Management
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    clearCurrentEmployee: useCallback(() => dispatch(clearCurrentEmployee()), [dispatch]),
  };

  // Computed values
  const computed = {
    // Loading states
    isLoading: loading.employees || loading.creating || loading.updating || loading.deleting,
    isCreating: loading.creating,
    isUpdating: loading.updating,
    isDeleting: loading.deleting,
    isExporting: loading.exporting,
    
    // Selection
    hasSelection: selectedEmployees.length > 0,
    selectionCount: selectedEmployees.length,
    isAllSelected: selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0,
    
    // Filters
    hasActiveFilters: Object.keys(currentFilters).length > 0 || appliedFilters.length > 0,
    activeFilterCount: Object.keys(currentFilters).length + appliedFilters.length,
    
    // Sorting
    hasSorting: sorting.length > 0,
    sortingCount: sorting.length,
    
    // Pagination
    hasNextPage: pagination.page < pagination.totalPages,
    hasPreviousPage: pagination.page > 1,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    
    // Data
    isEmpty: formattedEmployees.length === 0,
    filteredCount: filteredEmployeesCount,
  };

  // Helper functions
  const helpers = {
    // Build query parameters for API calls
    buildQueryParams: useCallback(() => apiParams, [apiParams]),
    
    // Refresh data
    refreshEmployees: useCallback(() => {
      dispatch(fetchEmployees(apiParams));
    }, [dispatch, apiParams]),
    
    refreshStatistics: useCallback(() => {
      dispatch(fetchStatistics());
    }, [dispatch]),
    
    // Filter helpers
    hasActiveFilters: useCallback(() => {
      return Object.keys(currentFilters).length > 0 || appliedFilters.length > 0;
    }, [currentFilters, appliedFilters]),
    
    // Sorting helpers
    getSortDirection: useCallback((field) => getSortDirection(field), [getSortDirection]),
    isSorted: useCallback((field) => isSorted(field), [isSorted]),
    getSortIndex: useCallback((field) => getSortIndex(field), [getSortIndex]),
    
    // Selection helpers
    isSelected: useCallback((employeeId) => selectedEmployees.includes(employeeId), [selectedEmployees]),
    
    // Export helpers
    exportWithCurrentFilters: useCallback((format = 'excel') => {
      return dispatch(exportEmployees({ format, params: apiParams }));
    }, [dispatch, apiParams]),
    
    exportSelected: useCallback((format = 'excel') => {
      const params = { 
        employee_ids: selectedEmployees,
        format: format
      };
      return dispatch(exportEmployees({ format, params }));
    }, [dispatch, selectedEmployees]),
    
    // Bulk action helpers
    bulkActionOnSelected: useCallback((action, data = {}) => {
      if (selectedEmployees.length === 0) return Promise.resolve();
      
      switch (action) {
        case 'delete':
          return dispatch(bulkDeleteEmployees(selectedEmployees));
        case 'updateStatus':
          return dispatch(bulkUpdateStatuses(selectedEmployees));
        case 'addTags':
          return dispatch(bulkAddTags({ employeeIds: selectedEmployees, tagIds: data.tagIds }));
        case 'removeTags':
          return dispatch(bulkRemoveTags({ employeeIds: selectedEmployees, tagIds: data.tagIds }));
        case 'updateGrades':
          const updates = selectedEmployees.map(id => ({ employee_id: id, ...data }));
          return dispatch(bulkUpdateEmployeeGrades(updates));
        case 'updateLineManager':
          return dispatch(bulkUpdateLineManager({ employeeIds: selectedEmployees, lineManagerId: data.lineManagerId }));
        default:
          return Promise.resolve();
      }
    }, [dispatch, selectedEmployees]),
    
    // Advanced filtering helpers
    applyQuickFilter: useCallback((filterType, value) => {
      const filterConfig = {
        'active': { status: ['ACTIVE'] },
        'onboarding': { status: ['ONBOARDING'] },
        'onLeave': { status: ['ON_LEAVE'] },
        'probation': { status: ['PROBATION'] },
        'noManager': { line_manager: null },
        'hasDocuments': { has_documents: true },
        'noGrade': { grading_level: '' }
      };
      
      if (filterConfig[filterType]) {
        dispatch(setCurrentFilters({ ...currentFilters, ...filterConfig[filterType] }));
      }
    }, [dispatch, currentFilters]),
    
    // Search helpers
    searchEmployees: useCallback((searchTerm) => {
      dispatch(setCurrentFilters({ ...currentFilters, search: searchTerm }));
    }, [dispatch, currentFilters]),
    
    // Tag management helpers
    addTagToSelected: useCallback((tagId) => {
      if (selectedEmployees.length === 0) return;
      return dispatch(bulkAddTags({ employeeIds: selectedEmployees, tagIds: [tagId] }));
    }, [dispatch, selectedEmployees]),
    
    removeTagFromSelected: useCallback((tagId) => {
      if (selectedEmployees.length === 0) return;
      return dispatch(bulkRemoveTags({ employeeIds: selectedEmployees, tagIds: [tagId] }));
    }, [dispatch, selectedEmployees]),
    
    // Status management helpers
    updateStatusForSelected: useCallback(() => {
      if (selectedEmployees.length === 0) return;
      return dispatch(updateEmployeeStatus(selectedEmployees));
    }, [dispatch, selectedEmployees]),
    
    // Navigation helpers
    goToPage: useCallback((page) => {
      dispatch(setCurrentPage(page));
    }, [dispatch]),
    
    goToNextPage: useCallback(() => {
      if (computed.hasNextPage) {
        dispatch(setCurrentPage(pagination.page + 1));
      }
    }, [dispatch, computed.hasNextPage, pagination.page]),
    
    goToPreviousPage: useCallback(() => {
      if (computed.hasPreviousPage) {
        dispatch(setCurrentPage(pagination.page - 1));
      }
    }, [dispatch, computed.hasPreviousPage, pagination.page]),
    
    // Validation helpers
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
  };

  // Auto-fetch on mount and when params change
  useEffect(() => {
    actions.fetchEmployees(apiParams);
  }, [apiParams]);

  // Auto-fetch filter options and statistics on mount
  useEffect(() => {
    actions.fetchFilterOptions();
    actions.fetchStatistics();
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

  return {
    // Data
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
    gradingData,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
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
  };
};

// Additional hook for line manager selection
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

// Hook for employee form management
export const useEmployeeForm = (initialData = null) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
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
  }, [initialData]);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  return {
    formData,
    errors,
    isDirty,
    updateField,
    updateMultipleFields,
    validateForm,
    resetForm,
    clearErrors,
    setFormData,
    hasErrors: Object.keys(errors).length > 0
  };
};