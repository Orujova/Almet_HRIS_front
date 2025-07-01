// src/components/headcount/SearchBar.jsx - Enhanced Search Component
import { useState, useRef, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * Advanced search bar component with autocomplete and search suggestions
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.placeholder - Search placeholder text
 * @param {Array} props.suggestions - Search suggestions (optional)
 * @param {boolean} props.showAdvancedSearch - Show advanced search toggle
 * @param {Function} props.onAdvancedSearch - Advanced search handler
 * @returns {JSX.Element} - Search bar component
 */
const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search employees by name, email, job title...",
  suggestions = [],
  showAdvancedSearch = false,
  onAdvancedSearch
}) => {
  const { darkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);

  // Theme classes
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const borderFocus = "border-almet-sapphire";
  const bgSuggestion = darkMode ? "bg-gray-800" : "bg-white";

  // Filter suggestions based on search term
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    onSearchChange(value);
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
    setActiveSuggestion(-1);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    if (searchTerm.length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0) {
          handleSuggestionClick(filteredSuggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  // Clear search
  const handleClear = () => {
    onSearchChange("");
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex-1 max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search 
            className={`h-4 w-4 ${isFocused ? 'text-almet-sapphire' : textMuted}`} 
            aria-hidden="true" 
          />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`
            block w-full pl-10 pr-12 py-2.5 text-sm
            ${bgInput} ${textPrimary}
            border ${isFocused ? borderFocus : borderColor}
            rounded-lg
            focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire
            placeholder:${textMuted}
            transition-all duration-200
            outline-none
          `}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear button */}
        {searchTerm && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {showAdvancedSearch && (
              <button
                type="button"
                onClick={onAdvancedSearch}
                className={`p-1 mr-1 ${textMuted} hover:text-almet-sapphire transition-colors rounded`}
                title="Advanced search"
              >
                <Filter size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={handleClear}
              className={`p-1 mr-2 ${textMuted} hover:text-red-500 transition-colors rounded`}
              title="Clear search"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className={`
          absolute z-50 w-full mt-1 
          ${bgSuggestion} 
          border ${borderColor} 
          rounded-lg shadow-lg 
          max-h-60 overflow-y-auto
        `}>
          <div className="py-1">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  ${activeSuggestion === index 
                    ? 'bg-almet-sapphire text-white' 
                    : `${textPrimary} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }
                  transition-colors
                  flex items-center
                `}
              >
                <Search size={14} className="mr-3 opacity-50" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}
          </div>
          
          {/* Search tips */}
          <div className={`border-t ${borderColor} px-4 py-2`}>
            <p className={`text-xs ${textMuted}`}>
              Pro tip: Use quotes for exact phrases, or try "name:John" for specific searches
            </p>
          </div>
        </div>
      )}

      {/* Search Status */}
      {searchTerm && !showSuggestions && (
        <div className="absolute z-40 w-full mt-1">
          <div className={`text-xs ${textMuted} px-2 py-1`}>
            Searching for "{searchTerm}"...
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;