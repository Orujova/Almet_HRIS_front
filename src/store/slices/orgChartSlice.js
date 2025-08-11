// src/store/slices/orgChartSlice.js - FIXED version with proper selectors
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { orgChartAPI } from '../../services/orgChartAPI';

// ========================================
// ASYNC THUNKS (unchanged)
// ========================================

export const fetchOrgChart = createAsyncThunk(
  'orgChart/fetchOrgChart',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getOrgChart(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrgChartEmployee = createAsyncThunk(
  'orgChart/fetchOrgChartEmployee',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getOrgChartEmployee(employeeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFullTreeWithVacancies = createAsyncThunk(
  'orgChart/fetchFullTreeWithVacancies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getFullTreeWithVacancies(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrgChartStatistics = createAsyncThunk(
  'orgChart/fetchOrgChartStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getOrgChartStatistics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchOrgChart = createAsyncThunk(
  'orgChart/searchOrgChart',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.searchOrgChart(searchParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchManagerTeam = createAsyncThunk(
  'orgChart/fetchManagerTeam',
  async ({ managerId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await orgChartAPI.getManagerTeam(managerId, params);
      return { managerId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // Main org chart data
  orgChart: [],
  fullTree: [],
  statistics: null,
  selectedEmployee: null,
  managerTeams: {},
  
  // Hierarchy data
  hierarchy: {
    roots: [],
    map: {}
  },
  
  // Loading states
  loading: {
    orgChart: false,
    employee: false,
    fullTree: false,
    statistics: false,
    search: false,
    managerTeam: false
  },
  
  // Error states
  error: {
    orgChart: null,
    employee: null,
    fullTree: null,
    statistics: null,
    search: null,
    managerTeam: null
  },
  
  // Filter state
  filters: {
    search: '',
    employee_search: '',
    job_title_search: '',
    department_search: '',
    business_function: [],
    department: [],
    unit: [],
    job_function: [],
    position_group: [],
    line_manager: [],
    status: [],
    grading_level: [],
    gender: [],
    show_top_level_only: false,
    managers_only: false,
    manager_team: null
  },
  
  // UI state - FIXED: Use array instead of Set
  ui: {
    viewMode: 'tree',
    showFilters: false,
    showLegend: false,
    isFullscreen: false,
    expandedNodes: [], // ✅ Array instead of Set
    selectedEmployeeModal: false,
    layoutDirection: 'TB'
  },
  
  // Pagination
  pagination: {
    page: 1,
    pageSize: 50,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  },
  
  // Cache management
  lastUpdated: null,
  cacheExpiry: 5 * 60 * 1000
};

// ========================================
// SLICE DEFINITION
// ========================================

const orgChartSlice = createSlice({
  name: 'orgChart',
  initialState,
  reducers: {
    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        ...initialState.filters,
        show_top_level_only: state.filters.show_top_level_only,
        managers_only: state.filters.managers_only
      };
    },
    
    resetAllFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    
    updateFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    
    // UI state management
    setViewMode: (state, action) => {
      state.ui.viewMode = action.payload;
    },
    
    setShowFilters: (state, action) => {
      state.ui.showFilters = action.payload;
    },
    
    setShowLegend: (state, action) => {
      state.ui.showLegend = action.payload;
    },
    
    setIsFullscreen: (state, action) => {
      state.ui.isFullscreen = action.payload;
    },
    
    setLayoutDirection: (state, action) => {
      state.ui.layoutDirection = action.payload;
    },
    
    // FIXED: Handle expanded nodes as array
    toggleExpandedNode: (state, action) => {
      const nodeId = action.payload;
      const expandedNodes = [...state.ui.expandedNodes];
      const index = expandedNodes.indexOf(nodeId);
      
      if (index !== -1) {
        expandedNodes.splice(index, 1);
      } else {
        expandedNodes.push(nodeId);
      }
      
      state.ui.expandedNodes = expandedNodes;
    },
    
    setExpandedNodes: (state, action) => {
      state.ui.expandedNodes = Array.isArray(action.payload) ? action.payload : [];
    },
    
    // Selected employee management
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
      state.ui.selectedEmployeeModal = !!action.payload;
    },
    
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
      state.ui.selectedEmployeeModal = false;
    },
    
    // Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    
    // Error management
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
    
    // Cache management
    invalidateCache: (state) => {
      state.lastUpdated = null;
    },
    
    // FIXED: Bulk operations for expanded nodes
    expandAllNodes: (state) => {
      const allNodeIds = state.orgChart
        .filter(emp => emp.direct_reports && emp.direct_reports > 0)
        .map(emp => emp.employee_id);
      state.ui.expandedNodes = allNodeIds;
    },
    
    collapseAllNodes: (state) => {
      state.ui.expandedNodes = [];
    },
    
    // Manager team management
    setManagerTeam: (state, action) => {
      const { managerId, data } = action.payload;
      state.managerTeams[managerId] = data;
    },
    
    clearManagerTeam: (state, action) => {
      const managerId = action.payload;
      if (state.managerTeams[managerId]) {
        delete state.managerTeams[managerId];
      }
    },
    
    // Hierarchy management
    updateHierarchy: (state, action) => {
      state.hierarchy = action.payload;
    },
    
    // Data refresh
    refreshData: (state) => {
      state.lastUpdated = null;
      state.orgChart = [];
      state.fullTree = [];
      state.statistics = null;
      state.managerTeams = {};
    }
  },
  
  extraReducers: (builder) => {
    // Fetch org chart
    builder
      .addCase(fetchOrgChart.pending, (state) => {
        state.loading.orgChart = true;
        state.error.orgChart = null;
      })
      .addCase(fetchOrgChart.fulfilled, (state, action) => {
        state.loading.orgChart = false;
        
        // Handle different response structures
        let orgChartData = [];
        if (action.payload?.org_chart && Array.isArray(action.payload.org_chart)) {
          orgChartData = action.payload.org_chart;
        } else if (Array.isArray(action.payload)) {
          orgChartData = action.payload;
        } else if (action.payload?.results && Array.isArray(action.payload.results)) {
          orgChartData = action.payload.results;
        }
        
        console.log('Org chart data loaded:', orgChartData.length, 'employees');
        state.orgChart = orgChartData;
        
        // Update pagination if present
        if (action.payload?.count !== undefined) {
          state.pagination.totalCount = action.payload.count;
          state.pagination.hasNext = !!action.payload.next;
          state.pagination.hasPrev = !!action.payload.previous;
        }
        
        // Build hierarchy
        const hierarchyMap = {};
        const roots = [];
        
        orgChartData.forEach(emp => {
          hierarchyMap[emp.employee_id] = { 
            ...emp, 
            children: [] 
          };
        });
        
        orgChartData.forEach(emp => {
          if (emp.line_manager_id && hierarchyMap[emp.line_manager_id]) {
            hierarchyMap[emp.line_manager_id].children.push(emp.employee_id);
          } else {
            roots.push(emp.employee_id);
          }
        });
        
        console.log('Hierarchy built - roots:', roots, 'total employees:', Object.keys(hierarchyMap).length);
        
        state.hierarchy = { 
          roots: roots, 
          map: hierarchyMap 
        };
        state.lastUpdated = Date.now();
        
        // FIXED: Initialize expanded nodes more intelligently
        if (roots.length > 0) {
          // Only set initial expanded nodes if none exist
          if (state.ui.expandedNodes.length === 0) {
            // Find top-level managers (those with the most reports at highest levels)
            const topManagers = orgChartData
              .filter(emp => emp.direct_reports > 0)
              .filter(emp => emp.level_to_ceo <= 2) // Top 2-3 levels
              .sort((a, b) => (b.direct_reports || 0) - (a.direct_reports || 0))
              .slice(0, 10); // Limit to avoid performance issues
            
            const initialExpanded = [...roots, ...topManagers.map(emp => emp.employee_id)];
            
            state.ui.expandedNodes = [...new Set(initialExpanded)]; // Remove duplicates
            console.log('Initial expanded nodes set:', state.ui.expandedNodes.length);
          }
        }
      })
      .addCase(fetchOrgChart.rejected, (state, action) => {
        state.loading.orgChart = false;
        state.error.orgChart = action.payload;
      });

    // Fetch specific employee
    builder
      .addCase(fetchOrgChartEmployee.pending, (state) => {
        state.loading.employee = true;
        state.error.employee = null;
      })
      .addCase(fetchOrgChartEmployee.fulfilled, (state, action) => {
        state.loading.employee = false;
        state.selectedEmployee = action.payload;
        state.ui.selectedEmployeeModal = true;
      })
      .addCase(fetchOrgChartEmployee.rejected, (state, action) => {
        state.loading.employee = false;
        state.error.employee = action.payload;
      });

    // Fetch full tree with vacancies
    builder
      .addCase(fetchFullTreeWithVacancies.pending, (state) => {
        state.loading.fullTree = true;
        state.error.fullTree = null;
      })
      .addCase(fetchFullTreeWithVacancies.fulfilled, (state, action) => {
        state.loading.fullTree = false;
        
        if (action.payload.org_chart) {
          state.fullTree = action.payload.org_chart;
        } else if (Array.isArray(action.payload)) {
          state.fullTree = action.payload;
        } else {
          state.fullTree = [];
        }
        
        if (state.orgChart.length === 0) {
          state.orgChart = state.fullTree;
          const hierarchy = orgChartAPI.buildHierarchy(state.orgChart);
          state.hierarchy = hierarchy;
        }
      })
      .addCase(fetchFullTreeWithVacancies.rejected, (state, action) => {
        state.loading.fullTree = false;
        state.error.fullTree = action.payload;
      });

    // Fetch statistics
    builder
      .addCase(fetchOrgChartStatistics.pending, (state) => {
        state.loading.statistics = true;
        state.error.statistics = null;
      })
      .addCase(fetchOrgChartStatistics.fulfilled, (state, action) => {
        state.loading.statistics = false;
        state.statistics = action.payload;
      })
      .addCase(fetchOrgChartStatistics.rejected, (state, action) => {
        state.loading.statistics = false;
        state.error.statistics = action.payload;
      });

    // Search org chart
    builder
      .addCase(searchOrgChart.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchOrgChart.fulfilled, (state, action) => {
        state.loading.search = false;
        
        if (action.payload.org_chart) {
          state.orgChart = action.payload.org_chart;
        } else if (Array.isArray(action.payload)) {
          state.orgChart = action.payload;
        } else {
          state.orgChart = [];
        }
        
        if (action.payload.count !== undefined) {
          state.pagination.totalCount = action.payload.count;
          state.pagination.hasNext = !!action.payload.next;
          state.pagination.hasPrev = !!action.payload.previous;
        }
        
        const hierarchy = orgChartAPI.buildHierarchy(state.orgChart);
        state.hierarchy = hierarchy;
      })
      .addCase(searchOrgChart.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search = action.payload;
      });

    // Fetch manager team
    builder
      .addCase(fetchManagerTeam.pending, (state) => {
        state.loading.managerTeam = true;
        state.error.managerTeam = null;
      })
      .addCase(fetchManagerTeam.fulfilled, (state, action) => {
        state.loading.managerTeam = false;
        const { managerId, data } = action.payload;
        
        if (data.org_chart) {
          state.managerTeams[managerId] = data.org_chart;
        } else if (Array.isArray(data)) {
          state.managerTeams[managerId] = data;
        } else {
          state.managerTeams[managerId] = [];
        }
      })
      .addCase(fetchManagerTeam.rejected, (state, action) => {
        state.loading.managerTeam = false;
        state.error.managerTeam = action.payload;
      });
  },
});

// Export actions
export const {
  setFilters,
  clearFilters,
  resetAllFilters,
  updateFilter,
  setViewMode,
  setShowFilters,
  setShowLegend,
  setIsFullscreen,
  setLayoutDirection,
  toggleExpandedNode,
  setExpandedNodes,
  setSelectedEmployee,
  clearSelectedEmployee,
  setPagination,
  setPage,
  setPageSize,
  clearErrors,
  clearError,
  invalidateCache,
  expandAllNodes,
  collapseAllNodes,
  setManagerTeam,
  clearManagerTeam,
  updateHierarchy,
  refreshData
} = orgChartSlice.actions;

export default orgChartSlice.reducer;

// ========================================
// SELECTORS - FIXED to avoid identity function warnings
// ========================================

// Base selectors with transformation
const selectOrgChartState = (state) => state.orgChart || {};

// FIXED: Proper selectors with transformation
export const selectOrgChart = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.orgChart || []
);

export const selectFullTree = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.fullTree || []
);

export const selectStatistics = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.statistics || null
);

export const selectSelectedEmployee = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.selectedEmployee || null
);

