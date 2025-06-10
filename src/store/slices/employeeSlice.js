// src/store/slices/employeeSlice.js - Fixed with proper backend integration
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Backend field mapping helper
const mapFrontendToBackend = (frontendParams) => {
  const mapping = {
    // Basic fields
    name: 'search',
    employeeName: 'search',
    employeeId: 'employee_id',
    email: 'user__email',
    
    // Organizational fields - exact backend field names
    businessFunction: 'business_function',
    businessFunctions: 'business_function',
    department: 'department', 
    departments: 'department',
    unit: 'unit',
    units: 'unit',
    jobFunction: 'job_function',
    jobFunctions: 'job_function',
    positionGroup: 'position_group',
    positionGroups: 'position_group',
    
    // Status and tags
    status: 'status',
    statuses: 'status',
    tags: 'tags',
    
    // Line manager fields
    lineManager: 'line_manager',
    lineManagerName: 'line_manager_name',
    lineManagerHc: 'line_manager_hc',
    
    // Job details
    jobTitle: 'job_title',
    jobTitles: 'job_title',
    grade: 'grade',
    grades: 'grade',
    
    // Personal info
    gender: 'gender',
    genders: 'gender',
    
    // Contract info
    contractDuration: 'contract_duration',
    contractDurations: 'contract_duration',
    
    // Date filters
    startDate: 'start_date',
    startDateFrom: 'start_date_from',
    startDateTo: 'start_date_to',
    endDate: 'end_date',
    endDateFrom: 'end_date_from',
    endDateTo: 'end_date_to',
    birthDateFrom: 'birth_date_from',
    birthDateTo: 'birth_date_to',
    
    // Other filters
    yearsOfServiceMin: 'years_of_service_min',
    yearsOfServiceMax: 'years_of_service_max',
    isVisibleInOrgChart: 'is_visible_in_org_chart'
  };

  const backendParams = {};
  
  Object.keys(frontendParams).forEach(key => {
    const backendKey = mapping[key] || key;
    const value = frontendParams[key];
    
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        backendParams[backendKey] = value.join(',');
      } else if (!Array.isArray(value)) {
        backendParams[backendKey] = value;
      }
    }
  });
  
  return backendParams;
};

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const backendParams = mapFrontendToBackend(params);
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
      // Ensure proper data structure for backend
      const backendData = {
        ...employeeData,
        unit: employeeData.unit || null,
        line_manager: employeeData.line_manager || null,
        tag_ids: Array.isArray(employeeData.tag_ids) ? employeeData.tag_ids : [],
        is_visible_in_org_chart: employeeData.is_visible_in_org_chart ?? true,
      };
      
      const response = await apiService.createEmployee(backendData);
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
      const backendData = {
        ...data,
        unit: data.unit || null,
        line_manager: data.line_manager || null,
        tag_ids: Array.isArray(data.tag_ids) ? data.tag_ids : [],
        is_visible_in_org_chart: data.is_visible_in_org_chart ?? true,
      };
      
      const response = await apiService.updateEmployee(id, backendData);
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
      const backendParams = mapFrontendToBackend(filters);
      const response = await apiService.exportEmployees({ format, ...backendParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Line managers fetch - separate thunk
export const fetchLineManagers = createAsyncThunk(
  'employees/fetchLineManagers',
  async (searchTerm = '', { rejectWithValue }) => {
    try {
      const response = await apiService.dropdownSearch('line_managers', searchTerm, 100);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Employee data
  employees: [],
  currentEmployee: null,
  totalEmployees: 0,
  
  // Org chart
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
  
  // Line managers for dropdown
  lineManagers: [],
  
  // Statistics
  statistics: null,
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 25,
    totalEmployees: 0
  },
  
  // Sorting - support multiple sorts like Excel
  sorting: [
    { field: 'employee_id', direction: 'asc' }
  ],
  
  // Selection state
  selectedEmployees: [],
  
  // Filter state
  currentFilters: {},
  appliedFilters: [],
  
  // UI state
  showAdvancedFilters: false,
  
  // Loading states
  loading: false,
  loadingFilterOptions: false,
  loadingStatistics: false,
  loadingEmployee: false,
  loadingOrgChart: false,
  loadingLineManagers: false,
  creating: false,
  updating: false,
  deleting: false,
  bulkUpdating: false,
  exporting: false,
  
  // Error states
  error: null,
  filterOptionsError: null,
  statisticsError: null,
  employeeError: null,
  orgChartError: null,
  lineManagersError: null,
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    // Selection actions
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
    
    // Filter actions
    setCurrentFilters: (state, action) => {
      state.currentFilters = action.payload;
      // Update applied filters for display
      state.appliedFilters = Object.entries(action.payload)
        .filter(([_, value]) => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== '' && value !== null && value !== undefined;
        })
        .map(([key, value]) => ({
          key,
          label: Array.isArray(value) ? `${key}: ${value.join(', ')}` : `${key}: ${value}`,
          value
        }));
    },
    clearFilters: (state) => {
      state.currentFilters = {};
      state.appliedFilters = [];
    },
    removeFilter: (state, action) => {
      const key = action.payload;
      delete state.currentFilters[key];
      state.appliedFilters = state.appliedFilters.filter(f => f.key !== key);
    },
    
    // Sorting actions - support multiple sorts
    setSorting: (state, action) => {
      const { field, direction } = action.payload;
      const existingIndex = state.sorting.findIndex(sort => sort.field === field);
      
      if (existingIndex > -1) {
        // Update existing sort
        state.sorting[existingIndex].direction = direction;
      } else {
        // Add new sort to the beginning
        state.sorting.unshift({ field, direction });
      }
      
      // Limit to 3 sorts max
      if (state.sorting.length > 3) {
        state.sorting = state.sorting.slice(0, 3);
      }
    },
    addSort: (state, action) => {
      const { field, direction } = action.payload;
      const existingIndex = state.sorting.findIndex(sort => sort.field === field);
      
      if (existingIndex > -1) {
        // Remove existing and add to front
        state.sorting.splice(existingIndex, 1);
      }
      
      state.sorting.unshift({ field, direction });
      
      // Limit to 3 sorts max
      if (state.sorting.length > 3) {
        state.sorting = state.sorting.slice(0, 3);
      }
    },
    removeSort: (state, action) => {
      const field = action.payload;
      state.sorting = state.sorting.filter(sort => sort.field !== field);
      
      // Ensure at least one sort exists
      if (state.sorting.length === 0) {
        state.sorting = [{ field: 'employee_id', direction: 'asc' }];
      }
    },
    clearSorting: (state) => {
      state.sorting = [{ field: 'employee_id', direction: 'asc' }];
    },
    
    // Pagination actions
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    
    // UI actions
    toggleAdvancedFilters: (state) => {
      state.showAdvancedFilters = !state.showAdvancedFilters;
    },
    setShowAdvancedFilters: (state, action) => {
      state.showAdvancedFilters = action.payload;
    },
    
    // Error actions
    clearErrors: (state) => {
      state.error = null;
      state.filterOptionsError = null;
      state.statisticsError = null;
      state.employeeError = null;
      state.orgChartError = null;
      state.lineManagersError = null;
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
        
        // Handle paginated response
        if (action.payload.results) {
          state.employees = action.payload.results;
          state.pagination = {
            currentPage: action.payload.current_page || 1,
            totalPages: action.payload.total_pages || 1,
            pageSize: action.payload.page_size || 25,
            totalEmployees: action.payload.count || 0
          };
        } else {
          state.employees = Array.isArray(action.payload) ? action.payload : [];
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
        // Add to beginning of list
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
        // Update in employees list
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        // Update current employee if it's the same
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
        // Remove from list
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        state.pagination.totalEmployees -= 1;
        // Clear current employee if it's the same
        if (state.currentEmployee?.id === action.payload) {
          state.currentEmployee = null;
        }
        // Remove from selection if selected
        state.selectedEmployees = state.selectedEmployees.filter(id => id !== action.payload);
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

    // Fetch line managers
    builder
      .addCase(fetchLineManagers.pending, (state) => {
        state.loadingLineManagers = true;
        state.lineManagersError = null;
      })
      .addCase(fetchLineManagers.fulfilled, (state, action) => {
        state.loadingLineManagers = false;
        state.lineManagers = action.payload;
      })
      .addCase(fetchLineManagers.rejected, (state, action) => {
        state.loadingLineManagers = false;
        state.lineManagersError = action.payload;
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

    // Bulk operations
    builder
      .addCase(bulkUpdateEmployees.pending, (state) => {
        state.bulkUpdating = true;
        state.error = null;
      })
      .addCase(bulkUpdateEmployees.fulfilled, (state, action) => {
        state.bulkUpdating = false;
        state.selectedEmployees = [];
      })
      .addCase(bulkUpdateEmployees.rejected, (state, action) => {
        state.bulkUpdating = false;
        state.error = action.payload;
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

    // Export employees
    builder
      .addCase(exportEmployees.pending, (state) => {
        state.exporting = true;
        state.error = null;
      })
      .addCase(exportEmployees.fulfilled, (state, action) => {
        state.exporting = false;
      })
      .addCase(exportEmployees.rejected, (state, action) => {
        state.exporting = false;
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
  removeFilter,
  setSorting,
  addSort,
  removeSort,
  clearSorting,
  setPageSize,
  setCurrentPage,
  toggleAdvancedFilters,
  setShowAdvancedFilters,
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
export const selectAppliedFilters = (state) => state.employees.appliedFilters;
export const selectStatistics = (state) => state.employees.statistics;
export const selectOrgChart = (state) => state.employees.orgChart;
export const selectPagination = (state) => state.employees.pagination;
export const selectSorting = (state) => state.employees.sorting;
export const selectLineManagers = (state) => state.employees.lineManagers;

// Helper selectors
export const selectFormattedEmployees = (state) => {
  return state.employees.employees.map(employee => ({
    ...employee,
    name: employee.name || employee.full_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
    display_name: employee.name || employee.full_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
    business_function_name: employee.business_function_name || employee.business_function?.name || '',
    business_function_code: employee.business_function_code || employee.business_function?.code || '',
    department_name: employee.department_name || employee.department?.name || '',
    unit_name: employee.unit_name || employee.unit?.name || '',
    job_function_name: employee.job_function_name || employee.job_function?.name || '',
    position_group_name: employee.position_group_name || employee.position_group?.name || '',
    position_group_level: employee.position_group_level || employee.position_group?.hierarchy_level || 0,
    status_name: employee.status_name || employee.status?.name || '',
    status_color: employee.status_color || employee.status?.color || '#6b7280',
    line_manager_name: employee.line_manager_name || employee.line_manager?.name || '',
    line_manager_hc_number: employee.line_manager_hc_number || employee.line_manager?.employee_id || '',
    contract_duration_display: employee.contract_duration_display || employee.contract_duration || '',
    tag_names: employee.tag_names || employee.tags?.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      type: tag.tag_type || tag.type
    })) || [],
  }));
};

// Sorting selector to convert to backend format
export const selectSortingForBackend = (state) => {
  const sorts = state.employees.sorting;
  return sorts.map(sort => 
    sort.direction === 'desc' ? `-${sort.field}` : sort.field
  ).join(',');
};