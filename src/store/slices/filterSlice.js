// src/store/slices/filterSlice.js - Missing filter slice implementation
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Global filter state
  globalFilters: {},
  
  // Quick filters
  quickFilters: {
    search: '',
    status: 'all',
    department: 'all',
    office: 'all'
  },
  
  // Advanced filters
  advancedFilters: {},
  
  // Filter UI state
  showAdvancedFilters: false,
  
  // Applied filters for display
  appliedFilters: [],
  
  // Filter presets
  savedFilters: [],
  
  // Loading states
  loadingFilters: false,
  
  // Error states
  filterError: null
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Global filter actions
    setGlobalFilters: (state, action) => {
      state.globalFilters = action.payload;
    },
    clearGlobalFilters: (state) => {
      state.globalFilters = {};
    },
    updateGlobalFilter: (state, action) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined || value === '') {
        delete state.globalFilters[key];
      } else {
        state.globalFilters[key] = value;
      }
    },
    
    // Quick filter actions
    setQuickFilters: (state, action) => {
      state.quickFilters = { ...state.quickFilters, ...action.payload };
    },
    clearQuickFilters: (state) => {
      state.quickFilters = {
        search: '',
        status: 'all',
        department: 'all',
        office: 'all'
      };
    },
    updateQuickFilter: (state, action) => {
      const { key, value } = action.payload;
      state.quickFilters[key] = value;
    },
    
    // Advanced filter actions
    setAdvancedFilters: (state, action) => {
      state.advancedFilters = action.payload;
    },
    clearAdvancedFilters: (state) => {
      state.advancedFilters = {};
    },
    updateAdvancedFilter: (state, action) => {
      const { key, value } = action.payload;
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || value === '') {
        delete state.advancedFilters[key];
      } else {
        state.advancedFilters[key] = value;
      }
    },
    
    // UI state actions
    toggleAdvancedFilters: (state) => {
      state.showAdvancedFilters = !state.showAdvancedFilters;
    },
    setShowAdvancedFilters: (state, action) => {
      state.showAdvancedFilters = action.payload;
    },
    
    // Applied filters for display
    setAppliedFilters: (state, action) => {
      state.appliedFilters = action.payload;
    },
    addAppliedFilter: (state, action) => {
      const { key, label, value } = action.payload;
      const existingIndex = state.appliedFilters.findIndex(f => f.key === key);
      if (existingIndex !== -1) {
        state.appliedFilters[existingIndex] = { key, label, value };
      } else {
        state.appliedFilters.push({ key, label, value });
      }
    },
    removeAppliedFilter: (state, action) => {
      const key = action.payload;
      state.appliedFilters = state.appliedFilters.filter(f => f.key !== key);
    },
    clearAppliedFilters: (state) => {
      state.appliedFilters = [];
    },
    
    // Saved filters (presets)
    saveFilterPreset: (state, action) => {
      const { name, filters } = action.payload;
      const preset = {
        id: Date.now().toString(),
        name,
        filters,
        createdAt: new Date().toISOString()
      };
      state.savedFilters.push(preset);
    },
    deleteFilterPreset: (state, action) => {
      const presetId = action.payload;
      state.savedFilters = state.savedFilters.filter(preset => preset.id !== presetId);
    },
    loadFilterPreset: (state, action) => {
      const presetId = action.payload;
      const preset = state.savedFilters.find(p => p.id === presetId);
      if (preset) {
        state.globalFilters = preset.filters.global || {};
        state.quickFilters = preset.filters.quick || state.quickFilters;
        state.advancedFilters = preset.filters.advanced || {};
      }
    },
    
    // Clear all filters
    clearAllFilters: (state) => {
      state.globalFilters = {};
      state.quickFilters = {
        search: '',
        status: 'all',
        department: 'all',
        office: 'all'
      };
      state.advancedFilters = {};
      state.appliedFilters = [];
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
    }
  }
});

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
  
  // UI state
  toggleAdvancedFilters,
  setShowAdvancedFilters,
  
  // Applied filters
  setAppliedFilters,
  addAppliedFilter,
  removeAppliedFilter,
  clearAppliedFilters,
  
  // Saved filters
  saveFilterPreset,
  deleteFilterPreset,
  loadFilterPreset,
  
  // Clear all
  clearAllFilters,
  
  // Error handling
  setFilterError,
  clearFilterError,
  
  // Loading
  setLoadingFilters
} = filterSlice.actions;

export default filterSlice.reducer;

// Selectors
export const selectGlobalFilters = (state) => state.filters.globalFilters;
export const selectQuickFilters = (state) => state.filters.quickFilters;
export const selectAdvancedFilters = (state) => state.filters.advancedFilters;
export const selectShowAdvancedFilters = (state) => state.filters.showAdvancedFilters;
export const selectAppliedFilters = (state) => state.filters.appliedFilters;
export const selectSavedFilters = (state) => state.filters.savedFilters;
export const selectLoadingFilters = (state) => state.filters.loadingFilters;
export const selectFilterError = (state) => state.filters.filterError;

// Computed selectors
export const selectAllFilters = (state) => ({
  ...state.filters.globalFilters,
  ...state.filters.quickFilters,
  ...state.filters.advancedFilters
});

export const selectHasActiveFilters = (state) => {
  const globalCount = Object.keys(state.filters.globalFilters).length;
  const quickCount = Object.values(state.filters.quickFilters).filter(value => 
    value !== '' && value !== 'all'
  ).length;
  const advancedCount = Object.keys(state.filters.advancedFilters).length;
  
  return globalCount > 0 || quickCount > 0 || advancedCount > 0;
};

export const selectFilterCount = (state) => {
  const globalCount = Object.keys(state.filters.globalFilters).length;
  const quickCount = Object.values(state.filters.quickFilters).filter(value => 
    value !== '' && value !== 'all'
  ).length;
  const advancedCount = Object.keys(state.filters.advancedFilters).length;
  
  return globalCount + quickCount + advancedCount;
};