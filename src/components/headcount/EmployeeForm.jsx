// src/components/headcount/EmployeeForm.jsx - Complete with Full API Integration
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Save, X, AlertCircle, CheckCircle, Loader } from "lucide-react";
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

const EmployeeForm = ({ employee = null, onSuccess = null, onCancel = null }) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const isEditMode = !!employee;

  // Redux hooks
  const { 
    createEmployee, 
    updateEmployee, 
    loading: employeeLoading, 
    error: employeeError, 
    clearErrors 
  } = useEmployees();

  const { 
    businessFunctions, 
    departments, 
    units, 
    jobFunctions, 
    positionGroups, 
    employeeStatuses,
    employeeTags,
    loading: referenceLoading,
    error: referenceError,
    fetchBusinessFunctions,
    fetchDepartments,
    fetchUnits,
    fetchJobFunctions,
    fetchPositionGroups,
    fetchEmployeeStatuses,
    fetchEmployeeTags,
    clearDepartments,
    clearUnits,
    getDepartmentsByBusinessFunction,
    getUnitsByDepartment
  } = useReferenceData();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information (Required)
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    
    // Personal Information (Optional)
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    emergency_contact: "",
    
    // Job Information (Required)
    business_function: "",
    department: "",
    unit: "",
    job_function: "",
    job_title: "",
    position_group: "",
    grading_level: "",
    start_date: "",
    contract_duration: "PERMANENT",
    
    // Contract Information (Auto-calculated/Optional)
    contract_start_date: "",
    contract_end_date: "",
    
    // Management Information (Optional)
    line_manager: "",
    notes: "",
    
    // System Fields (Auto-managed)
    status: "ONBOARDING",
    is_visible_in_org_chart: true,
    
    // Tags and Documents (Optional)
    tag_ids: [],
    documents: [],
    profile_image: null,
    
    // Spread existing employee data if editing
    ...employee
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [stepValidation, setStepValidation] = useState({
    1: false, // Basic info
    2: false, // Job info  
    3: false, // Additional info (always valid as optional)
    4: false  // Documents (always valid as optional)
  });

  // API-specific state
  const [lineManagerOptions, setLineManagerOptions] = useState([]);
  const [lineManagerSearch, setLineManagerSearch] = useState("");
  const [loadingLineManagers, setLoadingLineManagers] = useState(false);
  const [gradingLevels, setGradingLevels] = useState([]);
  const [loadingGradingLevels, setLoadingGradingLevels] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-50"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50";

  // Step configuration
  const stepLabels = ["Basic Information", "Job Details", "Additional Info", "Documents"];
  const totalSteps = stepLabels.length;

  // Initialize reference data
  useEffect(() => {
    const initializeReferenceData = async () => {
      try {
        await Promise.all([
          fetchBusinessFunctions(),
          fetchJobFunctions(),
          fetchPositionGroups(),
          fetchEmployeeStatuses(),
          fetchEmployeeTags()
        ]);
      } catch (error) {
        console.error('Failed to initialize reference data:', error);
      }
    };

    initializeReferenceData();
    clearErrors();
  }, []);

  // Load departments when business function changes
  useEffect(() => {
    if (formData.business_function) {
      fetchDepartments(formData.business_function);
      // Clear dependent fields when business function changes
      if (formData.business_function !== employee?.business_function) {
        setFormData(prev => ({
          ...prev,
          department: "",
          unit: ""
        }));
      }
    } else {
      clearDepartments();
      clearUnits();
    }
  }, [formData.business_function]);

  // Load units when department changes
  useEffect(() => {
    if (formData.department) {
      fetchUnits(formData.department);
      // Clear unit when department changes
      if (formData.department !== employee?.department) {
        setFormData(prev => ({
          ...prev,
          unit: ""
        }));
      }
    } else {
      clearUnits();
    }
  }, [formData.department]);

  // Load grading levels when position group changes
  useEffect(() => {
    if (formData.position_group) {
      loadGradingLevels(formData.position_group);
    } else {
      setGradingLevels([]);
    }
  }, [formData.position_group]);

  // Auto-calculate contract end date
  useEffect(() => {
    if (formData.start_date && formData.contract_duration && formData.contract_duration !== 'PERMANENT') {
      const startDate = new Date(formData.start_date);
      let endDate = new Date(startDate);
      
      switch (formData.contract_duration) {
        case '3_MONTHS':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case '6_MONTHS':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case '1_YEAR':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        case '2_YEARS':
          endDate.setFullYear(endDate.getFullYear() + 2);
          break;
        case '3_YEARS':
          endDate.setFullYear(endDate.getFullYear() + 3);
          break;
        default:
          endDate = null;
      }
      
      if (endDate) {
        setFormData(prev => ({
          ...prev,
          contract_end_date: endDate.toISOString().split('T')[0]
        }));
      }
    } else if (formData.contract_duration === 'PERMANENT') {
      setFormData(prev => ({
        ...prev,
        contract_end_date: ""
      }));
    }
  }, [formData.start_date, formData.contract_duration]);

  // Load line managers with search
  const loadLineManagers = useCallback(async (searchTerm = "") => {
    setLoadingLineManagers(true);
    try {
      const response = await apiService.getLineManagers({ 
        search: searchTerm,
        page_size: 50
      });
      setLineManagerOptions(response.data || []);
    } catch (error) {
      console.error('Failed to load line managers:', error);
      setLineManagerOptions([]);
    } finally {
      setLoadingLineManagers(false);
    }
  }, []);

  // Load grading levels for position group
  const loadGradingLevels = useCallback(async (positionGroupId) => {
    setLoadingGradingLevels(true);
    try {
      const response = await apiService.getPositionGroupGradingLevels(positionGroupId);
      setGradingLevels(response.data.levels || []);
    } catch (error) {
      console.error('Failed to load grading levels:', error);
      setGradingLevels([]);
    } finally {
      setLoadingGradingLevels(false);
    }
  }, []);

  // Initialize line managers on mount
  useEffect(() => {
    loadLineManagers();
  }, [loadLineManagers]);

  // Form validation by step
  const validateStep = useCallback((step) => {
    const errors = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.employee_id?.trim()) {
          errors.employee_id = "Employee ID is required";
        }
        if (!formData.first_name?.trim()) {
          errors.first_name = "First name is required";
        }
        if (!formData.last_name?.trim()) {
          errors.last_name = "Last name is required";
        }
        if (!formData.email?.trim()) {
          errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = "Please enter a valid email address";
        }
        break;

      case 2: // Job Information
        if (!formData.start_date) {
          errors.start_date = "Start date is required";
        }
        if (!formData.business_function) {
          errors.business_function = "Business function is required";
        }
        if (!formData.department) {
          errors.department = "Department is required";
        }
        if (!formData.job_function) {
          errors.job_function = "Job function is required";
        }
        if (!formData.job_title?.trim()) {
          errors.job_title = "Job title is required";
        }
        if (!formData.position_group) {
          errors.position_group = "Position group is required";
        }
        if (!formData.grading_level) {
          errors.grading_level = "Grading level is required";
        }
        if (!formData.contract_duration) {
          errors.contract_duration = "Contract duration is required";
        }

        // Date validation
        if (formData.start_date && formData.contract_start_date) {
          const startDate = new Date(formData.start_date);
          const contractStartDate = new Date(formData.contract_start_date);
          if (contractStartDate < startDate) {
            errors.contract_start_date = "Contract start date cannot be before employment start date";
          }
        }
        break;

      case 3: // Additional Information (all optional)
        // No required fields in this step
        break;

      case 4: // Documents (all optional)
        // No required fields in this step
        break;
    }

    return errors;
  }, [formData]);

  // Update step validation
  useEffect(() => {
    const newStepValidation = {};
    for (let step = 1; step <= totalSteps; step++) {
      const errors = validateStep(step);
      newStepValidation[step] = Object.keys(errors).length === 0;
    }
    setStepValidation(newStepValidation);
  }, [formData, validateStep]);

  // Get step status for indicator
  const getStepStatus = useCallback((step) => {
    if (step < currentStep && stepValidation[step]) {
      return 'completed';
    }
    if (step < currentStep && !stepValidation[step]) {
      return 'error';
    }
    if (step === currentStep) {
      return 'active';
    }
    return 'pending';
  }, [currentStep, stepValidation]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Handle line manager search
  const handleLineManagerSearch = useCallback((searchTerm) => {
    setLineManagerSearch(searchTerm);
    if (searchTerm.length >= 2) {
      loadLineManagers(searchTerm);
    }
  }, [loadLineManagers]);

  // Handle tag management
  const handleAddTag = useCallback((tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: [...(prev.tag_ids || []), tagId]
    }));
  }, []);

  const handleRemoveTag = useCallback((tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: (prev.tag_ids || []).filter(id => id !== tagId)
    }));
  }, []);

  // Handle document upload
  const handleDocumentUpload = useCallback((document) => {
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), document]
    }));
  }, []);

  // Handle document removal
  const handleRemoveDocument = useCallback((index) => {
    setFormData(prev => {
      const newDocuments = [...(prev.documents || [])];
      // Cleanup blob URL if it exists
      if (newDocuments[index]?.file_path?.startsWith('blob:')) {
        URL.revokeObjectURL(newDocuments[index].file_path);
      }
      newDocuments.splice(index, 1);
      return {
        ...prev,
        documents: newDocuments
      };
    });
  }, []);

  // Step navigation
  const canProceed = useCallback((step) => {
    const errors = validateStep(step);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validateStep]);

  const handleNext = useCallback(() => {
    if (canProceed(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  }, [currentStep, canProceed, totalSteps]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleStepClick = useCallback((step) => {
    if (step <= currentStep) {
      // Allow going back to previous steps
      setCurrentStep(step);
    } else {
      // Check if all previous steps are valid before jumping ahead
      let canJump = true;
      for (let i = currentStep; i < step; i++) {
        if (!canProceed(i)) {
          canJump = false;
          break;
        }
      }
      if (canJump) {
        setCurrentStep(step);
      }
    }
  }, [currentStep, canProceed]);

  // Form submission
  const handleSubmit = async () => {
    // Validate all steps
    let allErrors = {};
    let hasErrors = false;

    for (let step = 1; step <= totalSteps; step++) {
      const stepErrors = validateStep(step);
      if (Object.keys(stepErrors).length > 0) {
        allErrors = { ...allErrors, ...stepErrors };
        hasErrors = true;
        
        // Go to first step with errors
        if (!hasErrors) {
          setCurrentStep(step);
        }
      }
    }

    if (hasErrors) {
      setValidationErrors(allErrors);
      return;
    }

    setSubmitting(true);
    
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
      apiData.append('grading_level', formData.grading_level);
      apiData.append('start_date', formData.start_date);
      apiData.append('contract_duration', formData.contract_duration);

      // Optional fields
      if (formData.unit) apiData.append('unit', formData.unit);
      if (formData.phone) apiData.append('phone', formData.phone);
      if (formData.date_of_birth) apiData.append('date_of_birth', formData.date_of_birth);
      if (formData.gender) apiData.append('gender', formData.gender);
      if (formData.address) apiData.append('address', formData.address);
      if (formData.emergency_contact) apiData.append('emergency_contact', formData.emergency_contact);
      if (formData.line_manager) apiData.append('line_manager', formData.line_manager);
      if (formData.contract_start_date) apiData.append('contract_start_date', formData.contract_start_date);
      if (formData.contract_end_date) apiData.append('contract_end_date', formData.contract_end_date);
      if (formData.notes) apiData.append('notes', formData.notes);
      
      // Boolean fields
      apiData.append('is_visible_in_org_chart', formData.is_visible_in_org_chart);

      // Tags
      if (formData.tag_ids && formData.tag_ids.length > 0) {
        formData.tag_ids.forEach(tagId => {
          apiData.append('tag_ids', tagId);
        });
      }

      // Profile image
      if (formData.profile_image) {
        apiData.append('profile_image', formData.profile_image);
      }

      // Documents
      if (formData.documents && formData.documents.length > 0) {
        formData.documents.forEach((doc, index) => {
          if (doc.file) {
            apiData.append(`documents`, doc.file);
          }
        });
      }

      // Submit to API
      let result;
      if (isEditMode) {
        result = await updateEmployee({ id: employee.id, data: apiData });
      } else {
        result = await createEmployee(apiData);
      }

      // Handle success
      if (result.type.endsWith('/fulfilled')) {
        if (onSuccess) {
          onSuccess(result.payload);
        } else {
          router.push("/structure/headcount-table");
        }
      } else {
        // Handle API errors
        const errorMessage = result.payload?.detail || result.payload?.message || 'Failed to save employee';
        setValidationErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setValidationErrors({ 
        submit: error.response?.data?.detail || error.message || 'Failed to save employee' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/structure/headcount-table");
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      formData.documents?.forEach(doc => {
        if (doc.file_path?.startsWith('blob:')) {
          URL.revokeObjectURL(doc.file_path);
        }
      });
    };
  }, []);

  // Prepare options for form steps
  const stepProps = {
    formData,
    handleInputChange,
    validationErrors,
    
    // Reference data
    businessFunctions: businessFunctions.map(bf => ({ value: bf.id, label: bf.name })),
    departments: departments.filter(dept => 
      formData.business_function ? dept.business_function === parseInt(formData.business_function) : true
    ).map(dept => ({ 
      value: dept.id, 
      label: dept.name 
    })),
    units: units.filter(unit => 
      formData.department ? unit.department === parseInt(formData.department) : true
    ).map(unit => ({ 
      value: unit.id, 
      label: unit.name 
    })),
    jobFunctions: jobFunctions.map(jf => ({ value: jf.id, label: jf.name })),
    positionGroups: positionGroups.map(pg => ({ 
      value: pg.id, 
      label: pg.display_name || pg.name 
    })),
    
    // Grading options (from API)
    gradeOptions: gradingLevels.map(level => ({
      value: level.code,
      label: level.display,
      description: level.full_name
    })),
    loadingGradingLevels,
    
    // Line manager options
    lineManagerOptions,
    lineManagerSearch,
    setLineManagerSearch: handleLineManagerSearch,
    loadingLineManagers,
    
    // Tag options
    tagOptions: employeeTags.map(tag => ({
      value: tag.id,
      label: tag.name,
      color: tag.color,
      tag_type: tag.tag_type
    })),
    onAddTag: handleAddTag,
    onRemoveTag: handleRemoveTag,
    
    // Document handling
    handleDocumentUpload,
    removeDocument: handleRemoveDocument,
    
    // Loading states
    loading: referenceLoading
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <FormStep1BasicInfo {...stepProps} />;
      case 2:
        return <FormStep2JobInfo {...stepProps} />;
      case 3:
        return <FormStep3AdditionalInfo {...stepProps} />;
      case 4:
        return <FormStep4Documents {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-0">
      <div className={`${bgCard} rounded-xl shadow-lg overflow-hidden border ${borderColor}`}>
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-xl font-bold ${textPrimary}`}>
                {isEditMode ? `Edit Employee: ${employee.name}` : 'Add New Employee'}
              </h1>
              <p className={`text-sm ${textSecondary} mt-1`}>
                {isEditMode 
                  ? 'Update employee information and documents' 
                  : 'Complete all required information to add a new employee'
                }
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={submitting}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Cancel"
            >
              <X size={20} className={textSecondary} />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 border-b border-gray-100 dark:border-gray-700">
          <StepIndicator 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
            stepLabels={stepLabels}
            getStepStatus={getStepStatus}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />
          
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-almet-sapphire h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
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

          {/* Loading reference data */}
          {referenceLoading.businessFunctions && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center">
                <Loader className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm text-blue-800 dark:text-blue-300">
                  Loading reference data...
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
              disabled={currentStep === 1 || submitting}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                currentStep === 1 || submitting
                  ? "text-gray-400 cursor-not-allowed"
                  : `${btnSecondary} hover:shadow-sm`
              }`}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>

            <div className="flex items-center space-x-3">
              {/* Step progress indicator */}
              <div className={`text-xs ${textSecondary}`}>
                Step {currentStep} of {totalSteps}
              </div>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={submitting || !stepValidation[currentStep]}
                  className={`flex items-center px-6 py-2 rounded-lg ${btnPrimary} hover:shadow-sm`}
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !Object.values(stepValidation).every(Boolean)}
                  className={`flex items-center px-6 py-2 rounded-lg ${btnPrimary} hover:shadow-sm`}
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      {isEditMode ? 'Update Employee' : 'Create Employee'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Validation summary */}
          {Object.keys(validationErrors).length > 0 && currentStep === totalSteps && (
            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
              <div className="flex items-center text-amber-700 dark:text-amber-300">
                <AlertCircle size={12} className="mr-1" />
                Please fix all validation errors before submitting
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;