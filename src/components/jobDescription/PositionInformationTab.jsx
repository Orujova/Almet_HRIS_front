// components/jobDescription/PositionInformationTab.jsx - FIXED: Preview API only triggers when all required fields filled
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
  Loader
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


const getBusinessFunctionId = (value) => {
  if (!value) return null;
  
  // If it's already a number/ID, return it
  if (typeof value === 'number' || (!isNaN(parseInt(value)) && value.toString() === parseInt(value).toString())) {
    console.log('✅ Business function already an ID:', parseInt(value));
    return parseInt(value);
  }
  
  // Otherwise, it's a name - find the ID
  if (!dropdownData.employees) return null;
  
  console.log('🔍 Looking for business function ID for name:', value);
  
  const emp = dropdownData.employees.find(emp => 
    emp.business_function_name === value || 
    emp.business_function_detail?.name === value ||
    emp.business_function?.name === value
  );
  
  if (emp) {
    const id = emp.business_function || emp.business_function_id || emp.business_function_detail?.id;
    console.log('✅ Found business function ID:', id, 'for name:', value);
    return parseInt(id);
  }
  
  console.log('❌ Business function not found for name:', value);
  return null;
};

const getDepartmentId = (value) => {
  if (!value) return null;
  
  // If it's already a number/ID, return it
  if (typeof value === 'number' || (!isNaN(parseInt(value)) && value.toString() === parseInt(value).toString())) {
    console.log('✅ Department already an ID:', parseInt(value));
    return parseInt(value);
  }
  
  // Otherwise, it's a name - find the ID
  if (!dropdownData.employees) return null;
  
  console.log('🔍 Looking for department ID for name:', value);
  
  const emp = dropdownData.employees.find(emp => 
    emp.department_name === value || 
    emp.department_detail?.name === value ||
    emp.department?.name === value
  );
  
  if (emp) {
    const id = emp.department || emp.department_id || emp.department_detail?.id;
    console.log('✅ Found department ID:', id, 'for name:', value);
    return parseInt(id);
  }
  
  console.log('❌ Department not found for name:', value);
  return null;
};

const getUnitId = (value) => {
  if (!value) return null;
  
  // If it's already a number/ID, return it
  if (typeof value === 'number' || (!isNaN(parseInt(value)) && value.toString() === parseInt(value).toString())) {
    console.log('✅ Unit already an ID:', parseInt(value));
    return parseInt(value);
  }
  
  // Otherwise, it's a name - find the ID
  const emp = dropdownData.employees?.find(emp => 
    emp.unit_name === value || 
    emp.unit_detail?.name === value ||
    emp.unit?.name === value
  );
  
  if (emp) {
    const id = emp.unit || emp.unit_id || emp.unit_detail?.id;
    console.log('✅ Found unit ID:', id, 'for name:', value);
    return parseInt(id);
  }
  
  return null;
};

const getJobFunctionId = (value) => {
  if (!value) return null;
  
  // If it's already a number/ID, return it
  if (typeof value === 'number' || (!isNaN(parseInt(value)) && value.toString() === parseInt(value).toString())) {
    console.log('✅ Job function already an ID:', parseInt(value));
    return parseInt(value);
  }
  
  // Otherwise, it's a name - find the ID
  if (!dropdownData.employees) return null;
  
  console.log('🔍 Looking for job function ID for name:', value);
  
  const emp = dropdownData.employees.find(emp => 
    emp.job_function_name === value || 
    emp.job_function_detail?.name === value ||
    emp.job_function?.name === value
  );
  
  if (emp) {
    const id = emp.job_function || emp.job_function_id || emp.job_function_detail?.id;
    console.log('✅ Found job function ID:', id, 'for name:', value);
    return parseInt(id);
  }
  
  console.log('❌ Job function not found for name:', value);
  return null;
};

