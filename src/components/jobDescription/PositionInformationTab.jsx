// components/jobDescription/PositionInformationTab.jsx - UPDATED: Using SearchableDropdown from common
import React, { useState, useRef, useEffect } from 'react';
import { 
  UserCheck,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Target,
  RefreshCw,
  Eye,
  Loader,
  UserX // For vacancy icon
} from 'lucide-react';
import SearchableDropdown from '../common/SearchableDropdown'; // UPDATED: Import from common
import jobDescriptionService from '@/services/jobDescriptionService';

const PositionInformationTab = ({
  formData,
  dropdownData,
  selectedPositionGroup,
  matchingEmployees,
  validationErrors,
  onFormDataChange,
  onPositionGroupChange,
  onAssignmentPreviewUpdate,
  darkMode
}) => {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [assignmentPreview, setAssignmentPreview] = useState({
    strategy: null,
    employeeCount: 0,
    requiresSelection: false,
    previewMessage: '',
    employees: [],
    criteria: {}
  });
  const [previewError, setPreviewError] = useState(null);

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

  // UPDATED: Transform data for SearchableDropdown format
  const getUniqueJobTitles = () => {
    const filtered = getFilteredEmployees('job_title');
    const titles = [...new Set(
      filtered
        .map(emp => emp.job_title)
        .filter(title => title && title.trim() !== '')
    )];
    
    return titles.map(title => ({
      value: title,
      label: title
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
      value: func,
      label: func
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
      value: dept,
      label: dept
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
      value: unit,
      label: unit
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
      value: func,
      label: func
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
      value: group,
      label: group
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
      value: level,
      label: level
    }));
  };

  // ... (keeping all the existing constraint matching and preview logic)

  const findExactConstraintMatch = (requiredCriteria, debugLabel = '') => {
    if (!dropdownData.employees || dropdownData.employees.length === 0) return null;
    
    const exactMatches = dropdownData.employees.filter(emp => {
      let matches = true;
      
      for (const [field, value] of Object.entries(requiredCriteria)) {
        if (emp[field] !== value) {
          matches = false;
          break;
        }
      }
      
      return matches;
    });
    
    if (exactMatches.length === 0) {
      return null;
    }
    
    const vacantMatches = exactMatches.filter(emp => 
      emp.is_vacancy || emp.record_type === 'vacancy' || emp.name === 'VACANT'
    );
    
    const chosen = vacantMatches.length > 0 ? vacantMatches[0] : exactMatches[0];
    
    return chosen;
  };

  const getBusinessFunctionId = (name) => {
    if (!name || !dropdownData.employees) {
      return null;
    }
    
    const employee = findExactConstraintMatch({
      business_function_name: name
    }, 'Business Function');
    
    if (employee) {
      const id = employee.business_function_id || employee.business_function;
      return id;
    }
    
    return null;
  };

  const getDepartmentId = (name) => {
    if (!name || !dropdownData.employees) {
      return null;
    }
    
    if (!formData.business_function) {
      return null;
    }
    
    const employee = findExactConstraintMatch({
      business_function_name: formData.business_function,
      department_name: name
    }, 'Department');
    
    if (employee) {
      const id = employee.department_id || employee.department;
      return id;
    }
    
    return null;
  };

  const getUnitId = (name) => {
    if (!name) return null;
    
    if (!formData.business_function || !formData.department) {
      return null;
    }
    
    const employee = findExactConstraintMatch({
      business_function_name: formData.business_function,
      department_name: formData.department,
      unit_name: name
    }, 'Unit');
    
    if (employee) {
      const id = employee.unit_id || employee.unit;
      return id;
    }
    
    return null;
  };

  const getJobFunctionId = (name) => {
    if (!name || !dropdownData.employees) {
      return null;
    }
    
    if (!formData.business_function || !formData.department) {
      return null;
    }
    
    const employee = findExactConstraintMatch({
      business_function_name: formData.business_function,
      department_name: formData.department,
      job_function_name: name
    }, 'Job Function');
    
    if (employee) {
      const id = employee.job_function_id || employee.job_function;
      return id;
    }
    
    return null;
  };

  const getPositionGroupId = (name) => {
    if (!name || !dropdownData.employees) {
      return null;
    }
    
    if (!formData.business_function || !formData.department || !formData.job_function) {
      return null;
    }
    
    const employee = findExactConstraintMatch({
      business_function_name: formData.business_function,
      department_name: formData.department,
      job_function_name: formData.job_function,
      position_group_name: name
    }, 'Position Group');
    
    if (employee) {
      const id = employee.position_group_id || employee.position_group;
      return id;
    }
    
    return null;
  };

  // Check if all required fields are filled and can be mapped to IDs
  const areAllRequiredFieldsFilled = () => {
    const hasValue = (field) => {
      if (field === null || field === undefined) return false;
      if (typeof field === 'string') return field.trim() !== '';
      if (typeof field === 'number') return true;
      return !!field;
    };

    const basicRequirementsMet = !!(
      hasValue(formData.job_title) &&
      hasValue(formData.job_purpose) &&
      hasValue(formData.business_function) &&
      hasValue(formData.department) &&
      hasValue(formData.job_function) &&
      hasValue(formData.position_group)
    );

    if (!basicRequirementsMet) {
      return false;
    }

    const businessFunctionId = getBusinessFunctionId(formData.business_function);
    const departmentId = getDepartmentId(formData.department);
    const jobFunctionId = getJobFunctionId(formData.job_function);
    const positionGroupId = getPositionGroupId(formData.position_group);

    const canMapToIds = !!(businessFunctionId && departmentId && jobFunctionId && positionGroupId);
    
    return canMapToIds;
  };

  // Update assignment preview based on form data
const updateAssignmentPreview = async () => {
  if (!areAllRequiredFieldsFilled()) {
    const emptyPreview = {
      strategy: null,
      employeeCount: 0,
      requiresSelection: false,
      previewMessage: 'Complete all required job information to see assignment preview',
      employees: [],
      criteria: {}
    };
    
    setAssignmentPreview(emptyPreview);
    
    if (onAssignmentPreviewUpdate) {
      onAssignmentPreviewUpdate(null);
    }
    return;
  }

  if (!dropdownData.employees || dropdownData.employees.length === 0) {
    setAssignmentPreview({
      strategy: null,
      employeeCount: 0,
      requiresSelection: false,
      previewMessage: 'Loading employee data...',
      employees: [],
      criteria: {}
    });
    return;
  }

  try {
    setPreviewLoading(true);
    setPreviewError(null);

    const businessFunctionId = getBusinessFunctionId(formData.business_function);
    const departmentId = getDepartmentId(formData.department);
    const jobFunctionId = getJobFunctionId(formData.job_function);
    const positionGroupId = getPositionGroupId(formData.position_group);
    const unitId = formData.unit ? getUnitId(formData.unit) : null;

    const previewCriteria = {
      job_title: formData.job_title.trim(),
      business_function: businessFunctionId,
      department: departmentId,
      unit: unitId,
      job_function: jobFunctionId,
      position_group: positionGroupId,
      grading_level: formData.grading_level?.trim() || null,
      max_preview: 50,
      include_vacancies: true
    };

    const response = await jobDescriptionService.previewEligibleEmployees(previewCriteria);
    
    // FIXED: Better handling of response arrays with proper fallbacks
    const employees = Array.isArray(response.employees) ? response.employees : [];
    const vacancies = Array.isArray(response.vacancies) ? response.vacancies : [];
    const unifiedList = Array.isArray(response.unified_list) ? response.unified_list : [];
    
    // FIXED: More robust array merging
    let allRecords = [];
    if (unifiedList.length > 0) {
      allRecords = unifiedList;
    } else if (employees.length > 0 || vacancies.length > 0) {
      allRecords = [...employees, ...vacancies];
    }

    const newPreview = {
      strategy: response.assignment_strategy,
      employeeCount: response.eligible_employees_count || 0,
      vacancyCount: response.eligible_vacancies_count || 0,
      totalCount: response.total_eligible_count || allRecords.length,
      requiresSelection: response.requires_manual_selection || false,
      previewMessage: response.strategy_message || '',
      records: allRecords, // FIXED: Use records instead of employees for consistency
      employees: allRecords, // FIXED: Keep for backward compatibility 
      criteria: response.criteria || {},
      nextSteps: response.next_steps || {}
    };

    setAssignmentPreview(newPreview);

    if (onAssignmentPreviewUpdate) {
      onAssignmentPreviewUpdate({
        ...newPreview,
        employees: allRecords,
        requiresSelection: response.requires_manual_selection || false,
        originalResponse: response
      });
    }

  } catch (error) {
    console.error('Error fetching assignment preview:', error);
    
    let errorMessage = 'Error loading assignment preview';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    setPreviewError(errorMessage);
    const errorPreview = {
      strategy: 'error',
      employeeCount: 0,
      requiresSelection: false,
      previewMessage: errorMessage,
      employees: [],
      criteria: {}
    };
    
    setAssignmentPreview(errorPreview);

    if (onAssignmentPreviewUpdate) {
      onAssignmentPreviewUpdate(null);
    }
  } finally {
    setPreviewLoading(false);
  }
};
  // Watch for changes in ALL required fields + employee data changes
  useEffect(() => {
    if (areAllRequiredFieldsFilled()) {
      const timer = setTimeout(() => {
        updateAssignmentPreview();
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      const emptyPreview = {
        strategy: null,
        employeeCount: 0,
        requiresSelection: false,
        previewMessage: 'Complete all required job information to see assignment preview',
        employees: [],
        criteria: {}
      };
      
      setAssignmentPreview(emptyPreview);
      
      if (onAssignmentPreviewUpdate) {
        onAssignmentPreviewUpdate(null);
      }
    }
  }, [
    formData.job_title,
    formData.job_purpose,
    formData.business_function,
    formData.department,
    formData.job_function,
    formData.position_group,
    dropdownData.employees
  ]);

  useEffect(() => {
    if (areAllRequiredFieldsFilled()) {
      const timer = setTimeout(() => {
        updateAssignmentPreview();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    formData.unit,
    formData.grading_level
  ]);

  const shouldShowPreview = areAllRequiredFieldsFilled();

  // Handle field changes with smart clearing
  const handleBusinessFunctionChange = (value) => {
    const newFormData = {
      ...formData, 
      business_function: value, 
      department: '', 
      unit: '', 
      job_function: '', 
      position_group: '', 
      grading_level: ''
    };
    
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

  // Get assignment preview display
const getAssignmentPreviewDisplay = () => {
  if (previewLoading) {
    return {
      icon: Loader,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      title: 'Checking Employee Matches...',
      message: 'Loading assignment preview...',
      showSpinner: true
    };
  }

  if (previewError) {
    return {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      title: 'Preview Error',
      message: previewError
    };
  }

  switch (assignmentPreview.strategy) {
    case 'auto_assign_single':
      // FIXED: Better handling of employee array access
      const employees = assignmentPreview.employees || assignmentPreview.records || [];
      const employee = employees.length > 0 ? employees[0] : null;
      
      if (!employee) {
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          title: 'No Employee Data',
          message: 'Employee information not available'
        };
      }
      
      const isVacancy = employee.is_vacancy || employee.record_type === 'vacancy';
      
      return {
        icon: isVacancy ? UserX : UserCheck,
        color: isVacancy ? 'text-orange-600' : 'text-green-600',
        bgColor: isVacancy ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20',
        borderColor: isVacancy ? 'border-orange-200 dark:border-orange-800' : 'border-green-200 dark:border-green-800',
        title: isVacancy ? 'Single Vacancy Position Match' : 'Single Employee Match',
        message: isVacancy ? 'Will assign to vacant position' : 'Will automatically assign to the matching employee',
        employee: employee,
        isVacancy: isVacancy
      };
    
    case 'manual_selection_required':
      return {
        icon: Users,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        title: `${assignmentPreview.employeeCount || 0} Matches Found`,
        message: 'Manual selection will be required during job creation',
        showPreviewButton: true
      };
    
    case 'no_employees_found':
      return {
        icon: AlertCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        borderColor: 'border-gray-200 dark:border-gray-800',
        title: 'No Matching Records',
        message: 'Will create as unassigned position'
      };
    
    default:
      return {
        icon: Info,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        title: 'Employee Assignment Preview',
        message: assignmentPreview.previewMessage || 'Complete all required job information to see assignment preview'
      };
  }
};
  const assignmentDisplay = getAssignmentPreviewDisplay();

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* UPDATED: Job Title with SearchableDropdown */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Job Title <span className="text-red-500">*</span>
            {counts.jobTitles > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.jobTitles} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getUniqueJobTitles()}
            value={formData.job_title}
            onChange={(value) => onFormDataChange({...formData, job_title: value})}
            placeholder={counts.jobTitles > 0 ? "Select job title from records" : "Enter job title"}
            className={validationErrors.job_title ? 'border-red-500' : ''}
            darkMode={darkMode}
             allowUncheck={true}
          />
          {validationErrors.job_title && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.job_title}</p>
          )}
        </div>
        
        {/* UPDATED: Business Function with SearchableDropdown */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Business Function <span className="text-red-500">*</span>
            {counts.businessFunctions > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.businessFunctions} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getUniqueBusinessFunctions()}
            value={formData.business_function}
            onChange={handleBusinessFunctionChange}
            placeholder={counts.businessFunctions > 0 ? "Select Business Function" : "No business functions available"}
            className={validationErrors.business_function ? 'border-red-500' : ''}
            darkMode={darkMode}
             allowUncheck={true}
          />
          {validationErrors.business_function && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.business_function}</p>
          )}
        </div>
        
        {/* UPDATED: Department with SearchableDropdown */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Department <span className="text-red-500">*</span>
            {counts.departments > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.departments} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getFilteredDepartments()}
            value={formData.department}
            onChange={handleDepartmentChange}
            placeholder={formData.business_function ? 
              (counts.departments > 0 ? "Select Department" : "No departments available") : 
              "Select Business Function First"
            }
            className={validationErrors.department ? 'border-red-500' : ''}
            darkMode={darkMode}
          />
          {validationErrors.department && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>
          )}
        </div>
        
        {/* UPDATED: Unit with SearchableDropdown */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Unit
            {counts.units > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.units} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getFilteredUnits()}
            value={formData.unit}
            onChange={(value) => onFormDataChange({...formData, unit: value})}
            placeholder={formData.department ? 
              (counts.units > 0 ? "Select Unit" : "No units available") : 
              "Select Department First"
            }
            className={validationErrors.unit ? 'border-red-500' : ''}
            darkMode={darkMode}
          />
          {validationErrors.unit && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.unit}</p>
          )}
        </div>

        {/* UPDATED: Job Function with SearchableDropdown */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Job Function <span className="text-red-500">*</span>
            {counts.jobFunctions > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.jobFunctions} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getFilteredJobFunctions()}
            value={formData.job_function}
            onChange={handleJobFunctionChange}
            placeholder={formData.department ? 
              (counts.jobFunctions > 0 ? "Select Job Function" : "No job functions available") : 
              "Select Department First"
            }
            className={validationErrors.job_function ? 'border-red-500' : ''}
            darkMode={darkMode}
          />
          {validationErrors.job_function && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.job_function}</p>
          )}
        </div>
        
        {/* UPDATED: Position Group with SearchableDropdown */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Position Group <span className="text-red-500">*</span>
            {counts.positionGroups > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.positionGroups} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getFilteredPositionGroups()}
            value={formData.position_group}
            onChange={handlePositionGroupChange}
            placeholder={formData.job_function ? 
              (counts.positionGroups > 0 ? "Select Position Group" : "No position groups available") : 
              "Select Job Function First"
            }
            className={validationErrors.position_group ? 'border-red-500' : ''}
            darkMode={darkMode}
          />
          {validationErrors.position_group && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.position_group}</p>
          )}
        </div>
        
        {/* UPDATED: Grading Level with SearchableDropdown */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Grading Level
            {counts.gradingLevels > 0 && (
              <span className={`text-xs ${textMuted} ml-1`}>({counts.gradingLevels} available)</span>
            )}
          </label>
          <SearchableDropdown
            options={getFilteredGradingLevels()}
            value={formData.grading_level}
            onChange={(value) => onFormDataChange({...formData, grading_level: value})}
            placeholder={formData.position_group ? 
              (counts.gradingLevels > 0 ? "Select Grading Level" : "No grading levels available") : 
              "Select Position Group First"
            }
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

      {/* Assignment Preview Section - Only show when all required fields are completed */}
      {shouldShowPreview && (
        <div className={`p-4 ${assignmentDisplay.bgColor} rounded-lg border ${assignmentDisplay.borderColor}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {assignmentDisplay.showSpinner ? (
                <Loader size={16} className={`${assignmentDisplay.color} animate-spin`} />
              ) : (
                <assignmentDisplay.icon size={16} className={assignmentDisplay.color} />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${textPrimary} mb-1`}>
                {assignmentDisplay.title}
              </h4>
              <p className={`text-xs ${textSecondary} mb-3`}>
                {assignmentDisplay.message}
              </p>
              
              {/* Single Employee/Vacancy Display - FIXED: Handle vacancies properly */}
              {assignmentDisplay.employee && (
                <div className={`p-3 border ${borderColor} rounded-lg ${bgCard} mb-3`}>
                  <h5 className={`text-xs font-semibold ${textSecondary} mb-2 uppercase tracking-wider flex items-center gap-2`}>
                    {assignmentDisplay.isVacancy ? (
                      <>
                        <UserX size={12} className="text-orange-600" />
                        Vacancy Assignment Target
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} className="text-green-600" />
                        Auto-Assignment Target
                      </>
                    )}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={`font-medium ${textMuted}`}>
                        {assignmentDisplay.isVacancy ? 'Position:' : 'Name:'}
                      </span>
                      <span className={`${textPrimary} ml-2`}>
                        {assignmentDisplay.isVacancy ? 
                          `Vacant Position (${assignmentDisplay.employee.employee_id})` : 
                          assignmentDisplay.employee.full_name || assignmentDisplay.employee.name
                        }
                      </span>
                    </div>
                    <div>
                      <span className={`font-medium ${textMuted}`}>
                        {assignmentDisplay.isVacancy ? 'Position ID:' : 'Employee ID:'}
                      </span>
                      <span className={`${textPrimary} ml-2`}>
                        {assignmentDisplay.employee.employee_id}
                      </span>
                    </div>
                    <div>
                      <span className={`font-medium ${textMuted}`}>Current Job:</span>
                      <span className={`${textPrimary} ml-2`}>
                        {assignmentDisplay.employee.job_title || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className={`font-medium ${textMuted}`}>Manager:</span>
                      <span className={`${textPrimary} ml-2`}>
                        {assignmentDisplay.employee.line_manager_name || 'N/A'}
                      </span>
                    </div>
                    {assignmentDisplay.isVacancy && assignmentDisplay.employee.vacancy_details && (
                      <div className="md:col-span-2">
                        <span className={`font-medium ${textMuted}`}>Notes:</span>
                        <span className={`${textPrimary} ml-2 text-xs`}>
                          {assignmentDisplay.employee.vacancy_details.notes || 'No additional notes'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

           
{assignmentDisplay.showPreviewButton && (() => {
  // FIXED: Better defensive programming for employee array access
  const employeeList = assignmentPreview.employees || assignmentPreview.records || [];
  return employeeList.length > 0 && (
    <div className="space-y-2 max-h-32 overflow-y-auto">
      {employeeList.slice(0, 10).map((emp, index) => {
        // FIXED: More robust employee object handling
        if (!emp || typeof emp !== 'object') {
          return null;
        }
        
        const isVacancy = emp.is_vacancy || emp.record_type === 'vacancy';
        const employeeId = emp.employee_id || emp.id || `emp-${index}`;
        const employeeName = emp.full_name || emp.name || 'Unknown';
        const jobTitle = emp.job_title || 'No title';
        
        return (
          <div key={employeeId} className={`text-xs ${textSecondary} p-2 ${bgAccent} rounded flex items-center justify-between`}>
            <div className="flex-1">
              <span className="font-medium">
                {isVacancy ? `Vacant Position (${employeeId})` : employeeName}
              </span>
              <span className={`${textMuted} ml-2`}>({employeeId})</span>
              <span className={`${textMuted} ml-2`}>- {jobTitle}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {isVacancy ? (
                <>
                  <UserX size={10} className="text-orange-600" />
                  <span className="text-orange-600">Vacancy</span>
                </>
              ) : (
                <>
                  <CheckCircle size={10} className="text-green-600" />
                  <span className="text-green-600">Match</span>
                </>
              )}
            </div>
          </div>
        );
      }).filter(Boolean)} {/* FIXED: Remove null entries */}
      
      {employeeList.length > 10 && (
        <div className={`text-center py-2 ${textMuted} text-xs`}>
          ... and {employeeList.length - 10} more records
        </div>
      )}
    </div>
  );
})()}
            </div>
          </div>
        </div>
      )}

      {/* Helpful message when not all fields are filled */}
      {!shouldShowPreview && (
        <div className={`p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800`}>
          <div className="flex items-start gap-3">
            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className={`text-sm font-semibold ${textPrimary} mb-1`}>
                Complete Required Fields
              </h4>
            
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium">Required:</span> Job Title, Business Function, Department, Job Function, Position Group, Job Purpose
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionInformationTab;