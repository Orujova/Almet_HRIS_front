// src/hooks/useEmployees.js - Fixed with proper backend integration
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchFilterOptions,
  fetchStatistics,
  fetchLineManagers,
  bulkUpdateEmployees,
  fetchOrgChart,
  updateOrgChartVisibility,
  exportEmployees,
  setSelectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  clearSelection,
  setCurrentFilters,
  clearFilters,
  removeFilter,
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
  selectLineManagers,
  selectFormattedEmployees,
  selectSortingForBackend
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
  const sortingForBackend = useSelector(selectSortingForBackend);
  const lineManagers = useSelector(selectLineManagers);
  
  // Additional loading states
  const { 
    creating, 
    updating, 
    deleting, 
    bulkUpdating, 
    exporting,
    loadingFilterOptions, 
    loadingStatistics,
    loadingEmployee,
    loadingOrgChart,
    loadingLineManagers,
    showAdvancedFilters
  } = useSelector(state => state.employees);

  // Data fetching actions
  const fetchEmployeesAction = useCallback((params = {}) => {
    // Include current sorting in params
    const paramsWithSort = {
      ...params,
      ordering: sortingForBackend
    };
    return dispatch(fetchEmployees(paramsWithSort));
  }, [dispatch, sortingForBackend]);

  const fetchEmployeeAction = useCallback((id) => 
    dispatch(fetchEmployee(id)), [dispatch]);

  const fetchFilterOptionsAction = useCallback(() => 
    dispatch(fetchFilterOptions()), [dispatch]);

  const fetchStatisticsAction = useCallback(() => 
    dispatch(fetchStatistics()), [dispatch]);

  const fetchLineManagersAction = useCallback((searchTerm = '') => 
    dispatch(fetchLineManagers(searchTerm)), [dispatch]);

  const fetchOrgChartAction = useCallback(() => 
    dispatch(fetchOrgChart()), [dispatch]);

  // CRUD operations
  const createEmployeeAction = useCallback((data) => 
    dispatch(createEmployee(data)), [dispatch]);

  const updateEmployeeAction = useCallback((id, data) => 
    dispatch(updateEmployee({ id, data })), [dispatch]);

  const deleteEmployeeAction = useCallback((id) => 
    dispatch(deleteEmployee(id)), [dispatch]);

  const bulkUpdateEmployeesAction = useCallback((employeeIds, updates) => 
    dispatch(bulkUpdateEmployees({ employeeIds, updates })), [dispatch]);

  const updateOrgChartVisibilityAction = useCallback((employeeIds, isVisible) => 
    dispatch(updateOrgChartVisibility({ employeeIds, isVisible })), [dispatch]);

  const exportEmployeesAction = useCallback((format = 'csv', filters = {}) => 
    dispatch(exportEmployees({ format, filters })), [dispatch]);

  // Selection management
  const setSelectedEmployeesAction = useCallback((ids) => 
    dispatch(setSelectedEmployees(ids)), [dispatch]);

  const toggleEmployeeSelectionAction = useCallback((id) => 
    dispatch(toggleEmployeeSelection(id)), [dispatch]);

  const selectAllEmployeesAction = useCallback(() => 
    dispatch(selectAllEmployees()), [dispatch]);

  const clearSelectionAction = useCallback(() => 
    dispatch(clearSelection()), [dispatch]);

  // Filter management
  const setCurrentFiltersAction = useCallback((filters) => 
    dispatch(setCurrentFilters(filters)), [dispatch]);

  const clearFiltersAction = useCallback(() => 
    dispatch(clearFilters()), [dispatch]);

  const removeFilterAction = useCallback((key) => 
    dispatch(removeFilter(key)), [dispatch]);

  // Sorting management - Excel-like multi-sort
  const setSortingAction = useCallback((field, direction) => 
    dispatch(setSorting({ field, direction })), [dispatch]);

  const addSortAction = useCallback((field, direction) => 
    dispatch(addSort({ field, direction })), [dispatch]);

  const removeSortAction = useCallback((field) => 
    dispatch(removeSort(field)), [dispatch]);

  const clearSortingAction = useCallback(() => 
    dispatch(clearSorting()), [dispatch]);

  // Pagination
  const setPageSizeAction = useCallback((size) => 
    dispatch(setPageSize(size)), [dispatch]);

  const setCurrentPageAction = useCallback((page) => 
    dispatch(setCurrentPage(page)), [dispatch]);

  // UI state
  const toggleAdvancedFiltersAction = useCallback(() => 
    dispatch(toggleAdvancedFilters()), [dispatch]);

  const setShowAdvancedFiltersAction = useCallback((show) => 
    dispatch(setShowAdvancedFilters(show)), [dispatch]);

  // Error management
  const clearErrorsAction = useCallback(() => 
    dispatch(clearErrors()), [dispatch]);

  const clearCurrentEmployeeAction = useCallback(() => 
    dispatch(clearCurrentEmployee()), [dispatch]);

  // Helper functions
  const buildQueryParams = useCallback((additionalParams = {}) => {
    return {
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ordering: sortingForBackend,
      ...currentFilters,
      ...additionalParams
    };
  }, [pagination.currentPage, pagination.pageSize, sortingForBackend, currentFilters]);

  const refreshEmployees = useCallback((additionalParams = {}) => {
    const params = buildQueryParams(additionalParams);
    return fetchEmployeesAction(params);
  }, [buildQueryParams, fetchEmployeesAction]);

  // Check if has active filters
  const hasActiveFilters = useCallback(() => {
    return Object.keys(currentFilters).length > 0 || appliedFilters.length > 0;
  }, [currentFilters, appliedFilters]);

  // Get sort direction for a field
  const getSortDirection = useCallback((field) => {
    const sort = sorting.find(s => s.field === field);
    return sort ? sort.direction : null;
  }, [sorting]);

  // Check if field is currently sorted
  const isSorted = useCallback((field) => {
    return sorting.some(s => s.field === field);
  }, [sorting]);

  // Get sort index for a field (for display purposes)
  const getSortIndex = useCallback((field) => {
    const index = sorting.findIndex(s => s.field === field);
    return index >= 0 ? index + 1 : null;
  }, [sorting]);

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
    sortingForBackend,
    lineManagers,
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    bulkUpdating,
    exporting,
    loadingFilterOptions,
    loadingStatistics,
    loadingEmployee,
    loadingOrgChart,
    loadingLineManagers,
    
    // UI state
    showAdvancedFilters,
    
    // Error states
    error,
    
    // Data fetching actions
    fetchEmployees: fetchEmployeesAction,
    fetchEmployee: fetchEmployeeAction,
    fetchFilterOptions: fetchFilterOptionsAction,
    fetchStatistics: fetchStatisticsAction,
    fetchLineManagers: fetchLineManagersAction,
    fetchOrgChart: fetchOrgChartAction,
    refreshEmployees,
    
    // CRUD operations
    createEmployee: createEmployeeAction,
    updateEmployee: updateEmployeeAction,
    deleteEmployee: deleteEmployeeAction,
    bulkUpdateEmployees: bulkUpdateEmployeesAction,
    updateOrgChartVisibility: updateOrgChartVisibilityAction,
    exportEmployees: exportEmployeesAction,
    
    // Selection management
    setSelectedEmployees: setSelectedEmployeesAction,
    toggleEmployeeSelection: toggleEmployeeSelectionAction,
    selectAllEmployees: selectAllEmployeesAction,
    clearSelection: clearSelectionAction,
    
    // Filter management
    setCurrentFilters: setCurrentFiltersAction,
    clearFilters: clearFiltersAction,
    removeFilter: removeFilterAction,
    hasActiveFilters,
    
    // Sorting management
    setSorting: setSortingAction,
    addSort: addSortAction,
    removeSort: removeSortAction,
    clearSorting: clearSortingAction,
    getSortDirection,
    isSorted,
    getSortIndex,
    
    // Pagination
    setPageSize: setPageSizeAction,
    setCurrentPage: setCurrentPageAction,
    
    // UI state
    toggleAdvancedFilters: toggleAdvancedFiltersAction,
    setShowAdvancedFilters: setShowAdvancedFiltersAction,
    
    // Error management
    clearErrors: clearErrorsAction,
    clearCurrentEmployee: clearCurrentEmployeeAction,
    
    // Helper functions
    buildQueryParams
  };
};