export const selectHierarchy = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.hierarchy || { roots: [], map: {} }
);

export const selectManagerTeams = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.managerTeams || {}
);

// Filter selectors
export const selectFilters = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.filters || initialState.filters
);

export const selectActiveFilters = createSelector(
  [selectFilters],
  (filters) => {
    const activeFilters = {};
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '' && 
          (Array.isArray(value) ? value.length > 0 : value !== false)) {
        activeFilters[key] = value;
      }
    });
    
    return activeFilters;
  }
);

// UI selectors
export const selectUIState = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.ui || initialState.ui
);

export const selectViewMode = createSelector(
  [selectUIState],
  (uiState) => uiState.viewMode || 'tree'
);

export const selectShowFilters = createSelector(
  [selectUIState],
  (uiState) => Boolean(uiState.showFilters)
);

export const selectShowLegend = createSelector(
  [selectUIState],
  (uiState) => Boolean(uiState.showLegend)
);

export const selectIsFullscreen = createSelector(
  [selectUIState],
  (uiState) => Boolean(uiState.isFullscreen)
);

// FIXED: Expanded nodes selector with proper transformation
export const selectExpandedNodes = createSelector(
  [selectUIState],
  (uiState) => {
    const expandedNodes = uiState.expandedNodes;
    if (Array.isArray(expandedNodes)) {
      return expandedNodes;
    }
    if (expandedNodes instanceof Set) {
      return Array.from(expandedNodes);
    }
    return [];
  }
);

