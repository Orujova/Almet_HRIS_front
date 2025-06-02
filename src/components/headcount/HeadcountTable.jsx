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
    fetchEmployees,
    fetchFilterOptions,
    setSelectedEmployees,
    toggleEmployeeSelection,
    selectAllEmployees,
    clearSelection,
    setCurrentFilters,
    clearFilters,
    setSorting,
    setPageSize,
    setCurrentPage,
    bulkUpdateEmployees
  } = useEmployees();

  // Local state
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [employeeVisibility, setEmployeeVisibility] = useState({});

  // Initialize data on mount
  useEffect(() => {
    fetchFilterOptions();
    fetchEmployees();
  }, []);

  // Build filter parameters for API
  const buildFilterParams = useMemo(() => {
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize,
    };

    // Add search term
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    // Add quick filters
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    if (departmentFilter !== "all") {
      params.department = departmentFilter;
    }

    // Add advanced filters
    Object.keys(currentFilters).forEach(key => {
      const value = currentFilters[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          params[key] = value.join(',');
        } else if (!Array.isArray(value)) {
          params[key] = value;
        }
      }
    });

    return params;
  }, [pagination.currentPage, pagination.pageSize, searchTerm, statusFilter, departmentFilter, currentFilters]);

  // Fetch employees when filters change
  useEffect(() => {
    fetchEmployees(buildFilterParams);
  }, [buildFilterParams]);

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
    // Toggle sort order logic
    setSorting(field, 'asc'); // Simplified for now
  };

  const handleGetSortDirection = (field) => {
    return null; // Simplified for now
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
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

    if (action === "export") {
      alert(`Exporting data for ${selectedEmployees.length} employee(s)`);
    } else if (action === "delete") {
      if (confirm(`Are you sure you want to delete ${selectedEmployees.length} employee(s)?`)) {
        // Handle bulk delete
        alert(`${selectedEmployees.length} employee(s) deleted`);
        clearSelection();
      }
    } else if (action === "changeManager") {
      alert("Change manager UI would open here");
    }
  };

  const handleEmployeeAction = (employeeId, action) => {
    const employee = employees.find((emp) => emp.id === employeeId);

    if (action === "delete") {
      if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
        alert(`Employee ${employee.name} deleted`);
      }
    } else if (action === "addTag") {
      const tag = prompt('Enter tag for employee');
      if (tag) {
        alert(`Tag "${tag}" added to employee ${employee.name}`);
      }
    } else if (action === "changeManager") {
      alert("Change manager UI would open here");
    }
  };

  const handleVisibilityChange = (employeeId, newVisibility) => {
    setEmployeeVisibility(prev => ({
      ...prev,
      [employeeId]: newVisibility,
    }));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
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
  }, [statusFilter, departmentFilter, currentFilters]);

  const hasActiveFilters = searchTerm || 
    Object.keys(currentFilters).length > 0 || 
    statusFilter !== "all" || 
    departmentFilter !== "all";

  if (error) {
    return (
      <div className="container mx-auto pt-3 max-w-full">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Error loading employees: {error}</p>
          <button 
            onClick={() => fetchEmployees(buildFilterParams)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
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
        employees={employees}
        selectedEmployees={selectedEmployees}
        selectAll={selectedEmployees.length === employees.length && employees.length > 0}
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
      {employees.length > 0 && (
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