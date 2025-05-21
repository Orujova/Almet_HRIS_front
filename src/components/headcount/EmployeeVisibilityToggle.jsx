"use client";
import { useState } from "react";
import { useTheme } from "../common/ThemeProvider";
import { Eye, EyeOff } from "lucide-react";

const EmployeeVisibilityToggle = ({ employeeId, initialVisibility = true, onVisibilityChange }) => {
  const [isVisible, setIsVisible] = useState(initialVisibility);
  const { darkMode } = useTheme();

  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    
    if (onVisibilityChange) {
      onVisibilityChange(employeeId, newVisibility);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={toggleVisibility}
        className={`
          flex items-center  text-xs px-2 py-1 rounded 
          ${isVisible 
              ? `${darkMode ? 'bg-blue-800/20 text-blue-200' : 'bg-blue-100 text-blue-700'}`
            : `${darkMode ? 'bg-gray-600/20 text-gray-300' : 'bg-gray-100 text-gray-600'}`
          }
          hover:opacity-80 transition-opacity
        `}
        title={isVisible ? "Visible in org structure" : "Hidden from org structure"}
      >
        {isVisible ? (
          <>
            <Eye size={12} className="mr-1" />
            {/* <span>Visible</span> */}
          </>
        ) : (
          <>
            <EyeOff size={12} className="mr-1" />
            {/* <span>Hidden</span>? */}
          </>
        )}
      </button>
    </div>
  );
};

export default EmployeeVisibilityToggle;
