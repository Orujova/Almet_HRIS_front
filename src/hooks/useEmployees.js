// src/hooks/useEmployees.js - Enhanced with comprehensive API integration
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
  getStatusPreview,
  bulkUpdateStatuses,
  fetchEmployeeGrading,
  bulkUpdateEmployeeGrades,
  fetchEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  fetchOrgChart,
  updateOrgChartVisibility,
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
  selectDocuments,
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
  const documents = useSelector(selectDocuments);
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
    
    // Tag Management
    addEmployeeTag: useCallback((employeeId, tagData) => 
      dispatch(addEmployeeTag({ employeeId, tagData })), [dispatch]),
    removeEmployeeTag: useCallback((employeeId, tagId) => 
      dispatch(removeEmployeeTag({ employeeId, tagId })), [dispatch]),
    bulkAddTags: useCallback((employeeIds, tagIds) => 
      dispatch(bulkAddTags({ employeeIds, tagIds })), [dispatch]),
    bulkRemoveTags: useCallback((employeeIds, tagIds) => 
      dispatch(bulkRemoveTags({ employeeIds, tagIds })), [dispatch]),
    
    // Status Management with Auto-transitions
    updateEmployeeStatus: useCallback((id) => dispatch(updateEmployeeStatus(id)), [dispatch]),
    getStatusPreview: useCallback((id) => dispatch(getStatusPreview(id)), [dispatch]),
    bulkUpdateStatuses: useCallback((employeeIds) => dispatch(bulkUpdateStatuses(employeeIds)), [dispatch]),
    
    // Grading Management
    fetchEmployeeGrading: useCallback(() => dispatch(fetchEmployeeGrading()), [dispatch]),
    bulkUpdateEmployeeGrades: useCallback((updates) => dispatch(bulkUpdateEmployeeGrades(updates)), [dispatch]),
    
    // Document Management (Optional)
    fetchEmployeeDocuments: useCallback((employeeId) => dispatch(fetchEmployeeDocuments(employeeId)), [dispatch]),
    uploadEmployeeDocument: useCallback((formData) => dispatch(uploadEmployeeDocument(formData)), [dispatch]),
    deleteEmployeeDocument: useCallback((id) => dispatch(deleteEmployeeDocument(id)), [dispatch]),
    
    // Org Chart
    fetchOrgChart: useCallback(() => dispatch(fetchOrgChart()), [dispatch]),
    updateOrgChartVisibility: useCallback((data) => dispatch(updateOrgChartVisibility(data)), [dispatch]),
    
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
    exportWithCurrentFilters: useCallback((format = 'csv') => {
      return dispatch(exportEmployees({ format, params: apiParams }));
    }, [dispatch, apiParams]),
    
    exportSelected: useCallback((format = 'csv') => {
      const params = { ...apiParams, employee_ids: selectedEmployees.join(',') };
      return dispatch(exportEmployees({ format, params }));
    }, [dispatch, apiParams, selectedEmployees]),
    
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
        default:
          return Promise.resolve();
      }
    }, [dispatch, selectedEmployees]),
  };

  // Auto-fetch on mount and when params change
  useEffect(() => {
    actions.fetchEmployees(apiParams);
  }, [apiParams]);

  // Auto-fetch filter options on mount
  useEffect(() => {
    actions.fetchFilterOptions();
    actions.fetchStatistics();
  }, []);

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
    documents,
    
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

