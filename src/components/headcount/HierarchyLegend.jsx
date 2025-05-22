// src/components/headcount/HierarchyLegend.jsx
"use client";
import { useState } from "react";
import { Palette, X } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { getHierarchyLegend, getCurrentColorMode, getColorModes } from "./utils/themeStyles";

/**
 * Hierarchy rəng sisteminin açıqlaması komponenti (Yenilənmiş)
 * @returns {JSX.Element} - Hierarchy legend komponenti
 */
const HierarchyLegend = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentMode = getCurrentColorMode();
  const colorModes = getColorModes();
  const currentModeData = colorModes.find(mode => mode.value === currentMode);
  const hierarchyLevels = getHierarchyLegend(darkMode);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const shadowClass = darkMode ? "" : "shadow-lg";

  return (
    <>
      {/* Color Guide Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg border ${borderColor} ${bgCard} ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
        >
          <Palette size={14} className="mr-2 text-blue-500" />
          {currentModeData?.label || 'Color Guide'}
          <div className="flex items-center ml-2 space-x-1">
            {hierarchyLevels.slice(0, 4).map((level, index) => (
              <div 
                key={index} 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: level.colorHex }}
              ></div>
            ))}
          </div>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-xl ${shadowClass} border ${borderColor} max-w-md w-full max-h-[80vh] overflow-y-auto`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Palette className="mr-2 text-blue-500" size={20} />
                <h3 className={`${textPrimary} font-semibold`}>
                  Color System: {currentModeData?.label}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${textMuted}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className={`text-sm ${textMuted} mb-4`}>
                Employee rows are color-coded by <strong>{currentModeData?.description.toLowerCase()}</strong> using the left border indicator.
              </p>
              
              <div className="space-y-3">
                {hierarchyLevels.map((level, index) => (
                  <div key={index} className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div 
                      className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: level.colorHex }}
                    ></div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${textPrimary}`}>
                        {level.level}
                      </div>
                      <div className={`text-xs ${textMuted}`}>
                        {level.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  💡 Tip: Look for the colored left border on each employee row to quickly identify their category. 
                  You can change the color system using the color mode selector.
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