// src/hooks/useGrading.js - GLOBAL 4 HORIZONTAL INTERVALS
import { useState, useEffect, useCallback, useMemo } from 'react';
import { gradingApi } from '../services/gradingApi';

const useGrading = () => {
  // State that matches frontend structure
  const [currentData, setCurrentData] = useState(null);
  const [scenarioInputs, setScenarioInputs] = useState({
    baseValue1: '',
    gradeOrder: [],
    grades: {}, // Only vertical inputs per position
    // NEW: Global horizontal intervals (apply to all positions)
    globalHorizontalIntervals: {
      LD_to_LQ: '',
      LQ_to_M: '',
      M_to_UQ: '',
      UQ_to_UD: ''
    }
  });
  const [calculatedOutputs, setCalculatedOutputs] = useState({});
  const [draftScenarios, setDraftScenarios] = useState([]);
  const [archivedScenarios, setArchivedScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load current structure from database
  const loadCurrentStructure = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading current structure from database...');
      
      const response = await gradingApi.getCurrentStructure();
      const formattedData = gradingApi.formatCurrentStructure(response.data);
      setCurrentData(formattedData);
      
      // Initialize scenario inputs with GLOBAL HORIZONTAL LOGIC
      if (formattedData.gradeOrder && formattedData.gradeOrder.length > 0) {
        const positions = formattedData.gradeOrder;
        const positionCount = positions.length;
        
        console.log(`🎯 Database loaded ${positionCount} positions:`, positions);
        
        const initialGrades = {};
        
        // UPDATED: Only vertical inputs per position
        positions.forEach((gradeName, index) => {
          const isBasePosition = index === (positionCount - 1); // Last position
          
          initialGrades[gradeName] = {
            // Vertical: All positions except base get vertical input
            vertical: isBasePosition ? null : ''
            // NO horizontal_intervals here - they are now global
          };
          
          console.log(`📊 ${gradeName} (position ${index + 1}/${positionCount}):`, {
            vertical: isBasePosition ? '❌ No input (base)' : '✅ Input available (transition)',
            horizontal: '🌐 Uses GLOBAL intervals'
          });
        });
        
        const verticalInputCount = positionCount - 1; // Transitions
        const horizontalInputCount = 4; // Global 4 intervals
        
        console.log(`📈 GLOBAL HORIZONTAL Input Summary:`);
        console.log(`   • Total positions: ${positionCount}`);
        console.log(`   • Vertical inputs needed: ${verticalInputCount} (per position transitions)`);
        console.log(`   • Horizontal inputs needed: ${horizontalInputCount} (GLOBAL for all positions)`);
        console.log(`   • Global horizontal intervals: LD→LQ, LQ→M, M→UQ, UQ→UD`);
        console.log(`   • Logic: Set once globally, applies to all positions`);
        console.log(`   • Base position: ${positions[positionCount - 1]} (no vertical)`);
        
        setScenarioInputs({
          baseValue1: '',
          gradeOrder: positions,
          grades: initialGrades,
          // NEW: Global horizontal intervals
          globalHorizontalIntervals: {
            LD_to_LQ: '',
            LQ_to_M: '',
            M_to_UQ: '',
            UQ_to_UD: ''
          }
        });
        
        // Initialize calculated outputs
        const initialOutputs = {};
        positions.forEach((gradeName) => {
          initialOutputs[gradeName] = { 
            LD: "", LQ: "", M: "", UQ: "", UD: "" 
          };
        });
        setCalculatedOutputs(initialOutputs);
      }
    } catch (error) {
      console.error('❌ Error loading current structure:', error);
      setErrors({ load: 'Failed to load current structure from database' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load draft scenarios from database
  const loadDraftScenarios = useCallback(async () => {
    try {
      const response = await gradingApi.getDraftScenarios();
      const scenarios = response.data.results || response.data || [];
      const formattedScenarios = scenarios.map(scenario => 
        gradingApi.formatScenarioForFrontend(scenario)
      );
      setDraftScenarios(formattedScenarios);
    } catch (error) {
      console.error('Error loading draft scenarios:', error);
    }
  }, []);

  // Load archived scenarios from database
  const loadArchivedScenarios = useCallback(async () => {
    try {
      const response = await gradingApi.getArchivedScenarios();
      const scenarios = response.data.results || response.data || [];
      const formattedScenarios = scenarios.map(scenario => 
        gradingApi.formatScenarioForFrontend(scenario)
      );
      setArchivedScenarios(formattedScenarios);
    } catch (error) {
      console.error('Error loading archived scenarios:', error);
    }
  }, []);

  // Dynamic calculation with GLOBAL horizontal intervals
  const calculateGrades = useCallback(async (inputs) => {
    try {
      console.log('🧮 Starting calculation with GLOBAL horizontal intervals:', inputs);
      
      // Format for backend: apply global intervals to all positions
      const formattedInputs = {
        baseValue1: inputs.baseValue1,
        gradeOrder: inputs.gradeOrder,
        grades: {}
      };

      // Apply global horizontal intervals to each position
      inputs.gradeOrder.forEach(gradeName => {
        const gradeInput = inputs.grades[gradeName] || {};
        formattedInputs.grades[gradeName] = {
          vertical: gradeInput.vertical,
          horizontal_intervals: inputs.globalHorizontalIntervals // Same for all positions
        };
      });

      console.log('📤 Formatted for backend (global intervals applied to all positions):', formattedInputs);
      
      const response = await gradingApi.calculateDynamic(formattedInputs);
      if (response.data.calculatedOutputs) {
        console.log('✅ Calculation successful:', response.data.calculatedOutputs);
        setCalculatedOutputs(response.data.calculatedOutputs);
        setErrors({});
      } else if (response.data.errors) {
        console.error('❌ Calculation errors:', response.data.errors);
        setErrors({ calculation: response.data.errors });
      }
    } catch (error) {
      console.error('❌ Error in dynamic calculation:', error);
      setErrors({ calculation: ['Calculation error occurred'] });
    }
  }, []);

  // Validation logic - UPDATED FOR GLOBAL INTERVALS
  const validateInputs = useCallback((inputs) => {
    const validationErrors = gradingApi.validateScenarioData(inputs);
    setErrors(validationErrors);
    return validationErrors;
  }, []);

  // Effect for dynamic calculation with debounce
  useEffect(() => {
    if (scenarioInputs.baseValue1 > 0 && scenarioInputs.gradeOrder.length > 0) {
      const timeoutId = setTimeout(() => {
        calculateGrades(scenarioInputs);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (scenarioInputs.baseValue1 === '' || scenarioInputs.baseValue1 === 0) {
      // Clear calculated outputs when base value is empty
      const emptyOutputs = {};
      scenarioInputs.gradeOrder.forEach(gradeName => {
        emptyOutputs[gradeName] = { LD: "", LQ: "", M: "", UQ: "", UD: "" };
      });
      setCalculatedOutputs(emptyOutputs);
    }
  }, [scenarioInputs, calculateGrades]);

  // Handle input changes
  const handleBaseValueChange = useCallback((value) => {
    const numValue = parseFloat(value) || '';
    console.log(`💰 Base value changed to: ${numValue}`);
    setScenarioInputs(prev => ({ ...prev, baseValue1: numValue }));
  }, []);

  // Handle vertical input changes - only for positions that allow it
  const handleVerticalChange = useCallback((grade, value) => {
    console.log(`📊 Vertical change for ${grade}: ${value}% (transition)`);
    setScenarioInputs(prev => {
      const gradeData = prev.grades[grade];
      if (gradeData && gradeData.vertical !== null) {
        const newValue = parseFloat(value) || '';
        console.log(`✅ Vertical input accepted for ${grade}: ${newValue}%`);
        return {
          ...prev,
          grades: {
            ...prev.grades,
            [grade]: { ...gradeData, vertical: newValue },
          },
        };
      }
      console.log(`⚠️ Vertical input rejected for ${grade} (base position)`);
      return prev;
    });
  }, []);

  // NEW: Handle GLOBAL horizontal interval changes
  const handleGlobalHorizontalChange = useCallback((interval, value) => {
    const numValue = parseFloat(value) || '';
    console.log(`🌐 GLOBAL horizontal interval change for ${interval}: ${numValue}% (applies to ALL positions)`);
    
    setScenarioInputs(prev => ({
      ...prev,
      globalHorizontalIntervals: {
        ...prev.globalHorizontalIntervals,
        [interval]: numValue
      }
    }));
  }, []);

  // DEPRECATED: Old horizontal change handlers (keeping for compatibility)
  const handleHorizontalChange = useCallback((grade, value) => {
    console.log(`⚠️ Old horizontal change called for ${grade}: ${value}% (deprecated - use global)`);
  }, []);

  const handleHorizontalIntervalChange = useCallback((grade, interval, value) => {
    console.log(`⚠️ Old per-position interval change called for ${grade}.${interval}: ${value}% (deprecated - use global)`);
  }, []);

  // Save draft scenario - UPDATED FOR GLOBAL INTERVALS
  const handleSaveDraft = useCallback(async () => {
    const currentErrors = validateInputs(scenarioInputs);
    if (Object.keys(currentErrors).length === 0 && scenarioInputs.baseValue1 > 0) {
      try {
        // Format data for backend with global intervals
        const scenarioData = {
          name: `Scenario ${draftScenarios.length + 1}`,
          description: 'Auto-generated scenario with global horizontal intervals',
          baseValue1: scenarioInputs.baseValue1,
          gradeOrder: scenarioInputs.gradeOrder,
          grades: scenarioInputs.grades,
          globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals,
          calculatedOutputs
        };

        console.log('💾 Saving draft scenario with global intervals:', scenarioData);
        const response = await gradingApi.saveDraft(scenarioData);
        
        if (response.data.success) {
          await loadDraftScenarios();
          alert("Scenario saved as draft!");
        } else {
          alert(response.data.error || "Failed to save scenario");
        }
      } catch (error) {
        console.error('Error saving draft:', error);
        alert("Failed to save scenario");
      }
    } else {
      alert("Please fix the input errors before saving.");
    }
  }, [scenarioInputs, calculatedOutputs, draftScenarios.length, validateInputs, loadDraftScenarios]);

  // Apply scenario as current
  const handleSaveAsCurrent = useCallback(async (scenarioId) => {
    try {
      const response = await gradingApi.applyScenario(scenarioId);
      
      if (response.data.success) {
        await Promise.all([
          loadCurrentStructure(),
          loadDraftScenarios(),
          loadArchivedScenarios()
        ]);
        alert("Scenario has been set as current grade structure! Previous current scenario archived.");
      } else {
        alert(response.data.error || "Failed to apply scenario");
      }
    } catch (error) {
      console.error('Error applying scenario:', error);
      alert("Failed to apply scenario");
    }
  }, [loadCurrentStructure, loadDraftScenarios, loadArchivedScenarios]);

  // Archive scenario
  const handleArchiveDraft = useCallback(async (scenarioId) => {
    try {
      const response = await gradingApi.archiveScenario(scenarioId);
      
      if (response.data.success) {
        await Promise.all([
          loadDraftScenarios(),
          loadArchivedScenarios()
        ]);
      } else {
        alert(response.data.error || "Failed to archive scenario");
      }
    } catch (error) {
      console.error('Error archiving scenario:', error);
      alert("Failed to archive scenario");
    }
  }, [loadDraftScenarios, loadArchivedScenarios]);

  // View scenario details
  const handleViewDetails = useCallback((scenario) => {
    setSelectedScenario(scenario);
    setIsDetailOpen(true);
  }, []);

  // Comparison functionality
  const toggleCompareMode = useCallback(() => {
    setCompareMode(!compareMode);
    setSelectedForComparison([]);
  }, [compareMode]);

  const toggleScenarioForComparison = useCallback((scenarioId) => {
    setSelectedForComparison(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      } else if (prev.length < 4) {
        return [...prev, scenarioId];
      }
      return prev;
    });
  }, []);

  const startComparison = useCallback(() => {
    if (selectedForComparison.length >= 2) {
      setIsDetailOpen(true);
    }
  }, [selectedForComparison.length]);

  // Calculate balance score for best scenario
  const getBalanceScore = useCallback((scenario) => {
    const verticalAvg = scenario.data ? scenario.data.verticalAvg || 0 : scenario.verticalAvg || 0;
    const horizontalAvg = scenario.data ? scenario.data.horizontalAvg || 0 : scenario.horizontalAvg || 0;
    const deviation = Math.abs(verticalAvg - horizontalAvg);
    return (verticalAvg + horizontalAvg) / (1 + deviation); 
  }, []);

  // Get best draft scenario
  const bestDraft = useMemo(() => {
    if (draftScenarios.length === 0) return null;
    return draftScenarios.reduce((best, scenario) => {
      return getBalanceScore(scenario) > getBalanceScore(best) ? scenario : best;
    }, draftScenarios[0]);
  }, [draftScenarios, getBalanceScore]);

  // Get scenario for comparison
  const getScenarioForComparison = useCallback((scenarioId) => {
    if (scenarioId === 'current') {
      return currentData;
    }
    return draftScenarios.find(s => s.id === scenarioId) || 
           archivedScenarios.find(s => s.id === scenarioId);
  }, [currentData, draftScenarios, archivedScenarios]);

  // Enhanced scenario display data - UPDATED FOR GLOBAL INTERVALS
  const newScenarioDisplayData = useMemo(() => {
    if (!scenarioInputs.gradeOrder.length) return null;
    
    const combinedGrades = {};
    scenarioInputs.gradeOrder.forEach((gradeName) => {
      const inputGrade = scenarioInputs.grades[gradeName] || { vertical: '' };
      const outputGrade = calculatedOutputs[gradeName] || { LD: "", LQ: "", M: "", UQ: "", UD: "" };
      
      combinedGrades[gradeName] = {
        ...inputGrade,
        ...outputGrade,
        // Include global intervals for display
        globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals
      };
    });
    
    return {
      baseValue1: scenarioInputs.baseValue1,
      gradeOrder: scenarioInputs.gradeOrder,
      grades: combinedGrades,
      globalHorizontalIntervals: scenarioInputs.globalHorizontalIntervals
    };
  }, [scenarioInputs, calculatedOutputs]);

  // Get input summary for display - UPDATED FOR GLOBAL INTERVALS
  const inputSummary = useMemo(() => {
    if (!scenarioInputs.gradeOrder.length) return null;
    
    const positionCount = scenarioInputs.gradeOrder.length;
    
    // Count positions that have vertical input (not null)
    const verticalInputCount = scenarioInputs.gradeOrder.filter((gradeName) => {
      const gradeData = scenarioInputs.grades[gradeName];
      return gradeData && gradeData.vertical !== null;
    }).length;
    
    // FIXED: Always 4 GLOBAL horizontal intervals
    const horizontalInputCount = 4;
    
    return {
      totalPositions: positionCount,
      horizontalInputs: horizontalInputCount, // GLOBAL: Always 4 intervals
      verticalInputs: verticalInputCount, // Per position transitions
      basePosition: scenarioInputs.gradeOrder[positionCount - 1],
      topPosition: scenarioInputs.gradeOrder[0],
      horizontalIntervals: ['LD→LQ', 'LQ→M', 'M→UQ', 'UQ→UD'], // 4 global intervals
      verticalTransitions: positionCount - 1,
      isGlobalHorizontal: true // Flag to indicate global logic
    };
  }, [scenarioInputs]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await loadCurrentStructure();
      await Promise.all([
        loadDraftScenarios(),
        loadArchivedScenarios()
      ]);
    };
    
    initializeData();
  }, [loadCurrentStructure, loadDraftScenarios, loadArchivedScenarios]);

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
    
    // UI State
    isDetailOpen,
    setIsDetailOpen,
    compareMode,
    selectedForComparison,
    loading,
    errors,
    
    // Actions
    handleBaseValueChange,
    handleVerticalChange,
    handleHorizontalChange, // DEPRECATED: Keep for compatibility
    handleHorizontalIntervalChange, // DEPRECATED: Keep for compatibility
    handleGlobalHorizontalChange, // NEW: Global horizontal handler
    handleSaveDraft,
    handleSaveAsCurrent,
    handleArchiveDraft,
    handleViewDetails,
    toggleCompareMode,
    toggleScenarioForComparison,
    startComparison,
    getScenarioForComparison,
    
    // Refresh functions
    loadCurrentStructure,
    loadDraftScenarios,
    loadArchivedScenarios,
    
    // Validation
    validateInputs
  };
};

export default useGrading;