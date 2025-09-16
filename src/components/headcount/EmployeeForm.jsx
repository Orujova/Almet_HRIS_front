// src/components/headcount/EmployeeForm.jsx - FIXED: Date handling and all errors
import { useState, useEffect, useCallback, useRef } from "react";
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

  // FIXED: Enhanced form state initialization with proper date and boolean handling
  const [formData, setFormData] = useState(() => {
    if (isEditMode && employee) {
      return {
        // Basic Information
        id: employee.id,
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || employee.user?.email || "",
        original_email: employee.email || employee.user?.email || "",
        father_name: employee.father_name || "",
        
        // Personal Information
        phone: employee.phone || "",
        date_of_birth: employee.date_of_birth || "",
        gender: employee.gender || "",
        address: employee.address || "",
        emergency_contact: employee.emergency_contact || "",
        
        // Job Information - FIXED: Enhanced handling with names
        business_function: employee.business_function?.toString() || "",
        business_function_name: employee.business_function_name || "",
        department: employee.department?.toString() || "",
        department_name: employee.department_name || "",
        unit: employee.unit?.toString() || "",
        unit_name: employee.unit_name || "",
        job_function: employee.job_function?.toString() || "",
        job_title: employee.job_title || "",
        position_group: employee.position_group?.toString() || "",
        position_group_name: employee.position_group_name || "",
        grading_level: employee.grading_level || employee.grade || "",
        start_date: employee.start_date || "",
        contract_duration: employee.contract_duration || "PERMANENT",
        
        // Contract Information
        contract_start_date: employee.contract_start_date || "",
        contract_end_date: employee.contract_end_date || "",
        end_date: employee.end_date || "",
        
        // Management Information
        line_manager: employee.line_manager?.toString() || "",
        line_manager_name: employee.line_manager_name || "",
        notes: employee.notes || "",
        
        // System Fields - FIXED: Proper boolean conversion
        status: employee.status || "ONBOARDING",
        is_visible_in_org_chart: Boolean(employee.is_visible_in_org_chart),
        
        // Tags and Documents - FIXED: Enhanced tag handling
        tag_ids: employee.tags ? employee.tags.map(tag => tag.toString()) : [],
current_tags: employee.tag_details || [],
        documents: employee.documents || [],
        profile_image: employee.profile_image || employee.profile_image_url || null,
        
        vacancy_id: employee.vacancy_id || null,
        
        // Internal tracking
        _email_changed: false,
        _department_loaded: false,
        _unit_loaded: false,
        _grading_loaded: false
      };
    }
    
    // Default form data for new employee
    return {
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
      current_tags: [],
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
    employeeTags: false,
    lineManagers: false,
    gradingLevels: false,
    initialLoad: true
  });

  // Document type options
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

  // File input ref
  const fileInputRef = useRef(null);

  // ========================================
  // REFERENCE DATA LOADING FUNCTIONS
  // ========================================

  const loadBusinessFunctions = useCallback(async () => {
    setLoading(prev => ({ ...prev, businessFunctions: true }));
    try {
      const response = await apiService.getBusinessFunctions();
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        businessFunctions: data.map(item => ({
          value: item.id?.toString(),
          label: item.name,
          code: item.code
        }))
      }));
    } catch (error) {
      console.error('Failed to load business functions:', error);
    } finally {
      setLoading(prev => ({ ...prev, businessFunctions: false }));
    }
  }, []);

  const loadDepartments = useCallback(async (businessFunctionId, skipIfLoaded = false) => {
    if (!businessFunctionId) {
      setReferenceData(prev => ({ ...prev, departments: [] }));
      return;
    }

    if (skipIfLoaded && formData._department_loaded) {
      return;
    }

    setLoading(prev => ({ ...prev, departments: true }));
    try {
      const response = await apiService.getDepartments({ 
        business_function: businessFunctionId 
      });
      const data = response.data.results || response.data || [];
      
      const departments = data.map(item => ({
        value: item.id?.toString(),
        label: item.name
      }));

      if (isEditMode && formData.department && formData.department_name) {
        const exists = departments.find(d => d.value === formData.department);
        if (!exists) {
          departments.unshift({
            value: formData.department,
            label: `${formData.department_name} (Current)`,
            isCurrent: true
          });
        }
      }
      
      setReferenceData(prev => ({
        ...prev,
        departments
      }));

      if (isEditMode) {
        setFormData(prev => ({ ...prev, _department_loaded: true }));
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
      setReferenceData(prev => ({ ...prev, departments: [] }));
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  }, [isEditMode, formData.department, formData.department_name, formData._department_loaded]);

  const loadUnits = useCallback(async (departmentId, skipIfLoaded = false) => {
    if (!departmentId) {
      setReferenceData(prev => ({ ...prev, units: [] }));
      return;
    }

    if (skipIfLoaded && formData._unit_loaded) {
      return;
    }

    setLoading(prev => ({ ...prev, units: true }));
    try {
      const response = await apiService.getUnits({ 
        department: departmentId 
      });
      const data = response.data.results || response.data || [];
      
      const units = data.map(item => ({
        value: item.id?.toString(),
        label: item.name
      }));

      if (isEditMode && formData.unit && formData.unit_name) {
        const exists = units.find(u => u.value === formData.unit);
        if (!exists) {
          units.unshift({
            value: formData.unit,
            label: `${formData.unit_name} (Current)`,
            isCurrent: true
          });
        }
      }
      
      setReferenceData(prev => ({
        ...prev,
        units
      }));

      if (isEditMode) {
        setFormData(prev => ({ ...prev, _unit_loaded: true }));
      }
    } catch (error) {
      console.error('Failed to load units:', error);
      setReferenceData(prev => ({ ...prev, units: [] }));
    } finally {
      setLoading(prev => ({ ...prev, units: false }));
    }
  }, [isEditMode, formData.unit, formData.unit_name, formData._unit_loaded]);

  const loadJobFunctions = useCallback(async () => {
    setLoading(prev => ({ ...prev, jobFunctions: true }));
    try {
      const response = await apiService.getJobFunctions();
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        jobFunctions: data.map(item => ({
          value: item.id?.toString(),
          label: item.name
        }))
      }));
    } catch (error) {
      console.error('Failed to load job functions:', error);
    } finally {
      setLoading(prev => ({ ...prev, jobFunctions: false }));
    }
  }, []);

  const loadPositionGroups = useCallback(async () => {
    setLoading(prev => ({ ...prev, positionGroups: true }));
    try {
      const response = await apiService.getPositionGroups();
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        positionGroups: data.map(item => ({
          value: item.id?.toString(),
          label: item.display_name || item.name,
          hierarchy_level: item.hierarchy_level
        }))
      }));
    } catch (error) {
      console.error('Failed to load position groups:', error);
    } finally {
      setLoading(prev => ({ ...prev, positionGroups: false }));
    }
  }, []);

  const loadEmployeeTags = useCallback(async () => {
    setLoading(prev => ({ ...prev, employeeTags: true }));
    try {
      const response = await apiService.getEmployeeTags();
      const data = response.data.results || response.data || [];
      
      setReferenceData(prev => ({
        ...prev,
        employeeTags: data.map(item => ({
          value: item.id?.toString(),
          label: item.name,
          color: item.color
        }))
      }));
    } catch (error) {
      console.error('Failed to load employee tags:', error);
    } finally {
      setLoading(prev => ({ ...prev, employeeTags: false }));
    }
  }, []);

  const loadGradingLevels = useCallback(async (positionGroupId, skipIfLoaded = false) => {
    if (!positionGroupId) {
      setReferenceData(prev => ({ ...prev, gradingLevels: [] }));
      return;
    }

    if (skipIfLoaded && formData._grading_loaded) {
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

      if (isEditMode) {
        setFormData(prev => ({ ...prev, _grading_loaded: true }));
      }
    } catch (error) {
      console.error('Failed to load grading levels:', error);
      setReferenceData(prev => ({ ...prev, gradingLevels: [] }));
    } finally {
      setLoading(prev => ({ ...prev, gradingLevels: false }));
    }
  }, [isEditMode, formData._grading_loaded]);

  const loadLineManagers = useCallback(async (searchTerm = "") => {
    setLoading(prev => ({ ...prev, lineManagers: true }));
    try {
      const response = await apiService.get('/employees/', { 
        search: searchTerm,
        page_size: 100,
        ordering: 'name'
      });
      
      const results = response.data.results || response.data || [];
      
      const managers = results
        .filter(emp => isEditMode ? emp.id !== employee?.id : true)
        .map(manager => ({
          id: manager.id,
          employee_id: manager.employee_id,
          name: manager.name,
          job_title: manager.job_title,
          department: manager.department_name,
          business_function: manager.business_function_name,
          email: manager.email,
          phone: manager.phone,
          grading_level: manager.grading_level,
          position_group_name: manager.position_group_name,
          start_date: manager.start_date
        }));
      
      setReferenceData(prev => ({ ...prev, lineManagers: managers }));
    } catch (error) {
      console.error('Failed to load line managers:', error);
      setReferenceData(prev => ({ ...prev, lineManagers: [] }));
    } finally {
      setLoading(prev => ({ ...prev, lineManagers: false }));
    }
  }, [isEditMode, employee?.id]);

  // ========================================
  // INITIALIZATION AND EFFECTS
  // ========================================

  // Initialize reference data
  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      if (!mounted) return;
      
      setLoading(prev => ({ ...prev, initialLoad: true }));
      
      try {
        await Promise.all([
          loadBusinessFunctions(),
          loadJobFunctions(),
          loadPositionGroups(),
          loadEmployeeTags(),
          loadLineManagers()
        ]);

        if (isEditMode && employee && mounted) {
          if (employee.business_function) {
            await loadDepartments(employee.business_function, true);
            
            if (employee.department) {
              await loadUnits(employee.department, true);
            }
          }
          
          if (employee.position_group) {
            await loadGradingLevels(employee.position_group, true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize reference data:', error);
      } finally {
        if (mounted) {
          setLoading(prev => ({ ...prev, initialLoad: false }));
          clearErrors();
        }
      }
    };

    initializeData();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle business function change
  useEffect(() => {
    if (formData.business_function) {
      loadDepartments(formData.business_function);
      
      if (!isEditMode || formData.business_function !== employee?.business_function?.toString()) {
        setFormData(prev => ({
          ...prev,
          department: "",
          unit: "",
          _department_loaded: false,
          _unit_loaded: false
        }));
      }
    } else {
      setReferenceData(prev => ({ 
        ...prev, 
        departments: [], 
        units: [] 
      }));
    }
  }, [formData.business_function]);

  // Handle department change
  useEffect(() => {
    if (formData.department) {
      loadUnits(formData.department);
      
      if (!isEditMode || formData.department !== employee?.department?.toString()) {
        setFormData(prev => ({
          ...prev,
          unit: "",
          _unit_loaded: false
        }));
      }
    } else {
      setReferenceData(prev => ({ ...prev, units: [] }));
    }
  }, [formData.department]);

  // Handle position group change
  useEffect(() => {
    if (formData.position_group) {
      loadGradingLevels(formData.position_group);
      
      if (!isEditMode || formData.position_group !== employee?.position_group?.toString()) {
        setFormData(prev => ({
          ...prev,
          grading_level: "",
          _grading_loaded: false
        }));
      }
    } else {
      setReferenceData(prev => ({ ...prev, gradingLevels: [] }));
    }
  }, [formData.position_group]);

  // ========================================
  // FORM VALIDATION
  // ========================================

  const validateStep = useCallback((step) => {
    const errors = {};

    switch (step) {
      case 1:
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

      case 2:
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
  }, [formData, validateStep, totalSteps]);

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

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    // FIXED: Proper boolean handling
    if (name === 'is_visible_in_org_chart') {
      newValue = Boolean(type === 'checkbox' ? checked : (value === 'true' || value === true));
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleLineManagerSearch = useCallback((searchTerm) => {
    setLineManagerSearch(searchTerm);
    if (searchTerm.length >= 2) {
      loadLineManagers(searchTerm);
    } else if (searchTerm.length === 0) {
      loadLineManagers();
    }
  }, [loadLineManagers]);

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

  const handleRemoveDocument = useCallback((index) => {
    setFormData(prev => {
      const newDocuments = [...(prev.documents || [])];
      newDocuments.splice(index, 1);
      return {
        ...prev,
        documents: newDocuments
      };
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
  // FORM SUBMISSION - COMPLETELY FIXED WITH PROPER DATE HANDLING
  // ========================================

  // FIXED: Date validation and formatting function
// Replace your formatDateForAPI function around line 600:
const formatDateForAPI = (dateString) => {
  if (!dateString) return null;
  
  try {
    // If it's already in YYYY-MM-DD format, validate it's a real date
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateString}`);
        return null;
      }
      return dateString;
    }
    
    // Parse and format other date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}`);
      return null;
    }
    
    // Convert to YYYY-MM-DD format with timezone handling
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error(`Error formatting date ${dateString}:`, error);
    return null;
  }
};

  const handleSubmit = async () => {
    // Validate required steps
    let allErrors = {};
    let hasErrors = false;

    for (let step = 1; step <= 2; step++) {
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
      // FIXED: Create FormData object matching API specification exactly
      const formDataObj = new FormData();

      // Basic Information - Required fields
      formDataObj.append('first_name', formData.first_name);
      formDataObj.append('last_name', formData.last_name);
      formDataObj.append('email', formData.email);

      // Job Information - Required fields  
      formDataObj.append('job_title', formData.job_title);
     
      formDataObj.append('business_function', formData.business_function);
      formDataObj.append('department', formData.department);
      formDataObj.append('job_function', formData.job_function);
      formDataObj.append('position_group', formData.position_group);
      formDataObj.append('contract_duration', formData.contract_duration);

      // FIXED: Boolean field - convert to string as API expects
      const booleanValue = formData.is_visible_in_org_chart === true || formData.is_visible_in_org_chart === 'true';
formDataObj.append('is_visible_in_org_chart', booleanValue ? 'True' : 'False');


      // Optional fields with proper null/empty checks and date formatting
      if (formData.father_name) {
        formDataObj.append('father_name', formData.father_name);
      }
      if (formData.unit) {
        formDataObj.append('unit', formData.unit);
      }
      if (formData.phone) {
        formDataObj.append('phone', formData.phone);
      }
    
      if (formData.gender) {
        formDataObj.append('gender', formData.gender);
      }
      if (formData.address) {
        formDataObj.append('address', formData.address);
      }
      if (formData.emergency_contact) {
        formDataObj.append('emergency_contact', formData.emergency_contact);
      }
      if (formData.grading_level) {
        formDataObj.append('grading_level', formData.grading_level);
      }
      if (formData.line_manager) {
        formDataObj.append('line_manager', formData.line_manager);
      }
   
   // In your handleSubmit function, add validation before appending dates:
const dateFields = [
  'start_date', 
  'date_of_birth', 
  'contract_start_date', 
  'end_date'
];

dateFields.forEach(field => {
  if (formData[field]) {
    const formattedDate = formatDateForAPI(formData[field]);
    if (formattedDate) {
      formDataObj.append(field, formattedDate);
    }
  }
});
      if (formData.notes) {
        formDataObj.append('notes', formData.notes);
      }
      if (formData.vacancy_id) {
        formDataObj.append('vacancy_id', formData.vacancy_id);
      }

      // Tags - FIXED: Append each tag ID separately as API expects array
      if (formData.tag_ids && formData.tag_ids.length > 0) {
  formData.tag_ids.forEach(tagId => {
    formDataObj.append('tag_ids[]', tagId); // Note the [] suffix
  });
}

      // Profile image - FIXED: Handle file upload properly
      if (formData.profile_image && formData.profile_image instanceof File) {
        formDataObj.append('profile_photo', formData.profile_image);
      }

      // Documents - FIXED: Handle document uploads
      if (formData.documents && formData.documents.length > 0) {
        // For now, just take the first document as API handles one at a time
        const doc = formData.documents[0];
        if (doc.file instanceof File) {
          formDataObj.append('document', doc.file);
          formDataObj.append('document_type', doc.document_type || 'OTHER');
          if (doc.document_name) {
            formDataObj.append('document_name', doc.document_name);
          }
        }
      }

      console.log('Submitting FormData with entries:');
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      // Submit to API using FormData (multipart/form-data)
      let result;
      if (isEditMode) {
        result = await apiService.put(`/employees/${employee.id}/`, formDataObj);
      } else {
        result = await apiService.post('/employees/', formDataObj);
      }

      // Handle success
      if (result.status >= 200 && result.status < 300) {
        if (onSuccess) {
          onSuccess(result.data);
        } else {
          router.push("/structure/headcount-table");
        }
      } else {
        const errorMessage = result.data?.detail || result.data?.message || 'Failed to save employee';
        setValidationErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error('Submit error:', error);
      
      if (error.response?.data) {
        const apiErrors = {};
        const errorData = error.response.data;
        
        if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              apiErrors[field] = errorData[field][0];
            } else if (typeof errorData[field] === 'string') {
              apiErrors[field] = errorData[field];
            }
          });
        }
        
        if (errorData.detail || errorData.message) {
          apiErrors.submit = errorData.detail || errorData.message;
        }
        
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
    
    businessFunctions: referenceData.businessFunctions,
    departments: referenceData.departments,
    units: referenceData.units,
    jobFunctions: referenceData.jobFunctions,
    positionGroups: referenceData.positionGroups,
    gradeOptions: referenceData.gradingLevels,
    loadingGradingLevels: loading.gradingLevels,
    
    lineManagerOptions: referenceData.lineManagers,
    lineManagerSearch,
    setLineManagerSearch: handleLineManagerSearch,
    loadingLineManagers: loading.lineManagers,
    
    tagOptions: referenceData.employeeTags,
    onAddTag: handleAddTag,
    onRemoveTag: handleRemoveTag,
    
    handleDocumentUpload,
    removeDocument: handleRemoveDocument,
    documentTypes,
    
    loading,
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
        return <FormStep4Documents {...stepProps} fileInputRef={fileInputRef} />;
      default:
        return null;
    }
  };

  // Show loading state
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
      <div className={`${bgCard} rounded-xl shadow-lg border ${borderColor}`}>
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