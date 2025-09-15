// src/components/headcount/ColorModeSelector.jsx - SIMPLE VERSION, USER SELECTS FIRST
"use client";
import { useState, useEffect, useRef } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useReferenceData } from "../../hooks/useReferenceData";

import { 
  setColorMode, 
  getCurrentColorMode, 
  addColorModeListener, 
  initializeColorSystem,
  getColorModes,
  isColorModeActive
} from "./utils/themeStyles";

const ColorSelector = ({ onChange }) => {
  const { darkMode } = useTheme();
  const [currentMode, setCurrentMode] = useState(getCurrentColorMode());
  const [availableModes, setAvailableModes] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [colorSystemReady, setColorSystemReady] = useState(false);
  
  // Use ref to prevent infinite loops
  const initRef = useRef(false);
  const lastReferenceDataRef = useRef(null);
  
  // Get reference data from hook
  const referenceDataHook = useReferenceData();
  
  const {
    departments,
    businessFunctions,
    positionGroups,
    units,
    jobFunctions,
    loading: refLoading,
    error: refError
  } = referenceDataHook || {};

  // Initialize color system when data is available (but don't set default mode)
  useEffect(() => {

    
    // Prevent multiple initializations
    if (initRef.current || initialized) {
     
      return;
    }
    
    // Check loading state
    const isLoading = typeof refLoading === 'object' 
      ? Object.values(refLoading || {}).some(loading => loading === true)
      : refLoading;

    if (isLoading) {

      return;
    }

    // Check if we have any meaningful reference data
    const hasAnyData = (
      (positionGroups && positionGroups.length > 0) ||
      (departments && departments.length > 0) ||
      (businessFunctions && businessFunctions.length > 0) ||
      (units && units.length > 0) ||
      (jobFunctions && jobFunctions.length > 0)
    );

 

    // Only proceed if we have actual data
    if (!hasAnyData) {
     
      return;
    }

    // Check if reference data has actually changed
    const currentDataSignature = JSON.stringify({
      positionGroups: positionGroups?.length || 0,
      departments: departments?.length || 0,
      businessFunctions: businessFunctions?.length || 0,
      units: units?.length || 0,
      jobFunctions: jobFunctions?.length || 0
    });

    if (lastReferenceDataRef.current === currentDataSignature) {
  
      return;
    }

    // Mark as initialized and store data signature
    initRef.current = true;
    lastReferenceDataRef.current = currentDataSignature;
    setInitialized(true);

  

    try {
      // Build reference data structure
      const referenceData = {
        positionGroups: positionGroups || [],
        departments: departments || [],
        businessFunctions: businessFunctions || [],
        units: units || [],
        jobFunctions: jobFunctions || []
      };
      

      
      // Initialize color system WITHOUT setting default mode
      initializeColorSystem(referenceData);
      
      // Build available modes from actual data
      const modes = getColorModes();
      setAvailableModes(modes);
      setColorSystemReady(true);
      
   
      
    } catch (error) {
      console.error('COLOR_SELECTOR_SIMPLE: Error during initialization:', error);
    }
    
  }, [
    refLoading, 
    positionGroups, 
    departments, 
    businessFunctions, 
    units, 
    jobFunctions,
    initialized
  ]);

  // Color mode change listener
  useEffect(() => {

    
    const removeListener = addColorModeListener((newMode) => {

      setCurrentMode(newMode);
      if (onChange) {
        onChange(newMode);
      }
    });

    return () => {
    
      removeListener();
    };
  }, [onChange]);

  // Update available modes when color system is ready
  useEffect(() => {
    if (colorSystemReady) {
      const modes = getColorModes();
      setAvailableModes(modes);
    
    }
  }, [colorSystemReady]);

  const handleModeChange = (newMode) => {

    
    if (newMode === currentMode) {
  
      return;
    }
    
    const isAvailable = availableModes.some(mode => mode.value === newMode);
    
    if (!isAvailable) {
      console.warn('COLOR_SELECTOR_SIMPLE: Mode not available:', newMode);
      return;
    }
    
    try {
    
      setColorMode(newMode);
      setCurrentMode(newMode);
      
      if (onChange) {
        onChange(newMode);
      }
      

      
    } catch (error) {
      console.error('COLOR_SELECTOR_SIMPLE: Error changing mode:', error);
      const previousMode = getCurrentColorMode();
      setCurrentMode(previousMode);
    }
  };

  const handleClearMode = () => {

    setColorMode(null);
    setCurrentMode(null);
    
    if (onChange) {
      onChange(null);
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

  // Don't show anything if color system is not ready or no modes available
  if (!colorSystemReady || availableModes.length === 0) {
    return null;
  }

  if (isLoading) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Palette size={14} className="mr-2 text-blue-500" />
          <span className={`text-xs ${textSecondary} mr-2`}>
            {isColorModeActive() ? 'Color mode active:' : 'Color employees by:'}
          </span>
          {refError && Object.values(refError).some(err => err !== null) && (
            <span className={`text-xs text-orange-600 dark:text-orange-400 mr-2`}>
              (Limited modes)
            </span>
          )}
        </div>
        
        {/* Clear button when color mode is active */}
        {isColorModeActive() && (
          <button
            onClick={handleClearMode}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Clear Colors
          </button>
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
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm ring-2 ring-blue-200 dark:ring-blue-800'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            title={mode.description}
          >
            <span className="text-sm">
              {mode.value === 'HIERARCHY' && '📊'}
              {mode.value === 'DEPARTMENT' && '🏢'}
              {mode.value === 'BUSINESS_FUNCTION' && '🌐'}
              {mode.value === 'UNIT' && '🏛️'}
              {mode.value === 'JOB_FUNCTION' && '💼'}
              {mode.value === 'GRADE' && '🎯'}
            </span>
            <span className="font-medium">{mode.label}</span>
            
            {currentMode === mode.value && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
      

    </div>
  );
};

export default ColorSelector;