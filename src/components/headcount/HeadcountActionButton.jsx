// src/components/headcount/HeadcountActionButton.jsx
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Download,
  Settings,
  Lock,
  RefreshCw,
  Check,
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const HeadcountActionButton = ({ onAction }) => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Theme-dependent classes
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const dropdownBg = darkMode ? "bg-gray-700" : "bg-white";
  const hoverBg = darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAction = (action) => {
    onAction(action);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md flex items-center`}
        onClick={toggleDropdown}
      >
        <ChevronDown size={16} className="mr-2" />
        Filter and more
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg ${dropdownBg} ring-1 ring-black ring-opacity-5 border ${borderColor}`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("download")}
            >
              <div className="flex items-center">
                <Download size={16} className="mr-2" />
                <span>Download HC Report</span>
              </div>
            </button>
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("settings")}
            >
              <div className="flex items-center">
                <Settings size={16} className="mr-2" />
                <span>HC Table Settings</span>
              </div>
            </button>
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("access")}
            >
              <div className="flex items-center">
                <Lock size={16} className="mr-2" />
                <span>Manage Access Rights</span>
              </div>
            </button>
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("refresh")}
            >
              <div className="flex items-center">
                <RefreshCw size={16} className="mr-2" />
                <span>Refresh Table Data</span>
              </div>
            </button>
            <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
              HC Visibility
            </div>
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("toggleVisibility")}
            >
              <div className="flex items-center justify-between">
                <span>Show inactive employees</span>
                <Check size={16} className="text-green-500" />
              </div>
            </button>
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("toggleContractors")}
            >
              <div className="flex items-center justify-between">
                <span>Show contractors</span>
                <Check size={16} className="text-green-500" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadcountActionButton;
