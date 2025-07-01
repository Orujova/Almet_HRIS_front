// src/components/headcount/BulkUploadForm.jsx - Fixed and optimized (keeping existing)
import { useState, useCallback } from "react";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Users,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * Bulk Employee Upload Form Component - Optimized
 * Handles Excel file import/export for employee data
 * Prevents multiple uploads and provides better UX
 */
const BulkUploadForm = ({ onClose, onImportComplete }) => {
  const { darkMode } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";

  // Download template function
  const downloadTemplate = useCallback(() => {
    // Create a sample template with headers
    const headers = [
      'employee_id', 'first_name', 'last_name', 'email', 'phone',
      'job_title', 'business_function', 'department', 'unit',
      'job_function', 'position_group', 'start_date', 'contract_duration',
      'grading_level', 'line_manager_email', 'address', 'date_of_birth',
      'gender', 'emergency_contact', 'notes', 'tags'
    ];

    const sampleData = [
      [
        'EMP001', 'John', 'Doe', 'john.doe@company.com', '+994501234567',
        'Software Engineer', 'Technology', 'IT Department', 'Development',
        'Engineering', 'Individual Contributor', '2024-01-15', 'Permanent',
        'mid_level', 'manager@company.com', '123 Main St, Baku', '1990-05-15',
        'M', 'Jane Doe - +994501234568', 'Experienced developer', 'javascript,react,nodejs'
      ]
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      handleFileValidation(file);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files.length) {
      const file = e.target.files[0];
      handleFileValidation(file);
    }
  }, []);

  // Validate selected file
  const handleFileValidation = useCallback((file) => {
    // Reset previous state
    setUploadResults(null);
    setValidationErrors([]);

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
  }, []);

  // Process uploaded file
  const processUpload = useCallback(async () => {
    if (!uploadedFile || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Mock API call - replace with actual endpoint
      const response = await fetch('/api/employees/bulk-import/', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setUploadResults({
        totalRows: result.total_rows || 0,
        validRows: result.valid_rows || 0,
        invalidRows: result.invalid_rows || 0,
        errors: result.errors || []
      });

      setValidationErrors(result.errors || []);

    } catch (error) {
      console.error('Upload processing failed:', error);
      alert('Failed to process file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile, isProcessing]);

  // Confirm import
  const confirmImport = useCallback(async () => {
    if (!uploadResults || uploadResults.validRows === 0) return;

    try {
      setIsProcessing(true);

      // Mock API call for actual import
      const response = await fetch('/api/employees/bulk-import/confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          file_id: uploadResults.file_id // Assume we get this from previous call
        }),
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();
      
      // Call completion callback
      if (onImportComplete) {
        onImportComplete(result);
      }

      // Close modal
      onClose();

    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import employees. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadResults, onImportComplete, onClose]);

  // Reset form
  const resetForm = useCallback(() => {
    setUploadedFile(null);
    setUploadResults(null);
    setValidationErrors([]);
    setIsProcessing(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Upload className="w-6 h-6 text-almet-sapphire mr-3" />
            <div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>Bulk Import Employees</h2>
              <p className={`text-sm ${textMuted}`}>
                Upload an Excel or CSV file to import multiple employees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <X size={20} className={textSecondary} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {!uploadedFile ? (
            // Upload Section
            <>
              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className={`font-medium text-blue-800 dark:text-blue-300 mb-2`}>How to use Bulk Import</h3>
                    <ol className={`text-sm text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside`}>
                      <li>Download the Excel template below</li>
                      <li>Fill in your employee data in the template</li>
                      <li>Save and upload the completed file</li>
                      <li>Review and confirm the import</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Download Template */}
              <div className="mb-6">
                <button
                  onClick={downloadTemplate}
                  className={`${btnSecondary} px-6 py-3 rounded-lg flex items-center font-medium transition-colors w-full sm:w-auto`}
                >
                  <Download size={20} className="mr-2" />
                  Download Excel Template
                </button>
                <p className={`text-xs ${textMuted} mt-2`}>
                  Contains sample data and all required fields
                </p>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed ${
                  dragActive 
                    ? 'border-almet-sapphire bg-blue-50 dark:bg-blue-900/20' 
                    : borderColor
                } rounded-xl p-8 transition-colors`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <Upload className={`w-16 h-16 ${textMuted} mx-auto mb-4`} />
                  <h3 className={`${textPrimary} text-lg font-medium mb-2`}>
                    Drop your Excel file here
                  </h3>
                  <p className={`${textMuted} mb-4`}>
                    or click to browse and select a file
                  </p>
                  <label className="cursor-pointer">
                    <span className={`${btnPrimary} px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center`}>
                      <FileSpreadsheet size={16} className="mr-2" />
                      Choose File
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className={`${textMuted} text-xs mt-3`}>
                    Supported formats: Excel (.xlsx, .xls), CSV (.csv) | Max size: 10MB
                  </p>
                </div>
              </div>
            </>
          ) : (
            // File Processing Section
            <div className="space-y-6">
              {/* File Info */}
              <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileCheck className="mr-3 text-green-500" size={20} />
                    <div>
                      <p className={`${textPrimary} font-medium`}>{uploadedFile.name}</p>
                      <p className={`${textMuted} text-sm`}>
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className={`text-red-500 hover:text-red-600 p-1`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Processing Button */}
              {!uploadResults && (
                <button
                  onClick={processUpload}
                  disabled={isProcessing}
                  className={`${btnPrimary} px-6 py-3 rounded-lg font-medium w-full sm:w-auto flex items-center justify-center disabled:opacity-50`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing File...
                    </>
                  ) : (
                    <>
                      <FileCheck size={16} className="mr-2" />
                      Validate & Process
                    </>
                  )}
                </button>
              )}

              {/* Results */}
              {uploadResults && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {uploadResults.totalRows}
                      </div>
                      <div className={`text-sm ${textMuted}`}>Total Rows</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {uploadResults.validRows}
                      </div>
                      <div className={`text-sm ${textMuted}`}>Valid</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {uploadResults.invalidRows}
                      </div>
                      <div className={`text-sm ${textMuted}`}>Invalid</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {validationErrors.length}
                      </div>
                      <div className={`text-sm ${textMuted}`}>Errors</div>
                    </div>
                  </div>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <h3 className={`font-medium text-red-800 dark:text-red-300`}>
                          Validation Errors ({validationErrors.length})
                        </h3>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {validationErrors.slice(0, 10).map((error, index) => (
                          <div key={index} className="text-sm text-red-700 dark:text-red-400">
                            <span className="font-medium">Row {error.row}:</span> {error.message}
                            {error.value && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-800 rounded text-xs">
                                "{error.value}"
                              </span>
                            )}
                          </div>
                        ))}
                        {validationErrors.length > 10 && (
                          <div className="text-sm text-red-600 dark:text-red-400 italic">
                            ... and {validationErrors.length - 10} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Import Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={confirmImport}
                      disabled={uploadResults.validRows === 0 || isProcessing}
                      className={`${btnPrimary} px-6 py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-2" />
                          Import {uploadResults.validRows} Valid Employees
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetForm}
                      disabled={isProcessing}
                      className={`${btnSecondary} px-6 py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50`}
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Different File
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadForm;