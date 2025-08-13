// components/headcount/EmployeeDetailJobDescriptions.jsx - Enhanced with Job Description Detail Modal
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
  Shield
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

  const fetchJobDescriptions = async () => {
    try {
      setLoading(true);
      
      // Always fetch employee's own job descriptions
      const myJobsResponse = await jobDescriptionService.getEmployeeJobDescriptions(employeeId);
      setMyJobDescriptions(myJobsResponse.job_descriptions || []);
      
      // If manager, also fetch team job descriptions
      if (isManager) {
        const teamJobsResponse = await jobDescriptionService.getTeamJobDescriptions(employeeId);
        setTeamJobDescriptions(teamJobsResponse.team_job_descriptions || []);
      }
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
      // Set empty arrays on error to prevent crashes
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

  const getStatusColor = (status) => {
    switch (status) {
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
        await jobDescriptionService.approveTeamJobDescription(employeeId, {
          job_description_id: jobDescriptionId,
          comments
        });
      } else if (action === 'approve_employee') {
        await jobDescriptionService.approveMyJobDescription(employeeId, {
          job_description_id: jobDescriptionId,
          comments
        });
      } else if (action === 'reject') {
        await jobDescriptionService.rejectJobDescriptionFromEmployee(employeeId, {
          job_description_id: jobDescriptionId,
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

  const JobDescriptionCard = ({ job, showManagerActions = false }) => (
    <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor} hover:shadow-sm transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="bg-almet-sapphire text-white p-2 rounded-lg flex-shrink-0">
            <FileText size={16} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>
              {job.job_title}
            </h3>
            <p className={`text-sm ${textSecondary} mb-2`}>
              {job.business_function_name} • {job.department_name}
            </p>
            <div className={`flex items-center gap-2 text-sm ${textMuted}`}>
              <User size={14} />
              {showManagerActions ? (
                <span>Employee: {job.employee_info?.name}</span>
              ) : (
                <span>Reports to: {job.reports_to_name}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(job.status)}`}>
            {getStatusIcon(job.status)}
            {job.status_display}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className={`text-sm font-medium ${textSecondary} mb-1`}>Job Purpose</h4>
          <p className={`text-sm ${textMuted} line-clamp-2`}>
            {job.job_purpose}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className={`font-medium ${textMuted}`}>Version:</span>
            <span className={`ml-2 ${textPrimary}`}>{job.version}</span>
          </div>
          <div>
            <span className={`font-medium ${textMuted}`}>Created:</span>
            <span className={`ml-2 ${textPrimary}`}>
              {formatDate(job.created_at)}
            </span>
          </div>
        </div>

        {/* Approval Status */}
        <div className={`grid grid-cols-2 gap-4 p-3 ${bgCard} rounded-lg text-sm`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${textMuted}`}>Line Manager:</span>
            <span className={`flex items-center gap-1 ${job.line_manager_approved_at ? 'text-green-600' : 'text-yellow-600'}`}>
              {job.line_manager_approved_at ? <CheckCircle size={14} /> : <Clock size={14} />}
              {job.line_manager_approved_at ? 'Approved' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${textMuted}`}>Employee:</span>
            <span className={`flex items-center gap-1 ${job.employee_approved_at ? 'text-green-600' : 'text-yellow-600'}`}>
              {job.employee_approved_at ? <CheckCircle size={14} /> : <Clock size={14} />}
              {job.employee_approved_at ? 'Approved' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-almet-comet">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchJobDetail(job.id)}
            disabled={detailLoading}
            className="flex items-center gap-1 px-3 py-1 text-almet-sapphire hover:bg-almet-sapphire/10 rounded transition-colors text-sm disabled:opacity-50"
          >
            <Eye size={14} />
            {detailLoading ? 'Loading...' : 'View'}
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-sm">
            <Download size={14} />
            Download
          </button>
        </div>

        <div className="flex items-center gap-2">
          {showManagerActions && job.status === 'PENDING_LINE_MANAGER' && (
            <>
              <button
                onClick={() => openApprovalModal(job, 'approve_manager')}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                <CheckSquare size={14} />
                Approve
              </button>
              <button
                onClick={() => openApprovalModal(job, 'reject')}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                <XCircle size={14} />
                Reject
              </button>
            </>
          )}

          {!showManagerActions && job.status === 'PENDING_EMPLOYEE' && job.can_approve && (
            <>
              <button
                onClick={() => openApprovalModal(job, 'approve_employee')}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                <CheckSquare size={14} />
                Approve
              </button>
              <button
                onClick={() => openApprovalModal(job, 'reject')}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                <XCircle size={14} />
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

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

  const teamPendingCount = teamJobDescriptions.filter(job => 
    job.status === 'PENDING_LINE_MANAGER'
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
                  Team Jobs
                  {teamPendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {teamPendingCount}
                    </span>
                  )}
                </div>
              </button>
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
                    {myJobDescriptions.map(job => (
                      <JobDescriptionCard 
                        key={job.id} 
                        job={job} 
                        showManagerActions={false}
                      />
                    ))}
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
                {teamJobDescriptions.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${textPrimary}`}>
                        Team Job Descriptions
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
                    {teamJobDescriptions.map(job => (
                      <JobDescriptionCard 
                        key={job.id} 
                        job={job} 
                        showManagerActions={true}
                      />
                    ))}
                  </>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Description Detail Modal */}
      {showDetailModal && jobDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor}`}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-almet-comet">
                <div>
                  <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Job Description Details</h2>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(jobDetail.status)}`}>
                      {getStatusIcon(jobDetail.status)}
                      {jobDetail.status_display?.status || jobDetail.status}
                    </span>
                    <span className={`text-sm ${textMuted}`}>Version {jobDetail.version}</span>
                    <span className={`text-sm ${textMuted}`}>Created {formatDate(jobDetail.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Download functionality would go here
                      alert('Download functionality would be implemented here');
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

                {/* Sidebar */}
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
                          <span
                            key={index}
                            className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs mr-2 mb-2"
                          >
                            {skill.name}
                          </span>
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
                          <span
                            key={index}
                            className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs mr-2 mb-2"
                          >
                            {comp.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Resources */}
                  {jobDetail.business_resources && jobDetail.business_resources.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                      <h4 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                        <Settings size={18} className="text-almet-sapphire" />
                        Business Resources
                      </h4>
                      <div className="space-y-1">
                        {jobDetail.business_resources.map((resource, index) => (
                          <div key={index} className={`text-sm ${textSecondary}`}>
                            • {resource.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Access Rights */}
                  {jobDetail.access_rights && jobDetail.access_rights.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                      <h4 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                        <Shield size={18} className="text-almet-sapphire" />
                        Access Rights
                      </h4>
                      <div className="space-y-1">
                        {jobDetail.access_rights.map((access, index) => (
                          <div key={index} className={`text-sm ${textSecondary}`}>
                            • {access.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Company Benefits */}
                  {jobDetail.company_benefits && jobDetail.company_benefits.length > 0 && (
                    <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                      <h4 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                        <Building size={18} className="text-almet-sapphire" />
                        Company Benefits
                      </h4>
                      <div className="space-y-1">
                        {jobDetail.company_benefits.map((benefit, index) => (
                          <div key={index} className={`text-sm ${textSecondary}`}>
                            • {benefit.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  {(jobDetail.manual_employee_name || jobDetail.manual_employee_phone) && (
                    <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                      <h4 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                        <User size={18} className="text-almet-sapphire" />
                        Manual Employee Info
                      </h4>
                      <div className="space-y-2 text-sm">
                        {jobDetail.manual_employee_name && (
                          <div>
                            <span className={`font-medium ${textMuted}`}>Name:</span>
                            <p className={textPrimary}>{jobDetail.manual_employee_name}</p>
                          </div>
                        )}
                        {jobDetail.manual_employee_phone && (
                          <div>
                            <span className={`font-medium ${textMuted}`}>Phone:</span>
                            <p className={textPrimary}>{jobDetail.manual_employee_phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Comments Section */}
                  {(jobDetail.line_manager_comments || jobDetail.employee_comments) && (
                    <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                      <h4 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                        <AlertCircle size={18} className="text-almet-sapphire" />
                        Comments
                      </h4>
                      <div className="space-y-3">
                        {jobDetail.line_manager_comments && (
                          <div>
                            <span className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                              Line Manager Comments
                            </span>
                            <p className={`text-sm ${textSecondary} mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded`}>
                              {jobDetail.line_manager_comments}
                            </p>
                          </div>
                        )}
                        {jobDetail.employee_comments && (
                          <div>
                            <span className={`text-xs font-medium ${textMuted} uppercase tracking-wide`}>
                              Employee Comments
                            </span>
                            <p className={`text-sm ${textSecondary} mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded`}>
                              {jobDetail.employee_comments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer with Actions */}
              {selectedJob && (
                <div className="border-t border-gray-200 dark:border-almet-comet pt-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${textMuted}`}>
                        Last updated: {formatDate(jobDetail.updated_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Conditional action buttons based on status and permissions */}
                      {selectedJob.status === 'PENDING_EMPLOYEE' && selectedJob.can_approve && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              openApprovalModal(selectedJob, 'approve_employee');
                            }}
                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <CheckSquare size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              openApprovalModal(selectedJob, 'reject');
                            }}
                            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {isManager && selectedJob.status === 'PENDING_LINE_MANAGER' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              openApprovalModal(selectedJob, 'approve_manager');
                            }}
                            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <CheckSquare size={16} />
                            Approve as Manager
                          </button>
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              openApprovalModal(selectedJob, 'reject');
                            }}
                            className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          setJobDetail(null);
                        }}
                        className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors border border-gray-300 dark:border-gray-600 rounded-lg text-sm`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
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