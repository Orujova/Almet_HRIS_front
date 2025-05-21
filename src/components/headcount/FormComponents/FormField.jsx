// src/components/headcount/FormComponents/FormField.jsx
import { ChevronLeft } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Enhanced form field component with icon support and multiple input types
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
  options = [] 
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-white";

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className={`block ${textSecondary} text-sm font-medium mb-1.5`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
            className={`block w-full ${icon ? "pl-10" : "pl-3"} pr-10 py-2.5 border ${borderColor} ${inputBg} ${textPrimary} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200`}
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
            className={`block w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2.5 border ${borderColor} ${inputBg} ${textPrimary} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200`}
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
            className={`block w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2.5 border ${borderColor} ${inputBg} ${textPrimary} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200`}
          />
        )}
        
        {type === "select" && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronLeft className="h-4 w-4 transform rotate-270" />
          </div>
        )}
      </div>
      {helpText && <p className={`mt-1 text-xs ${textMuted}`}>{helpText}</p>}
    </div>
  );
};

export default FormField;