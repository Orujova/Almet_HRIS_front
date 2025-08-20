import React, { useState, useRef, useEffect } from 'react';
import { 
  UserCheck,
  UserX as UserVacant,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const PositionInformationTab = ({
  formData,
  dropdownData,
  positionType,
  selectedEmployee,
  autoManager,
  selectedPositionGroup,
  businessFunctionDepartments,
  departmentUnits,
  validationErrors,
  onFormDataChange,
  onPositionTypeChange,
  onEmployeeSelect,
  onPositionGroupChange,
  darkMode
}) => {
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // Handle employee selection
  const handleEmployeeSelection = (employeeId) => {
    onEmployeeSelect(employeeId);
    onFormDataChange(prev => ({ 
      ...prev, 
      assigned_employee: employeeId,
      // Clear manual employee fields when selecting from system
      manual_employee_name: '',
      manual_employee_phone: ''
    }));
  };

  // Handle manual employee name change
  const handleManualEmployeeNameChange = (value) => {
    onFormDataChange(prev => ({ 
      ...prev, 
      manual_employee_name: value
    }));
    
    // If manual name is entered, clear selected employee
    if (value && value.trim()) {
      onEmployeeSelect('');
      onFormDataChange(prev => ({ 
        ...prev, 
        assigned_employee: ''
      }));
    }
  };

  // Handle manual employee phone change
  const handleManualEmployeePhoneChange = (value) => {
    onFormDataChange(prev => ({ 
      ...prev, 
      manual_employee_phone: value
    }));
  };

  // Handle position type change
  const handlePositionTypeChange = (type) => {
    onPositionTypeChange(type);
    if (type === 'vacant') {
      onEmployeeSelect('');
      onFormDataChange(prev => ({ 
        ...prev, 
        assigned_employee: '', 
        manual_employee_name: '',
        manual_employee_phone: '',
        reports_to: ''
      }));
    }
  };

  // Determine if we have employee assignment
  const hasSystemEmployee = selectedEmployee && selectedEmployee !== '' && selectedEmployee !== null;
  const hasManualEmployee = formData.manual_employee_name && formData.manual_employee_name.trim();

  return (
    <div className="space-y-6">
      {/* Position Type Selection */}
      <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>Position Type</h3>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="positionType"
              value="assigned"
              checked={positionType === 'assigned'}
              onChange={(e) => handlePositionTypeChange(e.target.value)}
              className="mr-2 text-almet-sapphire focus:ring-almet-sapphire"
            />
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-green-600" />
              <span className={`text-sm ${textPrimary}`}>Assigned Position</span>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="positionType"
              value="vacant"
              checked={positionType === 'vacant'}
              onChange={(e) => handlePositionTypeChange(e.target.value)}
              className="mr-2 text-almet-sapphire focus:ring-almet-sapphire"
            />
            <div className="flex items-center gap-2">
              <UserVacant size={14} className="text-orange-600" />
              <span className={`text-sm ${textPrimary}`}>Vacant Position</span>
            </div>
          </label>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Job Title <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={dropdownData.jobTitles || []}
            value={formData.job_title}
            onChange={(value) => onFormDataChange({...formData, job_title: value})}
            placeholder="Select or type job title"
            allowCustom={true}
            error={validationErrors.job_title}
            darkMode={darkMode}
          />
          {validationErrors.job_title && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.job_title}</p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Business Function <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={dropdownData.businessFunctions}
            value={formData.business_function}
            onChange={(value) => onFormDataChange({...formData, business_function: value})}
            placeholder="Select Business Function"
            error={validationErrors.business_function}
            darkMode={darkMode}
          />
          {validationErrors.business_function && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.business_function}</p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Department <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={businessFunctionDepartments}
            value={formData.department}
            onChange={(value) => onFormDataChange({...formData, department: value})}
            placeholder={formData.business_function ? "Select Department" : "Select Business Function First"}
            disabled={!formData.business_function}
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
          </label>
          <SearchableSelect
            options={departmentUnits}
            value={formData.unit}
            onChange={(value) => onFormDataChange({...formData, unit: value})}
            placeholder={formData.department ? "Select Unit" : "Select Department First"}
            disabled={!formData.department}
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
          </label>
          <SearchableSelect
            options={dropdownData.jobFunctions}
            value={formData.job_function}
            onChange={(value) => onFormDataChange({...formData, job_function: value})}
            placeholder="Select Job Function"
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
          </label>
          <SearchableSelect
            options={dropdownData.positionGroups}
            value={formData.position_group}
            onChange={(value) => {
              onFormDataChange({...formData, position_group: value, grading_level: ''});
              onPositionGroupChange(value);
            }}
            placeholder="Select Position Group"
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
          </label>
          <SearchableSelect
            options={(dropdownData.gradingLevels || []).map(level => ({
              id: level.code,
              name: `${level.display} - ${level.full_name}`,
              display_name: `${level.display} - ${level.full_name}`
            }))}
            value={formData.grading_level}
            onChange={(value) => onFormDataChange({...formData, grading_level: value})}
            placeholder={selectedPositionGroup ? "Select Grading Level" : "Select Position Group First"}
            disabled={!selectedPositionGroup}
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

      {/* Employee Assignment Section - Only for Assigned Positions */}
      {positionType === 'assigned' && (
        <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
            <UserCheck size={16} className="text-green-600" />
            Employee Assignment
          </h3>
          
          <div className="space-y-4">
            {/* Employee Selection Method Info */}
            <div className={`p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20`}>
              <p className={`text-xs text-blue-800 dark:text-blue-300`}>
                💡 <strong>Choose one method:</strong> Either select an employee from the system OR enter manual employee details (not both).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* System Employee Selection */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Select Employee from System
                  {hasSystemEmployee && <span className="text-green-600 text-xs ml-1">(Selected)</span>}
                </label>
                <SearchableSelect
                  options={dropdownData.employees}
                  value={selectedEmployee}
                  onChange={handleEmployeeSelection}
                  placeholder="Select Employee"
                  disabled={hasManualEmployee}
                  darkMode={darkMode}
                />
                {hasManualEmployee && (
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Disabled because manual employee details are entered
                  </p>
                )}
              </div>

              {/* Reports To */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Reports To {autoManager && <span className="text-green-600 text-xs">(Auto-populated)</span>}
                </label>
                <SearchableSelect
                  options={dropdownData.employees}
                  value={formData.reports_to}
                  onChange={(value) => onFormDataChange({...formData, reports_to: value})}
                  placeholder="Select Manager"
                  disabled={!!autoManager}
                  darkMode={darkMode}
                />
                {autoManager && (
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Automatically selected: {autoManager.name}
                  </p>
                )}
              </div>
            </div>

            {/* Manual Employee Details */}
            <div className={`p-3 border ${borderColor} rounded-lg ${hasSystemEmployee ? 'opacity-50' : ''}`}>
              <h4 className={`text-xs font-semibold ${textSecondary} mb-3 uppercase tracking-wider`}>
                OR Manual Employee Details
                {hasManualEmployee && <span className="text-green-600 ml-1">(In Use)</span>}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Manual Employee Name
                  </label>
                  <input
                    type="text"
                    value={formData.manual_employee_name}
                    onChange={(e) => handleManualEmployeeNameChange(e.target.value)}
                    disabled={hasSystemEmployee}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Enter employee name manually"
                  />
                  {hasSystemEmployee && (
                    <p className={`text-xs ${textMuted} mt-1`}>
                      Disabled because system employee is selected
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Manual Employee Phone
                  </label>
                  <input
                    type="text"
                    value={formData.manual_employee_phone}
                    onChange={(e) => handleManualEmployeePhoneChange(e.target.value)}
                    disabled={hasSystemEmployee}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Enter employee phone manually"
                  />
                </div>
              </div>
            </div>

            {/* Assignment Status Display */}
            <div className={`p-3 rounded-lg border ${
              hasSystemEmployee || hasManualEmployee 
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
               :""
            }`}>
              <div className="flex items-start gap-2">
                {hasSystemEmployee || hasManualEmployee ? (
                  <UserCheck size={14} className="text-green-600 mt-0.5" />
                ) : ""}
             
              </div>
            </div>
          
          {validationErrors.employee_assignment && (
            <div className={`mt-3 p-3 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20`}>
              <p className="text-red-800 dark:text-red-300 text-xs">{validationErrors.employee_assignment}</p>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionInformationTab;