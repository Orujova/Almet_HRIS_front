import { useState } from "react";
import { X, ChevronDown, Search, AlertCircle } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import MultiSelectDropdown from "./MultiSelectDropdown";

const AdvancedFilterPanel = ({ onApply, onClose, initialFilters = {} }) => {
  const { darkMode } = useTheme();
  const [filters, setFilters] = useState({
    employeeName: initialFilters.employeeName || "",
    employeeId: initialFilters.employeeId || "",
    businessFunctions: initialFilters.businessFunctions || [],
    departments: initialFilters.departments || [],
    units: initialFilters.units || [],
    jobFunctions: initialFilters.jobFunctions || [],
    positionGroups: initialFilters.positionGroups || [],
    jobTitles: initialFilters.jobTitles || [],
    lineManager: initialFilters.lineManager || "",
    lineManagerId: initialFilters.lineManagerId || "",
    startDate: initialFilters.startDate || "",
    endDate: initialFilters.endDate || "",
    grades: initialFilters.grades || [],
  });

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";
  const btnPrimary = darkMode
    ? "bg-almet-sapphire hover:bg-almet-astral"
    : "bg-almet-sapphire hover:bg-almet-astral";

  // Mock data for dropdowns
  const businessFunctionOptions = ["Holding", "Trading", "Georgia", "UK"];
  const departmentOptions = ["BUSINESS DEVELOPMENT", "ADMINISTRATIVE", "FINANCE", "HR", "COMPLIANCE", "OPERATIONS", "PROJECTS MANAGEMENT", "TRADE", "STOCK SALES"];
  const unitOptions = ["BUSINESS DEVELOPMENT", "BUSINESS SUPPORT", "PRODUCT DEVELOPMENT", "CORE OPERATIONS", "COMMERCE", "STRATEGY EXECUTION"];
  const jobFunctionOptions = ["DEPUTY CHAIRMAN ON FINANCE & BUSINESS DEVELOPMENT", "ADMINISTRATION", "FINANCE OPERATIONS", "HR OPERATIONS", "LEGAL", "LOGISTICS", "PROJECTS MANAGEMENT"];
  const positionGroupOptions = ["VC", "DIRECTOR", "MANAGER", "HEAD OF DEPARTMENT", "SENIOR SPECIALIST", "SPECIALIST", "JUNIOR SPECIALIST", "BLUE COLLAR"];
  const jobTitleOptions = ["Direktor müavini", "DIRECTOR", "CHIEF ACCOUNTANT", "ADMINISTRATION SPECIALIST", "DRIVER", "FACILITIES ASSISTANT"];
  const gradeOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const handleInputChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name, values) => {
    setFilters(prev => ({ ...prev, [name]: values }));
  };

  const handleReset = () => {
    setFilters({
      employeeName: "",
      employeeId: "",
      businessFunctions: [],
      departments: [],
      units: [],
      jobFunctions: [],
      positionGroups: [],
      jobTitles: [],
      lineManager: "",
      lineManagerId: "",
      startDate: "",
      endDate: "",
      grades: [],
    });
  };

  const handleApply = () => {
    onApply(filters);
  };

  const nonEmptyFilters = Object.entries(filters).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== "";
  }).length;

  return (
    <div className={`${bgCard} p-6 rounded-lg border ${borderColor} mb-6 relative`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h3 className={`text-lg font-medium ${textPrimary}`}>Advanced Filters</h3>
          <span className="ml-3 px-2 py-0.5 bg-almet-sapphire text-white text-xs rounded-full">
            {nonEmptyFilters} active
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={20} className={textPrimary} />
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2`}>Basic Information</h4>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Employee Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.employeeName}
                onChange={(e) => handleInputChange("employeeName", e.target.value)}
                className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary}`}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Employee HC Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter HC number..."
                value={filters.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
                className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary}`}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Line Manager
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by manager name..."
                value={filters.lineManager}
                onChange={(e) => handleInputChange("lineManager", e.target.value)}
                className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary}`}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Line Manager HC Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter manager HC number..."
                value={filters.lineManagerId}
                onChange={(e) => handleInputChange("lineManagerId", e.target.value)}
                className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary}`}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
        </div>
        
        {/* Middle Column - Organizational */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2`}>Organizational</h4>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Business Functions
            </label>
            <MultiSelectDropdown
              options={businessFunctionOptions}
              placeholder="Select business functions..."
              selectedValues={filters.businessFunctions}
              onChange={(values) => handleMultiSelectChange("businessFunctions", values)}
            />
          </div>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Departments
            </label>
            <MultiSelectDropdown
              options={departmentOptions}
              placeholder="Select departments..."
              selectedValues={filters.departments}
              onChange={(values) => handleMultiSelectChange("departments", values)}
            />
          </div>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Units
            </label>
            <MultiSelectDropdown
              options={unitOptions}
              placeholder="Select units..."
              selectedValues={filters.units}
              onChange={(values) => handleMultiSelectChange("units", values)}
            />
          </div>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Position Groups
            </label>
            <MultiSelectDropdown
              options={positionGroupOptions}
              placeholder="Select position groups..."
              selectedValues={filters.positionGroups}
              onChange={(values) => handleMultiSelectChange("positionGroups", values)}
            />
          </div>
        </div>
        
        {/* Right Column - Job & Dates */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2`}>Job & Dates</h4>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Job Functions
            </label>
            <MultiSelectDropdown
              options={jobFunctionOptions}
              placeholder="Select job functions..."
              selectedValues={filters.jobFunctions}
              onChange={(values) => handleMultiSelectChange("jobFunctions", values)}
            />
          </div>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Job Titles
            </label>
            <MultiSelectDropdown
              options={jobTitleOptions}
              placeholder="Select job titles..."
              selectedValues={filters.jobTitles}
              onChange={(values) => handleMultiSelectChange("jobTitles", values)}
            />
          </div>
          
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
              Grades
            </label>
            <MultiSelectDropdown
              options={gradeOptions}
              placeholder="Select grades..."
              selectedValues={filters.grades}
              onChange={(values) => handleMultiSelectChange("grades", values)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
                Start Date (From)
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary}`}
              />
            </div>
            <div>
              <label className={`block ${textSecondary} text-sm font-medium mb-1`}>
                End Date (To)
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Reset Filters
        </button>
        <button
          onClick={handleApply}
          className={`${btnPrimary} text-white px-4 py-2 rounded-md`}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilterPanel;