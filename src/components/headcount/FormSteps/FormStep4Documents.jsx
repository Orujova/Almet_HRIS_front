// src/components/headcount/FormSteps/FormStep4Documents.jsx
import { useState } from "react";
import { Check, X, Upload, File } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Documents upload step of the employee form
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleDocumentUpload - Function to handle document uploads
 * @param {Function} props.removeDocument - Function to remove a document
 * @returns {JSX.Element} - Form step component
 */
const FormStep4Documents = ({ formData, handleDocumentUpload, removeDocument }) => {
  const { darkMode } = useTheme();
  const [dragActive, setDragActive] = useState(false);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  // Handle document drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle document drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleDocumentUpload(e);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) {
      return <File className="text-blue-500" size={14} />;
    } else if (fileType?.includes('pdf')) {
      return <File className="text-red-500" size={14} />;
    } else if (fileType?.includes('word') || fileType?.includes('document')) {
      return <File className="text-blue-700" size={14} />;
    } else if (fileType?.includes('excel') || fileType?.includes('sheet')) {
      return <File className="text-green-600" size={14} />;
    } else {
      return <File className="text-gray-500" size={14} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        <h2 className={`text-lg font-bold ${textPrimary}`}>
          Documents & Final Review
        </h2>
        <div className="text-xs px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded font-medium">
          Step 4 of 4
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <Check className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className={`text-xs font-medium text-green-800 dark:text-green-300`}>Almost Done!</h3>
            <p className={`text-xs text-green-600 dark:text-green-400 mt-0.5`}>
              Upload any relevant employee documents such as contracts, certificates, or resumes. All details can be edited later.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`border-2 border-dashed ${dragActive ? 'border-almet-sapphire bg-almet-sapphire/5' : borderColor} rounded-lg p-6 transition-colors duration-150`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={`w-10 h-10 ${textMuted} mb-3`} />
          <h3 className={`${textPrimary} text-sm font-medium mb-2`}>Drag & Drop Files Here</h3>
          <p className={`${textMuted} mb-3 max-w-md text-xs`}>
            Upload employee documents (CV, contract, certificates, ID documents, etc.)
          </p>
          <label className="cursor-pointer">
            <span className="inline-flex items-center justify-center px-3 py-2 bg-almet-sapphire hover:bg-almet-astral text-white text-xs font-medium rounded transition duration-150">
              <Upload size={12} className="mr-1" />
              Browse Files
            </span>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleDocumentUpload}
            />
          </label>
          <p className={`${textMuted} text-xs mt-2`}>
            Max. file size: 10MB | Supported formats: PDF, DOC, DOCX, JPG, PNG
          </p>
        </div>
      </div>

      {/* Document List */}
      {formData.documents && formData.documents.length > 0 && (
        <div className="mt-6">
          <h3 className={`text-sm font-medium ${textPrimary} mb-2`}>
            Uploaded Documents ({formData.documents.length})
          </h3>
          <div className="space-y-2">
            {formData.documents.map((doc, index) => (
              <div 
                key={doc.id || index} 
                className={`${bgCard} border ${borderColor} rounded-lg p-3 flex justify-between items-center transition-all duration-150 hover:shadow-sm`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-3 flex-shrink-0">
                    {getFileIcon(doc.type)}
                  </div>
                  <div>
                    <h4 className={`${textPrimary} font-medium text-xs`}>{doc.name}</h4>
                    <p className={`${textMuted} text-xs`}>
                      {doc.type || 'Unknown type'} • {formatFileSize(doc.size)} • {doc.dateUploaded ? new Date(doc.dateUploaded).toLocaleDateString() : 'Just now'}
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

      {/* Final Review Section */}
      <div className="mt-8 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center mb-2">
          <Check size={16} className="text-green-500 mr-2" />
          <h3 className={`text-green-800 dark:text-green-300 text-sm font-medium`}>Ready to Submit</h3>
        </div>
        <p className={`text-green-700 dark:text-green-400 text-xs mb-3`}>
          Please review all information before submitting. You can edit the employee's information at any time after submission.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Name</p>
            <p className={`${textPrimary} font-medium text-xs`}>{formData.firstName} {formData.lastName}</p>
          </div>
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Job Title</p>
            <p className={`${textPrimary} font-medium text-xs`}>{formData.jobTitle || 'Not specified'}</p>
          </div>
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Department</p>
            <p className={`${textPrimary} font-medium text-xs`}>{formData.department || 'Not specified'}</p>
          </div>
          <div className="p-2 bg-white dark:bg-gray-800 rounded">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Status</p>
            <p className={`${textPrimary} font-medium text-xs`}>{formData.status || 'ACTIVE'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep4Documents;