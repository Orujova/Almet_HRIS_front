// src/store/slices/gradingSlice.js - Tam dosya (selector fix'li)
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { gradingApi } from '@/services/gradingApi';

// Async thunks
export const fetchGradingSystems = createAsyncThunk(
  'grading/fetchGradingSystems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getGradingSystems();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchGradingDropdowns = createAsyncThunk(
  'grading/fetchGradingDropdowns',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getGradingDropdowns();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCurrentScenario = createAsyncThunk(
  'grading/fetchCurrentScenario',
  async (gradingSystemId, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getCurrentScenario(gradingSystemId);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No current scenario
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCurrentGrades = createAsyncThunk(
  'grading/fetchCurrentGrades',
  async (gradingSystemId, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getSalaryGradesBySystem(gradingSystemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchScenarios = createAsyncThunk(
  'grading/fetchScenarios',
  async ({ gradingSystemId, status }, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getScenarios({
        grading_system: gradingSystemId,
        status: status
      });
      return { 
        scenarios: response.data.results || response.data,
        status: status
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchScenarioStatistics = createAsyncThunk(
  'grading/fetchScenarioStatistics',
  async (gradingSystemId, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getScenarioStatistics(gradingSystemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createScenario = createAsyncThunk(
  'grading/createScenario',
  async (scenarioData, { rejectWithValue, getState }) => {
    try {
      const { grading } = getState();
      const backendData = gradingApi.formatScenarioForBackend({
        ...scenarioData,
        gradingSystemId: grading.selectedSystemId
      });
      
      const response = await gradingApi.createScenario(backendData);
      return gradingApi.formatScenarioFromBackend(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const calculateScenario = createAsyncThunk(
  'grading/calculateScenario',
  async (scenarioId, { rejectWithValue }) => {
    try {
      const response = await gradingApi.calculateScenario(scenarioId);
      return { scenarioId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const applyScenario = createAsyncThunk(
  'grading/applyScenario',
  async (scenarioId, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await gradingApi.applyScenario(scenarioId);
      
      if (response.data.success) {
        // Refresh current data and scenarios
        const { grading } = getState();
        await Promise.all([
          dispatch(fetchCurrentScenario(grading.selectedSystemId)),
          dispatch(fetchCurrentGrades(grading.selectedSystemId)),
          dispatch(fetchScenarios({ gradingSystemId: grading.selectedSystemId, status: 'DRAFT' })),
          dispatch(fetchScenarios({ gradingSystemId: grading.selectedSystemId, status: 'ARCHIVED' }))
        ]);
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const duplicateScenario = createAsyncThunk(
  'grading/duplicateScenario',
  async (scenarioId, { rejectWithValue }) => {
    try {
      const response = await gradingApi.duplicateScenario(scenarioId);
      return gradingApi.formatScenarioFromBackend(response.data.scenario);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteScenario = createAsyncThunk(
  'grading/deleteScenario',
  async (scenarioId, { rejectWithValue }) => {
    try {
      await gradingApi.deleteScenario(scenarioId);
      return scenarioId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Grading systems
  gradingSystems: [],
  selectedSystemId: 1,
  positionGroups: [],
  
  // Current scenario and grades
  currentScenario: null,
  currentGrades: [],
  
  // Scenarios by status
  draftScenarios: [],
  archivedScenarios: [],
  
  // Statistics
  statistics: null,
  
  // Loading states
  loading: {
    systems: false,
    currentScenario: false,
    currentGrades: false,
    draftScenarios: false,
    archivedScenarios: false,
    statistics: false,
    creating: false,
    calculating: false,
    applying: false,
    archiving: false,
    duplicating: false,
    deleting: false
  },
  
  // Error states
  error: {
    systems: null,
    currentScenario: null,
    currentGrades: null,
    draftScenarios: null,
    archivedScenarios: null,
    statistics: null,
    creating: null,
    calculating: null,
    applying: null,
    archiving: null,
    duplicating: null,
    deleting: null
  }
};

const gradingSlice = createSlice({
  name: 'grading',
  initialState,
  reducers: {
    setSelectedSystemId: (state, action) => {
      state.selectedSystemId = action.payload;
    },
    clearErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key] = null;
      });
    },
    clearError: (state, action) => {
      const errorKey = action.payload;
      if (state.error[errorKey]) {
        state.error[errorKey] = null;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch grading systems
    builder
      .addCase(fetchGradingSystems.pending, (state) => {
        state.loading.systems = true;
        state.error.systems = null;
      })
      .addCase(fetchGradingSystems.fulfilled, (state, action) => {
        state.loading.systems = false;
        state.gradingSystems = action.payload.results || action.payload;
      })
      .addCase(fetchGradingSystems.rejected, (state, action) => {
        state.loading.systems = false;
        state.error.systems = action.payload;
      })

    // Fetch grading dropdowns
    builder
      .addCase(fetchGradingDropdowns.fulfilled, (state, action) => {
        state.positionGroups = action.payload.position_groups || [];
      })

    // Fetch current scenario
    builder
      .addCase(fetchCurrentScenario.pending, (state) => {
        state.loading.currentScenario = true;
        state.error.currentScenario = null;
      })
      .addCase(fetchCurrentScenario.fulfilled, (state, action) => {
        state.loading.currentScenario = false;
        state.currentScenario = action.payload ? 
          gradingApi.formatScenarioFromBackend(action.payload) : null;
      })
      .addCase(fetchCurrentScenario.rejected, (state, action) => {
        state.loading.currentScenario = false;
        state.error.currentScenario = action.payload;
      })

    // Fetch current grades
    builder
      .addCase(fetchCurrentGrades.pending, (state) => {
        state.loading.currentGrades = true;
        state.error.currentGrades = null;
      })
      .addCase(fetchCurrentGrades.fulfilled, (state, action) => {
        state.loading.currentGrades = false;
        state.currentGrades = action.payload || [];
      })
      .addCase(fetchCurrentGrades.rejected, (state, action) => {
        state.loading.currentGrades = false;
        state.error.currentGrades = action.payload;
      })

    // Fetch scenarios
    builder
      .addCase(fetchScenarios.pending, (state, action) => {
        const status = action.meta.arg.status;
        if (status === 'DRAFT') {
          state.loading.draftScenarios = true;
          state.error.draftScenarios = null;
        } else if (status === 'ARCHIVED') {
          state.loading.archivedScenarios = true;
          state.error.archivedScenarios = null;
        }
      })
      .addCase(fetchScenarios.fulfilled, (state, action) => {
        const { scenarios, status } = action.payload;
        const formattedScenarios = scenarios.map(s => gradingApi.formatScenarioFromBackend(s));
        
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
          state.error.draftScenarios = action.payload;
        } else if (status === 'ARCHIVED') {
          state.loading.archivedScenarios = false;
          state.error.archivedScenarios = action.payload;
        }
      })

    // Fetch statistics
    builder
      .addCase(fetchScenarioStatistics.pending, (state) => {
        state.loading.statistics = true;
        state.error.statistics = null;
      })
      .addCase(fetchScenarioStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics = action.payload;
      })
      .addCase(fetchScenarioStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.error.statistics = action.payload;
      })

    // Create scenario
    builder
      .addCase(createScenario.pending, (state) => {
        state.loading.creating = true;
        state.error.creating = null;
      })
      .addCase(createScenario.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.draftScenarios.unshift(action.payload);
      })
      .addCase(createScenario.rejected, (state, action) => {
        state.loading.creating = false;
        state.error.creating = action.payload;
      })

    // Calculate scenario
    builder
      .addCase(calculateScenario.pending, (state) => {
        state.loading.calculating = true;
        state.error.calculating = null;
      })
      .addCase(calculateScenario.fulfilled, (state, action) => {
        state.loading.calculating = false;
        const { scenarioId, result } = action.payload;
        
        if (result.success) {
          // Update the scenario in draft scenarios
          const scenarioIndex = state.draftScenarios.findIndex(s => s.id === scenarioId);
          if (scenarioIndex !== -1) {
            state.draftScenarios[scenarioIndex].calculatedGrades = result.calculated_grades;
            state.draftScenarios[scenarioIndex].isCalculated = true;
            state.draftScenarios[scenarioIndex].calculationTimestamp = result.calculation_timestamp;
          }
        }
      })
      .addCase(calculateScenario.rejected, (state, action) => {
        state.loading.calculating = false;
        state.error.calculating = action.payload;
      })

    // Apply scenario
    builder
      .addCase(applyScenario.pending, (state) => {
        state.loading.applying = true;
        state.error.applying = null;
      })
      .addCase(applyScenario.fulfilled, (state, action) => {
        state.loading.applying = false;
        // The thunk handles refreshing the data
      })
      .addCase(applyScenario.rejected, (state, action) => {
        state.loading.applying = false;
        state.error.applying = action.payload;
      })

    // Archive scenario
    builder
      .addCase(archiveScenario.pending, (state) => {
        state.loading.archiving = true;
        state.error.archiving = null;
      })
      .addCase(archiveScenario.fulfilled, (state, action) => {
        state.loading.archiving = false;
        const { scenarioId } = action.payload;
        
        // Move from draft to archived
        const scenarioIndex = state.draftScenarios.findIndex(s => s.id === scenarioId);
        if (scenarioIndex !== -1) {
          const scenario = { ...state.draftScenarios[scenarioIndex], status: 'ARCHIVED' };
          state.draftScenarios.splice(scenarioIndex, 1);
          state.archivedScenarios.unshift(scenario);
        }
      })
      .addCase(archiveScenario.rejected, (state, action) => {
        state.loading.archiving = false;
        state.error.archiving = action.payload;
      })

    // Duplicate scenario
    builder
      .addCase(duplicateScenario.pending, (state) => {
        state.loading.duplicating = true;
        state.error.duplicating = null;
      })
      .addCase(duplicateScenario.fulfilled, (state, action) => {
        state.loading.duplicating = false;
        state.draftScenarios.unshift(action.payload);
      })
      .addCase(duplicateScenario.rejected, (state, action) => {
        state.loading.duplicating = false;
        state.error.duplicating = action.payload;
      })

    // Delete scenario
    builder
      .addCase(deleteScenario.pending, (state) => {
        state.loading.deleting = true;
        state.error.deleting = null;
      })
      .addCase(deleteScenario.fulfilled, (state, action) => {
        state.loading.deleting = false;
        const scenarioId = action.payload;
        
        // Remove from both drafts and archived
        state.draftScenarios = state.draftScenarios.filter(s => s.id !== scenarioId);
        state.archivedScenarios = state.archivedScenarios.filter(s => s.id !== scenarioId);
      })
      .addCase(deleteScenario.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error.deleting = action.payload;
      });
  }
})

export const { setSelectedSystemId, clearErrors, clearError } = gradingSlice.actions;

export default gradingSlice.reducer;

// BASE SELECTORS
export const selectGradingSystems = (state) => state.grading.gradingSystems;
export const selectSelectedSystemId = (state) => state.grading.selectedSystemId;
export const selectPositionGroups = (state) => state.grading.positionGroups;
export const selectCurrentScenario = (state) => state.grading.currentScenario;
export const selectCurrentGrades = (state) => state.grading.currentGrades;
export const selectDraftScenarios = (state) => state.grading.draftScenarios;
export const selectArchivedScenarios = (state) => state.grading.archivedScenarios;
export const selectStatistics = (state) => state.grading.statistics;
export const selectLoading = (state) => state.grading.loading;
export const selectErrors = (state) => state.grading.error;

// MEMOIZED SELECTORS - Hataları çözen kısım
export const selectIsLoading = createSelector(
  [selectLoading],
  (loading) => Object.values(loading).some(isLoading => isLoading)
);

export const selectHasErrors = createSelector(
  [selectErrors],
  (errors) => Object.values(errors).some(error => error !== null)
);

export const selectOrderedPositions = createSelector(
  [selectPositionGroups],
  (positionGroups) => {
    if (!Array.isArray(positionGroups)) return [];
    return [...positionGroups].sort((a, b) => a.hierarchy_level - b.hierarchy_level);
  }
);

export const selectAvailableForComparison = createSelector(
  [selectDraftScenarios, selectCurrentScenario],
  (draftScenarios, currentScenario) => {
    const scenarios = [...draftScenarios];
    if (currentScenario) {
      scenarios.unshift({
        ...currentScenario,
        name: `${currentScenario.name} (Current)`,
        status: 'CURRENT'
      });
    }
    return scenarios;
  }
);

export const selectOperationLoadingStates = createSelector(
  [selectLoading],
  (loading) => ({
    creating: loading.creating,
    calculating: loading.calculating,
    applying: loading.applying,
    archiving: loading.archiving,
    duplicating: loading.duplicating,
    deleting: loading.deleting
  })
);

export const selectOperationErrorStates = createSelector(
  [selectErrors],
  (errors) => ({
    creating: errors.creating,
    calculating: errors.calculating,
    applying: errors.applying,
    archiving: errors.archiving,
    duplicating: errors.duplicating,
    deleting: errors.deleting
  })
);