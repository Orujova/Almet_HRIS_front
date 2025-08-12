// src/components/headcount/EmployeeVisibilityToggle.jsx - ENHANCED with Better UX
"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../common/ThemeProvider";
import { Eye, EyeOff, Loader } from "lucide-react";

const EmployeeVisibilityToggle = ({ 
  employeeId, 
  initialVisibility = true, 
  onVisibilityChange,
  disabled = false,
  showLabel = false,
  size = "sm",
  className = "",
  // New props for better state management
  isLoading = false,
  showTooltip = true,
  confirmToggle = false
}) => {
  const [isVisible, setIsVisible] = useState(initialVisibility);
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { darkMode } = useTheme();

  // Sync with prop changes
  useEffect(() => {
    setIsVisible(initialVisibility);
  }, [initialVisibility]);

  // Size configurations
  const sizeConfig = {
    xs: {
      button: "px-1.5 py-0.5 text-xs",
      icon: 10,
      text: "text-xs"
    },
    sm: {
      button: "px-2 py-1 text-xs",
      icon: 12,
      text: "text-xs"
    },
    md: {
      button: "px-3 py-1.5 text-sm",
      icon: 14,
      text: "text-sm"
    },
    lg: {
      button: "px-4 py-2 text-base",
      icon: 16,
      text: "text-base"
    }
  };

  const config = sizeConfig[size] || sizeConfig.sm;

  const toggleVisibility = async () => {
    if (disabled || isToggling || isLoading) return;

    // Show confirmation dialog if required
    if (confirmToggle && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsToggling(true);
    setShowConfirmation(false);

    try {
      const newVisibility = !isVisible;
      
      // Optimistic update
      setIsVisible(newVisibility);
      
      if (onVisibilityChange) {
        await onVisibilityChange(employeeId, newVisibility);
      }
    } catch (error) {
      // Revert on error
      setIsVisible(!isVisible);
      console.error('Failed to toggle visibility:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleConfirm = () => {
    toggleVisibility();
  };

  // Theme classes
  const getButtonClasses = () => {
    const baseClasses = `
      flex items-center rounded transition-all duration-200 
      ${config.button} ${className}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;

    if (isVisible) {
      return `${baseClasses} ${
        darkMode 
          ? 'bg-emerald-800/30 text-emerald-200 border border-emerald-700/50 hover:bg-emerald-700/40' 
          : 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
      }`;
    } else {
      return `${baseClasses} ${
        darkMode 
          ? 'bg-gray-600/30 text-gray-300 border border-gray-600/50 hover:bg-gray-600/40' 
          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
      }`;
    }
  };

  const getTooltipText = () => {
    if (isToggling) return "Updating...";
    return isVisible 
      ? "Click to hide from org structure" 
      : "Click to show in org structure";
  };

  const getStatusText = () => {
    if (isToggling) return "Updating...";
    return isVisible ? "Visible" : "Hidden";
  };

  // Confirmation dialog
  if (showConfirmation) {
    return (
      <div className="relative">
        <div className={`
          absolute z-50 -top-16 left-1/2 transform -translate-x-1/2
          p-3 rounded-lg shadow-lg border
          ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}
          min-w-max
        `}>
          <p className={`text-xs mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {isVisible ? 'Hide from org chart?' : 'Show in org chart?'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className={`px-2 py-1 text-xs rounded ${
                darkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Yes
            </button>
            <button
              onClick={handleCancel}
              className={`px-2 py-1 text-xs rounded ${
                darkMode 
                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-700' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
        
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleCancel}
        />
        
        {/* Original button (disabled during confirmation) */}
        <button
          className={`${getButtonClasses()} opacity-50`}
          disabled
          title={getTooltipText()}
        >
          {(isToggling || isLoading) ? (
            <Loader size={config.icon} className="mr-1 animate-spin" />
          ) : isVisible ? (
            <Eye size={config.icon} className="mr-1" />
          ) : (
            <EyeOff size={config.icon} className="mr-1" />
          )}
          {showLabel && (
            <span className={config.text}>{getStatusText()}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={toggleVisibility}
        disabled={disabled || isToggling || isLoading}
        className={getButtonClasses()}
        title={showTooltip ? getTooltipText() : undefined}
        aria-label={`${isVisible ? 'Hide' : 'Show'} employee in org chart`}
      >
        {(isToggling || isLoading) ? (
          <Loader size={config.icon} className="mr-1 animate-spin" />
        ) : isVisible ? (
          <Eye size={config.icon} className="mr-1" />
        ) : (
          <EyeOff size={config.icon} className="mr-1" />
        )}
        
        {showLabel && (
          <span className={config.text}>{getStatusText()}</span>
        )}
      </button>
    </div>
  );
};

export default EmployeeVisibilityToggle;