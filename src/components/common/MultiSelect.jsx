import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const MultiSelect = ({ 
  options, 
  selected, 
  onChange, 
  placeholder, 
  fieldName, 
  darkMode = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-left flex items-center justify-between text-sm`}
      >
        <span className={selected.length > 0 ? textPrimary : textMuted}>
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute top-full left-0 right-0 mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg max-h-48 overflow-y-auto z-20`}>
          {options.length > 0 ? (
            options.map((option) => (
              <label key={option.id || option.value} className={`flex items-center px-3 py-2 hover:${bgCardHover} cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={selected.includes(option.id || option.value)}
                  onChange={() => onChange(fieldName, option.id || option.value)}
                  className="mr-2 text-almet-sapphire focus:ring-almet-sapphire"
                />
                <span className={`text-sm ${textPrimary}`}>{option.name || option.label}</span>
              </label>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;