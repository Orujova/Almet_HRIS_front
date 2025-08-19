import React from 'react';
import { Download, X, Archive, AlertTriangle, Clock } from 'lucide-react';

const BulkExportModal = ({
  selectedJobs,
  onExport,
  onClose,
  exportLoading,
  darkMode
}) => {
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  const getExportTimeEstimate = (count) => {
    if (count <= 5) return "a few seconds";
    if (count <= 20) return "30-60 seconds";
    if (count <= 50) return "1-2 minutes";
    return "2-5 minutes";
  };

  const shouldShowWarning = selectedJobs.length > 20;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-lg w-full max-w-md border ${borderColor}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${shouldShowWarning ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'} rounded-lg`}>
                {shouldShowWarning ? (
                  <AlertTriangle className="text-orange-600" size={18} />
                ) : (
                  <Archive className="text-green-600" size={18} />
                )}
              </div>
              <h3 className={`text-md font-bold ${textPrimary}`}>
                Export Selected Job Descriptions
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={exportLoading}
              className={`p-1 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50`}
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className={`text-sm ${textSecondary} mb-4`}>
              You have selected <strong>{selectedJobs.length}</strong> job description(s) for export. 
              This will generate a single PDF file containing all selected job descriptions.
            </p>

            {/* Export Details */}
            <div className={`p-3 ${shouldShowWarning ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'} rounded-lg border`}>
              <h4 className={`font-medium ${shouldShowWarning ? 'text-orange-800 dark:text-orange-300' : 'text-gray-800 dark:text-gray-300'} mb-2 text-sm`}>
                Export Details:
              </h4>
              <div className={`text-xs ${shouldShowWarning ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-400'} space-y-1`}>
                <p>• <strong>Format:</strong> PDF Document</p>
                <p>• <strong>Content:</strong> Complete job descriptions with all sections</p>
                <p>• <strong>Organization:</strong> Each job on separate pages</p>
                <p>• <strong>Estimated time:</strong> {getExportTimeEstimate(selectedJobs.length)}</p>
                <p>• <strong>File name:</strong> bulk_job_descriptions_{new Date().toISOString().split('T')[0]}.pdf</p>
              </div>
            </div>

            {/* Warning for large exports */}
            {shouldShowWarning && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock size={14} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                      Large Export Notice
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      Exporting {selectedJobs.length} job descriptions may take several minutes. 
                      Please don't close this window during the export process.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {exportLoading && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                      Generating PDF...
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      Please wait while we prepare your download.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={exportLoading}
              className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50 text-sm`}
            >
              Cancel
            </button>
            <button
              onClick={onExport}
              disabled={exportLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
            >
              {exportLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <Download size={14} />
              {exportLoading ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkExportModal;