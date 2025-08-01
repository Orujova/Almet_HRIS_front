// src/components/headcount/FormSteps/FormStep2JobInfo.jsx - Fixed with Proper API Integration
import { useState, useEffect } from "react";
import { Briefcase, Calendar, Info, Building, Users, Award, AlertCircle, Loader } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * Enhanced Job Information step with proper API integration and validation
 */
const FormStep2JobInfo = ({ 
  formData, 
  handleInputChange, 
  validationErrors,
  businessFunctions = [],
  departments = [],
  units = [],
  jobFunctions = [],
  positionGroups = [],
  gradeOptions = [],
  loadingGradingLevels = false,
  loading = {}
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgInfo = darkMode ? "bg-blue-900/20" : "bg-blue-50";
  const bgWarning = darkMode ? "bg-amber-900/20" : "bg-amber-50";

  // Contract duration options from backend
  const contractDurationOptions = [
    { value: "PERMANENT", label: "Permanent" },
    { value: "3_MONTHS", label: "3 Months" },
    { value: "6_MONTHS", label: "6 Months" },
    { value: "1_YEAR", label: "1 Year" },
    { value: "2_YEARS", label: "2 Years" },
    { value: "3_YEARS", label: "3 Years" }
  ];

  // Calculate minimum end date (start date + 1 day)
  const getMinEndDate = () => {
    if (!formData.start_date) return "";
    const startDate = new Date(formData.start_date);
    startDate.setDate(startDate.getDate() + 1);
    return startDate.toISOString().split('T')[0];
  };

  // Helper to check if dropdown has options
  const hasOptions = (options) => {
    return Array.isArray(options) && options.length > 0;
  };

  // Get placeholder text based on loading state and dependencies
  const getPlaceholder = (type, dependent = null, dependentValue = null) => {
    if (dependent && !dependentValue) {
      return `Select ${dependent} first`;
    }
    
    if (loading[type]) {
      return "Loading...";
    }
    
    if (type === 'departments' && !hasOptions(departments) && formData.business_function) {
      return "No departments available";
    }
    
    if (type === 'units' && !hasOptions(units) && formData.department) {
      return "No units available";
    }
    
    if (type === 'gradeOptions' && !hasOptions(gradeOptions) && formData.position_group) {
      return "No grading levels available";
    }
    
    return `Select ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
  };

  // Debug logging for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('FormStep2JobInfo - Reference data received:', {
        businessFunctions: businessFunctions?.length || 0,
        departments: departments?.length || 0,
        units: units?.length || 0,
        jobFunctions: jobFunctions?.length || 0,
        positionGroups: positionGroups?.length || 0,
        gradeOptions: gradeOptions?.length || 0,
        loading,
        formData: {
          business_function: formData.business_function,
          department: formData.department,
          position_group: formData.position_group
        }
      });
    }
  }, [businessFunctions, departments, units, jobFunctions, positionGroups, gradeOptions, loading, formData]);

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

      {/* Employment Timeline Section */}
      <div className="space-y-4">
        <h3 className={`text-sm font-semibold ${textSecondary} flex items-center`}>
          <Calendar size={16} className="mr-2" />
          Employment Timeline
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Start Date"
            name="start_date"
            value={formData.start_date || ""}
            onChange={handleInputChange}
            type="date"
            required={true}
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.start_date}
            helpText="Employee's first day of work"
          />

          <FormField
            label="Contract Duration"
            name="contract_duration"
            value={formData.contract_duration || "PERMANENT"}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Calendar size={14} className={textMuted} />}
            options={contractDurationOptions}
            validationError={validationErrors.contract_duration}
            helpText="Contract type affects status transitions"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Contract Start Date"
            name="contract_start_date"
            value={formData.contract_start_date || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.contract_start_date}
            helpText="Leave blank if same as employment start date"
            min={formData.start_date}
          />

          <FormField
            label="Employment End Date"
            name="end_date"
            value={formData.end_date || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.end_date}
            helpText="Optional: For early termination or fixed contracts"
            min={getMinEndDate()}
            disabled={formData.contract_duration === 'PERMANENT'}
          />
        </div>

        {/* Auto-calculated contract end date display */}
        {formData.contract_end_date && formData.contract_duration !== 'PERMANENT' && (
          <div className={`p-3 ${bgInfo} border border-blue-200 dark:border-blue-800 rounded-lg`}>
            <div className="flex items-center">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Auto-calculated Contract End:</strong> {new Date(formData.contract_end_date).toLocaleDateString()}
                <span className="ml-2 text-xs opacity-75">(Based on contract duration)</span>
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
            value={formData.business_function || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Building size={14} className={textMuted} />}
            options={businessFunctions}
            validationError={validationErrors.business_function}
            helpText="Top-level organizational unit"
            loading={loading.businessFunctions}
            placeholder={loading.businessFunctions ? "Loading..." : "Select business function"}
          />

          <FormField
            label="Department"
            name="department"
            value={formData.department || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Users size={14} className={textMuted} />}
            options={departments}
            validationError={validationErrors.department}
            helpText="Department within business function"
            disabled={!formData.business_function}
            loading={loading.departments}
            placeholder={getPlaceholder('departments', 'Business Function', formData.business_function)}
          />

          <FormField
            label="Unit"
            name="unit"
            value={formData.unit || ""}
            onChange={handleInputChange}
            type="select"
            icon={<Users size={14} className={textMuted} />}
            options={units}
            validationError={validationErrors.unit}
            helpText="Specific unit (optional)"
            disabled={!formData.department}
            loading={loading.units}
            placeholder={getPlaceholder('units', 'Department', formData.department)}
            clearable={true}
          />
        </div>

        {/* Organization hierarchy warnings */}
        {!hasOptions(departments) && formData.business_function && !loading.departments && (
          <div className={`p-3 ${bgWarning} border border-amber-200 dark:border-amber-800 rounded-lg`}>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-sm text-amber-800 dark:text-amber-300">
                No departments found for selected business function. Please contact administrator.
              </span>
            </div>
          </div>
        )}

        {!hasOptions(units) && formData.department && !loading.units && (
          <div className={`p-3 ${bgWarning} border border-amber-200 dark:border-amber-800 rounded-lg`}>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-sm text-amber-800 dark:text-amber-300">
                No units found for selected department. You can leave this field empty or contact administrator.
              </span>
            </div>
          </div>
        )}
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
            value={formData.job_function || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} className={textMuted} />}
            options={jobFunctions}
            validationError={validationErrors.job_function}
            helpText="Functional area of work"
            loading={loading.jobFunctions}
            placeholder={loading.jobFunctions ? "Loading..." : "Select job function"}
          />

          <FormField
            label="Job Title"
            name="job_title"
            value={formData.job_title || ""}
            onChange={handleInputChange}
            required={true}
            placeholder="Enter specific job title"
            icon={<Briefcase size={14} className={textMuted} />}
            validationError={validationErrors.job_title}
            helpText="Specific role title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Position Group"
            name="position_group"
            value={formData.position_group || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Award size={14} className={textMuted} />}
            options={positionGroups}
            validationError={validationErrors.position_group}
            helpText="Determines available grading levels"
            loading={loading.positionGroups}
            placeholder={loading.positionGroups ? "Loading..." : "Select position group"}
          />

          <FormField
            label="Grading Level"
            name="grading_level"
            value={formData.grading_level || ""}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Award size={14} className={textMuted} />}
            options={gradeOptions}
            validationError={validationErrors.grading_level}
            helpText="Salary grading level"
            disabled={!formData.position_group || loadingGradingLevels}
            loading={loadingGradingLevels}
            placeholder={getPlaceholder('gradeOptions', 'Position Group', formData.position_group)}
          />
        </div>

        {/* Grading Level Information */}
        {formData.grading_level && gradeOptions.length > 0 && (
          <div className={`p-3 ${bgInfo} border border-blue-200 dark:border-blue-800 rounded-lg`}>
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

        {/* No grading levels warning */}
        {!hasOptions(gradeOptions) && formData.position_group && !loadingGradingLevels && (
          <div className={`p-3 ${bgWarning} border border-amber-200 dark:border-amber-800 rounded-lg`}>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-sm text-amber-800 dark:text-amber-300">
                No grading levels found for selected position group. Please contact administrator.
              </span>
            </div>
          </div>
        )}
      </div>

   

      {/* Loading States Info */}
      {Object.values(loading || {}).some(Boolean) && (
        <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Loader className="animate-spin h-5 w-5 text-almet-sapphire mr-3" />
          <span className={`text-sm ${textSecondary}`}>
            Loading reference data from server...
          </span>
        </div>
      )}

    
    </div>
  );
};

export default FormStep2JobInfo;