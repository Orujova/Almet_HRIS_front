// components/jobDescription/JobDescriptionForm.jsx - COMPLETE FIXED VERSION with Proper ID Mapping
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Briefcase, 
  Save, 
  X, 
  AlertCircle,
  UserCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Users,
  Target
} from 'lucide-react';
import PositionInformationTab from './PositionInformationTab';
import JobResponsibilitiesTab from './JobResponsibilitiesTab';
import WorkConditionsTab from './WorkConditionsTab';
import EmployeeSelectionModal from './EmployeeSelectionModal';
import jobDescriptionService from '@/services/jobDescriptionService';

const JobDescriptionForm = ({
  formData = {},
  editingJob = null,
  dropdownData = {},
  selectedSkillGroup = '',
  selectedBehavioralGroup = '',
  availableSkills = [],
  availableCompetencies = [],
  selectedPositionGroup = '',
  matchingEmployees = [],
  actionLoading = false,
  onFormDataChange = () => {},
  onSkillGroupChange = () => {},
  onBehavioralGroupChange = () => {},
  onPositionGroupChange = () => {},
  onSubmit = () => {},
  onCancel = () => {},
  onUpdate = () => {},
  darkMode = false
}) => {
  const [activeTab, setActiveTab] = useState('position');
  const [validationErrors, setValidationErrors] = useState({});
  
  // Employee selection and assignment state
  const [showEmployeeSelectionModal, setShowEmployeeSelectionModal] = useState(false);
  const [assignmentPreview, setAssignmentPreview] = useState(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [jobCriteria, setJobCriteria] = useState({});
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-gray-50";

  const tabs = [
    {
      id: 'position',
      name: 'Basic Info',
      icon: User,
      description: 'Job title, department, employee matching'
    },
    {
      id: 'responsibilities',
      name: 'Responsibilities',
      icon: Briefcase,
      description: 'Duties, KPIs, skills, competencies'
    },
    {
      id: 'conditions',
      name: 'Resources',
      icon: Building,
      description: 'Resources, access rights, benefits'
    }
  ];

  // Handle assignment preview updates from PositionInformationTab
  const handleAssignmentPreviewUpdate = (previewData) => {
    console.log('📋 Assignment preview updated:', previewData);
    
    setAssignmentPreview(previewData);
    
    // Clear selected employees when preview changes
    if (!previewData || previewData.strategy !== 'manual_selection_required') {
      setSelectedEmployeeIds([]);
      setEligibleEmployees([]);
      setJobCriteria({});
    } else {
      // Extract data from preview response
      const employees = previewData.employees || [];
      const criteria = previewData.criteria || {};
      
      console.log('🔍 Setting eligible employees:', employees.length);
      console.log('🎯 Setting job criteria:', criteria);
      
      setEligibleEmployees(employees);
      setJobCriteria(criteria);
    }
  };

  // Handle employee selection from modal
  const handleEmployeeSelection = (employeeIds, employeeData) => {
    console.log('👥 Employees selected:', employeeIds, employeeData);
    
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      console.warn('⚠️  Invalid employee selection data');
      return;
    }
    
    setSelectedEmployeeIds(employeeIds);
    setShowEmployeeSelectionModal(false);
    
    console.log('✅ Employee selection completed. Selected IDs:', employeeIds);
  };

  // Get current tab index
  const getCurrentTabIndex = () => {
    return tabs.findIndex(tab => tab.id === activeTab);
  };

  // Check if we can navigate to next tab
  const canNavigateToNext = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex === -1) return false;
    
    switch (activeTab) {
      case 'position':
        return isTabCompleted('position');
      case 'responsibilities':
        return isTabCompleted('responsibilities');
      case 'conditions':
        return true;
      default:
        return false;
    }
  };

  // Navigate to next tab
  const goToNextTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex < tabs.length - 1 && canNavigateToNext()) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  // Navigate to previous tab
  const goToPreviousTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  // Check if current tab is the last tab
  const isLastTab = () => {
    return getCurrentTabIndex() === tabs.length - 1;
  };

  // Check if current tab is the first tab
  const isFirstTab = () => {
    return getCurrentTabIndex() === 0;
  };

  // Handle tab change with validation
  const handleTabChange = (targetTabId) => {
    const currentIndex = getCurrentTabIndex();
    const targetIndex = tabs.findIndex(tab => tab.id === targetTabId);
    
    if (targetIndex > currentIndex) {
      if (validateCurrentTab()) {
        setActiveTab(targetTabId);
      } else {
        const errorMessage = Object.values(validationErrors).join('\n');
        alert('Please fix the following errors before proceeding:\n\n' + errorMessage);
      }
    } else {
      setActiveTab(targetTabId);
    }
  };

  // Enhanced validation with tab-specific errors
  const validateForm = () => {
    const errors = {};
    
    // Position Information Tab Validation
    if (!formData.job_title?.trim()) {
      errors.job_title = 'Job Title is required';
    }
    if (!formData.job_purpose?.trim()) {
      errors.job_purpose = 'Job Purpose is required';
    }
    if (!formData.business_function) {
      errors.business_function = 'Business Function is required';
    }
    if (!formData.department) {
      errors.department = 'Department is required';
    }
    if (!formData.job_function) {
      errors.job_function = 'Job Function is required';
    }
    if (!formData.position_group) {
      errors.position_group = 'Position Group is required';
    }
    
    // Job Responsibilities Tab Validation
    const requiredSections = ['criticalDuties', 'positionMainKpis', 'jobDuties', 'requirements'];
    requiredSections.forEach(sectionName => {
      const sectionValid = formData[sectionName] && 
        formData[sectionName].some(item => item && item.trim() !== '');
      if (!sectionValid) {
        errors[sectionName] = `At least one ${sectionName.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate current tab only
  const validateCurrentTab = () => {
    const errors = {};
    
    switch (activeTab) {
      case 'position':
        if (!formData.job_title?.trim()) {
          errors.job_title = 'Job Title is required';
        }
        if (!formData.job_purpose?.trim()) {
          errors.job_purpose = 'Job Purpose is required';
        }
        if (!formData.business_function) {
          errors.business_function = 'Business Function is required';
        }
        if (!formData.department) {
          errors.department = 'Department is required';
        }
        if (!formData.job_function) {
          errors.job_function = 'Job Function is required';
        }
        if (!formData.position_group) {
          errors.position_group = 'Position Group is required';
        }
        break;
        
      case 'responsibilities':
        const requiredSections = ['criticalDuties', 'positionMainKpis', 'jobDuties', 'requirements'];
        requiredSections.forEach(sectionName => {
          const sectionValid = formData[sectionName] && 
            formData[sectionName].some(item => item && item.trim() !== '');
          if (!sectionValid) {
            errors[sectionName] = `At least one ${sectionName.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
          }
        });
        break;
        
      case 'conditions':
        // No required validation for conditions tab
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // FIXED: Enhanced helper functions to get IDs from names with proper error handling
  const getBusinessFunctionId = (name) => {
    if (!name || !dropdownData.employees) {
      console.log('❌ getBusinessFunctionId: Missing name or employees data');
      return null;
    }
    
    console.log('🔍 Looking for business function ID for:', name);
    
    // Try multiple approaches to find the business function ID
    const emp = dropdownData.employees.find(emp => {
      return emp.business_function_name === name || 
             emp.business_function_detail?.name === name ||
             emp.business_function?.name === name;
    });
    
    if (emp) {
      // Try multiple field patterns for the ID
      const id = emp.business_function_id || 
                 emp.business_function || 
                 emp.business_function_detail?.id ||
                 emp['business_function']['id'];
      
      console.log('✅ Found business function ID:', id, 'from employee:', emp.name || emp.full_name);
      return id;
    }
    
    // Fallback: check if we can find by employeeMap
    if (dropdownData.employeeMap) {
      const mappedEmp = dropdownData.employeeMap.get(`bf_${name}`);
      if (mappedEmp) {
        const id = mappedEmp.business_function_id || mappedEmp.business_function;
        console.log('✅ Found business function ID via map:', id);
        return id;
      }
    }
    
    console.log('❌ Business function ID not found for:', name);
    console.log('📊 Available business functions:', [...new Set(dropdownData.employees.map(e => e.business_function_name).filter(Boolean))]);
    return null;
  };

  const getDepartmentId = (name) => {
    if (!name || !dropdownData.employees) {
      console.log('❌ getDepartmentId: Missing name or employees data');
      return null;
    }
    
    console.log('🔍 Looking for department ID for:', name);
    
    const emp = dropdownData.employees.find(emp => {
      return emp.department_name === name || 
             emp.department_detail?.name === name ||
             emp.department?.name === name;
    });
    
    if (emp) {
      const id = emp.department_id || 
                 emp.department || 
                 emp.department_detail?.id ||
                 emp['department']['id'];
      
      console.log('✅ Found department ID:', id, 'from employee:', emp.name || emp.full_name);
      return id;
    }
    
    // Fallback: check employeeMap
    if (dropdownData.employeeMap) {
      const mappedEmp = dropdownData.employeeMap.get(`dept_${name}`);
      if (mappedEmp) {
        const id = mappedEmp.department_id || mappedEmp.department;
        console.log('✅ Found department ID via map:', id);
        return id;
      }
    }
    
    console.log('❌ Department ID not found for:', name);
    console.log('📊 Available departments:', [...new Set(dropdownData.employees.map(e => e.department_name).filter(Boolean))]);
    return null;
  };

  const getUnitId = (name) => {
    if (!name) return null;
    
    const emp = dropdownData.employees?.find(emp => {
      return emp.unit_name === name || 
             emp.unit_detail?.name === name ||
             emp.unit?.name === name;
    });
    
    if (emp) {
      const id = emp.unit_id || 
                 emp.unit || 
                 emp.unit_detail?.id ||
                 emp['unit']['id'];
      
      console.log('✅ Found unit ID:', id, 'for name:', name);
      return id;
    }
    
    return null;
  };

  const getJobFunctionId = (name) => {
    if (!name || !dropdownData.employees) {
      console.log('❌ getJobFunctionId: Missing name or employees data');
      return null;
    }
    
    console.log('🔍 Looking for job function ID for:', name);
    
    const emp = dropdownData.employees.find(emp => {
      return emp.job_function_name === name || 
             emp.job_function_detail?.name === name ||
             emp.job_function?.name === name;
    });
    
    if (emp) {
      const id = emp.job_function_id || 
                 emp.job_function || 
                 emp.job_function_detail?.id ||
                 emp['job_function']['id'];
      
      console.log('✅ Found job function ID:', id, 'from employee:', emp.name || emp.full_name);
      return id;
    }
    
    // Fallback: check employeeMap
    if (dropdownData.employeeMap) {
      const mappedEmp = dropdownData.employeeMap.get(`jf_${name}`);
      if (mappedEmp) {
        const id = mappedEmp.job_function_id || mappedEmp.job_function;
        console.log('✅ Found job function ID via map:', id);
        return id;
      }
    }
    
    console.log('❌ Job function ID not found for:', name);
    console.log('📊 Available job functions:', [...new Set(dropdownData.employees.map(e => e.job_function_name).filter(Boolean))]);
    return null;
  };

  const getPositionGroupId = (name) => {
    if (!name || !dropdownData.employees) {
      console.log('❌ getPositionGroupId: Missing name or employees data');
      return null;
    }
    
    console.log('🔍 Looking for position group ID for:', name);
    
    const emp = dropdownData.employees.find(emp => {
      return emp.position_group_name === name || 
             emp.position_group_detail?.name === name ||
             emp.position_group?.name === name;
    });
    
    if (emp) {
      const id = emp.position_group_id || 
                 emp.position_group || 
                 emp.position_group_detail?.id ||
                 emp['position_group']['id'];
      
      console.log('✅ Found position group ID:', id, 'from employee:', emp.name || emp.full_name);
      return id;
    }
    
    // Fallback: check employeeMap
    if (dropdownData.employeeMap) {
      const mappedEmp = dropdownData.employeeMap.get(`pg_${name}`);
      if (mappedEmp) {
        const id = mappedEmp.position_group_id || mappedEmp.position_group;
        console.log('✅ Found position group ID via map:', id);
        return id;
      }
    }
    
    console.log('❌ Position group ID not found for:', name);
    console.log('📊 Available position groups:', [...new Set(dropdownData.employees.map(e => e.position_group_name).filter(Boolean))]);
    return null;
  };


  const handleCancel = () => {
  console.log('❌ Cancel button clicked');
  
  // Check if form has data
  const hasFormData = formData.job_title?.trim() || 
                     formData.job_purpose?.trim() || 
                     formData.criticalDuties?.some(d => d?.trim()) ||
                     formData.positionMainKpis?.some(d => d?.trim()) ||
                     formData.jobDuties?.some(d => d?.trim()) ||
                     formData.requirements?.some(d => d?.trim()) ||
                     formData.required_skills_data?.length > 0 ||
                     formData.behavioral_competencies_data?.length > 0 ||
                     formData.business_resources_ids?.length > 0 ||
                     formData.access_rights_ids?.length > 0 ||
                     formData.company_benefits_ids?.length > 0;

  // Ask for confirmation if form has data and not in edit mode
  if (hasFormData && !editingJob) {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel? All unsaved changes will be lost.'
    );
    
    if (!confirmCancel) {
      return; // Don't cancel if user chooses to stay
    }
  }
  
  // Call the parent cancel handler
  onCancel();
};

const handleSubmit = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('📋 Form submit triggered');
  console.log('🎯 Assignment Preview:', assignmentPreview);
  console.log('👥 Selected Employee IDs:', selectedEmployeeIds);
  console.log('✏️ Editing Job:', editingJob);
  
  if (!validateForm()) {
    // Find which tab contains errors and switch to it
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.some(key => ['job_title', 'job_purpose', 'business_function', 'department', 'job_function', 'position_group'].includes(key))) {
      setActiveTab('position');
    } else if (errorKeys.some(key => ['criticalDuties', 'positionMainKpis', 'jobDuties', 'requirements'].includes(key))) {
      setActiveTab('responsibilities');
    } else {
      setActiveTab('conditions');
    }
    
    const errorMessage = Object.values(validationErrors).join('\n');
    alert('Please fix the following errors:\n\n' + errorMessage);
    return;
  }

  // FIXED: Skip employee selection check for edit mode
  if (!editingJob) {
    // Check for employee selection requirement only for new jobs
    if (assignmentPreview?.requiresSelection || assignmentPreview?.strategy === 'manual_selection_required') {
      if (selectedEmployeeIds.length === 0) {
        console.log('🚨 Employee selection required but none selected');
        
        if (eligibleEmployees.length > 0) {
          setShowEmployeeSelectionModal(true);
          return;
        } else {
          alert('Multiple employees match your criteria, but employee data is not available. Please try refreshing the preview.');
          return;
        }
      }
    }
  }

  try {
    setIsSubmitting(true);

    // Get IDs with enhanced error handling
    const businessFunctionId = getBusinessFunctionId(formData.business_function);
    const departmentId = getDepartmentId(formData.department);
    const jobFunctionId = getJobFunctionId(formData.job_function);
    const positionGroupId = getPositionGroupId(formData.position_group);
    const unitId = formData.unit ? getUnitId(formData.unit) : null;

    console.log('🔍 Final ID mapping results:');
    console.log('- Business Function:', formData.business_function, '→', businessFunctionId);
    console.log('- Department:', formData.department, '→', departmentId);
    console.log('- Job Function:', formData.job_function, '→', jobFunctionId);
    console.log('- Position Group:', formData.position_group, '→', positionGroupId);
    console.log('- Unit:', formData.unit, '→', unitId);

    // Validate that we have all required IDs
    const missingIds = [];
    if (!businessFunctionId) missingIds.push(`Business Function "${formData.business_function}"`);
    if (!departmentId) missingIds.push(`Department "${formData.department}"`);
    if (!jobFunctionId) missingIds.push(`Job Function "${formData.job_function}"`);
    if (!positionGroupId) missingIds.push(`Position Group "${formData.position_group}"`);

    if (missingIds.length > 0) {
      const errorMessage = `Cannot find IDs for: ${missingIds.join(', ')}. This might indicate a data synchronization issue.`;
      console.error('❌ ID mapping failed:', errorMessage);
      alert(errorMessage);
      return;
    }

    // Prepare data in exact format that works in Swagger
    const apiData = {
      job_title: formData.job_title.trim(),
      job_purpose: formData.job_purpose.trim(),
      business_function: businessFunctionId,
      department: departmentId,
      job_function: jobFunctionId,
      position_group: positionGroupId,
      
      // Only include grading_level if it has a value
      ...(formData.grading_level && formData.grading_level.trim() && { 
        grading_level: formData.grading_level.trim() 
      }),
      
      // Only include unit if it has a value
      ...(unitId && { unit: unitId }),
      
      // Process sections
      sections: [],
      
      // Skills and competencies
      required_skills_data: (formData.required_skills_data || [])
        .filter(skillId => skillId && !isNaN(parseInt(skillId)))
        .map(skillId => ({
          skill_id: parseInt(skillId),
          proficiency_level: "INTERMEDIATE",
          is_mandatory: true
        })),
      
      behavioral_competencies_data: (formData.behavioral_competencies_data || [])
        .filter(competencyId => competencyId && !isNaN(parseInt(competencyId)))
        .map(competencyId => ({
          competency_id: parseInt(competencyId),
          proficiency_level: "INTERMEDIATE", 
          is_mandatory: true
        })),
      
      // FIXED: For edit mode, convert names back to IDs for resources/benefits/access
      business_resources_ids: await convertNamesToIds(formData.business_resources_ids, 'business_resources'),
      access_rights_ids: await convertNamesToIds(formData.access_rights_ids, 'access_rights'),
      company_benefits_ids: await convertNamesToIds(formData.company_benefits_ids, 'company_benefits'),
        
      // Include selected employee IDs only for new jobs
      ...(!editingJob && selectedEmployeeIds.length > 0 && { 
        selected_employee_ids: selectedEmployeeIds.map(id => parseInt(id)).filter(id => !isNaN(id))
      })
    };

    // Process sections
    const sectionTypes = [
      { 
        type: 'CRITICAL_DUTIES', 
        title: 'Critical Duties and Responsibilities', 
        content: formData.criticalDuties || [],
        order: 1
      },
      { 
        type: 'MAIN_KPIS', 
        title: 'Key Performance Indicators', 
        content: formData.positionMainKpis || [],
        order: 2 
      },
      { 
        type: 'JOB_DUTIES', 
        title: 'Job Duties', 
        content: formData.jobDuties || [],
        order: 3
      },
      { 
        type: 'REQUIREMENTS', 
        title: 'Requirements and Qualifications', 
        content: formData.requirements || [],
        order: 4
      }
    ];

    sectionTypes.forEach((section) => {
      if (section.content && Array.isArray(section.content) && section.content.length > 0) {
        const validContent = section.content.filter(item => item && item.trim() !== '');
        if (validContent.length > 0) {
          const formattedContent = validContent
            .map((item, index) => `${index + 1}. ${item.trim()}`)
            .join('\n');
            
          apiData.sections.push({
            section_type: section.type,
            title: section.title,
            content: formattedContent,
            order: section.order
          });
        }
      }
    });

    console.log('📤 Final API data being sent:', JSON.stringify(apiData, null, 2));
    
    if (editingJob) {
      // Update existing job
      await jobDescriptionService.updateJobDescription(editingJob.id, apiData);
      alert('Job description updated successfully!');
      onUpdate();
    } else {
      // Create new job(s)
      const createdJob = await jobDescriptionService.createJobDescription(apiData);
      console.log('✅ Job(s) created successfully:', createdJob);
      
      // Handle multiple job creation response
      if (createdJob.summary && createdJob.summary.total_job_descriptions_created > 1) {
        console.log(`🎉 Successfully created ${createdJob.summary.total_job_descriptions_created} job descriptions!`);
      }
      
      onSubmit(createdJob);
    }
  } catch (error) {
    console.error('⚠️ Error saving job description:', error);
    console.error('⚠️ Error response:', error.response?.data);
    
    // Handle server response for employee selection requirement
    if (error.response?.status === 422 && error.response?.data?.requires_employee_selection) {
      console.log('📋 Server requires employee selection, showing modal with server data');
      
      const serverEmployees = error.response.data.eligible_employees || [];
      const serverCriteria = error.response.data.criteria || {};
      
      if (serverEmployees.length > 0) {
        setEligibleEmployees(serverEmployees);
        setJobCriteria(serverCriteria);
        setShowEmployeeSelectionModal(true);
        return;
      }
    }
    
    let errorMessage = 'Error saving job description: ';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage += error.response.data;
      } else if (typeof error.response.data === 'object') {
        const errorDetails = [];
        Object.keys(error.response.data).forEach(field => {
          const fieldErrors = Array.isArray(error.response.data[field]) 
            ? error.response.data[field].join(', ')
            : error.response.data[field];
          errorDetails.push(`${field}: ${fieldErrors}`);
        });
        errorMessage += errorDetails.join('\n');
      }
    } else {
      errorMessage += error.message || 'Please try again.';
    }
    
    console.error('📋 Full error details:', errorMessage);
    alert(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};
