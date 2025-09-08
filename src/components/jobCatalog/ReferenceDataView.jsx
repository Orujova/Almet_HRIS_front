// src/components/job-catalog/ReferenceDataView.jsx

import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Loader2, Users, Building, Briefcase, Target, Award,
  Search, Filter, ChevronDown, ChevronRight, Eye, EyeOff, ArrowUpDown,
  Building2, Settings, Layers, Check, X, AlertCircle, TrendingUp
} from 'lucide-react';
import { hierarchyColors } from './HierarchyColors';

export default function ReferenceDataView({ context }) {
  const {
    businessFunctions, departments, units, jobFunctions, positionGroups,
    loading, openCrudModal, handleDelete, employees
  } = context;

  const [activeTab, setActiveTab] = useState('business_functions');
  const [viewMode, setViewMode] = useState('table'); // table, hierarchy, stats
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showInactive, setShowInactive] = useState(false);
  const [expandedHierarchy, setExpandedHierarchy] = useState({});

  // Calculate real employee counts for each reference data type
  const getEmployeeCountsByType = useMemo(() => {
    if (!employees || !Array.isArray(employees)) return {};
    
    const counts = {
      business_functions: {},
      departments: {},
      units: {},
      job_functions: {},
      position_groups: {}
    };

    employees.forEach(emp => {
      // Count by business function
      if (emp.business_function_name) {
        counts.business_functions[emp.business_function_name] = 
          (counts.business_functions[emp.business_function_name] || 0) + 1;
      }
      
      // Count by department
      if (emp.department_name) {
        counts.departments[emp.department_name] = 
          (counts.departments[emp.department_name] || 0) + 1;
      }
      
      // Count by unit
      if (emp.unit_name) {
        counts.units[emp.unit_name] = 
          (counts.units[emp.unit_name] || 0) + 1;
      }
      
      // Count by job function
      if (emp.job_function_name) {
        counts.job_functions[emp.job_function_name] = 
          (counts.job_functions[emp.job_function_name] || 0) + 1;
      }
      
      // Count by position group
      if (emp.position_group_name) {
        counts.position_groups[emp.position_group_name] = 
          (counts.position_groups[emp.position_group_name] || 0) + 1;
      }
    });

    return counts;
  }, [employees]);

  const getTabIcon = (tabId) => {
    const icons = {
      business_functions: Building,
      departments: Target,
      units: Briefcase,
      job_functions: Users,
      position_groups: Award
    };
    return icons[tabId] || Building;
  };

  const getTabConfig = (tabId) => {
    const configs = {
      business_functions: {
        title: 'Business Functions',
        description: 'Fundamental business areas and organizational divisions',
        data: businessFunctions,
        columns: [
          { key: 'name', label: 'Name', sortable: true },
          { key: 'code', label: 'Code', sortable: true },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'department_count', label: 'Departments', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      },
      departments: {
        title: 'Departments',
        description: 'Organizational departments within business functions',
        data: departments,
        columns: [
          { key: 'name', label: 'Department', sortable: true },
          { key: 'business_function_name', label: 'Business Function', sortable: true },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'unit_count', label: 'Units', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      },
      units: {
        title: 'Units',
        description: 'Operational units within departments',
        data: units,
        columns: [
          { key: 'name', label: 'Unit', sortable: true },
          { key: 'department_name', label: 'Department', sortable: true },
          { key: 'business_function_name', label: 'Business Function', sortable: true },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      },
      job_functions: {
        title: 'Job Functions',
        description: 'Functional categories for job roles',
        data: jobFunctions,
        columns: [
          { key: 'name', label: 'Job Function', sortable: true },
          { key: 'description', label: 'Description', sortable: false },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      },
      position_groups: {
        title: 'Position Groups',
        description: 'Hierarchical position levels and grading structure',
        data: positionGroups,
        columns: [
          { key: 'name', label: 'Position Group', sortable: true },
          { key: 'hierarchy_level', label: 'Level', sortable: true, align: 'center' },
          { key: 'grading_shorthand', label: 'Grading', sortable: false, align: 'center' },
          { key: 'employee_count', label: 'Employees', sortable: true, align: 'center' },
          { key: 'is_active', label: 'Status', sortable: true, align: 'center' }
        ]
      }
    };
    return configs[tabId];
  };

  // Enhanced data processing with real employee counts
  const processedData = useMemo(() => {
    const config = getTabConfig(activeTab);
    if (!config || !config.data) return [];

    let data = config.data.map(item => ({
      ...item,
      // Add real employee count from actual data
      real_employee_count: getEmployeeCountsByType[activeTab]?.[item.label || item.name] || 0,
      // Calculate related counts
      department_count: activeTab === 'business_functions' ? 
        departments.filter(d => d.business_function_name === (item.label || item.name)).length : undefined,
      unit_count: activeTab === 'departments' ? 
        units.filter(u => u.department_name === (item.label || item.name)).length : undefined
    }));

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item => 
        (item.name || item.label || '').toLowerCase().includes(term) ||
        (item.code || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        (item.business_function_name || '').toLowerCase().includes(term) ||
        (item.department_name || '').toLowerCase().includes(term)
      );
    }

    // Filter by active status
    if (!showInactive) {
      data = data.filter(item => item.is_active !== false);
    }

    // Sort data
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle special cases
        if (sortConfig.key === 'employee_count') {
          aVal = a.real_employee_count || a.employee_count || 0;
          bVal = b.real_employee_count || b.employee_count || 0;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return data;
  }, [activeTab, searchTerm, showInactive, sortConfig, businessFunctions, departments, units, jobFunctions, positionGroups, getEmployeeCountsByType]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={12} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronDown size={12} className="text-almet-sapphire" /> : 
      <ChevronRight size={12} className="text-almet-sapphire" />;
  };

  const renderStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      }`}>
        {isActive ? <Check size={10} /> : <X size={10} />}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const renderHierarchyVisualization = () => {
    if (activeTab !== 'position_groups') return null;

    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hierarchy Structure</h3>
        <div className="space-y-3">
          {processedData
            .sort((a, b) => (a.hierarchy_level || 0) - (b.hierarchy_level || 0))
            .map((pg, index) => {
              const colors = hierarchyColors[pg.name] || hierarchyColors['SPECIALIST'];
              const empCount = pg.real_employee_count || 0;
              return (
                <div key={pg.id || index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${colors.border} ${colors.bg}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full ${colors.border.replace('border-', 'bg-')} text-white text-sm font-bold flex items-center justify-center`}>
                        {pg.hierarchy_level}
                      </span>
                      <div>
                        <div className={`font-semibold ${colors.text}`}>{pg.display_name || pg.name}</div>
                        <div className="text-xs text-gray-500 dark:text-almet-bali-hai">
                          {pg.grading_shorthand && `Grading: ${pg.grading_shorthand}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{empCount}</div>
                      <div className="text-xs text-gray-500 dark:text-almet-bali-hai">employees</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openCrudModal(activeTab, 'edit', pg)}
                        className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit"
                      >
                        <Edit size={12} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(activeTab, pg)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete"
                        disabled={loading.crud}
                      >
                        <Trash2 size={12} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const renderTableView = () => {
    const config = getTabConfig(activeTab);
    if (!config) return null;

    if (loading.referenceData) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
          <span className="ml-2 text-gray-600 dark:text-almet-bali-hai text-sm">Loading...</span>
        </div>
      );
    }

    if (processedData.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-almet-san-juan rounded-full flex items-center justify-center mx-auto mb-4">
            {React.createElement(getTabIcon(activeTab), { size: 24, className: "text-gray-400 dark:text-almet-bali-hai" })}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No results found' : 'No data available'}
          </h3>
          <p className="text-gray-500 dark:text-almet-bali-hai text-sm mb-4">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first item.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => openCrudModal(activeTab, 'create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm"
            >
              <Plus size={16} />
              Add First Item
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-almet-san-juan">
              <tr>
                {config.columns.map((column) => (
                  <th 
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-almet-bali-hai uppercase tracking-wider ${
                      column.align === 'center' ? 'text-center' : ''
                    } ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-almet-comet' : ''}`}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-almet-bali-hai uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-almet-cloud-burst divide-y divide-gray-200 dark:divide-almet-comet">
              {processedData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-almet-san-juan transition-colors">
                  {config.columns.map((column) => (
                    <td key={column.key} className={`px-6 py-4 whitespace-nowrap text-sm ${
                      column.align === 'center' ? 'text-center' : ''
                    }`}>
                      {column.key === 'name' && (
                        <div className="flex items-center gap-3">
                          {activeTab === 'position_groups' && (
                            <span className={`w-6 h-6 rounded-full ${
                              hierarchyColors[item.name]?.border.replace('border-', 'bg-') || 'bg-gray-400'
                            } text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                              {item.hierarchy_level}
                            </span>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {item.display_name || item.label || item.name}
                            </div>
                            {item.code && (
                              <div className="text-xs text-gray-500 dark:text-almet-bali-hai">
                                Code: {item.code}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {column.key === 'employee_count' && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {item.real_employee_count || 0}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-almet-bali-hai">
                            {item.real_employee_count > 0 ? 'active' : 'none'}
                          </div>
                        </div>
                      )}
                      {column.key === 'department_count' && (
                        <div className="text-center font-medium text-gray-600 dark:text-almet-bali-hai">
                          {item.department_count || 0}
                        </div>
                      )}
                      {column.key === 'unit_count' && (
                        <div className="text-center font-medium text-gray-600 dark:text-almet-bali-hai">
                          {item.unit_count || 0}
                        </div>
                      )}
                      {column.key === 'hierarchy_level' && (
                        <div className="text-center font-bold text-almet-sapphire">
                          {item.hierarchy_level}
                        </div>
                      )}
                      {column.key === 'grading_shorthand' && (
                        <div className="text-center">
                          {item.grading_shorthand ? (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">
                              {item.grading_shorthand}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      )}
                      {column.key === 'is_active' && (
                        <div className="text-center">
                          {renderStatusBadge(item.is_active !== false)}
                        </div>
                      )}
                      {!['name', 'employee_count', 'department_count', 'unit_count', 'hierarchy_level', 'grading_shorthand', 'is_active'].includes(column.key) && (
                        <div className="text-gray-900 dark:text-white">
                          {item[column.key] || '-'}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openCrudModal(activeTab, 'edit', item)}
                        className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(activeTab, item)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete"
                        disabled={loading.crud}
                      >
                        <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStatsView = () => {
    const totalEmployees = Object.values(getEmployeeCountsByType[activeTab] || {}).reduce((a, b) => a + b, 0);
    const activeItems = processedData.filter(item => item.is_active !== false).length;
    const inactiveItems = processedData.filter(item => item.is_active === false).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet p-6">
          <div className="flex items-center">
            <div className="p-3 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg mr-4">
              <Layers className="h-6 w-6 text-almet-sapphire" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {processedData.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4">
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Inactive</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {inactiveItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalEmployees}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { 
      id: 'business_functions', 
      label: 'Business Functions', 
      data: businessFunctions,
      description: 'Fundamental business areas and organizational divisions'
    },
    { 
      id: 'departments', 
      label: 'Departments', 
      data: departments,
      description: 'Organizational departments within business functions'
    },
    { 
      id: 'units', 
      label: 'Units', 
      data: units,
      description: 'Operational units within departments'
    },
    { 
      id: 'job_functions', 
      label: 'Job Functions', 
      data: jobFunctions,
      description: 'Functional categories for job roles'
    },
    { 
      id: 'position_groups', 
      label: 'Position Groups', 
      data: positionGroups,
      description: 'Hierarchical position levels and grading structure'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-almet-comet">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = getTabIcon(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-almet-sapphire text-almet-sapphire'
                    : 'border-transparent text-gray-500 dark:text-almet-bali-hai hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-almet-comet'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
                <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai text-xs rounded-full">
                  {tab.data?.length || 0}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {activeTabData?.label}
          </h2>
          <p className="text-gray-600 dark:text-almet-bali-hai text-sm mt-1">
            {activeTabData?.description}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-almet-comet overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-50 dark:hover:bg-almet-comet'} transition-colors`}
              title="Table View"
            >
              <Layers size={16} />
            </button>
            {activeTab === 'position_groups' && (
              <button
                onClick={() => setViewMode('hierarchy')}
                className={`px-3 py-2 text-sm ${viewMode === 'hierarchy' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-50 dark:hover:bg-almet-comet'} transition-colors`}
                title="Hierarchy View"
              >
                <TrendingUp size={16} />
              </button>
            )}
            <button
              onClick={() => setViewMode('stats')}
              className={`px-3 py-2 text-sm ${viewMode === 'stats' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-50 dark:hover:bg-almet-comet'} transition-colors`}
              title="Statistics View"
            >
              <Settings size={16} />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showInactive 
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' 
                : 'bg-gray-100 dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-200 dark:hover:bg-almet-comet'
            }`}
          >
            {showInactive ? <EyeOff size={16} /> : <Eye size={16} />}
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </button>

          {/* Add New Button */}
          <button
            onClick={() => openCrudModal(activeTab, 'create')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>
      </div>

      {/* Statistics View */}
      {viewMode === 'stats' && renderStatsView()}

      {/* Content Area */}
      {viewMode === 'table' && renderTableView()}

      {/* Hierarchy View for Position Groups */}
      {viewMode === 'hierarchy' && activeTab === 'position_groups' && renderHierarchyVisualization()}

      {/* Data Summary */}
      {viewMode === 'table' && processedData.length > 0 && (
        <div className="bg-gray-50 dark:bg-almet-san-juan rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-almet-bali-hai">
            <div className="flex items-center gap-4">
              <span>
                Showing <span className="font-medium text-gray-900 dark:text-white">{processedData.length}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{activeTabData?.data?.length || 0}</span> items
              </span>
              {searchTerm && (
                <span>
                  for "<span className="font-medium text-gray-900 dark:text-white">{searchTerm}</span>"
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>
                Total Employees: <span className="font-medium text-gray-900 dark:text-white">
                  {Object.values(getEmployeeCountsByType[activeTab] || {}).reduce((a, b) => a + b, 0)}
                </span>
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-almet-sapphire hover:text-almet-astral transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}