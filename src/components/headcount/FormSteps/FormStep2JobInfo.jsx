// src/components/headcount/FormSteps/FormStep2JobInfo.jsx - Enhanced with Grading API Integration
import { Briefcase, Calendar, Info, Building, Users, Award } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * Enhanced Job Information step with grading level integration
 * - Grading levels are fetched from the grading API based on position group
 * - Status is auto-managed (not user selectable)
 * - Contract end date is auto-calculated
 * - All dropdowns are populated from backend APIs
 */
const FormStep2JobInfo = ({ 
  formData, 
  handleInputChange, 
  validationErrors,
  businessFunctions,
  departments,
  units,
  jobFunctions,
  positionGroups,
  gradeOptions,
  loadingGradingLevels
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";

  // Contract duration options - should be fetched from backend
  const contractDurationOptions = [
    { value: "Permanent", label: "Permanent" },
    { value: "1 Year", label: "1 Year" },
    { value: "2 Years", label: "2 Years" },
    { value: "6 Months", label: "6 Months" },
    { value: "3 Months", label: "3 Months" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
        <h2 className={`text-lg font-bold ${textPrimary}`}>
          Job Information
        </h2>
        <div className="text-xs px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded font-medium">
          Step 2 of 4
        </div>
      </div>

      {/* Employment Dates Section */}
      <div className="space-y-4">
        <h3 className={`text-sm font-semibold ${textSecondary} flex items-center`}>
          <Calendar size={16} className="mr-2" />
          Employment Timeline
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Start Date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            type="date"
            required={true}
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.start_date}
            helpText="Employee's first day of work"
          />

          <FormField
            label="Contract Start Date"
            name="contract_start_date"
            value={formData.contract_start_date}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.contract_start_date}
            helpText="Leave blank if same as start date"
          />

          <FormField
            label="Contract Duration"
            name="contract_duration"
            value={formData.contract_duration}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Calendar size={14} className={textMuted} />}
            options={contractDurationOptions}
            validationError={validationErrors.contract_duration}
            helpText="Duration affects status auto-management"
          />
        </div>

        {/* Auto-calculated contract end date display */}
        {formData.contract_end_date && formData.contract_duration !== 'Permanent' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <Info className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm text-green-800 dark:text-green-300">
                <strong>Contract End Date:</strong> {new Date(formData.contract_end_date).toLocaleDateString()}
                <span className="ml-2 text-xs">(Auto-calculated)</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Organizational Structure Section */}
      <div className="space-y-4">
        <h3 className={`text-sm font-semibold ${textSecondary} flex items-center`}>
          <Building size={16} className="mr-2" />
          Organizational Structure
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Business Function"
            name="business_function"
            value={formData.business_function}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Building size={14} className={textMuted} />}
            options={businessFunctions.map(bf => ({ value: bf.id, label: bf.name }))}
            validationError={validationErrors.business_function}
            helpText="Top-level organizational unit"
          />

          <FormField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Users size={14} className={textMuted} />}
            options={departments.map(dept => ({ value: dept.id, label: dept.name }))}
            validationError={validationErrors.department}
            helpText="Department within business function"
            disabled={!formData.business_function}
          />

          <FormField
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            type="select"
            icon={<Users size={14} className={textMuted} />}
            options={units.map(unit => ({ value: unit.id, label: unit.name }))}
            validationError={validationErrors.unit}
            helpText="Specific unit (optional)"
            disabled={!formData.department}
          />
        </div>
      </div>

      {/* Job Details Section */}
      <div className="space-y-4">
        <h3 className={`text-sm font-semibold ${textSecondary} flex items-center`}>
          <Briefcase size={16} className="mr-2" />
          Job Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Job Function"
            name="job_function"
            value={formData.job_function}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} className={textMuted} />}
            options={jobFunctions.map(jf => ({ value: jf.id, label: jf.name }))}
            validationError={validationErrors.job_function}
            helpText="Functional area of work"
          />

          <FormField
            label="Job Title"
            name="job_title"
            value={formData.job_title}
            onChange={handleInputChange}
            required={true}
            placeholder="Enter job title"
            icon={<Briefcase size={14} className={textMuted} />}
            validationError={validationErrors.job_title}
            helpText="Specific role title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Position Group"
            name="position_group"
            value={formData.position_group}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Award size={14} className={textMuted} />}
            options={positionGroups.map(pg => ({ value: pg.id, label: pg.name }))}
            validationError={validationErrors.position_group}
            helpText="Determines available grading levels"
          />

          <FormField
            label="Grading Level"
            name="grading_level"
            value={formData.grading_level}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Award size={14} className={textMuted} />}
            options={gradeOptions}
            validationError={validationErrors.grading_level}
            helpText="Level from grading system"
            disabled={!formData.position_group || loadingGradingLevels}
            loading={loadingGradingLevels}
          />
        </div>

        {/* Grading Level Info */}
        {formData.grading_level && gradeOptions.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Selected Grading Level
                </h4>
                {(() => {
                  const selectedGrade = gradeOptions.find(g => g.value === formData.grading_level);
                  return selectedGrade ? (
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      <div><strong>Code:</strong> {selectedGrade.label}</div>
                      {selectedGrade.description && (
                        <div><strong>Description:</strong> {selectedGrade.description}</div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto-Status Management Info */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className={`text-sm font-medium text-amber-800 dark:text-amber-300 mb-2`}>
              Automatic Status Management
            </h3>
            <div className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
              <p>• Employee status is automatically managed based on contract type and dates</p>
              <p>• New employees start with <strong>ONBOARDING</strong> status</p>
              <p>• Status transitions to <strong>PROBATION</strong> and then <strong>ACTIVE</strong> automatically</p>
              <p>• Status change durations are configurable per contract type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep2JobInfo;