import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const MultiSelectDropdown = ({ options, placeholder, onChange, selectedValues = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`border ${borderColor} rounded-md p-2 flex items-center justify-between cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 overflow-hidden max-h-16 overflow-y-auto">
          {selectedValues.length > 0 ? (
            selectedValues.map((value, idx) => (
              <span 
                key={idx} 
                className={`${darkMode ? 'bg-gray-700' : 'bg-almet-mystic'} ${textPrimary} text-[10px] px-2 py-0.5 rounded flex items-center`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(value);
                }}
              >
                {value}
                <X size={10} className="ml-1" />
              </span>
            ))
          ) : (
            <span className={`${textMuted} text-sm`}>{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} className={textMuted} />
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full rounded-md shadow-lg ${bgCard} border ${borderColor}`}>
          <div className="p-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className={`w-full p-2 border ${borderColor} rounded-md ${inputBg} ${textPrimary} pl-8 text-sm`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400 dark:text-gray-500" size={14} />
            </div>
          </div>
          
          {selectedValues.length > 0 && (
            <div className="px-2 pb-2 flex justify-between items-center">
              <span className={`text-[10px] ${textMuted}`}>
                {selectedValues.length} selected
              </span>
              <button 
                className="text-[10px] text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
              >
                Clear all
              </button>
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto scrollbar-thin">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <div
                  key={idx}
                  className={`p-2 ${hoverBg} flex items-center cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  <div className={`w-5 h-5 rounded border ${borderColor} mr-2 flex items-center justify-center ${
                    selectedValues.includes(option) 
                      ? 'bg-almet-sapphire border-almet-sapphire' 
                      : ''
                  }`}>
                    {selectedValues.includes(option) && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className={`${textPrimary} text-sm`}>{option}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className={`${textMuted} text-xs`}>No options found</p>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button 
              className="px-3 py-1 bg-almet-sapphire text-white rounded-md text-xs"
              onClick={() => setIsOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;