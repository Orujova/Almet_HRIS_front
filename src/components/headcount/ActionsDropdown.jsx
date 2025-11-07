// src/components/headcount/ActionsDropdown.jsx - Enhanced with Job Description Modal
"use client";
import { useState, useRef, useEffect } from "react";
import { 
  MoreVertical, Edit, Users, FileText, BarChart2, Trash2, UserPlus, 
  TagIcon, Archive, X, Download, CheckCircle, Clock, Building, 
  Briefcase, Target, Award, Shield, UserCheck, UserX as UserVacant 
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useToast } from "../common/Toast";
import { getThemeStyles } from "./utils/themeStyles";
import { archiveEmployeesService } from "../../services/vacantPositionsService";
import jobDescriptionService from "../../services/jobDescriptionService";
import Link from "next/link";
import { createPortal } from "react-dom";

// Import components
import ConfirmationModal from "../common/ConfirmationModal";

/**
 * Enhanced Actions Dropdown with Portal Rendering and Job Description Modal
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
  
  // Job Description Modal State
  const [showJobDescriptionModal, setShowJobDescriptionModal] = useState(false);
  const [jobDetail, setJobDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
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

  // Theme classes
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-san-juan/30" : "bg-almet-mystic/50";

  // Calculate dropdown position
  const calculatePosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const dropdownWidth = 224;
    const dropdownHeight = 400;
    
    let top = buttonRect.bottom + 4;
    let left = buttonRect.right - dropdownWidth;
    
    if (top + dropdownHeight > viewportHeight) {
      top = buttonRect.top - dropdownHeight - 4;
    }
    
    if (left < 8) {
      left = 8;
    }
    
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

  // Safe employee name extraction
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

  // Get current tags
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
  // JOB DESCRIPTION MODAL FUNCTIONS
  // ========================================

  const fetchJobDescription = async () => {
    try {
      setDetailLoading(true);
      setIsOpen(false); // Close dropdown
      
      // First get employee's job descriptions
      const jobDescriptions = await jobDescriptionService.getEmployeeJobDescriptions(employeeId);
      
      if (!jobDescriptions || jobDescriptions.length === 0) {
        showWarning('No job description found for this employee');
        return;
      }

      // Get the most recent/active job description
      const activeJob = jobDescriptions.find(job => 
        job.status === 'ACTIVE' || job.status === 'APPROVED'
      ) || jobDescriptions[0];

      // Fetch full details
      const detail = await jobDescriptionService.getJobDescription(activeJob.id);
      setJobDetail(detail);
      setShowJobDescriptionModal(true);
    } catch (error) {
      console.error('Error fetching job description:', error);
      showError('Error loading job description. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusDisplay = (job) => {
    const statusInfo = jobDescriptionService.getStatusInfo(job.status);
    let statusColor = '';
    let statusBg = '';
    
    switch (job.status) {
      case 'DRAFT':
        statusColor = 'text-almet-waterloo dark:text-almet-santas-gray';
        statusBg = 'bg-gray-100 dark:bg-almet-comet/30';
        break;
      case 'PENDING_LINE_MANAGER':
      case 'PENDING_EMPLOYEE':
        statusColor = 'text-orange-600 dark:text-orange-400';
        statusBg = 'bg-orange-100 dark:bg-orange-900/20';
        break;
      case 'APPROVED':
      case 'ACTIVE':
        statusColor = 'text-green-600 dark:text-green-400';
        statusBg = 'bg-green-100 dark:bg-green-900/20';
        break;
      case 'REJECTED':
        statusColor = 'text-red-600 dark:text-red-400';
        statusBg = 'bg-red-100 dark:bg-red-900/20';
        break;
      default:
        statusColor = 'text-almet-waterloo dark:text-almet-santas-gray';
        statusBg = 'bg-gray-100 dark:bg-almet-comet/30';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${statusColor} ${statusBg}`}>
        {job.status_display?.status || statusInfo.label}
      </span>
    );
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
  // DELETE ACTION HANDLERS
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
          console.error('Soft delete failed:', error);
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
      message: `⚠️ WARNING: This will permanently delete ${employeeName}`,
      confirmText: 'Continue',
      action: async () => {
        try {
          setIsProcessing(true);
          
          const notes = 'End of contract period - bulk cleanup';
          
          const result = await archiveEmployeesService.bulkHardDeleteEmployees([employeeId], notes, true);
          
          showSuccess(result.message || `${employeeName} permanently deleted successfully`);
          
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
          console.error('Hard delete failed:', error);
          showError(`Failed to delete ${employeeName}: ${error.message || 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  // ========================================
  // ACTION HANDLER
  // ========================================

  const handleAction = (action) => {
    setIsOpen(false);
    
    // Handle job description viewing
    if (action === "viewJobDescription") {
      fetchJobDescription();
      return;
    }
    
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
      onAction(employeeId, action);
    }
  };

  const currentManager = getCurrentManager();
  const currentTags = getCurrentTags();
  const employeeName = getEmployeeName();

  // ========================================
  // DROPDOWN MENU COMPONENT
  // ========================================

  const DropdownMenu = () => (
    <div
      ref={dropdownRef}
      className={`fixed w-56 rounded-md shadow-lg ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border ring-1 ring-black ring-opacity-5 overflow-hidden`}
      style={{ 
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        zIndex: 99999
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

        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

        {/* Job Description - Now opens modal */}
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-3 py-2 text-xs w-full text-left transition-colors`}
          onClick={() => handleAction("viewJobDescription")}
          disabled={detailLoading}
        >
          <div className="flex items-center">
            <FileText size={14} className="mr-2 text-amber-500" />
            <div className="flex flex-col items-start">
              <span>Job Description</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {detailLoading ? 'Loading...' : 'View detailed job info'}
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

        {/* Team Overview */}
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

        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

        {/* Soft Delete */}
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

        {/* Hard Delete */}
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

  // ========================================
  // JOB DESCRIPTION MODAL COMPONENT
  // ========================================

  const JobDescriptionModal = () => {
    if (!showJobDescriptionModal || !jobDetail) return null;

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
        <div className={`${bgCard} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-2xl`}>
          <div className="p-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-almet-comet">
              <div>
                <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>Job Description Details</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusDisplay(jobDetail)}
                  <span className={`text-xs ${textMuted}`}>Created {jobDescriptionService.formatDate(jobDetail.created_at)}</span>
                  <span className={`text-xs ${textMuted}`}>
                    Employee: {jobDescriptionService.getEmployeeDisplayName(jobDetail)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    jobDescriptionService.downloadJobDescriptionPDF(jobDetail.id);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-colors text-xs font-semibold"
                >
                  <Download size={14} />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowJobDescriptionModal(false);
                    setJobDetail(null);
                  }}
                  className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-almet-comet/30`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Job Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Basic Information */}
                <div className={`p-4 ${bgAccent} rounded-xl`}>
                  <h3 className={`text-lg font-bold ${textPrimary} mb-3`}>{jobDetail.job_title}</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Company:</span>
                      <p className={`${textPrimary} mt-1`}>{jobDetail.business_function?.name}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Department:</span>
                      <p className={`${textPrimary} mt-1`}>{jobDetail.department?.name}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Unit:</span>
                      <p className={`${textPrimary} mt-1`}>{jobDetail.unit?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Job Function:</span>
                      <p className={`${textPrimary} mt-1`}>{jobDetail.job_function?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Hierarchy:</span>
                      <p className={`${textPrimary} mt-1`}>{jobDetail.position_group?.display_name || jobDetail.position_group?.name}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Grading Level:</span>
                      <p className={`${textPrimary} mt-1`}>{jobDetail.grading_level || 'N/A'}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Reports To:</span>
                      <p className={`${textPrimary} mt-1`}>{jobDetail.reports_to?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className={`font-semibold ${textMuted}`}>Position Type:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {jobDescriptionService.isVacantPosition(jobDetail) ? (
                          <>
                            <UserVacant size={14} className="text-orange-500" />
                            <span className={`${textPrimary} text-orange-600 dark:text-orange-400 font-semibold`}>Vacant</span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} className="text-green-500" />
                            <span className={`${textPrimary} text-green-600 dark:text-green-400 font-semibold`}>Assigned</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Purpose */}
                <div>
                  <h4 className={`text-base font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
                    <Target size={16} className="text-almet-sapphire" />
                    Job Purpose
                  </h4>
                  <div className={`p-4 ${bgAccent} rounded-xl`}>
                    <p className={`${textSecondary} leading-relaxed text-xs`}>{jobDetail.job_purpose}</p>
                  </div>
                </div>

                {/* Job Sections */}
                {jobDetail.sections && jobDetail.sections.length > 0 && (
                  <div className="space-y-5">
                    {jobDetail.sections.map((section, index) => (
                      <div key={index}>
                        <h4 className={`text-base font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
                          <Briefcase size={16} className="text-almet-sapphire" />
                          {section.title}
                        </h4>
                        <div className={`p-4 ${bgAccent} rounded-xl`}>
                          <div className={`${textSecondary} leading-relaxed whitespace-pre-line text-xs`}>
                            {section.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Approval Status */}
                <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                  <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                    <CheckCircle size={16} className="text-almet-sapphire" />
                    Approval Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${textMuted}`}>Line Manager</span>
                      <span className={`flex items-center gap-2 text-xs font-semibold ${jobDetail.line_manager_approved_at ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {jobDetail.line_manager_approved_at ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {jobDetail.line_manager_approved_at ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${textMuted}`}>Employee</span>
                      <span className={`flex items-center gap-2 text-xs font-semibold ${jobDetail.employee_approved_at ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {jobDetail.employee_approved_at ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {jobDetail.employee_approved_at ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    
                    {jobDetail.line_manager_comments && (
                      <div className="mt-3 p-2.5 bg-gray-50 dark:bg-almet-cloud-burst rounded-lg">
                        <span className={`text-xs font-semibold ${textMuted}`}>Manager Comments:</span>
                        <p className={`text-xs ${textSecondary} mt-1`}>{jobDetail.line_manager_comments}</p>
                      </div>
                    )}
                    {jobDetail.employee_comments && (
                      <div className="mt-3 p-2.5 bg-gray-50 dark:bg-almet-cloud-burst rounded-lg">
                        <span className={`text-xs font-semibold ${textMuted}`}>Employee Comments:</span>
                        <p className={`text-xs ${textSecondary} mt-1`}>{jobDetail.employee_comments}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Action Required */}
                <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                  <h4 className={`font-bold ${textPrimary} mb-2 flex items-center gap-2 text-sm`}>
                    <Target size={16} className="text-almet-sapphire" />
                    Next Action
                  </h4>
                  <p className={`text-xs ${textSecondary} leading-relaxed`}>
                    {jobDescriptionService.getNextAction(jobDetail)}
                  </p>
                </div>

                {/* Required Skills */}
                {jobDetail.required_skills && jobDetail.required_skills.length > 0 && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Award size={16} className="text-almet-sapphire" />
                      Required Skills
                    </h4>
                    <div className="space-y-2">
                      {jobDetail.required_skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between py-0.5">
                          <span className="inline-block bg-blue-100 dark:bg-almet-sapphire/20 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                            {skill.skill_detail?.name || skill.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Resources */}
                {jobDetail.business_resources && jobDetail.business_resources.length > 0 && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Building size={16} className="text-almet-sapphire" />
                      Business Resources
                    </h4>
                    <div className="space-y-1.5">
                      {jobDetail.business_resources.map((resource, index) => (
                        <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                          <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                          {resource.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Access Rights */}
                {jobDetail.access_rights && jobDetail.access_rights.length > 0 && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Shield size={16} className="text-almet-sapphire" />
                      Access Rights
                    </h4>
                    <div className="space-y-1.5">
                      {jobDetail.access_rights.map((access, index) => (
                        <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                          <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                          {access.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company Benefits */}
                {jobDetail.company_benefits && jobDetail.company_benefits.length > 0 && (
                  <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
                    <h4 className={`font-bold ${textPrimary} mb-3 flex items-center gap-2 text-sm`}>
                      <Award size={16} className="text-almet-sapphire" />
                      Company Benefits
                    </h4>
                    <div className="space-y-1.5">
                      {jobDetail.company_benefits.map((benefit, index) => (
                        <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                          <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                          {benefit.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

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

      {/* Job Description Modal */}
      {typeof window !== 'undefined' && <JobDescriptionModal />}

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