// src/components/headcount/ExportModal.jsx - Enhanced with Excel export and filtering
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Users, 
  X, 
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { 
  exportEmployees,
  selectSelectedEmployees,
  selectCurrentFilters,
  selectEmployeeLoading,
  selectEmployeeError
} from "../../store/slices/employeeSlice";

/**
 * Enhanced Export Modal with Excel support and filtering options
 * Supports exporting selected employees or filtered data
 */
const ExportModal = ({ isOpen, onClose, totalEmployees, filteredCount }) => {
  const { darkMode } = useTheme();
  const dispatch = useDispatch();
  
  // Redux state
  const selectedEmployees = useSelector(selectSelectedEmployees);
  const currentFilters = useSelector(selectCurrentFilters);
  const { exporting } = useSelector(selectEmployeeLoading);
  const { export: exportError } = useSelector(selectEmployeeError);

  // Local state
  const [exportType, setExportType] = useState("selected"); // "selected", "filtered", "all"
  const [exportFormat, setExportFormat] = useState("excel"); // "excel", "csv"
  const [includeFields, setIncludeFields] = useState({
    basic_info: true,
    job_info: true,
    contact_info: true,
    contract_info: true,
    management_info: true,
    tags: true,
    grading: true,
    status: true,
    dates: true,
    documents_count: false,
    activities_count: false
  });

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  if (!isOpen) return null;

  // Calculate export count
  const getExportCount = () => {
    switch (exportType) {
      case "selected":
        return selectedEmployees.length;
      case "filtered":
        return filteredCount;
      case "all":
        return totalEmployees;
      default:
        return 0;
    }
  };

  // Handle field selection toggle
  const handleFieldToggle = (field) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle export
  const handleExport = async () => {
    try {
      const exportData = {
        selectedEmployees: exportType === "selected" ? selectedEmployees : null,
        filters: exportType === "filtered" ? currentFilters : {},
        format: exportFormat,
        includeFields
      };

      await dispatch(exportEmployees(exportData));
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const fieldOptions = [
    { key: "basic_info", label: "Basic Information", description: "Name, email, employee ID" },
    { key: "job_info", label: "Job Information", description: "Title, department, business function" },
    { key: "contact_info", label: "Contact Information", description: "Phone, address, emergency contact" },
    { key: "contract_info", label: "Contract Information", description: "Contract type, duration, dates" },
    { key: "management_info", label: "Management", description: "Line manager, reports" },
    { key: "tags", label: "Employee Tags", description: "All assigned tags" },
    { key: "grading", label: "Grading Information", description: "Position group, grading level" },
    { key: "status", label: "Status Information", description: "Current status, transitions" },
    { key: "dates", label: "Important Dates", description: "Start date, end date, anniversaries" },
    { key: "documents_count", label: "Documents Count", description: "Number of uploaded documents" },
    { key: "activities_count", label: "Activities Count", description: "Number of recorded activities" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Download className="mr-3 text-almet-sapphire" size={24} />
            <h2 className={`text-xl font-bold ${textPrimary}`}>Export Employee Data</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${textMuted}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Type Selection */}
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold ${textPrimary}`}>What to Export</h3>
            <div className="space-y-2">
              {/* Selected Employees */}
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                exportType === "selected" 
                  ? "border-almet-sapphire bg-almet-sapphire/5" 
                  : `border-gray-200 dark:border-gray-700 ${bgHover}`
              }`}>
                <input
                  type="radio"
                  name="exportType"
                  value="selected"
                  checked={exportType === "selected"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  exportType === "selected" 
                    ? "border-almet-sapphire" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {exportType === "selected" && (
                    <div className="w-2 h-2 rounded-full bg-almet-sapphire"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      Selected Employees
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedEmployees.length > 0 
                        ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                    }`}>
                      {selectedEmployees.length} selected
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Export only the employees you have selected in the table
                  </p>
                </div>
              </label>

              {/* Filtered Employees */}
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                exportType === "filtered" 
                  ? "border-almet-sapphire bg-almet-sapphire/5" 
                  : `border-gray-200 dark:border-gray-700 ${bgHover}`
              }`}>
                <input
                  type="radio"
                  name="exportType"
                  value="filtered"
                  checked={exportType === "filtered"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  exportType === "filtered" 
                    ? "border-almet-sapphire" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {exportType === "filtered" && (
                    <div className="w-2 h-2 rounded-full bg-almet-sapphire"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      Filtered Results
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      Object.keys(currentFilters).length > 0 
                        ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                    }`}>
                      {filteredCount} employees
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Export employees matching current filters
                  </p>
                </div>
              </label>

              {/* All Employees */}
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                exportType === "all" 
                  ? "border-almet-sapphire bg-almet-sapphire/5" 
                  : `border-gray-200 dark:border-gray-700 ${bgHover}`
              }`}>
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === "all"}
                  onChange={(e) => setExportType(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  exportType === "all" 
                    ? "border-almet-sapphire" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {exportType === "all" && (
                    <div className="w-2 h-2 rounded-full bg-almet-sapphire"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${textPrimary}`}>
                      All Employees
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                      {totalEmployees} employees
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Export complete employee database
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold ${textPrimary}`}>Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                exportFormat === "excel" 
                  ? "border-almet-sapphire bg-almet-sapphire/5" 
                  : `border-gray-200 dark:border-gray-700 ${bgHover}`
              }`}>
                <input
                  type="radio"
                  name="exportFormat"
                  value="excel"
                  checked={exportFormat === "excel"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="sr-only"
                />
                <FileSpreadsheet className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className={`text-sm font-medium ${textPrimary}`}>Excel (.xlsx)</p>
                  <p className={`text-xs ${textMuted}`}>Rich formatting, formulas</p>
                </div>
              </label>

              <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                exportFormat === "csv" 
                  ? "border-almet-sapphire bg-almet-sapphire/5" 
                  : `border-gray-200 dark:border-gray-700 ${bgHover}`
              }`}>
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="sr-only"
                />
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className={`text-sm font-medium ${textPrimary}`}>CSV (.csv)</p>
                  <p className={`text-xs ${textMuted}`}>Simple, universal format</p>
                </div>
              </label>
            </div>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-semibold ${textPrimary}`}>Include Fields</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allSelected = Object.fromEntries(
                      Object.keys(includeFields).map(key => [key, true])
                    );
                    setIncludeFields(allSelected);
                  }}
                  className="text-xs text-almet-sapphire hover:text-almet-astral"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const noneSelected = Object.fromEntries(
                      Object.keys(includeFields).map(key => [key, false])
                    );
                    setIncludeFields(noneSelected);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              {fieldOptions.map((field) => (
                <label key={field.key} className={`flex items-start p-2 rounded cursor-pointer ${bgHover}`}>
                  <input
                    type="checkbox"
                    checked={includeFields[field.key]}
                    onChange={() => handleFieldToggle(field.key)}
                    className="mt-0.5 mr-3 h-4 w-4 text-almet-sapphire focus:ring-almet-sapphire border-gray-300 rounded"
                  />
                  <div>
                    <p className={`text-sm font-medium ${textPrimary}`}>{field.label}</p>
                    <p className={`text-xs ${textMuted}`}>{field.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Export Summary</h4>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                  <p>• {getExportCount()} employees will be exported</p>
                  <p>• Format: {exportFormat.toUpperCase()}</p>
                  <p>• {Object.values(includeFields).filter(Boolean).length} field groups included</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {exportError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Export Failed</h4>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {exportError.message || "An error occurred during export. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || getExportCount() === 0 || Object.values(includeFields).every(v => !v)}
            className="px-6 py-2 bg-almet-sapphire hover:bg-almet-astral text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={14} className="mr-2" />
                Export {getExportCount()} Employees
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;