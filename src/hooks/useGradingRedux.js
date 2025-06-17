// src/hooks/useGradingRedux.js - Loading loop fix
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef } from 'react';
import {
  fetchGradingSystems,
  fetchGradingDropdowns,
  fetchCurrentScenario,
  fetchCurrentGrades,
  fetchScenarios,
  fetchScenarioStatistics,
  createScenario,
  calculateScenario,
  applyScenario,
  archiveScenario,
  duplicateScenario,
  deleteScenario,
  setSelectedSystemId,
  clearErrors,
  clearError,
  selectGradingSystems,
  selectSelectedSystemId,
  selectPositionGroups,
  selectCurrentScenario,
  selectCurrentGrades,
  selectDraftScenarios,
  selectArchivedScenarios,
  selectStatistics,
  selectLoading,
  selectErrors,
  selectIsLoading,
  selectHasErrors,
  selectOrderedPositions,
  selectAvailableForComparison,
  selectOperationLoadingStates,
  selectOperationErrorStates
} from '../store/slices/gradingSlice';

export const useGradingRedux = () => {
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const systemChanged = useRef(false);
  
  // Selectors
  const gradingSystems = useSelector(selectGradingSystems);
  const selectedSystemId = useSelector(selectSelectedSystemId);
  const positionGroups = useSelector(selectPositionGroups);
  const currentScenario = useSelector(selectCurrentScenario);
  const currentGrades = useSelector(selectCurrentGrades);
  const draftScenarios = useSelector(selectDraftScenarios);
  const archivedScenarios = useSelector(selectArchivedScenarios);
  const statistics = useSelector(selectStatistics);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);
  const isLoading = useSelector(selectIsLoading);
  const hasErrors = useSelector(selectHasErrors);
  const orderedPositions = useSelector(selectOrderedPositions);
  const availableForComparison = useSelector(selectAvailableForComparison);

  // Actions
  const actions = {
    // Data fetching
    fetchGradingSystems: useCallback(() => dispatch(fetchGradingSystems()), [dispatch]),
    fetchGradingDropdowns: useCallback(() => dispatch(fetchGradingDropdowns()), [dispatch]),
    fetchCurrentScenario: useCallback((systemId) => dispatch(fetchCurrentScenario(systemId)), [dispatch]),
    fetchCurrentGrades: useCallback((systemId) => dispatch(fetchCurrentGrades(systemId)), [dispatch]),
    fetchDraftScenarios: useCallback((systemId) => 
      dispatch(fetchScenarios({ gradingSystemId: systemId, status: 'DRAFT' })), [dispatch]),
    fetchArchivedScenarios: useCallback((systemId) => 
      dispatch(fetchScenarios({ gradingSystemId: systemId, status: 'ARCHIVED' })), [dispatch]),
    fetchStatistics: useCallback((systemId) => dispatch(fetchScenarioStatistics(systemId)), [dispatch]),

    // Scenario operations
    createScenario: useCallback((scenarioData) => dispatch(createScenario(scenarioData)), [dispatch]),
    calculateScenario: useCallback((scenarioId) => dispatch(calculateScenario(scenarioId)), [dispatch]),
    applyScenario: useCallback((scenarioId) => dispatch(applyScenario(scenarioId)), [dispatch]),
    archiveScenario: useCallback((scenarioId) => dispatch(archiveScenario(scenarioId)), [dispatch]),
    duplicateScenario: useCallback((scenarioId) => dispatch(duplicateScenario(scenarioId)), [dispatch]),
    deleteScenario: useCallback((scenarioId) => dispatch(deleteScenario(scenarioId)), [dispatch]),

    // System management
    setSelectedSystemId: useCallback((systemId) => dispatch(setSelectedSystemId(systemId)), [dispatch]),
    
    // Error management
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    clearError: useCallback((errorKey) => dispatch(clearError(errorKey)), [dispatch])
  };

  // Combined actions
  const switchGradingSystem = useCallback(async (systemId) => {
    console.log('Switching to grading system:', systemId);
    systemChanged.current = true;
    actions.setSelectedSystemId(systemId);
    
    // Don't fetch immediately, let the effect handle it
  }, [actions]);

  const refreshAll = useCallback(async (systemId) => {
    if (!systemId) return;
    
    console.log('Refreshing data for system:', systemId);
    try {
      await Promise.all([
        actions.fetchCurrentScenario(systemId),
        actions.fetchCurrentGrades(systemId),
        actions.fetchDraftScenarios(systemId),
        actions.fetchArchivedScenarios(systemId),
        actions.fetchStatistics(systemId)
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [actions]);

  // Initialize data on mount - ONLY ONCE
  useEffect(() => {
    if (!initialized.current) {
      console.log('Initializing grading data...');
      initialized.current = true;
      actions.fetchGradingSystems();
      actions.fetchGradingDropdowns();
    }
  }, []); // Empty dependency array

  // Fetch data when system changes - PREVENT LOOP
  useEffect(() => {
    if (selectedSystemId && (systemChanged.current || (!currentScenario && !loading.currentScenario))) {
      console.log('System changed or initial load, fetching data for:', selectedSystemId);
      systemChanged.current = false;
      refreshAll(selectedSystemId);
    }
  }, [selectedSystemId]); // Only depend on selectedSystemId

  return {
    // Data
    gradingSystems,
    selectedSystemId,
    positionGroups,
    currentScenario,
    currentGrades,
    draftScenarios,
    archivedScenarios,
    statistics,
    orderedPositions,
    availableForComparison,
    
    // State
    loading,
    errors,
    isLoading,
    hasErrors,
    
    // Actions
    ...actions,
    switchGradingSystem,
    refreshAll: () => refreshAll(selectedSystemId)
  };
};

// Specific hooks for different parts of the grading system
export const useGradingState = () => {
  const currentScenario = useSelector(selectCurrentScenario);
  const currentGrades = useSelector(selectCurrentGrades);
  const loading = useSelector(state => state.grading.loading.currentScenario || state.grading.loading.currentGrades);
  const error = useSelector(state => state.grading.error.currentScenario || state.grading.error.currentGrades);

  return {
    currentScenario,
    currentGrades,
    loading,
    error
  };
};

export const useScenarios = () => {
  const draftScenarios = useSelector(selectDraftScenarios);
  const archivedScenarios = useSelector(selectArchivedScenarios);
  const statistics = useSelector(selectStatistics);
  const loading = useSelector(state => ({
    drafts: state.grading.loading.draftScenarios,
    archived: state.grading.loading.archivedScenarios,
    statistics: state.grading.loading.statistics
  }));
  const errors = useSelector(state => ({
    drafts: state.grading.error.draftScenarios,
    archived: state.grading.error.archivedScenarios,
    statistics: state.grading.error.statistics
  }));

  return {
    draftScenarios,
    archivedScenarios,
    statistics,
    loading,
    errors
  };
};

export const useScenarioOperations = () => {
  const dispatch = useDispatch();
  // Use memoized selectors to prevent unnecessary re-renders
  const loading = useSelector(selectOperationLoadingStates);
  const errors = useSelector(selectOperationErrorStates);

  const operations = {
    createScenario: useCallback((scenarioData) => dispatch(createScenario(scenarioData)), [dispatch]),
    calculateScenario: useCallback((scenarioId) => dispatch(calculateScenario(scenarioId)), [dispatch]),
    applyScenario: useCallback((scenarioId) => dispatch(applyScenario(scenarioId)), [dispatch]),
    archiveScenario: useCallback((scenarioId) => dispatch(archiveScenario(scenarioId)), [dispatch]),
    duplicateScenario: useCallback((scenarioId) => dispatch(duplicateScenario(scenarioId)), [dispatch]),
    deleteScenario: useCallback((scenarioId) => dispatch(deleteScenario(scenarioId)), [dispatch])
  };

  return {
    ...operations,
    loading,
    errors
  };
};

export const useGradingComparison = () => {
  // Use memoized selectors to prevent unnecessary re-renders
  const availableForComparison = useSelector(selectAvailableForComparison);
  const orderedPositions = useSelector(selectOrderedPositions);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: 'AZN'
    }).format(value);
  }, []);

  const calculateScenarioMetrics = useCallback((scenario) => {
    if (!scenario.calculatedGrades || !orderedPositions.length) {
      return {
        totalBudgetImpact: 0,
        avgSalaryIncrease: 0,
        competitiveness: 0,
        riskLevel: 'Low'
      };
    }

    const totalBudgetImpact = orderedPositions.reduce((total, position) => {
      const grade = scenario.calculatedGrades[position.id];
      return total + (grade?.median || 0);
    }, 0);

    // Calculate average salary increase (simplified)
    const avgSalaryIncrease = 10; // Placeholder calculation

    // Calculate competitiveness (simplified)
    const competitiveness = 75; // Placeholder calculation

    // Calculate risk level (simplified)
    const riskLevel = totalBudgetImpact > 1000000 ? 'High' : 
                     totalBudgetImpact > 500000 ? 'Medium' : 'Low';

    return {
      totalBudgetImpact,
      avgSalaryIncrease,
      competitiveness,
      riskLevel
    };
  }, [orderedPositions]);

  return {
    availableForComparison,
    orderedPositions,
    formatCurrency,
    calculateScenarioMetrics
  };
};