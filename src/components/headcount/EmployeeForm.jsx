// src/components/headcount/EmployeeForm.jsx - Enhanced with Complete API Integration
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Save, X, AlertCircle } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useRouter } from "next/navigation";
import { useEmployees } from "../../hooks/useEmployees";
import { useReferenceData } from "../../hooks/useReferenceData";
import { apiService } from "../../services/api";
import StepIndicator from "./FormComponents/StepIndicator";
import { 
  FormStep1BasicInfo, 
  FormStep2JobInfo, 
  FormStep3AdditionalInfo, 
  FormStep4Documents 
} from "./FormSteps";

const EmployeeForm = ({ employee = null }) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const isEditMode = !!employee;

  // Redux hooks
  const { createEmployee, updateEmployee, loading, error, clearErrors } = useEmployees();
  const { 
    businessFunctions, 
    departments, 
    units, 
    jobFunctions, 
    positionGroups, 
    employeeStatuses,
    employeeTags,
    gradingLevels,
    fetchBusinessFunctions,
    fetchDepartments,
    fetchUnits,
    fetchJobFunctions,
    fetchPositionGroups,
    fetchEmployeeStatuses,
    fetchEmployeeTags,
    fetchPositionGroupGradingLevels,
    clearDepartments,
    clearUnits,
    loading: referenceDataLoading
  } = useReferenceData();

  // Step configuration
  const stepLabels = ["Basic Info", "Job Details", "Management", "Documents"];
  const totalSteps = stepLabels.length;
  const [activeStep, setActiveStep] = useState(1);

  // Line manager options with search
  const [lineManagerOptions, setLineManagerOptions] = useState([]);
  const [loadingLineManagers, setLoadingLineManagers] = useState(false);
  const [lineManagerSearch, setLineManagerSearch] = useState("");

  // Grading levels for selected position group
  const [availableGradingLevels, setAvailableGradingLevels] = useState([]);
  const [loadingGradingLevels, setLoadingGradingLevels] = useState(false);

  // Available tags by type
  const [availableTags, setAvailableTags] = useState({
    skill: [],
    department: [],
    project: [],
    certification: [],
    other: []
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Form data with enhanced structure
  const [formData, setFormData] = useState({
    // Basic Info
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    
    // Job Information
    start_date: "",
    contract_start_date: "",
    contract_duration: "Permanent",
    business_function: "",
    department: "",
    unit: "",
    job_function: "",
    job_title: "",
    position_group: "",
    grading_level: "", // This will be from grading API, not manual input
    
    // Management Info
    line_manager: "",
    emergency_contact: "",
    notes: "",
    
    // Tags - Array of tag IDs
    tag_ids: [],
    
    // Documents - Optional file uploads
    documents: [],
    profile_image: null,
    
    // Auto-managed fields (not user selectable)
    status: "ONBOARDING", // Auto-assigned based on contract
    contract_end_date: "", // Auto-calculated
    full_name: "", // Auto-generated
    
    // Optional linking
    vacancy_id: null,
    
    ...employee // Spread existing employee data if editing
  });

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  // Initialize reference data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchBusinessFunctions(),
          fetchEmployeeStatuses(),
          fetchJobFunctions(),
          fetchPositionGroups()
        ]);
        
        // Load tags by type
        await Promise.all([
          fetchEmployeeTags('skill'),
          fetchEmployeeTags('department'),
          fetchEmployeeTags('project'),
          fetchEmployeeTags('certification'),
          fetchEmployeeTags('other')
        ]);
      } catch (error) {
        console.error('Failed to initialize reference data:', error);
      }
    };

    initializeData();
    clearErrors();
  }, []);

  // Load departments when business function changes
  useEffect(() => {
    if (formData.business_function) {
      fetchDepartments(formData.business_function);
      // Clear dependent fields
      setFormData(prev => ({
        ...prev,
        department: "",
        unit: ""
      }));
      clearUnits();
    } else {
      clearDepartments();
      clearUnits();
    }
  }, [formData.business_function]);

  // Load units when department changes
  useEffect(() => {
    if (formData.department) {
      fetchUnits(formData.department);
      setFormData(prev => ({
        ...prev,
        unit: ""
      }));
    } else {
      clearUnits();
    }
  }, [formData.department]);

  // Load grading levels when position group changes
  useEffect(() => {
    if (formData.position_group) {
      loadGradingLevels(formData.position_group);
    } else {
      setAvailableGradingLevels([]);
    }
  }, [formData.position_group]);

  // Auto-calculate contract end date when duration changes
  useEffect(() => {
    if (formData.start_date && formData.contract_duration && formData.contract_duration !== 'Permanent') {
      const startDate = new Date(formData.start_date);
      let endDate = new Date(startDate);
      
      // Parse duration (e.g., "1 Year", "6 Months")
      const durationMatch = formData.contract_duration.match(/(\d+)\s*(Year|Month)s?/i);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        
        if (unit === 'year') {
          endDate.setFullYear(endDate.getFullYear() + value);
        } else if (unit === 'month') {
          endDate.setMonth(endDate.getMonth() + value);
        }
        
        setFormData(prev => ({
          ...prev,
          contract_end_date: endDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [formData.start_date, formData.contract_duration]);

  // Auto-generate full name
  useEffect(() => {
    if (formData.first_name || formData.last_name) {
      setFormData(prev => ({
        ...prev,
        full_name: `${formData.first_name} ${formData.last_name}`.trim()
      }));
    }
  }, [formData.first_name, formData.last_name]);

  // Load grading levels for position group
  const loadGradingLevels = async (positionGroupId) => {
    if (!positionGroupId) return;
    
    setLoadingGradingLevels(true);
    try {
      const response = await fetchPositionGroupGradingLevels(positionGroupId);
      const levels = response.payload?.levels || gradingLevels[positionGroupId] || [];
      setAvailableGradingLevels(levels);
      
      // Auto-select median level if no level selected
      if (!formData.grading_level && levels.length > 0) {
        const medianIndex = Math.floor(levels.length / 2);
        setFormData(prev => ({
          ...prev,
          grading_level: levels[medianIndex]?.level || levels[0]?.level
        }));
      }
    } catch (error) {
      console.error('Failed to load grading levels:', error);
      setAvailableGradingLevels([]);
    } finally {
      setLoadingGradingLevels(false);
    }
  };

  // Load line managers with search
  const loadLineManagers = useCallback(async (searchTerm = "") => {
    setLoadingLineManagers(true);
    try {
      const response = await apiService.getLineManagers({ 
        search: searchTerm,
        is_manager: true,
        page_size: 50
      });
      setLineManagerOptions(response.data.results || []);
    } catch (error) {
      console.error('Failed to load line managers:', error);
      setLineManagerOptions([]);
    } finally {
      setLoadingLineManagers(false);
    }
  }, []);

  // Load line managers on mount
  useEffect(() => {
    loadLineManagers();
  }, [loadLineManagers]);

  // Input change handler
  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Line manager change handler
  const handleLineManagerChange = (selectedManager) => {
    setFormData(prev => ({
      ...prev,
      line_manager: selectedManager ? selectedManager.id : ""
    }));
  };

  // Line manager search handler
  const handleLineManagerSearch = (searchTerm) => {
    setLineManagerSearch(searchTerm);
    loadLineManagers(searchTerm);
  };

  // Tags change handler - Multi-select with easy add/remove
  const handleTagsChange = (tagIds) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: Array.isArray(tagIds) ? tagIds : []
    }));
  };

  // Add new tag functionality
  const handleAddNewTag = async (tagName, tagType = 'other') => {
    try {
      const response = await apiService.createEmployeeTag({
        name: tagName.trim(),
        tag_type: tagType,
        description: `${tagType} tag`,
        is_active: true
      });
      
      // Add to available tags
      setAvailableTags(prev => ({
        ...prev,
        [tagType]: [...prev[tagType], response.data]
      }));
      
      // Add to selected tags
      setFormData(prev => ({
        ...prev,
        tag_ids: [...prev.tag_ids, response.data.id]
      }));
      
      return response.data;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  };

  // Remove tag functionality
  const handleRemoveTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.filter(id => id !== tagId)
    }));
  };

  // File upload handler
  const handleFileUpload = (fieldName, file) => {
    if (fieldName === 'profile_image') {
      setFormData(prev => ({
        ...prev,
        profile_image: file
      }));
    }
  };

  // Document upload handler - Non-mandatory
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files);
    if (files.length) {
      const newDocuments = files.map(file => ({
        id: Date.now() + Math.random(), // Temporary ID
        name: file.name,
        document_type: 'OTHER',
        file_path: URL.createObjectURL(file),
        file_size: file.size,
        mime_type: file.type,
        file: file,
        dateUploaded: new Date().toISOString()
      }));

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments]
      }));
    }
  };

  // Remove document handler
  const removeDocument = (index) => {
    const updatedDocuments = [...formData.documents];
    if (updatedDocuments[index].file_path?.startsWith('blob:')) {
      URL.revokeObjectURL(updatedDocuments[index].file_path);
    }
    updatedDocuments.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      documents: updatedDocuments
    }));
  };

  // Form validation with backend field requirements
  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.employee_id.trim()) errors.employee_id = "Employee ID is required";
        if (!formData.first_name.trim()) errors.first_name = "First name is required";
        if (!formData.last_name.trim()) errors.last_name = "Last name is required";
        if (!formData.email.trim()) {
          errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = "Email is invalid";
        }
        break;
      
      case 2: // Job Info
        if (!formData.start_date) errors.start_date = "Start date is required";
        if (!formData.business_function) errors.business_function = "Business function is required";
        if (!formData.department) errors.department = "Department is required";
        if (!formData.job_function) errors.job_function = "Job function is required";
        if (!formData.job_title.trim()) errors.job_title = "Job title is required";
        if (!formData.position_group) errors.position_group = "Position group is required";
        if (!formData.grading_level) errors.grading_level = "Grading level is required";
        if (!formData.contract_duration) errors.contract_duration = "Contract duration is required";
        
        // Date validation
        if (formData.start_date && formData.contract_start_date) {
          const startDate = new Date(formData.start_date);
          const contractStartDate = new Date(formData.contract_start_date);
          if (contractStartDate < startDate) {
            errors.contract_start_date = "Contract start date cannot be before employment start date";
          }
        }
        break;
      
      case 3: // Additional Info - All optional
        break;
      
      case 4: // Documents - All optional
        break;
      
      default:
        break;
    }

    return errors;
  };

  // Step navigation
  const canProceed = (step) => {
    const errors = validateStep(step);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (canProceed(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    if (step <= activeStep || canProceed(activeStep)) {
      setActiveStep(step);
    }
  };

  // Submit handler with proper backend integration
  const handleSubmit = async () => {
    // Validate all steps
    let allErrors = {};
    for (let step = 1; step <= totalSteps; step++) {
      const stepErrors = validateStep(step);
      allErrors = { ...allErrors, ...stepErrors };
    }

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      // Go to first step with errors
      for (let step = 1; step <= totalSteps; step++) {
        const stepErrors = validateStep(step);
        if (Object.keys(stepErrors).length > 0) {
          setActiveStep(step);
          break;
        }
      }
      return;
    }

    try {
      // Prepare form data for API
      const apiData = new FormData();
      
      // Required fields
      apiData.append('employee_id', formData.employee_id);
      apiData.append('first_name', formData.first_name);
      apiData.append('last_name', formData.last_name);
      apiData.append('email', formData.email);
      apiData.append('business_function', formData.business_function);
      apiData.append('department', formData.department);
      apiData.append('job_function', formData.job_function);
      apiData.append('job_title', formData.job_title);
      apiData.append('position_group', formData.position_group);
      apiData.append('start_date', formData.start_date);
      apiData.append('contract_duration', formData.contract_duration);
      apiData.append('grading_level', formData.grading_level); // From grading API, not manual input

      // Optional fields
      if (formData.unit) apiData.append('unit', formData.unit);
      if (formData.line_manager) apiData.append('line_manager', formData.line_manager);
      if (formData.contract_start_date) apiData.append('contract_start_date', formData.contract_start_date);
      if (formData.date_of_birth) apiData.append('date_of_birth', formData.date_of_birth);
      if (formData.gender) apiData.append('gender', formData.gender);
      if (formData.address) apiData.append('address', formData.address);
      if (formData.phone) apiData.append('phone', formData.phone);
      if (formData.emergency_contact) apiData.append('emergency_contact', formData.emergency_contact);
      if (formData.notes) apiData.append('notes', formData.notes);
      if (formData.vacancy_id) apiData.append('vacancy_id', formData.vacancy_id);

      // Tags
      if (formData.tag_ids.length > 0) {
        formData.tag_ids.forEach(tagId => {
          apiData.append('tag_ids', tagId);
        });
      }

      // Profile image (optional)
      if (formData.profile_image) {
        apiData.append('profile_image', formData.profile_image);
      }

      // Documents (optional)
      formData.documents.forEach((doc, index) => {
        if (doc.file) {
          apiData.append(`documents[${index}].file`, doc.file);
          apiData.append(`documents[${index}].document_type`, doc.document_type);
          apiData.append(`documents[${index}].name`, doc.name);
        }
      });

      // Submit to API
      let result;
      if (isEditMode) {
        result = await updateEmployee({ id: employee.id, data: apiData });
      } else {
        result = await createEmployee(apiData);
      }

      if (result.meta?.requestStatus === 'fulfilled') {
        // Success - redirect to employee list
        router.push("/structure/headcount-table");
      } else {
        // Handle API errors
        console.error('Submit failed:', result);
      }
    } catch (error) {
      console.error('Failed to submit employee:', error);
      // Show error message to user
      setValidationErrors({ 
        submit: error.response?.data?.detail || error.message || 'Failed to save employee' 
      });
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      // Cleanup blob URLs
      formData.documents.forEach(doc => {
        if (doc.file_path?.startsWith('blob:')) {
          URL.revokeObjectURL(doc.file_path);
        }
      });
      router.push("/structure/headcount-table");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      formData.documents.forEach(doc => {
        if (doc.file_path?.startsWith('blob:')) {
          URL.revokeObjectURL(doc.file_path);
        }
      });
    };
  }, []);

  // Prepare grading options for dropdown (show short codes)
  const gradeOptions = availableGradingLevels.map(level => ({
    value: level.level,
    label: level.short_code || level.level, // Show short code like "UQ" for "upper_quartile"
    description: level.name // Full name for tooltip/description
  }));

  // Render current step content
  const renderStepContent = () => {
    const commonProps = {
      formData,
      handleInputChange,
      handleFileUpload,
      handleDocumentUpload,
      removeDocument,
      handleTagsChange,
      handleAddNewTag,
      handleRemoveTag,
      handleLineManagerChange,
      handleLineManagerSearch,
      validationErrors,
      businessFunctions,
      departments,
      units,
      jobFunctions,
      positionGroups,
      employeeStatuses,
      employeeTags,
      availableTags,
      gradeOptions,
      loadingGradingLevels,
      lineManagerOptions,
      loadingLineManagers,
      lineManagerSearch
    };

    switch (activeStep) {
      case 1:
        return <FormStep1BasicInfo {...commonProps} />;
      case 2:
        return <FormStep2JobInfo {...commonProps} />;
      case 3:
        return <FormStep3AdditionalInfo {...commonProps} />;
      case 4:
        return <FormStep4Documents {...commonProps} />;
      default:
        return null;
    }
  };

  // Get step completion status
  const getStepStatus = (step) => {
    if (step < activeStep) {
      const errors = validateStep(step);
      return Object.keys(errors).length === 0 ? 'completed' : 'error';
    }
    if (step === activeStep) return 'active';
    return 'pending';
  };

  return (
    <>
      <div className="container mx-auto px-4 py-0">
        <div className={`${bgCard} rounded-xl shadow-lg overflow-hidden border ${borderColor}`}>
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>
                  {isEditMode ? 'Edit Employee' : 'New Employee'}
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  {isEditMode 
                    ? 'Update employee information and documents' 
                    : 'Add a new employee to the organization'
                  }
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Cancel"
              >
                <X size={20} className={textSecondary} />
              </button>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 border-b border-gray-100 dark:border-gray-700">
            <StepIndicator 
              currentStep={activeStep} 
              totalSteps={totalSteps} 
              stepLabels={stepLabels}
              getStepStatus={getStepStatus}
              onStepClick={goToStep}
            />
            
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-almet-sapphire h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(activeStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-6">
            {/* Global error message */}
            {validationErrors.submit && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-sm text-red-800 dark:text-red-300">
                    {validationErrors.submit}
                  </span>
                </div>
              </div>
            )}

            {/* Step Content */}
            {renderStepContent()}
          </div>

          {/* Navigation Footer */}
          <div className={`px-6 py-4 border-t ${borderColor} bg-gray-50 dark:bg-gray-800/50`}>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={activeStep === 1}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : `${btnSecondary} hover:shadow-sm`
                }`}
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>

              <div className="flex items-center space-x-3">
                {activeStep < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className={`flex items-center px-6 py-2 rounded-lg ${btnPrimary} hover:shadow-sm`}
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading.creating || loading.updating}
                    className={`flex items-center px-6 py-2 rounded-lg ${btnPrimary} hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Save size={16} className="mr-2" />
                    {loading.creating || loading.updating 
                      ? 'Saving...' 
                      : isEditMode ? 'Update Employee' : 'Create Employee'
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeForm;