// src/components/headcount/HeadcountTable.jsx - Fixed without office filter + Excel-like sorting
"use client";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useEmployees } from "../../hooks/useEmployees";

import HeadcountHeader from "./HeadcountHeader";
import SearchBar from "./SearchBar";
import QuickFilterBar from "./QuickFilterBar";
import AdvancedFilterPanel from "./AdvancedFilterPanel";
import EmployeeTable from "./EmployeeTable";
import Pagination from "./Pagination";
import ActionMenu from "./ActionMenu";
import HierarchyLegend from "./HierarchyLegend";
import ColorSelector from "./ColorModeSelector";

const HeadcountTable = () => {
  const { darkMode } = useTheme();
  
  // Redux hooks
  const {
    formattedEmployees,
    loading,
    error,
    filterOptions,
    selectedEmployees,
    currentFilters,
    appliedFilters,
    pagination,
    sorting,
    statistics,
    fetchEmployees,
    fetchFilterOptions,
    fetchStatistics,
    setSelectedEmployees,
    toggleEmployeeSelection,
    selectAllEmployees,
    clearSelection,
    setCurrentFilters,
    clearFilters,
    removeFilter,
    setSorting,
    addSort,
    removeSort,
    clearSorting,
    setPageSize,
    setCurrentPage,
    bulkUpdateEmployees,
    updateOrgChartVisibility,
    exportEmployees,
    deleteEmployee,
    clearErrors,
    refreshEmployees,
    buildQueryParams,
    hasActiveFilters,
    getSortDirection,
    isSorted,
    getSortIndex
  } = useEmployees();

  // Local state for UI
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [employeeVisibility, setEmployeeVisibility] = useState({});

  // Initialize data on mount
  useEffect(() => {
    fetchFilterOptions();
    fetchStatistics();
    clearErrors();
  }, []);

  // Build filter parameters for API
  const apiParams = useMemo(() => {
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize
    };

    // Add search term
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    // Add quick filters
    if (statusFilter !== "all") {
      params.statusFilter = statusFilter;
    }
    if (departmentFilter !== "all") {
      params.departmentFilter = departmentFilter;
    }

    // Add advanced filters
    Object.keys(currentFilters).forEach(key => {
      const value = currentFilters[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });

    return params;
  }, [
    pagination.currentPage, 
    pagination.pageSize, 
    searchTerm, 
    statusFilter, 
    departmentFilter, 
    currentFilters
  ]);

  // Fetch employees when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmployees(apiParams);
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [apiParams]);

  // Handler functions
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const toggleAdvancedFilter = () => {
    setIsAdvancedFilterOpen(!isAdvancedFilterOpen);
  };

  const handleApplyAdvancedFilters = (filters) => {
    setCurrentFilters(filters);
    setIsAdvancedFilterOpen(false);
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    clearFilters();
    setStatusFilter("all");
    setDepartmentFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value) => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilter = (key) => {
    if (key === "status") {
      setStatusFilter("all");
    } else if (key === "department") {
      setDepartmentFilter("all");
    } else {
      removeFilter(key);
    }
    setCurrentPage(1);
  };

  // Excel-like sorting handlers
  const handleSort = (field, ctrlKey = false) => {
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
  };

  const handleGetSortDirection = (field) => {
    return getSortDirection(field);
  };

  const handleGetSortIndex = (field) => {
    return getSortIndex(field);
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0) {
      clearSelection();
    } else {
      selectAllEmployees();
    }
  };

  const toggleActionMenu = () => {
    setIsActionMenuOpen(!isActionMenuOpen);
  };

  const handleBulkAction = async (action) => {
    setIsActionMenuOpen(false);

    try {
      if (action === "export") {
        const result = await exportEmployees('csv', apiParams);
        
        if (result.meta?.requestStatus === 'fulfilled') {
          // Create and download CSV file
          const csvData = result.payload.data || [];
          const csvContent = convertToCSV(csvData);
          downloadCSV(csvContent, `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
        }
      } else if (action === "delete") {
        if (confirm(`Are you sure you want to delete ${selectedEmployees.length} employee(s)? This action cannot be undone.`)) {
          for (const employeeId of selectedEmployees) {
            await deleteEmployee(employeeId);
          }
          clearSelection();
          refreshEmployees();
        }
      } else if (action === "changeManager") {
        const newManagerId = prompt('Enter the new line manager employee ID:');
        if (newManagerId) {
          const result = await bulkUpdateEmployees(selectedEmployees, { line_manager: newManagerId });
          
          if (result.meta?.requestStatus === 'fulfilled') {
            clearSelection();
            refreshEmployees();
          }
        }
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Operation failed. Please try again.');
    }
  };

  const handleEmployeeAction = async (employeeId, action) => {
    const employee = formattedEmployees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    try {
      if (action === "delete") {
        if (confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
          const result = await deleteEmployee(employeeId);
          if (result.meta?.requestStatus === 'fulfilled') {
            refreshEmployees();
          }
        }
      } else if (action === "addTag") {
        const tagName = prompt('Enter tag name for employee:');
        if (tagName) {
          alert(`Tag "${tagName}" would be added to employee ${employee.name}`);
        }
      } else if (action === "changeManager") {
        const newManagerId = prompt('Enter new line manager employee ID:');
        if (newManagerId) {
          const result = await bulkUpdateEmployees([employeeId], { line_manager: newManagerId });
          
          if (result.meta?.requestStatus === 'fulfilled') {
            refreshEmployees();
          }
        }
      }
    } catch (error) {
      console.error('Employee action failed:', error);
      alert('Operation failed. Please try again.');
    }
  };

  const handleVisibilityChange = async (employeeId, newVisibility) => {
    try {
      // Update local state immediately
      setEmployeeVisibility(prev => ({
        ...prev,
        [employeeId]: newVisibility,
      }));

      // Call backend API
      const result = await updateOrgChartVisibility([employeeId], newVisibility);

      if (result.meta?.requestStatus === 'fulfilled') {
        console.log('Visibility updated successfully');
      }
    } catch (error) {
      console.error('Failed to update visibility:', error);
      // Revert local state on error
      setEmployeeVisibility(prev => ({
        ...prev,
        [employeeId]: !newVisibility,
      }));
      alert('Failed to update visibility. Please try again.');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleBulkImportComplete = (results) => {
    console.log("Bulk import completed:", results);
    refreshEmployees();
    fetchStatistics();
  };

  // Helper functions
  const convertToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Active filters for display (removed office filter)
  const activeFilters = useMemo(() => {
    const filters = [];
    
    if (statusFilter !== "all") {
      filters.push({ key: "status", label: `Status: ${statusFilter}` });
    }
    if (departmentFilter !== "all") {
      filters.push({ key: "department", label: `Department: ${departmentFilter}` });
    }
    
    appliedFilters.forEach(filter => {
      filters.push(filter);
    });
    
    return filters;
  }, [statusFilter, departmentFilter, appliedFilters]);

  const hasActiveFiltersCheck = searchTerm || 
    Object.keys(currentFilters).length > 0 || 
    statusFilter !== "all" || 
    departmentFilter !== "all";

  if (error) {
    return (
      <div className="container mx-auto pt-3 max-w-full">
        <div className="text-center py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 dark:bg-red-800 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error Loading Employees</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">
              {typeof error === 'string' ? error : error?.message || 'Failed to load employee data'}
            </p>
            <button 
              onClick={() => refreshEmployees()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-3 max-w-full">
      {/* Header */}
      <div className="relative">
        <HeadcountHeader
          onToggleAdvancedFilter={toggleAdvancedFilter}
          onToggleActionMenu={toggleActionMenu}
          isActionMenuOpen={isActionMenuOpen}
          selectedEmployees={selectedEmployees}
          onBulkImportComplete={handleBulkImportComplete}
        />

        {/* Action Menu */}
        {isActionMenuOpen && (
          <div className="absolute right-2 top-16 z-50">
            <ActionMenu 
              isOpen={isActionMenuOpen}
              onClose={() => setIsActionMenuOpen(false)}
              onAction={handleBulkAction}
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
          filterOptions={filterOptions}
        />
      )}

      {/* Quick Filter Panel - Without Office Filter */}
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
            filterOptions={filterOptions}
          />
        </div>
      </div>

      {/* Color Selector and Legend */}
      <div className="flex justify-between items-center mb-3">
        <ColorSelector />
        <HierarchyLegend />
      </div>

      {/* Sorting Info Panel */}
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
                    <button
                      onClick={() => removeSort(sort.field)}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={clearSorting}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              Clear all sorting
            </button>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Hold Ctrl/Cmd and click column headers to add multiple sort levels
          </p>
        </div>
      )}

      {/* Employee Table */}
      <EmployeeTable
        employees={formattedEmployees}
        selectedEmployees={selectedEmployees}
        selectAll={selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0}
        onToggleSelectAll={toggleSelectAll}
        onToggleEmployeeSelection={toggleEmployeeSelection}
        onSort={handleSort}
        getSortDirection={handleGetSortDirection}
        getSortIndex={handleGetSortIndex}
        isSorted={isSorted}
        employeeVisibility={employeeVisibility}
        onVisibilityChange={handleVisibilityChange}
        onEmployeeAction={handleEmployeeAction}
        hasFilters={hasActiveFiltersCheck}
        onClearFilters={handleClearAllFilters}
        loading={loading}
        multiSort={sorting.length > 1}
      />

      {/* Pagination */}
      {formattedEmployees.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          itemsPerPage={pagination.pageSize}
          totalItems={pagination.totalEmployees}
          startIndex={(pagination.currentPage - 1) * pagination.pageSize}
          endIndex={Math.min(pagination.currentPage * pagination.pageSize, pagination.totalEmployees)}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default HeadcountTable;