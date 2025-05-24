// src/components/headcount/EmployeeForm.jsx
import { useState } from "react";
import { ChevronLeft, Save } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StepIndicator from "./FormComponents/StepIndicator";
import { 
  FormStep1BasicInfo, 
  FormStep2JobInfo, 
  FormStep3AdditionalInfo, 
  FormStep4Documents 
} from "./FormSteps";

/**
 * Main employee form component with multi-step process and full width design
 * @param {Object} props - Component props
 * @param {Object} props.employee - Employee data for edit mode (optional)
 * @returns {JSX.Element} - Employee form component
 */
const EmployeeForm = ({ employee = null }) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const isEditMode = !!employee;

  // Step configuration
  const stepLabels = ["Basic Info", "Job Info", "Management", "Documents"];
  const totalSteps = stepLabels.length;
  const [activeStep, setActiveStep] = useState(1);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition duration-150";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";
  const shadowClass = darkMode ? "" : "shadow-sm";

  // Form state
  const [formData, setFormData] = useState({
    empNo: employee?.empNo || "",
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    dateOfBirth: employee?.dateOfBirth || "",
    address: employee?.address || "",
    emergencyContact: employee?.emergencyContact || "",
    startDate: employee?.startDate || "",
    endDate: employee?.endDate || "",
    businessFunction: employee?.businessFunction || "",
    department: employee?.department || "",
    unit: employee?.unit || "",
    jobFunction: employee?.jobFunction || "",
    jobTitle: employee?.jobTitle || "",
    positionGroup: employee?.positionGroup || "",
    grade: employee?.grade || "",
    lineManager: employee?.lineManager || "",
    lineManagerHcNumber: employee?.lineManagerHcNumber || "",
    office: employee?.office || "",
    status: employee?.status || "ACTIVE",
    tags: employee?.tags || [],
    profileImage: employee?.profileImage || null,
    documents: employee?.documents || [],
    notes: employee?.notes || "",
  });

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // File upload handler
  const handleFileUpload = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
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

      setFormData({
        ...formData,
        documents: [...formData.documents, ...newDocuments]
      });
    }
  };

  // Remove document handler
  const removeDocument = (index) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments.splice(index, 1);
    
    setFormData({
      ...formData,
      documents: updatedDocuments
    });
  };

  // Tags change handler
  const handleTagsChange = (tags) => {
    setFormData({
      ...formData,
      tags
    });
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (activeStep < totalSteps) {
      setActiveStep(activeStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Combine first and last name to create the full name
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    // In a real implementation, this would send the data to an API
    console.log("Submitting form data:", {
      ...formData,
      name: fullName
    });

    // Show success message and redirect
    alert(
      isEditMode
        ? "Employee updated successfully!"
        : "Employee added successfully!"
    );
    router.push("/structure/headcount-table");
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
    switch (activeStep) {
      case 1:
        return (
          <FormStep1BasicInfo 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleFileUpload={handleFileUpload} 
          />
        );
      case 2:
        return (
          <FormStep2JobInfo 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        );
      case 3:
        return (
          <FormStep3AdditionalInfo 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleTagsChange={handleTagsChange} 
          />
        );
      case 4:
        return (
          <FormStep4Documents 
            formData={formData} 
            handleDocumentUpload={handleDocumentUpload} 
            removeDocument={removeDocument} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
   
        <div className={`w-full  mx-auto ${bgCard} rounded-xl ${shadowClass} overflow-hidden transition-all duration-200 hover:shadow-lg border ${borderColor}`}>
      

          {/* Step Indicator */}
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <StepIndicator 
              currentStep={activeStep} 
              totalSteps={totalSteps} 
              stepLabels={stepLabels} 
            />
          </div>

          {/* Form Body - Full Width */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="w-full">
              {renderStepContent()}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {activeStep > 1 && (
                  <button
                    type="button"
                    className={`${btnSecondary} px-6 py-3 rounded-md transition-colors font-medium`}
                    onClick={handlePrevStep}
                  >
                    <ChevronLeft size={16} className="mr-2 inline" />
                    Previous Step
                  </button>
                )}
                <button
                  type="button"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={handleCancel}
                >
                  Cancel & Exit
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Step info for mobile */}
                <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                  {activeStep}/{totalSteps}
                </span>
                
                {activeStep < totalSteps ? (
                  <button
                    type="button"
                    className={`${btnPrimary} px-8 py-3 rounded-md font-medium shadow-sm hover:shadow flex items-center`}
                    onClick={handleNextStep}
                  >
                    Continue
                    <ChevronLeft size={16} className="ml-2 rotate-180" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={`${btnPrimary} px-8 py-3 rounded-md font-medium shadow-sm hover:shadow flex items-center`}
                  >
                    <Save size={16} className="mr-2" />
                    {isEditMode ? "Update Employee" : "Create Employee"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      {/* </div> */}
    </div>
  );
};

export default EmployeeForm;