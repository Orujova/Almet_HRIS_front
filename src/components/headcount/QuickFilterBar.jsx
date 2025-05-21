import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const FilterPill = ({ label, active, onClick }) => {
  const { darkMode } = useTheme();
  
  return (
    <button
      className={`px-3 py-1.5 rounded-full text-sm flex items-center mr-2 ${
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
      {active && <X size={14} className="ml-1" />}
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
  activeFilters,
  onClearFilter
}) => {
  const { darkMode } = useTheme();
  
  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";
  
  return (
    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
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
        <div className="relative">
          <select
            className={`p-2 pr-8 text-sm  rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on boarding">On Boarding</option>
            <option value="probation">Probation</option>
            <option value="on leave">On Leave</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <ChevronDown size={16} className={textMuted} />
          </div>
        </div>
        
        <div className="relative">
          <select
            className={`p-2 pr-8 text-sm  rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            value={officeFilter}
            onChange={(e) => onOfficeChange(e.target.value)}
          >
            <option value="all">All Offices</option>
            <option value="baku">Baku Office</option>
            <option value="dubai">Dubai Office</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <ChevronDown size={16} className={textMuted} />
          </div>
        </div>
        
        <div className="relative">
          <select
            className={`p-2 text-sm  pr-8 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            value={departmentFilter}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="business development">Business Development</option>
            <option value="administrative">Administrative</option>
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
            <option value="compliance">Compliance</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <ChevronDown size={16} className={textMuted} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickFilterBar;