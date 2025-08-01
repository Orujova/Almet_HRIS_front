// src/components/headcount/ColorModeSelector.jsx
"use client";
import { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

// Global color mode state
let globalColorMode = 'HIERARCHY';
const colorModeListeners = new Set();

// Color mode management functions
export const setGlobalColorMode = (mode) => {
  globalColorMode = mode;
  // Notify all listeners
  colorModeListeners.forEach(listener => listener(mode));
  
  // Dispatch custom event for components that use addEventListener
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('colorModeChanged', { 
      detail: { mode } 
    }));
  }
};

export const getCurrentColorMode = () => globalColorMode;

export const addColorModeListener = (listener) => {
  colorModeListeners.add(listener);
  return () => colorModeListeners.delete(listener);
};

/**
 * Color mode selector component with proper state management
 */
const ColorSelector = ({ onChange }) => {
  const { darkMode } = useTheme();
  const [currentMode, setCurrentMode] = useState(globalColorMode);

  // Listen for color mode changes from other instances
  useEffect(() => {
    const removeListener = addColorModeListener((newMode) => {
      setCurrentMode(newMode);
      if (onChange) {
        onChange(newMode);
      }
    });

    return removeListener;
  }, [onChange]);

  const colorModes = [
    { value: 'HIERARCHY', label: 'Hierarchy', icon: '👑' },
    { value: 'DEPARTMENT', label: 'Department', icon: '🏢' },
    { value: 'BUSINESS_FUNCTION', label: 'Business', icon: '🌍' },
    { value: 'GRADE', label: 'Grade', icon: '📊' }
  ];

  const handleModeChange = (newMode) => {
    setGlobalColorMode(newMode);
  };

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex items-center">
        <Palette size={14} className="mr-2 text-blue-500" />
        <span className={`text-xs ${textSecondary} mr-2`}>Color by:</span>
      </div>
      
      <div className={`flex rounded-lg border ${borderColor} ${bgCard} p-0.5`}>
        {colorModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => handleModeChange(mode.value)}
            className={`
              px-2 py-1 text-xs rounded-md transition-colors
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