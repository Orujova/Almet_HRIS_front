// src/components/headcount/HierarchyLegend.jsx - Enhanced with Color Mode Support
"use client";
import { useState, useEffect } from "react";
import { Palette, X, Info } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { getHierarchyLegend, getCurrentColorMode, getColorModes } from "./utils/themeStyles";
import { addColorModeListener } from "./ColorModeSelector";

/**
 * Enhanced hierarchy rəng sisteminin açıqlaması komponenti
 * @returns {JSX.Element} - Hierarchy legend komponenti
 */
const HierarchyLegend = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState(getCurrentColorMode());
  const [legendData, setLegendData] = useState(getHierarchyLegend(darkMode));
  
  // Color mode dəyişikliklərini dinlə və legend data-sını yenilə
  useEffect(() => {
    const removeListener = addColorModeListener((newMode) => {
      console.log('🎨 LEGEND: Color mode changed to:', newMode);
      setCurrentMode(newMode);
      // Legend data-sını yenilə
      setLegendData(getHierarchyLegend(darkMode));
    });

    return removeListener;
  }, [darkMode]);

  // Dark mode dəyişiklik zamanı da legend data-sını yenilə
  useEffect(() => {
    setLegendData(getHierarchyLegend(darkMode));
  }, [darkMode]);

  const colorModes = getColorModes();
  const currentModeData = colorModes.find(mode => mode.value === currentMode);
  
  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const shadowClass = darkMode ? "" : "shadow-lg";

  return (
    <>
      {/* Enhanced Color Guide Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${borderColor} ${bgCard} ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
        >
          <Info size={10} className="mr-1 text-blue-500" />
          {currentModeData?.label || 'Color Guide'}
          <div className="flex items-center ml-1 space-x-0.5">
            {legendData.slice(0, 3).map((level, index) => (
              <div 
                key={`preview-${index}-${level.level}`}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: level.colorHex }}
              ></div>
            ))}
          </div>
        </button>
      </div>

      {/* Enhanced Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-lg ${shadowClass} border ${borderColor} max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Palette className="mr-2 text-blue-500" size={16} />
                <h3 className={`${textPrimary} font-medium text-sm`}>
                  {currentModeData?.label} Colors
                </h3>
                <span className={`ml-2 text-xs ${textMuted} bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full`}>
                  {legendData.length} items
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${textMuted} transition-colors`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Enhanced Content */}
            <div className="p-3">
              <p className={`text-xs ${textMuted} mb-3`}>
                Rows are color-coded by <strong>{currentModeData?.description.toLowerCase()}</strong> using left border colors.
              </p>
              
              {/* Enhanced Legend Items */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {legendData.map((level, index) => (
                  <div 
                    key={`legend-${index}-${level.level}-${currentMode}`}
                    className="flex items-center p-2 rounded-md border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0 border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: level.colorHex }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${textPrimary} truncate`}>
                        {level.level}
                      </div>
                      <div className={`text-xs ${textMuted} truncate`}>
                        {level.description}
                      </div>
                    </div>
                    <div className={`text-xs ${textMuted} ml-2`}>
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Tip */}
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <Info size={12} className="text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                  <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Use the color mode selector to change the classification system. Colors update automatically in the table.
                  </p>
                </div>
              </div>

              {/* Current Mode Info */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={textMuted}>Current mode:</span>
                <span className={`${textSecondary} font-medium`}>
                  {currentModeData?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HierarchyLegend;