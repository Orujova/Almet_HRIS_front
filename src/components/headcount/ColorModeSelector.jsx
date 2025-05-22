// src/components/headcount/SimpleColorSelector.jsx
"use client";
import { useState } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { setColorMode, getCurrentColorMode } from "./utils/themeStyles";

/**
 * Sadə rəng rejimi seçici - dropdown olmadan
 */
const ColorSelector = ({ onChange }) => {
  const { darkMode } = useTheme();
  const [currentMode, setCurrentMode] = useState(getCurrentColorMode());

  const colorModes = [
    { value: 'HIERARCHY', label: 'Hierarchy', icon: '👑' },
    { value: 'DEPARTMENT', label: 'Department', icon: '🏢' },
    { value: 'BUSINESS_FUNCTION', label: 'Business', icon: '🌍' },
    { value: 'GRADE', label: 'Grade', icon: '📊' }
  ];

  const handleModeChange = (newMode) => {
    setColorMode(newMode);
    setCurrentMode(newMode);
    
    if (onChange) {
      onChange(newMode);
    }
    
    // Force re-render
    window.dispatchEvent(new CustomEvent('colorModeChanged', { 
      detail: { mode: newMode } 
    }));
  };

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <Palette size={16} className="mr-2 text-blue-500" />
        <span className={`text-sm ${textSecondary} mr-2`}>Color by:</span>
      </div>
      
      <div className={`flex rounded-lg border ${borderColor} ${bgCard} p-1`}>
        {colorModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => handleModeChange(mode.value)}
            className={`
              px-3 py-1 text-xs rounded-md transition-colors
              ${currentMode === mode.value
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            <span className="mr-1">{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;