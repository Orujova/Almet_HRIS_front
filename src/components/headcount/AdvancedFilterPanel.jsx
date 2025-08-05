// src/components/headcount/AdvancedFilterPanel.jsx - FULL PAGE WITH UNCHECK FIX
import { useState, useEffect, useMemo, useCallback  } from "react";
import { X, Search, AlertCircle, Filter, Check, ChevronDown, RefreshCw } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { useReferenceData } from "../../hooks/useReferenceData";
import { useEmployees } from "../../hooks/useEmployees";

/**
 * FULL PAGE WITH FINAL UNCHECK FIX:
 * 1. handleMultiSelectChange dependency array düzəldildi - applyFilters əlavə edildi
 * 2. applyFilters funksiyası stable referans ilə - yalnız onApply dependency
 * 3. handleInputChange da applyFilters dependency əlavə edildi
 * 4. Bütün filterlər tam şəkildə render edilir
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
  // LOCAL FILTER STATE - STABLE STATE MANAGEMENT
  // ========================================
  const [filters, setFilters] = useState({
    // Search fields
    search: initialFilters.search || "",
    employee_search: initialFilters.employee_search || "",
 
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
  // STABLE APPLY FILTERS FUNCTION - CRITICAL FIX
  // ========================================
  const applyFilters = useCallback((filtersToApply) => {
    const targetFilters = filtersToApply || filters;
    console.log('🔧 FINAL: Applying advanced filters:', targetFilters);
    
    // Convert to backend-compatible format with PROPER ARRAY HANDLING
    const cleanedFilters = {};
    
    Object.entries(targetFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // CRITICAL: UNCHECK problemi - boş array-lar üçün filter əlavə etmə
        if (value.length > 0) {
          // Special handling for department - expand combined values
          if (key === 'department') {
            const expandedValues = [];
            value.forEach(dept => {
              if (dept.includes(',')) {
                expandedValues.push(...dept.split(','));
              } else {
                expandedValues.push(dept);
              }
            });
            const cleanValues = expandedValues.filter(v => v !== null && v !== undefined && v !== '');
            if (cleanValues.length > 0) {
              cleanedFilters[key] = cleanValues;
            }
          } else {
            // Regular array handling
            const cleanValues = value.filter(v => v !== null && v !== undefined && v !== '');
            if (cleanValues.length > 0) {
              cleanedFilters[key] = cleanValues;
            }
          }
        }
        // CRITICAL: ƏGƏR value.length === 0, filter backend-ə göndərilmir (UNCHECK olmuş say)
      } else if (value && value.toString().trim() !== "") {
        cleanedFilters[key] = value.toString().trim();
      }
    });

    console.log('✅ FINAL: Cleaned filters for backend (empty arrays REMOVED):', cleanedFilters);
    
    // CRITICAL: Bu ən vacib hissədir - təmizlənmiş filteri backend-ə göndər
    onApply(cleanedFilters);
  }, [onApply]); // YALNIZ onApply dependency

  // ========================================
  // PREPARE OPTIONS WITH ERROR HANDLING
  // ========================================

  // Employee options - TAMAMILƏ STABIL, options itmir
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

  // Department options - UNIQUE departments, amma bütün business function data-ları gəlir
  const departmentOptions = useMemo(() => {
    console.log('🏢 Raw departmentsDropdown:', departmentsDropdown);
    
    if (!Array.isArray(departmentsDropdown)) {
      console.warn('⚠️ departmentsDropdown is not an array:', departmentsDropdown);
      return [];
    }

    // Group departments by name to get unique departments with all business functions
    const departmentGroups = {};
    
    departmentsDropdown
      .filter(dept => {
        if (!dept || typeof dept !== 'object') {
          console.warn('⚠️ Invalid department object:', dept);
          return false;
        }
        return dept.is_active !== false;
      })
      .forEach(dept => {
        const deptName = safeString(dept.label || dept.name || dept.display_name);
        if (!deptName || deptName === 'Unknown Department') return;
        
        if (!departmentGroups[deptName]) {
          departmentGroups[deptName] = {
            name: deptName,
            values: [],
            business_functions: [],
            business_function_names: [],
            total_employee_count: 0
          };
        }
        
        // Collect all values and business functions for this department
        const deptValue = dept.value || dept.id || '';
        if (deptValue && !departmentGroups[deptName].values.includes(deptValue)) {
          departmentGroups[deptName].values.push(deptValue);
        }
        
        const bfId = dept.business_function;
        if (bfId && !departmentGroups[deptName].business_functions.includes(bfId)) {
          departmentGroups[deptName].business_functions.push(bfId);
        }
        
        const bfName = safeString(dept.business_function_name || dept.business_function_code);
        if (bfName && !departmentGroups[deptName].business_function_names.includes(bfName)) {
          departmentGroups[deptName].business_function_names.push(bfName);
        }
        
        departmentGroups[deptName].total_employee_count += (dept.employee_count || 0);
      });

    // Convert to options array - HƏR DEPARTMENT BİR DƏFƏ
    const options = Object.values(departmentGroups).map(group => ({
      value: group.values.join(','), // Multiple values combined
      label: group.name,
      business_functions: group.business_functions,
      business_function_names: group.business_function_names.join(', '),
      employee_count: group.total_employee_count,
      // Store individual values for backend compatibility
      individual_values: group.values
    }))
    .sort((a, b) => safeLocaleCompare(a, b, 'label'));

    console.log('✅ Processed UNIQUE department options:', options.length, 'unique departments');
    console.log('🏢 Department groups:', options);
    return options;
  }, [departmentsDropdown]);

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
      // Get all individual department values from selected departments
      const allDeptValues = [];
      filters.department.forEach(selectedDept => {
        // Check if this is a combined value (contains comma)
        if (selectedDept.includes(',')) {
          allDeptValues.push(...selectedDept.split(','));
        } else {
          allDeptValues.push(selectedDept);
        }
      });
      
      filteredUnits = filteredUnits.filter(unit => 
        allDeptValues.includes(unit.department?.toString())
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

 // All grading levels from database - fetched globally 
  const allGradingLevelsOptions = useMemo(() => {
    console.log('🏆 Raw formattedEmployees for grading levels:', formattedEmployees);
    
    if (!Array.isArray(formattedEmployees)) {
      console.warn('⚠️ formattedEmployees is not an array for grading levels');
      return [];
    }

    // Extract all unique grading levels from employees
    const uniqueGradingLevels = new Set();
    
    formattedEmployees.forEach(emp => {
      if (emp && emp.grading_level) {
        const grade = safeString(emp.grading_level).trim();
        if (grade && grade !== '' && grade !== 'null' && grade !== 'undefined') {
          uniqueGradingLevels.add(grade);
        }
      }
    });
    
    // Convert to options array and add display names
    const gradingOptions = Array.from(uniqueGradingLevels).map(code => {
      let display = code;
      let full_name = code;
      
      // Map database codes to proper display names
      switch(code) {
        case '_LD':
          display = '-LD';
          full_name = 'Lower Decile';
          break;
        case '_LQ':
          display = '-LQ';
          full_name = 'Lower Quartile';
          break;
        case '_M':
        case 'M':
          display = code === '_M' ? '-M' : 'M';
          full_name = 'Median';
          break;
        case '_UQ':
          display = '-UQ';
          full_name = 'Upper Quartile';
          break;
        case '_UD':
          display = '-UD';
          full_name = 'Upper Decile';
          break;
        default:
          // Keep original for any other grades
          display = code;
          full_name = `Grade ${code}`;
      }
      
      // Count employees with this grade
      const employeeCount = formattedEmployees.filter(emp => 
        emp && emp.grading_level === code
      ).length;
      
      return {
        value: code,
        label: `${display} - ${full_name}`,
        code: code,
        display: display,
        full_name: full_name,
        employee_count: employeeCount,
        // CRITICAL: Special handling for _M and M - they should both match M in filtering
        searchValues: code === '_M' ? ['_M', 'M'] : [code]
      };
    }).sort((a, b) => {
      // Custom sort order for grading levels
      const order = ['_LD', '_LQ', '_M', 'M', '_UQ', '_UD'];
      const aIndex = order.indexOf(a.code);
      const bIndex = order.indexOf(b.code);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return a.label.localeCompare(b.label);
      }
    });
    
    console.log('✅ Processed grading level options from database:', gradingOptions);
    return gradingOptions;
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

  // ========================================
  // FILTER CHANGE HANDLERS - FINAL FIX WITH PROPER DEPENDENCIES
  // ========================================
  
  const handleInputChange = useCallback((name, value) => {
    console.log(`🔧 Filter change: ${name} = `, value);
    
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [name]: value
      };
      
      // Employee seçimi zamanı AVTO-APPLY ETMƏ!
      if (name !== 'employee_search') {
        // Apply filters AUTOMATICALLY but DON'T close panel
        setTimeout(() => {
          applyFilters(newFilters);
        }, 0);
      }
      
      return newFilters;
    });
    
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
        // Extract individual department values for loading units
        const allDeptValues = [];
        value.forEach(selectedDept => {
          if (selectedDept.includes(',')) {
            allDeptValues.push(...selectedDept.split(','));
          } else {
            allDeptValues.push(selectedDept);
          }
        });
        
        allDeptValues.forEach(deptId => {
          if (deptId && loadUnitsForDepartment) {
            loadUnitsForDepartment(deptId);
          }
        });
      }
    }
  }, [applyFilters, loadDepartmentsForBusinessFunction, loadUnitsForDepartment]); // CRITICAL: applyFilters dependency əlavə edildi

  // CRITICAL FIX: handleMultiSelectChange düzgün dependency array ilə
  const handleMultiSelectChange = useCallback((name, values) => {
    console.log('🔧 FINAL: handleMultiSelectChange CALLED:', { name, values });
    console.log('🔧 FINAL: Previous filters state:', filters);
    
    // Employee search üçün fərqli davranış
    if (name === 'employee_search') {
      console.log('🔧 Employee search - just updating state, NO auto-apply');
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: Array.isArray(values) ? values : []
      }));
    } else {
      console.log('🔧 Other filter - updating state AND applying immediately');
      const newValues = Array.isArray(values) ? values : [];
      
      setFilters(prevFilters => {
        const newFilters = {
          ...prevFilters,
          [name]: newValues
        };
        
        console.log('🔧 FINAL: New filters state:', newFilters);
        
        // CRITICAL FIX: UNCHECK problemi burada həll edilir - newFilters istifadə et
        setTimeout(() => {
          console.log('🔧 FINAL: Applying filters with new values:', newFilters);
          applyFilters(newFilters);
        }, 50); // Timeout azaldıldı
        
        return newFilters;
      });
    }
  }, [applyFilters]); // CRITICAL: applyFilters dependency əlavə edildi

  // Clear all filters
  const handleClearAll = useCallback(() => {
    console.log('🧹 Clearing ALL advanced filters');
    
    const clearedFilters = {
      // Search fields
      search: "",
      employee_search: "",
   
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
    
    // Apply cleared filters immediately - BOŞALT backend-dən
    onApply({});
  }, [onApply]);

  // Clear individual filter
  const handleClearFilter = useCallback((filterKey) => {
    console.log('🧹 Clearing individual filter:', filterKey);
    
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      
      // Clear based on filter type
      if (Array.isArray(prevFilters[filterKey])) {
        newFilters[filterKey] = [];
      } else {
        newFilters[filterKey] = "";
      }
      
      // Apply immediately
      setTimeout(() => {
        applyFilters(newFilters);
      }, 0);
      
      return newFilters;
    });
  }, [applyFilters]);

  // ========================================
  // RENDER - FULL PAGE
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
                 Organizational
              </h4>


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
                  key="employee-search-stable"
                  options={employeeOptions}
                  placeholder={employeeOptions.length > 0 ? "Search and select employees..." : "Loading employees..."}
                  selectedValues={Array.isArray(filters.employee_search) ? filters.employee_search : 
                    filters.employee_search ? [filters.employee_search] : []}
                  onChange={(values) => {
                    console.log('🔧 Employee search dropdown change (NO AUTO-APPLY):', values);
                    setFilters(prevFilters => ({
                      ...prevFilters,
                      employee_search: values
                    }));
                  }}
                  disabled={employeesLoading.employees}
                  searchable={true}
                  maxHeight="300px"
                  showSearch={true}
                  singleSelect={false}
                  showSubtitles={true}
                  clearable={true}
                />
                {filters.employee_search && filters.employee_search.length > 0 && (
                  <div className={`mt-2 text-xs ${textMuted}`}>
                    ⚠️ {filters.employee_search.length} employee(s) selected. Click "Apply Filters" to search.
                  </div>
                )}
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
                  onChange={(values) => {
                    console.log('🚨 Business Function onChange TRIGGERED:', values);
                    handleMultiSelectChange("business_function", values);
                  }}
                  disabled={loading.businessFunctions}
                  searchable={true}
                />
                {filters.business_function.length > 0 && (
                  <div className={`mt-1 text-xs ${textMuted}`}>
                    Selected: {filters.business_function.join(', ')}
                  </div>
                )}
              </div>

              {/* Department */}
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Department
                  {departmentOptions.length > 0 && (
                    <span className={`ml-2 text-xs ${textMuted}`}>
                      ({departmentOptions.length} unique departments)
                    </span>
                  )}
                </label>
                <MultiSelectDropdown
                  options={departmentOptions.map(dept => ({
                    ...dept,
                    subtitle: `Business Functions: ${dept.business_function_names}`,
                    description: `${dept.employee_count} employees total`
                  }))}
                  placeholder={
                    departmentOptions.length > 0 
                      ? "Select departments..."
                      : "Loading departments..."
                  }
                  selectedValues={filters.department}
                  onChange={(values) => {
                    console.log('🚨 Department onChange TRIGGERED:', values);
                    handleMultiSelectChange("department", values);
                  }}
                  disabled={loading.departments}
                  searchable={true}
                  showSubtitles={true}
                  showDescriptions={true}
                />
                {filters.department.length > 0 && (
                  <div className={`mt-1 text-xs ${textMuted}`}>
                    Selected: {filters.department.join(', ')}
                  </div>
                )}
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

             
            </div>

            {/* Middle Column - Employment Details */}
            <div className="space-y-4">
              <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
                Employment Details
              </h4>

          
              <div>
                <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
                  Grading Level
                </label>
                <MultiSelectDropdown
                  options={allGradingLevelsOptions}
                  placeholder="Select grading levels..."
                  selectedValues={filters.grading_level}
                  onChange={(values) => handleMultiSelectChange("grading_level", values)}
                  showDescriptions={true}
                />
              </div>

            
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

              
            </div>

            {/* Right Column - Management & Additional */}
            <div className="space-y-4">
              <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
                Management & Additional
              </h4>

     
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
          
          <div className="flex items-center space-x-3">
            {/* Show apply needed indicator */}
            {filters.employee_search && filters.employee_search.length > 0 && (
              <span className={`text-xs ${textMuted} italic`}>
                Employee selection pending...
              </span>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => applyFilters()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                filters.employee_search && filters.employee_search.length > 0
                  ? 'bg-orange-500 hover:bg-orange-600 animate-pulse'
                  : 'bg-almet-sapphire hover:bg-almet-astral'
              }`}
            >
              Apply Filters
              {filters.employee_search && filters.employee_search.length > 0 && (
                <span className="ml-1">({filters.employee_search.length})</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterPanel;