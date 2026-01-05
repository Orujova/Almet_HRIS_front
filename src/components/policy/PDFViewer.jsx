import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Eye,
  Download,
  CheckCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from "@/components/common/Toast";
import PolicyAcknowledgmentsList from "./PolicyAcknowledgmentsList";
import {
  trackPolicyDownload,
  acknowledgePolicy,
  getPoliciesByFolder,
  getPolicyAcknowledgments,
} from "@/services/policyService";

// ✅ PDF.js worker setup - DÜZGÜN YOLLA
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
}

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
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [checkingAcknowledgment, setCheckingAcknowledgment] = useState(false);
  const [showReadCompletePrompt, setShowReadCompletePrompt] = useState(false);

  // PDF.js states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);

  // Refresh policy data
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

  // Check if current user has acknowledged
  useEffect(() => {
    const checkUserAcknowledgment = async () => {
      if (!policy.requires_acknowledgment) return;
      
      setCheckingAcknowledgment(true);
      try {
        const currentUserEmail = localStorage.getItem('user_email');
        if (!currentUserEmail) {
          setCheckingAcknowledgment(false);
          return;
        }

        const data = await getPolicyAcknowledgments(policy.id);
        const acknowledgments = Array.isArray(data?.results) ? data.results : [];
        
        const userAcknowledged = acknowledgments.some(
          ack => ack.employee_email === currentUserEmail
        );
        
        setHasAcknowledged(userAcknowledged);
      } catch (err) {
        console.error('Error checking acknowledgment:', err);
      } finally {
        setCheckingAcknowledgment(false);
      }
    };

    checkUserAcknowledgment();
  }, [policy.id, policy.requires_acknowledgment]);

  // Check if user reached last page
  useEffect(() => {
    if (numPages && pageNumber === numPages && !hasAcknowledged && policy.requires_acknowledgment) {
      const timer = setTimeout(() => {
        setShowReadCompletePrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [pageNumber, numPages, hasAcknowledged, policy.requires_acknowledgment]);

  // Get PDF URL
  const getPDFUrl = () => {
    const url = policy.policy_url || policy.policy_file;
    if (!url) return null;
    
    // For Google Drive URLs
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/[-\w]{25,}/);
      if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId[0]}`;
      }
    }
    
    return url;
  };

  // PDF Document handlers
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF document');
    setPdfLoading(false);
  };

  // Download handler
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

  // Acknowledge handler
  const handleAcknowledge = async () => {
    setSubmitting(true);
    try {
      await acknowledgePolicy(policy.id, acknowledgeNotes);
      showSuccess("Policy acknowledged successfully!");
      setAcknowledgeNotes("");
      setShowAcknowledgeModal(false);
      setHasAcknowledged(true);
      setShowReadCompletePrompt(false);
      
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
              darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'
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

        <div className="flex items-center gap-2">
          <div className={`flex border-b ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => setActiveTab("document")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "document"
                  ? darkMode
                    ? 'border-blue-500 text-white'
                    : 'border-blue-600 text-blue-600'
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
                      ? 'border-blue-500 text-white'
                      : 'border-blue-600 text-blue-600'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Acknowledgments
              </button>
            )}
          </div>
          
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

          {policy.requires_acknowledgment && (
            <button
              onClick={() => setShowAcknowledgeModal(true)}
              disabled={hasAcknowledged || checkingAcknowledgment}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                hasAcknowledged
                  ? darkMode 
                    ? 'bg-green-900/30 text-green-400 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title={hasAcknowledged ? "You have already acknowledged this policy" : "Acknowledge this policy"}
            >
              <CheckCircle className="w-4 h-4" />
              {checkingAcknowledgment ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking...
                </span>
              ) : hasAcknowledged ? (
                "Already Acknowledged"
              ) : (
                "Acknowledge"
              )}
            </button>
          )}

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {activeTab === "document" ? (
          <div className="relative w-full h-full flex flex-col">
            {pdfUrl ? (
              <>
                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto flex items-start justify-center p-4">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-lg"
                      width={Math.min(typeof window !== 'undefined' ? window.innerWidth - 100 : 800, 800)}
                    />
                  </Document>
                </div>

                {/* Page Navigation */}
                {numPages && (
                  <div className={`border-t py-3 px-4 flex items-center justify-center gap-4 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <button
                      onClick={() => setPageNumber(pageNumber - 1)}
                      disabled={pageNumber <= 1}
                      className={`p-2 rounded-lg transition-all ${
                        pageNumber <= 1
                          ? 'opacity-50 cursor-not-allowed'
                          : darkMode
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Page {pageNumber} of {numPages}
                    </span>
                    
                    <button
                      onClick={() => setPageNumber(pageNumber + 1)}
                      disabled={pageNumber >= numPages}
                      className={`p-2 rounded-lg transition-all ${
                        pageNumber >= numPages
                          ? 'opacity-50 cursor-not-allowed'
                          : darkMode
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Read Complete Prompt */}
                {showReadCompletePrompt && !hasAcknowledged && policy.requires_acknowledgment && (
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 animate-bounce max-w-md w-full px-4">
                    <div className={`rounded-lg shadow-2xl p-4 border-2 ${
                      darkMode 
                        ? 'bg-gray-800 border-green-600 text-white' 
                        : 'bg-white border-green-500 text-gray-900'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-green-500 text-white flex-shrink-0">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">You've reached the end!</h4>
                          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            You've read through the entire policy. Please acknowledge that you've understood it.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setShowReadCompletePrompt(false);
                                setShowAcknowledgeModal(true);
                              }}
                              className="flex-1 px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                            >
                              Acknowledge Now
                            </button>
                            <button
                              onClick={() => setShowReadCompletePrompt(false)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                darkMode 
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Later
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowReadCompletePrompt(false)}
                          className={`p-1 rounded-lg flex-shrink-0 ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {pdfError && (
                  <div className={`absolute inset-0 flex items-center justify-center ${
                    darkMode ? 'bg-gray-900' : 'bg-gray-100'
                  }`}>
                    <div className="text-center">
                      <FileText className={`w-12 h-12 mx-auto mb-3 opacity-50 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {pdfError}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={`flex items-center justify-center h-full ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">PDF file not available</p>
                </div>
              </div>
            )}
          </div>
        ) : (
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

            <div className="mb-4">
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                By acknowledging this policy, you confirm that you have read and understood its contents.
              </p>

              <div className={`p-3 rounded-lg mb-4 ${
                darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                  {policy.title}
                </p>
              </div>

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
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              />
            </div>

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