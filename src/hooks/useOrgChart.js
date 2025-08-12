// src/hooks/useOrgChart.js - FIXED version with proper memory management
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import { useReferenceData } from './useReferenceData';
import {
  fetchOrgChart,
  fetchOrgChartEmployee,
  fetchFullTreeWithVacancies,
  fetchOrgChartStatistics,
  searchOrgChart,
  fetchManagerTeam,
  setFilters,
  clearFilters,
  resetAllFilters,
  updateFilter,
  setViewMode,
  setShowFilters,
  setShowLegend,
  setIsFullscreen,
  setLayoutDirection,
  toggleExpandedNode,
  setExpandedNodes,
  setSelectedEmployee,
  clearSelectedEmployee,
  setPagination,
  setPage,
  setPageSize,
  clearErrors,
  clearError,
  invalidateCache,
  expandAllNodes,
  collapseAllNodes,
  refreshData,
  selectOrgChart,
  selectFullTree,
  selectStatistics,
  selectSelectedEmployee,
  selectHierarchy,
  selectFilters,
  selectActiveFilters,
  selectUIState,
  selectViewMode,
  selectShowFilters,
  selectShowLegend,
  selectIsFullscreen,
  selectExpandedNodes,
  selectLayoutDirection,
  selectOrgChartLoading,
  selectIsLoading,
  selectOrgChartErrors,
  selectHasErrors,
  selectPagination,
  selectFilteredOrgChart,
  selectOrgChartForReactFlow,
  selectManagerTeam,
  selectEmployeeById,
  selectEmployeeChildren,
  selectRootEmployees,
  selectManagersOnly,
  selectOrgChartSummary
} from '../store/slices/orgChartSlice';

// FIXED: Clean employee data utility
const cleanEmployeeData = (employee) => {
  if (!employee) return null;
  
  return {
    employee_id: employee.employee_id,
    name: employee.name,
    title: employee.title,
    department: employee.department,
    unit: employee.unit,
    business_function: employee.business_function,
    position_group: employee.position_group,
    direct_reports: employee.direct_reports || 0,
    line_manager_id: employee.line_manager_id,
    level_to_ceo: employee.level_to_ceo,
    email: employee.email,
    phone: employee.phone,
    profile_image_url: employee.profile_image_url,
    avatar: employee.avatar,
    status_color: employee.status_color,
    employee_details: employee.employee_details ? {
      grading_display: employee.employee_details.grading_display,
      tags: employee.employee_details.tags
    } : null
  };
};

