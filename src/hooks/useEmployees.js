// src/hooks/useEmployees.js - Custom Hook for Employee Operations
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
  bulkUpdateEmployees,
  setSelectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  clearSelection,
  setCurrentFilters,
  clearFilters,
  setSorting,
  setPageSize,
  setCurrentPage,
  toggleAdvancedFilters,
  clearErrors,
  clearCurrentEmployee,
  selectEmployees,
  selectCurrentEmployee,
  selectEmployeeLoading,
  selectEmployeeError,
  selectFilterOptions,
  selectSelectedEmployees,
  selectCurrentFilters,
  selectStatistics,
  selectPagination
} from '../store/slices/employeeSlice';

export const useEmployees = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const employees = useSelector(selectEmployees);
  const currentEmployee = useSelector(selectCurrentEmployee);
  const loading = useSelector(selectEmployeeLoading);
  const error = useSelector(selectEmployeeError);
  const filterOptions = useSelector(selectFilterOptions);
  const selectedEmployees = useSelector(selectSelectedEmployees);
  const currentFilters = useSelector(selectCurrentFilters);
  const statistics = useSelector(selectStatistics);
  const pagination = useSelector(selectPagination);
  const { creating, updating, deleting, bulkUpdating, loadingFilterOptions, loadingStatistics } = useSelector(state => state.employees);

  // Actions
  const actions = {
    // Data fetching
    fetchEmployees: useCallback((params) => dispatch(fetchEmployees(params)), [dispatch]),
    fetchEmployee: useCallback((id) => dispatch(fetchEmployee(id)), [dispatch]),
    fetchFilterOptions: useCallback(() => dispatch(fetchFilterOptions()), [dispatch]),
    fetchStatistics: useCallback(() => dispatch(fetchStatistics()), [dispatch]),
    
    // CRUD operations
    createEmployee: useCallback((data) => dispatch(createEmployee(data)), [dispatch]),
    updateEmployee: useCallback((id, data) => dispatch(updateEmployee({ id, data })), [dispatch]),
    deleteEmployee: useCallback((id) => dispatch(deleteEmployee(id)), [dispatch]),
    bulkUpdateEmployees: useCallback((employeeIds, updates) => dispatch(bulkUpdateEmployees({ employeeIds, updates })), [dispatch]),
    
    // Selection management
    setSelectedEmployees: useCallback((ids) => dispatch(setSelectedEmployees(ids)), [dispatch]),
    toggleEmployeeSelection: useCallback((id) => dispatch(toggleEmployeeSelection(id)), [dispatch]),
    selectAllEmployees: useCallback(() => dispatch(selectAllEmployees()), [dispatch]),
    clearSelection: useCallback(() => dispatch(clearSelection()), [dispatch]),
    
    // Filter and sorting
    setCurrentFilters: useCallback((filters) => dispatch(setCurrentFilters(filters)), [dispatch]),
    clearFilters: useCallback(() => dispatch(clearFilters()), [dispatch]),
    setSorting: useCallback((field, order) => dispatch(setSorting({ field, order })), [dispatch]),
    
    // Pagination
    setPageSize: useCallback((size) => dispatch(setPageSize(size)), [dispatch]),
    setCurrentPage: useCallback((page) => dispatch(setCurrentPage(page)), [dispatch]),
    
    // UI
    toggleAdvancedFilters: useCallback(() => dispatch(toggleAdvancedFilters()), [dispatch]),
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    clearCurrentEmployee: useCallback(() => dispatch(clearCurrentEmployee()), [dispatch]),
  };

  return {
    // Data
    employees,
    currentEmployee,
    filterOptions,
    selectedEmployees,
    currentFilters,
    statistics,
    pagination,
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    bulkUpdating,
    loadingFilterOptions,
    loadingStatistics,
    
    // Error states
    error,
    
    // Actions
    ...actions
  };
};