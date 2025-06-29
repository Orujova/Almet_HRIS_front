// src/store/slices/employeeSlice.js - UPDATED: Complete backend integration
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { employeeAPI, gradingAPI, orgChartAPI } from '../api/employeeAPI';

// Async thunks for employee operations
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getAll(params);
      return {
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count || response.data.length || 0,
          next: response.data.next,
          previous: response.data.previous,
          current_page: response.data.current_page || params.page || 1,
          total_pages: response.data.total_pages || Math.ceil((response.data.count || 0) / (params.page_size || 25)),
          page_size: response.data.page_size || params.page_size || 25
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEmployee = createAsyncThunk(
  'employees/fetchEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getById(id);
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
      const response = await employeeAPI.create(employeeData);
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
      const response = await employeeAPI.update(id, data);
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
      await employeeAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Filter options and statistics
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

// Bulk operations
export const bulkUpdateEmployees = createAsyncThunk(
  'employees/bulkUpdateEmployees',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkUpdate(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkDeleteEmployees = createAsyncThunk(
  'employees/bulkDeleteEmployees',
  async (ids, { rejectWithValue }) => {
    try {
      await employeeAPI.bulkDelete(ids);
      return ids;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const softDeleteEmployees = createAsyncThunk(
  'employees/softDeleteEmployees',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.softDelete(ids);
      return { ids, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const restoreEmployees = createAsyncThunk(
  'employees/restoreEmployees',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.restore(ids);
      return { ids, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Tag management
export const addEmployeeTag = createAsyncThunk(
  'employees/addEmployeeTag',
  async ({ employeeId, tagData }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.addTag(employeeId, tagData);
      return { employeeId, tag: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeEmployeeTag = createAsyncThunk(
  'employees/removeEmployeeTag',
  async ({ employeeId, tagId }, { rejectWithValue }) => {
    try {
      await employeeAPI.removeTag(employeeId, tagId);
      return { employeeId, tagId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkAddTags = createAsyncThunk(
  'employees/bulkAddTags',
  async ({ employeeIds, tagIds }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkAddTags(employeeIds, tagIds);
      return { employeeIds, tagIds, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkRemoveTags = createAsyncThunk(
  'employees/bulkRemoveTags',
  async ({ employeeIds, tagIds }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkRemoveTags(employeeIds, tagIds);
      return { employeeIds, tagIds, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Status management
export const updateEmployeeStatus = createAsyncThunk(
  'employees/updateEmployeeStatus',
  async (employeeIds, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateStatus(employeeIds);
      return { employeeIds, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateStatuses = createAsyncThunk(
  'employees/bulkUpdateStatuses',
  async (employeeIds, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateStatus(employeeIds);
      return { employeeIds, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const autoUpdateAllStatuses = createAsyncThunk(
  'employees/autoUpdateAllStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.autoUpdateStatuses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Line manager management
export const getLineManagers = createAsyncThunk(
  'employees/getLineManagers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getLineManagers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateLineManager = createAsyncThunk(
  'employees/updateLineManager',
  async ({ employeeId, lineManagerId }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateLineManager(employeeId, lineManagerId);
      return { employeeId, lineManagerId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateLineManager = createAsyncThunk(
  'employees/bulkUpdateLineManager',
  async ({ employeeIds, lineManagerId }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkUpdateLineManager(employeeIds, lineManagerId);
      return { employeeIds, lineManagerId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Grading management
export const fetchEmployeeGrading = createAsyncThunk(
  'employees/fetchEmployeeGrading',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gradingAPI.getEmployeeGrading();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateEmployeeGrades = createAsyncThunk(
  'employees/bulkUpdateEmployeeGrades',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await gradingAPI.bulkUpdateGrades(updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Export functionality
export const exportEmployees = createAsyncThunk(
  'employees/exportEmployees',
  async ({ format = 'excel', params = {} }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.export({ format, ...params });
      
      // Handle blob response for file download
      const blob = new Blob([response.data], {
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employees_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { format, recordCount: params.employee_ids?.length || 'all' };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Activities
export const fetchEmployeeActivities = createAsyncThunk(
  'employees/fetchEmployeeActivities',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getActivities(employeeId);
      return { employeeId, activities: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Org Chart
export const fetchOrgChart = createAsyncThunk(
  'employees/fetchOrgChart',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getOrgChart(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrgChartFullTree = createAsyncThunk(
  'employees/fetchOrgChartFullTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getFullTree();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  // Data
  employees: [],
  currentEmployee: null,
  filterOptions: {
    businessFunctions: [],
    departments: [],
    units: [],
    jobFunctions: [],
    positionGroups: [],
    employeeStatuses: [],
    employeeTags: [],
    contractDurations: [],
    gradingLevels: []
  },
  statistics: {
    total_employees: 0,
    active_employees: 0,
    inactive_employees: 0,
    by_status: {},
    by_business_function: {},
    by_position_group: {},
    by_contract_duration: {},
    recent_hires_30_days: 0,
    upcoming_contract_endings_30_days: 0
  },
  orgChart: [],
  gradingData: [],
  activities: {},
  lineManagers: [],
  
  // UI State
  selectedEmployees: [],
  currentFilters: {},
  appliedFilters: [],
  sorting: [],
  pagination: {
    page: 1,
    pageSize: 25,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  },
  
  // Loading States
  loading: {
    employees: false,
    employee: false,
    creating: false,
    updating: false,
    deleting: false,
    bulkOperations: false,
    filterOptions: false,
    statistics: false,
    orgChart: false,
    grading: false,
    activities: false,
    exporting: false,
    statusUpdate: false,
    tagUpdate: false,
    lineManagerUpdate: false
  },
  
  // Error States
  error: {
    employees: null,
    employee: null,
    create: null,
    update: null,
    delete: null,
    bulkOperations: null,
    filterOptions: null,
    statistics: null,
    orgChart: null,
    grading: null,
    activities: null,
    export: null,
    statusUpdate: null,
    tagUpdate: null,
    lineManagerUpdate: null
  },
  
  // Feature flags
  showAdvancedFilters: false,
  viewMode: 'table', // table, cards, org-chart
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    // Selection management
    setSelectedEmployees: (state, action) => {
      state.selectedEmployees = action.payload;
    },
    
    toggleEmployeeSelection: (state, action) => {
      const employeeId = action.payload;
      const index = state.selectedEmployees.indexOf(employeeId);
      
      if (index === -1) {
        state.selectedEmployees.push(employeeId);
      } else {
        state.selectedEmployees.splice(index, 1);
      }
    },
    
    selectAllEmployees: (state) => {
      state.selectedEmployees = state.employees.map(emp => emp.id);
    },
    
    selectAllVisible: (state) => {
      // Select all employees on current page
      state.selectedEmployees = [...new Set([
        ...state.selectedEmployees,
        ...state.employees.map(emp => emp.id)
      ])];
    },
    
    clearSelection: (state) => {
      state.selectedEmployees = [];
    },
    
    // Filter management
    setCurrentFilters: (state, action) => {
      state.currentFilters = action.payload;
    },
    
    addFilter: (state, action) => {
      const { key, value, label } = action.payload;
      state.currentFilters[key] = value;
      
      // Update applied filters for display
      const existingFilterIndex = state.appliedFilters.findIndex(f => f.key === key);
      if (existingFilterIndex !== -1) {
        state.appliedFilters[existingFilterIndex] = { key, value, label };
      } else {
        state.appliedFilters.push({ key, value, label });
      }
    },
    
    removeFilter: (state, action) => {
      const key = action.payload;
      delete state.currentFilters[key];
      state.appliedFilters = state.appliedFilters.filter(f => f.key !== key);
    },
    
    clearFilters: (state) => {
      state.currentFilters = {};
      state.appliedFilters = [];
    },
    
    updateFilter: (state, action) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete state.currentFilters[key];
        state.appliedFilters = state.appliedFilters.filter(f => f.key !== key);
      } else {
        state.currentFilters[key] = value;
      }
    },
    
    // Sorting management - Excel-style multi-sort
    setSorting: (state, action) => {
      const { field, direction } = action.payload;
      state.sorting = [{ field, direction }];
    },
    
    addSort: (state, action) => {
      const { field, direction } = action.payload;
      const existingIndex = state.sorting.findIndex(s => s.field === field);
      
      if (existingIndex !== -1) {
        state.sorting[existingIndex].direction = direction;
      } else {
        state.sorting.push({ field, direction });
      }
    },
    
    removeSort: (state, action) => {
      const field = action.payload;
      state.sorting = state.sorting.filter(s => s.field !== field);
    },
    
    clearSorting: (state) => {
      state.sorting = [];
    },
    
    toggleSort: (state, action) => {
      const field = action.payload;
      const existingSort = state.sorting.find(s => s.field === field);
      
      if (!existingSort) {
        state.sorting.push({ field, direction: 'asc' });
      } else if (existingSort.direction === 'asc') {
        existingSort.direction = 'desc';
      } else {
        state.sorting = state.sorting.filter(s => s.field !== field);
      }
    },
    
    // Pagination
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    goToNextPage: (state) => {
      if (state.pagination.hasNext) {
        state.pagination.page += 1;
      }
    },
    
    goToPreviousPage: (state) => {
      if (state.pagination.hasPrevious) {
        state.pagination.page -= 1;
      }
    },
    
    // UI state
    toggleAdvancedFilters: (state) => {
      state.showAdvancedFilters = !state.showAdvancedFilters;
    },
    
    setShowAdvancedFilters: (state, action) => {
      state.showAdvancedFilters = action.payload;
    },
    
    setViewMode: (state, action) => {
      state.viewMode = action.payload; // 'table', 'cards', 'org-chart'
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
    
    setError: (state, action) => {
      const { key, message } = action.payload;
      state.error[key] = message;
    },
    
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    
    // Quick actions
    setQuickFilter: (state, action) => {
      const { type, value } = action.payload;
      const quickFilters = {
        active: { status: ['ACTIVE'] },
        onboarding: { status: ['ONBOARDING'] },
        onLeave: { status: ['ON_LEAVE'] },
        probation: { status: ['PROBATION'] },
        noManager: { line_manager: null },
        needsGrading: { grading_level: '' }
      };
      
      if (quickFilters[type]) {
        state.currentFilters = { ...state.currentFilters, ...quickFilters[type] };
      }
    },
    
    // Optimistic updates for better UX
    optimisticUpdateEmployee: (state, action) => {
      const { id, updates } = action.payload;
      const employeeIndex = state.employees.findIndex(emp => emp.id === id);
      if (employeeIndex !== -1) {
        state.employees[employeeIndex] = { ...state.employees[employeeIndex], ...updates };
      }
      if (state.currentEmployee?.id === id) {
        state.currentEmployee = { ...state.currentEmployee, ...updates };
      }
    },
    
    optimisticDeleteEmployee: (state, action) => {
      const id = action.payload;
      state.employees = state.employees.filter(emp => emp.id !== id);
      state.selectedEmployees = state.selectedEmployees.filter(empId => empId !== id);
      if (state.currentEmployee?.id === id) {
        state.currentEmployee = null;
      }
    }
  },
  
  extraReducers: (builder) => {
    // Fetch Employees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading.employees = true;
        state.error.employees = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading.employees = false;
        state.employees = action.payload.data;
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
          hasNext: !!action.payload.pagination.next,
          hasPrevious: !!action.payload.pagination.previous
        };
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading.employees = false;
        state.error.employees = action.payload;
      })

    // Fetch Single Employee
    builder
      .addCase(fetchEmployee.pending, (state) => {
        state.loading.employee = true;
        state.error.employee = null;
      })
      .addCase(fetchEmployee.fulfilled, (state, action) => {
        state.loading.employee = false;
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployee.rejected, (state, action) => {
        state.loading.employee = false;
        state.error.employee = action.payload;
      })

    // Create Employee
    builder
      .addCase(createEmployee.pending, (state) => {
        state.loading.creating = true;
        state.error.create = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.employees.unshift(action.payload);
        state.statistics.total_employees += 1;
        state.statistics.active_employees += 1;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading.creating = false;
        state.error.create = action.payload;
      })

    // Update Employee
    builder
      .addCase(updateEmployeeStatus.rejected, (state, action) => {
        state.loading.statusUpdate = false;
        state.error.statusUpdate = action.payload;
      })

    // Auto Update All Statuses
    builder
      .addCase(autoUpdateAllStatuses.fulfilled, (state, action) => {
        const result = action.payload;
        if (result.updated_employees) {
          result.updated_employees.forEach(update => {
            const employee = state.employees.find(emp => emp.id === update.employee_id);
            if (employee) {
              employee.status_name = update.new_status;
              employee.status_color = update.status_color;
              employee.current_status_display = update.status_display;
            }
          });
        }
      })

    // Line Manager Management
    builder
      .addCase(getLineManagers.fulfilled, (state, action) => {
        state.lineManagers = action.payload;
      })

    builder
      .addCase(updateLineManager.pending, (state) => {
        state.loading.lineManagerUpdate = true;
        state.error.lineManagerUpdate = null;
      })
      .addCase(updateLineManager.fulfilled, (state, action) => {
        state.loading.lineManagerUpdate = false;
        const { employeeId, lineManagerId, result } = action.payload;
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee && result.line_manager_info) {
          employee.line_manager = lineManagerId;
          employee.line_manager_name = result.line_manager_info.name;
          employee.line_manager_hc_number = result.line_manager_info.employee_id;
        }
      })
      .addCase(updateLineManager.rejected, (state, action) => {
        state.loading.lineManagerUpdate = false;
        state.error.lineManagerUpdate = action.payload;
      })

    builder
      .addCase(bulkUpdateLineManager.fulfilled, (state, action) => {
        const { employeeIds, lineManagerId, result } = action.payload;
        if (result.line_manager_info) {
          employeeIds.forEach(empId => {
            const employee = state.employees.find(emp => emp.id === empId);
            if (employee) {
              employee.line_manager = lineManagerId;
              employee.line_manager_name = result.line_manager_info.name;
              employee.line_manager_hc_number = result.line_manager_info.employee_id;
            }
          });
        }
      })

    // Grading Management
    builder
      .addCase(fetchEmployeeGrading.pending, (state) => {
        state.loading.grading = true;
        state.error.grading = null;
      })
      .addCase(fetchEmployeeGrading.fulfilled, (state, action) => {
        state.loading.grading = false;
        state.gradingData = action.payload;
      })
      .addCase(fetchEmployeeGrading.rejected, (state, action) => {
        state.loading.grading = false;
        state.error.grading = action.payload;
      })

    builder
      .addCase(bulkUpdateEmployeeGrades.fulfilled, (state, action) => {
        const result = action.payload;
        if (result.updated_employees) {
          result.updated_employees.forEach(update => {
            const employee = state.employees.find(emp => emp.id === update.employee_id);
            if (employee) {
              employee.grading_level = update.grading_level;
              employee.grading_display = update.grading_display;
            }
          });
        }
      })

    // Export
    builder
      .addCase(exportEmployees.pending, (state) => {
        state.loading.exporting = true;
        state.error.export = null;
      })
      .addCase(exportEmployees.fulfilled, (state, action) => {
        state.loading.exporting = false;
        // Export success - file should be downloading
      })
      .addCase(exportEmployees.rejected, (state, action) => {
        state.loading.exporting = false;
        state.error.export = action.payload;
      })

    // Activities
    builder
      .addCase(fetchEmployeeActivities.pending, (state) => {
        state.loading.activities = true;
        state.error.activities = null;
      })
      .addCase(fetchEmployeeActivities.fulfilled, (state, action) => {
        state.loading.activities = false;
        const { employeeId, activities } = action.payload;
        state.activities[employeeId] = activities;
      })
      .addCase(fetchEmployeeActivities.rejected, (state, action) => {
        state.loading.activities = false;
        state.error.activities = action.payload;
      })

    // Org Chart
    builder
      .addCase(fetchOrgChart.pending, (state) => {
        state.loading.orgChart = true;
        state.error.orgChart = null;
      })
      .addCase(fetchOrgChart.fulfilled, (state, action) => {
        state.loading.orgChart = false;
        state.orgChart = action.payload.org_chart || action.payload.results || action.payload;
      })
      .addCase(fetchOrgChart.rejected, (state, action) => {
        state.loading.orgChart = false;
        state.error.orgChart = action.payload;
      })

    builder
      .addCase(fetchOrgChartFullTree.fulfilled, (state, action) => {
        state.orgChart = action.payload.org_chart || action.payload;
      })

    // Soft Delete
    builder
      .addCase(softDeleteEmployees.fulfilled, (state, action) => {
        const { ids } = action.payload;
        ids.forEach(id => {
          const employee = state.employees.find(emp => emp.id === id);
          if (employee) {
            employee.is_deleted = true;
            employee.deleted_at = new Date().toISOString();
          }
        });
        state.selectedEmployees = state.selectedEmployees.filter(id => !ids.includes(id));
      })

    // Restore
    builder
      .addCase(restoreEmployees.fulfilled, (state, action) => {
        const { ids } = action.payload;
        ids.forEach(id => {
          const employee = state.employees.find(emp => emp.id === id);
          if (employee) {
            employee.is_deleted = false;
            employee.deleted_at = null;
          }
        });
      });
  },
});

export const {
  setSelectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  selectAllVisible,
  clearSelection,
  setCurrentFilters,
  addFilter,
  removeFilter,
  clearFilters,
  updateFilter,
  setSorting,
  addSort,
  removeSort,
  clearSorting,
  toggleSort,
  setCurrentPage,
  setPageSize,
  goToNextPage,
  goToPreviousPage,
  toggleAdvancedFilters,
  setShowAdvancedFilters,
  setViewMode,
  clearErrors,
  clearError,
  setError,
  clearCurrentEmployee,
  setQuickFilter,
  optimisticUpdateEmployee,
  optimisticDeleteEmployee,
} = employeeSlice.actions;

// Basic selectors
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
export const selectGradingData = (state) => state.employees.gradingData;
export const selectActivities = (state) => state.employees.activities;
export const selectLineManagers = (state) => state.employees.lineManagers;
export const selectViewMode = (state) => state.employees.viewMode;
export const selectShowAdvancedFilters = (state) => state.employees.showAdvancedFilters;

// Memoized selectors for performance
export const selectFormattedEmployees = createSelector(
  [selectEmployees],
  (employees) => employees.map(employee => ({
    ...employee,
    fullName: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.name || '',
    displayName: employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
    positionInfo: `${employee.job_title || ''} - ${employee.position_group_name || ''}`,
    departmentInfo: `${employee.business_function_name || ''} / ${employee.department_name || ''}`,
    statusBadge: {
      text: employee.status_name || employee.current_status_display || 'Unknown',
      color: employee.status_color || '#gray',
      affects_headcount: employee.status_affects_headcount
    },
    contractInfo: {
      duration: employee.contract_duration_display || employee.contract_duration,
      startDate: employee.contract_start_date || employee.start_date,
      endDate: employee.contract_end_date || employee.end_date,
      isTemporary: employee.contract_duration !== 'PERMANENT'
    },
    serviceInfo: {
      yearsOfService: employee.years_of_service || 0,
      startDate: employee.start_date,
      isNewHire: (employee.years_of_service || 0) < 0.25
    },
    managementInfo: {
      hasLineManager: !!employee.line_manager,
      lineManagerName: employee.line_manager_name,
      directReportsCount: employee.direct_reports_count || 0,
      isLineManager: (employee.direct_reports_count || 0) > 0
    },
    gradingInfo: {
      level: employee.grading_level,
      display: employee.grading_display || (employee.grading_level ? employee.grading_level : 'No Grade'),
      hasGrade: !!employee.grading_level
    },
    tagInfo: {
      tags: employee.tags || [],
      tagNames: employee.tag_names || [],
      hasLeaveTag: (employee.tag_names || []).some(name => name.toLowerCase().includes('leave')),
      tagCount: (employee.tags || []).length
    }
  }))
);

export const selectSortingForBackend = createSelector(
  [selectSorting],
  (sorting) => {
    if (!sorting.length) return '';
    
    return sorting.map(sort => {
      const prefix = sort.direction === 'desc' ? '-' : '';
      return `${prefix}${sort.field}`;
    }).join(',');
  }
);

export const selectFilteredEmployeesCount = createSelector(
  [selectEmployees, selectCurrentFilters],
  (employees, filters) => {
    if (!Object.keys(filters).length) return employees.length;
    
    return employees.filter(employee => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all' || value === '') return true;
        
        switch (key) {
          case 'search':
            const searchTerm = value.toLowerCase();
            return (
              employee.name?.toLowerCase().includes(searchTerm) ||
              employee.email?.toLowerCase().includes(searchTerm) ||
              employee.employee_id?.toLowerCase().includes(searchTerm) ||
              employee.job_title?.toLowerCase().includes(searchTerm)
            );
          case 'status':
            return Array.isArray(value) 
              ? value.includes(employee.status_name || employee.status)
              : (employee.status_name || employee.status) === value;
          case 'business_function':
            return Array.isArray(value)
              ? value.includes(employee.business_function)
              : employee.business_function === parseInt(value);
          case 'department':
            return Array.isArray(value)
              ? value.includes(employee.department)
              : employee.department === parseInt(value);
          case 'position_group':
            return Array.isArray(value)
              ? value.includes(employee.position_group)
              : employee.position_group === parseInt(value);
          case 'tags':
            if (!employee.tags) return false;
            return Array.isArray(value)
              ? value.some(tagId => employee.tags.some(tag => tag.id === tagId))
              : employee.tags.some(tag => tag.id === value);
          default:
            return true;
        }
      });
    }).length;
  }
);

// Helper selectors for sorting
export const selectGetSortDirection = createSelector(
  [selectSorting],
  (sorting) => (field) => {
    const sort = sorting.find(s => s.field === field);
    return sort ? sort.direction : null;
  }
);

export const selectIsSorted = createSelector(
  [selectSorting],
  (sorting) => (field) => {
    return sorting.some(s => s.field === field);
  }
);

export const selectGetSortIndex = createSelector(
  [selectSorting],
  (sorting) => (field) => {
    const index = sorting.findIndex(s => s.field === field);
    return index !== -1 ? index + 1 : null;
  }
);

// Helper selector for API params
export const selectApiParams = createSelector(
  [selectCurrentFilters, selectSortingForBackend, selectPagination],
  (filters, ordering, pagination) => ({
    ...filters,
    ordering,
    page: pagination.page,
    page_size: pagination.pageSize
  })
);

// Selection helpers
export const selectSelectionInfo = createSelector(
  [selectSelectedEmployees, selectEmployees],
  (selectedEmployees, employees) => ({
    selectedCount: selectedEmployees.length,
    totalCount: employees.length,
    hasSelection: selectedEmployees.length > 0,
    isAllSelected: selectedEmployees.length === employees.length && employees.length > 0,
    isPartialSelection: selectedEmployees.length > 0 && selectedEmployees.length < employees.length
  })
);

// Statistics selectors
export const selectEmployeesByStatus = createSelector(
  [selectEmployees],
  (employees) => {
    const byStatus = {};
    employees.forEach(emp => {
      const status = emp.status_name || emp.status || 'Unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });
    return byStatus;
  }
);

export const selectEmployeesByDepartment = createSelector(
  [selectEmployees],
  (employees) => {
    const byDepartment = {};
    employees.forEach(emp => {
      const dept = emp.department_name || 'Unknown';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    });
    return byDepartment;
  }
);

export const selectNewHires = createSelector(
  [selectEmployees],
  (employees) => employees.filter(emp => (emp.years_of_service || 0) < 0.25)
);

export const selectEmployeesNeedingAttention = createSelector(
  [selectEmployees],
  (employees) => ({
    noLineManager: employees.filter(emp => !emp.line_manager),
    noGrading: employees.filter(emp => !emp.grading_level),
    contractEnding: employees.filter(emp => {
      if (!emp.contract_end_date) return false;
      const endDate = new Date(emp.contract_end_date);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return endDate <= thirtyDaysFromNow;
    }),
    onLeave: employees.filter(emp => (emp.status_name || emp.status) === 'ON_LEAVE')
  })
);

// Loading state selectors
export const selectIsAnyLoading = createSelector(
  [selectEmployeeLoading],
  (loading) => Object.values(loading).some(Boolean)
);

export const selectHasAnyError = createSelector(
  [selectEmployeeError],
  (errors) => Object.values(errors).some(error => error !== null)
);

export default employeeSlice.reducer;