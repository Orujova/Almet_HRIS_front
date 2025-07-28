// src/components/headcount/SearchBar.jsx - ENHANCED: Proper API Integration & Debounce
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Filter, Clock, User, Mail, Hash, Briefcase } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * Enhanced SearchBar with proper API integration and advanced search types
 * Supports backend filtering for: name, email, employee_id, job_title
 */
const SearchBar = ({ 
  searchTerm = "", 
  onSearchChange, 
  placeholder = "Search employees by name, email, ID, or job title...",
  suggestions = [],
  showAdvancedSearch = false,
  onAdvancedSearch,
  recentSearches = [],
  employeeData = [], // For generating smart suggestions
  isLoading = false
}) => {
  const { darkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [localValue, setLocalValue] = useState(searchTerm || "");
  const [localRecentSearches, setLocalRecentSearches] = useState(recentSearches);
  const [searchType, setSearchType] = useState('general'); // general, employee_id, email, job_title
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

  // Detect search type from input value
  const detectSearchType = useCallback((value) => {
    if (!value.trim()) return 'general';
    
    // Email pattern
    if (value.includes('@') && value.includes('.')) {
      return 'email';
    }
    
    // Employee ID pattern (letters followed by numbers)
    if (/^[A-Z]{2,4}\d+$/i.test(value.trim())) {
      return 'employee_id';
    }
    
    // Check if it matches job titles
    const lowerValue = value.toLowerCase();
    const jobTitleMatches = employeeData.some(emp => 
      emp.jobTitle?.toLowerCase().includes(lowerValue) ||
      emp.job_title?.toLowerCase().includes(lowerValue)
    );
    
    if (jobTitleMatches && value.length > 3) {
      return 'job_title';
    }
    
    return 'general';
  }, [employeeData]);

 // Enhanced debounced search with search type detection
  const debouncedSearch = useCallback((value, immediate = false) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const delay = immediate ? 0 : 300;
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Enhanced search executing:', { value, searchType });
      
      // FIXED: Send only the primary search value, not all parameters
      const searchValue = value.trim();
      
      // Detect search type but send simple string value to parent
      const detectedType = detectSearchType(value);
      setSearchType(detectedType);
      
      // Send simple search string - parent will handle the mapping
      onSearchChange(searchValue);
      
      // Add to recent searches if not empty
      if (searchValue) {
        addToRecentSearches(searchValue, detectedType);
      }
    }, delay);
  }, [onSearchChange, detectSearchType]);
  // Handle input change with enhanced detection
  const handleInputChange = (e) => {
    const value = e.target.value;
    console.log('🔍 Search input change:', value);
    
    setLocalValue(value);
    setShowSuggestions(value.length > 0 || localRecentSearches.length > 0);
    setActiveSuggestion(-1);
    
    // Debounced search with type detection
    debouncedSearch(value);
  };

  // Enhanced suggestions generation
  const generateSuggestions = useCallback(() => {
    if (!localValue.trim()) {
      return localRecentSearches.slice(0, 5).map(search => ({
        type: 'recent',
        text: search.query,
        searchType: search.type,
        icon: Clock,
        description: `Recent ${search.type} search`
      }));
    }

    const suggestions = [];
    const lowerValue = localValue.toLowerCase();
    const detectedType = detectSearchType(localValue);

    // Employee name/ID suggestions
    if (employeeData.length > 0) {
      const employeeMatches = employeeData
        .filter(emp => {
          const fullName = emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
          const employeeId = emp.employee_id || emp.employeeId || '';
          const email = emp.email || '';
          
          return fullName.toLowerCase().includes(lowerValue) ||
                 employeeId.toLowerCase().includes(lowerValue) ||
                 email.toLowerCase().includes(lowerValue);
        })
        .slice(0, 3);

      employeeMatches.forEach(emp => {
        const fullName = emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
        suggestions.push({
          type: 'employee',
          text: fullName,
          subtitle: emp.employee_id || emp.employeeId,
          description: emp.jobTitle || emp.job_title,
          icon: User,
          searchType: 'employee_search'
        });
      });
    }

    // Job title suggestions
    if (detectedType === 'job_title' || detectedType === 'general') {
      const jobTitles = [...new Set(
        employeeData
          .map(emp => emp.jobTitle || emp.job_title)
          .filter(title => title && title.toLowerCase().includes(lowerValue))
      )].slice(0, 2);

      jobTitles.forEach(title => {
        suggestions.push({
          type: 'job_title',
          text: title,
          icon: Briefcase,
          searchType: 'job_title_search',
          description: 'Job Title'
        });
      });
    }

    // Email suggestions
    if (detectedType === 'email') {
      suggestions.push({
        type: 'email',
        text: localValue,
        icon: Mail,
        searchType: 'employee_search',
        description: 'Search by email'
      });
    }

    // Employee ID suggestions
    if (detectedType === 'employee_id') {
      suggestions.push({
        type: 'employee_id',
        text: localValue.toUpperCase(),
        icon: Hash,
        searchType: 'employee_search',
        description: 'Employee ID'
      });
    }

    // General search suggestion
    if (suggestions.length < 5) {
      suggestions.push({
        type: 'general',
        text: localValue,
        icon: Search,
        searchType: 'search',
        description: 'General search'
      });
    }

    return suggestions.slice(0, 5);
  }, [localValue, localRecentSearches, employeeData, detectSearchType]);

  const currentSuggestions = generateSuggestions();

  // Enhanced keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || currentSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleImmediateSearch();
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
        } else {
          handleImmediateSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        if (activeSuggestion >= 0) {
          e.preventDefault();
          handleSuggestionClick(currentSuggestions[activeSuggestion]);
        }
        break;
    }
  };

  // Handle immediate search
  const handleImmediateSearch = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    console.log('🔍 Immediate search triggered:', localValue);
    debouncedSearch(localValue, true);
    
    if (localValue.trim()) {
      addToRecentSearches(localValue.trim(), detectSearchType(localValue));
    }
  };

  // Enhanced suggestion click handler
  const handleSuggestionClick = (suggestion) => {
    const searchText = suggestion.text;
    
    console.log('🔍 Suggestion clicked - immediate search:', {
      text: searchText,
      type: suggestion.searchType,
      suggestion
    });
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setLocalValue(searchText);
    
    // Build search parameters based on suggestion type
    const searchParams = {
      search: '',
      employee_search: '',
      line_manager_search: '',
      job_title_search: ''
    };
    
    if (suggestion.searchType && searchText.trim()) {
      searchParams[suggestion.searchType] = searchText.trim();
    } else {
      searchParams.search = searchText.trim();
    }
    
    onSearchChange(searchParams);
    addToRecentSearches(searchText, suggestion.searchType || 'general');
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  // Enhanced recent searches management
  const addToRecentSearches = (searchText, type = 'general') => {
    if (!searchText.trim()) return;
    
    setLocalRecentSearches(prev => {
      const filtered = prev.filter(search => 
        search.query !== searchText || search.type !== type
      );
      return [{ query: searchText, type, timestamp: Date.now() }, ...filtered].slice(0, 10);
    });
  };

  // Clear search with proper reset
  const handleClear = () => {
    console.log('🔍 Search cleared - immediate application');
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setLocalValue("");
    setSearchType('general');
    
    // Clear all search parameters
    onSearchChange({
      search: '',
      employee_search: '',
      line_manager_search: '',
      job_title_search: ''
    });
    
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(localValue.length > 0 || localRecentSearches.length > 0);
  };

  // Handle blur with delay
  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setLocalRecentSearches([]);
    setShowSuggestions(false);
  };

  // Search type indicator
  const getSearchTypeInfo = () => {
    switch (searchType) {
      case 'email':
        return { icon: Mail, label: 'Email Search', color: 'text-blue-500' };
      case 'employee_id':
        return { icon: Hash, label: 'Employee ID', color: 'text-green-500' };
      case 'job_title':
        return { icon: Briefcase, label: 'Job Title', color: 'text-purple-500' };
      default:
        return { icon: Search, label: 'General Search', color: 'text-gray-500' };
    }
  };

  const searchTypeInfo = getSearchTypeInfo();

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
    <div className="relative flex-1 max-w-lg">
      {/* Search Input */}
      <div className="relative">
        {/* Search Type Indicator */}
        {localValue && searchType !== 'general' && (
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none z-10">
            <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${searchTypeInfo.color} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600`}>
              <searchTypeInfo.icon size={12} className="mr-1" />
              {searchTypeInfo.label}
            </div>
          </div>
        )}
        
        <div className={`absolute inset-y-0 ${localValue && searchType !== 'general' ? 'left-24' : 'left-0'} pl-3 flex items-center pointer-events-none transition-all duration-200`}>
          <Search 
            className={`h-4 w-4 ${isFocused ? 'text-almet-sapphire' : textMuted} ${isLoading ? 'animate-pulse' : ''}`} 
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
            block w-full ${localValue && searchType !== 'general' ? 'pl-28' : 'pl-10'} pr-12 py-3 text-sm
            ${bgInput} ${textPrimary}
            border ${isFocused ? borderFocus : borderColor}
            rounded-lg
            focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire
            placeholder:${textMuted}
            transition-all duration-200
            outline-none
            ${isLoading ? 'opacity-75' : ''}
          `}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          disabled={isLoading}
        />

        {/* Action buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center">
          {showAdvancedSearch && (
            <button
              type="button"
              onClick={onAdvancedSearch}
              className={`p-1 mr-1 ${textMuted} hover:text-almet-sapphire transition-colors rounded`}
              title="Advanced search"
              disabled={isLoading}
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
              disabled={isLoading}
            >
              <X size={16} />
            </button>
          )}
          {isLoading && (
            <div className="p-1 mr-2">
              <div className="w-4 h-4 border border-almet-sapphire border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Search Suggestions */}
      {showSuggestions && currentSuggestions.length > 0 && (
        <div className={`
          absolute z-50 w-full mt-1 
          ${bgSuggestion} 
          border ${borderColor} 
          rounded-lg shadow-lg 
          max-h-80 overflow-y-auto
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
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    w-full px-4 py-3 text-left text-sm
                    ${activeSuggestion === index 
                      ? 'bg-almet-sapphire text-white' 
                      : `${textPrimary} hover:${bgSuggestionHover}`
                    }
                    transition-colors
                    flex items-center
                  `}
                >
                  <Icon 
                    size={16} 
                    className={`mr-3 flex-shrink-0 ${
                      activeSuggestion === index ? 'text-white' : 
                      suggestion.type === 'recent' ? 'text-gray-400' :
                      suggestion.type === 'email' ? 'text-blue-500' :
                      suggestion.type === 'employee_id' ? 'text-green-500' :
                      suggestion.type === 'job_title' ? 'text-purple-500' :
                      suggestion.type === 'employee' ? 'text-indigo-500' :
                      'text-gray-500'
                    }`} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="truncate font-medium">
                        {suggestion.text}
                      </span>
                      {suggestion.subtitle && (
                        <span className={`ml-2 text-xs ${
                          activeSuggestion === index ? 'text-white/70' : textMuted
                        }`}>
                          ({suggestion.subtitle})
                        </span>
                      )}
                    </div>
                    {suggestion.description && (
                      <div className={`text-xs mt-0.5 ${
                        activeSuggestion === index ? 'text-white/70' : textMuted
                      }`}>
                        {suggestion.description}
                      </div>
                    )}
                  </div>
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
          
          {/* Enhanced search tips */}
          {localValue && (
            <div className={`border-t ${borderColor} px-4 py-3`}>
              <div className={`text-xs ${textMuted}`}>
                <div className="flex items-center mb-1">
                  <strong>Search Tips:</strong>
                </div>
                <ul className="space-y-1 ml-2">
                  <li>• Use @ for email search (e.g., john@company.com)</li>
                  <li>• Use ID format for employee search (e.g., HLD123)</li>
                  <li>• Type job titles for position-based search</li>
                  <li>• Press Tab or Enter to select highlighted option</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && localValue && !showSuggestions && (
        <div className="absolute z-40 w-full mt-1">
          <div className={`text-xs ${textMuted} px-3 py-2 ${bgSuggestion} border ${borderColor} rounded-lg flex items-center`}>
            <div className="w-3 h-3 border border-almet-sapphire border-t-transparent rounded-full animate-spin mr-2"></div>
            Searching for "{localValue}"...
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;