// src/components/headcount/HeadcountTable.jsx - Optimized with Complete API Integration
"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useEmployees } from "../../hooks/useEmployees";
import { useReferenceData } from "../../hooks/useReferenceData";

import HeadcountHeader from "./HeadcountHeader";
import SearchBar from "./SearchBar";
import QuickFilterBar from "./QuickFilterBar";
import AdvancedFilterPanel from "./AdvancedFilterPanel";
import EmployeeTable from "./EmployeeTable";
import Pagination from "./Pagination";
import ActionMenu from "./ActionMenu";
import HierarchyLegend from "./HierarchyLegend";
import ColorSelector from "./ColorModeSelector";
import ExportModal from "./ExportModal";
import BulkUploadForm from "./BulkUploadForm";

const HeadcountTable = () => {
  const { darkMode } = useTheme();
  
  // ========================================
  // HOOKS & API INTEGRATION
  // ========================================
  
  // Employee Management Hook with complete API integration
  const {
    formattedEmployees,
    loading,
    error,
    selectedEmployees,
    currentFilters,
    pagination,
    sorting,
    statistics,
    // Fetch operations
    fetchEmployees,
    fetchFilterOptions,
    fetchStatistics,
    // Selection management
    toggleEmployeeSelection,
    selectAllEmployees,
    clearSelection,
    // Filter management
    setCurrentFilters,
    clearFilters,
    removeFilter,
    // Sorting management
    setSorting,
    addSort,
    removeSort,
    clearSorting,
    // Pagination
    setPageSize,
    setCurrentPage,
    // Bulk operations
    bulkUpdateEmployees,
    bulkDeleteEmployees,
    bulkAddTags,
    bulkRemoveTags,
    updateEmployeeStatus,
    exportEmployees,
    deleteEmployee,
    // Helpers
    getSortDirection,
    isSorted,
    getSortIndex,
    clearErrors
  } = useEmployees();

  // Reference Data Hook
  const {
    employeeStatuses,
    employeeTags,
    businessFunctions,
    departments,
    loading: refLoading
  } = useReferenceData();

  // ========================================
  // LOCAL STATE FOR UI
  // ========================================
  
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState([]);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [employeeVisibility, setEmployeeVisibility] = useState({});

  // Refs to track initialization and prevent loops
  const initialized = useRef(false);
  const lastApiParams = useRef(null);

  // ========================================
  // INITIALIZATION
  // ========================================
  
  // Initialize data only once on mount
  useEffect(() => {
    const initializeData = async () => {
      if (initialized.current) return;
      
      try {
        initialized.current = true;
        clearErrors();
        
        // Run initial data fetch in parallel
        await Promise.all([
          fetchFilterOptions(),
          fetchStatistics()
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        initialized.current = false; // Allow retry
      }
    };

    initializeData();
  }, []); // Empty dependency array - run only once

  // ========================================
  // API PARAMS BUILDER
  // ========================================
  
  // Debounced API params builder with proper formatting
  const buildApiParams = useMemo(() => {
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize
    };

    // Add search term
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    // Add multi-select status filters
    if (statusFilter.length > 0) {
      params.status = statusFilter;
    }

    // Add multi-select department filters
    if (departmentFilter.length > 0) {
      params.department = departmentFilter;
    }

    // Add advanced filters from currentFilters
    Object.keys(currentFilters).forEach(key => {
      const value = currentFilters[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          params[key] = value;
        } else if (!Array.isArray(value)) {
          params[key] = value;
        }
      }
    });

    // Add Excel-style multi-column sorting
    if (sorting && sorting.length > 0) {
      const orderingFields = sorting.map(sort => 
        sort.direction === 'desc' ? `-${sort.field}` : sort.field
      );
      params.ordering = orderingFields.join(',');
    }

    return params;
  }, [
    pagination.currentPage, 
    pagination.pageSize, 
    searchTerm, 
    statusFilter, 
    departmentFilter, 
    currentFilters,
    sorting
  ]);

  // ========================================
  // DEBOUNCED FETCH FUNCTION
  // ========================================
  
  // Debounced fetch function to prevent excessive API calls
  const debouncedFetchEmployees = useCallback(
    (() => {
      let timeoutId;
      
      return (params) => {
        // Clear existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Check if params actually changed
        const paramsString = JSON.stringify(params);
        if (lastApiParams.current === paramsString) {
          return; // No change, skip request
        }
        
        // Set new timeout
        timeoutId = setTimeout(() => {
          lastApiParams.current = paramsString;
          fetchEmployees(params);
        }, 300); // 300ms debounce
      };
    })(),
    [fetchEmployees]
  );

  // Fetch employees when params change (debounced)
  useEffect(() => {
    if (initialized.current) {
      debouncedFetchEmployees(buildApiParams);
    }
  }, [buildApiParams, debouncedFetchEmployees]);

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page
  }, [setCurrentPage]);

  const toggleAdvancedFilter = useCallback(() => {
    setIsAdvancedFilterOpen(prev => !prev);
  }, []);

  const handleApplyAdvancedFilters = useCallback((filters) => {
    setCurrentFilters(filters);
    setIsAdvancedFilterOpen(false);
    setCurrentPage(1);
  }, [setCurrentFilters, setCurrentPage]);

  const handleClearAllFilters = useCallback(() => {
    clearFilters();
    setStatusFilter([]);
    setDepartmentFilter([]);
    setSearchTerm("");
    setCurrentPage(1);
  }, [clearFilters, setCurrentPage]);

  // Multi-select status filter handler
  const handleStatusChange = useCallback((selectedStatuses) => {
    setStatusFilter(selectedStatuses);
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Multi-select department filter handler
  const handleDepartmentChange = useCallback((selectedDepartments) => {
    setDepartmentFilter(selectedDepartments);
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleClearFilter = useCallback((key) => {
    if (key === "status") {
      setStatusFilter([]);
    } else if (key === "department") {
      setDepartmentFilter([]);
    } else if (key === "search") {
      setSearchTerm("");
    } else {
      removeFilter(key);
    }
    setCurrentPage(1);
  }, [removeFilter, setCurrentPage]);

  // ========================================
  // EXCEL-LIKE SORTING HANDLERS
  // ========================================
  
  // Excel-like sorting handlers with multi-column support
  const handleSort = useCallback((field, ctrlKey = false) => {
    if (ctrlKey) {
      // Multi-sort with Ctrl+Click
      const currentDirection = getSortDirection(field);
      let newDirection;
      
      if (!currentDirection) {
        newDirection = 'asc';
      } else if (currentDirection === 'asc') {
        newDirection = 'desc';
      } else {
        // Remove this sort
        removeSort(field);
        return;
      }
      
      addSort(field, newDirection);
    } else {
      // Single sort
      const currentDirection = getSortDirection(field);
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      setSorting(field, newDirection);
    }
  }, [getSortDirection, addSort, removeSort, setSorting]);

  // ========================================
  // SELECTION HANDLERS
  // ========================================
  
  const toggleSelectAll = useCallback(() => {
    if (selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0) {
      clearSelection();
    } else {
      selectAllEmployees();
    }
  }, [selectedEmployees.length, formattedEmployees.length, clearSelection, selectAllEmployees]);

  const toggleActionMenu = useCallback(() => {
    setIsActionMenuOpen(prev => !prev);
  }, []);

  // ========================================
  // BULK ACTION HANDLERS
  // ========================================
  
  // Enhanced bulk action handler with proper API integration
  const handleBulkAction = useCallback(async (action, options = {}) => {
    setIsActionMenuOpen(false);

    if (selectedEmployees.length === 0 && !['export', 'downloadTemplate', 'bulkImport'].includes(action)) {
      alert("Please select employees first");
      return;
    }

    try {
      switch (action) {
        case "export":
          setIsExportModalOpen(true);
          break;

        case "bulkImport":
          setIsBulkUploadOpen(true);
          break;

        case "downloadTemplate":
          // Download template without selection requirement
          const templateResponse = await exportEmployees({ 
            format: 'excel', 
            template: true 
          });
          if (templateResponse.meta?.requestStatus === 'fulfilled') {
            console.log('Template downloaded successfully');
          }
          break;

        case "delete":
          if (confirm(`Are you sure you want to delete ${selectedEmployees.length} employee(s)? This action cannot be undone.`)) {
            const result = await bulkDeleteEmployees(selectedEmployees);
            if (result.meta?.requestStatus === 'fulfilled') {
              clearSelection();
              // Refresh data after successful action
              debouncedFetchEmployees(buildApiParams);
              fetchStatistics(); // Update statistics
            }
          }
          break;

        case "updateStatus":
          if (options.newStatus) {
            const result = await updateEmployeeStatus(selectedEmployees, options.newStatus);
            if (result.meta?.requestStatus === 'fulfilled') {
              clearSelection();
              debouncedFetchEmployees(buildApiParams);
              fetchStatistics();
            }
          }
          break;

        case "addTags":
          if (options.tagIds && options.tagIds.length > 0) {
            const result = await bulkAddTags(selectedEmployees, options.tagIds);
            if (result.meta?.requestStatus === 'fulfilled') {
              clearSelection();
              debouncedFetchEmployees(buildApiParams);
            }
          }
          break;

        case "removeTags":
          if (options.tagIds && options.tagIds.length > 0) {
            const result = await bulkRemoveTags(selectedEmployees, options.tagIds);
            if (result.meta?.requestStatus === 'fulfilled') {
              clearSelection();
              debouncedFetchEmployees(buildApiParams);
            }
          }
          break;

        case "bulkUpdate":
          if (options.updates) {
            const result = await bulkUpdateEmployees({
              employee_ids: selectedEmployees,
              updates: options.updates
            });
            if (result.meta?.requestStatus === 'fulfilled') {
              clearSelection();
              debouncedFetchEmployees(buildApiParams);
            }
          }
          break;

        default:
          console.warn(`Unknown bulk action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to perform bulk action ${action}:`, error);
      alert(`Failed to ${action}. Please try again.`);
    }
  }, [selectedEmployees, clearSelection, bulkDeleteEmployees, updateEmployeeStatus, bulkAddTags, bulkRemoveTags, bulkUpdateEmployees, exportEmployees, debouncedFetchEmployees, buildApiParams, fetchStatistics]);

  // ========================================
  // EXPORT FUNCTIONALITY
  // ========================================
  
  const handleExport = useCallback(async (exportOptions) => {
    try {
      const exportParams = {
        ...buildApiParams,
        format: exportOptions.format || 'excel',
        includeFields: exportOptions.includeFields
      };

      // Handle different export types
      if (exportOptions.type === 'selected' && selectedEmployees.length > 0) {
        exportParams.employee_ids = selectedEmployees;
      }
      // For 'filtered' and 'all', use current filters

      const result = await exportEmployees(exportParams);
      
      if (result.meta?.requestStatus === 'fulfilled') {
        console.log('Export completed successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExportModalOpen(false);
    }
  }, [buildApiParams, selectedEmployees, exportEmployees]);

  const handleBulkImportComplete = useCallback((result) => {
    // Refresh all data after bulk import
    fetchStatistics();
    debouncedFetchEmployees(buildApiParams);
    setIsBulkUploadOpen(false);
    
    if (result?.imported_count) {
      alert(`Successfully imported ${result.imported_count} employees!`);
    }
  }, [fetchStatistics, debouncedFetchEmployees, buildApiParams]);

  // ========================================
  // EMPLOYEE ACTION HANDLERS
  // ========================================
  
  const handleEmployeeAction = useCallback(async (employeeId, action) => {
    try {
      switch (action) {
        case "delete":
          if (confirm("Are you sure you want to delete this employee?")) {
            const result = await deleteEmployee(employeeId);
            if (result.meta?.requestStatus === 'fulfilled') {
              debouncedFetchEmployees(buildApiParams);
              fetchStatistics();
            }
          }
          break;

        case "addTag":
          alert("Add tag functionality - integrate with tag modal");
          break;

        case "changeManager":
          alert("Change manager functionality - integrate with line manager modal");
          break;

        case "viewJobDescription":
          alert("View job description - integrate with job description modal");
          break;

        case "performanceMatrix":
          alert("Performance matrix - integrate with performance module");
          break;

        case "message":
          alert("Message employee - integrate with messaging system");
          break;

        default:
          console.warn(`Unknown employee action: ${action}`);
      }
    } catch (error) {
      console.error(`Failed to perform action ${action}:`, error);
      alert(`Failed to ${action}. Please try again.`);
    }
  }, [deleteEmployee, debouncedFetchEmployees, buildApiParams, fetchStatistics]);

  // ========================================
  // ACTIVE FILTERS CALCULATION
  // ========================================
  
  const activeFilters = useMemo(() => {
    const filters = [];
    
    if (searchTerm) {
      filters.push({ key: "search", label: `Search: ${searchTerm}` });
    }
    if (statusFilter.length > 0) {
      filters.push({ 
        key: "status", 
        label: statusFilter.length === 1 
          ? `Status: ${statusFilter[0]}` 
          : `Status: ${statusFilter.length} selected`
      });
    }
    if (departmentFilter.length > 0) {
      filters.push({ 
        key: "department", 
        label: departmentFilter.length === 1 
          ? `Department: ${departmentFilter[0]}` 
          : `Department: ${departmentFilter.length} selected`
      });
    }
    
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
        const label = Array.isArray(value) && value.length > 1
          ? `${key}: ${value.length} selected`
          : `${key}: ${Array.isArray(value) ? value[0] : value}`;
        filters.push({ key, label });
      }
    });
    
    return filters;
  }, [searchTerm, statusFilter, departmentFilter, currentFilters]);

  // ========================================
  // ERROR HANDLING
  // ========================================
  
  if (error?.fetch) {
    return (
      <div className="container mx-auto pt-3 max-w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
            <p className="text-sm mb-4">
              {error?.fetch?.message || 'Failed to load employee data'}
            </p>
            <button 
              onClick={() => {
                initialized.current = false;
                lastApiParams.current = null;
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
  // RENDER
  // ========================================

  return (
    <div className="container mx-auto pt-3 max-w-full">
      {/* Header with Statistics and Actions */}
      <div className="relative">
        <HeadcountHeader
          onToggleAdvancedFilter={toggleAdvancedFilter}
          onToggleActionMenu={toggleActionMenu}
          isActionMenuOpen={isActionMenuOpen}
          selectedEmployees={selectedEmployees}
          onBulkImportComplete={handleBulkImportComplete}
          onBulkImport={() => setIsBulkUploadOpen(true)}
          statistics={statistics}
        />

        {/* Action Menu */}
        {isActionMenuOpen && (
          <div className="absolute right-2 top-16 z-50">
            <ActionMenu 
              isOpen={isActionMenuOpen}
              onClose={() => setIsActionMenuOpen(false)}
              onAction={handleBulkAction}
              selectedCount={selectedEmployees.length}
            />
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isAdvancedFilterOpen && (
        <AdvancedFilterPanel
          onApply={handleApplyAdvancedFilters}
          onClose={() => setIsAdvancedFilterOpen(false)}
          initialFilters={currentFilters}
          filterOptions={{
            businessFunctions,
            departments,
            employeeStatuses,
            employeeTags,
            // Add other filter options as needed
          }}
        />
      )}

      {/* Search and Quick Filters */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-3 mb-3">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        
        <div className="flex-shrink-0">
          <QuickFilterBar
            onStatusChange={handleStatusChange}
            onDepartmentChange={handleDepartmentChange}
            statusFilter={statusFilter}
            departmentFilter={departmentFilter}
            activeFilters={activeFilters}
            onClearFilter={handleClearFilter}
            statusOptions={employeeStatuses}
            departmentOptions={departments}
          />
        </div>
      </div>

      {/* Color Selector and Legend */}
      <div className="flex justify-between items-center mb-3">
        <ColorSelector />
        <HierarchyLegend />
      </div>

      {/* Multi-level Sorting Info */}
      {sorting.length > 1 && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Multi-level sorting active:
              </span>
              <div className="ml-2 flex items-center space-x-2">
                {sorting.map((sort, index) => (
                  <span 
                    key={sort.field}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                  >
                    {index + 1}. {sort.field} {sort.direction === 'asc' ? '↑' : '↓'}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={clearSorting}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Employee Table */}
      <EmployeeTable
        employees={formattedEmployees}
        loading={loading.fetch}
        selectedEmployees={selectedEmployees}
        selectAll={selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0}
        onToggleSelectAll={toggleSelectAll}
        onToggleEmployeeSelection={toggleEmployeeSelection}
        onSort={(field, event) => handleSort(field, event?.ctrlKey)}
        getSortDirection={getSortDirection}
        hasFilters={activeFilters.length > 0}
        onClearFilters={handleClearAllFilters}
        employeeVisibility={employeeVisibility}
        onVisibilityChange={(id, visible) => 
          setEmployeeVisibility(prev => ({ ...prev, [id]: visible }))
        }
        onEmployeeAction={handleEmployeeAction}
      />

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.count}
          pageSize={pagination.pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          loading={loading.fetch}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        totalEmployees={pagination.count}
        filteredCount={formattedEmployees.length}
        selectedEmployees={selectedEmployees}
      />

      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <BulkUploadForm
          onClose={() => setIsBulkUploadOpen(false)}
          onImportComplete={handleBulkImportComplete}
        />
      )}
    </div>
  );
};

export default HeadcountTable;