export const selectLayoutDirection = createSelector(
  [selectUIState],
  (uiState) => uiState.layoutDirection || 'TB'
);

// Loading and error selectors
export const selectOrgChartLoading = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.loading || initialState.loading
);

export const selectIsLoading = createSelector(
  [selectOrgChartLoading],
  (loading) => Object.values(loading).some(isLoading => Boolean(isLoading))
);

export const selectOrgChartErrors = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.error || initialState.error
);

export const selectHasErrors = createSelector(
  [selectOrgChartErrors],
  (errors) => Object.values(errors).some(error => error !== null)
);

// Pagination selectors
export const selectPagination = createSelector(
  [selectOrgChartState],
  (orgChartState) => orgChartState.pagination || initialState.pagination
);

// Complex computed selectors
export const selectFilteredOrgChart = createSelector(
  [selectOrgChart, selectActiveFilters],
  (orgChart, activeFilters) => {
    console.log('Filtering orgChart:', orgChart?.length, 'employees with filters:', Object.keys(activeFilters));
    
    if (!Array.isArray(orgChart) || Object.keys(activeFilters).length === 0) {
      return orgChart;
    }
    
    const filtered = orgChart.filter(employee => {
      // Text search filters
      if (activeFilters.search) {
        const searchTerm = activeFilters.search.toLowerCase();
        const searchableFields = [
          employee.name,
          employee.employee_id,
          employee.email,
          employee.title,
          employee.department,
          employee.unit,
          employee.business_function
        ].filter(Boolean);
        
        const matchesSearch = searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(searchTerm)
        );
        if (!matchesSearch) return false;
      }
      
      // Employee specific search
      if (activeFilters.employee_search) {
        const searchTerm = activeFilters.employee_search.toLowerCase();
        const employeeFields = [
          employee.name,
          employee.employee_id,
          employee.email
        ].filter(Boolean);
        
        const matchesEmployeeSearch = employeeFields.some(field =>
          field && field.toString().toLowerCase().includes(searchTerm)
        );
        if (!matchesEmployeeSearch) return false;
      }
      
      // Job title search
      if (activeFilters.job_title_search) {
        const searchTerm = activeFilters.job_title_search.toLowerCase();
        if (!employee.title || !employee.title.toString().toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      
      // Department search
      if (activeFilters.department_search) {
        const searchTerm = activeFilters.department_search.toLowerCase();
        if (!employee.department || !employee.department.toString().toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      
      // Multi-select filters
      if (activeFilters.business_function && Array.isArray(activeFilters.business_function) && activeFilters.business_function.length > 0) {
        if (!employee.business_function || !activeFilters.business_function.includes(employee.business_function)) {
          return false;
        }
      }
      
      if (activeFilters.department && Array.isArray(activeFilters.department) && activeFilters.department.length > 0) {
        if (!employee.department || !activeFilters.department.includes(employee.department)) {
          return false;
        }
      }
      
      if (activeFilters.unit && Array.isArray(activeFilters.unit) && activeFilters.unit.length > 0) {
        if (!employee.unit || !activeFilters.unit.includes(employee.unit)) {
          return false;
        }
      }
      
      if (activeFilters.position_group && Array.isArray(activeFilters.position_group) && activeFilters.position_group.length > 0) {
        if (!employee.position_group || !activeFilters.position_group.includes(employee.position_group)) {
          return false;
        }
      }
      
      if (activeFilters.line_manager && Array.isArray(activeFilters.line_manager) && activeFilters.line_manager.length > 0) {
        if (!employee.line_manager_id || !activeFilters.line_manager.includes(employee.line_manager_id)) {
          return false;
        }
      }
      
      // Boolean filters
      if (activeFilters.show_top_level_only) {
        if (employee.line_manager_id) {
          return false;
        }
      }
      
      if (activeFilters.managers_only) {
        if (!employee.direct_reports || employee.direct_reports === 0) {
          return false;
        }
      }
      
      // Manager team filter
      if (activeFilters.manager_team) {
        if (employee.line_manager_id !== activeFilters.manager_team) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log('Filtered result:', filtered.length, 'employees');
    return filtered;
  }
);

// FIXED: React Flow selector with proper data transformation
export const selectOrgChartForReactFlow = createSelector(
  [selectFilteredOrgChart, selectExpandedNodes],
  (filteredChart, expandedNodes) => {
    console.log('selectOrgChartForReactFlow input:', {
      filteredChartLength: filteredChart?.length || 0,
      expandedNodesLength: expandedNodes?.length || 0,
      expandedNodes: expandedNodes,
      firstEmployee: filteredChart?.[0]
    });
    
    if (!Array.isArray(filteredChart) || filteredChart.length === 0) {
      console.log('No filtered chart data available');
      return { nodes: [], edges: [] };
    }
    
    // If no nodes are expanded, expand root nodes by default
    const expandedSet = new Set(expandedNodes?.length > 0 ? expandedNodes : []);
    
    // Find root employees (those without line_manager_id)
    const rootEmployees = filteredChart.filter(emp => !emp.line_manager_id);
    console.log('Root employees found:', rootEmployees.length, 'out of', filteredChart.length, 'total employees');
    
    // Check if we should treat this as a flat structure or if we have any hierarchy relationships
    const hasHierarchyRelationships = filteredChart.some(emp => emp.line_manager_id);
    console.log('Has hierarchy relationships:', hasHierarchyRelationships);
    
    // For flat structure or when all employees have managers (circular/complex hierarchy)
    if (rootEmployees.length === 0 || rootEmployees.length === filteredChart.length || !hasHierarchyRelationships) {
      console.log('Using flat/simple structure approach - showing all employees');
      
      const nodes = filteredChart.map(emp => ({
        id: emp.employee_id,
        type: 'employee',
        position: { x: 0, y: 0 },
        data: {
          employee: emp,
          directReports: emp.direct_reports || 0
        }
      }));
      
      // Create edges based on line_manager_id relationships
      const edges = filteredChart
        .filter(emp => emp.line_manager_id)
        .filter(emp => filteredChart.some(manager => manager.employee_id === emp.line_manager_id)) // Only if manager exists in data
        .map(emp => ({
          id: `${emp.line_manager_id}-${emp.employee_id}`,
          source: emp.line_manager_id,
          target: emp.employee_id,
          type: 'smoothstep',
          animated: false,
          style: { 
            stroke: '#64748b', 
            strokeWidth: 2,
            opacity: 0.8 
          }
        }));
      
      const result = { nodes, edges };
      console.log('Simple structure result:', {
        nodes: result.nodes.length,
        edges: result.edges.length,
        sampleNode: result.nodes[0]?.id,
        sampleEdge: result.edges[0]?.id
      });
      
      return result;
    }
    
    // If no expanded nodes and we have roots, expand the first few levels
    if (expandedNodes?.length === 0 && rootEmployees.length > 0) {
      rootEmployees.forEach(root => expandedSet.add(root.employee_id));
      
      // Also expand their direct reports for better initial view
      rootEmployees.forEach(root => {
        const directReports = filteredChart.filter(emp => emp.line_manager_id === root.employee_id);
        directReports.forEach(report => expandedSet.add(report.employee_id));
      });
    }
    
    const getVisibleEmployees = (employees) => {
      const hierarchyMap = {};
      
      // Build hierarchy map
      employees.forEach(emp => {
        hierarchyMap[emp.employee_id] = { ...emp, children: [] };
      });
      
      // Establish parent-child relationships
      employees.forEach(emp => {
        if (emp.line_manager_id && hierarchyMap[emp.line_manager_id]) {
          hierarchyMap[emp.line_manager_id].children.push(hierarchyMap[emp.employee_id]);
        }
      });
      
      console.log('Hierarchy map built:', Object.keys(hierarchyMap).length, 'employees');
      
      // Get visible nodes based on expansion state
      const getVisibleNodes = (nodeId, parentExpanded = true) => {
        const node = hierarchyMap[nodeId];
        if (!node) return [];
        
        // Always show the node if its parent is expanded
        const visibleNodes = parentExpanded ? [node] : [];
        const isExpanded = expandedSet.has(nodeId);
        
        // If this node is expanded, show its children
        if (isExpanded && node.children && node.children.length > 0) {
          node.children.forEach(child => {
            visibleNodes.push(...getVisibleNodes(child.employee_id, parentExpanded));
          });
        }
        
        return visibleNodes;
      };
      
      // Start with root nodes
      const visibleEmployees = [];
      rootEmployees.forEach(root => {
        visibleEmployees.push(...getVisibleNodes(root.employee_id, true));
      });
      
      console.log('Visible employees:', visibleEmployees.length);
      return visibleEmployees;
    };
    
    const visibleEmployees = getVisibleEmployees(filteredChart);
    
    // Create nodes for React Flow
    const nodes = visibleEmployees.map(emp => ({
      id: emp.employee_id,
      type: 'employee',
      position: { x: 0, y: 0 },
      data: {
        employee: emp,
        directReports: emp.direct_reports || 0
      }
    }));
    
    // Create edges for React Flow - only between visible employees
    const visibleEmployeeIds = new Set(visibleEmployees.map(emp => emp.employee_id));
    const edges = visibleEmployees
      .filter(emp => 
        emp.line_manager_id && 
        visibleEmployeeIds.has(emp.line_manager_id)
      )
      .map(emp => ({
        id: `${emp.line_manager_id}-${emp.employee_id}`,
        source: emp.line_manager_id,
        target: emp.employee_id,
        type: 'smoothstep',
        animated: false,
        style: { 
          stroke: '#64748b', 
          strokeWidth: 2,
          opacity: 0.8 
        }
      }));
    
    const result = { nodes, edges };
    console.log('ReactFlow data generated:', {
      nodes: result.nodes.length,
      edges: result.edges.length,
      expandedSet: Array.from(expandedSet)
    });
    
    return result;
  }
);

// Summary selector
export const selectOrgChartSummary = createSelector(
  [selectOrgChart, selectStatistics],
  (orgChart, statistics) => {
    if (!Array.isArray(orgChart)) {
      return {
        totalEmployees: 0,
        totalManagers: 0,
        totalDepartments: 0,
        totalBusinessFunctions: 0,
        ...statistics?.overview
      };
    }
    
    const totalEmployees = orgChart.length;
    const totalManagers = orgChart.filter(emp => emp.direct_reports && emp.direct_reports > 0).length;
    const departments = new Set(orgChart.map(emp => emp.department).filter(Boolean));
    const businessFunctions = new Set(orgChart.map(emp => emp.business_function).filter(Boolean));
    
    return {
      totalEmployees,
      totalManagers,
      totalDepartments: departments.size,
      totalBusinessFunctions: businessFunctions.size,
      ...statistics?.overview
    };
  }
);

// Other utility selectors
export const selectManagerTeam = createSelector(
  [selectManagerTeams, (state, managerId) => managerId],
  (managerTeams, managerId) => managerTeams[managerId] || []
);

export const selectEmployeeById = createSelector(
  [selectOrgChart, (state, employeeId) => employeeId],
  (orgChart, employeeId) => orgChart.find(emp => emp.employee_id === employeeId) || null
);

export const selectEmployeeChildren = createSelector(
  [selectOrgChart, (state, employeeId) => employeeId],
  (orgChart, employeeId) => orgChart.filter(emp => emp.line_manager_id === employeeId)
);

export const selectEmployeeAncestors = createSelector(
  [selectOrgChart, (state, employeeId) => employeeId],
  (orgChart, employeeId) => {
    const ancestors = [];
    let current = orgChart.find(emp => emp.employee_id === employeeId);
    
    while (current && current.line_manager_id) {
      const manager = orgChart.find(emp => emp.employee_id === current.line_manager_id);
      if (manager) {
        ancestors.unshift(manager);
        current = manager;
      } else {
        break;
      }
    }
    
    return ancestors;
  }
);

export const selectRootEmployees = createSelector(
  [selectOrgChart],
  (orgChart) => orgChart.filter(emp => !emp.line_manager_id)
);

export const selectManagersOnly = createSelector(
  [selectOrgChart],
  (orgChart) => orgChart.filter(emp => emp.direct_reports && emp.direct_reports > 0)
);

export const selectEmployeesByDepartment = createSelector(
  [selectOrgChart, (state, department) => department],
  (orgChart, department) => orgChart.filter(emp => emp.department === department)
);

export const selectEmployeesByBusinessFunction = createSelector(
  [selectOrgChart, (state, businessFunction) => businessFunction],
  (orgChart, businessFunction) => orgChart.filter(emp => emp.business_function === businessFunction)
);