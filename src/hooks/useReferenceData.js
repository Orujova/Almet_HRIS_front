// src/hooks/useReferenceData.js - Fixed with Proper API Integration and Error Handling
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
  const businessFunctions = useSelector(selectBusinessFunctions) || [];
  const departments = useSelector(selectDepartments) || [];
  const units = useSelector(selectUnits) || [];
  const jobFunctions = useSelector(selectJobFunctions) || [];
  const positionGroups = useSelector(selectPositionGroups) || [];
  const employeeStatuses = useSelector(selectEmployeeStatuses) || [];
  const employeeTags = useSelector(selectEmployeeTags) || [];
  
  // Formatted data selectors for dropdowns
  const businessFunctionsDropdown = useSelector(selectBusinessFunctionsForDropdown) || [];
  const departmentsDropdown = useSelector(selectDepartmentsForDropdown) || [];
  const unitsDropdown = useSelector(selectUnitsForDropdown) || [];
  const jobFunctionsDropdown = useSelector(selectJobFunctionsForDropdown) || [];
  const positionGroupsDropdown = useSelector(selectPositionGroupsForDropdown) || [];
  const employeeStatusesDropdown = useSelector(selectEmployeeStatusesForDropdown) || [];
  const employeeTagsDropdown = useSelector(selectEmployeeTagsForDropdown) || [];
  
  // Combined data for forms
  const formData = useSelector(selectReferenceDataForEmployeeForm) || {};
  
  // Loading and error states
  const loading = useSelector(selectReferenceDataLoading) || {};
  const error = useSelector(selectReferenceDataError) || {};

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

  // Helper functions with proper error handling and null checks
  const helpers = {
    // Get specific items by ID with safe null checking
    getBusinessFunctionById: useCallback((id) => {
      if (!id || !Array.isArray(businessFunctions)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return businessFunctions.find(bf => bf.id === numericId) || null;
    }, [businessFunctions]),
    
    getDepartmentById: useCallback((id) => {
      if (!id || !Array.isArray(departments)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return departments.find(dept => dept.id === numericId) || null;
    }, [departments]),
    
    getUnitById: useCallback((id) => {
      if (!id || !Array.isArray(units)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return units.find(unit => unit.id === numericId) || null;
    }, [units]),
    
    getJobFunctionById: useCallback((id) => {
      if (!id || !Array.isArray(jobFunctions)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return jobFunctions.find(jf => jf.id === numericId) || null;
    }, [jobFunctions]),
    
    getPositionGroupById: useCallback((id) => {
      if (!id || !Array.isArray(positionGroups)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return positionGroups.find(pg => pg.id === numericId) || null;
    }, [positionGroups]),
    
    getEmployeeStatusById: useCallback((id) => {
      if (!id || !Array.isArray(employeeStatuses)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return employeeStatuses.find(status => status.id === numericId) || null;
    }, [employeeStatuses]),
    
    getEmployeeTagById: useCallback((id) => {
      if (!id || !Array.isArray(employeeTags)) return null;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return employeeTags.find(tag => tag.id === numericId) || null;
    }, [employeeTags]),
    
    // Get departments for specific business function
    getDepartmentsByBusinessFunction: useCallback((businessFunctionId) => {
      if (!businessFunctionId || !Array.isArray(departments)) return [];
      const numericId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
      return departments.filter(dept => dept.business_function === numericId);
    }, [departments]),
    
    // Get units for specific department
    getUnitsByDepartment: useCallback((departmentId) => {
      if (!departmentId || !Array.isArray(units)) return [];
      const numericId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
      return units.filter(unit => unit.department === numericId);
    }, [units]),
    
    // Get tags by type
    getTagsByType: useCallback((tagType) => {
      if (!tagType || !Array.isArray(employeeTags)) return [];
      return employeeTags.filter(tag => tag.tag_type === tagType);
    }, [employeeTags]),
    
    // Validation helpers with improved error handling
    isValidBusinessFunction: useCallback((id) => {
      if (!id || !Array.isArray(businessFunctions)) return false;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      return businessFunctions.some(bf => bf.id === numericId && bf.is_active !== false);
    }, [businessFunctions]),
    
    isValidDepartment: useCallback((id, businessFunctionId = null) => {
      if (!id || !Array.isArray(departments)) return false;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      const department = departments.find(dept => dept.id === numericId);
      if (!department || department.is_active === false) return false;
      
      if (businessFunctionId) {
        const numericBfId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
        return department.business_function === numericBfId;
      }
      
      return true;
    }, [departments]),
    
    isValidUnit: useCallback((id, departmentId = null) => {
      if (!id || !Array.isArray(units)) return false;
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      const unit = units.find(u => u.id === numericId);
      if (!unit || unit.is_active === false) return false;
      
      if (departmentId) {
        const numericDeptId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
        return unit.department === numericDeptId;
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

    // Get formatted options for dropdowns with safe transformation
    getFormattedBusinessFunctions: useCallback(() => {
      if (!Array.isArray(businessFunctions)) return [];
      return businessFunctions
        .filter(bf => bf && bf.is_active !== false)
        .map(bf => ({
          value: bf.id?.toString() || '',
          label: bf.name || 'Unknown',
          code: bf.code || '',
          employee_count: bf.employee_count || 0
        }));
    }, [businessFunctions]),

    getFormattedDepartments: useCallback((businessFunctionId = null) => {
      let filteredDepartments = Array.isArray(departments) ? departments : [];
      
      if (businessFunctionId) {
        const numericId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
        filteredDepartments = filteredDepartments.filter(
          dept => dept && dept.business_function === numericId
        );
      }
      
      return filteredDepartments
        .filter(dept => dept && dept.is_active !== false)
        .map(dept => ({
          value: dept.id?.toString() || '',
          label: dept.name || 'Unknown',
          business_function: dept.business_function,
          business_function_name: dept.business_function_name || ''
        }));
    }, [departments]),

    getFormattedUnits: useCallback((departmentId = null) => {
      let filteredUnits = Array.isArray(units) ? units : [];
      
      if (departmentId) {
        const numericId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
        filteredUnits = filteredUnits.filter(
          unit => unit && unit.department === numericId
        );
      }
      
      return filteredUnits
        .filter(unit => unit && unit.is_active !== false)
        .map(unit => ({
          value: unit.id?.toString() || '',
          label: unit.name || 'Unknown',
          department: unit.department,
          department_name: unit.department_name || ''
        }));
    }, [units]),

    getFormattedJobFunctions: useCallback(() => {
      if (!Array.isArray(jobFunctions)) return [];
      return jobFunctions
        .filter(jf => jf && jf.is_active !== false)
        .map(jf => ({
          value: jf.id?.toString() || '',
          label: jf.name || 'Unknown',
          description: jf.description || ''
        }));
    }, [jobFunctions]),

    getFormattedPositionGroups: useCallback(() => {
      if (!Array.isArray(positionGroups)) return [];
      return positionGroups
        .filter(pg => pg && pg.is_active !== false)
        .sort((a, b) => (a.hierarchy_level || 0) - (b.hierarchy_level || 0))
        .map(pg => ({
          value: pg.id?.toString() || '',
          label: pg.display_name || pg.name || 'Unknown',
          hierarchy_level: pg.hierarchy_level || 0,
          grading_levels: pg.grading_levels || []
        }));
    }, [positionGroups]),

    getFormattedEmployeeStatuses: useCallback(() => {
      if (!Array.isArray(employeeStatuses)) return [];
      return employeeStatuses
        .filter(status => status && status.is_active !== false)
        .map(status => ({
          value: status.id?.toString() || '',
          label: status.name || 'Unknown',
          status_type: status.status_type || '',
          color: status.color || '#gray'
        }));
    }, [employeeStatuses]),

    getFormattedEmployeeTags: useCallback((tagType = null) => {
      let filteredTags = Array.isArray(employeeTags) ? employeeTags : [];
      
      if (tagType) {
        filteredTags = filteredTags.filter(tag => tag && tag.tag_type === tagType);
      }
      
      return filteredTags
        .filter(tag => tag && tag.is_active !== false)
        .map(tag => ({
          value: tag.id?.toString() || '',
          label: tag.name || 'Unknown',
          tag_type: tag.tag_type || '',
          color: tag.color || '#gray'
        }));
    }, [employeeTags]),

    // Safe array access helpers
    safeGetArray: useCallback((arrayName) => {
      const arrays = {
        businessFunctions,
        departments,
        units,
        jobFunctions,
        positionGroups,
        employeeStatuses,
        employeeTags
      };
      
      const array = arrays[arrayName];
      return Array.isArray(array) ? array : [];
    }, [businessFunctions, departments, units, jobFunctions, positionGroups, employeeStatuses, employeeTags]),

    // Error handling helpers
    getErrorMessage: useCallback((errorKey) => {
      if (!error || typeof error !== 'object') return null;
      const errorValue = error[errorKey];
      
      if (typeof errorValue === 'string') return errorValue;
      if (errorValue && typeof errorValue === 'object' && errorValue.message) return errorValue.message;
      if (errorValue && typeof errorValue === 'object' && errorValue.detail) return errorValue.detail;
      
      return null;
    }, [error]),

    hasError: useCallback((errorKey) => {
      const errorMessage = helpers.getErrorMessage(errorKey);
      return errorMessage !== null;
    }, [error]),

    // Loading state helpers
    isLoading: useCallback((loadingKey) => {
      if (!loading || typeof loading !== 'object') return false;
      return Boolean(loading[loadingKey]);
    }, [loading]),

    // Hierarchical validation
    validateHierarchy: useCallback((businessFunctionId, departmentId, unitId) => {
      const validation = {
        isValid: true,
        errors: []
      };

      // Validate business function
      if (businessFunctionId && !helpers.isValidBusinessFunction(businessFunctionId)) {
        validation.isValid = false;
        validation.errors.push('Invalid business function selected');
      }

      // Validate department belongs to business function
      if (departmentId && !helpers.isValidDepartment(departmentId, businessFunctionId)) {
        validation.isValid = false;
        validation.errors.push('Department does not belong to selected business function');
      }

      // Validate unit belongs to department
      if (unitId && !helpers.isValidUnit(unitId, departmentId)) {
        validation.isValid = false;
        validation.errors.push('Unit does not belong to selected department');
      }

      return validation;
    }, [])
  };

  // Auto-fetch basic reference data on mount
  useEffect(() => {
    if (!helpers.hasBusinessFunctions() && !loading.businessFunctions) {
      actions.fetchBusinessFunctions();
    }
    if (!helpers.hasJobFunctions() && !loading.jobFunctions) {
      actions.fetchJobFunctions();
    }
    if (!helpers.hasPositionGroups() && !loading.positionGroups) {
      actions.fetchPositionGroups();
    }
    if (!helpers.hasEmployeeStatuses() && !loading.employeeStatuses) {
      actions.fetchEmployeeStatuses();
    }
    if (!helpers.hasEmployeeTags() && !loading.employeeTags) {
      actions.fetchEmployeeTags();
    }
  }, []);

  // Return comprehensive interface
  return {
    // Raw data (with safe defaults)
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    employeeStatuses,
    employeeTags,
    
    // Formatted data for dropdowns (with safe defaults)
    businessFunctionsDropdown,
    departmentsDropdown,
    unitsDropdown,
    jobFunctionsDropdown,
    positionGroupsDropdown,
    employeeStatusesDropdown,
    employeeTagsDropdown,
    
    // Combined form data
    formData,
    
    // Loading states (with safe default)
    loading,
    
    // Error states (with safe default)
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
    if (businessFunctions.length === 0 && !loading.businessFunctions) {
      dispatch(fetchBusinessFunctions());
    }
  }, [dispatch, businessFunctions.length, loading.businessFunctions]);

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

// Hook for position group grading levels with enhanced error handling
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
        return apiService.get(`/position-groups/${positionGroupId}/grading_levels/`);
      })
      .then(response => {
        const levels = response.data?.levels || response.data || [];
        setGradingLevels(Array.isArray(levels) ? levels : []);
      })
      .catch(err => {
        const errorMessage = err.response?.data?.error || 
                           err.response?.data?.detail || 
                           err.message || 
                           'Failed to fetch grading levels';
        setError(errorMessage);
        setGradingLevels([]);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setGradingLevels([]);
      setError(null);
    }
  }, [positionGroupId]);
  
  return {
    gradingLevels,
    loading,
    error,
    hasLevels: Array.isArray(gradingLevels) && gradingLevels.length > 0
  };
};