// src/store/slices/filterSlice.js - UPDATED with enhanced filtering capabilities
import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  // Global filter state - filters that apply across all views
  globalFilters: {},
  
  // Quick filters - commonly used filters with predefined values
  quickFilters: {
    search: '',
    status: 'all',
    business_function: 'all',
    department: 'all',
    position_group: 'all'
  },
  
  // Advanced filters - more complex filtering options
  advancedFilters: {
    // Personal Information
    gender: [],
    age_range: { min: null, max: null },
    
    // Job Information
    job_function: [],
    grading_level: [],
    line_manager: null,
    
    // Contract Information
    contract_duration: [],
    contract_type: [],
    
    // Date Filters
    start_date_range: { from: null, to: null },
    end_date_range: { from: null, to: null },
    contract_start_range: { from: null, to: null },
    contract_end_range: { from: null, to: null },
    
    // Service Information
    years_of_service_range: { min: null, max: null },
    
    // Tags and Labels
    tags: [],
    tag_types: [],
    
    // Organizational
    unit: [],
    has_direct_reports: null,
    is_visible_in_org_chart: null,
    
    // Status History
    previous_status: [],
    status_change_date_range: { from: null, to: null },
    
    // Performance and Grading
    needs_grading: null,
    grade_range: { min: null, max: null },
    
    // Document Management
    has_documents: null,
    document_types: [],
    
    // Custom Fields
    custom_fields: {}
  },
  
  // Filter UI state
  showAdvancedFilters: false,
  showFilterPanel: false,
  filterMode: 'basic', // 'basic', 'advanced', 'custom'
  
  // Applied filters for display and management
  appliedFilters: [],
  
  // Filter presets - saved filter combinations
  savedFilters: [],
  
  // Active filter set
  activeFilterSet: null,
  
  // Filter history for undo/redo
  filterHistory: [],
  currentHistoryIndex: -1,
  
  // Loading states
  loadingFilters: false,
  savingFilter: false,
  
  // Error states
  filterError: null,
  
  // Filter suggestions and auto-complete
  filterSuggestions: {},
  
  // Export filters - filters specific to export operations
  exportFilters: {
    fields: {
      personal_info: true,
      job_info: true,
      contract_info: true,
      status_info: true,
      organizational_info: true,
      performance_info: false,
      documents: false,
      custom_fields: false
    },
    format_options: {
      include_headers: true,
      include_formulas: false,
      date_format: 'YYYY-MM-DD',
      currency_format: 'USD'
    }
  }
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Global filter actions
    setGlobalFilters: (state, action) => {
      state.globalFilters = action.payload;
      state.appliedFilters = generateAppliedFilters(action.payload);
    },
    
    clearGlobalFilters: (state) => {
      state.globalFilters = {};
      state.appliedFilters = [];
    },
    
    updateGlobalFilter: (state, action) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete state.globalFilters[key];
      } else {
        state.globalFilters[key] = value;
      }
      state.appliedFilters = generateAppliedFilters(state.globalFilters);
    },
    
    // Quick filter actions
    setQuickFilters: (state, action) => {
      state.quickFilters = { ...state.quickFilters, ...action.payload };
    },
    
    clearQuickFilters: (state) => {
      state.quickFilters = {
        search: '',
        status: 'all',
        business_function: 'all',
        department: 'all',
        position_group: 'all'
      };
    },
    
    updateQuickFilter: (state, action) => {
      const { key, value } = action.payload;
      state.quickFilters[key] = value;
      
      // Auto-apply quick filters to global filters
      if (value && value !== 'all' && value !== '') {
        state.globalFilters[key] = value;
      } else {
        delete state.globalFilters[key];
      }
      state.appliedFilters = generateAppliedFilters(state.globalFilters);
    },
    
    // Advanced filter actions
    setAdvancedFilters: (state, action) => {
      state.advancedFilters = { ...state.advancedFilters, ...action.payload };
    },
    
    clearAdvancedFilters: (state) => {
      state.advancedFilters = initialState.advancedFilters;
    },
    
    updateAdvancedFilter: (state, action) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || value === '') {
        if (key.includes('.')) {
          // Handle nested objects like date ranges
          const [parentKey, childKey] = key.split('.');
          if (state.advancedFilters[parentKey]) {
            state.advancedFilters[parentKey][childKey] = null;
          }
        } else {
          delete state.advancedFilters[key];
        }
      } else {
        if (key.includes('.')) {
          // Handle nested objects like date ranges
          const [parentKey, childKey] = key.split('.');
          if (!state.advancedFilters[parentKey]) {
            state.advancedFilters[parentKey] = {};
          }
          state.advancedFilters[parentKey][childKey] = value;
        } else {
          state.advancedFilters[key] = value;
        }
      }
    },
    
    // Apply advanced filters to global filters
    applyAdvancedFilters: (state) => {
      // Convert advanced filters to global filter format
      const advancedAsGlobal = {};
      
      Object.entries(state.advancedFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && 
            !(Array.isArray(value) && value.length === 0)) {
          
          // Handle range filters
          if (typeof value === 'object' && value.min !== null && value.max !== null) {
            advancedAsGlobal[`${key}_min`] = value.min;
            advancedAsGlobal[`${key}_max`] = value.max;
          } else if (typeof value === 'object' && value.from !== null && value.to !== null) {
            advancedAsGlobal[`${key}_from`] = value.from;
            advancedAsGlobal[`${key}_to`] = value.to;
          } else if (Array.isArray(value) && value.length > 0) {
            advancedAsGlobal[key] = value;
          } else if (typeof value !== 'object') {
            advancedAsGlobal[key] = value;
          }
        }
      });
      
      state.globalFilters = { ...state.globalFilters, ...advancedAsGlobal };
      state.appliedFilters = generateAppliedFilters(state.globalFilters);
    },
    
    // UI state actions
    toggleAdvancedFilters: (state) => {
      state.showAdvancedFilters = !state.showAdvancedFilters;
    },
    
    setShowAdvancedFilters: (state, action) => {
      state.showAdvancedFilters = action.payload;
    },
    
    toggleFilterPanel: (state) => {
      state.showFilterPanel = !state.showFilterPanel;
    },
    
    setShowFilterPanel: (state, action) => {
      state.showFilterPanel = action.payload;
    },
    
    setFilterMode: (state, action) => {
      state.filterMode = action.payload; // 'basic', 'advanced', 'custom'
    },
    
    // Applied filters for display
    setAppliedFilters: (state, action) => {
      state.appliedFilters = action.payload;
    },
    
    addAppliedFilter: (state, action) => {
      const { key, label, value, type = 'standard' } = action.payload;
      const existingIndex = state.appliedFilters.findIndex(f => f.key === key);
      const newFilter = { key, label, value, type };
      
      if (existingIndex !== -1) {
        state.appliedFilters[existingIndex] = newFilter;
      } else {
        state.appliedFilters.push(newFilter);
      }
    },
    
    removeAppliedFilter: (state, action) => {
      const key = action.payload;
      state.appliedFilters = state.appliedFilters.filter(f => f.key !== key);
      
      // Also remove from global filters
      delete state.globalFilters[key];
      
      // Remove from quick filters if applicable
      if (state.quickFilters.hasOwnProperty(key)) {
        state.quickFilters[key] = key === 'search' ? '' : 'all';
      }
    },
    
    clearAppliedFilters: (state) => {
      state.appliedFilters = [];
      state.globalFilters = {};
      state.quickFilters = {
        search: '',
        status: 'all',
        business_function: 'all',
        department: 'all',
        position_group: 'all'
      };
      state.advancedFilters = initialState.advancedFilters;
    },
    
    // Saved filters (presets)
    saveFilterPreset: (state, action) => {
      const { name, description, filters, isPublic = false } = action.payload;
      const preset = {
        id: Date.now().toString(),
        name,
        description,
        filters: {
          global: filters.global || state.globalFilters,
          quick: filters.quick || state.quickFilters,
          advanced: filters.advanced || state.advancedFilters
        },
        isPublic,
        createdAt: new Date().toISOString(),
        usageCount: 0
      };
      
      // Check for duplicate names
      const existingIndex = state.savedFilters.findIndex(f => f.name === name);
      if (existingIndex !== -1) {
        state.savedFilters[existingIndex] = preset;
      } else {
        state.savedFilters.push(preset);
      }
    },
    
    deleteFilterPreset: (state, action) => {
      const presetId = action.payload;
      state.savedFilters = state.savedFilters.filter(preset => preset.id !== presetId);
      
      if (state.activeFilterSet === presetId) {
        state.activeFilterSet = null;
      }
    },
    
    loadFilterPreset: (state, action) => {
      const presetId = action.payload;
      const preset = state.savedFilters.find(p => p.id === presetId);
      
      if (preset) {
        state.globalFilters = preset.filters.global || {};
        state.quickFilters = preset.filters.quick || state.quickFilters;
        state.advancedFilters = preset.filters.advanced || {};
        state.activeFilterSet = presetId;
        state.appliedFilters = generateAppliedFilters(state.globalFilters);
        
        // Increment usage count
        preset.usageCount = (preset.usageCount || 0) + 1;
      }
    },
    
    updateFilterPreset: (state, action) => {
      const { presetId, updates } = action.payload;
      const presetIndex = state.savedFilters.findIndex(p => p.id === presetId);
      
      if (presetIndex !== -1) {
        state.savedFilters[presetIndex] = {
          ...state.savedFilters[presetIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    
    // Filter history for undo/redo functionality
    addToFilterHistory: (state, action) => {
      const filterState = {
        global: { ...state.globalFilters },
        quick: { ...state.quickFilters },
        advanced: { ...state.advancedFilters },
        timestamp: Date.now()
      };
      
      // Remove any history after current index (for redo functionality)
      state.filterHistory = state.filterHistory.slice(0, state.currentHistoryIndex + 1);
      
      // Add new state
      state.filterHistory.push(filterState);
      state.currentHistoryIndex = state.filterHistory.length - 1;
      
      // Limit history size
      if (state.filterHistory.length > 50) {
        state.filterHistory = state.filterHistory.slice(-50);
        state.currentHistoryIndex = state.filterHistory.length - 1;
      }
    },
    
    undoFilter: (state) => {
      if (state.currentHistoryIndex > 0) {
        state.currentHistoryIndex -= 1;
        const previousState = state.filterHistory[state.currentHistoryIndex];
        
        state.globalFilters = previousState.global;
        state.quickFilters = previousState.quick;
        state.advancedFilters = previousState.advanced;
        state.appliedFilters = generateAppliedFilters(state.globalFilters);
      }
    },
    
    redoFilter: (state) => {
      if (state.currentHistoryIndex < state.filterHistory.length - 1) {
        state.currentHistoryIndex += 1;
        const nextState = state.filterHistory[state.currentHistoryIndex];
        
        state.globalFilters = nextState.global;
        state.quickFilters = nextState.quick;
        state.advancedFilters = nextState.advanced;
        state.appliedFilters = generateAppliedFilters(state.globalFilters);
      }
    },
    
    // Clear all filters
    clearAllFilters: (state) => {
      // Add current state to history before clearing
      const currentState = {
        global: { ...state.globalFilters },
        quick: { ...state.quickFilters },
        advanced: { ...state.advancedFilters },
        timestamp: Date.now()
      };
      
      state.filterHistory.push(currentState);
      state.currentHistoryIndex = state.filterHistory.length - 1;
      
      // Clear all filters
      state.globalFilters = {};
      state.quickFilters = {
        search: '',
        status: 'all',
        business_function: 'all',
        department: 'all',
        position_group: 'all'
      };
      state.advancedFilters = initialState.advancedFilters;
      state.appliedFilters = [];
      state.activeFilterSet = null;
    },
    
    // Export filter management
    setExportFilters: (state, action) => {
      state.exportFilters = { ...state.exportFilters, ...action.payload };
    },
    
    updateExportField: (state, action) => {
      const { field, value } = action.payload;
      state.exportFilters.fields[field] = value;
    },
    
    updateExportOption: (state, action) => {
      const { option, value } = action.payload;
      state.exportFilters.format_options[option] = value;
    },
    
    resetExportFilters: (state) => {
      state.exportFilters = initialState.exportFilters;
    },
    
    // Filter suggestions
    setFilterSuggestions: (state, action) => {
      const { field, suggestions } = action.payload;
      state.filterSuggestions[field] = suggestions;
    },
    
    clearFilterSuggestions: (state, action) => {
      const field = action.payload;
      if (field) {
        delete state.filterSuggestions[field];
      } else {
        state.filterSuggestions = {};
      }
    },
    
    // Error handling
    setFilterError: (state, action) => {
      state.filterError = action.payload;
    },
    
    clearFilterError: (state) => {
      state.filterError = null;
    },
    
    // Loading states
    setLoadingFilters: (state, action) => {
      state.loadingFilters = action.payload;
    },
    
    setSavingFilter: (state, action) => {
      state.savingFilter = action.payload;
    },
    
    // Bulk filter operations
    applyMultipleFilters: (state, action) => {
      const filters = action.payload;
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && 
            !(Array.isArray(value) && value.length === 0)) {
          state.globalFilters[key] = value;
        }
      });
      
      state.appliedFilters = generateAppliedFilters(state.globalFilters);
    },
    
    removeMultipleFilters: (state, action) => {
      const filterKeys = action.payload;
      
      filterKeys.forEach(key => {
        delete state.globalFilters[key];
      });
      
      state.appliedFilters = state.appliedFilters.filter(f => !filterKeys.includes(f.key));
    },
    
    // Smart filter suggestions based on current data
    generateSmartSuggestions: (state, action) => {
      const { employees, currentFilters } = action.payload;
      
      // Generate suggestions based on current employee data
      const suggestions = {
        departments: [...new Set(employees.map(emp => emp.department_name).filter(Boolean))],
        positions: [...new Set(employees.map(emp => emp.job_title).filter(Boolean))],
        managers: [...new Set(employees.map(emp => emp.line_manager_name).filter(Boolean))],
        tags: [...new Set(employees.flatMap(emp => emp.tag_names || []).filter(Boolean))]
      };
      
      state.filterSuggestions = { ...state.filterSuggestions, ...suggestions };
    }
  }
});

