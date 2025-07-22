// src/components/headcount/SearchBar.jsx - FIXED: Instant Search with Debounce
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Filter, Clock, User, Mail } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * FIXED SearchBar with proper debounced search and instant application
 */
const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search by name, email, employee ID, job title...",
  suggestions = [],
  showAdvancedSearch = false,
  onAdvancedSearch,
  recentSearches = []
}) => {
  const { darkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [localValue, setLocalValue] = useState(searchTerm || ""); // Local state for instant typing
  const [localRecentSearches, setLocalRecentSearches] = useState(recentSearches);
  const inputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Sync local value with external searchTerm
  useEffect(() => {
    setLocalValue(searchTerm || "");
  }, [searchTerm]);

  // Theme classes
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const borderFocus = "border-almet-sapphire";
  const bgSuggestion = darkMode ? "bg-gray-800" : "bg-white";
  const bgSuggestionHover = darkMode ? "bg-gray-700" : "bg-gray-50";

  // Debounced search function
  const debouncedSearch = useCallback((value) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Debounced search executing:', value);
      onSearchChange(value);
      
      // Add to recent searches if not empty
      if (value.trim()) {
        addToRecentSearches(value.trim());
      }
    }, 300); // 300ms debounce
  }, [onSearchChange]);

  // Handle input change - INSTANT local update, debounced API call
  const handleInputChange = (e) => {
    const value = e.target.value;
    console.log('🔍 Search input change:', value);
    
    // Update local state immediately for responsive UI
    setLocalValue(value);
    setShowSuggestions(value.length > 0 || localRecentSearches.length > 0);
    setActiveSuggestion(-1);
    
    // Debounced API call
    debouncedSearch(value);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(localValue.length > 0 || localRecentSearches.length > 0);
  };

  // Handle input blur
  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Generate search suggestions based on search term
  const generateSuggestions = () => {
    if (!localValue.trim()) {
      return localRecentSearches.slice(0, 5).map(search => ({
        type: 'recent',
        text: search,
        icon: Clock
      }));
    }

    // Filter existing suggestions
    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(localValue.toLowerCase())
    ).slice(0, 3);

    // Add search type suggestions
    const searchSuggestions = [];
    
    if (localValue.includes('@')) {
      searchSuggestions.push({
        type: 'email',
        text: `Email: ${localValue}`,
        icon: Mail
      });
    } else {
      searchSuggestions.push({
        type: 'name',
        text: `Name: ${localValue}`,
        icon: User
      });
    }

    return [
      ...filtered.map(text => ({ type: 'suggestion', text, icon: Search })),
      ...searchSuggestions
    ].slice(0, 5);
  };

  const currentSuggestions = generateSuggestions();

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || currentSuggestions.length === 0) {
      // Handle Enter key for immediate search
      if (e.key === 'Enter') {
        e.preventDefault();
        // Clear debounce and search immediately
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        console.log('🔍 Immediate search on Enter:', localValue);
        onSearchChange(localValue);
        if (localValue.trim()) {
          addToRecentSearches(localValue.trim());
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < currentSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0) {
          handleSuggestionClick(currentSuggestions[activeSuggestion]);
        } else if (localValue.trim()) {
          // Clear debounce and search immediately
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
          console.log('🔍 Immediate search on Enter:', localValue);
          onSearchChange(localValue);
          addToRecentSearches(localValue.trim());
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
    const searchText = suggestion.text.includes(':') 
      ? suggestion.text.split(':')[1].trim() 
      : suggestion.text;
    
    console.log('🔍 Suggestion clicked - immediate search:', searchText);
    
    // Clear debounce and apply immediately
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setLocalValue(searchText);
    onSearchChange(searchText);
    addToRecentSearches(searchText);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  // Add to recent searches
  const addToRecentSearches = (searchText) => {
    if (!searchText.trim()) return;
    
    setLocalRecentSearches(prev => {
      const filtered = prev.filter(search => search !== searchText);
      return [searchText, ...filtered].slice(0, 10);
    });
  };

  // Clear search
  const handleClear = () => {
    console.log('🔍 Search cleared - immediate application');
    
    // Clear debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setLocalValue("");
    onSearchChange("");
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setLocalRecentSearches([]);
    setShowSuggestions(false);
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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
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
          value={localValue}
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

        {/* Action buttons */}
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
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-1 mr-2 ${textMuted} hover:text-red-500 transition-colors rounded`}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && currentSuggestions.length > 0 && (
        <div className={`
          absolute z-50 w-full mt-1 
          ${bgSuggestion} 
          border ${borderColor} 
          rounded-lg shadow-lg 
          max-h-60 overflow-y-auto
        `}>
          <div className="py-1">
            {/* Recent searches header */}
            {!localValue && localRecentSearches.length > 0 && (
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${textMuted}`}>
                    Recent searches
                  </span>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {currentSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    w-full px-4 py-2 text-left text-sm
                    ${activeSuggestion === index 
                      ? 'bg-almet-sapphire text-white' 
                      : `${textPrimary} hover:${bgSuggestionHover}`
                    }
                    transition-colors
                    flex items-center
                  `}
                >
                  <Icon 
                    size={14} 
                    className={`mr-3 ${
                      activeSuggestion === index ? 'text-white' : 
                      suggestion.type === 'recent' ? 'text-gray-400' :
                      suggestion.type === 'email' ? 'text-blue-500' :
                      'text-gray-500'
                    }`} 
                  />
                  <span className="truncate flex-1">
                    {suggestion.text}
                  </span>
                  {suggestion.type === 'recent' && (
                    <span className={`text-xs ml-2 ${
                      activeSuggestion === index ? 'text-white/70' : textMuted
                    }`}>
                      Recent
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Search tips */}
          {localValue && (
            <div className={`border-t ${borderColor} px-4 py-2`}>
              <p className={`text-xs ${textMuted}`}>
                <strong>Tip:</strong> Press Enter to search immediately or use quotes for exact matches
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search Status */}
      {localValue && !showSuggestions && (
        <div className="absolute z-40 w-full mt-1">
          <div className={`text-xs ${textMuted} px-2 py-1 ${bgSuggestion} border ${borderColor} rounded-lg`}>
            Searching for "{localValue}"...
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;