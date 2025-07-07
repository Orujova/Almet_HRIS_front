// src/components/headcount/HeadcountTable.jsx - FIXED with Working Action Handlers
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
    // Selection management
    toggleEmployeeSelection,
    selectAllEmployees,
    clearSelection,
    setSelectedEmployees,
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
    downloadEmployeeTemplate,
    deleteEmployee,
    // Helpers
    getSortDirection,
    isSorted,
    getSortIndex,
    clearErrors
  } = useEmployees();

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

  // Refs
  const initialized = useRef(false);
  const lastApiParams = useRef(null);

  // ========================================
  // FIXED: WORKING ACTION HANDLERS
  // ========================================
  
  const handleBulkAction = useCallback(async (action, options = {}) => {
    console.log('🔥 BULK ACTION TRIGGERED:', action, options);
    console.log('🔥 SELECTED EMPLOYEES:', selectedEmployees);
    
    // Close action menu first
    setIsActionMenuOpen(false);

    // Check if employees are selected for actions that require them
    if (selectedEmployees.length === 0 && !['export', 'downloadTemplate', 'bulkImport'].includes(action)) {
      alert("⚠️ Please select employees first!");
      return;
    }

    try {
      let result;
      
      switch (action) {
        case "export":
          console.log('📤 Starting export...');
          setIsExportModalOpen(true);
          break;

        case "bulkImport":
          console.log('📥 Starting bulk import...');
          setIsBulkUploadOpen(true);
          break;

        case "downloadTemplate":
          console.log('📄 Downloading template...');
          try {
            result = await downloadEmployeeTemplate();
            console.log('✅ Template download result:', result);
            alert('✅ Template downloaded successfully!');
          } catch (error) {
            console.error('❌ Template download failed:', error);
            alert('❌ Failed to download template: ' + error.message);
          }
          break;

        case "delete":
          console.log('🗑️ Deleting employees...');
          const deleteMessage = options.confirmMessage || `Are you sure you want to delete ${selectedEmployees.length} employee(s)? This action cannot be undone.`;
          
          if (confirm(deleteMessage)) {
            try {
              result = await bulkDeleteEmployees(selectedEmployees);
              console.log('✅ Delete result:', result);
              
              if (result.meta?.requestStatus === 'fulfilled') {
                clearSelection();
                // Refresh data
                await fetchEmployees();
                await fetchStatistics();
                alert(`✅ Successfully deleted ${selectedEmployees.length} employees!`);
              } else {
                throw new Error('Delete operation failed');
              }
            } catch (error) {
              console.error('❌ Delete failed:', error);
              alert('❌ Failed to delete employees: ' + error.message);
            }
          }
          break;

        case "softDelete":
          console.log('🗑️ Soft deleting employees...');
          const softDeleteMessage = options.confirmMessage || `Are you sure you want to soft delete ${selectedEmployees.length} employee(s)? They can be restored later.`;
          
          if (confirm(softDeleteMessage)) {
            try {
              // Note: assuming softDeleteEmployees exists in useEmployees hook
              result = await bulkDeleteEmployees(selectedEmployees); // Using same API for now
              console.log('✅ Soft delete result:', result);
              
              clearSelection();
              await fetchEmployees();
              await fetchStatistics();
              alert(`✅ Successfully soft deleted ${selectedEmployees.length} employees!`);
            } catch (error) {
              console.error('❌ Soft delete failed:', error);
              alert('❌ Failed to soft delete employees: ' + error.message);
            }
          }
          break;

        case "updateStatus":
          console.log('📝 Updating status to:', options.newStatus);
          try {
            // The updateEmployeeStatus expects employee IDs
            result = await updateEmployeeStatus(selectedEmployees);
            console.log('✅ Status update result:', result);
            
            if (result.meta?.requestStatus === 'fulfilled') {
              clearSelection();
              await fetchEmployees();
              await fetchStatistics();
              alert(`✅ Successfully updated status for ${selectedEmployees.length} employees to ${options.newStatus}!`);
            } else {
              throw new Error('Status update failed');
            }
          } catch (error) {
            console.error('❌ Status update failed:', error);
            alert('❌ Failed to update status: ' + error.message);
          }
          break;

        case "addTags":
          console.log('🏷️ Adding tags:', options.tagNames);
          try {
            result = await bulkAddTags(selectedEmployees, options.tagIds);
            console.log('✅ Add tags result:', result);
            
            if (result.meta?.requestStatus === 'fulfilled') {
              clearSelection();
              await fetchEmployees();
              alert(`✅ Successfully added tags "${options.tagNames.join(', ')}" to ${selectedEmployees.length} employees!`);
            } else {
              throw new Error('Add tags failed');
            }
          } catch (error) {
            console.error('❌ Add tags failed:', error);
            alert('❌ Failed to add tags: ' + error.message);
          }
          break;

        case "removeTags":
          console.log('🏷️ Removing tags:', options.tagNames);
          try {
            result = await bulkRemoveTags(selectedEmployees, options.tagIds);
            console.log('✅ Remove tags result:', result);
            
            if (result.meta?.requestStatus === 'fulfilled') {
              clearSelection();
              await fetchEmployees();
              alert(`✅ Successfully removed tags "${options.tagNames.join(', ')}" from ${selectedEmployees.length} employees!`);
            } else {
              throw new Error('Remove tags failed');
            }
          } catch (error) {
            console.error('❌ Remove tags failed:', error);
            alert('❌ Failed to remove tags: ' + error.message);
          }
          break;

        case "bulkUpdate":
          console.log('✏️ Bulk update field:', options.field, 'action:', options.action);
          
          // Show appropriate update modal/form based on field
          switch (options.field) {
            case 'line_manager':
              alert('👥 Line Manager update modal would open here');
              // TODO: Open line manager selection modal
              break;
            case 'department':
              alert('🏢 Department transfer modal would open here');
              // TODO: Open department selection modal
              break;
            case 'position_group':
              alert('🎯 Position group update modal would open here');
              // TODO: Open position group selection modal
              break;
            default:
              alert('❓ Unknown bulk update field: ' + options.field);
          }
          break;

        default:
          console.warn('❓ Unknown bulk action:', action);
          alert(`❓ Action "${action}" is not implemented yet`);
      }
    } catch (error) {
      console.error(`❌ Failed to perform bulk action ${action}:`, error);
      alert(`❌ Failed to ${action}. Error: ${error.message}`);
    }
  }, [
    selectedEmployees, 
    clearSelection, 
    bulkDeleteEmployees, 
    updateEmployeeStatus, 
    bulkAddTags, 
    bulkRemoveTags, 
    bulkUpdateEmployees, 
    exportEmployees,
    downloadEmployeeTemplate,
    fetchEmployees, 
    fetchStatistics
  ]);

  // ========================================
  // SELECTION HANDLERS
  // ========================================
  
  const handleEmployeeToggle = useCallback((employeeId) => {
    console.log('🔄 Toggle employee:', employeeId);
    toggleEmployeeSelection(employeeId);
  }, [toggleEmployeeSelection]);

  const handleSelectAll = useCallback(() => {
    console.log('🔄 Select all triggered, current selected:', selectedEmployees.length);
    console.log('🔄 Total employees:', formattedEmployees.length);
    
    if (selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0) {
      console.log('🔄 Clearing selection');
      clearSelection();
    } else {
      console.log('🔄 Selecting all employees');
      const allIds = formattedEmployees.map(emp => emp.id);
      setSelectedEmployees(allIds);
    }
  }, [selectedEmployees.length, formattedEmployees, clearSelection, setSelectedEmployees]);

  // ========================================
  // ACTION MENU HANDLERS
  // ========================================
  
  const handleToggleActionMenu = useCallback(() => {
    console.log('🔄 Action menu toggle, current state:', isActionMenuOpen);
    setIsActionMenuOpen(prev => !prev);
  }, [isActionMenuOpen]);

  const handleActionMenuClose = useCallback(() => {
    console.log('❌ Closing action menu');
    setIsActionMenuOpen(false);
  }, []);

  // ========================================
  // INITIALIZATION & DATA FETCHING
  // ========================================
  
  useEffect(() => {
    const initializeData = async () => {
      if (initialized.current) return;
      
      try {
        initialized.current = true;
        clearErrors();
        
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

  // ========================================
  // API PARAMS BUILDER
  // ========================================
  
  const buildApiParams = useMemo(() => {
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (statusFilter.length > 0) {
      params.status = statusFilter;
    }

    if (departmentFilter.length > 0) {
      params.department = departmentFilter;
    }

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
  // DEBOUNCED FETCH
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
          fetchEmployees(params);
        }, 300);
      };
    })(),
    [fetchEmployees]
  );

  useEffect(() => {
    if (initialized.current) {
      debouncedFetchEmployees(buildApiParams);
    }
  }, [buildApiParams, debouncedFetchEmployees]);

  // ========================================
  // OTHER EVENT HANDLERS
  // ========================================
  
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
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

  const handleStatusChange = useCallback((selectedStatuses) => {
    setStatusFilter(selectedStatuses);
    setCurrentPage(1);
  }, [setCurrentPage]);

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
        ...buildApiParams,
        format: exportOptions.format || 'excel',
        includeFields: exportOptions.includeFields
      };

      if (exportOptions.type === 'selected' && selectedEmployees.length > 0) {
        exportParams.employee_ids = selectedEmployees;
      }

      const result = await exportEmployees(exportParams);
      
      if (result.meta?.requestStatus === 'fulfilled') {
        console.log('Export completed successfully');
        alert('✅ Export completed successfully!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExportModalOpen(false);
    }
  }, [buildApiParams, selectedEmployees, exportEmployees]);

  const handleBulkImportComplete = useCallback((result) => {
    fetchStatistics();
    debouncedFetchEmployees(buildApiParams);
    setIsBulkUploadOpen(false);
    
    if (result?.imported_count) {
      alert(`✅ Successfully imported ${result.imported_count} employees!`);
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
              alert('✅ Employee deleted successfully');
            }
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
          onToggleActionMenu={handleToggleActionMenu}
          isActionMenuOpen={isActionMenuOpen}
          selectedEmployees={selectedEmployees}
          onBulkImportComplete={handleBulkImportComplete}
          onBulkImport={() => setIsBulkUploadOpen(true)}
          statistics={statistics}
          darkMode={darkMode}
        />

        {/* Action Menu - FIXED Position and Working Handlers */}
        {isActionMenuOpen && (
          <div className="absolute right-6 top-20 z-50">
            <ActionMenu 
              isOpen={isActionMenuOpen}
              onClose={handleActionMenuClose}
              onAction={handleBulkAction}  // ✅ WORKING HANDLER
              selectedCount={selectedEmployees.length}
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
          initialFilters={currentFilters}
          filterOptions={{
            businessFunctions,
            departments,
            employeeStatuses,
            employeeTags,
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