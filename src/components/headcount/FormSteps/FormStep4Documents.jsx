// src/components/headcount/FormSteps/FormStep4Documents.jsx - Enhanced with Document Types
import { useState } from "react";
import { Check, X, Upload, File, AlertCircle, Info, FileText, Award, IdCard, Heart } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * Documents upload step of the employee form - Enhanced with document types
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleDocumentUpload - Function to handle document uploads
 * @param {Function} props.removeDocument - Function to remove a document
 * @param {Object} props.validationErrors - Validation errors object
 * @param {Array} props.documentTypes - Available document types from API
 * @returns {JSX.Element} - Form step component
 */
const FormStep4Documents = ({ 
  formData, 
  handleDocumentUpload, 
  removeDocument, 
  validationErrors = {},
  documentTypes = []
}) => {
  const { darkMode } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("OTHER");
  const [documentName, setDocumentName] = useState("");

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200";

  // Default document types if not provided
  const defaultDocumentTypes = [
    { value: "CONTRACT", label: "Contract" },
    { value: "ID", label: "ID Document" },
    { value: "CERTIFICATE", label: "Certificate" },
    { value: "CV", label: "CV/Resume" },
    { value: "PERFORMANCE", label: "Performance Document" },
    { value: "MEDICAL", label: "Medical Document" },
    { value: "TRAINING", label: "Training Document" },
    { value: "OTHER", label: "Other" }
  ];

  const availableDocumentTypes = documentTypes.length > 0 ? documentTypes : defaultDocumentTypes;

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

    // File type validation - match API requirements
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only PDF, Word documents, Excel files, images, and text files are allowed");
      return;
    }

    // Create document object
    const document = {
      name: documentName || file.name,
      document_name: documentName || file.name,
      document_type: selectedDocumentType,
      size: file.size,
      type: file.type,
      file: file,
      dateUploaded: new Date()
    };

    handleDocumentUpload(document);
    
    // Reset form
    setDocumentName("");
    setSelectedDocumentType("OTHER");
    
    // Clear file input
    const fileInput = document.getElementById('document-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on type and document type
  const getFileIcon = (type, documentType) => {
    // First check document type
    switch (documentType) {
      case 'CONTRACT':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'ID':
        return <IdCard className="h-5 w-5 text-purple-500" />;
      case 'CERTIFICATE':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'CV':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'MEDICAL':
        return <Heart className="h-5 w-5 text-red-500" />;
      default:
        // Fallback to file type
        if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
        if (type.includes('word') || type.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
        if (type.includes('image')) return <File className="h-5 w-5 text-green-500" />;
        if (type.includes('text')) return <FileText className="h-5 w-5 text-gray-500" />;
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get document type badge color
  const getDocumentTypeBadge = (type) => {
    const colors = {
      'CONTRACT': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'ID': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'CERTIFICATE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'CV': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'PERFORMANCE': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'MEDICAL': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'TRAINING': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
      'OTHER': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[type] || colors['OTHER'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
        <h2 className={`text-lg font-bold ${textPrimary}`}>
          Documents & Files
        </h2>
        <div className="text-xs px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded font-medium">
          Step 4 of 4 (Optional)
        </div>
      </div>

      {/* Document Upload Section */}
      <div className={`${bgCard} rounded-lg p-6 border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-4 flex items-center`}>
          <File className="mr-2 text-almet-sapphire" size={16} />
          Upload Employee Documents
        </h3>

        {/* Document Type and Name Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <FormField
            label="Document Type"
            name="document_type"
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            type="select"
            options={availableDocumentTypes}
            required={false}
            helpText="Select the type of document you're uploading"
          />

          <FormField
            label="Document Name (Optional)"
            name="document_name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Custom name for this document"
            helpText="Leave blank to use the original filename"
          />
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            dragActive
              ? "border-almet-sapphire bg-blue-50 dark:bg-blue-900/20"
              : `${borderColor} hover:border-almet-sapphire hover:bg-gray-50 dark:hover:bg-gray-700/50`
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className={`mx-auto h-12 w-12 ${textMuted} mb-4`} />
          <p className={`text-lg font-medium ${textPrimary} mb-2`}>
            Drop files here or click to browse
          </p>
          <p className={`text-sm ${textMuted} mb-4`}>
            PDF, Word, Excel, Images, Text files (Max 10MB each)
          </p>
          
          <input
            type="file"
            onChange={handleFileInput}
            className="hidden"
            id="document-upload"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.txt"
          />
          
          <label
            htmlFor="document-upload"
            className={`${btnSecondary} px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all inline-flex items-center hover:shadow-sm`}
          >
            <Upload size={16} className="mr-2" />
            Choose Files
          </label>
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {validationErrors.documents && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.documents}</p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      {formData.documents && formData.documents.length > 0 && (
        <div className={`${bgCard} rounded-lg p-6 border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-4`}>
            Uploaded Documents ({formData.documents.length})
          </h3>
          
          <div className="space-y-3">
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 border ${borderColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="mr-4">
                    {getFileIcon(doc.type, doc.document_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${textPrimary} truncate`}>
                        {doc.document_name || doc.name}
                      </p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getDocumentTypeBadge(doc.document_type)}`}>
                        {availableDocumentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                      </span>
                    </div>
                    <p className={`text-xs ${textMuted}`}>
                      {formatFileSize(doc.size)} • {doc.dateUploaded ? 
                        new Date(doc.dateUploaded).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                  title="Remove document"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className={`text-sm font-medium text-blue-800 dark:text-blue-300 mb-2`}>
              Document Upload Guidelines
            </h3>
            <div className={`text-sm text-blue-600 dark:text-blue-400 space-y-1`}>
              <p>• Document upload is completely optional but recommended for complete records</p>
              <p>• You can upload contracts, certifications, ID copies, CVs, or any relevant employee documents</p>
              <p>• Files are securely stored and can be managed after employee creation</p>
              <p>• Supported formats: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), Images (JPG, PNG, GIF, BMP), Text files</p>
              <p>• Maximum file size: 10MB per document</p>
              <p>• Documents can be categorized by type for better organization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Type Descriptions */}
      <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
        <h4 className={`text-sm font-medium ${textPrimary} mb-3`}>Document Type Descriptions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-20 text-blue-600 dark:text-blue-400 font-medium">CONTRACT:</span>
              <span className={textMuted}>Employment contracts, agreements</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-purple-600 dark:text-purple-400 font-medium">ID:</span>
              <span className={textMuted}>Identity documents, passports</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-yellow-600 dark:text-yellow-400 font-medium">CERTIFICATE:</span>
              <span className={textMuted}>Certifications, diplomas</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-green-600 dark:text-green-400 font-medium">CV:</span>
              <span className={textMuted}>Resumes, curriculum vitae</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-20 text-indigo-600 dark:text-indigo-400 font-medium">PERFORMANCE:</span>
              <span className={textMuted}>Performance reviews, evaluations</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-red-600 dark:text-red-400 font-medium">MEDICAL:</span>
              <span className={textMuted}>Medical certificates, health records</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-teal-600 dark:text-teal-400 font-medium">TRAINING:</span>
              <span className={textMuted}>Training certificates, course materials</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-gray-600 dark:text-gray-400 font-medium">OTHER:</span>
              <span className={textMuted}>Any other relevant documents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep4Documents;