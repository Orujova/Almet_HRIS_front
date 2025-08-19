import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  name, 
  disabled = false, 
  allowCustom = false,
  error = false,
  darkMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  
  const filteredOptions = options.filter(option =>
    option.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.id === value);
  const displayValue = selectedOption ? (selectedOption.display_name || selectedOption.name) : value;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        {allowCustom ? (
          <input
            type="text"
            value={displayValue || ''}
            onChange={(e) => {
              onChange(e.target.value);
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            className={`w-full px-3 py-2 pr-8 border ${error ? 'border-red-500' : borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
            }`}
            placeholder={placeholder}
          />
        ) : (
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-left flex items-center justify-between text-sm ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span className={displayValue ? textPrimary : textMuted}>
              {displayValue || placeholder}
            </span>
          </button>
        )}
        
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${disabled ? 'opacity-50' : ''}`} />
        </button>
      </div>
      
      {isOpen && !disabled && (
        <div className={`absolute top-full left-0 right-0 mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-30`}>
          {/* Search input for non-custom selects */}
          {!allowCustom && filteredOptions.length > 5 && (
            <div className="p-2 border-b border-gray-200 dark:border-almet-comet">
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-2 py-1 border ${borderColor} rounded ${bgCard} ${textPrimary} focus:outline-none text-sm`}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto">
            {!allowCustom && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`w-full px-3 py-2 text-left hover:${bgCardHover} ${textMuted} text-sm`}
              >
                {placeholder}
              </button>
            )}
            
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-3 py-2 text-left hover:${bgCardHover} ${textPrimary} text-sm ${
                    value === option.id ? 'bg-almet-sapphire text-white' : ''
                  }`}
                >
                  {option.display_name || option.name}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;