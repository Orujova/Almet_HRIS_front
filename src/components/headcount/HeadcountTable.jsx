// src/components/headcount/HeadcountTable.jsx - FIXED: Filter Integration
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
    refreshEmployees,
    refreshStatistics,
    // Selection management
    toggleEmployeeSelection,
    selectAllEmployees,
    clearSelection,
    setSelectedEmployees,
    // Filter management - FIXED: Using proper filter actions
    updateFilter,
    removeFilter,
    clearFilters,
    setCurrentFilters,
    // Sorting management
    setSorting,
    addSort,
    removeSort,
    clearSorting,
    // Pagination
    setPageSize,
    setCurrentPage,
    // Bulk operations
    bulkAddTags,
    bulkRemoveTags,
    bulkAssignLineManager,
    bulkExtendContracts,
    softDeleteEmployees,
    restoreEmployees,
    exportEmployees,
    downloadEmployeeTemplate,
    bulkUploadEmployees,
    deleteEmployee,
    // Helpers
    getSortDirection,
    isSorted,
    getSortIndex,
    clearErrors,
    buildQueryParams
  } = useEmployees();

  const {
    employeeStatuses,
    employeeTags,
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    loading: refLoading,
    error: refError
  } = useReferenceData();

  // ========================================
  // LOCAL STATE FOR UI - FIXED: Synchronized with backend filters
  // ========================================
  
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [employeeVisibility, setEmployeeVisibility] = useState({});

  // FIXED: Local filter state synchronized with backend
  const [localFilters, setLocalFilters] = useState({
    search: "",
    status: [],
    department: [],
    business_function: [],
    unit: [],
    job_function: [],
    position_group: [],
    tags: [],
    grading_level: [],
    contract_duration: [],
    line_manager: [],
    gender: [],
    start_date_from: "",
    start_date_to: "",
    contract_end_date_from: "",
    contract_end_date_to: "",
    years_of_service_min: "",
    years_of_service_max: "",

    is_active: ""
  });

  // Refs
  const initialized = useRef(false);
  const lastApiParams = useRef(null);

  // ========================================
  // FIXED: API PARAMS BUILDER - Proper Backend Format
  // ========================================
  
  const apiParams = useMemo(() => {
    const params = {
      page: pagination.page || pagination.currentPage || 1,
      page_size: pagination.pageSize || 25
    };

    // Search
    if (localFilters.search?.trim()) {
      params.search = localFilters.search.trim();
    }

    // Status filter - convert array to backend format
    if (localFilters.status?.length > 0) {
      params.status = localFilters.status.join(',');
    }

    // Department filter
    if (localFilters.department?.length > 0) {
      params.department = localFilters.department.join(',');
    }

    // Business function filter
    if (localFilters.business_function?.length > 0) {
      params.business_function = localFilters.business_function.join(',');
    }

    // Unit filter
    if (localFilters.unit?.length > 0) {
      params.unit = localFilters.unit.join(',');
    }

    // Job function filter
    if (localFilters.job_function?.length > 0) {
      params.job_function = localFilters.job_function.join(',');
    }

    // Position group filter
    if (localFilters.position_group?.length > 0) {
      params.position_group = localFilters.position_group.join(',');
    }

    // Tags filter
    if (localFilters.tags?.length > 0) {
      params.tags = localFilters.tags.join(',');
    }

    // Grading level filter
    if (localFilters.grading_level?.length > 0) {
      params.grading_level = localFilters.grading_level.join(',');
    }

    // Contract duration filter
    if (localFilters.contract_duration?.length > 0) {
      params.contract_duration = localFilters.contract_duration.join(',');
    }

    // Line manager filter
    if (localFilters.line_manager?.length > 0) {
      params.line_manager = localFilters.line_manager.join(',');
    }

    // Gender filter
    if (localFilters.gender?.length > 0) {
      params.gender = localFilters.gender.join(',');
    }

    // Date ranges
    if (localFilters.start_date_from) {
      params.start_date_from = localFilters.start_date_from;
    }
    if (localFilters.start_date_to) {
      params.start_date_to = localFilters.start_date_to;
    }
    if (localFilters.contract_end_date_from) {
      params.contract_end_date_from = localFilters.contract_end_date_from;
    }
    if (localFilters.contract_end_date_to) {
      params.contract_end_date_to = localFilters.contract_end_date_to;
    }

    // Years of service range
    if (localFilters.years_of_service_min) {
      params.years_of_service_min = localFilters.years_of_service_min;
    }
    if (localFilters.years_of_service_max) {
      params.years_of_service_max = localFilters.years_of_service_max;
    }

    if (localFilters.is_active && localFilters.is_active !== "all") {
      params.is_active = localFilters.is_active === "true";
    }

    // Sorting
    if (sorting && sorting.length > 0) {
      const orderingFields = sorting.map(sort => 
        sort.direction === 'desc' ? `-${sort.field}` : sort.field
      );
      params.ordering = orderingFields.join(',');
    }

    console.log('🔧 API Params built:', params);
    return params;
  }, [localFilters, pagination, sorting]);

  // ========================================
  // FIXED: DATA REFRESH HELPER
  // ========================================
  
  const refreshAllData = useCallback(async () => {
    console.log('🔄 Refreshing all data...');
    try {
      if (refreshEmployees && typeof refreshEmployees === 'function') {
        await refreshEmployees();
      } else {
        await fetchEmployees(apiParams);
      }
      
      if (refreshStatistics && typeof refreshStatistics === 'function') {
        await refreshStatistics();
      } else {
        await fetchStatistics();
      }
      
      console.log('✅ Data refresh completed');
    } catch (error) {
      console.error('❌ Data refresh failed:', error);
    }
  }, [refreshEmployees, refreshStatistics, fetchEmployees, fetchStatistics, apiParams]);

  // ========================================
  // FIXED: WORKING BULK ACTION HANDLERS
  // ========================================
  
  const handleBulkAction = useCallback(async (action, options = {}) => {
    console.log('🔥 BULK ACTION:', action, options);
    setIsActionMenuOpen(false);

    if (selectedEmployees.length === 0 && !['export', 'downloadTemplate', 'bulkImport'].includes(action)) {
      alert("⚠️ Please select employees first!");
      return;
    }

    try {
      let result;
      
      switch (action) {
        case "export":
          setIsExportModalOpen(true);
          break;

        case "bulkImport":
          setIsBulkUploadOpen(true);
          break;

        case "downloadTemplate":
          try {
            result = await downloadEmployeeTemplate();
            alert('✅ Template downloaded successfully!');
          } catch (error) {
            console.error('❌ Template download failed:', error);
            alert('❌ Template download failed: ' + error.message);
          }
          break;

        case "delete":
        case "softDelete":
          const deleteMessage = `Are you sure you want to ${action === 'softDelete' ? 'soft delete' : 'permanently delete'} ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}?`;
          
          if (confirm(deleteMessage)) {
            try {
              if (action === "softDelete") {
                result = await softDeleteEmployees(selectedEmployees);
              } else {
                const deletePromises = selectedEmployees.map(id => deleteEmployee(id));
                await Promise.all(deletePromises);
              }
              
              clearSelection();
              await refreshAllData();
              alert(`✅ ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} ${action === 'softDelete' ? 'soft deleted' : 'deleted'} successfully!`);
            } catch (error) {
              console.error(`❌ ${action} failed:`, error);
              alert(`❌ ${action} failed: ${error.message}`);
            }
          }
          break;

        case "restore":
          try {
            result = await restoreEmployees(selectedEmployees);
            clearSelection();
            await refreshAllData();
            alert(`✅ ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} restored successfully!`);
          } catch (error) {
            console.error('❌ Restore failed:', error);
            alert('❌ Restore failed: ' + error.message);
          }
          break;

        case "bulkAddTags":
          try {
            const payload = {
              employee_ids: options.employee_ids || selectedEmployees,
              tag_id: options.tag_id
            };
            
            result = await bulkAddTags(payload.employee_ids, payload.tag_id);
            clearSelection();
            await refreshAllData();
            
            const tagName = result?.tag_info?.name || 'Tag';
            alert(`✅ "${tagName}" tag added to ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            console.error('❌ Tag addition failed:', error);
            alert('❌ Tag addition failed: ' + error.message);
          }
          break;

        case "bulkRemoveTags":
          try {
            const payload = {
              employee_ids: options.employee_ids || selectedEmployees,
              tag_id: options.tag_id
            };
            
            result = await bulkRemoveTags(payload.employee_ids, payload.tag_id);
            clearSelection();
            await refreshAllData();
            alert(`✅ Tag removed from ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            console.error('❌ Tag removal failed:', error);
            alert('❌ Tag removal failed: ' + error.message);
          }
          break;

        case "bulkAssignLineManager":
          try {
            const payload = {
              employee_ids: options.employee_ids || selectedEmployees,
              line_manager_id: options.line_manager_id
            };
            
            result = await bulkAssignLineManager(payload.employee_ids, payload.line_manager_id);
            clearSelection();
            await refreshAllData();
            
            const managerName = result?.line_manager_info?.name || 'Line Manager';
            alert(`✅ ${managerName} assigned as line manager to ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            console.error('❌ Line manager assignment failed:', error);
            alert('❌ Line manager assignment failed: ' + error.message);
          }
          break;

        case "bulkExtendContracts":
          try {
            result = await bulkExtendContracts({
              employee_ids: selectedEmployees,
              new_contract_type: options.new_contract_type,
              new_start_date: options.new_start_date,
              reason: options.reason
            });
            
            clearSelection();
            await refreshAllData();
            alert(`✅ Contracts extended for ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            console.error('❌ Contract extension failed:', error);
            alert('❌ Contract extension failed: ' + error.message);
          }
          break;

        default:
          console.warn('❓ Unknown bulk action:', action);
          alert(`❓ "${action}" operation not implemented yet`);
      }
    } catch (error) {
      console.error(`❌ Bulk action ${action} failed:`, error);
      alert(`❌ ${action} failed. Error: ${error.message}`);
    }
  }, [
    selectedEmployees,
    clearSelection,
    refreshAllData,
    softDeleteEmployees,
    restoreEmployees,
    bulkAddTags,
    bulkRemoveTags,
    bulkAssignLineManager,
    bulkExtendContracts,
    downloadEmployeeTemplate,
    deleteEmployee
  ]);

  // ========================================
  // FIXED: FILTER HANDLERS - Proper Synchronization
  // ========================================

  // Search handler
  const handleSearchChange = useCallback((value) => {
    console.log('🔍 Search changed:', value);
    setLocalFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Status filter handler
  const handleStatusChange = useCallback((selectedStatuses) => {
    console.log('📊 Status filter changed:', selectedStatuses);
    setLocalFilters(prev => ({ ...prev, status: selectedStatuses }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Department filter handler
  const handleDepartmentChange = useCallback((selectedDepartments) => {
    console.log('🏢 Department filter changed:', selectedDepartments);
    setLocalFilters(prev => ({ ...prev, department: selectedDepartments }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Advanced filters handler
  const handleApplyAdvancedFilters = useCallback((filters) => {
    console.log('🔧 Advanced filters applied:', filters);
    
    // Convert backend comma-separated format back to arrays for local state
    const processedFilters = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes(',')) {
        // Convert comma-separated string to array
        processedFilters[key] = value.split(',').filter(Boolean);
      } else if (Array.isArray(value)) {
        processedFilters[key] = value;
      } else {
        processedFilters[key] = value;
      }
    });

    setLocalFilters(prev => ({ ...prev, ...processedFilters }));
    setIsAdvancedFilterOpen(false);
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Clear individual filter
  const handleClearFilter = useCallback((key) => {
    console.log('❌ Clearing filter:', key);
    
    if (key === "status") {
      setLocalFilters(prev => ({ ...prev, status: [] }));
    } else if (key === "department") {
      setLocalFilters(prev => ({ ...prev, department: [] }));
    } else if (key === "search") {
      setLocalFilters(prev => ({ ...prev, search: "" }));
    } else {
      // Clear other filters
      setLocalFilters(prev => ({ ...prev, [key]: Array.isArray(prev[key]) ? [] : "" }));
    }
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    console.log('❌ Clearing all filters');
    setLocalFilters({
      search: "",
      status: [],
      department: [],
      business_function: [],
      unit: [],
      job_function: [],
      position_group: [],
      tags: [],
      grading_level: [],
      contract_duration: [],
      line_manager: [],
      gender: [],
      start_date_from: "",
      start_date_to: "",
      contract_end_date_from: "",
      contract_end_date_to: "",
      years_of_service_min: "",
      years_of_service_max: "",
      is_active: ""
    });
    clearFilters();
    setCurrentPage(1);
  }, [clearFilters, setCurrentPage]);

  // ========================================
  // DEBOUNCED FETCH WITH PROPER PARAMS
  // ========================================
  
  const debouncedFetchEmployees = useCallback(
    (() => {
      let timeoutId;
      
      return (params) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        const paramsString = JSON.stringify(params);
        if (lastApiParams.current === paramsString) {
          return;
        }
        
        timeoutId = setTimeout(() => {
          lastApiParams.current = paramsString;
          console.log('🚀 Fetching employees with params:', params);
          fetchEmployees(params);
        }, 500); // Increased debounce time
      };
    })(),
    [fetchEmployees]
  );

  // ========================================
  // INITIALIZATION & DATA FETCHING
  // ========================================
  
  useEffect(() => {
    const initializeData = async () => {
      if (initialized.current) return;
      
      try {
        initialized.current = true;
        clearErrors();
        
        console.log('🚀 Initializing HeadcountTable...');
        await Promise.all([
          fetchFilterOptions(),
          fetchStatistics()
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        initialized.current = false;
      }
    };

    initializeData();
  }, []);

  // Fetch employees when params change
  useEffect(() => {
    if (initialized.current) {
      console.log('📡 API params changed, fetching employees...');
      debouncedFetchEmployees(apiParams);
    }
  }, [apiParams, debouncedFetchEmployees]);

  // ========================================
  // SELECTION HANDLERS
  // ========================================
  
  const handleEmployeeToggle = useCallback((employeeId) => {
    toggleEmployeeSelection(employeeId);
  }, [toggleEmployeeSelection]);

  const handleSelectAll = useCallback(() => {
    if (selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0) {
      clearSelection();
    } else {
      const allIds = formattedEmployees.map(emp => emp.id);
      setSelectedEmployees(allIds);
    }
  }, [selectedEmployees.length, formattedEmployees, clearSelection, setSelectedEmployees]);

  // ========================================
  // ACTION MENU HANDLERS
  // ========================================
  
  const handleToggleActionMenu = useCallback(() => {
    setIsActionMenuOpen(prev => !prev);
  }, []);

  const handleActionMenuClose = useCallback(() => {
    setIsActionMenuOpen(false);
  }, []);

  // ========================================
  // SORTING HANDLERS
  // ========================================
  
  const handleSort = useCallback((field, ctrlKey = false) => {
    if (ctrlKey) {
      const currentDirection = getSortDirection(field);
      let newDirection;
      
      if (!currentDirection) {
        newDirection = 'asc';
      } else if (currentDirection === 'asc') {
        newDirection = 'desc';
      } else {
        removeSort(field);
        return;
      }
      
      addSort(field, newDirection);
    } else {
      const currentDirection = getSortDirection(field);
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      setSorting(field, newDirection);
    }
  }, [getSortDirection, addSort, removeSort, setSorting]);

  // ========================================
  // EXPORT FUNCTIONALITY
  // ========================================
  
  const handleExport = useCallback(async (exportOptions) => {
    try {
      const exportParams = {
        format: exportOptions.format || 'excel',
        includeFields: exportOptions.includeFields
      };

      if (exportOptions.type === 'selected' && selectedEmployees.length > 0) {
        exportParams.employee_ids = selectedEmployees;
      } else if (exportOptions.type === 'filtered') {
        Object.keys(apiParams).forEach(key => {
          if (key !== 'page' && key !== 'page_size') {
            exportParams[key] = apiParams[key];
          }
        });
      }

      console.log('📤 Export params:', exportParams);
      const result = await exportEmployees(exportParams);
      
      console.log('✅ Export completed successfully:', result);
      alert('✅ Export completed successfully!');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExportModalOpen(false);
    }
  }, [apiParams, selectedEmployees, exportEmployees]);

  const handleBulkImportComplete = useCallback(async (result) => {
    try {
      await refreshAllData();
      setIsBulkUploadOpen(false);
      
      if (result?.imported_count) {
        alert(`✅ Successfully imported ${result.imported_count} employees!`);
      }
    } catch (error) {
      console.error('❌ Failed to refresh after import:', error);
      setIsBulkUploadOpen(false);
      alert('⚠️ Import completed but failed to refresh data. Please refresh the page.');
    }
  }, [refreshAllData]);

  // ========================================
  // EMPLOYEE ACTION HANDLERS
  // ========================================
  
  const handleEmployeeAction = useCallback(async (employeeId, action) => {
    try {
      switch (action) {
        case "delete":
          if (confirm("Are you sure you want to delete this employee?")) {
            await deleteEmployee(employeeId);
            await refreshAllData();
            alert('✅ Employee deleted successfully');
          }
          break;

        default:
          console.log(`Employee action: ${action} for employee: ${employeeId}`);
          alert(`Action "${action}" clicked for employee ${employeeId}`);
      }
    } catch (error) {
      console.error(`Failed to perform action ${action}:`, error);
      alert(`❌ Failed to ${action}: ${error.message}`);
    }
  }, [deleteEmployee, refreshAllData]);

  // ========================================
  // ACTIVE FILTERS CALCULATION
  // ========================================
  
  const activeFilters = useMemo(() => {
    const filters = [];
    
    if (localFilters.search) {
      filters.push({ key: "search", label: `Search: ${localFilters.search}` });
    }
    if (localFilters.status?.length > 0) {
      filters.push({ 
        key: "status", 
        label: localFilters.status.length === 1 
          ? `Status: ${localFilters.status[0]}` 
          : `Status: ${localFilters.status.length} selected`
      });
    }
    if (localFilters.department?.length > 0) {
      filters.push({ 
        key: "department", 
        label: localFilters.department.length === 1 
          ? `Department: ${localFilters.department[0]}` 
          : `Department: ${localFilters.department.length} selected`
      });
    }
    if (localFilters.business_function?.length > 0) {
      filters.push({ 
        key: "business_function", 
        label: `Business Function: ${localFilters.business_function.length} selected`
      });
    }
    if (localFilters.tags?.length > 0) {
      filters.push({ 
        key: "tags", 
        label: `Tags: ${localFilters.tags.length} selected`
      });
    }
    if (localFilters.grading_level?.length > 0) {
      filters.push({ 
        key: "grading_level", 
        label: `Grades: ${localFilters.grading_level.length} selected`
      });
    }
    if (localFilters.start_date_from || localFilters.start_date_to) {
      filters.push({ 
        key: "start_date", 
        label: "Start Date Range"
      });
    }
    
    return filters;
  }, [localFilters]);

  // ========================================
  // ERROR HANDLING
  // ========================================
  
  if (error?.employees) {
    return (
      <div className="container mx-auto pt-3 max-w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
            <p className="text-sm mb-4">
              {error?.employees?.message || 'Failed to load employee data'}
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
          onToggleAdvancedFilter={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
          onToggleActionMenu={handleToggleActionMenu}
          isActionMenuOpen={isActionMenuOpen}
          selectedEmployees={selectedEmployees}
          onBulkImportComplete={handleBulkImportComplete}
          onBulkImport={() => setIsBulkUploadOpen(true)}
          statistics={statistics}
          darkMode={darkMode}
        />

        {/* Action Menu */}
        {isActionMenuOpen && (
          <div className="absolute right-6 top-20 z-50">
            <ActionMenu 
              isOpen={isActionMenuOpen}
              onClose={handleActionMenuClose}
              onAction={handleBulkAction}
              selectedCount={selectedEmployees.length}
              selectedEmployees={selectedEmployees}
              selectedEmployeeData={formattedEmployees.filter(emp => selectedEmployees.includes(emp.id))}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isAdvancedFilterOpen && (
        <AdvancedFilterPanel
          onApply={handleApplyAdvancedFilters}
          onClose={() => setIsAdvancedFilterOpen(false)}
          initialFilters={localFilters}
          filterOptions={{
            businessFunctions,
            departments,
            units,
            jobFunctions,
            positionGroups,
            employeeStatuses,
            employeeTags,
          }}
        />
      )}

      {/* Search and Quick Filters */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-3 mb-3 mt-3">
        <SearchBar
          searchTerm={localFilters.search}
          onSearchChange={handleSearchChange}
          placeholder="Search by name, email, employee ID, or job title..."
        />
        
        <div className="flex-shrink-0">
          <QuickFilterBar
            onStatusChange={handleStatusChange}
            onDepartmentChange={handleDepartmentChange}
            statusFilter={localFilters.status}
            departmentFilter={localFilters.department}
            activeFilters={activeFilters}
            onClearFilter={handleClearFilter}
            onClearAllFilters={handleClearAllFilters}
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

      {/* Filter Summary */}
      {activeFilters.length > 0 && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Active Filters ({activeFilters.length}):
              </span>
              {activeFilters.map((filter) => (
                <span 
                  key={filter.key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                >
                  {filter.label}
                  <button
                    onClick={() => handleClearFilter(filter.key)}
                    className="ml-1 text-blue-600 dark:text-blue-300 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

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
        loading={loading.employees}
        selectedEmployees={selectedEmployees}
        selectAll={selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0}
        onToggleSelectAll={handleSelectAll}
        onToggleEmployeeSelection={handleEmployeeToggle}
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
          currentPage={pagination.page || pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.count || pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          loading={loading.employees}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        totalEmployees={statistics.total_employees}
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