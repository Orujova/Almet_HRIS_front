// src/components/headcount/QuickFilterBar.jsx - Updated with backend integration
import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const FilterPill = ({ label, active, onClick }) => {
  const { darkMode } = useTheme();
  
  return (
    <button
      className={`px-2 py-1 rounded-full text-xs flex items-center mr-2 transition-colors ${
        active 
          ? darkMode 
            ? 'bg-almet-sapphire text-white' 
            : 'bg-almet-sapphire text-white'
          : darkMode
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      onClick={onClick}
    >
      {label}
      {active && <X size={12} className="ml-1" />}
    </button>
  );
};

const QuickFilterBar = ({ 
  onStatusChange, 
  onOfficeChange, 
  onDepartmentChange,
  statusFilter, 
  officeFilter, 
  departmentFilter,
  activeFilters = [],
  onClearFilter,
  filterOptions = {}
}) => {
  const { darkMode } = useTheme();
  
  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";

  // Extract options from backend filter options
  const statusOptions = filterOptions?.statuses || [];
  const departmentOptions = filterOptions?.departments || [];
  
  // Default office options (until backend provides office data)
  const officeOptions = [
    { id: 'baku', name: 'Baku Office' },
    { id: 'dubai', name: 'Dubai Office' },
    { id: 'tbilisi', name: 'Tbilisi Office' },
    { id: 'london', name: 'London Office' }
  ];
  
  return (
    <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
      {/* Active filter pills */}
      <div className="flex flex-wrap">
        {activeFilters && activeFilters.map((filter, index) => (
          <FilterPill
            key={index}
            label={filter.label}
            active={true}
            onClick={() => onClearFilter(filter.key)}
          />
        ))}
      </div>
      
      {/* Dropdown filters */}
      <div className="flex space-x-2 flex-wrap">
        {/* Status Filter */}
        <div className="relative">
          <select
            className={`p-1.5 pr-6 text-xs rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status.id} value={status.name}>
                {status.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
            <ChevronDown size={12} className={textMuted} />
          </div>
        </div>
        
        {/* Office Filter */}
        <div className="relative">
          <select
            className={`p-1.5 pr-6 text-xs rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            value={officeFilter}
            onChange={(e) => onOfficeChange(e.target.value)}
          >
            <option value="all">All Offices</option>
            {officeOptions.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
            <ChevronDown size={12} className={textMuted} />
          </div>
        </div>
        
        {/* Department Filter */}
        <div className="relative">
          <select
            className={`p-1.5 text-xs pr-6 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            value={departmentFilter}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departmentOptions.map((department) => (
              <option key={department.id} value={department.name}>
                {department.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
            <ChevronDown size={12} className={textMuted} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickFilterBar;