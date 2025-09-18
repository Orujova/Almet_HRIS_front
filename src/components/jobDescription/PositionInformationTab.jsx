// components/jobDescription/PositionInformationTab.jsx - FIXED: Proper Vacancy Handling
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

const findExactConstraintMatch = (requiredCriteria, debugLabel = '') => {
  if (!dropdownData.employees || dropdownData.employees.length === 0) return null;
  

  
  // Find ALL records that match EVERY criteria exactly
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
    console.log(`  ❌ NO EXACT MATCHES found for ${debugLabel}`);
    
    // Debug: Show what combinations ARE available
    console.log(`  📊 Available combinations:`);
    const availableCombos = new Set();
    dropdownData.employees.forEach(emp => {
      const combo = `BF: ${emp.business_function_name} + Dept: ${emp.department_name} (ID: ${emp.department_id})`;
      availableCombos.add(combo);
    });
    
    Array.from(availableCombos).slice(0, 10).forEach(combo => {
      console.log(`    - ${combo}`);
    });
    
    return null;
  }
  
  console.log(`  ✅ Found ${exactMatches.length} exact match(es) for ${debugLabel}`);
  
  // Priority: Vacant positions first, then regular employees
  const vacantMatches = exactMatches.filter(emp => 
    emp.is_vacancy || emp.record_type === 'vacancy' || emp.name === 'VACANT'
  );
  
  const chosen = vacantMatches.length > 0 ? vacantMatches[0] : exactMatches[0];
  
  console.log(`  🎯 CHOSEN: ${chosen.employee_id} (${chosen.is_vacancy ? 'VACANCY' : 'EMPLOYEE'}) | Dept_ID: ${chosen.department_id}`);
  
  return chosen;
};

