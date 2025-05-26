// src/components/headcount/BulkUploadForm.jsx
import { useState } from "react";
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
 * Bulk Employee Upload Form Component
 * Handles Excel file import/export for employee data
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

  // Sample data for template
  const sampleEmployeeData = [
    {
      empNo: "HLD001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@almetholding.com",
      phone: "+994 50 123 4567",
      dateOfBirth: "1990-01-15",
      address: "Baku, Azerbaijan",
      emergencyContact: "Jane Doe: Wife: +994 50 987 6543",
      businessFunction: "Holding",
      department: "FINANCE",
      unit: "FINANCE OPERATIONS",
      jobFunction: "SENIOR BUDGETING & CONTROLLING SPECIALIST",
      jobTitle: "Mühasib",
      positionGroup: "SENIOR SPECIALIST",
      grade: "4",
      lineManager: "Şirin Camalli Rasad Oglu",
      lineManagerHcNumber: "HLD01",
      office: "Baku HQ",
      startDate: "2024-01-01",
      status: "ACTIVE"
    },
    {
      empNo: "HLD002",
      firstName: "Sarah",
      lastName: "Smith",
      email: "sarah.smith@almetholding.com",
      phone: "+994 50 234 5678",
      dateOfBirth: "1988-05-22",
      address: "Baku, Azerbaijan",
      emergencyContact: "Michael Smith: Husband: +994 50 876 5432",
      businessFunction: "Holding",
      department: "HR",
      unit: "BUSINESS SUPPORT",
      jobFunction: "HR BUSINESS PARTNER",
      jobTitle: "İnsan resursları üzrə mütəxəssis",
      positionGroup: "SPECIALIST",
      grade: "3",
      lineManager: "Şirin Camalli Rasad Oglu",
      lineManagerHcNumber: "HLD01",
      office: "Baku HQ",
      startDate: "2024-01-15",
      status: "ACTIVE"
    }
  ];

  // Download sample Excel template
  const downloadTemplate = () => {
    // Create CSV content
    const headers = [
      "empNo", "firstName", "lastName", "email", "phone", "dateOfBirth",
      "address", "emergencyContact", "businessFunction", "department", 
      "unit", "jobFunction", "jobTitle", "positionGroup", "grade",
      "lineManager", "lineManagerHcNumber", "office", "startDate", "endDate", "status"
    ];

    const csvContent = [
      headers.join(","),
      ...sampleEmployeeData.map(emp => 
        headers.map(header => {
          const value = emp[header] || "";
          // Escape commas and quotes in CSV
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "employee_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    alert("Template downloaded successfully! Fill in your employee data and upload it back.");
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

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Process uploaded file
  const handleFileUpload = (file) => {
    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      alert("Please upload a valid Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    setUploadedFile(file);
    setValidationErrors([]);
    setUploadResults(null);
  };

  // Process and validate the uploaded data
  const processUpload = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    
    try {
      // Simulate file processing (in real app, you'd parse the actual file)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock validation results
      const mockResults = {
        totalRows: 25,
        validRows: 23,
        errorRows: 2,
        duplicates: 1,
        newEmployees: 22,
        updatedEmployees: 1
      };

      const mockErrors = [
        { row: 5, field: "email", message: "Invalid email format", value: "invalid-email" },
        { row: 12, field: "empNo", message: "Employee ID already exists", value: "HLD001" },
        { row: 18, field: "startDate", message: "Invalid date format", value: "2024/13/45" }
      ];

      setUploadResults(mockResults);
      setValidationErrors(mockErrors);
      
    } catch (error) {
      alert("Error processing file: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and import data
  const confirmImport = () => {
    if (!uploadResults) return;

    // Mock import process
    alert(`Successfully imported ${uploadResults.validRows} employees!`);
    
    if (onImportComplete) {
      onImportComplete(uploadResults);
    }
    
    onClose();
  };

  // Reset form
  const resetForm = () => {
    setUploadedFile(null);
    setUploadResults(null);
    setValidationErrors([]);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Users className="mr-3 text-almet-sapphire" size={24} />
            <h2 className={`text-xl font-bold ${textPrimary}`}>Bulk Employee Import</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${textMuted}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
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
                  dragActive ? 'border-almet-sapphire bg-blue-50 dark:bg-blue-900/20' : borderColor
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
                        {uploadResults.errorRows}
                      </div>
                      <div className={`text-sm ${textMuted}`}>Errors</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {uploadResults.duplicates}
                      </div>
                      <div className={`text-sm ${textMuted}`}>Duplicates</div>
                    </div>
                  </div>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <h4 className="font-medium text-red-800 dark:text-red-300">
                          Validation Errors ({validationErrors.length})
                        </h4>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {validationErrors.map((error, index) => (
                          <div key={index} className="text-sm text-red-700 dark:text-red-400">
                            <span className="font-medium">Row {error.row}:</span> {error.message}
                            {error.value && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-800 rounded text-xs">
                                "{error.value}"
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Import Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={confirmImport}
                      disabled={uploadResults.validRows === 0}
                      className={`${btnPrimary} px-6 py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50`}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Import {uploadResults.validRows} Valid Employees
                    </button>
                    <button
                      onClick={resetForm}
                      className={`${btnSecondary} px-6 py-3 rounded-lg font-medium flex items-center justify-center`}
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