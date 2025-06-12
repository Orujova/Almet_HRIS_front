// src/hooks/useGrading.js - FIXED: Removed competitiveness/riskLevel references

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
  selectCurrentStructure,
  selectScenarioInputs,
  selectCalculatedOutputs,
  selectDraftScenarios,
  selectArchivedScenarios,
  selectLoading,
  selectErrors,
  selectBestDraftScenario
} from '@/store/slices/gradingSlice';
import { gradingApi } from '@/services/gradingApi';

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
  
  // ENHANCED: Track calculation state
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculationInputs, setLastCalculationInputs] = useState(null);

  // Initialize scenario inputs with global intervals
  useEffect(() => {
    if (currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0) {
      const initialGrades = {};
      currentData.gradeOrder.forEach((gradeName, index) => {
        // Only allow vertical input for non-base positions
        const isBasePosition = index === (currentData.gradeOrder.length - 1);
        initialGrades[gradeName] = { 
          vertical: isBasePosition ? null : '', // Base position has null vertical
        };
      });
      
      // Initialize with global horizontal intervals
      const initialInputs = {
        baseValue1: '',
        gradeOrder: currentData.gradeOrder,
        grades: initialGrades,
        globalHorizontalIntervals: {
          LD_to_LQ: '',
          LQ_to_M: '',
          M_to_UQ: '',
          UQ_to_UD: ''
        }
      };
      
      dispatch(setScenarioInputs(initialInputs));
      
      // Initialize calculated outputs
      const initialOutputs = {};
      currentData.gradeOrder.forEach((gradeName) => {
        initialOutputs[gradeName] = { 
          LD: "", LQ: "", M: "", UQ: "", UD: "" 
        };
      });
      dispatch(setCalculatedOutputs(initialOutputs));
    }
  }, [currentData, dispatch]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCurrentStructure(1)),
          dispatch(fetchScenarios({ gradingSystemId: 1, status: 'DRAFT' })),
          dispatch(fetchScenarios({ gradingSystemId: 1, status: 'ARCHIVED' }))
        ]);
      } catch (error) {
        console.error('Error loading grading data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  // ENHANCED: Handle base value change with immediate calculation
  const handleBaseValueChange = useCallback((value) => {
    dispatch(updateScenarioInput({ field: 'baseValue1', value }));
    
    // Clear any base value errors
    if (errors.baseValue1) {
      dispatch(clearErrors());
    }
    
    // Trigger calculation with debounce
    setTimeout(() => {
      if (value && parseFloat(value) > 0) {
        calculateGrades();
      }
    }, 300);
  }, [dispatch, errors.baseValue1]);

  // ENHANCED: Handle vertical change with immediate calculation
  const handleVerticalChange = useCallback((gradeName, value) => {
    dispatch(updateGradeInput({ gradeName, field: 'vertical', value }));
    
    // Clear specific grade errors
    if (errors[`vertical-${gradeName}`]) {
      dispatch(clearErrors());
    }
    
    // Trigger calculation with debounce
    setTimeout(() => {
      calculateGrades();
    }, 300);
  }, [dispatch, errors]);

 const handleGlobalHorizontalChange = useCallback((intervalKey, value) => {
  console.log(`🔧 GLOBAL HORIZONTAL CHANGE: ${intervalKey} = ${value}`);
  
  const newGlobalIntervals = {
    ...scenarioInputs.globalHorizontalIntervals,
    [intervalKey]: value
  };
  
  console.log('📊 NEW GLOBAL INTERVALS:', newGlobalIntervals);
  
  dispatch(updateScenarioInput({ 
    field: 'globalHorizontalIntervals', 
    value: newGlobalIntervals 
  }));
  
  // Clear global interval errors
  if (errors[`global-horizontal-${intervalKey}`]) {
    dispatch(clearErrors());
  }
  
  // Trigger calculation with debounce
  setTimeout(() => {
    calculateGrades();
  }, 300);
}, [dispatch, scenarioInputs.globalHorizontalIntervals, errors]);
const calculateGrades = useCallback(async () => {
  try {
    console.log('🧮 CALCULATE GRADES - COMPLETE FIX');
    
    // Check if we have minimum required inputs
    if (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
      console.log('❌ Base value required for calculation');
      return;
    }

    // Check if we have any meaningful inputs
    const hasVerticalInputs = Object.values(scenarioInputs.grades || {}).some(grade => 
      grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined
    );
    
    const hasHorizontalInputs = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
      interval !== '' && interval !== null && interval !== undefined && interval !== 0
    );

    console.log('🔍 INPUT CHECK:');
    console.log('  hasVerticalInputs:', hasVerticalInputs);
    console.log('  hasHorizontalInputs:', hasHorizontalInputs);
    console.log('  globalHorizontalIntervals:', scenarioInputs.globalHorizontalIntervals);

    if (!hasVerticalInputs && !hasHorizontalInputs) {
      console.log('❌ No vertical or horizontal inputs provided');
      return;
    }

    setIsCalculating(true);

    // COMPLETELY FIXED: Apply global intervals to each position for backend
    const formattedGrades = {};
    if (scenarioInputs.gradeOrder && scenarioInputs.globalHorizontalIntervals) {
      scenarioInputs.gradeOrder.forEach(gradeName => {
        const gradeInput = scenarioInputs.grades[gradeName] || {};
        
        // Apply global horizontal intervals to each position
        formattedGrades[gradeName] = {
          vertical: gradeInput.vertical === '' || gradeInput.vertical === null ? null : gradeInput.vertical,
          horizontal_intervals: { ...scenarioInputs.globalHorizontalIntervals }
        };
      });
    }

    const calculationData = {
      baseValue1: parseFloat(scenarioInputs.baseValue1),
      gradeOrder: scenarioInputs.gradeOrder,
      grades: formattedGrades
    };

    console.log('📤 SENDING CALCULATION DATA:');
    console.log('  baseValue1:', calculationData.baseValue1);
    console.log('  grades with global intervals:', calculationData.grades);

    const response = await dispatch(calculateDynamicScenario(calculationData));
    
    if (response.type.endsWith('/fulfilled')) {
      console.log('✅ Calculation successful');
    } else {
      console.error('❌ Calculation failed:', response.payload);
    }
  } catch (error) {
    console.error('❌ Error calculating grades:', error);
  } finally {
    setIsCalculating(false);
  }
}, [dispatch, scenarioInputs]);


  // ENHANCED: Validation for save draft button
  const canSaveDraft = useMemo(() => {
    // Must have base value
    if (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
      return false;
    }

    // Must have calculated outputs
    const hasCalculatedOutputs = Object.values(calculatedOutputs || {}).some(grade => 
      grade.LD || grade.LQ || grade.M || grade.UQ || grade.UD
    );

    if (!hasCalculatedOutputs) {
      return false;
    }

    // Must have some meaningful inputs
    const hasVerticalInputs = Object.values(scenarioInputs.grades || {}).some(grade => 
      grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined
    );
    
    const hasHorizontalInputs = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
      interval !== '' && interval !== null && interval !== undefined
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

const handleSaveDraft = useCallback(async () => {
  try {
    console.log('💾 STARTING SAVE DRAFT - COMPLETE FIX');
    
    // Enhanced validation
    const hasBaseValue = !!(scenarioInputs.baseValue1 && parseFloat(scenarioInputs.baseValue1) > 0);
    const hasCalculatedOutputs = Object.values(calculatedOutputs || {}).some(grade => 
      grade.LD || grade.LQ || grade.M || grade.UQ || grade.UD
    );
    const hasVerticalInputs = Object.values(scenarioInputs.grades || {}).some(grade => 
      grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined
    );
    const hasHorizontalInputs = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
      interval !== '' && interval !== null && interval !== undefined && interval !== 0
    );
    const hasErrors = Object.keys(errors).some(key => errors[key] !== null);

    console.log('🔍 VALIDATION CHECK:');
    console.log('  hasBaseValue:', hasBaseValue);
    console.log('  hasCalculatedOutputs:', hasCalculatedOutputs);
    console.log('  hasVerticalInputs:', hasVerticalInputs);
    console.log('  hasHorizontalInputs:', hasHorizontalInputs);
    console.log('  hasErrors:', hasErrors);
    console.log('  globalHorizontalIntervals:', scenarioInputs.globalHorizontalIntervals);

    const canSave = hasBaseValue && hasCalculatedOutputs && (hasVerticalInputs || hasHorizontalInputs) && !hasErrors;

    if (!canSave) {
      console.error('❌ Cannot save draft - validation failed');
      return;
    }

    // COMPLETELY FIXED: Proper data formatting for backend
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

    console.log('📤 SENDING DRAFT DATA:');
    console.log('  Base Value:', draftData.baseValue1);
    console.log('  Global Intervals:', draftData.globalHorizontalIntervals);
    console.log('  Grade Order:', draftData.gradeOrder);
    console.log('  Grades:', draftData.grades);

    const response = await dispatch(saveDraftScenario(draftData));
    
    if (response.type.endsWith('/fulfilled')) {
      console.log('✅ Draft saved successfully');
      // Refresh draft scenarios
      dispatch(fetchScenarios({ gradingSystemId: 1, status: 'DRAFT' }));
    } else {
      console.error('❌ Failed to save draft:', response.payload);
    }
  } catch (error) {
    console.error('❌ Error saving draft:', error);
  }
}, [dispatch, scenarioInputs, calculatedOutputs, errors]);

  // Save as current
  const handleSaveAsCurrent = useCallback(async (scenarioId) => {
    try {
      const response = await dispatch(applyScenario(scenarioId));
      if (response.type.endsWith('/fulfilled')) {
        // Refresh all data
        await Promise.all([
          dispatch(fetchCurrentStructure(1)),
          dispatch(fetchScenarios({ gradingSystemId: 1, status: 'DRAFT' })),
          dispatch(fetchScenarios({ gradingSystemId: 1, status: 'ARCHIVED' }))
        ]);
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
        // Refresh scenarios
        await Promise.all([
          dispatch(fetchScenarios({ gradingSystemId: 1, status: 'DRAFT' })),
          dispatch(fetchScenarios({ gradingSystemId: 1, status: 'ARCHIVED' }))
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

  // Comparison mode
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

  // ENHANCED: New scenario display data with global intervals
  const newScenarioDisplayData = useMemo(() => {
    if (!scenarioInputs.gradeOrder || scenarioInputs.gradeOrder.length === 0) {
      return null;
    }
    
    const combinedGrades = {};
    scenarioInputs.gradeOrder.forEach((gradeName) => {
      const inputGrade = scenarioInputs.grades[gradeName] || { vertical: '', horizontal: '' };
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

 const inputSummary = useMemo(() => {
  if (!scenarioInputs.gradeOrder || scenarioInputs.gradeOrder.length === 0) {
    return null;
  }

  const totalPositions = scenarioInputs.gradeOrder.length;
  const verticalInputs = scenarioInputs.gradeOrder.filter((gradeName, index) => {
    // Base position (last) doesn't need vertical input
    return index < (totalPositions - 1);
  }).length;

  // FIXED: Check if we have meaningful global horizontal intervals
  const hasGlobalIntervals = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
    interval !== '' && interval !== null && interval !== undefined && interval !== 0
  );

  const horizontalIntervals = ['LD→LQ', 'LQ→M', 'M→UQ', 'UQ→UD'];
  const basePosition = scenarioInputs.gradeOrder[totalPositions - 1];

  return {
    totalPositions,
    verticalInputs,
    horizontalInputs: hasGlobalIntervals ? 4 : 0, // 4 intervals if we have data, 0 if not
    horizontalIntervals,
    basePosition,
    verticalTransitions: verticalInputs,
    hasGlobalIntervals
  };
}, [scenarioInputs.gradeOrder, scenarioInputs.globalHorizontalIntervals]);
  // ENHANCED: Validation summary for debugging
  const validationSummary = useMemo(() => {
    const summary = {
      hasBaseValue: !!(scenarioInputs.baseValue1 && parseFloat(scenarioInputs.baseValue1) > 0),
      hasVerticalInputs: Object.values(scenarioInputs.grades || {}).some(grade => 
        grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined
      ),
      hasHorizontalInputs: Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
        interval !== '' && interval !== null && interval !== undefined
      ),
      hasCalculatedOutputs: Object.values(calculatedOutputs || {}).some(grade => 
        grade.LD || grade.LQ || grade.M || grade.UQ || grade.UD
      ),
      hasErrors: Object.keys(errors).some(key => errors[key] !== null),
      canSave: canSaveDraft
    };

    console.log('🔍 Validation Summary:', summary);
    return summary;
  }, [scenarioInputs, calculatedOutputs, errors, canSaveDraft]);

  // AUTO-CALCULATION: Trigger calculation when inputs change
  useEffect(() => {
    const currentInputsString = JSON.stringify({
      baseValue1: scenarioInputs.baseValue1,
      grades: scenarioInputs.grades,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals
    });

    // Only calculate if inputs changed and we have base value
    if (currentInputsString !== lastCalculationInputs && 
        scenarioInputs.baseValue1 && 
        parseFloat(scenarioInputs.baseValue1) > 0) {
      
      const timer = setTimeout(() => {
        calculateGrades();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timer);
    }
  }, [scenarioInputs, lastCalculationInputs, calculateGrades]);

  // ENHANCED: Clear calculated outputs when base value is cleared
  useEffect(() => {
    if (!scenarioInputs.baseValue1 || parseFloat(scenarioInputs.baseValue1) <= 0) {
      // Clear calculated outputs if base value is invalid
      const emptyOutputs = {};
      if (scenarioInputs.gradeOrder) {
        scenarioInputs.gradeOrder.forEach((gradeName) => {
          emptyOutputs[gradeName] = { 
            LD: "", LQ: "", M: "", UQ: "", UD: "" 
          };
        });
        dispatch(setCalculatedOutputs(emptyOutputs));
      }
    }
  }, [scenarioInputs.baseValue1, scenarioInputs.gradeOrder, dispatch]);

  // ENHANCED: Reset form function
  const resetForm = useCallback(() => {
    if (currentData && currentData.gradeOrder) {
      const initialGrades = {};
      currentData.gradeOrder.forEach((gradeName, index) => {
        const isBasePosition = index === (currentData.gradeOrder.length - 1);
        initialGrades[gradeName] = { 
          vertical: isBasePosition ? null : ''
        };
      });
      
      const initialInputs = {
        baseValue1: '',
        gradeOrder: currentData.gradeOrder,
        grades: initialGrades,
        globalHorizontalIntervals: {
          LD_to_LQ: '',
          LQ_to_M: '',
          M_to_UQ: '',
          UQ_to_UD: ''
        }
      };
      
      dispatch(setScenarioInputs(initialInputs));
      
      // Clear calculated outputs
      const initialOutputs = {};
      currentData.gradeOrder.forEach((gradeName) => {
        initialOutputs[gradeName] = { 
          LD: "", LQ: "", M: "", UQ: "", UD: "" 
        };
      });
      dispatch(setCalculatedOutputs(initialOutputs));
      
      // Clear errors
      dispatch(clearErrors());
    }
  }, [currentData, dispatch]);

  // ENHANCED: Load specific scenario for editing
  const loadScenarioForEditing = useCallback((scenario) => {
    if (!scenario.data) return;

    const scenarioData = scenario.data;
    
    // Load scenario inputs
    const loadedInputs = {
      baseValue1: scenarioData.baseValue1 || '',
      gradeOrder: scenarioData.gradeOrder || [],
      grades: {},
      globalHorizontalIntervals: scenarioData.globalHorizontalIntervals || {
        LD_to_LQ: '',
        LQ_to_M: '',
        M_to_UQ: '',
        UQ_to_UD: ''
      }
    };
    
    // Load grade inputs (vertical rates)
    if (scenarioData.gradeOrder) {
      scenarioData.gradeOrder.forEach((gradeName, index) => {
        const isBasePosition = index === (scenarioData.gradeOrder.length - 1);
        const gradeData = scenarioData.grades?.[gradeName];
        
        loadedInputs.grades[gradeName] = {
          vertical: isBasePosition ? null : (gradeData?.vertical || '')
        };
      });
    }
    
    dispatch(setScenarioInputs(loadedInputs));
    
    // Load calculated outputs if available
    if (scenarioData.grades) {
      const loadedOutputs = {};
      Object.keys(scenarioData.grades).forEach(gradeName => {
        const gradeData = scenarioData.grades[gradeName];
        loadedOutputs[gradeName] = {
          LD: gradeData.LD || "",
          LQ: gradeData.LQ || "",
          M: gradeData.M || "",
          UQ: gradeData.UQ || "",
          UD: gradeData.UD || ""
        };
      });
      dispatch(setCalculatedOutputs(loadedOutputs));
    }
    
    console.log('📋 Loaded scenario for editing:', scenario.name);
  }, [dispatch]);

  // ENHANCED: Check if current inputs match a scenario
  const getCurrentScenarioMatch = useMemo(() => {
    if (!scenarioInputs.baseValue1 || !canSaveDraft) return null;
    
    const currentInputString = JSON.stringify({
      baseValue1: parseFloat(scenarioInputs.baseValue1),
      grades: scenarioInputs.grades,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals
    });
    
    // Check if current inputs match any existing scenario
    for (const scenario of [...draftScenarios, ...archivedScenarios]) {
      if (scenario.data) {
        const scenarioInputString = JSON.stringify({
          baseValue1: scenario.data.baseValue1,
          grades: scenario.data.grades ? Object.fromEntries(
            Object.entries(scenario.data.grades).map(([key, value]) => [
              key, 
              { vertical: value.vertical }
            ])
          ) : {},
          globalHorizontalIntervals: scenario.data.globalHorizontalIntervals
        });
        
        if (currentInputString === scenarioInputString) {
          return scenario;
        }
      }
    }
    
    return null;
  }, [scenarioInputs, draftScenarios, archivedScenarios, canSaveDraft]);

  // ENHANCED: Get scenario statistics
  const scenarioStatistics = useMemo(() => {
    const totalScenarios = draftScenarios.length + archivedScenarios.length;
    const calculatedScenarios = [...draftScenarios, ...archivedScenarios].filter(s => s.isCalculated).length;
    
    // Calculate average metrics from draft scenarios
    const avgVertical = draftScenarios.length > 0 
      ? draftScenarios.reduce((sum, s) => sum + (s.data?.verticalAvg || 0), 0) / draftScenarios.length 
      : 0;
      
    const avgHorizontal = draftScenarios.length > 0 
      ? draftScenarios.reduce((sum, s) => sum + (s.data?.horizontalAvg || 0), 0) / draftScenarios.length 
      : 0;
    
    return {
      totalScenarios,
      draftCount: draftScenarios.length,
      archivedCount: archivedScenarios.length,
      calculatedScenarios,
      calculationRate: totalScenarios > 0 ? (calculatedScenarios / totalScenarios) * 100 : 0,
      avgVertical: avgVertical * 100,
      avgHorizontal: avgHorizontal * 100,
      hasBestDraft: !!bestDraft
    };
  }, [draftScenarios, archivedScenarios, bestDraft]);

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
    scenarioStatistics, // NEW: Scenario statistics
    
    // UI State
    isDetailOpen,
    setIsDetailOpen,
    compareMode,
    selectedForComparison,
    loading: loading.currentStructure || loading.calculating || isCalculating,
    errors,
    canSaveDraft,
    getCurrentScenarioMatch, // NEW: Check if inputs match existing scenario
    
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
    calculateGrades,
    resetForm, // NEW: Reset form function
    loadScenarioForEditing // NEW: Load scenario for editing
  };
};

export default useGrading;