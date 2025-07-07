// src/components/headcount/FormSteps/FormStep1BasicInfo.jsx - Fixed for Edit Mode
import { useState, useEffect } from "react";
import { User, Mail, Hash, Phone, Calendar, MapPin, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
import { apiService } from "../../../services/api";

/**
 * Enhanced Basic Information step with edit mode support
 */
const FormStep1BasicInfo = ({ 
  formData, 
  handleInputChange, 
  validationErrors,
  isEditMode = false
}) => {
  const { darkMode } = useTheme();
  
  // Local state for real-time validation
  const [employeeIdStatus, setEmployeeIdStatus] = useState({ checking: false, available: null });
  const [emailStatus, setEmailStatus] = useState({ checking: false, available: null });
  const [validationTimer, setValidationTimer] = useState(null);

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-gray-50";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Real-time employee ID validation (only for new employees or changed IDs)
  useEffect(() => {
    // Skip validation in edit mode if ID hasn't changed
    if (isEditMode && !formData._employee_id_changed) {
      setEmployeeIdStatus({ checking: false, available: true });
      return;
    }

    if (formData.employee_id && formData.employee_id.length >= 3) {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }

      const timer = setTimeout(async () => {
        setEmployeeIdStatus({ checking: true, available: null });
        try {
          const response = await apiService.get('/employees/', { 
            employee_id: formData.employee_id,
            page_size: 1 
          });
          
          const exists = response.data.results && response.data.results.length > 0;
          
          // In edit mode, if the existing employee has this ID, it's okay
          if (isEditMode && exists) {
            const existingEmployee = response.data.results[0];
            // Check if it's the same employee being edited
            const isSameEmployee = existingEmployee.id === formData.id || 
                                 existingEmployee.employee_id === formData.original_employee_id;
            setEmployeeIdStatus({ 
              checking: false, 
              available: isSameEmployee 
            });
          } else {
            setEmployeeIdStatus({ 
              checking: false, 
              available: !exists 
            });
          }
        } catch (error) {
          console.error('Error checking employee ID:', error);
          setEmployeeIdStatus({ checking: false, available: null });
        }
      }, 800);

      setValidationTimer(timer);
    } else {
      setEmployeeIdStatus({ checking: false, available: null });
    }

    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
    };
  }, [formData.employee_id, formData._employee_id_changed, isEditMode, formData.id, formData.original_employee_id]);

  // Real-time email validation (only for new employees or changed emails)
  useEffect(() => {
    // Skip validation in edit mode if email hasn't changed
    if (isEditMode && !formData._email_changed) {
      setEmailStatus({ checking: false, available: true });
      return;
    }

    if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }

      const timer = setTimeout(async () => {
        setEmailStatus({ checking: true, available: null });
        try {
          const response = await apiService.get('/employees/', { 
            email: formData.email,
            page_size: 1 
          });
          
          const exists = response.data.results && response.data.results.length > 0;
          
          // In edit mode, if the existing employee has this email, it's okay
          if (isEditMode && exists) {
            const existingEmployee = response.data.results[0];
            const isSameEmployee = existingEmployee.id === formData.id || 
                                 existingEmployee.email === formData.original_email;
            setEmailStatus({ 
              checking: false, 
              available: isSameEmployee 
            });
          } else {
            setEmailStatus({ 
              checking: false, 
              available: !exists 
            });
          }
        } catch (error) {
          console.error('Error checking email:', error);
          setEmailStatus({ checking: false, available: null });
        }
      }, 1000);

      setValidationTimer(timer);
    } else {
      setEmailStatus({ checking: false, available: null });
    }

    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
    };
  }, [formData.email, formData._email_changed, isEditMode, formData.id, formData.original_email]);

  // Track field changes in edit mode
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    // Mark fields as changed in edit mode
    if (isEditMode) {
      if (name === 'employee_id' && value !== formData.original_employee_id) {
        e.target.value = value;
        e.target.name = name;
        handleInputChange(e);
        handleInputChange({ target: { name: '_employee_id_changed', value: true } });
      } else if (name === 'email' && value !== formData.original_email) {
        e.target.value = value;
        e.target.name = name;
        handleInputChange(e);
        handleInputChange({ target: { name: '_email_changed', value: true } });
      } else {
        handleInputChange(e);
      }
    } else {
      handleInputChange(e);
    }
  };

  // Get validation icon for employee ID
  const getEmployeeIdValidationIcon = () => {
    if (employeeIdStatus.checking) {
      return <Loader size={14} className="text-blue-500 animate-spin" />;
    }
    if (employeeIdStatus.available === true) {
      return <CheckCircle size={14} className="text-green-500" />;
    }
    if (employeeIdStatus.available === false) {
      return <AlertCircle size={14} className="text-red-500" />;
    }
    return null;
  };

  // Get validation icon for email
  const getEmailValidationIcon = () => {
    if (emailStatus.checking) {
      return <Loader size={14} className="text-blue-500 animate-spin" />;
    }
    if (emailStatus.available === true) {
      return <CheckCircle size={14} className="text-green-500" />;
    }
    if (emailStatus.available === false) {
      return <AlertCircle size={14} className="text-red-500" />;
    }
    return null;
  };

  // Get validation help text
  const getEmployeeIdHelpText = () => {
    if (isEditMode && !formData._employee_id_changed) {
      return "Current employee ID (change to validate availability)";
    }
    if (employeeIdStatus.checking) {
      return "Checking availability...";
    }
    if (employeeIdStatus.available === true) {
      return "Employee ID is available";
    }
    if (employeeIdStatus.available === false) {
      return "Employee ID already exists";
    }
    return "Unique identifier for the employee";
  };

  const getEmailHelpText = () => {
    if (isEditMode && !formData._email_changed) {
      return "Current email address (change to validate availability)";
    }
    if (emailStatus.checking) {
      return "Checking availability...";
    }
    if (emailStatus.available === true) {
      return "Email is available";
    }
    if (emailStatus.available === false) {
      return "Email already exists";
    }
    return "Business email address for system access";
  };

  // Gender options
  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER", label: "Other" },
    { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
        <h2 className={`text-lg font-bold ${textPrimary}`}>
          Basic Information
        </h2>
        <div className="text-xs px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded font-medium">
          Step 1 of 4
        </div>
      </div>

      {/* Edit Mode Notice */}
      {isEditMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Editing Employee Information
              </h4>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                You are editing existing employee data. Employee ID and email will only be validated if you change them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Essential Information Section */}
      <div className="space-y-4">
        <h3 className={`text-sm font-semibold ${textSecondary} flex items-center`}>
          <Hash size={16} className="mr-2" />
          Essential Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee ID with real-time validation */}
          <div className="relative">
            <FormField
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id || ""}
              onChange={handleFieldChange}
              required={true}
              placeholder="e.g., EMP001, HLD123"
              icon={<Hash size={14} className={textMuted} />}
              validationError={
                validationErrors.employee_id || 
                (employeeIdStatus.available === false ? "Employee ID already exists" : null)
              }
              helpText={getEmployeeIdHelpText()}
            />
            {/* Validation indicator */}
            <div className="absolute top-8 right-3 flex items-center">
              {getEmployeeIdValidationIcon()}
            </div>
          </div>

          {/* Email with real-time validation */}
          <div className="relative">
            <FormField
              label="Email Address"
              name="email"
              value={formData.email || ""}
              onChange={handleFieldChange}
              type="email"
              required={true}
              placeholder="john.doe@company.com"
              icon={<Mail size={14} className={textMuted} />}
              validationError={
                validationErrors.email || 
                (emailStatus.available === false ? "Email address already exists" : null)
              }
              helpText={getEmailHelpText()}
            />
            {/* Validation indicator */}
            <div className="absolute top-8 right-3 flex items-center">
              {getEmailValidationIcon()}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="space-y-4">
        <h3 className={`text-sm font-semibold ${textSecondary} flex items-center`}>
          <User size={16} className="mr-2" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            name="first_name"
            value={formData.first_name || ""}
            onChange={handleInputChange}
            required={true}
            placeholder="John"
            icon={<User size={14} className={textMuted} />}
            validationError={validationErrors.first_name}
            helpText="Employee's given name"
          />

          <FormField
            label="Last Name"
            name="last_name"
            value={formData.last_name || ""}
            onChange={handleInputChange}
            required={true}
            placeholder="Doe"
            icon={<User size={14} className={textMuted} />}
            validationError={validationErrors.last_name}
            helpText="Employee's family name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Phone Number"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            type="tel"
            placeholder="+994 XX XXX XX XX"
            icon={<Phone size={14} className={textMuted} />}
            validationError={validationErrors.phone}
            helpText="Primary contact number"
          />

          <FormField
            label="Date of Birth"
            name="date_of_birth"
            value={formData.date_of_birth || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.date_of_birth}
            helpText="For age calculations and compliance"
          />

          <FormField
            label="Gender"
            name="gender"
            value={formData.gender || ""}
            onChange={handleInputChange}
            type="select"
            options={genderOptions}
            icon={<User size={14} className={textMuted} />}
            validationError={validationErrors.gender}
            helpText="For diversity reporting"
            placeholder="Select gender"
          />
        </div>

        <FormField
          label="Address"
          name="address"
          value={formData.address || ""}
          onChange={handleInputChange}
          type="textarea"
          placeholder="Complete residential address..."
          icon={<MapPin size={14} className={textMuted} />}
          validationError={validationErrors.address}
          helpText="Full address including city and postal code"
          rows={3}
        />

        <FormField
          label="Emergency Contact"
          name="emergency_contact"
          value={formData.emergency_contact || ""}
          onChange={handleInputChange}
          placeholder="Name: Relationship: Phone Number"
          icon={<Phone size={14} className={textMuted} />}
          validationError={validationErrors.emergency_contact}
          helpText="Emergency contact person with relationship and phone"
        />
      </div>

      {/* Auto-Generated Information Preview */}
      {(formData.first_name || formData.last_name) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className={`text-sm font-medium text-green-800 dark:text-green-300 mb-3 flex items-center`}>
            <CheckCircle size={16} className="mr-2" />
            Auto-Generated Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 dark:text-green-400">Full Name:</span>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                {`${formData.first_name || ''} ${formData.last_name || ''}`.trim() || 'Not complete'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 dark:text-green-400">Display Name:</span>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                {`${formData.first_name || ''} ${formData.last_name || ''}`.trim() || 'Not complete'}
              </span>
            </div>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-2">
            ✓ These fields will be automatically generated and stored in the system
          </div>
        </div>
      )}

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className={`text-sm font-medium text-red-800 dark:text-red-300 mb-2 flex items-center`}>
            <AlertCircle size={16} className="mr-2" />
            Please Fix These Issues:
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field} className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <strong>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress Indicator */}
      <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${textSecondary}`}>Form Completion</span>
          <span className={`text-sm font-medium ${textPrimary}`}>
            {Math.round(((formData.employee_id ? 1 : 0) + 
                        (formData.first_name ? 1 : 0) + 
                        (formData.last_name ? 1 : 0) + 
                        (formData.email ? 1 : 0)) / 4 * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-almet-sapphire h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((formData.employee_id ? 1 : 0) + 
                        (formData.first_name ? 1 : 0) + 
                        (formData.last_name ? 1 : 0) + 
                        (formData.email ? 1 : 0)) / 4 * 100}%` 
            }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Complete all required fields to proceed to the next step
        </div>
      </div>
    </div>
  );
};

export default FormStep1BasicInfo;