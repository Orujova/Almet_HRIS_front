// src/components/job-catalog/JobCatalogPage.jsx
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { referenceDataAPI } from '@/store/api/referenceDataAPI';
import { employeeAPI } from '@/store/api/employeeAPI';
import { 
  Search, 
  Filter, 
  Users, 
  Briefcase, 
  Building2, 
  Target, 
  BarChart3,
  Plus,
  Grid,
  List,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Import components
import NavigationTabs from '@/components/jobCatalog/NavigationTabs';
import OverviewView from '@/components/jobCatalog/OverviewView';
import ReferenceDataView from '@/components/jobCatalog/ReferenceDataView';
import MatrixView from '@/components/jobCatalog/MatrixView';
import JobDetailModal from '@/components/jobCatalog/JobDetailModal';
import CrudModal from '@/components/jobCatalog/CrudModal';

export default function JobCatalogPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  
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
  const [positionGroups, setPositionGroups] = useState([]);
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

  // Form state for CRUD operations
  const [formData, setFormData] = useState({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(prev => ({ ...prev, referenceData: true, statistics: true }));
    
    try {
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

      setBusinessFunctions(businessFunctionsRes.data || []);
      setDepartments(departmentsRes.data?.results || departmentsRes.data || []);
      setUnits(unitsRes.data || []);
      setJobFunctions(jobFunctionsRes.data || []);
      setPositionGroups(positionGroupsRes.data || []);
      setStatistics(statisticsRes.data || statisticsRes);

      await loadEmployees();
      
    } catch (error) {
      setErrors(prev => ({ ...prev, initial: 'Failed to load initial data' }));
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(prev => ({ ...prev, referenceData: false, statistics: false }));
    }
  };

  const loadEmployees = async (additionalParams = {}) => {
    setLoading(prev => ({ ...prev, employees: true }));
    
    try {
      const params = {
        search: searchTerm,
        ...selectedFilters,
        ...additionalParams
      };
      
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await employeeAPI.getAll(params);
      setEmployees(response.data?.results || response.results || []);
      console.log('Loaded employees:', response.data?.results || response.results || []);
      
    } catch (error) {
      setErrors(prev => ({ ...prev, employees: 'Failed to load employees' }));
      console.error('Error loading employees:', error);
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const loadHierarchyData = async () => {
    setLoading(prev => ({ ...prev, hierarchy: true }));
    
    try {
      const response = await employeeAPI.getAll({ page_size: 1000 });
      setHierarchyData(response.data || response);
    } catch (error) {
      setErrors(prev => ({ ...prev, hierarchy: 'Failed to load hierarchy data' }));
      console.error('Error loading hierarchy data:', error);
    } finally {
      setLoading(prev => ({ ...prev, hierarchy: false }));
    }
  };

  // Load hierarchy data when matrix view is selected
  useEffect(() => {
    if (activeView === 'matrix' && !hierarchyData) {
      loadHierarchyData();
    }
  }, [activeView, hierarchyData]);

  // Reload employees when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedFilters]);

  // CRUD Operations
  const openCrudModal = (type, mode = 'create', item = null) => {
    setCrudModalType(type);
    setCrudModalMode(mode);
    setSelectedItem(item);
    
    if (mode === 'edit' && item) {
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
      
      switch (crudModalType) {
        case 'business_functions':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createBusinessFunction(formData);
          } else {
            response = await referenceDataAPI.updateBusinessFunction(selectedItem.value || selectedItem.id, formData);
          }
          break;
        case 'departments':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createDepartment(formData);
          } else {
            response = await referenceDataAPI.updateDepartment(selectedItem.value || selectedItem.id, formData);
          }
          break;
        case 'units':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createUnit(formData);
          } else {
            response = await referenceDataAPI.updateUnit(selectedItem.value || selectedItem.id, formData);
          }
          break;
        case 'job_functions':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createJobFunction(formData);
          } else {
            response = await referenceDataAPI.updateJobFunction(selectedItem.value || selectedItem.id, formData);
          }
          break;
        case 'position_groups':
          if (crudModalMode === 'create') {
            response = await referenceDataAPI.createPositionGroup(formData);
          } else {
            response = await referenceDataAPI.updatePositionGroup(selectedItem.value || selectedItem.id, formData);
          }
          break;
      }

      await loadInitialData();
      closeCrudModal();
      
    } catch (error) {
      setErrors(prev => ({ ...prev, crud: `Failed to ${crudModalMode} ${crudModalType.replace('_', ' ')}. ${error.message || ''}` }));
      console.error('Error in CRUD operation:', error);
    } finally {
      setLoading(prev => ({ ...prev, crud: false }));
    }
  };

  const handleDelete = async (type, item) => {
    if (!confirm(`Are you sure you want to delete "${item.name || item.label}"?`)) return;

    setLoading(prev => ({ ...prev, crud: true }));

    try {
      const id = item.id || item.value;
      
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

      await loadInitialData();
      
    } catch (error) {
      setErrors(prev => ({ ...prev, crud: `Failed to delete ${type.replace('_', ' ')}. ${error.message || ''}` }));
      console.error('Error deleting item:', error);
    } finally {
      setLoading(prev => ({ ...prev, crud: false }));
    }
  };

  // Navigate to employee detail
  const navigateToEmployee = (employeeId) => {
    router.push(`/structure/employee/${employeeId}/`);
  };

  // Process employees into job catalog format
  const jobCatalogData = useMemo(() => {
    const jobMap = new Map();
    
    employees.forEach(employee => {
      const key = `${employee.business_function_name}-${employee.department_name}-${employee.job_function_name}-${employee.position_group_name}-${employee.job_title}-${employee.unit_name}`;
      
      if (jobMap.has(key)) {
        jobMap.get(key).currentEmployees += 1;
        jobMap.get(key).employees.push(employee);
      } else {
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

  // Filter options
  const filterOptions = useMemo(() => {
    return {
      businessFunctions: businessFunctions || [],
      departments: departments || [],
      units: units || [],
      jobFunctions: jobFunctions || [],
      positionGroups: positionGroups || []
    };
  }, [businessFunctions, departments, units, jobFunctions, positionGroups]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobCatalogData.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.unit.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [jobCatalogData, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    if (!statistics) return { totalJobs: 0, totalEmployees: 0 };
    
    return {
      totalJobs: jobCatalogData.length,
      totalEmployees: statistics.total_employees || 0,
    };
  }, [statistics, jobCatalogData]);

  // Matrix data
  const matrixData = useMemo(() => {
    if (!hierarchyData) return {};
    
    const matrix = {};
    const columns = matrixView === 'department' ? departments.map(d => d.label || d.name) : 
                   matrixView === 'function' ? jobFunctions.map(jf => jf.label || jf.name) : 
                   businessFunctions.map(bf => bf.label || bf.name);
    
    positionGroups.forEach(pg => {
      const hierarchyName = pg.label || pg.name;
      matrix[hierarchyName] = {};
      columns.forEach(col => {
        const jobs = jobCatalogData.filter(job => {
          if (matrixView === 'department') return job.hierarchy === hierarchyName && job.department === col;
          if (matrixView === 'function') return job.hierarchy === hierarchyName && job.jobFunction === col;
          return job.hierarchy === hierarchyName && job.unit === col;
        });
        matrix[hierarchyName][col] = jobs;
      });
    });
    
    return matrix;
  }, [hierarchyData, matrixView, jobCatalogData, departments, jobFunctions, businessFunctions, positionGroups]);

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

  const contextValue = {
    // States
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
    employees, statistics, businessFunctions, departments, 
    units, jobFunctions, positionGroups, hierarchyData,
    
    // Filters
    searchTerm, setSearchTerm,
    selectedFilters, setSelectedFilters,
    
    // Loading and errors
    loading, errors,
    
    // Form data
    formData, setFormData,
    
    // Computed data
    jobCatalogData, filteredJobs, stats, matrixData, filterOptions,
    
    // Functions
    openCrudModal, closeCrudModal, handleCrudSubmit, handleDelete,
    navigateToEmployee, clearFilters, loadInitialData
  };

  return (
    <DashboardLayout>
      <div className="p-4 bg-almet-mystic dark:bg-gray-900 min-h-screen text-sm">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Job Catalog</h1>
          <p className="text-gray-600 dark:text-almet-bali-hai text-sm">
            Comprehensive job catalog with reference data management and organizational insights
          </p>
        </div>

        {/* Error Display for Initial Load */}
        {errors.initial && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200 text-sm">{errors.initial}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <NavigationTabs 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />

        {/* Content based on active view */}
        {activeView === 'overview' && (
          <OverviewView context={contextValue} />
        )}
        {activeView === 'structure' && (
          <ReferenceDataView context={contextValue} />
        )}
        {activeView === 'matrix' && (
          <MatrixView context={contextValue} />
        )}

        {/* CRUD Modal */}
        <CrudModal context={contextValue} />

        {/* Job Detail Modal */}
        <JobDetailModal context={contextValue} />
      </div>
    </DashboardLayout>
  );
}