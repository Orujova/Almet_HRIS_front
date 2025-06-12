// src/services/gradingApi.js - SIMPLIFIED: Clean API calls without unnecessary complexity
import api from './api';

export const gradingApi = {
  // Current Structure
  getCurrentStructure: (gradingSystemId = null) => {
    const params = gradingSystemId ? `?grading_system_id=${gradingSystemId}` : '';
    return api.get(`/grading/systems/current_structure/${params}`);
  },

  // Dynamic Calculation - SIMPLIFIED
  calculateDynamic: (scenarioData) => {
    console.log('🧮 Calculate dynamic request:', scenarioData);
    
    const payload = {
      baseValue1: parseFloat(scenarioData.baseValue1) || 0,
      gradeOrder: scenarioData.gradeOrder || [],
      grades: scenarioData.grades || {}
    };
    
    // Clean up grade data
    Object.keys(payload.grades).forEach(gradeName => {
      const grade = payload.grades[gradeName];
      if (grade.vertical === '' || grade.vertical === null) {
        grade.vertical = null;
      }
      
      if (grade.horizontal_intervals) {
        Object.keys(grade.horizontal_intervals).forEach(intervalKey => {
          const intervalValue = grade.horizontal_intervals[intervalKey];
          if (intervalValue === '' || intervalValue === null) {
            grade.horizontal_intervals[intervalKey] = 0;
          }
        });
      }
    });
    
    return api.post('/grading/scenarios/calculate_dynamic/', payload);
  },

  // Save Draft - SIMPLIFIED
  saveDraft: (scenarioData) => {
    console.log('💾 Save draft request:', scenarioData);
    
    const payload = {
      name: scenarioData.name || `Scenario ${Date.now()}`,
      description: scenarioData.description || 'Auto-generated scenario',
      baseValue1: parseFloat(scenarioData.baseValue1) || 0,
      gradeOrder: scenarioData.gradeOrder || [],
      grades: scenarioData.grades || {},
      globalHorizontalIntervals: scenarioData.globalHorizontalIntervals || {},
      calculatedOutputs: scenarioData.calculatedOutputs || {}
    };
    
    return api.post('/grading/scenarios/save_draft/', payload);
  },

  // Get Scenarios - SIMPLIFIED (removed problematic filters)
  getScenarios: (params = {}) => {
    const searchParams = new URLSearchParams();
    
    // Only add status filter, remove grading_system filter that was causing errors
    if (params.status) {
      searchParams.append('status', params.status);
    }
    
    return api.get(`/grading/scenarios/?${searchParams.toString()}`);
  },

  // Apply Scenario
  applyScenario: (scenarioId) => {
    return api.post(`/grading/scenarios/${scenarioId}/apply_as_current/`);
  },

  // Archive Scenario
  archiveScenario: (scenarioId) => {
    return api.post(`/grading/scenarios/${scenarioId}/archive/`);
  },

  // Get Current Scenario
  getCurrentScenario: () => {
    return api.get('/grading/scenarios/current_scenario/');
  },

  // Get Scenario Details
  getScenario: (scenarioId) => {
    return api.get(`/grading/scenarios/${scenarioId}/`);
  },

  // Get Position Groups
  getPositionGroups: () => {
    return api.get('/grading/systems/position_groups/');
  },

  // Format helpers - SIMPLIFIED
  formatCurrentStructure: (backendData) => {
    return {
      id: 'current',
      name: 'Current Structure',
      grades: backendData.grades || {},
      gradeOrder: backendData.gradeOrder || [],
      verticalAvg: backendData.verticalAvg || 0,
      horizontalAvg: backendData.horizontalAvg || 0,
      baseValue1: backendData.baseValue1 || 0,
      status: 'current'
    };
  },

  formatScenarioForFrontend: (backendScenario) => {
    if (!backendScenario) {
      return null;
    }

    // SIMPLIFIED: Direct data extraction without complex transformation
    const data = backendScenario.data || {};
    const calculatedGrades = backendScenario.calculated_grades || data.grades || {};
    const inputRates = backendScenario.input_rates || {};
    const gradeOrder = backendScenario.grade_order || data.gradeOrder || [];
    
    // Extract global horizontal intervals
    let globalHorizontalIntervals = {
      LD_to_LQ: 0,
      LQ_to_M: 0,
      M_to_UQ: 0,
      UQ_to_UD: 0
    };
    
    // Get intervals from first position (they should all be the same)
    for (const gradeName of gradeOrder) {
      const gradeInputData = inputRates[gradeName];
      if (gradeInputData && gradeInputData.horizontal_intervals) {
        globalHorizontalIntervals = { ...gradeInputData.horizontal_intervals };
        break;
      }
    }
    
    // Format grades with vertical input data
    const formattedGrades = {};
    gradeOrder.forEach(gradeName => {
      const calculatedData = calculatedGrades[gradeName] || {};
      const inputData = inputRates[gradeName] || {};
      
      formattedGrades[gradeName] = {
        LD: calculatedData.LD || 0,
        LQ: calculatedData.LQ || 0,
        M: calculatedData.M || 0,
        UQ: calculatedData.UQ || 0,
        UD: calculatedData.UD || 0,
        vertical: inputData.vertical !== undefined ? inputData.vertical : null,
        verticalInput: inputData.vertical  // For detail display
      };
    });

    // Get averages directly from backend
    const verticalAvg = parseFloat(backendScenario.vertical_avg || data.verticalAvg || 0);
    const horizontalAvg = parseFloat(backendScenario.horizontal_avg || data.horizontalAvg || 0);
    
    const formattedScenario = {
      id: backendScenario.id,
      name: backendScenario.name || 'Unnamed Scenario',
      description: backendScenario.description || '',
      status: (backendScenario.status || 'draft').toLowerCase(),
      createdAt: backendScenario.created_at,
      calculationTimestamp: backendScenario.calculation_timestamp,
      appliedAt: backendScenario.applied_at,
      
      // Store original backend data for detail views
      vertical_avg: verticalAvg,
      horizontal_avg: horizontalAvg,
      input_rates: inputRates,
      
      data: {
        baseValue1: parseFloat(backendScenario.base_value || data.baseValue1 || 0),
        gradeOrder: gradeOrder,
        grades: formattedGrades,
        globalHorizontalIntervals: globalHorizontalIntervals,
        verticalAvg: verticalAvg,
        horizontalAvg: horizontalAvg,
        positionVerticalInputs: data.positionVerticalInputs || {}  // Enhanced: position-specific vertical inputs
      },
      
      metrics: {
        totalBudgetImpact: (backendScenario.metrics && backendScenario.metrics.totalBudgetImpact) || 0,
        avgSalaryIncrease: (backendScenario.metrics && backendScenario.metrics.avgSalaryIncrease) || 0,
        maxSalaryIncrease: (backendScenario.metrics && backendScenario.metrics.maxSalaryIncrease) || 0,
        positionsAffected: (backendScenario.metrics && backendScenario.metrics.positionsAffected) || 0
      },
      
      isCalculated: !!(backendScenario.calculated_grades && Object.keys(backendScenario.calculated_grades).length > 0),
      createdBy: backendScenario.created_by_name || backendScenario.created_by || 'Unknown',
      appliedBy: backendScenario.applied_by_name || backendScenario.applied_by
    };
    
    console.log(`✅ Formatted scenario ${formattedScenario.name}:`, {
      verticalAvg: formattedScenario.data.verticalAvg,
      horizontalAvg: formattedScenario.data.horizontalAvg,
      globalIntervals: formattedScenario.data.globalHorizontalIntervals,
      hasVerticalInputs: Object.keys(formattedScenario.data.positionVerticalInputs || {}).length > 0
    });
    
    return formattedScenario;
  },

  // Validation - SIMPLIFIED
  validateScenarioData: (scenarioData) => {
    const errors = {};
    
    if (!scenarioData.baseValue1 || scenarioData.baseValue1 <= 0) {
      errors.baseValue1 = 'Base value must be greater than 0';
    }
    
    if (!scenarioData.gradeOrder || scenarioData.gradeOrder.length === 0) {
      errors.gradeOrder = 'Grade order is required';
    }
    
    if (!scenarioData.grades) {
      errors.grades = 'Grade inputs are required';
    } else {
      // Validate individual grade inputs
      scenarioData.gradeOrder?.forEach(gradeName => {
        const grade = scenarioData.grades[gradeName];
        if (grade && grade.vertical !== null && grade.vertical !== undefined && grade.vertical !== '') {
          const verticalNum = parseFloat(grade.vertical);
          if (isNaN(verticalNum) || verticalNum < 0 || verticalNum > 100) {
            errors[`vertical-${gradeName}`] = `Vertical rate for ${gradeName} must be between 0-100`;
          }
        }
      });
    }
    
    // Validate global horizontal intervals
    if (scenarioData.globalHorizontalIntervals) {
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
    
    return errors;
  }
};

export default gradingApi;