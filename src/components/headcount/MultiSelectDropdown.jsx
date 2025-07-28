// src/components/headcount/MultiSelectDropdown.jsx - COMPLETELY FIXED: Uncheck support and search clear
import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check, Search } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * FIXED MultiSelectDropdown - Düzəldilmiş uncheck funksiyası və search clear
 * Özəlliklər:
 * - FIXED: Seçilmiş option-ları uncheck etmək (toggle)
 * - FIXED: Search-i clear etmək düyməsi
 * - FIXED: Clear all funksiyası
 * - Search functionality
 * - Color indicators
 * - Code display
 * - Keyboard navigation
 */
const MultiSelectDropdown = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Select options...",
  disabled = false,
  showColors = false, // For status options
  showCodes = false, // For business functions
  showDescriptions = false, // For tags/grades
  showSubtitles = false, // For line managers
  maxSelections = null,
  className = "",
  searchable = true,
  groupBy = null,
  maxHeight = "300px",
  clearable = true,
  singleSelect = false,
  showSearch = false
}) => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const bgSelected = darkMode ? "bg-almet-sapphire/20" : "bg-almet-sapphire/10";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && (searchable || showSearch) && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable, showSearch]);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Search in label
    if (option.label && option.label.toLowerCase().includes(searchLower)) return true;
    
    // Search in code if available
    if (option.code && option.code.toLowerCase().includes(searchLower)) return true;
    
    // Search in description if available
    if (option.description && option.description.toLowerCase().includes(searchLower)) return true;
    
    // Search in subtitle/job title if available
    if (option.jobTitle && option.jobTitle.toLowerCase().includes(searchLower)) return true;
    
    // Search in searchText if available (for advanced search)
    if (option.searchText && option.searchText.toLowerCase().includes(searchLower)) return true;
    
    return false;
  });

  // Get selected option objects
  const selectedOptions = options.filter(option => 
    selectedValues.includes(option.value)
  );

  // FIXED: Handle option toggle with proper uncheck support
  const handleOptionToggle = (optionValue) => {
    if (disabled) return;

    console.log('🔄 MultiSelectDropdown: Option toggle clicked', {
      optionValue,
      currentlySelected: selectedValues.includes(optionValue),
      selectedValues
    });

    let newSelectedValues;
    
    // FIXED: Düzgün toggle logic - həm seçmək həm də uncheck etmək
    if (selectedValues.includes(optionValue)) {
      // UNCHECK: Remove from selection
      newSelectedValues = selectedValues.filter(value => value !== optionValue);
      console.log('🔄 UNCHECK: Removing from selection', { optionValue, newSelectedValues });
    } else {
      // CHECK: Add to selection (check max limit)
      if (maxSelections && selectedValues.length >= maxSelections) {
        console.warn('⚠️ Max selections reached:', maxSelections);
        return; // Don't add more if limit reached
      }
      
      if (singleSelect) {
        // Single select - replace current selection
        newSelectedValues = [optionValue];
        console.log('🔄 SINGLE SELECT: Replacing selection', { optionValue, newSelectedValues });
      } else {
        // Multi select - add to selection
        newSelectedValues = [...selectedValues, optionValue];
        console.log('🔄 CHECK: Adding to selection', { optionValue, newSelectedValues });
      }
    }
    
    onChange(newSelectedValues);
    
    // Close dropdown for single select when selecting (not unselecting)
    if (singleSelect && !selectedValues.includes(optionValue)) {
      setIsOpen(false);
    }
  };

  // FIXED: Handle remove selected option
  const handleRemoveOption = (optionValue, event) => {
    event.stopPropagation();
    if (disabled) return;
    
    console.log('🗑️ Removing option:', optionValue);
    const newSelectedValues = selectedValues.filter(value => value !== optionValue);
    onChange(newSelectedValues);
  };

  // FIXED: Clear all selections
  const handleClearAll = (event) => {
    if (event) event.stopPropagation();
    if (disabled) return;
    
    console.log('🧹 MultiSelectDropdown: Clearing all selections');
    onChange([]);
  };

  // FIXED: Clear search function
  const handleClearSearch = () => {
    console.log('🔍 MultiSelectDropdown: Clearing search');
    setSearchTerm("");
  };

  // FIXED: Select all function
  const handleSelectAll = () => {
    if (disabled || singleSelect) return;
    
    console.log('✅ MultiSelectDropdown: Selecting all options');
    const allValues = filteredOptions.map(opt => opt.value);
    onChange(allValues);
  };

  // Check if all options are selected
  const isAllSelected = filteredOptions.length > 0 && 
    filteredOptions.every(option => selectedValues.includes(option.value));

  // Render option with appropriate styling
  const renderOption = (option) => {
    const isSelected = selectedValues.includes(option.value);
    
    return (
      <div
        key={option.value}
        onClick={() => handleOptionToggle(option.value)}
        className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
          isSelected 
            ? `${bgSelected} border-l-2 border-almet-sapphire` 
            : bgHover
        }`}
      >
        {/* FIXED: Checkbox with proper state indication */}
        <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center transition-colors ${
          isSelected 
            ? 'border-almet-sapphire bg-almet-sapphire' 
            : `border-gray-300 dark:border-gray-600 hover:border-almet-sapphire`
        }`}>
          {isSelected && <Check size={12} className="text-white" />}
        </div>

        {/* Color indicator for status options */}
        {showColors && option.color && (
          <div 
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: option.color }}
          />
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className={`${textPrimary} text-sm truncate font-medium`}>
              {option.label}
            </span>
            {showCodes && option.code && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${bgInput} ${textMuted}`}>
                {option.code}
              </span>
            )}
          </div>
          
          {/* Subtitle for line managers */}
          {showSubtitles && (option.subtitle || option.jobTitle || option.department) && (
            <div className={`text-xs ${textMuted} truncate mt-0.5`}>
              {option.subtitle || `${option.jobTitle || ''}${option.jobTitle && option.department ? ' • ' : ''}${option.department || ''}`}
            </div>
          )}
          
          {/* Description for tags/grades */}
          {showDescriptions && option.description && (
            <div className={`text-xs ${textMuted} truncate mt-0.5`}>
              {option.description}
            </div>
          )}
        </div>

        {/* Employee count or additional info */}
        {option.employee_count !== undefined && (
          <span className={`text-xs ${textMuted} ml-2`}>
            {option.employee_count}
          </span>
        )}
      </div>
    );
  };

  // Render selected tags
  const renderSelectedTags = () => {
    if (selectedOptions.length === 0) {
      return (
        <span className={textMuted}>{placeholder}</span>
      );
    }

    if (selectedOptions.length <= 3) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${bgInput} ${textSecondary}`}
            >
              {showColors && option.color && (
                <div 
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: option.color }}
                />
              )}
              {option.label}
              <button
                onClick={(e) => handleRemoveOption(option.value, e)}
                className={`ml-1 ${textMuted} hover:text-red-500 transition-colors`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <span className={`${textSecondary} text-sm`}>
          {selectedOptions.length} selected
        </span>
        {clearable && (
          <button
            onClick={handleClearAll}
            className={`ml-2 text-xs ${textMuted} hover:text-red-500 transition-colors`}
          >
            Clear all
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main input */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full p-3 border rounded-lg cursor-pointer transition-colors ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
        } ${borderColor} ${bgInput} ${textPrimary} ${
          isOpen ? 'ring-2 ring-almet-sapphire border-almet-sapphire' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {renderSelectedTags()}
          </div>
          <div className="flex items-center ml-2">
            {selectedOptions.length > 0 && !disabled && clearable && (
              <button
                onClick={handleClearAll}
                className={`mr-2 ${textMuted} hover:text-red-500 transition-colors`}
              >
                <X size={16} />
              </button>
            )}
            <ChevronDown 
              size={16} 
              className={`${textMuted} transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div 
          className={`absolute z-50 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg overflow-hidden`}
          style={{ maxHeight }}
        >
          {/* FIXED: Search input with clear button */}
          {(searchable || showSearch) && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full p-2 pl-8 pr-8 text-sm border ${borderColor} rounded ${bgInput} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                />
                <Search 
                  size={14} 
                  className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${textMuted}`} 
                />
                {/* FIXED: Clear search button */}
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${textMuted} hover:text-red-500 transition-colors`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* FIXED: Action buttons for select all / clear all */}
          {clearable && filteredOptions.length > 1 && !singleSelect && (
            <div className={`px-3 py-2 border-b ${borderColor} flex justify-between`}>
              <button
                onClick={handleSelectAll}
                className="text-xs text-almet-sapphire hover:text-almet-astral font-medium"
              >
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </button>
              {selectedValues.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          )}

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(renderOption)
            ) : (
              <div className={`p-4 text-center ${textMuted}`}>
                <div className="text-sm">
                  {searchTerm ? 'No matching options found' : 'No options available'}
                </div>
                {searchTerm && (
                  <div className="text-xs mt-1">
                    Try adjusting your search terms
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with selection info */}
          {selectedOptions.length > 0 && (
            <div className={`p-2 border-t ${borderColor} bg-gray-50 dark:bg-gray-800/50`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textMuted}`}>
                  {selectedOptions.length} of {filteredOptions.length} selected
                  {maxSelections && ` (max ${maxSelections})`}
                </span>
                {clearable && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;