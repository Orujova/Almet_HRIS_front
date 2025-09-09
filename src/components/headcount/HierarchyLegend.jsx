// src/components/headcount/HierarchyLegend.jsx - FIXED IMPORTS
"use client";
import { useState, useEffect } from "react";
import { Palette, X, Info } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

// FIXED: Correct imports from themeStyles
import { 
  getHierarchyLegend, 
  getCurrentColorMode, 
  addColorModeListener,
  getColorModes 
} from "./utils/themeStyles";

/**
 * Hierarchy legend component with corrected imports
 */
const HierarchyLegend = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState(getCurrentColorMode());
  
  // FIXED: Color mode change listener with proper error handling
  useEffect(() => {
    let removeListener;
    
    try {
      removeListener = addColorModeListener((newMode) => {
        console.log('HIERARCHY_LEGEND: Color mode changed to:', newMode);
        setCurrentMode(newMode);
      });
    } catch (error) {
      console.error('HIERARCHY_LEGEND: Error setting up listener:', error);
    }

    return () => {
      if (removeListener && typeof removeListener === 'function') {
        try {
          removeListener();
        } catch (error) {
          console.error('HIERARCHY_LEGEND: Error removing listener:', error);
        }
      }
    };
  }, []);

  // Get available modes with error handling
  const getAvailableModes = () => {
    try {
      return getColorModes();
    } catch (error) {
      console.error('HIERARCHY_LEGEND: Error getting color modes:', error);
      return [{ value: 'HIERARCHY', label: 'Position Hierarchy', description: 'Color by job level' }];
    }
  };

  const colorModes = getAvailableModes();
  const currentModeData = colorModes.find(mode => mode.value === currentMode) || colorModes[0];

  // Get hierarchy levels with error handling
  const getHierarchyLevels = () => {
    try {
      return getHierarchyLegend(darkMode);
    } catch (error) {
      console.error('HIERARCHY_LEGEND: Error getting hierarchy legend:', error);
      return [];
    }
  };

  const hierarchyLevels = getHierarchyLevels();

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const shadowClass = darkMode ? "" : "shadow-lg";

  return (
    <>
      {/* Compact Color Guide Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${borderColor} ${bgCard} ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
        >
          <Info size={10} className="mr-1 text-blue-500" />
          {currentModeData?.label || 'Color Guide'}
          <div className="flex items-center ml-1 space-x-0.5">
            {hierarchyLevels.slice(0, 3).map((level, index) => (
              <div 
                key={index} 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: level.colorHex || '#6b7280' }}
              ></div>
            ))}
          </div>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-lg ${shadowClass} border ${borderColor} max-w-md w-full max-h-[100vh] overflow-y-auto`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Palette className="mr-2 text-blue-500" size={16} />
                <h3 className={`${textPrimary} font-medium text-sm`}>
                  {currentModeData?.label || 'Color'} Guide
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${textMuted}`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-3">
              <p className={`text-xs ${textMuted} mb-3`}>
                Rows are color-coded by <strong>{currentModeData?.description?.toLowerCase() || 'position hierarchy'}</strong> using left border colors.
              </p>
              
              {hierarchyLevels.length > 0 ? (
                <div className="space-y-2">
                  {hierarchyLevels.map((level, index) => (
                    <div key={index} className="flex items-center p-2 rounded-md border border-gray-100 dark:border-gray-700">
                      <div 
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: level.colorHex || '#6b7280' }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${textPrimary} truncate`}>
                          {level.level || 'Unknown'}
                        </div>
                        <div className={`text-xs ${textMuted} truncate`}>
                          {level.description || level.level || 'No description'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <div className={`text-xs ${textMuted}`}>
                    No color data available. Color system may still be loading.
                  </div>
                </div>
              )}

              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  💡 Use the color mode selector to change the classification system.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HierarchyLegend;