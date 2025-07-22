// src/store/slices/employeeSlice.js - Backend endpointlərinə uyğun yenilənilib
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { employeeAPI } from '../api/employeeAPI';

// ========================================
// ASYNC THUNKS - EMPLOYEE OPERATIONS
// ========================================

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getAll(params);
      return {
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous,
          current_page: response.data.current_page || params.page || 1,
          total_pages: response.data.total_pages || Math.ceil((response.data.count || 0) / (params.page_size || 25)),
          page_size: response.data.page_size || params.page_size || 25
        }
      };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
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
      return rejectWithValue(error.data || error.message);
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
      return rejectWithValue(error.data || error.message);
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
      return rejectWithValue(error.data || error.message);
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
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// STATISTICS & ANALYTICS
// ========================================

export const fetchStatistics = createAsyncThunk(
  'employees/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getStatistics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// BULK OPERATIONS
// ========================================

export const softDeleteEmployees = createAsyncThunk(
  'employees/softDeleteEmployees',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.softDelete(ids);
      return { ids, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
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
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// TAG MANAGEMENT
// ========================================

export const addEmployeeTag = createAsyncThunk(
  'employees/addEmployeeTag',
  async ({ employee_id, tag_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.addTag({ employee_id, tag_id });
      return { employee_id, tag: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const removeEmployeeTag = createAsyncThunk(
  'employees/removeEmployeeTag',
  async ({ employee_id, tag_id }, { rejectWithValue }) => {
    try {
      await employeeAPI.removeTag({ employee_id, tag_id });
      return { employee_id, tag_id };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkAddTags = createAsyncThunk(
  'employees/bulkAddTags',
  async ({ employee_ids, tag_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkAddTags(employee_ids, tag_id);
      return { employee_ids, tag_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkRemoveTags = createAsyncThunk(
  'employees/bulkRemoveTags',
  async ({ employee_ids, tag_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkRemoveTags(employee_ids, tag_id);
      return { employee_ids, tag_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// LINE MANAGER MANAGEMENT
// ========================================

export const assignLineManager = createAsyncThunk(
  'employees/assignLineManager',
  async ({ employee_id, line_manager_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.assignLineManager({ employee_id, line_manager_id });
      return { employee_id, line_manager_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkAssignLineManager = createAsyncThunk(
  'employees/bulkAssignLineManager',
  async ({ employee_ids, line_manager_id }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkAssignLineManager({ employee_ids, line_manager_id });
      return { employee_ids, line_manager_id, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// CONTRACT MANAGEMENT
// ========================================

export const extendEmployeeContract = createAsyncThunk(
  'employees/extendEmployeeContract',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.extendContract(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkExtendContracts = createAsyncThunk(
  'employees/bulkExtendContracts',
  async (data, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkExtendContracts(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const getContractExpiryAlerts = createAsyncThunk(
  'employees/getContractExpiryAlerts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getContractExpiryAlerts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const getContractsExpiringSoon = createAsyncThunk(
  'employees/getContractsExpiringSoon',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getContractsExpiringSoon(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// GRADING MANAGEMENT
// ========================================

export const fetchEmployeeGrading = createAsyncThunk(
  'employees/fetchEmployeeGrading',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getEmployeeGrading();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkUpdateEmployeeGrades = createAsyncThunk(
  'employees/bulkUpdateEmployeeGrades',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkUpdateGrades(updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const updateSingleEmployeeGrade = createAsyncThunk(
  'employees/updateSingleEmployeeGrade',
  async ({ employee_id, grading_level }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.updateSingleGrade(employee_id, grading_level);
      return { employee_id, grading_level, result: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// EXPORT & TEMPLATES
// ========================================

export const exportEmployees = createAsyncThunk(
  'employees/exportEmployees',
  async ({ format = 'excel', params = {} }, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.export({ format, ...params });
      return { format, recordCount: params.employee_ids?.length || 'all' };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const downloadEmployeeTemplate = createAsyncThunk(
  'employees/downloadEmployeeTemplate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.downloadTemplate();
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const bulkUploadEmployees = createAsyncThunk(
  'employees/bulkUploadEmployees',
  async (file, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.bulkUpload(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ACTIVITIES
// ========================================

export const fetchEmployeeActivities = createAsyncThunk(
  'employees/fetchEmployeeActivities',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getActivities(employeeId);
      return { employeeId, activities: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchEmployeeDirectReports = createAsyncThunk(
  'employees/fetchEmployeeDirectReports',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getDirectReports(employeeId);
      return { employeeId, directReports: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

export const fetchEmployeeStatusPreview = createAsyncThunk(
  'employees/fetchEmployeeStatusPreview',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getStatusPreview(employeeId);
      return { employeeId, statusPreview: response.data };
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// ORGANIZATIONAL HIERARCHY
// ========================================

export const fetchOrganizationalHierarchy = createAsyncThunk(
  'employees/fetchOrganizationalHierarchy',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeAPI.getOrganizationalHierarchy(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data || error.message);
    }
  }
);

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // Data
  employees: [],
  currentEmployee: null,
  statistics: {
    total_employees: 0,
    active_employees: 0,
    inactive_employees: 0,
    by_status: {},
    by_business_function: {},
    by_position_group: {},
    by_contract_duration: {},
    recent_hires_30_days: 0,
    upcoming_contract_endings_30_days: 0,
    status_update_analysis: {
      employees_needing_updates: 0,
      status_transitions: {}
    }
  },
  orgChart: [],
  activities: {},
  directReports: {},
  statusPreviews: {},
  contractExpiryAlerts: {
    success: false,
    days_ahead: 30,
    total_expiring: 0,
    urgent_employees: [],
    all_employees: [],
    urgency_breakdown: {},
    department_breakdown: {},
    line_manager_breakdown: {},
    notification_recommendations: {
      critical_contracts: [],
      renewal_decisions_needed: [],
      manager_notifications: []
    }
  },
  contractsExpiringSoon: {
    days: 30,
    count: 0,
    employees: []
  },

  // Grading data
  gradingData: {
    count: 0,
    employees: []
  },
  allGradingLevels: [
    { code: '_LD', display: '-LD', full_name: 'Lower Decile' },
    { code: '_LQ', display: '-LQ', full_name: 'Lower Quartile' },
    { code: '_M', display: '-M', full_name: 'Median' },
    { code: '_UQ', display: '-UQ', full_name: 'Upper Quartile' },
    { code: '_UD', display: '-UD', full_name: 'Upper Decile' }
  ],
  gradingStatistics: {
    totalEmployees: 0,
    gradedEmployees: 0,
    ungradedEmployees: 0,
    byPositionGroup: {},
    byGradingLevel: {},
    recentlyUpdated: []
  },

  // UI state
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
  
  // Loading states
  loading: {
    employees: false,
    employee: false,
    creating: false,
    updating: false,
    deleting: false,
    bulkOperations: false,
    statistics: false,
    grading: false,
    activities: false,
    directReports: false,
    statusPreview: false,
    exporting: false,
    statusUpdate: false,
    tagUpdate: false,
    lineManagerUpdate: false,
    contractUpdate: false,
    template: false,
    upload: false,
    contractAlerts: false
  },
  
  // Error states
  error: {
    employees: null,
    employee: null,
    create: null,
    update: null,
    delete: null,
    bulkOperations: null,
    statistics: null,
    grading: null,
    activities: null,
    directReports: null,
    statusPreview: null,
    export: null,
    statusUpdate: null,
    tagUpdate: null,
    lineManagerUpdate: null,
    contractUpdate: null,
    template: null,
    upload: null,
    contractAlerts: null
  },
  
  // Feature flags & settings
  showAdvancedFilters: false,
  viewMode: 'table',
  showGradingPanel: false,
  gradingMode: 'individual',
};

// ========================================
// SLICE DEFINITION
// ========================================

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
    
    // Sorting management
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
      state.pagination.page = 1;
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
      state.viewMode = action.payload;
    },

    // Grading UI state
    setShowGradingPanel: (state, action) => {
      state.showGradingPanel = action.payload;
    },
    
    toggleGradingPanel: (state) => {
      state.showGradingPanel = !state.showGradingPanel;
    },
    
    setGradingMode: (state, action) => {
      state.gradingMode = action.payload;
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
    
    // Optimistic updates
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
    },

    // Grading optimistic updates
    optimisticUpdateEmployeeGrade: (state, action) => {
      const { employee_id, grading_level } = action.payload;
      
      const employee = state.employees.find(emp => emp.id === employee_id);
      if (employee) {
        employee.grading_level = grading_level;
        employee.grading_display = grading_level || 'No Grade';
        employee._isOptimistic = true;
      }
      
      const gradingEmployee = state.gradingData.employees?.find(emp => 
        emp.employee_id === employee_id || emp.id === employee_id
      );
      if (gradingEmployee) {
        gradingEmployee.grading_level = grading_level;
        gradingEmployee.grading_display = grading_level || 'No Grade';
        gradingEmployee._isOptimistic = true;
      }
    }
  },
  
  extraReducers: (builder) => {
    // Fetch employees
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
      });

    // Fetch single employee
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
      });

    // Create employee
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
      });

    // Update employee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.loading.updating = true;
        state.error.update = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading.updating = false;
        const updatedEmployee = action.payload;
        const index = state.employees.findIndex(emp => emp.id === updatedEmployee.id);
        if (index !== -1) {
          state.employees[index] = updatedEmployee;
        }
        if (state.currentEmployee?.id === updatedEmployee.id) {
          state.currentEmployee = updatedEmployee;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.update = action.payload;
      });

    // Delete employee
    builder
      .addCase(deleteEmployee.pending, (state) => {
        state.loading.deleting = true;
        state.error.delete = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading.deleting = false;
        const deletedId = action.payload;
        state.employees = state.employees.filter(emp => emp.id !== deletedId);
        state.selectedEmployees = state.selectedEmployees.filter(id => id !== deletedId);
        if (state.currentEmployee?.id === deletedId) {
          state.currentEmployee = null;
        }
        state.statistics.total_employees -= 1;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error.delete = action.payload;
      });

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
      });

    // Soft delete employees
    builder
      .addCase(softDeleteEmployees.pending, (state) => {
        state.loading.bulkOperations = true;
        state.error.bulkOperations = null;
      })
      .addCase(softDeleteEmployees.fulfilled, (state, action) => {
        state.loading.bulkOperations = false;
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
      .addCase(softDeleteEmployees.rejected, (state, action) => {
        state.loading.bulkOperations = false;
        state.error.bulkOperations = action.payload;
      });

    // Restore employees
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

    // Tag management
    builder
      .addCase(addEmployeeTag.pending, (state) => {
        state.loading.tagUpdate = true;
        state.error.tagUpdate = null;
      })
      .addCase(addEmployeeTag.fulfilled, (state, action) => {
        state.loading.tagUpdate = false;
        const { employee_id, tag } = action.payload;
        const employee = state.employees.find(emp => emp.id === employee_id);
        if (employee) {
          if (!employee.tag_names) employee.tag_names = [];
          employee.tag_names.push(tag);
        }
      })
      .addCase(addEmployeeTag.rejected, (state, action) => {
        state.loading.tagUpdate = false;
        state.error.tagUpdate = action.payload;
      });

    builder
      .addCase(removeEmployeeTag.fulfilled, (state, action) => {
        const { employee_id, tag_id } = action.payload;
        const employee = state.employees.find(emp => emp.id === employee_id);
        if (employee && employee.tag_names) {
          employee.tag_names = employee.tag_names.filter(tag => tag.id !== tag_id);
        }
      });

    builder
      .addCase(bulkAddTags.fulfilled, (state, action) => {
        const { employee_ids, tag_id, result } = action.payload;
        if (result.tag_info) {
          employee_ids.forEach(emp_id => {
            const employee = state.employees.find(emp => emp.id === emp_id);
            if (employee) {
              if (!employee.tag_names) employee.tag_names = [];
              employee.tag_names.push(result.tag_info);
            }
          });
        }
        state.selectedEmployees = [];
      });

    builder
      .addCase(bulkRemoveTags.fulfilled, (state, action) => {
        const { employee_ids, tag_id } = action.payload;
        employee_ids.forEach(emp_id => {
          const employee = state.employees.find(emp => emp.id === emp_id);
          if (employee && employee.tag_names) {
            employee.tag_names = employee.tag_names.filter(tag => tag.id !== tag_id);
          }
        });
        state.selectedEmployees = [];
      });

    // Line manager management
    builder
      .addCase(assignLineManager.pending, (state) => {
        state.loading.lineManagerUpdate = true;
        state.error.lineManagerUpdate = null;
      })
      .addCase(assignLineManager.fulfilled, (state, action) => {
        state.loading.lineManagerUpdate = false;
        const { employee_id, line_manager_id, result } = action.payload;
        const employee = state.employees.find(emp => emp.id === employee_id);
        if (employee && result.line_manager_info) {
          employee.line_manager = line_manager_id;
          employee.line_manager_name = result.line_manager_info.name;
          employee.line_manager_hc_number = result.line_manager_info.employee_id;
        }
      })
      .addCase(assignLineManager.rejected, (state, action) => {
        state.loading.lineManagerUpdate = false;
        state.error.lineManagerUpdate = action.payload;
      });

    builder
      .addCase(bulkAssignLineManager.fulfilled, (state, action) => {
        const { employee_ids, line_manager_id, result } = action.payload;
        if (result.line_manager_info) {
          employee_ids.forEach(emp_id => {
            const employee = state.employees.find(emp => emp.id === emp_id);
            if (employee) {
              employee.line_manager = line_manager_id;
              employee.line_manager_name = result.line_manager_info.name;
              employee.line_manager_hc_number = result.line_manager_info.employee_id;
            }
          });
        }
        state.selectedEmployees = [];
      });

    // Contract management
    builder
      .addCase(extendEmployeeContract.pending, (state) => {
        state.loading.contractUpdate = true;
        state.error.contractUpdate = null;
      })
      .addCase(extendEmployeeContract.fulfilled, (state, action) => {
        state.loading.contractUpdate = false;
        const result = action.payload;
        if (result.updated_employee) {
          const employee = state.employees.find(emp => emp.id === result.updated_employee.employee_id);
          if (employee) {
            Object.assign(employee, result.updated_employee);
          }
        }
      })
      .addCase(extendEmployeeContract.rejected, (state, action) => {
        state.loading.contractUpdate = false;
        state.error.contractUpdate = action.payload;
      });

    builder
      .addCase(bulkExtendContracts.fulfilled, (state, action) => {
        const result = action.payload;
        if (result.updated_employees) {
          result.updated_employees.forEach(update => {
            const employee = state.employees.find(emp => emp.id === update.employee_id);
            if (employee) {
              Object.assign(employee, update);
            }
          });
        }
        state.selectedEmployees = [];
      });

    builder
      .addCase(getContractExpiryAlerts.pending, (state) => {
        state.loading.contractAlerts = true;
        state.error.contractAlerts = null;
      })
      .addCase(getContractExpiryAlerts.fulfilled, (state, action) => {
        state.loading.contractAlerts = false;
        state.contractExpiryAlerts = action.payload;
      })
      .addCase(getContractExpiryAlerts.rejected, (state, action) => {
        state.loading.contractAlerts = false;
        state.error.contractAlerts = action.payload;
      });

    builder
      .addCase(getContractsExpiringSoon.fulfilled, (state, action) => {
        state.contractsExpiringSoon = action.payload;
      });

    // Grading operations
    builder
      .addCase(fetchEmployeeGrading.pending, (state) => {
        state.loading.grading = true;
        state.error.grading = null;
      })
      .addCase(fetchEmployeeGrading.fulfilled, (state, action) => {
        state.loading.grading = false;
        state.gradingData = action.payload;
        
        const employees = action.payload.employees || [];
        const total = employees.length;
        const graded = employees.filter(emp => emp.grading_level && emp.grading_level !== '').length;
        
        state.gradingStatistics = {
          ...state.gradingStatistics,
          totalEmployees: total,
          gradedEmployees: graded,
          ungradedEmployees: total - graded
        };
      })
      .addCase(fetchEmployeeGrading.rejected, (state, action) => {
        state.loading.grading = false;
        state.error.grading = action.payload;
      });

    builder
      .addCase(bulkUpdateEmployeeGrades.pending, (state) => {
        state.loading.grading = true;
        state.error.grading = null;
      })
      .addCase(bulkUpdateEmployeeGrades.fulfilled, (state, action) => {
        state.loading.grading = false;
        const result = action.payload;
        
        if (result.updated_count && result.updated_count > 0) {
          state.employees.forEach(emp => {
            if (emp._isOptimistic) {
              delete emp._isOptimistic;
            }
          });
          
          if (state.gradingData.employees) {
            state.gradingData.employees.forEach(emp => {
              if (emp._isOptimistic) {
                delete emp._isOptimistic;
              }
            });
          }
        }
        
        state.selectedEmployees = [];
      })
      .addCase(bulkUpdateEmployeeGrades.rejected, (state, action) => {
        state.loading.grading = false;
        state.error.grading = action.payload;
      });

    builder
      .addCase(updateSingleEmployeeGrade.fulfilled, (state, action) => {
        const { employee_id, grading_level, result } = action.payload;
        
        const employee = state.employees.find(emp => emp.id === employee_id);
        if (employee) {
          employee.grading_level = grading_level;
          employee.grading_display = grading_level || 'No Grade';
          employee._isOptimistic = false;
        }
        
        const gradingEmployee = state.gradingData.employees?.find(emp => 
          emp.employee_id === employee_id || emp.id === employee_id
        );
        if (gradingEmployee) {
          gradingEmployee.grading_level = grading_level;
          gradingEmployee.grading_display = grading_level || 'No Grade';
          gradingEmployee._isOptimistic = false;
        }
      });

    // Export & template
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
      });

    builder
      .addCase(downloadEmployeeTemplate.pending, (state) => {
        state.loading.template = true;
        state.error.template = null;
      })
      .addCase(downloadEmployeeTemplate.fulfilled, (state) => {
        state.loading.template = false;
      })
      .addCase(downloadEmployeeTemplate.rejected, (state, action) => {
        state.loading.template = false;
        state.error.template = action.payload;
      });

    builder
      .addCase(bulkUploadEmployees.pending, (state) => {
        state.loading.upload = true;
        state.error.upload = null;
      })
      .addCase(bulkUploadEmployees.fulfilled, (state, action) => {
        state.loading.upload = false;
        const result = action.payload;
        
        if (result.created_employees && result.created_employees.length > 0) {
          state.employees.unshift(...result.created_employees);
          state.statistics.total_employees += result.successful || 0;
        }
      })
      .addCase(bulkUploadEmployees.rejected, (state, action) => {
        state.loading.upload = false;
        state.error.upload = action.payload;
      });

    // Organizational hierarchy
    builder
      .addCase(fetchOrganizationalHierarchy.fulfilled, (state, action) => {
        state.orgChart = action.payload;
      });

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
      });

    builder
      .addCase(fetchEmployeeDirectReports.pending, (state) => {
        state.loading.directReports = true;
        state.error.directReports = null;
      })
      .addCase(fetchEmployeeDirectReports.fulfilled, (state, action) => {
        state.loading.directReports = false;
        const { employeeId, directReports } = action.payload;
        state.directReports[employeeId] = directReports;
      })
      .addCase(fetchEmployeeDirectReports.rejected, (state, action) => {
        state.loading.directReports = false;
        state.error.directReports = action.payload;
      });

    builder
      .addCase(fetchEmployeeStatusPreview.pending, (state) => {
        state.loading.statusPreview = true;
        state.error.statusPreview = null;
      })
      .addCase(fetchEmployeeStatusPreview.fulfilled, (state, action) => {
        state.loading.statusPreview = false;
        const { employeeId, statusPreview } = action.payload;
        state.statusPreviews[employeeId] = statusPreview;
      })
      .addCase(fetchEmployeeStatusPreview.rejected, (state, action) => {
        state.loading.statusPreview = false;
        state.error.statusPreview = action.payload;
      });
  },
});

// Actions export
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
  setShowGradingPanel,
  toggleGradingPanel,
  setGradingMode,
  clearErrors,
  clearError,
  setError,
  clearCurrentEmployee,
  setQuickFilter,
  optimisticUpdateEmployee,
  optimisticDeleteEmployee,
  optimisticUpdateEmployeeGrade,
} = employeeSlice.actions;

// Basic selectors
export const selectEmployees = (state) => state.employees.employees;
export const selectCurrentEmployee = (state) => state.employees.currentEmployee;
export const selectEmployeeLoading = (state) => state.employees.loading;
export const selectEmployeeError = (state) => state.employees.error;
export const selectSelectedEmployees = (state) => state.employees.selectedEmployees;
export const selectCurrentFilters = (state) => state.employees.currentFilters;
export const selectAppliedFilters = (state) => state.employees.appliedFilters;
export const selectStatistics = (state) => state.employees.statistics;
export const selectPagination = (state) => state.employees.pagination;
export const selectSorting = (state) => state.employees.sorting;
export const selectGradingData = (state) => state.employees.gradingData;
export const selectGradingStatistics = (state) => state.employees.gradingStatistics;
export const selectAllGradingLevels = (state) => state.employees.allGradingLevels;
export const selectActivities = (state) => state.employees.activities;
export const selectDirectReports = (state) => state.employees.directReports;
export const selectStatusPreviews = (state) => state.employees.statusPreviews;
export const selectViewMode = (state) => state.employees.viewMode;
export const selectShowAdvancedFilters = (state) => state.employees.showAdvancedFilters;
export const selectShowGradingPanel = (state) => state.employees.showGradingPanel;
export const selectGradingMode = (state) => state.employees.gradingMode;
export const selectContractExpiryAlerts = (state) => state.employees.contractExpiryAlerts;
export const selectContractsExpiringSoon = (state) => state.employees.contractsExpiringSoon;

// Memoized selectors
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
      hasLeaveTag: (employee.tag_names || []).some(tag => 
        typeof tag === 'object' ? tag.type === 'LEAVE' : tag.toLowerCase().includes('leave')
      ),
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

// Grading selectors
export const selectEmployeesNeedingGrades = createSelector(
  [selectGradingData],
  (gradingData) => {
    const employees = gradingData.employees || [];
    return employees.filter(emp => !emp.grading_level || emp.grading_level === '');
  }
);

export const selectEmployeesByGradeLevel = createSelector(
  [selectGradingData],
  (gradingData) => {
    const byGrade = {};
    const employees = gradingData.employees || [];
    
    employees.forEach(emp => {
      const grade = emp.grading_level || 'No Grade';
      if (!byGrade[grade]) {
        byGrade[grade] = [];
      }
      byGrade[grade].push(emp);
    });
    
    return byGrade;
  }
);

export const selectEmployeesByPositionGroup = createSelector(
  [selectGradingData],
  (gradingData) => {
    const byPositionGroup = {};
    const employees = gradingData.employees || [];
    
    employees.forEach(emp => {
      const positionGroup = emp.position_group_name || 'Unknown';
      if (!byPositionGroup[positionGroup]) {
        byPositionGroup[positionGroup] = [];
      }
      byPositionGroup[positionGroup].push(emp);
    });
    
    return byPositionGroup;
  }
);

export const selectGradingProgress = createSelector(
  [selectGradingStatistics],
  (statistics) => {
    const { totalEmployees, gradedEmployees } = statistics;
    
    if (totalEmployees === 0) return 0;
    
    return Math.round((gradedEmployees / totalEmployees) * 100);
  }
);

export const selectGradingDistribution = createSelector(
  [selectEmployeesByGradeLevel, selectAllGradingLevels],
  (employeesByGrade, allLevels) => {
    const distribution = allLevels.map(level => ({
      ...level,
      count: employeesByGrade[level.code]?.length || 0,
      employees: employeesByGrade[level.code] || []
    }));
    
    distribution.push({
      code: 'NO_GRADE',
      display: 'No Grade',
      full_name: 'No Grade Assigned',
      count: employeesByGrade['No Grade']?.length || 0,
      employees: employeesByGrade['No Grade'] || []
    });
    
    return distribution;
  }
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
    onLeave: employees.filter(emp => (emp.status_name || emp.status) === 'ON_LEAVE'),
    statusUpdate: employees.filter(emp => emp.status_needs_update === true)
  })
);

// Loading & error state selectors
export const selectIsAnyLoading = createSelector(
  [selectEmployeeLoading],
  (loading) => Object.values(loading).some(Boolean)
);

export const selectHasAnyError = createSelector(
  [selectEmployeeError],
  (errors) => Object.values(errors).some(error => error !== null)
);

// Dashboard summary selectors
export const selectDashboardSummary = createSelector(
  [selectStatistics, selectEmployeesNeedingAttention, selectGradingProgress, selectContractExpiryAlerts],
  (statistics, needingAttention, gradingProgress, contractAlerts) => ({
    totalEmployees: statistics.total_employees,
    activeEmployees: statistics.active_employees,
    newHires: statistics.recent_hires_30_days,
    upcomingEndContracts: statistics.upcoming_contract_endings_30_days,
    employeesNeedingAttention: {
      noLineManager: needingAttention.noLineManager.length,
      noGrading: needingAttention.noGrading.length,
      onLeave: needingAttention.onLeave.length,
      contractEnding: needingAttention.contractEnding.length,
      statusUpdate: needingAttention.statusUpdate.length
    },
    gradingProgress,
    contractAlerts: {
      totalExpiring: contractAlerts.total_expiring,
      urgentContracts: contractAlerts.urgent_employees?.length || 0
    }
  })
);

export const selectEmployeeMetrics = createSelector(
  [selectEmployees, selectStatistics, selectGradingData],
  (employees, statistics, gradingData) => ({
    headcount: {
      total: employees.length,
      active: employees.filter(emp => emp.status_name === 'ACTIVE').length,
      onLeave: employees.filter(emp => emp.status_name === 'ON_LEAVE').length,
      onboarding: employees.filter(emp => emp.status_name === 'ONBOARDING').length
    },
    diversity: {
      genderDistribution: employees.reduce((acc, emp) => {
        const gender = emp.gender || 'Not Specified';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {}),
      averageAge: employees.reduce((sum, emp) => {
        if (emp.date_of_birth) {
          const age = new Date().getFullYear() - new Date(emp.date_of_birth).getFullYear();
          return sum + age;
        }
        return sum;
      }, 0) / employees.filter(emp => emp.date_of_birth).length || 0
    },
    performance: {
      gradingProgress: gradingData.employees?.length > 0 ? 
        (gradingData.employees.filter(emp => emp.grading_level).length / gradingData.employees.length) * 100 : 0,
      averageServiceYears: employees.reduce((sum, emp) => sum + (emp.years_of_service || 0), 0) / employees.length || 0
    },
    retention: {
      newHiresThisMonth: employees.filter(emp => {
        if (!emp.start_date) return false;
        const startDate = new Date(emp.start_date);
        const thisMonth = new Date();
        return startDate.getMonth() === thisMonth.getMonth() && 
               startDate.getFullYear() === thisMonth.getFullYear();
      }).length,
      upcomingContractEnds: employees.filter(emp => {
        if (!emp.contract_end_date) return false;
        const endDate = new Date(emp.contract_end_date);
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return endDate <= thirtyDaysFromNow;
      }).length
    }
  })
);

export default employeeSlice.reducer;