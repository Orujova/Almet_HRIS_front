import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import PositionInformationTab from './PositionInformationTab';
import JobResponsibilitiesTab from './JobResponsibilitiesTab';
import WorkConditionsTab from './WorkConditionsTab';
import jobDescriptionService from '@/services/jobDescriptionService';

const JobDescriptionForm = ({
  formData = {},
  editingJob = null,
  dropdownData = {},
  selectedEmployee = '',
  autoManager = null,
  selectedSkillGroup = '',
  selectedBehavioralGroup = '',
  availableSkills = [],
  availableCompetencies = [],
  selectedPositionGroup = '',
  businessFunctionDepartments = [],
  departmentUnits = [],
  matchingEmployees = [],
  actionLoading = false,
  onFormDataChange = () => {},
  onEmployeeSelect = () => {},
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
      description: 'Job title, department, employee'
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
        return true; // Can always proceed from conditions tab
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
    // If trying to go forward, validate current tab
    const currentIndex = getCurrentTabIndex();
    const targetIndex = tabs.findIndex(tab => tab.id === targetTabId);
    
    if (targetIndex > currentIndex) {
      // Going forward - validate current tab
      if (validateCurrentTab()) {
        setActiveTab(targetTabId);
      } else {
        const errorMessage = Object.values(validationErrors).join('\n');
        alert('Please fix the following errors before proceeding:\n\n' + errorMessage);
      }
    } else {
      // Going backward - allow without validation
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
    
    // Validate department-business function relationship
    if (formData.department && formData.business_function) {
      const isValidDepartment = (businessFunctionDepartments || []).some(dept => dept.id === parseInt(formData.department));
      if (!isValidDepartment) {
        errors.department = 'Selected department does not belong to the selected business function';
      }
    }
    
    // Validate unit-department relationship if unit is selected
    if (formData.unit && formData.department) {
      const isValidUnit = (departmentUnits || []).some(unit => unit.id === parseInt(formData.unit));
      if (!isValidUnit) {
        errors.unit = 'Selected unit does not belong to the selected department';
      }
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

  // Handle form submission - ONLY WHEN USER EXPLICITLY CLICKS SAVE BUTTON
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📝 Form submit triggered');
    
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

    try {
      // Prepare data for API - Updated structure without manual employee fields
      const apiData = {
        job_title: formData.job_title.trim(),
        job_purpose: formData.job_purpose.trim(),
        business_function: parseInt(formData.business_function),
        department: parseInt(formData.department),
        job_function: parseInt(formData.job_function),
        position_group: parseInt(formData.position_group),
        grading_level: formData.grading_level?.trim() || null,
        
        // Handle employee assignment - only assigned_employee field
        assigned_employee: selectedEmployee ? parseInt(selectedEmployee) : null,
        reports_to: formData.reports_to ? parseInt(formData.reports_to) : null,
        
        // Sections
        sections: [],
        
        // Skills and competencies
        required_skills_data: (formData.required_skills_data || []).map(skillId => ({
          skill_id: parseInt(skillId),
          proficiency_level: "INTERMEDIATE",
          is_mandatory: true
        })),
        behavioral_competencies_data: (formData.behavioral_competencies_data || []).map(competencyId => ({
          competency_id: parseInt(competencyId),
          proficiency_level: "INTERMEDIATE",
          is_mandatory: true
        })),
        
        // Resources and benefits
        business_resources_ids: (formData.business_resources_ids || []).map(id => parseInt(id)).filter(id => !isNaN(id)),
        access_rights_ids: (formData.access_rights_ids || []).map(id => parseInt(id)).filter(id => !isNaN(id)),
        company_benefits_ids: (formData.company_benefits_ids || []).map(id => parseInt(id)).filter(id => !isNaN(id))
      };

      // Add unit if selected and valid
      if (formData.unit && parseInt(formData.unit)) {
        const isValidUnit = (departmentUnits || []).some(unit => unit.id === parseInt(formData.unit));
        if (isValidUnit) {
          apiData.unit = parseInt(formData.unit);
        }
      }

      // Process sections
      const sectionTypes = [
        { type: 'CRITICAL_DUTIES', title: 'Critical Duties', content: formData.criticalDuties || [] },
        { type: 'MAIN_KPIS', title: 'Position Main KPIs', content: formData.positionMainKpis || [] },
        { type: 'JOB_DUTIES', title: 'Job Duties', content: formData.jobDuties || [] },
        { type: 'REQUIREMENTS', title: 'Requirements', content: formData.requirements || [] }
      ];

      sectionTypes.forEach((section, index) => {
        if (section.content && Array.isArray(section.content) && section.content.length > 0) {
          const validContent = section.content.filter(item => item && item.trim() !== '');
          if (validContent.length > 0) {
            apiData.sections.push({
              section_type: section.type,
              title: section.title,
              content: validContent.map(item => `• ${item.trim()}`).join('\n'),
              order: index + 1
            });
          }
        }
      });

      console.log('📤 API data being sent:', apiData);
      
      if (editingJob) {
        // Update existing job
        await jobDescriptionService.updateJobDescription(editingJob.id, apiData);
        alert('Job description updated successfully!');
        onUpdate();
      } else {
        // Create new job - ONLY trigger modal when form is submitted
        const createdJob = await jobDescriptionService.createJobDescription(apiData);
        console.log('✅ Job created successfully, triggering submission modal:', createdJob);
        onSubmit(createdJob);
      }
    } catch (error) {
      console.error('⚠️ Error saving job description:', error);
      
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
      
      alert(errorMessage);
    }
  };

  // Explicit save handler - ONLY this should trigger the submit
  const handleExplicitSave = async () => {
    console.log('💾 Explicit save button clicked');
    
    // Create a synthetic form event
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
        return true; // Optional tab
      default:
        return false;
    }
  };

  return (
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
          <button
            onClick={onCancel}
            className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg`}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className={`px-4 py-3 ${bgAccent} border-b border-gray-200 dark:border-almet-comet`}>
        <div className="flex items-center justify-between text-xs">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="flex items-center">
              <button
                onClick={() => handleTabChange(tab.id)}
                disabled={actionLoading}
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
              selectedEmployee={selectedEmployee}
              autoManager={autoManager}
              selectedPositionGroup={selectedPositionGroup}
              businessFunctionDepartments={businessFunctionDepartments}
              departmentUnits={departmentUnits}
              matchingEmployees={matchingEmployees}
              validationErrors={validationErrors}
              onFormDataChange={onFormDataChange}
              onEmployeeSelect={onEmployeeSelect}
              onPositionGroupChange={onPositionGroupChange}
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
                  disabled={actionLoading}
                  className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm 
                    border border-gray-300 dark:border-almet-comet rounded-lg flex items-center gap-2`}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>
              )}

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onCancel}
                disabled={actionLoading}
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
                  disabled={actionLoading || !canNavigateToNext()}
                  className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
                    transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              ) : (
                // SAVE BUTTON - ONLY APPEARS ON LAST TAB - USE EXPLICIT HANDLER
                <button
                  type="button"
                  onClick={handleExplicitSave}
                  disabled={actionLoading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                    transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                >
                  {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <Save size={14} />
                  {editingJob ? 'Update Job Description' : 'Save as Draft'}
                </button>
              )}
            </div>
          </div>

          {/* Last Tab Instructions */}
          {isLastTab() && !editingJob && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText size={14} className="text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                    Ready to Save Job Description
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    Click "Save as Draft" to create the job description. You can then choose to submit it for approval workflow or keep it as a draft for later.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionForm;