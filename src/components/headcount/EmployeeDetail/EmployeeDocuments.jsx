// src/components/headcount/EmployeeDetail/EmployeeDocuments.jsx
import { useState } from "react";
import { Download, File, Upload, Plus } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Documents component for employee detail page
 * @param {Object} props - Component props
 * @param {Array} props.documents - Employee documents
 * @param {Function} props.onAddDocument - Add document handler
 * @param {Function} props.onDownloadDocument - Download document handler
 * @returns {JSX.Element} - Employee documents component
 */
const EmployeeDocuments = ({ documents = [], onAddDocument, onDownloadDocument }) => {
  const { darkMode } = useTheme();
  const [dragActive, setDragActive] = useState(false);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const shadowClass = darkMode ? "" : "shadow-md";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300";
  const btnPrimary = darkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-600";

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get appropriate icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <File size={36} className="text-gray-500" />;
    
    if (fileType.includes('image')) {
      return <File size={36} className="text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <File size={36} className="text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <File size={36} className="text-blue-700" />;
    } else {
      return <File size={36} className="text-gray-500" />;
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (onAddDocument) {
        onAddDocument(e.dataTransfer.files);
      }
    }
  };

  // Handle file selection
  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      if (onAddDocument) {
        onAddDocument(e.target.files);
      }
    }
  };

  return (
    <div className={`${bgCard} rounded-lg p-6 ${shadowClass}`}>
      <h3 className={`text-lg font-medium ${textPrimary} mb-4 border-b ${borderColor} pb-2`}>
        Documents
      </h3>

      <div className="space-y-6">
        {/* Document upload area */}
        <div
          className={`border-2 border-dashed ${borderColor} rounded-lg p-6 flex flex-col items-center justify-center ${dragActive ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <Upload size={36} className={textMuted} />
          </div>
          <p className={`${textPrimary} text-center mb-2`}>
            Drag & Drop files here
          </p>
          <p className={`${textMuted} text-center mb-4`}>or</p>
          <label htmlFor="document-upload" className="cursor-pointer">
            <span className={`${btnPrimary} text-white px-4 py-2 rounded-md  flex items-center`}>
              <Plus size={16} className="mr-2" />
              Upload New Document
            </span>
            <input
              id="document-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleChange}
            />
          </label>
        </div>

        {/* Document list */}
        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div 
                key={doc.id || index} 
                className={`flex items-center justify-between p-3 rounded-md border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
              >
                <div className="flex items-center">
                  {getFileIcon(doc.type)}
                  <div className="ml-3">
                    <p className={`font-medium ${textPrimary}`}>{doc.name}</p>
                    <p className={`text-xs ${textMuted}`}>
                      {doc.type ? doc.type : 'Unknown type'} • {formatFileSize(doc.size)} • {doc.date ? new Date(doc.date).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDownloadDocument && onDownloadDocument(doc)}
                  className={`${btnSecondary} ${textPrimary} p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600`}
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center p-6 ${textMuted}`}>
            <p>No documents uploaded yet</p>
            <p className="text-sm mt-1">Upload employee documents such as contracts, CVs, or certificates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDocuments;