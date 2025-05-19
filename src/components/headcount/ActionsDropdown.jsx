"use client";
import { useState, useRef, useEffect } from "react";
import { 
  MoreHorizontal, Edit, Trash2, FileText, ExternalLink, 
  BarChart2, Tag, MessageSquare, Users
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import Link from "next/link";

const ActionsDropdown = ({ employeeId, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const dropdownBg = darkMode ? "bg-gray-800" : "bg-white";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Toggle dropdown
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <MoreHorizontal size={18} />
      </button>
      
      {isOpen && (
        <div className={`absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg ${dropdownBg} ring-1 ring-black ring-opacity-5`}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            <Link href={`/structure/employee/${employeeId}`}>
              <button
                className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              >
                <div className="flex items-center">
                  <ExternalLink size={16} className="mr-2 text-blue-500" />
                  <span>View Details</span>
                </div>
              </button>
            </Link>
            
            <Link href={`/structure/employee/${employeeId}/edit`}>
              <button
                className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              >
                <div className="flex items-center">
                  <Edit size={16} className="mr-2 text-blue-500" />
                  <span>Edit Employee</span>
                </div>
              </button>
            </Link>
            
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => onAction(employeeId, 'addTag')}
            >
              <div className="flex items-center">
                <Tag size={16} className="mr-2 text-green-500" />
                <span>Add Tag</span>
              </div>
            </button>
            
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => onAction(employeeId, 'viewJobDescription')}
            >
              <div className="flex items-center">
                <FileText size={16} className="mr-2 text-purple-500" />
                <span>View Job Description</span>
              </div>
            </button>
            
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => onAction(employeeId, 'performanceMatrix')}
            >
              <div className="flex items-center">
                <BarChart2 size={16} className="mr-2 text-yellow-500" />
                <span>Performance Matrix</span>
              </div>
            </button>
            
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => onAction(employeeId, 'message')}
            >
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-2 text-teal-500" />
                <span>Message Employee</span>
              </div>
            </button>
            
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => onAction(employeeId, 'changeManager')}
            >
              <div className="flex items-center">
                <Users size={16} className="mr-2 text-indigo-500" />
                <span>Change Line Manager</span>
              </div>
            </button>
            
            <button
              className={`${textPrimary} ${hoverBg} block px-4 py-2 text-sm w-full text-left border-t ${borderColor} mt-1 pt-1`}
              onClick={() => onAction(employeeId, 'delete')}
            >
              <div className="flex items-center">
                <Trash2 size={16} className="mr-2 text-red-500" />
                <span className="text-red-500 dark:text-red-400">Delete Employee</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown;