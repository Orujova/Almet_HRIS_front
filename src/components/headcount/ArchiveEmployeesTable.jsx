// src/components/headcount/ArchiveEmployeesTable.jsx - COMPLETE VERSION
"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useVacantPositions } from "../../hooks/useVacantPositions";
import { useReferenceData } from "../../hooks/useReferenceData";
import { 
  Archive, 
  Search, 
  Filter, 
  RotateCcw, 
  Trash2, 
  Calendar,
  User,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  X,
  ChevronDown,
  Briefcase
} from "lucide-react";

// Components
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";

const ArchiveEmployeesTable = () => {
  const { darkMode } = useTheme();
  
  // ========================================
  // HOOKS & API INTEGRATION
  // ========================================
  
  const {
    // Archive Data
    archivedEmployees,
    archiveStats,
    selectedArchivedEmployees,
    
    // Loading & Errors
    loading,
    errors,
    
    // Pagination
    archivePagination,
    
    // API Functions
    fetchArchivedEmployees,
    fetchArchiveStatistics,
    bulkRestoreEmployees,
    
    // Selection Helpers
    toggleArchivedEmployeeSelection,
    clearArchivedEmployeesSelection,
    selectAllArchivedEmployees,
    
    // Pagination Helpers
    setArchivePage,
    setArchivePageSize,
    
    // Utility
    clearErrors
  } = useVacantPositions();

  // Reference data
  const {
    departments,
    businessFunctions
  } = useReferenceData();

  // ========================================
  // LOCAL STATE
  // ========================================
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    deletion_type: [],
    department: [],
    business_function: [],
    can_be_restored: ""
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Refs for preventing infinite loops
  const initialized = useRef(false);
  const debounceRef = useRef(null);
  const lastApiParamsRef = useRef(null);

  // ========================================
  // THEME STYLES
  // ========================================
  
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // ========================================
  // FILTER OPTIONS
  // ========================================

  const deletionTypeOptions = [
    { value: 'soft_delete', label: 'Soft Delete', description: 'Can be restored', color: 'orange' },
    { value: 'hard_delete', label: 'Hard Delete', description: 'Permanently deleted', color: 'red' }
  ];

  const restorabilityOptions = [
    { value: 'true', label: 'Restorable', description: 'Can be restored to active status' },
    { value: 'false', label: 'Permanent', description: 'Cannot be restored' }
  ];

  // ========================================
  // API PARAMS BUILDER WITH LOOP PREVENTION
  // ========================================
  
  const buildApiParams = useMemo(() => {
    const params = {
      page: archivePagination.page || 1,
      page_size: archivePagination.pageSize || 25
    };

    // Search
    if (searchTerm?.trim()) {
      params.search = searchTerm.trim();
    }

    // Filters - Handle arrays properly
    if (filters.deletion_type && filters.deletion_type.length > 0) {
      params.deletion_type = filters.deletion_type.join(',');
    }
    
    if (filters.department && filters.department.length > 0) {
      params.department = filters.department.join(',');
    }
    
    if (filters.business_function && filters.business_function.length > 0) {
      params.business_function = filters.business_function.join(',');
    }

    // Boolean filter for restoration capability
    if (filters.can_be_restored && filters.can_be_restored !== "") {
      params.can_be_restored = filters.can_be_restored === 'true';
    }

    return params;
  }, [searchTerm, filters, archivePagination.page, archivePagination.pageSize]);

  // ========================================
  // PREVENT INFINITE LOOP WITH PARAMS COMPARISON
  // ========================================
  
  const apiParamsChanged = useMemo(() => {
    if (!lastApiParamsRef.current) return true;
    
    const currentParams = JSON.stringify(buildApiParams);
    const lastParams = JSON.stringify(lastApiParamsRef.current);
    
    return currentParams !== lastParams;
  }, [buildApiParams]);

  // ========================================
  // DEBOUNCED DATA FETCHING
  // ========================================
  
  const debouncedFetchEmployees = useCallback((params, immediate = false) => {
    const paramsString = JSON.stringify(params);
    const lastParamsString = JSON.stringify(lastApiParamsRef.current);
    
    if (paramsString === lastParamsString && !immediate) {
      return;
    }

    const delay = immediate ? 0 : 500;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      lastApiParamsRef.current = { ...params };
      fetchArchivedEmployees(params);
    }, delay);
  }, [fetchArchivedEmployees]);

  // ========================================
  // INITIALIZATION
  // ========================================
  
  useEffect(() => {
    const initializeData = async () => {
      if (initialized.current) return;
      
      try {
        initialized.current = true;
        clearErrors();
        lastApiParamsRef.current = { ...buildApiParams };
        
        await Promise.all([
          fetchArchiveStatistics(),
          fetchArchivedEmployees(buildApiParams)
        ]);
        
      } catch (error) {
        console.error('Failed to initialize ArchiveEmployeesTable:', error);
        initialized.current = false;
      }
    };

    initializeData();
  }, []); // Only run once on mount

  // ========================================
  // DATA FETCHING ON PARAM CHANGES
  // ========================================
  
  useEffect(() => {
    if (initialized.current && apiParamsChanged) {
      debouncedFetchEmployees(buildApiParams);
    }
  }, [apiParamsChanged, buildApiParams, debouncedFetchEmployees]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setArchivePage(1);
  }, [setArchivePage]);

  const handleFilterChange = useCallback((filterKey, values) => {
    setFilters(prev => ({ ...prev, [filterKey]: values }));
    setArchivePage(1);
  }, [setArchivePage]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      deletion_type: [],
      department: [],
      business_function: [],
      can_be_restored: ""
    });
    setSearchTerm("");
    setArchivePage(1);
  }, [setArchivePage]);

  const handleClearFilter = useCallback((filterKey) => {
    if (filterKey === 'search') {
      setSearchTerm("");
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        if (Array.isArray(prev[filterKey])) {
          newFilters[filterKey] = [];
        } else {
          newFilters[filterKey] = "";
        }
        return newFilters;
      });
    }
    setArchivePage(1);
  }, [setArchivePage]);

  // ========================================
  // SELECTION HANDLERS
  // ========================================

  const handleToggleSelection = useCallback((employeeId) => {
    toggleArchivedEmployeeSelection(employeeId);
  }, [toggleArchivedEmployeeSelection]);

  const handleSelectAll = useCallback(() => {
    if (selectedArchivedEmployees.length === archivedEmployees.length && archivedEmployees.length > 0) {
      clearArchivedEmployeesSelection();
    } else {
      selectAllArchivedEmployees();
    }
  }, [selectedArchivedEmployees.length, archivedEmployees.length, clearArchivedEmployeesSelection, selectAllArchivedEmployees]);

  // ========================================
  // BULK ACTION HANDLERS
  // ========================================

  const handleBulkRestore = useCallback(async () => {
    if (selectedArchivedEmployees.length === 0) {
      alert("Please select employees to restore.");
      return;
    }

    // Filter only restorable employees (soft deleted ones)
    const restorableEmployees = archivedEmployees.filter(emp => 
      selectedArchivedEmployees.includes(emp.id) && emp.can_be_restored === true
    );

    if (restorableEmployees.length === 0) {
      alert("None of the selected employees can be restored. Only soft deleted employees can be restored.");
      return;
    }

    const nonRestorableCount = selectedArchivedEmployees.length - restorableEmployees.length;
    let confirmMessage = `Are you sure you want to restore ${restorableEmployees.length} employee${restorableEmployees.length !== 1 ? 's' : ''}?`;
    
    if (nonRestorableCount > 0) {
      confirmMessage += `\n\nNote: ${nonRestorableCount} selected employee${nonRestorableCount !== 1 ? 's are' : ' is'} permanently deleted and cannot be restored.`;
    }
    
    if (confirm(confirmMessage)) {
      try {
        await bulkRestoreEmployees(restorableEmployees.map(emp => emp.id));
        clearArchivedEmployeesSelection();
        alert(`Successfully restored ${restorableEmployees.length} employee${restorableEmployees.length !== 1 ? 's' : ''}!`);
      } catch (error) {
        alert(`Failed to restore employees: ${error.message}`);
      }
    }
  }, [selectedArchivedEmployees, archivedEmployees, bulkRestoreEmployees, clearArchivedEmployeesSelection]);

  // Individual restore handler
  const handleIndividualRestore = useCallback(async (employeeId, employee) => {
    if (!employee.can_be_restored) {
      alert("This employee cannot be restored as they were permanently deleted.");
      return;
    }

    if (confirm(`Are you sure you want to restore ${employee.full_name}?`)) {
      try {
        await bulkRestoreEmployees([employeeId]);
        alert(`Successfully restored ${employee.full_name}!`);
      } catch (error) {
        alert(`Failed to restore employee: ${error.message}`);
      }
    }
  }, [bulkRestoreEmployees]);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDeletionTypeIcon = (type) => {
    switch (type) {
      case 'hard_delete':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'soft_delete':
        return <Archive className="w-4 h-4 text-orange-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDeletionTypeColor = (type) => {
    switch (type) {
      case 'hard_delete':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'soft_delete':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600';
    }
  };

  // ========================================
  // ACTIVE FILTERS CALCULATION
  // ========================================
  
  const activeFilters = useMemo(() => {
    const active = [];
    
    if (searchTerm) {
      active.push({ key: "search", label: `Search: ${searchTerm}` });
    }
    
    if (filters.deletion_type && filters.deletion_type.length > 0) {
      const labels = filters.deletion_type.map(value => {
        const option = deletionTypeOptions.find(opt => opt.value === value);
        return option ? option.label : value;
      });
      active.push({ 
        key: 'deletion_type', 
        label: `Deletion Type: ${labels.join(', ')}`
      });
    }

    if (filters.department && filters.department.length > 0) {
      const labels = filters.department.map(value => {
        const dept = departments?.find(d => d && d.id === parseInt(value));
        return dept ? dept.name : value;
      }).filter(label => label);
      if (labels.length > 0) {
        active.push({ 
          key: 'department', 
          label: `Department: ${labels.join(', ')}`
        });
      }
    }

    if (filters.business_function && filters.business_function.length > 0) {
      const labels = filters.business_function.map(value => {
        const bf = businessFunctions?.find(b => b && b.id === parseInt(value));
        return bf ? `${bf.name} (${bf.code})` : value;
      }).filter(label => label);
      if (labels.length > 0) {
        active.push({ 
          key: 'business_function', 
          label: `Business Function: ${labels.join(', ')}`
        });
      }
    }

    if (filters.can_be_restored && filters.can_be_restored !== "") {
      const label = filters.can_be_restored === 'true' ? 'Restorable' : 'Permanent';
      active.push({ 
        key: 'can_be_restored', 
        label: `Restorability: ${label}`
      });
    }
    
    return active;
  }, [searchTerm, filters, deletionTypeOptions, departments, businessFunctions]);

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderHeader = () => (
    <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm mb-4`}>
      <div className="p-4">
        {/* Top Row: Title + Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
              <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${textPrimary}`}>
                Employee Archive
              </h1>
              <p className={`text-sm ${textSecondary}`}>
                {archiveStats?.total_archived || 0} archived employees
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Filters Button */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center px-3 py-2 text-sm border rounded-lg transition-colors ${
                activeFilters.length > 0 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                  : `${borderColor} ${textSecondary} ${hoverBg}`
              }`}
            >
              <Filter size={14} className="mr-1" />
              Filters
              {activeFilters.length > 0 && (
                <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            {/* Bulk Restore Button */}
            {selectedArchivedEmployees.length > 0 && (
              <button
                onClick={handleBulkRestore}
                className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors font-medium bg-green-600 text-white hover:bg-green-700"
                disabled={loading.bulkOperations}
              >
                {loading.bulkOperations ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Restoring...
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} className="mr-1" />
                    Restore ({selectedArchivedEmployees.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Total Archived</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {archiveStats?.total_archived || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Restorable (Soft)</div>
            <div className={`text-xl font-semibold text-orange-600`}>
              {archiveStats?.restorable_count || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Permanent (Hard)</div>
            <div className={`text-xl font-semibold text-red-600`}>
              {(archiveStats?.total_archived || 0) - (archiveStats?.restorable_count || 0)}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Recent (30 days)</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {archiveStats?.recent_deletions || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    isFiltersOpen && (
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-lg mb-6 overflow-hidden`}>
        {/* Filter Header */}
        <div className="bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 dark:from-almet-sapphire/10 dark:to-almet-astral/10 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-almet-sapphire" />
              <h3 className={`font-semibold ${textPrimary}`}>Filter Options</h3>
            </div>
            <button
              onClick={() => setIsFiltersOpen(false)}
              className={`p-1 rounded-md ${hoverBg} transition-colors`}
            >
              <X size={18} className={textMuted} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Deletion Type Filter */}
            <div className="space-y-4">
              <label className={`block text-sm font-semibold ${textPrimary} mb-3`}>
                Deletion Type
              </label>
              <div className="space-y-3">
                {deletionTypeOptions.map(option => (
                  <label key={option.value} className="group cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center mt-0.5">
                        <input
                          type="checkbox"
                          checked={filters.deletion_type.includes(option.value)}
                          onChange={(e) => {
                            const newValues = e.target.checked
                              ? [...filters.deletion_type, option.value]
                              : filters.deletion_type.filter(v => v !== option.value);
                            handleFilterChange('deletion_type', newValues);
                          }}
                          className="w-4 h-4 text-almet-sapphire bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${textPrimary} group-hover:text-almet-sapphire transition-colors`}>
                          {option.label}
                        </span>
                        <p className={`text-xs ${textMuted} mt-1`}>
                          {option.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            option.color === 'orange' 
                              ? 'bg-orange-500' 
                              : 'bg-red-500'
                          }`}></div>
                          <span className={`text-xs ${textMuted}`}>
                            {option.color === 'orange' ? 'Can be restored' : 'Cannot be restored'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Department Filter */}
            <div className="space-y-4">
              <label className={`block text-sm font-semibold ${textPrimary} mb-3`}>
                Department
              </label>
              <div className="relative">
                <div className="max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-3 space-y-2">
                  {departments && departments.length > 0 ? departments
                    .filter(dept => dept && dept.id != null && dept.name)
                    .map(dept => (
                    <label key={dept.id} className="group cursor-pointer">
                      <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.department.includes(dept.id.toString())}
                          onChange={(e) => {
                            const value = dept.id.toString();
                            const newValues = e.target.checked
                              ? [...filters.department, value]
                              : filters.department.filter(v => v !== value);
                            handleFilterChange('department', newValues);
                          }}
                          className="w-4 h-4 text-almet-sapphire bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire transition-colors"
                        />
                        <span className={`text-sm ${textPrimary} group-hover:text-almet-sapphire transition-colors flex-1`}>
                          {dept.name}
                        </span>
                      </div>
                    </label>
                  )) : (
                    <div className={`text-sm ${textMuted} p-4 text-center`}>
                      <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No departments available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Function Filter */}
            <div className="space-y-4">
              <label className={`block text-sm font-semibold ${textPrimary} mb-3`}>
                Business Function
              </label>
              <div className="relative">
                <div className="max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-3 space-y-2">
                  {businessFunctions && businessFunctions.length > 0 ? businessFunctions
                    .filter(bf => bf && bf.id != null && bf.name && bf.code)
                    .map(bf => (
                    <label key={bf.id} className="group cursor-pointer">
                      <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-white dark:hover:bg-gray-600 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.business_function.includes(bf.id.toString())}
                          onChange={(e) => {
                            const value = bf.id.toString();
                            const newValues = e.target.checked
                              ? [...filters.business_function, value]
                              : filters.business_function.filter(v => v !== value);
                            handleFilterChange('business_function', newValues);
                          }}
                          className="w-4 h-4 text-almet-sapphire bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire transition-colors"
                        />
                        <div className="flex-1">
                          <span className={`text-sm font-medium ${textPrimary} group-hover:text-almet-sapphire transition-colors`}>
                            {bf.name}
                          </span>
                          <span className={`text-xs ${textMuted} ml-2 px-2 py-0.5 bg-almet-sapphire/10 rounded-full`}>
                            {bf.code}
                          </span>
                        </div>
                      </div>
                    </label>
                  )) : (
                    <div className={`text-sm ${textMuted} p-4 text-center`}>
                      <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No business functions available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Restorability Filter */}
            <div className="space-y-4">
              <label className={`block text-sm font-semibold ${textPrimary} mb-3`}>
                Restorability Status
              </label>
              <div className="space-y-3">
                {restorabilityOptions.map(option => (
                  <label key={option.value} className="group cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center mt-0.5">
                        <input
                          type="radio"
                          name="can_be_restored"
                          value={option.value}
                          checked={filters.can_be_restored === option.value}
                          onChange={(e) => handleFilterChange('can_be_restored', e.target.value)}
                          className="w-4 h-4 text-almet-sapphire bg-white border-2 border-gray-300 focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${textPrimary} group-hover:text-almet-sapphire transition-colors`}>
                          {option.label}
                        </span>
                        <p className={`text-xs ${textMuted} mt-1`}>
                          {option.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            option.value === 'true' 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`}></div>
                          <span className={`text-xs ${textMuted}`}>
                            {option.value === 'true' ? 'Soft deleted employees' : 'Hard deleted employees'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
                <label className="group cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center mt-0.5">
                      <input
                        type="radio"
                        name="can_be_restored"
                        value=""
                        checked={filters.can_be_restored === ""}
                        onChange={(e) => handleFilterChange('can_be_restored', "")}
                        className="w-4 h-4 text-almet-sapphire bg-white border-2 border-gray-300 focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${textPrimary} group-hover:text-almet-sapphire transition-colors`}>
                        All Employees
                      </span>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        Show both soft and hard deleted employees
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 rounded-full mr-1 bg-orange-500"></div>
                        <div className="w-2 h-2 rounded-full mr-2 bg-red-500"></div>
                        <span className={`text-xs ${textMuted}`}>
                          All deletion types
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Active Filters Section */}
          {activeFilters.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-sm font-semibold ${textPrimary} flex items-center`}>
                    <Filter className="w-4 h-4 mr-2 text-almet-sapphire" />
                    Active Filters:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map(filter => (
                      <span
                        key={filter.key}
                        className="group inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-almet-sapphire/10 text-almet-sapphire border border-almet-sapphire/20 hover:bg-almet-sapphire/15 transition-all duration-200"
                      >
                        <span className="max-w-32 truncate">{filter.label}</span>
                        <button
                          onClick={() => handleClearFilter(filter.key)}
                          className="ml-2 p-0.5 rounded-full hover:bg-almet-sapphire/20 transition-colors"
                          title={`Remove ${filter.label} filter`}
                        >
                          <X size={12} className="text-almet-sapphire" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Filter Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                <span className={textSecondary}>
                  Showing {archivedEmployees.length} of {archiveStats?.total_archived || 0} archived employees
                </span>
                {activeFilters.length > 0 && (
                  <span className="text-almet-sapphire font-medium">
                    {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} applied
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors shadow-sm hover:shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const renderEmployeeRow = (employee) => (
    <tr key={employee.id} className={`${hoverBg} border-b ${borderColor}`}>
      {/* Selection Checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selectedArchivedEmployees.includes(employee.id)}
          onChange={() => handleToggleSelection(employee.id)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>

      {/* Employee Info */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className={`font-medium ${textPrimary}`}>{employee.full_name}</p>
            <p className={`text-sm ${textSecondary}`}>
              ID: {employee.original_employee_id}
            </p>
            {employee.email && (
              <p className={`text-xs ${textMuted}`}>{employee.email}</p>
            )}
          </div>
        </div>
      </td>

      {/* Job Information */}
      <td className="px-4 py-3">
        <p className={`text-sm ${textPrimary}`}>{employee.job_title || 'N/A'}</p>
        <p className={`text-xs ${textMuted}`}>
          {employee.department_name} • {employee.business_function_name}
        </p>
      </td>

      {/* Deletion Type */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDeletionTypeColor(employee.deletion_type)}`}>
          {getDeletionTypeIcon(employee.deletion_type)}
          <span className="ml-1">{employee.deletion_type_display}</span>
        </span>
      </td>

      {/* Deleted Date */}
      <td className="px-4 py-3">
        <div className="flex items-center text-sm">
          <Calendar className={`w-4 h-4 ${textMuted} mr-2`} />
          <span className={textSecondary}>{formatDate(employee.deleted_at)}</span>
        </div>
        {employee.days_since_deletion && (
          <p className={`text-xs ${textMuted}`}>
            {employee.days_since_deletion} days ago
          </p>
        )}
      </td>

      {/* Employment Period */}
      <td className="px-4 py-3">
        <p className={`text-sm ${textSecondary}`}>
          {formatDate(employee.start_date)} - {formatDate(employee.end_date)}
        </p>
        {employee.contract_duration && (
          <p className={`text-xs ${textMuted}`}>
            Duration: {employee.contract_duration}
          </p>
        )}
      </td>

      {/* Status & Restorability */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {employee.can_be_restored ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
              <CheckCircle size={12} className="mr-1" />
              Restorable
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200">
              <XCircle size={12} className="mr-1" />
              Permanent
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {employee.can_be_restored ? (
            <button
              onClick={() => handleIndividualRestore(employee.id, employee)}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              title="Restore Employee"
              disabled={loading.bulkOperations}
            >
              <RotateCcw size={16} />
            </button>
          ) : (
            <span
              className="text-gray-400 dark:text-gray-600 p-1"
              title="Cannot restore permanently deleted employee"
            >
              <XCircle size={16} />
            </span>
          )}
        </div>
      </td>
    </tr>
  );

  const renderTable = () => (
    <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedArchivedEmployees.length === archivedEmployees.length && archivedEmployees.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Employee
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Position
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Deletion Type
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Deleted Date
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Employment Period
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Status
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {archivedEmployees.map(renderEmployeeRow)}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer with Selection Info */}
      {selectedArchivedEmployees.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${textPrimary}`}>
                {selectedArchivedEmployees.length} employee{selectedArchivedEmployees.length !== 1 ? 's' : ''} selected
              </span>
              {(() => {
                const restorableCount = archivedEmployees.filter(emp => 
                  selectedArchivedEmployees.includes(emp.id) && emp.can_be_restored
                ).length;
                const permanentCount = selectedArchivedEmployees.length - restorableCount;
                
                return (
                  <div className="flex items-center space-x-2 text-sm">
                    {restorableCount > 0 && (
                      <span className="text-green-600 dark:text-green-400">
                        {restorableCount} restorable
                      </span>
                    )}
                    {permanentCount > 0 && (
                      <span className="text-red-600 dark:text-red-400">
                        {permanentCount} permanent
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
            <button
              onClick={() => clearArchivedEmployeesSelection()}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderEmptyState = () => (
    <div className={`${bgCard} rounded-lg border ${borderColor} p-8 text-center`}>
      <Archive className={`w-12 h-12 ${textMuted} mx-auto mb-4`} />
      <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>
        No Archived Employees Found
      </h3>
      <p className={`${textSecondary} mb-4`}>
        {activeFilters.length > 0 
          ? "No employees match your current search criteria."
          : "There are no archived employees at the moment."}
      </p>
      {activeFilters.length > 0 && (
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  // ========================================
  // CLEANUP ON UNMOUNT
  // ========================================
  
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // ========================================
  // ERROR HANDLING
  // ========================================

  if (errors.archivedEmployees) {
    return (
      <div className="container mx-auto pt-3 max-w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
            <p className="text-sm mb-4">
              {errors.archivedEmployees.message || 'Failed to load archived employees'}
            </p>
            <button 
              onClick={() => {
                initialized.current = false;
                lastApiParamsRef.current = null;
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="container mx-auto pt-3 max-w-full">
      {/* Header */}
      {renderHeader()}

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Search archived employees by name, email, or employee ID..."
        />
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Loading State */}
      {loading.archivedEmployees ? (
        <div className={`${bgCard} rounded-lg border ${borderColor} p-8 text-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border border-gray-500 border-t-transparent mx-auto mb-4"></div>
          <p className={textSecondary}>Loading archived employees...</p>
        </div>
      ) : archivedEmployees.length === 0 ? (
        renderEmptyState()
      ) : (
        renderTable()
      )}

      {/* Pagination */}
      {archivedEmployees.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={archivePagination.page}
            totalPages={archivePagination.totalPages}
            totalItems={archivePagination.count}
            pageSize={archivePagination.pageSize}
            onPageChange={setArchivePage}
            onPageSizeChange={setArchivePageSize}
            loading={loading.archivedEmployees}
            darkMode={darkMode}
            showQuickJump={true}
            showPageSizeSelector={true}
            showItemsInfo={true}
            showFirstLast={true}
            compactMode={false}
            allowCustomPageSize={true}
            maxDisplayPages={7}
            pageSizeOptions={[10, 25, 50, 100, 250, 500]}
          />
        </div>
      )}
    </div>
  );
};

export default ArchiveEmployeesTable;