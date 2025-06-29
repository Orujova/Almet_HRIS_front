// src/store/slices/referenceDataSlice.js - UPDATED with complete backend integration
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { referenceDataAPI } from '../api/referenceDataAPI';

// Async thunks for reference data
export const fetchBusinessFunctions = createAsyncThunk(
  'referenceData/fetchBusinessFunctions',
  async (_, { rejectWithValue }) => {
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

// CRUD operations for reference data management
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
      const currentDepartment = state.referenceData.departments.find(d => d.id === id);
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
      const department = state.referenceData.departments.find(d => d.id === id);
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
      const currentUnit = state.referenceData.units.find(u => u.id === id);
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
      const unit = state.referenceData.units.find(u => u.id === id);
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

// Position group grading levels
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

const initialState = {
  // Data
  businessFunctions: [],
  departments: [],
  units: [],
  jobFunctions: [],
  positionGroups: [],
  employeeStatuses: [],
  employeeTags: [],
  gradingLevels: {}, // Store grading levels by position group ID
  
  // Currently selected values for hierarchical dependencies
  selectedBusinessFunction: null,
  selectedDepartment: null,
  
  // Loading States
  loading: {
    businessFunctions: false,
    departments: false,
    units: false,
    jobFunctions: false,
    positionGroups: false,
    employeeStatuses: false,
    employeeTags: false,
    gradingLevels: false,
    
    // CRUD operation loading states
    creating: false,
    updating: false,
    deleting: false,
  },
  
  // Error States
  error: {
    businessFunctions: null,
    departments: null,
    units: null,
    jobFunctions: null,
    positionGroups: null,
    employeeStatuses: null,
    employeeTags: null,
    gradingLevels: null,
    
    // CRUD operation error states
    create: null,
    update: null,
    delete: null,
  },
  
  // Last updated timestamps for cache management
  lastUpdated: {
    businessFunctions: null,
    departments: null,
    units: null,
    jobFunctions: null,
    positionGroups: null,
    employeeStatuses: null,
    employeeTags: null,
  },
  
  // Cache settings
  cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
};

const referenceDataSlice = createSlice({
  name: 'referenceData',
  initialState,
  reducers: {
    // Hierarchical data management
    clearDepartments: (state) => {
      state.departments = [];
      state.selectedDepartment = null;
      state.lastUpdated.departments = null;
    },
    
    clearUnits: (state) => {
      state.units = [];
      state.lastUpdated.units = null;
    },
    
    clearHierarchicalData: (state) => {
      state.departments = [];
      state.units = [];
      state.selectedBusinessFunction = null;
      state.selectedDepartment = null;
      state.lastUpdated.departments = null;
      state.lastUpdated.units = null;
    },
    
    // Selection management for hierarchical dependencies
    setSelectedBusinessFunction: (state, action) => {
      state.selectedBusinessFunction = action.payload;
      // Clear departments and units when business function changes
      if (!action.payload) {
        state.departments = [];
        state.units = [];
        state.selectedDepartment = null;
      }
    },
    
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
      // Clear units when department changes
      if (!action.payload) {
        state.units = [];
      }
    },
    
    // Error management
    clearErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key] = null;
      });
    },
    
    clearError: (state, action) => {
      const errorKey = action.payload;
      state.error[errorKey] = null;
    },
    
    // Cache management
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
    
    // Reset all data
    resetReferenceData: (state) => {
      state.businessFunctions = [];
      state.departments = [];
      state.units = [];
      state.jobFunctions = [];
      state.positionGroups = [];
      state.employeeStatuses = [];
      state.employeeTags = [];
      state.gradingLevels = {};
      state.selectedBusinessFunction = null;
      state.selectedDepartment = null;
      
      Object.keys(state.lastUpdated).forEach(key => {
        state.lastUpdated[key] = null;
      });
    },
    
    // Optimistic updates for better UX
    optimisticAddItem: (state, action) => {
      const { type, item } = action.payload;
      if (state[type]) {
        state[type].unshift({ ...item, id: `temp_${Date.now()}`, _isOptimistic: true });
      }
    },
    
    optimisticUpdateItem: (state, action) => {
      const { type, id, updates } = action.payload;
      if (state[type]) {
        const index = state[type].findIndex(item => item.id === id);
        if (index !== -1) {
          state[type][index] = { ...state[type][index], ...updates, _isOptimistic: true };
        }
      }
    },
    
    optimisticRemoveItem: (state, action) => {
      const { type, id } = action.payload;
      if (state[type]) {
        state[type] = state[type].filter(item => item.id !== id);
      }
    },
  },
  
  extraReducers: (builder) => {
    // Business Functions
    builder
      .addCase(fetchBusinessFunctions.pending, (state) => {
        state.loading.businessFunctions = true;
        state.error.businessFunctions = null;
      })
      .addCase(fetchBusinessFunctions.fulfilled, (state, action) => {
        state.loading.businessFunctions = false;
        state.businessFunctions = action.payload;
        state.lastUpdated.businessFunctions = Date.now();
      })
      .addCase(fetchBusinessFunctions.rejected, (state, action) => {
        state.loading.businessFunctions = false;
        state.error.businessFunctions = action.payload;
      })

    // Departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading.departments = true;
        state.error.departments = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading.departments = false;
        state.departments = action.payload;
        state.lastUpdated.departments = Date.now();
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading.departments = false;
        state.error.departments = action.payload;
      })

    // Units
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading.units = true;
        state.error.units = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading.units = false;
        state.units = action.payload;
        state.lastUpdated.units = Date.now();
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading.units = false;
        state.error.units = action.payload;
      })

    // Job Functions
    builder
      .addCase(fetchJobFunctions.pending, (state) => {
        state.loading.jobFunctions = true;
        state.error.jobFunctions = null;
      })
      .addCase(fetchJobFunctions.fulfilled, (state, action) => {
        state.loading.jobFunctions = false;
        state.jobFunctions = action.payload;
        state.lastUpdated.jobFunctions = Date.now();
      })
      .addCase(fetchJobFunctions.rejected, (state, action) => {
        state.loading.jobFunctions = false;
        state.error.jobFunctions = action.payload;
      })

    // Position Groups
    builder
      .addCase(fetchPositionGroups.pending, (state) => {
        state.loading.positionGroups = true;
        state.error.positionGroups = null;
      })
      .addCase(fetchPositionGroups.fulfilled, (state, action) => {
        state.loading.positionGroups = false;
        state.positionGroups = action.payload;
        state.lastUpdated.positionGroups = Date.now();
      })
      .addCase(fetchPositionGroups.rejected, (state, action) => {
        state.loading.positionGroups = false;
        state.error.positionGroups = action.payload;
      })

    // Employee Statuses
    builder
      .addCase(fetchEmployeeStatuses.pending, (state) => {
        state.loading.employeeStatuses = true;
        state.error.employeeStatuses = null;
      })
      .addCase(fetchEmployeeStatuses.fulfilled, (state, action) => {
        state.loading.employeeStatuses = false;
        state.employeeStatuses = action.payload;
        state.lastUpdated.employeeStatuses = Date.now();
      })
      .addCase(fetchEmployeeStatuses.rejected, (state, action) => {
        state.loading.employeeStatuses = false;
        state.error.employeeStatuses = action.payload;
      })

    // Employee Tags
    builder
      .addCase(fetchEmployeeTags.pending, (state) => {
        state.loading.employeeTags = true;
        state.error.employeeTags = null;
      })
      .addCase(fetchEmployeeTags.fulfilled, (state, action) => {
        state.loading.employeeTags = false;
        state.employeeTags = action.payload;
        state.lastUpdated.employeeTags = Date.now();
      })
      .addCase(fetchEmployeeTags.rejected, (state, action) => {
        state.loading.employeeTags = false;
        state.error.employeeTags = action.payload;
      })

    // Position Group Grading Levels
    builder
      .addCase(fetchPositionGroupGradingLevels.pending, (state) => {
        state.loading.gradingLevels = true;
        state.error.gradingLevels = null;
      })
      .addCase(fetchPositionGroupGradingLevels.fulfilled, (state, action) => {
        state.loading.gradingLevels = false;
        const { positionGroupId, levels } = action.payload;
        state.gradingLevels[positionGroupId] = levels;
      })
      .addCase(fetchPositionGroupGradingLevels.rejected, (state, action) => {
        state.loading.gradingLevels = false;
        state.error.gradingLevels = action.payload;
      })

    // CRUD Operations Loading States
    builder
      .addCase(createBusinessFunction.pending, (state) => {
        state.loading.creating = true;
        state.error.create = null;
      })
      .addCase(createBusinessFunction.fulfilled, (state) => {
        state.loading.creating = false;
      })
      .addCase(createBusinessFunction.rejected, (state, action) => {
        state.loading.creating = false;
        state.error.create = action.payload;
      })

    builder
      .addCase(updateBusinessFunction.pending, (state) => {
        state.loading.updating = true;
        state.error.update = null;
      })
      .addCase(updateBusinessFunction.fulfilled, (state) => {
        state.loading.updating = false;
      })
      .addCase(updateBusinessFunction.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.update = action.payload;
      })

    builder
      .addCase(deleteBusinessFunction.pending, (state) => {
        state.loading.deleting = true;
        state.error.delete = null;
      })
      .addCase(deleteBusinessFunction.fulfilled, (state) => {
        state.loading.deleting = false;
      })
      .addCase(deleteBusinessFunction.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error.delete = action.payload;
      })

    // Similar patterns for other CRUD operations...
    const addCrudCases = (entityName, createAction, updateAction, deleteAction) => {
      builder
        .addCase(createAction.pending, (state) => {
          state.loading.creating = true;
          state.error.create = null;
        })
        .addCase(createAction.fulfilled, (state) => {
          state.loading.creating = false;
        })
        .addCase(createAction.rejected, (state, action) => {
          state.loading.creating = false;
          state.error.create = action.payload;
        })
        .addCase(updateAction.pending, (state) => {
          state.loading.updating = true;
          state.error.update = null;
        })
        .addCase(updateAction.fulfilled, (state) => {
          state.loading.updating = false;
        })
        .addCase(updateAction.rejected, (state, action) => {
          state.loading.updating = false;
          state.error.update = action.payload;
        })
        .addCase(deleteAction.pending, (state) => {
          state.loading.deleting = true;
          state.error.delete = null;
        })
        .addCase(deleteAction.fulfilled, (state) => {
          state.loading.deleting = false;
        })
        .addCase(deleteAction.rejected, (state, action) => {
          state.loading.deleting = false;
          state.error.delete = action.payload;
        });
    };

    // Add CRUD cases for all entities
    addCrudCases('departments', createDepartment, updateDepartment, deleteDepartment);
    addCrudCases('units', createUnit, updateUnit, deleteUnit);
    addCrudCases('jobFunctions', createJobFunction, updateJobFunction, deleteJobFunction);
    addCrudCases('positionGroups', createPositionGroup, updatePositionGroup, deletePositionGroup);
    addCrudCases('employeeStatuses', createEmployeeStatus, updateEmployeeStatus, deleteEmployeeStatus);
    addCrudCases('employeeTags', createEmployeeTag, updateEmployeeTag, deleteEmployeeTag);
  }
});

