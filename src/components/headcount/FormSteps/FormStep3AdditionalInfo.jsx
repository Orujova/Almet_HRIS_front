// src/components/headcount/FormSteps/FormStep3AdditionalInfo.jsx - Fixed Line Manager Dropdown
import { User, Users, Search, X } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
import MultiSelectDropdown from "../MultiSelectDropdown";

const FormStep3AdditionalInfo = ({ 
  formData, 
  handleInputChange, 
  handleTagsChange, 
  handleLineManagerChange,
  employeeTags = [],
  lineManagerOptions = [],
  loadingLineManagers = false,
  lineManagerSearch = "",
  setLineManagerSearch,
  validationErrors = {}
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700"; 
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-white";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";

  // Convert employee tags to dropdown options
  const tagOptions = employeeTags.map(tag => tag.name);

  // Get selected line manager info
  const selectedManager = lineManagerOptions.find(
    manager => manager.id?.toString() === formData.line_manager?.toString()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        <h2 className={`text-lg font-bold ${textPrimary}`}>
          Management & Status
        </h2>
        <div className="text-xs px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded font-medium">
          Step 3 of 4
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <User className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className={`text-xs font-medium text-amber-800 dark:text-amber-300`}>Management Structure</h3>
            <p className={`text-xs text-amber-600 dark:text-amber-400 mt-0.5`}>
              Assigning a line manager ensures the employee appears correctly in the organizational chart.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Line Manager Selection with Search */}
        <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
            <Users className="mr-1.5 text-almet-sapphire" size={16} />
            Line Manager
          </h3>
          
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search line manager by name or HC number..."
                value={lineManagerSearch}
                onChange={(e) => setLineManagerSearch(e.target.value)}
                className={`w-full p-2 pl-8 pr-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200 outline-none`}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={14} />
              {lineManagerSearch && (
                <button
                  onClick={() => setLineManagerSearch("")}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown */}
            <div className="relative">
              <select
                name="line_manager"
                value={formData.line_manager || ""}
                onChange={(e) => handleLineManagerChange(e.target.value)}
                disabled={loadingLineManagers}
                className={`w-full p-2 pr-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200 outline-none appearance-none`}
              >
                <option value="">Select Line Manager (Optional)</option>
                {lineManagerOptions.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.employee_id} - {manager.name} ({manager.job_title})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                {loadingLineManagers ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
            
            {/* Selected Manager Info */}
            {selectedManager && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3 flex-shrink-0">
                    {selectedManager.name?.charAt(0) || 'M'}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${textPrimary}`}>
                      {selectedManager.name}
                    </p>
                    <p className={`text-xs ${textMuted}`}>
                      HC: {selectedManager.employee_id} • {selectedManager.job_title}
                    </p>
                    {selectedManager.department && (
                      <p className={`text-xs ${textMuted}`}>
                        {selectedManager.department}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <p className={`text-xs ${textMuted}`}>
              Leave empty if this is a top-level position. Search by name or HC number to filter results.
            </p>

            {/* No results message */}
            {lineManagerSearch && lineManagerOptions.length === 0 && !loadingLineManagers && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
                <p className={`text-xs ${textMuted}`}>
                  No managers found for "{lineManagerSearch}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tags Selection */}
        <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
            <svg className="mr-1.5 text-almet-sapphire" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.5 7A1.5 1.5 0 004 5.5V4a2 2 0 012-2h1.5A1.5 1.5 0 009 3.5V4h6v-.5A1.5 1.5 0 0116.5 2H18a2 2 0 012 2v1.5A1.5 1.5 0 0118.5 7H18v10h.5a1.5 1.5 0 011.5 1.5V20a2 2 0 01-2 2h-1.5a1.5 1.5 0 01-1.5-1.5V20H9v.5A1.5 1.5 0 017.5 22H6a2 2 0 01-2-2v-1.5A1.5 1.5 0 015.5 17H6V7h-.5z"/>
            </svg>
            Employee Tags
          </h3>
          
          <MultiSelectDropdown
            options={tagOptions}
            placeholder="Select tags (optional)..."
            selectedValues={formData.tag_ids?.map(id => {
              const tag = employeeTags.find(t => t.id === id);
              return tag ? tag.name : '';
            }).filter(Boolean) || []}
            onChange={(selectedTagNames) => {
              const selectedIds = selectedTagNames.map(name => {
                const tag = employeeTags.find(t => t.name === name);
                return tag ? tag.id : null;
              }).filter(Boolean);
              handleTagsChange(selectedIds);
            }}
          />
          <p className={`mt-2 text-xs ${textMuted}`}>
            Tags help categorize employees by status, skills, projects, or special conditions.
          </p>
        </div>

        {/* Notes */}
        <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
            <svg className="mr-1.5 text-almet-sapphire" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Additional Notes
          </h3>
          
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleInputChange}
            rows="4"
            className={`block w-full px-3 py-2 text-sm border ${borderColor} ${inputBg} ${textPrimary} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200 outline-none resize-none`}
            placeholder="Add any additional notes about the employee, special requirements, or important information..."
          />
          <p className={`mt-2 text-xs ${textMuted}`}>
            This information is for internal use and will be visible to HR and management.
          </p>
        </div>

        {/* Org Chart Visibility */}
        <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
            <svg className="mr-1.5 text-almet-sapphire" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            Organizational Chart Visibility
          </h3>
          
          <label className="flex items-start">
            <input
              type="checkbox"
              name="is_visible_in_org_chart"
              checked={formData.is_visible_in_org_chart}
              onChange={handleInputChange}
              className="mt-1 rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire focus:ring-offset-0"
            />
            <div className="ml-3">
              <span className={`text-sm ${textSecondary} font-medium`}>
                Show employee in organizational chart
              </span>
              <p className={`text-xs ${textMuted} mt-1`}>
                When enabled, this employee will appear in the organizational structure view. 
                Disable this for temporary employees, contractors, or employees on extended leave.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 p-1.5 rounded-full mr-3 flex-shrink-0">
            <User className="w-full h-full text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className={`text-sm font-medium text-blue-800 dark:text-blue-300 mb-2`}>
              Automatic Status Assignment
            </h3>
            <div className={`text-xs text-blue-600 dark:text-blue-400 space-y-1`}>
              <p>• Employee status will be automatically assigned based on employment dates and contract duration</p>
              <p>• New employees start with "ONBOARDING" status for the first 7 days</p>
              <p>• Status transitions to "PROBATION" or "ACTIVE" based on contract type</p>
              <p>• No manual status selection is required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep3AdditionalInfo;