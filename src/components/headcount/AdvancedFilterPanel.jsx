// src/components/headcount/AdvancedFilterPanel.jsx - Enhanced with Multi-Selection Support
import { useState, useEffect } from "react";
import { X, Search, AlertCircle, Filter, Check, ChevronDown } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import MultiSelectDropdown from "./MultiSelectDropdown";

/**
 * Enhanced Advanced Filter Panel with comprehensive multi-selection support
 * - All filters support multi-selection where appropriate
 * - Real-time filter options from backend
 * - Hierarchical filtering (business function -> department -> unit)
 * - Date range filtering
 * - Tag-based filtering
 */
const AdvancedFilterPanel = ({ onApply, onClose, initialFilters = {}, filterOptions = {} }) => {
  const { darkMode } = useTheme();

  // Local filter state
  const [filters, setFilters] = useState({
    // Basic Information
    employeeName: "",
    employeeId: "",
    email: "",
    
    // Organizational Structure (Multi-select)
    businessFunctions: [],
    departments: [],
    units: [],
    jobFunctions: [],
    positionGroups: [],
    
    // Employment Details (Multi-select)
    statuses: [],
    grades: [],
    contractDurations: [],
    
    // Management
    lineManagers: [],
    hasLineManager: "", // "yes", "no", ""
    
    // Tags (Multi-select)
    tags: [],
    tagTypes: [],
    
    // Date Ranges
    startDateFrom: "",
    startDateTo: "",
    contractEndDateFrom: "",
    contractEndDateTo: "",
    
    // Personal Information
    genders: [],
    ageRanges: [],
    
    // Additional Filters
    yearsOfServiceMin: "",
    yearsOfServiceMax: "",
    hasDocuments: "", // "yes", "no", ""
    isActive: "", // "yes", "no", ""
    
    ...initialFilters
  });

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-50";

  // Extract options from backend with fallbacks
  const businessFunctionOptions = (filterOptions?.businessFunctions || []).map(bf => ({
    value: bf.id,
    label: bf.name,
    code: bf.code
  }));

  const departmentOptions = (filterOptions?.departments || []).map(dept => ({
    value: dept.id,
    label: dept.name,
    businessFunction: dept.business_function_id
  }));

  const unitOptions = (filterOptions?.units || []).map(unit => ({
    value: unit.id,
    label: unit.name,
    department: unit.department_id
  }));

  const jobFunctionOptions = (filterOptions?.jobFunctions || []).map(jf => ({
    value: jf.id,
    label: jf.name
  }));

  const positionGroupOptions = (filterOptions?.positionGroups || []).map(pg => ({
    value: pg.id,
    label: pg.name,
    level: pg.level
  }));

  const statusOptions = (filterOptions?.statuses || []).map(status => ({
    value: status.id,
    label: status.name,
    color: status.color,
    affectsHeadcount: status.affects_headcount
  }));

  const gradeOptions = (filterOptions?.grades || []).map(grade => ({
    value: grade.level,
    label: grade.short_code || grade.level,
    description: grade.name
  }));

  const contractDurationOptions = (filterOptions?.contractDurations || []).map(duration => ({
    value: duration,
    label: duration
  }));

  const lineManagerOptions = (filterOptions?.lineManagers || []).map(lm => ({
    value: lm.id,
    label: lm.full_name || `${lm.first_name} ${lm.last_name}`,
    jobTitle: lm.job_title,
    department: lm.department_name
  }));

  const tagOptions = (filterOptions?.tags || []).map(tag => ({
    value: tag.id,
    label: tag.name,
    type: tag.tag_type,
    description: tag.description
  }));

  // Tag type options
  const tagTypeOptions = [
    { value: "skill", label: "Skills" },
    { value: "department", label: "Department Tags" },
    { value: "project", label: "Projects" },
    { value: "certification", label: "Certifications" },
    { value: "other", label: "Other" }
  ];

  // Gender options
  const genderOptions = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
    { value: "O", label: "Other" },
    { value: "N", label: "Prefer not to say" }
  ];

  // Age range options
  const ageRangeOptions = [
    { value: "18-25", label: "18-25 years" },
    { value: "26-35", label: "26-35 years" },
    { value: "36-45", label: "36-45 years" },
    { value: "46-55", label: "46-55 years" },
    { value: "56-65", label: "56-65 years" },
    { value: "65+", label: "65+ years" }
  ];

  // Boolean filter options
  const booleanOptions = [
    { value: "", label: "All" },
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" }
  ];

  // Filter departments based on selected business functions
  const getFilteredDepartments = () => {
    if (filters.businessFunctions.length === 0) return departmentOptions;
    return departmentOptions.filter(dept => 
      filters.businessFunctions.includes(dept.businessFunction)
    );
  };

  // Filter units based on selected departments
  const getFilteredUnits = () => {
    if (filters.departments.length === 0) return unitOptions;
    return unitOptions.filter(unit => 
      filters.departments.includes(unit.department)
    );
  };

  // Filter tags based on selected tag types
  const getFilteredTags = () => {
    if (filters.tagTypes.length === 0) return tagOptions;
    return tagOptions.filter(tag => 
      filters.tagTypes.includes(tag.type)
    );
  };

  // Handle single value change
  const handleInputChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle multi-select change
  const handleMultiSelectChange = (name, values) => {
    setFilters(prev => ({
      ...prev,
      [name]: Array.isArray(values) ? values : []
    }));

    // Clear dependent filters when parent changes
    if (name === 'businessFunctions') {
      setFilters(prev => ({
        ...prev,
        departments: [],
        units: []
      }));
    } else if (name === 'departments') {
      setFilters(prev => ({
        ...prev,
        units: []
      }));
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setFilters({
      employeeName: "",
      employeeId: "",
      email: "",
      businessFunctions: [],
      departments: [],
      units: [],
      jobFunctions: [],
      positionGroups: [],
      statuses: [],
      grades: [],
      contractDurations: [],
      lineManagers: [],
      hasLineManager: "",
      tags: [],
      tagTypes: [],
      startDateFrom: "",
      startDateTo: "",
      contractEndDateFrom: "",
      contractEndDateTo: "",
      genders: [],
      ageRanges: [],
      yearsOfServiceMin: "",
      yearsOfServiceMax: "",
      hasDocuments: "",
      isActive: ""
    });
  };

  // Apply filters
  const handleApply = () => {
    // Clean up empty values before applying
    const cleanedFilters = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          cleanedFilters[key] = value;
        }
      } else if (value && value.trim && value.trim() !== "") {
        cleanedFilters[key] = value.trim();
      } else if (value && !value.trim) {
        cleanedFilters[key] = value;
      }
    });

    onApply(cleanedFilters);
  };

  // Count active filters
  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== "" && value !== null && value !== undefined;
    }).length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`${bgCard} p-6 rounded-lg border ${borderColor} mb-6 relative`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-almet-sapphire mr-2" />
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            Advanced Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="ml-3 px-2 py-1 bg-almet-sapphire text-white text-xs rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className={`text-sm px-3 py-1 rounded ${textMuted} hover:text-red-500 transition-colors`}
            disabled={activeFilterCount === 0}
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} className={textSecondary} />
          </button>
        </div>
      </div>

      {/* Info about backend data */}
      {(!filterOptions || Object.keys(filterOptions).length === 0) && (
        <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
            <span className="text-sm text-yellow-800 dark:text-yellow-300">
              Loading filter options from server...
            </span>
          </div>
        </div>
      )}

      {/* Filter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
            Basic Information
          </h4>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Employee Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.employeeName}
                onChange={(e) => handleInputChange('employeeName', e.target.value)}
                className={`w-full p-3 pl-10 pr-4 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Employee ID
            </label>
            <input
              type="text"
              placeholder="Enter employee ID..."
              value={filters.employeeId}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Employment Status
            </label>
            <MultiSelectDropdown
              options={statusOptions}
              placeholder="Select statuses..."
              selectedValues={filters.statuses}
              onChange={(values) => handleMultiSelectChange("statuses", values)}
              showColors={true}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Contract Duration
            </label>
            <MultiSelectDropdown
              options={contractDurationOptions}
              placeholder="Select contract types..."
              selectedValues={filters.contractDurations}
              onChange={(values) => handleMultiSelectChange("contractDurations", values)}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Gender
            </label>
            <MultiSelectDropdown
              options={genderOptions}
              placeholder="Select genders..."
              selectedValues={filters.genders}
              onChange={(values) => handleMultiSelectChange("genders", values)}
            />
          </div>
        </div>

        {/* Middle Column - Organizational Structure */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
            Organizational Structure
          </h4>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Business Functions
            </label>
            <MultiSelectDropdown
              options={businessFunctionOptions}
              placeholder="Select business functions..."
              selectedValues={filters.businessFunctions}
              onChange={(values) => handleMultiSelectChange("businessFunctions", values)}
              showCodes={true}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Departments
            </label>
            <MultiSelectDropdown
              options={getFilteredDepartments()}
              placeholder="Select departments..."
              selectedValues={filters.departments}
              onChange={(values) => handleMultiSelectChange("departments", values)}
              disabled={filters.businessFunctions.length === 0}
            />
            {filters.businessFunctions.length === 0 && (
              <p className={`text-xs ${textMuted} mt-1`}>
                Select business functions first
              </p>
            )}
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Units
            </label>
            <MultiSelectDropdown
              options={getFilteredUnits()}
              placeholder="Select units..."
              selectedValues={filters.units}
              onChange={(values) => handleMultiSelectChange("units", values)}
              disabled={filters.departments.length === 0}
            />
            {filters.departments.length === 0 && (
              <p className={`text-xs ${textMuted} mt-1`}>
                Select departments first
              </p>
            )}
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
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
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Position Groups
            </label>
            <MultiSelectDropdown
              options={positionGroupOptions}
              placeholder="Select position groups..."
              selectedValues={filters.positionGroups}
              onChange={(values) => handleMultiSelectChange("positionGroups", values)}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Grading Levels
            </label>
            <MultiSelectDropdown
              options={gradeOptions}
              placeholder="Select grades..."
              selectedValues={filters.grades}
              onChange={(values) => handleMultiSelectChange("grades", values)}
              showDescriptions={true}
            />
          </div>
        </div>

        {/* Right Column - Management & Additional */}
        <div className="space-y-4">
          <h4 className={`font-medium ${textPrimary} border-b ${borderColor} pb-2 text-sm`}>
            Management & Additional
          </h4>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Line Managers
            </label>
            <MultiSelectDropdown
              options={lineManagerOptions}
              placeholder="Select line managers..."
              selectedValues={filters.lineManagers}
              onChange={(values) => handleMultiSelectChange("lineManagers", values)}
              showSubtitles={true}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Has Line Manager
            </label>
            <select
              value={filters.hasLineManager}
              onChange={(e) => handleInputChange('hasLineManager', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            >
              {booleanOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Tag Types
            </label>
            <MultiSelectDropdown
              options={tagTypeOptions}
              placeholder="Select tag types..."
              selectedValues={filters.tagTypes}
              onChange={(values) => handleMultiSelectChange("tagTypes", values)}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Tags
            </label>
            <MultiSelectDropdown
              options={getFilteredTags()}
              placeholder="Select tags..."
              selectedValues={filters.tags}
              onChange={(values) => handleMultiSelectChange("tags", values)}
              showDescriptions={true}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Age Range
            </label>
            <MultiSelectDropdown
              options={ageRangeOptions}
              placeholder="Select age ranges..."
              selectedValues={filters.ageRanges}
              onChange={(values) => handleMultiSelectChange("ageRanges", values)}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Has Documents
            </label>
            <select
              value={filters.hasDocuments}
              onChange={(e) => handleInputChange('hasDocuments', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            >
              {booleanOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Date Filters Section */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className={`font-medium ${textPrimary} mb-4 text-sm`}>
          Date Ranges
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Start Date From
            </label>
            <input
              type="date"
              value={filters.startDateFrom}
              onChange={(e) => handleInputChange('startDateFrom', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Start Date To
            </label>
            <input
              type="date"
              value={filters.startDateTo}
              onChange={(e) => handleInputChange('startDateTo', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Contract End From
            </label>
            <input
              type="date"
              value={filters.contractEndDateFrom}
              onChange={(e) => handleInputChange('contractEndDateFrom', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Contract End To
            </label>
            <input
              type="date"
              value={filters.contractEndDateTo}
              onChange={(e) => handleInputChange('contractEndDateTo', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>
        </div>
      </div>

      {/* Years of Service Filter */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className={`font-medium ${textPrimary} mb-4 text-sm`}>
          Years of Service
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Minimum Years
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={filters.yearsOfServiceMin}
              onChange={(e) => handleInputChange('yearsOfServiceMin', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-sm font-medium mb-2`}>
              Maximum Years
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="No limit"
              value={filters.yearsOfServiceMax}
              onChange={(e) => handleInputChange('yearsOfServiceMax', e.target.value)}
              className={`w-full p-3 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <AlertCircle size={16} className="mr-2" />
          Filters are applied in real-time and support multi-selection for better precision
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleClearAll}
            disabled={activeFilterCount === 0}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors flex items-center"
          >
            <Filter size={16} className="mr-2" />
            Apply Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h5 className={`text-sm font-medium text-blue-800 dark:text-blue-300 mb-2`}>
            Active Filters Summary
          </h5>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                return (
                  <span key={key} className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {key}: {value.length} selected
                    <button
                      onClick={() => handleMultiSelectChange(key, [])}
                      className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              } else if (value && value !== "") {
                return (
                  <span key={key} className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {key}: {value}
                    <button
                      onClick={() => handleInputChange(key, "")}
                      className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;