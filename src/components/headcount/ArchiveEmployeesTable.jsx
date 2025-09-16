// src/components/headcount/ArchiveEmployeesTable.jsx
"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { useVacantPositions } from "../../hooks/useVacantPositions";
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
  Info
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

  // ========================================
  // LOCAL STATE
  // ========================================
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    deletion_type: [],
    department: [],
    business_function: []
  });

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
      page: archivePagination.page || 1,
      page_size: archivePagination.pageSize || 25
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
  }, [searchTerm, filters, archivePagination]);

  // ========================================
  // DEBOUNCED DATA FETCHING
  // ========================================
  
  const debouncedFetchEmployees = useCallback((params, immediate = false) => {
    const delay = immediate ? 0 : 500;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
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
  }, []);

  // ========================================
  // DATA FETCHING ON PARAM CHANGES
  // ========================================
  
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
    setArchivePage(1);
  }, [setArchivePage]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      deletion_type: [],
      department: [],
      business_function: []
    });
    setSearchTerm("");
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

    const restorableEmployees = archivedEmployees.filter(emp => 
      selectedArchivedEmployees.includes(emp.id) && emp.can_be_restored
    );

    if (restorableEmployees.length === 0) {
      alert("None of the selected employees can be restored.");
      return;
    }

    const confirmMessage = `Are you sure you want to restore ${restorableEmployees.length} employee${restorableEmployees.length !== 1 ? 's' : ''}?`;
    
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
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'soft_delete':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
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
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
              <Archive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className={`text-lg font-semibold ${textPrimary}`}>
                Employee Archive
              </h1>
              <p className={`text-sm ${textSecondary}`}>
                {archiveStats.total_archived || 0} archived employees
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {selectedArchivedEmployees.length > 0 && (
              <button
                onClick={handleBulkRestore}
                className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors font-medium bg-green-600 text-white hover:bg-green-700"
              >
                <RotateCcw size={14} className="mr-1" />
                Restore ({selectedArchivedEmployees.length})
              </button>
            )}
          </div>
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Total Archived</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {archiveStats.total_archived || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Restorable</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {archiveStats.restorable_count || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Recent (30 days)</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {archiveStats.recent_deletions || 0}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-sm ${textMuted}`}>Departments</div>
            <div className={`text-xl font-semibold ${textPrimary}`}>
              {Object.keys(archiveStats.by_department || {}).length}
            </div>
          </div>
        </div>
      </div>
    </div>
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
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDeletionTypeColor(employee.deletion_type)}`}>
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
        <p className={`text-xs ${textMuted}`}>
          {employee.days_since_deletion} days ago
        </p>
      </td>

      {/* Employment Period */}
      <td className="px-4 py-3">
        <p className={`text-sm ${textSecondary}`}>
          {formatDate(employee.start_date)} - {formatDate(employee.end_date)}
        </p>
        <p className={`text-xs ${textMuted}`}>
          Duration: {employee.contract_duration || 'N/A'}
        </p>
      </td>

      {/* Status */}
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
          {employee.can_be_restored && (
            <button
              onClick={() => handleBulkRestore()}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              title="Restore Employee"
            >
              <RotateCcw size={16} />
            </button>
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
                Deleted
              </th>
              <th className={`px-4 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Employment
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
          placeholder="Search archived employees by name, email, or employee ID..."
        />
      </div>

      {/* Loading State */}
      {loading.archivedEmployees ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border border-gray-500 border-t-transparent mx-auto mb-2"></div>
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
          />
        </div>
      )}
    </div>
  );
};

export default ArchiveEmployeesTable;