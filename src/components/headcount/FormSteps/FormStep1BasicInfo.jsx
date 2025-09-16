// src/components/headcount/FormSteps/FormStep1BasicInfo.jsx - CLEAN REWRITE
import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, MapPin, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
import { apiService } from "../../../services/api";

/**
 * Basic Information step - Clean implementation without Employee ID
 */
const FormStep1BasicInfo = ({ 
  formData, 
  handleInputChange, 
  validationErrors,
  isEditMode = false
}) => {
  const { darkMode } = useTheme();
  
  // Local state for email validation
  const [emailStatus, setEmailStatus] = useState({ checking: false, available: null });
  const [validationTimer, setValidationTimer] = useState(null);

  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";

  // Real-time email validation
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

    // Cleanup
    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
    };
  }, [formData.email, formData._email_changed, isEditMode, formData.id, formData.original_email]);

  // Handle field changes for email tracking in edit mode
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    
    // Mark email as changed in edit mode
    if (name === 'email' && isEditMode && value !== formData.original_email) {
      handleInputChange({ target: { name: '_email_changed', value: true } });
    }
    
    // Call the original handler
    handleInputChange(e);
  };

  // Get validation icon for email
  const getEmailValidationIcon = () => {
    if (emailStatus.checking) {
      return <Loader size={12} className="text-almet-sapphire animate-spin" />;
    }
    if (emailStatus.available === true) {
      return <CheckCircle size={12} className="text-green-500" />;
    }
    if (emailStatus.available === false) {
      return <AlertCircle size={12} className="text-red-500" />;
    }
    return null;
  };

  // Get validation help text for email
  const getEmailHelpText = () => {
    if (isEditMode && !formData._email_changed) {
      return "Current email";
    }
    if (emailStatus.checking) {
      return "Checking...";
    }
    if (emailStatus.available === true) {
      return "Available";
    }
    if (emailStatus.available === false) {
      return "Already exists";
    }
    return "Business email";
  };

  // Gender options
  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-almet-bali-hai dark:border-gray-700 pb-2 mb-4">
        <h2 className={`text-base font-bold ${textPrimary}`}>
          Basic Information
        </h2>
        <div className="text-[10px] px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire rounded font-medium">
          Step 1 of 4
        </div>
      </div>

      {/* Edit Mode Notice */}
      {isEditMode && (
        <div className="bg-almet-sapphire/5 dark:bg-blue-900/20 border border-almet-sapphire/20 dark:border-blue-800 rounded-md p-3">
          <div className="flex items-start">
            <AlertCircle className="h-3 w-3 text-almet-sapphire mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-medium text-almet-sapphire dark:text-blue-300 mb-1">
                Editing Employee Information
              </h4>
              <p className="text-[10px] text-almet-waterloo dark:text-blue-400">
                Only changed fields will be validated
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Employee ID Notice for New Employees */}
      {!isEditMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <div className="flex items-start">
            <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                Employee ID Auto-Assignment
              </h4>
              <p className="text-[10px] text-blue-700 dark:text-blue-400">
                Employee ID will be automatically assigned by the system after creation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Essential Information Section */}
      <div className="space-y-3">
        <h3 className={`text-xs font-semibold ${textSecondary} flex items-center`}>
          <Mail size={12} className="mr-1" />
          Essential Information
        </h3>
        
        {/* Email field only - Employee ID removed completely */}
        <div className="relative">
          <FormField
            label="Email Address"
            name="email"
            value={formData.email || ""}
            onChange={handleFieldChange}
            type="email"
            required={true}
            placeholder="john@company.com"
            icon={<Mail size={12} className={textMuted} />}
            validationError={
              validationErrors.email || 
              (emailStatus.available === false ? "Email already exists" : null)
            }
            helpText={getEmailHelpText()}
          />
          {/* Validation indicator */}
          <div className="absolute top-6 right-2 flex items-center">
            {getEmailValidationIcon()}
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="space-y-3">
        <h3 className={`text-xs font-semibold ${textSecondary} flex items-center`}>
          <User size={12} className="mr-1" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="First Name"
            name="first_name"
            value={formData.first_name || ""}
            onChange={handleInputChange}
            required={true}
            placeholder="John"
            icon={<User size={12} className={textMuted} />}
            validationError={validationErrors.first_name}
            helpText="Given name"
          />

          <FormField
            label="Last Name"
            name="last_name"
            value={formData.last_name || ""}
            onChange={handleInputChange}
            required={true}
            placeholder="Doe"
            icon={<User size={12} className={textMuted} />}
            validationError={validationErrors.last_name}
            helpText="Family name"
          />
        </div>

        {/* Father Name */}
        <FormField
          label="Father Name"
          name="father_name"
          value={formData.father_name || ""}
          onChange={handleInputChange}
          placeholder="Father's name"
          icon={<User size={12} className={textMuted} />}
          validationError={validationErrors.father_name}
          helpText="Optional field"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField
            label="Phone"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            type="tel"
            placeholder="+994 XX XXX XX XX"
            icon={<Phone size={12} className={textMuted} />}
            validationError={validationErrors.phone}
            helpText="Contact number"
          />

          <FormField
            label="Date of Birth"
            name="date_of_birth"
            value={formData.date_of_birth || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={12} className={textMuted} />}
            validationError={validationErrors.date_of_birth}
            helpText="For age calculation"
          />

          <FormField
            label="Gender"
            name="gender"
            value={formData.gender || ""}
            onChange={handleInputChange}
            type="select"
            options={genderOptions}
            icon={<User size={12} className={textMuted} />}
            validationError={validationErrors.gender}
            helpText="Optional"
            placeholder="Select"
          />
        </div>

        <FormField
          label="Address"
          name="address"
          value={formData.address || ""}
          onChange={handleInputChange}
          type="textarea"
          placeholder="Complete address..."
          icon={<MapPin size={12} className={textMuted} />}
          validationError={validationErrors.address}
          helpText="Full address with city"
          rows={2}
        />

        <FormField
          label="Emergency Contact"
          name="emergency_contact"
          value={formData.emergency_contact || ""}
          onChange={handleInputChange}
          placeholder="Name: Relationship: Phone"
          icon={<Phone size={12} className={textMuted} />}
          validationError={validationErrors.emergency_contact}
          helpText="Emergency contact info"
        />
      </div>

      {/* Auto-Generated Information Preview */}
      {(formData.first_name || formData.last_name) && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
          <h4 className={`text-xs font-medium text-green-800 dark:text-green-300 mb-2 flex items-center`}>
            <CheckCircle size={12} className="mr-1" />
            Auto-Generated Fields
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-green-700 dark:text-green-400">Full Name:</span>
              <span className="text-[10px] font-medium text-green-800 dark:text-green-300">
                {`${formData.first_name || ''} ${formData.last_name || ''}`.trim() || 'Incomplete'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-green-700 dark:text-green-400">Display Name:</span>
              <span className="text-[10px] font-medium text-green-800 dark:text-green-300">
                {`${formData.first_name || ''} ${formData.last_name || ''}`.trim() || 'Incomplete'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-green-600 dark:text-green-400 mt-1">
            ✓ These will be auto-generated
          </div>
        </div>
      )}

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <h4 className={`text-xs font-medium text-red-800 dark:text-red-300 mb-2 flex items-center`}>
            <AlertCircle size={12} className="mr-1" />
            Please Fix These Issues:
          </h4>
          <ul className="text-[10px] text-red-700 dark:text-red-400 space-y-0.5">
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field} className="flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                <strong>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FormStep1BasicInfo;