// components/jobDescription/BulkUploadModal.jsx
import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  FileText,
  Users,
  Info
} from 'lucide-react';

const BulkUploadModal = ({
  isOpen,
  onClose,
  onUploadComplete,
  darkMode = false
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadOptions, setUploadOptions] = useState({
    auto_assign_employees: true,
    skip_duplicates: true
  });
  
  const fileInputRef = useRef(null);

  const bgModal = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    setFile(selectedFile);
    setUploadResult(null);
    setValidationResult(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const jobDescriptionService = (await import('@/services/jobDescriptionService')).default;
      await jobDescriptionService.downloadBulkUploadTemplate();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Error downloading template. Please try again.');
    }
  };

  const handleValidate = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }
    
    try {
      setValidating(true);
      const jobDescriptionService = (await import('@/services/jobDescriptionService')).default;
      const result = await jobDescriptionService.validateBulkUpload(file);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Validation failed. Please check the file format and try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }
    
    try {
      setUploading(true);
      const jobDescriptionService = (await import('@/services/jobDescriptionService')).default;
      const result = await jobDescriptionService.bulkUploadJobDescriptions(file, uploadOptions);
      setUploadResult(result);
      
      if (result.successful > 0) {
        setTimeout(() => {
          if (onUploadComplete) {
            onUploadComplete(result);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        successful: 0,
        failed: 1,
        errors: [{ row: 0, errors: [error.message] }]
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading && !validating) {
      setFile(null);
      setUploadResult(null);
      setValidationResult(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgModal} rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-xl`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-almet-sapphire/10 rounded-lg">
                <FileSpreadsheet size={20} className="text-almet-sapphire" />
              </div>
              <div>
                <h2 className={`text-base font-bold ${textPrimary}`}>
                  Bulk Upload Job Descriptions
                </h2>
                <p className={`${textSecondary} text-xs mt-1`}>
                  Upload multiple job descriptions at once using Excel template
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={uploading || validating}
              className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg disabled:opacity-50`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Download Template Section */}
          <div className={`p-3 ${bgAccent} rounded-lg border ${borderColor}`}>
            <div className="flex items-start gap-3">
              <Info size={18} className="text-sky-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className={`text-xs font-semibold ${textPrimary} mb-2`}>
                  Step 1: Download Template
                </h3>
                <p className={`${textSecondary} text-xs mb-3`}>
                  Download the Excel template, fill in the job description details, and upload it back.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg 
                    hover:bg-almet-astral transition-colors text-xs font-medium"
                >
                  <Download size={16} />
                  Download Excel Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload Options */}
          {/* <div className={`p-3 border ${borderColor} rounded-lg`}>
            <h3 className={`text-xs font-semibold ${textPrimary} mb-3`}>
              Upload Options
            </h3>
            <div className="space-x-3 flex items-center justify-space-between"> 
                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadOptions.auto_assign_employees}
                  onChange={(e) => setUploadOptions({
                    ...uploadOptions,
                    auto_assign_employees: e.target.checked
                  })}
                  className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire"
                />
                <span className={`text-xs ${textSecondary}`}>
                  Auto-assign to all matching positions
                </span>
              </label> 
                </div>
             <div>
                <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadOptions.skip_duplicates}
                  onChange={(e) => setUploadOptions({
                    ...uploadOptions,
                    skip_duplicates: e.target.checked
                  })}
                  className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire"
                />
                <span className={`text-xs ${textSecondary}`}>
                  Skip existing job descriptions
                </span>
              </label> 
             </div>
             
            </div>
          </div> */}

          {/* File Upload Section */}
          <div>
            <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
              Step 2: Upload Filled Template
            </h3>
            
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-5 text-center transition-all ${
                dragActive 
                  ? 'border-almet-sapphire bg-almet-sapphire/5' 
                  : `${borderColor} hover:border-almet-sapphire/50`
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full ${dragActive ? 'bg-almet-sapphire/20' : bgAccent}`}>
                  <Upload size={26} className={dragActive ? 'text-almet-sapphire' : textMuted} />
                </div>
                
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle size={16} />
                      <span className="font-medium">{file.name}</span>
                    </div>
                    <p className={`text-xs ${textMuted}`}>
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={`text-xs ${textPrimary} font-medium`}>
                      Drag and drop your Excel file here
                    </p>
                    <p className={`text-xs ${textMuted}`}>
                      or
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
                        transition-colors text-xs font-medium"
                    >
                      Browse Files
                    </button>
                    <p className={`text-xs ${textMuted} mt-2`}>
                      Supported formats: .xlsx, .xls
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`p-3 border ${borderColor} rounded-lg ${
              validationResult.failed === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
            }`}>
              <div className="flex items-start gap-3">
                {validationResult.failed === 0 ? (
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-orange-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold text-xs mb-2 ${
                    validationResult.failed === 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-orange-800 dark:text-orange-300'
                  }`}>
                    Validation Result
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                    <div>
                      <span className={textMuted}>Total Rows:</span>
                      <span className={`ml-2 font-medium ${textPrimary}`}>{validationResult.total_rows}</span>
                    </div>
                    <div>
                      <span className={textMuted}>Valid:</span>
                      <span className="ml-2 font-medium text-emerald-500">{validationResult.successful}</span>
                    </div>
                    <div>
                      <span className={textMuted}>Errors:</span>
                      <span className="ml-2 font-medium text-red-600">{validationResult.failed}</span>
                    </div>
                  </div>
                  
                  {validationResult.errors && validationResult.errors.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-red-600">Errors found:</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <div key={index} className="text-xs text-red-700 dark:text-red-400 bg-white dark:bg-red-900/10 p-2 rounded">
                            <span className="font-medium">Row {error.row}:</span> {error.errors.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className={`p-4 border ${borderColor} rounded-lg ${
              uploadResult.failed === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <div className="flex items-start gap-3">
                {uploadResult.failed === 0 ? (
                  <CheckCircle size={20} className="text-emerald-600 mt-0.5" />
                ) : (
                  <XCircle size={20} className="text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${
                    uploadResult.failed === 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'
                  }`}>
                    Upload {uploadResult.failed === 0 ? 'Successful' : 'Completed with Errors'}
                  </h4>
                  <div className="grid grid-cols-4 gap-4 text-xs mb-3">
                    <div>
                      <span className={textMuted}>Total:</span>
                      <span className={`ml-2 font-medium ${textPrimary}`}>{uploadResult.total_rows}</span>
                    </div>
                    <div>
                      <span className={textMuted}>Created:</span>
                      <span className="ml-2 font-medium text-emerald-600">{uploadResult.successful}</span>
                    </div>
                    <div>
                      <span className={textMuted}>Failed:</span>
                      <span className="ml-2 font-medium text-red-600">{uploadResult.failed}</span>
                    </div>
                    <div>
                      <span className={textMuted}>Skipped:</span>
                      <span className="ml-2 font-medium text-orange-600">{uploadResult.skipped || 0}</span>
                    </div>
                  </div>
                  
                  {uploadResult.created_job_descriptions && uploadResult.created_job_descriptions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-emerald-600 mb-2">Successfully created:</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {uploadResult.created_job_descriptions.slice(0, 10).map((job, index) => (
                          <div key={index} className="text-xs bg-white dark:bg-emerald-900/10 p-2 rounded flex items-center justify-between">
                            <span className={textPrimary}>
                              <span className="font-medium">Row {job.row}:</span> {job.job_title} - {job.employee}
                            </span>
                            <span className="text-emerald-600 text-xs">{job.status}</span>
                          </div>
                        ))}
                        {uploadResult.created_job_descriptions.length > 10 && (
                          <p className={`text-xs ${textMuted} text-center py-2`}>
                            ... and {uploadResult.created_job_descriptions.length - 10} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <div key={index} className="text-xs text-red-700 dark:text-red-400 bg-white dark:bg-red-900/10 p-2 rounded">
                            <span className="font-medium">Row {error.row}:</span> {error.errors.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${borderColor} ${bgAccent}`}>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {file && !uploadResult && (
                <span>Ready to upload </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={uploading || validating}
                className={`px-4 py-2 border ${borderColor} rounded-lg ${textSecondary} hover:${textPrimary} 
                  transition-colors disabled:opacity-50 text-xs`}
              >
                {uploadResult ? 'Close' : 'Cancel'}
              </button>
              
              {!uploadResult && (
                <>
                  <button
                    onClick={handleValidate}
                    disabled={!file || validating || uploading}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg 
                      transition-colors disabled:opacity-50 text-xs font-medium flex items-center gap-2"
                  >
                    {validating && <Loader size={14} className="animate-spin" />}
                    Validate File
                  </button>
                  
                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading || validating}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg 
                      transition-colors disabled:opacity-50 text-xs font-medium flex items-center gap-2"
                  >
                    {uploading && <Loader size={14} className="animate-spin" />}
                    <Upload size={14} />
                    Upload & Create Jobs
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;