const getPositionGroupId = (value) => {
  if (!value) return null;
  
  // If it's already a number/ID, return it
  if (typeof value === 'number' || (!isNaN(parseInt(value)) && value.toString() === parseInt(value).toString())) {
    console.log('✅ Position group already an ID:', parseInt(value));
    return parseInt(value);
  }
  
  // Otherwise, it's a name - find the ID
  if (!dropdownData.employees) return null;
  
  console.log('🔍 Looking for position group ID for name:', value);
  
  const emp = dropdownData.employees.find(emp => 
    emp.position_group_name === value || 
    emp.position_group_detail?.name === value ||
    emp.position_group?.name === value
  );
  
  if (emp) {
    const id = emp.position_group || emp.position_group_id || emp.position_group_detail?.id;
    console.log('✅ Found position group ID:', id, 'for name:', value);
    return parseInt(id);
  }
  
  console.log('❌ Position group not found for name:', value);
  return null;
};

  // FIXED: Check if ALL required fields are filled before triggering preview
const areAllRequiredFieldsFilled = () => {
  // Helper function to safely check if a field has a value
  const hasValue = (field) => {
    if (field === null || field === undefined) return false;
    if (typeof field === 'string') return field.trim() !== '';
    if (typeof field === 'number') return true;
    return !!field; // For other types, check if truthy
  };

  return !!(
    hasValue(formData.job_title) &&
    hasValue(formData.business_function) &&
    hasValue(formData.department) &&
    hasValue(formData.job_function) &&
    hasValue(formData.position_group)
  );
};
  // Update assignment preview based on form data
  const updateAssignmentPreview = async () => {
    // FIXED: Only proceed if ALL required fields are filled
    if (!areAllRequiredFieldsFilled()) {
      console.log('🔍 Not all required fields filled, clearing preview');
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

    // Check if we have employee data loaded
    if (!dropdownData.employees || dropdownData.employees.length === 0) {
      console.log('⏳ Employee data not loaded yet, skipping preview');
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

      // Transform names to IDs for API call
      const businessFunctionId = getBusinessFunctionId(formData.business_function);
      const departmentId = getDepartmentId(formData.department);
      const jobFunctionId = getJobFunctionId(formData.job_function);
      const positionGroupId = getPositionGroupId(formData.position_group);
      const unitId = formData.unit ? getUnitId(formData.unit) : null;

      console.log('🔍 ID Mapping Results:');
      console.log('- Business Function:', formData.business_function, '→', businessFunctionId);
      console.log('- Department:', formData.department, '→', departmentId);
      console.log('- Job Function:', formData.job_function, '→', jobFunctionId);
      console.log('- Position Group:', formData.position_group, '→', positionGroupId);
      console.log('- Unit:', formData.unit, '→', unitId);

      // Prepare criteria for API call
      const previewCriteria = {
        job_title: formData.job_title.trim(),
        business_function: businessFunctionId,
        department: departmentId,
        unit: unitId,
        job_function: jobFunctionId,
        position_group: positionGroupId,
        grading_level: formData.grading_level?.trim() || null,
        max_preview: 50
      };

      console.log('📤 Preview criteria being sent:', previewCriteria);

      // Validate that we have all required IDs
      const requiredMappings = [
        { field: 'business_function', value: businessFunctionId, name: formData.business_function },
        { field: 'department', value: departmentId, name: formData.department },
        { field: 'job_function', value: jobFunctionId, name: formData.job_function },
        { field: 'position_group', value: positionGroupId, name: formData.position_group }
      ];

      const failedMappings = requiredMappings.filter(mapping => !mapping.value);
      
      if (failedMappings.length > 0) {
        const errorDetails = failedMappings.map(mapping => 
          `${mapping.field}: "${mapping.name}" not found in employee data`
        ).join(', ');
        
        console.error('❌ Field mapping errors:', errorDetails);
        throw new Error(`Cannot map form values to employee data: ${errorDetails}`);
      }

      const response = await jobDescriptionService.previewEligibleEmployees(previewCriteria);
      
      console.log('✅ Preview response received:', response);

      const newPreview = {
        strategy: response.assignment_strategy,
        employeeCount: response.eligible_employees_count,
        requiresSelection: response.requires_manual_selection,
        previewMessage: response.strategy_message,
        employees: response.employees || [],
        criteria: response.criteria || {},
        nextSteps: response.next_steps || {}
      };

      setAssignmentPreview(newPreview);

      // FIXED: Always notify parent component with proper data structure
      if (onAssignmentPreviewUpdate) {
        onAssignmentPreviewUpdate({
          ...newPreview,
          // Ensure we pass the requiresSelection flag properly
          requiresSelection: response.requires_manual_selection,
          // Add original response for debugging
          originalResponse: response
        });
      }

    } catch (error) {
      console.error('❌ Error fetching assignment preview:', error);
      
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

  // FIXED: Only watch for changes in required fields to trigger preview
  useEffect(() => {
    // Only trigger preview if we have ALL required fields
    if (areAllRequiredFieldsFilled()) {
      console.log('🔄 All required fields filled, updating preview...');
      const timer = setTimeout(() => {
        updateAssignmentPreview();
      }, 800); // Slightly longer debounce for better UX

      return () => clearTimeout(timer);
    } else {
      console.log('⚠️  Not all required fields filled, clearing preview');
      // Clear preview immediately when required fields are missing
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
    formData.business_function,
    formData.department,
    formData.job_function,
    formData.position_group
  ]);

  // Optional fields can still trigger preview updates if all required fields are present
  useEffect(() => {
    if (areAllRequiredFieldsFilled()) {
      const timer = setTimeout(() => {
        updateAssignmentPreview();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [
    formData.unit,
    formData.grading_level
  ]);

  // Check if we should show employee assignment preview
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
        return {
          icon: UserCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          title: 'Single Employee Match',
          message: 'Will automatically assign to the matching employee',
          employee: assignmentPreview.employees?.[0]
        };
      
      case 'manual_selection_required':
        return {
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          title: `${assignmentPreview.employeeCount} Employees Match`,
          message: 'Manual selection will be required during job creation',
          showPreviewButton: true
        };
      
      case 'no_employees_found':
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          title: 'No Matching Employees',
          message: 'Will create as vacant position'
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
            placeholder={counts.jobTitles > 0 ? "Select job title from employees" : "Enter job title"}
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

      {/* Assignment Preview Section */}
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
              
              {/* Single Employee Display */}
              {assignmentDisplay.employee && (
                <div className={`p-3 border ${borderColor} rounded-lg ${bgCard} mb-3`}>
                  <h5 className={`text-xs font-semibold ${textSecondary} mb-2 uppercase tracking-wider flex items-center gap-2`}>
                    <CheckCircle size={12} className="text-green-600" />
                    Auto-Assignment Target
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={`font-medium ${textMuted}`}>Name:</span>
                      <span className={`${textPrimary} ml-2`}>{assignmentDisplay.employee.full_name}</span>
                    </div>
                    <div>
                      <span className={`font-medium ${textMuted}`}>Employee ID:</span>
                      <span className={`${textPrimary} ml-2`}>{assignmentDisplay.employee.employee_id}</span>
                    </div>
                    <div>
                      <span className={`font-medium ${textMuted}`}>Current Job:</span>
                      <span className={`${textPrimary} ml-2`}>{assignmentDisplay.employee.job_title}</span>
                    </div>
                    <div>
                      <span className={`font-medium ${textMuted}`}>Manager:</span>
                      <span className={`${textPrimary} ml-2`}>{assignmentDisplay.employee.line_manager_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple Employees Preview */}
              {assignmentDisplay.showPreviewButton && assignmentPreview.employees.length > 0 && (
              
                 
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {assignmentPreview.employees.slice(0, 10).map((emp, index) => (
                      <div key={emp.id} className={`text-xs ${textSecondary} p-2 ${bgAccent} rounded flex items-center justify-between`}>
                        <div className="flex-1">
                          <span className="font-medium">{emp.full_name}</span>
                          <span className={`${textMuted} ml-2`}>({emp.employee_id})</span>
                          <span className={`${textMuted} ml-2`}>- {emp.job_title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <CheckCircle size={10} className="text-green-600" />
                          <span className="text-green-600">Match</span>
                        </div>
                      </div>
                    ))}
                    
                    {assignmentPreview.employees.length > 3 && (
                      <div className={`text-center py-2 ${textMuted} text-xs`}>
                        ... and {assignmentPreview.employees.length - 10} more employees
                      </div>
                    )}
                  </div>
               
              )}

             
            </div>
          </div>
        </div>
      )}

    
    </div>
  );
};

export default PositionInformationTab;