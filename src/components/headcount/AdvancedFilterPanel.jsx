// src/components/headcount/AdvancedFilterPanel.jsx - COMPLETELY FIXED: Uncheck support and clear functionality
import { useState, useEffect, useMemo, useCallback } from "react";
import { X, Search, AlertCircle, Filter, Check, ChevronDown, RefreshCw } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { useReferenceData } from "../../hooks/useReferenceData";
import { useEmployees } from "../../hooks/useEmployees";

/**
 * Advanced Filter Panel with COMPLETELY FIXED multi-select handling and clear functionality
 */
const AdvancedFilterPanel = ({ 
  onApply, 
  onClose, 
  initialFilters = {}
}) => {
  const { darkMode } = useTheme();

  // ========================================
  // HOOKS FOR DATA
  // ========================================
  const {
    businessFunctionsDropdown = [],
    departmentsDropdown = [],
    unitsDropdown = [],
    jobFunctionsDropdown = [],
    positionGroupsDropdown = [],
    employeeStatusesDropdown = [],
    employeeTagsDropdown = [],
    contractConfigsDropdown = [],
    loading = {},
    error = {},
    fetchBusinessFunctions,
    fetchDepartments,
    fetchUnits,
    fetchJobFunctions,
    fetchPositionGroups,
    fetchEmployeeStatuses,
    fetchEmployeeTags,
    fetchContractConfigs,
    loadDepartmentsForBusinessFunction,
    loadUnitsForDepartment
  } = useReferenceData();

  const {
    formattedEmployees = [],
    loading: employeesLoading = {},
    fetchEmployees,
    statistics = {}
  } = useEmployees();

  // ========================================
  // SAFE STRING UTILITY FUNCTIONS
  // ========================================
  
  const safeString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  };

  const safeLocaleCompare = (a, b, field = 'label') => {
    const aValue = safeString(a[field]);
    const bValue = safeString(b[field]);
    return aValue.localeCompare(bValue);
  };

  // ========================================
  // LOCAL FILTER STATE - BACKEND COMPATIBLE (COMPLETELY FIXED)
  // ========================================
  const [filters, setFilters] = useState({
    // Search fields
    search: initialFilters.search || "",
    employee_search: initialFilters.employee_search || "",
    line_manager_search: initialFilters.line_manager_search || "",
    job_title_search: initialFilters.job_title_search || "",
    
    // Multi-select arrays
    business_function: Array.isArray(initialFilters.business_function) ? initialFilters.business_function : [],
    department: Array.isArray(initialFilters.department) ? initialFilters.department : [],
    unit: Array.isArray(initialFilters.unit) ? initialFilters.unit : [],
    job_function: Array.isArray(initialFilters.job_function) ? initialFilters.job_function : [],
    position_group: Array.isArray(initialFilters.position_group) ? initialFilters.position_group : [],
    status: Array.isArray(initialFilters.status) ? initialFilters.status : [],
    grading_level: Array.isArray(initialFilters.grading_level) ? initialFilters.grading_level : [],
    contract_duration: Array.isArray(initialFilters.contract_duration) ? initialFilters.contract_duration : [],
    line_manager: Array.isArray(initialFilters.line_manager) ? initialFilters.line_manager : [],
    tags: Array.isArray(initialFilters.tags) ? initialFilters.tags : [],
    gender: Array.isArray(initialFilters.gender) ? initialFilters.gender : [],
    
    // Date fields
    start_date_from: initialFilters.start_date_from || "",
    start_date_to: initialFilters.start_date_to || "",
    contract_end_date_from: initialFilters.contract_end_date_from || "",
    contract_end_date_to: initialFilters.contract_end_date_to || "",
    
    // Numeric fields
    years_of_service_min: initialFilters.years_of_service_min || "",
    years_of_service_max: initialFilters.years_of_service_max || "",
    contract_expiring_days: initialFilters.contract_expiring_days || "",
    
    // Boolean fields
    is_active: initialFilters.is_active || "",
    is_visible_in_org_chart: initialFilters.is_visible_in_org_chart || "",
    status_needs_update: initialFilters.status_needs_update || ""
  });

  // ========================================
  // THEME CLASSES
  // ========================================
  const bgPanel = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-700" : "bg-white";

  // ========================================
  // INITIALIZE REFERENCE DATA
  // ========================================
  const initializeReferenceData = useCallback(async () => {
    console.log('🔄 ADVANCED FILTER: Initializing all reference data...');
    
    const promises = [
      fetchBusinessFunctions?.(),
      fetchDepartments?.(),
      fetchUnits?.(),
      fetchJobFunctions?.(),
      fetchPositionGroups?.(),
      fetchEmployeeStatuses?.(),
      fetchEmployeeTags?.(),
      fetchContractConfigs?.(),
      fetchEmployees?.({ limit: 5000 }) // Get all employees for dropdowns
    ].filter(Boolean);
    
    try {
      await Promise.allSettled(promises);
      console.log('✅ ADVANCED FILTER: Reference data initialization completed');
    } catch (error) {
      console.error('❌ ADVANCED FILTER: Reference data initialization failed:', error);
    }
  }, [
    fetchBusinessFunctions, fetchDepartments, fetchUnits, fetchJobFunctions,
    fetchPositionGroups, fetchEmployeeStatuses, fetchEmployeeTags, 
    fetchContractConfigs, fetchEmployees
  ]);

  useEffect(() => {
    initializeReferenceData();
  }, [initializeReferenceData]);

  // ========================================
  // PREPARE OPTIONS WITH ERROR HANDLING
  // ========================================

  // Employee options for dropdown
  const employeeOptions = useMemo(() => {
    console.log('👥 Preparing employee options for dropdown...');
    
    if (!Array.isArray(formattedEmployees)) {
      console.warn('⚠️ formattedEmployees is not an array:', formattedEmployees);
      return [];
    }

    const options = formattedEmployees
      .filter(emp => {
        if (!emp || typeof emp !== 'object') {
          console.warn('⚠️ Invalid employee object:', emp);
          return false;
        }
        return emp.is_active !== false;
      })
      .map(emp => ({
        value: emp.id || emp.employee_id || '',
        label: safeString(emp.fullName || emp.displayName || emp.name) || 'Unknown Employee',
        subtitle: `${safeString(emp.jobTitle)} - ${safeString(emp.departmentName)}`,
        searchText: `${safeString(emp.fullName)} ${safeString(emp.email)} ${safeString(emp.employeeId)} ${safeString(emp.jobTitle)} ${safeString(emp.departmentName)}`,
        email: safeString(emp.email),
        employee_id: safeString(emp.employeeId),
        job_title: safeString(emp.jobTitle),
        department_name: safeString(emp.departmentName),
        business_function_name: safeString(emp.businessFunctionName)
      }))
      .filter(emp => emp.label !== 'Unknown Employee')
      .sort((a, b) => safeLocaleCompare(a, b, 'label'));

    console.log('✅ Processed employee options:', options.length, 'employees');
    return options;
  }, [formattedEmployees]);

  // Business Function options
  const businessFunctionOptions = useMemo(() => {
    console.log('🏭 Raw businessFunctionsDropdown:', businessFunctionsDropdown);
    
    if (!Array.isArray(businessFunctionsDropdown)) {
      console.warn('⚠️ businessFunctionsDropdown is not an array:', businessFunctionsDropdown);
      return [];
    }

    const options = businessFunctionsDropdown
      .filter(bf => {
        if (!bf || typeof bf !== 'object') {
          console.warn('⚠️ Invalid business function object:', bf);
          return false;
        }
        return bf.is_active !== false;
      })
      .map(bf => ({
        value: bf.value || bf.id || '',
        label: safeString(bf.label || bf.name || bf.display_name) || 'Unknown Business Function',
        code: safeString(bf.code),
        employee_count: bf.employee_count || 0
      }))
      .filter(bf => bf.label !== 'Unknown Business Function')
      .sort((a, b) => safeLocaleCompare(a, b, 'label'));

    console.log('✅ Processed business function options:', options.length, 'business functions');
    return options;
  }, [businessFunctionsDropdown]);

  // Department options - filtered by selected business function
  const departmentOptions = useMemo(() => {
    console.log('🏢 Raw departmentsDropdown:', departmentsDropdown);
    console.log('🏢 Selected business functions:', filters.business_function);
    
    if (!Array.isArray(departmentsDropdown)) {
      console.warn('⚠️ departmentsDropdown is not an array:', departmentsDropdown);
      return [];
    }

    let filteredDepartments = departmentsDropdown.filter(dept => {
      if (!dept || typeof dept !== 'object') {
        console.warn('⚠️ Invalid department object:', dept);
        return false;
      }
      return dept.is_active !== false;
    });
    
    // ONLY filter by business function if business function is selected
    // Otherwise show ALL departments
    if (filters.business_function.length > 0) {
      console.log('🏢 Filtering departments by business function:', filters.business_function);
      filteredDepartments = filteredDepartments.filter(dept => 
        filters.business_function.includes(dept.business_function?.toString())
      );
    }
    
    const options = filteredDepartments.map(dept => ({
      value: dept.value || dept.id || '',
      label: safeString(dept.label || dept.name || dept.display_name) || 'Unknown Department',
      business_function: dept.business_function || '',
      business_function_name: safeString(dept.business_function_name || dept.business_function_code),
      employee_count: dept.employee_count || 0
    }))
    .filter(dept => dept.label !== 'Unknown Department')
    .sort((a, b) => {
      const bfCompare = safeLocaleCompare(a, b, 'business_function_name');
      return bfCompare === 0 ? safeLocaleCompare(a, b, 'label') : bfCompare;
    });

    console.log('✅ Processed department options:', options.length, 'departments');
    return options;
  }, [departmentsDropdown, filters.business_function]);

  // Units options - filtered by selected department
  const unitOptions = useMemo(() => {
    console.log('🏢 Raw unitsDropdown:', unitsDropdown);
    
    if (!Array.isArray(unitsDropdown)) {
      console.warn('⚠️ unitsDropdown is not an array:', unitsDropdown);
      return [];
    }

    let filteredUnits = unitsDropdown.filter(unit => {
      if (!unit || typeof unit !== 'object') {
        console.warn('⚠️ Invalid unit object:', unit);
        return false;
      }
      return unit.is_active !== false;
    });
    
    // Filter by selected department if any
    if (filters.department.length > 0) {
      filteredUnits = filteredUnits.filter(unit => 
        filters.department.includes(unit.department?.toString())
      );
    }
    
    const options = filteredUnits.map(unit => ({
      value: unit.value || unit.id || '',
      label: safeString(unit.label || unit.name || unit.display_name) || 'Unknown Unit',
      department: unit.department || '',
      department_name: safeString(unit.department_name),
      business_function_name: safeString(unit.business_function_name),
      employee_count: unit.employee_count || 0
    }))
    .filter(unit => unit.label !== 'Unknown Unit')
    .sort((a, b) => safeLocaleCompare(a, b, 'label'));

    console.log('✅ Processed unit options:', options);
    return options;
  }, [unitsDropdown, filters.department]);

  // Job Functions options
  const jobFunctionOptions = useMemo(() => {
    console.log('💼 Raw jobFunctionsDropdown:', jobFunctionsDropdown);
    
    if (!Array.isArray(jobFunctionsDropdown)) {
      console.warn('⚠️ jobFunctionsDropdown is not an array:', jobFunctionsDropdown);
      return [];
    }

    const options = jobFunctionsDropdown
      .filter(jf => {
        if (!jf || typeof jf !== 'object') {
          console.warn('⚠️ Invalid job function object:', jf);
          return false;
        }
        return jf.is_active !== false;
      })
      .map(jf => ({
        value: jf.value || jf.id || '',
        label: safeString(jf.label || jf.name || jf.display_name) || 'Unknown Job Function',
        employee_count: jf.employee_count || 0
      }))
      .filter(jf => jf.label !== 'Unknown Job Function')
      .sort((a, b) => safeLocaleCompare(a, b, 'label'));

    console.log('✅ Processed job function options:', options.length, 'job functions');
    return options;
  }, [jobFunctionsDropdown]);

  // Position Group options
  const positionGroupOptions = useMemo(() => {
    console.log('📊 Raw positionGroupsDropdown:', positionGroupsDropdown);
    
    if (!Array.isArray(positionGroupsDropdown)) {
      console.warn('⚠️ positionGroupsDropdown is not an array:', positionGroupsDropdown);
      return [];
    }

    const options = positionGroupsDropdown
      .filter(pg => {
        if (!pg || typeof pg !== 'object') {
          console.warn('⚠️ Invalid position group object:', pg);
          return false;
        }
        return pg.is_active !== false;
      })
      .map(pg => ({
        value: pg.value || pg.id || '',
        label: safeString(pg.label || pg.name || pg.display_name) || 'Unknown Position Group',
        hierarchy_level: pg.hierarchy_level || 0,
        grading_shorthand: safeString(pg.grading_shorthand),
        employee_count: pg.employee_count || 0
      }))
      .filter(pg => pg.label !== 'Unknown Position Group')
      .sort((a, b) => (a.hierarchy_level || 0) - (b.hierarchy_level || 0));

    console.log('✅ Processed position group options:', options.length, 'position groups');
    return options;
  }, [positionGroupsDropdown]);

  // Status options
  const statusOptions = useMemo(() => {
    console.log('📊 Raw employeeStatusesDropdown:', employeeStatusesDropdown);
    
    if (!Array.isArray(employeeStatusesDropdown)) {
      console.warn('⚠️ employeeStatusesDropdown is not an array:', employeeStatusesDropdown);
      return [];
    }

    const options = employeeStatusesDropdown
      .filter(status => {
        if (!status || typeof status !== 'object') {
          console.warn('⚠️ Invalid status object:', status);
          return false;
        }
        return status.is_active !== false;
      })
      .map(status => ({
        value: status.value || status.id || '',
        label: safeString(status.label || status.name || status.display_name) || 'Unknown Status',
        color: status.color,
        employee_count: status.employee_count || 0
      }))
      .filter(status => status.label !== 'Unknown Status')
      .sort((a, b) => safeLocaleCompare(a, b, 'label'));

    console.log('✅ Processed status options:', options.length, 'statuses');
    return options;
  }, [employeeStatusesDropdown]);

  // Tags options
  const tagOptions = useMemo(() => {
    console.log('🏷️ Raw employeeTagsDropdown:', employeeTagsDropdown);
    
    if (!Array.isArray(employeeTagsDropdown)) {
      console.warn('⚠️ employeeTagsDropdown is not an array:', employeeTagsDropdown);
      return [];
    }

    const options = employeeTagsDropdown
      .filter(tag => {
        if (!tag || typeof tag !== 'object') {
          console.warn('⚠️ Invalid tag object:', tag);
          return false;
        }
        return tag.is_active !== false;
      })
      .map(tag => ({
        value: tag.value || tag.id || '',
        label: safeString(tag.label || tag.name || tag.display_name) || 'Unknown Tag',
        color: tag.color,
        employee_count: tag.employee_count || 0
      }))
      .filter(tag => tag.label !== 'Unknown Tag')
      .sort((a, b) => safeLocaleCompare(a, b, 'label'));

    console.log('✅ Processed tag options:', options.length, 'tags');
    return options;
  }, [employeeTagsDropdown]);

  // Contract Duration options
  const contractDurationOptions = useMemo(() => {
    console.log('📋 Raw contractConfigsDropdown:', contractConfigsDropdown);
    
    if (!Array.isArray(contractConfigsDropdown)) {
      console.warn('⚠️ contractConfigsDropdown is not an array:', contractConfigsDropdown);
      return [];
    }

    const options = contractConfigsDropdown
      .filter(contract => {
        if (!contract || typeof contract !== 'object') {
          console.warn('⚠️ Invalid contract object:', contract);
          return false;
        }
        return contract.is_active !== false;
      })
      .map(contract => ({
        value: contract.value || contract.id || '',
        label: safeString(contract.label || contract.name || contract.display_name) || 'Unknown Contract',
        employee_count: contract.employee_count || 0
      }))
      .filter(contract => contract.label !== 'Unknown Contract')
      .sort((a, b) => safeLocaleCompare(a, b, 'label'));

    console.log('✅ Processed contract duration options:', options.length, 'contracts');
    return options;
  }, [contractConfigsDropdown]);

  // Line Manager options - from employees
  const lineManagerOptions = useMemo(() => {
    console.log('👨‍💼 Preparing line manager options...');
    
    const managers = formattedEmployees
      .filter(emp => {
        if (!emp || typeof emp !== 'object') return false;
        return emp.is_active !== false && emp.direct_reports_count > 0;
      })
      .map(mgr => ({
        value: mgr.id || mgr.employee_id || '',
        label: safeString(mgr.fullName || mgr.displayName || mgr.name) || 'Unknown Manager',
        name: safeString(mgr.fullName || mgr.displayName || mgr.name),
        job_title: safeString(mgr.jobTitle),
        department_name: safeString(mgr.departmentName),
        business_function_name: safeString(mgr.businessFunctionName),
        direct_reports_count: mgr.direct_reports_count || 0
      }))
      .filter(mgr => mgr.label !== 'Unknown Manager')
      .sort((a, b) => safeLocaleCompare(a, b, 'label'));

    console.log('✅ Processed line manager options:', managers.length, 'managers');
    return managers;
  }, [formattedEmployees]);

  // Static options
  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' }
  ];

  const booleanOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  const gradeOptions = [
    { value: 'A', label: 'Grade A', description: 'Senior Level' },
    { value: 'B', label: 'Grade B', description: 'Mid Level' },
    { value: 'C', label: 'Grade C', description: 'Junior Level' },
    { value: 'D', label: 'Grade D', description: 'Entry Level' }
  ];

  // ========================================
  // FILTER CHANGE HANDLERS - FIXED
  // ========================================
  
  const handleInputChange = useCallback((name, value) => {
    console.log(`🔧 Filter change: ${name} = `, value);
    
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    
    // For hierarchical filters, load dependent data but DON'T clear existing selections
    if (name === 'business_function' && Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach(bfId => {
          if (bfId && loadDepartmentsForBusinessFunction) {
            loadDepartmentsForBusinessFunction(bfId);
          }
        });
      }
    }
    
    if (name === 'department' && Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach(deptId => {
          if (deptId && loadUnitsForDepartment) {
            loadUnitsForDepartment(deptId);
          }
        });
      }
    }
    
    // Apply filters AUTOMATICALLY but DON'T close panel
    applyFilters(newFilters);
  }, [filters, loadDepartmentsForBusinessFunction, loadUnitsForDepartment]);

  const handleMultiSelectChange = useCallback((name, values) => {
    console.log(`🔧 Multi-select change: ${name} = `, values);
    handleInputChange(name, Array.isArray(values) ? values : []);
  }, [handleInputChange]);

  // FIXED: Apply filters - backend compatible format with proper array handling
  const applyFilters = useCallback((filtersToApply = filters) => {
    console.log('🔧 Applying advanced filters:', filtersToApply);
    
    // Convert to backend-compatible format with PROPER ARRAY HANDLING
    const cleanedFilters = {};
    
    Object.entries(filtersToApply).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // For arrays, only include if they have values
        if (value.length > 0) {
          // Make sure all values are clean strings/numbers
          const cleanValues = value.filter(v => v !== null && v !== undefined && v !== '');
          if (cleanValues.length > 0) {
            cleanedFilters[key] = cleanValues;
          }
        }
      } else if (value && value.toString().trim() !== "") {
        cleanedFilters[key] = value.toString().trim();
      }
    });

    console.log('✅ Cleaned filters for backend:', cleanedFilters);
    onApply(cleanedFilters);
  }, [filters, onApply]);

  // FIXED: Clear all filters
  const handleClearAll = useCallback(() => {
    console.log('🧹 Clearing ALL advanced filters');
    
    const clearedFilters = {
      // Search fields
      search: "",
      employee_search: "",
      line_manager_search: "",
      job_title_search: "",
      
      // Multi-select arrays - completely clear
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
      gender: [],
      
      // Date fields
      start_date_from: "",
      start_date_to: "",
      contract_end_date_from: "",
      contract_end_date_to: "",
      
      // Numeric fields
      years_of_service_min: "",
      years_of_service_max: "",
      contract_expiring_days: "",
      
      // Boolean fields
      is_active: "",
      is_visible_in_org_chart: "",
      status_needs_update: ""
    };
    
    setFilters(clearedFilters);
    
    // Apply cleared filters immediately
    onApply(clearedFilters);
  }, [onApply]);

  // FIXED: Clear individual filter
  const handleClearFilter = useCallback((filterKey) => {
    console.log('🧹 Clearing individual filter:', filterKey);
    
    const newFilters = { ...filters };
    
    // Clear based on filter type
    if (Array.isArray(filters[filterKey])) {
      newFilters[filterKey] = [];
    } else {
      newFilters[filterKey] = "";
    }
    
    setFilters(newFilters);
    
    // Apply immediately
    onApply(newFilters);
  }, [filters, onApply]);

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
      <div className={`${bgPanel} rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          <div>
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Advanced Filters</h2>
            <p className={`text-sm ${textMuted} mt-1`}>
              Apply detailed filters to refine your employee search
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error State */}
          {Object.values(error).some(err => err) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  Some data failed to load. Please try refreshing.
                </span>
                <button
                  onClick={initializeReferenceData}
                  className="ml-4 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 flex items-center"
                >
                  <RefreshCw size={12} className="mr-1" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Filter Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Search & Organizational */}
            <div className="space-y-4">
              <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
                Search & Organizational
              </h4>

              {/* General Search */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  General Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, employee ID..."
                    value={filters.search}
                    onChange={(e) => handleInputChange('search', e.target.value)}
                    className={`w-full p-3 pl-10 pr-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  {/* FIXED: Clear button for search */}
                  {filters.search && (
                    <button
                      onClick={() => handleInputChange('search', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Employee Search Dropdown */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Select Specific Employee
                  {employeeOptions.length > 0 && (
                    <span className={`ml-2 text-xs ${textMuted}`}>
                      ({employeeOptions.length} employees)
                    </span>
                  )}
                </label>
                <MultiSelectDropdown
                  options={employeeOptions}
                  placeholder={employeeOptions.length > 0 ? "Search and select employees..." : "Loading employees..."}
                  selectedValues={Array.isArray(filters.employee_search) ? filters.employee_search : 
                    filters.employee_search ? [filters.employee_search] : []}
                  onChange={(values) => {
                    console.log('🔧 Employee search dropdown change:', values);
                    handleMultiSelectChange('employee_search', values);
                  }}
                  disabled={employeesLoading.employees}
                  searchable={true}
                  maxHeight="300px"
                  showSearch={true}
                  singleSelect={false}
                />
              </div>

              {/* Business Function */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Business Function
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
                  disabled={loading.businessFunctions}
                  searchable={true}
                />
              </div>

              {/* Department - SHOWS ALL or filtered by business function */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Department
                  {departmentOptions.length > 0 && (
                    <span className={`ml-2 text-xs ${textMuted}`}>
                      ({departmentOptions.length} available{filters.business_function.length > 0 ? ' (filtered)' : ' (all)'})
                    </span>
                  )}
                </label>
                <MultiSelectDropdown
                  options={departmentOptions}
                  placeholder={
                    departmentOptions.length > 0 
                      ? filters.business_function.length > 0 
                        ? "Select departments (filtered by business function)..." 
                        : "Select departments (showing all)..."
                      : "Loading departments..."
                  }
                  selectedValues={filters.department}
                  onChange={(values) => handleMultiSelectChange("department", values)}
                  disabled={loading.departments}
                  searchable={true}
                  groupBy="business_function_name"
                />
              </div>

              {/* Unit */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Unit
                  {unitOptions.length > 0 && (
                    <span className={`ml-2 text-xs ${textMuted}`}>
                      ({unitOptions.length} available)
                    </span>
                  )}
                </label>
                <MultiSelectDropdown
                  options={unitOptions}
                  placeholder={unitOptions.length > 0 ? "Select units..." : "Select department first..."}
                  selectedValues={filters.unit}
                  onChange={(values) => handleMultiSelectChange("unit", values)}
                  disabled={loading.units}
                  searchable={true}
                />
              </div>

              {/* Job Function */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Job Function
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

              {/* Position Group */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Position Group
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

              {/* Status */}
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
            </div>

            {/* Middle Column - Employment Details */}
            <div className="space-y-4">
              <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
                Employment Details
              </h4>

              {/* Grading Level */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Grading Level
                </label>
                <MultiSelectDropdown
                  options={gradeOptions}
                  placeholder="Select grading levels..."
                  selectedValues={filters.grading_level}
                  onChange={(values) => handleMultiSelectChange("grading_level", values)}
                  showDescriptions={true}
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
                  placeholder="Select gender..."
                  selectedValues={filters.gender}
                  onChange={(values) => handleMultiSelectChange("gender", values)}
                />
              </div>

              {/* Job Title Search */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Job Title Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by job title..."
                    value={filters.job_title_search}
                    onChange={(e) => handleInputChange('job_title_search', e.target.value)}
                    className={`w-full p-3 pl-10 pr-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  {filters.job_title_search && (
                    <button
                      onClick={() => handleInputChange('job_title_search', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Line Manager Search */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Line Manager Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by line manager name..."
                    value={filters.line_manager_search}
                    onChange={(e) => handleInputChange('line_manager_search', e.target.value)}
                    className={`w-full p-3 pl-10 pr-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  {filters.line_manager_search && (
                    <button
                      onClick={() => handleInputChange('line_manager_search', '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
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
                    value: mgr.value,
                    label: mgr.label,
                    subtitle: `${mgr.job_title} - ${mgr.department_name}`,
                    description: `${mgr.direct_reports_count} direct reports`,
                    searchText: `${mgr.name} ${mgr.job_title} ${mgr.department_name} ${mgr.business_function_name}`
                  }))}
                  placeholder={lineManagerOptions.length > 0 ? 
                    "Search and select line managers..." : "Loading managers..."}
                  selectedValues={filters.line_manager}
                  onChange={(values) => handleMultiSelectChange("line_manager", values)}
                  showSubtitles={true}
                  showDescriptions={true}
                  disabled={employeesLoading.employees || lineManagerOptions.length === 0}
                  searchable={true}
                  maxHeight="300px"
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

              {/* Is Visible in Org Chart */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Visible in Org Chart
                </label>
                <select
                  value={filters.is_visible_in_org_chart}
                  onChange={(e) => handleInputChange('is_visible_in_org_chart', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  {booleanOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Needs Update */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Status Needs Update
                </label>
                <select
                  value={filters.status_needs_update}
                  onChange={(e) => handleInputChange('status_needs_update', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  {booleanOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contract Expiring Days */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Contract Expiring Within (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  placeholder="e.g., 30"
                  value={filters.contract_expiring_days}
                  onChange={(e) => handleInputChange('contract_expiring_days', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>
            </div>
          </div>

          {/* Date Filters Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className={`font-medium ${textPrimary} mb-4 text-sm`}>
              Date Ranges
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Start Date Range */}
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

              {/* Contract End Date Range */}
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

            {/* Years of Service Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Years of Service (Min)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g., 1"
                  value={filters.years_of_service_min}
                  onChange={(e) => handleInputChange('years_of_service_min', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>
              
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Years of Service (Max)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g., 10"
                  value={filters.years_of_service_max}
                  onChange={(e) => handleInputChange('years_of_service_max', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t ${borderColor} bg-gray-50 dark:bg-gray-900`}>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => applyFilters()}
              className="px-4 py-2 text-sm font-medium text-white bg-almet-sapphire hover:bg-almet-astral rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterPanel;