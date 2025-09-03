'use client';
import React, { useState, useEffect, useRef ,useMemo} from 'react';
import { 

   ChevronDown,

} from 'lucide-react';
const SearchableDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option", 
  displayKey = 'name', 
  valueKey = 'id',
  disabled = false,
  searchPlaceholder = "Search...",
  allowStringOptions = false, // New prop to handle string arrays
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef(null);
  
  // Handle both object arrays and string arrays
  const normalizedOptions = useMemo(() => {
    if (allowStringOptions && options.length > 0 && typeof options[0] === 'string') {
      return options.map(option => ({
        [displayKey]: option,
        [valueKey]: option
      }));
    }
    return options;
  }, [options, allowStringOptions, displayKey, valueKey]);
  
  const filteredOptions = normalizedOptions.filter(option => {
    const displayText = option[displayKey]?.toString().toLowerCase() || '';
    return displayText.includes(searchValue.toLowerCase());
  });
  
  const selectedOption = normalizedOptions.find(opt => opt[valueKey] === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchValue('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-left flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'
        } focus:border-blue-500 focus:outline-none`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption[displayKey] : placeholder}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option[valueKey] || index}
                  onClick={() => {
                    onChange(option[valueKey]);
                    setIsOpen(false);
                    setSearchValue('');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  {option[displayKey]}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;