export const {
  clearDepartments,
  clearUnits,
  clearHierarchicalData,
  setSelectedBusinessFunction,
  setSelectedDepartment,
  clearErrors,
  clearError,
  invalidateCache,
  resetReferenceData,
  optimisticAddItem,
  optimisticUpdateItem,
  optimisticRemoveItem,
} = referenceDataSlice.actions;

export default referenceDataSlice.reducer;

// Base selectors
const selectReferenceDataState = (state) => state.referenceData;

// Basic selectors
export const selectBusinessFunctions = (state) => state.referenceData.businessFunctions;
export const selectDepartments = (state) => state.referenceData.departments;
export const selectUnits = (state) => state.referenceData.units;
export const selectJobFunctions = (state) => state.referenceData.jobFunctions;
export const selectPositionGroups = (state) => state.referenceData.positionGroups;
export const selectEmployeeStatuses = (state) => state.referenceData.employeeStatuses;
export const selectEmployeeTags = (state) => state.referenceData.employeeTags;
export const selectGradingLevels = (state) => state.referenceData.gradingLevels;
export const selectSelectedBusinessFunction = (state) => state.referenceData.selectedBusinessFunction;
export const selectSelectedDepartment = (state) => state.referenceData.selectedDepartment;

// Loading and error selectors
export const selectReferenceDataLoading = createSelector(
  [selectReferenceDataState],
  (referenceData) => referenceData.loading
);

