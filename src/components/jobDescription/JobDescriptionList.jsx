import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Edit, 
  Eye, 
  Trash2, 
  Download, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  UserCheck,
  UserX as UserVacant,
  ChevronDown,
  Filter,
  X,
  Building,
  User,
  Briefcase
} from 'lucide-react';

const JobDescriptionList = ({
  filteredJobs,
  searchTerm,
  selectedDepartment,
  dropdownData,
  onSearchChange,
  onDepartmentChange,
  onJobSelect,
  onJobEdit,
  onJobDelete,
  onDirectSubmission,
  onDownloadPDF,
  actionLoading,
  darkMode
}) => {
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const departmentDropdownRef = useRef(null);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
        setDepartmentSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get unique departments from employee data
  const getUniqueDepartments = () => {
    if (!dropdownData.employees) return [];
    
    const departments = [...new Set(
      dropdownData.employees
        .map(emp => emp.department_name)
        .filter(dept => dept && dept.trim() !== '')
    )];
    
    return departments.sort();
  };

  const uniqueDepartments = getUniqueDepartments();
  const filteredDepartments = uniqueDepartments.filter(dept =>
    dept.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  );

  // Status color and icon functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'PENDING_LINE_MANAGER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'PENDING_EMPLOYEE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'REVISION_REQUIRED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DRAFT':
        return <Edit size={12} />;
      case 'PENDING_LINE_MANAGER':
      case 'PENDING_EMPLOYEE':
        return <Clock size={12} />;
      case 'APPROVED':
        return <CheckCircle size={12} />;
      case 'REJECTED':
        return <XCircle size={12} />;
      case 'REVISION_REQUIRED':
        return <RotateCcw size={12} />;
      default:
        return <AlertCircle size={12} />;
    }
  };

  // Helper functions for employee info
  const getEmployeeInfo = (job) => {
    // Check employee_info from API response
    if (job.employee_info && job.employee_info.name) {
      return {
        type: 'assigned',
        name: job.employee_info.name,
        id: job.employee_info.employee_id || job.employee_info.id,
        phone: job.employee_info.phone,
        email: job.employee_info.email,
        hasEmployee: true
      };
    }
    
    // Check assigned_employee
    if (job.assigned_employee?.full_name) {
      return {
        type: 'assigned',
        name: job.assigned_employee.full_name,
        id: job.assigned_employee.employee_id || job.assigned_employee.id,
        hasEmployee: true
      };
    }
    
    // Vacant position
    return {
      type: 'vacant',
      name: 'Vacant Position',
      hasEmployee: false
    };
  };

  const getManagerInfo = (job) => {
    if (job.manager_info && job.manager_info.name) {
      return job.manager_info.name;
    }
    if (job.reports_to_name) {
      return job.reports_to_name;
    }
    return 'N/A';
  };

  // Event handlers
  const handleDownloadPDF = (jobId, event) => {
    event.stopPropagation();
    if (onDownloadPDF) {
      onDownloadPDF(jobId);
    }
  };

  const handleJobCardClick = (job) => {
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  const handleDirectSubmissionClick = (jobId, event) => {
    event.stopPropagation();
    if (onDirectSubmission) {
      onDirectSubmission(jobId);
    }
  };

  const handleEditClick = (job, event) => {
    event.stopPropagation();
    if (onJobEdit) {
      onJobEdit(job);
    }
  };

  const handleDeleteClick = (jobId, event) => {
    event.stopPropagation();
    if (onJobDelete) {
      onJobDelete(jobId);
    }
  };

  const handleViewClick = (job, event) => {
    event.stopPropagation();
    if (onJobSelect) {
      onJobSelect(job);
    }
  };

  return (
    <>
      {/* Search and Filter Bar */}
      <div className={`${bgCard} rounded-xl p-4 mb-6 border ${borderColor} shadow-sm`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={18} />
            <input
              type="text"
              placeholder="Search job titles, departments, or employees..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-12 pr-4 py-2 border ${borderColor} rounded-xl ${bgCard} ${textPrimary} 
                focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent 
                text-sm transition-all duration-200`}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${textMuted} hover:${textPrimary} 
                  transition-colors`}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Department Filter Dropdown */}
          <div className="relative" ref={departmentDropdownRef}>
            <button
              onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
              className={`flex items-center gap-3 px-4 py-2 border ${borderColor} rounded-xl ${bgCard} ${textPrimary} 
                focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm min-w-[200px] justify-between
                hover:${bgCardHover} transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <Filter size={16} className={textMuted} />
                <span>{selectedDepartment || 'All Departments'}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showDepartmentDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDepartmentDropdown && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${bgCard} border ${borderColor} rounded-xl 
                shadow-lg max-h-64 overflow-hidden z-20`}>
                
                {/* Search input for departments */}
                <div className="p-2 border-b border-gray-200 dark:border-almet-comet">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={12} />
                    <input
                      type="text"
                      placeholder="Search departments..."
                      value={departmentSearchTerm}
                      onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                        focus:outline-none focus:ring-1 focus:ring-almet-sapphire text-xs`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                
                <div className="max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      onDepartmentChange('');
                      setShowDepartmentDropdown(false);
                      setDepartmentSearchTerm('');
                    }}
                    className={`w-full px-4 py-3 text-left hover:${bgCardHover} ${textPrimary} text-xs transition-colors 
                      ${!selectedDepartment ? 'bg-almet-sapphire text-white' : ''}`}
                  >
                    All Departments
                  </button>
                  {filteredDepartments.map(dept => (
                    <button
                      key={dept}
                      onClick={() => {
                        onDepartmentChange(dept);
                        setShowDepartmentDropdown(false);
                        setDepartmentSearchTerm('');
                      }}
                      className={`w-full px-4 py-2 text-left hover:${bgCardHover} ${textPrimary} text-xs transition-colors
                        ${selectedDepartment === dept ? 'bg-almet-sapphire text-white' : ''}`}
                    >
                      {dept}
                    </button>
                  ))}
                  
                  {filteredDepartments.length === 0 && departmentSearchTerm && (
                    <div className="px-4 py-3 text-xs text-gray-500">
                      No departments found for "{departmentSearchTerm}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm overflow-hidden`}>
        <div className="p-6">
          {/* List Header */}
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-almet-comet">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>
                  Job Descriptions
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-almet-sapphire/10 text-almet-sapphire`}>
                  {filteredJobs.length} total
                </span>
              </div>
              {filteredJobs.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Eye size={12} />
                  <span>Click any card to view details</span>
                </div>
              )}
            </div>
          </div>

          {/* Job Cards Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid gap-4">
              {filteredJobs.map(job => {
                const employeeInfo = getEmployeeInfo(job);
                const managerName = getManagerInfo(job);
                
                return (
                  <div 
                    key={job.id} 
                    className={`p-4 ${bgCardHover} rounded-xl border ${borderColor} 
                      hover:shadow-md transition-all duration-200 group hover:scale-[1.01] cursor-pointer
                      hover:border-almet-sapphire/30`}
                    onClick={() => handleJobCardClick(job)}
                  >
                    
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-almet-sapphire text-white p-3 rounded-xl group-hover:scale-110 
                          transition-transform duration-200 flex-shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-bold ${textPrimary} mb-2 group-hover:text-almet-sapphire 
                            transition-colors duration-200 line-clamp-1`}>
                            {job.job_title}
                          </h3>
                          <div className={`text-xs ${textSecondary} space-y-1`}>
                            <div className="flex items-center gap-2">
                              <Building size={12} className={textMuted} />
                              <span>{job.business_function_name}</span>
                              <span className={textMuted}>•</span>
                              <span>{job.department_name}</span>
                              {job.unit_name && (
                                <>
                                  <span className={textMuted}>•</span>
                                  <span>{job.unit_name}</span>
                                </>
                              )}
                            </div>
                            {job.job_function_name && (
                              <div className="flex items-center gap-2">
                                <Briefcase size={12} className={textMuted} />
                                <span>{job.job_function_name}</span>
                                {job.position_group_name && (
                                  <>
                                    <span className={textMuted}>•</span>
                                    <span>{job.position_group_name}</span>
                                    {job.grading_level && (
                                      <span className={`${textMuted} font-mono`}>({job.grading_level})</span>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 
                          ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          {job.status_display?.status || job.status}
                        </span>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleViewClick(job, e)}
                            className="p-2 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg 
                              transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDownloadPDF(job.id, e)}
                            disabled={actionLoading}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg 
                              transition-colors duration-200 disabled:opacity-50"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>
                          {job.status === 'DRAFT' && (
                            <button
                              onClick={(e) => handleDirectSubmissionClick(job.id, e)}
                              disabled={actionLoading}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg 
                                transition-colors duration-200 disabled:opacity-50"
                              title="Submit for Approval"
                            >
                              <Send size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleEditClick(job, e)}
                            disabled={actionLoading}
                            className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg 
                              transition-colors duration-200 disabled:opacity-50"
                            title="Edit Job"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(job.id, e)}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg 
                              transition-colors duration-200 disabled:opacity-50"
                            title="Delete Job"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Employee and Manager Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${textMuted} min-w-[70px]`}>Employee:</span>
                          {employeeInfo.hasEmployee ? (
                            <div className="flex items-center gap-2">
                              <UserCheck size={12} className="text-green-600" />
                              <span className={textPrimary}>{employeeInfo.name}</span>
                              {employeeInfo.id && (
                                <span className={`${textMuted} text-xs`}>({employeeInfo.id})</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <UserVacant size={12} className="text-orange-600" />
                              <span className="text-orange-600 font-medium">Vacant Position</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${textMuted} min-w-[70px]`}>Reports to:</span>
                          <div className="flex items-center gap-2">
                            <User size={12} className={textMuted} />
                            <span className={textPrimary}>{managerName}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${textMuted} min-w-[70px]`}>Created:</span>
                          <span className={textPrimary}>
                            {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${textMuted} min-w-[70px]`}>Version:</span>
                          <span className={textPrimary}>v{job.version || 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Employee Validation Display */}
                    {job.employee_validation && (
                      <div className="mb-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className={`flex items-center gap-2 text-xs ${
                          job.employee_validation.is_valid 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }`}>
                          {job.employee_validation.is_valid ? (
                            <CheckCircle size={12} />
                          ) : (
                            <AlertCircle size={12} />
                          )}
                          <span className="font-medium">
                            {job.employee_validation.message}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Job Purpose Preview */}
                    {job.job_purpose && (
                      <div className="pt-3 border-t border-gray-200 dark:border-almet-comet">
                        <p className={`text-xs ${textMuted} mb-1 font-semibold uppercase tracking-wide`}>
                          Job Purpose
                        </p>
                        <p className={`text-xs ${textSecondary} leading-relaxed line-clamp-2`}>
                          {job.job_purpose.length > 150 
                            ? `${job.job_purpose.substring(0, 150)}...` 
                            : job.job_purpose
                          }
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className={`mx-auto h-20 w-20 ${textMuted} mb-6 flex items-center justify-center 
                bg-gray-100 dark:bg-almet-comet rounded-full`}>
                <FileText size={40} />
              </div>
              <h3 className={`text-xl font-semibold ${textPrimary} mb-3`}>
                No Job Descriptions Found
              </h3>
              <p className={`${textMuted} text-sm max-w-md mx-auto mb-6`}>
                {searchTerm || selectedDepartment 
                  ? 'No job descriptions match your current search criteria. Try adjusting your filters or search terms.' 
                  : 'Get started by creating your first job description. Define positions, responsibilities, and organizational structure.'
                }
              </p>
              {(searchTerm || selectedDepartment) && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    onDepartmentChange('');
                  }}
                  className="px-6 py-3 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
                    transition-colors duration-200 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDescriptionList;