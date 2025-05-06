// src/components/headcount/HeadcountActions.jsx
import { useState, useRef, useEffect } from "react";
import { Edit, Trash2, FileText, Download, MessageSquare } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const HeadcountActions = ({ employeeId, onAction }) => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const dropdownBg = darkMode ? "bg-gray-700" : "bg-white";
  const hoverBg = darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100";

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
    onAction(employeeId, action);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white"
      >
        <span className="sr-only">Actions</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg ${dropdownBg} ring-1 ring-black ring-opacity-5`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("edit")}
            >
              <div className="flex items-center">
                <Edit size={16} className="mr-2" />
                <span>Edit employee</span>
              </div>
            </button>
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("delete")}
            >
              <div className="flex items-center">
                <Trash2 size={16} className="mr-2 text-red-500" />
                <span>Delete employee</span>
              </div>
            </button>
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("addJobDescription")}
            >
              <div className="flex items-center">
                <FileText size={16} className="mr-2" />
                <span>Add job description</span>
              </div>
            </button>
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("export")}
            >
              <div className="flex items-center">
                <Download size={16} className="mr-2" />
                <span>Export employee data</span>
              </div>
            </button>
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("message")}
            >
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-2" />
                <span>Message employee</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadcountActions;
