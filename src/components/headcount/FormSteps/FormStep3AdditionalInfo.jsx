// src/components/headcount/FormSteps/FormStep3AdditionalInfo.jsx - Updated with search
import { useState } from "react";
import { User, Users, Search } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
import MultiSelectDropdown from "../MultiSelectDropdown";

const FormStep3AdditionalInfo = ({ 
  formData, 
  handleInputChange, 
  handleTagsChange, 
  handleLineManagerChange,
  handleLineManagerSearch,
  employeeTags = [],
  lineManagerOptions = [],
  loadingLineManagers = false,
  lineManagerSearch = "",
  validationErrors = {}
}) => {
  const { darkMode } = useTheme();
  const [isLineManagerDropdownOpen, setIsLineManagerDropdownOpen] = useState(false);

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
    manager => manager.id.toString() === formData.line_manager?.toString()
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
        <div>
          <label className={`block ${textSecondary} text-xs font-medium mb-1.5`}>
            Line Manager <span className="text-gray-400">(Optional)</span>
          </label>
          
          {/* Search Input */}
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search by HC number, name, or job title..."
              value={lineManagerSearch}
              onChange={(e) => {
                handleLineManagerSearch(e.target.value);
                setIsLineManagerDropdownOpen(true);
              }}
              onFocus={() => setIsLineManagerDropdownOpen(true)}
              className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200 outline-none`}
            />
            <Search className="absolute left-2 top-2.5 text-gray-400" size={14} />
            
            {loadingLineManagers && (
              <div className="absolute right-2 top-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Dropdown Results */}
          {isLineManagerDropdownOpen && (
            <div className={`relative w-full rounded-md shadow-lg ${bgCard} border ${borderColor} max-h-60 overflow-y-auto z-10`}>
              {lineManagerOptions.length > 0 ? (
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleLineManagerChange("");
                      setIsLineManagerDropdownOpen(false);
                      handleLineManagerSearch("");
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${textPrimary}`}
                  >
                    <span className="text-gray-500">No line manager</span>
                  </button>
                  {lineManagerOptions.map((manager) => (
                    <button
                      key={manager.id}
                      type="button"
                      onClick={() => {
                        handleLineManagerChange(manager.id.toString());
                        setIsLineManagerDropdownOpen(false);
                        handleLineManagerSearch("");
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        formData.line_manager?.toString() === manager.id.toString() 
                          ? 'bg-almet-sapphire/10 text-almet-sapphire' 
                          : textPrimary
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {manager.employee_id} - {manager.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {manager.job_title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className={`text-xs ${textMuted}`}>
                    {loadingLineManagers ? "Searching..." : "No line managers found"}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Selected Manager Info */}
          {selectedManager && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="flex items-center">
                <Users size={14} className="text-blue-500 mr-2" />
                <div>
                  <p className={`text-xs font-medium ${textPrimary}`}>
                    Selected: {selectedManager.name}
                  </p>
                  <p className={`text-xs ${textMuted}`}>
                    HC: {selectedManager.employee_id} • {selectedManager.job_title}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <p className={`mt-1 text-xs ${textMuted}`}>
            Search and select a line manager or leave empty if this is a top-level position
          </p>
        </div>

        {/* Tags Selection */}
        <div>
          <label className={`block ${textSecondary} text-xs font-medium mb-1.5`}>
            Tags (Optional)
          </label>
          <MultiSelectDropdown
            options={tagOptions}
            placeholder="Select tags..."
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
          <p className={`mt-1 text-xs ${textMuted}`}>
            Tags help categorize employee status and special conditions
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className={`block ${textSecondary} text-xs font-medium mb-1.5`}>
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleInputChange}
            rows="3"
            className={`block w-full px-2.5 py-2 text-sm border ${borderColor} ${inputBg} ${textPrimary} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200 outline-none`}
            placeholder="Add any additional notes about the employee..."
          ></textarea>
        </div>

        {/* Org Chart Visibility */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_visible_in_org_chart"
              checked={formData.is_visible_in_org_chart}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire focus:ring-offset-0"
            />
            <span className={`ml-2 text-sm ${textSecondary}`}>
              Show employee in organizational chart
            </span>
          </label>
          <p className={`mt-1 text-xs ${textMuted} ml-6`}>
            Uncheck to hide this employee from the organizational structure view
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start">
          <User className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className={`text-xs font-medium text-blue-800 dark:text-blue-300`}>Automatic Status Assignment</h3>
            <p className={`text-xs text-blue-600 dark:text-blue-400 mt-0.5`}>
              Employee status will be automatically assigned based on employment start date and contract duration. 
              No manual status selection is required.
            </p>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isLineManagerDropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsLineManagerDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default FormStep3AdditionalInfo;