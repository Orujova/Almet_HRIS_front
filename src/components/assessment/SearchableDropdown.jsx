'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

const SearchableDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option", 
  displayKey = 'name', 
  valueKey = 'id',
  disabled = false,
  searchPlaceholder = "Search...",
  allowStringOptions = false,
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
        className={`
          w-full px-5 py-3 border-2 rounded-xl text-left flex items-center justify-between
          transition-all duration-300 font-medium shadow-inner
          ${disabled 
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400' 
            : isOpen
              ? 'bg-white border-almet-sapphire shadow-lg ring-4 ring-almet-sapphire/20'
              : 'bg-gray-50 border-gray-300 hover:bg-white hover:border-almet-sapphire hover:shadow-md'
          }
          focus:border-almet-sapphire focus:outline-none focus:ring-4 focus:ring-almet-sapphire/20
        `}
      >
        <span className={`transition-colors duration-200 ${
          selectedOption 
            ? 'text-almet-cloud-burst font-semibold' 
            : 'text-almet-waterloo'
        }`}>
          {selectedOption ? selectedOption[displayKey] : placeholder}
        </span>
        <ChevronDown 
          size={18} 
          className={`
            transition-all duration-300 text-almet-waterloo
            ${isOpen ? 'rotate-180 text-almet-sapphire' : ''}
            ${disabled ? 'opacity-50' : ''}
          `} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-almet-sapphire rounded-xl shadow-2xl max-h-72 overflow-hidden animate-in slide-in-from-top-2 duration-300">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-almet-mystic/30 to-blue-50/30">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="
                w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm
                bg-white focus:outline-none focus:border-almet-sapphire 
                focus:ring-4 focus:ring-almet-sapphire/20
                transition-all duration-300 shadow-inner
                placeholder:text-almet-waterloo
              "
              autoFocus
            />
          </div>
          
          {/* Options List */}
          <div className="max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-almet-bali-hai scrollbar-track-gray-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={`${option[valueKey]}-${index}`}
                  onClick={() => {
                    onChange(option[valueKey]);
                    setIsOpen(false);
                    setSearchValue('');
                  }}
                  className={`
                    w-full px-5 py-3 text-left transition-all duration-200
                    hover:bg-gradient-to-r hover:from-almet-mystic/50 hover:to-blue-50/50
                    focus:bg-gradient-to-r focus:from-almet-mystic/50 focus:to-blue-50/50
                    focus:outline-none border-l-4 border-transparent
                    hover:border-almet-sapphire focus:border-almet-sapphire
                    ${value === option[valueKey] 
                      ? 'bg-gradient-to-r from-almet-sapphire/10 to-blue-100/50 border-l-almet-sapphire text-almet-cloud-burst font-semibold' 
                      : 'text-almet-cloud-burst hover:text-almet-sapphire'
                    }
                    ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}
                  `}
                >
                  <div className="flex items-center">
                    <span className="flex-1 truncate">{option[displayKey]}</span>
                    {value === option[valueKey] && (
                      <div className="w-2 h-2 bg-almet-sapphire rounded-full ml-2 animate-pulse"></div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <div className="text-almet-waterloo text-sm">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-xl">?</span>
                  </div>
                  <p className="font-medium">No options found</p>
                  <p className="text-xs mt-1 opacity-75">Try adjusting your search</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;