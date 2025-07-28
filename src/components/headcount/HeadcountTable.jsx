// src/components/headcount/HeadcountTable.jsx - COMPLETELY FIXED: Employee search and multi-select filters
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
  
  // COMPLETELY FIXED: Local filter state to manage UI
  const [localFilters, setLocalFilters] = useState({
    search: "",
    employee_search: [], // FIXED: Array for multiple employee selection
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
  const lastApiParamsRef = useRef(null); // Track last API params

  // ========================================
  // COMPLETELY FIXED: buildApiParams with proper array handling
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

    // Multiple Sorting - Enhanced support
    if (sorting && sorting.length > 0) {
      const orderingFields = sorting.map(sort => 
        sort.direction === 'desc' ? `-${sort.field}` : sort.field
      );
      params.ordering = orderingFields.join(',');
    }

    // COMPLETELY FIXED: Multi-select Filters - Send as arrays, backend will handle parsing
    const multiSelectFilters = [
      'business_function', 'department', 'unit', 'job_function', 'position_group',
      'status', 'grading_level', 'contract_duration', 'line_manager', 'tags', 'gender', 'employee_search'
    ];

    multiSelectFilters.forEach(filterKey => {
      if (localFilters[filterKey]) {
        if (Array.isArray(localFilters[filterKey])) {
          // Send as array if it has values
          const cleanValues = localFilters[filterKey].filter(val => 
            val !== null && val !== undefined && val !== ''
          );
          if (cleanValues.length > 0) {
            // IMPORTANT: Send as comma-separated string for Django backend
            params[filterKey] = cleanValues.join(',');
            console.log(`✅ HEADCOUNT: ${filterKey} = "${params[filterKey]}" (from array of ${cleanValues.length} items)`);
          }
        } else if (typeof localFilters[filterKey] === 'string') {
          // Single string value
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
  // DEBOUNCED DATA FETCHING (IMPROVED)
  // ========================================
  
  const debouncedFetchEmployees = useCallback((params, immediate = false) => {
    // Prevent duplicate calls with same params
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
      if (now - lastFetchTime.current > 100) { // Prevent duplicate calls
        console.log('🚀 Fetching employees with params:', params);
        lastFetchTime.current = now;
        lastApiParamsRef.current = { ...params }; // Store last params
        fetchEmployees(params);
      }
    }, delay);
  }, [fetchEmployees]);

  // ========================================
  // INITIALIZATION (IMPROVED)
  // ========================================
  
  useEffect(() => {
    const initializeData = async () => {
      if (initialized.current) return;
      
      try {
        initialized.current = true;
        console.log('🚀 Initializing HeadcountTable...');
        
        // Clear any existing errors
        clearErrors();
        
        // Store initial params
        lastApiParamsRef.current = { ...buildApiParams };
        
        // Fetch initial data
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
  }, []); // Remove buildApiParams from dependency array

  // ========================================
  // DATA FETCHING ON PARAM CHANGES (IMPROVED)
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
  // DATA REFRESH HELPER (IMPROVED)
  // ========================================
  
  const refreshAllData = useCallback(async (forceRefresh = false) => {
    console.log('🔄 Refreshing all data...', { forceRefresh });
    try {
      if (forceRefresh) {
        lastApiParamsRef.current = null; // Force params change
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
  // FILTER HANDLERS (COMPLETELY FIXED)
  // ========================================

  // Search handler with debounced application
  const handleSearchChange = useCallback((value) => {
    console.log('🔍 HEADCOUNT: Search changed:', value);
    setLocalFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, [setCurrentPage]);

  // COMPLETELY FIXED: Quick filter handlers with proper array handling
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
    
    // Process and ensure arrays are properly handled
    const processedFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        processedFilters[key] = value;
      } else if (typeof value === 'string' && value.includes(',')) {
        // Handle comma-separated strings by converting to arrays
        processedFilters[key] = value.split(',').map(v => v.trim()).filter(v => v);
      } else {
        processedFilters[key] = value;
      }
    });
    
    console.log('✅ HEADCOUNT: Processed advanced filters:', processedFilters);
    
    // Update local filters
    setLocalFilters(prev => ({ ...prev, ...processedFilters }));
    // DON'T close panel automatically - user controls when to close
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Clear individual filter
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

  // Clear all filters
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

  // ========================================
  // SORTING HANDLERS
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
              await refreshAllData(true); // Force refresh
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
            await refreshAllData(true); // Force refresh
            alert(`✅ ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} restored successfully!`);
          } catch (error) {
            console.error('❌ Restore failed:', error);
            alert('❌ Restore failed: ' + error.message);
          }
          break;

        case "showInOrgChart":
          try {
            result = await showInOrgChart(selectedEmployees);
            clearSelection();
            await refreshAllData(true); // Force refresh
            alert(`✅ ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''} now visible in org chart!`);
          } catch (error) {
            console.error('❌ Show in org chart failed:', error);
            alert('❌ Show in org chart failed: ' + error.message);
          }
          break;

        case "hideFromOrgChart":
          try {
            result = await hideFromOrgChart(selectedEmployees);
            clearSelection();
            await refreshAllData(true); // Force refresh
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
            await refreshAllData(true); // Force refresh
            
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
            await refreshAllData(true); // Force refresh
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
            await refreshAllData(true); // Force refresh
            
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
            await refreshAllData(true); // Force refresh
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
  
  const handleExport = useCallback(async (exportOptions) => {
    try {
      const exportParams = {
        format: exportOptions.format || 'excel',
        includeFields: exportOptions.includeFields
      };

      if (exportOptions.type === 'selected' && selectedEmployees.length > 0) {
        exportParams.employee_ids = selectedEmployees;
      } else if (exportOptions.type === 'filtered') {
        // Include current filter parameters
        Object.keys(buildApiParams).forEach(key => {
          if (key !== 'page' && key !== 'page_size') {
            exportParams[key] = buildApiParams[key];
          }
        });
      }

      console.log('📤 Export params:', exportParams);
      const result = await exportEmployees(exportParams);
      
      console.log('✅ Export completed successfully:', result);
      alert('✅ Export completed successfully!');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExportModalOpen(false);
    }
  }, [buildApiParams, selectedEmployees, exportEmployees]);

  // ========================================
  // BULK UPLOAD FUNCTIONALITY
  // ========================================
  
  const handleBulkImportComplete = useCallback(async (result) => {
    try {
      await refreshAllData(true); // Force refresh
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

  // ========================================
  // EMPLOYEE ACTION HANDLERS
  // ========================================
  
  const handleEmployeeAction = useCallback(async (employeeId, action) => {
    try {
      switch (action) {
        case "delete":
          if (confirm("Are you sure you want to delete this employee?")) {
            await deleteEmployee(employeeId);
            await refreshAllData(true); // Force refresh
            alert('✅ Employee deleted successfully');
          }
          break;

        case "edit":
          // Navigate to edit page or open edit modal
          console.log(`Edit employee: ${employeeId}`);
          // You can implement navigation logic here
          break;

        case "view":
          // Navigate to employee detail page
          console.log(`View employee: ${employeeId}`);
          // You can implement navigation logic here
          break;

        default:
          console.log(`Employee action: ${action} for employee: ${employeeId}`);
          alert(`Action "${action}" clicked for employee ${employeeId}`);
      }
    } catch (error) {
      console.error(`Failed to perform action ${action}:`, error);
      alert(`❌ Failed to ${action}: ${error.message}`);
    }
  }, [deleteEmployee, refreshAllData]);

  // ========================================
  // ACTIVE FILTERS CALCULATION (MEMOIZED)
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
          : `Department: ${localFilters.status.length} selected`
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
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Active Filters ({activeFilters.length}):
              </span>
              {activeFilters.map((filter) => (
                <span 
                  key={filter.key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                >
                  {filter.label}
                  <button
                    onClick={() => handleClearFilter(filter.key)}
                    className="ml-1 text-blue-600 dark:text-blue-300 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Multi-level Sorting Info */}
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
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={clearSorting}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              Clear All
            </button>
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

      {/* Debug Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <details>
            <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              🔧 Debug Info (Development Only)
            </summary>
            <div className="mt-2 space-y-2 text-xs">
              <div>
                <strong>Local Filters:</strong>
                <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
                  {JSON.stringify(localFilters, null, 2)}
                </pre>
              </div>
              <div>
                <strong>API Params:</strong>
                <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
                  {JSON.stringify(buildApiParams, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Active Filters Count:</strong> {activeFilters.length}
              </div>
              <div>
                <strong>Employees Count:</strong> {formattedEmployees?.length || 0}
              </div>
              <div>
                <strong>Selected Employees:</strong> {selectedEmployees?.length || 0}
              </div>
              <div>
                <strong>Loading States:</strong>
                <ul className="ml-4 mt-1">
                  <li>Employees: {loading?.employees ? 'Loading...' : 'Ready'}</li>
                  <li>Statistics: {loading?.statistics ? 'Loading...' : 'Ready'}</li>
                  <li>Reference Data: {refLoading ? 'Loading...' : 'Ready'}</li>
                </ul>
              </div>
              <div>
                <strong>Error States:</strong>
                {error && Object.keys(error).length > 0 ? (
                  <pre className="mt-1 text-xs bg-red-100 dark:bg-red-900 p-2 rounded overflow-auto">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                ) : (
                  <span className="text-green-600 dark:text-green-400 ml-2">No errors</span>
                )}
              </div>
            </div>
          </details>
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
        onSort={(field, event) => handleSort(field, event?.ctrlKey)}
        getSortDirection={getSortDirection}
        isSorted={isSorted}
        getSortIndex={getSortIndex}
        hasFilters={activeFilters.length > 0}
        onClearFilters={handleClearAllFilters}
        employeeVisibility={employeeVisibility}
        onVisibilityChange={(id, visible) => 
          setEmployeeVisibility(prev => ({ ...prev, [id]: visible }))
        }
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
    </div>
  );
};

export default HeadcountTable;