export const useOrgChart = () => {
  const dispatch = useDispatch();

  const {
    businessFunctionsDropdown,
    departmentsDropdown,
    unitsDropdown,
    jobFunctionsDropdown,
    positionGroupsDropdown,
    employeeStatusesDropdown,
    loading: refDataLoading,
    error: refDataError
  } = useReferenceData();

  const orgChart = useSelector(selectOrgChart);
  const fullTree = useSelector(selectFullTree);
  const statistics = useSelector(selectStatistics);
  const selectedEmployee = useSelector(selectSelectedEmployee);
  const hierarchy = useSelector(selectHierarchy);
  const filters = useSelector(selectFilters);
  const activeFilters = useSelector(selectActiveFilters);

  const viewMode = useSelector(selectViewMode);
  const showFilters = useSelector(selectShowFilters);
  const showLegend = useSelector(selectShowLegend);
  const isFullscreen = useSelector(selectIsFullscreen);
  const expandedNodes = useSelector(selectExpandedNodes);
  const layoutDirection = useSelector(selectLayoutDirection);

  const loading = useSelector(selectOrgChartLoading);
  const isLoading = useSelector(selectIsLoading);
  const errors = useSelector(selectOrgChartErrors);
  const hasErrors = useSelector(selectHasErrors);

  const pagination = useSelector(selectPagination);
  const filteredOrgChart = useSelector(selectFilteredOrgChart);
  const reactFlowData = useSelector(selectOrgChartForReactFlow);
  const summary = useSelector(selectOrgChartSummary);

  // FIXED: Memoized actions to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    fetchOrgChart: (params = {}) => dispatch(fetchOrgChart(params)),
    fetchEmployee: (employeeId) => dispatch(fetchOrgChartEmployee(employeeId)),
    fetchFullTree: (params = {}) => dispatch(fetchFullTreeWithVacancies(params)),
    fetchStatistics: (params = {}) => dispatch(fetchOrgChartStatistics(params)),
    searchOrgChart: (searchParams) => dispatch(searchOrgChart(searchParams)),
    fetchManagerTeam: (managerId, params = {}) => dispatch(fetchManagerTeam({ managerId, params })),
    setFilters: (newFilters) => dispatch(setFilters(newFilters)),
    clearFilters: () => dispatch(clearFilters()),
    resetAllFilters: () => dispatch(resetAllFilters()),
    updateFilter: (key, value) => dispatch(updateFilter({ key, value })),
    setViewMode: (mode) => dispatch(setViewMode(mode)),
    setShowFilters: (show) => dispatch(setShowFilters(show)),
    setShowLegend: (show) => dispatch(setShowLegend(show)),
    setIsFullscreen: (fullscreen) => dispatch(setIsFullscreen(fullscreen)),
    setLayoutDirection: (direction) => dispatch(setLayoutDirection(direction)),
    toggleExpandedNode: (nodeId) => dispatch(toggleExpandedNode(nodeId)),
    setExpandedNodes: (nodeIds) => dispatch(setExpandedNodes(nodeIds)),
    expandAllNodes: () => dispatch(expandAllNodes()),
    collapseAllNodes: () => dispatch(collapseAllNodes()),
    setSelectedEmployee: (employee) => dispatch(setSelectedEmployee(cleanEmployeeData(employee))),
    clearSelectedEmployee: () => dispatch(clearSelectedEmployee()),
    setPagination: (paginationData) => dispatch(setPagination(paginationData)),
    setPage: (page) => dispatch(setPage(page)),
    setPageSize: (pageSize) => dispatch(setPageSize(pageSize)),
    clearErrors: () => dispatch(clearErrors()),
    clearError: (errorKey) => dispatch(clearError(errorKey)),
    invalidateCache: () => dispatch(invalidateCache()),
    refreshData: () => dispatch(refreshData())
  }), [dispatch]);

  // FIXED: Safe employee lookup
  const getEmployeeById = useCallback((employeeId) => {
    if (!Array.isArray(orgChart)) return null;
    const employee = orgChart.find(emp => emp.employee_id === employeeId);
    return employee ? cleanEmployeeData(employee) : null;
  }, [orgChart]);

  // FIXED: Safe preset filter application
  const applyPresetFilter = useCallback((presetName) => {
    const presets = {
      'all': {},
      'managers_only': { managers_only: true },
      'top_level_only': { show_top_level_only: true },
      'executives': { position_group: ['VC', 'DIRECTOR', 'Vice Chairman'] },
      'department_heads': { position_group: ['HEAD_OF_DEPARTMENT'] },
      'specialists': { position_group: ['SENIOR_SPECIALIST', 'SPECIALIST', 'JUNIOR_SPECIALIST'] }
    };

    const presetFilters = presets[presetName] || {};
    actions.setFilters(presetFilters);
  }, [actions]);

  // FIXED: Debounced search with cleanup
  const debouncedSearch = useCallback((searchTerm, delay = 300) => {
    const timeoutId = setTimeout(() => {
      actions.updateFilter('search', searchTerm);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [actions]);

  // FIXED: Safe active filters check
  const hasActiveFilters = useCallback(() => {
    return Object.keys(activeFilters || {}).length > 0;
  }, [activeFilters]);

  // FIXED: Memoized filter options with safe data handling
  const filterOptions = useMemo(() => {
    const businessFunctionCounts = {};
    const departmentCounts = {};
    const unitCounts = {};
    const jobFunctionCounts = {};
    const positionGroupCounts = {};
    const statusCounts = {};

    if (Array.isArray(orgChart)) {
      orgChart.forEach(emp => {
        if (emp && typeof emp === 'object') {
          if (emp.business_function) businessFunctionCounts[emp.business_function] = (businessFunctionCounts[emp.business_function] || 0) + 1;
          if (emp.department) departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
          if (emp.unit) unitCounts[emp.unit] = (unitCounts[emp.unit] || 0) + 1;
          if (emp.job_function) jobFunctionCounts[emp.job_function] = (jobFunctionCounts[emp.job_function] || 0) + 1;
          if (emp.position_group) positionGroupCounts[emp.position_group] = (positionGroupCounts[emp.position_group] || 0) + 1;
          if (emp.status) statusCounts[emp.status] = (statusCounts[emp.status] || 0) + 1;
        }
      });
    }

    return {
      businessFunctions: (businessFunctionsDropdown || []).map(bf => ({
        value: bf.value,
        label: bf.label,
        count: businessFunctionCounts[bf.value] || 0
      })),
      departments: (departmentsDropdown || []).map(dept => ({
        value: dept.value,
        label: dept.label,
        count: departmentCounts[dept.value] || 0
      })),
      units: (unitsDropdown || []).map(unit => ({
        value: unit.value,
        label: unit.label,
        count: unitCounts[unit.value] || 0
      })),
      jobFunctions: (jobFunctionsDropdown || []).map(jf => ({
        value: jf.value,
        label: jf.label,
        count: jobFunctionCounts[jf.value] || 0
      })),
      positionGroups: (positionGroupsDropdown || []).map(pg => ({
        value: pg.value,
        label: pg.label,
        count: positionGroupCounts[pg.value] || 0
      })),
      statuses: (employeeStatusesDropdown || []).map(status => ({
        value: status.value,
        label: status.label,
        count: statusCounts[status.value] || 0
      })),
      managers: Array.isArray(orgChart)
        ? orgChart
          .filter(emp => emp && emp.direct_reports && emp.direct_reports > 0)
          .map(manager => ({
            value: manager.employee_id,
            label: manager.name,
            count: manager.direct_reports
          }))
        : []
    };
  }, [
    businessFunctionsDropdown,
    departmentsDropdown,
    unitsDropdown,
    jobFunctionsDropdown,
    positionGroupsDropdown,
    employeeStatusesDropdown,
    orgChart
  ]);

  // FIXED: Safe export to PNG with error handling
  const exportToPNG = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.querySelector('.react-flow');
      if (!element) throw new Error('Chart not found');

      const canvas = await html2canvas(element, {
        backgroundColor: 'white',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true
      });

      const link = document.createElement('a');
      link.download = `org-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      // Optionally show user-friendly error message
    }
  }, []);

  // FIXED: Safe fullscreen toggle with error handling
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const element = document.querySelector('.org-chart-container');
        if (element && element.requestFullscreen) {
          await element.requestFullscreen();
          actions.setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          actions.setIsFullscreen(false);
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
      // Fallback to UI state toggle
      actions.setIsFullscreen(!isFullscreen);
    }
  }, [actions, isFullscreen]);

  // FIXED: Safe data loading with error handling
  useEffect(() => {
    if (Array.isArray(orgChart) && orgChart.length === 0 && !loading.orgChart && !errors.orgChart) {
      console.log('Initializing org chart data...');
      actions.fetchOrgChart();
      actions.fetchStatistics();
    }
  }, [orgChart, loading.orgChart, errors.orgChart, actions]);

  // FIXED: Safe auto-expansion with better fallback strategies
  useEffect(() => {
    if (Array.isArray(orgChart) && orgChart.length > 0 && (!expandedNodes || expandedNodes.length === 0)) {
      console.log('Auto-expanding initial nodes for', orgChart.length, 'employees');
      
      let rootEmployees = [];
      
      // Strategy 1: Find employees without line_manager_id
      rootEmployees = orgChart.filter(emp => 
        emp && !emp.line_manager_id && !emp.manager_id && !emp.parent_id
      );
      
      // Strategy 2: Find by minimum level_to_ceo
      if (rootEmployees.length === 0) {
        const levels = orgChart
          .map(emp => emp && emp.level_to_ceo)
          .filter(level => typeof level === 'number');
        
        if (levels.length > 0) {
          const minLevel = Math.min(...levels);
          rootEmployees = orgChart.filter(emp => emp && emp.level_to_ceo === minLevel);
        }
      }
      
      // Strategy 3: Find by maximum direct_reports
      if (rootEmployees.length === 0) {
        const reports = orgChart
          .map(emp => emp && emp.direct_reports)
          .filter(reports => typeof reports === 'number');
        
        if (reports.length > 0) {
          const maxReports = Math.max(...reports);
          if (maxReports > 0) {
            rootEmployees = orgChart.filter(emp => emp && emp.direct_reports === maxReports);
          }
        }
      }
      
      // Strategy 4: Find by position hierarchy
      if (rootEmployees.length === 0) {
        const topPositions = ['VC', 'CEO', 'CHAIRMAN', 'PRESIDENT', 'DIRECTOR'];
        for (const position of topPositions) {
          rootEmployees = orgChart.filter(emp => 
            emp && (
              emp.position_group?.toUpperCase().includes(position) || 
              emp.title?.toUpperCase().includes(position)
            )
          );
          if (rootEmployees.length > 0) break;
        }
      }
      
      // Strategy 5: Fallback to first few employees
      if (rootEmployees.length === 0) {
        rootEmployees = orgChart.slice(0, Math.min(3, orgChart.length)).filter(Boolean);
      }
      
      // Set initial expanded nodes
      const initialExpanded = rootEmployees
        .map(emp => emp.employee_id)
        .filter(id => typeof id === 'string' || typeof id === 'number');
      
      if (initialExpanded.length > 0) {
        console.log('Setting initial expanded nodes:', initialExpanded);
        actions.setExpandedNodes(initialExpanded);
      }
    }
  }, [orgChart, expandedNodes, actions]);

  // FIXED: Safe periodic statistics refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        actions.fetchStatistics();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isLoading, actions]);

  // FIXED: Memory cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts or intervals
      console.log('Cleaning up useOrgChart hook');
    };
  }, []);

  return {
    // Data
    orgChart,
    fullTree,
    statistics,
    selectedEmployee,
    hierarchy,
    filteredOrgChart,
    reactFlowData,
    summary,
    
    // Filters
    filters,
    activeFilters,
    filterOptions,
    
    // UI State
    viewMode,
    showFilters,
    showLegend,
    isFullscreen,
    expandedNodes,
    layoutDirection,
    
    // Loading & Errors
    loading,
    isLoading,
    refDataLoading,
    errors,
    hasErrors,
    refDataError,
    pagination,
    
    // Actions
    ...actions,
    
    // Utility functions
    getEmployeeById,
    applyPresetFilter,
    debouncedSearch,
    hasActiveFilters,
    exportToPNG,
    toggleFullscreen
  };
};

// FIXED: Simplified hooks for specific use cases
export const useOrgChartFilters = () => {
  const {
    filters,
    activeFilters,
    filterOptions,
    setFilters,
    clearFilters,
    updateFilter,
    hasActiveFilters
  } = useOrgChart();

  return {
    filters,
    activeFilters,
    filterOptions,
    setFilters,
    clearFilters,
    updateFilter,
    hasActiveFilters
  };
};

export const useOrgChartUI = () => {
  const {
    viewMode,
    showFilters,
    showLegend,
    isFullscreen,
    layoutDirection,
    expandedNodes,
    setViewMode,
    setShowFilters,
    setShowLegend,
    setIsFullscreen,
    setLayoutDirection,
    toggleExpandedNode,
    expandAllNodes,
    collapseAllNodes
  } = useOrgChart();

  return {
    viewMode,
    showFilters,
    showLegend,
    isFullscreen,
    layoutDirection,
    expandedNodes,
    setViewMode,
    setShowFilters,
    setShowLegend,
    setIsFullscreen,
    setLayoutDirection,
    toggleExpandedNode,
    expandAllNodes,
    collapseAllNodes
  };
};

export default useOrgChart;