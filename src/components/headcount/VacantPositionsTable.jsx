// src/components/headcount/VacantPositionsTable.jsx
"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useVacantPositions } from "../../hooks/useVacantPositions";
import { useReferenceData } from "../../hooks/useReferenceData";
import { Plus, Filter, Search, MoreVertical, Briefcase, Users, FileText } from "lucide-react";

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

  // Refs
  const initialized = useRef(false);
  const debounceRef = useRef(null);

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
  // API PARAMS BUILDER
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

    // Filters
    Object.keys(filters).forEach(filterKey => {
      if (filters[filterKey] && Array.isArray(filters[filterKey]) && filters[filterKey].length > 0) {
        params[filterKey] = filters[filterKey].join(',');
      }
    });

    return params;
  }, [searchTerm, filters, vacantPagination]);

  // ========================================
  // DEBOUNCED DATA FETCHING
  // ========================================
  
  const debouncedFetchPositions = useCallback((params, immediate = false) => {
    const delay = immediate ? 0 : 500;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
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
  }, []);

  // ========================================
  // DATA FETCHING ON PARAM CHANGES
  // ========================================
  
  useEffect(() => {
    if (initialized.current) {
      debouncedFetchPositions(buildApiParams);
    }
  }, [buildApiParams, debouncedFetchPositions]);

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
    if (confirm('Are you sure you want to delete this vacant position?')) {
      try {
        await deleteVacantPosition(positionId);
        alert('Vacant position deleted successfully!');
      } catch (error) {
        alert(`Failed to delete position: ${error.message}`);
      }
    }
  }, [deleteVacantPosition]);

  // ========================================
  // FORM SUBMISSION HANDLERS
  // ========================================

  const handleCreateSubmit = useCallback(async (formData) => {
    try {
      await createVacantPosition(formData);
      setIsCreateModalOpen(false);
      alert('Vacant position created successfully!');
    } catch (error) {
      alert(`Failed to create position: ${error.message}`);
    }
  }, [createVacantPosition]);

  const handleEditSubmit = useCallback(async (formData) => {
    try {
      await updateVacantPosition(selectedPosition.id, formData);
      setIsEditModalOpen(false);
      setSelectedPosition(null);
      alert('Vacant position updated successfully!');
    } catch (error) {
      alert(`Failed to update position: ${error.message}`);
    }
  }, [updateVacantPosition, selectedPosition]);

  const handleConvertSubmit = useCallback(async (employeeData, document, profilePhoto) => {
    try {
      const result = await convertToEmployee(selectedPosition.id, employeeData, document, profilePhoto);
      setIsConvertModalOpen(false);
      setSelectedPosition(null);
      alert(result.message || 'Position converted to employee successfully!');
    } catch (error) {
      alert(`Failed to convert position: ${error.message}`);
    }
  }, [convertToEmployee, selectedPosition]);

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
        active.push({ 
          key, 
          label: `${key.replace('_', ' ')}: ${filters[key].length} selected`
        });
      }
    });
    
    return active;
  }, [searchTerm, filters]);

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
                {vacantPositionsStats.total_vacant_positions || 0} vacant positions
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
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
              {vacantPositionsStats.total_vacant_positions || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Recent (30 days)</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {vacantPositionsStats.recent_vacancies || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Departments</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {Object.keys(vacantPositionsStats.by_department || {}).length}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Functions</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {Object.keys(vacantPositionsStats.by_business_function || {}).length}
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
            <select
              multiple
              value={filters.business_function}
              onChange={(e) => handleFilterChange('business_function', Array.from(e.target.selectedOptions, option => option.value))}
              className={`w-full p-2 border ${borderColor} rounded-md ${bgCard} ${textPrimary}`}
            >
              {businessFunctions?.map(bf => (
                <option key={bf.id} value={bf.id}>
                  {bf.name} ({bf.code})
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Department
            </label>
            <select
              multiple
              value={filters.department}
              onChange={(e) => handleFilterChange('department', Array.from(e.target.selectedOptions, option => option.value))}
              className={`w-full p-2 border ${borderColor} rounded-md ${bgCard} ${textPrimary}`}
            >
              {departments?.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Position Group Filter */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Position Group
            </label>
            <select
              multiple
              value={filters.position_group}
              onChange={(e) => handleFilterChange('position_group', Array.from(e.target.selectedOptions, option => option.value))}
              className={`w-full p-2 border ${borderColor} rounded-md ${bgCard} ${textPrimary}`}
            >
              {positionGroups?.map(pg => (
                <option key={pg.id} value={pg.id}>
                  {pg.display_name} (Level {pg.hierarchy_level})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            {activeFilters.map(filter => (
              <span
                key={filter.key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
              >
                {filter.label}
                <button
                  onClick={() => {
                    if (filter.key === 'search') {
                      setSearchTerm('');
                    } else {
                      handleFilterChange(filter.key, []);
                    }
                  }}
                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  ×
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
    )
  );

  const renderPositionsList = () => (
    <div className="space-y-4">
      {loading.vacantPositions ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border border-orange-500 border-t-transparent mx-auto mb-2"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vacantPositions.map(position => (
            <VacantPositionCard
              key={position.id}
              position={position}
              onEdit={handleEditPosition}
              onDelete={handleDeletePosition}
              onConvert={handleConvertPosition}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </div>
  );

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
              onClick={() => window.location.reload()}
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