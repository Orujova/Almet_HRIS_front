// src/hooks/useApi.js
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

// Generic API hook
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiCall();
        setData(response.data);
        
      } catch (err) {
        console.error('API call failed:', err);
        setError(err.response?.data?.error || err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
};

// Specific hooks
export const useCurrentUser = () => {
  return useApi(apiService.getCurrentUser);
};

export const useEmployees = () => {
  return useApi(apiService.getEmployees);
};

export const useDepartments = () => {
  return useApi(apiService.getDepartments);
};

export const useEmployee = (id) => {
  return useApi(() => apiService.getEmployee(id), [id]);
};