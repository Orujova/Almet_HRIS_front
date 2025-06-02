// src/components/headcount/FormSteps/FormStep3AdditionalInfo.jsx - Updated with backend integration
import { User, Users } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
import MultiSelectDropdown from "../MultiSelectDropdown";

const FormStep3AdditionalInfo = ({ 
  formData, 
  handleInputChange, 
  handleTagsChange, 
  employeeTags = [],
  validationErrors = {}
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700"; 
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Convert employee tags to dropdown options
  const tagOptions = employeeTags.map(tag => tag.name);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField
          label="Line Manager Employee ID"
          name="line_manager"
          value={formData.line_manager}
          onChange={handleInputChange}
          placeholder="Enter manager's employee ID"
          icon={<Users size={14} className={textMuted} />}
          helpText="Leave empty if this is a top-level position"
        />

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
      </div>

      <div className="mt-4">
        <label className={`block ${textSecondary} text-xs font-medium mb-1.5`}>
          Additional Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleInputChange}
          rows="3"
          className={`block w-full px-2.5 py-2 text-sm border ${borderColor} bg-white dark:bg-gray-700 ${textPrimary} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200`}
          placeholder="Add any additional notes about the employee..."
        ></textarea>
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
    </div>
  );
};

export default FormStep3AdditionalInfo;