export const selectReferenceDataError = createSelector(
  [selectReferenceDataState],
  (referenceData) => referenceData.error
);

export const selectIsAnyReferenceDataLoading = createSelector(
  [selectReferenceDataLoading],
  (loading) => Object.values(loading).some(isLoading => isLoading)
);

export const selectHasAnyReferenceDataError = createSelector(
  [selectReferenceDataError],
  (errors) => Object.values(errors).some(error => error !== null)
);

// Formatted selectors for dropdown use
export const selectBusinessFunctionsForDropdown = createSelector(
  [selectBusinessFunctions],
  (businessFunctions) => {
    if (!Array.isArray(businessFunctions)) return [];
    return businessFunctions.map(bf => ({
      value: bf.id || bf.value,
      label: bf.name || bf.label,
      code: bf.code,
      employee_count: bf.employee_count,
      is_active: bf.is_active !== false
    }));
  }
);

export const selectDepartmentsForDropdown = createSelector(
  [selectDepartments],
  (departments) => {
    if (!Array.isArray(departments)) return [];
    return departments.map(dept => ({
      value: dept.id || dept.value,
      label: dept.name || dept.label,
      business_function: dept.business_function,
      business_function_name: dept.business_function_name,
      business_function_code: dept.business_function_code,
      employee_count: dept.employee_count,
      is_active: dept.is_active !== false
    }));
  }
);