// Helper function to generate applied filters for display
function generateAppliedFilters(globalFilters) {
  return Object.entries(globalFilters).map(([key, value]) => {
    let label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let displayValue = value;
    
    // Format display value based on filter type
    if (Array.isArray(value)) {
      displayValue = value.length > 1 ? `${value.length} selected` : value[0];
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    }
    
    return {
      key,
      label,
      value: displayValue,
      type: Array.isArray(value) ? 'multiple' : 'single'
    };
  });
}

export const {
  // Global filters
  setGlobalFilters,
  clearGlobalFilters,
  updateGlobalFilter,
  
  // Quick filters
  setQuickFilters,
  clearQuickFilters,
  updateQuickFilter,
  
  // Advanced filters
  setAdvancedFilters,
  clearAdvancedFilters,
  updateAdvancedFilter,
  applyAdvancedFilters,
  
  // UI state
  toggleAdvancedFilters,
  setShowAdvancedFilters,
  toggleFilterPanel,
  setShowFilterPanel,
  setFilterMode,
  
  // Applied filters
  setAppliedFilters,
  addAppliedFilter,
  removeAppliedFilter,
  clearAppliedFilters,
  
  // Saved filters
  saveFilterPreset,
  deleteFilterPreset,
  loadFilterPreset,
  updateFilterPreset,
  
  // Filter history
  addToFilterHistory,
  undoFilter,
  redoFilter,
  
  // Clear all
  clearAllFilters,
  
  // Export filters
  setExportFilters,
  updateExportField,
  updateExportOption,
  resetExportFilters,
  
  // Filter suggestions
  setFilterSuggestions,
  clearFilterSuggestions,
  generateSmartSuggestions,
  
  // Error handling
  setFilterError,
  clearFilterError,
  
  // Loading
  setLoadingFilters,
  setSavingFilter,
  
  // Bulk operations
  applyMultipleFilters,
  removeMultipleFilters
} = filterSlice.actions;

