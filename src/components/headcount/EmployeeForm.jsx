// src/components/headcount/EmployeeForm.jsx - Fixed API Format with Document & Profile Upload
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
        father_name: employee.father_name || "", // Add father_name
        
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
        profile_image: employee.profile_image || null,
        
        // New fields based on API format
        vacancy_id: employee.vacancy_id || null
      };
    }
    
    // Default form data for new employee
    return {
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      father_name: "",
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
      profile_image: null,
      vacancy_id: null
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

  // Document type options for API
  const documentTypes = [
    { value: "CONTRACT", label: "Contract" },
    { value: "ID", label: "ID Document" },
    { value: "CERTIFICATE", label: "Certificate" },
    { value: "CV", label: "CV/Resume" },
    { value: "PERFORMANCE", label: "Performance Document" },
    { value: "MEDICAL", label: "Medical Document" },
    { value: "TRAINING", label: "Training Document" },
    { value: "OTHER", label: "Other" }
  ];

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
      // Use general employees API for line manager selection
      const response = await apiService.get('/employees/', { 
        search: searchTerm,
        page_size: 100, // Get more results for better selection
        ordering: 'name' // Order by name for better UX
      });
      
      const results = response.data.results || response.data || [];
      
      // Filter and map employee data for line manager selection
      // Exclude the current employee being edited if in edit mode
      const managers = results
        .filter(emp => {
          // In edit mode, exclude the current employee from line manager options
          if (isEditMode && employee && emp.id === employee.id) {
            return false;
          }
          return true;
        })
        .map(manager => ({
          id: manager.id,
          employee_id: manager.employee_id,
          name: manager.name,
          job_title: manager.job_title,
          position_group_name: manager.position_group_name,
          department: manager.department_name,
          business_function: manager.business_function_name,
          direct_reports_count: manager.direct_reports_count || 0,
          email: manager.email,
          phone: manager.phone,
          grading_level: manager.grading_level,
          start_date: manager.start_date
        }));
      
      setReferenceData(prev => ({ ...prev, lineManagers: managers }));
    } catch (error) {
      console.error('Failed to load line managers:', error);
      setReferenceData(prev => ({ ...prev, lineManagers: [] }));
    } finally {
      setLoading(prev => ({ ...prev, lineManagers: false }));
    }
  }, [isEditMode, employee]);

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

  // Handle document upload - enhanced with type selection
  const handleDocumentUpload = useCallback((documentData) => {
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), {
        ...documentData,
        document_type: documentData.document_type || 'OTHER',
        document_name: documentData.document_name || documentData.name
      }]
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
  // FORM SUBMISSION - FIXED FOR PROPER API FORMAT
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
      // Prepare FormData for API - according to API format
      const formDataForAPI = new FormData();

      // Required fields
      formDataForAPI.append('employee_id', formData.employee_id);
      formDataForAPI.append('first_name', formData.first_name);
      formDataForAPI.append('last_name', formData.last_name);
      formDataForAPI.append('email', formData.email);
      formDataForAPI.append('job_title', formData.job_title);
      formDataForAPI.append('start_date', formData.start_date);
      formDataForAPI.append('business_function', formData.business_function);
      formDataForAPI.append('department', formData.department);
      formDataForAPI.append('job_function', formData.job_function);
      formDataForAPI.append('position_group', formData.position_group);

      // Optional basic fields
      if (formData.father_name) {
        formDataForAPI.append('father_name', formData.father_name);
      }
      if (formData.unit) {
        formDataForAPI.append('unit', formData.unit);
      }
      if (formData.phone) {
        formDataForAPI.append('phone', formData.phone);
      }
      if (formData.date_of_birth) {
        formDataForAPI.append('date_of_birth', formData.date_of_birth);
      }
      if (formData.gender) {
        formDataForAPI.append('gender', formData.gender);
      }
      if (formData.address) {
        formDataForAPI.append('address', formData.address);
      }
      if (formData.emergency_contact) {
        formDataForAPI.append('emergency_contact', formData.emergency_contact);
      }
      if (formData.grading_level) {
        formDataForAPI.append('grading_level', formData.grading_level);
      }
      if (formData.line_manager) {
        formDataForAPI.append('line_manager', formData.line_manager);
      }
      if (formData.contract_duration) {
        formDataForAPI.append('contract_duration', formData.contract_duration);
      }
      if (formData.contract_start_date) {
        formDataForAPI.append('contract_start_date', formData.contract_start_date);
      }
      if (formData.end_date) {
        formDataForAPI.append('end_date', formData.end_date);
      }
      if (formData.notes) {
        formDataForAPI.append('notes', formData.notes);
      }
      if (formData.vacancy_id) {
        formDataForAPI.append('vacancy_id', formData.vacancy_id);
      }

      // Boolean field
      formDataForAPI.append('is_visible_in_org_chart', formData.is_visible_in_org_chart);

      // Tags - append each tag ID separately
      if (formData.tag_ids && formData.tag_ids.length > 0) {
        formData.tag_ids.forEach(tagId => {
          formDataForAPI.append('tag_ids', tagId);
        });
      }

      // Profile image
      if (formData.profile_image && typeof formData.profile_image === 'object') {
        formDataForAPI.append('profile_photo', formData.profile_image);
      }

      // Document handling - only add first document with type
      if (formData.documents && formData.documents.length > 0) {
        const firstDoc = formData.documents[0];
        if (firstDoc.file) {
          formDataForAPI.append('document', firstDoc.file);
          formDataForAPI.append('document_type', firstDoc.document_type || 'OTHER');
          if (firstDoc.document_name || firstDoc.name) {
            formDataForAPI.append('document_name', firstDoc.document_name || firstDoc.name);
          }
        }
      }

      // Submit to API
      let result;
      if (isEditMode) {
        // For updates, use PUT with employee ID in URL
        result = await apiService.put(`/employees/${employee.id}/`, formDataForAPI, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // For creation, use POST
        result = await apiService.post('/employees/', formDataForAPI, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Handle additional documents (after first one is uploaded during creation)
      if (!isEditMode && result.data && result.data.id && formData.documents && formData.documents.length > 1) {
        // Upload remaining documents one by one
        for (let i = 1; i < formData.documents.length; i++) {
          const doc = formData.documents[i];
          if (doc.file) {
            try {
              const docFormData = new FormData();
              docFormData.append('employee_id', result.data.id);
              docFormData.append('document', doc.file);
              docFormData.append('document_type', doc.document_type || 'OTHER');
              if (doc.document_name || doc.name) {
                docFormData.append('document_name', doc.document_name || doc.name);
              }
              
              await apiService.post('/employee-documents/', docFormData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              });
            } catch (docError) {
              console.warn(`Failed to upload document ${i + 1}:`, docError);
            }
          }
        }
      }

      // Handle success
      if (result.status >= 200 && result.status < 300) {
        if (onSuccess) {
          onSuccess(result.data);
        } else {
          router.push("/structure/headcount-table");
        }
      } else {
        // Handle API errors
        const errorMessage = result.data?.detail || result.data?.message || 'Failed to save employee';
        setValidationErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error('Submit error:', error);
      
      // Parse API validation errors
      if (error.response?.data) {
        const apiErrors = {};
        const errorData = error.response.data;
        
        // Handle field-specific validation errors
        if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              apiErrors[field] = errorData[field][0];
            } else if (typeof errorData[field] === 'string') {
              apiErrors[field] = errorData[field];
            }
          });
        }
        
        // Handle general error messages
        if (errorData.detail || errorData.message) {
          apiErrors.submit = errorData.detail || errorData.message;
        }
        
        // If no specific field errors, show general error
        if (Object.keys(apiErrors).length === 0) {
          apiErrors.submit = 'Failed to save employee. Please check your data and try again.';
        }
        
        setValidationErrors(apiErrors);
      } else {
        setValidationErrors({ 
          submit: error.message || 'Failed to save employee. Please try again.' 
        });
      }
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
    
    // Document handling - enhanced with type options
    handleDocumentUpload,
    removeDocument: handleRemoveDocument,
    documentTypes,
    
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
      <div className={`${bgCard} rounded-xl shadow-lg  border ${borderColor}`}>
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