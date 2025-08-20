// components/headcount/EmployeeDetailJobDescriptions.jsx - Reduced font sizes
'use client'
import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight,
  AlertTriangle,
  Clock3,
  Flame,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  BookOpen,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import jobDescriptionService from '@/services/jobDescriptionService';

const EmployeeDetailJobDescriptions = ({ employeeId, isManager = false }) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [myJobDescriptions, setMyJobDescriptions] = useState([]);
  const [teamJobDescriptions, setTeamJobDescriptions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetail, setJobDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('my-jobs');

  // Enhanced Team Job Descriptions State
  const [teamFilters, setTeamFilters] = useState({
    search: '',
    status: '',
    department: '',
    businessFunction: '',
    vacantOnly: false,
    pendingOnly: false
  });
  const [teamSorting, setTeamSorting] = useState({
    field: 'created_at',
    order: 'desc'
  });
  const [teamCurrentPage, setTeamCurrentPage] = useState(1);
  const [teamItemsPerPage] = useState(6); // Reduced from 8 to 6 for better 2-column layout
  const [teamViewMode, setTeamViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Almet Theme classes - smaller fonts and better colors
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-almet-mystic";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-san-juan/30" : "bg-almet-mystic/50";
  const bgSuccess = darkMode ? "bg-green-900/20" : "bg-green-50";
  const bgWarning = darkMode ? "bg-orange-900/20" : "bg-orange-50";
  const bgDanger = darkMode ? "bg-red-900/20" : "bg-red-50";

  useEffect(() => {
    fetchJobDescriptions();
  }, [employeeId]);

  // Filtered and sorted team jobs
  const processedTeamJobs = useMemo(() => {
    let processed = jobDescriptionService.filterJobDescriptions(teamJobDescriptions, teamFilters);
    processed = jobDescriptionService.sortJobDescriptions(processed, teamSorting.field, teamSorting.order);
    return processed;
  }, [teamJobDescriptions, teamFilters, teamSorting]);

  // Paginated team jobs
  const paginatedTeamJobs = useMemo(() => {
    return jobDescriptionService.paginateJobDescriptions(processedTeamJobs, teamCurrentPage, teamItemsPerPage);
  }, [processedTeamJobs, teamCurrentPage, teamItemsPerPage]);

  // Filter options
  const filterOptions = useMemo(() => {
    return {
      statuses: jobDescriptionService.getUniqueFilterValues(teamJobDescriptions, 'status'),
      departments: jobDescriptionService.getUniqueFilterValues(teamJobDescriptions, 'department'),
      businessFunctions: jobDescriptionService.getUniqueFilterValues(teamJobDescriptions, 'business_function')
    };
  }, [teamJobDescriptions]);

  const fetchJobDescriptions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching job descriptions for employee:', employeeId);
      
      // Always fetch employee's own job descriptions
      const myJobsResponse = await jobDescriptionService.getEmployeeJobDescriptions(employeeId);
      console.log('📋 My jobs response:', myJobsResponse);
      setMyJobDescriptions(Array.isArray(myJobsResponse) ? myJobsResponse : []);
      
      // If manager, also fetch team job descriptions
      if (isManager) {
        const teamJobsResponse = await jobDescriptionService.getTeamJobDescriptions(employeeId);
        console.log('👥 Team jobs response:', teamJobsResponse);
        setTeamJobDescriptions(Array.isArray(teamJobsResponse) ? teamJobsResponse : []);
      }
    } catch (error) {
      console.error('❌ Error fetching job descriptions:', error);
      setMyJobDescriptions([]);
      setTeamJobDescriptions([]);
    } finally {
      setLoading(false);
    }
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

  const handleApproval = async (jobDescriptionId, action) => {
    try {
      setActionLoading(true);
      
      switch (action) {
        case 'approve_manager':
          await jobDescriptionService.approveByLineManager(jobDescriptionId, {
            comments: comments.trim()
          });
          break;
        case 'approve_employee':
          await jobDescriptionService.approveAsEmployee(jobDescriptionId, {
            comments: comments.trim()
          });
          break;
        case 'reject':
          await jobDescriptionService.rejectJobDescription(jobDescriptionId, {
            reason: comments.trim()
          });
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Refresh data
      await fetchJobDescriptions();
      setShowApprovalModal(false);
      setComments('');
      setSelectedJob(null);
      setApprovalType(null);
      
      const actionText = action === 'reject' ? 'rejected' : 'approved';
      alert(`Job description ${actionText} successfully!`);
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

  const handleFilterChange = (filterKey, value) => {
    setTeamFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setTeamCurrentPage(1);
  };

  const handleSortChange = (field) => {
    setTeamSorting(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setTeamFilters({
      search: '',
      status: '',
      department: '',
      businessFunction: '',
      vacantOnly: false,
      pendingOnly: false
    });
    setTeamCurrentPage(1);
  };

  const getStatusDisplay = (job) => {
    const statusInfo = jobDescriptionService.getStatusInfo(job.status);
    let statusColor = '';
    let statusBg = '';
    
    // Almet status colors
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
      case 'REVISION_REQUIRED':
        statusColor = 'text-almet-sapphire dark:text-almet-steel-blue';
        statusBg = 'bg-blue-100 dark:bg-almet-sapphire/20';
        break;
      default:
        statusColor = 'text-almet-waterloo dark:text-almet-santas-gray';
        statusBg = 'bg-gray-100 dark:bg-almet-comet/30';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${statusColor} ${statusBg}`}>
        {getStatusIcon(job.status)}
        {job.status_display?.status || statusInfo.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DRAFT':
        return <FileText size={9} />;
      case 'PENDING_LINE_MANAGER':
      case 'PENDING_EMPLOYEE':
        return <Clock size={9} />;
      case 'APPROVED':
      case 'ACTIVE':
        return <CheckCircle size={9} />;
      case 'REJECTED':
        return <XCircle size={9} />;
      case 'REVISION_REQUIRED':
        return <RotateCcw size={9} />;
      default:
        return <AlertCircle size={9} />;
    }
  };

  // Enhanced Job Description Card - More compact and professional
  const JobDescriptionCard = ({ job, showManagerActions = false, compact = false }) => {
    const canApproveManager = showManagerActions && 
      jobDescriptionService.canApproveAsLineManager(job);
    const canApproveEmployee = !showManagerActions && 
      jobDescriptionService.canApproveAsEmployee(job);
    const canReject = jobDescriptionService.canReject(job);
    
    const isVacant = jobDescriptionService.isVacantPosition(job);
    const employeeName = jobDescriptionService.getEmployeeDisplayName(job);
    const nextAction = jobDescriptionService.getNextAction(job);
    
    return (
      <div className={`relative ${bgCard} rounded-xl border ${borderColor} hover:shadow-lg transition-all duration-300 overflow-hidden group`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral text-white p-2.5 rounded-xl flex-shrink-0 shadow-md">
              <FileText size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xs font-bold ${textPrimary} mb-1.5 line-clamp-2 leading-tight`} title={job.job_title}>
                {job.job_title}
              </h3>
              <div className={`flex items-center gap-2 text-[10px] ${textMuted} mb-1.5`}>
                <Building size={10} />
                <span className="truncate">{job.business_function || job.business_function_name}</span>
                <span>•</span>
                <span className="truncate">{job.department || job.department_name}</span>
              </div>
              <div className={`flex items-center gap-2 text-[10px]`}>
                {isVacant ? (
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <UserVacant size={10} />
                    <span className="font-medium">Vacant Position</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <UserCheck size={10} />
                    <span className="truncate max-w-[120px]">
                      {showManagerActions ? employeeName : `Reports to: ${job.reports_to_name || 'N/A'}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and Priority Row */}
          <div className="flex items-center justify-between mb-3">
            {getStatusDisplay(job)}
          </div>

          {/* Job Purpose - Compact */}
          <div className="mb-3">
            <p className={`text-[10px] ${textMuted} line-clamp-2 leading-relaxed`}>
              {job.job_purpose || 'No job purpose provided.'}
            </p>
          </div>

          {/* Metadata Grid */}
          {/* <div className={`grid grid-cols-2 gap-2 p-2.5 ${bgAccent} rounded-lg text-[10px] mb-3`}>
         
            <div className="flex justify-between">
              <span className={`font-medium ${textMuted}`}>Created:</span>
              <span className={`${textPrimary} font-semibold`}>
                {jobDescriptionService.formatDate(job.created_at)}
              </span>
            </div>
          </div> */}

          {/* Approval Status - More compact */}
          <div className={`flex items-center justify-between p-2.5 ${bgAccent} rounded-lg text-[10px] mb-3`}>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {job.line_manager_approved_at ? 
                  <CheckCircle size={10} className="text-green-500" /> : 
                  <Clock size={10} className="text-orange-500" />
                }
                <span className={`font-medium ${textMuted}`}>Manager</span>
              </div>
              <div className="flex items-center gap-1">
                {job.employee_approved_at ? 
                  <CheckCircle size={10} className="text-green-500" /> : 
                  <Clock size={10} className="text-orange-500" />
                }
                <span className={`font-medium ${textMuted}`}>Employee</span>
              </div>
            </div>
            <span className={`text-[10px] font-semibold ${textPrimary}`}>
              {job.line_manager_approved_at && job.employee_approved_at ? 'Complete' : 'In Progress'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => fetchJobDetail(job.id)}
                disabled={detailLoading}
                className="flex items-center gap-1 px-2.5 py-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg transition-colors text-[10px] font-medium"
              >
                <Eye size={10} />
                View
              </button>
              <button 
                onClick={() => {
                  jobDescriptionService.downloadJobDescriptionPDF(job.id);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-almet-waterloo hover:bg-gray-100 dark:hover:bg-almet-comet/30 rounded-lg transition-colors text-[10px] font-medium"
              >
                <Download size={10} />
                PDF
              </button>
            </div>

            {/* Approval Action Buttons */}
            <div className="flex items-center gap-1">
              {canApproveManager && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openApprovalModal(job, 'approve_manager')}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[10px] font-medium shadow-sm"
                  >
                    <CheckSquare size={10} />
                    Approve
                  </button>
                  <button
                    onClick={() => openApprovalModal(job, 'reject')}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <XCircle size={10} />
                  </button>
                </div>
              )}

              {canApproveEmployee && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openApprovalModal(job, 'approve_employee')}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[10px] font-medium shadow-sm"
                  >
                    <CheckSquare size={10} />
                    Approve
                  </button>
                  <button
                    onClick={() => openApprovalModal(job, 'reject')}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <XCircle size={10} />
                  </button>
                </div>
              )}

              {!canApproveManager && !canApproveEmployee && (
                <span className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg ${
                  job.status === 'APPROVED' || job.status === 'ACTIVE' 
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                    : `${textMuted} ${bgAccent}`
                }`}>
                  {job.status === 'APPROVED' || job.status === 'ACTIVE' ? 'Complete' : 'Pending'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Compact List View Component
  const CompactJobCard = ({ job }) => {
    const canApproveManager = jobDescriptionService.canApproveAsLineManager(job);
    const isVacant = jobDescriptionService.isVacantPosition(job);
    const employeeName = jobDescriptionService.getEmployeeDisplayName(job);
    
    return (
      <div className={`p-3.5 ${bgCard} rounded-xl border ${borderColor} hover:shadow-md transition-all relative`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral text-white p-2 rounded-xl relative">
              <FileText size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-xs font-bold ${textPrimary} truncate mb-1`} title={job.job_title}>
                {job.job_title}
              </h4>
              <div className="flex items-center gap-3 text-[10px]">
                <span className={`${textMuted} truncate`}>
                  {isVacant ? 'Vacant' : employeeName} • {job.department || job.department_name}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusDisplay(job)}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => fetchJobDetail(job.id)}
                className="p-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye size={14} />
              </button>
              
              {canApproveManager && (
                <>
                  <button
                    onClick={() => openApprovalModal(job, 'approve_manager')}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Approve as Line Manager"
                  >
                    <CheckSquare size={14} />
                  </button>
                  <button
                    onClick={() => openApprovalModal(job, 'reject')}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <XCircle size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Filters Component
  const TeamFiltersPanel = () => (
    <div className={`${bgCard} rounded-xl border ${borderColor} mb-6 overflow-hidden transition-all ${showFilters ? 'block' : 'hidden'}`}>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Search */}
          <div>
            <label className={`block text-[10px] font-semibold ${textSecondary} mb-1.5`}>Search</label>
            <div className="relative">
              <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={12} />
              <input
                type="text"
                placeholder="Job title, employee..."
                value={teamFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire text-xs`}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className={`block text-[10px] font-semibold ${textSecondary} mb-1.5`}>Status</label>
            <select
              value={teamFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-xs`}
            >
              <option value="">All Status</option>
              {filterOptions.statuses.map(status => (
                <option key={status} value={status}>
                  {jobDescriptionService.getStatusInfo(status).label}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className={`block text-[10px] font-semibold ${textSecondary} mb-1.5`}>Department</label>
            <select
              value={teamFilters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-xs`}
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggle Filters */}
        <div className="flex flex-wrap gap-3 mb-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={teamFilters.vacantOnly}
              onChange={(e) => handleFilterChange('vacantOnly', e.target.checked)}
              className="w-3.5 h-3.5 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
            />
            <span className={`text-xs ${textSecondary}`}>Vacant positions only</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={teamFilters.pendingOnly}
              onChange={(e) => handleFilterChange('pendingOnly', e.target.checked)}
              className="w-3.5 h-3.5 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
            />
            <span className={`text-xs ${textSecondary}`}>Pending approvals only</span>
          </label>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-xs ${textMuted}`}>
              Showing {paginatedTeamJobs.totalItems} of {teamJobDescriptions.length} jobs
            </span>
            {(teamFilters.search || teamFilters.status || teamFilters.department || teamFilters.vacantOnly || teamFilters.pendingOnly) && (
              <button
                onClick={clearFilters}
                className="text-almet-sapphire hover:text-almet-astral font-semibold text-xs"
              >
                Clear filters
              </button>
            )}
          </div>
          
          <button
            onClick={() => fetchJobDescriptions()}
            className="flex items-center gap-2 px-3 py-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg transition-colors text-xs font-medium"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  // Main loading state
  if (loading) {
    return (
      <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 dark:bg-almet-comet rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-almet-comet rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-almet-comet rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Count pending approvals
  const myPendingCount = myJobDescriptions.filter(job => 
    job.status === 'PENDING_EMPLOYEE'
  ).length;

  const teamPendingCount = teamJobDescriptions.filter(job => 
    job.status === 'PENDING_LINE_MANAGER' || job.status === 'PENDING_APPROVAL'
  ).length;

  return (
    <>
      <div className={`${bgCard} rounded-xl border ${borderColor} shadow-sm`}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`text-xl font-bold ${textPrimary} mb-1.5`}>
                Job Descriptions
              </h2>
              <p className={`${textSecondary} text-xs`}>
                Manage your job descriptions and approvals
              </p>
            </div>
            
         
          </div>

          {/* Tabs - Only show if manager */}
          {isManager && (
            <div className="flex space-x-1 bg-gray-100 dark:bg-almet-comet/50 rounded-xl p-1 mb-5">
              <button
                onClick={() => setActiveTab('my-jobs')}
                className={`flex-1 px-3.5 py-2.5 rounded-lg font-semibold transition-all text-xs ${
                  activeTab === 'my-jobs'
                    ? 'bg-white dark:bg-almet-cloud-burst text-almet-sapphire shadow-md'
                    : 'text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-cloud-burst dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User size={14} />
                  My Jobs
                  {myPendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                      {myPendingCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('team-jobs')}
                className={`flex-1 px-3.5 py-2.5 rounded-lg font-semibold transition-all text-xs ${
                  activeTab === 'team-jobs'
                    ? 'bg-white dark:bg-almet-cloud-burst text-almet-sapphire shadow-md'
                    : 'text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-cloud-burst dark:hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users size={14} />
                  Team Jobs ({teamJobDescriptions.length})
                  {teamPendingCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                      {teamPendingCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Enhanced Team Jobs Controls */}
          {isManager && activeTab === 'team-jobs' && teamJobDescriptions.length > 0 && (
            <div className="mb-5">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3.5 py-2 border ${borderColor} rounded-xl transition-all text-xs font-semibold ${
                      showFilters 
                        ? 'bg-almet-sapphire text-white border-almet-sapphire shadow-md' 
                        : `${textPrimary} hover:${bgCardHover}`
                    }`}
                  >
                    <Filter size={14} />
                    Filters
                    <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Sort Options */}
                  <div className="flex items-center border ${borderColor} rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleSortChange('created_at')}
                      className={`p-2 transition-colors ${
                        teamSorting.field === 'created_at' 
                          ? 'bg-almet-sapphire text-white' 
                          : `${textMuted} hover:${textPrimary} hover:${bgCardHover}`
                      }`}
                      title="Sort by Date"
                    >
                      {teamSorting.field === 'created_at' && teamSorting.order === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
                    </button>
                    <button
                      onClick={() => handleSortChange('job_title')}
                      className={`p-2 transition-colors ${
                        teamSorting.field === 'job_title' 
                          ? 'bg-almet-sapphire text-white' 
                          : `${textMuted} hover:${textPrimary} hover:${bgCardHover}`
                      }`}
                      title="Sort by Title"
                    >
                      <BookOpen size={14} />
                    </button>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex border ${borderColor} rounded-xl overflow-hidden">
                    <button
                      onClick={() => setTeamViewMode('grid')}
                      className={`p-2 transition-colors ${
                        teamViewMode === 'grid' 
                          ? 'bg-almet-sapphire text-white' 
                          : `${textMuted} hover:${textPrimary} hover:${bgCardHover}`
                      }`}
                      title="Grid View"
                    >
                      <Grid3X3 size={14} />
                    </button>
                    <button
                      onClick={() => setTeamViewMode('list')}
                      className={`p-2 transition-colors ${
                        teamViewMode === 'list' 
                          ? 'bg-almet-sapphire text-white' 
                          : `${textMuted} hover:${textPrimary} hover:${bgCardHover}`
                      }`}
                      title="List View"
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              <TeamFiltersPanel />
            </div>
          )}

          {/* Job Descriptions List */}
          <div className="space-y-5">
            {/* My Job Descriptions */}
            {(!isManager || activeTab === 'my-jobs') && (
              <>
                {myJobDescriptions.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${textPrimary}`}>
                        {isManager ? 'My Job Descriptions' : 'Job Descriptions'}
                      </h3>
                      {myPendingCount > 0 && (
                        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3.5 py-2 rounded-xl">
                          <AlertCircle size={16} className="text-orange-600" />
                          <span className="text-orange-700 dark:text-orange-300 text-xs font-semibold">
                            {myPendingCount} pending your approval
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Use 2-column grid for My Jobs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                    <div className={`w-14 h-14 mx-auto mb-3 ${bgAccent} rounded-2xl flex items-center justify-center`}>
                      <FileText className={`h-7 w-7 ${textMuted}`} />
                    </div>
                    <h3 className={`text-base font-bold ${textPrimary} mb-1.5`}>
                      No Job Descriptions Found
                    </h3>
                    <p className={`${textMuted} text-xs`}>
                      You don't have any job descriptions assigned yet.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Team Job Descriptions */}
            {isManager && activeTab === 'team-jobs' && (
              <>
                {paginatedTeamJobs.totalItems > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${textPrimary}`}>
                       Team Job Descriptions
                        <span className={`ml-2 text-xs font-normal ${textMuted}`}>
                          ({paginatedTeamJobs.totalItems}{teamJobDescriptions.length !== paginatedTeamJobs.totalItems && ` of ${teamJobDescriptions.length}`})
                        </span>
                      </h3>
                      {teamPendingCount > 0 && (
                        <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3.5 py-2 rounded-xl">
                          <AlertCircle size={16} className="text-orange-600" />
                          <span className="text-orange-700 dark:text-orange-300 text-xs font-semibold">
                            {teamPendingCount} pending your approval
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Team Jobs Display - Use 2-column grid */}
                    {teamViewMode === 'grid' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {paginatedTeamJobs.items.map(job => (
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
                        {paginatedTeamJobs.items.map(job => (
                          <CompactJobCard key={job.id} job={job} />
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {paginatedTeamJobs.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-200 dark:border-almet-comet">
                        <div className={`text-xs ${textMuted}`}>
                          Showing {((teamCurrentPage - 1) * teamItemsPerPage) + 1} to {Math.min(teamCurrentPage * teamItemsPerPage, paginatedTeamJobs.totalItems)} of {paginatedTeamJobs.totalItems} jobs
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setTeamCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={!paginatedTeamJobs.hasPreviousPage}
                            className={`p-2 border ${borderColor} rounded-lg transition-colors ${
                              !paginatedTeamJobs.hasPreviousPage 
                                ? 'opacity-50 cursor-not-allowed' 
                                : `hover:${bgCardHover}`
                            }`}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, paginatedTeamJobs.totalPages) }, (_, i) => {
                              let pageNum;
                              const totalPages = paginatedTeamJobs.totalPages;
                              
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (teamCurrentPage <= 3) {
                                pageNum = i + 1;
                              } else if (teamCurrentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = teamCurrentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setTeamCurrentPage(pageNum)}
                                  className={`px-2.5 py-1.5 text-xs border ${borderColor} rounded-lg transition-colors ${
                                    teamCurrentPage === pageNum 
                                      ? 'bg-almet-sapphire text-white border-almet-sapphire' 
                                      : `${textPrimary} hover:${bgCardHover}`
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setTeamCurrentPage(prev => Math.min(prev + 1, paginatedTeamJobs.totalPages))}
                            disabled={!paginatedTeamJobs.hasNextPage}
                            className={`p-2 border ${borderColor} rounded-lg transition-colors ${
                              !paginatedTeamJobs.hasNextPage 
                                ? 'opacity-50 cursor-not-allowed' 
                                : `hover:${bgCardHover}`
                            }`}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : processedTeamJobs.length === 0 && teamJobDescriptions.length > 0 ? (
                  <div className="text-center py-12">
                    <div className={`w-14 h-14 mx-auto mb-3 ${bgAccent} rounded-2xl flex items-center justify-center`}>
                      <Filter className={`h-7 w-7 ${textMuted}`} />
                    </div>
                    <h3 className={`text-base font-bold ${textPrimary} mb-1.5`}>
                      No Job Descriptions Match Your Filters
                    </h3>
                    <p className={`${textMuted} text-xs mb-3`}>
                      Try adjusting your search criteria or clear the filters.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-3.5 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-colors font-semibold text-xs"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className={`w-14 h-14 mx-auto mb-3 ${bgAccent} rounded-2xl flex items-center justify-center`}>
                      <Users className={`h-7 w-7 ${textMuted}`} />
                    </div>
                    <h3 className={`text-base font-bold ${textPrimary} mb-1.5`}>
                      No Team Job Descriptions Found
                    </h3>
                    <p className={`${textMuted} text-xs`}>
                      No job descriptions are currently assigned to your team members.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

       
        </div>
      </div>

      {/* Enhanced Job Description Detail Modal - Keep existing modal code but update styling */}
      {showDetailModal && jobDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                      setShowDetailModal(false);
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
                        <span className={`font-semibold ${textMuted}`}>Business Function:</span>
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
                        <span className={`font-semibold ${textMuted}`}>Position Group:</span>
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

                {/* Sidebar with additional info */}
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
                      
                      {/* Show approval comments if available */}
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
                            <span className={`text-[10px] ${textMuted} font-semibold`}>
                              {skill.proficiency_level}
                              {skill.is_mandatory && <span className="text-red-500 ml-1">*</span>}
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
        </div>
      )}

      {/* Enhanced Approval Modal */}
      {showApprovalModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className={`${bgCard} rounded-2xl w-full max-w-md border ${borderColor} shadow-2xl`}>
            <div className="p-5">
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>
                {approvalType === 'reject' ? 'Reject Job Description' : 'Approve Job Description'}
              </h3>
              
              <div className="mb-3">
                <p className={`text-xs font-semibold ${textSecondary} mb-1`}>Job Title:</p>
                <p className={`font-bold ${textPrimary} text-sm`}>{selectedJob.job_title}</p>
              </div>

              <div className="mb-3">
                <p className={`text-xs font-semibold ${textSecondary} mb-1`}>Employee:</p>
                <p className={`font-semibold ${textPrimary} text-sm`}>
                  {jobDescriptionService.getEmployeeDisplayName(selectedJob)}
                </p>
              </div>

              <div className="mb-4">
                <p className={`text-xs font-semibold ${textSecondary} mb-1.5`}>Current Status:</p>
                {getStatusDisplay(selectedJob)}
              </div>

              <div className="mb-5">
                <label className={`block text-xs font-semibold ${textSecondary} mb-2`}>
                  {approvalType === 'reject' ? 'Reason for rejection:' : 'Comments (optional):'}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows="4"
                  className={`w-full px-3.5 py-2.5 border ${borderColor} rounded-xl ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire resize-none text-xs`}
                  placeholder={approvalType === 'reject' ? 'Please provide a reason...' : 'Optional comments...'}
                  required={approvalType === 'reject'}
                />
                {approvalType === 'reject' && (
                  <p className="text-xs text-red-500 mt-1.5">* Reason is required for rejection</p>
                )}
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setComments('');
                    setSelectedJob(null);
                    setApprovalType(null);
                  }}
                  className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-almet-comet/30 text-xs`}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproval(selectedJob.id, approvalType)}
                  disabled={actionLoading || (approvalType === 'reject' && !comments.trim())}
                  className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 font-semibold shadow-lg text-xs ${
                    approvalType === 'reject' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {actionLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
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
