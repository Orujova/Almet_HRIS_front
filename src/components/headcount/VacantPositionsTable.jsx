// src/components/headcount/VacantPositionsTable.jsx - FIXED VERSION
"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useVacantPositions } from "../../hooks/useVacantPositions";
import { useReferenceData } from "../../hooks/useReferenceData";
import { Plus, Filter, Search, MoreVertical, Briefcase, Users, FileText, X } from "lucide-react";

// Components
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";
import VacantPositionCard from "./VacantPositionCard";
import VacantPositionModal from "./VacantPositionModal";
import ConvertToEmployeeModal from "./ConvertToEmployeeModal";

const VacantPositionsTable = () => {
  const { darkMode } = useTheme();
  
  // ========================================
  // HOOKS & API INTEGRATION
  // ========================================
  
  const {
    // Data
    vacantPositions,
    vacantPositionsStats,
    selectedVacantPositions,
    
    // Loading & Errors
    loading,
    errors,
    
    // Pagination
    vacantPagination,
    
    // API Functions
    fetchVacantPositions,
    createVacantPosition,
    updateVacantPosition,
    deleteVacantPosition,
    convertToEmployee,
    fetchVacantPositionsStatistics,
    
    // Selection Helpers
    toggleVacantPositionSelection,
    clearVacantPositionsSelection,
    selectAllVacantPositions,
    
    // Pagination Helpers
    setVacantPositionsPage,
    setVacantPositionsPageSize,
    
    // Utility
    clearErrors
  } = useVacantPositions();

  // Reference data for forms
  const {
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    loading: refLoading
  } = useReferenceData();

  // ========================================
  // LOCAL STATE
  // ========================================
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    business_function: [],
    department: [],
    unit: [],
    job_function: [],
    position_group: [],
    grading_level: []
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
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
  // GRADING LEVEL OPTIONS
  // ========================================
  
  const gradingLevelOptions = [
    { value: '_LD', label: 'Lower Decile (-LD)' },
    { value: '_LQ', label: 'Lower Quartile (-LQ)' },
    { value: '_M', label: 'Median (-M)' },
    { value: '_UQ', label: 'Upper Quartile (-UQ)' },
    { value: '_UD', label: 'Upper Decile (-UD)' }
  ];

  // ========================================
  // API PARAMS BUILDER WITH LOOP PREVENTION
  // ========================================
  
  const buildApiParams = useMemo(() => {
    const params = {
      page: vacantPagination.page || 1,
      page_size: vacantPagination.pageSize || 25
    };

    // Search
    if (searchTerm?.trim()) {
      params.search = searchTerm.trim();
    }

    // Filters - Handle arrays properly
    Object.keys(filters).forEach(filterKey => {
      if (filters[filterKey] && Array.isArray(filters[filterKey]) && filters[filterKey].length > 0) {
        params[filterKey] = filters[filterKey].join(',');
      }
    });

    return params;
  }, [searchTerm, filters, vacantPagination.page, vacantPagination.pageSize]);

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
  
  const debouncedFetchPositions = useCallback((params, immediate = false) => {
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
      fetchVacantPositions(params);
    }, delay);
  }, [fetchVacantPositions]);

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
          fetchVacantPositionsStatistics(),
          fetchVacantPositions(buildApiParams)
        ]);
        
      } catch (error) {
        console.error('Failed to initialize VacantPositionsTable:', error);
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
      debouncedFetchPositions(buildApiParams);
    }
  }, [apiParamsChanged, buildApiParams, debouncedFetchPositions]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setVacantPositionsPage(1);
  }, [setVacantPositionsPage]);

  const handleFilterChange = useCallback((filterKey, values) => {
    setFilters(prev => ({ ...prev, [filterKey]: values }));
    setVacantPositionsPage(1);
  }, [setVacantPositionsPage]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      business_function: [],
      department: [],
      unit: [],
      job_function: [],
      position_group: [],
      grading_level: []
    });
    setSearchTerm("");
    setVacantPositionsPage(1);
  }, [setVacantPositionsPage]);

  const handleClearFilter = useCallback((filterKey) => {
    if (filterKey === 'search') {
      setSearchTerm("");
    } else {
      setFilters(prev => ({ ...prev, [filterKey]: [] }));
    }
    setVacantPositionsPage(1);
  }, [setVacantPositionsPage]);

  // ========================================
  // MODAL HANDLERS
  // ========================================

  const handleCreatePosition = useCallback(() => {
    setSelectedPosition(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleEditPosition = useCallback((position) => {
    setSelectedPosition(position);
    setIsEditModalOpen(true);
  }, []);

  const handleConvertPosition = useCallback((position) => {
    setSelectedPosition(position);
    setIsConvertModalOpen(true);
  }, []);

  const handleDeletePosition = useCallback(async (positionId) => {
    const position = vacantPositions.find(p => p.id === positionId);
    const positionName = position?.job_title || 'this vacant position';
    
    if (confirm(`Are you sure you want to delete "${positionName}"?`)) {
      try {
        await deleteVacantPosition(positionId);
        alert('Vacant position deleted successfully!');
      } catch (error) {
        alert(`Failed to delete position: ${error.message}`);
      }
    }
  }, [deleteVacantPosition, vacantPositions]);

  // ========================================
  // FORM SUBMISSION HANDLERS
  // ========================================

  const handleCreateSubmit = useCallback(async (formData) => {
    try {
      await createVacantPosition(formData);
      setIsCreateModalOpen(false);
      alert('Vacant position created successfully!');
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  }, [createVacantPosition]);

  const handleEditSubmit = useCallback(async (formData) => {
    try {
      await updateVacantPosition(selectedPosition.id, formData);
      setIsEditModalOpen(false);
      setSelectedPosition(null);
      alert('Vacant position updated successfully!');
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  }, [updateVacantPosition, selectedPosition]);

  const handleConvertSubmit = useCallback(async (employeeData, document, profilePhoto) => {
    try {
      const result = await convertToEmployee(selectedPosition.id, employeeData, document, profilePhoto);
      setIsConvertModalOpen(false);
      setSelectedPosition(null);
      alert(result.message || 'Position converted to employee successfully!');
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  }, [convertToEmployee, selectedPosition]);

  // ========================================
  // SELECTION HANDLERS
  // ========================================

  const handleToggleSelection = useCallback((positionId) => {
    toggleVacantPositionSelection(positionId);
  }, [toggleVacantPositionSelection]);

  const handleSelectAll = useCallback(() => {
    if (selectedVacantPositions.length === vacantPositions.length && vacantPositions.length > 0) {
      clearVacantPositionsSelection();
    } else {
      selectAllVacantPositions();
    }
  }, [selectedVacantPositions.length, vacantPositions.length, clearVacantPositionsSelection, selectAllVacantPositions]);

  // ========================================
  // BULK ACTIONS
  // ========================================

  const handleBulkDelete = useCallback(async () => {
    if (selectedVacantPositions.length === 0) {
      alert("Please select positions to delete.");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedVacantPositions.length} vacant position${selectedVacantPositions.length !== 1 ? 's' : ''}?`;
    
    if (confirm(confirmMessage)) {
      try {
        const deletePromises = selectedVacantPositions.map(id => deleteVacantPosition(id));
        await Promise.all(deletePromises);
        clearVacantPositionsSelection();
        alert(`Successfully deleted ${selectedVacantPositions.length} position${selectedVacantPositions.length !== 1 ? 's' : ''}!`);
      } catch (error) {
        alert(`Failed to delete positions: ${error.message}`);
      }
    }
  }, [selectedVacantPositions, deleteVacantPosition, clearVacantPositionsSelection]);

  // ========================================
  // ACTIVE FILTERS CALCULATION
  // ========================================
  
  const activeFilters = useMemo(() => {
    const active = [];
    
    if (searchTerm) {
      active.push({ key: "search", label: `Search: ${searchTerm}` });
    }
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].length > 0) {
        let label = '';
        switch (key) {
          case 'business_function':
            const bfLabels = filters[key].map(id => {
              const bf = businessFunctions?.find(b => b.id === parseInt(id));
              return bf ? `${bf.name} (${bf.code})` : id;
            });
            label = `Business Function: ${bfLabels.join(', ')}`;
            break;
          case 'department':
            const deptLabels = filters[key].map(id => {
              const dept = departments?.find(d => d.id === parseInt(id));
              return dept ? dept.name : id;
            });
            label = `Department: ${deptLabels.join(', ')}`;
            break;
          case 'position_group':
            const pgLabels = filters[key].map(id => {
              const pg = positionGroups?.find(p => p.id === parseInt(id));
              return pg ? pg.display_name : id;
            });
            label = `Position Group: ${pgLabels.join(', ')}`;
            break;
          case 'grading_level':
            const gradeLabels = filters[key].map(value => {
              const grade = gradingLevelOptions.find(g => g.value === value);
              return grade ? grade.label : value;
            });
            label = `Grade: ${gradeLabels.join(', ')}`;
            break;
          default:
            label = `${key.replace('_', ' ')}: ${filters[key].length} selected`;
        }
        active.push({ key, label });
      }
    });
    
    return active;
  }, [searchTerm, filters, businessFunctions, departments, positionGroups]);

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderHeader = () => (
    <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm mb-4`}>
      <div className="p-4">
        {/* Top Row: Title + Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg mr-3">
              <Briefcase className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${textPrimary}`}>
                Vacant Positions Management
              </h1>
              <p className={`text-sm ${textSecondary}`}>
                {vacantPositionsStats?.total_vacant_positions || 0} vacant positions
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Bulk Delete Button */}
            {selectedVacantPositions.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors font-medium bg-red-600 text-white hover:bg-red-700"
                disabled={loading.deleting}
              >
                {loading.deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <X size={14} className="mr-1" />
                    Delete ({selectedVacantPositions.length})
                  </>
                )}
              </button>
            )}

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

            {/* Create Position Button */}
            <button
              onClick={handleCreatePosition}
              className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors font-medium bg-orange-600 text-white hover:bg-orange-700"
            >
              <Plus size={14} className="mr-1" />
              Create Position
            </button>
          </div>
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Total Positions</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {vacantPositionsStats?.total_vacant_positions || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Recent (30 days)</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {vacantPositionsStats?.recent_vacancies || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Departments</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {Object.keys(vacantPositionsStats?.by_department || {}).length}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Functions</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {Object.keys(vacantPositionsStats?.by_business_function || {}).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    isFiltersOpen && (
      <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm mb-4 p-4`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Business Function Filter */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Business Function
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
              {businessFunctions?.map(bf => (
                <label key={bf.id} className="flex items-center mb-1">
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
                    className="w-3 h-3 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className={`ml-2 text-sm ${textPrimary}`}>
                    {bf.name} ({bf.code})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Department
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
              {departments?.map(dept => (
                <label key={dept.id} className="flex items-center mb-1">
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
                    className="w-3 h-3 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className={`ml-2 text-sm ${textPrimary}`}>{dept.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Position Group Filter */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Position Group
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
              {positionGroups?.map(pg => (
                <label key={pg.id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={filters.position_group.includes(pg.id.toString())}
                    onChange={(e) => {
                      const value = pg.id.toString();
                      const newValues = e.target.checked
                        ? [...filters.position_group, value]
                        : filters.position_group.filter(v => v !== value);
                      handleFilterChange('position_group', newValues);
                    }}
                    className="w-3 h-3 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className={`ml-2 text-sm ${textPrimary}`}>
                    {pg.display_name} (Level {pg.hierarchy_level})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Job Function Filter */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Job Function
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
              {jobFunctions?.map(jf => (
                <label key={jf.id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={filters.job_function.includes(jf.id.toString())}
                    onChange={(e) => {
                      const value = jf.id.toString();
                      const newValues = e.target.checked
                        ? [...filters.job_function, value]
                        : filters.job_function.filter(v => v !== value);
                      handleFilterChange('job_function', newValues);
                    }}
                    className="w-3 h-3 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className={`ml-2 text-sm ${textPrimary}`}>{jf.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Unit Filter */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Unit
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2">
              {units?.map(unit => (
                <label key={unit.id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={filters.unit.includes(unit.id.toString())}
                    onChange={(e) => {
                      const value = unit.id.toString();
                      const newValues = e.target.checked
                        ? [...filters.unit, value]
                        : filters.unit.filter(v => v !== value);
                      handleFilterChange('unit', newValues);
                    }}
                    className="w-3 h-3 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className={`ml-2 text-sm ${textPrimary}`}>{unit.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Grading Level Filter */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Grading Level
            </label>
            <div className="space-y-1">
              {gradingLevelOptions.map(grade => (
                <label key={grade.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.grading_level.includes(grade.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...filters.grading_level, grade.value]
                        : filters.grading_level.filter(v => v !== grade.value);
                      handleFilterChange('grading_level', newValues);
                    }}
                    className="w-3 h-3 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className={`ml-2 text-sm ${textPrimary}`}>{grade.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters and Actions */}
        {activeFilters.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-wrap gap-2">
                <span className={`text-sm font-medium ${textPrimary}`}>Active Filters:</span>
                {activeFilters.map(filter => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                  >
                    {filter.label}
                    <button
                      onClick={() => handleClearFilter(filter.key)}
                      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    )
  );

  const renderPositionsList = () => (
    <div className="space-y-4">
      {loading.vacantPositions ? (
        <div className={`${bgCard} rounded-lg border ${borderColor} p-8 text-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className={textSecondary}>Loading vacant positions...</p>
        </div>
      ) : vacantPositions.length === 0 ? (
        <div className={`${bgCard} rounded-lg border ${borderColor} p-8 text-center`}>
          <Briefcase className={`w-12 h-12 ${textMuted} mx-auto mb-4`} />
          <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>
            No Vacant Positions Found
          </h3>
          <p className={`${textSecondary} mb-4`}>
            {activeFilters.length > 0 
              ? "No positions match your current filters. Try adjusting your search criteria."
              : "There are no vacant positions at the moment."}
          </p>
          {activeFilters.length > 0 ? (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={handleCreatePosition}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Create First Position
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Selection Controls */}
          {vacantPositions.length > 0 && (
            <div className={`${bgCard} rounded-lg border ${borderColor} p-4 mb-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedVacantPositions.length === vacantPositions.length && vacantPositions.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className={`ml-2 text-sm ${textPrimary}`}>
                      Select All ({vacantPositions.length})
                    </span>
                  </label>
                  {selectedVacantPositions.length > 0 && (
                    <span className={`text-sm ${textSecondary}`}>
                      {selectedVacantPositions.length} position{selectedVacantPositions.length !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
                {selectedVacantPositions.length > 0 && (
                  <button
                    onClick={() => clearVacantPositionsSelection()}
                    className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Positions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vacantPositions.map(position => (
              <div key={position.id} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedVacantPositions.includes(position.id)}
                    onChange={() => handleToggleSelection(position.id)}
                    className="w-4 h-4 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500 shadow-sm"
                  />
                </div>

                <VacantPositionCard
                  position={position}
                  onEdit={handleEditPosition}
                  onDelete={handleDeletePosition}
                  onConvert={handleConvertPosition}
                  darkMode={darkMode}
                />
              </div>
            ))}
          </div>
        </>
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

  if (errors.vacantPositions) {
    return (
      <div className="container mx-auto pt-3 max-w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
            <p className="text-sm mb-4">
              {errors.vacantPositions.message || 'Failed to load vacant positions'}
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
          placeholder="Search positions by title, department, or function..."
        />
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Positions List */}
      {renderPositionsList()}

      {/* Pagination */}
      {vacantPositions.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={vacantPagination.page}
            totalPages={vacantPagination.totalPages}
            totalItems={vacantPagination.count}
            pageSize={vacantPagination.pageSize}
            onPageChange={setVacantPositionsPage}
            onPageSizeChange={setVacantPositionsPageSize}
            loading={loading.vacantPositions}
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

      {/* Modals */}
      {isCreateModalOpen && (
        <VacantPositionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
          mode="create"
          darkMode={darkMode}
        />
      )}

      {isEditModalOpen && selectedPosition && (
        <VacantPositionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPosition(null);
          }}
          onSubmit={handleEditSubmit}
          mode="edit"
          initialData={selectedPosition}
          darkMode={darkMode}
        />
      )}

      {isConvertModalOpen && selectedPosition && (
        <ConvertToEmployeeModal
          isOpen={isConvertModalOpen}
          onClose={() => {
            setIsConvertModalOpen(false);
            setSelectedPosition(null);
          }}
          onSubmit={handleConvertSubmit}
          position={selectedPosition}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default VacantPositionsTable;