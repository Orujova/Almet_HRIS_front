// src/components/headcount/QuickFilterBar.jsx - FIXED: Department/Business Function Logic
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, X, Check, Filter, AlertCircle, RefreshCw, Users } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useReferenceData } from "../../hooks/useReferenceData";

/**
 * FIXED QuickFilterBar - Düzəldilmiş department/business function əlaqəsi
 * və seçilmiş option-ları uncheck etmək funksiyası
 */
const QuickFilterBar = ({
  onStatusChange,
  onDepartmentChange,
  onBusinessFunctionChange,
  onPositionGroupChange,
  statusFilter = [],
  departmentFilter = [],
  businessFunctionFilter = [],
  positionGroupFilter = [],
  activeFilters = [],
  onClearFilter,
  onClearAllFilters,
  statistics = {},
  showCounts = true,
  compactMode = false
}) => {
  const { darkMode } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [retryAttempts, setRetryAttempts] = useState({});
  const dropdownRefs = useRef({});

  // Get reference data with comprehensive error handling
  const {
    employeeStatuses = [],
    departments = [],
    businessFunctions = [],
    positionGroups = [],
    loading = {},
    error = {},
    getFormattedEmployeeStatuses,
    getFormattedDepartments,
    getFormattedBusinessFunctions,
    getFormattedPositionGroups,
    hasEmployeeStatuses,
    hasDepartments,
    hasBusinessFunctions,
    hasPositionGroups,
    fetchEmployeeStatuses,
    fetchDepartments,
    fetchBusinessFunctions,
    fetchPositionGroups,
    isValidBusinessFunction,
    isValidDepartment
  } = useReferenceData();

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Initialize data with retry mechanism
  useEffect(() => {
    const initializeData = async () => {
      console.log('🔄 QuickFilterBar: Initializing reference data...');
      
      const initializationTasks = [];
      
      if (!hasEmployeeStatuses() && !loading.employeeStatuses && !error.employeeStatuses) {
        console.log('📊 Fetching employee statuses...');
        initializationTasks.push({
          name: 'employeeStatuses',
          action: () => fetchEmployeeStatuses?.()
        });
      }
      
      if (!hasDepartments() && !loading.departments && !error.departments) {
        console.log('🏢 Fetching departments...');
        initializationTasks.push({
          name: 'departments',
          action: () => fetchDepartments?.()
        });
      }
      
      if (!hasBusinessFunctions() && !loading.businessFunctions && !error.businessFunctions) {
        console.log('🏭 Fetching business functions...');
        initializationTasks.push({
          name: 'businessFunctions',
          action: () => fetchBusinessFunctions?.()
        });
      }
      
      if (!hasPositionGroups() && !loading.positionGroups && !error.positionGroups) {
        console.log('📊 Fetching position groups...');
        initializationTasks.push({
          name: 'positionGroups',
          action: () => fetchPositionGroups?.()
        });
      }
      
      // Execute all initialization tasks
      for (const task of initializationTasks) {
        try {
          await task.action();
        } catch (error) {
          console.error(`❌ Failed to initialize ${task.name}:`, error);
        }
      }
    };
    
    initializeData();
  }, [
    hasEmployeeStatuses, hasDepartments, hasBusinessFunctions, hasPositionGroups,
    loading.employeeStatuses, loading.departments, loading.businessFunctions, loading.positionGroups,
    error.employeeStatuses, error.departments, error.businessFunctions, error.positionGroups,
    fetchEmployeeStatuses, fetchDepartments, fetchBusinessFunctions, fetchPositionGroups
  ]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !Object.values(dropdownRefs.current).some(ref => ref?.contains(event.target))) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Loading states for each filter type
  const isStatusLoading = loading.employeeStatuses;
  const isDepartmentLoading = loading.departments;
  const isBusinessFunctionLoading = loading.businessFunctions;
  const isPositionGroupLoading = loading.positionGroups;

  const hasStatusError = !!error.employeeStatuses;
  const hasDepartmentError = !!error.departments;
  const hasBusinessFunctionError = !!error.businessFunctions;
  const hasPositionGroupError = !!error.positionGroups;

  // FIXED: Process formatted options for all filter types
  const statusOptions = useMemo(() => {
    console.log('📊 Processing status options:', employeeStatuses);
    return getFormattedEmployeeStatuses() || [];
  }, [employeeStatuses, getFormattedEmployeeStatuses]);

  // FIXED: Department options - Group by department name, show all business functions
  const departmentOptions = useMemo(() => {
    console.log('🏢 Processing departments for QuickFilter...');
    
    if (!Array.isArray(departments)) {
      return [];
    }

    // Group departments by name
    const departmentGroups = departments.reduce((acc, dept) => {
      if (!dept || typeof dept !== 'object' || dept.is_active === false) {
        return acc;
      }

      const deptName = dept.name || dept.label || dept.display_name || '';
      if (!deptName) return acc;

      if (!acc[deptName]) {
        acc[deptName] = {
          name: deptName,
          businessFunctions: [],
          totalEmployees: 0,
          departments: []
        };
      }

      acc[deptName].businessFunctions.push(dept.business_function_name || dept.business_function_code || '');
      acc[deptName].totalEmployees += dept.employee_count || 0;
      acc[deptName].departments.push(dept);

      return acc;
    }, {});

    // Convert to options array
    const options = Object.values(departmentGroups).map(group => ({
      value: group.name, // Use department name as value
      label: group.name,
      allBusinessFunctions: [...new Set(group.businessFunctions.filter(Boolean))],
      employee_count: group.totalEmployees,
      departments: group.departments // Keep reference to all department records
    }))
    .filter(dept => dept.label)
    .sort((a, b) => a.label.localeCompare(b.label));

    console.log('✅ Grouped department options:', options);
    return options;
  }, [departments]);

  const businessFunctionOptions = useMemo(() => {
    console.log('🏭 Processing business function options:', businessFunctions);
    return getFormattedBusinessFunctions() || [];
  }, [businessFunctions, getFormattedBusinessFunctions]);

  const positionGroupOptions = useMemo(() => {
    console.log('📊 Processing position group options:', positionGroups);
    return getFormattedPositionGroups() || [];
  }, [positionGroups, getFormattedPositionGroups]);

  // FIXED: Department change handler - Handle department group selection
  const handleDepartmentChange = useCallback((selectedDepartmentNames) => {
    console.log('🏢 Department selection changed:', selectedDepartmentNames);
    
    if (!Array.isArray(selectedDepartmentNames)) {
      onDepartmentChange?.([]);
      return;
    }

    // Find all department IDs for selected department names
    const allDepartmentIds = [];
    
    selectedDepartmentNames.forEach(deptName => {
      const matchingDepartments = departments.filter(dept => 
        (dept.name || dept.label || dept.display_name) === deptName && 
        dept.is_active !== false
      );
      
      matchingDepartments.forEach(dept => {
        if (dept.id || dept.value) {
          allDepartmentIds.push(dept.id || dept.value);
        }
      });
    });

    console.log('🏢 Selected department IDs:', allDepartmentIds);
    onDepartmentChange?.(allDepartmentIds);
  }, [departments, onDepartmentChange]);

  // Retry handlers with backoff
  const handleRetryStatus = useCallback(async () => {
    const retryCount = retryAttempts.status || 0;
    if (retryCount >= 3) return;
    
    setRetryAttempts(prev => ({ ...prev, status: retryCount + 1 }));
    
    try {
      await fetchEmployeeStatuses?.();
      setRetryAttempts(prev => ({ ...prev, status: 0 }));
    } catch (error) {
      console.error('❌ Status retry failed:', error);
    }
  }, [fetchEmployeeStatuses, retryAttempts.status]);

  const handleRetryDepartments = useCallback(async () => {
    const retryCount = retryAttempts.departments || 0;
    if (retryCount >= 3) return;
    
    setRetryAttempts(prev => ({ ...prev, departments: retryCount + 1 }));
    
    try {
      await fetchDepartments?.();
      setRetryAttempts(prev => ({ ...prev, departments: 0 }));
    } catch (error) {
      console.error('❌ Departments retry failed:', error);
    }
  }, [fetchDepartments, retryAttempts.departments]);

  const handleRetryBusinessFunctions = useCallback(async () => {
    const retryCount = retryAttempts.businessFunctions || 0;
    if (retryCount >= 3) return;
    
    setRetryAttempts(prev => ({ ...prev, businessFunctions: retryCount + 1 }));
    
    try {
      await fetchBusinessFunctions?.();
      setRetryAttempts(prev => ({ ...prev, businessFunctions: 0 }));
    } catch (error) {
      console.error('❌ Business functions retry failed:', error);
    }
  }, [fetchBusinessFunctions, retryAttempts.businessFunctions]);

  const handleRetryPositionGroups = useCallback(async () => {
    const retryCount = retryAttempts.positionGroups || 0;
    if (retryCount >= 3) return;
    
    setRetryAttempts(prev => ({ ...prev, positionGroups: retryCount + 1 }));
    
    try {
      await fetchPositionGroups?.();
      setRetryAttempts(prev => ({ ...prev, positionGroups: 0 }));
    } catch (error) {
      console.error('❌ Position groups retry failed:', error);
    }
  }, [fetchPositionGroups, retryAttempts.positionGroups]);

  // FIXED: Clear all filters
  const handleClearAll = useCallback(() => {
    console.log('🧹 QUICKFILTER: Clearing all filters - INSTANT APPLICATION');
    
    // Clear individual filters
    onStatusChange?.([]);
    onDepartmentChange?.([]);
    onBusinessFunctionChange?.([]);
    onPositionGroupChange?.([]);
    
    // Clear all filters using parent callback
    if (onClearAllFilters && typeof onClearAllFilters === 'function') {
      onClearAllFilters();
    }
    
    // Close any open dropdowns
    setOpenDropdown(null);
  }, [onStatusChange, onDepartmentChange, onBusinessFunctionChange, onPositionGroupChange, onClearAllFilters]);

  return (
    <div className="flex items-center gap-3 flex-wrap">
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
        showColors={true}
        icon={Users}
        onRetry={handleRetryStatus}
      />

      {/* Department Filter - FIXED with business function support */}
      <MultiSelectDropdown
        label="Department"
        options={departmentOptions}
        selectedValues={departmentFilter}
        onChange={handleDepartmentChange}
        dropdownKey="department"
        placeholder="All Departments"
        isLoading={isDepartmentLoading}
        hasError={hasDepartmentError}
        icon={Filter}
        onRetry={handleRetryDepartments}
      />

      {/* Business Function Filter */}
      {!compactMode && (
        <MultiSelectDropdown
          label="Business Function"
          options={businessFunctionOptions}
          selectedValues={businessFunctionFilter}
          onChange={onBusinessFunctionChange}
          dropdownKey="businessFunction"
          placeholder="All Functions"
          isLoading={isBusinessFunctionLoading}
          hasError={hasBusinessFunctionError}
          showCodes={true}
          icon={Filter}
          onRetry={handleRetryBusinessFunctions}
        />
      )}

      {/* Position Group Filter */}
      {!compactMode && (
        <MultiSelectDropdown
          label="Position Group"
          options={positionGroupOptions}
          selectedValues={positionGroupFilter}
          onChange={onPositionGroupChange}
          dropdownKey="positionGroup"
          placeholder="All Positions"
          isLoading={isPositionGroupLoading}
          hasError={hasPositionGroupError}
          icon={Users}
          onRetry={handleRetryPositionGroups}
        />
      )}

      {/* Active Filters Indicator */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            bg-almet-sapphire/10 border border-almet-sapphire/20
            text-almet-sapphire
            flex items-center
          `}>
            <Filter size={12} className="mr-1" />
            {activeFilters.length} active
          </div>
          
          <button
            onClick={handleClearAll}
            className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center"
            title="Clear all filters"
          >
            <X size={12} className="mr-1" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * FIXED MultiSelectDropdown komponenti QuickFilterBar üçün
 */
const MultiSelectDropdown = ({
  label,
  options = [],
  selectedValues = [],
  onChange,
  dropdownKey,
  placeholder,
  isLoading = false,
  hasError = false,
  showColors = false,
  showCodes = false,
  icon: IconComponent = Filter,
  onRetry,
  compactMode = false
}) => {
  const { darkMode } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const dropdownRef = useRef(null);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  const isOpen = openDropdown === dropdownKey;
  const selectedCount = selectedValues.length;
  const disabled = isLoading || hasError;

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getButtonText = () => {
    if (isLoading) return `Loading ${label.toLowerCase()}...`;
    if (hasError) return `Error loading ${label.toLowerCase()}`;
    if (selectedCount === 0) return placeholder;
    if (selectedCount === 1) {
      const selected = options.find(opt => selectedValues.includes(opt.value));
      return selected?.label || `1 ${label.toLowerCase()}`;
    }
    return `${selectedCount} ${label.toLowerCase()}`;
  };

  const handleToggle = () => {
    if (disabled) return;
    setOpenDropdown(isOpen ? null : dropdownKey);
  };

  // FIXED: Handle option toggle with proper uncheck support
  const handleOptionToggle = (value) => {
    console.log('🔄 QuickFilter option toggle:', { 
      value, 
      currentlySelected: selectedValues.includes(value),
      selectedValues,
      stringValue: String(value),
      stringSelected: selectedValues.map(v => String(v))
    });
    
    // FIXED: Comprehensive value matching - check both original and string versions
    const isCurrentlySelected = (() => {
      // Direct match
      if (selectedValues.includes(value)) return true;
      
      // String comparison
      const stringValue = String(value);
      const stringSelectedValues = selectedValues.map(v => String(v));
      if (stringSelectedValues.includes(stringValue)) return true;
      
      // Number comparison if applicable
      const numValue = Number(value);
      const numSelectedValues = selectedValues.map(v => Number(v)).filter(v => !isNaN(v));
      if (!isNaN(numValue) && numSelectedValues.includes(numValue)) return true;
      
      return false;
    })();
    
    let newSelection;
    if (isCurrentlySelected) {
      // UNCHECK: Remove from selection (handle all possible formats)
      newSelection = selectedValues.filter(v => {
        return String(v) !== String(value) && Number(v) !== Number(value) && v !== value;
      });
      console.log('🔄 UNCHECK: Removing from selection', { value, newSelection });
    } else {
      // CHECK: Add to selection
      newSelection = [...selectedValues, value];
      console.log('🔄 CHECK: Adding to selection', { value, newSelection });
    }
    
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.value));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const handleRetry = () => {
    if (retryCount < 3 && onRetry) {
      setRetryCount(prev => prev + 1);
      onRetry();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative
          ${bgCard}
          border ${hasError ? 'border-red-500' : borderColor}
          px-3 py-2 rounded-lg text-sm
          flex items-center justify-between
          ${compactMode ? 'min-w-[120px] max-w-[160px]' : 'min-w-[140px] max-w-[200px]'}
          ${textPrimary}
          transition-all duration-200
          ${isOpen ? 'border-almet-sapphire ring-2 ring-almet-sapphire ring-opacity-20' : ''}
          ${!disabled && !isLoading ? 'hover:border-almet-sapphire' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${disabled ? 'bg-gray-100 dark:bg-gray-800' : ''}
        `}
      >
        <div className="flex items-center min-w-0 flex-1">
          <IconComponent size={14} className={`mr-2 flex-shrink-0 ${
            hasError ? 'text-red-500' : selectedCount > 0 ? 'text-almet-sapphire' : textMuted
          }`} />
          <span className="truncate font-medium">
            {getButtonText()}
          </span>
        </div>
        <ChevronDown 
          size={14} 
          className={`ml-2 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${textMuted}`} 
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className={`
          absolute z-50 w-full mt-1 
          ${bgCard} 
          border ${borderColor} 
          rounded-lg shadow-lg 
          min-w-[240px]
        `}>
          {/* Header with controls */}
          <div className={`px-4 py-3 border-b ${borderColor}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${textPrimary}`}>
                {label}
                {options.length > 0 && (
                  <span className={`ml-2 text-xs ${textMuted}`}>
                    ({options.length} available)
                  </span>
                )}
              </span>
              <div className="flex items-center space-x-2">
                {selectedCount > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear
                  </button>
                )}
                {options.length > 1 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-almet-sapphire hover:text-almet-astral font-medium"
                  >
                    {selectedValues.length === options.length ? 'None' : 'All'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {hasError ? (
              <div className="p-4 text-center">
                <AlertCircle className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                <p className={`text-sm ${textMuted} mb-2`}>Failed to load {label.toLowerCase()}</p>
                {retryCount < 3 && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center justify-center mx-auto text-xs text-almet-sapphire hover:text-almet-astral"
                  >
                    <RefreshCw size={12} className="mr-1" />
                    Retry ({retryCount + 1}/3)
                  </button>
                )}
              </div>
            ) : options.length > 0 ? (
              <div className="py-1">
                {options.map((option, index) => {
                  const value = option.value;
                  const label = option.label || option.name;
                  
                  // FIXED: Comprehensive selection check - handles different value types
                  const isSelected = (() => {
                    // Direct match
                    if (selectedValues.includes(value)) return true;
                    
                    // String comparison
                    const stringValue = String(value);
                    const stringSelectedValues = selectedValues.map(v => String(v));
                    if (stringSelectedValues.includes(stringValue)) return true;
                    
                    // Number comparison if applicable
                    const numValue = Number(value);
                    const numSelectedValues = selectedValues.map(v => Number(v)).filter(v => !isNaN(v));
                    if (!isNaN(numValue) && numSelectedValues.includes(numValue)) return true;
                    
                    return false;
                  })();
                  
                  const uniqueKey = `${dropdownKey}-${value}-${index}`;

                  return (
                    <button
                      key={uniqueKey}
                      onClick={() => handleOptionToggle(value)}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm
                        ${hoverBg}
                        flex items-center
                        transition-colors
                        ${isSelected ? 'bg-almet-sapphire/10 border-r-2 border-almet-sapphire' : ''}
                      `}
                    >
                      {/* FIXED: Checkbox with proper state */}
                      <div className={`
                        w-4 h-4 border-2 rounded mr-3 flex items-center justify-center flex-shrink-0
                        ${isSelected 
                          ? 'bg-almet-sapphire border-almet-sapphire' 
                          : `border-gray-300 dark:border-gray-600`
                        }
                      `}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      
                      {/* Color indicator */}
                      {showColors && option.color && (
                        <div
                          className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className={`${textPrimary} truncate font-medium`}>
                            {label}
                          </span>
                          {/* Code display */}
                          {showCodes && option.code && (
                            <span className={`ml-2 text-xs ${textMuted} bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded flex-shrink-0`}>
                              {option.code}
                            </span>
                          )}
                        </div>
                        
                        {/* Business function context for departments */}
                        {option.business_function_name && (
                          <span className={`text-xs ${textMuted} truncate block`}>
                            {option.business_function_name}
                            {option.business_function_code && ` (${option.business_function_code})`}
                          </span>
                        )}
                        
                        {/* FIXED: Show all business functions for departments */}
                        {option.allBusinessFunctions && option.allBusinessFunctions.length > 1 && (
                          <span className={`text-xs ${textMuted} truncate block`}>
                            Functions: {option.allBusinessFunctions.join(', ')}
                          </span>
                        )}
                        
                        {/* Hierarchy level for position groups */}
                        {option.hierarchy_level !== undefined && (
                          <span className={`text-xs ${textMuted} truncate block`}>
                            Level {option.hierarchy_level}
                          </span>
                        )}
                        
                        {/* Employee count */}
                        {option.employee_count !== undefined && (
                          <span className={`text-xs ${textMuted}`}>
                            {option.employee_count} employees
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={`p-4 text-center ${textMuted}`}>
                <p className="text-sm">No {label.toLowerCase()} available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickFilterBar;