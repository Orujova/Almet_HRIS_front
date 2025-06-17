// src/services/gradingApi.js - ENHANCED: Complete API with proper data formatting and null handling
import api from './api';

export const gradingApi = {
  // Current Structure - ENHANCED
  getCurrentStructure: () => {
    console.log('📊 Fetching current structure...');
    return api.get('/grading/systems/current_structure/');
  },

  // Current Scenario - NEW
  getCurrentScenario: () => {
    console.log('🎯 Fetching current scenario...');
    return api.get('/grading/scenarios/current_scenario/');
  },

  // Position Groups - ENHANCED
  getPositionGroups: () => {
    console.log('👥 Fetching position groups...');
    return api.get('/grading/systems/position_groups/');
  },

  // Dynamic Calculation - ENHANCED with better data handling
  calculateDynamic: (scenarioData) => {
    console.log('🧮 Calculate dynamic request:', scenarioData);
    
    // Enhanced payload cleaning
    const payload = {
      baseValue1: parseFloat(scenarioData.baseValue1) || 0,
      gradeOrder: scenarioData.gradeOrder || [],
      grades: {}
    };
    
    // Clean up grade data with enhanced null handling
    if (scenarioData.grades && typeof scenarioData.grades === 'object') {
      Object.keys(scenarioData.grades).forEach(gradeName => {
        const grade = scenarioData.grades[gradeName];
        if (grade && typeof grade === 'object') {
          const cleanGrade = {
            vertical: null,
            horizontal_intervals: {}
          };
          
          // Handle vertical value
          if (grade.vertical !== undefined && grade.vertical !== null && grade.vertical !== '') {
            try {
              const verticalNum = parseFloat(grade.vertical);
              if (!isNaN(verticalNum)) {
                cleanGrade.vertical = verticalNum;
              }
            } catch (e) {
              console.warn(`Invalid vertical value for ${gradeName}:`, grade.vertical);
            }
          }
          
          // Handle horizontal intervals
          if (grade.horizontal_intervals && typeof grade.horizontal_intervals === 'object') {
            ['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].forEach(intervalKey => {
              const intervalValue = grade.horizontal_intervals[intervalKey];
              if (intervalValue !== undefined && intervalValue !== null && intervalValue !== '') {
                try {
                  const intervalNum = parseFloat(intervalValue);
                  if (!isNaN(intervalNum)) {
                    cleanGrade.horizontal_intervals[intervalKey] = intervalNum;
                  } else {
                    cleanGrade.horizontal_intervals[intervalKey] = 0;
                  }
                } catch (e) {
                  cleanGrade.horizontal_intervals[intervalKey] = 0;
                }
              } else {
                cleanGrade.horizontal_intervals[intervalKey] = 0;
              }
            });
          }
          
          payload.grades[gradeName] = cleanGrade;
        }
      });
    }
    
    console.log('📤 Cleaned payload for calculation:', payload);
    return api.post('/grading/scenarios/calculate_dynamic/', payload);
  },

  // Save Draft - ENHANCED with better data structure
  saveDraft: (scenarioData) => {
    console.log('💾 Save draft request:', scenarioData);
    
    const payload = {
      name: scenarioData.name || `Scenario ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      description: scenarioData.description || 'Auto-generated scenario with global horizontal intervals',
      baseValue1: parseFloat(scenarioData.baseValue1) || 0,
      gradeOrder: scenarioData.gradeOrder || [],
      grades: {},
      globalHorizontalIntervals: scenarioData.globalHorizontalIntervals || {
        LD_to_LQ: 0,
        LQ_to_M: 0,
        M_to_UQ: 0,
        UQ_to_UD: 0
      },
      calculatedOutputs: scenarioData.calculatedOutputs || {}
    };
    
    // Enhanced grade processing
    if (scenarioData.grades && typeof scenarioData.grades === 'object') {
      Object.keys(scenarioData.grades).forEach(gradeName => {
        const grade = scenarioData.grades[gradeName];
        if (grade && typeof grade === 'object') {
          payload.grades[gradeName] = {
            vertical: grade.vertical !== undefined && grade.vertical !== null && grade.vertical !== '' 
              ? parseFloat(grade.vertical) || null 
              : null
          };
        }
      });
    }
    
    console.log('📤 Cleaned payload for save:', payload);
    return api.post('/grading/scenarios/save_draft/', payload);
  },

  // Get Scenarios - ENHANCED with proper filtering
  getScenarios: (params = {}) => {
    console.log('📋 Fetching scenarios with params:', params);
    
    const searchParams = new URLSearchParams();
    
    // Only add valid filters
    if (params.status && typeof params.status === 'string') {
      searchParams.append('status', params.status.toUpperCase());
    }
    
    if (params.search && typeof params.search === 'string') {
      searchParams.append('search', params.search);
    }
    
    if (params.ordering && typeof params.ordering === 'string') {
      searchParams.append('ordering', params.ordering);
    }
    
    const url = `/grading/scenarios/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    console.log('📤 Request URL:', url);
    
    return api.get(url);
  },

  // Get Scenario Details - NEW
  getScenario: (scenarioId) => {
    console.log('🔍 Fetching scenario details for:', scenarioId);
    return api.get(`/grading/scenarios/${scenarioId}/`);
  },

  // Apply Scenario - ENHANCED
  applyScenario: (scenarioId) => {
    console.log('🎯 Applying scenario:', scenarioId);
    return api.post(`/grading/scenarios/${scenarioId}/apply_as_current/`, {});
  },

  // Archive Scenario - ENHANCED
  archiveScenario: (scenarioId) => {
    console.log('📦 Archiving scenario:', scenarioId);
    return api.post(`/grading/scenarios/${scenarioId}/archive/`, {});
  },

  // ENHANCED: Current structure formatter with null handling
  formatCurrentStructure: (backendData) => {
    console.log('🔄 Formatting current structure:', backendData);
    
    if (!backendData) {
      return {
        id: 'current',
        name: 'Current Structure',
        grades: {},
        gradeOrder: [],
        verticalAvg: 0,
        horizontalAvg: 0,
        baseValue1: 0,
        status: 'current'
      };
    }

    // Enhanced data extraction with null safety
    const grades = {};
    const gradeOrder = Array.isArray(backendData.gradeOrder) ? backendData.gradeOrder : [];
    
    if (backendData.grades && typeof backendData.grades === 'object') {
      gradeOrder.forEach(gradeName => {
        const gradeData = backendData.grades[gradeName];
        if (gradeData && typeof gradeData === 'object') {
          grades[gradeName] = {
            LD: parseFloat(gradeData.LD || 0) || 0,
            LQ: parseFloat(gradeData.LQ || 0) || 0,
            M: parseFloat(gradeData.M || 0) || 0,
            UQ: parseFloat(gradeData.UQ || 0) || 0,
            UD: parseFloat(gradeData.UD || 0) || 0,
            vertical: parseFloat(gradeData.vertical || 0) || 0,
            horizontal_intervals: gradeData.horizontal_intervals || {
              LD_to_LQ: 0,
              LQ_to_M: 0,
              M_to_UQ: 0,
              UQ_to_UD: 0
            }
          };
        } else {
          grades[gradeName] = {
            LD: 0, LQ: 0, M: 0, UQ: 0, UD: 0,
            vertical: 0,
            horizontal_intervals: {
              LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0
            }
          };
        }
      });
    }

    const result = {
      id: 'current',
      name: 'Current Structure',
      grades: grades,
      gradeOrder: gradeOrder,
      verticalAvg: parseFloat(backendData.verticalAvg || 0) || 0,
      horizontalAvg: parseFloat(backendData.horizontalAvg || 0) || 0,
      baseValue1: parseFloat(backendData.baseValue1 || 0) || 0,
      status: 'current'
    };

    console.log('✅ Formatted current structure:', result);
    return result;
  },

  // ENHANCED: Scenario formatter with comprehensive data handling
  formatScenarioForFrontend: (backendScenario) => {
    console.log('🔄 Formatting scenario:', backendScenario?.name);
    
    if (!backendScenario) {
      console.warn('⚠️ No scenario data to format');
      return null;
    }

    // Enhanced data extraction with multiple fallbacks
    const data = backendScenario.data || {};
    const calculatedGrades = backendScenario.calculated_grades || data.grades || {};
    const inputRates = backendScenario.input_rates || {};
    const gradeOrder = backendScenario.grade_order || data.gradeOrder || [];
    
    console.log('📊 Scenario data extraction:', {
      hasData: !!backendScenario.data,
      hasCalculatedGrades: !!backendScenario.calculated_grades,
      hasInputRates: !!backendScenario.input_rates,
      gradeOrderLength: gradeOrder.length
    });
    
    // Extract global horizontal intervals with enhanced fallback logic
    let globalHorizontalIntervals = {
      LD_to_LQ: 0,
      LQ_to_M: 0,
      M_to_UQ: 0,
      UQ_to_UD: 0
    };
    
    // Try to get from data.globalHorizontalIntervals first
    if (data.globalHorizontalIntervals && typeof data.globalHorizontalIntervals === 'object') {
      globalHorizontalIntervals = { ...data.globalHorizontalIntervals };
    } else if (inputRates && typeof inputRates === 'object') {
      // Fallback: get from first position's horizontal intervals
      for (const gradeName of gradeOrder) {
        const gradeInputData = inputRates[gradeName];
        if (gradeInputData && gradeInputData.horizontal_intervals && typeof gradeInputData.horizontal_intervals === 'object') {
          globalHorizontalIntervals = { ...gradeInputData.horizontal_intervals };
          break;
        }
      }
    }
    
    // Ensure all intervals are numbers
    Object.keys(globalHorizontalIntervals).forEach(key => {
      const value = globalHorizontalIntervals[key];
      globalHorizontalIntervals[key] = (value !== null && value !== undefined && value !== '') 
        ? parseFloat(value) || 0 
        : 0;
    });
    
    console.log('🌐 Global intervals extracted:', globalHorizontalIntervals);
    
    // Format grades with enhanced data safety
    const formattedGrades = {};
    gradeOrder.forEach(gradeName => {
      const calculatedData = calculatedGrades[gradeName] || {};
      const inputData = inputRates[gradeName] || {};
      
      // Enhanced value extraction with multiple fallbacks
      const extractValue = (obj, key, defaultValue = 0) => {
        const value = obj[key];
        if (value === null || value === undefined || value === '') {
          return defaultValue;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
      };
      
      formattedGrades[gradeName] = {
        LD: extractValue(calculatedData, 'LD'),
        LQ: extractValue(calculatedData, 'LQ'),
        M: extractValue(calculatedData, 'M'),
        UQ: extractValue(calculatedData, 'UQ'),
        UD: extractValue(calculatedData, 'UD'),
        vertical: inputData.vertical !== undefined ? inputData.vertical : null,
        verticalInput: inputData.vertical, // For detail display
        horizontal_intervals: globalHorizontalIntervals // Apply global intervals
      };
    });

    console.log('📊 Formatted grades:', Object.keys(formattedGrades).length, 'positions');

    // Enhanced averages extraction with multiple sources
    let verticalAvg = 0;
    let horizontalAvg = 0;
    
    // Try multiple sources for averages
    if (backendScenario.vertical_avg !== undefined && backendScenario.vertical_avg !== null) {
      verticalAvg = parseFloat(backendScenario.vertical_avg) || 0;
    } else if (data.verticalAvg !== undefined && data.verticalAvg !== null) {
      verticalAvg = parseFloat(data.verticalAvg) || 0;
    }
    
    if (backendScenario.horizontal_avg !== undefined && backendScenario.horizontal_avg !== null) {
      horizontalAvg = parseFloat(backendScenario.horizontal_avg) || 0;
    } else if (data.horizontalAvg !== undefined && data.horizontalAvg !== null) {
      horizontalAvg = parseFloat(data.horizontalAvg) || 0;
    }
    
    console.log('📈 Averages extracted:', { verticalAvg, horizontalAvg });
    
    // Enhanced base value extraction
    let baseValue = 0;
    if (backendScenario.base_value !== undefined && backendScenario.base_value !== null) {
      baseValue = parseFloat(backendScenario.base_value) || 0;
    } else if (data.baseValue1 !== undefined && data.baseValue1 !== null) {
      baseValue = parseFloat(data.baseValue1) || 0;
    }
    
    // Enhanced metrics extraction
    const metrics = {
      totalBudgetImpact: 0,
      avgSalaryIncrease: 0,
      maxSalaryIncrease: 0,
      positionsAffected: 0
    };
    
    if (backendScenario.metrics && typeof backendScenario.metrics === 'object') {
      metrics.totalBudgetImpact = parseFloat(backendScenario.metrics.totalBudgetImpact || 0) || 0;
      metrics.avgSalaryIncrease = parseFloat(backendScenario.metrics.avgSalaryIncrease || 0) || 0;
      metrics.maxSalaryIncrease = parseFloat(backendScenario.metrics.maxSalaryIncrease || 0) || 0;
      metrics.positionsAffected = parseInt(backendScenario.metrics.positionsAffected || 0) || 0;
    }
    
    // Build final formatted scenario
    const formattedScenario = {
      id: backendScenario.id,
      name: backendScenario.name || 'Unnamed Scenario',
      description: backendScenario.description || '',
      status: (backendScenario.status || 'draft').toLowerCase(),
      createdAt: backendScenario.created_at || new Date().toISOString(),
      calculationTimestamp: backendScenario.calculation_timestamp,
      appliedAt: backendScenario.applied_at,
      
      // Store original backend data for API calls
      vertical_avg: verticalAvg,
      horizontal_avg: horizontalAvg,
      input_rates: inputRates,
      
      // Frontend-formatted data
      data: {
        baseValue1: baseValue,
        gradeOrder: gradeOrder,
        grades: formattedGrades,
        globalHorizontalIntervals: globalHorizontalIntervals,
        verticalAvg: verticalAvg,
        horizontalAvg: horizontalAvg,
        positionVerticalInputs: data.positionVerticalInputs || {},
        hasCalculation: !!(backendScenario.calculated_grades && Object.keys(backendScenario.calculated_grades).length > 0),
        isComplete: gradeOrder.length > 0 && Object.keys(formattedGrades).length > 0
      },
      
      metrics: metrics,
      
      isCalculated: !!(backendScenario.calculated_grades && Object.keys(backendScenario.calculated_grades).length > 0),
      createdBy: backendScenario.created_by_name || backendScenario.created_by || 'Unknown',
      appliedBy: backendScenario.applied_by_name || backendScenario.applied_by
    };
    
    console.log(`✅ Formatted scenario ${formattedScenario.name}:`, {
      id: formattedScenario.id,
      status: formattedScenario.status,
      verticalAvg: formattedScenario.data.verticalAvg,
      horizontalAvg: formattedScenario.data.horizontalAvg,
      baseValue: formattedScenario.data.baseValue1,
      gradesCount: Object.keys(formattedScenario.data.grades).length,
      hasGlobalIntervals: Object.values(formattedScenario.data.globalHorizontalIntervals).some(v => v > 0),
      isCalculated: formattedScenario.isCalculated
    });
    
    return formattedScenario;
  },

  // ENHANCED: Validation with comprehensive checks
  validateScenarioData: (scenarioData) => {
    const errors = {};
    
    console.log('🔍 Validating scenario data:', scenarioData);
    
    // Base value validation
    if (!scenarioData.baseValue1 || scenarioData.baseValue1 <= 0) {
      errors.baseValue1 = 'Base value must be greater than 0';
    }
    
    // Grade order validation
    if (!scenarioData.gradeOrder || !Array.isArray(scenarioData.gradeOrder) || scenarioData.gradeOrder.length === 0) {
      errors.gradeOrder = 'Grade order is required';
    }
    
    // Grades validation
    if (!scenarioData.grades || typeof scenarioData.grades !== 'object') {
      errors.grades = 'Grade inputs are required';
    } else if (scenarioData.gradeOrder) {
      // Validate individual grade inputs
      scenarioData.gradeOrder.forEach((gradeName, index) => {
        const grade = scenarioData.grades[gradeName];
        const isBasePosition = index === (scenarioData.gradeOrder.length - 1);
        
        if (grade && !isBasePosition) {
          // Validate vertical input for non-base positions
          if (grade.vertical !== null && grade.vertical !== undefined && grade.vertical !== '') {
            const verticalNum = parseFloat(grade.vertical);
            if (isNaN(verticalNum) || verticalNum < 0 || verticalNum > 100) {
              errors[`vertical-${gradeName}`] = `Vertical rate for ${gradeName} must be between 0-100`;
            }
          }
        }
      });
    }
    
    // Global horizontal intervals validation
    if (scenarioData.globalHorizontalIntervals && typeof scenarioData.globalHorizontalIntervals === 'object') {
      const intervalNames = ['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'];
      intervalNames.forEach(intervalName => {
        const intervalValue = scenarioData.globalHorizontalIntervals[intervalName];
        if (intervalValue !== null && intervalValue !== undefined && intervalValue !== '') {
          const intervalNum = parseFloat(intervalValue);
          if (isNaN(intervalNum) || intervalNum < 0 || intervalNum > 100) {
            errors[`global-horizontal-${intervalName}`] = `${intervalName} rate must be between 0-100`;
          }
        }
      });
    }
    
    console.log('🔍 Validation results:', { 
      errorsCount: Object.keys(errors).length, 
      errors: Object.keys(errors) 
    });
    
    return errors;
  },

  // ENHANCED: Data cleaning utilities
  cleanScenarioData: (scenarioData) => {
    console.log('🧹 Cleaning scenario data...');
    
    const cleaned = {
      baseValue1: parseFloat(scenarioData.baseValue1) || 0,
      gradeOrder: Array.isArray(scenarioData.gradeOrder) ? [...scenarioData.gradeOrder] : [],
      grades: {},
      globalHorizontalIntervals: {
        LD_to_LQ: 0,
        LQ_to_M: 0,
        M_to_UQ: 0,
        UQ_to_UD: 0
      },
      calculatedOutputs: scenarioData.calculatedOutputs || {}
    };
    
    // Clean grades
    if (scenarioData.grades && typeof scenarioData.grades === 'object') {
      Object.keys(scenarioData.grades).forEach(gradeName => {
        const grade = scenarioData.grades[gradeName];
        if (grade && typeof grade === 'object') {
          cleaned.grades[gradeName] = {
            vertical: (grade.vertical !== null && grade.vertical !== undefined && grade.vertical !== '') 
              ? parseFloat(grade.vertical) || null 
              : null
          };
        }
      });
    }
    
    // Clean global intervals
    if (scenarioData.globalHorizontalIntervals && typeof scenarioData.globalHorizontalIntervals === 'object') {
      Object.keys(cleaned.globalHorizontalIntervals).forEach(key => {
        const value = scenarioData.globalHorizontalIntervals[key];
        cleaned.globalHorizontalIntervals[key] = (value !== null && value !== undefined && value !== '') 
          ? parseFloat(value) || 0 
          : 0;
      });
    }
    
    console.log('✅ Data cleaned:', {
      baseValue: cleaned.baseValue1,
      gradesCount: Object.keys(cleaned.grades).length,
      intervalsSet: Object.values(cleaned.globalHorizontalIntervals).some(v => v > 0)
    });
    
    return cleaned;
  }
};

export default gradingApi;