// src/store/slices/employeeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeAPI } from '../api/employeeAPI';

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployees(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEmployee = createAsyncThunk(
  'employees/fetchEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployee(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.createEmployee(employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateEmployee(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await employeeAPI.deleteEmployee(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFilterOptions = createAsyncThunk(
  'employees/fetchFilterOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getFilterOptions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'employees/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getStatistics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateEmployees = createAsyncThunk(
  'employees/bulkUpdate',
  async ({ employeeIds, updates }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkUpdate(employeeIds, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Employee list data
  employees: [],
  totalEmployees: 0,
  currentPage: 1,
  totalPages: 1,
  pageSize: 25,
  
  // Single employee data
  currentEmployee: null,
  
  // Filter options
  filterOptions: {
    business_functions: [],
    departments: [],
    units: [],
    job_functions: [],
    position_groups: [],
    statuses: [],
    tags: [],
    grades: [],
    genders: [],
    line_managers: []
  },
  
  // Statistics
  statistics: null,
  
  // Loading states
  loading: false,
  loadingFilterOptions: false,
  loadingStatistics: false,
  loadingEmployee: false,
  creating: false,
  updating: false,
  deleting: false,
  bulkUpdating: false,
  
  // Error states
  error: null,
  filterOptionsError: null,
  statisticsError: null,
  employeeError: null,
  
  // Selection state
  selectedEmployees: [],
  
  // UI state
  showAdvancedFilters: false,
  currentFilters: {},
  sortBy: 'employee_id',
  sortOrder: 'asc',
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    // UI actions
    setSelectedEmployees: (state, action) => {
      state.selectedEmployees = action.payload;
    },
    toggleEmployeeSelection: (state, action) => {
      const employeeId = action.payload;
      const index = state.selectedEmployees.indexOf(employeeId);
      if (index > -1) {
        state.selectedEmployees.splice(index, 1);
      } else {
        state.selectedEmployees.push(employeeId);
      }
    },
    selectAllEmployees: (state) => {
      state.selectedEmployees = state.employees.map(emp => emp.id);
    },
    clearSelection: (state) => {
      state.selectedEmployees = [];
    },
    setCurrentFilters: (state, action) => {
      state.currentFilters = action.payload;
    },
    clearFilters: (state) => {
      state.currentFilters = {};
    },
    setSorting: (state, action) => {
      const { field, order } = action.payload;
      state.sortBy = field;
      state.sortOrder = order;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    toggleAdvancedFilters: (state) => {
      state.showAdvancedFilters = !state.showAdvancedFilters;
    },
    clearErrors: (state) => {
      state.error = null;
      state.filterOptionsError = null;
      state.statisticsError = null;
      state.employeeError = null;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
      state.employeeError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch employees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.results;
        state.totalEmployees = action.payload.count;
        state.totalPages = action.payload.total_pages;
        state.currentPage = action.payload.current_page;
        state.pageSize = action.payload.page_size;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Fetch single employee
    builder
      .addCase(fetchEmployee.pending, (state) => {
        state.loadingEmployee = true;
        state.employeeError = null;
      })
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.loadingEmployee = false;
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployee.rejected, (state, action) => {
        state.loadingEmployee = false;
        state.employeeError = action.payload;
      })

    // Create employee
    builder
      .addCase(createEmployee.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.creating = false;
        state.employees.unshift(action.payload);
        state.totalEmployees += 1;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

    // Update employee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

    // Delete employee
    builder
      .addCase(deleteEmployee.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.deleting = false;
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        state.totalEmployees -= 1;
        if (state.currentEmployee?.id === action.payload) {
          state.currentEmployee = null;
        }
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

    // Fetch filter options
    builder
      .addCase(fetchFilterOptions.pending, (state) => {
        state.loadingFilterOptions = true;
        state.filterOptionsError = null;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.loadingFilterOptions = false;
        state.filterOptions = action.payload;
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.loadingFilterOptions = false;
        state.filterOptionsError = action.payload;
      })

    // Fetch statistics
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.loadingStatistics = true;
        state.statisticsError = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loadingStatistics = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loadingStatistics = false;
        state.statisticsError = action.payload;
      })

    // Bulk update
    builder
      .addCase(bulkUpdateEmployees.pending, (state) => {
        state.bulkUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateEmployees.fulfilled, (state, action) => {
        state.bulkUpdating = false;
        state.selectedEmployees = [];
        // Refresh employee list after bulk update
      })
      .addCase(bulkUpdateEmployees.rejected, (state, action) => {
        state.bulkUpdating = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSelectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  clearSelection,
  setCurrentFilters,
  clearFilters,
  setSorting,
  setPageSize,
  setCurrentPage,
  toggleAdvancedFilters,
  clearErrors,
  clearCurrentEmployee
} = employeeSlice.actions;

export default employeeSlice.reducer;

export const selectEmployees = (state) => state.employees.employees;
export const selectCurrentEmployee = (state) => state.employees.currentEmployee;
export const selectEmployeeLoading = (state) => state.employees.loading;
export const selectEmployeeError = (state) => state.employees.error;
export const selectFilterOptions = (state) => state.employees.filterOptions;
export const selectSelectedEmployees = (state) => state.employees.selectedEmployees;
export const selectCurrentFilters = (state) => state.employees.currentFilters;
export const selectStatistics = (state) => state.employees.statistics;
export const selectPagination = (state) => ({
  currentPage: state.employees.currentPage,
  totalPages: state.employees.totalPages,
  totalEmployees: state.employees.totalEmployees,
  pageSize: state.employees.pageSize
});
