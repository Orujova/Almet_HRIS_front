// src/components/headcount/ActionsDropdown.jsx - Enhanced with proper z-index and positioning
"use client";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Users, FileText, BarChart2, Trash2, UserPlus, TagIcon, Archive } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useToast } from "../common/Toast";
import { getThemeStyles } from "./utils/themeStyles";
import { archiveEmployeesService } from "../../services/vacantPositionsService";
import Link from "next/link";
import { createPortal } from "react-dom";

// Import components
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Enhanced Actions Dropdown with Portal Rendering and Proper Z-Index
 */
const ActionsDropdown = ({ 
  employeeId, 
  employee = null,
  onAction,
  disabled = false,
  showVisibilityToggle = true,
  onRefresh = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, right: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'default',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null,
    action: null,
    data: null
  });
  
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const styles = getThemeStyles(darkMode);

  // Calculate dropdown position
  const calculatePosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Dropdown dimensions (approximate)
    const dropdownWidth = 224; // w-56 = 224px
    const dropdownHeight = 400; // approximate max height
    
    let top = buttonRect.bottom + 4; // 4px gap
    let left = buttonRect.right - dropdownWidth; // Align right edge
    
    // Check if dropdown would go below viewport
    if (top + dropdownHeight > viewportHeight) {
      top = buttonRect.top - dropdownHeight - 4; // Position above
    }
    
    // Check if dropdown would go outside left edge
    if (left < 8) {
      left = 8; // 8px margin from edge
    }
    
    // Check if dropdown would go outside right edge
    if (left + dropdownWidth > viewportWidth - 8) {
      left = viewportWidth - dropdownWidth - 8;
    }

    setDropdownPosition({ top, left });
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      calculatePosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // ENHANCED: Safe employee name extraction
  const getEmployeeName = () => {
    if (!employee) return `Employee ${employeeId}`;
    
    return employee.name || 
           employee.employee_name || 
           `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
           `Employee ${employeeId}`;
  };

  // Get current line manager info
  const getCurrentManager = () => {
    if (!employee) return null;
    
    return {
      name: employee.line_manager_name,
      id: employee.line_manager_id || employee.line_manager_hc_number
    };
  };

  // Get current tags with safe processing
  const getCurrentTags = () => {
    if (!employee) return [];
    
    const tags = [];
    
    if (employee.tag_names && Array.isArray(employee.tag_names)) {
      employee.tag_names.forEach((tagItem, idx) => {
        if (typeof tagItem === 'string' && tagItem.trim()) {
          tags.push({ id: `tag_${idx}`, name: tagItem.trim() });
        } else if (typeof tagItem === 'object' && tagItem && tagItem.name) {
          tags.push({ id: tagItem.id || `tag_obj_${idx}`, name: tagItem.name });
        }
      });
    }
    
    if (employee.tags && Array.isArray(employee.tags)) {
      employee.tags.forEach((tag, idx) => {
        if (typeof tag === 'object' && tag && tag.name) {
          if (!tags.find(t => t.id === tag.id || t.name === tag.name)) {
            tags.push({ id: tag.id || `tag_full_${idx}`, name: tag.name });
          }
        }
      });
    }
    
    return tags;
  };

  // ========================================
  // CONFIRMATION MODAL HELPERS
  // ========================================

  const openConfirmation = (config) => {
    setConfirmationModal({
      isOpen: true,
      ...config
    });
  };

  const closeConfirmation = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  const executeConfirmedAction = async () => {
    const { action, data } = confirmationModal;
    closeConfirmation();
    
    if (action && typeof action === 'function') {
      await action(data);
    }
  };

  // ========================================
  // ENHANCED DELETE ACTION HANDLERS
  // ========================================

  const handleSoftDelete = async () => {
    const employeeName = getEmployeeName();
    
    openConfirmation({
      type: 'danger',
      title: 'Soft Delete Employee',
      message: `Are you sure you want to soft delete ${employeeName}?`,
      confirmText: 'Soft Delete',
      action: async () => {
        try {
          setIsProcessing(true);
          
          const result = await archiveEmployeesService.bulkSoftDeleteEmployees([employeeId]);
          
         
          
          showSuccess(result.message || `${employeeName} soft deleted successfully`);
          
          // Trigger refresh
          if (onRefresh) {
            await onRefresh();
          } else if (onAction) {
            onAction(employeeId, 'refresh');
          }
          
          if (result.data?.vacant_positions_created > 0) {
            setTimeout(() => {
              showInfo('Vacant position created automatically.');
            }, 1000);
          }
          
        } catch (error) {
          console.error('INDIVIDUAL SOFT DELETE: Operation failed:', error);
          showError(`Failed to soft delete ${employeeName}: ${error.message || 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleHardDelete = async () => {
    const employeeName = getEmployeeName();
    
    openConfirmation({
      type: 'danger',
      title: 'Permanent Deletion Warning',
      message: `⚠️ WARNING: This will permanently delete ${employeeName} `,
      confirmText: 'Continue',
      action: async () => {
        try {
          setIsProcessing(true);
          
          const notes = 'End of contract period - bulk cleanup';
          
          const result = await archiveEmployeesService.bulkHardDeleteEmployees([employeeId], notes, true);
          
          showSuccess(result.message || `${employeeName} permanently deleted successfully`);
          
          // Trigger refresh
          if (onRefresh) {
            await onRefresh();
          } else if (onAction) {
            onAction(employeeId, 'refresh');
          }
          
          if (result.data?.archives_created > 0) {
            setTimeout(() => {
              showInfo('Archive record created for audit purposes.');
            }, 1000);
          }
          
        } catch (error) {
          console.error('INDIVIDUAL HARD DELETE: Operation failed:', error);
          showError(`Failed to delete ${employeeName}: ${error.message || 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  // ========================================
  // ENHANCED ACTION HANDLER
  // ========================================

  const handleAction = (action) => {
    setIsOpen(false);
    
    // Handle delete actions with confirmation modals
    if (action === "softDelete") {
      handleSoftDelete();
      return;
    }
    
    if (action === "hardDelete") {
      handleHardDelete();
      return;
    }
    
    // Handle other actions normally
    if (onAction) {
      console.log('ENHANCED DROPDOWN: Triggering action:', {
        employeeId,
        action,
        employeeName: getEmployeeName()
      });
      
      onAction(employeeId, action);
    } else {
      console.warn('ENHANCED DROPDOWN: No onAction handler provided');
    }
  };

  const currentManager = getCurrentManager();
  const currentTags = getCurrentTags();
  const employeeName = getEmployeeName();

  // Dropdown Menu Component
  const DropdownMenu = () => (
    <div
      ref={dropdownRef}
      className={`fixed w-56 rounded-md shadow-lg ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border ring-1 ring-black ring-opacity-5 overflow-hidden`}
      style={{ 
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        zIndex: 99999 // Very high z-index to appear above everything
      }}
    >
      <div className="py-1" role="menu">
        {/* View Details */}
        <Link href={`/structure/employee/${employeeId}`}>
          <button
            className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <FileText size={14} className="mr-2 text-blue-500" />
              <span>View Details</span>
            </div>
          </button>
        </Link>

        {/* Edit Employee */}
        <Link href={`/structure/employee/${employeeId}/edit`}>
          <button
            className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center">
              <Edit size={14} className="mr-2 text-green-500" />
              <span>Edit Employee</span>
            </div>
          </button>
        </Link>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

        {/* Change Line Manager */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("changeManager")}
          title={currentManager?.name ? `Current: ${currentManager.name}` : 'No manager assigned'}
        >
          <div className="flex items-center">
            <UserPlus size={14} className="mr-2 text-indigo-500" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span>Change Line Manager</span>
              {currentManager?.name ? (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-full">
                  Current: {currentManager.name}
                </span>
              ) : (
                <span className="text-[10px] text-orange-500 dark:text-orange-400">
                  No manager assigned
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Tag Management */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("manageTag")}
          title={currentTags.length > 0 ? `${currentTags.length} tags assigned` : 'No tags assigned'}
        >
          <div className="flex items-center">
            <TagIcon size={14} className="mr-2 text-purple-500" />
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span>Manage Tags</span>
              {currentTags.length > 0 ? (
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{currentTags.length} tag{currentTags.length !== 1 ? 's' : ''}</span>
                  <span className="ml-1">
                    ({currentTags.slice(0, 2).map(tag => tag.name).join(', ')}
                    {currentTags.length > 2 && `, +${currentTags.length - 2}`})
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-orange-500 dark:text-orange-400">
                  No tags assigned
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

        {/* Job Description */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("viewJobDescription")}
        >
          <div className="flex items-center">
            <FileText size={14} className="mr-2 text-amber-500" />
            <div className="flex flex-col items-start">
              <span>Job Description</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                View detailed job info
              </span>
            </div>
          </div>
        </button>

        {/* Competency Matrix */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("competencyMatrix")}
        >
          <div className="flex items-center">
            <BarChart2 size={14} className="mr-2 text-teal-500" />
            <div className="flex flex-col items-start">
              <span>Competency Matrix</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Skills assessment
              </span>
            </div>
          </div>
        </button>

        {/* Performance Management */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("performanceManagement")}
        >
          <div className="flex items-center">
            <BarChart2 size={14} className="mr-2 text-blue-500" />
            <div className="flex flex-col items-start">
              <span>Performance Management</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                Reviews & goals
              </span>
            </div>
          </div>
        </button>

        {/* Team Overview (if manager) */}
        {employee?.direct_reports_count > 0 && (
          <button
            className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
            onClick={() => handleAction("viewTeam")}
          >
            <div className="flex items-center">
              <Users size={14} className="mr-2 text-indigo-500" />
              <div className="flex flex-col items-start">
                <span>View Team</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {employee.direct_reports_count} direct report{employee.direct_reports_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </button>
        )}

        {/* Divider before danger zone */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

        {/* Soft Delete Employee */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("softDelete")}
        >
          <div className="flex items-center">
            <Archive size={14} className="mr-2 text-orange-500" />
            <div className="flex flex-col items-start">
              <span className="text-orange-600 dark:text-orange-400">Soft Delete</span>
              <span className="text-[10px] text-orange-400 dark:text-orange-500">
                Creates vacant position
              </span>
            </div>
          </div>
        </button>

        {/* Hard Delete Employee */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("hardDelete")}
        >
          <div className="flex items-center">
            <Trash2 size={14} className="mr-2 text-red-500" />
            <div className="flex flex-col items-start">
              <span className="text-red-500 dark:text-red-400">Permanent Delete</span>
              <span className="text-[10px] text-red-400 dark:text-red-500">
                Cannot be undone
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          disabled={disabled || isProcessing}
          className={`p-1 rounded-full ${styles.hoverBg} ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
          aria-label="Employee Actions"
          title={`Actions for ${employeeName}`}
        >
          <MoreVertical size={14} className={styles.textSecondary} />
        </button>

        {/* Portal render dropdown to body for proper z-index */}
        {isOpen && !disabled && !isProcessing && typeof window !== 'undefined' && 
          createPortal(<DropdownMenu />, document.body)}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmation}
        onConfirm={executeConfirmedAction}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        loading={isProcessing}
        darkMode={darkMode}
      />
    </>
  );
};

export default ActionsDropdown;