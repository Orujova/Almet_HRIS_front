// src/hooks/useReferenceData.js - Fixed with Helper Functions
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

  // Helper functions with proper error handling
  const helpers = {
    // Get specific items by ID
    getBusinessFunctionById: useCallback((id) => {
      if (!id || !Array.isArray(businessFunctions)) return null;
      return businessFunctions.find(bf => bf.id === parseInt(id));
    }, [businessFunctions]),
    
    getDepartmentById: useCallback((id) => {
      if (!id || !Array.isArray(departments)) return null;
      return departments.find(dept => dept.id === parseInt(id));
    }, [departments]),
    
    getUnitById: useCallback((id) => {
      if (!id || !Array.isArray(units)) return null;
      return units.find(unit => unit.id === parseInt(id));
    }, [units]),
    
    getJobFunctionById: useCallback((id) => {
      if (!id || !Array.isArray(jobFunctions)) return null;
      return jobFunctions.find(jf => jf.id === parseInt(id));
    }, [jobFunctions]),
    
    getPositionGroupById: useCallback((id) => {
      if (!id || !Array.isArray(positionGroups)) return null;
      return positionGroups.find(pg => pg.id === parseInt(id));
    }, [positionGroups]),
    
    getEmployeeStatusById: useCallback((id) => {
      if (!id || !Array.isArray(employeeStatuses)) return null;
      return employeeStatuses.find(status => status.id === parseInt(id));
    }, [employeeStatuses]),
    
    getEmployeeTagById: useCallback((id) => {
      if (!id || !Array.isArray(employeeTags)) return null;
      return employeeTags.find(tag => tag.id === parseInt(id));
    }, [employeeTags]),
    
    // Get departments for specific business function
    getDepartmentsByBusinessFunction: useCallback((businessFunctionId) => {
      if (!businessFunctionId || !Array.isArray(departments)) return [];
      return departments.filter(dept => dept.business_function === parseInt(businessFunctionId));
    }, [departments]),
    
    // Get units for specific department
    getUnitsByDepartment: useCallback((departmentId) => {
      if (!departmentId || !Array.isArray(units)) return [];
      return units.filter(unit => unit.department === parseInt(departmentId));
    }, [units]),
    
    // Get tags by type
    getTagsByType: useCallback((tagType) => {
      if (!tagType || !Array.isArray(employeeTags)) return [];
      return employeeTags.filter(tag => tag.tag_type === tagType);
    }, [employeeTags]),
    
    // Validation helpers
    isValidBusinessFunction: useCallback((id) => {
      if (!id || !Array.isArray(businessFunctions)) return false;
      return businessFunctions.some(bf => bf.id === parseInt(id) && bf.is_active !== false);
    }, [businessFunctions]),
    
    isValidDepartment: useCallback((id, businessFunctionId = null) => {
      if (!id || !Array.isArray(departments)) return false;
      const department = departments.find(dept => dept.id === parseInt(id));
      if (!department || department.is_active === false) return false;
      
      if (businessFunctionId) {
        return department.business_function === parseInt(businessFunctionId);
      }
      
      return true;
    }, [departments]),
    
    isValidUnit: useCallback((id, departmentId = null) => {
      if (!id || !Array.isArray(units)) return false;
      const unit = units.find(u => u.id === parseInt(id));
      if (!unit || unit.is_active === false) return false;
      
      if (departmentId) {
        return unit.department === parseInt(departmentId);
      }
      
      return true;
    }, [units]),
    
    // Data availability checks
    hasBusinessFunctions: useCallback(() => Array.isArray(businessFunctions) && businessFunctions.length > 0, [businessFunctions]),
    hasDepartments: useCallback(() => Array.isArray(departments) && departments.length > 0, [departments]),
    hasUnits: useCallback(() => Array.isArray(units) && units.length > 0, [units]),
    hasJobFunctions: useCallback(() => Array.isArray(jobFunctions) && jobFunctions.length > 0, [jobFunctions]),
    hasPositionGroups: useCallback(() => Array.isArray(positionGroups) && positionGroups.length > 0, [positionGroups]),
    hasEmployeeStatuses: useCallback(() => Array.isArray(employeeStatuses) && employeeStatuses.length > 0, [employeeStatuses]),
    hasEmployeeTags: useCallback(() => Array.isArray(employeeTags) && employeeTags.length > 0, [employeeTags]),
    
    // Loading state checks
    isAnyLoading: useCallback(() => Object.values(loading || {}).some(Boolean), [loading]),
    hasAnyError: useCallback(() => Object.values(error || {}).some(err => err !== null), [error]),

    // Get formatted options for dropdowns
    getFormattedBusinessFunctions: useCallback(() => {
      if (!Array.isArray(businessFunctions)) return [];
      return businessFunctions
        .filter(bf => bf.is_active !== false)
        .map(bf => ({
          value: bf.id,
          label: bf.name,
          code: bf.code,
          employee_count: bf.employee_count
        }));
    }, [businessFunctions]),

    getFormattedDepartments: useCallback((businessFunctionId = null) => {
      let filteredDepartments = Array.isArray(departments) ? departments : [];
      
      if (businessFunctionId) {
        filteredDepartments = filteredDepartments.filter(
          dept => dept.business_function === parseInt(businessFunctionId)
        );
      }
      
      return filteredDepartments
        .filter(dept => dept.is_active !== false)
        .map(dept => ({
          value: dept.id,
          label: dept.name,
          business_function: dept.business_function,
          business_function_name: dept.business_function_name
        }));
    }, [departments]),

    getFormattedUnits: useCallback((departmentId = null) => {
      let filteredUnits = Array.isArray(units) ? units : [];
      
      if (departmentId) {
        filteredUnits = filteredUnits.filter(
          unit => unit.department === parseInt(departmentId)
        );
      }
      
      return filteredUnits
        .filter(unit => unit.is_active !== false)
        .map(unit => ({
          value: unit.id,
          label: unit.name,
          department: unit.department,
          department_name: unit.department_name
        }));
    }, [units]),

    getFormattedJobFunctions: useCallback(() => {
      if (!Array.isArray(jobFunctions)) return [];
      return jobFunctions
        .filter(jf => jf.is_active !== false)
        .map(jf => ({
          value: jf.id,
          label: jf.name,
          description: jf.description
        }));
    }, [jobFunctions]),

    getFormattedPositionGroups: useCallback(() => {
      if (!Array.isArray(positionGroups)) return [];
      return positionGroups
        .filter(pg => pg.is_active !== false)
        .sort((a, b) => (a.hierarchy_level || 0) - (b.hierarchy_level || 0))
        .map(pg => ({
          value: pg.id,
          label: pg.display_name || pg.name,
          hierarchy_level: pg.hierarchy_level,
          grading_levels: pg.grading_levels
        }));
    }, [positionGroups]),

    getFormattedEmployeeStatuses: useCallback(() => {
      if (!Array.isArray(employeeStatuses)) return [];
      return employeeStatuses
        .filter(status => status.is_active !== false)
        .map(status => ({
          value: status.id,
          label: status.name,
          status_type: status.status_type,
          color: status.color
        }));
    }, [employeeStatuses]),

    getFormattedEmployeeTags: useCallback((tagType = null) => {
      let filteredTags = Array.isArray(employeeTags) ? employeeTags : [];
      
      if (tagType) {
        filteredTags = filteredTags.filter(tag => tag.tag_type === tagType);
      }
      
      return filteredTags
        .filter(tag => tag.is_active !== false)
        .map(tag => ({
          value: tag.id,
          label: tag.name,
          tag_type: tag.tag_type,
          color: tag.color
        }));
    }, [employeeTags])
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
    businessFunctions: businessFunctions || [],
    departments: departments || [],
    units: units || [],
    jobFunctions: jobFunctions || [],
    positionGroups: positionGroups || [],
    employeeStatuses: employeeStatuses || [],
    employeeTags: employeeTags || [],
    
    // Formatted data for dropdowns
    businessFunctionsDropdown: businessFunctionsDropdown || [],
    departmentsDropdown: departmentsDropdown || [],
    unitsDropdown: unitsDropdown || [],
    jobFunctionsDropdown: jobFunctionsDropdown || [],
    positionGroupsDropdown: positionGroupsDropdown || [],
    employeeStatusesDropdown: employeeStatusesDropdown || [],
    employeeTagsDropdown: employeeTagsDropdown || [],
    
    // Combined form data
    formData: formData || {},
    
    // Loading states
    loading: loading || {},
    
    // Error states
    error: error || {},
    
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
  
  const businessFunctions = useSelector(selectBusinessFunctionsForDropdown) || [];
  const departments = useSelector(selectDepartmentsForDropdown) || [];
  const units = useSelector(selectUnitsForDropdown) || [];
  const loading = useSelector(selectReferenceDataLoading) || {};

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
    isLoadingBusinessFunctions: loading.businessFunctions || false,
    isLoadingDepartments: loading.departments || false,
    isLoadingUnits: loading.units || false,
    
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
        setGradingLevels([]);
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