export default filterSlice.reducer;

// Selectors
export const selectGlobalFilters = (state) => state.filters.globalFilters;
export const selectQuickFilters = (state) => state.filters.quickFilters;
export const selectAdvancedFilters = (state) => state.filters.advancedFilters;
export const selectShowAdvancedFilters = (state) => state.filters.showAdvancedFilters;
export const selectShowFilterPanel = (state) => state.filters.showFilterPanel;
export const selectFilterMode = (state) => state.filters.filterMode;
export const selectAppliedFilters = (state) => state.filters.appliedFilters;
export const selectSavedFilters = (state) => state.filters.savedFilters;
export const selectActiveFilterSet = (state) => state.filters.activeFilterSet;
export const selectFilterHistory = (state) => state.filters.filterHistory;
export const selectCurrentHistoryIndex = (state) => state.filters.currentHistoryIndex;
export const selectLoadingFilters = (state) => state.filters.loadingFilters;
export const selectSavingFilter = (state) => state.filters.savingFilter;
export const selectFilterError = (state) => state.filters.filterError;
export const selectFilterSuggestions = (state) => state.filters.filterSuggestions;
export const selectExportFilters = (state) => state.filters.exportFilters;

// Computed selectors
export const selectAllFilters = createSelector(
  [selectGlobalFilters, selectQuickFilters, selectAdvancedFilters],
  (globalFilters, quickFilters, advancedFilters) => ({
    ...globalFilters,
    ...quickFilters,
    ...advancedFilters
  })
);

