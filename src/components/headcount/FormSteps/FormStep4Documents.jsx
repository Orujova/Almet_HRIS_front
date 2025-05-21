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
      return <File className="text-blue-500" />;
    } else if (fileType?.includes('pdf')) {
      return <File className="text-red-500" />;
    } else if (fileType?.includes('word') || fileType?.includes('document')) {
      return <File className="text-blue-700" />;
    } else if (fileType?.includes('excel') || fileType?.includes('sheet')) {
      return <File className="text-green-600" />;
    } else {
      return <File className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className={`text-xl font-bold ${textPrimary}`}>
          Documents & Final Review
        </h2>
        <div className="text-sm px-3 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded-md font-medium">
          Step 4 of 4
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className={`text-sm font-medium text-green-800 dark:text-green-300`}>Almost Done!</h3>
            <p className={`text-sm text-green-600 dark:text-green-400 mt-0.5`}>
              Upload any relevant employee documents such as contracts, certificates, or resumes. All details can be edited later.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`border-2 border-dashed ${dragActive ? 'border-almet-sapphire bg-almet-sapphire/5' : borderColor} rounded-lg p-8 transition-colors duration-150`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={`w-14 h-14 ${textMuted} mb-4`} />
          <h3 className={`${textPrimary} text-lg font-medium mb-2`}>Drag & Drop Files Here</h3>
          <p className={`${textMuted} mb-4 max-w-md`}>
            Upload employee documents (CV, contract, certificates, ID documents, etc.)
          </p>
          <label className="cursor-pointer">
            <span className="inline-flex items-center justify-center px-4 py-2.5 bg-almet-sapphire hover:bg-almet-astral text-white font-medium rounded-md transition duration-150">
              <Upload size={16} className="mr-2" />
              Browse Files
            </span>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleDocumentUpload}
            />
          </label>
          <p className={`${textMuted} text-xs mt-3`}>
            Max. file size: 10MB | Supported formats: PDF, DOC, DOCX, JPG, PNG
          </p>
        </div>
      </div>

      {/* Document List */}
      {formData.documents && formData.documents.length > 0 && (
        <div className="mt-8">
          <h3 className={`text-lg font-medium ${textPrimary} mb-3`}>
            Uploaded Documents ({formData.documents.length})
          </h3>
          <div className="space-y-3">
            {formData.documents.map((doc, index) => (
              <div 
                key={doc.id || index} 
                className={`${bgCard} border ${borderColor} rounded-lg p-4 flex justify-between items-center transition-all duration-150 hover:shadow-md`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-almet-sapphire/10 dark:bg-almet-sapphire/20 flex items-center justify-center mr-4 flex-shrink-0">
                    {getFileIcon(doc.type)}
                  </div>
                  <div>
                    <h4 className={`${textPrimary} font-medium text-sm`}>{doc.name}</h4>
                    <p className={`${textMuted} text-xs`}>
                      {doc.type || 'Unknown type'} • {formatFileSize(doc.size)} • {doc.dateUploaded ? new Date(doc.dateUploaded).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                  title="Remove document"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Review Section */}
      <div className="mt-10 p-5 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="flex items-center mb-3">
          <Check size={20} className="text-green-500 mr-2" />
          <h3 className={`text-green-800 dark:text-green-300 text-lg font-medium`}>Ready to Submit</h3>
        </div>
        <p className={`text-green-700 dark:text-green-400 text-sm mb-4`}>
          Please review all information before submitting. You can edit the employee's information at any time after submission.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-md">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Name</p>
            <p className={`${textPrimary} font-medium`}>{formData.firstName} {formData.lastName}</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-md">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Job Title</p>
            <p className={`${textPrimary} font-medium`}>{formData.jobTitle || 'Not specified'}</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-md">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Department</p>
            <p className={`${textPrimary} font-medium`}>{formData.department || 'Not specified'}</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-md">
            <p className={`${textMuted} text-xs uppercase font-medium`}>Status</p>
            <p className={`${textPrimary} font-medium`}>{formData.status || 'ACTIVE'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep4Documents;