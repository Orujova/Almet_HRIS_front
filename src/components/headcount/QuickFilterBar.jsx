// src/components/headcount/QuickFilterBar.jsx - FIXED: Proper API Integration
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check, Filter, AlertCircle } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useReferenceData } from "../../hooks/useReferenceData";

/**
 * FIXED Quick filter bar with proper API integration and backend-compatible filtering
 */
const QuickFilterBar = ({
  onStatusChange,
  onDepartmentChange,
  statusFilter = [],
  departmentFilter = [],
  activeFilters = [],
  onClearFilter,
  onClearAllFilters
}) => {
  const { darkMode } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Get reference data with proper error handling
  const {
    employeeStatuses = [],
    departments = [],
    businessFunctions = [],
    loading = {},
    error = {},
    
    // Helper functions
    getFormattedEmployeeStatuses,
    getFormattedDepartments,
    hasEmployeeStatuses,
    hasDepartments,
    
    // Actions to fetch data
    fetchEmployeeStatuses,
    fetchDepartments,
    fetchBusinessFunctions
  } = useReferenceData();

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Initialize data on mount
  useEffect(() => {
    console.log('🔄 QuickFilterBar: Initializing data...');
    
    // Fetch employee statuses if not loaded
    if (!hasEmployeeStatuses() && !loading.employeeStatuses && !error.employeeStatuses) {
      console.log('📊 Fetching employee statuses...');
      fetchEmployeeStatuses?.();
    }
    
    // Fetch departments if not loaded
    if (!hasDepartments() && !loading.departments && !error.departments) {
      console.log('🏢 Fetching departments...');
      fetchDepartments?.();
    }
    
    // Fetch business functions if needed for department filtering
    if (businessFunctions.length === 0 && !loading.businessFunctions && !error.businessFunctions) {
      console.log('🏭 Fetching business functions...');
      fetchBusinessFunctions?.();
    }
  }, [
    hasEmployeeStatuses, 
    hasDepartments,
    loading,
    error,
    businessFunctions.length,
    fetchEmployeeStatuses, 
    fetchDepartments, 
    fetchBusinessFunctions
  ]);

  // Prepare status options with proper formatting and safe value mapping
  const statusOptions = React.useMemo(() => {
    console.log('📊 Preparing status options...', { employeeStatuses });
    
    let statuses = [];
    
    // Try formatted function first
    if (getFormattedEmployeeStatuses && typeof getFormattedEmployeeStatuses === 'function') {
      try {
        statuses = getFormattedEmployeeStatuses() || [];
        console.log('✅ Got formatted statuses:', statuses);
      } catch (error) {
        console.error('❌ Error getting formatted statuses:', error);
      }
    }
    
    // Fallback to raw data with proper value mapping
    if (statuses.length === 0 && Array.isArray(employeeStatuses)) {
      statuses = employeeStatuses.map((status, index) => {
        if (!status || typeof status !== 'object') {
          console.warn('⚠️ Invalid status object:', status);
          return null;
        }

        // Backend API returns 'name' field, but we need 'value' for filtering
        const statusValue = status.name || status.value || status.id || `status-${index}`;
        
        return {
          id: status.id || status.value || `status-${index}`,
          value: statusValue, // Use name for filtering as backend expects status names
          label: status.name || status.label || `Status ${index + 1}`,
          name: status.name || status.label || `Status ${index + 1}`,
          color: status.color || '#6B7280',
          employee_count: status.employee_count || 0,
          status_type: status.status_type,
          affects_headcount: status.affects_headcount
        };
      }).filter(Boolean);
    }
    
    console.log('🎯 Final status options with corrected values:', statuses);
    return statuses;
  }, [employeeStatuses, getFormattedEmployeeStatuses]);

  // Prepare department options with proper formatting and safe value mapping
  const departmentOptions = React.useMemo(() => {
    console.log('🏢 Preparing department options...', { departments });
    
    let depts = [];
    
    // Try formatted function first
    if (getFormattedDepartments && typeof getFormattedDepartments === 'function') {
      try {
        depts = getFormattedDepartments() || [];
        console.log('✅ Got formatted departments:', depts);
      } catch (error) {
        console.error('❌ Error getting formatted departments:', error);
      }
    }
    
    // Fallback to raw data with proper value mapping
    if (depts.length === 0 && Array.isArray(departments)) {
      depts = departments.map((dept, index) => {
        if (!dept || typeof dept !== 'object') {
          console.warn('⚠️ Invalid department object:', dept);
          return null;
        }

        // Backend API expects department ID for filtering
        const departmentValue = dept.id || dept.value || `dept-${index}`;

        return {
          id: dept.id || dept.value || `dept-${index}`,
          value: departmentValue, // Use ID for filtering as backend expects department IDs
          label: dept.name || dept.label || `Department ${index + 1}`,
          name: dept.name || dept.label || `Department ${index + 1}`,
          business_function_name: dept.business_function_name,
          business_function_code: dept.business_function_code,
          employee_count: dept.employee_count || 0
        };
      }).filter(Boolean);
    }
    
    console.log('🎯 Final department options with corrected values:', depts);
    return depts;
  }, [departments, getFormattedDepartments]);

  // Enhanced Multi-select dropdown component
  const MultiSelectDropdown = ({ 
    label, 
    options, 
    selectedValues, 
    onChange, 
    dropdownKey,
    placeholder = "Select options...",
    isLoading = false,
    hasError = false
  }) => {
    const isOpen = openDropdown === dropdownKey;
    const selectedCount = selectedValues.length;

    const toggleDropdown = () => {
      if (isLoading) return;
      setOpenDropdown(isOpen ? null : dropdownKey);
    };

    const handleOptionToggle = (value) => {
      if (value === undefined || value === null) {
        console.warn('⚠️ Invalid value in handleOptionToggle:', value);
        return;
      }

      // Convert value to string for consistent comparison
      const stringValue = String(value);
      const stringSelectedValues = selectedValues.map(v => String(v));

      const newSelected = stringSelectedValues.includes(stringValue)
        ? selectedValues.filter(v => String(v) !== stringValue)
        : [...selectedValues, value];
      
      console.log(`🔄 ${label} filter changed - APPLYING INSTANTLY:`, { 
        value: stringValue, 
        newSelected,
        oldSelected: selectedValues 
      });
      
      // Apply filter change instantly
      onChange(newSelected);
    };

    const handleSelectAll = () => {
      const validOptions = options.filter(opt => opt.value !== undefined && opt.value !== null);
      const newSelection = selectedValues.length === validOptions.length ? [] : validOptions.map(opt => opt.value || opt.id);
      
      console.log(`🔄 ${label} select all - APPLYING INSTANTLY:`, {
        oldSelection: selectedValues,
        newSelection,
        availableOptions: validOptions.map(opt => ({ value: opt.value, label: opt.label }))
      });
      onChange(newSelection);
    };

    const handleClear = () => {
      console.log(`🔄 ${label} clear - APPLYING INSTANTLY`);
      onChange([]);
    };

    return (
      <div className="relative" ref={el => dropdownRefs.current[dropdownKey] = el}>
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={isLoading}
          className={`
            ${bgInput} border ${borderColor}
            px-3 py-2 rounded-lg text-sm
            flex items-center justify-between
            min-w-[140px] max-w-[200px]
            ${textPrimary}
            transition-all duration-200
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : ''}
            hover:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasError ? 'border-red-500' : ''}
          `}
        >
          <span className="truncate">
            {isLoading ? (
              <span className="flex items-center">
                <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </span>
            ) : hasError ? (
              <span className="flex items-center text-red-500">
                <AlertCircle className="w-3 h-3 mr-2" />
                Error
              </span>
            ) : selectedCount > 0 ? (
              <span className="flex items-center">
                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">
                  {selectedCount}
                </span>
                {label}
              </span>
            ) : (
              <span className={textMuted}>{placeholder}</span>
            )}
          </span>
          <ChevronDown 
            size={16} 
            className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${
              isLoading ? 'animate-spin' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && !isLoading && (
          <div className={`
            absolute z-50 mt-1 w-64
            ${bgCard} border ${borderColor}
            rounded-lg shadow-lg
            max-h-60 overflow-hidden
          `}>
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${textPrimary}`}>
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  {selectedCount > 0 && (
                    <button
                      onClick={handleClear}
                      className={`text-xs ${textMuted} hover:text-red-500 transition-colors`}
                    >
                      Clear
                    </button>
                  )}
                  {options.length > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className={`text-xs text-blue-600 hover:text-blue-700 transition-colors`}
                    >
                      {selectedValues.length === options.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {hasError ? (
                <div className="p-3 text-center">
                  <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                  <p className={`text-sm ${textMuted}`}>Failed to load options</p>
                  <button
                    onClick={() => {
                      if (dropdownKey === 'status' && fetchEmployeeStatuses) {
                        fetchEmployeeStatuses();
                      } else if (dropdownKey === 'department' && fetchDepartments) {
                        fetchDepartments();
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Retry
                  </button>
                </div>
              ) : options.length > 0 ? (
                options.map((option, index) => {
                  const value = option.value || option.id;
                  const label = option.label || option.name;
                  
                  // Enhanced comparison for selected state
                  const isSelected = (() => {
                    // Try direct comparison first
                    if (selectedValues.includes(value)) return true;
                    
                    // Try string comparison
                    const stringValue = String(value);
                    const stringSelectedValues = selectedValues.map(v => String(v));
                    if (stringSelectedValues.includes(stringValue)) return true;
                    
                    // Try numeric comparison if value is numeric
                    if (!isNaN(value) && !isNaN(parseFloat(value))) {
                      const numericValue = parseFloat(value);
                      const numericSelectedValues = selectedValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
                      if (numericSelectedValues.includes(numericValue)) return true;
                    }
                    
                    return false;
                  })();
                  
                  const uniqueKey = `${dropdownKey}-${value}-${index}`;

                  return (
                    <button
                      key={uniqueKey}
                      onClick={() => handleOptionToggle(value)}
                      className={`
                        w-full px-3 py-2 text-left text-sm
                        ${hoverBg}
                        flex items-center
                        transition-colors
                        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      `}
                    >
                      <div className={`
                        w-4 h-4 border-2 rounded mr-3 flex items-center justify-center
                        ${isSelected 
                          ? 'bg-blue-600 border-blue-600' 
                          : `border-gray-300 dark:border-gray-600`
                        }
                      `}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      
                      {/* Color indicator for status */}
                      {option.color && (
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <span className={`${textPrimary} truncate block`}>
                          {label}
                        </span>
                        {/* Show business function for departments */}
                        {option.business_function_name && (
                          <span className={`text-xs ${textMuted} truncate block`}>
                            {option.business_function_name}
                          </span>
                        )}
                        {/* Debug value display in development */}
                        {process.env.NODE_ENV === 'development' && (
                          <span className={`text-xs ${textMuted} truncate block`}>
                            Value: {value} | Selected: {isSelected ? 'Yes' : 'No'}
                          </span>
                        )}
                      </div>
                      
                      {/* Count if available */}
                      {option.employee_count !== undefined && (
                        <span className={`text-xs ${textMuted} ml-2`}>
                          {option.employee_count}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center">
                  <span className={`text-sm ${textMuted}`}>No options available</span>
                  {!hasError && (
                    <button
                      onClick={() => {
                        if (dropdownKey === 'status' && fetchEmployeeStatuses) {
                          fetchEmployeeStatuses();
                        } else if (dropdownKey === 'department' && fetchDepartments) {
                          fetchDepartments();
                        }
                      }}
                      className="block text-xs text-blue-600 hover:text-blue-700 mt-1 mx-auto"
                    >
                      Refresh
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideDropdown = Object.values(dropdownRefs.current).some(ref => 
        ref && ref.contains(event.target)
      );
      
      if (!isInsideDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Loading states
  const isStatusLoading = loading?.employeeStatuses;
  const isDepartmentLoading = loading?.departments;

  // Error states
  const hasStatusError = error?.employeeStatuses;
  const hasDepartmentError = error?.departments;

  // Debug log for QuickFilterBar render
  console.log('🎯 QuickFilterBar render state:', {
    statusOptions: statusOptions.length,
    departmentOptions: departmentOptions.length,
    statusFilter: statusFilter,
    departmentFilter: departmentFilter,
    statusValues: statusOptions.map(s => ({ id: s.id, value: s.value, label: s.label })),
    departmentValues: departmentOptions.map(d => ({ id: d.id, value: d.value, label: d.label })),
    isStatusLoading,
    isDepartmentLoading,
    hasStatusError,
    hasDepartmentError
  });

  return (
    <div className="flex items-center gap-3">
      {/* Status Filter */}
      <MultiSelectDropdown
        label="Status"
        options={statusOptions}
        selectedValues={statusFilter}
        onChange={onStatusChange}
        dropdownKey="status"
        placeholder="All Statuses"
        isLoading={isStatusLoading}
        hasError={hasStatusError}
      />

      {/* Department Filter */}
      <MultiSelectDropdown
        label="Department"
        options={departmentOptions}
        selectedValues={departmentFilter}
        onChange={onDepartmentChange}
        dropdownKey="department"
        placeholder="All Departments"
        isLoading={isDepartmentLoading}
        hasError={hasDepartmentError}
      />

      {/* Active Filter Count */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            bg-blue-100 dark:bg-blue-900 
            text-blue-800 dark:text-blue-200
            flex items-center
          `}>
            <Filter size={12} className="mr-1" />
            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Clear All Filters */}
      {activeFilters.length > 0 && (
        <button
          onClick={() => {
            console.log('❌ Clearing all filters from QuickFilterBar');
            
            // Clear local filters
            onStatusChange([]);
            onDepartmentChange([]);
            
            // Clear all filters using parent callback
            if (onClearAllFilters && typeof onClearAllFilters === 'function') {
              onClearAllFilters();
            } else {
              // Fallback: clear individual filters
              activeFilters.forEach(filter => {
                if (onClearFilter && typeof onClearFilter === 'function') {
                  onClearFilter(filter.key);
                }
              });
            }
          }}
          className={`
            text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400
            transition-colors font-medium
            flex items-center
            px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20
          `}
        >
          <X size={12} className="mr-1" />
          Clear All
        </button>
      )}

      {/* Loading Indicator */}
      {(isStatusLoading || isDepartmentLoading) && (
        <div className="flex items-center">
          <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className={`ml-2 text-xs ${textMuted}`}>Loading filters...</span>
        </div>
      )}

      {/* Error Indicator */}
      {(hasStatusError || hasDepartmentError) && (
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
          <span className="text-xs text-red-500">Filter data unavailable</span>
          <button
            onClick={() => {
              if (hasStatusError && fetchEmployeeStatuses) {
                fetchEmployeeStatuses();
              }
              if (hasDepartmentError && fetchDepartments) {
                fetchDepartments();
              }
            }}
            className="text-xs text-blue-600 hover:text-blue-700 ml-2"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickFilterBar;