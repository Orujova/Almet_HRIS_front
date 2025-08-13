"use client";
import React, { useState, useEffect, useMemo } from 'react';
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
  Award, 
  BarChart3,
  Plus,
  Download,
  Grid,
  List,
  Eye,
  Edit,
  X,
  MapPin,
  Layers,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Hierarchy colors using Almet color palette
const hierarchyColors = {
  'VC': { 
    bg: 'bg-almet-sapphire/10 dark:bg-almet-sapphire/20', 
    text: 'text-almet-sapphire dark:text-almet-steel-blue', 
    border: 'border-almet-sapphire' 
  },
  'Vice Chairman': { 
    bg: 'bg-almet-sapphire/10 dark:bg-almet-sapphire/20', 
    text: 'text-almet-sapphire dark:text-almet-steel-blue', 
    border: 'border-almet-sapphire' 
  },
  'DIRECTOR': { 
    bg: 'bg-almet-astral/10 dark:bg-almet-astral/20', 
    text: 'text-almet-astral dark:text-almet-astral', 
    border: 'border-almet-astral' 
  },
  'HEAD OF DEPARTMENT': { 
    bg: 'bg-almet-steel-blue/10 dark:bg-almet-steel-blue/20', 
    text: 'text-almet-steel-blue dark:text-almet-steel-blue', 
    border: 'border-almet-steel-blue' 
  },
  'MANAGER': { 
    bg: 'bg-green-100 dark:bg-green-900/30', 
    text: 'text-green-700 dark:text-green-400', 
    border: 'border-green-500' 
  },
  'SENIOR SPECIALIST': { 
    bg: 'bg-almet-bali-hai/10 dark:bg-almet-bali-hai/20', 
    text: 'text-almet-bali-hai dark:text-almet-bali-hai', 
    border: 'border-almet-bali-hai' 
  },
  'SPECIALIST': { 
    bg: 'bg-orange-100 dark:bg-orange-900/30', 
    text: 'text-orange-700 dark:text-orange-400', 
    border: 'border-orange-500' 
  },
  'JUNIOR SPECIALIST': { 
    bg: 'bg-red-100 dark:bg-red-900/30', 
    text: 'text-red-700 dark:text-red-400', 
    border: 'border-red-500' 
  },
  'BLUE COLLAR': { 
    bg: 'bg-teal-100 dark:bg-teal-900/30', 
    text: 'text-teal-700 dark:text-teal-400', 
    border: 'border-teal-500' 
  }
};

export default function JobCatalogPage() {
  const { darkMode } = useTheme();
  
  // View states
  const [activeView, setActiveView] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [matrixView, setMatrixView] = useState('department');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
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
    hierarchy: false
  });
  
  // Error states
  const [errors, setErrors] = useState({});

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
      // Use getAll to get employee data for hierarchy
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

  // Process employees into job catalog format
  const jobCatalogData = useMemo(() => {
    const jobMap = new Map();
    
    employees.forEach(employee => {
      const key = `${employee.business_function_name}-${employee.department_name}-${employee.job_function_name}-${employee.position_group_name}-${employee.job_title}`;
      
      if (jobMap.has(key)) {
        jobMap.get(key).currentEmployees += 1;
        jobMap.get(key).employees.push(employee);
      } else {
        jobMap.set(key, {
          id: key,
          unit: employee.business_function_name || 'N/A',
          department: employee.department_name || 'N/A',
          jobFunction: employee.job_function_name || 'N/A',
          hierarchy: employee.position_group_name || 'N/A',
          title: employee.job_title || 'N/A',
          currentEmployees: 1,
          employees: [employee],
          description: `${employee.position_group_name} position in ${employee.department_name}`,
          requirements: ['Relevant experience required', 'Team collaboration skills'],
          location: 'Baku HQ',
          status: 'Active'
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
    if (!statistics) return { totalJobs: 0, totalEmployees: 0, avgEmployeesPerJob: 0, activeJobs: 0 };
    
    return {
      totalJobs: jobCatalogData.length,
      totalEmployees: statistics.total_employees || 0,
      avgEmployeesPerJob: jobCatalogData.length > 0 ? Math.round((statistics.total_employees || 0) / jobCatalogData.length * 10) / 10 : 0,
      activeJobs: jobCatalogData.filter(j => j.status === 'Active').length
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

  // Navigation Tabs Component
  const NavigationTabs = () => (
    <div className="flex space-x-1 bg-white dark:bg-almet-cloud-burst rounded-lg p-1 shadow-sm mb-6">
      <button
        onClick={() => setActiveView('overview')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeView === 'overview' 
            ? 'bg-almet-sapphire text-white' 
            : 'text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet'
        }`}
      >
        <BarChart3 size={16} />
        Job Catalog Overview
      </button>
      <button
        onClick={() => setActiveView('structure')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeView === 'structure' 
            ? 'bg-almet-sapphire text-white' 
            : 'text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet'
        }`}
      >
        <Layers size={16} />
        Business Functions Structure
      </button>
      <button
        onClick={() => setActiveView('matrix')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeView === 'matrix' 
            ? 'bg-almet-sapphire text-white' 
            : 'text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet'
        }`}
      >
        <Grid size={16} />
        Hierarchy Matrix
      </button>
    </div>
  );

  // Job Card Component
  const JobCard = ({ job }) => {
    const colors = hierarchyColors[job.hierarchy] || hierarchyColors['SPECIALIST'];
    
    return (
      <div className={`bg-white dark:bg-almet-cloud-burst rounded-lg border-l-4 ${colors.border} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
           onClick={() => setSelectedJob(job)}>
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                {job.hierarchy}
              </span>
              <span className="text-xs text-gray-500 dark:text-almet-bali-hai flex items-center">
                <Users size={12} className="mr-1" />
                {job.currentEmployees}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-almet-comet">
                <Eye size={14} className="text-gray-400 dark:text-almet-bali-hai" />
              </button>
              <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-almet-comet">
                <Edit size={14} className="text-gray-400 dark:text-almet-bali-hai" />
              </button>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
            {job.title}
          </h3>

          <div className="space-y-2 mb-3">
            <div className="flex items-center text-xs text-gray-600 dark:text-almet-bali-hai">
              <Building2 size={12} className="mr-2 text-almet-sapphire" />
              <span className="truncate">{job.unit}</span>
            </div>
            <div className="flex items-center text-xs text-gray-600 dark:text-almet-bali-hai">
              <Target size={12} className="mr-2 text-green-500" />
              <span className="truncate">{job.department}</span>
            </div>
            <div className="flex items-center text-xs text-gray-600 dark:text-almet-bali-hai">
              <MapPin size={12} className="mr-2 text-red-500" />
              <span className="truncate">{job.location}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-almet-waterloo line-clamp-2">
            {job.description}
          </p>
        </div>
      </div>
    );
  };

  // Job List Item Component
  const JobListItem = ({ job }) => {
    const colors = hierarchyColors[job.hierarchy] || hierarchyColors['SPECIALIST'];
    
    return (
      <div className={`bg-white dark:bg-almet-cloud-burst rounded-lg border-l-4 ${colors.border} p-4 hover:shadow-md transition-all duration-200 cursor-pointer`}
           onClick={() => setSelectedJob(job)}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {job.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                {job.hierarchy}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-almet-bali-hai">
              <span className="flex items-center">
                <Building2 size={12} className="mr-1" />
                {job.unit}
              </span>
              <span className="flex items-center">
                <Target size={12} className="mr-1" />
                {job.department}
              </span>
              <span className="flex items-center">
                <MapPin size={12} className="mr-1" />
                {job.location}
              </span>
              <span className="flex items-center">
                <Users size={12} className="mr-1" />
                {job.currentEmployees} employees
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-almet-comet">
              <Eye size={16} className="text-gray-400 dark:text-almet-bali-hai" />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-almet-comet">
              <Edit size={16} className="text-gray-400 dark:text-almet-bali-hai" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Overview View Component
  const OverviewView = () => (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg mr-3">
              <Briefcase className="h-5 w-5 text-almet-sapphire" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Total Jobs</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading.statistics ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.totalJobs}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Total Employees</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading.statistics ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.totalEmployees}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Average</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading.statistics ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.avgEmployeesPerJob}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
              <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Active Jobs</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading.statistics ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.activeJobs}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-almet-sapphire text-white' : 'bg-gray-100 dark:bg-almet-comet text-gray-700 dark:text-almet-bali-hai hover:bg-gray-200 dark:hover:bg-almet-san-juan'
              }`}
            >
              <Filter size={16} />
              Filters
              {Object.values(selectedFilters).some(v => v) && (
                <span className="bg-red-500 text-white rounded-full w-2 h-2"></span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 dark:border-almet-comet overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai'}`}
              >
                <List size={16} />
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus size={16} />
              Add
            </button>

            

          
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-almet-comet">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Business Function
                </label>
                <select
                  value={selectedFilters.business_function}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, business_function: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-almet-comet rounded-md bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All</option>
                  {filterOptions.businessFunctions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Department
                </label>
                <select
                  value={selectedFilters.department}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-almet-comet rounded-md bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All</option>
                  {filterOptions.departments.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Unit
                </label>
                <select
                  value={selectedFilters.unit}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-almet-comet rounded-md bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All</option>
                  {filterOptions.units.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Job Function
                </label>
                <select
                  value={selectedFilters.job_function}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, job_function: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-almet-comet rounded-md bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All</option>
                  {filterOptions.jobFunctions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-1">
                  Position Group
                </label>
                <select
                  value={selectedFilters.position_group}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, position_group: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-almet-comet rounded-md bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All</option>
                  {filterOptions.positionGroups.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {Object.values(selectedFilters).some(v => v) && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-almet-bali-hai">
                  Showing {filteredJobs.length} / {jobCatalogData.length} jobs
                </span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-almet-sapphire dark:text-almet-steel-blue hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {errors.employees && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{errors.employees}</span>
          </div>
        </div>
      )}

      {/* Job Listings */}
      {loading.employees ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
          <span className="ml-2 text-gray-600 dark:text-almet-bali-hai">Loading jobs...</span>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
            {filteredJobs.map(job => (
              viewMode === 'grid' ? (
                <JobCard key={job.id} job={job} />
              ) : (
                <JobListItem key={job.id} job={job} />
              )
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-almet-bali-hai mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Jobs Found</h3>
              <p className="text-gray-500 dark:text-almet-bali-hai">
                Adjust your search criteria or filters.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Business Functions Structure View Component
  const StructureView = () => {
    const businessFunctionStructure = useMemo(() => {
      const structure = [];
      
      businessFunctions.forEach(bf => {
        const bfDepartments = departments.filter(dept => dept.business_function === bf.value);
        
        if (bfDepartments.length === 0) {
          jobFunctions.forEach(jf => {
            structure.push({
              id: `${bf.value}-${jf.value}`,
              unit: bf.label,
              department: 'N/A',
              jobFunction: jf.label,
              businessFunction: bf,
              departmentData: null,
              jobFunctionData: jf
            });
          });
        } else {
          bfDepartments.forEach(dept => {
            jobFunctions.forEach(jf => {
              structure.push({
                id: `${bf.value}-${dept.value}-${jf.value}`,
                unit: bf.label,
                department: dept.label,
                jobFunction: jf.label,
                businessFunction: bf,
                departmentData: dept,
                jobFunctionData: jf
              });
            });
          });
        }
      });
      
      return structure;
    }, [businessFunctions, departments, units, jobFunctions]);

    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Business Functions Structure</h2>
          <p className="text-gray-600 dark:text-almet-bali-hai">
            Organizational structure based on real data from your system
          </p>
        </div>
        
        {loading.referenceData ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
            <span className="ml-2 text-gray-600 dark:text-almet-bali-hai">Loading structure...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-almet-comet">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Business Function</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Job Function</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Employee Count</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {businessFunctionStructure.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-almet-comet hover:bg-gray-50 dark:hover:bg-almet-san-juan">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{item.unit}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{item.department}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{item.jobFunction}</td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                        {item.departmentData?.employee_count || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-almet-comet">
                            <Eye size={14} className="text-gray-400 dark:text-almet-bali-hai" />
                          </button>
                          <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-almet-comet">
                            <Edit size={14} className="text-gray-400 dark:text-almet-bali-hai" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus size={16} />
                Add New
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-almet-astral text-white rounded-lg hover:bg-almet-sapphire transition-colors">
                <Download size={16} />
                Export
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Matrix View Component
  const MatrixView = () => {
    const columns = matrixView === 'department' ? departments.map(d => d.label || d.name) : 
                   matrixView === 'function' ? jobFunctions.map(jf => jf.label || jf.name) : 
                   businessFunctions.map(bf => bf.label || bf.name);

    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hierarchy Matrix</h2>
              <p className="text-gray-600 dark:text-almet-bali-hai">
                Distribution of jobs by hierarchy levels based on real employee data
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-almet-bali-hai">
                Matrix View:
              </label>
              <select
                value={matrixView}
                onChange={(e) => setMatrixView(e.target.value)}
                className="p-2 border border-gray-300 dark:border-almet-comet rounded-md bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm"
              >
                <option value="department">By Department</option>
                <option value="function">By Job Function</option>
                <option value="unit">By Business Function</option>
              </select>
            </div>
          </div>
        </div>

        {loading.hierarchy ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
            <span className="ml-2 text-gray-600 dark:text-almet-bali-hai">Loading hierarchy matrix...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-gray-100 dark:bg-almet-san-juan border border-gray-300 dark:border-almet-comet p-3 text-left font-semibold text-gray-900 dark:text-white min-w-[150px]">
                      Hierarchy
                    </th>
                    {columns.map((col, colIndex) => (
                      <th key={`col-${colIndex}-${col}`} className="border border-gray-300 dark:border-almet-comet p-2 text-center font-medium text-gray-900 dark:text-white text-xs min-w-[120px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positionGroups.map(pg => {
                    const hierarchyName = pg.label || pg.name;
                    const colors = hierarchyColors[hierarchyName] || hierarchyColors['SPECIALIST'];
                    return (
                      <tr key={pg.value || pg.id}>
                        <td className={`sticky left-0 border border-gray-300 dark:border-almet-comet p-3 font-medium ${colors.bg} ${colors.text} min-w-[150px]`}>
                          {hierarchyName}
                        </td>
                        {columns.map((col, colIndex) => {
                          const jobs = matrixData[hierarchyName]?.[col] || [];
                          return (
                            <td key={`${pg.value || pg.id}-${colIndex}-${col}`} className="border border-gray-300 dark:border-almet-comet p-2 text-center">
                              {jobs.length > 0 ? (
                                <div className="space-y-1">
                                  {jobs.map((job, jobIndex) => (
                                    <div 
                                      key={`${job.id}-${jobIndex}`}
                                      className="bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue text-xs p-1 rounded cursor-pointer hover:bg-almet-sapphire/20 dark:hover:bg-almet-sapphire/30 transition-colors"
                                      onClick={() => setSelectedJob(job)}
                                      title={job.title}
                                    >
                                      <div className="font-medium truncate">{job.title}</div>
                                      <div className="flex items-center justify-center gap-1 text-xs">
                                        <Users size={10} />
                                        {job.currentEmployees}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 dark:text-almet-bali-hai text-xs">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-almet-bali-hai">
                Total {jobCatalogData.length} jobs, {stats.totalEmployees} employees
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Plus size={16} />
                  New Job
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-almet-astral text-white rounded-lg hover:bg-almet-sapphire transition-colors">
                  <Download size={16} />
                  Export Matrix
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-almet-mystic dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job Catalog</h1>
          <p className="text-gray-600 dark:text-almet-bali-hai">
            A comprehensive overview of all jobs within the organization based on real employee data
          </p>
        </div>

        {/* Error Display for Initial Load */}
        {errors.initial && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{errors.initial}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <NavigationTabs />

        {/* Content based on active view */}
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'structure' && <StructureView />}
        {activeView === 'matrix' && <MatrixView />}

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-almet-comet">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedJob.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${hierarchyColors[selectedJob.hierarchy]?.bg} ${hierarchyColors[selectedJob.hierarchy]?.text}`}>
                        {selectedJob.hierarchy}
                      </span>
                      <span className="flex items-center text-sm text-gray-600 dark:text-almet-bali-hai">
                        <Users size={16} className="mr-1" />
                        {selectedJob.currentEmployees} employees
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-almet-comet rounded-lg"
                  >
                    <X size={20} className="text-gray-500 dark:text-almet-bali-hai" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Job Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Job Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building2 size={16} className="mr-2 text-almet-sapphire" />
                        <span className="text-sm text-gray-600 dark:text-almet-bali-hai">Unit: {selectedJob.unit}</span>
                      </div>
                      <div className="flex items-center">
                        <Target size={16} className="mr-2 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-almet-bali-hai">Department: {selectedJob.department}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-2 text-purple-500" />
                        <span className="text-sm text-gray-600 dark:text-almet-bali-hai">Function: {selectedJob.jobFunction}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-red-500" />
                        <span className="text-sm text-gray-600 dark:text-almet-bali-hai">Location: {selectedJob.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Current Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-almet-mystic dark:bg-almet-san-juan rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-almet-bali-hai">Current Employee Count</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedJob.currentEmployees}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-almet-mystic dark:bg-almet-san-juan rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-almet-bali-hai">Status</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm">
                          {selectedJob.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Job Description</h3>
                  <p className="text-gray-600 dark:text-almet-bali-hai text-sm leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Requirements */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-almet-bali-hai">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Employee List */}
                {selectedJob.employees && selectedJob.employees.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Current Employees</h3>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {selectedJob.employees.slice(0, 5).map((employee, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-almet-san-juan rounded">
                          <span className="text-sm text-gray-900 dark:text-white">{employee.name}</span>
                          <span className="text-xs text-gray-500 dark:text-almet-bali-hai ml-2">({employee.employee_id})</span>
                        </div>
                      ))}
                      {selectedJob.employees.length > 5 && (
                        <div className="text-xs text-gray-500 dark:text-almet-bali-hai">
                          +{selectedJob.employees.length - 5} more employees
                        </div>
                      )}
                    </div>
                  </div>
                )}

                
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}