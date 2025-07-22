// src/components/headcount/AdvancedFilterPanel.jsx - FIXED: Backend API Integration
import { useState, useEffect, useMemo } from "react";
import { X, Search, AlertCircle, Filter, Check, ChevronDown } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { useReferenceData } from "../../hooks/useReferenceData";
import { useEmployees } from "../../hooks/useEmployees";

/**
 * FIXED Advanced Filter Panel with proper backend API integration
 */
const AdvancedFilterPanel = ({ 
  onApply, 
  onClose, 
  initialFilters = {}
}) => {
  const { darkMode } = useTheme();

  // ========================================
  // HOOKS FOR DATA - FIXED API Integration
  // ========================================
  const {
    // Raw reference data
    businessFunctions = [],
    departments = [],
    units = [],
    jobFunctions = [],
    positionGroups = [],
    employeeStatuses = [],
    employeeTags = [],
    contractConfigs = [],
    
    // Formatted data helpers
    getFormattedBusinessFunctions,
    getFormattedDepartments,
    getFormattedUnits,
    getFormattedJobFunctions,
    getFormattedPositionGroups,
    getFormattedEmployeeStatuses,
    getFormattedEmployeeTags,
    getFormattedContractConfigs,
    
    // Loading and error states
    loading = {},
    error = {},
    
    // Data availability checks
    hasBusinessFunctions,
    hasDepartments,
    hasUnits,
    hasJobFunctions,
    hasPositionGroups,
    hasEmployeeStatuses,
    hasEmployeeTags,
    hasContractConfigs,
    
    // Fetch actions
    fetchBusinessFunctions,
    fetchDepartments,
    fetchUnits,
    fetchJobFunctions,
    fetchPositionGroups,
    fetchEmployeeStatuses,
    fetchEmployeeTags,
    fetchContractConfigs
  } = useReferenceData();

  // Get employees for line manager and employee filtering
  const {
    formattedEmployees = [],
    loading: employeesLoading = {}
  } = useEmployees();

  // ========================================
  // LOCAL FILTER STATE - BACKEND COMPATIBLE
  // ========================================
  const [filters, setFilters] = useState({
    // Search filters
    search: "",
    employee_search: "",
    line_manager_search: "",
    job_title_search: "",
    
    // Multi-select organizational filters
    business_function: [],
    department: [],
    unit: [],
    job_function: [],
    position_group: [],
    
    // Employment details
    status: [],
    grading_level: [],
    contract_duration: [],
    
    // Management
    line_manager: [],

    
    // Tags
    tags: [],
    tag_types: [],
    
    // Date ranges
    start_date_from: "",
    start_date_to: "",
    contract_end_date_from: "",
    contract_end_date_to: "",
    
    // Personal information
    gender: [],
    
    // Additional filters
    years_of_service_min: "",
    years_of_service_max: "",
  
    is_active: "",
    
    ...initialFilters
  });

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-50";

  // ========================================
  // INITIALIZATION - FETCH REFERENCE DATA
  // ========================================
  
  useEffect(() => {
    const initializeData = async () => {
      console.log('🔄 AdvancedFilterPanel: Initializing reference data...');
      
      const fetchPromises = [];
      
      // Fetch business functions if not loaded
      if (!hasBusinessFunctions() && !loading.businessFunctions && fetchBusinessFunctions) {
        console.log('🏭 Fetching business functions...');
        fetchPromises.push(fetchBusinessFunctions());
      }
      
      // Fetch departments if not loaded
      if (!hasDepartments() && !loading.departments && fetchDepartments) {
        console.log('🏢 Fetching departments...');
        fetchPromises.push(fetchDepartments());
      }
      
      // Fetch units if not loaded
      if (!hasUnits() && !loading.units && fetchUnits) {
        console.log('🏠 Fetching units...');
        fetchPromises.push(fetchUnits());
      }
      
      // Fetch job functions if not loaded
      if (!hasJobFunctions() && !loading.jobFunctions && fetchJobFunctions) {
        console.log('💼 Fetching job functions...');
        fetchPromises.push(fetchJobFunctions());
      }
      
      // Fetch position groups if not loaded
      if (!hasPositionGroups() && !loading.positionGroups && fetchPositionGroups) {
        console.log('📊 Fetching position groups...');
        fetchPromises.push(fetchPositionGroups());
      }
      
      // Fetch employee statuses if not loaded
      if (!hasEmployeeStatuses() && !loading.employeeStatuses && fetchEmployeeStatuses) {
        console.log('🎯 Fetching employee statuses...');
        fetchPromises.push(fetchEmployeeStatuses());
      }
      
      // Fetch employee tags if not loaded
      if (!hasEmployeeTags() && !loading.employeeTags && fetchEmployeeTags) {
        console.log('🏷️ Fetching employee tags...');
        fetchPromises.push(fetchEmployeeTags());
      }
      
      // Fetch contract configs if not loaded
      if (!hasContractConfigs() && !loading.contractConfigs && fetchContractConfigs) {
        console.log('📋 Fetching contract configs...');
        fetchPromises.push(fetchContractConfigs());
      }
      
      if (fetchPromises.length > 0) {
        try {
          await Promise.all(fetchPromises);
          console.log('✅ Reference data initialization completed');
        } catch (error) {
          console.error('❌ Failed to initialize reference data:', error);
        }
      }
    };

    initializeData();
  }, [
    hasBusinessFunctions,
    hasDepartments,
    hasUnits,
    hasJobFunctions,
    hasPositionGroups,
    hasEmployeeStatuses,
    hasEmployeeTags,
    hasContractConfigs,
    loading,
    fetchBusinessFunctions,
    fetchDepartments,
    fetchUnits,
    fetchJobFunctions,
    fetchPositionGroups,
    fetchEmployeeStatuses,
    fetchEmployeeTags,
    fetchContractConfigs
  ]);

  // ========================================
  // DATA PREPARATION - BACKEND COMPATIBLE
  // ========================================

  // Employee options for search and line manager selection
  const employeeOptions = useMemo(() => {
    if (!formattedEmployees || formattedEmployees.length === 0) {
      return [];
    }

    return formattedEmployees.map(emp => ({
      id: emp.id,
      value: emp.id,
      label: emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
      name: emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
      employee_id: emp.employee_id,
      email: emp.email,
      jobTitle: emp.jobTitle || emp.job_title,
      departmentName: emp.departmentInfo || emp.department_name,
      isLineManager: emp.managementInfo?.isLineManager || emp.direct_reports_count > 0,
      directReportsCount: emp.managementInfo?.directReportsCount || emp.direct_reports_count || 0
    }));
  }, [formattedEmployees]);

  // Line manager options (only employees who are or can be managers)
  const lineManagerOptions = useMemo(() => {
    return employeeOptions
      .filter(emp => emp.isLineManager || emp.directReportsCount > 0)
      .sort((a, b) => b.directReportsCount - a.directReportsCount);
  }, [employeeOptions]);

  // Job titles from employees
  const jobTitleOptions = useMemo(() => {
    if (!formattedEmployees || formattedEmployees.length === 0) {
      return [];
    }

    const jobTitles = [...new Set(
      formattedEmployees
        .map(emp => emp.jobTitle || emp.job_title)
        .filter(Boolean)
    )].sort();

    return jobTitles.map(title => ({
      value: title,
      label: title,
      name: title
    }));
  }, [formattedEmployees]);

  // Business Functions with safe formatting
  const businessFunctionOptions = useMemo(() => {
    let bfs = [];
    
    try {
      if (getFormattedBusinessFunctions && typeof getFormattedBusinessFunctions === 'function') {
        bfs = getFormattedBusinessFunctions() || [];
      }
      
      if (bfs.length === 0 && Array.isArray(businessFunctions)) {
        bfs = businessFunctions.map(bf => ({
          value: bf.id || bf.value,
          label: bf.name || bf.label,
          code: bf.code,
          employee_count: bf.employee_count
        }));
      }
    } catch (error) {
      console.error('❌ Error formatting business functions:', error);
      bfs = [];
    }
    
    return bfs;
  }, [businessFunctions, getFormattedBusinessFunctions]);

  // Departments with safe formatting
  const departmentOptions = useMemo(() => {
    let depts = [];
    
    try {
      if (getFormattedDepartments && typeof getFormattedDepartments === 'function') {
        depts = getFormattedDepartments() || [];
      }
      
      if (depts.length === 0 && Array.isArray(departments)) {
        depts = departments.map(dept => ({
          value: dept.id || dept.value,
          label: dept.name || dept.label,
          business_function: dept.business_function || dept.businessFunction,
          business_function_name: dept.business_function_name || dept.businessFunctionName,
          employee_count: dept.employee_count
        }));
      }
    } catch (error) {
      console.error('❌ Error formatting departments:', error);
      depts = [];
    }
    
    return depts;
  }, [departments, getFormattedDepartments]);

  // Units with safe formatting
  const unitOptions = useMemo(() => {
    let units_list = [];
    
    try {
      if (getFormattedUnits && typeof getFormattedUnits === 'function') {
        units_list = getFormattedUnits() || [];
      }
      
      if (units_list.length === 0 && Array.isArray(units)) {
        units_list = units.map(unit => ({
          value: unit.id || unit.value,
          label: unit.name || unit.label,
          department: unit.department,
          department_name: unit.department_name || unit.departmentName,
          business_function_name: unit.business_function_name || unit.businessFunctionName,
          employee_count: unit.employee_count
        }));
      }
    } catch (error) {
      console.error('❌ Error formatting units:', error);
      units_list = [];
    }
    
    return units_list;
  }, [units, getFormattedUnits]);

  // Job Functions with safe formatting
  const jobFunctionOptions = useMemo(() => {
    let jfs = [];
    
    try {
      if (getFormattedJobFunctions && typeof getFormattedJobFunctions === 'function') {
        jfs = getFormattedJobFunctions() || [];
      }
      
      if (jfs.length === 0 && Array.isArray(jobFunctions)) {
        jfs = jobFunctions.map(jf => ({
          value: jf.id || jf.value,
          label: jf.name || jf.label,
          description: jf.description,
          employee_count: jf.employee_count
        }));
      }
    } catch (error) {
      console.error('❌ Error formatting job functions:', error);
      jfs = [];
    }
    
    return jfs;
  }, [jobFunctions, getFormattedJobFunctions]);

  // Position Groups with safe formatting
  const positionGroupOptions = useMemo(() => {
    let pgs = [];
    
    try {
      if (getFormattedPositionGroups && typeof getFormattedPositionGroups === 'function') {
        pgs = getFormattedPositionGroups() || [];
      }
      
      if (pgs.length === 0 && Array.isArray(positionGroups)) {
        pgs = positionGroups.map(pg => ({
          value: pg.id || pg.value,
          label: pg.display_name || pg.label || pg.name,
          hierarchy_level: pg.hierarchy_level,
          employee_count: pg.employee_count
        }));
      }
    } catch (error) {
      console.error('❌ Error formatting position groups:', error);
      pgs = [];
    }
    
    return pgs.sort((a, b) => (a.hierarchy_level || 0) - (b.hierarchy_level || 0));
  }, [positionGroups, getFormattedPositionGroups]);

  // Employee Statuses with safe formatting
  const statusOptions = useMemo(() => {
    let statuses = [];
    
    try {
      if (getFormattedEmployeeStatuses && typeof getFormattedEmployeeStatuses === 'function') {
        statuses = getFormattedEmployeeStatuses() || [];
      }
      
      if (statuses.length === 0 && Array.isArray(employeeStatuses)) {
        statuses = employeeStatuses.map(status => ({
          value: status.id || status.value,
          label: status.name || status.label,
          color: status.color,
          affects_headcount: status.affects_headcount,
          employee_count: status.employee_count
        }));
      }
    } catch (error) {
      console.error('❌ Error formatting employee statuses:', error);
      statuses = [];
    }
    
    return statuses.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [employeeStatuses, getFormattedEmployeeStatuses]);

  // Employee Tags with safe formatting
  const tagOptions = useMemo(() => {
    let tags = [];
    
    try {
      if (getFormattedEmployeeTags && typeof getFormattedEmployeeTags === 'function') {
        tags = getFormattedEmployeeTags() || [];
      }
      
      if (tags.length === 0 && Array.isArray(employeeTags)) {
        tags = employeeTags.map(tag => ({
          value: tag.id || tag.value,
          label: tag.name || tag.label,
          tag_type: tag.tag_type,
          color: tag.color,
          employee_count: tag.employee_count
        }));
      }
    } catch (error) {
      console.error('❌ Error formatting employee tags:', error);
      tags = [];
    }
    
    return tags;
  }, [employeeTags, getFormattedEmployeeTags]);

  // Contract Durations with safe formatting
  const contractDurationOptions = useMemo(() => {
    let configs = [];
    
    try {
      if (getFormattedContractConfigs && typeof getFormattedContractConfigs === 'function') {
        configs = getFormattedContractConfigs() || [];
      }
      
      if (configs.length === 0 && Array.isArray(contractConfigs)) {
        configs = contractConfigs.map(config => ({
          value: config.contract_type || config.value,
          label: config.display_name || config.label,
          onboarding_days: config.onboarding_days,
          probation_days: config.probation_days,
          employee_count: config.employee_count
        }));
      }
    } catch (error) {
      console.error('❌ Error formatting contract configs:', error);
      configs = [];
    }
    
    return configs;
  }, [contractConfigs, getFormattedContractConfigs]);

  // Static options
  const gradeOptions = [
    { value: "_LD", label: "-LD", description: "Lower Decile" },
    { value: "_LQ", label: "-LQ", description: "Lower Quartile" },
    { value: "_M", label: "-M", description: "Median" },
    { value: "_UQ", label: "-UQ", description: "Upper Quartile" },
    { value: "_UD", label: "-UD", description: "Upper Decile" }
  ];

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" }
  ];

  const booleanOptions = [
    { value: "", label: "All" },
    { value: "true", label: "Yes" },
    { value: "false", label: "No" }
  ];

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleInputChange = (name, value) => {
    handleInstantFilterChange(name, value);
  };

  const handleMultiSelectChange = (name, values) => {
    handleInstantFilterChange(name, Array.isArray(values) ? values : []);
  };

  // Clear all filters
  const handleClearAll = () => {
    setFilters({
      search: "",
      employee_search: "",
      line_manager_search: "",
      job_title_search: "",
      business_function: [],
      department: [],
      unit: [],
      job_function: [],
      position_group: [],
      status: [],
      grading_level: [],
      contract_duration: [],
      line_manager: [],
    
      tags: [],
      tag_types: [],
      start_date_from: "",
      start_date_to: "",
      contract_end_date_from: "",
      contract_end_date_to: "",
      gender: [],
      years_of_service_min: "",
      years_of_service_max: "",
   
      is_active: ""
    });
  };

  // Apply filters - backend compatible format - INSTANT APPLICATION
  const handleApply = () => {
    console.log('🔧 Applying advanced filters INSTANTLY:', filters);
    
    // Convert to backend-compatible format
    const cleanedFilters = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Keep arrays as arrays for consistency with main component
          cleanedFilters[key] = value;
        }
      } else if (value && value.trim && value.trim() !== "") {
        cleanedFilters[key] = value.trim();
      } else if (value && !value.trim) {
        cleanedFilters[key] = value;
      }
    });

    console.log('✅ Cleaned filters for backend - APPLYING INSTANTLY:', cleanedFilters);
    onApply(cleanedFilters);
  };

  // INSTANT FILTER APPLICATION - No need for Apply button for most filters
  const handleInstantFilterChange = (name, value) => {
    console.log(`🔧 Instant filter change: ${name} = `, value);
    
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    
    // For non-search filters, apply instantly
    if (name !== 'search' && name !== 'employee_search' && name !== 'line_manager_search' && name !== 'job_title_search') {
      const cleanedFilters = {};
      
      Object.entries(newFilters).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          if (val.length > 0) {
            cleanedFilters[key] = val;
          }
        } else if (val && val.trim && val.trim() !== "") {
          cleanedFilters[key] = val.trim();
        } else if (val && !val.trim) {
          cleanedFilters[key] = val;
        }
      });

      console.log('✅ Auto-applying filter change:', cleanedFilters);
      onApply(cleanedFilters);
    }
  };

  // Count active filters
  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== "" && value !== null && value !== undefined;
    }).length;
  };

  const activeFilterCount = getActiveFilterCount();

  // Check if any data is loading
  const isAnyDataLoading = Object.values(loading).some(Boolean) || employeesLoading.employees;

  return (
    <div className={`${bgCard} p-6 rounded-lg border ${borderColor} mb-6 relative`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-almet-sapphire mr-2" />
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            Advanced Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="ml-3 px-2 py-1 bg-almet-sapphire text-white text-xs rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className={`text-sm px-3 py-1 rounded ${textMuted} hover:text-red-500 transition-colors`}
            disabled={activeFilterCount === 0}
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} className={textSecondary} />
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isAnyDataLoading && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-sm text-blue-800 dark:text-blue-300">
              Loading filter options...
            </span>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {Object.values(error).some(Boolean) && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-800 dark:text-red-300">
              Some filter options may be unavailable due to loading errors.
            </span>
          </div>
        </div>
      )}

      {/* Filter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Search & Basic Information */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
            Search & Basic Information
          </h4>

          

          {/* Specific Employee Search */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Specific Employee
              {employeeOptions.length > 0 && (
                <span className={`ml-2 text-xs ${textMuted}`}>
                  ({employeeOptions.length} employees)
                </span>
              )}
            </label>
            <MultiSelectDropdown
              options={employeeOptions.map(emp => ({
                value: emp.id,
                label: `${emp.name} (${emp.employee_id})`,
                subtitle: emp.jobTitle,
                department: emp.departmentName,
                email: emp.email
              }))}
              placeholder={employeeOptions.length > 0 ? "Search by name or employee ID..." : "Loading employees..."}
              selectedValues={filters.employee_search ? [filters.employee_search] : []}
              onChange={(values) => handleInputChange('employee_search', values[0] || '')}
              showSubtitles={true}
              disabled={employeesLoading.employees || employeeOptions.length === 0}
              searchable={true}
              maxSelections={1}
            />
          </div>

          {/* Job Title Search */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Job Title
              {jobTitleOptions.length > 0 && (
                <span className={`ml-2 text-xs ${textMuted}`}>
                  ({jobTitleOptions.length} unique titles)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search job titles..."
                value={filters.job_title_search}
                onChange={(e) => handleInputChange('job_title_search', e.target.value)}
                className={`w-full p-3 pl-10 pr-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                list="job-titles-list"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <datalist id="job-titles-list">
                {jobTitleOptions.map(option => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Employment Status */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Employment Status
            </label>
            <MultiSelectDropdown
              options={statusOptions}
              placeholder="Select statuses..."
              selectedValues={filters.status}
              onChange={(values) => handleMultiSelectChange("status", values)}
              showColors={true}
              disabled={loading.employeeStatuses}
              searchable={true}
            />
          </div>

          {/* Contract Duration */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Contract Duration
            </label>
            <MultiSelectDropdown
              options={contractDurationOptions}
              placeholder="Select contract types..."
              selectedValues={filters.contract_duration}
              onChange={(values) => handleMultiSelectChange("contract_duration", values)}
              disabled={loading.contractConfigs}
              searchable={true}
            />
          </div>

          {/* Gender */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Gender
            </label>
            <MultiSelectDropdown
              options={genderOptions}
              placeholder="Select genders..."
              selectedValues={filters.gender}
              onChange={(values) => handleMultiSelectChange("gender", values)}
            />
          </div>
        </div>

        {/* Middle Column - Organizational Structure */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
            Organizational Structure
          </h4>

          {/* Business Functions */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Business Functions
              {businessFunctionOptions.length > 0 && (
                <span className={`ml-2 text-xs ${textMuted}`}>
                  ({businessFunctionOptions.length} available)
                </span>
              )}
            </label>
            <MultiSelectDropdown
              options={businessFunctionOptions}
              placeholder={businessFunctionOptions.length > 0 ? "Select business functions..." : "Loading..."}
              selectedValues={filters.business_function}
              onChange={(values) => handleMultiSelectChange("business_function", values)}
              showCodes={true}
              disabled={loading.businessFunctions || businessFunctionOptions.length === 0}
              searchable={true}
            />
          </div>

          {/* Departments */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Departments
              {departmentOptions.length > 0 && (
                <span className={`ml-2 text-xs ${textMuted}`}>
                  ({departmentOptions.length} available)
                </span>
              )}
            </label>
            <MultiSelectDropdown
              options={departmentOptions}
              placeholder={departmentOptions.length > 0 ? "Select departments..." : "Loading..."}
              selectedValues={filters.department}
              onChange={(values) => handleMultiSelectChange("department", values)}
              disabled={loading.departments || departmentOptions.length === 0}
              searchable={true}
            />
          </div>

          {/* Units */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Units
              {unitOptions.length > 0 && (
                <span className={`ml-2 text-xs ${textMuted}`}>
                  ({unitOptions.length} available)
                </span>
              )}
            </label>
            <MultiSelectDropdown
              options={unitOptions}
              placeholder={unitOptions.length > 0 ? "Select units..." : "Loading..."}
              selectedValues={filters.unit}
              onChange={(values) => handleMultiSelectChange("unit", values)}
              disabled={loading.units || unitOptions.length === 0}
              searchable={true}
            />
          </div>

          {/* Job Functions */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Job Functions
            </label>
            <MultiSelectDropdown
              options={jobFunctionOptions}
              placeholder="Select job functions..."
              selectedValues={filters.job_function}
              onChange={(values) => handleMultiSelectChange("job_function", values)}
              disabled={loading.jobFunctions}
              searchable={true}
            />
          </div>

          {/* Position Groups */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Position Groups
            </label>
            <MultiSelectDropdown
              options={positionGroupOptions}
              placeholder="Select position groups..."
              selectedValues={filters.position_group}
              onChange={(values) => handleMultiSelectChange("position_group", values)}
              disabled={loading.positionGroups}
              searchable={true}
            />
          </div>

          {/* Grading Levels */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Grading Levels
            </label>
            <MultiSelectDropdown
              options={gradeOptions}
              placeholder="Select grades..."
              selectedValues={filters.grading_level}
              onChange={(values) => handleMultiSelectChange("grading_level", values)}
              showDescriptions={true}
            />
          </div>
        </div>

        {/* Right Column - Management & Additional */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
            Management & Additional
          </h4>

          {/* Line Manager */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Line Manager
              {lineManagerOptions.length > 0 && (
                <span className={`ml-2 text-xs ${textMuted}`}>
                  ({lineManagerOptions.length} managers)
                </span>
              )}
            </label>
            <MultiSelectDropdown
              options={lineManagerOptions.map(mgr => ({
                value: mgr.id,
                label: `${mgr.name} (${mgr.employee_id})`,
                subtitle: mgr.jobTitle,
                department: mgr.departmentName,
                description: `${mgr.directReportsCount} reports`
              }))}
              placeholder={lineManagerOptions.length > 0 ? "Select line managers..." : "Loading managers..."}
              selectedValues={filters.line_manager}
              onChange={(values) => handleMultiSelectChange("line_manager", values)}
              showSubtitles={true}
              showDescriptions={true}
              disabled={employeesLoading.employees || lineManagerOptions.length === 0}
              searchable={true}
            />
          </div>

       

          {/* Tags */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Tags
            </label>
            <MultiSelectDropdown
              options={tagOptions}
              placeholder="Select tags..."
              selectedValues={filters.tags}
              onChange={(values) => handleMultiSelectChange("tags", values)}
              showColors={true}
              disabled={loading.employeeTags}
              searchable={true}
            />
          </div>

          {/* Has Documents */}
       

          {/* Is Active */}
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Is Active
            </label>
            <select
              value={filters.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            >
              {booleanOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Date Filters Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className={`font-medium ${textPrimary} mb-4 text-sm`}>
          Date Ranges
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Start Date From
            </label>
            <input
              type="date"
              value={filters.start_date_from}
              onChange={(e) => handleInputChange('start_date_from', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Start Date To
            </label>
            <input
              type="date"
              value={filters.start_date_to}
              onChange={(e) => handleInputChange('start_date_to', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Contract End From
            </label>
            <input
              type="date"
              value={filters.contract_end_date_from}
              onChange={(e) => handleInputChange('contract_end_date_from', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Contract End To
            </label>
            <input
              type="date"
              value={filters.contract_end_date_to}
              onChange={(e) => handleInputChange('contract_end_date_to', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>
        </div>
      </div>

      {/* Years of Service Filter */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className={`font-medium ${textPrimary} mb-4 text-sm`}>
          Years of Service
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Minimum Years
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={filters.years_of_service_min}
              onChange={(e) => handleInputChange('years_of_service_min', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Maximum Years
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="No limit"
              value={filters.years_of_service_max}
              onChange={(e) => handleInputChange('years_of_service_max', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>
        </div>
      </div>

      {/* Debug Info - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <details className="mb-4">
            <summary className={`cursor-pointer text-sm ${textMuted} mb-2`}>
              Debug Information
            </summary>
            <div className={`text-xs ${textMuted} bg-gray-100 dark:bg-gray-800 p-3 rounded`}>
              <div className="mb-2">
                <strong>Data Loading Status:</strong>
                <ul className="ml-4">
                  <li>Business Functions: {loading.businessFunctions ? 'Loading...' : `${businessFunctionOptions.length} loaded`}</li>
                  <li>Departments: {loading.departments ? 'Loading...' : `${departmentOptions.length} loaded`}</li>
                  <li>Units: {loading.units ? 'Loading...' : `${unitOptions.length} loaded`}</li>
                  <li>Job Functions: {loading.jobFunctions ? 'Loading...' : `${jobFunctionOptions.length} loaded`}</li>
                  <li>Position Groups: {loading.positionGroups ? 'Loading...' : `${positionGroupOptions.length} loaded`}</li>
                  <li>Employee Statuses: {loading.employeeStatuses ? 'Loading...' : `${statusOptions.length} loaded`}</li>
                  <li>Employee Tags: {loading.employeeTags ? 'Loading...' : `${tagOptions.length} loaded`}</li>
                  <li>Contract Configs: {loading.contractConfigs ? 'Loading...' : `${contractDurationOptions.length} loaded`}</li>
                  <li>Employees: {employeesLoading.employees ? 'Loading...' : `${employeeOptions.length} loaded`}</li>
                </ul>
              </div>
              <div className="mb-2">
                <strong>Current Filters:</strong>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(filters, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Active Filter Count:</strong> {activeFilterCount}
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <AlertCircle size={16} className="mr-2" />
          Filters are applied instantly as you select options. Use search fields for text-based filtering.
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleClearAll}
            disabled={activeFilterCount === 0}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
          >
            Close Panel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors flex items-center"
            disabled={isAnyDataLoading}
          >
            <Filter size={16} className="mr-2" />
            {isAnyDataLoading ? 'Loading...' : 'Apply Search Filters'}
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterPanel;