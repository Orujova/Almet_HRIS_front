// src/hooks/useGrading.js - ENHANCED: Complete data management with proper initialization

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCurrentStructure,
  fetchCurrentScenario,
  fetchPositionGroups,
  fetchScenarios,
  fetchScenarioDetails,
  calculateDynamicScenario,
  saveDraftScenario,
  applyScenario,
  archiveScenario,
  setScenarioInputs,
  updateScenarioInput,
  updateGradeInput,
  updateGlobalHorizontalInterval,
  setCalculatedOutputs,
  setSelectedScenario,
  clearErrors,
  setError,
  initializeScenarioInputs,
  selectCurrentStructure,
  selectCurrentScenario,
  selectPositionGroups,
  selectScenarioInputs,
  selectCalculatedOutputs,
  selectDraftScenarios,
  selectArchivedScenarios,
  selectSelectedScenario,
  selectLoading,
  selectErrors,
  selectBestDraftScenario,
  selectValidationSummary,
  selectInputSummary
} from '@/store/slices/gradingSlice';

const useGrading = () => {
  const dispatch = useDispatch();
  
  // Redux state - ENHANCED with all selectors
  const currentData = useSelector(selectCurrentStructure);
  const currentScenario = useSelector(selectCurrentScenario);
  const positionGroups = useSelector(selectPositionGroups);
  const scenarioInputs = useSelector(selectScenarioInputs);
  const calculatedOutputs = useSelector(selectCalculatedOutputs);
  const draftScenarios = useSelector(selectDraftScenarios);
  const archivedScenarios = useSelector(selectArchivedScenarios);
  const selectedScenario = useSelector(selectSelectedScenario);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);
  const bestDraft = useSelector(selectBestDraftScenario);
  const validationSummary = useSelector(selectValidationSummary);
  const inputSummary = useSelector(selectInputSummary);

  // Local state for UI management
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculationInputs, setLastCalculationInputs] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ENHANCED: Complete data loading with proper initialization
  const loadInitialData = useCallback(async () => {
    console.log('🚀 Starting initial data load...');
    
    try {
      // Load core data in parallel
      const corePromises = [
        dispatch(fetchCurrentStructure()),
        dispatch(fetchPositionGroups()),
        dispatch(fetchCurrentScenario())
      ];
      
      const coreResults = await Promise.allSettled(corePromises);
      
      // Check if core data loaded successfully
      const currentStructureResult = coreResults[0];
      if (currentStructureResult.status === 'fulfilled' && currentStructureResult.value.payload) {
        console.log('✅ Core data loaded, initializing scenario inputs...');
        dispatch(initializeScenarioInputs(currentStructureResult.value.payload));
      }
      
      // Load scenarios
      const scenarioPromises = [
        dispatch(fetchScenarios({ status: 'DRAFT' })),
        dispatch(fetchScenarios({ status: 'ARCHIVED' }))
      ];
      
      await Promise.allSettled(scenarioPromises);
      
      setIsInitialized(true);
      console.log('✅ Initial data load completed');
      
    } catch (error) {
      console.error('❌ Error during initial data load:', error);
      setIsInitialized(true); // Set to true even on error to prevent infinite loading
    }
  }, [dispatch]);

  // Initialize data on mount
  useEffect(() => {
    if (!isInitialized) {
      loadInitialData();
    }
  }, [loadInitialData, isInitialized]);

  // ENHANCED: Base value handler with validation
  const handleBaseValueChange = useCallback((value) => {
    console.log('📊 Base value changed:', value);
    
    // Clear previous errors
    if (errors.baseValue1) {
      dispatch(clearErrors());
    }
    
    // Validate input
    const numValue = parseFloat(value);
    if (value !== '' && (isNaN(numValue) || numValue <= 0)) {
      dispatch(setError({ field: 'baseValue1', message: 'Base value must be a positive number' }));
      return;
    }
    
    // Update value
    dispatch(updateScenarioInput({ field: 'baseValue1', value }));
    
    // Trigger calculation after delay
    const timer = setTimeout(() => {
      if (value && numValue > 0) {
        calculateGrades();
      } else {
        clearCalculatedOutputs();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, errors.baseValue1]);

  // ENHANCED: Vertical change handler with position awareness
  const handleVerticalChange = useCallback((gradeName, value) => {
    console.log('📈 Vertical changed for', gradeName, ':', value);
    
    // Clear previous errors for this field
    const errorKey = `vertical-${gradeName}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      dispatch(clearErrors());
    }
    
    // Validate input
    if (value !== '' && value !== null && value !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        dispatch(setError({ 
          field: errorKey, 
          message: `Vertical rate for ${gradeName} must be between 0-100` 
        }));
        return;
      }
    }
    
    // Update value
    dispatch(updateGradeInput({ gradeName, field: 'vertical', value }));
    
    // Trigger calculation
    const timer = setTimeout(() => {
      calculateGrades();
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, errors]);

  // ENHANCED: Global horizontal change handler
  const handleGlobalHorizontalChange = useCallback((intervalKey, value) => {
    console.log('🔄 Global horizontal changed:', intervalKey, '=', value);
    
    // Clear previous errors for this field
    const errorKey = `global-horizontal-${intervalKey}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      dispatch(clearErrors());
    }
    
    // Validate input
    if (value !== '' && value !== null && value !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        dispatch(setError({ 
          field: errorKey, 
          message: `${intervalKey.replace(/_/g, ' ')} rate must be between 0-100` 
        }));
        return;
      }
    }
    
    // Update value using the specific action
    dispatch(updateGlobalHorizontalInterval({ intervalKey, value }));
    
    // Trigger calculation
    const timer = setTimeout(() => {
      calculateGrades();
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, errors]);

  // ENHANCED: Clear calculated outputs with proper structure
  const clearCalculatedOutputs = useCallback(() => {
    console.log('🧹 Clearing calculated outputs...');
    
    const emptyOutputs = {};
    if (scenarioInputs.gradeOrder && scenarioInputs.gradeOrder.length > 0) {
      scenarioInputs.gradeOrder.forEach((gradeName) => {
        emptyOutputs[gradeName] = { 
          LD: "", LQ: "", M: "", UQ: "", UD: "" 
        };
      });
      dispatch(setCalculatedOutputs(emptyOutputs));
    }
  }, [dispatch, scenarioInputs.gradeOrder]);

  // ENHANCED: Calculate grades with comprehensive validation
  const calculateGrades = useCallback(async () => {
    try {
      console.log('🧮 Starting grade calculation...');
      
      // Validate prerequisites
      if (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
        console.log('❌ No valid base value, clearing outputs');
        clearCalculatedOutputs();
        return;
      }

      if (!scenarioInputs.gradeOrder || scenarioInputs.gradeOrder.length === 0) {
        console.log('❌ No grade order defined');
        return;
      }

      // Check for meaningful inputs
      const hasVerticalInputs = Object.values(scenarioInputs.grades || {}).some(grade => 
        grade && grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined && grade.vertical !== 0
      );
      
      const hasHorizontalInputs = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
        interval !== '' && interval !== null && interval !== undefined && interval !== 0
      );

      console.log('📊 Input validation:', {
        baseValue: scenarioInputs.baseValue1,
        hasVerticalInputs,
        hasHorizontalInputs,
        gradeCount: scenarioInputs.gradeOrder.length
      });

      if (!hasVerticalInputs && !hasHorizontalInputs) {
        console.log('❌ No meaningful inputs, clearing outputs');
        clearCalculatedOutputs();
        return;
      }

      // Avoid duplicate calculations
      const currentInputString = JSON.stringify({
        baseValue1: scenarioInputs.baseValue1,
        grades: scenarioInputs.grades,
        globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals
      });

      if (currentInputString === lastCalculationInputs) {
        console.log('⏭️ Same inputs, skipping calculation');
        return;
      }

      setIsCalculating(true);
      setLastCalculationInputs(currentInputString);

      // Format data for API with enhanced structure
      const formattedGrades = {};
      scenarioInputs.gradeOrder.forEach(gradeName => {
        const gradeInput = scenarioInputs.grades[gradeName] || {};
        
        // Handle vertical input with proper null handling
        let verticalValue = gradeInput.vertical;
        if (verticalValue === '' || verticalValue === null || verticalValue === undefined) {
          verticalValue = null;
        } else {
          try {
            verticalValue = parseFloat(verticalValue);
            if (isNaN(verticalValue)) {
              verticalValue = null;
            }
          } catch (e) {
            verticalValue = null;
          }
        }
        
        // Apply global horizontal intervals to ALL positions
        const cleanIntervals = {};
        Object.keys(scenarioInputs.globalHorizontalIntervals || {}).forEach(key => {
          const value = scenarioInputs.globalHorizontalIntervals[key];
          if (value === '' || value === null || value === undefined) {
            cleanIntervals[key] = 0;
          } else {
            try {
              cleanIntervals[key] = parseFloat(value) || 0;
            } catch (e) {
              cleanIntervals[key] = 0;
            }
          }
        });
        
        formattedGrades[gradeName] = {
          vertical: verticalValue,
          horizontal_intervals: cleanIntervals
        };
      });

      const calculationData = {
        baseValue1: parseFloat(scenarioInputs.baseValue1),
        gradeOrder: scenarioInputs.gradeOrder,
        grades: formattedGrades
      };

      console.log('📤 Sending calculation request:', calculationData);

      const response = await dispatch(calculateDynamicScenario(calculationData));
      
      if (response.type.endsWith('/fulfilled')) {
        console.log('✅ Calculation successful:', response.payload);
      } else {
        console.error('❌ Calculation failed:', response.payload);
      }
    } catch (error) {
      console.error('❌ Error during calculation:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [
    dispatch, 
    scenarioInputs, 
    lastCalculationInputs, 
    clearCalculatedOutputs
  ]);

  // ENHANCED: Save draft with comprehensive data preparation
  const handleSaveDraft = useCallback(async () => {
    try {
      console.log('💾 Starting save draft...');
      
      if (!validationSummary.canSave) {
        console.error('❌ Cannot save draft - validation failed');
        dispatch(setError({ field: 'saving', message: 'Please fix validation errors before saving' }));
        return;
      }

      const draftData = {
        name: `Scenario ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        description: 'Auto-generated scenario with global horizontal intervals',
        baseValue1: parseFloat(scenarioInputs.baseValue1),
        gradeOrder: scenarioInputs.gradeOrder,
        grades: scenarioInputs.grades,
        globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals || {
          LD_to_LQ: 0,
          LQ_to_M: 0,
          M_to_UQ: 0,
          UQ_to_UD: 0
        },
        calculatedOutputs: calculatedOutputs
      };

      console.log('📤 Saving draft data:', draftData);

      const response = await dispatch(saveDraftScenario(draftData));
      
      if (response.type.endsWith('/fulfilled')) {
        console.log('✅ Draft saved successfully');
        // Clear current inputs after successful save
        dispatch(initializeScenarioInputs(currentData));
        clearCalculatedOutputs();
      } else {
        console.error('❌ Failed to save draft:', response.payload);
      }
    } catch (error) {
      console.error('❌ Error saving draft:', error);
    }
  }, [
    dispatch, 
    validationSummary.canSave, 
    scenarioInputs, 
    calculatedOutputs, 
    currentData, 
    clearCalculatedOutputs
  ]);

  // ENHANCED: Apply scenario with data refresh
  const handleSaveAsCurrent = useCallback(async (scenarioId) => {
    try {
      console.log('🎯 Applying scenario:', scenarioId);
      const response = await dispatch(applyScenario(scenarioId));
      
      if (response.type.endsWith('/fulfilled')) {
        console.log('✅ Scenario applied successfully');
        setIsDetailOpen(false);
      } else {
        console.error('❌ Failed to apply scenario:', response.payload);
      }
    } catch (error) {
      console.error('❌ Error applying scenario:', error);
    }
  }, [dispatch]);

  // ENHANCED: Archive scenario with refresh
  const handleArchiveDraft = useCallback(async (scenarioId) => {
    try {
      console.log('📦 Archiving scenario:', scenarioId);
      const response = await dispatch(archiveScenario(scenarioId));
      
      if (response.type.endsWith('/fulfilled')) {
        console.log('✅ Scenario archived successfully');
        setIsDetailOpen(false);
      } else {
        console.error('❌ Failed to archive scenario:', response.payload);
      }
    } catch (error) {
      console.error('❌ Error archiving scenario:', error);
    }
  }, [dispatch]);

  // ENHANCED: View details with data fetching
  const handleViewDetails = useCallback(async (scenario) => {
    try {
      console.log('🔍 Viewing scenario details:', scenario.name);
      
      // If we need fresh data, fetch it
      if (scenario.id && scenario.status !== 'current') {
        const response = await dispatch(fetchScenarioDetails(scenario.id));
        if (response.type.endsWith('/fulfilled')) {
          dispatch(setSelectedScenario(response.payload));
        } else {
          // Fallback to existing data
          dispatch(setSelectedScenario(scenario));
        }
      } else {
        dispatch(setSelectedScenario(scenario));
      }
      
      setIsDetailOpen(true);
    } catch (error) {
      console.error('❌ Error viewing details:', error);
      // Fallback to existing data
      dispatch(setSelectedScenario(scenario));
      setIsDetailOpen(true);
    }
  }, [dispatch]);

  // ENHANCED: Comparison functions
  const toggleCompareMode = useCallback(() => {
    setCompareMode(prev => {
      const newMode = !prev;
      console.log('🔄 Compare mode:', newMode ? 'ON' : 'OFF');
      if (!newMode) {
        setSelectedForComparison([]);
      }
      return newMode;
    });
  }, []);

  const toggleScenarioForComparison = useCallback((scenarioId) => {
    setSelectedForComparison(prev => {
      const newSelection = prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId];
      
      console.log('🔄 Comparison selection:', newSelection);
      return newSelection;
    });
  }, []);

  const startComparison = useCallback(() => {
    console.log('🚀 Starting comparison with:', selectedForComparison);
    setIsDetailOpen(true);
  }, [selectedForComparison]);

  const getScenarioForComparison = useCallback((scenarioId) => {
    if (scenarioId === 'current') {
      return currentData;
    }
    
    // Search in all scenarios
    const allScenarios = [...draftScenarios, ...archivedScenarios];
    const scenario = allScenarios.find(s => s.id === scenarioId);
    
    console.log('🔍 Found scenario for comparison:', scenario?.name);
    return scenario;
  }, [currentData, draftScenarios, archivedScenarios]);

  // ENHANCED: Refresh data function
  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing all data...');
    await loadInitialData();
  }, [loadInitialData]);

  // ENHANCED: Combined scenario display data
  const newScenarioDisplayData = useMemo(() => {
    if (!scenarioInputs.gradeOrder || scenarioInputs.gradeOrder.length === 0) {
      return null;
    }
    
    const combinedGrades = {};
    scenarioInputs.gradeOrder.forEach((gradeName) => {
      const inputGrade = scenarioInputs.grades[gradeName] || { vertical: '' };
      const outputGrade = calculatedOutputs[gradeName] || { 
        LD: "", LQ: "", M: "", UQ: "", UD: "" 
      };
      
      combinedGrades[gradeName] = {
        ...inputGrade,
        ...outputGrade,
        // Enhanced: Add calculation status
        isCalculated: Object.values(outputGrade).some(value => value && value !== "")
      };
    });
    
    return {
      baseValue1: scenarioInputs.baseValue1,
      gradeOrder: scenarioInputs.gradeOrder,
      grades: combinedGrades,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals,
      // Enhanced: Add summary statistics
      calculationProgress: {
        totalPositions: scenarioInputs.gradeOrder.length,
        calculatedPositions: Object.values(combinedGrades).filter(grade => grade.isCalculated).length,
        hasVerticalInputs: Object.values(scenarioInputs.grades || {}).some(grade => 
          grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined
        ),
        hasHorizontalInputs: Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
          interval !== '' && interval !== null && interval !== undefined && interval !== 0
        )
      }
    };
  }, [scenarioInputs, calculatedOutputs]);

  // ENHANCED: Auto-calculation effect with debouncing
  useEffect(() => {
    if (!isInitialized || !scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
      return;
    }

    const hasAnyInput = 
      Object.values(scenarioInputs.grades || {}).some(grade => 
        grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined && grade.vertical !== 0
      ) ||
      Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
        interval !== '' && interval !== null && interval !== undefined && interval !== 0
      );

    if (hasAnyInput) {
      const timer = setTimeout(() => {
        console.log('⏰ Auto-triggering calculation...');
        calculateGrades();
      }, 1000); // 1 second debounce

      return () => clearTimeout(timer);
    }
  }, [isInitialized, scenarioInputs, calculateGrades]);

  // ENHANCED: Clear outputs when base value is invalid
  useEffect(() => {
    if (isInitialized && (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0)) {
      clearCalculatedOutputs();
    }
  }, [isInitialized, scenarioInputs.baseValue1, clearCalculatedOutputs]);

  // ENHANCED: Determine base position
  const basePositionName = useMemo(() => {
    if (currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0) {
      return currentData.gradeOrder[currentData.gradeOrder.length - 1];
    }
    if (scenarioInputs.gradeOrder && scenarioInputs.gradeOrder.length > 0) {
      return scenarioInputs.gradeOrder[scenarioInputs.gradeOrder.length - 1];
    }
    return "Base Position";
  }, [currentData, scenarioInputs.gradeOrder]);

  // ENHANCED: Loading state aggregation
  const isLoading = useMemo(() => {
    return Object.values(loading).some(Boolean) || isCalculating || !isInitialized;
  }, [loading, isCalculating, isInitialized]);

  // ENHANCED: Error state aggregation
  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  // ENHANCED: Data availability checks
  const dataAvailability = useMemo(() => {
    return {
      hasCurrentData: !!(currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0),
      hasCurrentScenario: !!(currentScenario && currentScenario.id),
      hasPositionGroups: !!(positionGroups && positionGroups.length > 0),
      hasDraftScenarios: draftScenarios.length > 0,
      hasArchivedScenarios: archivedScenarios.length > 0,
      isSystemReady: !!(currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0 && isInitialized)
    };
  }, [currentData, currentScenario, positionGroups, draftScenarios, archivedScenarios, isInitialized]);

  console.log('🔄 useGrading hook state:', {
    isInitialized,
    isLoading,
    hasErrors,
    dataAvailability,
    inputsReady: !!(scenarioInputs.gradeOrder && scenarioInputs.gradeOrder.length > 0),
    canSave: validationSummary.canSave
  });

  return {
    // ENHANCED: Core data with availability flags
    currentData,
    currentScenario,
    positionGroups,
    scenarioInputs,
    calculatedOutputs,
    newScenarioDisplayData,
    draftScenarios,
    archivedScenarios,
    selectedScenario,
    bestDraft,
    basePositionName,
    
    // ENHANCED: Computed state
    validationSummary,
    inputSummary,
    dataAvailability,
    
    // ENHANCED: UI state
    isDetailOpen,
    setIsDetailOpen,
    compareMode,
    selectedForComparison,
    isLoading,
    isCalculating,
    errors,
    hasErrors,
    isInitialized,
    
    // ENHANCED: Direct loading access for granular control
    loading,
    
    // ENHANCED: Actions with comprehensive error handling
    handleBaseValueChange,
    handleVerticalChange,
    handleGlobalHorizontalChange,
    handleSaveDraft,
    handleSaveAsCurrent,
    handleArchiveDraft,
    handleViewDetails,
    toggleCompareMode,
    toggleScenarioForComparison,
    startComparison,
    getScenarioForComparison,
    calculateGrades,
    clearCalculatedOutputs,
    refreshData,
    
    // ENHANCED: Utility functions
    clearErrors: () => dispatch(clearErrors()),
    setError: (field, message) => dispatch(setError({ field, message }))
  };
};

export default useGrading;