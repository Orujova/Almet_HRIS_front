'use client';
import React, { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, Download, MessageSquare } from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

export default function ResignationDetailModal({ resignation, onClose, onSuccess, userRole }) {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [action, setAction] = useState(''); // 'approve' or 'reject'
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  const canApprove = () => {
    if (userRole === 'admin') return true;
    if (userRole === 'manager' && resignation.status === 'PENDING_MANAGER') return true;
    return false;
  };

  const canHRApprove = () => {
    return userRole === 'admin' && resignation.status === 'PENDING_HR';
  };

  const handleApproval = async () => {
    if (!action) return;

    try {
      setProcessing(true);

      if (resignation.status === 'PENDING_MANAGER') {
        // Manager approval
        await resignationExitService.resignation.managerApprove(
          resignation.id,
          action,
          comments
        );
      } else if (resignation.status === 'PENDING_HR') {
        // HR approval
        await resignationExitService.resignation.hrApprove(
          resignation.id,
          action,
          comments
        );
      }

      alert(`Resignation ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      onSuccess && onSuccess();
      onClose();

    } catch (err) {
      console.error('Error processing resignation:', err);
      alert('Failed to process resignation. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-0.5">{label}</p>
      <p className="text-sm font-medium text-almet-cloud-burst dark:text-gray-200">{value || '-'}</p>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      'PENDING_MANAGER': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'MANAGER_APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'MANAGER_REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'PENDING_HR': 'bg-almet-mystic text-almet-sapphire dark:bg-almet-cloud-burst/30 dark:text-almet-steel-blue',
      'HR_APPROVED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'HR_REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'COMPLETED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {resignationExitService.helpers.getStatusText(status)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-pink-600 p-4 text-white flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold">Resignation Details</h2>
            <p className="text-red-100 mt-0.5 text-xs">
              {resignation.employee_name} - {resignation.employee_id}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Employee Information */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200 mb-3">
              Employee Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InfoItem label="Name" value={resignation.employee_name} />
              <InfoItem label="Employee ID" value={resignation.employee_id} />
              <InfoItem label="Position" value={resignation.position} />
              <InfoItem label="Department" value={resignation.department} />
            </div>
          </div>

          {/* Resignation Details */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200 mb-3">
              Resignation Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <InfoItem 
                label="Submission Date" 
                value={resignationExitService.helpers.formatDate(resignation.submission_date)} 
              />
              <InfoItem 
                label="Last Working Day" 
                value={resignationExitService.helpers.formatDate(resignation.last_working_day)} 
              />
              <InfoItem 
                label="Notice Period" 
                value={`${resignation.notice_period} days`} 
              />
              <InfoItem 
                label="Days Remaining" 
                value={`${resignation.days_remaining} days`} 
              />
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-almet-waterloo dark:text-almet-bali-hai">Status:</span>
              <StatusBadge status={resignation.status} />
            </div>
          </div>

          {/* Employee Comments */}
          {resignation.employee_comments && (
            <div className="p-3 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg border border-almet-sapphire/30">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200 mb-2 flex items-center gap-2">
                <MessageSquare size={16} className="text-almet-sapphire" />
                Employee Comments
              </h3>
              <p className="text-sm text-almet-cloud-burst dark:text-gray-300">
                {resignation.employee_comments}
              </p>
            </div>
          )}

          {/* Attached Document */}
          {resignation.resignation_letter && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200 mb-2">
                Attached Document
              </h3>
              <a 
                href={resignation.resignation_letter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-almet-sapphire hover:text-almet-astral transition-colors"
              >
                <FileText size={16} />
                View Resignation Letter
                <Download size={14} />
              </a>
            </div>
          )}

          {/* Manager Approval (if approved by manager) */}
          {resignation.manager_approved_at && (
            <div className={`p-3 rounded-lg border ${
              resignation.status === 'MANAGER_REJECTED' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            }`}>
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200 mb-2 flex items-center gap-2">
                {resignation.status === 'MANAGER_REJECTED' ? (
                  <XCircle size={16} className="text-red-600" />
                ) : (
                  <CheckCircle size={16} className="text-green-600" />
                )}
                Manager Decision
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <InfoItem 
                  label="Decision By" 
                  value={resignation.manager_approved_by_name} 
                />
                <InfoItem 
                  label="Decision Date" 
                  value={resignationExitService.helpers.formatDate(resignation.manager_approved_at)} 
                />
              </div>
              {resignation.manager_comments && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Comments:</p>
                  <p className="text-sm text-almet-cloud-burst dark:text-gray-300">
                    {resignation.manager_comments}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* HR Approval (if approved by HR) */}
          {resignation.hr_approved_at && (
            <div className={`p-3 rounded-lg border ${
              resignation.status === 'HR_REJECTED' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            }`}>
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200 mb-2 flex items-center gap-2">
                {resignation.status === 'HR_REJECTED' ? (
                  <XCircle size={16} className="text-red-600" />
                ) : (
                  <CheckCircle size={16} className="text-green-600" />
                )}
                HR Decision
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <InfoItem 
                  label="Decision By" 
                  value={resignation.hr_approved_by_name} 
                />
                <InfoItem 
                  label="Decision Date" 
                  value={resignationExitService.helpers.formatDate(resignation.hr_approved_at)} 
                />
              </div>
              {resignation.hr_comments && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Comments:</p>
                  <p className="text-sm text-almet-cloud-burst dark:text-gray-300">
                    {resignation.hr_comments}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Approval Form */}
          {(canApprove() || canHRApprove()) && !showApprovalForm && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAction('approve');
                  setShowApprovalForm(true);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Approve
              </button>
              <button
                onClick={() => {
                  setAction('reject');
                  setShowApprovalForm(true);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          )}

          {/* Approval Comments Form */}
          {showApprovalForm && (
            <div className={`p-4 rounded-lg border-2 ${
              action === 'approve' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                : 'bg-red-50 dark:bg-red-900/20 border-red-500'
            }`}>
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200 mb-3">
                {action === 'approve' ? 'Approve Resignation' : 'Reject Resignation'}
              </h3>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder="Add your comments here..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowApprovalForm(false);
                    setAction('');
                    setComments('');
                  }}
                  disabled={processing}
                  className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-xs font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproval}
                  disabled={processing}
                  className={`flex-1 px-3 py-2 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50 ${
                    action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {action === 'approve' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-5 py-3 flex justify-end border-t border-gray-200 dark:border-gray-600">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}