import React from 'react';
import { CheckCircle, Send, X } from 'lucide-react';

const SubmissionModal = ({
  createdJobId,
  isExistingJobSubmission,
  submissionComments,
  submissionLoading,
  onCommentsChange,
  onSubmitForApproval,
  onKeepAsDraft,
  onClose,
  darkMode
}) => {
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-lg w-full max-w-md border ${borderColor}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 ${isExistingJobSubmission ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'} rounded-lg`}>
              {isExistingJobSubmission ? (
                <Send className="text-blue-600" size={18} />
              ) : (
                <CheckCircle className="text-green-600" size={18} />
              )}
            </div>
            <h3 className={`text-md font-bold ${textPrimary}`}>
              {isExistingJobSubmission ? 'Submit Job Description for Approval' : 'Job Description Created Successfully!'}
            </h3>
          </div>
          
          <p className={`text-sm ${textSecondary} mb-4`}>
            {isExistingJobSubmission 
              ? 'Submit this job description for approval workflow.'
              : 'Your job description has been saved as a draft. Would you like to submit it for approval workflow now?'
            }
          </p>

          <div className="mb-4">
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Comments (optional):
            </label>
            <textarea
              value={submissionComments}
              onChange={(e) => onCommentsChange(e.target.value)}
              rows="3"
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
              placeholder="Add any comments for the approval workflow..."
            />
          </div>

          {/* Workflow Information */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 text-sm">
              Approval Workflow Process:
            </h4>
            <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <p>1. <strong>Line Manager Review:</strong> Direct supervisor approval</p>
              <p>2. <strong>Employee Confirmation:</strong> Employee acknowledges job description</p>
              <p>3. <strong>Final Approval:</strong> Job description becomes active</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {!isExistingJobSubmission && (
              <button
                onClick={onKeepAsDraft}
                disabled={submissionLoading}
                className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm`}
              >
                Keep as Draft
              </button>
            )}
            <button
              onClick={onClose}
              disabled={submissionLoading}
              className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm`}
            >
              Cancel
            </button>
            <button
              onClick={onSubmitForApproval}
              disabled={submissionLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {submissionLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;