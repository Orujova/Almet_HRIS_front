// src/components/headcount/FormSteps/FormStep3AdditionalInfo.jsx
import { User, Users } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
import MultiSelectDropdown from "../MultiSelectDropdown";
import { getStatuses } from "../utils/mockData";

/**
 * Additional information step of the employee form
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleTagsChange - Function to handle tags changes
 * @returns {JSX.Element} - Form step component
 */
const FormStep3AdditionalInfo = ({ formData, handleInputChange, handleTagsChange }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700"; 
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Statuses from mock data
  const statuses = getStatuses();

  // Available tags
  const availableTags = [
    "Sick Leave", 
    "Maternity", 
    "Suspension", 
    "Remote Work", 
    "Part-time", 
    "Contract", 
    "Probation", 
    "Onboarding"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className={`text-xl font-bold ${textPrimary}`}>
          Management & Status
        </h2>
        <div className="text-sm px-3 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded-md font-medium">
          Step 3 of 4
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <User className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className={`text-sm font-medium text-amber-800 dark:text-amber-300`}>Management Structure</h3>
            <p className={`text-sm text-amber-600 dark:text-amber-400 mt-0.5`}>
              Properly assigning a line manager ensures the employee appears correctly in the organizational chart.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <FormField
          label="Line Manager"
          name="lineManager"
          value={formData.lineManager}
          onChange={handleInputChange}
          placeholder="Manager's full name"
          icon={<Users size={18} className={textMuted} />}
        />

        <FormField
          label="Manager's HC Number"
          name="lineManagerHcNumber"
          value={formData.lineManagerHcNumber}
          onChange={handleInputChange}
          placeholder="e.g. HLD02"
          icon={<User size={18} className={textMuted} />}
          helpText="The employee ID of the line manager"
        />

        <FormField
          label="Employee Status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          type="select"
          required={true}
          icon={<User size={18} className={textMuted} />}
          options={statuses}
        />

        <div>
          <label
            className={`block ${textSecondary} text-sm font-medium mb-1.5`}
          >
            Tags (Optional)
          </label>
          <MultiSelectDropdown
            options={availableTags}
            placeholder="Select tags..."
            selectedValues={formData.tags || []}
            onChange={handleTagsChange}
          />
          <p className={`mt-1 text-xs ${textMuted}`}>
            Tags help categorize employee status and special conditions
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label
          className={`block ${textSecondary} text-sm font-medium mb-1.5`}
        >
          Additional Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleInputChange}
          rows="4"
          className={`block w-full px-3 py-2.5 border ${borderColor} bg-white dark:bg-gray-700 ${textPrimary} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors duration-200`}
          placeholder="Add any additional notes about the employee..."
        ></textarea>
      </div>
    </div>
  );
};

export default FormStep3AdditionalInfo;