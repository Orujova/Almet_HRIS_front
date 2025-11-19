// components/JobDescription/AssignmentsModal.jsx - FIXED
import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Filter,
  Search
} from 'lucide-react';

const statusConfig = {
  DRAFT: {
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: FileText,
    label: 'Draft',
    bgLight: 'bg-gray-50'
  },
  PENDING_LINE_MANAGER: {
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: Clock,
    label: 'Pending Line Manager',
    bgLight: 'bg-amber-50'
  },
  PENDING_EMPLOYEE: {
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Clock,
    label: 'Pending Employee',
    bgLight: 'bg-blue-50'
  },
  APPROVED: {
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle,
    label: 'Approved',
    bgLight: 'bg-green-50'
  },
  REJECTED: {
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: XCircle,
    label: 'Rejected',
    bgLight: 'bg-red-50'
  },
  REVISION_REQUIRED: {
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: AlertCircle,
    label: 'Revision Required',
    bgLight: 'bg-purple-50'
  }
};

// Assignment Card komponenti
const AssignmentCard = ({ 
  assignment, 
  jobDescriptionId,
  onSubmit, 
  onApprove, 
  onReject, 
  onRemove, 
  onReassign,
  currentUser,
  expanded,
  onToggleExpand 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const config = statusConfig[assignment.status] || statusConfig.DRAFT;
  const StatusIcon = config.icon;

  const isVacancy = assignment.is_vacancy;
  const canSubmit = assignment.status === 'DRAFT' || assignment.status === 'REVISION_REQUIRED';
  const canApproveLM = assignment.can_be_approved_by_line_manager || 
    (assignment.status === 'PENDING_LINE_MANAGER' && assignment.reports_to?.user_id === currentUser?.id);
  const canApproveEmp = assignment.can_be_approved_by_employee || 
    (assignment.status === 'PENDING_EMPLOYEE' && assignment.employee?.user_id === currentUser?.id);

  const handleAction = async (action) => {
    setActionLoading(action);
    try {
      switch (action) {
        case 'submit':
          await onSubmit(jobDescriptionId, assignment.id, comment);
          break;
        case 'approve_lm':
          await onApprove(jobDescriptionId, assignment.id, 'line_manager', comment);
          break;
        case 'approve_emp':
          await onApprove(jobDescriptionId, assignment.id, 'employee', comment);
          break;
        case 'reject':
          if (!comment.trim()) {
            alert('Please provide a reason for rejection');
            setActionLoading(null);
            return;
          }
          await onReject(jobDescriptionId, assignment.id, comment);
          break;
        case 'remove':
          if (!window.confirm('Are you sure you want to remove this assignment?')) {
            setActionLoading(null);
            return;
          }
          await onRemove(jobDescriptionId, assignment.id);
          break;
      }
      setComment('');
      setShowComments(false);
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${config.bgLight} border-l-4 ${config.color.split(' ')[2]}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isVacancy ? (
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <UserX className="w-5 h-5 text-orange-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-gray-900">
                {isVacancy ? (
                  <span className="text-orange-600">
                    VACANT - {assignment.vacancy_position?.position_id || 'Unknown'}
                  </span>
                ) : (
                  assignment.employee_name || assignment.employee?.full_name || 'Unknown'
                )}
              </h4>
              <p className="text-sm text-gray-500">
                {!isVacancy && (assignment.employee_id_number || assignment.employee?.employee_id)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {config.label}
            </span>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t bg-white p-4 space-y-4">
          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4" />
              <span>Reports to: {assignment.reports_to_name || assignment.reports_to?.full_name || 'N/A'}</span>
            </div>
            
            {!isVacancy && assignment.employee?.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{assignment.employee.email}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Approval Timeline */}
          {(assignment.line_manager_approved_at || assignment.employee_approved_at) && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <h5 className="font-medium text-sm text-gray-700">Approval History</h5>
              
              {assignment.line_manager_approved_at && (
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-gray-700">
                      Line Manager approved
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(assignment.line_manager_approved_at).toLocaleString()}
                    </p>
                    {assignment.line_manager_comments && (
                      <p className="text-gray-600 text-xs mt-1 italic">
                        "{assignment.line_manager_comments}"
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {assignment.employee_approved_at && (
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-gray-700">
                      Employee approved
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(assignment.employee_approved_at).toLocaleString()}
                    </p>
                    {assignment.employee_comments && (
                      <p className="text-gray-600 text-xs mt-1 italic">
                        "{assignment.employee_comments}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Input */}
          {showComments && (
            <div className="space-y-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {canSubmit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (showComments) {
                    handleAction('submit');
                  } else {
                    setShowComments(true);
                  }
                }}
                disabled={actionLoading === 'submit'}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'submit' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit for Approval
              </button>
            )}

            {canApproveLM && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showComments) {
                      handleAction('approve_lm');
                    } else {
                      setShowComments(true);
                    }
                  }}
                  disabled={actionLoading === 'approve_lm'}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === 'approve_lm' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showComments && comment.trim()) {
                      handleAction('reject');
                    } else {
                      setShowComments(true);
                    }
                  }}
                  disabled={actionLoading === 'reject'}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === 'reject' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject
                </button>
              </>
            )}

            {canApproveEmp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (showComments) {
                    handleAction('approve_emp');
                  } else {
                    setShowComments(true);
                  }
                }}
                disabled={actionLoading === 'approve_emp'}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'approve_emp' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve as Employee
              </button>
            )}

            {isVacancy && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReassign(assignment.id);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                Assign Employee
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('remove');
              }}
              disabled={actionLoading === 'remove'}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors ml-auto"
            >
              {actionLoading === 'remove' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Modal Component
const AssignmentsModal = ({
  isOpen,
  onClose,
  job,
  assignmentsData,
  onSubmitAssignment,
  onSubmitAll,
  onApprove,
  onReject,
  onRemoveAssignment,
  onReassignEmployee,
  onAddAssignments,
  onRefresh,
  currentUser,
  actionLoading = false
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !job || !assignmentsData) return null;

  const assignments = assignmentsData.assignments || [];
  const summary = assignmentsData.assignments_summary || assignmentsData.summary || {
    total: 0,
    employees: 0,
    vacancies: 0,
    approved: 0,
    pending: 0,
    draft: 0
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      (a.employee_name || a.employee?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.employee_id_number || a.employee?.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                Assignments
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {job.job_title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Summary Stats */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-indigo-600">{summary.employees}</p>
                <p className="text-xs text-gray-500">Employees</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-orange-600">{summary.vacancies}</p>
                <p className="text-xs text-gray-500">Vacancies</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
                <p className="text-xs text-gray-500">Approved</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-amber-600">{summary.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-2xl font-bold text-gray-600">{summary.draft}</p>
                <p className="text-xs text-gray-500">Draft</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-3 border-b flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_LINE_MANAGER">Pending LM</option>
              <option value="PENDING_EMPLOYEE">Pending Employee</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REVISION_REQUIRED">Revision Required</option>
            </select>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={actionLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-500 ${actionLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* Assignments List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {actionLoading && assignments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No assignments found</p>
                {(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="text-indigo-600 text-sm mt-2 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  jobDescriptionId={job.id}
                  onSubmit={onSubmitAssignment}
                  onApprove={onApprove}
                  onReject={onReject}
                  onRemove={onRemoveAssignment}
                  onReassign={onReassignEmployee}
                  currentUser={currentUser}
                  expanded={expandedId === assignment.id}
                  onToggleExpand={() => setExpandedId(
                    expandedId === assignment.id ? null : assignment.id
                  )}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                Showing {filteredAssignments.length} of {assignments.length} assignments
              </p>
              {summary.draft > 0 && onSubmitAll && (
                <button
                  onClick={() => onSubmitAll(job.id)}
                  disabled={actionLoading}
                  className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit All ({summary.draft})
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsModal;