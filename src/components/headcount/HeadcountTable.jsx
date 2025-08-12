// src/components/headcount/HeadcountTable.jsx - Enhanced with Advanced Multiple Sorting System
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

// Import our Advanced Multiple Sorting System
import { AdvancedMultipleSortingSystem } from "./MultipleSortingSystem";
import LineManagerModal from "./LineManagerAssignModal";
import TagManagementModal from "./TagManagementModalsingle";
const HeadcountTable = () => {
  const { darkMode } = useTheme();
  
  // ========================================
  // HOOKS & API INTEGRATION
  // ========================================
  
  const {
    // Employee data
    formattedEmployees,
    loading,
    error,
    statistics,
    pagination,
    sorting,
    
    // Selection state
    selectedEmployees,
    
    // Filter management
    currentFilters,
    appliedFilters,
    
    // Actions
    fetchEmployees,
    fetchStatistics,
    refreshAll,
    
    // Selection actions
    toggleEmployeeSelection,
    selectAllEmployees,
    clearSelection,
    setSelectedEmployees,
    
    // Filter actions
    setCurrentFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    
    // Sorting actions
    setSorting,
    addSort,
    removeSort,
    clearSorting,
    toggleSort,
    
    // Pagination actions
    setCurrentPage,
    setPageSize,
    
    // Bulk operations
    bulkAddTags,
    bulkRemoveTags,
    bulkAssignLineManager,
    bulkExtendContracts,
    softDeleteEmployees,
    restoreEmployees,
    deleteEmployee,
    exportEmployees,
    downloadEmployeeTemplate,
    bulkUploadEmployees,
    showInOrgChart,
    hideFromOrgChart,
    
    // Helpers
    getSortDirection,
    isSorted,
    getSortIndex,
    clearErrors,
    apiParams
  } = useEmployees();
 
  // Reference data for filters
  const {
    employeeStatuses,
    departments,
    businessFunctions,
    positionGroups,
    employeeTags,
    contractConfigs,
    loading: refLoading,
    error: refError
  } = useReferenceData();

  // ========================================
  // LOCAL STATE
  // ========================================
  
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [employeeVisibility, setEmployeeVisibility] = useState({});
  
  // NEW: Advanced Sorting State
  const [isAdvancedSortingOpen, setIsAdvancedSortingOpen] = useState(false);
const [isExporting, setIsExporting] = useState(false);
  const [showLineManagerModal, setShowLineManagerModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentModalEmployee, setCurrentModalEmployee] = useState(null);
 const [allEmployeesForModal, setAllEmployeesForModal] = useState(null);
  const [fetchingAllEmployees, setFetchingAllEmployees] = useState(false);
  
// Update loading state based on API loading
useEffect(() => {
  if (loading.exporting !== undefined) {
    setIsExporting(loading.exporting);
  }
}, [loading.exporting]);

  
  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    search: "",
    employee_search: [],
    line_manager_search: "",
    job_title_search: "",
    status: [],
    department: [],
    business_function: [],
    position_group: [],
    tags: [],
    grading_level: [],
    contract_duration: [],
    line_manager: [],
    gender: [],
    start_date_from: "",
    start_date_to: "",
    contract_end_date_from: "",
    contract_end_date_to: "",
    years_of_service_min: "",
    years_of_service_max: "",
    is_active: "",
    is_visible_in_org_chart: "",
    status_needs_update: "",
    contract_expiring_days: ""
  });

  // Refs for control
  const initialized = useRef(false);
  const lastFetchTime = useRef(0);
  const debounceRef = useRef(null);
  const lastApiParamsRef = useRef(null);

  // ========================================
  // NEW: AVAILABLE FIELDS FOR SORTING
  // ========================================
  
  const availableFieldsForSorting = useMemo(() => [
    // Basic Information
    { value: 'name', label: 'Full Name', description: 'Employee full name' },
    { value: 'employee_name', label: 'Employee Name', description: 'Employee display name' },
    { value: 'employee_id', label: 'Employee ID', description: 'Unique employee identifier' },
    { value: 'email', label: 'Email Address', description: 'Work email address' },
    { value: 'phone', label: 'Phone Number', description: 'Contact phone number' },
    { value: 'father_name', label: 'Father Name', description: 'Father\'s name' },
    
    // Job Information
    { value: 'job_title', label: 'Job Title', description: 'Current position title' },
    
    // Organizational Structure
    { value: 'business_function_name', label: 'Business Function', description: 'Main business area' },
    { value: 'business_function_code', label: 'Function Code', description: 'Business function code' },
    { value: 'department_name', label: 'Department', description: 'Department name' },
    { value: 'unit_name', label: 'Unit', description: 'Organizational unit' },
    { value: 'job_function_name', label: 'Job Function', description: 'Specific job function' },
    
    // Position & Grading
    { value: 'position_group_name', label: 'Position Group', description: 'Position group category' },
    { value: 'position_group_level', label: 'Position Level', description: 'Hierarchy level in position group' },
    { value: 'grading_level', label: 'Grade Level', description: 'Employee grade level' },
    
    // Management
    { value: 'line_manager_name', label: 'Line Manager', description: 'Direct supervisor' },
    { value: 'line_manager_hc_number', label: 'Manager ID', description: 'Manager employee ID' },
    
    // Employment Dates
    { value: 'start_date', label: 'Start Date', description: 'Employment start date' },
    { value: 'end_date', label: 'End Date', description: 'Employment end date' },
    { value: 'contract_start_date', label: 'Contract Start', description: 'Current contract start date' },
    { value: 'contract_end_date', label: 'Contract End', description: 'Current contract end date' },
    
    // Contract Information
    { value: 'contract_duration', label: 'Contract Duration', description: 'Contract length in months' },
    { value: 'contract_duration_display', label: 'Contract Display', description: 'Formatted contract duration' },
    
    // Status
    { value: 'status_name', label: 'Employment Status', description: 'Current employment status' },
    { value: 'status_color', label: 'Status Color', description: 'Status indicator color' },
    { value: 'current_status_display', label: 'Status Display', description: 'Formatted status display' },
    
    // Personal Information
    { value: 'date_of_birth', label: 'Date of Birth', description: 'Employee birth date' },
    { value: 'gender', label: 'Gender', description: 'Employee gender' },
    
    // Calculated Fields
    { value: 'years_of_service', label: 'Years of Service', description: 'Total years with company' },
    { value: 'direct_reports_count', label: 'Direct Reports', description: 'Number of direct subordinates' },
    
    // Metadata
    { value: 'created_at', label: 'Created Date', description: 'Record creation date' },
    { value: 'updated_at', label: 'Last Updated', description: 'Last modification date' },
    { value: 'is_visible_in_org_chart', label: 'Visible in Org Chart', description: 'Show in organizational chart' },
    { value: 'is_deleted', label: 'Deleted Status', description: 'Soft deletion status' }
  ], []);

  // ========================================
  // API PARAMS BUILDER
  // ========================================
 
  const buildApiParams = useMemo(() => {
    const params = {
      page: pagination.page || 1,
      page_size: pagination.pageSize || 25
    };

    console.log('🔧 HEADCOUNT: Building API params from localFilters:', localFilters);

    // Text search
    if (localFilters.search?.trim()) {
      params.search = localFilters.search.trim();
    }

    // NEW: Multiple Sorting - Enhanced support
    if (sorting && sorting.length > 0) {
      const orderingFields = sorting.map(sort => 
        sort.direction === 'desc' ? `-${sort.field}` : sort.field
      );
      params.ordering = orderingFields.join(',');
      console.log('✅ HEADCOUNT: Multiple sorting applied:', params.ordering);
    }

    // Multi-select Filters - Send as arrays, backend will handle parsing
    const multiSelectFilters = [
      'business_function', 'department', 'unit', 'job_function', 'position_group',
      'status', 'grading_level', 'contract_duration', 'line_manager', 'tags', 'gender', 'employee_search'
    ];

    multiSelectFilters.forEach(filterKey => {
      if (localFilters[filterKey]) {
        if (Array.isArray(localFilters[filterKey])) {
          const cleanValues = localFilters[filterKey].filter(val => 
            val !== null && val !== undefined && val !== ''
          );
          if (cleanValues.length > 0) {
            params[filterKey] = cleanValues.join(',');
            console.log(`✅ HEADCOUNT: ${filterKey} = "${params[filterKey]}" (from array of ${cleanValues.length} items)`);
          }
        } else if (typeof localFilters[filterKey] === 'string') {
          const trimmed = localFilters[filterKey].trim();
          if (trimmed) {
            params[filterKey] = trimmed;
            console.log(`✅ HEADCOUNT: ${filterKey} = "${trimmed}" (single value)`);
          }
        }
      }
    });

    // Search filters
    if (localFilters.line_manager_search?.trim()) {
      params.line_manager_search = localFilters.line_manager_search.trim();
    }
    if (localFilters.job_title_search?.trim()) {
      params.job_title_search = localFilters.job_title_search.trim();
    }
    
    // Date Range Filters
    if (localFilters.start_date_from) {
      params.start_date_from = localFilters.start_date_from;
    }
    if (localFilters.start_date_to) {
      params.start_date_to = localFilters.start_date_to;
    }
    if (localFilters.contract_end_date_from) {
      params.contract_end_date_from = localFilters.contract_end_date_from;
    }
    if (localFilters.contract_end_date_to) {
      params.contract_end_date_to = localFilters.contract_end_date_to;
    }

    // Numeric Range Filters
    if (localFilters.years_of_service_min) {
      params.years_of_service_min = localFilters.years_of_service_min;
    }
    if (localFilters.years_of_service_max) {
      params.years_of_service_max = localFilters.years_of_service_max;
    }

    // Boolean Filters
    if (localFilters.is_active && localFilters.is_active !== "") {
      params.is_active = localFilters.is_active === "true";
    }
    if (localFilters.is_visible_in_org_chart && localFilters.is_visible_in_org_chart !== "") {
      params.is_visible_in_org_chart = localFilters.is_visible_in_org_chart === "true";
    }
    if (localFilters.status_needs_update && localFilters.status_needs_update !== "") {
      params.status_needs_update = localFilters.status_needs_update === "true";
    }

    // Contract expiring filter
    if (localFilters.contract_expiring_days) {
      params.contract_expiring_days = parseInt(localFilters.contract_expiring_days);
    }

    console.log('🚀 HEADCOUNT: Final API params:', params);
    return params;
  }, [localFilters, pagination.page, pagination.pageSize, sorting]);

  // ========================================
  // PREVENT INFINITE LOOP WITH PARAMS COMPARISON
  // ========================================
  
  const apiParamsChanged = useMemo(() => {
    if (!lastApiParamsRef.current) return true;
    
    const currentParams = JSON.stringify(buildApiParams);
    const lastParams = JSON.stringify(lastApiParamsRef.current);
    
    return currentParams !== lastParams;
  }, [buildApiParams]);

  // ========================================
  // DEBOUNCED DATA FETCHING
  // ========================================
  
  const debouncedFetchEmployees = useCallback((params, immediate = false) => {
    const paramsString = JSON.stringify(params);
    const lastParamsString = JSON.stringify(lastApiParamsRef.current);
    
    if (paramsString === lastParamsString && !immediate) {
      console.log('🔄 Skipping fetch - same params');
      return;
    }

    const delay = immediate ? 0 : 500;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const now = Date.now();
      if (now - lastFetchTime.current > 100) {
        console.log('🚀 Fetching employees with params:', params);
        lastFetchTime.current = now;
        lastApiParamsRef.current = { ...params };
        fetchEmployees(params);
      }
    }, delay);
  }, [fetchEmployees]);

  // ========================================
  // INITIALIZATION
  // ========================================
  
  useEffect(() => {
    const initializeData = async () => {
      if (initialized.current) return;
      
      try {
        initialized.current = true;
        console.log('🚀 Initializing HeadcountTable...');
        
        clearErrors();
        lastApiParamsRef.current = { ...buildApiParams };
        
        await Promise.all([
          fetchStatistics(),
          fetchEmployees(buildApiParams)
        ]);
        
        console.log('✅ HeadcountTable initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize HeadcountTable:', error);
        initialized.current = false;
      }
    };

    initializeData();
  }, []);

  // ========================================
  // DATA FETCHING ON PARAM CHANGES
  // ========================================
  
  useEffect(() => {
    if (initialized.current && apiParamsChanged) {
      console.log('📡 API params changed, fetching employees...', {
        current: buildApiParams,
        last: lastApiParamsRef.current
      });
      debouncedFetchEmployees(buildApiParams);
    }
  }, [apiParamsChanged, buildApiParams, debouncedFetchEmployees]);

  // ========================================
  // DATA REFRESH HELPER
  // ========================================
  
  const refreshAllData = useCallback(async (forceRefresh = false) => {
    console.log('🔄 Refreshing all data...', { forceRefresh });
    try {
      if (forceRefresh) {
        lastApiParamsRef.current = null;
      }
      
      await Promise.all([
        fetchStatistics(),
        fetchEmployees(buildApiParams)
      ]);
      
      lastApiParamsRef.current = { ...buildApiParams };
      console.log('✅ Data refresh completed');
    } catch (error) {
      console.error('❌ Data refresh failed:', error);
    }
  }, [fetchStatistics, fetchEmployees, buildApiParams]);

  // ========================================
  // NEW: ADVANCED SORTING HANDLERS
  // ========================================

  const handleToggleAdvancedSorting = useCallback(() => {
    setIsAdvancedSortingOpen(prev => !prev);
  }, []);

  const handleSortingChange = useCallback((newSorting) => {
    console.log('🔢 Advanced sorting changed:', newSorting);
    
    // Update the sorting state through useEmployees hook
    if (newSorting.length === 0) {
      clearSorting();
    } else if (newSorting.length === 1) {
      // Single sort
      setSorting({ field: newSorting[0].field, direction: newSorting[0].direction });
    } else {
      // Multiple sorts - use the multiple parameter
      setSorting({ multiple: newSorting });
    }
    
    // Reset to first page when sorting changes
    setCurrentPage(1);
  }, [setSorting, clearSorting, setCurrentPage]);

  const handleClearAllSorting = useCallback(() => {
    console.log('❌ Clearing all sorting');
    clearSorting();
    setCurrentPage(1);
  }, [clearSorting, setCurrentPage]);



  // ========================================
  // FILTER HANDLERS
  // ========================================

  const handleSearchChange = useCallback((value) => {
    console.log('🔍 HEADCOUNT: Search changed:', value);
    setLocalFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleStatusChange = useCallback((selectedStatuses) => {
    console.log('📊 HEADCOUNT: Status filter changed:', selectedStatuses);
    setLocalFilters(prev => ({ ...prev, status: Array.isArray(selectedStatuses) ? selectedStatuses : [] }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleDepartmentChange = useCallback((selectedDepartments) => {
    console.log('🏢 HEADCOUNT: Department filter changed:', selectedDepartments);
    setLocalFilters(prev => ({ ...prev, department: Array.isArray(selectedDepartments) ? selectedDepartments : [] }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleBusinessFunctionChange = useCallback((selectedBFs) => {
    console.log('🏭 HEADCOUNT: Business function filter changed:', selectedBFs);
    setLocalFilters(prev => ({ ...prev, business_function: Array.isArray(selectedBFs) ? selectedBFs : [] }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handlePositionGroupChange = useCallback((selectedPGs) => {
    console.log('📊 HEADCOUNT: Position group filter changed:', selectedPGs);
    setLocalFilters(prev => ({ ...prev, position_group: Array.isArray(selectedPGs) ? selectedPGs : [] }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleApplyAdvancedFilters = useCallback((filters) => {
    console.log('🔧 HEADCOUNT: Advanced filters applied:', filters);
    
    const processedFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        processedFilters[key] = value;
      } else if (typeof value === 'string' && value.includes(',')) {
        processedFilters[key] = value.split(',').map(v => v.trim()).filter(v => v);
      } else {
        processedFilters[key] = value;
      }
    });
    
    console.log('✅ HEADCOUNT: Processed advanced filters:', processedFilters);
    setLocalFilters(prev => ({ ...prev, ...processedFilters }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleClearFilter = useCallback((key) => {
    console.log('❌ HEADCOUNT: Clearing filter:', key);
    
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      
      if (Array.isArray(prev[key])) {
        newFilters[key] = [];
      } else {
        newFilters[key] = "";
      }
      
      return newFilters;
    });
    
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleClearAllFilters = useCallback(() => {
    console.log('❌ HEADCOUNT: Clearing all filters');
    
    const clearedFilters = {
      search: "",
      employee_search: [],
      line_manager_search: "",
      job_title_search: "",
      status: [],
      department: [],
      business_function: [],
      position_group: [],
      tags: [],
      grading_level: [],
      contract_duration: [],
      line_manager: [],
      gender: [],
      start_date_from: "",
      start_date_to: "",
      contract_end_date_from: "",
      contract_end_date_to: "",
      years_of_service_min: "",
      years_of_service_max: "",
      is_active: "",
      is_visible_in_org_chart: "",
      status_needs_update: "",
      contract_expiring_days: ""
    };
    
    setLocalFilters(clearedFilters);
    clearFilters();
    setCurrentPage(1);
  }, [clearFilters, setCurrentPage]);

  // ========================================
  // SELECTION HANDLERS
  // ========================================
  
  const handleEmployeeToggle = useCallback((employeeId) => {
    toggleEmployeeSelection(employeeId);
  }, [toggleEmployeeSelection]);

  const handleSelectAll = useCallback(() => {
    if (selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0) {
      clearSelection();
    } else {
      const allIds = formattedEmployees.map(emp => emp.id);
      setSelectedEmployees(allIds);
    }
  }, [selectedEmployees.length, formattedEmployees, clearSelection, setSelectedEmployees]);


   const handleVisibilityChange = useCallback(async (employeeId, newVisibility) => {
  try {
    // Optimistic update - dərhal UI-da göstər
    setEmployeeVisibility(prev => ({
      ...prev,
      [employeeId]: newVisibility
    }));

    // Backend API çağırışı
    if (newVisibility) {
      await showInOrgChart([employeeId]);
    } else {
      await hideFromOrgChart([employeeId]);
    }

    console.log(`✅ Employee ${employeeId} visibility updated to ${newVisibility ? 'visible' : 'hidden'}`);
    
  } catch (error) {
    // Error olduqda əvvəlki vəziyyətə qaytar
    setEmployeeVisibility(prev => ({
      ...prev,
      [employeeId]: !newVisibility
    }));
    
    console.error('❌ Failed to update visibility:', error);
    alert(`❌ Failed to update visibility: ${error.message}`);
  }
}, [showInOrgChart, hideFromOrgChart]);
  // ========================================
  // SORTING HANDLERS (Table Column Sorting)
  // ========================================
  
  const handleSort = useCallback((field, ctrlKey = false) => {
    console.log('🔢 Sort requested:', { field, ctrlKey });
    
    if (ctrlKey) {
      // Multi-column sorting
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
      // Single column sorting
      const currentDirection = getSortDirection(field);
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      setSorting({ field, direction: newDirection });
    }
  }, [getSortDirection, addSort, removeSort, setSorting]);

  // ========================================
  // BULK ACTION HANDLERS
  // ========================================
  
  const handleBulkAction = useCallback(async (action, options = {}) => {
    console.log('🔥 BULK ACTION:', action, options);
    setIsActionMenuOpen(false);

    if (selectedEmployees.length === 0 && !['export', 'downloadTemplate', 'bulkImport'].includes(action)) {
      alert("⚠️ Please select employees first!");
      return;
    }

    try {
      let result;
      
      switch (action) {
        case "export":
          setIsExportModalOpen(true);
          break;

        case "bulkImport":
          setIsBulkUploadOpen(true);
          break;

        case "downloadTemplate":
          try {
            result = await downloadEmployeeTemplate();
            alert('✅ Template downloaded successfully!');
          } catch (error) {
            console.error('❌ Template download failed:', error);
            alert('❌ Template download failed: ' + error.message);
          }
          break;

        case "delete":
        case "softDelete":
          const deleteMessage = `Are you sure you want to ${action === 'softDelete' ? 'soft delete' : 'permanently delete'} ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}?`;
          
          if (confirm(deleteMessage)) {
            try {
              if (action === "softDelete") {
                result = await softDeleteEmployees(selectedEmployees);
              } else {
                const deletePromises = selectedEmployees.map(id => deleteEmployee(id));
                await Promise.all(deletePromises);
              }
              
              clearSelection();
              await refreshAllData(true);
              alert(`✅ ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} ${action === 'softDelete' ? 'soft deleted' : 'deleted'} successfully!`);
            } catch (error) {
              console.error(`❌ ${action} failed:`, error);
              alert(`❌ ${action} failed: ${error.message}`);
            }
          }
          break;

        case "restore":
          try {
            result = await restoreEmployees(selectedEmployees);
            clearSelection();
            await refreshAllData(true);
            alert(`✅ ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} restored successfully!`);
          } catch (error) {
            console.error('❌ Restore failed:', error);
            alert('❌ Restore failed: ' + error.message);
          }
          break;

        case "showInOrgChart":
  try {
    await showInOrgChart(selectedEmployees);
    clearSelection();
    await refreshAllData(true);
    alert(`✅ ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} now visible in org chart!`);
  } catch (error) {
    console.error('❌ Show in org chart failed:', error);
    alert('❌ Show in org chart failed: ' + error.message);
  }
  break;

case "hideFromOrgChart":
  try {
    await hideFromOrgChart(selectedEmployees);
    clearSelection();
    await refreshAllData(true);
    alert(`✅ ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} hidden from org chart!`);
  } catch (error) {
    console.error('❌ Hide from org chart failed:', error);
    alert('❌ Hide from org chart failed: ' + error.message);
  }
  break;

        case "bulkAddTags":
          try {
            const payload = {
              employee_ids: options.employee_ids || selectedEmployees,
              tag_id: options.tag_id
            };
            
            result = await bulkAddTags(payload.employee_ids, payload.tag_id);
            clearSelection();
            await refreshAllData(true);
            
            const tagName = result?.tag_info?.name || 'Tag';
            alert(`✅ "${tagName}" tag added to ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            console.error('❌ Tag addition failed:', error);
            alert('❌ Tag addition failed: ' + error.message);
          }
          break;

        case "bulkRemoveTags":
          try {
            const payload = {
              employee_ids: options.employee_ids || selectedEmployees,
              tag_id: options.tag_id
            };
            
            result = await bulkRemoveTags(payload.employee_ids, payload.tag_id);
            clearSelection();
            await refreshAllData(true);
            alert(`✅ Tag removed from ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            console.error('❌ Tag removal failed:', error);
            alert('❌ Tag removal failed: ' + error.message);
          }
          break;

        case "bulkAssignLineManager":
          try {
            const payload = {
              employee_ids: options.employee_ids || selectedEmployees,
              line_manager_id: options.line_manager_id
            };
            
            result = await bulkAssignLineManager(payload.employee_ids, payload.line_manager_id);
            clearSelection();
            await refreshAllData(true);
            
            const managerName = result?.line_manager_info?.name || 'Line Manager';
            alert(`✅ ${managerName} assigned as line manager to ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            console.error('❌ Line manager assignment failed:', error);
            alert('❌ Line manager assignment failed: ' + error.message);
          }
          break;

        case "bulkExtendContracts":
          try {
            result = await bulkExtendContracts({
              employee_ids: selectedEmployees,
              new_contract_type: options.new_contract_type,
              new_start_date: options.new_start_date,
              reason: options.reason
            });
            
            clearSelection();
            await refreshAllData(true);
            alert(`✅ Contracts extended for ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}!`);
          } catch (error) {
            console.error('❌ Contract extension failed:', error);
            alert('❌ Contract extension failed: ' + error.message);
          }
          break;

        default:
          console.warn('❓ Unknown bulk action:', action);
          alert(`❓ "${action}" operation not implemented yet`);
      }
    } catch (error) {
      console.error(`❌ Bulk action ${action} failed:`, error);
      alert(`❌ ${action} failed. Error: ${error.message}`);
    }
  }, [
    selectedEmployees,
    clearSelection,
    refreshAllData,
    softDeleteEmployees,
    restoreEmployees,
    bulkAddTags,
    bulkRemoveTags,
    bulkAssignLineManager,
    bulkExtendContracts,
    downloadEmployeeTemplate,
    deleteEmployee,
    showInOrgChart,
    hideFromOrgChart
  ]);

  // ========================================
  // ACTION MENU HANDLERS
  // ========================================
  
  const handleToggleActionMenu = useCallback(() => {
    setIsActionMenuOpen(prev => !prev);
  }, []);

  const handleActionMenuClose = useCallback(() => {
    setIsActionMenuOpen(false);
  }, []);

  // ========================================
  // EXPORT FUNCTIONALITY
  // ========================================
  
  // HeadcountTable.jsx içindəki REAL FIXED handleExport function

const handleExport = useCallback(async (exportOptions) => {
  console.log('📤 REAL FIXED: Export handler called with options:', exportOptions);
  
  try {
    // ============================================
    // REAL FIXED: Backend API format-ına tam uyğun payload
    // ============================================
    
    const apiPayload = {};
    
    // Export format - backend export_format field-ini gözləyir
    apiPayload.export_format = exportOptions.format || 'excel';
    
    // ============================================
    // FIELDS MAPPING - Backend field names ilə exact match
    // ============================================
    
    if (exportOptions.fields && typeof exportOptions.fields === 'object') {
      const fieldMappings = {
        // Backend API-də mövcud olan exact field names
        basic_info: [
          'employee_id', 'name', 'email', 'gender', 'father_name', 
          'first_name', 'last_name', 'phone'
        ],
        job_info: [
          'job_title', 'department_name', 'business_function_name', 
          'business_function_code', 'position_group_name', 'job_function_name'
        ],
        contact_info: [
          'phone', 'address', 'emergency_contact'
        ],
        contract_info: [
          'contract_duration', 'contract_start_date', 'contract_end_date', 
          'contract_extensions', 'last_extension_date', 'contract_duration_display'
        ],
        management_info: [
          'line_manager_name', 'line_manager_hc_number', 
          'direct_reports_count'
        ],
        tags: [
          'tag_names'
        ],
        grading: [
          'grading_level', 'grading_display', 'position_group_level'
        ],
        status: [
          'status_name', 'status_color', 'is_visible_in_org_chart', 
          'status_needs_update', 'current_status_display'
        ],
        dates: [
          'start_date', 'end_date', 'date_of_birth', 'years_of_service',
          'created_at', 'updated_at'
        ],
        documents_count: ['documents_count'],
        activities_count: ['activities_count']
      };

      const selectedFields = [];
      Object.keys(exportOptions.fields).forEach(fieldGroup => {
        if (exportOptions.fields[fieldGroup] && fieldMappings[fieldGroup]) {
          selectedFields.push(...fieldMappings[fieldGroup]);
        }
      });

      if (selectedFields.length > 0) {
        // Remove duplicates
        apiPayload.include_fields = [...new Set(selectedFields)];
        console.log('📊 REAL FIXED: Selected fields:', apiPayload.include_fields);
      }
    }
    
    // ============================================
    // EXPORT TYPE HANDLING
    // ============================================
    
    switch (exportOptions.type) {
      case "selected":
        if (!selectedEmployees || selectedEmployees.length === 0) {
          throw new Error("No employees selected for export");
        }
        
        // Backend employee_ids field-ini gözləyir
        apiPayload.employee_ids = selectedEmployees;
        console.log('📋 REAL FIXED: Exporting selected employees count:', selectedEmployees.length);
        break;

      case "filtered":
        // REAL FIXED: Filtered export üçün current filter parameters
        const filterParams = { ...buildApiParams };
        
        // Remove pagination
        delete filterParams.page;
        delete filterParams.page_size;
        
        // Set filter params for query string
        apiPayload._filterParams = filterParams;
        console.log('🔍 REAL FIXED: Exporting filtered employees with params:', filterParams);
        break;

      case "all":
        // No additional parameters needed for all employees
        console.log('🌍 REAL FIXED: Exporting all employees');
        break;

      default:
        throw new Error(`Unknown export type: ${exportOptions.type}`);
    }

    console.log('🚀 REAL FIXED: Final API payload:', apiPayload);

    // ============================================
    // API CALL - enhanced with better error handling
    // ============================================
    
    const result = await exportEmployees(exportOptions.format || 'excel', apiPayload);
    
    console.log('✅ REAL FIXED: Export completed successfully:', result);
    
    // ============================================
    // SUCCESS MESSAGE
    // ============================================
    
    const exportTypeLabel = exportOptions.type === "selected" 
      ? `${selectedEmployees?.length || 0} selected` 
      : exportOptions.type === "filtered" 
      ? "filtered"
      : "all";
    
    const successMessage = `✅ Export completed! ${exportTypeLabel} employees exported in ${(exportOptions.format || 'excel').toUpperCase()} format.`;
    
    // Show success message
    if (typeof alert === 'function') {
      alert(successMessage);
    } else {
      console.log(successMessage);
    }
    
    return result;

  } catch (error) {
    console.error('❌ REAL FIXED: Export failed in handler:', error);
    
    // ============================================
    // ENHANCED ERROR HANDLING
    // ============================================
    
    let userFriendlyMessage = "Export failed. Please try again.";
    
    if (error.message) {
      userFriendlyMessage = error.message;
    } else if (typeof error === 'string') {
      userFriendlyMessage = error;
    } else if (error.response?.data?.message) {
      userFriendlyMessage = error.response.data.message;
    } else if (error.response?.data?.detail) {
      userFriendlyMessage = error.response.data.detail;
    } else if (error.data?.message) {
      userFriendlyMessage = error.data.message;
    } else if (error.data?.detail) {
      userFriendlyMessage = error.data.detail;
    }
    
    // Additional context for common issues
    if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
      userFriendlyMessage = "Export format not supported by server. Please try a different format or contact support.";
    } else if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
      userFriendlyMessage = "Invalid export parameters. Please check your selection and try again.";
    } else if (error.message?.includes('timeout')) {
      userFriendlyMessage = "Export timeout. The export is taking too long. Please try with fewer employees.";
    } else if (error.message?.includes('Network Error')) {
      userFriendlyMessage = "Network error. Please check your connection and try again.";
    }
    
    console.error('💥 REAL FIXED: Final error message:', userFriendlyMessage);
    
    // Show error message
    if (typeof alert === 'function') {
      alert(`❌ ${userFriendlyMessage}`);
    } else {
      console.error(`❌ ${userFriendlyMessage}`);
    }
    
    throw error; // Re-throw for modal handling
  }
}, [selectedEmployees, buildApiParams, exportEmployees]);


const handleQuickExport = useCallback(async (exportOptions) => {
  console.log('⚡ QUICK EXPORT: Starting quick export:', exportOptions);
  
  try {
    // Set exporting state
    setIsExporting(true);
    
    // Use the existing handleExport with enhanced options
    await handleExport(exportOptions);
    
    console.log('✅ QUICK EXPORT: Completed successfully');
    
  } catch (error) {
    console.error('❌ QUICK EXPORT: Failed:', error);
    
    // Show user-friendly error
    const errorMessage = error.message || 'Quick export failed. Please try again.';
    alert(`❌ Export failed: ${errorMessage}`);
  } finally {
    setIsExporting(false);
  }
}, [handleExport]);

  // ========================================
  // BULK UPLOAD FUNCTIONALITY
  // ========================================
  
  const handleBulkImportComplete = useCallback(async (result) => {
    try {
      await refreshAllData(true);
      setIsBulkUploadOpen(false);
      
      if (result?.imported_count) {
        alert(`✅ Successfully imported ${result.imported_count} employees!`);
      } else if (result?.successful) {
        alert(`✅ Successfully imported ${result.successful} employees!`);
      } else {
        alert('✅ Bulk import completed successfully!');
      }
    } catch (error) {
      console.error('❌ Failed to refresh after import:', error);
      setIsBulkUploadOpen(false);
      alert('⚠️ Import completed but failed to refresh data. Please refresh the page.');
    }
  }, [refreshAllData]);



  const handleToggleExportModal = useCallback(() => {
  setIsExportModalOpen(prev => !prev);
}, []);



  // ========================================
  // ENHANCED: FETCH ALL EMPLOYEES FOR MODALS
  // ========================================


// Fixed fetchAllEmployeesForModal function
const fetchAllEmployeesForModal = useCallback(async (options = {}) => {
  const shouldSkipCache = options?.skipCache;
  
  // Use cached data if available and not skipping cache
  if (allEmployeesForModal && !shouldSkipCache && Array.isArray(allEmployeesForModal) && allEmployeesForModal.length > 0) {
    console.log('✅ CACHE: Using cached employees:', allEmployeesForModal.length);
    return Promise.resolve(allEmployeesForModal);
  }
  
  try {
    setFetchingAllEmployees(true);
    console.log('🚀 FETCH: Starting to fetch all employees...');
    
    // Clear cache if requested
    if (shouldSkipCache) {
      setAllEmployeesForModal(null);
    }
    
    // CRITICAL: Fetch ALL employees without any filters
    const params = {
      page: 1,
      page_size: 10000, // Increased to ensure we get ALL employees
      // Remove any filtering that might limit results
      // status: 'active' // Remove this if it exists
    };
    
    console.log('📤 FETCH: Using params:', params);
    const response = await fetchEmployees(params);
    
    console.log('📡 FETCH: Raw response received:', {
      type: typeof response,
      isArray: Array.isArray(response),
      keys: response && typeof response === 'object' ? Object.keys(response) : 'N/A'
    });
    
    // IMPROVED: Extract employees from response
    let employees = [];
    
    if (response) {
      // Log the full structure for debugging
      console.log('🔍 FETCH: Response structure:', response);
      
      // Try different extraction methods
      if (Array.isArray(response)) {
        employees = response;
        console.log('✅ EXTRACT: Method 1 - Direct array:', employees.length);
      }
      else if (response.data && Array.isArray(response.data)) {
        employees = response.data;
        console.log('✅ EXTRACT: Method 2 - response.data:', employees.length);
      }
      else if (response.results && Array.isArray(response.results)) {
        employees = response.results;
        console.log('✅ EXTRACT: Method 3 - response.results:', employees.length);
      }
      else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        employees = response.data.results;
        console.log('✅ EXTRACT: Method 4 - response.data.results:', employees.length);
      }
      else if (response.payload && Array.isArray(response.payload)) {
        employees = response.payload;
        console.log('✅ EXTRACT: Method 5 - response.payload:', employees.length);
      }
      else if (response.payload && response.payload.data && Array.isArray(response.payload.data)) {
        employees = response.payload.data;
        console.log('✅ EXTRACT: Method 6 - response.payload.data:', employees.length);
      }
    }
    
    // Log extraction results
    console.log('🎯 EXTRACT: Final extracted count:', employees.length);
    console.log('🎯 EXTRACT: Sample employee:', employees[0]);
    
    if (employees.length === 0) {
      console.warn('⚠️ EXTRACT: No employees extracted from response');
      // Don't fallback to formattedEmployees here as it might be filtered
      return [];
    }
    
    // MINIMAL filtering - only remove invalid entries, don't filter by status/etc
    const validEmployees = employees.filter(emp => {
      if (!emp) return false;
      
      // Must have an ID
      const hasId = emp.id || emp.employee_id;
      if (!hasId) return false;
      
      // Must have some form of name
      const hasName = emp.name || emp.employee_name || emp.first_name || emp.last_name;
      if (!hasName) return false;
      
      return true;
    });
    
    console.log('✅ FILTER: Valid employees after filtering:', validEmployees.length);
    
    // Cache the result
    setAllEmployeesForModal(validEmployees);
    return validEmployees;
    
  } catch (error) {
    console.error('❌ FETCH: Error occurred:', error);
    
    // Only fallback if no cached data exists
    if (!allEmployeesForModal && formattedEmployees && formattedEmployees.length > 0) {
      console.log('🔄 FALLBACK: Using formattedEmployees as fallback:', formattedEmployees.length);
      setAllEmployeesForModal(formattedEmployees);
      return formattedEmployees;
    }
    
    // If everything fails, return empty array
    setAllEmployeesForModal([]);
    throw error; // Re-throw to let the modal handle the error
    
  } finally {
    setFetchingAllEmployees(false);
  }
}, [allEmployeesForModal, fetchEmployees, formattedEmployees]);



  // ========================================
  // ENHANCED: EMPLOYEE ACTION HANDLERS
  // ========================================
  const handleEmployeeAction = useCallback(async (employeeId, action) => {
    const employee = formattedEmployees.find(emp => emp.id === employeeId);
    
    console.log('🔧 ENHANCED: Employee action triggered:', {
      employeeId,
      action,
      employeeName: employee?.name || employee?.employee_name
    });
    
    try {
      switch (action) {
        case "changeManager":
          console.log('👔 ENHANCED: Opening line manager modal...');
          setCurrentModalEmployee(employee);
          setShowLineManagerModal(true);
          
          // ENHANCED: Pre-fetch employees for better UX
          if (!allEmployeesForModal) {
            console.log('🔄 ENHANCED: Pre-fetching employees for line manager modal...');
            fetchAllEmployeesForModal().catch(error => {
              console.warn('⚠️ ENHANCED: Pre-fetch failed, will try again when modal opens:', error);
            });
          }
          break;

        case "manageTag":
          console.log('🏷️ ENHANCED: Opening tag management modal...');
          setCurrentModalEmployee(employee);
          setShowTagModal(true);
          break;

        case "toggleVisibility":
          console.log('👁️ ENHANCED: Toggling org chart visibility...');
          const currentVisibility = employee?.is_visible_in_org_chart !== false;
          const newVisibility = !currentVisibility;
          
          await handleVisibilityChange(employeeId, newVisibility);
          break;

        case "delete":
          console.log('🗑️ ENHANCED: Deleting employee...');
          if (confirm(`Are you sure you want to delete ${employee?.name || 'this employee'}?`)) {
            await deleteEmployee(employeeId);
            await refreshAllData(true);
            alert('✅ Employee deleted successfully');
          }
          break;

        case "viewTeam":
          console.log('👥 ENHANCED: Viewing team...');
          // Navigate to team view or open team modal
          alert(`Team view for ${employee?.name || employeeId} - Feature coming soon!`);
          break;

        case "edit":
          console.log('✏️ ENHANCED: Edit action - handled by navigation');
          // Navigation handled by Link in ActionsDropdown
          break;

        case "viewJobDescription":
          console.log('📋 ENHANCED: Job description view...');
          alert(`Job Description for ${employee?.name || employeeId} - Feature coming soon!`);
          break;

        case "competencyMatrix":
          console.log('📊 ENHANCED: Competency matrix...');
          alert(`Competency Matrix for ${employee?.name || employeeId} - Feature coming soon!`);
          break;

        case "performanceManagement":
          console.log('📈 ENHANCED: Performance management...');
          alert(`Performance Management for ${employee?.name || employeeId} - Feature coming soon!`);
          break;

        default:
          console.warn('❓ ENHANCED: Unknown action:', action);
          alert(`Action "${action}" is not implemented yet`);
      }
    } catch (error) {
      console.error(`❌ ENHANCED: Failed to perform action ${action}:`, error);
      alert(`❌ Failed to ${action}: ${error.message}`);
    }
  }, [
    formattedEmployees, 
    deleteEmployee, 
    refreshAllData, 
    handleVisibilityChange,
    allEmployeesForModal, 
    fetchAllEmployeesForModal
  ]);
const debugEmployeeData = (data) => {
  console.log('🐛 DEBUG: Employee data being passed to modal:', {
    type: typeof data,
    isArray: Array.isArray(data),
    length: data ? data.length : 0,
    sample: data && data.length > 0 ? data[0] : null,
    structure: data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : 'N/A'
  });
  return data;
};
  // ========================================
  // ENHANCED: MODAL HANDLERS
  // ========================================

  const handleLineManagerAssign = useCallback(async (managerId) => {
    try {
      if (!currentModalEmployee) {
        throw new Error('No employee selected for line manager assignment');
      }
      
      console.log('👔 ENHANCED: Assigning line manager:', {
        employeeId: currentModalEmployee.id,
        managerId,
        employeeName: currentModalEmployee.name || currentModalEmployee.employee_name
      });
      
      await bulkAssignLineManager([currentModalEmployee.id], managerId);
      
      // Close modal
      setShowLineManagerModal(false);
      setCurrentModalEmployee(null);
      
      // Refresh data
      await refreshAllData();
      
      // Get manager name for success message
      const manager = allEmployeesForModal?.find(emp => emp.id === managerId);
      const managerName = manager?.name || manager?.employee_name || 'Selected manager';
      
      alert(`✅ ${managerName} assigned as line manager successfully!`);
      
    } catch (error) {
      console.error('❌ ENHANCED: Line manager assignment failed:', error);
      alert(`❌ Failed to assign line manager: ${error.message}`);
    }
  }, [currentModalEmployee, bulkAssignLineManager, refreshAllData, allEmployeesForModal]);

  const handleTagOperation = useCallback(async (operation, tagId) => {
    try {
      if (!currentModalEmployee) {
        throw new Error('No employee selected for tag operation');
      }
      
      console.log('🏷️ ENHANCED: Tag operation:', {
        operation,
        tagId,
        employeeId: currentModalEmployee.id,
        employeeName: currentModalEmployee.name || currentModalEmployee.employee_name
      });
      
      if (operation === 'add') {
        await bulkAddTags([currentModalEmployee.id], tagId);
      } else if (operation === 'remove') {
        await bulkRemoveTags([currentModalEmployee.id], tagId);
      } else {
        throw new Error(`Unknown tag operation: ${operation}`);
      }
      
      // Close modal
      setShowTagModal(false);
      setCurrentModalEmployee(null);
      
      // Refresh data
      await refreshAllData();
      
      // Get tag name for success message
      const tag = employeeTags?.find(tag => tag.id === tagId);
      const tagName = tag?.name || 'Tag';
      const actionText = operation === 'add' ? 'added to' : 'removed from';
      
      alert(`✅ "${tagName}" tag ${actionText} employee successfully!`);
      
    } catch (error) {
      console.error(`❌ ENHANCED: Tag ${operation} failed:`, error);
      alert(`❌ Failed to ${operation} tag: ${error.message}`);
    }
  }, [currentModalEmployee, bulkAddTags, bulkRemoveTags, refreshAllData, employeeTags]);

  // ========================================
  // ENHANCED: MODAL CLOSE HANDLERS
  // ========================================

  const handleLineManagerModalClose = useCallback(() => {
    console.log('🔒 ENHANCED: Closing line manager modal');
    setShowLineManagerModal(false);
    setCurrentModalEmployee(null);
  }, []);

  const handleTagModalClose = useCallback(() => {
    console.log('🔒 ENHANCED: Closing tag modal');
    setShowTagModal(false);
    setCurrentModalEmployee(null);
  }, []);



  // ========================================
  // ACTIVE FILTERS CALCULATION
  // ========================================
  
  const activeFilters = useMemo(() => {
    const filters = [];
    
    if (localFilters.search) {
      filters.push({ key: "search", label: `Search: ${localFilters.search}` });
    }
    if (localFilters.employee_search?.length > 0) {
      filters.push({ 
        key: "employee_search", 
        label: localFilters.employee_search.length === 1 
          ? `Employee: 1 selected` 
          : `Employees: ${localFilters.employee_search.length} selected`
      });
    }
    if (localFilters.status?.length > 0) {
      filters.push({ 
        key: "status", 
        label: localFilters.status.length === 1 
          ? `Status: ${localFilters.status[0]}` 
          : `Status: ${localFilters.status.length} selected`
      });
    }
    if (localFilters.department?.length > 0) {
      filters.push({ 
        key: "department", 
        label: localFilters.department.length === 1 
          ? `Department: ${localFilters.department[0]}` 
          : `Department: ${localFilters.department.length} selected`
      });
    }
    if (localFilters.business_function?.length > 0) {
      filters.push({ 
        key: "business_function", 
        label: `Business Function: ${localFilters.business_function.length} selected`
      });
    }
    if (localFilters.position_group?.length > 0) {
      filters.push({ 
        key: "position_group", 
        label: `Position Group: ${localFilters.position_group.length} selected`
      });
    }
    if (localFilters.tags?.length > 0) {
      filters.push({ 
        key: "tags", 
        label: `Tags: ${localFilters.tags.length} selected`
      });
    }
    if (localFilters.grading_level?.length > 0) {
      filters.push({ 
        key: "grading_level", 
        label: `Grades: ${localFilters.grading_level.length} selected`
      });
    }
    if (localFilters.line_manager?.length > 0) {
      filters.push({ 
        key: "line_manager", 
        label: `Line Manager: ${localFilters.line_manager.length} selected`
      });
    }
    if (localFilters.contract_duration?.length > 0) {
      filters.push({ 
        key: "contract_duration", 
        label: `Contract: ${localFilters.contract_duration.length} selected`
      });
    }
    if (localFilters.gender?.length > 0) {
      filters.push({ 
        key: "gender", 
        label: `Gender: ${localFilters.gender.length} selected`
      });
    }
    if (localFilters.line_manager_search) {
      filters.push({ 
        key: "line_manager_search", 
        label: `Manager Search: ${localFilters.line_manager_search}`
      });
    }
    if (localFilters.job_title_search) {
      filters.push({ 
        key: "job_title_search", 
        label: `Job Title: ${localFilters.job_title_search}`
      });
    }
    if (localFilters.start_date_from || localFilters.start_date_to) {
      filters.push({ 
        key: "start_date", 
        label: "Start Date Range"
      });
    }
    if (localFilters.contract_end_date_from || localFilters.contract_end_date_to) {
      filters.push({ 
        key: "contract_end_date", 
        label: "Contract End Date Range"
      });
    }
    if (localFilters.years_of_service_min || localFilters.years_of_service_max) {
      filters.push({ 
        key: "years_of_service", 
        label: "Years of Service Range"
      });
    }
    if (localFilters.is_active && localFilters.is_active !== "") {
      filters.push({ 
        key: "is_active", 
        label: `Active: ${localFilters.is_active === "true" ? "Yes" : "No"}`
      });
    }
    if (localFilters.is_visible_in_org_chart && localFilters.is_visible_in_org_chart !== "") {
      filters.push({ 
        key: "is_visible_in_org_chart", 
        label: `Org Chart: ${localFilters.is_visible_in_org_chart === "true" ? "Visible" : "Hidden"}`
      });
    }
    if (localFilters.status_needs_update && localFilters.status_needs_update !== "") {
      filters.push({ 
        key: "status_needs_update", 
        label: `Status Update: ${localFilters.status_needs_update === "true" ? "Needed" : "Not Needed"}`
      });
    }
    if (localFilters.contract_expiring_days) {
      filters.push({ 
        key: "contract_expiring_days", 
        label: `Contract expiring in ${localFilters.contract_expiring_days} days`
      });
    }
    
    return filters;
  }, [localFilters]);

  // ========================================
  // CLEANUP ON UNMOUNT
  // ========================================
  
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // ========================================
  // ERROR HANDLING
  // ========================================

const headerProps = useMemo(() => ({
  // Existing props
  onToggleAdvancedFilter: () => setIsAdvancedFilterOpen(!isAdvancedFilterOpen),
  onToggleActionMenu: handleToggleActionMenu,
  isActionMenuOpen,
  selectedEmployees,
  onBulkImportComplete: handleBulkImportComplete,
  statistics,
  onBulkImport: () => setIsBulkUploadOpen(true),
  darkMode,
  
  // Advanced Sorting props
  onToggleAdvancedSorting: handleToggleAdvancedSorting,
  isAdvancedSortingOpen,
  currentSorting: sorting || [],
  onClearAllSorting: handleClearAllSorting,
  
  // ENHANCED: Export props
  onQuickExport: handleQuickExport,
  onToggleExportModal: handleToggleExportModal,
  isExporting: loading.exporting || false,
  hasActiveFilters: activeFilters.length > 0,
  filteredCount: formattedEmployees.length,
  totalEmployees: statistics.total_employees || 0
}), [
  isAdvancedFilterOpen,
  handleToggleActionMenu,
  isActionMenuOpen,
  selectedEmployees,
  handleBulkImportComplete,
  statistics,
  darkMode,
  handleToggleAdvancedSorting,
  isAdvancedSortingOpen,
  sorting,
  handleClearAllSorting,
  handleQuickExport,
  handleToggleExportModal,
  loading.exporting,
  activeFilters.length,
  formattedEmployees.length
]);

  if (error?.employees) {
    return (
      <div className="container mx-auto pt-3 max-w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-600 dark:text-red-400">
            <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
            <p className="text-sm mb-4">
              {error?.employees?.message || 'Failed to load employee data'}
            </p>
            <button 
              onClick={() => {
                initialized.current = false;
                lastApiParamsRef.current = null;
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
          onToggleAdvancedFilter={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
          onToggleActionMenu={handleToggleActionMenu}
          isActionMenuOpen={isActionMenuOpen}
          selectedEmployees={selectedEmployees}
          onBulkImportComplete={handleBulkImportComplete}
          onBulkImport={() => setIsBulkUploadOpen(true)}
          statistics={statistics}
          darkMode={darkMode}
          
          // NEW: Advanced Sorting Props
          onToggleAdvancedSorting={handleToggleAdvancedSorting}
          isAdvancedSortingOpen={isAdvancedSortingOpen}
          currentSorting={sorting || []}
          onClearAllSorting={handleClearAllSorting}



          {...headerProps}
       
         
        />

        {/* Action Menu */}
        {isActionMenuOpen && (
          <div className="absolute right-6 top-20 z-50">
            <ActionMenu 
              isOpen={isActionMenuOpen}
              onClose={handleActionMenuClose}
              onAction={handleBulkAction}
              selectedCount={selectedEmployees.length}
              selectedEmployees={selectedEmployees}
              selectedEmployeeData={formattedEmployees.filter(emp => selectedEmployees.includes(emp.id))}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>

      {/* NEW: Advanced Multiple Sorting Panel */}
      {isAdvancedSortingOpen && (
        <div className="mb-4 relative z-40">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
            <AdvancedMultipleSortingSystem
              currentSorting={sorting || []}
              onSortingChange={handleSortingChange}
              availableFields={availableFieldsForSorting}
              darkMode={darkMode}
              maxSortLevels={10}


           
          
            />
 
            {/* Close button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsAdvancedSortingOpen(false)}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close Advanced Sorting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {isAdvancedFilterOpen && (
        <AdvancedFilterPanel
          onApply={handleApplyAdvancedFilters}
          onClose={() => setIsAdvancedFilterOpen(false)}
          initialFilters={localFilters}
        />
      )}

      {/* Search and Quick Filters */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-3 mb-3 mt-3">
        <SearchBar
          searchTerm={localFilters.search}
          onSearchChange={handleSearchChange}
          placeholder="Search by name, email, employee ID, or job title..."
        />
        
        <div className="flex-shrink-0">
          <QuickFilterBar
            onStatusChange={handleStatusChange}
            onDepartmentChange={handleDepartmentChange}
            onBusinessFunctionChange={handleBusinessFunctionChange}
            onPositionGroupChange={handlePositionGroupChange}
            statusFilter={localFilters.status}
            departmentFilter={localFilters.department}
            businessFunctionFilter={localFilters.business_function}
            positionGroupFilter={localFilters.position_group}
            activeFilters={activeFilters}
            onClearFilter={handleClearFilter}
            onClearAllFilters={handleClearAllFilters}
            statistics={statistics}
            showCounts={true}
          />
        </div>
      </div>

      {/* Color Selector and Legend */}
      <div className="flex justify-between items-center mb-3">
        <ColorSelector />
        <HierarchyLegend />
      </div>

      {/* Filter Summary */}
      {activeFilters.length > 0 && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-2">
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
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleAdvancedSorting}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Configure
              </button>
              <button
                onClick={handleClearAllSorting}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading.employees && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-sm text-blue-800 dark:text-blue-300">
              Loading employees...
            </span>
          </div>
        </div>
      )}

      

      {/* Employee Table */}
      <EmployeeTable
        employees={formattedEmployees}
        loading={loading.employees}
        selectedEmployees={selectedEmployees}
        selectAll={selectedEmployees.length === formattedEmployees.length && formattedEmployees.length > 0}
        onToggleSelectAll={handleSelectAll}
        onToggleEmployeeSelection={handleEmployeeToggle}
        onSort={handleSort}
        getSortDirection={getSortDirection}
        isSorted={isSorted}
        getSortIndex={getSortIndex}
        hasFilters={activeFilters.length > 0}
        onClearFilters={handleClearAllFilters}
        employeeVisibility={employeeVisibility}
        onVisibilityChange={handleVisibilityChange}
        onEmployeeAction={handleEmployeeAction}
        darkMode={darkMode}
      />


      {/* Pagination */}
      <div className="mt-6">
  <Pagination
    currentPage={pagination.page || pagination.currentPage}
    totalPages={pagination.totalPages}
    totalItems={pagination.count || pagination.totalItems}
    pageSize={pagination.pageSize}
    onPageChange={setCurrentPage}
    onPageSizeChange={setPageSize}
    loading={loading.employees}
    darkMode={darkMode}
    
    // YENİ: Enhanced features
    showQuickJump={true}
    showPageSizeSelector={true}
    showItemsInfo={true}
    showFirstLast={true}
    compactMode={false}
    allowCustomPageSize={true}
    maxDisplayPages={7}
    pageSizeOptions={[10, 25, 50, 100, 250, 500]}
  />
</div>


      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        totalEmployees={statistics.total_employees}
        filteredCount={formattedEmployees.length}
        selectedEmployees={selectedEmployees}
        darkMode={darkMode}
      />


      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <BulkUploadForm
          onClose={() => setIsBulkUploadOpen(false)}
          onImportComplete={handleBulkImportComplete}
          darkMode={darkMode}
        />
      )}

      {showLineManagerModal && currentModalEmployee && (
  <LineManagerModal
    isOpen={showLineManagerModal}
    onClose={handleLineManagerModalClose}
    employee={currentModalEmployee}
    onAssign={handleLineManagerAssign}
    loading={loading.bulkAssignLineManager}
    darkMode={darkMode}
    
    // Enhanced data passing with debugging
    onFetchAllEmployees={fetchAllEmployeesForModal}
    allEmployeesData={debugEmployeeData(allEmployeesForModal)} // Debug wrapper
    fetchingEmployees={fetchingAllEmployees}
  />
)}

      {/* ENHANCED: Tag Management Modal */}
      {showTagModal && currentModalEmployee && (
        <TagManagementModal
          isOpen={showTagModal}
    onClose={handleTagModalClose}
    employee={currentModalEmployee}
    
    // FIXED: Ensure employeeTags is properly passed
    availableTags={employeeTags || []}  // Make sure this is not empty
    
    onTagOperation={handleTagOperation}
    loading={{
      add: loading.bulkAddTags,
      remove: loading.bulkRemoveTags
    }}
    darkMode={darkMode}
          
          
        />
      )}

    </div>
  );
};

export default HeadcountTable;