// src/store/slices/employeeSlice.js - ENHANCED: Complete integration with backend APIs
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { employeeAPI, tagAPI, gradingAPI } from '../api/employeeAPI';

// Async thunks for employee operations
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getAll(params);
      return {
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          totalPages: Math.ceil(response.data.count / (params.page_size || 20))
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

// Status management with automatic transitions
export const updateEmployeeStatus = createAsyncThunk(
  'employees/updateEmployeeStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateStatus(id);
      return { id, newStatus: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getStatusPreview = createAsyncThunk(
  'employees/getStatusPreview',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getStatusPreview(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkUpdateStatuses = createAsyncThunk(
  'employees/bulkUpdateStatuses',
  async (employeeIds, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkUpdateStatuses(employeeIds);
      return response.data;
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
  async ({ format = 'csv', params = {} }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.export(format, params);
      return { data: response.data, format };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Document management
export const fetchEmployeeDocuments = createAsyncThunk(
  'employees/fetchEmployeeDocuments',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getDocuments(employeeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadEmployeeDocument = createAsyncThunk(
  'employees/uploadEmployeeDocument',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.uploadDocument(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEmployeeDocument = createAsyncThunk(
  'employees/deleteEmployeeDocument',
  async (id, { rejectWithValue }) => {
    try {
      await employeeAPI.deleteDocument(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Org chart operations
export const fetchOrgChart = createAsyncThunk(
  'employees/fetchOrgChart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getOrgChart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateOrgChartVisibility = createAsyncThunk(
  'employees/updateOrgChartVisibility',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateOrgChartVisibility(data);
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
  filterOptions: {},
  statistics: {},
  orgChart: [],
  gradingData: [],
  documents: [],
  activities: [],
  
  // UI State
  selectedEmployees: [],
  currentFilters: {},
  appliedFilters: [],
  sorting: [],
  pagination: {
    page: 1,
    pageSize: 20,
    totalPages: 0,
    totalItems: 0
  },
  
  // Loading States
  loading: {
    employees: false,
    employee: false,
    creating: false,
    updating: false,
    deleting: false,
    filterOptions: false,
    statistics: false,
    orgChart: false,
    grading: false,
    documents: false,
    exporting: false,
    statusUpdate: false,
    tagUpdate: false
  },
  
  // Error States
  error: {
    employees: null,
    employee: null,
    create: null,
    update: null,
    delete: null,
    filterOptions: null,
    statistics: null,
    orgChart: null,
    grading: null,
    documents: null,
    export: null,
    statusUpdate: null,
    tagUpdate: null
  },
  
  // Feature flags
  showAdvancedFilters: false,
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
    
    // Pagination
    setCurrentPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    // UI state
    toggleAdvancedFilters: (state) => {
      state.showAdvancedFilters = !state.showAdvancedFilters;
    },
    
    setShowAdvancedFilters: (state, action) => {
      state.showAdvancedFilters = action.payload;
    },
    
    // Error management
    clearErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key] = null;
      });
    },
    
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
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
          ...action.payload.pagination
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
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading.creating = false;
        state.error.create = action.payload;
      })

    // Update Employee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.loading.updating = true;
        state.error.update = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading.updating = false;
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.update = action.payload;
      })

    // Delete Employee
    builder
      .addCase(deleteEmployee.pending, (state) => {
        state.loading.deleting = true;
        state.error.delete = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading.deleting = false;
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        state.selectedEmployees = state.selectedEmployees.filter(id => id !== action.payload);
        if (state.currentEmployee?.id === action.payload) {
          state.currentEmployee = null;
        }
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error.delete = action.payload;
      })

    // Bulk Delete
    builder
      .addCase(bulkDeleteEmployees.fulfilled, (state, action) => {
        const deletedIds = action.payload;
        state.employees = state.employees.filter(emp => !deletedIds.includes(emp.id));
        state.selectedEmployees = [];
      })

    // Filter Options
    builder
      .addCase(fetchFilterOptions.pending, (state) => {
        state.loading.filterOptions = true;
        state.error.filterOptions = null;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.loading.filterOptions = false;
        state.filterOptions = action.payload;
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.loading.filterOptions = false;
        state.error.filterOptions = action.payload;
      })

    // Statistics
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.loading.statistics = true;
        state.error.statistics = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.error.statistics = action.payload;
      })

    // Tag Management
    builder
      .addCase(addEmployeeTag.pending, (state) => {
        state.loading.tagUpdate = true;
        state.error.tagUpdate = null;
      })
      .addCase(addEmployeeTag.fulfilled, (state, action) => {
        state.loading.tagUpdate = false;
        const { employeeId, tag } = action.payload;
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee) {
          employee.tags = employee.tags || [];
          employee.tags.push(tag);
        }
      })
      .addCase(addEmployeeTag.rejected, (state, action) => {
        state.loading.tagUpdate = false;
        state.error.tagUpdate = action.payload;
      })

    builder
      .addCase(removeEmployeeTag.fulfilled, (state, action) => {
        const { employeeId, tagId } = action.payload;
        const employee = state.employees.find(emp => emp.id === employeeId);
        if (employee && employee.tags) {
          employee.tags = employee.tags.filter(tag => tag.id !== tagId);
        }
      })

    // Bulk Tag Operations
    builder
      .addCase(bulkAddTags.fulfilled, (state, action) => {
        const { employeeIds, result } = action.payload;
        // Update employees with new tags based on result
        employeeIds.forEach(empId => {
          const employee = state.employees.find(emp => emp.id === empId);
          if (employee && result.added_tags) {
            employee.tags = [...(employee.tags || []), ...result.added_tags];
          }
        });
      })

    builder
      .addCase(bulkRemoveTags.fulfilled, (state, action) => {
        const { employeeIds, tagIds } = action.payload;
        employeeIds.forEach(empId => {
          const employee = state.employees.find(emp => emp.id === empId);
          if (employee && employee.tags) {
            employee.tags = employee.tags.filter(tag => !tagIds.includes(tag.id));
          }
        });
      })

    // Status Management
    builder
      .addCase(updateEmployeeStatus.pending, (state) => {
        state.loading.statusUpdate = true;
        state.error.statusUpdate = null;
      })
      .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
        state.loading.statusUpdate = false;
        const { id, newStatus } = action.payload;
        const employee = state.employees.find(emp => emp.id === id);
        if (employee) {
          employee.status = newStatus.status;
          employee.status_display = newStatus.status_display;
          employee.status_color = newStatus.status_color;
        }
      })
      .addCase(updateEmployeeStatus.rejected, (state, action) => {
        state.loading.statusUpdate = false;
        state.error.statusUpdate = action.payload;
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
        // Update grading data after bulk grade update
        const updatedGrades = action.payload.updated_employees || [];
        updatedGrades.forEach(update => {
          const employee = state.employees.find(emp => emp.id === update.employee_id);
          if (employee) {
            employee.grading_level = update.grading_level;
            employee.grading_display = update.grading_display;
          }
        });
      })

    // Export
    builder
      .addCase(exportEmployees.pending, (state) => {
        state.loading.exporting = true;
        state.error.export = null;
      })
      .addCase(exportEmployees.fulfilled, (state) => {
        state.loading.exporting = false;
      })
      .addCase(exportEmployees.rejected, (state, action) => {
        state.loading.exporting = false;
        state.error.export = action.payload;
      })

    // Document Management
    builder
      .addCase(fetchEmployeeDocuments.pending, (state) => {
        state.loading.documents = true;
        state.error.documents = null;
      })
      .addCase(fetchEmployeeDocuments.fulfilled, (state, action) => {
        state.loading.documents = false;
        state.documents = action.payload;
      })
      .addCase(fetchEmployeeDocuments.rejected, (state, action) => {
        state.loading.documents = false;
        state.error.documents = action.payload;
      })

    builder
      .addCase(uploadEmployeeDocument.fulfilled, (state, action) => {
        state.documents.push(action.payload);
      })

    builder
      .addCase(deleteEmployeeDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
      })

    // Org Chart
    builder
      .addCase(fetchOrgChart.pending, (state) => {
        state.loading.orgChart = true;
        state.error.orgChart = null;
      })
      .addCase(fetchOrgChart.fulfilled, (state, action) => {
        state.loading.orgChart = false;
        state.orgChart = action.payload;
      })
      .addCase(fetchOrgChart.rejected, (state, action) => {
        state.loading.orgChart = false;
        state.error.orgChart = action.payload;
      });
  },
});

export const {
  setSelectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  clearSelection,
  setCurrentFilters,
  addFilter,
  removeFilter,
  clearFilters,
  setSorting,
  addSort,
  removeSort,
  clearSorting,
  setCurrentPage,
  setPageSize,
  toggleAdvancedFilters,
  setShowAdvancedFilters,
  clearErrors,
  clearCurrentEmployee,
} = employeeSlice.actions;

// Memoized selectors
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
export const selectDocuments = (state) => state.employees.documents;

// Complex selectors
export const selectFormattedEmployees = createSelector(
  [selectEmployees],
  (employees) => employees.map(employee => ({
    ...employee,
    formatted_name: `${employee.name || ''} ${employee.surname || ''}`.trim(),
    formatted_position: `${employee.job_title || ''} - ${employee.position_group_display || ''}`,
    formatted_department: `${employee.business_function_display || ''} / ${employee.department_display || ''}`,
    has_documents: employee.document_count > 0,
    is_line_manager: employee.direct_reports_count > 0,
    status_badge: {
      text: employee.status_display || employee.status,
      color: employee.status_color || '#gray',
      affects_headcount: employee.status_affects_headcount
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
        if (!value || value === 'all') return true;
        
        switch (key) {
          case 'status':
            return Array.isArray(value) 
              ? value.includes(employee.status)
              : employee.status === value;
          case 'business_function':
            return Array.isArray(value)
              ? value.includes(employee.business_function)
              : employee.business_function === value;
          case 'department':
            return Array.isArray(value)
              ? value.includes(employee.department)
              : employee.department === value;
          case 'position_group':
            return Array.isArray(value)
              ? value.includes(employee.position_group)
              : employee.position_group === value;
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

export default employeeSlice.reducer;