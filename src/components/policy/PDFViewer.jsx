import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Eye,
  Download,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/common/Toast";
import PolicyAcknowledgmentsList from "./PolicyAcknowledgmentsList";
import {
  trackPolicyDownload,
  acknowledgePolicy,
  getPoliciesByFolder,
} from "@/services/policyService";

export default function PDFViewer({
  selectedPolicy,
  selectedFolder,
  selectedCompany,
  darkMode,
  onBack,
}) {
  const { showSuccess, showError } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState("document");
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgeNotes, setAcknowledgeNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [policy, setPolicy] = useState(selectedPolicy);

  // Refresh policy data when component mounts to get updated stats
  useEffect(() => {
    const refreshPolicyData = async () => {
      try {
        const data = await getPoliciesByFolder(selectedFolder.id);
        const updatedPolicy = data.find(p => p.id === selectedPolicy.id);
        if (updatedPolicy) {
          setPolicy(updatedPolicy);
        }
      } catch (err) {
        console.error('Error refreshing policy data:', err);
      }
    };
    
    refreshPolicyData();
  }, [selectedPolicy.id, selectedFolder.id]);

  // Get PDF URL for iframe
  const getPDFUrl = () => {
    const url = policy.policy_url || policy.policy_file;
    if (!url) return null;
    
    // Handle Google Drive URLs
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      return url.includes('?') ? `${url}&output=embed` : `${url}?output=embed`;
    }
    
    return url;
  };

  // Download PDF handler
  const handleDownloadPDF = async () => {
    try {
      await trackPolicyDownload(policy.id);
      
      const link = document.createElement("a");
      link.href = policy.policy_url || policy.policy_file;
      link.download = `${policy.title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess("Download started!");
      
      // Refresh policy data after download
      const data = await getPoliciesByFolder(selectedFolder.id);
      const updatedPolicy = data.find(p => p.id === policy.id);
      if (updatedPolicy) {
        setPolicy(updatedPolicy);
      }
    } catch (err) {
      console.error('Error downloading:', err);
      showError("Failed to download policy");
    }
  };

  // Acknowledge policy handler
  const handleAcknowledge = async () => {
    setSubmitting(true);
    try {
      await acknowledgePolicy(policy.id, acknowledgeNotes);
      showSuccess("Policy acknowledged successfully!");
      setAcknowledgeNotes("");
      setShowAcknowledgeModal(false);
      
      // Refresh policy data after acknowledgment
      const data = await getPoliciesByFolder(selectedFolder.id);
      const updatedPolicy = data.find(p => p.id === policy.id);
      if (updatedPolicy) {
        setPolicy(updatedPolicy);
      }
    } catch (err) {
      showError(err.message || "Failed to acknowledge policy");
    } finally {
      setSubmitting(false);
    }
  };

  const pdfUrl = getPDFUrl();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}>
        {/* Left Section - Back Button and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${
              darkMode
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-all`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              darkMode ? 'bg-almet-sapphire/10 text-almet-astral' : 'bg-almet-mystic text-almet-sapphire'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {policy.title}
              </h2>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {selectedCompany.name} • {selectedFolder.name}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Tabs and Actions */}
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className={`flex border-b ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => setActiveTab("document")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "document"
                  ? darkMode
                    ? 'border-almet-sapphire text-white'
                    : 'border-almet-sapphire text-almet-sapphire'
                  : darkMode
                    ? 'border-transparent text-gray-400 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Document
            </button>
            
            {policy.requires_acknowledgment && (
              <button
                onClick={() => setActiveTab("acknowledgments")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "acknowledgments"
                    ? darkMode
                      ? 'border-almet-sapphire text-white'
                      : 'border-almet-sapphire text-almet-sapphire'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Acknowledgments
              </button>
            )}
          </div>
          
          {/* Stats Badge */}
          <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
          }`}>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{policy.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{policy.download_count || 0}</span>
            </div>
          </div>

          {/* Acknowledge Button */}
          {policy.requires_acknowledgment && (
            <button
              onClick={() => setShowAcknowledgeModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Acknowledge
            </button>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-almet-sapphire text-white hover:bg-almet-cloud-burst transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Content Area - PDF Viewer OR Acknowledgments List */}
      <div className={`flex-1 overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {activeTab === "document" ? (
          // PDF Document Tab
          pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={policy.title}
              style={{ border: 'none' }}
              loading="lazy"
            />
          ) : (
            // No PDF Available
            <div className={`flex items-center justify-center h-full ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">PDF file not available</p>
              </div>
            </div>
          )
        ) : (
          // Acknowledgments Tab - BURDA İSTİFADƏ OLUNUR
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Policy Acknowledgments
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  List of employees who have acknowledged this policy
                </p>
              </div>
              {/* PolicyAcknowledgmentsList komponenti burda istifadə olunur */}
              <PolicyAcknowledgmentsList policyId={policy.id} darkMode={darkMode} />
            </div>
          </div>
        )}
      </div>

      {/* Acknowledge Modal */}
      {showAcknowledgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-lg p-6 ${
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Acknowledge Policy
              </h3>
              <button
                onClick={() => {
                  setShowAcknowledgeModal(false);
                  setAcknowledgeNotes("");
                }}
                className={`p-1 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mb-4">
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                By acknowledging this policy, you confirm that you have read and understood its contents.
              </p>

              {/* Policy Title Badge */}
              <div className={`p-3 rounded-lg mb-4 ${
                darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                  {policy.title}
                </p>
              </div>

              {/* Notes Textarea */}
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes (Optional)
              </label>
              <textarea
                placeholder="Add any comments or questions..."
                value={acknowledgeNotes}
                onChange={(e) => setAcknowledgeNotes(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50`}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAcknowledgeModal(false);
                  setAcknowledgeNotes("");
                }}
                disabled={submitting}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } disabled:opacity-50 transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <CheckCircle className="w-4 h-4" />
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}