export const selectHasActiveFilters = createSelector(
  [selectGlobalFilters, selectQuickFilters, selectAdvancedFilters],
  (globalFilters, quickFilters, advancedFilters) => {
    const globalCount = Object.keys(globalFilters).length;
    const quickCount = Object.values(quickFilters).filter(value => 
      value !== '' && value !== 'all'
    ).length;
    const advancedCount = Object.values(advancedFilters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
      }
      return value !== null && value !== undefined && value !== '';
    }).length;
    
    return globalCount > 0 || quickCount > 0 || advancedCount > 0;
  }
);

export const selectFilterCount = createSelector(
  [selectAppliedFilters],
  (appliedFilters) => appliedFilters.length
);

export const selectCanUndo = createSelector(
  [selectCurrentHistoryIndex],
  (currentIndex) => currentIndex > 0
);

export const selectCanRedo = createSelector(
  [selectFilterHistory, selectCurrentHistoryIndex],
  (history, currentIndex) => currentIndex < history.length - 1
);

export const selectPopularFilters = createSelector(
  [selectSavedFilters],
  (savedFilters) => {
    return savedFilters
      .filter(filter => filter.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  }
);

export const selectRecentFilters = createSelector(
  [selectSavedFilters],
  (savedFilters) => {
    return savedFilters
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }
);

export const selectExportFieldCount = createSelector(
  [selectExportFilters],
  (exportFilters) => {
    return Object.values(exportFilters.fields).filter(Boolean).length;
  }
);

export const selectFilterSummary = createSelector(
  [selectHasActiveFilters, selectFilterCount, selectActiveFilterSet, selectSavedFilters],
  (hasActiveFilters, filterCount, activeFilterSet, savedFilters) => {
    const activePreset = activeFilterSet 
      ? savedFilters.find(f => f.id === activeFilterSet)
      : null;
    
    return {
      hasActiveFilters,
      filterCount,
      activePreset: activePreset?.name || null,
      summary: hasActiveFilters 
        ? `${filterCount} filter${filterCount !== 1 ? 's' : ''} applied`
        : 'No filters applied'
    };
  }
);