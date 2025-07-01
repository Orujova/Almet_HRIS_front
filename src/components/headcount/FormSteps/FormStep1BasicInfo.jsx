
// src/components/headcount/FormSteps/FormStep1BasicInfo.jsx - Basic Information Step
import { User, Mail, Hash, Phone, Calendar, MapPin } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * Basic Information step of the employee form
 * Contains essential employee information required for creation
 */
const FormStep1BasicInfo = ({ 
  formData, 
  handleInputChange, 
  validationErrors 
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
        <h2 className={`text-lg font-bold ${textPrimary}`}>
          Basic Information
        </h2>
        <div className="text-xs px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded font-medium">
          Step 1 of 4
        </div>
      </div>

      {/* Essential Information */}
      <div className="space-y-4">
        <h3 className={`text-sm font-semibold ${textSecondary} flex items-center`}>
          <Hash size={16} className="mr-2" />
          Essential Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Employee ID"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            required={true}
            placeholder="EMP001"
            icon={<Hash size={14} className={textMuted} />}
            validationError={validationErrors.employee_id}
            helpText="Unique identifier for the employee"
          />

          <FormField
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            type="email"
            required={true}
            placeholder="john.doe@company.com"
            icon={<Mail size={14} className={textMuted} />}
            validationError={validationErrors.email}
            helpText="Business email address"
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className={`text-sm font-semibold ${textSecondary} flex items-center`}>
          <User size={16} className="mr-2" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required={true}
            placeholder="John"
            icon={<User size={14} className={textMuted} />}
            validationError={validationErrors.first_name}
            helpText="Employee's first name"
          />

          <FormField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required={true}
            placeholder="Doe"
            icon={<User size={14} className={textMuted} />}
            validationError={validationErrors.last_name}
            helpText="Employee's last name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Phone Number"
            name="phone"
            value={formData.phone}
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
            value={formData.date_of_birth}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.date_of_birth}
            helpText="Used for age calculations and reports"
          />
        </div>

        <FormField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          type="textarea"
          placeholder="Full residential address"
          icon={<MapPin size={14} className={textMuted} />}
          validationError={validationErrors.address}
          helpText="Complete address including city and postal code"
          rows={3}
        />
      </div>

      {/* Auto-Generated Fields Display */}
      {(formData.first_name || formData.last_name) && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className={`text-sm font-medium text-green-800 dark:text-green-300 mb-2`}>
            Auto-Generated Information
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 dark:text-green-400">Full Name:</span>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                {`${formData.first_name} ${formData.last_name}`.trim()}
              </span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              This will be automatically generated and stored in the system
            </div>
          </div>
        </div>
      )}

      {/* Form Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
        <h4 className={`text-sm font-medium text-blue-800 dark:text-blue-300 mb-2`}>
          Form Guidelines
        </h4>
        <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <p>• Employee ID must be unique across the organization</p>
          <p>• Email address will be used for system notifications and login</p>
          <p>• First and Last names are required for all employees</p>
          <p>• Phone number and address are optional but recommended</p>
          <p>• Date of birth is used for reporting and compliance purposes</p>
        </div>
      </div>

      {/* Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className={`text-sm font-medium text-red-800 dark:text-red-300 mb-2`}>
            Please Fix These Issues:
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field} className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FormStep1BasicInfo;