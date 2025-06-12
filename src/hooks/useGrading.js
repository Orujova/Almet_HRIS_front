// src/hooks/useGrading.js - DÜZƏLDILMIŞ: Hesablama məntiqini bərpa etdim

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCurrentStructure,
  fetchScenarios,
  calculateDynamicScenario,
  saveDraftScenario,
  applyScenario,
  archiveScenario,
  setScenarioInputs,
  updateScenarioInput,
  updateGradeInput,
  setCalculatedOutputs,
  clearErrors,
  setError,
  selectCurrentStructure,
  selectScenarioInputs,
  selectCalculatedOutputs,
  selectDraftScenarios,
  selectArchivedScenarios,
  selectLoading,
  selectErrors,
  selectBestDraftScenario
} from '@/store/slices/gradingSlice';

const useGrading = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const currentData = useSelector(selectCurrentStructure);
  const scenarioInputs = useSelector(selectScenarioInputs);
  const calculatedOutputs = useSelector(selectCalculatedOutputs);
  const draftScenarios = useSelector(selectDraftScenarios);
  const archivedScenarios = useSelector(selectArchivedScenarios);
  const loading = useSelector(selectLoading);
  const errors = useSelector(selectErrors);
  const bestDraft = useSelector(selectBestDraftScenario);

  // Local state
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculationInputs, setLastCalculationInputs] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCurrentStructure()),
          dispatch(fetchScenarios({ status: 'DRAFT' })),
          dispatch(fetchScenarios({ status: 'ARCHIVED' }))
        ]);
      } catch (error) {
        console.error('Error loading grading data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  // Handle base value change - DÜZƏLDILMIŞ
  const handleBaseValueChange = useCallback((value) => {
    console.log('📊 Base value changed:', value);
    dispatch(updateScenarioInput({ field: 'baseValue1', value }));
    
    if (errors.baseValue1) {
      dispatch(clearErrors());
    }
    
    // Trigger calculation after short delay
    const timer = setTimeout(() => {
      if (value && parseFloat(value) > 0) {
        calculateGrades();
      } else {
        // Clear outputs if no base value
        clearCalculatedOutputs();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, errors.baseValue1]);

  // Handle vertical change - DÜZƏLDILMIŞ
  const handleVerticalChange = useCallback((gradeName, value) => {
    console.log('📈 Vertical changed for', gradeName, ':', value);
    dispatch(updateGradeInput({ gradeName, field: 'vertical', value }));
    
    if (errors[`vertical-${gradeName}`]) {
      dispatch(clearErrors());
    }
    
    // Trigger calculation after short delay
    const timer = setTimeout(() => {
      calculateGrades();
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, errors]);

  // Handle global horizontal change - DÜZƏLDILMIŞ
  const handleGlobalHorizontalChange = useCallback((intervalKey, value) => {
    console.log('🔄 Global horizontal changed:', intervalKey, '=', value);
    
    const newGlobalIntervals = {
      ...scenarioInputs.globalHorizontalIntervals,
      [intervalKey]: value
    };
    
    console.log('📋 New global intervals:', newGlobalIntervals);
    
    dispatch(updateScenarioInput({ 
      field: 'globalHorizontalIntervals', 
      value: newGlobalIntervals 
    }));
    
    if (errors[`global-horizontal-${intervalKey}`]) {
      dispatch(clearErrors());
    }
    
    // Trigger calculation after short delay
    const timer = setTimeout(() => {
      calculateGrades();
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, scenarioInputs.globalHorizontalIntervals, errors]);

  // Clear calculated outputs
  const clearCalculatedOutputs = useCallback(() => {
    const emptyOutputs = {};
    if (scenarioInputs.gradeOrder) {
      scenarioInputs.gradeOrder.forEach((gradeName) => {
        emptyOutputs[gradeName] = { 
          LD: "", LQ: "", M: "", UQ: "", UD: "" 
        };
      });
      dispatch(setCalculatedOutputs(emptyOutputs));
    }
  }, [dispatch, scenarioInputs.gradeOrder]);

  // Calculate grades - TAMAMILƏ DÜZƏLDİLMİŞ
  const calculateGrades = useCallback(async () => {
    try {
      console.log('🧮 CALCULATE GRADES START');
      console.log('Current inputs:', {
        baseValue1: scenarioInputs.baseValue1,
        grades: scenarioInputs.grades,
        globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals
      });
      
      // Check if we have base value
      if (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
        console.log('❌ No valid base value, clearing outputs');
        clearCalculatedOutputs();
        return;
      }

      // Check if we have meaningful inputs
      const hasVerticalInputs = Object.values(scenarioInputs.grades || {}).some(grade => 
        grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined && grade.vertical !== 0
      );
      
      const hasHorizontalInputs = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
        interval !== '' && interval !== null && interval !== undefined && interval !== 0
      );

      console.log('📊 Input check:', {
        hasVerticalInputs,
        hasHorizontalInputs,
        baseValue: scenarioInputs.baseValue1
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

      // Format grades for backend - DÜZƏLDİLMİŞ
      const formattedGrades = {};
      if (scenarioInputs.gradeOrder && scenarioInputs.globalHorizontalIntervals) {
        scenarioInputs.gradeOrder.forEach(gradeName => {
          const gradeInput = scenarioInputs.grades[gradeName] || {};
          
          // Handle vertical input
          let verticalValue = gradeInput.vertical;
          if (verticalValue === '' || verticalValue === null || verticalValue === undefined) {
            verticalValue = null;
          } else {
            try {
              verticalValue = parseFloat(verticalValue);
            } catch (e) {
              verticalValue = null;
            }
          }
          
          // Handle global horizontal intervals - apply to ALL positions
          const cleanIntervals = {};
          Object.keys(scenarioInputs.globalHorizontalIntervals).forEach(key => {
            const value = scenarioInputs.globalHorizontalIntervals[key];
            if (value === '' || value === null || value === undefined) {
              cleanIntervals[key] = 0;
            } else {
              try {
                cleanIntervals[key] = parseFloat(value);
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
      }

      const calculationData = {
        baseValue1: parseFloat(scenarioInputs.baseValue1),
        gradeOrder: scenarioInputs.gradeOrder,
        grades: formattedGrades
      };

      console.log('📤 SENDING CALCULATION DATA:', calculationData);

      const response = await dispatch(calculateDynamicScenario(calculationData));
      
      if (response.type.endsWith('/fulfilled')) {
        console.log('✅ Calculation successful');
        console.log('📥 Response:', response.payload);
      } else {
        console.error('❌ Calculation failed:', response.payload);
        // Don't clear outputs on failure, keep previous results
      }
    } catch (error) {
      console.error('❌ Error calculating grades:', error);
      // Don't clear outputs on error, keep previous results
    } finally {
      setIsCalculating(false);
    }
  }, [dispatch, scenarioInputs, lastCalculationInputs, clearCalculatedOutputs]);

  // Validation for save draft - DÜZƏLDİLMİŞ
  const canSaveDraft = useMemo(() => {
    // Must have base value
    if (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
      return false;
    }

    // Must have calculated outputs
    const hasCalculatedOutputs = Object.values(calculatedOutputs || {}).some(grade => 
      grade && (grade.LD || grade.LQ || grade.M || grade.UQ || grade.UD)
    );

    if (!hasCalculatedOutputs) {
      return false;
    }

    // Must have some meaningful inputs
    const hasVerticalInputs = Object.values(scenarioInputs.grades || {}).some(grade => 
      grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined && grade.vertical !== 0
    );
    
    const hasHorizontalInputs = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
      interval !== '' && interval !== null && interval !== undefined && interval !== 0
    );

    if (!hasVerticalInputs && !hasHorizontalInputs) {
      return false;
    }

    // Check for validation errors
    const hasErrors = Object.keys(errors).some(key => errors[key] !== null);
    if (hasErrors) {
      return false;
    }

    return true;
  }, [scenarioInputs, calculatedOutputs, errors]);

  // Save draft - DÜZƏLDİLMİŞ
  const handleSaveDraft = useCallback(async () => {
    try {
      console.log('💾 STARTING SAVE DRAFT');
      
      if (!canSaveDraft) {
        console.error('❌ Cannot save draft - validation failed');
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

      console.log('📤 SENDING DRAFT DATA:', draftData);

      const response = await dispatch(saveDraftScenario(draftData));
      
      if (response.type.endsWith('/fulfilled')) {
        console.log('✅ Draft saved successfully');
        // Refresh draft scenarios
        dispatch(fetchScenarios({ status: 'DRAFT' }));
      } else {
        console.error('❌ Failed to save draft:', response.payload);
      }
    } catch (error) {
      console.error('❌ Error saving draft:', error);
    }
  }, [dispatch, scenarioInputs, calculatedOutputs, canSaveDraft]);

  // Save as current
  const handleSaveAsCurrent = useCallback(async (scenarioId) => {
    try {
      const response = await dispatch(applyScenario(scenarioId));
      if (response.type.endsWith('/fulfilled')) {
        console.log('✅ Scenario applied successfully');
      }
    } catch (error) {
      console.error('Error applying scenario:', error);
    }
  }, [dispatch]);

  // Archive draft
  const handleArchiveDraft = useCallback(async (scenarioId) => {
    try {
      const response = await dispatch(archiveScenario(scenarioId));
      if (response.type.endsWith('/fulfilled')) {
        await Promise.all([
          dispatch(fetchScenarios({ status: 'DRAFT' })),
          dispatch(fetchScenarios({ status: 'ARCHIVED' }))
        ]);
      }
    } catch (error) {
      console.error('Error archiving scenario:', error);
    }
  }, [dispatch]);

  // View details
  const handleViewDetails = useCallback((scenario) => {
    setSelectedScenario(scenario);
    setIsDetailOpen(true);
  }, []);

  // Comparison functions
  const toggleCompareMode = useCallback(() => {
    setCompareMode(prev => !prev);
    setSelectedForComparison([]);
  }, []);

  const toggleScenarioForComparison = useCallback((scenarioId) => {
    setSelectedForComparison(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      } else {
        return [...prev, scenarioId];
      }
    });
  }, []);

  const startComparison = useCallback(() => {
    setIsDetailOpen(true);
  }, []);

  const getScenarioForComparison = useCallback((scenarioId) => {
    if (scenarioId === 'current') {
      return currentData;
    }
    return [...draftScenarios, ...archivedScenarios].find(s => s.id === scenarioId);
  }, [currentData, draftScenarios, archivedScenarios]);

  // New scenario display data - DÜZƏLDİLMİŞ
  const newScenarioDisplayData = useMemo(() => {
    if (!scenarioInputs.gradeOrder || scenarioInputs.gradeOrder.length === 0) {
      return null;
    }
    
    const combinedGrades = {};
    scenarioInputs.gradeOrder.forEach((gradeName) => {
      const inputGrade = scenarioInputs.grades[gradeName] || { vertical: '' };
      const outputGrade = calculatedOutputs[gradeName] || { LD: "", LQ: "", M: "", UQ: "", UD: "" };
      
      combinedGrades[gradeName] = {
        ...inputGrade,
        ...outputGrade
      };
    });
    
    return {
      baseValue1: scenarioInputs.baseValue1,
      gradeOrder: scenarioInputs.gradeOrder,
      grades: combinedGrades,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals
    };
  }, [scenarioInputs, calculatedOutputs]);

  // Input summary
  const inputSummary = useMemo(() => {
    if (!scenarioInputs.gradeOrder || scenarioInputs.gradeOrder.length === 0) {
      return null;
    }

    const totalPositions = scenarioInputs.gradeOrder.length;
    const verticalInputs = scenarioInputs.gradeOrder.filter((gradeName, index) => {
      return index < (totalPositions - 1);
    }).length;

    const hasGlobalIntervals = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
      interval !== '' && interval !== null && interval !== undefined && interval !== 0
    );

    const horizontalIntervals = ['LD→LQ', 'LQ→M', 'M→UQ', 'UQ→UD'];
    const basePosition = scenarioInputs.gradeOrder[totalPositions - 1];

    return {
      totalPositions,
      verticalInputs,
      horizontalInputs: hasGlobalIntervals ? 4 : 0,
      horizontalIntervals,
      basePosition,
      verticalTransitions: verticalInputs,
      hasGlobalIntervals
    };
  }, [scenarioInputs.gradeOrder, scenarioInputs.globalHorizontalIntervals]);

  // Validation summary
  const validationSummary = useMemo(() => {
    const summary = {
      hasBaseValue: !!(scenarioInputs.baseValue1 && parseFloat(scenarioInputs.baseValue1) > 0),
      hasVerticalInputs: Object.values(scenarioInputs.grades || {}).some(grade => 
        grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined && grade.vertical !== 0
      ),
      hasHorizontalInputs: Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
        interval !== '' && interval !== null && interval !== undefined && interval !== 0
      ),
      hasCalculatedOutputs: Object.values(calculatedOutputs || {}).some(grade => 
        grade && (grade.LD || grade.LQ || grade.M || grade.UQ || grade.UD)
      ),
      hasErrors: Object.keys(errors).some(key => errors[key] !== null),
      canSave: canSaveDraft
    };

    return summary;
  }, [scenarioInputs, calculatedOutputs, errors, canSaveDraft]);

  // AUTO-CALCULATION: Trigger calculation when inputs change
  useEffect(() => {
    if (scenarioInputs.baseValue1 && parseFloat(scenarioInputs.baseValue1) > 0) {
      const hasAnyInput = 
        Object.values(scenarioInputs.grades || {}).some(grade => 
          grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined && grade.vertical !== 0
        ) ||
        Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
          interval !== '' && interval !== null && interval !== undefined && interval !== 0
        );

      if (hasAnyInput) {
        const timer = setTimeout(() => {
          calculateGrades();
        }, 1000); // Wait 1 second for user to finish typing

        return () => clearTimeout(timer);
      }
    }
  }, [scenarioInputs, calculateGrades]);

  // Clear calculated outputs when base value is cleared
  useEffect(() => {
    if (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
      clearCalculatedOutputs();
    }
  }, [scenarioInputs.baseValue1, clearCalculatedOutputs]);

  return {
    // Data
    currentData,
    scenarioInputs,
    calculatedOutputs,
    newScenarioDisplayData,
    draftScenarios,
    archivedScenarios,
    selectedScenario,
    bestDraft,
    inputSummary,
    validationSummary,
    
    // UI State
    isDetailOpen,
    setIsDetailOpen,
    compareMode,
    selectedForComparison,
    loading: loading.currentStructure || loading.calculating || isCalculating,
    errors,
    canSaveDraft,
    
    // Actions
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
    calculateGrades
  };
};

export default useGrading;