const getBusinessFunctionId = (name) => {
  if (!name || !dropdownData.employees) {
    console.log('⌐ getBusinessFunctionId: Missing data');
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

// CRITICAL FIX: Department ID with ABSOLUTE constraint checking
const getDepartmentId = (name) => {
  if (!name || !dropdownData.employees) {
    console.log('⌐ getDepartmentId: Missing data');
    return null;
  }
  
  if (!formData.business_function) {
    console.log('❌ getDepartmentId: Business function MUST be selected first');
    return null;
  }

  
  // ABSOLUTE REQUIREMENT: Both BF and Dept must match exactly
  const employee = findExactConstraintMatch({
    business_function_name: formData.business_function,
    department_name: name
  }, 'Department');
  
  if (employee) {
    const id = employee.department_id || employee.department;
    console.log(`✅ SUCCESS: Found valid combination! Department ID = ${id}`);
    return id;
  }
  

  
  return null;
};

const getUnitId = (name) => {
  if (!name) return null;
  
  if (!formData.business_function || !formData.department) {
    console.log('❌ getUnitId: Business function AND department must be selected first');
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
  
  console.log(`❌ INVALID: Unit "${name}" doesn't exist in ${formData.business_function} > ${formData.department}`);
  return null;
};

const getJobFunctionId = (name) => {
  if (!name || !dropdownData.employees) {
    console.log('⌐ getJobFunctionId: Missing data');
    return null;
  }
  
  if (!formData.business_function || !formData.department) {
    console.log('❌ getJobFunctionId: Business function AND department must be selected first');
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
  
  console.log(`❌ INVALID: Job function "${name}" doesn't exist in ${formData.business_function} > ${formData.department}`);
  return null;
};

const getPositionGroupId = (name) => {
  if (!name || !dropdownData.employees) {
    console.log('⌐ getPositionGroupId: Missing data');
    return null;
  }
  
  if (!formData.business_function || !formData.department || !formData.job_function) {
    console.log('❌ getPositionGroupId: Full organizational path must be selected first');
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
  
  console.log(`❌ INVALID: Position group "${name}" doesn't exist in the selected organizational path`);
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

    // Check that all required fields have values
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

    // ADDITIONAL CHECK: Ensure we can map all required fields to valid IDs
    const businessFunctionId = getBusinessFunctionId(formData.business_function);
    const departmentId = getDepartmentId(formData.department);
    const jobFunctionId = getJobFunctionId(formData.job_function);
    const positionGroupId = getPositionGroupId(formData.position_group);

    // Only proceed if we can map all required fields to valid IDs
    const canMapToIds = !!(businessFunctionId && departmentId && jobFunctionId && positionGroupId);
    
  
    return canMapToIds;
  };

  // Update assignment preview based on form data
  const updateAssignmentPreview = async () => {
    // Only proceed if ALL required fields are filled AND can be mapped to IDs
    if (!areAllRequiredFieldsFilled()) {
      console.log('Not all required fields filled or cannot map to IDs, clearing preview');
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
      console.log('Employee data not loaded yet, skipping preview');
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

    console.log('🔧 FIXED: ID Mapping Results for Preview API:');
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
      max_preview: 50,
      include_vacancies: true
    };

    console.log('🚀 FIXED: Preview criteria being sent to API:', previewCriteria);

    const response = await jobDescriptionService.previewEligibleEmployees(previewCriteria);
    
    console.log('📥 FIXED: Preview API response received:', response);
    console.log('📊 Response details:');
    console.log('- Assignment strategy:', response.assignment_strategy);
    console.log('- Employees count:', response.eligible_employees_count);
    console.log('- Vacancies count:', response.eligible_vacancies_count); 
    console.log('- Total count:', response.total_eligible_count);
    console.log('- Requires manual selection:', response.requires_manual_selection);

    // Log the actual records
    const employees = response.employees || [];
    const vacancies = response.vacancies || [];
    const unifiedList = response.unified_list || [];
    
    console.log('📋 Records in response:');
    console.log('- Employees:', employees.length, employees.map(e => e.employee_id));
    console.log('- Vacancies:', vacancies.length, vacancies.map(v => v.employee_id));
    console.log('- Unified list:', unifiedList.length, unifiedList.map(u => u.employee_id));

    // Use unified_list as primary data source, fallback to combining employees and vacancies
    const allRecords = unifiedList.length > 0 ? unifiedList : [...employees, ...vacancies];
    
    console.log('🎯 Final records for assignment:', allRecords.length);
    allRecords.forEach((record, index) => {
      const isVacancy = record.is_vacancy || record.record_type === 'vacancy';
      console.log(`  ${index + 1}. ${record.employee_id}: ${record.full_name || record.name} (${isVacancy ? 'VACANCY' : 'EMPLOYEE'})`);
    });

    const newPreview = {
      strategy: response.assignment_strategy,
      employeeCount: response.eligible_employees_count || 0,
      vacancyCount: response.eligible_vacancies_count || 0,
      totalCount: response.total_eligible_count || allRecords.length,
      requiresSelection: response.requires_manual_selection,
      previewMessage: response.strategy_message,
      records: allRecords,
      criteria: response.criteria || {},
      nextSteps: response.next_steps || {}
    };

    console.log('🔄 Setting assignment preview:', newPreview);
    setAssignmentPreview(newPreview);

    // CRITICAL: Always notify parent component
    if (onAssignmentPreviewUpdate) {
      console.log('📤 Sending preview update to parent component');
      onAssignmentPreviewUpdate({
        ...newPreview,
        employees: allRecords, // Send combined records as employees for backward compatibility
        requiresSelection: response.requires_manual_selection,
        originalResponse: response
      });
    } else {
      console.log('⚠️ onAssignmentPreviewUpdate callback is missing!');
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
    console.log('Form data changed, checking if preview should update...');
    
    if (areAllRequiredFieldsFilled()) {
      console.log('All required fields filled and can be mapped, updating preview...');
      const timer = setTimeout(() => {
        updateAssignmentPreview();
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      console.log('Not all required fields filled or cannot map to IDs, clearing preview');
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

  // Optional fields can still trigger preview updates if all required fields are present
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
        const employee = assignmentPreview.employees?.[0];
        const isVacancy = employee?.is_vacancy || employee?.record_type === 'vacancy';
        
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
          title: `${assignmentPreview.employeeCount} Matches Found`,
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
            placeholder={counts.jobTitles > 0 ? "Select job title from records" : "Enter job title"}
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

              {/* Multiple Employees Preview */}
              {assignmentDisplay.showPreviewButton && assignmentPreview.employees.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {assignmentPreview.employees.slice(0, 10).map((emp, index) => {
                    const isVacancy = emp.is_vacancy || emp.record_type === 'vacancy';
                    return (
                      <div key={emp.id} className={`text-xs ${textSecondary} p-2 ${bgAccent} rounded flex items-center justify-between`}>
                        <div className="flex-1">
                          <span className="font-medium">
                            {isVacancy ? `Vacant Position (${emp.employee_id})` : (emp.full_name || emp.name)}
                          </span>
                          <span className={`${textMuted} ml-2`}>({emp.employee_id})</span>
                          <span className={`${textMuted} ml-2`}>- {emp.job_title}</span>
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
                  })}
                  
                  {assignmentPreview.employees.length > 10 && (
                    <div className={`text-center py-2 ${textMuted} text-xs`}>
                      ... and {assignmentPreview.employees.length - 10} more records
                    </div>
                  )}
                </div>
              )}
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