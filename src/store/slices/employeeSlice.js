// src/store/slices/employeeSlice.js - Updated with backend field mapping
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Async thunks with proper backend integration
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Map frontend filter names to backend field names
      const backendParams = {
        ...params,
        // Map search fields
        search: params.search || params.searchTerm,
        // Map status filter
        status__name: params.statusFilter && params.statusFilter !== 'all' ? params.statusFilter : undefined,
        // Map department filter
        department__name: params.departmentFilter && params.departmentFilter !== 'all' ? params.departmentFilter : undefined,
        // Map office filter (if available in backend)
        office: params.officeFilter && params.officeFilter !== 'all' ? params.officeFilter : undefined,
        // Remove frontend-only fields
        searchTerm: undefined,
        statusFilter: undefined,
        departmentFilter: undefined,
        officeFilter: undefined,
      };

      // Clean undefined values
      Object.keys(backendParams).forEach(key => {
        if (backendParams[key] === undefined) {
          delete backendParams[key];
        }
      });

      const response = await apiService.getEmployees(backendParams);
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
      const response = await apiService.getEmployee(id);
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
      const response = await apiService.createEmployee(employeeData);
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
      const response = await apiService.updateEmployee(id, data);
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
      await apiService.deleteEmployee(id);
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
      const response = await apiService.getEmployeeFilterOptions();
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
      const response = await apiService.getEmployeeStatistics();
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
      const response = await apiService.bulkUpdateEmployees({
        employee_ids: employeeIds,
        updates: updates
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrgChart = createAsyncThunk(
  'employees/fetchOrgChart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getOrgChart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateOrgChartVisibility = createAsyncThunk(
  'employees/updateOrgChartVisibility',
  async ({ employeeIds, isVisible }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateOrgChartVisibility({
        employee_ids: employeeIds,
        is_visible_in_org_chart: isVisible
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportEmployees = createAsyncThunk(
  'employees/exportEmployees',
  async ({ format = 'csv', filters = {} }, { rejectWithValue }) => {
    try {
      const response = await apiService.exportEmployees({ format, ...filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Status management thunks
export const fetchStatusDashboard = createAsyncThunk(
  'employees/fetchStatusDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getStatusDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateEmployeeStatus = createAsyncThunk(
  'employees/updateEmployeeStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.updateEmployeeStatus(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateStatuses = createAsyncThunk(
  'employees/bulkUpdateStatuses',
  async (employeeIds = [], { rejectWithValue }) => {
    try {
      const response = await apiService.bulkUpdateStatuses(employeeIds);
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
  
  // Single employee data
  currentEmployee: null,
  
  // Org chart data
  orgChart: [],
  
  // Filter options from backend
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
    contract_durations: [],
    line_managers: []
  },
  
  // Statistics
  statistics: null,
  statusDashboard: null,
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 25,
    totalEmployees: 0
  },
  
  // Loading states
  loading: false,
  loadingFilterOptions: false,
  loadingStatistics: false,
  loadingStatusDashboard: false,
  loadingEmployee: false,
  loadingOrgChart: false,
  creating: false,
  updating: false,
  deleting: false,
  bulkUpdating: false,
  exporting: false,
  updatingStatus: false,
  
  // Error states
  error: null,
  filterOptionsError: null,
  statisticsError: null,
  statusDashboardError: null,
  employeeError: null,
  orgChartError: null,
  
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
      state.pagination.pageSize = action.payload;
      state.pagination.currentPage = 1; // Reset to first page
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    toggleAdvancedFilters: (state) => {
      state.showAdvancedFilters = !state.showAdvancedFilters;
    },
    clearErrors: (state) => {
      state.error = null;
      state.filterOptionsError = null;
      state.statisticsError = null;
      state.statusDashboardError = null;
      state.employeeError = null;
      state.orgChartError = null;
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
        state.employees = action.payload.results || action.payload;
        
        // Handle pagination from backend response
        if (action.payload.count !== undefined) {
          state.pagination.totalEmployees = action.payload.count;
          state.pagination.totalPages = action.payload.total_pages || Math.ceil(action.payload.count / state.pagination.pageSize);
          state.pagination.currentPage = action.payload.current_page || 1;
          state.pagination.pageSize = action.payload.page_size || state.pagination.pageSize;
        } else {
          state.pagination.totalEmployees = state.employees.length;
        }
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
        state.pagination.totalEmployees += 1;
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
        state.pagination.totalEmployees -= 1;
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

    // Fetch org chart
    builder
      .addCase(fetchOrgChart.pending, (state) => {
        state.loadingOrgChart = true;
        state.orgChartError = null;
      })
      .addCase(fetchOrgChart.fulfilled, (state, action) => {
        state.loadingOrgChart = false;
        state.orgChart = action.payload;
      })
      .addCase(fetchOrgChart.rejected, (state, action) => {
        state.loadingOrgChart = false;
        state.orgChartError = action.payload;
      })

    // Update org chart visibility
    builder
      .addCase(updateOrgChartVisibility.pending, (state) => {
        state.bulkUpdating = true;
        state.error = null;
      })
      .addCase(updateOrgChartVisibility.fulfilled, (state, action) => {
        state.bulkUpdating = false;
        // Update employees in state
        if (action.payload.updated_employees) {
          action.payload.updated_employees.forEach(updatedEmp => {
            const index = state.employees.findIndex(emp => emp.id === updatedEmp.id);
            if (index !== -1) {
              state.employees[index].is_visible_in_org_chart = updatedEmp.is_visible_in_org_chart;
            }
          });
        }
      })
      .addCase(updateOrgChartVisibility.rejected, (state, action) => {
        state.bulkUpdating = false;
        state.error = action.payload;
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
        // Optionally refresh employee list
      })
      .addCase(bulkUpdateEmployees.rejected, (state, action) => {
        state.bulkUpdating = false;
        state.error = action.payload;
      })

    // Export employees
    builder
      .addCase(exportEmployees.pending, (state) => {
        state.exporting = true;
        state.error = null;
      })
      .addCase(exportEmployees.fulfilled, (state, action) => {
        state.exporting = false;
        // Handle export response
      })
      .addCase(exportEmployees.rejected, (state, action) => {
        state.exporting = false;
        state.error = action.payload;
      })

    // Status dashboard
    builder
      .addCase(fetchStatusDashboard.pending, (state) => {
        state.loadingStatusDashboard = true;
        state.statusDashboardError = null;
      })
      .addCase(fetchStatusDashboard.fulfilled, (state, action) => {
        state.loadingStatusDashboard = false;
        state.statusDashboard = action.payload;
      })
      .addCase(fetchStatusDashboard.rejected, (state, action) => {
        state.loadingStatusDashboard = false;
        state.statusDashboardError = action.payload;
      })

    // Update employee status
    builder
      .addCase(updateEmployeeStatus.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
      })
      .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        // Update employee in list if present
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          // Update status fields from response
          state.employees[index] = { ...state.employees[index], ...action.payload };
        }
      })
      .addCase(updateEmployeeStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.payload;
      })

    // Bulk update statuses
    builder
      .addCase(bulkUpdateStatuses.pending, (state) => {
        state.bulkUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateStatuses.fulfilled, (state, action) => {
        state.bulkUpdating = false;
        // Refresh status dashboard or employee list if needed
      })
      .addCase(bulkUpdateStatuses.rejected, (state, action) => {
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

// Selectors
export const selectEmployees = (state) => state.employees.employees;
export const selectCurrentEmployee = (state) => state.employees.currentEmployee;
export const selectEmployeeLoading = (state) => state.employees.loading;
export const selectEmployeeError = (state) => state.employees.error;
export const selectFilterOptions = (state) => state.employees.filterOptions;
export const selectSelectedEmployees = (state) => state.employees.selectedEmployees;
export const selectCurrentFilters = (state) => state.employees.currentFilters;
export const selectStatistics = (state) => state.employees.statistics;
export const selectStatusDashboard = (state) => state.employees.statusDashboard;
export const selectOrgChart = (state) => state.employees.orgChart;
export const selectPagination = (state) => state.employees.pagination;