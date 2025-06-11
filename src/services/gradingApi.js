// src/services/gradingApi.js - COMPLETE FIXED VERSION FOR GLOBAL HORIZONTAL INTERVALS
import api from './api';

export const gradingApi = {
  // Current Structure - matches frontend currentData
  getCurrentStructure: (gradingSystemId = null) => {
    const params = gradingSystemId ? `?grading_system_id=${gradingSystemId}` : '';
    return api.get(`/grading/systems/current_structure/${params}`);
  },

  // Dynamic Calculation - UPDATED for global horizontal intervals
  calculateDynamic: (scenarioData) => {
    console.log('🌐 Calculate dynamic with global intervals:', scenarioData);
    
    const payload = {
      baseValue1: scenarioData.baseValue1,
      gradeOrder: scenarioData.gradeOrder,
      grades: scenarioData.grades // Contains per-position vertical + global horizontal_intervals
    };
    
    console.log('📤 Calculate dynamic payload (global intervals applied):', payload);
    
    return api.post('/grading/scenarios/calculate_dynamic/', payload);
  },

  // Save Draft - UPDATED for global horizontal intervals
  saveDraft: (scenarioData) => {
    console.log('💾 Saving draft with global intervals:', scenarioData);
    
    // Format data for backend - apply global intervals to each position
    const formattedGrades = {};
    if (scenarioData.gradeOrder && scenarioData.grades && scenarioData.globalHorizontalIntervals) {
      scenarioData.gradeOrder.forEach(gradeName => {
        const gradeInput = scenarioData.grades[gradeName] || {};
        formattedGrades[gradeName] = {
          vertical: gradeInput.vertical,
          horizontal_intervals: scenarioData.globalHorizontalIntervals // Apply global to each position
        };
      });
    }
    
    return api.post('/grading/scenarios/save_draft/', {
      name: scenarioData.name || `Scenario ${Date.now()}`,
      description: scenarioData.description || 'Auto-generated scenario with global horizontal intervals',
      baseValue1: scenarioData.baseValue1,
      gradeOrder: scenarioData.gradeOrder,
      grades: formattedGrades, // Formatted with global intervals applied
      calculatedOutputs: scenarioData.calculatedOutputs
    });
  },

  // Get Draft Scenarios - matches frontend draftScenarios
  getDraftScenarios: (gradingSystemId = null) => {
    const params = new URLSearchParams({ status: 'DRAFT' });
    if (gradingSystemId) params.append('grading_system_id', gradingSystemId);
    return api.get(`/grading/scenarios/?${params.toString()}`);
  },

  // Get Archived Scenarios - matches frontend archivedScenarios
  getArchivedScenarios: (gradingSystemId = null) => {
    const params = new URLSearchParams({ status: 'ARCHIVED' });
    if (gradingSystemId) params.append('grading_system_id', gradingSystemId);
    return api.get(`/grading/scenarios/?${params.toString()}`);
  },

  // Apply Scenario as Current - matches frontend handleSaveAsCurrent
  applyScenario: (scenarioId) => {
    return api.post(`/grading/scenarios/${scenarioId}/apply_as_current/`);
  },

  // Archive Scenario - matches frontend handleArchiveDraft
  archiveScenario: (scenarioId) => {
    return api.post(`/grading/scenarios/${scenarioId}/archive/`);
  },

  // Get Best Draft - matches frontend bestDraft logic
  getBestDraft: (gradingSystemId = null) => {
    const params = gradingSystemId ? `?grading_system_id=${gradingSystemId}` : '';
    return api.get(`/grading/scenarios/get_best_draft/${params}`);
  },

  // Compare Scenarios - matches frontend comparison functionality
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

  // Helper methods to format data for frontend - UPDATED FOR GLOBAL INTERVALS
  formatCurrentStructure: (backendData) => {
    // Convert backend format to frontend currentData format
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
    // Convert backend scenario to frontend format - UPDATED FOR GLOBAL INTERVALS
    const grades = backendScenario.calculated_grades || backendScenario.data?.grades || {};
    
    // Extract global horizontal intervals (assume they are the same across positions)
    let globalHorizontalIntervals = {
      LD_to_LQ: 0,
      LQ_to_M: 0,
      M_to_UQ: 0,
      UQ_to_UD: 0
    };
    
    // Get global intervals from first position (they should be same for all)
    const firstGradeName = Object.keys(grades)[0];
    if (firstGradeName && grades[firstGradeName]?.horizontal_intervals) {
      globalHorizontalIntervals = grades[firstGradeName].horizontal_intervals;
    }
    
    // Format grades with only vertical (remove duplicate horizontal_intervals)
    const formattedGrades = {};
    Object.keys(grades).forEach(gradeName => {
      const gradeData = grades[gradeName];
      formattedGrades[gradeName] = {
        ...gradeData,
        // Remove per-position horizontal_intervals since they are now global
        vertical: gradeData.vertical || 0
      };
      // Remove horizontal_intervals from individual grades
      delete formattedGrades[gradeName].horizontal_intervals;
    });

    return {
      id: backendScenario.id,
      name: backendScenario.name,
      status: backendScenario.status?.toLowerCase() || 'draft',
      createdAt: backendScenario.created_at,
      data: {
        baseValue1: backendScenario.base_value || backendScenario.data?.baseValue1 || 0,
        gradeOrder: backendScenario.grade_order || backendScenario.data?.gradeOrder || [],
        grades: formattedGrades,
        globalHorizontalIntervals: globalHorizontalIntervals, // NEW: Global intervals
        verticalAvg: backendScenario.vertical_avg || backendScenario.data?.verticalAvg || 0,
        horizontalAvg: backendScenario.horizontal_avg || backendScenario.data?.horizontalAvg || 0
      },
      metrics: backendScenario.metrics || {
        totalBudgetImpact: 0,
        avgSalaryIncrease: 0,
        competitiveness: 0,
        riskLevel: 'Low'
      }
    };
  },

  formatScenarioFromBackend: (backendScenario) => {
    // Alias for formatScenarioForFrontend
    return this.formatScenarioForFrontend(backendScenario);
  },

  formatScenarioForBackend: (frontendScenario) => {
    // Convert frontend scenario to backend format - UPDATED FOR GLOBAL INTERVALS
    const formattedGrades = {};
    
    // Apply global intervals to each position
    if (frontendScenario.gradeOrder && frontendScenario.grades && frontendScenario.globalHorizontalIntervals) {
      frontendScenario.gradeOrder.forEach(gradeName => {
        const gradeInput = frontendScenario.grades[gradeName] || {};
        formattedGrades[gradeName] = {
          vertical: gradeInput.vertical,
          horizontal_intervals: frontendScenario.globalHorizontalIntervals // Apply global to each position
        };
      });
    }
    
    return {
      name: frontendScenario.name,
      description: frontendScenario.description || '',
      base_value: frontendScenario.baseValue1,
      grade_order: frontendScenario.gradeOrder,
      input_rates: formattedGrades, // Contains global intervals applied to each position
      calculated_grades: frontendScenario.calculatedOutputs
    };
  },

  // Validation helper - UPDATED FOR GLOBAL INTERVALS
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
      // Validate grade inputs - UPDATED FOR GLOBAL INTERVALS
      scenarioData.gradeOrder?.forEach(gradeName => {
        const grade = scenarioData.grades[gradeName];
        if (grade) {
          // Validate vertical
          if (typeof grade.vertical === 'number' && (grade.vertical < 0 || grade.vertical > 100)) {
            errors[`vertical-${gradeName}`] = 'Vertical rate must be between 0-100';
          }
        }
      });
    }
    
    // NEW: Validate global horizontal intervals
    if (scenarioData.globalHorizontalIntervals) {
      const intervalNames = ['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'];
      intervalNames.forEach(intervalName => {
        const intervalValue = scenarioData.globalHorizontalIntervals[intervalName];
        if (typeof intervalValue === 'number' && (intervalValue < 0 || intervalValue > 100)) {
          errors[`global-horizontal-${intervalName}`] = `Global ${intervalName} rate must be between 0-100`;
        }
      });
    }
    
    return errors;
  }
};

// Default export (optional)
export default gradingApi;