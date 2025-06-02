// src/components/headcount/EmployeeForm.jsx - Updated with Redux and backend integration
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useRouter } from "next/navigation";
import { useEmployees } from "../../hooks/useEmployees";
import { useReferenceData } from "../../hooks/useReferenceData";
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
  const { createEmployee, updateEmployee, creating, updating, error, clearErrors } = useEmployees();
  const { 
    businessFunctions, 
    departments, 
    units, 
    jobFunctions, 
    positionGroups, 
    employeeStatuses,
    employeeTags,
    fetchDepartments,
    fetchUnits,
    clearDepartments,
    clearUnits
  } = useReferenceData();

  // Step configuration
  const stepLabels = ["Basic Info", "Job Details", "Management", "Documents"];
  const totalSteps = stepLabels.length;
  const [activeStep, setActiveStep] = useState(1);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200";

  // Form state with backend field names
  const [formData, setFormData] = useState({
    // Basic Info - matching backend serializer
    employee_id: employee?.employee_id || "",
    first_name: employee?.user?.first_name || "",
    last_name: employee?.user?.last_name || "",
    email: employee?.user?.email || "",
    phone: employee?.phone || "",
    date_of_birth: employee?.date_of_birth || "",
    gender: employee?.gender || "",
    address: employee?.address || "",
    emergency_contact: employee?.emergency_contact || "",
    profile_image: employee?.profile_image || null,
    
    // Job Info - backend field names
    start_date: employee?.start_date || "",
    end_date: employee?.end_date || "",
    business_function: employee?.business_function?.id || "",
    department: employee?.department?.id || "",
    unit: employee?.unit?.id || "",
    job_function: employee?.job_function?.id || "",
    job_title: employee?.job_title || "",
    position_group: employee?.position_group?.id || "",
    grade: employee?.grade || "",
    contract_duration: employee?.contract_duration || "PERMANENT",
    contract_start_date: employee?.contract_start_date || "",
    
    // Management Info
    line_manager: employee?.line_manager?.id || "",
    tag_ids: employee?.tags?.map(tag => tag.id) || [],
    notes: employee?.notes || "",
    
    // Documents
    documents: []
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Clear errors when component mounts or employee changes
  useEffect(() => {
    clearErrors();
  }, [employee]);

  // Fetch dependent data when business function or department changes
  useEffect(() => {
    if (formData.business_function) {
      fetchDepartments(formData.business_function);
    } else {
      clearDepartments();
      clearUnits();
    }
  }, [formData.business_function]);

  useEffect(() => {
    if (formData.department) {
      fetchUnits(formData.department);
    } else {
      clearUnits();
    }
  }, [formData.department]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  // Multi-select change handler for tags
  const handleTagsChange = (tags) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: tags
    }));
  };

  // File upload handler
  const handleFileUpload = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Document upload handler
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files);
    if (files.length) {
      const newDocuments = files.map(file => ({
        name: file.name,
        document_type: 'OTHER', // Default type
        file_path: URL.createObjectURL(file), // Temporary for preview
        file_size: file.size,
        mime_type: file.type,
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
    updatedDocuments.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      documents: updatedDocuments
    }));
  };

  // Form validation
  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.employee_id.trim()) errors.employee_id = "Employee ID is required";
        if (!formData.first_name.trim()) errors.first_name = "First name is required";
        if (!formData.last_name.trim()) errors.last_name = "Last name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
        break;
      
      case 2: // Job Info
        if (!formData.start_date) errors.start_date = "Start date is required";
        if (!formData.business_function) errors.business_function = "Business function is required";
        if (!formData.department) errors.department = "Department is required";
        if (!formData.job_function) errors.job_function = "Job function is required";
        if (!formData.position_group) errors.position_group = "Position group is required";
        if (!formData.grade) errors.grade = "Grade is required";
        break;
      
      case 3: // Management Info - optional fields, no validation needed
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      if (activeStep < totalSteps) {
        setActiveStep(activeStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeStep !== totalSteps) {
      return;
    }

    if (!validateStep(activeStep)) {
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Convert empty strings to null for foreign keys
        unit: formData.unit || null,
        line_manager: formData.line_manager || null,
      };

      let result;
      if (isEditMode) {
        result = await updateEmployee(employee.id, submitData);
      } else {
        result = await createEmployee(submitData);
      }

      if (result.meta.requestStatus === 'fulfilled') {
        router.push("/structure/headcount-table");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Error is handled by Redux slice
    }
  };

  // Cancel form
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      router.push("/structure/headcount-table");
    }
  };

  // Render current step content
  const renderStepContent = () => {
    const commonProps = {
      formData,
      handleInputChange,
      handleFileUpload,
      handleDocumentUpload,
      removeDocument,
      handleTagsChange,
      validationErrors,
      // Pass reference data
      businessFunctions,
      departments,
      units,
      jobFunctions,
      positionGroups,
      employeeStatuses,
      employeeTags
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
    if (step < activeStep) return 'completed';
    if (step === activeStep) return 'active';
    return 'pending';
  };

  return (
    <>
      <div className="container mx-auto px-4 py-0">
        {/* Main Form Container */}
        <div className={`${bgCard} rounded-xl shadow-lg overflow-hidden border ${borderColor}`}>
          {/* Step Indicator */}
          <div className="px-6 py-4 bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 border-b border-gray-100 dark:border-gray-700">
            <StepIndicator 
              currentStep={activeStep} 
              totalSteps={totalSteps} 
              stepLabels={stepLabels}
              getStepStatus={getStepStatus}
            />
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-almet-sapphire to-almet-astral h-1 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(activeStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center text-red-800 dark:text-red-200">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">
                    Error: {typeof error === 'string' ? error : error?.message || 'Something went wrong'}
                  </span>
                </div>
              </div>
            )}

            <div className="w-full min-h-[400px]">
              {renderStepContent()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {activeStep > 1 && (
                  <button
                    type="button"
                    className={`${btnSecondary} px-4 py-2 rounded text-sm font-medium transition-all hover:shadow-sm flex items-center outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    onClick={handlePrevStep}
                    disabled={creating || updating}
                  >
                    <ChevronLeft size={14} className="mr-1" />
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  className={`${textSecondary} hover:text-red-500 transition-colors text-xs outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1`}
                  onClick={handleCancel}
                  disabled={creating || updating}
                >
                  Cancel & Exit
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Step Counter for Mobile */}
                <span className={`text-xs ${textSecondary} sm:hidden`}>
                  Step {activeStep} of {totalSteps}
                </span>
                
                {activeStep < totalSteps ? (
                  <button
                    type="button"
                    className={`${btnPrimary} px-6 py-2 rounded text-sm font-medium shadow-md hover:shadow-lg flex items-center transform hover:scale-105 outline-none focus:ring-2 focus:ring-almet-sapphire focus:ring-offset-2`}
                    onClick={handleNextStep}
                    disabled={creating || updating}
                  >
                    Continue
                    <ChevronRight size={14} className="ml-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={creating || updating}
                    className={`${btnPrimary} px-6 py-2 rounded text-sm font-medium shadow-md hover:shadow-lg flex items-center transform hover:scale-105 outline-none focus:ring-2 focus:ring-almet-sapphire focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    {creating || updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save size={14} className="mr-1" />
                        {isEditMode ? "Update Employee" : "Create Employee"}
                      </>
                    )}
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