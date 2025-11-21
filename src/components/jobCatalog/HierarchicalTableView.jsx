// src/components/jobCatalog/HierarchicalTableView.jsx
// CLEAR AND SIMPLE HIERARCHICAL TABLE VIEW

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Users, Loader2, Building2, Target, Briefcase, Award } from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import { getHierarchyColor } from './HierarchyColors';

export default function HierarchicalTableView({ context }) {
  const { employees, loading, setSelectedJob } = context;
  const { darkMode } = useTheme();
  
  // State to track which rows are expanded
  const [expandedRows, setExpandedRows] = useState({
    departments: {},    // Departments
    units: {},          // Units
    functions: {},      // Job Functions
    hierarchies: {}     // Hierarchies
  });

  // Build table structure from employee data
  const tableStructure = useMemo(() => {
    if (!employees || !Array.isArray(employees)) return {};

    const structure = {};

    employees.forEach(emp => {
      // Get name for each level
      const deptName = emp.department_name || 'Unassigned';
      const unitName = emp.unit_name || 'Unassigned';
      const funcName = emp.job_function_name || 'Unassigned';
      const hierarchyName = emp.position_group_name || 'Unassigned';
      const titleName = emp.job_title || 'Unassigned';

      // Create structure level by level
      if (!structure[deptName]) {
        structure[deptName] = { units: {}, totalEmployees: 0 };
      }
      
      if (!structure[deptName].units[unitName]) {
        structure[deptName].units[unitName] = { functions: {}, totalEmployees: 0 };
      }
      
      if (!structure[deptName].units[unitName].functions[funcName]) {
        structure[deptName].units[unitName].functions[funcName] = { hierarchies: {}, totalEmployees: 0 };
      }
      
      if (!structure[deptName].units[unitName].functions[funcName].hierarchies[hierarchyName]) {
        structure[deptName].units[unitName].functions[funcName].hierarchies[hierarchyName] = {
          titles: {},
          totalEmployees: 0,
          employees: []
        };
      }
      
      if (!structure[deptName].units[unitName].functions[funcName].hierarchies[hierarchyName].titles[titleName]) {
        structure[deptName].units[unitName].functions[funcName].hierarchies[hierarchyName].titles[titleName] = [];
      }

      // Add employee
      structure[deptName].units[unitName].functions[funcName].hierarchies[hierarchyName].titles[titleName].push(emp);
      structure[deptName].units[unitName].functions[funcName].hierarchies[hierarchyName].employees.push(emp);
      
      // Increment counts
      structure[deptName].units[unitName].functions[funcName].hierarchies[hierarchyName].totalEmployees++;
      structure[deptName].units[unitName].functions[funcName].totalEmployees++;
      structure[deptName].units[unitName].totalEmployees++;
      structure[deptName].totalEmployees++;
    });

    return structure;
  }, [employees]);

  // Toggle row open/closed
  const toggleRow = (level, key) => {
    setExpandedRows(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [key]: !prev[level][key]
      }
    }));
  };

  // Expand all rows
  const expandAll = () => {
    const newExpanded = {
      departments: {},
      units: {},
      functions: {},
      hierarchies: {}
    };

    Object.keys(tableStructure).forEach(deptName => {
      newExpanded.departments[deptName] = true;
      
      Object.keys(tableStructure[deptName].units).forEach(unitName => {
        const unitKey = `${deptName}|${unitName}`;
        newExpanded.units[unitKey] = true;
        
        Object.keys(tableStructure[deptName].units[unitName].functions).forEach(funcName => {
          const funcKey = `${deptName}|${unitName}|${funcName}`;
          newExpanded.functions[funcKey] = true;
          
          Object.keys(tableStructure[deptName].units[unitName].functions[funcName].hierarchies).forEach(hierarchyName => {
            const hierKey = `${deptName}|${unitName}|${funcName}|${hierarchyName}`;
            newExpanded.hierarchies[hierKey] = true;
          });
        });
      });
    });

    setExpandedRows(newExpanded);
  };

  // Collapse all rows
  const collapseAll = () => {
    setExpandedRows({
      departments: {},
      units: {},
      functions: {},
      hierarchies: {}
    });
  };

  // Loading indicator
  if (loading.employees) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-almet-sapphire" />
        <span className="ml-2 text-gray-600 dark:text-almet-bali-hai text-xs">Loading...</span>
      </div>
    );
  }

  // No data state
  if (!employees || employees.length === 0) {
    return (
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-8 text-center border border-gray-200 dark:border-almet-comet">
        <Building2 size={48} className="mx-auto text-gray-400 dark:text-almet-bali-hai mb-3" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No Data Available</h3>
        <p className="text-xs text-gray-500 dark:text-almet-bali-hai">No employee data found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-sm border border-gray-200 dark:border-almet-comet">
      
      {/* Header and buttons */}
      <div className="p-4 border-b border-gray-200 dark:border-almet-comet flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Job Catalogue - Hierarchical View
          </h2>
          <p className="text-xs text-gray-600 dark:text-almet-bali-hai">
            Department → Unit → Job Function → Hierarchy → Title
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-almet-comet text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-almet-san-juan transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-almet-sapphire text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20">
                <div className="flex items-center gap-2">
                  <Target size={14} />
                  Department
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20">
                <div className="flex items-center gap-2">
                  <Building2 size={14} />
                  Unit
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-white/20">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} />
                  Job Function
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase border-r border-white/20">
                <div className="flex items-center justify-center gap-2">
                  <Award size={14} />
                  Hierarchy
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Title
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tableStructure).map(([deptName, deptData]) => {
              const isDeptOpen = expandedRows.departments[deptName];
              
              return (
                <React.Fragment key={deptName}>
                  
                  {/* 1. DEPARTMENT ROW (TOP LEVEL) */}
                  <tr 
                    className="border-b border-gray-200 dark:border-almet-comet bg-gray-50 dark:bg-almet-san-juan cursor-pointer hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
                    onClick={() => toggleRow('departments', deptName)}
                  >
                    <td className="px-4 py-3 font-bold text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet" colSpan="5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isDeptOpen ? 
                            <ChevronDown size={16} className="text-almet-sapphire" /> : 
                            <ChevronRight size={16} className="text-gray-400" />
                          }
                          <Target size={14} className="text-almet-sapphire" />
                          <span>{deptName}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-almet-sapphire text-white text-xs rounded-md font-semibold">
                          {deptData.totalEmployees} employees
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* If department is open, show Units */}
                  {isDeptOpen && Object.entries(deptData.units).map(([unitName, unitData]) => {
                    const unitKey = `${deptName}|${unitName}`;
                    const isUnitOpen = expandedRows.units[unitKey];
                    
                    return (
                      <React.Fragment key={unitKey}>
                        
                        {/* 2. UNIT ROW */}
                        <tr 
                          className="border-b border-gray-200 dark:border-almet-comet bg-white dark:bg-almet-cloud-burst cursor-pointer hover:bg-gray-50 dark:hover:bg-almet-san-juan transition-colors"
                          onClick={() => toggleRow('units', unitKey)}
                        >
                          <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-gray-50/50 dark:bg-almet-san-juan/50"></td>
                          <td className="px-4 py-3 font-semibold text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet" colSpan="4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 pl-4">
                                {isUnitOpen ? 
                                  <ChevronDown size={14} className="text-almet-sapphire" /> : 
                                  <ChevronRight size={14} className="text-gray-400" />
                                }
                                <Building2 size={12} className="text-gray-500" />
                                <span>{unitName}</span>
                              </div>
                              <span className="px-2 py-0.5 bg-gray-200 dark:bg-almet-comet text-gray-700 dark:text-white text-xs rounded-md font-medium">
                                {unitData.totalEmployees} employees
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* If unit is open, show Functions */}
                        {isUnitOpen && Object.entries(unitData.functions).map(([funcName, funcData]) => {
                          const funcKey = `${deptName}|${unitName}|${funcName}`;
                          const isFuncOpen = expandedRows.functions[funcKey];
                          
                          return (
                            <React.Fragment key={funcKey}>
                              
                              {/* 3. JOB FUNCTION ROW */}
                              <tr 
                                className="border-b border-gray-200 dark:border-almet-comet bg-gray-50 dark:bg-almet-san-juan cursor-pointer hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors"
                                onClick={() => toggleRow('functions', funcKey)}
                              >
                                <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-gray-50/50 dark:bg-almet-san-juan/50"></td>
                                <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-white/50 dark:bg-almet-cloud-burst/50"></td>
                                <td className="px-4 py-3 font-medium text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-almet-comet" colSpan="3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 pl-8">
                                      {isFuncOpen ? 
                                        <ChevronDown size={14} className="text-almet-sapphire" /> : 
                                        <ChevronRight size={14} className="text-gray-400" />
                                      }
                                      <Briefcase size={12} className="text-gray-500" />
                                      <span>{funcName}</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-almet-comet text-gray-700 dark:text-white text-xs rounded-md font-medium">
                                      {funcData.totalEmployees} employees
                                    </span>
                                  </div>
                                </td>
                              </tr>

                              {/* If function is open, show Hierarchies */}
                              {isFuncOpen && Object.entries(funcData.hierarchies).map(([hierarchyName, hierarchyData]) => {
                                const hierKey = `${deptName}|${unitName}|${funcName}|${hierarchyName}`;
                                const isHierOpen = expandedRows.hierarchies[hierKey];
                                const colors = getHierarchyColor(hierarchyName, darkMode);
                                
                                return (
                                  <React.Fragment key={hierKey}>
                                    
                                    {/* 4. HIERARCHY ROW */}
                                    <tr 
                                      className="border-b border-gray-200 dark:border-almet-comet bg-white dark:bg-almet-cloud-burst cursor-pointer hover:bg-gray-50 dark:hover:bg-almet-san-juan transition-colors"
                                      onClick={() => toggleRow('hierarchies', hierKey)}
                                    >
                                      <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-gray-50/50 dark:bg-almet-san-juan/50"></td>
                                      <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-white/50 dark:bg-almet-cloud-burst/50"></td>
                                      <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-gray-50/50 dark:bg-almet-san-juan/50"></td>
                                      <td className="px-4 py-3 border-r border-gray-200 dark:border-almet-comet" colSpan="2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 pl-12">
                                            {isHierOpen ? 
                                              <ChevronDown size={12} className="text-almet-sapphire" /> : 
                                              <ChevronRight size={12} className="text-gray-400" />
                                            }
                                            <span 
                                              className="px-2.5 py-1 rounded text-xs font-semibold"
                                              style={{
                                                backgroundColor: colors.backgroundColor,
                                                color: colors.textColor,
                                                border: `1px solid ${colors.borderColor}`
                                              }}
                                            >
                                              {hierarchyName}
                                            </span>
                                          </div>
                                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-almet-comet text-gray-700 dark:text-white text-xs rounded-md font-medium">
                                            {hierarchyData.totalEmployees} employees
                                          </span>
                                        </div>
                                      </td>
                                    </tr>

                                    {/* If hierarchy is open, show Titles */}
                                    {isHierOpen && Object.entries(hierarchyData.titles).map(([titleName, empList]) => (
                                      <tr 
                                        key={`${hierKey}-${titleName}`}
                                        className="border-b border-gray-100 dark:border-almet-comet/50 bg-white dark:bg-almet-cloud-burst hover:bg-almet-sapphire/5 dark:hover:bg-almet-sapphire/10 cursor-pointer transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const jobData = {
                                            id: `${deptName}-${unitName}-${funcName}-${hierarchyName}-${titleName}`,
                                            department: deptName,
                                            unit: unitName,
                                            jobFunction: funcName,
                                            hierarchy: hierarchyName,
                                            title: titleName,
                                            currentEmployees: empList.length,
                                            employees: empList
                                          };
                                          setSelectedJob(jobData);
                                        }}
                                      >
                                        <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-gray-50/30 dark:bg-almet-san-juan/30"></td>
                                        <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-white/30 dark:bg-almet-cloud-burst/30"></td>
                                        <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-gray-50/30 dark:bg-almet-san-juan/30"></td>
                                        <td className="px-4 py-2 border-r border-gray-200 dark:border-almet-comet bg-white/30 dark:bg-almet-cloud-burst/30"></td>
                                        <td className="px-4 py-2.5">
                                          <div className="flex items-center justify-between pl-16">
                                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                                              {titleName}
                                            </span>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded-md text-xs font-medium">
                                              <Users size={11} />
                                              <span>{empList.length}</span>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="p-3 bg-gray-50 dark:bg-almet-san-juan border-t border-gray-200 dark:border-almet-comet">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-almet-bali-hai">
              <strong className="text-gray-900 dark:text-white">{Object.keys(tableStructure).length}</strong> Departments
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-almet-bali-hai">
              <strong className="text-gray-900 dark:text-white">{employees.length}</strong> Total Employees
            </span>
          </div>
          <span className="text-gray-500 dark:text-almet-bali-hai italic">
            Click on rows to expand/collapse or view details
          </span>
        </div>
      </div>
    </div>
  );
}