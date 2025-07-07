// src/components/headcount/EmployeeForm.jsx - Fixed Edit Mode with Proper Data Loading
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Save, X, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useRouter } from "next/navigation";
import { useEmployees } from "../../hooks/useEmployees";
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

  // Form state - Initialize with proper structure for edit mode
  const [formData, setFormData] = useState(() => {
    if (isEditMode && employee) {
      return {
        // Basic Information
        employee_id: employee.employee_id || "",
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || employee.user?.email || "",
        
        // Personal Information
        phone: employee.phone || "",
        date_of_birth: employee.date_of_birth || "",
        gender: employee.gender || "",
        address: employee.address || "",
        emergency_contact: employee.emergency_contact || "",
        
        // Job Information - Convert to strings for form inputs
        business_function: employee.business_function?.toString() || "",
        department: employee.department?.toString() || "",
        unit: employee.unit?.toString() || "",
        job_function: employee.job_function?.toString() || "",
        job_title: employee.job_title || "",
        position_group: employee.position_group?.toString() || "",
        grading_level: employee.grading_level || employee.grade || "",
        start_date: employee.start_date || "",
        contract_duration: employee.contract_duration || "PERMANENT",
        
        // Contract Information
        contract_start_date: employee.contract_start_date || "",
        contract_end_date: employee.contract_end_date || "",
        end_date: employee.end_date || "",
        
        // Management Information
        line_manager: employee.line_manager?.toString() || "",
        notes: employee.notes || "",
        
        // System Fields
        status: employee.status || "ONBOARDING",
        is_visible_in_org_chart: employee.is_visible_in_org_chart !== undefined ? employee.is_visible_in_org_chart : true,
        
        // Tags and Documents
        tag_ids: employee.tags ? employee.tags.map(tag => tag.id?.toString()) : [],
        documents: employee.documents || [],
        profile_image: employee.profile_image || null
      };
    }
    
    // Default form data for new employee
    return {
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      address: "",
      emergency_contact: "",
      business_function: "",
      department: "",
      unit: "",
      job_function: "",
      job_title: "",
      position_group: "",
      grading_level: "",
      start_date: "",
      contract_duration: "PERMANENT",
      contract_start_date: "",
      contract_end_date: "",
      end_date: "",
      line_manager: "",
      notes: "",
      status: "ONBOARDING",
      is_visible_in_org_chart: true,
      tag_ids: [],
      documents: [],
      profile_image: null
    };
  });

  // Reference data state
  const [referenceData, setReferenceData] = useState({
    businessFunctions: [],
    departments: [],
    units: [],
    jobFunctions: [],
    positionGroups: [],
    employeeStatuses: [],
    employeeTags: [],
    lineManagers: [],
    gradingLevels: []
  });

  // Loading states
  const [loading, setLoading] = useState({
    businessFunctions: false,
    departments: false,
    units: false,
    jobFunctions: false,
    positionGroups: false,
    employeeStatuses: false,
    employeeTags: false,
    lineManagers: false,
    gradingLevels: false,
    initialLoad: true
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [stepValidation, setStepValidation] = useState({
    1: false,
    2: false,
    3: true,
    4: true
  });

  // API-specific state
  const [lineManagerSearch, setLineManagerSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  // ========================================
  // REFERENCE DATA LOADING FUNCTIONS
  // ========================================

  const loadBusinessFunctions = useCallback(async () => {
    if (referenceData.businessFunctions.length > 0) return;
    
    setLoading(prev => ({ ...prev, businessFunctions: true }));
    try {
      const response = await apiService.getBusinessFunctions();
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        businessFunctions: data.map(item => ({
          value: item.id?.toString(),
          label: item.name,
          code: item.code,
          employee_count: item.employee_count
        }))
      }));
    } catch (error) {
      console.error('Failed to load business functions:', error);
    } finally {
      setLoading(prev => ({ ...prev, businessFunctions: false }));
    }
  }, [referenceData.businessFunctions.length]);

  const loadDepartments = useCallback(async (businessFunctionId = null) => {
    if (!businessFunctionId) {
      setReferenceData(prev => ({ ...prev, departments: [] }));
      return;
    }

    setLoading(prev => ({ ...prev, departments: true }));
    try {
      const response = await apiService.getDepartments({ 
        business_function: businessFunctionId 
      });
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        departments: data.map(item => ({
          value: item.id?.toString(),
          label: item.name,
          business_function: item.business_function,
          business_function_name: item.business_function_name
        }))
      }));
    } catch (error) {
      console.error('Failed to load departments:', error);
      setReferenceData(prev => ({ ...prev, departments: [] }));
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  }, []);

  const loadUnits = useCallback(async (departmentId = null) => {
    if (!departmentId) {
      setReferenceData(prev => ({ ...prev, units: [] }));
      return;
    }

    setLoading(prev => ({ ...prev, units: true }));
    try {
      const response = await apiService.getUnits({ 
        department: departmentId 
      });
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        units: data.map(item => ({
          value: item.id?.toString(),
          label: item.name,
          department: item.department,
          department_name: item.department_name
        }))
      }));
    } catch (error) {
      console.error('Failed to load units:', error);
      setReferenceData(prev => ({ ...prev, units: [] }));
    } finally {
      setLoading(prev => ({ ...prev, units: false }));
    }
  }, []);

  const loadJobFunctions = useCallback(async () => {
    if (referenceData.jobFunctions.length > 0) return;
    
    setLoading(prev => ({ ...prev, jobFunctions: true }));
    try {
      const response = await apiService.getJobFunctions();
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        jobFunctions: data.map(item => ({
          value: item.id?.toString(),
          label: item.name,
          description: item.description
        }))
      }));
    } catch (error) {
      console.error('Failed to load job functions:', error);
    } finally {
      setLoading(prev => ({ ...prev, jobFunctions: false }));
    }
  }, [referenceData.jobFunctions.length]);

  const loadPositionGroups = useCallback(async () => {
    if (referenceData.positionGroups.length > 0) return;
    
    setLoading(prev => ({ ...prev, positionGroups: true }));
    try {
      const response = await apiService.getPositionGroups();
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        positionGroups: data.map(item => ({
          value: item.id?.toString(),
          label: item.display_name || item.name,
          hierarchy_level: item.hierarchy_level,
          grading_levels: item.grading_levels || []
        }))
      }));
    } catch (error) {
      console.error('Failed to load position groups:', error);
    } finally {
      setLoading(prev => ({ ...prev, positionGroups: false }));
    }
  }, [referenceData.positionGroups.length]);

  const loadEmployeeTags = useCallback(async () => {
    if (referenceData.employeeTags.length > 0) return;
    
    setLoading(prev => ({ ...prev, employeeTags: true }));
    try {
      const response = await apiService.getEmployeeTags();
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        employeeTags: data.map(item => ({
          value: item.id?.toString(),
          label: item.name,
          tag_type: item.tag_type,
          color: item.color
        }))
      }));
    } catch (error) {
      console.error('Failed to load employee tags:', error);
    } finally {
      setLoading(prev => ({ ...prev, employeeTags: false }));
    }
  }, [referenceData.employeeTags.length]);

  const loadGradingLevels = useCallback(async (positionGroupId = null) => {
    if (!positionGroupId) {
      setReferenceData(prev => ({ ...prev, gradingLevels: [] }));
      return;
    }

    setLoading(prev => ({ ...prev, gradingLevels: true }));
    try {
      const response = await apiService.getPositionGroupGradingLevels(positionGroupId);
      const levels = response.data.levels || [];
      
      setReferenceData(prev => ({
        ...prev,
        gradingLevels: levels.map(level => ({
          value: level.code,
          label: level.display,
          description: level.full_name
        }))
      }));
    } catch (error) {
      console.error('Failed to load grading levels:', error);
      setReferenceData(prev => ({ ...prev, gradingLevels: [] }));
    } finally {
      setLoading(prev => ({ ...prev, gradingLevels: false }));
    }
  }, []);

  const loadLineManagers = useCallback(async (searchTerm = "") => {
    setLoading(prev => ({ ...prev, lineManagers: true }));
    try {
      const response = await apiService.get('/employees/line_managers/', { 
        search: searchTerm,
        page_size: 50
      });
      
      const managers = (response.data || []).map(manager => ({
        id: manager.id,
        employee_id: manager.employee_id,
        name: manager.name,
        job_title: manager.job_title,
        position_group: manager.position_group,
        department: manager.department,
        direct_reports_count: manager.direct_reports_count || 0,
        email: manager.email
      }));
      
      setReferenceData(prev => ({ ...prev, lineManagers: managers }));
    } catch (error) {
      console.error('Failed to load line managers:', error);
      setReferenceData(prev => ({ ...prev, lineManagers: [] }));
    } finally {
      setLoading(prev => ({ ...prev, lineManagers: false }));
    }
  }, []);

  // ========================================
  // INITIALIZATION AND EFFECTS
  // ========================================

  // Initialize reference data on mount
  useEffect(() => {
    const initializeReferenceData = async () => {
      setLoading(prev => ({ ...prev, initialLoad: true }));
      
      try {
        // Load independent reference data in parallel
        await Promise.all([
          loadBusinessFunctions(),
          loadJobFunctions(),
          loadPositionGroups(),
          loadEmployeeTags(),
          loadLineManagers()
        ]);

        // If editing, load dependent data based on current values
        if (isEditMode && employee) {
          if (employee.business_function) {
            await loadDepartments(employee.business_function);
            
            if (employee.department) {
              await loadUnits(employee.department);
            }
          }
          
          if (employee.position_group) {
            await loadGradingLevels(employee.position_group);
          }
        }
      } catch (error) {
        console.error('Failed to initialize reference data:', error);
      } finally {
        setLoading(prev => ({ ...prev, initialLoad: false }));
        clearErrors();
      }
    };

    initializeReferenceData();
  }, [isEditMode]);

  // Handle business function change
  useEffect(() => {
    if (formData.business_function) {
      loadDepartments(formData.business_function);
      
      // Only clear dependent fields if this is a user change (not initial load)
      const shouldClearFields = !isEditMode || 
        (isEditMode && formData.business_function !== employee?.business_function?.toString());
      
      if (shouldClearFields) {
        setFormData(prev => ({
          ...prev,
          department: "",
          unit: ""
        }));
      }
    } else {
      setReferenceData(prev => ({ 
        ...prev, 
        departments: [], 
        units: [] 
      }));
    }
  }, [formData.business_function, loadDepartments, isEditMode, employee?.business_function]);

  // Handle department change
  useEffect(() => {
    if (formData.department) {
      loadUnits(formData.department);
      
      const shouldClearUnit = !isEditMode || 
        (isEditMode && formData.department !== employee?.department?.toString());
      
      if (shouldClearUnit) {
        setFormData(prev => ({
          ...prev,
          unit: ""
        }));
      }
    } else {
      setReferenceData(prev => ({ ...prev, units: [] }));
    }
  }, [formData.department, loadUnits, isEditMode, employee?.department]);

  // Handle position group change
  useEffect(() => {
    if (formData.position_group) {
      loadGradingLevels(formData.position_group);
      
      const shouldClearGrading = !isEditMode || 
        (isEditMode && formData.position_group !== employee?.position_group?.toString());
      
      if (shouldClearGrading) {
        setFormData(prev => ({
          ...prev,
          grading_level: ""
        }));
      }
    } else {
      setReferenceData(prev => ({ ...prev, gradingLevels: [] }));
    }
  }, [formData.position_group, loadGradingLevels, isEditMode, employee?.position_group]);

  // Auto-calculate contract end date
  useEffect(() => {
    if (formData.start_date && formData.contract_duration && formData.contract_duration !== 'PERMANENT') {
      const startDate = new Date(formData.contract_start_date || formData.start_date);
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
  }, [formData.start_date, formData.contract_start_date, formData.contract_duration]);

  // ========================================
  // FORM VALIDATION
  // ========================================

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
        break;

      case 3:
      case 4:
        // Steps 3 and 4 are optional
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

  // ========================================
  // EVENT HANDLERS
  // ========================================

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
    } else if (searchTerm.length === 0) {
      loadLineManagers();
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
      newDocuments.splice(index, 1);
      return {
        ...prev,
        documents: newDocuments
      };
    });
  }, []);

  // ========================================
  // STEP NAVIGATION
  // ========================================

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
    setCurrentStep(step);
  }, []);

  // ========================================
  // FORM SUBMISSION
  // ========================================

  const handleSubmit = async () => {
    // Validate all steps
    let allErrors = {};
    let hasErrors = false;

    for (let step = 1; step <= 2; step++) { // Only validate required steps
      const stepErrors = validateStep(step);
      if (Object.keys(stepErrors).length > 0) {
        allErrors = { ...allErrors, ...stepErrors };
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setValidationErrors(allErrors);
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    
    try {
      // Prepare API data
      const apiData = {
        // Required fields
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        business_function: parseInt(formData.business_function),
        department: parseInt(formData.department),
        job_function: parseInt(formData.job_function),
        job_title: formData.job_title,
        position_group: parseInt(formData.position_group),
        grading_level: formData.grading_level,
        start_date: formData.start_date,
        contract_duration: formData.contract_duration,

        // Optional fields
        ...(formData.unit && { unit: parseInt(formData.unit) }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.date_of_birth && { date_of_birth: formData.date_of_birth }),
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.address && { address: formData.address }),
        ...(formData.emergency_contact && { emergency_contact: formData.emergency_contact }),
        ...(formData.line_manager && { line_manager: parseInt(formData.line_manager) }),
        ...(formData.contract_start_date && { contract_start_date: formData.contract_start_date }),
        ...(formData.contract_end_date && { contract_end_date: formData.contract_end_date }),
        ...(formData.end_date && { end_date: formData.end_date }),
        ...(formData.notes && { notes: formData.notes }),
        
        // Boolean fields
        is_visible_in_org_chart: formData.is_visible_in_org_chart,

        // Tags
        tag_ids: formData.tag_ids || []
      };

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

  // ========================================
  // STEP PROPS PREPARATION
  // ========================================

  const stepProps = {
    formData,
    handleInputChange,
    validationErrors,
    
    // Reference data with proper formatting
    businessFunctions: referenceData.businessFunctions,
    departments: referenceData.departments,
    units: referenceData.units,
    jobFunctions: referenceData.jobFunctions,
    positionGroups: referenceData.positionGroups,
    gradeOptions: referenceData.gradingLevels,
    loadingGradingLevels: loading.gradingLevels,
    
    // Line manager options
    lineManagerOptions: referenceData.lineManagers,
    lineManagerSearch,
    setLineManagerSearch: handleLineManagerSearch,
    loadingLineManagers: loading.lineManagers,
    
    // Tag options
    tagOptions: referenceData.employeeTags,
    onAddTag: handleAddTag,
    onRemoveTag: handleRemoveTag,
    
    // Document handling
    handleDocumentUpload,
    removeDocument: handleRemoveDocument,
    
    // Loading states
    loading,
    
    // Edit mode flag for disabling validation during initial load
    isEditMode
  };

  // ========================================
  // RENDER STEP CONTENT
  // ========================================

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

  // Show loading state during initial data load
  if (loading.initialLoad) {
    return (
      <div className="container mx-auto px-4 py-0">
        <div className={`${bgCard} rounded-xl shadow-lg overflow-hidden border ${borderColor}`}>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-almet-sapphire mx-auto mb-4" />
              <p className={`${textPrimary} text-lg font-medium`}>
                {isEditMode ? 'Loading employee data...' : 'Initializing form data...'}
              </p>
              <p className={`${textSecondary} text-sm mt-2`}>
                Loading reference data from server
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-0">
      <div className={`${bgCard} rounded-xl shadow-lg overflow-hidden border ${borderColor}`}>
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-almet-sapphire/5 to-almet-astral/5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-xl font-bold ${textPrimary}`}>
                {isEditMode ? `Edit Employee: ${employee?.name || employee?.first_name + ' ' + employee?.last_name}` : 'Add New Employee'}
              </h1>
              <p className={`text-sm ${textSecondary} mt-1`}>
                {isEditMode 
                  ? 'Update employee information and documents' 
                  : 'Complete all required information to add a new employee'
                }
              </p>
            </div>
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
          {(loading.businessFunctions || loading.jobFunctions || loading.positionGroups) && (
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
                  disabled={submitting || !stepValidation[1] || !stepValidation[2]}
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