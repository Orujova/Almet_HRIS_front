// src/hooks/useApi.js - UPDATED with enhanced error handling
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

// Generic API hook with better error handling
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      setData(response.data);
      
    } catch (err) {
      console.error('API call failed:', err);
      
      // Enhanced error handling
      let errorMessage = 'Something went wrong';
      
      if (err.response?.data) {
        // Handle validation errors
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Specific hooks for common operations
export const useCurrentUser = () => {
  return useApi(apiService.getCurrentUser);
};

export const useEmployees = (params = {}) => {
  return useApi(() => apiService.getEmployees(params), [JSON.stringify(params)]);
};

export const useEmployee = (id) => {
  return useApi(() => apiService.getEmployee(id), [id]);
};

export const useBusinessFunctions = () => {
  return useApi(apiService.getBusinessFunctions);
};

export const useDepartments = (businessFunctionId = null) => {
  return useApi(() => {
    const params = businessFunctionId ? { business_function: businessFunctionId } : {};
    return apiService.getDepartments(params);
  }, [businessFunctionId]);
};

export const useUnits = (departmentId = null) => {
  return useApi(() => {
    const params = departmentId ? { department: departmentId } : {};
    return apiService.getUnits(params);
  }, [departmentId]);
};

export const useJobFunctions = () => {
  return useApi(apiService.getJobFunctions);
};

export const usePositionGroups = () => {
  return useApi(apiService.getPositionGroups);
};

export const useEmployeeStatuses = () => {
  return useApi(apiService.getEmployeeStatuses);
};

export const useEmployeeTags = (tagType = null) => {
  return useApi(() => {
    const params = tagType ? { tag_type: tagType } : {};
    return apiService.getEmployeeTags(params);
  }, [tagType]);
};

export const useEmployeeStatistics = () => {
  return useApi(apiService.getEmployeeStatistics);
};

export const useOrgChart = () => {
  return useApi(apiService.getOrgChart);
};

export const useHeadcountSummaries = () => {
  return useApi(apiService.getHeadcountSummaries);
};

export const useVacantPositions = () => {
  return useApi(apiService.getVacantPositions);
};

// Hook for position group grading levels
export const usePositionGroupGradingLevels = (positionGroupId) => {
  return useApi(
    () => apiService.getPositionGroupGradingLevels(positionGroupId),
    [positionGroupId]
  );
};

// Hook with mutation capabilities
export const useMutation = (mutationFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mutationFn(...args);
      setData(response.data);
      
      return response;
    } catch (err) {
      console.error('Mutation failed:', err);
      
      let errorMessage = 'Something went wrong';
      
      if (err.response?.data) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
};

// Specific mutation hooks
export const useCreateEmployee = () => {
  return useMutation(apiService.createEmployee);
};

export const useUpdateEmployee = () => {
  return useMutation((id, data) => apiService.updateEmployee(id, data));
};

export const useDeleteEmployee = () => {
  return useMutation(apiService.deleteEmployee);
};

export const useBulkUpdateEmployees = () => {
  return useMutation(apiService.bulkUpdateEmployees);
};

export const useBulkDeleteEmployees = () => {
  return useMutation(apiService.bulkDeleteEmployees);
};

export const useAddEmployeeTag = () => {
  return useMutation((employeeId, tagData) => apiService.addEmployeeTag(employeeId, tagData));
};

export const useRemoveEmployeeTag = () => {
  return useMutation((employeeId, tagId) => apiService.removeEmployeeTag(employeeId, tagId));
};

export const useUpdateEmployeeStatus = () => {
  return useMutation(apiService.updateEmployeeStatus);
};

export const useExportEmployees = () => {
  return useMutation(apiService.exportEmployees);
};