const convertNamesToIds = async (nameArray, resourceType) => {
  if (!Array.isArray(nameArray) || nameArray.length === 0) return [];
  
  const ids = [];
  
  for (const name of nameArray) {
    // If it's already a number, use it as is
    if (!isNaN(parseInt(name))) {
      ids.push(parseInt(name));
      continue;
    }
    
    // Find ID by name in dropdownData
    let foundId = null;
    switch (resourceType) {
      case 'business_resources':
        const resource = dropdownData.businessResources?.find(r => r.name === name);
        foundId = resource?.id;
        break;
      case 'access_rights':
        const access = dropdownData.accessMatrix?.find(a => a.name === name);
        foundId = access?.id;
        break;
      case 'company_benefits':
        const benefit = dropdownData.companyBenefits?.find(b => b.name === name);
        foundId = benefit?.id;
        break;
    }
    
    if (foundId) {
      ids.push(parseInt(foundId));
    } else {
      console.warn(`Could not find ID for ${resourceType} name: ${name}`);
    }
  }
  
  return ids;
};
  // Explicit save handler
  const handleExplicitSave = async () => {
    console.log('💾 Explicit save button clicked');
    
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    
    await handleSubmit(syntheticEvent);
  };

  // Handle next button click
  const handleNext = () => {
    if (validateCurrentTab()) {
      goToNextTab();
    } else {
      const errorMessage = Object.values(validationErrors).join('\n');
      alert('Please fix the following errors before proceeding:\n\n' + errorMessage);
    }
  };

  // Check if tab is completed
  const isTabCompleted = (tabId) => {
    switch (tabId) {
      case 'position':
        return formData.job_title && formData.job_purpose && formData.business_function && 
               formData.department && formData.job_function && formData.position_group;
      case 'responsibilities':
        return formData.criticalDuties?.some(item => item?.trim()) &&
               formData.positionMainKpis?.some(item => item?.trim()) &&
               formData.jobDuties?.some(item => item?.trim()) &&
               formData.requirements?.some(item => item?.trim());
      case 'conditions':
        return true;
      default:
        return false;
    }
  };

  // Get final submission info for display
  const getSubmissionInfo = () => {
  // FIXED: For edit mode, don't check assignment preview
  if (editingJob) {
    return {
      title: 'Ready to Update Job Description',
      description: 'Click "Update Job Description" to save your changes.',
      employeeCount: 0,
      type: 'edit',
      needsSelection: false // Never needs selection for edit
    };
  }
  
  if (!assignmentPreview) {
    return {
      title: 'Ready to Create Job Description',
      description: 'Click "Save & Continue" to create the job description.',
      employeeCount: 0,
      type: 'single'
    };
  }

  switch (assignmentPreview.strategy) {
    case 'auto_assign_single':
      return {
        title: 'Ready to Create & Auto-Assign',
        description: `Job will be automatically assigned to ${assignmentPreview.employees?.[0]?.full_name}.`,
        employeeCount: 1,
        type: 'auto_single',
        employee: assignmentPreview.employees?.[0]
      };
    
    case 'manual_selection_required':
      const selectedCount = selectedEmployeeIds.length;
      return {
        title: selectedCount > 0 
          ? `Ready to Create ${selectedCount} Job Description${selectedCount > 1 ? 's' : ''}` 
          : 'Employee Selection Required',
        description: selectedCount > 0 
          ? `Will create job descriptions for ${selectedCount} selected employee${selectedCount > 1 ? 's' : ''}.`
          : `${assignmentPreview.employeeCount} employees match your criteria. Please select employees before proceeding.`,
        employeeCount: selectedCount,
        totalAvailable: assignmentPreview.employeeCount,
        type: 'manual_multiple',
        needsSelection: selectedCount === 0
      };
    
    case 'no_employees_found':
      return {
        title: 'Ready to Create Vacant Position',
        description: 'Job will be created as a vacant position (no employee assigned).',
        employeeCount: 0,
        type: 'vacant'
      };
    
    default:
      return {
        title: 'Ready to Create Job Description',
        description: 'Click "Save & Continue" to create the job description.',
        employeeCount: 0,
        type: 'unknown'
      };
  }
};

  const submissionInfo = getSubmissionInfo();

  return (
    <>
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm overflow-hidden`}>
        
        {/* Form Header */}
        <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${textPrimary} mb-1`}>
                {editingJob ? 'Edit Job Description' : 'Create New Job Description'}
              </h2>
              <p className={`${textSecondary} text-xs`}>
                Step {getCurrentTabIndex() + 1} of {tabs.length}: {tabs[getCurrentTabIndex()]?.description}
              </p>
            </div>
            {/* <button
              onClick={onCancel}
              className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg`}
            >
              <X size={18} />
            </button> */}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className={`px-4 py-3 ${bgAccent} border-b border-gray-200 dark:border-almet-comet`}>
          <div className="flex items-center justify-between text-xs">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="flex items-center">
                <button
                  onClick={() => handleTabChange(tab.id)}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50
                    ${activeTab === tab.id ? 'bg-almet-sapphire text-white shadow-sm' : 
                      isTabCompleted(tab.id) ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' :
                      index < getCurrentTabIndex() ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600' :
                      'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {isTabCompleted(tab.id) && activeTab !== tab.id ? (
                    <CheckCircle size={14} />
                  ) : (
                    <tab.icon size={14} />
                  )}
                  <span className="font-medium">{tab.name}</span>
                </button>
                {index < tabs.length - 1 && (
                  <ArrowRight size={12} className="mx-2 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div onSubmit={(e) => e.preventDefault()}>
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'position' && (
              <PositionInformationTab
                formData={formData}
                dropdownData={dropdownData}
                selectedPositionGroup={selectedPositionGroup}
                matchingEmployees={matchingEmployees}
                validationErrors={validationErrors}
                onFormDataChange={onFormDataChange}
                onPositionGroupChange={onPositionGroupChange}
                onAssignmentPreviewUpdate={handleAssignmentPreviewUpdate}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'responsibilities' && (
              <JobResponsibilitiesTab
                formData={formData}
                selectedSkillGroup={selectedSkillGroup}
                selectedBehavioralGroup={selectedBehavioralGroup}
                availableSkills={availableSkills}
                availableCompetencies={availableCompetencies}
                dropdownData={dropdownData}
                validationErrors={validationErrors}
                onFormDataChange={onFormDataChange}
                onSkillGroupChange={onSkillGroupChange}
                onBehavioralGroupChange={onBehavioralGroupChange}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'conditions' && (
              <WorkConditionsTab
                formData={formData}
                dropdownData={dropdownData}
                onFormDataChange={onFormDataChange}
                darkMode={darkMode}
              />
            )}
          </div>

          {/* Step-by-Step Navigation */}
          <div className="p-4 border-t border-gray-200 dark:border-almet-comet bg-gray-50 dark:bg-almet-comet">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle size={12} />
                <span>All fields marked with * are required</span>
              </div>
              
              <div className="flex gap-3">
                {/* Previous Button */}
                {!isFirstTab() && (
                  <button
                    type="button"
                    onClick={goToPreviousTab}
                    disabled={isSubmitting}
                    className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm 
                      border border-gray-300 dark:border-almet-comet rounded-lg flex items-center gap-2`}
                  >
                    <ArrowLeft size={14} />
                    Previous
                  </button>
                )}

                <button
  type="button"
  onClick={handleCancel} // Use enhanced handler
  disabled={isSubmitting}
  className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm 
    border border-gray-300 dark:border-almet-comet rounded-lg`}
>
  Cancel
</button>

                {/* Next/Submit Button */}
                {!isLastTab() ? (
  <button
    type="button"
    onClick={handleNext}
    disabled={isSubmitting || !canNavigateToNext()}
    className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
      transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
  >
    Next
    <ArrowRight size={14} />
  </button>
) : (
  <button
    type="button"
    onClick={handleExplicitSave}
    disabled={isSubmitting || (submissionInfo.needsSelection && !editingJob)} // FIXED: Don't disable for edit mode
    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
      transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
  >
    {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
    <Save size={14} />
    {editingJob ? 'Update Job Description' : 'Save & Continue'}
  </button>
)}
              </div>
            </div>

            {/* Last Tab Instructions */}
            {isLastTab() && !editingJob && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText size={14} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">
                      {submissionInfo.title}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
                      {submissionInfo.description}
                    </p>
                    
                    {/* Employee Selection Button for Manual Selection */}
                    {submissionInfo.type === 'manual_multiple' && submissionInfo.needsSelection && (
                      <button
                        onClick={() => setShowEmployeeSelectionModal(true)}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg 
                          transition-colors text-xs font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        <Users size={12} />
                        Select from {submissionInfo.totalAvailable} Available Employees
                      </button>
                    )}

                    {/* Selected Employees Display */}
                    {submissionInfo.type === 'manual_multiple' && selectedEmployeeIds.length > 0 && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-green-600" />
                          <span className="text-xs text-green-800 dark:text-green-300 font-medium">
                            {selectedEmployeeIds.length} employee{selectedEmployeeIds.length > 1 ? 's' : ''} selected for job assignment
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Auto-assignment Display */}
                    {submissionInfo.type === 'auto_single' && submissionInfo.employee && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <UserCheck size={12} className="text-green-600" />
                          <span className="text-xs text-green-800 dark:text-green-300">
                            <span className="font-medium">Auto-assigning to:</span> {submissionInfo.employee.full_name} ({submissionInfo.employee.employee_id})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Vacant Position Display */}
                    {submissionInfo.type === 'vacant' && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900/20 rounded border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <Target size={12} className="text-gray-600" />
                          <span className="text-xs text-gray-800 dark:text-gray-300 font-medium">
                            Creating vacant position - no employee will be assigned
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Selection Modal */}
      <EmployeeSelectionModal
        isOpen={showEmployeeSelectionModal}
        onClose={() => setShowEmployeeSelectionModal(false)}
        eligibleEmployees={eligibleEmployees}
        jobCriteria={jobCriteria}
        onEmployeeSelect={handleEmployeeSelection}
        loading={false}
        darkMode={darkMode}
      />
    </>
  );
};

export default JobDescriptionForm;