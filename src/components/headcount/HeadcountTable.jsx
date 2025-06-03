// src/components/headcount/HeadcountTable.jsx - Complete backend integration
"use client";
import { useState, useEffect, useMemo } from "react";
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

const HeadcountTable = () => {
  const { darkMode } = useTheme();
  
  // Redux hooks
  const {
    employees,
    loading,
    error,
    filterOptions,
    selectedEmployees,
    currentFilters,
    pagination,
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
    setSorting,
    setPageSize,
    setCurrentPage,
    bulkUpdateEmployees,
    updateOrgChartVisibility,
    exportEmployees,
    deleteEmployee,
    clearErrors
  } = useEmployees();

  // Local state for UI
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [employeeVisibility, setEmployeeVisibility] = useState({});
  const [sortConfig, setSortConfig] = useState({ field: 'employee_id', direction: 'asc' });

  // Initialize data on mount
  useEffect(() => {
    fetchFilterOptions();
    fetchStatistics();
    // Initial employee fetch will be triggered by the filter effect
  }, []);

  // Build filter parameters for API with proper backend field mapping
  const buildFilterParams = useMemo(() => {
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      ordering: sortConfig.direction === 'desc' ? `-${sortConfig.field}` : sortConfig.field,
    };

    // Add search term
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    // Add quick filters with backend field mapping
    if (statusFilter !== "all") {
      // Map to backend status field
      params.status__name = statusFilter;
    }
    if (departmentFilter !== "all") {
      // Map to backend department field
      params.department__name = departmentFilter;
    }
    if (officeFilter !== "all") {
      // Map to backend office field (if available)
      params.office = officeFilter;
    }

    // Add advanced filters with proper field mapping
    Object.keys(currentFilters).forEach(key => {
      const value = currentFilters[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          // Map frontend filter names to backend field names
          const backendFieldMap = {
            'employeeName': 'search',
            'employeeId': 'employee_id',
            'businessFunctions': 'business_function',
            'departments': 'department',
            'units': 'unit',
            'jobFunctions': 'job_function',
            'positionGroups': 'position_group',
            'jobTitles': 'job_title',
            'lineManager': 'line_manager_name',
            'lineManagerId': 'line_manager_hc',
            'grades': 'grade',
            'tags': 'tags',
            'genders': 'gender',
            'contractDurations': 'contract_duration'
          };
          
          const backendField = backendFieldMap[key] || key;
          params[backendField] = value.join(',');
        } else if (!Array.isArray(value)) {
          // Handle single values
          const backendFieldMap = {
            'employeeName': 'search',
            'employeeId': 'employee_id',
            'lineManager': 'line_manager_name',
            'lineManagerId': 'line_manager_hc',
            'startDate': 'start_date_from',
            'endDate': 'start_date_to'
          };
          
          const backendField = backendFieldMap[key] || key;
          params[backendField] = value;
        }
      }
    });

    return params;
  }, [
    pagination.currentPage, 
    pagination.pageSize, 
    searchTerm, 
    statusFilter, 
    departmentFilter, 
    officeFilter, 
    currentFilters,
    sortConfig
  ]);

  // Fetch employees when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmployees(buildFilterParams);
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [buildFilterParams]);

  // Clear errors when component mounts
  useEffect(() => {
    clearErrors();
  }, []);

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
    setOfficeFilter("all");
    setDepartmentFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleOfficeChange = (value) => {
    setOfficeFilter(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value) => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilter = (key) => {
    if (key === "status") {
      setStatusFilter("all");
    } else if (key === "office") {
      setOfficeFilter("all");
    } else if (key === "department") {
      setDepartmentFilter("all");
    } else {
      const newFilters = { ...currentFilters };
      delete newFilters[key];
      setCurrentFilters(newFilters);
    }
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const newDirection = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction: newDirection });
    setSorting(field, newDirection);
  };

  const handleGetSortDirection = (field) => {
    if (sortConfig.field === field) {
      return sortConfig.direction;
    }
    return null;
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === employees.length && employees.length > 0) {
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
        const result = await exportEmployees({ 
          format: 'csv', 
          filters: buildFilterParams 
        });
        
        if (result.meta.requestStatus === 'fulfilled') {
          // Handle successful export
          const blob = new Blob([result.payload.data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else if (action === "delete") {
        if (confirm(`Are you sure you want to delete ${selectedEmployees.length} employee(s)? This action cannot be undone.`)) {
          // Handle bulk delete (if backend supports it)
          for (const employeeId of selectedEmployees) {
            await deleteEmployee(employeeId);
          }
          clearSelection();
          // Refresh the list
          fetchEmployees(buildFilterParams);
        }
      } else if (action === "changeManager") {
        const newManagerId = prompt('Enter the new line manager employee ID:');
        if (newManagerId) {
          const result = await bulkUpdateEmployees({
            employeeIds: selectedEmployees,
            updates: { line_manager: newManagerId }
          });
          
          if (result.meta.requestStatus === 'fulfilled') {
            clearSelection();
            fetchEmployees(buildFilterParams);
          }
        }
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Operation failed. Please try again.');
    }
  };

  const handleEmployeeAction = async (employeeId, action) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    try {
      if (action === "delete") {
        if (confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
          const result = await deleteEmployee(employeeId);
          if (result.meta.requestStatus === 'fulfilled') {
            // Employee will be removed from state automatically
            fetchEmployees(buildFilterParams); // Refresh list
          }
        }
      } else if (action === "addTag") {
        const tagName = prompt('Enter tag name for employee:');
        if (tagName) {
          // This would require a separate endpoint or bulk update
          alert(`Tag "${tagName}" would be added to employee ${employee.name}`);
        }
      } else if (action === "changeManager") {
        const newManagerId = prompt('Enter new line manager employee ID:');
        if (newManagerId) {
          const result = await bulkUpdateEmployees({
            employeeIds: [employeeId],
            updates: { line_manager: newManagerId }
          });
          
          if (result.meta.requestStatus === 'fulfilled') {
            fetchEmployees(buildFilterParams);
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
      // Update local state immediately for UI responsiveness
      setEmployeeVisibility(prev => ({
        ...prev,
        [employeeId]: newVisibility,
      }));

      // Call backend API
      const result = await updateOrgChartVisibility({
        employeeIds: [employeeId],
        isVisible: newVisibility
      });

      if (result.meta.requestStatus === 'fulfilled') {
        // Update successful - the state should already be updated
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
    // Refresh employee list after bulk import
    fetchEmployees(buildFilterParams);
    fetchStatistics(); // Update statistics
  };

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters = [];
    
    if (statusFilter !== "all") {
      filters.push({ key: "status", label: `Status: ${statusFilter}` });
    }
    if (departmentFilter !== "all") {
      filters.push({ key: "department", label: `Department: ${departmentFilter}` });
    }
    if (officeFilter !== "all") {
      filters.push({ key: "office", label: `Office: ${officeFilter}` });
    }
    
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        const fieldName = key.replace(/([A-Z])/g, " $1").trim();
        const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        const label = Array.isArray(value) 
          ? `${displayName}: ${value.join(", ")}` 
          : `${displayName}: ${value}`;
        filters.push({ key, label });
      }
    });
    
    return filters;
  }, [statusFilter, departmentFilter, officeFilter, currentFilters]);

  const hasActiveFilters = searchTerm || 
    Object.keys(currentFilters).length > 0 || 
    statusFilter !== "all" || 
    departmentFilter !== "all" ||
    officeFilter !== "all";

  // Format employees for display with proper field mapping
  const formattedEmployees = useMemo(() => {
    return employees.map(employee => ({
      ...employee,
      // Ensure all necessary fields are available for the table
      name: employee.name || employee.full_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
      display_name: employee.name || employee.full_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
      // Handle nested object fields
      business_function_name: employee.business_function_name || employee.business_function?.name || '',
      business_function_code: employee.business_function_code || employee.business_function?.code || '',
      department_name: employee.department_name || employee.department?.name || '',
      unit_name: employee.unit_name || employee.unit?.name || '',
      job_function_name: employee.job_function_name || employee.job_function?.name || '',
      position_group_name: employee.position_group_name || employee.position_group?.get_name_display || employee.position_group?.name || '',
      position_group_level: employee.position_group_level || employee.position_group?.hierarchy_level || 0,
      status_name: employee.status_name || employee.status?.name || '',
      status_color: employee.status_color || employee.status?.color || '#6b7280',
      line_manager_name: employee.line_manager_name || employee.line_manager?.name || employee.line_manager?.full_name || '',
      line_manager_hc_number: employee.line_manager_hc_number || employee.line_manager?.employee_id || '',
      contract_duration_display: employee.contract_duration_display || employee.get_contract_duration_display || employee.contract_duration || '',
      // Handle tags
      tag_names: employee.tag_names || employee.tags?.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        type: tag.tag_type || tag.type
      })) || [],
      // Visibility state (local or from backend)
      is_visible_in_org_chart: employeeVisibility[employee.id] ?? employee.is_visible_in_org_chart ?? true
    }));
  }, [employees, employeeVisibility]);

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
              onClick={() => fetchEmployees(buildFilterParams)}
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

      {/* Quick Filter Panel */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-3 mb-3">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        
        <div className="flex-shrink-0">
          <QuickFilterBar
            onStatusChange={handleStatusChange}
            onOfficeChange={handleOfficeChange}
            onDepartmentChange={handleDepartmentChange}
            statusFilter={statusFilter}
            officeFilter={officeFilter}
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

      {/* Employee Table */}
      <EmployeeTable
        employees={formattedEmployees}
        selectedEmployees={selectedEmployees}
        selectAll={selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0}
        onToggleSelectAll={toggleSelectAll}
        onToggleEmployeeSelection={toggleEmployeeSelection}
        onSort={handleSort}
        getSortDirection={handleGetSortDirection}
        employeeVisibility={employeeVisibility}
        onVisibilityChange={handleVisibilityChange}
        onEmployeeAction={handleEmployeeAction}
        hasFilters={hasActiveFilters}
        onClearFilters={handleClearAllFilters}
        loading={loading}
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