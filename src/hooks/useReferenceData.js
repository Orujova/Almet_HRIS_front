// src/hooks/useReferenceData.js - UPDATED with complete backend integration
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
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
  clearErrors,
  selectBusinessFunctions,
  selectDepartments,
  selectUnits,
  selectJobFunctions,
  selectPositionGroups,
  selectEmployeeStatuses,
  selectEmployeeTags,
  selectReferenceDataLoading,
  selectReferenceDataError,
  selectBusinessFunctionsForDropdown,
  selectDepartmentsForDropdown,
  selectUnitsForDropdown,
  selectJobFunctionsForDropdown,
  selectPositionGroupsForDropdown,
  selectEmployeeStatusesForDropdown,
  selectEmployeeTagsForDropdown,
  selectReferenceDataForEmployeeForm
} from '../store/slices/referenceDataSlice';

export const useReferenceData = () => {
  const dispatch = useDispatch();
  
  // Raw data selectors
  const businessFunctions = useSelector(selectBusinessFunctions);
  const departments = useSelector(selectDepartments);
  const units = useSelector(selectUnits);
  const jobFunctions = useSelector(selectJobFunctions);
  const positionGroups = useSelector(selectPositionGroups);
  const employeeStatuses = useSelector(selectEmployeeStatuses);
  const employeeTags = useSelector(selectEmployeeTags);
  
  // Formatted data selectors for dropdowns
  const businessFunctionsDropdown = useSelector(selectBusinessFunctionsForDropdown);
  const departmentsDropdown = useSelector(selectDepartmentsForDropdown);
  const unitsDropdown = useSelector(selectUnitsForDropdown);
  const jobFunctionsDropdown = useSelector(selectJobFunctionsForDropdown);
  const positionGroupsDropdown = useSelector(selectPositionGroupsForDropdown);
  const employeeStatusesDropdown = useSelector(selectEmployeeStatusesForDropdown);
  const employeeTagsDropdown = useSelector(selectEmployeeTagsForDropdown);
  
  // Combined data for forms
  const formData = useSelector(selectReferenceDataForEmployeeForm);
  
  // Loading and error states
  const loading = useSelector(selectReferenceDataLoading);
  const error = useSelector(selectReferenceDataError);

  // Actions
  const actions = {
    // Basic fetch operations
    fetchBusinessFunctions: useCallback(() => dispatch(fetchBusinessFunctions()), [dispatch]),
    fetchDepartments: useCallback((businessFunctionId) => dispatch(fetchDepartments(businessFunctionId)), [dispatch]),
    fetchUnits: useCallback((departmentId) => dispatch(fetchUnits(departmentId)), [dispatch]),
    fetchJobFunctions: useCallback(() => dispatch(fetchJobFunctions()), [dispatch]),
    fetchPositionGroups: useCallback(() => dispatch(fetchPositionGroups()), [dispatch]),
    fetchEmployeeStatuses: useCallback(() => dispatch(fetchEmployeeStatuses()), [dispatch]),
    fetchEmployeeTags: useCallback((tagType) => dispatch(fetchEmployeeTags(tagType)), [dispatch]),
    
    // Clear operations for hierarchical dependencies
    clearDepartments: useCallback(() => dispatch(clearDepartments()), [dispatch]),
    clearUnits: useCallback(() => dispatch(clearUnits()), [dispatch]),
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    
    // Hierarchical data loading
    loadDepartmentsForBusinessFunction: useCallback((businessFunctionId) => {
      if (businessFunctionId) {
        dispatch(fetchDepartments(businessFunctionId));
      } else {
        dispatch(clearDepartments());
        dispatch(clearUnits());
      }
    }, [dispatch]),
    
    loadUnitsForDepartment: useCallback((departmentId) => {
      if (departmentId) {
        dispatch(fetchUnits(departmentId));
      } else {
        dispatch(clearUnits());
      }
    }, [dispatch]),
    
    // Refresh all data
    refreshAllData: useCallback(() => {
      dispatch(fetchBusinessFunctions());
      dispatch(fetchJobFunctions());
      dispatch(fetchPositionGroups());
      dispatch(fetchEmployeeStatuses());
      dispatch(fetchEmployeeTags());
    }, [dispatch]),
  };

  // Helper functions
  const helpers = {
    // Get specific items by ID
    getBusinessFunctionById: useCallback((id) => {
      return businessFunctions.find(bf => bf.id === parseInt(id));
    }, [businessFunctions]),
    
    getDepartmentById: useCallback((id) => {
      return departments.find(dept => dept.id === parseInt(id));
    }, [departments]),
    
    getUnitById: useCallback((id) => {
      return units.find(unit => unit.id === parseInt(id));
    }, [units]),
    
    getJobFunctionById: useCallback((id) => {
      return jobFunctions.find(jf => jf.id === parseInt(id));
    }, [jobFunctions]),
    
    getPositionGroupById: useCallback((id) => {
      return positionGroups.find(pg => pg.id === parseInt(id));
    }, [positionGroups]),
    
    getEmployeeStatusById: useCallback((id) => {
      return employeeStatuses.find(status => status.id === parseInt(id));
    }, [employeeStatuses]),
    
    getEmployeeTagById: useCallback((id) => {
      return employeeTags.find(tag => tag.id === parseInt(id));
    }, [employeeTags]),
    
    // Get departments for specific business function
    getDepartmentsForBusinessFunction: useCallback((businessFunctionId) => {
      return departments.filter(dept => dept.business_function === parseInt(businessFunctionId));
    }, [departments]),
    
    // Get units for specific department
    getUnitsForDepartment: useCallback((departmentId) => {
      return units.filter(unit => unit.department === parseInt(departmentId));
    }, [units]),
    
    // Get tags by type
    getTagsByType: useCallback((tagType) => {
      return employeeTags.filter(tag => tag.tag_type === tagType);
    }, [employeeTags]),
    
    // Validation helpers
    isValidBusinessFunction: useCallback((id) => {
      return businessFunctions.some(bf => bf.id === parseInt(id) && bf.is_active);
    }, [businessFunctions]),
    
    isValidDepartment: useCallback((id, businessFunctionId = null) => {
      const department = departments.find(dept => dept.id === parseInt(id));
      if (!department || !department.is_active) return false;
      
      if (businessFunctionId) {
        return department.business_function === parseInt(businessFunctionId);
      }
      
      return true;
    }, [departments]),
    
    isValidUnit: useCallback((id, departmentId = null) => {
      const unit = units.find(u => u.id === parseInt(id));
      if (!unit || !unit.is_active) return false;
      
      if (departmentId) {
        return unit.department === parseInt(departmentId);
      }
      
      return true;
    }, [units]),
    
    // Data availability checks
    hasBusinessFunctions: useCallback(() => businessFunctions.length > 0, [businessFunctions]),
    hasDepartments: useCallback(() => departments.length > 0, [departments]),
    hasUnits: useCallback(() => units.length > 0, [units]),
    hasJobFunctions: useCallback(() => jobFunctions.length > 0, [jobFunctions]),
    hasPositionGroups: useCallback(() => positionGroups.length > 0, [positionGroups]),
    hasEmployeeStatuses: useCallback(() => employeeStatuses.length > 0, [employeeStatuses]),
    hasEmployeeTags: useCallback(() => employeeTags.length > 0, [employeeTags]),
    
    // Loading state checks
    isAnyLoading: useCallback(() => Object.values(loading).some(Boolean), [loading]),
    hasAnyError: useCallback(() => Object.values(error).some(err => err !== null), [error]),
  };

  // Auto-fetch basic reference data on mount
  useEffect(() => {
    actions.fetchBusinessFunctions();
    actions.fetchJobFunctions();
    actions.fetchPositionGroups();
    actions.fetchEmployeeStatuses();
    actions.fetchEmployeeTags();
  }, []);

  return {
    // Raw data
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    employeeStatuses,
    employeeTags,
    
    // Formatted data for dropdowns
    businessFunctionsDropdown,
    departmentsDropdown,
    unitsDropdown,
    jobFunctionsDropdown,
    positionGroupsDropdown,
    employeeStatusesDropdown,
    employeeTagsDropdown,
    
    // Combined form data
    formData,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Actions
    ...actions,
    
    // Helper functions
    ...helpers
  };
};