export const selectUnitsForDropdown = createSelector(
  [selectUnits],
  (units) => {
    if (!Array.isArray(units)) return [];
    return units.map(unit => ({
      value: unit.id || unit.value,
      label: unit.name || unit.label,
      department: unit.department,
      department_name: unit.department_name,
      business_function_name: unit.business_function_name,
      employee_count: unit.employee_count,
      is_active: unit.is_active !== false
    }));
  }
);

export const selectJobFunctionsForDropdown = createSelector(
  [selectJobFunctions],
  (jobFunctions) => {
    if (!Array.isArray(jobFunctions)) return [];
    return jobFunctions.map(jf => ({
      value: jf.id || jf.value,
      label: jf.name || jf.label,
      description: jf.description,
      employee_count: jf.employee_count,
      is_active: jf.is_active !== false
    }));
  }
);

export const selectPositionGroupsForDropdown = createSelector(
  [selectPositionGroups],
  (positionGroups) => {
    if (!Array.isArray(positionGroups)) return [];
    return positionGroups
      .filter(pg => pg.is_active !== false)
      .sort((a, b) => (a.hierarchy_level || 0) - (b.hierarchy_level || 0))
      .map(pg => ({
        value: pg.id || pg.value,
        label: pg.display_name || pg.label || pg.name,
        name: pg.name,
        hierarchy_level: pg.hierarchy_level,
        grading_shorthand: pg.grading_shorthand,
        grading_levels: pg.grading_levels,
        employee_count: pg.employee_count,
        is_active: pg.is_active !== false
      }));
  }
);

export const selectEmployeeStatusesForDropdown = createSelector(
  [selectEmployeeStatuses],
  (statuses) => {
    if (!Array.isArray(statuses)) return [];
    return statuses.map(status => ({
      value: status.id || status.value,
      label: status.name || status.label,
      status_type: status.status_type,
      color: status.color,
      affects_headcount: status.affects_headcount,
      allows_org_chart: status.allows_org_chart,
      employee_count: status.employee_count,
      is_active: status.is_active !== false
    }));
  }
);

export const selectEmployeeTagsForDropdown = createSelector(
  [selectEmployeeTags],
  (tags) => {
    if (!Array.isArray(tags)) return [];
    return tags.map(tag => ({
      value: tag.id || tag.value,
      label: tag.name || tag.label,
      color: tag.color,
      tag_type: tag.tag_type,
      employee_count: tag.employee_count,
      is_active: tag.is_active !== false
    }));
  }
);

// Filtered selectors
export const selectDepartmentsByBusinessFunction = createSelector(
  [selectDepartments, (state, businessFunctionId) => businessFunctionId],
  (departments, businessFunctionId) => {
    if (!businessFunctionId) return [];
    return departments.filter(dept => dept.business_function === parseInt(businessFunctionId));
  }
);

export const selectUnitsByDepartment = createSelector(
  [selectUnits, (state, departmentId) => departmentId],
  (units, departmentId) => {
    if (!departmentId) return [];
    return units.filter(unit => unit.department === parseInt(departmentId));
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

// Combined selectors for forms
export const selectReferenceDataForEmployeeForm = createSelector(
  [
    selectBusinessFunctionsForDropdown,
    selectDepartmentsForDropdown,
    selectUnitsForDropdown,
    selectJobFunctionsForDropdown,
    selectPositionGroupsForDropdown,
    selectEmployeeStatusesForDropdown,
    selectEmployeeTagsForDropdown
  ],
  (businessFunctions, departments, units, jobFunctions, positionGroups, statuses, tags) => ({
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    statuses,
    tags
  })
);

// Cache management selectors
export const selectIsDataStale = createSelector(
  [selectReferenceDataState, (state, dataType) => dataType],
  (referenceData, dataType) => {
    const lastUpdated = referenceData.lastUpdated[dataType];
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated > referenceData.cacheExpiry;
  }
);

// Validation selectors
export const selectIsValidBusinessFunction = createSelector(
  [selectBusinessFunctions, (state, id) => id],
  (businessFunctions, id) => {
    return businessFunctions.some(bf => bf.id === parseInt(id) && bf.is_active !== false);
  }
);

export const selectIsValidDepartment = createSelector(
  [selectDepartments, (state, id) => id, (state, id, businessFunctionId) => businessFunctionId],
  (departments, id, businessFunctionId) => {
    const department = departments.find(dept => dept.id === parseInt(id));
    if (!department || department.is_active === false) return false;
    
    if (businessFunctionId) {
      return department.business_function === parseInt(businessFunctionId);
    }
    
    return true;
  }
);

export const selectIsValidUnit = createSelector(
  [selectUnits, (state, id) => id, (state, id, departmentId) => departmentId],
  (units, id, departmentId) => {
    const unit = units.find(u => u.id === parseInt(id));
    if (!unit || unit.is_active === false) return false;
    
    if (departmentId) {
      return unit.department === parseInt(departmentId);
    }
    
    return true;
  }
);