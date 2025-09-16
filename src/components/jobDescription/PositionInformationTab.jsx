import React, { useState, useRef, useEffect } from 'react';
import { 
  UserCheck,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Target,
  RefreshCw,
  Eye
} from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import jobDescriptionService from '@/services/jobDescriptionService';

const PositionInformationTab = ({
  formData,
  dropdownData,
  selectedPositionGroup,
  matchingEmployees,
  validationErrors,
  onFormDataChange,
  onPositionGroupChange,
  onMatchingEmployeesChange, // NEW: callback to update matching employees
  darkMode
}) => {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [lastPreviewCriteria, setLastPreviewCriteria] = useState(null);
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // Helper function to get employees filtered by current selections
  const getFilteredEmployees = (excludeField = null) => {
    if (!dropdownData.employees) return [];
    
    let filtered = dropdownData.employees;
    
    // Apply filters based on current form data (excluding the field being updated)
    if (excludeField !== 'business_function' && formData.business_function) {
      filtered = filtered.filter(emp => emp.business_function_name === formData.business_function);
    }
    
    if (excludeField !== 'department' && formData.department) {
      filtered = filtered.filter(emp => emp.department_name === formData.department);
    }
    
    if (excludeField !== 'unit' && formData.unit) {
      filtered = filtered.filter(emp => emp.unit_name === formData.unit);
    }
    
    if (excludeField !== 'job_function' && formData.job_function) {
      filtered = filtered.filter(emp => emp.job_function_name === formData.job_function);
    }
    
    if (excludeField !== 'position_group' && formData.position_group) {
      filtered = filtered.filter(emp => emp.position_group_name === formData.position_group);
    }
    
    if (excludeField !== 'grading_level' && formData.grading_level) {
      filtered = filtered.filter(emp => emp.grading_level === formData.grading_level);
    }
    
    if (excludeField !== 'job_title' && formData.job_title) {
      filtered = filtered.filter(emp => 
        emp.job_title && emp.job_title.toLowerCase().includes(formData.job_title.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Get unique values for each dropdown based on current selections
  const getUniqueJobTitles = () => {
    const filtered = getFilteredEmployees('job_title');
    const titles = [...new Set(
      filtered
        .map(emp => emp.job_title)
        .filter(title => title && title.trim() !== '')
    )];
    
    return titles.map(title => ({
      id: title,
      name: title,
      display_name: title
    }));
  };

  const getUniqueBusinessFunctions = () => {
    const filtered = getFilteredEmployees('business_function');
    const functions = [...new Set(
      filtered
        .map(emp => emp.business_function_name)
        .filter(func => func && func.trim() !== '')
    )];
    
    return functions.map(func => ({
      id: func,
      name: func,
      display_name: func
    }));
  };

  const getFilteredDepartments = () => {
    const filtered = getFilteredEmployees('department');
    const departments = [...new Set(
      filtered
        .map(emp => emp.department_name)
        .filter(dept => dept && dept.trim() !== '')
    )];
    
    return departments.map(dept => ({
      id: dept,
      name: dept,
      display_name: dept
    }));
  };

  const getFilteredUnits = () => {
    const filtered = getFilteredEmployees('unit');
    const units = [...new Set(
      filtered
        .map(emp => emp.unit_name)
        .filter(unit => unit && unit.trim() !== '')
    )];
    
    return units.map(unit => ({
      id: unit,
      name: unit,
      display_name: unit
    }));
  };

  const getFilteredJobFunctions = () => {
    const filtered = getFilteredEmployees('job_function');
    const jobFunctions = [...new Set(
      filtered
        .map(emp => emp.job_function_name)
        .filter(func => func && func.trim() !== '')
    )];
    
    return jobFunctions.map(func => ({
      id: func,
      name: func,
      display_name: func
    }));
  };

  const getFilteredPositionGroups = () => {
    const filtered = getFilteredEmployees('position_group');
    const positionGroups = [...new Set(
      filtered
        .map(emp => emp.position_group_name)
        .filter(group => group && group.trim() !== '')
    )];
    
    return positionGroups.map(group => ({
      id: group,
      name: group,
      display_name: group
    }));
  };

  const getFilteredGradingLevels = () => {
    const filtered = getFilteredEmployees('grading_level');
    const gradingLevels = [...new Set(
      filtered
        .map(emp => emp.grading_level)
        .filter(level => level && level.trim() !== '')
    )];
    
    return gradingLevels.map(level => ({
      id: level,
      name: level,
      display_name: level
    }));
  };

  // Check if we have matching criteria to show employee suggestions
  const hasMatchingCriteria = formData.business_function && formData.department && 
                             formData.job_function && formData.position_group;
  
  // Get employee suggestions message
  const getEmployeeSuggestionsMessage = () => {
    if (!hasMatchingCriteria) {
      return "Complete job criteria to see potential employee matches";
    }
    
    if (!matchingEmployees || matchingEmployees.length === 0) {
      return "No employees found matching the selected criteria - will be vacant position";
    }
    
    return `${matchingEmployees.length} employee${matchingEmployees.length === 1 ? '' : 's'} match this position criteria`;
  };

  // Get best matching employee for display
  const getBestMatch = () => {
    if (!matchingEmployees || matchingEmployees.length === 0) return null;
    
    // If job title is specified, find exact match first
    if (formData.job_title) {
      const exactTitleMatch = matchingEmployees.find(emp => 
        emp.job_title === formData.job_title
      );
      if (exactTitleMatch) return exactTitleMatch;
    }
    
    // Otherwise return first match
    return matchingEmployees[0];
  };

  const bestMatchEmployee = getBestMatch();

  // Handle field changes with smart clearing
  const handleBusinessFunctionChange = (value) => {
    // Clear dependent fields but keep job_title if it exists in new context
    const newFormData = {
      ...formData, 
      business_function: value, 
      department: '', 
      unit: '', 
      job_function: '', 
      position_group: '', 
      grading_level: ''
    };
    
    // Check if current job_title is available in new business function
    if (formData.job_title) {
      const filteredEmployees = dropdownData.employees?.filter(emp => 
        emp.business_function_name === value && 
        emp.job_title && 
        emp.job_title.toLowerCase().includes(formData.job_title.toLowerCase())
      );
      
      if (!filteredEmployees || filteredEmployees.length === 0) {
        newFormData.job_title = '';
      }
    }
    
    onFormDataChange(newFormData);
  };

  const handleDepartmentChange = (value) => {
    const newFormData = {
      ...formData, 
      department: value, 
      unit: '', 
      job_function: '', 
      position_group: '', 
      grading_level: ''
    };
    
    // Check if current job_title is available in new department
    if (formData.job_title) {
      const filteredEmployees = dropdownData.employees?.filter(emp => 
        emp.business_function_name === formData.business_function &&
        emp.department_name === value && 
        emp.job_title && 
        emp.job_title.toLowerCase().includes(formData.job_title.toLowerCase())
      );
      
      if (!filteredEmployees || filteredEmployees.length === 0) {
        newFormData.job_title = '';
      }
    }
    
    onFormDataChange(newFormData);
  };

  const handleJobFunctionChange = (value) => {
    const newFormData = {
      ...formData, 
      job_function: value, 
      position_group: '', 
      grading_level: ''
    };
    onFormDataChange(newFormData);
  };

  const handlePositionGroupChange = (value) => {
    const newFormData = {
      ...formData, 
      position_group: value, 
      grading_level: ''
    };
    onFormDataChange(newFormData);
    onPositionGroupChange(value);
  };

  // Get count of available options for each dropdown
  const getOptionCounts = () => {
    return {
      jobTitles: getUniqueJobTitles().length,
      businessFunctions: getUniqueBusinessFunctions().length,
      departments: getFilteredDepartments().length,
      units: getFilteredUnits().length,
      jobFunctions: getFilteredJobFunctions().length,
      positionGroups: getFilteredPositionGroups().length,
      gradingLevels: getFilteredGradingLevels().length
    };
  };

  const counts = getOptionCounts();

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className={`p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20`}>
        <div className="flex items-start gap-2">
          <Target size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className={`text-xs font-medium text-blue-800 dark:text-blue-300`}>
              Smart Employee Matching System
            </p>
            <p className={`text-xs text-blue-700 dark:text-blue-400 mt-1`}>
              Dropdowns are interconnected based on your employee data. Each selection narrows down the options to ensure you can find matching employees.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Job Title <span className="text-red-500">*</span>
            {counts.jobTitles > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.jobTitles} available)</span>
            )}
          </label>
          <SearchableSelect
            options={getUniqueJobTitles()}
            value={formData.job_title}
            onChange={(value) => onFormDataChange({...formData, job_title: value})}
            placeholder={counts.jobTitles > 0 ? "Select job title from employees" : "No job titles available"}
            allowCustom={true}
            error={validationErrors.job_title}
            disabled={counts.jobTitles === 0}
            darkMode={darkMode}
          />
          {validationErrors.job_title && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.job_title}</p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Business Function <span className="text-red-500">*</span>
            {counts.businessFunctions > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.businessFunctions} available)</span>
            )}
          </label>
          <SearchableSelect
            options={getUniqueBusinessFunctions()}
            value={formData.business_function}
            onChange={handleBusinessFunctionChange}
            placeholder={counts.businessFunctions > 0 ? "Select Business Function" : "No business functions available"}
            error={validationErrors.business_function}
            disabled={counts.businessFunctions === 0}
            darkMode={darkMode}
          />
          {validationErrors.business_function && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.business_function}</p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Department <span className="text-red-500">*</span>
            {counts.departments > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.departments} available)</span>
            )}
          </label>
          <SearchableSelect
            options={getFilteredDepartments()}
            value={formData.department}
            onChange={handleDepartmentChange}
            placeholder={formData.business_function ? 
              (counts.departments > 0 ? "Select Department" : "No departments available") : 
              "Select Business Function First"
            }
            disabled={!formData.business_function || counts.departments === 0}
            error={validationErrors.department}
            darkMode={darkMode}
          />
          {validationErrors.department && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Unit
            {counts.units > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.units} available)</span>
            )}
          </label>
          <SearchableSelect
            options={getFilteredUnits()}
            value={formData.unit}
            onChange={(value) => onFormDataChange({...formData, unit: value})}
            placeholder={formData.department ? 
              (counts.units > 0 ? "Select Unit" : "No units available") : 
              "Select Department First"
            }
            disabled={!formData.department || counts.units === 0}
            error={validationErrors.unit}
            darkMode={darkMode}
          />
          {validationErrors.unit && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.unit}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Job Function <span className="text-red-500">*</span>
            {counts.jobFunctions > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.jobFunctions} available)</span>
            )}
          </label>
          <SearchableSelect
            options={getFilteredJobFunctions()}
            value={formData.job_function}
            onChange={handleJobFunctionChange}
            placeholder={formData.department ? 
              (counts.jobFunctions > 0 ? "Select Job Function" : "No job functions available") : 
              "Select Department First"
            }
            disabled={!formData.department || counts.jobFunctions === 0}
            error={validationErrors.job_function}
            darkMode={darkMode}
          />
          {validationErrors.job_function && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.job_function}</p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Position Group <span className="text-red-500">*</span>
            {counts.positionGroups > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.positionGroups} available)</span>
            )}
          </label>
          <SearchableSelect
            options={getFilteredPositionGroups()}
            value={formData.position_group}
            onChange={handlePositionGroupChange}
            placeholder={formData.job_function ? 
              (counts.positionGroups > 0 ? "Select Position Group" : "No position groups available") : 
              "Select Job Function First"
            }
            disabled={!formData.job_function || counts.positionGroups === 0}
            error={validationErrors.position_group}
            darkMode={darkMode}
          />
          {validationErrors.position_group && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.position_group}</p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Grading Level
            {counts.gradingLevels > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.gradingLevels} available)</span>
            )}
          </label>
          <SearchableSelect
            options={getFilteredGradingLevels()}
            value={formData.grading_level}
            onChange={(value) => onFormDataChange({...formData, grading_level: value})}
            placeholder={formData.position_group ? 
              (counts.gradingLevels > 0 ? "Select Grading Level" : "No grading levels available") : 
              "Select Position Group First"
            }
            disabled={!formData.position_group || counts.gradingLevels === 0}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Job Purpose */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          Job Purpose <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.job_purpose}
          onChange={(e) => onFormDataChange({...formData, job_purpose: e.target.value})}
          rows="3"
          className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm ${
            validationErrors.job_purpose ? 'border-red-500' : ''
          }`}
          placeholder="Describe the main purpose of this job..."
        />
        {validationErrors.job_purpose && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.job_purpose}</p>
        )}
      </div>

      {/* Employee Matching Information Display */}
      <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
          <Users size={16} className="text-blue-600" />
          Employee Assignment Preview
        </h3>
        
        <div className="space-y-4">
          {/* Employee Matching Status */}
          <div className={`p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20`}>
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className={`text-xs font-medium text-blue-800 dark:text-blue-300`}>
                  Employee Matching Status
                </p>
                <p className={`text-xs text-blue-700 dark:text-blue-400 mt-1`}>
                  {getEmployeeSuggestionsMessage()}
                </p>
              </div>
            </div>
          </div>

          {/* Best Match Employee Display */}
          {bestMatchEmployee ? (
            <div className={`p-3 border ${borderColor} rounded-lg ${bgCard}`}>
              <h4 className={`text-xs font-semibold ${textSecondary} mb-2 uppercase tracking-wider flex items-center gap-2`}>
                <CheckCircle size={12} className="text-green-600" />
                Best Matching Employee (Auto-Assignment Preview)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className={`font-medium ${textMuted}`}>Name:</span>
                  <span className={`${textPrimary} ml-2`}>{bestMatchEmployee.name || bestMatchEmployee.full_name}</span>
                </div>
                <div>
                  <span className={`font-medium ${textMuted}`}>Employee ID:</span>
                  <span className={`${textPrimary} ml-2`}>{bestMatchEmployee.employee_id}</span>
                </div>
                <div>
                  <span className={`font-medium ${textMuted}`}>Current Job Title:</span>
                  <span className={`${textPrimary} ml-2`}>{bestMatchEmployee.job_title}</span>
                </div>
                <div>
                  <span className={`font-medium ${textMuted}`}>Department:</span>
                  <span className={`${textPrimary} ml-2`}>{bestMatchEmployee.department_name}</span>
                </div>
                {bestMatchEmployee.unit_name && (
                  <div>
                    <span className={`font-medium ${textMuted}`}>Unit:</span>
                    <span className={`${textPrimary} ml-2`}>{bestMatchEmployee.unit_name}</span>
                  </div>
                )}
                {bestMatchEmployee.position_group_name && (
                  <div>
                    <span className={`font-medium ${textMuted}`}>Position Group:</span>
                    <span className={`${textPrimary} ml-2`}>{bestMatchEmployee.position_group_name}</span>
                  </div>
                )}
                {bestMatchEmployee.grading_level && (
                  <div>
                    <span className={`font-medium ${textMuted}`}>Grading Level:</span>
                    <span className={`${textPrimary} ml-2`}>{bestMatchEmployee.grading_level}</span>
                  </div>
                )}
              </div>
            </div>
          ) : hasMatchingCriteria ? (
            <div className={`p-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20`}>
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-orange-600 mt-0.5" />
                <div>
                  <p className="text-orange-800 dark:text-orange-300 text-xs font-medium">
                    No Matching Employee Found
                  </p>
                  <p className="text-orange-700 dark:text-orange-400 text-xs mt-1">
                    The selected combination doesn't match any employees. This position will be created as vacant.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50`}>
              <div className="flex items-start gap-2">
                <Info size={14} className={`${textMuted} mt-0.5`} />
                <div>
                  <p className={`${textMuted} text-xs font-medium`}>
                    Complete Job Criteria
                  </p>
                  <p className={`${textMuted} text-xs mt-1`}>
                    Fill in the required job information to see potential employee matches
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Matching Employees */}
          {matchingEmployees && matchingEmployees.length > 1 && (
            <div className={`p-3 border ${borderColor} rounded-lg ${bgAccent}`}>
              <h4 className={`text-xs font-semibold ${textSecondary} mb-2 uppercase tracking-wider`}>
                Other Matching Employees ({matchingEmployees.length - 1})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {matchingEmployees.slice(1).map((emp, index) => (
                  <div key={emp.id} className={`text-xs ${textSecondary} p-2 ${bgCard} rounded`}>
                    <span className="font-medium">{emp.name || emp.full_name}</span>
                    <span className={`${textMuted} ml-2`}>({emp.employee_id})</span>
                    <span className={`${textMuted} ml-2`}>- {emp.job_title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionInformationTab;