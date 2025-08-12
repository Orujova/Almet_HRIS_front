// src/components/headcount/ActionsDropdown.jsx - ENHANCED VERSION
"use client";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Tag, Users, FileText, BarChart2, Trash2, UserPlus, TagIcon, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { getThemeStyles } from "./utils/themeStyles";
import Link from "next/link";

/**
 * ENHANCED Actions Dropdown with Better Modal Integration
 * @param {Object} props - Component parameters
 * @param {string} props.employeeId - Employee ID
 * @param {Object} props.employee - Full employee data object
 * @param {Function} props.onAction - Action callback function
 * @param {boolean} props.disabled - Dropdown disabled state
 * @param {boolean} props.showVisibilityToggle - Show org chart visibility toggle
 * @returns {JSX.Element} - Enhanced actions dropdown component
 */
const ActionsDropdown = ({ 
  employeeId, 
  employee = null,
  onAction,
  disabled = false,
  showVisibilityToggle = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  // Handle clicks outside dropdown
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

  // Toggle dropdown menu
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Handle action and close menu
  const handleAction = (action) => {
    setIsOpen(false);
    
    if (onAction) {
      console.log('🔧 ENHANCED DROPDOWN: Triggering action:', {
        employeeId,
        action,
        employeeName: getEmployeeName()
      });
      
      onAction(employeeId, action);
    } else {
      console.warn('⚠️ ENHANCED DROPDOWN: No onAction handler provided');
    }
  };

  // ENHANCED: Safe employee name extraction
  const getEmployeeName = () => {
    if (!employee) return `Employee ${employeeId}`;
    
    return employee.name || 
           employee.employee_name || 
           `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
           `Employee ${employeeId}`;
  };

  // ENHANCED: Get current line manager info
  const getCurrentManager = () => {
    if (!employee) return null;
    
    return {
      name: employee.line_manager_name,
      id: employee.line_manager_id || employee.line_manager_hc_number
    };
  };

  // ENHANCED: Get current tags with safe processing
  const getCurrentTags = () => {
    if (!employee) return [];
    
    const tags = [];
    
    // Process tag_names array
    if (employee.tag_names && Array.isArray(employee.tag_names)) {
      employee.tag_names.forEach((tagItem, idx) => {
        if (typeof tagItem === 'string' && tagItem.trim()) {
          tags.push({ id: `tag_${idx}`, name: tagItem.trim() });
        } else if (typeof tagItem === 'object' && tagItem && tagItem.name) {
          tags.push({ id: tagItem.id || `tag_obj_${idx}`, name: tagItem.name });
        }
      });
    }
    
    // Process full tags array
    if (employee.tags && Array.isArray(employee.tags)) {
      employee.tags.forEach((tag, idx) => {
        if (typeof tag === 'object' && tag && tag.name) {
          // Avoid duplicates
          if (!tags.find(t => t.id === tag.id || t.name === tag.name)) {
            tags.push({ id: tag.id || `tag_full_${idx}`, name: tag.name });
          }
        }
      });
    }
    
    return tags;
  };

  // ENHANCED: Get visibility status
  const isVisibleInOrgChart = () => {
    return employee?.is_visible_in_org_chart !== false;
  };

  const currentManager = getCurrentManager();
  const currentTags = getCurrentTags();
  const employeeName = getEmployeeName();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        disabled={disabled}
        className={`p-1 rounded-full ${styles.hoverBg} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
        aria-label="Employee Actions"
        title={`Actions for ${employeeName}`}
      >
        <MoreVertical size={16} className={styles.textSecondary} />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute right-0 top-full mt-1 z-50 w-64 rounded-md shadow-lg ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } border ring-1 ring-black ring-opacity-5 overflow-hidden`}
          style={{ zIndex: 9999 }}
        >
          <div className="py-1" role="menu">
            {/* ENHANCED: Employee Info Header */}
            <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} bg-gray-50 dark:bg-gray-700/50`}>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">
                {employeeName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ID: {employee?.employee_id || employeeId}
              </div>
            </div>

            {/* View Details */}
            <Link href={`/structure/employee/${employeeId}`}>
              <button
                className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <FileText size={16} className="mr-3 text-blue-500" />
                  <span>View Details</span>
                </div>
              </button>
            </Link>

            {/* Edit Employee */}
            <Link href={`/structure/employee/${employeeId}/edit`}>
              <button
                className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <Edit size={16} className="mr-3 text-green-500" />
                  <span>Edit Employee</span>
                </div>
              </button>
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* ENHANCED: Change Line Manager */}
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
              onClick={() => handleAction("changeManager")}
              title={currentManager?.name ? `Current: ${currentManager.name}` : 'No manager assigned'}
            >
              <div className="flex items-center">
                <UserPlus size={16} className="mr-3 text-indigo-500" />
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span>Change Line Manager</span>
                  {currentManager?.name ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
                      Current: {currentManager.name}
                    </span>
                  ) : (
                    <span className="text-xs text-orange-500 dark:text-orange-400">
                      No manager assigned
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* ENHANCED: Tag Management */}
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
              onClick={() => handleAction("manageTag")}
              title={currentTags.length > 0 ? `${currentTags.length} tags assigned` : 'No tags assigned'}
            >
              <div className="flex items-center">
                <TagIcon size={16} className="mr-3 text-purple-500" />
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span>Manage Tags</span>
                  {currentTags.length > 0 ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{currentTags.length} tag{currentTags.length !== 1 ? 's' : ''}</span>
                      <span className="ml-1">
                        ({currentTags.slice(0, 2).map(tag => tag.name).join(', ')}
                        {currentTags.length > 2 && `, +${currentTags.length - 2}`})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-orange-500 dark:text-orange-400">
                      No tags assigned
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* ENHANCED: Org Chart Visibility Toggle */}
            {showVisibilityToggle && (
              <button
                className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
                onClick={() => handleAction("toggleVisibility")}
                title={isVisibleInOrgChart() ? 'Hide from org chart' : 'Show in org chart'}
              >
                <div className="flex items-center">
                  {isVisibleInOrgChart() ? (
                    <EyeOff size={16} className="mr-3 text-gray-500" />
                  ) : (
                    <Eye size={16} className="mr-3 text-blue-500" />
                  )}
                  <div className="flex flex-col items-start">
                    <span>{isVisibleInOrgChart() ? 'Hide from Org Chart' : 'Show in Org Chart'}</span>
                    <span className={`text-xs ${isVisibleInOrgChart() ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      Currently {isVisibleInOrgChart() ? 'visible' : 'hidden'}
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* ENHANCED: Job Description */}
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
              onClick={() => handleAction("viewJobDescription")}
            >
              <div className="flex items-center">
                <FileText size={16} className="mr-3 text-amber-500" />
                <div className="flex flex-col items-start">
                  <span>Job Description</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    View detailed job info
                  </span>
                </div>
              </div>
            </button>

            {/* ENHANCED: Competency Matrix */}
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
              onClick={() => handleAction("competencyMatrix")}
            >
              <div className="flex items-center">
                <BarChart2 size={16} className="mr-3 text-teal-500" />
                <div className="flex flex-col items-start">
                  <span>Competency Matrix</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Skills assessment
                  </span>
                </div>
              </div>
            </button>

            {/* ENHANCED: Performance Management */}
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
              onClick={() => handleAction("performanceManagement")}
            >
              <div className="flex items-center">
                <BarChart2 size={16} className="mr-3 text-blue-500" />
                <div className="flex flex-col items-start">
                  <span>Performance Management</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Reviews & goals
                  </span>
                </div>
              </div>
            </button>

            {/* ENHANCED: Team Overview (if manager) */}
            {employee?.direct_reports_count > 0 && (
              <button
                className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
                onClick={() => handleAction("viewTeam")}
              >
                <div className="flex items-center">
                  <Users size={16} className="mr-3 text-indigo-500" />
                  <div className="flex flex-col items-start">
                    <span>View Team</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {employee.direct_reports_count} direct report{employee.direct_reports_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </button>
            )}

            {/* Divider before danger zone */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* ENHANCED: Delete Employee */}
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-3 text-sm w-full text-left transition-colors`}
              onClick={() => handleAction("delete")}
            >
              <div className="flex items-center">
                <Trash2 size={16} className="mr-3 text-red-500" />
                <div className="flex flex-col items-start">
                  <span className="text-red-500 dark:text-red-400">Delete Employee</span>
                  <span className="text-xs text-red-400 dark:text-red-500">
                    Permanent action
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown;