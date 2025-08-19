// components/headcount/EmployeeDetailJobDescriptions.jsx - Fixed API Response Handling
'use client'
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User,
  Plus,
  Eye,
  Users,
  Calendar,
  RotateCcw,
  CheckSquare,
  Download,
  X,
  Building,
  Briefcase,
  Target,
  Award,
  Settings,
  Shield,
  Search,
  Filter,
  ChevronDown,
  UserCheck,
  UserX as UserVacant,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import jobDescriptionService from '@/services/jobDescriptionService';

const EmployeeDetailJobDescriptions = ({ employeeId, isManager = false }) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [myJobDescriptions, setMyJobDescriptions] = useState([]);
  const [teamJobDescriptions, setTeamJobDescriptions] = useState([]);
  const [filteredTeamJobs, setFilteredTeamJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetail, setJobDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my-jobs');

  // Team Job Descriptions - Enhanced State for Large Data
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [teamStatusFilter, setTeamStatusFilter] = useState('');
  const [teamDepartmentFilter, setTeamDepartmentFilter] = useState('');
  const [teamCurrentPage, setTeamCurrentPage] = useState(1);
  const [teamItemsPerPage] = useState(6); // Show 6 items per page
  const [teamViewMode, setTeamViewMode] = useState('grid'); // 'grid' or 'list'

  // Theme classes
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  useEffect(() => {
    fetchJobDescriptions();
  }, [employeeId]);

  // Filter team jobs when search/filter criteria change
  useEffect(() => {
    if (Array.isArray(teamJobDescriptions) && teamJobDescriptions.length > 0) {
      filterTeamJobs();
    }
  }, [teamJobDescriptions, teamSearchTerm, teamStatusFilter, teamDepartmentFilter]);

  const fetchJobDescriptions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching job descriptions for employee:', employeeId);
      
      // Always fetch employee's own job descriptions
      const myJobsResponse = await jobDescriptionService.getEmployeeJobDescriptions(employeeId);
      console.log('📋 My jobs response:', myJobsResponse);
      
      // Handle different response structures
      const myJobs = Array.isArray(myJobsResponse) 
        ? myJobsResponse 
        : (myJobsResponse?.job_descriptions || myJobsResponse?.results || []);
      
      setMyJobDescriptions(myJobs);
      
      // If manager, also fetch team job descriptions
      if (isManager) {
        const teamJobsResponse = await jobDescriptionService.getTeamJobDescriptions(employeeId);
        console.log('👥 Team jobs response:', teamJobsResponse);
        
        // Handle different response structures for team jobs
        let teamJobs = [];
        if (Array.isArray(teamJobsResponse)) {
          teamJobs = teamJobsResponse;
        } else if (teamJobsResponse?.job_descriptions) {
          teamJobs = teamJobsResponse.job_descriptions;
        } else if (teamJobsResponse?.results) {
          teamJobs = teamJobsResponse.results;
        } else if (typeof teamJobsResponse === 'object' && teamJobsResponse !== null) {
          // If it's an object, try to extract data from it
          teamJobs = Object.values(teamJobsResponse).find(value => Array.isArray(value)) || [];
        }
        
        console.log('📊 Processed team jobs:', teamJobs);
        setTeamJobDescriptions(teamJobs);
      }
    } catch (error) {
      console.error('❌ Error fetching job descriptions:', error);
      setMyJobDescriptions([]);
      setTeamJobDescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTeamJobs = () => {
    // Ensure teamJobDescriptions is an array
    const jobsArray = Array.isArray(teamJobDescriptions) ? teamJobDescriptions : [];
    let filtered = [...jobsArray];

    // Search filter
    if (teamSearchTerm) {
      filtered = filtered.filter(job =>
        job.job_title?.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
        job.employee_name?.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
        job.department?.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
        job.department_name?.toLowerCase().includes(teamSearchTerm.toLowerCase())
      );
    }

    // Status filter
    if (teamStatusFilter) {
      filtered = filtered.filter(job => job.status === teamStatusFilter);
    }

    // Department filter
    if (teamDepartmentFilter) {
      filtered = filtered.filter(job => 
        job.department === teamDepartmentFilter || 
        job.department_name === teamDepartmentFilter
      );
    }

    setFilteredTeamJobs(filtered);
    setTeamCurrentPage(1); // Reset to first page when filtering
  };

  const fetchJobDetail = async (jobId) => {
    try {
      setDetailLoading(true);
      const detail = await jobDescriptionService.getJobDescription(jobId);
      setJobDetail(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching job detail:', error);
      alert('Error loading job description details. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

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
        return <FileText size={16} />;
      case 'PENDING_LINE_MANAGER':
      case 'PENDING_EMPLOYEE':
        return <Clock size={16} />;
      case 'APPROVED':
        return <CheckCircle size={16} />;
      case 'REJECTED':
        return <XCircle size={16} />;
      case 'REVISION_REQUIRED':
        return <RotateCcw size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleApproval = async (jobDescriptionId, action) => {
    try {
      setActionLoading(true);
      
      if (action === 'approve_manager') {
        await jobDescriptionService.approveByLineManager(jobDescriptionId, {
          comments
        });
      } else if (action === 'approve_employee') {
        await jobDescriptionService.approveAsEmployee(jobDescriptionId, {
          comments
        });
      } else if (action === 'reject') {
        await jobDescriptionService.rejectJobDescription(jobDescriptionId, {
          reason: comments
        });
      }
      
      // Refresh data
      await fetchJobDescriptions();
      setShowApprovalModal(false);
      setComments('');
      alert('Action completed successfully!');
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Error processing request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const openApprovalModal = (job, type) => {
    setSelectedJob(job);
    setApprovalType(type);
    setShowApprovalModal(true);
    setComments('');
  };

  // Safe array conversion and unique value extraction
  const safeTeamJobsArray = Array.isArray(teamJobDescriptions) ? teamJobDescriptions : [];

  // Get unique departments for filter
  const uniqueDepartments = [...new Set(
    safeTeamJobsArray.map(job => job.department || job.department_name).filter(Boolean)
  )];

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(
    safeTeamJobsArray.map(job => job.status).filter(Boolean)
  )];

  // Pagination for team jobs
  const teamTotalPages = Math.ceil(filteredTeamJobs.length / teamItemsPerPage);
  const teamPaginatedJobs = filteredTeamJobs.slice(
    (teamCurrentPage - 1) * teamItemsPerPage,
    teamCurrentPage * teamItemsPerPage
  );

  const JobDescriptionCard = ({ job, showManagerActions = false, compact = false }) => {
    // Debug job data only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🃏 Job card data:', job);
      console.log('🛠️ Show manager actions:', showManagerActions);
    }
    
    // Check approval permissions
    const canApproveManager = job.can_approve_as_line_manager || job.can_approve || false;
    const canApproveEmployee = job.can_approve_as_employee || job.can_approve || false;
    const showManagerApproval = showManagerActions && 
      (job.status === 'PENDING_LINE_MANAGER' || job.status === 'PENDING_APPROVAL') && 
      canApproveManager;
    const showEmployeeApproval = !showManagerActions && 
      job.status === 'PENDING_EMPLOYEE' && 
      canApproveEmployee;
    
    return (
      <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor} hover:shadow-sm transition-all relative`}>
        {/* Status Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-almet-sapphire text-white p-2 rounded-lg flex-shrink-0">
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold ${textPrimary} mb-1 truncate`} title={job.job_title}>
                {job.job_title}
              </h3>
              <p className={`text-xs ${textSecondary} mb-2 truncate`}>
                {job.business_function || job.business_function_name} • {job.department || job.department_name}
              </p>
              <div className={`flex items-center gap-2 text-xs ${textMuted} mb-2`}>
                {job.is_vacant_position || (!job.employee_name && !job.assigned_employee_name && !job.manual_employee_name) ? (
                  <div className="flex items-center gap-1">
                    <UserVacant size={12} className="text-orange-600" />
                    <span className="text-orange-600">Vacant Position</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <UserCheck size={12} className="text-green-600" />
                    <span className="truncate max-w-[150px]">
                      {showManagerActions ? (
                        job.employee_name || job.assigned_employee_name || job.manual_employee_name
                      ) : (
                        `Reports to: ${job.reports_to_name || job.manager_info?.name || 'N/A'}`
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(job.status)}`}>
              {getStatusIcon(job.status)}
              <span className="text-xs">
                {job.status_display?.status || job.status_display || job.status}
              </span>
            </span>
            
            {/* Urgent badge */}
            {job.urgency === 'high' && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                Urgent
              </span>
            )}
            
            {/* Approval needed badge */}
            {(showManagerApproval || showEmployeeApproval) && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Approval Needed
              </span>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-3 mb-4">
          {/* Job Purpose */}
          <div>
            <h4 className={`text-xs font-medium ${textSecondary} mb-1`}>Job Purpose</h4>
            <p className={`text-xs ${textMuted} line-clamp-2`}>
              {job.job_purpose || 'No job purpose provided.'}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className={`font-medium ${textMuted}`}>Version:</span>
              <span className={`ml-1 ${textPrimary}`}>{job.version || 1}</span>
            </div>
            <div>
              <span className={`font-medium ${textMuted}`}>Created:</span>
              <span className={`ml-1 ${textPrimary}`}>
                {formatDate(job.created_at)}
              </span>
            </div>
          </div>

          {/* Approval Status Grid */}
          <div className={`grid grid-cols-2 gap-3 p-2 ${bgCard} rounded-lg text-xs`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${textMuted}`}>Manager:</span>
              <span className={`flex items-center gap-1 ${job.line_manager_approved_at ? 'text-green-600' : 'text-yellow-600'}`}>
                {job.line_manager_approved_at ? <CheckCircle size={10} /> : <Clock size={10} />}
                <span className="text-xs">{job.line_manager_approved_at ? 'Approved' : 'Pending'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${textMuted}`}>Employee:</span>
              <span className={`flex items-center gap-1 ${job.employee_approved_at ? 'text-green-600' : 'text-yellow-600'}`}>
                {job.employee_approved_at ? <CheckCircle size={10} /> : <Clock size={10} />}
                <span className="text-xs">{job.employee_approved_at ? 'Approved' : 'Pending'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-almet-comet">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fetchJobDetail(job.id)}
              disabled={detailLoading}
              className="flex items-center gap-1 px-2 py-1 text-almet-sapphire hover:bg-almet-sapphire/10 rounded transition-colors text-xs disabled:opacity-50"
            >
              <Eye size={12} />
              {detailLoading ? 'Loading...' : 'View'}
            </button>
            <button 
              onClick={() => {
                jobDescriptionService.downloadJobDescriptionPDF(job.id);
              }}
              className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-xs"
            >
              <Download size={12} />
              PDF
            </button>
          </div>

          {/* Approval Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Manager Approval Buttons */}
            {showManagerApproval && (
              <>
                <button
                  onClick={() => openApprovalModal(job, 'approve_manager')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
                  title="Approve as Line Manager"
                >
                  <CheckSquare size={12} />
                  Approve
                </button>
                <button
                  onClick={() => openApprovalModal(job, 'reject')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                  title="Reject"
                >
                  <XCircle size={12} />
                  Reject
                </button>
              </>
            )}

            {/* Employee Approval Buttons */}
            {showEmployeeApproval && (
              <>
                <button
                  onClick={() => openApprovalModal(job, 'approve_employee')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
                  title="Approve as Employee"
                >
                  <CheckSquare size={12} />
                  Approve
                </button>
                <button
                  onClick={() => openApprovalModal(job, 'reject')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium"
                  title="Reject"
                >
                  <XCircle size={12} />
                  Reject
                </button>
              </>
            )}

            {/* No approvals needed message */}
            {!showManagerApproval && !showEmployeeApproval && (job.status === 'APPROVED' || job.status === 'ACTIVE') && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Fully Approved
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Compact Team Job Card for List View
  const CompactJobCard = ({ job }) => {
    // Check approval permissions
    const canApproveManager = job.can_approve_as_line_manager || job.can_approve || false;
    const showManagerApproval = (job.status === 'PENDING_LINE_MANAGER' || job.status === 'PENDING_APPROVAL') && canApproveManager;
    
    return (
      <div className={`p-3 ${bgAccent} rounded-lg border ${borderColor} hover:shadow-sm transition-all`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="bg-almet-sapphire text-white p-2 rounded-lg">
              <FileText size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${textPrimary} truncate`} title={job.job_title}>
                {job.job_title}
              </h4>
              <p className={`text-sm ${textMuted} truncate`}>
                {job.employee_name || job.assigned_employee_name || job.manual_employee_name || 'Vacant'} • {job.department || job.department_name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
              {job.status_display?.status || job.status_display || job.status}
            </span>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => fetchJobDetail(job.id)}
                className="p-1 text-almet-sapphire hover:bg-almet-sapphire/10 rounded transition-colors"
                title="View Details"
              >
                <Eye size={16} />
              </button>
              
              {/* Manager approval buttons for list view */}
              {showManagerApproval && (
                <>
                  <button
                    onClick={() => openApprovalModal(job, 'approve_manager')}
                    className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                    title="Approve as Line Manager"
                  >
                    <CheckSquare size={16} />
                  </button>
                  <button
                    onClick={() => openApprovalModal(job, 'reject')}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Reject"
                  >
                    <XCircle size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${bgCard} rounded-lg border ${borderColor} p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const myPendingCount = myJobDescriptions.filter(job => 
    job.status === 'PENDING_EMPLOYEE' && job.can_approve
  ).length;

  const teamPendingCount = safeTeamJobsArray.filter(job => 
    job.status === 'PENDING_LINE_MANAGER' && job.can_approve
  ).length;

  return (
    <>
      <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>
                Job Descriptions
              </h2>
              <p className={`${textSecondary} text-sm`}>
                Manage your job descriptions and approvals
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm">
                <Plus size={16} />
                Create New
              </button>
            </div>
          </div>

          {/* Tabs - Only show if manager */}
          {isManager && (
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab('my-jobs')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'my-jobs'
                    ? 'bg-white dark:bg-gray-800 text-almet-sapphire shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User size={14} />
                  My Jobs
                  {myPendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {myPendingCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('team-jobs')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  activeTab === 'team-jobs'
                    ? 'bg-white dark:bg-gray-800 text-almet-sapphire shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users size={14} />
                  Team Jobs ({safeTeamJobsArray.length})
                  {teamPendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {teamPendingCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Enhanced Team Jobs Filters */}
          {isManager && activeTab === 'team-jobs' && safeTeamJobsArray.length > 5 && (
            <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor} mb-6`}>
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Search */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={16} />
                    <input
                      type="text"
                      placeholder="Search by job title, employee, or department..."
                      value={teamSearchTerm}
                      onChange={(e) => setTeamSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 items-center">
                  <select
                    value={teamStatusFilter}
                    onChange={(e) => setTeamStatusFilter(e.target.value)}
                    className={`px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                  >
                    <option value="">All Status</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>

                  <select
                    value={teamDepartmentFilter}
                    onChange={(e) => setTeamDepartmentFilter(e.target.value)}
                    className={`px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
                  >
                    <option value="">All Departments</option>
                    {uniqueDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setTeamViewMode('grid')}
                      className={`p-2 ${teamViewMode === 'grid' ? 'bg-almet-sapphire text-white' : `${textMuted} hover:${textPrimary}`} transition-colors`}
                      title="Grid View"
                    >
                      <Building size={16} />
                    </button>
                    <button
                      onClick={() => setTeamViewMode('list')}
                      className={`p-2 ${teamViewMode === 'list' ? 'bg-almet-sapphire text-white' : `${textMuted} hover:${textPrimary}`} transition-colors`}
                      title="List View"
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Summary */}
              {(teamSearchTerm || teamStatusFilter || teamDepartmentFilter) && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className={textMuted}>Showing {filteredTeamJobs.length} of {safeTeamJobsArray.length} jobs</span>
                  <button
                    onClick={() => {
                      setTeamSearchTerm('');
                      setTeamStatusFilter('');
                      setTeamDepartmentFilter('');
                    }}
                    className="text-almet-sapphire hover:text-almet-astral font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Job Descriptions List */}
          <div className="space-y-4">
            {/* My Job Descriptions */}
            {(!isManager || activeTab === 'my-jobs') && (
              <>
                {myJobDescriptions.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${textPrimary}`}>
                        {isManager ? 'My Job Descriptions' : 'Job Descriptions'}
                      </h3>
                      {myPendingCount > 0 && (
                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                          <AlertCircle size={16} className="text-yellow-600" />
                          <span className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                            {myPendingCount} pending your approval
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {myJobDescriptions.map(job => (
                        <JobDescriptionCard 
                          key={job.id} 
                          job={job} 
                          showManagerActions={false}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText className={`mx-auto h-12 w-12 ${textMuted} mb-4`} />
                    <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>
                      No Job Descriptions Found
                    </h3>
                    <p className={textMuted}>
                      You don't have any job descriptions assigned yet.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Team Job Descriptions */}
            {isManager && activeTab === 'team-jobs' && (
              <>
                {filteredTeamJobs.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${textPrimary}`}>
                       Team Job Descriptions
                        <span className={`ml-2 text-sm ${textMuted}`}>
                          ({filteredTeamJobs.length}{safeTeamJobsArray.length !== filteredTeamJobs.length && ` of ${safeTeamJobsArray.length}`})
                        </span>
                      </h3>
                      {teamPendingCount > 0 && (
                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                          <AlertCircle size={16} className="text-yellow-600" />
                          <span className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">
                            {teamPendingCount} pending your approval
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Team Jobs Display */}
                    {teamViewMode === 'grid' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {teamPaginatedJobs.map(job => (
                          <JobDescriptionCard 
                            key={job.id} 
                            job={job} 
                            showManagerActions={true}
                            compact={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {teamPaginatedJobs.map(job => (
                          <CompactJobCard key={job.id} job={job} />
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {teamTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-almet-comet">
                        <div className={`text-sm ${textMuted}`}>
                          Showing {((teamCurrentPage - 1) * teamItemsPerPage) + 1} to {Math.min(teamCurrentPage * teamItemsPerPage, filteredTeamJobs.length)} of {filteredTeamJobs.length} jobs
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setTeamCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={teamCurrentPage === 1}
                            className={`p-2 border ${borderColor} rounded-lg ${teamCurrentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} transition-colors`}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, teamTotalPages) }, (_, i) => {
                              let pageNum;
                              if (teamTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (teamCurrentPage <= 3) {
                                pageNum = i + 1;
                              } else if (teamCurrentPage >= teamTotalPages - 2) {
                                pageNum = teamTotalPages - 4 + i;
                              } else {
                                pageNum = teamCurrentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setTeamCurrentPage(pageNum)}
                                  className={`px-3 py-1 text-sm border ${borderColor} rounded ${
                                    teamCurrentPage === pageNum 
                                      ? 'bg-almet-sapphire text-white border-almet-sapphire' 
                                      : `${textPrimary} hover:bg-gray-100 dark:hover:bg-gray-800`
                                  } transition-colors`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setTeamCurrentPage(prev => Math.min(prev + 1, teamTotalPages))}
                            disabled={teamCurrentPage === teamTotalPages}
                            className={`p-2 border ${borderColor} rounded-lg ${teamCurrentPage === teamTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} transition-colors`}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : safeTeamJobsArray.length > 0 ? (
                  <div className="text-center py-12">
                    <Filter className={`mx-auto h-12 w-12 ${textMuted} mb-4`} />
                    <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>
                      No Job Descriptions Match Your Filters
                    </h3>
                    <p className={textMuted}>
                      Try adjusting your search criteria or clear the filters.
                    </p>
                    <button
                      onClick={() => {
                        setTeamSearchTerm('');
                        setTeamStatusFilter('');
                        setTeamDepartmentFilter('');
                      }}
                      className="mt-3 text-almet-sapphire hover:text-almet-astral font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className={`mx-auto h-12 w-12 ${textMuted} mb-4`} />
                    <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>
                      No Team Job Descriptions Found
                    </h3>
                    <p className={textMuted}>
                      No job descriptions are currently assigned to your team members.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Info Note */}
          <div className={`mt-6 p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-almet-sapphire mt-1 flex-shrink-0" />
              <div>
                <h4 className={`font-medium ${textPrimary} mb-1`}>How it works:</h4>
                <p className={`text-sm ${textSecondary}`}>
                  Job descriptions follow an approval workflow: HR creates → Line Manager approves → Employee approves → Active
                </p>
                {isManager && (
                  <p className={`text-sm ${textSecondary} mt-2`}>
                    As a manager, you can approve your team's job descriptions and manage your own approvals separately.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Job Description Detail Modal */}
      {showDetailModal && jobDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor}`}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-almet-comet">
                <div>
                  <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Job Description Details</h2>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(jobDetail.status)}`}>
                      {getStatusIcon(jobDetail.status)}
                      {jobDetail.status_display?.status || jobDetail.status}
                    </span>
                    <span className={`text-sm ${textMuted}`}>Version {jobDetail.version}</span>
                    <span className={`text-sm ${textMuted}`}>Created {formatDate(jobDetail.created_at)}</span>
                    <span className={`text-sm ${textMuted}`}>
                      Employee: {jobDetail.employee_info?.name || jobDetail.manual_employee_name || 'Vacant Position'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      jobDescriptionService.downloadJobDescriptionPDF(jobDetail.id);
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setJobDetail(null);
                    }}
                    className={`p-2 ${textMuted} hover:${textPrimary} transition-colors`}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Job Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div className={`p-4 ${bgAccent} rounded-lg`}>
                    <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>{jobDetail.job_title}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${textMuted}`}>Business Function:</span>
                        <p className={textPrimary}>{jobDetail.business_function?.name}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${textMuted}`}>Department:</span>
                        <p className={textPrimary}>{jobDetail.department?.name}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${textMuted}`}>Unit:</span>
                        <p className={textPrimary}>{jobDetail.unit?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${textMuted}`}>Job Function:</span>
                        <p className={textPrimary}>{jobDetail.job_function?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${textMuted}`}>Position Group:</span>
                        <p className={textPrimary}>{jobDetail.position_group?.display_name || jobDetail.position_group?.name}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${textMuted}`}>Grading Level:</span>
                        <p className={textPrimary}>{jobDetail.grading_level || 'N/A'}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${textMuted}`}>Reports To:</span>
                        <p className={textPrimary}>{jobDetail.reports_to?.full_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className={`font-medium ${textMuted}`}>Position Type:</span>
                        <div className="flex items-center gap-1">
                          {jobDetail.employee_info?.name || jobDetail.manual_employee_name ? (
                            <>
                              <UserCheck size={14} className="text-green-600" />
                              <span className={`${textPrimary} text-green-600`}>Assigned</span>
                            </>
                          ) : (
                            <>
                              <UserVacant size={14} className="text-orange-600" />
                              <span className={`${textPrimary} text-orange-600`}>Vacant</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Purpose */}
                  <div>
                    <h4 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                      <Target size={20} className="text-almet-sapphire" />
                      Job Purpose
                    </h4>
                    <div className={`p-4 ${bgAccent} rounded-lg`}>
                      <p className={`${textSecondary} leading-relaxed`}>{jobDetail.job_purpose}</p>
                    </div>
                  </div>

                  {/* Job Sections */}
                  {jobDetail.sections && jobDetail.sections.length > 0 && (
                    <div className="space-y-6">
                      {jobDetail.sections.map((section, index) => (
                        <div key={index}>
                          <h4 className={`text-lg font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                            <Briefcase size={20} className="text-almet-sapphire" />
                            {section.title}
                          </h4>
                          <div className={`p-4 ${bgAccent} rounded-lg`}>
                            <div className={`${textSecondary} leading-relaxed whitespace-pre-line`}>
                              {section.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar with additional info */}
                <div className="space-y-6">
                  {/* Approval Status */}
                  <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                    <h4 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                      <CheckCircle size={18} className="text-almet-sapphire" />
                      Approval Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textMuted}`}>Line Manager</span>
                        <span className={`flex items-center gap-1 text-sm ${jobDetail.line_manager_approved_at ? 'text-green-600' : 'text-yellow-600'}`}>
                          {jobDetail.line_manager_approved_at ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {jobDetail.line_manager_approved_at ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textMuted}`}>Employee</span>
                        <span className={`flex items-center gap-1 text-sm ${jobDetail.employee_approved_at ? 'text-green-600' : 'text-yellow-600'}`}>
                          {jobDetail.employee_approved_at ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {jobDetail.employee_approved_at ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Required Skills */}
                  {jobDetail.required_skills && jobDetail.required_skills.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                      <h4 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                        <Award size={18} className="text-almet-sapphire" />
                        Required Skills
                      </h4>
                      <div className="space-y-2">
                        {jobDetail.required_skills.map((skill, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                              {skill.skill_detail?.name || skill.name}
                            </span>
                            <span className={`text-xs ${textMuted}`}>
                              {skill.proficiency_level}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Behavioral Competencies */}
                  {jobDetail.behavioral_competencies && jobDetail.behavioral_competencies.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                      <h4 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                        <Users size={18} className="text-almet-sapphire" />
                        Behavioral Competencies
                      </h4>
                      <div className="space-y-2">
                        {jobDetail.behavioral_competencies.map((comp, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                              {comp.competency_detail?.name || comp.name}
                            </span>
                            <span className={`text-xs ${textMuted}`}>
                              {comp.proficiency_level}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className={`${bgCard} rounded-lg w-full max-w-md border ${borderColor}`}>
            <div className="p-6">
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>
                {approvalType === 'reject' ? 'Reject Job Description' : 'Approve Job Description'}
              </h3>
              
              <div className="mb-4">
                <p className={`text-sm ${textSecondary} mb-2`}>Job Title:</p>
                <p className={`font-medium ${textPrimary}`}>{selectedJob.job_title}</p>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  {approvalType === 'reject' ? 'Reason for rejection:' : 'Comments (optional):'}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows="3"
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  placeholder={approvalType === 'reject' ? 'Please provide a reason...' : 'Optional comments...'}
                  required={approvalType === 'reject'}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setComments('');
                  }}
                  className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors`}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproval(selectedJob.id, approvalType)}
                  disabled={actionLoading || (approvalType === 'reject' && !comments.trim())}
                  className={`px-4 py-2 ${
                    approvalType === 'reject' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2`}
                >
                  {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {approvalType === 'reject' ? 'Reject' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeDetailJobDescriptions;