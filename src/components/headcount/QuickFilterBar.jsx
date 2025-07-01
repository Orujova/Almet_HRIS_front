// src/components/headcount/QuickFilterBar.jsx - Multi-Selection Filter Component
import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check, Filter } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * Quick filter bar component with multi-selection dropdowns
 * @param {Object} props - Component props
 * @param {Function} props.onStatusChange - Status filter change handler
 * @param {Function} props.onDepartmentChange - Department filter change handler
 * @param {Array} props.statusFilter - Selected status filters
 * @param {Array} props.departmentFilter - Selected department filters
 * @param {Array} props.activeFilters - All active filters for display
 * @param {Function} props.onClearFilter - Clear specific filter handler
 * @param {Object} props.filterOptions - Available filter options from API
 * @param {Array} props.statusOptions - Status options from reference data
 * @param {Array} props.departmentOptions - Department options from reference data
 * @returns {JSX.Element} - Quick filter bar component
 */
const QuickFilterBar = ({
  onStatusChange,
  onDepartmentChange,
  statusFilter = [],
  departmentFilter = [],
  activeFilters = [],
  onClearFilter,
  filterOptions = {},
  statusOptions = [],
  departmentOptions = []
}) => {
  const { darkMode } = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Multi-select dropdown component
  const MultiSelectDropdown = ({ 
    label, 
    options, 
    selectedValues, 
    onChange, 
    dropdownKey,
    placeholder = "Select options..."
  }) => {
    const isOpen = openDropdown === dropdownKey;
    const selectedCount = selectedValues.length;

    const toggleDropdown = () => {
      setOpenDropdown(isOpen ? null : dropdownKey);
    };

    const handleOptionToggle = (value) => {
      const newSelected = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onChange(newSelected);
    };

    const handleSelectAll = () => {
      if (selectedValues.length === options.length) {
        onChange([]);
      } else {
        onChange(options.map(opt => opt.value || opt.id));
      }
    };

    const handleClear = () => {
      onChange([]);
    };

    return (
      <div className="relative" ref={el => dropdownRefs.current[dropdownKey] = el}>
        <button
          type="button"
          onClick={toggleDropdown}
          className={`
            ${bgInput} border ${borderColor}
            px-3 py-2 rounded-lg text-sm
            flex items-center justify-between
            min-w-[140px] max-w-[200px]
            ${textPrimary}
            transition-all duration-200
            ${isOpen ? 'border-almet-sapphire ring-2 ring-almet-sapphire ring-opacity-20' : ''}
            hover:border-almet-sapphire
          `}
        >
          <span className="truncate">
            {selectedCount > 0 ? (
              <span className="flex items-center">
                <span className="bg-almet-sapphire text-white text-xs px-1.5 py-0.5 rounded-full mr-2">
                  {selectedCount}
                </span>
                {label}
              </span>
            ) : (
              <span className={textMuted}>{placeholder}</span>
            )}
          </span>
          <ChevronDown 
            size={16} 
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className={`
            absolute z-50 mt-1 w-64
            ${bgCard} border ${borderColor}
            rounded-lg shadow-lg
            max-h-60 overflow-hidden
          `}>
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${textPrimary}`}>
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  {selectedCount > 0 && (
                    <button
                      onClick={handleClear}
                      className={`text-xs ${textMuted} hover:text-red-500 transition-colors`}
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={handleSelectAll}
                    className={`text-xs text-almet-sapphire hover:text-almet-astral transition-colors`}
                  >
                    {selectedValues.length === options.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {options.length > 0 ? (
                options.map((option) => {
                  const value = option.value || option.id;
                  const label = option.label || option.name;
                  const isSelected = selectedValues.includes(value);

                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionToggle(value)}
                      className={`
                        w-full px-3 py-2 text-left text-sm
                        ${hoverBg}
                        flex items-center
                        transition-colors
                      `}
                    >
                      <div className={`
                        w-4 h-4 border-2 rounded mr-3 flex items-center justify-center
                        ${isSelected 
                          ? 'bg-almet-sapphire border-almet-sapphire' 
                          : `border-gray-300 dark:border-gray-600`
                        }
                      `}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      
                      {/* Color indicator for status */}
                      {option.color && (
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      
                      <span className={`${textPrimary} truncate`}>
                        {label}
                      </span>
                      
                      {/* Count if available */}
                      {option.count !== undefined && (
                        <span className={`ml-auto text-xs ${textMuted}`}>
                          {option.count}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center">
                  <span className={`text-sm ${textMuted}`}>No options available</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideDropdown = Object.values(dropdownRefs.current).some(ref => 
        ref && ref.contains(event.target)
      );
      
      if (!isInsideDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prepare status options with colors
  const statusOptionsWithColors = statusOptions.map(status => ({
    ...status,
    value: status.name || status.value,
    label: status.display_name || status.name || status.label,
    color: status.color || '#6B7280'
  }));

  // Prepare department options
  const departmentOptionsFormatted = departmentOptions.map(dept => ({
    ...dept,
    value: dept.id,
    label: dept.name
  }));

  return (
    <div className="flex items-center gap-3">
      {/* Status Filter */}
      <MultiSelectDropdown
        label="Status"
        options={statusOptionsWithColors}
        selectedValues={statusFilter}
        onChange={onStatusChange}
        dropdownKey="status"
        placeholder="All Statuses"
      />

      {/* Department Filter */}
      <MultiSelectDropdown
        label="Department"
        options={departmentOptionsFormatted}
        selectedValues={departmentFilter}
        onChange={onDepartmentChange}
        dropdownKey="department"
        placeholder="All Departments"
      />

      {/* Active Filter Count */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            bg-blue-100 dark:bg-blue-900 
            text-blue-800 dark:text-blue-200
            flex items-center
          `}>
            <Filter size={12} className="mr-1" />
            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Clear All Filters */}
      {activeFilters.length > 0 && (
        <button
          onClick={() => {
            onStatusChange([]);
            onDepartmentChange([]);
            activeFilters.forEach(filter => onClearFilter(filter.key));
          }}
          className={`
            text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400
            transition-colors font-medium
            flex items-center
          `}
        >
          <X size={12} className="mr-1" />
          Clear All
        </button>
      )}
    </div>
  );
};

export default QuickFilterBar;