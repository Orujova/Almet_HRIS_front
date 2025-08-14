// src/components/headcount/ExportModal.jsx - FIXED: API endpoint uyğunluğu
import { useState } from "react";
import { 
  Download, 
  X, 

  AlertCircle,
 
} from "lucide-react";

/**
 * FIXED Export Modal - API endpoint ilə uyğun format
 * Backend export_selected endpoint-i üçün düzəldildi
 */
const ExportModal = ({ 
  isOpen, 
  onClose, 
  onExport, // Bu artıq HeadcountTable-dan gələn düzəldilmiş handler-dir
  totalEmployees, 
  filteredCount, 
  selectedEmployees, 
  darkMode 
}) => {
  // Local state
  const [exportType, setExportType] = useState("selected"); // "selected", "filtered", "all"
  const [exportFormat, setExportFormat] = useState("excel"); // "excel", "csv"
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  
  // FIXED: Backend API ilə uyğun field selection
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
        return selectedEmployees?.length || 0;
      case "filtered":
        return filteredCount || 0;
      case "all":
        return totalEmployees || 0;
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

  // FIXED: Export handler - API format ilə uyğun
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      // FIXED: Backend API format-ına uyğun export options hazırlanması
      const exportOptions = {
        type: exportType,
        format: exportFormat,
        fields: includeFields,
        
        // Additional metadata for better error handling
        selectedCount: selectedEmployees?.length || 0,
        filteredCount: filteredCount || 0,
        totalCount: totalEmployees || 0
      };

      console.log('🔧 FIXED: Sending export options to handler:', exportOptions);

      // Call the export handler from HeadcountTable
      await onExport(exportOptions);
      
      // If successful, close modal
      onClose();
      
    } catch (error) {
      console.error('❌ Export failed in modal:', error);
      setExportError(error.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // FIXED: Field options uyğun backend field mappings ilə
  const fieldOptions = [
    { 
      key: "basic_info", 
      label: "Basic Information", 
      description: "Employee ID, name, email, gender, father name",
      fields: "employee_id,name,email,gender,father_name"
    },
    { 
      key: "job_info", 
      label: "Job Information", 
      description: "Job title, department, business function, position group",
      fields: "job_title,department_name,business_function_name,position_group_name"
    },
    { 
      key: "contact_info", 
      label: "Contact Information", 
      description: "Phone number, address, emergency contact",
      fields: "phone,address,emergency_contact"
    },
    { 
      key: "contract_info", 
      label: "Contract Information", 
      description: "Contract duration, start/end dates, extensions",
      fields: "contract_duration,contract_start_date,contract_end_date,contract_extensions"
    },
    { 
      key: "management_info", 
      label: "Management", 
      description: "Line manager, direct reports count",
      fields: "line_manager_name,line_manager_hc_number,direct_reports_count"
    },
    { 
      key: "tags", 
      label: "Employee Tags", 
      description: "All assigned tags and categories",
      fields: "tag_names"
    },
    { 
      key: "grading", 
      label: "Grading Information", 
      description: "Grade level, position group level",
      fields: "grading_level,grading_display,position_group_level"
    },
    { 
      key: "status", 
      label: "Status Information", 
      description: "Current status, org chart visibility, status updates",
      fields: "status_name,status_color,is_visible_in_org_chart,status_needs_update"
    },
    { 
      key: "dates", 
      label: "Important Dates", 
      description: "Start date, birth date, years of service",
      fields: "start_date,end_date,date_of_birth,years_of_service"
    },
  
  ];

  // Validation - at least one field must be selected
  const hasSelectedFields = Object.values(includeFields).some(Boolean);
  const canExport = getExportCount() > 0 && hasSelectedFields && !isExporting;

  // Format validation for selected type
  const isValidSelection = () => {
    if (exportType === "selected" && (!selectedEmployees || selectedEmployees.length === 0)) {
      return false;
    }
    return true;
  };

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
                      (selectedEmployees?.length || 0) > 0 
                        ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                    }`}>
                      {selectedEmployees?.length || 0} selected
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
                    <span className={`text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300`}>
                      {filteredCount || 0} employees
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
                      {totalEmployees || 0} employees
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-1`}>
                    Export complete employee database
                  </p>
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


          {/* Error Display */}
          {exportError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Export Failed</h4>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {exportError}
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
            disabled={!canExport || !isValidSelection()}
            className="px-6 py-2 bg-almet-sapphire hover:bg-almet-astral text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isExporting ? (
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