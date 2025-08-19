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
  X
} from 'lucide-react';

const JobDescriptionList = ({
  filteredJobs,
  selectedJobs,
  searchTerm,
  selectedDepartment,
  dropdownData,
  onSearchChange,
  onDepartmentChange,
  onJobSelect,
  onJobView,
  onJobEdit,
  onJobDelete,
  onDirectSubmission,
  onToggleSelection,
  onSelectAll,
  onBulkExport,
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

  // Filter departments based on search term
  const filteredDepartments = dropdownData.departments?.filter(dept =>
    dept.name?.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  ) || [];

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

  return (
    <>
      {/* Enhanced Search and Filter Bar */}
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
          
          {/* Department Filter Dropdown with Search */}
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
                      key={dept.id}
                      onClick={() => {
                        onDepartmentChange(dept.name);
                        setShowDepartmentDropdown(false);
                        setDepartmentSearchTerm('');
                      }}
                      className={`w-full px-4 py-2 text-left hover:${bgCardHover} ${textPrimary} text-xs transition-colors
                        ${selectedDepartment === dept.name ? 'bg-almet-sapphire text-white' : ''}`}
                    >
                      {dept.name}
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
          
          {/* Bulk Selection Controls */}
          {selectedJobs.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-almet-sapphire/10 border border-almet-sapphire/20 
              rounded-xl">
              <span className={`text-sm font-medium text-almet-sapphire`}>
                {selectedJobs.length} selected
              </span>
              <button
                onClick={() => {
                  if (selectedJobs.length === 0) {
                    alert('Please select at least one job description first.');
                    return;
                  }
                  onBulkExport();
                }}
                className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg text-xs font-medium 
                  hover:bg-almet-astral transition-colors duration-200"
              >
                Export Selected
              </button>
              <button
                onClick={() => onSelectAll()}
                className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-medium 
                  hover:bg-gray-600 transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Job List */}
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm overflow-hidden`}>
        <div className="p-6">
          {/* Select All Header */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-almet-comet">
            <input
              type="checkbox"
              checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
              onChange={onSelectAll}
              className="text-almet-sapphire focus:ring-almet-sapphire rounded"
            />
            <span className={`text-xs font-semibold ${textSecondary}`}>
              Select All ({filteredJobs.length} jobs)
            </span>
            {selectedJobs.length > 0 && (
              <span className={`text-xs ${textMuted}`}>
                {selectedJobs.length} selected for bulk export
              </span>
            )}
            {filteredJobs.length > 0 && (
              <span className={`text-xs ${textMuted} ml-auto`}>
                Click on any job card to view details
              </span>
            )}
          </div>

          {/* Job Cards Grid */}
          <div className="grid gap-4">
            {filteredJobs.map(job => (
              <div 
                key={job.id} 
                className={`p-4 ${bgCardHover} rounded-xl border ${borderColor} 
                  hover:shadow-md transition-all duration-200 group hover:scale-[1.02] cursor-pointer`}
                onClick={() => handleJobCardClick(job)}
              >
                
                {/* Job Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelection(job.id);
                      }}
                      className="text-almet-sapphire focus:ring-almet-sapphire rounded"
                    />
                    <div className="bg-almet-sapphire text-white p-2 rounded-xl group-hover:scale-110 
                      transition-transform duration-200">
                      <FileText size={14} />
                    </div>
                    <div>
                      <h3 className={`text-xs font-semibold ${textPrimary} mb-1 group-hover:text-almet-sapphire 
                        transition-colors duration-200`}>
                        {job.job_title}
                      </h3>
                      <p className={`text-xs ${textSecondary} flex items-center gap-2`}>
                        <span>{job.business_function_name}</span>
                        <span className={textMuted}>•</span>
                        <span>{job.department_name}</span>
                        {job.job_function_name && (
                          <>
                            <span className={textMuted}>•</span>
                            <span>{job.job_function_name}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 
                      ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      {job.status_display?.status || job.status}
                    </span>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onJobSelect(job);
                        }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onDirectSubmission(job.id);
                          }}
                          disabled={actionLoading}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg 
                            transition-colors duration-200 disabled:opacity-50"
                          title="Submit for Approval"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onJobEdit(job);
                        }}
                        disabled={actionLoading}
                        className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg 
                          transition-colors duration-200 disabled:opacity-50"
                        title="Edit Job"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onJobDelete(job.id);
                        }}
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
                
                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${textMuted} min-w-[80px]`}>Employee:</span>
                    {job.employee_info?.name ? (
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-green-600" />
                        <span className={textPrimary}>{job.employee_info.name}</span>
                      </div>
                    ) : job.manual_employee_name ? (
                      <div className="flex items-center gap-2">
                        <UserCheck size={14} className="text-blue-600" />
                        <span className={textPrimary}>{job.manual_employee_name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserVacant size={14} className="text-orange-600" />
                        <span className="text-orange-600 font-medium">Vacant Position</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${textMuted} min-w-[80px]`}>Reports to:</span>
                    <span className={textPrimary}>{job.manager_info?.name || 'N/A'}</span>
                  </div>
                 
                </div>

                {/* Job Purpose Preview */}
                {job.job_purpose && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-almet-comet">
                    <p className={`text-xs ${textMuted} mb-1 font-medium`}>Job Purpose:</p>
                    <p className={`text-xs ${textSecondary} line-clamp-2`}>
                      {job.job_purpose.length > 120 
                        ? `${job.job_purpose.substring(0, 120)}...` 
                        : job.job_purpose
                      }
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className={`mx-auto h-16 w-16 ${textMuted} mb-4 flex items-center justify-center 
                bg-gray-100 dark:bg-almet-comet rounded-full`}>
                <FileText size={32} />
              </div>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>No Job Descriptions Found</h3>
              <p className={`${textMuted} text-sm max-w-md mx-auto`}>
                {searchTerm || selectedDepartment 
                  ? 'Try adjusting your search criteria or filters to find what you\'re looking for.' 
                  : 'Create your first job description to get started with managing positions in your organization.'
                }
              </p>
              {(searchTerm || selectedDepartment) && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    onDepartmentChange('');
                  }}
                  className="mt-4 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
                    transition-colors duration-200 text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Selection Summary */}
          {selectedJobs.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-almet-comet">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSecondary}`}>
                  {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''} selected for bulk operations
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedJobs.length === 0) {
                        alert('Please select at least one job description first.');
                        return;
                      }
                      onBulkExport();
                    }}
                    className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg text-xs font-medium 
                      hover:bg-almet-astral transition-colors duration-200"
                  >
                    Export Selected as PDF
                  </button>
                  <button
                    onClick={onSelectAll}
                    className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-medium 
                      hover:bg-gray-600 transition-colors duration-200"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDescriptionList;