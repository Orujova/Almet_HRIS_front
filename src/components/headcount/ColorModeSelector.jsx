// src/components/headcount/ColorModeSelector.jsx - FIXED - No Infinite Loop
"use client";
import { useState, useEffect, useRef } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useReferenceData } from "../../hooks/useReferenceData";

import { 
  setColorMode, 
  getCurrentColorMode, 
  addColorModeListener, 
  initializeColorSystem
} from "./utils/themeStyles";

const ColorSelector = ({ onChange }) => {
  const { darkMode } = useTheme();
  const [currentMode, setCurrentMode] = useState(getCurrentColorMode());
  const [availableModes, setAvailableModes] = useState([]);
  const [initialized, setInitialized] = useState(false);
  
  // Use ref to prevent infinite loops
  const initRef = useRef(false);
  
  // Get reference data from hook
  const referenceDataHook = useReferenceData();
  
  const {
    employeeStatuses,
    departments,
    businessFunctions,
    positionGroups,
    employeeTags,
    units,
    jobFunctions,
    loading: refLoading,
    error: refError
  } = referenceDataHook || {};

  // FIXED: Single initialization without loop
  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current || initialized) {
      return;
    }
    
    console.log('COLOR_SELECTOR: Initializing once...');
    
    // Check loading state
    const isLoading = typeof refLoading === 'object' 
      ? Object.values(refLoading || {}).some(loading => loading === true)
      : refLoading;

    if (isLoading) {
      console.log('COLOR_SELECTOR: Still loading, skipping init');
      return;
    }

    // Mark as initialized
    initRef.current = true;
    setInitialized(true);

    // Build modes with current data
    const modes = buildAvailableModes();
    setAvailableModes(modes);
    
    // Initialize color system if we have any data
    if (hasAnyReferenceData()) {
      const referenceData = buildReferenceData();
      initializeColorSystem(referenceData);
    } else {
      // Initialize with fallback
      const fallbackData = {
        positionGroups: [
     
        ],
        departments: [],
        businessFunctions: [],
        employeeStatuses: [],
        employeeTags: []
      };
      initializeColorSystem(fallbackData);
    }
    
    console.log('COLOR_SELECTOR: Initialization completed');
  }, [refLoading]); // Only depend on loading state

  // Separate effect for color mode changes
  useEffect(() => {
    const removeListener = addColorModeListener((newMode) => {
      console.log('COLOR_SELECTOR: Color mode changed to:', newMode);
      setCurrentMode(newMode);
      if (onChange) {
        onChange(newMode);
      }
    });

    return removeListener;
  }, [onChange]);

  // Helper functions
  const hasAnyReferenceData = () => {
    return (
      (positionGroups && positionGroups.length > 0) ||
      (departments && departments.length > 0) ||
      (businessFunctions && businessFunctions.length > 0) ||
      (employeeStatuses && employeeStatuses.length > 0) ||
      (employeeTags && employeeTags.length > 0)
    );
  };

  const buildReferenceData = () => {
    return {
      positionGroups: positionGroups || [],
      departments: departments || [],
      businessFunctions: businessFunctions || [],
      employeeStatuses: employeeStatuses || [],
      employeeTags: employeeTags || [],
      units: units || [],
      jobFunctions: jobFunctions || []
    };
  };

  const buildAvailableModes = () => {
    const modes = [];
    
    // Always add HIERARCHY
    modes.push({ 
      value: 'HIERARCHY', 
      label: 'Position', 
      description: 'Color by position hierarchy',
      icon: '📊',
      count: positionGroups?.length || 'Default'
    });

    if (businessFunctions && businessFunctions.length > 0) {
      modes.push({ 
        value: 'BUSINESS_FUNCTION', 
        label: 'Business Function', 
        description: 'Color by business function',
        icon: '🌐',
        count: businessFunctions.length
      });
    }
    
    if (departments && departments.length > 0) {
      modes.push({ 
        value: 'DEPARTMENT', 
        label: 'Department', 
        description: 'Color by department',
        icon: '🏢',
        count: departments.length
      });
    }
    
    if (jobFunctions && jobFunctions.length > 0) {
      modes.push({ 
        value: 'JOB_FUNCTION', 
        label: 'Job Function', 
        description: 'Color by job function',
        icon: '💼',
        count: jobFunctions.length
      });
    }
    
    if (employeeStatuses && employeeStatuses.length > 0) {
      modes.push({ 
        value: 'STATUS', 
        label: 'Status', 
        description: 'Color by employment status',
        icon: '🏷️',
        count: employeeStatuses.length
      });
    }
 
    
    return modes;
  };

  const handleModeChange = (newMode) => {
    console.log('COLOR_SELECTOR: handleModeChange called with:', newMode);
    
    if (newMode === currentMode) {
      return;
    }
    
    const isAvailable = availableModes.some(mode => mode.value === newMode) || newMode === 'HIERARCHY';
    
    if (!isAvailable) {
      console.warn('COLOR_SELECTOR: Mode not available:', newMode);
      return;
    }
    
    try {
      setColorMode(newMode);
      setCurrentMode(newMode);
      
      if (onChange) {
        onChange(newMode);
      }
      
    } catch (error) {
      console.error('COLOR_SELECTOR: Error changing mode:', error);
      const previousMode = getCurrentColorMode();
      setCurrentMode(previousMode);
    }
  };

  // Theme styles
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Show loading state
  const isLoading = typeof refLoading === 'object' 
    ? Object.values(refLoading || {}).some(loading => loading === true)
    : refLoading;

  if (isLoading || !initialized) {
    return (
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center">
          <Palette size={14} className="mr-2 text-gray-400 animate-pulse" />
          <span className={`text-xs ${textSecondary} mr-2`}>Loading color options...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mb-3">
      <div className="flex items-center">
        <Palette size={14} className="mr-2 text-blue-500" />
        <span className={`text-xs ${textSecondary} mr-2`}>Color employees by:</span>
        {refError && Object.values(refError).some(err => err !== null) && (
          <span className={`text-xs text-orange-600 dark:text-orange-400 mr-2`}>
            (Limited modes)
          </span>
        )}
      </div>
      
      <div className={`flex flex-wrap gap-2 rounded-lg border ${borderColor} ${bgCard} p-2`}>
        {availableModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => handleModeChange(mode.value)}
            className={`
              px-3 py-2 text-xs rounded-md transition-all duration-200 relative
              flex items-center gap-1.5 min-w-fit
              ${currentMode === mode.value
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            title={`${mode.description} (${mode.count} options)`}
          >
            <span className="text-sm">{mode.icon}</span>
            <span className="font-medium">{mode.label}</span>
            <span className={`
              text-xs px-1.5 py-0.5 rounded-full 
              ${currentMode === mode.value 
                ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }
            `}>
              {mode.count}
            </span>
            
            {currentMode === mode.value && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
        {availableModes.find(m => m.value === currentMode)?.description || 'Color by position hierarchy'}
      </div>
    </div>
  );
};

export default ColorSelector;