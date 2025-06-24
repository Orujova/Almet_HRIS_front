// src/hooks/useEmployeeGrading.js - Specialized hook for grading management
import { useState, useCallback } from 'react';
import { gradingAPI } from '../store/api/employeeAPI';

export const useEmployeeGrading = () => {
  const [gradingData, setGradingData] = useState([]);
  const [positionGroupLevels, setPositionGroupLevels] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const actions = {
    fetchEmployeeGrading: useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await gradingAPI.getEmployeeGrading();
        setGradingData(response.data);
        return response.data;
      } catch (err) {
        setError(err.response?.data || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    fetchPositionGroupLevels: useCallback(async (positionGroupId) => {
      if (positionGroupLevels[positionGroupId]) {
        return positionGroupLevels[positionGroupId];
      }

      setLoading(true);
      setError(null);
      try {
        const response = await gradingAPI.getPositionGroupLevels(positionGroupId);
        setPositionGroupLevels(prev => ({
          ...prev,
          [positionGroupId]: response.data
        }));
        return response.data;
      } catch (err) {
        setError(err.response?.data || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, [positionGroupLevels]),

    bulkUpdateGrades: useCallback(async (updates) => {
      setLoading(true);
      setError(null);
      try {
        const response = await gradingAPI.bulkUpdateGrades(updates);
        
        // Update local grading data
        setGradingData(prev => prev.map(employee => {
          const update = updates.find(u => u.employee_id === employee.id);
          return update ? { ...employee, ...update } : employee;
        }));
        
        return response.data;
      } catch (err) {
        setError(err.response?.data || err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    getGradingLevelsForPosition: useCallback((positionGroupId) => {
      return positionGroupLevels[positionGroupId] || null;
    }, [positionGroupLevels]),

    formatGradingDisplay: useCallback((positionGroup, level) => {
      const levels = positionGroupLevels[positionGroup];
      if (!levels || !level) return 'No Grade';
      
      const levelData = levels.levels?.find(l => l.code === level);
      return levelData ? `${levels.shorthand}${levelData.display}` : 'No Grade';
    }, [positionGroupLevels]),
  };

  return {
    gradingData,
    positionGroupLevels,
    loading,
    error,
    ...actions,
  };
};