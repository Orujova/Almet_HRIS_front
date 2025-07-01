// src/components/headcount/FormSteps/FormStep4Documents.jsx - Enhanced with Optional File Upload
import { useState } from "react";
import { Check, X, Upload, File, AlertCircle, Info } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Documents upload step of the employee form - Optional file upload
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleDocumentUpload - Function to handle document uploads
 * @param {Function} props.removeDocument - Function to remove a document
 * @param {Object} props.validationErrors - Validation errors object
 * @returns {JSX.Element} - Form step component
 */
const FormStep4Documents = ({ 
  formData, 
  handleDocumentUpload, 
  removeDocument, 
  validationErrors = {} 
}) => {
  const { darkMode } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200";

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

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInput = (e) => {
    setUploadError("");
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Handle file upload with validation
  const handleFileUpload = (file) => {
    // File size validation (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    // File type validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only PDF, Word documents, images, and text files are allowed");
      return;
    }

    // Create document object
    const document = {
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      dateUploaded: new Date()
    };

    handleDocumentUpload(document);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('image')) return '🖼️';
    if (type.includes('text')) return '📄';
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Document Upload Section */}
      <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
          <File className="mr-1.5 text-almet-sapphire" size={16} />
          Employee Documents (Optional)
        </h3>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            dragActive
              ? "border-almet-sapphire bg-blue-50 dark:bg-blue-900/20"
              : `${borderColor} hover:border-almet-sapphire hover:bg-gray-50 dark:hover:bg-gray-700/50`
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className={`mx-auto h-8 w-8 ${textMuted} mb-2`} />
          <p className={`text-sm ${textPrimary} mb-1`}>
            Drop files here or click to browse
          </p>
          <p className={`text-xs ${textMuted} mb-3`}>
            PDF, Word, Images, Text files (Max 10MB each)
          </p>
          
          <input
            type="file"
            onChange={handleFileInput}
            className="hidden"
            id="document-upload"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
          />
          
          <label
            htmlFor="document-upload"
            className={`${btnSecondary} px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all inline-flex items-center`}
          >
            <Upload size={14} className="mr-1.5" />
            Choose Files
          </label>
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {validationErrors.documents && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.documents}</p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      {formData.documents && formData.documents.length > 0 && (
        <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
            Uploaded Documents ({formData.documents.length})
          </h3>
          
          <div className="space-y-2">
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 border ${borderColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <span className="text-lg mr-3">{getFileIcon(doc.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${textPrimary} truncate`}>
                      {doc.name}
                    </p>
                    <p className={`text-xs ${textMuted}`}>
                      {formatFileSize(doc.size)} • {doc.dateUploaded ? 
                        new Date(doc.dateUploaded).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                  title="Remove document"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className={`text-xs font-medium text-blue-800 dark:text-blue-300 mb-1`}>Document Guidelines</h3>
            <p className={`text-xs text-blue-600 dark:text-blue-400`}>
              Document upload is completely optional. You can upload contracts, certifications, ID copies, or any relevant employee documents. 
              Files are securely stored and can be managed after employee creation.
            </p>
          </div>
        </div>
      </div>

      {/* Final Review Section */}
      <div className="mt-8 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center mb-2">
          <Check size={16} className="text-green-500 mr-2" />
          <h3 className={`text-green-800 dark:text-green-300 text-sm font-medium`}>Ready to Submit</h3>
        </div>
        <p className={`text-green-700 dark:text-green-400 text-xs mb-3`}>
          Please review all information before submitting. You can edit the employee's information and upload additional documents at any time after submission.
        </p>
        
        {/* Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Name</p>
            <p className={`${textPrimary} font-medium text-xs`}>
              {formData.first_name} {formData.last_name}
            </p>
          </div>
          
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Job Title</p>
            <p className={`${textPrimary} font-medium text-xs`}>
              {formData.job_title || 'Not specified'}
            </p>
          </div>
          
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Position Group</p>
            <p className={`${textPrimary} font-medium text-xs`}>
              {formData.position_group_name || 'Not specified'}
            </p>
          </div>
          
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Contract</p>
            <p className={`${textPrimary} font-medium text-xs`}>
              {formData.contract_duration || 'PERMANENT'}
            </p>
          </div>
          
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Documents</p>
            <p className={`${textPrimary} font-medium text-xs`}>
              {formData.documents?.length || 0} uploaded
            </p>
          </div>
          
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Tags</p>
            <p className={`${textPrimary} font-medium text-xs`}>
              {formData.tag_ids?.length || 0} selected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep4Documents;