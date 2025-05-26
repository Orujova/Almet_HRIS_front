// src/components/headcount/FormComponents/FormField.jsx
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Enhanced form field component with icon support and multiple input types (without outline)
 * @param {Object} props - Component props
 * @param {string} props.label - Field label text
 * @param {string} props.name - Field name/id
 * @param {string|number} props.value - Field value
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.type - Input type (text, email, select, textarea, etc.)
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {React.ReactNode} props.icon - Optional icon to display
 * @param {string} props.helpText - Optional help text displayed below field
 * @param {Array} props.options - Options for select fields
 * @param {Object} props.validationError - Validation error for this field
 * @returns {JSX.Element} - Form field component
 */
const FormField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  required = false, 
  placeholder = "", 
  icon = null,
  helpText = "",
  options = [],
  validationError = null
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-white";
  const focusRing = "focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire";
  const errorBorder = validationError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "";

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className={`block ${textSecondary} text-xs font-medium mb-1.5`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        {type === "select" ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`block w-full ${icon ? "pl-8" : "pl-2.5"} pr-8 py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-colors duration-200 outline-none appearance-none`}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option, idx) => (
              <option key={idx} value={typeof option === 'object' ? option.value : option}>
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={3}
            className={`block w-full ${icon ? "pl-8" : "pl-2.5"} pr-2.5 py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-colors duration-200 outline-none resize-none`}
          ></textarea>
        ) : (
          <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={`block w-full ${icon ? "pl-8" : "pl-2.5"} pr-2.5 py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-colors duration-200 outline-none`}
          />
        )}
        
        {type === "select" && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {validationError && (
        <p className="mt-1 text-xs text-red-500">{validationError}</p>
      )}
      
      {/* Help Text */}
      {helpText && !validationError && (
        <p className={`mt-1 text-xs ${textMuted}`}>{helpText}</p>
      )}
    </div>
  );
};

export default FormField;