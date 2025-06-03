// src/hooks/useReferenceData.js - Custom Hook for Reference Data
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  fetchBusinessFunctions,
  fetchDepartments,
  fetchUnits,
  fetchJobFunctions,
  fetchPositionGroups,
  fetchEmployeeStatuses,
  fetchEmployeeTags,
  clearDepartments,
  clearUnits,
  selectBusinessFunctions,
  selectDepartments,
  selectUnits,
  selectJobFunctions,
  selectPositionGroups,
  selectEmployeeStatuses,
  selectEmployeeTags,
  selectReferenceDataLoading,
  selectReferenceDataError
} from '../store/slices/referenceDataSlice';

export const useReferenceData = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const businessFunctions = useSelector(selectBusinessFunctions);
  const departments = useSelector(selectDepartments);
  const units = useSelector(selectUnits);
  const jobFunctions = useSelector(selectJobFunctions);
  const positionGroups = useSelector(selectPositionGroups);
  const employeeStatuses = useSelector(selectEmployeeStatuses);
  const employeeTags = useSelector(selectEmployeeTags);
  const loading = useSelector(selectReferenceDataLoading);
  const error = useSelector(selectReferenceDataError);

  // Actions
  const actions = {
    fetchBusinessFunctions: useCallback(() => dispatch(fetchBusinessFunctions()), [dispatch]),
    fetchDepartments: useCallback((businessFunctionId) => dispatch(fetchDepartments(businessFunctionId)), [dispatch]),
    fetchUnits: useCallback((departmentId) => dispatch(fetchUnits(departmentId)), [dispatch]),
    fetchJobFunctions: useCallback(() => dispatch(fetchJobFunctions()), [dispatch]),
    fetchPositionGroups: useCallback(() => dispatch(fetchPositionGroups()), [dispatch]),
    fetchEmployeeStatuses: useCallback(() => dispatch(fetchEmployeeStatuses()), [dispatch]),
    fetchEmployeeTags: useCallback((tagType) => dispatch(fetchEmployeeTags(tagType)), [dispatch]),
    clearDepartments: useCallback(() => dispatch(clearDepartments()), [dispatch]),
    clearUnits: useCallback(() => dispatch(clearUnits()), [dispatch]),
  };

  // Auto-fetch basic reference data on mount
  useEffect(() => {
    actions.fetchBusinessFunctions();
    actions.fetchJobFunctions();
    actions.fetchPositionGroups();
    actions.fetchEmployeeStatuses();
    actions.fetchEmployeeTags();
  }, []);

  console.log(departments)

  return {
    // Data
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    employeeStatuses,
    employeeTags,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Actions
    ...actions
  };
};