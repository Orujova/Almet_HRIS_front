// src/components/headcount/EmployeeForm.jsx - Fixed with working dropdowns
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Save, AlertCircle } from "lucide-react";
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
  const { 
    createEmployee, 
    updateEmployee, 
    creating, 
    updating, 
    error, 
    clearErrors,
    fetchLineManagers,
    lineManagers,
    loadingLineManagers
  } = useEmployees();

  const { 
    businessFunctions, 
    departments, 
    units, 
    jobFunctions, 
    positionGroups, 
    employeeTags,
    fetchBusinessFunctions,
    fetchDepartments,
    fetchUnits,
    fetchJobFunctions,
    fetchPositionGroups,
    fetchEmployeeTags,
    clearDepartments,
    clearUnits,
    loading
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

  // Form state with proper backend field names
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    employee_id: employee?.employee_id || "",
    first_name: employee?.user?.first_name || employee?.first_name || "",
    last_name: employee?.user?.last_name || employee?.last_name || "",
    email: employee?.user?.email || employee?.email || "",
    phone: employee?.phone || "",
    date_of_birth: employee?.date_of_birth || "",
    gender: employee?.gender || "",
    address: employee?.address || "",
    emergency_contact: employee?.emergency_contact || "",
    profile_image: employee?.profile_image || null,
    
    // Step 2: Job Info
    start_date: employee?.start_date || "",
    end_date: employee?.end_date || "",
    business_function: employee?.business_function?.id || employee?.business_function || "",
    department: employee?.department?.id || employee?.department || "",
    unit: employee?.unit?.id || employee?.unit || "",
    job_function: employee?.job_function?.id || employee?.job_function || "",
    job_title: employee?.job_title || "",
    position_group: employee?.position_group?.id || employee?.position_group || "",
    grade: employee?.grade || "",
    contract_duration: employee?.contract_duration || "PERMANENT",
    contract_start_date: employee?.contract_start_date || "",
    
    // Step 3: Management Info
    line_manager: employee?.line_manager?.id || employee?.line_manager || "",
    tag_ids: employee?.tags?.map(tag => tag.id) || employee?.tag_ids || [],
    notes: employee?.notes || "",
    is_visible_in_org_chart: employee?.is_visible_in_org_chart ?? true,
    
    // Step 4: Documents
    documents: []
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Line manager search
  const [lineManagerSearch, setLineManagerSearch] = useState("");

  // Initialize data on mount
  useEffect(() => {
    clearErrors();
    // Fetch all reference data
    fetchBusinessFunctions();
    fetchJobFunctions();
    fetchPositionGroups();
    fetchEmployeeTags();
    fetchLineManagers(); // Fetch line managers for dropdown
  }, []);

  // Fetch dependent dropdowns when parent changes
  useEffect(() => {
    if (formData.business_function) {
      fetchDepartments(formData.business_function);
      // Clear dependent fields when business function changes
      if (!isEditMode || (employee?.business_function?.id !== formData.business_function)) {
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
  }, [formData.business_function, fetchDepartments, clearDepartments, clearUnits]);

  useEffect(() => {
    if (formData.department) {
      fetchUnits(formData.department);
      // Clear unit when department changes
      if (!isEditMode || (employee?.department?.id !== formData.department)) {
        setFormData(prev => ({
          ...prev,
          unit: ""
        }));
      }
    } else {
      clearUnits();
    }
  }, [formData.department, fetchUnits, clearUnits]);

  // Search line managers when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lineManagerSearch.trim()) {
        fetchLineManagers(lineManagerSearch.trim());
      } else {
        fetchLineManagers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [lineManagerSearch, fetchLineManagers]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
  const handleLineManagerChange = (managerId) => {
    setFormData(prev => ({
      ...prev,
      line_manager: managerId || ""
    }));
  };

  // Tags change handler
  const handleTagsChange = (tagIds) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: Array.isArray(tagIds) ? tagIds : []
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
    const files = Array.from(e.target.files || e.dataTransfer.files || []);
    if (files.length) {
      const newDocuments = files.map(file => ({
        name: file.name,
        document_type: 'OTHER',
        file_path: URL.createObjectURL(file),
        file_size: file.size,
        mime_type: file.type,
        file: file
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
    if (updatedDocuments[index]?.file_path?.startsWith('blob:')) {
      URL.revokeObjectURL(updatedDocuments[index].file_path);
    }
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
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = "Email is invalid";
        }
        break;
      
      case 2: // Job Info
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
        if (!formData.grade) {
          errors.grade = "Grade is required";
        }
        
        // Date validation
        if (formData.end_date && formData.start_date) {
          if (new Date(formData.end_date) <= new Date(formData.start_date)) {
            errors.end_date = "End date must be after start date";
          }
        }
        
        if (formData.contract_start_date && formData.start_date) {
          if (new Date(formData.contract_start_date) < new Date(formData.start_date)) {
            errors.contract_start_date = "Contract start date cannot be before employment start date";
          }
        }
        break;
      
      case 3: // Management Info - optional fields
        break;
        
      case 4: // Documents - no validation required
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
      // Prepare data for backend
      const submitData = {
        ...formData,
        unit: formData.unit || null,
        line_manager: formData.line_manager || null,
        contract_start_date: formData.contract_start_date || formData.start_date,
        tag_ids: Array.isArray(formData.tag_ids) ? formData.tag_ids : [],
        grade: parseInt(formData.grade),
      };

      // Remove documents from main data (handled separately)
      const { documents, ...employeeData } = submitData;

      let result;
      if (isEditMode) {
        result = await updateEmployee(employee.id, employeeData);
      } else {
        result = await createEmployee(employeeData);
      }

      if (result.meta?.requestStatus === 'fulfilled') {
        // Success - navigate back
        router.push("/structure/headcount-table");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Error handling is managed by Redux
    }
  };

  // Cancel form
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

  // Render current step content
  const renderStepContent = () => {
    const commonProps = {
      formData,
      handleInputChange,
      handleFileUpload,
      handleDocumentUpload,
      removeDocument,
      handleTagsChange,
      handleLineManagerChange,
      validationErrors,
      // Reference data
      businessFunctions: businessFunctions || [],
      departments: departments || [],
      units: units || [],
      jobFunctions: jobFunctions || [],
      positionGroups: positionGroups || [],
      employeeTags: employeeTags || [],
      // Line managers
      lineManagerOptions: lineManagers || [],
      loadingLineManagers,
      lineManagerSearch,
      setLineManagerSearch
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
    <div className="container mx-auto px-4 py-0">
      <div className={`${bgCard} rounded-xl shadow-lg overflow-hidden border ${borderColor}`}>
        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 border-b border-gray-100 dark:border-gray-700">
          <StepIndicator 
            currentStep={activeStep} 
            totalSteps={totalSteps} 
            stepLabels={stepLabels}
            getStepStatus={getStepStatus}
          />
          
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
          {/* Loading indicator for reference data */}
          {loading.businessFunctions && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                <span className="text-xs text-blue-800 dark:text-blue-300">
                  Loading reference data...
                </span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    {isEditMode ? 'Update Failed' : 'Creation Failed'}
                  </h4>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    {typeof error === 'string' ? error : error?.message || 'Something went wrong'}
                    
                    {/* Show validation errors from backend */}
                    {error && typeof error === 'object' && error !== null && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(error).map(([field, fieldErrors]) => (
                          <div key={field} className="text-xs">
                            <strong>{field}:</strong> {Array.isArray(fieldErrors) ? fieldErrors.join(', ') : fieldErrors}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
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
  );
};

export default EmployeeForm;