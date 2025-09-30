// src/components/jobCatalog/JobCatalogPage.jsx - COMPLETE FULL VERSION
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { referenceDataAPI } from '@/store/api/referenceDataAPI';
import { employeeAPI } from '@/store/api/employeeAPI';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

// CRITICAL: Import setPositionGroups from HierarchyColors
import { setPositionGroups } from '@/components/jobCatalog/HierarchyColors';

// Import all components
import NavigationTabs from '@/components/jobCatalog/NavigationTabs';
import OverviewView from '@/components/jobCatalog/OverviewView';
import ReferenceDataView from '@/components/jobCatalog/ReferenceDataView';
import MatrixView from '@/components/jobCatalog/MatrixView';
import JobDetailModal from '@/components/jobCatalog/JobDetailModal';
import CrudModal from '@/components/jobCatalog/CrudModal';

export default function JobCatalogPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // View states
  const [activeView, setActiveView] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [matrixView, setMatrixView] = useState('department');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCrudModal, setShowCrudModal] = useState(false);
  const [crudModalType, setCrudModalType] = useState('');
  const [crudModalMode, setCrudModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Data states
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [businessFunctions, setBusinessFunctions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [jobFunctions, setJobFunctions] = useState([]);
  const [positionGroupsState, setPositionGroupsState] = useState([]);
  const [hierarchyData, setHierarchyData] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    business_function: '',
    department: '',
    unit: '',
    job_function: '',
    position_group: ''
  });
  
  // Loading states
  const [loading, setLoading] = useState({
    employees: false,
    statistics: false,
    referenceData: false,
    hierarchy: false,
    crud: false
  });
  
  // Error states
  const [errors, setErrors] = useState({});
  
  // Form data for CRUD operations
  const [formData, setFormData] = useState({});

  // ============================================
  // INITIAL DATA LOADING
  // ============================================
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(prev => ({ ...prev, referenceData: true, statistics: true }));
    
    try {
      // Load all reference data and statistics in parallel
      const [
        businessFunctionsRes,
        departmentsRes,
        unitsRes,
        jobFunctionsRes,
        positionGroupsRes,
        statisticsRes
      ] = await Promise.all([
        referenceDataAPI.getBusinessFunctionDropdown(),
        referenceDataAPI.getDepartmentDropdown(),
        referenceDataAPI.getUnitDropdown(),
        referenceDataAPI.getJobFunctionDropdown(),
        referenceDataAPI.getPositionGroupDropdown(),
        employeeAPI.getStatistics()
      ]);

      const positionGroupsData = positionGroupsRes.data || [];
      
      // Set all data
      setBusinessFunctions(businessFunctionsRes.data || []);
      setDepartments(departmentsRes.data?.results || departmentsRes.data || []);
      setUnits(unitsRes.data || []);
      setJobFunctions(jobFunctionsRes.data || []);
      setPositionGroupsState(positionGroupsData);
      setStatistics(statisticsRes.data || statisticsRes);

      // CRITICAL: Initialize color system with position groups
      // This must be called to assign unique colors to each position
      setPositionGroups(positionGroupsData);
      console.log('✅ Color system initialized with', positionGroupsData.length, 'position groups');

      // Load employees after reference data is set
      await loadEmployees();
      
    } catch (error) {
      setErrors(prev => ({ ...prev, initial: 'Failed to load initial data' }));
      showError('Failed to load initial data');
      console.error('❌ Error loading initial data:', error);
    } finally {
      setLoading(prev => ({ ...prev, referenceData: false, statistics: false }));
    }
  };

  // ============================================
  // EMPLOYEE DATA LOADING
  // ============================================
  
  const loadEmployees = async (additionalParams = {}) => {
    setLoading(prev => ({ ...prev, employees: true }));
    
    try {
      // Build parameters
      const params = {
        search: searchTerm,
        ...selectedFilters,
        ...additionalParams
      };
      
      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await employeeAPI.getAll(params);
      const employeeData = response.data?.results || response.results || [];
      setEmployees(employeeData);
      console.log('✅ Loaded', employeeData.length, 'employees');
      
    } catch (error) {
      setErrors(prev => ({ ...prev, employees: 'Failed to load employees' }));
      console.error('❌ Error loading employees:', error);
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  // ============================================
  // HIERARCHY DATA LOADING (for matrix view)
  // ============================================
  
  const loadHierarchyData = async () => {
    setLoading(prev => ({ ...prev, hierarchy: true }));
    
    try {
      const response = await employeeAPI.getAll({ page_size: 1000 });
      setHierarchyData(response.data || response);
    } catch (error) {
      setErrors(prev => ({ ...prev, hierarchy: 'Failed to load hierarchy data' }));
      console.error('❌ Error loading hierarchy data:', error);
    } finally {
      setLoading(prev => ({ ...prev, hierarchy: false }));
    }
  };

  // Load hierarchy data when matrix view is accessed
  useEffect(() => {
    if (activeView === 'matrix' && !hierarchyData) {
      loadHierarchyData();
    }
  }, [activeView, hierarchyData]);

  // Reload employees when filters change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedFilters]);

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  
  const openCrudModal = (type, mode = 'create', item = null) => {
    setCrudModalType(type);
    setCrudModalMode(mode);
    setSelectedItem(item);
    
    if (mode === 'edit' && item) {
      // Populate form with existing data
      const formDataInit = {
        name: item.name || item.label || '',
        code: item.code || '',
        description: item.description || '',
        is_active: item.is_active !== false,
        business_function: item.business_function || item.business_function_id || '',
        department: item.department || item.department_id || '',
        hierarchy_level: item.hierarchy_level || ''
      };
      setFormData(formDataInit);
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        code: '',
        description: '',
        is_active: true,
        business_function: '',
        department: '',
        hierarchy_level: ''
      });
    }
    setShowCrudModal(true);
  };

  const closeCrudModal = () => {
    setShowCrudModal(false);
    setCrudModalType('');
    setCrudModalMode('create');
    setSelectedItem(null);
    setFormData({});
    setErrors(prev => ({ ...prev, crud: null }));
  };

  const handleCrudSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, crud: true }));
    setErrors(prev => ({ ...prev, crud: null }));

    try {
      let response;
      
      // Handle different entity types
      switch (crudModalType) {
        case 'business_functions':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createBusinessFunction(formData);
          } else {
            response = await referenceDataAPI.updateBusinessFunction(
              selectedItem.value || selectedItem.id, 
              formData
            );
          }
          break;
          
        case 'departments':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createDepartment(formData);
          } else {
            response = await referenceDataAPI.updateDepartment(
              selectedItem.value || selectedItem.id, 
              formData
            );
          }
          break;
          
        case 'units':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createUnit(formData);
          } else {
            response = await referenceDataAPI.updateUnit(
              selectedItem.value || selectedItem.id, 
              formData
            );
          }
          break;
          
        case 'job_functions':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createJobFunction(formData);
          } else {
            response = await referenceDataAPI.updateJobFunction(
              selectedItem.value || selectedItem.id, 
              formData
            );
          }
          break;
          
        case 'position_groups':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createPositionGroup(formData);
          } else {
            response = await referenceDataAPI.updatePositionGroup(
              selectedItem.value || selectedItem.id, 
              formData
            );
          }
          break;
      }

      // Reload all data after successful operation
      await loadInitialData();
      
      // Show success message
      const entityName = crudModalType.replace('_', ' ');
      showSuccess(`Successfully ${crudModalMode === 'create' ? 'created' : 'updated'} ${entityName}`);
      
      closeCrudModal();
      
    } catch (error) {
      const errorMsg = `Failed to ${crudModalMode} ${crudModalType.replace('_', ' ')}`;
      setErrors(prev => ({ ...prev, crud: errorMsg }));
      showError(errorMsg);
      console.error('❌ CRUD operation error:', error);
    } finally {
      setLoading(prev => ({ ...prev, crud: false }));
    }
  };

  const handleDelete = async (type, item) => {
    // Confirmation dialog
    if (!confirm(`Are you sure you want to delete "${item.name || item.label}"?`)) {
      return;
    }

    setLoading(prev => ({ ...prev, crud: true }));

    try {
      const id = item.id || item.value;
      
      // Delete based on type
      switch (type) {
        case 'business_functions':
          await referenceDataAPI.deleteBusinessFunction(id);
          break;
        case 'departments':
          await referenceDataAPI.deleteDepartment(id);
          break;
        case 'units':
          await referenceDataAPI.deleteUnit(id);
          break;
        case 'job_functions':
          await referenceDataAPI.deleteJobFunction(id);
          break;
        case 'position_groups':
          await referenceDataAPI.deletePositionGroup(id);
          break;
      }

      // Reload data
      await loadInitialData();
      
      // Show success message
      showSuccess(`Successfully deleted ${type.replace('_', ' ')}`);
      
    } catch (error) {
      const errorMsg = `Failed to delete ${type.replace('_', ' ')}`;
      setErrors(prev => ({ ...prev, crud: errorMsg }));
      showError(errorMsg);
      console.error('❌ Delete error:', error);
    } finally {
      setLoading(prev => ({ ...prev, crud: false }));
    }
  };

  // ============================================
  // NAVIGATION
  // ============================================
  
  const navigateToEmployee = (employeeId) => {
    router.push(`/structure/employee/${employeeId}/`);
  };

  // ============================================
  // DATA PROCESSING & COMPUTED VALUES
  // ============================================
  
  // Process employees into job catalog format
  const jobCatalogData = useMemo(() => {
    const jobMap = new Map();
    
    employees.forEach(employee => {
      // Create unique key for each job position
      const key = `${employee.business_function_name}-${employee.department_name}-${employee.job_function_name}-${employee.position_group_name}-${employee.job_title}-${employee.unit_name}`;
      
      if (jobMap.has(key)) {
        // Job already exists, increment employee count
        jobMap.get(key).currentEmployees += 1;
        jobMap.get(key).employees.push(employee);
      } else {
        // Create new job entry
        jobMap.set(key, {
          id: key,
          businessFunction: employee.business_function_name || 'N/A',
          unit: employee.unit_name || 'N/A',
          department: employee.department_name || 'N/A',
          jobFunction: employee.job_function_name || 'N/A',
          hierarchy: employee.position_group_name || 'N/A',
          title: employee.job_title || 'N/A',
          currentEmployees: 1,
          employees: [employee],
          description: `${employee.position_group_name} position in ${employee.department_name}`,
        });
      }
    });
    
    return Array.from(jobMap.values());
  }, [employees]);

  // Filter options for dropdowns
  const filterOptions = useMemo(() => {
    return {
      businessFunctions: businessFunctions || [],
      departments: departments || [],
      units: units || [],
      jobFunctions: jobFunctions || [],
      positionGroups: positionGroupsState || []
    };
  }, [businessFunctions, departments, units, jobFunctions, positionGroupsState]);

  // Filtered jobs based on search term AND filters
  const filteredJobs = useMemo(() => {
    return jobCatalogData.filter(job => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.businessFunction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobFunction.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.hierarchy.toLowerCase().includes(searchTerm.toLowerCase());

      // Business function filter
      const matchesBusinessFunction = !selectedFilters.business_function || 
        job.businessFunction === selectedFilters.business_function ||
        // Match by ID if businessFunctions array has it
        businessFunctions.find(bf => 
          (bf.value === selectedFilters.business_function || bf.id === selectedFilters.business_function) && 
          (bf.label === job.businessFunction || bf.name === job.businessFunction)
        );

      // Department filter
      const matchesDepartment = !selectedFilters.department || 
        job.department === selectedFilters.department ||
        departments.find(d => 
          (d.value === selectedFilters.department || d.id === selectedFilters.department) && 
          (d.label === job.department || d.name === job.department)
        );

      // Unit filter
      const matchesUnit = !selectedFilters.unit || 
        job.unit === selectedFilters.unit ||
        units.find(u => 
          (u.value === selectedFilters.unit || u.id === selectedFilters.unit) && 
          (u.label === job.unit || u.name === job.unit)
        );

      // Job function filter
      const matchesJobFunction = !selectedFilters.job_function || 
        job.jobFunction === selectedFilters.job_function ||
        jobFunctions.find(jf => 
          (jf.value === selectedFilters.job_function || jf.id === selectedFilters.job_function) && 
          (jf.label === job.jobFunction || jf.name === job.jobFunction)
        );

      // Position group filter
      const matchesPositionGroup = !selectedFilters.position_group || 
        job.hierarchy === selectedFilters.position_group ||
        positionGroupsState.find(pg => 
          (pg.value === selectedFilters.position_group || pg.id === selectedFilters.position_group) && 
          (pg.label === job.hierarchy || pg.name === job.hierarchy)
        );

      return matchesSearch && matchesBusinessFunction && matchesDepartment && 
             matchesUnit && matchesJobFunction && matchesPositionGroup;
    });
  }, [jobCatalogData, searchTerm, selectedFilters, businessFunctions, departments, units, jobFunctions, positionGroupsState]);

  // Statistics
  const stats = useMemo(() => {
    if (!statistics) return { totalJobs: 0, totalEmployees: 0 };
    
    return {
      totalJobs: jobCatalogData.length,
      totalEmployees: statistics.total_employees || 0,
    };
  }, [statistics, jobCatalogData]);

  // Matrix data for hierarchy view
  const matrixData = useMemo(() => {
    if (!hierarchyData) return {};
    
    const matrix = {};
    
    // Determine columns based on matrix view type
    const columns = matrixView === 'department' 
      ? departments.map(d => d.label || d.name)
      : matrixView === 'function' 
      ? jobFunctions.map(jf => jf.label || jf.name)
      : businessFunctions.map(bf => bf.label || bf.name);
    
    // Build matrix structure
    positionGroupsState.forEach(pg => {
      const hierarchyName = pg.label || pg.name;
      matrix[hierarchyName] = {};
      
      columns.forEach(col => {
        // Filter jobs for this cell
        const jobs = jobCatalogData.filter(job => {
          if (matrixView === 'department') {
            return job.hierarchy === hierarchyName && job.department === col;
          }
          if (matrixView === 'function') {
            return job.hierarchy === hierarchyName && job.jobFunction === col;
          }
          return job.hierarchy === hierarchyName && job.unit === col;
        });
        matrix[hierarchyName][col] = jobs;
      });
    });
    
    return matrix;
  }, [hierarchyData, matrixView, jobCatalogData, departments, jobFunctions, businessFunctions, positionGroupsState]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      business_function: '',
      department: '',
      unit: '',
      job_function: '',
      position_group: ''
    });
    setSearchTerm('');
  };

  // ============================================
  // CONTEXT VALUE (passed to child components)
  // ============================================
  
  const contextValue = {
    // View states
    activeView, setActiveView,
    viewMode, setViewMode,
    matrixView, setMatrixView,
    showFilters, setShowFilters,
    selectedJob, setSelectedJob,
    showCrudModal, setShowCrudModal,
    crudModalType, setCrudModalType,
    crudModalMode, setCrudModalMode,
    selectedItem, setSelectedItem,
    
    // Data
    employees, 
    statistics, 
    businessFunctions, 
    departments, 
    units, 
    jobFunctions, 
    positionGroups: positionGroupsState, 
    hierarchyData,
    
    // Filters
    searchTerm, setSearchTerm,
    selectedFilters, setSelectedFilters,
    
    // Loading and errors
    loading, 
    errors,
    
    // Form data
    formData, setFormData,
    
    // Computed data
    jobCatalogData, 
    filteredJobs, 
    stats, 
    matrixData, 
    filterOptions,
    
    // Functions
    openCrudModal, 
    closeCrudModal, 
    handleCrudSubmit, 
    handleDelete,
    navigateToEmployee, 
    clearFilters, 
    loadInitialData
  };

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 bg-almet-mystic dark:bg-gray-900 min-h-screen">
        
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Job Catalog
          </h1>
          <p className="text-xs text-gray-600 dark:text-almet-bali-hai">
            Comprehensive job catalog with reference data management
          </p>
        </div>

        {/* Error Display */}
        {errors.initial && (
          <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
              <span className="text-red-800 dark:text-red-200 text-xs">{errors.initial}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <NavigationTabs 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />

        {/* Content Views */}
        {activeView === 'overview' && (
          <OverviewView context={contextValue} />
        )}
        
        {activeView === 'structure' && (
          <ReferenceDataView context={contextValue} />
        )}
        
        {activeView === 'matrix' && (
          <MatrixView context={contextValue} />
        )}

        {/* Modals */}
        <CrudModal context={contextValue} />
        <JobDetailModal context={contextValue} />
        
      </div>
    </DashboardLayout>
  );
}