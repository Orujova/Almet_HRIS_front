// src/store/slices/gradingSlice.js - FIXED: Enhanced data preservation for comparison
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { gradingApi } from '@/services/gradingApi';

// Enhanced async thunks with complete API coverage
export const fetchCurrentStructure = createAsyncThunk(
  'grading/fetchCurrentStructure',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getCurrentStructure();
      console.log('✅ Current structure response:', response.data);
      return gradingApi.formatCurrentStructure(response.data);
    } catch (error) {
      console.error('❌ Error fetching current structure:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchCurrentScenario = createAsyncThunk(
  'grading/fetchCurrentScenario',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getCurrentScenario();
      console.log('✅ Current scenario response:', response.data);
      return gradingApi.formatScenarioForFrontend(response.data);
    } catch (error) {
      console.error('❌ Error fetching current scenario:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchScenarios = createAsyncThunk(
  'grading/fetchScenarios',
  async ({ status }, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getScenarios({ status });
      console.log(`✅ ${status} scenarios response:`, response.data);
      
      const scenarios = response.data.results || response.data || [];
      const formattedScenarios = scenarios
        .filter(scenario => scenario && scenario.id) // Filter out invalid scenarios
        .map(scenario => {
          const formatted = gradingApi.formatScenarioForFrontend(scenario);
          console.log(`📊 Formatted scenario ${formatted?.name}:`, {
            hasInputRates: !!(formatted?.input_rates && Object.keys(formatted.input_rates).length > 0),
            hasPositionVerticalInputs: !!(formatted?.data?.positionVerticalInputs && Object.keys(formatted.data.positionVerticalInputs).length > 0),
            hasGlobalHorizontalIntervals: !!(formatted?.data?.globalHorizontalIntervals && Object.values(formatted.data.globalHorizontalIntervals).some(v => v > 0))
          });
          return formatted;
        });
      
      return { 
        scenarios: formattedScenarios,
        status: status
      };
    } catch (error) {
      console.error(`❌ Error fetching ${status} scenarios:`, error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchScenarioDetails = createAsyncThunk(
  'grading/fetchScenarioDetails',
  async (scenarioId, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getScenario(scenarioId);
      console.log('✅ Scenario details response:', response.data);
      const formatted = gradingApi.formatScenarioForFrontend(response.data);
      
      // FIXED: Log detailed input data preservation
      console.log(`🔍 Formatted scenario details for ${formatted?.name}:`, {
        hasInputRates: !!(formatted?.input_rates && Object.keys(formatted.input_rates).length > 0),
        hasPositionVerticalInputs: !!(formatted?.data?.positionVerticalInputs && Object.keys(formatted.data.positionVerticalInputs).length > 0),
        inputRatesKeys: formatted?.input_rates ? Object.keys(formatted.input_rates) : [],
        positionVerticalInputsKeys: formatted?.data?.positionVerticalInputs ? Object.keys(formatted.data.positionVerticalInputs) : [],
        sampleVerticalInput: formatted?.input_rates ? Object.values(formatted.input_rates)[0]?.vertical : 'N/A'
      });
      
      return formatted;
    } catch (error) {
      console.error('❌ Error fetching scenario details:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPositionGroups = createAsyncThunk(
  'grading/fetchPositionGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingApi.getPositionGroups();
      console.log('✅ Position groups response:', response.data);
      return response.data.position_groups || [];
    } catch (error) {
      console.error('❌ Error fetching position groups:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const calculateDynamicScenario = createAsyncThunk(
  'grading/calculateDynamicScenario',
  async (scenarioData, { rejectWithValue }) => {
    try {
      console.log('🧮 Starting dynamic calculation with:', scenarioData);
      const response = await gradingApi.calculateDynamic(scenarioData);
      console.log('✅ Calculation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Calculation error:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const saveDraftScenario = createAsyncThunk(
  'grading/saveDraftScenario',
  async (scenarioData, { rejectWithValue, dispatch }) => {
    try {
      console.log('💾 Saving draft scenario:', scenarioData);
      const response = await gradingApi.saveDraft(scenarioData);
      console.log('✅ Save response:', response.data);
      
      if (response.data.success) {
        // Refresh draft scenarios after successful save
        dispatch(fetchScenarios({ status: 'DRAFT' }));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Save error:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const applyScenario = createAsyncThunk(
  'grading/applyScenario',
  async (scenarioId, { rejectWithValue, dispatch }) => {
    try {
      console.log('🎯 Applying scenario:', scenarioId);
      const response = await gradingApi.applyScenario(scenarioId);
      console.log('✅ Apply response:', response.data);
      
      if (response.data.success) {
        // Refresh all data after successful application
        await Promise.all([
          dispatch(fetchCurrentStructure()),
          dispatch(fetchCurrentScenario()),
          dispatch(fetchScenarios({ status: 'DRAFT' })),
          dispatch(fetchScenarios({ status: 'ARCHIVED' }))
        ]);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Apply error:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const archiveScenario = createAsyncThunk(
  'grading/archiveScenario',
  async (scenarioId, { rejectWithValue, dispatch }) => {
    try {
      console.log('📦 Archiving scenario:', scenarioId);
      const response = await gradingApi.archiveScenario(scenarioId);
      console.log('✅ Archive response:', response.data);
      
      if (response.data.success) {
        // Refresh scenarios after successful archive
        await Promise.all([
          dispatch(fetchScenarios({ status: 'DRAFT' })),
          dispatch(fetchScenarios({ status: 'ARCHIVED' }))
        ]);
      }
      
      return { scenarioId, result: response.data };
    } catch (error) {
      console.error('❌ Archive error:', error);
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Enhanced initial state with all necessary data
const initialState = {
  // Core data
  currentStructure: null,
  currentScenario: null,
  positionGroups: [],
  
  // Scenario inputs with proper defaults
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
  
  // Selected scenario for details
  selectedScenario: null,
  
  // Loading states for all operations
  loading: {
    currentStructure: false,
    currentScenario: false,
    positionGroups: false,
    draftScenarios: false,
    archivedScenarios: false,
    scenarioDetails: false,
    calculating: false,
    saving: false,
    applying: false,
    archiving: false
  },
  
  // Enhanced error handling
  errors: {},
  
  // UI state
  isInitialized: false
};

const gradingSlice = createSlice({
  name: 'grading',
  initialState,
  reducers: {
    // Enhanced input handlers
    setScenarioInputs: (state, action) => {
      state.scenarioInputs = { ...state.scenarioInputs, ...action.payload };
      console.log('📝 Updated scenario inputs:', state.scenarioInputs);
    },
    
    updateScenarioInput: (state, action) => {
      const { field, value } = action.payload;
      state.scenarioInputs[field] = value;
      console.log(`📝 Updated ${field}:`, value);
    },
    
    updateGradeInput: (state, action) => {
      const { gradeName, field, value } = action.payload;
      if (!state.scenarioInputs.grades[gradeName]) {
        state.scenarioInputs.grades[gradeName] = {};
      }
      state.scenarioInputs.grades[gradeName][field] = value;
      console.log(`📝 Updated ${gradeName}.${field}:`, value);
    },
    
    updateGlobalHorizontalInterval: (state, action) => {
      const { intervalKey, value } = action.payload;
      state.scenarioInputs.globalHorizontalIntervals[intervalKey] = value;
      console.log(`📝 Updated global interval ${intervalKey}:`, value);
    },
    
    setCalculatedOutputs: (state, action) => {
      state.calculatedOutputs = action.payload;
      console.log('🧮 Updated calculated outputs:', action.payload);
    },
    
    setSelectedScenario: (state, action) => {
      state.selectedScenario = action.payload;
      console.log('🎯 Selected scenario:', action.payload?.name);
      
      // FIXED: Log input data availability for debugging
      if (action.payload) {
        console.log('🔍 Selected scenario input data:', {
          hasInputRates: !!(action.payload.input_rates && Object.keys(action.payload.input_rates).length > 0),
          hasPositionVerticalInputs: !!(action.payload.data?.positionVerticalInputs && Object.keys(action.payload.data.positionVerticalInputs).length > 0),
          hasGlobalHorizontalIntervals: !!(action.payload.data?.globalHorizontalIntervals && Object.values(action.payload.data.globalHorizontalIntervals).some(v => v > 0))
        });
      }
    },
    
    clearErrors: (state) => {
      state.errors = {};
    },
    
    setError: (state, action) => {
      const { field, message } = action.payload;
      state.errors[field] = message;
    },
    
    // Initialize scenario inputs from current data
    initializeScenarioInputs: (state, action) => {
      const currentData = action.payload;
      if (currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0) {
        const initialGrades = {};
        currentData.gradeOrder.forEach((gradeName, index) => {
          const isBasePosition = index === (currentData.gradeOrder.length - 1);
          initialGrades[gradeName] = { 
            vertical: isBasePosition ? null : ''
          };
        });
        
        state.scenarioInputs = {
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
        
        // Initialize calculated outputs
        const initialOutputs = {};
        currentData.gradeOrder.forEach((gradeName) => {
          initialOutputs[gradeName] = { 
            LD: "", LQ: "", M: "", UQ: "", UD: "" 
          };
        });
        state.calculatedOutputs = initialOutputs;
        
        console.log('🚀 Initialized scenario inputs for', currentData.gradeOrder.length, 'positions');
      }
    }
  },
  
  extraReducers: (builder) => {
    // Current Structure
    builder
      .addCase(fetchCurrentStructure.pending, (state) => {
        state.loading.currentStructure = true;
        delete state.errors.currentStructure;
      })
      .addCase(fetchCurrentStructure.fulfilled, (state, action) => {
        state.loading.currentStructure = false;
        state.currentStructure = action.payload;
        console.log('✅ Current structure loaded:', action.payload);
      })
      .addCase(fetchCurrentStructure.rejected, (state, action) => {
        state.loading.currentStructure = false;
        state.errors.currentStructure = action.payload;
      });

    // Current Scenario
    builder
      .addCase(fetchCurrentScenario.pending, (state) => {
        state.loading.currentScenario = true;
        delete state.errors.currentScenario;
      })
      .addCase(fetchCurrentScenario.fulfilled, (state, action) => {
        state.loading.currentScenario = false;
        state.currentScenario = action.payload;
        console.log('✅ Current scenario loaded:', action.payload?.name);
      })
      .addCase(fetchCurrentScenario.rejected, (state, action) => {
        state.loading.currentScenario = false;
        state.errors.currentScenario = action.payload;
      });

    // Position Groups
    builder
      .addCase(fetchPositionGroups.pending, (state) => {
        state.loading.positionGroups = true;
        delete state.errors.positionGroups;
      })
      .addCase(fetchPositionGroups.fulfilled, (state, action) => {
        state.loading.positionGroups = false;
        state.positionGroups = action.payload;
        console.log('✅ Position groups loaded:', action.payload.length, 'groups');
      })
      .addCase(fetchPositionGroups.rejected, (state, action) => {
        state.loading.positionGroups = false;
        state.errors.positionGroups = action.payload;
      });

    // Calculate Dynamic Scenario
    builder
      .addCase(calculateDynamicScenario.pending, (state) => {
        state.loading.calculating = true;
        delete state.errors.calculating;
      })
      .addCase(calculateDynamicScenario.fulfilled, (state, action) => {
        state.loading.calculating = false;
        if (action.payload?.calculatedOutputs) {
          state.calculatedOutputs = action.payload.calculatedOutputs;
          console.log('✅ Calculation completed with', Object.keys(action.payload.calculatedOutputs).length, 'grades');
        }
      })
      .addCase(calculateDynamicScenario.rejected, (state, action) => {
        state.loading.calculating = false;
        state.errors.calculating = action.payload;
      });

    // Fetch Scenarios - FIXED: Enhanced logging for input data preservation
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
        
        if (status === 'DRAFT') {
          state.loading.draftScenarios = false;
          state.draftScenarios = scenarios;
          console.log('✅ Draft scenarios loaded:', scenarios.length, 'scenarios');
          
          // FIXED: Log input data availability for debugging
          scenarios.forEach(scenario => {
            if (scenario.input_rates || scenario.data?.positionVerticalInputs) {
              console.log(`📊 Draft scenario ${scenario.name} input data:`, {
                hasInputRates: !!(scenario.input_rates && Object.keys(scenario.input_rates).length > 0),
                hasPositionVerticalInputs: !!(scenario.data?.positionVerticalInputs && Object.keys(scenario.data.positionVerticalInputs).length > 0),
                inputRatesCount: scenario.input_rates ? Object.keys(scenario.input_rates).length : 0,
                positionVerticalInputsCount: scenario.data?.positionVerticalInputs ? Object.keys(scenario.data.positionVerticalInputs).length : 0
              });
            }
          });
          
        } else if (status === 'ARCHIVED') {
          state.loading.archivedScenarios = false;
          state.archivedScenarios = scenarios;
          console.log('✅ Archived scenarios loaded:', scenarios.length, 'scenarios');
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
      });

    // Fetch Scenario Details - FIXED: Enhanced logging for input data
    builder
      .addCase(fetchScenarioDetails.pending, (state) => {
        state.loading.scenarioDetails = true;
        delete state.errors.scenarioDetails;
      })
      .addCase(fetchScenarioDetails.fulfilled, (state, action) => {
        state.loading.scenarioDetails = false;
        state.selectedScenario = action.payload;
        
        console.log('✅ Scenario details loaded:', action.payload?.name);
        
        // FIXED: Enhanced logging for input data verification
        if (action.payload) {
          console.log('🔍 Scenario details input data verification:', {
            hasInputRates: !!(action.payload.input_rates && Object.keys(action.payload.input_rates).length > 0),
            hasPositionVerticalInputs: !!(action.payload.data?.positionVerticalInputs && Object.keys(action.payload.data.positionVerticalInputs).length > 0),
            hasGlobalHorizontalIntervals: !!(action.payload.data?.globalHorizontalIntervals && Object.values(action.payload.data.globalHorizontalIntervals).some(v => v > 0)),
            inputRatesKeys: action.payload.input_rates ? Object.keys(action.payload.input_rates) : [],
            positionVerticalInputsKeys: action.payload.data?.positionVerticalInputs ? Object.keys(action.payload.data.positionVerticalInputs) : [],
            globalHorizontalIntervalsValues: action.payload.data?.globalHorizontalIntervals || {}
          });
        }
      })
      .addCase(fetchScenarioDetails.rejected, (state, action) => {
        state.loading.scenarioDetails = false;
        state.errors.scenarioDetails = action.payload;
      });

    // Save Draft Scenario
    builder
      .addCase(saveDraftScenario.pending, (state) => {
        state.loading.saving = true;
        delete state.errors.saving;
      })
      .addCase(saveDraftScenario.fulfilled, (state, action) => {
        state.loading.saving = false;
        console.log('✅ Scenario saved successfully');
      })
      .addCase(saveDraftScenario.rejected, (state, action) => {
        state.loading.saving = false;
        state.errors.saving = action.payload;
      });

    // Apply Scenario
    builder
      .addCase(applyScenario.pending, (state) => {
        state.loading.applying = true;
        delete state.errors.applying;
      })
      .addCase(applyScenario.fulfilled, (state, action) => {
        state.loading.applying = false;
        console.log('✅ Scenario applied successfully');
      })
      .addCase(applyScenario.rejected, (state, action) => {
        state.loading.applying = false;
        state.errors.applying = action.payload;
      });

    // Archive Scenario
    builder
      .addCase(archiveScenario.pending, (state) => {
        state.loading.archiving = true;
        delete state.errors.archiving;
      })
      .addCase(archiveScenario.fulfilled, (state, action) => {
        state.loading.archiving = false;
        console.log('✅ Scenario archived successfully');
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
  updateGlobalHorizontalInterval,
  setCalculatedOutputs,
  setSelectedScenario,
  clearErrors,
  setError,
  initializeScenarioInputs
} = gradingSlice.actions;

export default gradingSlice.reducer;

// Enhanced selectors
export const selectCurrentStructure = (state) => state.grading.currentStructure;
export const selectCurrentScenario = (state) => state.grading.currentScenario;
export const selectPositionGroups = (state) => state.grading.positionGroups;
export const selectScenarioInputs = (state) => state.grading.scenarioInputs;
export const selectCalculatedOutputs = (state) => state.grading.calculatedOutputs;
export const selectDraftScenarios = (state) => state.grading.draftScenarios;
export const selectArchivedScenarios = (state) => state.grading.archivedScenarios;
export const selectSelectedScenario = (state) => state.grading.selectedScenario;
export const selectLoading = (state) => state.grading.loading;
export const selectErrors = (state) => state.grading.errors;

// Enhanced computed selectors
export const selectIsLoading = createSelector(
  [selectLoading],
  (loading) => Object.values(loading).some(Boolean)
);

export const selectHasErrors = createSelector(
  [selectErrors],
  (errors) => Object.keys(errors).length > 0
);

export const selectBestDraftScenario = createSelector(
  [selectDraftScenarios],
  (draftScenarios) => {
    if (draftScenarios.length === 0) return null;
    
    // Enhanced scoring algorithm
    const getBalanceScore = (scenario) => {
      const data = scenario.data || {};
      const verticalAvg = data.verticalAvg || 0;
      const horizontalAvg = data.horizontalAvg || 0;
      const baseValue = data.baseValue1 || 0;
      
      // Penalize scenarios with zero base value
      if (baseValue <= 0) return 0;
      
      // Balance score based on averages
      const avgDifference = Math.abs(verticalAvg - horizontalAvg);
      const avgSum = verticalAvg + horizontalAvg;
      
      // Higher score for balanced scenarios with meaningful values
      return avgSum / (1 + avgDifference * 2);
    };

    return draftScenarios.reduce((best, scenario) => {
      return getBalanceScore(scenario) > getBalanceScore(best) ? scenario : best;
    }, draftScenarios[0]);
  }
);

export const selectValidationSummary = createSelector(
  [selectScenarioInputs, selectCalculatedOutputs, selectErrors],
  (scenarioInputs, calculatedOutputs, errors) => {
    const hasBaseValue = !!(scenarioInputs.baseValue1 && parseFloat(scenarioInputs.baseValue1) > 0);
    
    const hasVerticalInputs = Object.values(scenarioInputs.grades || {}).some(grade => 
      grade.vertical !== null && grade.vertical !== '' && grade.vertical !== undefined && grade.vertical !== 0
    );
    
    const hasHorizontalInputs = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
      interval !== '' && interval !== null && interval !== undefined && interval !== 0
    );
    
    const hasCalculatedOutputs = Object.values(calculatedOutputs || {}).some(grade => 
      grade && Object.values(grade).some(value => value && value !== "")
    );
    
    const hasErrors = Object.keys(errors).some(key => errors[key]);
    
    const canSave = hasBaseValue && hasCalculatedOutputs && (hasVerticalInputs || hasHorizontalInputs) && !hasErrors;
    
    return {
      hasBaseValue,
      hasVerticalInputs,
      hasHorizontalInputs,
      hasCalculatedOutputs,
      hasErrors,
      canSave
    };
  }
);

export const selectInputSummary = createSelector(
  [selectScenarioInputs],
  (scenarioInputs) => {
    if (!scenarioInputs.gradeOrder || scenarioInputs.gradeOrder.length === 0) {
      return null;
    }

    const totalPositions = scenarioInputs.gradeOrder.length;
    const basePosition = scenarioInputs.gradeOrder[totalPositions - 1];
    const verticalInputsNeeded = totalPositions - 1; // All except base position

    const hasGlobalIntervals = Object.values(scenarioInputs.globalHorizontalIntervals || {}).some(interval => 
      interval !== '' && interval !== null && interval !== undefined && interval !== 0
    );

    return {
      totalPositions,
      basePosition,
      verticalInputsNeeded,
      horizontalIntervals: ['LD→LQ', 'LQ→M', 'M→UQ', 'UQ→UD'],
      hasGlobalIntervals
    };
  }
);