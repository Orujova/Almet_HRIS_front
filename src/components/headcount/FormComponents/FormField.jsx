// src/components/headcount/FormComponents/FormField.jsx - Enhanced with Searchable Dropdowns
import { useState } from "react";
import { ChevronDown, Loader, AlertCircle, Search, X, Check } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Enhanced form field component with searchable dropdowns by default
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
  validationError = null,
  loading = false,
  disabled = false,
  onSearch = null,
  searchable = true, // Make searchable by default
  clearable = false,
  onClear = null,
  multiple = false,
  rows = 3,
  showColors = false, // For status/tag options with colors
  showCodes = false, // For business functions with codes
  showDescriptions = false, // For detailed options
  ...props
}) => {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Theme-dependent classes
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-white";
  const focusRing = "focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire";
  const errorBorder = validationError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "";
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm && type === "select"
    ? options.filter(option => {
        const label = typeof option === 'object' ? option.label : option;
        const code = typeof option === 'object' ? option.code : null;
        const description = typeof option === 'object' ? option.description : null;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          label.toLowerCase().includes(searchLower) ||
          (code && code.toLowerCase().includes(searchLower)) ||
          (description && description.toLowerCase().includes(searchLower))
        );
      })
    : options;

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  // Handle selection for multiple select
  const handleMultipleSelect = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    onChange({ target: { name, value: newValues } });
  };

  // Get selected option labels for display
  const getSelectedLabels = () => {
    if (!multiple || !Array.isArray(value)) return [];
    return value.map(val => {
      const option = options.find(opt => 
        typeof opt === 'object' ? opt.value === val : opt === val
      );
      return typeof option === 'object' ? option.label : option;
    });
  };

  // Handle clear
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { name, value: multiple ? [] : "" } });
    }
    setSearchTerm("");
  };

  // Get display value for single select
  const getDisplayValue = () => {
    if (!value) return "";
    const option = options.find(opt => 
      typeof opt === 'object' ? opt.value === value : opt === value
    );
    return typeof option === 'object' ? option.label : value;
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className={`block ${textSecondary} text-xs font-medium mb-1.5`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
            {icon}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none z-10">
            <Loader className="h-4 w-4 animate-spin text-almet-sapphire" />
          </div>
        )}

        {/* Clear button */}
        {clearable && value && !loading && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center z-10 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {/* Regular Select (Non-searchable) */}
        {type === "select" && !searchable && !multiple ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled || loading}
            className={`block w-full ${icon ? "pl-8" : "pl-2.5"} ${clearable && value ? "pr-8" : "pr-8"} py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-colors duration-200 outline-none appearance-none ${disabledStyle}`}
            {...props}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option, idx) => (
              <option key={idx} value={typeof option === 'object' ? option.value : option}>
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
        ) : 
        
        /* Searchable/Multiple Select */
        (type === "select" && (searchable || multiple)) ? (
          <div className="relative">
            <div
              className={`block w-full ${icon ? "pl-8" : "pl-2.5"} pr-8 py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-colors duration-200 outline-none cursor-pointer ${disabledStyle}`}
              onClick={() => !disabled && setIsOpen(!isOpen)}
            >
              {multiple && Array.isArray(value) && value.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {getSelectedLabels().slice(0, 2).map((label, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-almet-sapphire/10 text-almet-sapphire"
                    >
                      {label}
                    </span>
                  ))}
                  {value.length > 2 && (
                    <span className="text-xs text-gray-500">+{value.length - 2} more</span>
                  )}
                </div>
              ) : value && !multiple ? (
                <span>{getDisplayValue()}</span>
              ) : (
                <span className="text-gray-400">{placeholder || `Select ${label}`}</span>
              )}
            </div>
            
            {/* Dropdown */}
            {isOpen && !disabled && (
              <div className={`absolute z-20 w-full mt-1 ${inputBg} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-hidden`}>
                {/* Search input for searchable selects */}
                {searchable && (
                  <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`w-full pl-8 pr-2 py-1 text-sm border ${borderColor} rounded ${inputBg} ${textPrimary} focus:outline-none focus:border-almet-sapphire`}
                      />
                    </div>
                  </div>
                )}
                
                {/* Options */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, idx) => {
                      const optionValue = typeof option === 'object' ? option.value : option;
                      const optionLabel = typeof option === 'object' ? option.label : option;
                      const optionCode = typeof option === 'object' ? option.code : null;
                      const optionColor = typeof option === 'object' ? option.color : null;
                      const optionDescription = typeof option === 'object' ? option.description : null;
                      
                      const isSelected = multiple 
                        ? Array.isArray(value) && value.includes(optionValue)
                        : value === optionValue;
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (multiple) {
                              handleMultipleSelect(optionValue);
                            } else {
                              onChange({ target: { name, value: optionValue } });
                              setIsOpen(false);
                              setSearchTerm("");
                            }
                          }}
                          className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 ${
                            isSelected ? 'bg-almet-sapphire/10 text-almet-sapphire' : textPrimary
                          }`}
                        >
                          <div className="flex items-center flex-1">
                            {/* Color indicator */}
                            {showColors && optionColor && (
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: optionColor }}
                              />
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="truncate">{optionLabel}</span>
                                {/* Code display */}
                                {showCodes && optionCode && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded">
                                    {optionCode}
                                  </span>
                                )}
                              </div>
                              {/* Description */}
                              {showDescriptions && optionDescription && (
                                <div className="text-xs text-gray-500 truncate mt-0.5">
                                  {optionDescription}
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      {searchTerm ? 'No matching options found' : 'No options available'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : 
        
        /* Textarea */
        type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled || loading}
            className={`block w-full ${icon ? "pl-8" : "pl-2.5"} pr-2.5 py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-colors duration-200 outline-none resize-none ${disabledStyle}`}
            {...props}
          />
        ) : 
        
        /* Regular Input */
        (
          <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            disabled={disabled || loading}
            className={`block w-full ${icon ? "pl-8" : "pl-2.5"} ${clearable && value ? "pr-8" : "pr-2.5"} py-2 text-sm border ${errorBorder || borderColor} ${inputBg} ${textPrimary} rounded-lg ${focusRing} transition-colors duration-200 outline-none ${disabledStyle}`}
            {...props}
          />
        )}
        
        {/* Select dropdown arrow */}
        {type === "select" && !multiple && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {validationError && (
        <div className="mt-1 flex items-center text-red-500 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>{validationError}</span>
        </div>
      )}
      
      {/* Help Text */}
      {helpText && !validationError && (
        <p className={`mt-1 text-xs ${textMuted}`}>{helpText}</p>
      )}

      {/* Click outside handler for dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FormField;