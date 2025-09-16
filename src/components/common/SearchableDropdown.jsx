"use client";
import { useState, useEffect, useRef } from "react";

import {
  Search,
  ChevronDown,
} from "lucide-react";

const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  searchPlaceholder = "Search...",
  className = "",
  darkMode = false,
  icon = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? '#4B5563 #374151' : '#D1D5DB #F9FAFB'};
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#374151' : '#F9FAFB'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#6B7280' : '#D1D5DB'};
          border-radius: 3px;
          transition: background-color 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#9CA3AF' : '#9CA3AF'};
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: #6366F1;
        }
      `}</style>
      
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs text-left flex items-center justify-between transition-all duration-200 hover:border-almet-sapphire/50`}
        >
          <div className="flex items-center">
            {icon && <span className="mr-2 text-almet-sapphire">{icon}</span>}
            <span className={selectedOption ? textPrimary : textMuted}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`absolute z-50 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-hidden`}>
            <div className={`p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="relative">
                <Search size={12} className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-7 pr-2 py-1.5 outline-0 border ${borderColor} rounded focus:ring-1 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs`}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-44 overflow-y-auto custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className={`px-3 py-2 ${textMuted} text-xs text-center`}>
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full px-3 py-2 text-left ${hoverBg} ${textPrimary} text-xs transition-colors duration-150 ${
                      value === option.value ? 'bg-almet-sapphire/10 text-almet-sapphire' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchableDropdown;