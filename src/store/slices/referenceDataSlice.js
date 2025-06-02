// src/store/slices/referenceDataSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
      return response.data;
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

const initialState = {
  businessFunctions: [],
  departments: [],
  units: [],
  jobFunctions: [],
  positionGroups: [],
  employeeStatuses: [],
  employeeTags: [],
  
  loading: {
    businessFunctions: false,
    departments: false,
    units: false,
    jobFunctions: false,
    positionGroups: false,
    employeeStatuses: false,
    employeeTags: false,
  },
  
  error: {
    businessFunctions: null,
    departments: null,
    units: null,
    jobFunctions: null,
    positionGroups: null,
    employeeStatuses: null,
    employeeTags: null,
  }
};

const referenceDataSlice = createSlice({
  name: 'referenceData',
  initialState,
  reducers: {
    clearDepartments: (state) => {
      state.departments = [];
    },
    clearUnits: (state) => {
      state.units = [];
    },
    clearErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key] = null;
      });
    }
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
      })
      .addCase(fetchEmployeeTags.rejected, (state, action) => {
        state.loading.employeeTags = false;
        state.error.employeeTags = action.payload;
      });
  }
});

export const { clearDepartments, clearUnits, clearErrors } = referenceDataSlice.actions;

export default referenceDataSlice.reducer;

// Selectors
export const selectBusinessFunctions = (state) => state.referenceData.businessFunctions;
export const selectDepartments = (state) => state.referenceData.departments;
export const selectUnits = (state) => state.referenceData.units;
export const selectJobFunctions = (state) => state.referenceData.jobFunctions;
export const selectPositionGroups = (state) => state.referenceData.positionGroups;
export const selectEmployeeStatuses = (state) => state.referenceData.employeeStatuses;
export const selectEmployeeTags = (state) => state.referenceData.employeeTags;
export const selectReferenceDataLoading = (state) => state.referenceData.loading;
export const selectReferenceDataError = (state) => state.referenceData.error;