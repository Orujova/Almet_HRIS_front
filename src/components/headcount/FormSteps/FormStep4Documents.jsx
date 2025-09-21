// src/components/headcount/FormSteps/FormStep4Documents.jsx - FIXED: Runtime error resolved
import { useState } from "react";
import { Check, X, Upload, File, AlertCircle, Info, FileText, Award, IdCard, Heart } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * FIXED Documents upload step - resolved document.getElementById runtime error
 */
const FormStep4Documents = ({ 
  formData, 
  handleDocumentUpload, 
  removeDocument, 
  validationErrors = {},
  documentTypes = [],
  fileInputRef = null // FIXED: Accept ref from parent component
}) => {
  const { darkMode } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("OTHER");
  const [documentName, setDocumentName] = useState("");

  // Theme-dependent classes with Almet colors
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-bali-hai";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-almet-mystic";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
    : "bg-almet-mystic hover:bg-almet-bali-hai/20 text-almet-cloud-burst border border-almet-bali-hai";

  // Default document types if not provided
  const defaultDocumentTypes = [
    { value: "CONTRACT", label: "Contract" },
    { value: "ID", label: "ID Document" },
    { value: "CERTIFICATE", label: "Certificate" },
    { value: "CV", label: "CV/Resume" },
    { value: "PERFORMANCE", label: "Performance" },
    { value: "MEDICAL", label: "Medical" },
    { value: "TRAINING", label: "Training" },
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

    // File type validation
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
      setUploadError("Only PDF, Word, Excel, images, and text files are allowed");
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
    
    // FIXED: Use ref instead of document.getElementById
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // FIXED: Handle document removal with ref
  const handleRemoveDocument = (index) => {
    removeDocument(index);
    
    // FIXED: Clear file input using ref
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = '';
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
    const iconProps = { className: "h-4 w-4" };
    
    switch (documentType) {
      case 'CONTRACT':
        return <FileText {...iconProps} className="h-4 w-4 text-almet-sapphire" />;
      case 'ID':
        return <IdCard {...iconProps} className="h-4 w-4 text-purple-500" />;
      case 'CERTIFICATE':
        return <Award {...iconProps} className="h-4 w-4 text-yellow-500" />;
      case 'CV':
        return <FileText {...iconProps} className="h-4 w-4 text-green-500" />;
      case 'MEDICAL':
        return <Heart {...iconProps} className="h-4 w-4 text-red-500" />;
      default:
        if (type.includes('pdf')) return <FileText {...iconProps} className="h-4 w-4 text-red-500" />;
        if (type.includes('word') || type.includes('document')) return <FileText {...iconProps} className="h-4 w-4 text-almet-steel-blue" />;
        if (type.includes('image')) return <File {...iconProps} className="h-4 w-4 text-green-500" />;
        return <File {...iconProps} className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get document type badge color
  const getDocumentTypeBadge = (type) => {
    const colors = {
      'CONTRACT': 'bg-almet-sapphire/10 text-almet-sapphire',
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-almet-bali-hai dark:border-gray-700 pb-2 mb-4">
        <h2 className={`text-base font-bold ${textPrimary}`}>
          Documents & Files
        </h2>
        <div className="text-[10px] px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire rounded font-medium">
          Step 4 of 4 (Optional)
        </div>
      </div>

      {/* Document Upload Section */}
      <div className={`${bgCard} rounded-md p-4 border ${borderColor}`}>
        <h3 className={`text-xs font-semibold ${textPrimary} mb-3 flex items-center`}>
          <File className="mr-1 text-almet-sapphire" size={12} />
          Upload Documents
        </h3>

        {/* Document Type and Name Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <FormField
            label="Document Type"
            name="document_type"
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            type="select"
            options={availableDocumentTypes}
            required={false}
            helpText="Document category"
          />

          <FormField
            label="Document Name (Optional)"
            name="document_name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Custom name"
            helpText="Leave blank for original filename"
          />
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center transition-colors duration-200 ${
            dragActive
              ? "border-almet-sapphire bg-almet-sapphire/5 dark:bg-blue-900/20"
              : `${borderColor} hover:border-almet-sapphire hover:bg-almet-mystic/50 dark:hover:bg-gray-700/50`
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className={`mx-auto h-8 w-8 ${textMuted} mb-3`} />
          <p className={`text-sm font-medium ${textPrimary} mb-1`}>
            Drop files here or click to browse
          </p>
          <p className={`text-xs ${textMuted} mb-3`}>
            PDF, Word, Excel, Images, Text (Max 10MB)
          </p>
          
          {/* FIXED: Use ref instead of id */}
          <input
            type="file"
            onChange={handleFileInput}
            className="hidden"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.txt"
          />
          
          <label
            htmlFor=""
            onClick={() => fileInputRef?.current?.click()}
            className={`${btnSecondary} px-4 py-2 rounded-md text-xs font-medium cursor-pointer transition-all inline-flex items-center hover:shadow-sm`}
          >
            <Upload size={10} className="mr-1" />
            Choose Files
          </label>
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {validationErrors.documents && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{validationErrors.documents}</p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      {formData.documents && formData.documents.length > 0 && (
        <div className={`${bgCard} rounded-md p-4 border ${borderColor}`}>
          <h3 className={`text-xs font-semibold ${textPrimary} mb-3`}>
            Uploaded Documents ({formData.documents.length})
          </h3>
          
          <div className="space-y-2">
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 border ${borderColor} rounded-md hover:bg-almet-mystic/50 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="mr-3">
                    {getFileIcon(doc.type, doc.document_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-xs font-medium ${textPrimary} truncate`}>
                        {doc.document_name || doc.name}
                      </p>
                      <span className={`px-1.5 py-0.5 text-[9px] rounded ${getDocumentTypeBadge(doc.document_type)}`}>
                        {availableDocumentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                      </span>
                    </div>
                    <p className={`text-[10px] ${textMuted}`}>
                      {formatFileSize(doc.size)} • {doc.dateUploaded ? 
                        new Date(doc.dateUploaded).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDocument(index)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-600 transition-colors"
                  title="Remove document"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


 
    </div>
  );
};

export default FormStep4Documents;