// Specialized hook for hierarchical selection (Business Function -> Department -> Unit)
export const useHierarchicalReferenceData = () => {
  const dispatch = useDispatch();
  const [selectedBusinessFunction, setSelectedBusinessFunction] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  const businessFunctions = useSelector(selectBusinessFunctionsForDropdown);
  const departments = useSelector(selectDepartmentsForDropdown);
  const units = useSelector(selectUnitsForDropdown);
  const loading = useSelector(selectReferenceDataLoading);

  // Auto-load departments when business function changes
  useEffect(() => {
    if (selectedBusinessFunction) {
      dispatch(fetchDepartments(selectedBusinessFunction));
      setSelectedDepartment(null); // Reset department selection
    } else {
      dispatch(clearDepartments());
      dispatch(clearUnits());
    }
  }, [selectedBusinessFunction, dispatch]);

  // Auto-load units when department changes
  useEffect(() => {
    if (selectedDepartment) {
      dispatch(fetchUnits(selectedDepartment));
    } else {
      dispatch(clearUnits());
    }
  }, [selectedDepartment, dispatch]);

  // Load business functions on mount
  useEffect(() => {
    dispatch(fetchBusinessFunctions());
  }, [dispatch]);

  return {
    // Data
    businessFunctions,
    departments,
    units,
    
    // Selected values
    selectedBusinessFunction,
    selectedDepartment,
    
    // Setters
    setSelectedBusinessFunction,
    setSelectedDepartment,
    
    // Loading states
    isLoadingBusinessFunctions: loading.businessFunctions,
    isLoadingDepartments: loading.departments,
    isLoadingUnits: loading.units,
    
    // Helper functions
    resetSelection: useCallback(() => {
      setSelectedBusinessFunction(null);
      setSelectedDepartment(null);
    }, []),
    
    setBusinessFunctionAndDepartment: useCallback((businessFunctionId, departmentId = null) => {
      setSelectedBusinessFunction(businessFunctionId);
      if (departmentId) {
        setSelectedDepartment(departmentId);
      }
    }, []),
  };
};

// Hook for position group grading levels
export const usePositionGroupGradingLevels = (positionGroupId) => {
  const [gradingLevels, setGradingLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (positionGroupId) {
      setLoading(true);
      setError(null);
      
      // Import and use the API service
      import('../services/api').then(({ apiService }) => {
        return apiService.getPositionGroupGradingLevels(positionGroupId);
      })
      .then(response => {
        setGradingLevels(response.data.levels || []);
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message || 'Failed to fetch grading levels');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setGradingLevels([]);
    }
  }, [positionGroupId]);
  
  return {
    gradingLevels,
    loading,
    error
  };
};