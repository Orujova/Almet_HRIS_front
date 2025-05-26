// src/components/headcount/EmployeeForm.jsx
import { useState } from "react";
import { ChevronLeft, ChevronRight, Save, Info } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

import { useRouter } from "next/navigation";
import StepIndicator from "./FormComponents/StepIndicator";

import { 
  FormStep1BasicInfo, 
  FormStep2JobInfo, 
  FormStep3AdditionalInfo, 
  FormStep4Documents 
} from "./FormSteps";

/**
 * Improved Employee Form with compact design
 */
const EmployeeForm = ({ employee = null }) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const isEditMode = !!employee;

  // Step configuration
  const stepLabels = ["Basic Info", "Job Details", "Management", "Documents"];
  const totalSteps = stepLabels.length;
  const [activeStep, setActiveStep] = useState(1);

  // Modal state
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    type: '',
    title: '',
    content: ''
  });

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200";

  // Form state with enhanced structure
  const [formData, setFormData] = useState({
    // Basic Info
    empNo: employee?.empNo || "",
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    dateOfBirth: employee?.dateOfBirth || "",
    address: employee?.address || "",
    emergencyContact: employee?.emergencyContact || "",
    profileImage: employee?.profileImage || null,
    
    // Job Info - Enhanced with multi-select support
    startDate: employee?.startDate || "",
    endDate: employee?.endDate || "",
    businessFunctions: employee?.businessFunctions || [employee?.businessFunction].filter(Boolean) || [],
    departments: employee?.departments || [employee?.department].filter(Boolean) || [],
    units: employee?.units || [employee?.unit].filter(Boolean) || [],
    jobFunctions: employee?.jobFunctions || [employee?.jobFunction].filter(Boolean) || [],
    jobTitle: employee?.jobTitle || "",
    positionGroup: employee?.positionGroup || "",
    grade: employee?.grade || "",
    office: employee?.office || "",
    
    // Management Info
    lineManager: employee?.lineManager || "",
    lineManagerHcNumber: employee?.lineManagerHcNumber || "",
    status: employee?.status || "ACTIVE",
    tags: employee?.tags || [],
    notes: employee?.notes || "",
    
    // Documents
    documents: employee?.documents || []
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

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

  // Multi-select change handler
  const handleMultiSelectChange = (fieldName, values) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: values
    }));

    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
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
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dateUploaded: new Date().toISOString(),
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

  // Tags change handler
  const handleTagsChange = (tags) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  // Form validation
  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.empNo.trim()) errors.empNo = "Employee ID is required";
        if (!formData.firstName.trim()) errors.firstName = "First name is required";
        if (!formData.lastName.trim()) errors.lastName = "Last name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
        break;
      
      case 2: // Job Info
        if (!formData.startDate) errors.startDate = "Start date is required";
        if (formData.businessFunctions.length === 0) errors.businessFunctions = "At least one business function is required";
        if (formData.departments.length === 0) errors.departments = "At least one department is required";
        if (!formData.positionGroup) errors.positionGroup = "Position group is required";
        break;
      
      case 3: // Management Info
        if (!formData.status) errors.status = "Status is required";
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

  // Modal handlers
  const showInfoModal = (type) => {
    setModalInfo({
      isOpen: true,
      type: type,
      title: '',
      content: ''
    });
  };

  const closeModal = () => {
    setModalInfo({
      isOpen: false,
      type: '',
      title: '',
      content: ''
    });
  };

  // Form submission - only for final submit button
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only submit if we're on the last step
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
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        // Convert arrays back to single values for backward compatibility if needed
        businessFunction: formData.businessFunctions[0] || '',
        department: formData.departments[0] || '',
        unit: formData.units[0] || '',
        jobFunction: formData.jobFunctions[0] || ''
      };

      console.log("Submitting form data:", submitData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message and redirect
      alert(
        isEditMode
          ? "Employee updated successfully!"
          : "Employee added successfully!"
      );
      
      router.push("/structure/headcount-table");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error saving employee data. Please try again.");
    }
  };

  // Cancel form
  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      router.push("/structure/headcount-table");
    }
  };

  // Render current step content
  const renderStepContent = () => {
    const commonProps = {
      formData,
      handleInputChange,
      handleMultiSelectChange,
      handleFileUpload,
      handleDocumentUpload,
      removeDocument,
      handleTagsChange,
      validationErrors,
      showInfoModal
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
        {/* Main Form Container - Compact Design */}
        <div className={`${bgCard} rounded-xl shadow-lg overflow-hidden border ${borderColor}`}>
          {/* Step Indicator - Compact */}
          <div className="px-6 py-4 bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 border-b border-gray-100 dark:border-gray-700">
            <StepIndicator 
              currentStep={activeStep} 
              totalSteps={totalSteps} 
              stepLabels={stepLabels}
              getStepStatus={getStepStatus}
            />
            
            {/* Progress Bar - Thinner */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-almet-sapphire to-almet-astral h-1 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(activeStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Body - Compact */}
          <div className="p-6">
            <div className="w-full min-h-[400px]">
              {renderStepContent()}
            </div>
            
            {/* Navigation Buttons - Compact */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {activeStep > 1 && (
                  <button
                    type="button"
                    className={`${btnSecondary} px-4 py-2 rounded text-sm font-medium transition-all hover:shadow-sm flex items-center outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft size={14} className="mr-1" />
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  className={`${textSecondary} hover:text-red-500 transition-colors text-xs outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1`}
                  onClick={handleCancel}
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
                  >
                    Continue
                    <ChevronRight size={14} className="ml-1" />
                  </button>
                ) : (
                  <form onSubmit={handleSubmit} className="inline">
                    <button
                      type="submit"
                      className={`${btnPrimary} px-6 py-2 rounded text-sm font-medium shadow-md hover:shadow-lg flex items-center transform hover:scale-105 outline-none focus:ring-2 focus:ring-almet-sapphire focus:ring-offset-2`}
                    >
                      <Save size={14} className="mr-1" />
                      {isEditMode ? "Update Employee" : "Create Employee"}
                    </button>
                  </form>
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