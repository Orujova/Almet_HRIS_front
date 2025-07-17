// src/store/slices/referenceDataSlice.js - COMPLETE Reference Data Management
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { referenceDataAPI } from '../api/referenceDataAPI';

// ========================================
// ASYNC THUNKS - FETCH OPERATIONS
// ========================================

export const fetchBusinessFunctions = createAsyncThunk(
  'referenceData/fetchBusinessFunctions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getBusinessFunctionDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'referenceData/fetchDepartments',
  async (businessFunctionId, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getDepartmentDropdown(businessFunctionId);
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchUnits = createAsyncThunk(
  'referenceData/fetchUnits',
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getUnitDropdown(departmentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchJobFunctions = createAsyncThunk(
  'referenceData/fetchJobFunctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getJobFunctionDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPositionGroups = createAsyncThunk(
  'referenceData/fetchPositionGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getPositionGroupDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEmployeeStatuses = createAsyncThunk(
  'referenceData/fetchEmployeeStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getEmployeeStatusDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEmployeeTags = createAsyncThunk(
  'referenceData/fetchEmployeeTags',
  async (tagType, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getEmployeeTagDropdown(tagType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPositionGroupGradingLevels = createAsyncThunk(
  'referenceData/fetchPositionGroupGradingLevels',
  async (positionGroupId, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getPositionGroupGradingLevels(positionGroupId);
      return { positionGroupId, levels: response.data.levels || [] };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchContractConfigs = createAsyncThunk(
  'referenceData/fetchContractConfigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await referenceDataAPI.getContractConfigDropdown();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - BUSINESS FUNCTIONS CRUD
// ========================================

export const createBusinessFunction = createAsyncThunk(
  'referenceData/createBusinessFunction',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createBusinessFunction(data);
      // Refresh the list after creation
      dispatch(fetchBusinessFunctions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateBusinessFunction = createAsyncThunk(
  'referenceData/updateBusinessFunction',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateBusinessFunction(id, data);
      // Refresh the list after update
      dispatch(fetchBusinessFunctions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteBusinessFunction = createAsyncThunk(
  'referenceData/deleteBusinessFunction',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteBusinessFunction(id);
      // Refresh the list after deletion
      dispatch(fetchBusinessFunctions());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - DEPARTMENTS CRUD
// ========================================

export const createDepartment = createAsyncThunk(
  'referenceData/createDepartment',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createDepartment(data);
      // Refresh departments for the business function
      if (data.business_function) {
        dispatch(fetchDepartments(data.business_function));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'referenceData/updateDepartment',
  async ({ id, data }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await referenceDataAPI.updateDepartment(id, data);
      // Refresh departments for the current business function
      const state = getState();
      const currentDepartment = state.referenceData.departments.find(d => d.id === id || d.value === id);
      if (currentDepartment) {
        dispatch(fetchDepartments(currentDepartment.business_function));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'referenceData/deleteDepartment',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState();
      const department = state.referenceData.departments.find(d => d.id === id || d.value === id);
      await referenceDataAPI.deleteDepartment(id);
      // Refresh departments for the business function
      if (department) {
        dispatch(fetchDepartments(department.business_function));
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - UNITS CRUD
// ========================================

export const createUnit = createAsyncThunk(
  'referenceData/createUnit',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createUnit(data);
      // Refresh units for the department
      if (data.department) {
        dispatch(fetchUnits(data.department));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUnit = createAsyncThunk(
  'referenceData/updateUnit',
  async ({ id, data }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await referenceDataAPI.updateUnit(id, data);
      // Refresh units for the current department
      const state = getState();
      const currentUnit = state.referenceData.units.find(u => u.id === id || u.value === id);
      if (currentUnit) {
        dispatch(fetchUnits(currentUnit.department));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteUnit = createAsyncThunk(
  'referenceData/deleteUnit',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState();
      const unit = state.referenceData.units.find(u => u.id === id || u.value === id);
      await referenceDataAPI.deleteUnit(id);
      // Refresh units for the department
      if (unit) {
        dispatch(fetchUnits(unit.department));
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - JOB FUNCTIONS CRUD
// ========================================

export const createJobFunction = createAsyncThunk(
  'referenceData/createJobFunction',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createJobFunction(data);
      dispatch(fetchJobFunctions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateJobFunction = createAsyncThunk(
  'referenceData/updateJobFunction',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateJobFunction(id, data);
      dispatch(fetchJobFunctions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteJobFunction = createAsyncThunk(
  'referenceData/deleteJobFunction',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteJobFunction(id);
      dispatch(fetchJobFunctions());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - POSITION GROUPS CRUD
// ========================================

export const createPositionGroup = createAsyncThunk(
  'referenceData/createPositionGroup',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createPositionGroup(data);
      dispatch(fetchPositionGroups());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePositionGroup = createAsyncThunk(
  'referenceData/updatePositionGroup',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updatePositionGroup(id, data);
      dispatch(fetchPositionGroups());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePositionGroup = createAsyncThunk(
  'referenceData/deletePositionGroup',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deletePositionGroup(id);
      dispatch(fetchPositionGroups());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - EMPLOYEE STATUSES CRUD
// ========================================

export const createEmployeeStatus = createAsyncThunk(
  'referenceData/createEmployeeStatus',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createEmployeeStatus(data);
      dispatch(fetchEmployeeStatuses());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateEmployeeStatus = createAsyncThunk(
  'referenceData/updateEmployeeStatus',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateEmployeeStatus(id, data);
      dispatch(fetchEmployeeStatuses());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEmployeeStatus = createAsyncThunk(
  'referenceData/deleteEmployeeStatus',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteEmployeeStatus(id);
      dispatch(fetchEmployeeStatuses());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - EMPLOYEE TAGS CRUD
// ========================================

export const createEmployeeTag = createAsyncThunk(
  'referenceData/createEmployeeTag',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createEmployeeTag(data);
      dispatch(fetchEmployeeTags(data.tag_type));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateEmployeeTag = createAsyncThunk(
  'referenceData/updateEmployeeTag',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateEmployeeTag(id, data);
      dispatch(fetchEmployeeTags(data.tag_type));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEmployeeTag = createAsyncThunk(
  'referenceData/deleteEmployeeTag',
  async ({ id, tagType }, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteEmployeeTag(id);
      dispatch(fetchEmployeeTags(tagType));
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// ASYNC THUNKS - CONTRACT CONFIGS CRUD
// ========================================

export const createContractConfig = createAsyncThunk(
  'referenceData/createContractConfig',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.createContractConfig(data);
      dispatch(fetchContractConfigs());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateContractConfig = createAsyncThunk(
  'referenceData/updateContractConfig',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await referenceDataAPI.updateContractConfig(id, data);
      dispatch(fetchContractConfigs());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteContractConfig = createAsyncThunk(
  'referenceData/deleteContractConfig',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await referenceDataAPI.deleteContractConfig(id);
      dispatch(fetchContractConfigs());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // ========================================
  // MAIN DATA COLLECTIONS
  // ========================================
  businessFunctions: [],
  departments: [],
  units: [],
  jobFunctions: [],
  positionGroups: [],
  employeeStatuses: [],
  employeeTags: [],
  contractConfigs: [],
  
  // ========================================
  // GRADING LEVELS BY POSITION GROUP
  // ========================================
  gradingLevels: {}, // { positionGroupId: [levels] }
  
  // ========================================
  // HIERARCHICAL SELECTION STATE
  // ========================================
  selectedBusinessFunction: null,
  selectedDepartment: null,
  
  // ========================================
  // LOADING STATES
  // ========================================
  loading: {
    businessFunctions: false,
    departments: false,
    units: false,
    jobFunctions: false,
    positionGroups: false,
    employeeStatuses: false,
    employeeTags: false,
    contractConfigs: false,
    gradingLevels: false,
    
    // CRUD operation loading states
    creating: false,
    updating: false,
    deleting: false,
  },
  
  // ========================================
  // ERROR STATES
  // ========================================
  error: {
    businessFunctions: null,
    departments: null,
    units: null,
    jobFunctions: null,
    positionGroups: null,
    employeeStatuses: null,
    employeeTags: null,
    contractConfigs: null,
    gradingLevels: null,
    
    // CRUD operation error states
    create: null,
    update: null,
    delete: null,
  },
  
  // ========================================
  // CACHE MANAGEMENT
  // ========================================
  lastUpdated: {
    businessFunctions: null,
    departments: null,
    units: null,
    jobFunctions: null,
    positionGroups: null,
    employeeStatuses: null,
    employeeTags: null,
    contractConfigs: null,
  },
  
  // Cache expiry time in milliseconds (5 minutes)
  cacheExpiry: 5 * 60 * 1000,
  
  // ========================================
  // METADATA AND STATISTICS
  // ========================================
  entityCounts: {
    businessFunctions: 0,
    departments: 0,
    units: 0,
    jobFunctions: 0,
    positionGroups: 0,
    employeeStatuses: 0,
    employeeTags: 0,
    contractConfigs: 0,
  },
  
  // ========================================
  // UI STATE
  // ========================================
  ui: {
    showInactive: false,
    filterText: '',
    sortBy: 'name',
    sortDirection: 'asc',
    selectedEntityType: 'businessFunctions',
    isManagementMode: false,
  }
};

// ========================================
// SLICE DEFINITION
// ========================================

const referenceDataSlice = createSlice({
  name: 'referenceData',
  initialState,
  reducers: {
    // ========================================
    // HIERARCHICAL DATA MANAGEMENT
    // ========================================
    clearDepartments: (state) => {
      state.departments = [];
      state.selectedDepartment = null;
      state.lastUpdated.departments = null;
      state.entityCounts.departments = 0;
    },
    
    clearUnits: (state) => {
      state.units = [];
      state.lastUpdated.units = null;
      state.entityCounts.units = 0;
    },
    
    clearHierarchicalData: (state) => {
      state.departments = [];
      state.units = [];
      state.selectedBusinessFunction = null;
      state.selectedDepartment = null;
      state.lastUpdated.departments = null;
      state.lastUpdated.units = null;
      state.entityCounts.departments = 0;
      state.entityCounts.units = 0;
    },
    
    // ========================================
    // HIERARCHICAL SELECTION MANAGEMENT
    // ========================================
    setSelectedBusinessFunction: (state, action) => {
      state.selectedBusinessFunction = action.payload;
      // Clear dependent data when business function changes
      if (!action.payload) {
        state.departments = [];
        state.units = [];
        state.selectedDepartment = null;
        state.entityCounts.departments = 0;
        state.entityCounts.units = 0;
      }
    },
    
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
      // Clear units when department changes
      if (!action.payload) {
        state.units = [];
        state.entityCounts.units = 0;
      }
    },
    
    // ========================================
    // ERROR MANAGEMENT
    // ========================================
    clearErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key] = null;
      });
    },
    
    clearError: (state, action) => {
      const errorKey = action.payload;
      if (state.error[errorKey] !== undefined) {
        state.error[errorKey] = null;
      }
    },
    
    setError: (state, action) => {
      const { key, message } = action.payload;
      state.error[key] = message;
    },
    
    // ========================================
    // CACHE MANAGEMENT
    // ========================================
    invalidateCache: (state, action) => {
      const dataType = action.payload;
      if (dataType && state.lastUpdated[dataType]) {
        state.lastUpdated[dataType] = null;
      } else {
        // Clear all cache
        Object.keys(state.lastUpdated).forEach(key => {
          state.lastUpdated[key] = null;
        });
      }
    },
    
    updateCacheTimestamp: (state, action) => {
      const { dataType, timestamp } = action.payload;
      state.lastUpdated[dataType] = timestamp || Date.now();
    },
    
    // ========================================
    // DATA RESET
    // ========================================
    resetReferenceData: (state) => {
      return {
        ...initialState,
        ui: state.ui, // Preserve UI state
      };
    },
    
    resetEntityData: (state, action) => {
      const entityType = action.payload;
      if (state[entityType]) {
        state[entityType] = [];
        state.lastUpdated[entityType] = null;
        state.entityCounts[entityType] = 0;
        state.error[entityType] = null;
      }
    },
    
    // ========================================
    // OPTIMISTIC UPDATES
    // ========================================
    optimisticAddItem: (state, action) => {
      const { type, item } = action.payload;
      if (state[type] && Array.isArray(state[type])) {
        const newItem = { 
          ...item, 
          id: `temp_${Date.now()}`, 
          _isOptimistic: true,
          is_active: true
        };
        state[type].unshift(newItem);
        state.entityCounts[type] = (state.entityCounts[type] || 0) + 1;
      }
    },
    
    optimisticUpdateItem: (state, action) => {
      const { type, id, updates } = action.payload;
      if (state[type] && Array.isArray(state[type])) {
        const index = state[type].findIndex(item => 
          (item.id || item.value) === id
        );
        if (index !== -1) {
          state[type][index] = { 
            ...state[type][index], 
            ...updates, 
            _isOptimistic: true 
          };
        }
      }
    },
    
    optimisticRemoveItem: (state, action) => {
      const { type, id } = action.payload;
      if (state[type] && Array.isArray(state[type])) {
        const initialLength = state[type].length;
        state[type] = state[type].filter(item => 
          (item.id || item.value) !== id
        );
        if (state[type].length < initialLength) {
          state.entityCounts[type] = Math.max(0, (state.entityCounts[type] || 0) - 1);
        }
      }
    },
    
    // Remove optimistic flags after successful API call
    removeOptimisticFlags: (state, action) => {
      const entityType = action.payload;
      if (state[entityType] && Array.isArray(state[entityType])) {
        state[entityType].forEach(item => {
          if (item._isOptimistic) {
            delete item._isOptimistic;
          }
        });
      }
    },
    
    // ========================================
    // UI STATE MANAGEMENT
    // ========================================
    setShowInactive: (state, action) => {
      state.ui.showInactive = action.payload;
    },
    
    setFilterText: (state, action) => {
      state.ui.filterText = action.payload;
    },
    
    setSorting: (state, action) => {
      const { sortBy, sortDirection } = action.payload;
      state.ui.sortBy = sortBy;
      state.ui.sortDirection = sortDirection;
    },
    
    setSelectedEntityType: (state, action) => {
      state.ui.selectedEntityType = action.payload;
    },
    
    setManagementMode: (state, action) => {
      state.ui.isManagementMode = action.payload;
    },
    
    // ========================================
    // BULK OPERATIONS
    // ========================================
    bulkUpdateActiveStatus: (state, action) => {
      const { entityType, ids, isActive } = action.payload;
      if (state[entityType] && Array.isArray(state[entityType])) {
        state[entityType].forEach(item => {
          if (ids.includes(item.id || item.value)) {
            item.is_active = isActive;
            item._isOptimistic = true;
          }
        });
      }
    },
    
    bulkDeleteItems: (state, action) => {
      const { entityType, ids } = action.payload;
      if (state[entityType] && Array.isArray(state[entityType])) {
        const initialLength = state[entityType].length;
        state[entityType] = state[entityType].filter(item => 
          !ids.includes(item.id || item.value)
        );
        const deletedCount = initialLength - state[entityType].length;
        state.entityCounts[entityType] = Math.max(0, (state.entityCounts[entityType] || 0) - deletedCount);
      }
    },
    
    // ========================================
    // STATISTICS UPDATES
    // ========================================
    updateEntityCounts: (state, action) => {
      const counts = action.payload;
      state.entityCounts = { ...state.entityCounts, ...counts };
    },
    
    incrementEntityCount: (state, action) => {
      const entityType = action.payload;
      state.entityCounts[entityType] = (state.entityCounts[entityType] || 0) + 1;
    },
    
    decrementEntityCount: (state, action) => {
      const entityType = action.payload;
      state.entityCounts[entityType] = Math.max(0, (state.entityCounts[entityType] || 0) - 1);
    },
  },
  
  // ========================================
  // EXTRA REDUCERS
  // ========================================
  extraReducers: (builder) => {
    // ========================================
    // BUSINESS FUNCTIONS
    // ========================================
    builder
      .addCase(fetchBusinessFunctions.pending, (state) => {
        state.loading.businessFunctions = true;
        state.error.businessFunctions = null;
      })
      .addCase(fetchBusinessFunctions.fulfilled, (state, action) => {
        state.loading.businessFunctions = false;
        state.businessFunctions = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.businessFunctions = Date.now();
        state.entityCounts.businessFunctions = state.businessFunctions.length;
        // Remove optimistic flags
        state.businessFunctions.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchBusinessFunctions.rejected, (state, action) => {
        state.loading.businessFunctions = false;
        state.error.businessFunctions = action.payload;
      });

    // ========================================
    // DEPARTMENTS
    // ========================================
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading.departments = true;
        state.error.departments = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading.departments = false;
        state.departments = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.departments = Date.now();
        state.entityCounts.departments = state.departments.length;
        // Remove optimistic flags
        state.departments.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading.departments = false;
        state.error.departments = action.payload;
      });

    // ========================================
    // UNITS
    // ========================================
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading.units = true;
        state.error.units = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading.units = false;
        state.units = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.units = Date.now();
        state.entityCounts.units = state.units.length;
        // Remove optimistic flags
        state.units.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading.units = false;
        state.error.units = action.payload;
      });

    // ========================================
    // JOB FUNCTIONS
    // ========================================
    builder
      .addCase(fetchJobFunctions.pending, (state) => {
        state.loading.jobFunctions = true;
        state.error.jobFunctions = null;
      })
      .addCase(fetchJobFunctions.fulfilled, (state, action) => {
        state.loading.jobFunctions = false;
        state.jobFunctions = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.jobFunctions = Date.now();
        state.entityCounts.jobFunctions = state.jobFunctions.length;
        // Remove optimistic flags
        state.jobFunctions.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchJobFunctions.rejected, (state, action) => {
        state.loading.jobFunctions = false;
        state.error.jobFunctions = action.payload;
      });

    // ========================================
    // POSITION GROUPS
    // ========================================
    builder
      .addCase(fetchPositionGroups.pending, (state) => {
        state.loading.positionGroups = true;
        state.error.positionGroups = null;
      })
      .addCase(fetchPositionGroups.fulfilled, (state, action) => {
        state.loading.positionGroups = false;
        state.positionGroups = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.positionGroups = Date.now();
        state.entityCounts.positionGroups = state.positionGroups.length;
        // Remove optimistic flags
        state.positionGroups.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchPositionGroups.rejected, (state, action) => {
        state.loading.positionGroups = false;
        state.error.positionGroups = action.payload;
      });

    // ========================================
    // EMPLOYEE STATUSES
    // ========================================
    builder
      .addCase(fetchEmployeeStatuses.pending, (state) => {
        state.loading.employeeStatuses = true;
        state.error.employeeStatuses = null;
      })
      .addCase(fetchEmployeeStatuses.fulfilled, (state, action) => {
        state.loading.employeeStatuses = false;
        state.employeeStatuses = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.employeeStatuses = Date.now();
        state.entityCounts.employeeStatuses = state.employeeStatuses.length;
        // Remove optimistic flags
        state.employeeStatuses.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchEmployeeStatuses.rejected, (state, action) => {
        state.loading.employeeStatuses = false;
        state.error.employeeStatuses = action.payload;
      });

    // ========================================
    // EMPLOYEE TAGS
    // ========================================
    builder
      .addCase(fetchEmployeeTags.pending, (state) => {
        state.loading.employeeTags = true;
        state.error.employeeTags = null;
      })
      .addCase(fetchEmployeeTags.fulfilled, (state, action) => {
        state.loading.employeeTags = false;
        state.employeeTags = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.employeeTags = Date.now();
        state.entityCounts.employeeTags = state.employeeTags.length;
        // Remove optimistic flags
        state.employeeTags.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchEmployeeTags.rejected, (state, action) => {
        state.loading.employeeTags = false;
        state.error.employeeTags = action.payload;
      });

    // ========================================
    // CONTRACT CONFIGS
    // ========================================
    builder
      .addCase(fetchContractConfigs.pending, (state) => {
        state.loading.contractConfigs = true;
        state.error.contractConfigs = null;
      })
      .addCase(fetchContractConfigs.fulfilled, (state, action) => {
        state.loading.contractConfigs = false;
        state.contractConfigs = Array.isArray(action.payload) ? action.payload : [];
        state.lastUpdated.contractConfigs = Date.now();
        state.entityCounts.contractConfigs = state.contractConfigs.length;
        // Remove optimistic flags
        state.contractConfigs.forEach(item => {
          if (item._isOptimistic) delete item._isOptimistic;
        });
      })
      .addCase(fetchContractConfigs.rejected, (state, action) => {
        state.loading.contractConfigs = false;
        state.error.contractConfigs = action.payload;
      });

    // ========================================
    // POSITION GROUP GRADING LEVELS
    // ========================================
    builder
      .addCase(fetchPositionGroupGradingLevels.pending, (state) => {
        state.loading.gradingLevels = true;
        state.error.gradingLevels = null;
      })
      .addCase(fetchPositionGroupGradingLevels.fulfilled, (state, action) => {
        state.loading.gradingLevels = false;
        const { positionGroupId, levels } = action.payload;
        state.gradingLevels[positionGroupId] = Array.isArray(levels) ? levels : [];
      })
      .addCase(fetchPositionGroupGradingLevels.rejected, (state, action) => {
        state.loading.gradingLevels = false;
        state.error.gradingLevels = action.payload;
      });

    // ========================================
    // CRUD OPERATIONS - CREATE
    // ========================================
    const createCases = [
      createBusinessFunction,
      createDepartment,
      createUnit,
      createJobFunction,
      createPositionGroup,
      createEmployeeStatus,
      createEmployeeTag,
      createContractConfig
    ];

    createCases.forEach(createAction => {
      builder
        .addCase(createAction.pending, (state) => {
          state.loading.creating = true;
          state.error.create = null;
        })
        .addCase(createAction.fulfilled, (state, action) => {
          state.loading.creating = false;
          // Entity refresh is handled in the thunk
        })
        .addCase(createAction.rejected, (state, action) => {
          state.loading.creating = false;
          state.error.create = action.payload;
        });
    });

    // ========================================
    // CRUD OPERATIONS - UPDATE
    // ========================================
    const updateCases = [
      updateBusinessFunction,
      updateDepartment,
      updateUnit,
      updateJobFunction,
      updatePositionGroup,
      updateEmployeeStatus,
      updateEmployeeTag,
      updateContractConfig
    ];

    updateCases.forEach(updateAction => {
      builder
        .addCase(updateAction.pending, (state) => {
          state.loading.updating = true;
          state.error.update = null;
        })
        .addCase(updateAction.fulfilled, (state, action) => {
          state.loading.updating = false;
          // Entity refresh is handled in the thunk
        })
        .addCase(updateAction.rejected, (state, action) => {
          state.loading.updating = false;
          state.error.update = action.payload;
        });
    });

    // ========================================
    // CRUD OPERATIONS - DELETE
    // ========================================
    const deleteCases = [
      deleteBusinessFunction,
      deleteDepartment,
      deleteUnit,
      deleteJobFunction,
      deletePositionGroup,
      deleteEmployeeStatus,
      deleteEmployeeTag,
      deleteContractConfig
    ];

    deleteCases.forEach(deleteAction => {
      builder
        .addCase(deleteAction.pending, (state) => {
          state.loading.deleting = true;
          state.error.delete = null;
        })
        .addCase(deleteAction.fulfilled, (state, action) => {
          state.loading.deleting = false;
          // Entity refresh is handled in the thunk
        })
        .addCase(deleteAction.rejected, (state, action) => {
          state.loading.deleting = false;
          state.error.delete = action.payload;
        });
    });
  },
});

// ========================================
// ACTIONS EXPORT
// ========================================

export const {
  // Hierarchical data management
  clearDepartments,
  clearUnits,
  clearHierarchicalData,
  setSelectedBusinessFunction,
  setSelectedDepartment,
  
  // Error management
  clearErrors,
  clearError,
  setError,
  
  // Cache management
  invalidateCache,
  updateCacheTimestamp,
  
  // Data reset
  resetReferenceData,
  resetEntityData,
  
  // Optimistic updates
  optimisticAddItem,
  optimisticUpdateItem,
  optimisticRemoveItem,
  removeOptimisticFlags,
  
  // UI state management
  setShowInactive,
  setFilterText,
  setSorting,
  setSelectedEntityType,
  setManagementMode,
  
  // Bulk operations
  bulkUpdateActiveStatus,
  bulkDeleteItems,
  
  // Statistics
  updateEntityCounts,
  incrementEntityCount,
  decrementEntityCount,
} = referenceDataSlice.actions;

export default referenceDataSlice.reducer;

// ========================================
// BASE SELECTORS
// ========================================

const selectReferenceDataState = (state) => state.referenceData;

// Raw data selectors
export const selectBusinessFunctions = (state) => state.referenceData.businessFunctions;
export const selectDepartments = (state) => state.referenceData.departments;
export const selectUnits = (state) => state.referenceData.units;
export const selectJobFunctions = (state) => state.referenceData.jobFunctions;
export const selectPositionGroups = (state) => state.referenceData.positionGroups;
export const selectEmployeeStatuses = (state) => state.referenceData.employeeStatuses;
export const selectEmployeeTags = (state) => state.referenceData.employeeTags;
export const selectContractConfigs = (state) => state.referenceData.contractConfigs;
export const selectGradingLevels = (state) => state.referenceData.gradingLevels;

// Selection state selectors
export const selectSelectedBusinessFunction = (state) => state.referenceData.selectedBusinessFunction;
export const selectSelectedDepartment = (state) => state.referenceData.selectedDepartment;

// Loading and error selectors
export const selectReferenceDataLoading = (state) => state.referenceData.loading;
export const selectReferenceDataError = (state) => state.referenceData.error;

// UI state selectors
export const selectReferenceDataUI = (state) => state.referenceData.ui;
export const selectEntityCounts = (state) => state.referenceData.entityCounts;

// ========================================
// MEMOIZED SELECTORS
// ========================================

export const selectIsAnyReferenceDataLoading = createSelector(
  [selectReferenceDataLoading],
  (loading) => Object.values(loading).some(isLoading => isLoading)
);

export const selectHasAnyReferenceDataError = createSelector(
  [selectReferenceDataError],
  (errors) => Object.values(errors).some(error => error !== null)
);

// ========================================
// FORMATTED DROPDOWN SELECTORS
// ========================================

export const selectBusinessFunctionsForDropdown = createSelector(
  [selectBusinessFunctions, selectReferenceDataUI],
  (businessFunctions, ui) => {
    if (!Array.isArray(businessFunctions)) return [];
    
    let filtered = businessFunctions;
    
    // Filter by active status if needed
    if (!ui.showInactive) {
      filtered = filtered.filter(bf => bf.is_active !== false);
    }
    
    // Filter by search text
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(bf => 
        (bf.name || '').toLowerCase().includes(searchTerm) ||
        (bf.code || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(bf => ({
      value: bf.id || bf.value,
      label: bf.name || bf.label,
      code: bf.code,
      employee_count: bf.employee_count || 0,
      is_active: bf.is_active !== false,
      _isOptimistic: bf._isOptimistic || false
    }));
  }
);

export const selectDepartmentsForDropdown = createSelector(
  [selectDepartments, selectReferenceDataUI],
  (departments, ui) => {
    if (!Array.isArray(departments)) return [];
    
    let filtered = departments;
    
    // Filter by active status if needed
    if (!ui.showInactive) {
      filtered = filtered.filter(dept => dept.is_active !== false);
    }
    
    // Filter by search text
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(dept => 
        (dept.name || '').toLowerCase().includes(searchTerm) ||
        (dept.business_function_name || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(dept => ({
      value: dept.id || dept.value,
      label: dept.name || dept.label,
      business_function: dept.business_function,
      business_function_name: dept.business_function_name,
      business_function_code: dept.business_function_code,
      employee_count: dept.employee_count || 0,
      unit_count: dept.unit_count || 0,
      head_of_department: dept.head_of_department,
      head_name: dept.head_name,
      is_active: dept.is_active !== false,
      _isOptimistic: dept._isOptimistic || false
    }));
  }
);

export const selectUnitsForDropdown = createSelector(
  [selectUnits, selectReferenceDataUI],
  (units, ui) => {
    if (!Array.isArray(units)) return [];
    
    let filtered = units;
    
    // Filter by active status if needed
    if (!ui.showInactive) {
      filtered = filtered.filter(unit => unit.is_active !== false);
    }
    
    // Filter by search text
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(unit => 
        (unit.name || '').toLowerCase().includes(searchTerm) ||
        (unit.department_name || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(unit => ({
      value: unit.id || unit.value,
      label: unit.name || unit.label,
      department: unit.department,
      department_name: unit.department_name,
      business_function_name: unit.business_function_name,
      employee_count: unit.employee_count || 0,
      unit_head: unit.unit_head,
      unit_head_name: unit.unit_head_name,
      is_active: unit.is_active !== false,
      _isOptimistic: unit._isOptimistic || false
    }));
  }
);

export const selectJobFunctionsForDropdown = createSelector(
  [selectJobFunctions, selectReferenceDataUI],
  (jobFunctions, ui) => {
    if (!Array.isArray(jobFunctions)) return [];
    
    let filtered = jobFunctions;
    
    // Filter by active status if needed
    if (!ui.showInactive) {
      filtered = filtered.filter(jf => jf.is_active !== false);
    }
    
    // Filter by search text
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(jf => 
        (jf.name || '').toLowerCase().includes(searchTerm) ||
        (jf.description || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(jf => ({
      value: jf.id || jf.value,
      label: jf.name || jf.label,
      description: jf.description,
      employee_count: jf.employee_count || 0,
      is_active: jf.is_active !== false,
      _isOptimistic: jf._isOptimistic || false
    }));
  }
);

export const selectPositionGroupsForDropdown = createSelector(
  [selectPositionGroups, selectReferenceDataUI],
  (positionGroups, ui) => {
    if (!Array.isArray(positionGroups)) return [];
    
    let filtered = positionGroups;
    
    // Filter by active status if needed
    if (!ui.showInactive) {
      filtered = filtered.filter(pg => pg.is_active !== false);
    }
    
    // Filter by search text
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(pg => 
        (pg.name || '').toLowerCase().includes(searchTerm) ||
        (pg.display_name || pg.label || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by hierarchy level first, then by sortBy field
    filtered.sort((a, b) => {
      if (ui.sortBy === 'hierarchy_level') {
        return ui.sortDirection === 'desc' 
          ? (b.hierarchy_level || 0) - (a.hierarchy_level || 0)
          : (a.hierarchy_level || 0) - (b.hierarchy_level || 0);
      } else {
        const aVal = a[ui.sortBy] || '';
        const bVal = b[ui.sortBy] || '';
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return ui.sortDirection === 'desc' ? -comparison : comparison;
      }
    });
    
    return filtered.map(pg => ({
      value: pg.id || pg.value,
      label: pg.display_name || pg.label || pg.name,
      name: pg.name,
      hierarchy_level: pg.hierarchy_level || 0,
      grading_shorthand: pg.grading_shorthand,
      grading_levels: pg.grading_levels || [],
      employee_count: pg.employee_count || 0,
      is_active: pg.is_active !== false,
      _isOptimistic: pg._isOptimistic || false
    }));
  }
);

export const selectEmployeeStatusesForDropdown = createSelector(
  [selectEmployeeStatuses, selectReferenceDataUI],
  (statuses, ui) => {
    if (!Array.isArray(statuses)) return [];
    
    let filtered = statuses;
    
    // Filter by active status if needed
    if (!ui.showInactive) {
      filtered = filtered.filter(status => status.is_active !== false);
    }
    
    // Filter by search text
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(status => 
        (status.name || '').toLowerCase().includes(searchTerm) ||
        (status.status_type || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by order first if available, then by sortBy field
    filtered.sort((a, b) => {
      if (ui.sortBy === 'order' || !ui.sortBy) {
        return (a.order || 0) - (b.order || 0);
      } else {
        const aVal = a[ui.sortBy] || '';
        const bVal = b[ui.sortBy] || '';
        const comparison = aVal.toString().localeCompare(bVal.toString());
        return ui.sortDirection === 'desc' ? -comparison : comparison;
      }
    });
    
    return filtered.map(status => ({
      value: status.id || status.value,
      label: status.name || status.label,
      status_type: status.status_type,
      color: status.color,
      affects_headcount: status.affects_headcount,
      allows_org_chart: status.allows_org_chart,
      auto_transition_enabled: status.auto_transition_enabled,
      auto_transition_days: status.auto_transition_days,
      auto_transition_to: status.auto_transition_to,
      auto_transition_to_name: status.auto_transition_to_name,
      is_transitional: status.is_transitional,
      transition_priority: status.transition_priority,
      send_notifications: status.send_notifications,
      notification_template: status.notification_template,
      is_system_status: status.is_system_status,
      is_default_for_new_employees: status.is_default_for_new_employees,
      employee_count: status.employee_count || 0,
      is_active: status.is_active !== false,
      order: status.order || 0,
      _isOptimistic: status._isOptimistic || false
    }));
  }
);

export const selectEmployeeTagsForDropdown = createSelector(
  [selectEmployeeTags, selectReferenceDataUI],
  (tags, ui) => {
    if (!Array.isArray(tags)) return [];
    
    let filtered = tags;
    
    // Filter by active status if needed
    if (!ui.showInactive) {
      filtered = filtered.filter(tag => tag.is_active !== false);
    }
    
    // Filter by search text
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(tag => 
        (tag.name || '').toLowerCase().includes(searchTerm) ||
        (tag.tag_type || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(tag => ({
      value: tag.id || tag.value,
      label: tag.name || tag.label,
      tag_type: tag.tag_type,
      color: tag.color,
      employee_count: tag.employee_count || 0,
      is_active: tag.is_active !== false,
      _isOptimistic: tag._isOptimistic || false
    }));
  }
);

export const selectContractConfigsForDropdown = createSelector(
  [selectContractConfigs, selectReferenceDataUI],
  (configs, ui) => {
    if (!Array.isArray(configs)) return [];
    
    let filtered = configs;
    
    // Filter by active status if needed
    if (!ui.showInactive) {
      filtered = filtered.filter(config => config.is_active !== false);
    }
    
    // Filter by search text
    if (ui.filterText) {
      const searchTerm = ui.filterText.toLowerCase();
      filtered = filtered.filter(config => 
        (config.display_name || config.label || '').toLowerCase().includes(searchTerm) ||
        (config.contract_type || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[ui.sortBy] || '';
      const bVal = b[ui.sortBy] || '';
      const comparison = aVal.toString().localeCompare(bVal.toString());
      return ui.sortDirection === 'desc' ? -comparison : comparison;
    });
    
    return filtered.map(config => ({
      value: config.contract_type || config.value,
      label: config.display_name || config.label,
      contract_type: config.contract_type,
      onboarding_days: config.onboarding_days || 0,
      probation_days: config.probation_days || 0,
      total_days_until_active: config.total_days_until_active || 0,
      enable_auto_transitions: config.enable_auto_transitions,
      transition_to_inactive_on_end: config.transition_to_inactive_on_end,
      notify_days_before_end: config.notify_days_before_end || 0,
      employee_count: config.employee_count || 0,
      is_active: config.is_active !== false,
      _isOptimistic: config._isOptimistic || false
    }));
  }
);

// ========================================
// FILTERED DATA SELECTORS
// ========================================

export const selectDepartmentsByBusinessFunction = createSelector(
  [selectDepartments, (state, businessFunctionId) => businessFunctionId],
  (departments, businessFunctionId) => {
    if (!businessFunctionId) return [];
    const numericId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
    return departments.filter(dept => dept.business_function === numericId);
  }
);

export const selectUnitsByDepartment = createSelector(
  [selectUnits, (state, departmentId) => departmentId],
  (units, departmentId) => {
    if (!departmentId) return [];
    const numericId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
    return units.filter(unit => unit.department === numericId);
  }
);

export const selectTagsByType = createSelector(
  [selectEmployeeTags, (state, tagType) => tagType],
  (tags, tagType) => {
    if (!tagType) return tags;
    return tags.filter(tag => tag.tag_type === tagType);
  }
);

export const selectPositionGroupGradingLevels = createSelector(
  [selectGradingLevels, (state, positionGroupId) => positionGroupId],
  (gradingLevels, positionGroupId) => {
    return gradingLevels[positionGroupId] || [];
  }
);

// ========================================
// COMBINED DATA SELECTORS
// ========================================

export const selectReferenceDataForEmployeeForm = createSelector(
  [
    selectBusinessFunctionsForDropdown,
    selectDepartmentsForDropdown,
    selectUnitsForDropdown,
    selectJobFunctionsForDropdown,
    selectPositionGroupsForDropdown,
    selectEmployeeStatusesForDropdown,
    selectEmployeeTagsForDropdown,
    selectContractConfigsForDropdown
  ],
  (businessFunctions, departments, units, jobFunctions, positionGroups, statuses, tags, contractConfigs) => ({
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    statuses,
    tags,
    contractConfigs
  })
);

// ========================================
// CACHE MANAGEMENT SELECTORS
// ========================================

export const selectIsDataStale = createSelector(
  [selectReferenceDataState, (state, dataType) => dataType],
  (referenceData, dataType) => {
    const lastUpdated = referenceData.lastUpdated[dataType];
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated > referenceData.cacheExpiry;
  }
);

export const selectCacheStatus = createSelector(
  [selectReferenceDataState],
  (referenceData) => {
    const now = Date.now();
    const status = {};
    
    Object.entries(referenceData.lastUpdated).forEach(([key, timestamp]) => {
      if (!timestamp) {
        status[key] = 'not_loaded';
      } else if (now - timestamp > referenceData.cacheExpiry) {
        status[key] = 'stale';
      } else {
        status[key] = 'fresh';
      }
    });
    
    return status;
  }
);

// ========================================
// VALIDATION SELECTORS
// ========================================

export const selectIsValidBusinessFunction = createSelector(
  [selectBusinessFunctions, (state, id) => id],
  (businessFunctions, id) => {
    if (!id) return false;
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return businessFunctions.some(bf => 
      (bf.id || bf.value) === numericId && bf.is_active !== false
    );
  }
);

export const selectIsValidDepartment = createSelector(
  [selectDepartments, (state, id) => id, (state, id, businessFunctionId) => businessFunctionId],
  (departments, id, businessFunctionId) => {
    if (!id) return false;
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const department = departments.find(dept => (dept.id || dept.value) === numericId);
    
    if (!department || department.is_active === false) return false;
    
    if (businessFunctionId) {
      const numericBfId = typeof businessFunctionId === 'string' ? parseInt(businessFunctionId) : businessFunctionId;
      return department.business_function === numericBfId;
    }
    
    return true;
  }
);

export const selectIsValidUnit = createSelector(
  [selectUnits, (state, id) => id, (state, id, departmentId) => departmentId],
  (units, id, departmentId) => {
    if (!id) return false;
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const unit = units.find(u => (u.id || u.value) === numericId);
    
    if (!unit || unit.is_active === false) return false;
    
    if (departmentId) {
      const numericDeptId = typeof departmentId === 'string' ? parseInt(departmentId) : departmentId;
      return unit.department === numericDeptId;
    }
    
    return true;
  }
);

// ========================================
// STATISTICS SELECTORS
// ========================================

export const selectReferenceDataStatistics = createSelector(
  [selectEntityCounts, selectReferenceDataState],
  (entityCounts, referenceData) => {
    const totalEntities = Object.values(entityCounts).reduce((sum, count) => sum + count, 0);
    
    // Calculate active vs inactive counts
    const activeInactiveCounts = {};
    Object.entries(referenceData).forEach(([key, data]) => {
      if (Array.isArray(data) && key !== 'gradingLevels') {
        const active = data.filter(item => item.is_active !== false).length;
        const inactive = data.length - active;
        activeInactiveCounts[key] = { active, inactive, total: data.length };
      }
    });
    
    return {
      totalEntities,
      entityCounts,
      activeInactiveCounts,
      lastUpdatedTimes: referenceData.lastUpdated,
      cacheStatus: Object.entries(referenceData.lastUpdated).reduce((acc, [key, timestamp]) => {
        if (!timestamp) {
          acc[key] = 'not_loaded';
        } else if (Date.now() - timestamp > referenceData.cacheExpiry) {
          acc[key] = 'stale';
        } else {
          acc[key] = 'fresh';
        }
        return acc;
      }, {})
    };
  }
);

// ========================================
// SEARCH AND FILTER SELECTORS
// ========================================

export const selectFilteredReferenceData = createSelector(
  [
    selectReferenceDataState,
    (state, entityType) => entityType,
    (state, entityType, searchTerm) => searchTerm,
    (state, entityType, searchTerm, showInactive) => showInactive
  ],
  (referenceData, entityType, searchTerm = '', showInactive = false) => {
    const data = referenceData[entityType];
    if (!Array.isArray(data)) return [];
    
    let filtered = data;
    
    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter(item => item.is_active !== false);
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const searchableFields = ['name', 'label', 'code', 'description', 'display_name'];
        return searchableFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }
    
    return filtered;
  }
);

// ========================================
// HIERARCHY VALIDATION SELECTORS
// ========================================

export const selectHierarchyValidation = createSelector(
  [
    selectBusinessFunctions,
    selectDepartments,
    selectUnits,
    (state, businessFunctionId, departmentId, unitId) => ({ businessFunctionId, departmentId, unitId })
  ],
  (businessFunctions, departments, units, { businessFunctionId, departmentId, unitId }) => {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    // Validate business function
    if (businessFunctionId) {
      const bf = businessFunctions.find(bf => 
        (bf.id || bf.value) === parseInt(businessFunctionId)
      );
      if (!bf) {
        validation.isValid = false;
        validation.errors.push('Invalid business function selected');
      } else if (bf.is_active === false) {
        validation.warnings.push('Selected business function is inactive');
      }
    }
    
    // Validate department belongs to business function
    if (departmentId) {
      const dept = departments.find(d => 
        (d.id || d.value) === parseInt(departmentId)
      );
      if (!dept) {
        validation.isValid = false;
        validation.errors.push('Invalid department selected');
      } else {
        if (dept.is_active === false) {
          validation.warnings.push('Selected department is inactive');
        }
        if (businessFunctionId && dept.business_function !== parseInt(businessFunctionId)) {
          validation.isValid = false;
          validation.errors.push('Department does not belong to selected business function');
        }
      }
    }
    
    // Validate unit belongs to department
    if (unitId) {
      const unit = units.find(u => 
        (u.id || u.value) === parseInt(unitId)
      );
      if (!unit) {
        validation.isValid = false;
        validation.errors.push('Invalid unit selected');
      } else {
        if (unit.is_active === false) {
          validation.warnings.push('Selected unit is inactive');
        }
        if (departmentId && unit.department !== parseInt(departmentId)) {
          validation.isValid = false;
          validation.errors.push('Unit does not belong to selected department');
        }
      }
    }
    
    return validation;
  }
);

// ========================================
// QUICK ACCESS SELECTORS
// ========================================

export const selectQuickAccessData = createSelector(
  [selectReferenceDataState],
  (referenceData) => {
    const getActiveItems = (data, limit = 5) => {
      if (!Array.isArray(data)) return [];
      return data
        .filter(item => item.is_active !== false)
        .slice(0, limit)
        .map(item => ({
          id: item.id || item.value,
          name: item.name || item.label || item.display_name,
          count: item.employee_count || 0
        }));
    };
    
    return {
      topBusinessFunctions: getActiveItems(referenceData.businessFunctions),
      recentDepartments: getActiveItems(referenceData.departments),
      popularJobFunctions: getActiveItems(referenceData.jobFunctions),
      commonStatuses: getActiveItems(referenceData.employeeStatuses),
      frequentTags: getActiveItems(referenceData.employeeTags)
    };
  }
);

// ========================================
// FORM HELPER SELECTORS
// ========================================

export const selectFormOptions = createSelector(
  [
    selectBusinessFunctionsForDropdown,
    selectDepartmentsForDropdown,
    selectUnitsForDropdown,
    selectJobFunctionsForDropdown,
    selectPositionGroupsForDropdown,
    selectEmployeeStatusesForDropdown,
    selectEmployeeTagsForDropdown,
    selectContractConfigsForDropdown,
    (state, formContext) => formContext
  ],
  (
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    statuses,
    tags,
    contractConfigs,
    formContext = {}
  ) => {
    const options = {
      businessFunctions,
      jobFunctions,
      positionGroups,
      statuses,
      tags,
      contractConfigs
    };
    
    // Filter departments by selected business function
    if (formContext.businessFunctionId) {
      options.departments = departments.filter(dept => 
        dept.business_function === parseInt(formContext.businessFunctionId)
      );
    } else {
      options.departments = departments;
    }
    
    // Filter units by selected department
    if (formContext.departmentId) {
      options.units = units.filter(unit => 
        unit.department === parseInt(formContext.departmentId)
      );
    } else {
      options.units = units;
    }
    
    // Filter tags by type if specified
    if (formContext.tagType) {
      options.tags = tags.filter(tag => tag.tag_type === formContext.tagType);
    }
    
    return options;
  }
);

// ========================================
// PERFORMANCE SELECTORS
// ========================================

export const selectReferenceDataLoadingStatus = createSelector(
  [selectReferenceDataLoading, selectReferenceDataError],
  (loading, error) => {
    const entities = [
      'businessFunctions',
      'departments', 
      'units',
      'jobFunctions',
      'positionGroups',
      'employeeStatuses',
      'employeeTags',
      'contractConfigs'
    ];
    
    const status = {};
    entities.forEach(entity => {
      if (loading[entity]) {
        status[entity] = 'loading';
      } else if (error[entity]) {
        status[entity] = 'error';
      } else {
        status[entity] = 'idle';
      }
    });
    
    return {
      individual: status,
      isAnyLoading: Object.values(loading).some(Boolean),
      hasAnyError: Object.values(error).some(err => err !== null),
      isAllLoaded: entities.every(entity => status[entity] === 'idle'),
      errorCount: Object.values(error).filter(err => err !== null).length,
      loadingCount: Object.values(loading).filter(Boolean).length
    };
  }
);

// ========================================
// DROPDOWN HELPER SELECTORS
// ========================================

export const selectDropdownData = createSelector(
  [selectReferenceDataState],
  (referenceData) => {
    const createDropdownOptions = (data, valueField = 'id', labelField = 'name') => {
      if (!Array.isArray(data)) return [];
      
      return data
        .filter(item => item.is_active !== false)
        .map(item => ({
          value: item[valueField] || item.value,
          label: item[labelField] || item.label || item.display_name || item.name,
          ...item
        }));
    };
    
    return {
      businessFunctions: createDropdownOptions(referenceData.businessFunctions),
      departments: createDropdownOptions(referenceData.departments),
      units: createDropdownOptions(referenceData.units),
      jobFunctions: createDropdownOptions(referenceData.jobFunctions),
      positionGroups: createDropdownOptions(referenceData.positionGroups, 'id', 'display_name'),
      employeeStatuses: createDropdownOptions(referenceData.employeeStatuses),
      employeeTags: createDropdownOptions(referenceData.employeeTags),
      contractConfigs: createDropdownOptions(referenceData.contractConfigs, 'contract_type', 'display_name')
    };
  }
);

// ========================================
// UTILITY SELECTORS
// ========================================

export const selectReferenceDataSummary = createSelector(
  [selectReferenceDataStatistics, selectReferenceDataLoadingStatus],
  (statistics, loadingStatus) => ({
    ...statistics,
    loadingStatus,
    health: {
      totalEntities: statistics.totalEntities,
      loadedEntities: Object.keys(statistics.activeInactiveCounts).length,
      errorEntities: loadingStatus.errorCount,
      staleCacheCount: Object.values(statistics.cacheStatus).filter(status => status === 'stale').length
    }
  })
);

// ========================================
// EXPORT ALL SELECTORS
// ========================================

export const referenceDataSelectors = {
  // Base selectors
  selectBusinessFunctions,
  selectDepartments,
  selectUnits,
  selectJobFunctions,
  selectPositionGroups,
  selectEmployeeStatuses,
  selectEmployeeTags,
  selectContractConfigs,
  selectGradingLevels,
  selectSelectedBusinessFunction,
  selectSelectedDepartment,
  selectReferenceDataLoading,
  selectReferenceDataError,
  selectReferenceDataUI,
  selectEntityCounts,
  
  // Computed selectors
  selectIsAnyReferenceDataLoading,
  selectHasAnyReferenceDataError,
  
  // Dropdown selectors
  selectBusinessFunctionsForDropdown,
  selectDepartmentsForDropdown,
  selectUnitsForDropdown,
  selectJobFunctionsForDropdown,
  selectPositionGroupsForDropdown,
  selectEmployeeStatusesForDropdown,
  selectEmployeeTagsForDropdown,
  selectContractConfigsForDropdown,
  
  // Filtered selectors
  selectDepartmentsByBusinessFunction,
  selectUnitsByDepartment,
  selectTagsByType,
  selectPositionGroupGradingLevels,
  
  // Combined selectors
  selectReferenceDataForEmployeeForm,
  selectFormOptions,
  selectDropdownData,
  
  // Validation selectors
  selectIsValidBusinessFunction,
  selectIsValidDepartment,
  selectIsValidUnit,
  selectHierarchyValidation,
  
  // Cache selectors
  selectIsDataStale,
  selectCacheStatus,
  
  // Statistics selectors
  selectReferenceDataStatistics,
  selectReferenceDataLoadingStatus,
  selectReferenceDataSummary,
  
  // Utility selectors
  selectFilteredReferenceData,
  selectQuickAccessData
};