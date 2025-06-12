// src/store/slices/gradingSlice.js - SIMPLIFIED: Removed unnecessary complexity
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { gradingApi } from '@/services/gradingApi';

// Async thunks - SIMPLIFIED
export const fetchCurrentStructure = createAsyncThunk(
  'grading/fetchCurrentStructure',
  async (gradingSystemId, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getCurrentStructure(gradingSystemId);
      return gradingApi.formatCurrentStructure(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchScenarios = createAsyncThunk(
  'grading/fetchScenarios',
  async ({ status }, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getScenarios({ status });
      return { 
        scenarios: response.data.results || response.data,
        status: status
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const calculateDynamicScenario = createAsyncThunk(
  'grading/calculateDynamicScenario',
  async (scenarioData, { rejectWithValue }) => {
    try {
      const response = await gradingApi.calculateDynamic(scenarioData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const saveDraftScenario = createAsyncThunk(
  'grading/saveDraftScenario',
  async (scenarioData, { rejectWithValue }) => {
    try {
      const response = await gradingApi.saveDraft(scenarioData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const applyScenario = createAsyncThunk(
  'grading/applyScenario',
  async (scenarioId, { rejectWithValue, dispatch }) => {
    try {
      const response = await gradingApi.applyScenario(scenarioId);
      
      if (response.data.success) {
        // Refresh data after successful application
        await Promise.all([
          dispatch(fetchCurrentStructure()),
          dispatch(fetchScenarios({ status: 'DRAFT' })),
          dispatch(fetchScenarios({ status: 'ARCHIVED' }))
        ]);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const archiveScenario = createAsyncThunk(
  'grading/archiveScenario',
  async (scenarioId, { rejectWithValue }) => {
    try {
      const response = await gradingApi.archiveScenario(scenarioId);
      return { scenarioId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Initial state - SIMPLIFIED
const initialState = {
  // Current structure and scenarios
  currentStructure: null,
  
  // Scenario inputs
  scenarioInputs: {
    baseValue1: '',
    gradeOrder: [],
    grades: {},
    globalHorizontalIntervals: {
      LD_to_LQ: '',
      LQ_to_M: '',
      M_to_UQ: '',
      UQ_to_UD: ''
    }
  },
  calculatedOutputs: {},
  
  // Scenarios by status
  draftScenarios: [],
  archivedScenarios: [],
  
  // Loading states
  loading: {
    currentStructure: false,
    draftScenarios: false,
    archivedScenarios: false,
    calculating: false,
    saving: false,
    applying: false,
    archiving: false
  },
  
  // Simplified error handling
  errors: {}
};

const gradingSlice = createSlice({
  name: 'grading',
  initialState,
  reducers: {
    setScenarioInputs: (state, action) => {
      state.scenarioInputs = { ...state.scenarioInputs, ...action.payload };
    },
    updateScenarioInput: (state, action) => {
      const { field, value } = action.payload;
      state.scenarioInputs[field] = value;
    },
    updateGradeInput: (state, action) => {
      const { gradeName, field, value } = action.payload;
      if (!state.scenarioInputs.grades[gradeName]) {
        state.scenarioInputs.grades[gradeName] = {};
      }
      state.scenarioInputs.grades[gradeName][field] = value;
    },
    setCalculatedOutputs: (state, action) => {
      state.calculatedOutputs = action.payload;
    },
    clearErrors: (state) => {
      state.errors = {};
    },
    setError: (state, action) => {
      const { field, message } = action.payload;
      state.errors[field] = message;
    }
  },
  extraReducers: (builder) => {
    // Fetch current structure
    builder
      .addCase(fetchCurrentStructure.pending, (state) => {
        state.loading.currentStructure = true;
        delete state.errors.load;
      })
      .addCase(fetchCurrentStructure.fulfilled, (state, action) => {
        state.loading.currentStructure = false;
        state.currentStructure = action.payload;
        
        // Initialize scenario inputs
        if (action.payload && action.payload.gradeOrder.length > 0) {
          const initialGrades = {};
          action.payload.gradeOrder.forEach((gradeName, index) => {
            const isBasePosition = index === (action.payload.gradeOrder.length - 1);
            initialGrades[gradeName] = { 
              vertical: isBasePosition ? null : ''
            };
          });
          
          state.scenarioInputs = {
            baseValue1: '',
            gradeOrder: action.payload.gradeOrder,
            grades: initialGrades,
            globalHorizontalIntervals: {
              LD_to_LQ: '',
              LQ_to_M: '',
              M_to_UQ: '',
              UQ_to_UD: ''
            }
          };
          
          // Initialize calculated outputs
          const initialOutputs = {};
          action.payload.gradeOrder.forEach((gradeName) => {
            initialOutputs[gradeName] = { 
              LD: "", LQ: "", M: "", UQ: "", UD: "" 
            };
          });
          state.calculatedOutputs = initialOutputs;
        }
      })
      .addCase(fetchCurrentStructure.rejected, (state, action) => {
        state.loading.currentStructure = false;
        state.errors.load = action.payload;
      })

    // Calculate dynamic scenario
    builder
      .addCase(calculateDynamicScenario.pending, (state) => {
        state.loading.calculating = true;
        delete state.errors.calculating;
      })
      .addCase(calculateDynamicScenario.fulfilled, (state, action) => {
        state.loading.calculating = false;
        if (action.payload.calculatedOutputs) {
          state.calculatedOutputs = action.payload.calculatedOutputs;
        }
      })
      .addCase(calculateDynamicScenario.rejected, (state, action) => {
        state.loading.calculating = false;
        state.errors.calculating = action.payload;
      })

    // Fetch scenarios
    builder
      .addCase(fetchScenarios.pending, (state, action) => {
        const status = action.meta.arg.status;
        if (status === 'DRAFT') {
          state.loading.draftScenarios = true;
          delete state.errors.draftScenarios;
        } else if (status === 'ARCHIVED') {
          state.loading.archivedScenarios = true;
          delete state.errors.archivedScenarios;
        }
      })
      .addCase(fetchScenarios.fulfilled, (state, action) => {
        const { scenarios, status } = action.payload;
        const formattedScenarios = scenarios.map(s => gradingApi.formatScenarioForFrontend(s));
        
        if (status === 'DRAFT') {
          state.loading.draftScenarios = false;
          state.draftScenarios = formattedScenarios;
        } else if (status === 'ARCHIVED') {
          state.loading.archivedScenarios = false;
          state.archivedScenarios = formattedScenarios;
        }
      })
      .addCase(fetchScenarios.rejected, (state, action) => {
        const status = action.meta.arg.status;
        if (status === 'DRAFT') {
          state.loading.draftScenarios = false;
          state.errors.draftScenarios = action.payload;
        } else if (status === 'ARCHIVED') {
          state.loading.archivedScenarios = false;
          state.errors.archivedScenarios = action.payload;
        }
      })

    // Save draft scenario
    builder
      .addCase(saveDraftScenario.pending, (state) => {
        state.loading.saving = true;
        delete state.errors.saving;
      })
      .addCase(saveDraftScenario.fulfilled, (state, action) => {
        state.loading.saving = false;
        if (action.payload.success && action.payload.scenario) {
          const formattedScenario = gradingApi.formatScenarioForFrontend(action.payload.scenario);
          state.draftScenarios.unshift(formattedScenario);
        }
      })
      .addCase(saveDraftScenario.rejected, (state, action) => {
        state.loading.saving = false;
        state.errors.saving = action.payload;
      })

    // Apply scenario
    builder
      .addCase(applyScenario.pending, (state) => {
        state.loading.applying = true;
        delete state.errors.applying;
      })
      .addCase(applyScenario.fulfilled, (state, action) => {
        state.loading.applying = false;
      })
      .addCase(applyScenario.rejected, (state, action) => {
        state.loading.applying = false;
        state.errors.applying = action.payload;
      })

    // Archive scenario
    builder
      .addCase(archiveScenario.pending, (state) => {
        state.loading.archiving = true;
        delete state.errors.archiving;
      })
      .addCase(archiveScenario.fulfilled, (state, action) => {
        state.loading.archiving = false;
        const { scenarioId } = action.payload;
        
        // Move from draft to archived
        const scenarioIndex = state.draftScenarios.findIndex(s => s.id === scenarioId);
        if (scenarioIndex !== -1) {
          const scenario = { ...state.draftScenarios[scenarioIndex], status: 'archived' };
          state.draftScenarios.splice(scenarioIndex, 1);
          state.archivedScenarios.unshift(scenario);
        }
      })
      .addCase(archiveScenario.rejected, (state, action) => {
        state.loading.archiving = false;
        state.errors.archiving = action.payload;
      });
  }
});

export const { 
  setScenarioInputs, 
  updateScenarioInput, 
  updateGradeInput, 
  setCalculatedOutputs, 
  clearErrors,
  setError
} = gradingSlice.actions;

export default gradingSlice.reducer;

// Selectors - SIMPLIFIED
export const selectCurrentStructure = (state) => state.grading.currentStructure;
export const selectScenarioInputs = (state) => state.grading.scenarioInputs;
export const selectCalculatedOutputs = (state) => state.grading.calculatedOutputs;
export const selectDraftScenarios = (state) => state.grading.draftScenarios;
export const selectArchivedScenarios = (state) => state.grading.archivedScenarios;
export const selectLoading = (state) => state.grading.loading;
export const selectErrors = (state) => state.grading.errors;

// Memoized selectors
export const selectBestDraftScenario = createSelector(
  [selectDraftScenarios],
  (draftScenarios) => {
    if (draftScenarios.length === 0) return null;
    
    // Simple scoring based on balance between vertical and horizontal averages
    const getBalanceScore = (scenario) => {
      const verticalAvg = scenario.data?.verticalAvg || 0;
      const horizontalAvg = scenario.data?.horizontalAvg || 0;
      const deviation = Math.abs(verticalAvg - horizontalAvg);
      return (verticalAvg + horizontalAvg) / (1 + deviation * 10); // Penalize large deviations
    };

    return draftScenarios.reduce((best, scenario) => {
      return getBalanceScore(scenario) > getBalanceScore(best) ? scenario : best;
    }, draftScenarios[0]);
  }
);