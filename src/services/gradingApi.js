// src/services/gradingApi.js - FIXED: Removed competitiveness/riskLevel references
import api from './api';

export const gradingApi = {
  // Current Structure - matches frontend currentData
  getCurrentStructure: (gradingSystemId = null) => {
    const params = gradingSystemId ? `?grading_system_id=${gradingSystemId}` : '';
    return api.get(`/grading/systems/current_structure/${params}`);
  },

  // Dynamic Calculation - FIXED for better validation
  calculateDynamic: (scenarioData) => {
    console.log('🌐 Calculate dynamic with global intervals:', scenarioData);
    
    // ENHANCED: Better data validation before sending
    const payload = {
      baseValue1: parseFloat(scenarioData.baseValue1) || 0,
      gradeOrder: scenarioData.gradeOrder || [],
      grades: scenarioData.grades || {}
    };
    
    // Validate each grade's data
    Object.keys(payload.grades).forEach(gradeName => {
      const grade = payload.grades[gradeName];
      if (grade.vertical === '' || grade.vertical === null) {
        grade.vertical = null; // Send null instead of empty string
      }
      
      // Validate horizontal intervals
      if (grade.horizontal_intervals) {
        Object.keys(grade.horizontal_intervals).forEach(intervalKey => {
          const intervalValue = grade.horizontal_intervals[intervalKey];
          if (intervalValue === '' || intervalValue === null) {
            grade.horizontal_intervals[intervalKey] = 0; // Default to 0 instead of empty string
          }
        });
      }
    });
    
    console.log('📤 Calculate dynamic payload (validated):', payload);
    
    return api.post('/grading/scenarios/calculate_dynamic/', payload);
  },

  // Save Draft - FIXED for better global interval handling
  saveDraft: (scenarioData) => {
    console.log('💾 Saving draft with global intervals:', scenarioData);
    
    // FIXED: Better data validation and formatting for global intervals
    const formattedGrades = {};
    if (scenarioData.gradeOrder && scenarioData.grades && scenarioData.globalHorizontalIntervals) {
      scenarioData.gradeOrder.forEach(gradeName => {
        const gradeInput = scenarioData.grades[gradeName] || {};
        
        // Handle vertical input properly
        let verticalValue = gradeInput.vertical;
        if (verticalValue === '' || verticalValue === null || verticalValue === undefined) {
          verticalValue = null;
        } else {
          verticalValue = parseFloat(verticalValue);
        }
        
        // FIXED: Handle global horizontal intervals properly - ensure all keys exist
        const defaultIntervals = {
          LD_to_LQ: 0,
          LQ_to_M: 0,
          M_to_UQ: 0,
          UQ_to_UD: 0
        };
        
        const cleanIntervals = {};
        Object.keys(defaultIntervals).forEach(key => {
          const value = scenarioData.globalHorizontalIntervals[key];
          cleanIntervals[key] = (value === '' || value === null || value === undefined) ? 0 : parseFloat(value);
        });
        
        formattedGrades[gradeName] = {
          vertical: verticalValue,
          horizontal_intervals: cleanIntervals
        };
      });
    }
    
    const payload = {
      name: scenarioData.name || `Scenario ${Date.now()}`,
      description: scenarioData.description || 'Auto-generated scenario with global horizontal intervals',
      baseValue1: parseFloat(scenarioData.baseValue1) || 0,
      gradeOrder: scenarioData.gradeOrder || [],
      grades: formattedGrades,
      globalHorizontalIntervals: scenarioData.globalHorizontalIntervals || {},
      calculatedOutputs: scenarioData.calculatedOutputs || {}
    };
    
    console.log('📤 Save draft payload (FIXED):', payload);
    
    return api.post('/grading/scenarios/save_draft/', payload);
  },

  // Get Draft Scenarios
  getDraftScenarios: (gradingSystemId = null) => {
    const params = new URLSearchParams({ status: 'DRAFT' });
    if (gradingSystemId) params.append('grading_system_id', gradingSystemId);
    return api.get(`/grading/scenarios/?${params.toString()}`);
  },

  // Get Archived Scenarios
  getArchivedScenarios: (gradingSystemId = null) => {
    const params = new URLSearchParams({ status: 'ARCHIVED' });
    if (gradingSystemId) params.append('grading_system_id', gradingSystemId);
    return api.get(`/grading/scenarios/?${params.toString()}`);
  },

  // Apply Scenario as Current
  applyScenario: (scenarioId) => {
    return api.post(`/grading/scenarios/${scenarioId}/apply_as_current/`);
  },

  // Archive Scenario
  archiveScenario: (scenarioId) => {
    return api.post(`/grading/scenarios/${scenarioId}/archive/`);
  },

  // Get Best Draft
  getBestDraft: (gradingSystemId = null) => {
    const params = gradingSystemId ? `?grading_system_id=${gradingSystemId}` : '';
    return api.get(`/grading/scenarios/get_best_draft/${params}`);
  },

  // Compare Scenarios
  compareScenarios: (scenarioIds, includeCurrents = false) => {
    return api.post('/grading/scenarios/compare_scenarios/', {
      scenario_ids: scenarioIds,
      include_current: includeCurrents
    });
  },

  // Get Scenario Details
  getScenario: (scenarioId) => {
    return api.get(`/grading/scenarios/${scenarioId}/`);
  },

  // Get all scenarios with status filter
  getScenarios: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/grading/scenarios/?${searchParams.toString()}`);
  },

  // Grading Systems Management
  getGradingSystems: () => api.get('/grading/systems/'),
  createGradingSystem: (data) => api.post('/grading/systems/', data),
  updateGradingSystem: (id, data) => api.put(`/grading/systems/${id}/`, data),
  deleteGradingSystem: (id) => api.delete(`/grading/systems/${id}/`),

  // Get Grading Dropdowns (Position Groups, etc.)
  getGradingDropdowns: () => api.get('/grading/systems/position_groups/'),

  // Get Current Scenario
  getCurrentScenario: (gradingSystemId = null) => {
    const params = gradingSystemId ? `?grading_system=${gradingSystemId}` : '';
    return api.get(`/grading/scenarios/current_scenario/${params}`);
  },

  // Get Salary Grades by System
  getSalaryGradesBySystem: (gradingSystemId) => {
    return api.get(`/grading/salary-grades/by_system/?grading_system=${gradingSystemId}`);
  },

  // Get Scenario Statistics
  getScenarioStatistics: (gradingSystemId = null) => {
    const params = gradingSystemId ? `?grading_system=${gradingSystemId}` : '';
    return api.get(`/grading/scenarios/statistics/${params}`);
  },

  // Create Scenario
  createScenario: (scenarioData) => {
    return api.post('/grading/scenarios/', scenarioData);
  },

  // Calculate Scenario
  calculateScenario: (scenarioId) => {
    return api.post(`/grading/scenarios/${scenarioId}/calculate/`);
  },

  // Duplicate Scenario
  duplicateScenario: (scenarioId) => {
    return api.post(`/grading/scenarios/${scenarioId}/duplicate/`);
  },

  // Delete Scenario
  deleteScenario: (scenarioId) => {
    return api.delete(`/grading/scenarios/${scenarioId}/`);
  },

  // Helper methods - ENHANCED FOR BETTER DATA HANDLING
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
  // ENHANCED: Better data handling and validation
  if (!backendScenario) {
    console.warn('formatScenarioForFrontend: backendScenario is null/undefined');
    return null;
  }

  const calculatedGrades = backendScenario.calculated_grades || backendScenario.data?.grades || {};
  const inputRates = backendScenario.input_rates || {};
  
  // FIXED: Extract global horizontal intervals - IMPROVED LOGIC
  let globalHorizontalIntervals = {
    LD_to_LQ: 0,
    LQ_to_M: 0,
    M_to_UQ: 0,
    UQ_to_UD: 0
  };
  
  // Get global intervals from first position with intervals (they should all be the same)
  const gradeOrder = backendScenario.grade_order || backendScenario.data?.gradeOrder || [];
  for (const gradeName of gradeOrder) {
    const gradeInputData = inputRates[gradeName];
    if (gradeInputData && gradeInputData.horizontal_intervals) {
      globalHorizontalIntervals = { ...gradeInputData.horizontal_intervals };
      console.log(`🔍 Found global intervals in ${gradeName}:`, globalHorizontalIntervals);
      break; // Use first found intervals as global (they should all be the same)
    }
  }
  
  // Format grades - ENHANCED
  const formattedGrades = {};
  gradeOrder.forEach(gradeName => {
    const calculatedData = calculatedGrades[gradeName] || {};
    const inputData = inputRates[gradeName] || {};
    
    formattedGrades[gradeName] = {
      // Calculated values
      LD: calculatedData.LD || 0,
      LQ: calculatedData.LQ || 0,
      M: calculatedData.M || 0,
      UQ: calculatedData.UQ || 0,
      UD: calculatedData.UD || 0,
      // Input values
      vertical: inputData.vertical !== undefined ? inputData.vertical : 0
    };
  });

  // FIXED: Use database stored averages directly
  let verticalAvg = 0;
  let horizontalAvg = 0;
  
  // Priority: use database stored values first
  if (backendScenario.vertical_avg !== undefined && backendScenario.vertical_avg !== null) {
    verticalAvg = parseFloat(backendScenario.vertical_avg);
    console.log(`📊 Using stored vertical_avg: ${verticalAvg}`);
  } else if (backendScenario.data?.verticalAvg !== undefined) {
    verticalAvg = parseFloat(backendScenario.data.verticalAvg);
  }
  
  if (backendScenario.horizontal_avg !== undefined && backendScenario.horizontal_avg !== null) {
    horizontalAvg = parseFloat(backendScenario.horizontal_avg);
    console.log(`📊 Using stored horizontal_avg: ${horizontalAvg}`);
  } else if (backendScenario.data?.horizontalAvg !== undefined) {
    horizontalAvg = parseFloat(backendScenario.data.horizontalAvg);
  }

  // SIMPLIFIED: Basic metrics handling (removed competitiveness/riskLevel)
  const metrics = backendScenario.metrics || {};
  
  const formattedScenario = {
    id: backendScenario.id,
    name: backendScenario.name || 'Unnamed Scenario',
    description: backendScenario.description || '',
    status: (backendScenario.status || 'draft').toLowerCase(),
    createdAt: backendScenario.created_at,
    calculationTimestamp: backendScenario.calculation_timestamp,
    appliedAt: backendScenario.applied_at,
    
    // FIXED: Include direct access to stored averages
    vertical_avg: verticalAvg,
    horizontal_avg: horizontalAvg,
    input_rates: inputRates,  // Include original input_rates for detail view
    
    data: {
      baseValue1: parseFloat(backendScenario.base_value || backendScenario.data?.baseValue1 || 0),
      gradeOrder: gradeOrder,
      grades: formattedGrades,
      globalHorizontalIntervals: globalHorizontalIntervals,
      verticalAvg: verticalAvg,
      horizontalAvg: horizontalAvg
    },
    metrics: {
      totalBudgetImpact: metrics.totalBudgetImpact || 0,
      avgSalaryIncrease: metrics.avgSalaryIncrease || 0,
      maxSalaryIncrease: metrics.maxSalaryIncrease || 0,
      positionsAffected: metrics.positionsAffected || 0
      // REMOVED: competitiveness, riskLevel
    },
    isCalculated: !!(backendScenario.calculated_grades && Object.keys(backendScenario.calculated_grades).length > 0),
    createdBy: backendScenario.created_by_name || backendScenario.created_by || 'Unknown',
    appliedBy: backendScenario.applied_by_name || backendScenario.applied_by
  };
  
  console.log(`🎯 Formatted scenario ${formattedScenario.name}:`, {
    verticalAvg: formattedScenario.data.verticalAvg,
    horizontalAvg: formattedScenario.data.horizontalAvg,
    globalIntervals: formattedScenario.data.globalHorizontalIntervals
  });
  
  return formattedScenario;
},

  formatScenarioFromBackend: (backendScenario) => {
    // Direct call instead of this.formatScenarioForFrontend
    return gradingApi.formatScenarioForFrontend(backendScenario);
  },

  formatScenarioForBackend: (frontendScenario) => {
    // ENHANCED: Better validation and formatting
    if (!frontendScenario) {
      throw new Error('Frontend scenario data is required');
    }

    const formattedGrades = {};
    
    // Apply global intervals to each position - ENHANCED VALIDATION
    if (frontendScenario.gradeOrder && frontendScenario.grades && frontendScenario.globalHorizontalIntervals) {
      frontendScenario.gradeOrder.forEach(gradeName => {
        const gradeInput = frontendScenario.grades[gradeName] || {};
        
        // Handle vertical input
        let verticalValue = gradeInput.vertical;
        if (verticalValue === '' || verticalValue === null || verticalValue === undefined) {
          verticalValue = null;
        } else {
          verticalValue = parseFloat(verticalValue);
        }
        
        // Handle global horizontal intervals
        const cleanIntervals = {};
        Object.keys(frontendScenario.globalHorizontalIntervals).forEach(key => {
          const value = frontendScenario.globalHorizontalIntervals[key];
          cleanIntervals[key] = (value === '' || value === null || value === undefined) ? 0 : parseFloat(value);
        });
        
        formattedGrades[gradeName] = {
          vertical: verticalValue,
          horizontal_intervals: cleanIntervals
        };
      });
    }
    
    return {
      name: frontendScenario.name || `Scenario ${Date.now()}`,
      description: frontendScenario.description || '',
      base_value: parseFloat(frontendScenario.baseValue1) || 0,
      grade_order: frontendScenario.gradeOrder || [],
      input_rates: formattedGrades,
      calculated_grades: frontendScenario.calculatedOutputs || {}
    };
  },

  // ENHANCED: Better validation with detailed error messages
  validateScenarioData: (scenarioData) => {
    const errors = {};
    
    // Base value validation
    if (!scenarioData.baseValue1 || scenarioData.baseValue1 <= 0) {
      errors.baseValue1 = 'Base value must be greater than 0';
    }
    
    // Grade order validation
    if (!scenarioData.gradeOrder || scenarioData.gradeOrder.length === 0) {
      errors.gradeOrder = 'Grade order is required';
    }
    
    // Grades validation
    if (!scenarioData.grades) {
      errors.grades = 'Grade inputs are required';
    } else {
      // Validate individual grade inputs
      scenarioData.gradeOrder?.forEach(gradeName => {
        const grade = scenarioData.grades[gradeName];
        if (grade) {
          // Validate vertical - allow null for base position
          if (grade.vertical !== null && grade.vertical !== undefined && grade.vertical !== '') {
            const verticalNum = parseFloat(grade.vertical);
            if (isNaN(verticalNum) || verticalNum < 0 || verticalNum > 100) {
              errors[`vertical-${gradeName}`] = `Vertical rate for ${gradeName} must be between 0-100`;
            }
          }
        }
      });
    }
    
    // Global horizontal intervals validation - ENHANCED
    if (scenarioData.globalHorizontalIntervals) {
      const intervalNames = ['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'];
      intervalNames.forEach(intervalName => {
        const intervalValue = scenarioData.globalHorizontalIntervals[intervalName];
        if (intervalValue !== null && intervalValue !== undefined && intervalValue !== '') {
          const intervalNum = parseFloat(intervalValue);
          if (isNaN(intervalNum) || intervalNum < 0 || intervalNum > 100) {
            errors[`global-horizontal-${intervalName}`] = `Global ${intervalName} rate must be between 0-100`;
          }
        }
      });
    }
    
    return errors;
  },

  // SIMPLIFIED: Basic comparison utilities (removed competitiveness/riskLevel)
  compareScenarioMetrics: (scenarios) => {
    if (!Array.isArray(scenarios) || scenarios.length < 2) {
      return null;
    }

    const comparison = {
      scenarios: scenarios.length,
      metrics: {
        verticalAvg: {
          min: Math.min(...scenarios.map(s => s.data?.verticalAvg || 0)),
          max: Math.max(...scenarios.map(s => s.data?.verticalAvg || 0)),
          avg: scenarios.reduce((sum, s) => sum + (s.data?.verticalAvg || 0), 0) / scenarios.length
        },
        horizontalAvg: {
          min: Math.min(...scenarios.map(s => s.data?.horizontalAvg || 0)),
          max: Math.max(...scenarios.map(s => s.data?.horizontalAvg || 0)),
          avg: scenarios.reduce((sum, s) => sum + (s.data?.horizontalAvg || 0), 0) / scenarios.length
        },
        baseValue: {
          min: Math.min(...scenarios.map(s => s.data?.baseValue1 || 0)),
          max: Math.max(...scenarios.map(s => s.data?.baseValue1 || 0)),
          avg: scenarios.reduce((sum, s) => sum + (s.data?.baseValue1 || 0), 0) / scenarios.length
        }
      },
      recommendations: []
    };

    // Add recommendations based on comparison
    const verticalRange = comparison.metrics.verticalAvg.max - comparison.metrics.verticalAvg.min;
    const horizontalRange = comparison.metrics.horizontalAvg.max - comparison.metrics.horizontalAvg.min;

    if (verticalRange > 0.1) {
      comparison.recommendations.push('High variation in vertical rates detected - consider standardizing');
    }
    if (horizontalRange > 0.1) {
      comparison.recommendations.push('High variation in horizontal rates detected - review for consistency');
    }

    return comparison;
  },

  // SIMPLIFIED: Basic assessment utilities (removed riskLevel)
  assessScenarioImpact: (scenarioData) => {
    const warnings = [];

    const verticalAvg = scenarioData.verticalAvg || 0;
    const horizontalAvg = scenarioData.horizontalAvg || 0;
    const baseValue = scenarioData.baseValue1 || 0;

    // Impact assessments
    if (verticalAvg > 0.25) {
      warnings.push('Very high vertical growth rates may cause budget strain');
    } else if (verticalAvg > 0.15) {
      warnings.push('High vertical growth rates - monitor budget impact');
    }

    if (horizontalAvg > 0.20) {
      warnings.push('Very high horizontal spread may create inequity');
    } else if (horizontalAvg > 0.15) {
      warnings.push('High horizontal spread - review for fairness');
    }

    if (baseValue < 400) {
      warnings.push('Low base value may affect competitiveness');
    }

    const deviation = Math.abs(verticalAvg - horizontalAvg);
    if (deviation > 0.1) {
      warnings.push('Large difference between vertical and horizontal rates');
    }

    return {
      impactLevel: warnings.length > 2 ? 'High' : warnings.length > 0 ? 'Medium' : 'Low',
      warnings,
      score: gradingApi.calculateImpactScore(verticalAvg, horizontalAvg, deviation)
    };
  },

  // SIMPLIFIED: Calculate impact score (renamed from risk score)
  calculateImpactScore: (verticalAvg, horizontalAvg, deviation) => {
    let score = 100;
    
    // Penalize high rates
    if (verticalAvg > 0.25) score -= 30;
    else if (verticalAvg > 0.15) score -= 15;
    
    if (horizontalAvg > 0.20) score -= 25;
    else if (horizontalAvg > 0.15) score -= 10;
    
    // Penalize large deviations
    if (deviation > 0.1) score -= 20;
    else if (deviation > 0.05) score -= 10;
    
    return Math.max(score, 0);
  }
};

export default gradingApi;