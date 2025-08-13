// src/components/headcount/FormSteps/FormStep2JobInfo.jsx - Compact Design with Better UX
import { useState, useEffect } from "react";
import { Briefcase, Calendar, Info, Building, Users, Award, AlertCircle, Loader } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

/**
 * Enhanced Job Information step with compact design and proper dropdown positioning
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

  // Theme-dependent classes with Almet colors
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";
  const bgInfo = darkMode ? "bg-almet-sapphire/20" : "bg-almet-sapphire/5";
  const bgWarning = darkMode ? "bg-amber-900/20" : "bg-amber-50";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-bali-hai";

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
    <div className="space-y-4 relative">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-almet-bali-hai dark:border-gray-700 pb-2 mb-4">
        <h2 className={`text-base font-bold ${textPrimary}`}>
          Job Information
        </h2>
        <div className="text-[10px] px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire rounded font-medium">
          Step 2 of 4
        </div>
      </div>

      {/* Employment Timeline Section */}
      <div className="space-y-3">
        <h3 className={`text-xs font-semibold ${textSecondary} flex items-center`}>
          <Calendar size={12} className="mr-1" />
          Employment Timeline
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Start Date"
            name="start_date"
            value={formData.start_date || ""}
            onChange={handleInputChange}
            type="date"
            required={true}
            icon={<Calendar size={12} className={textMuted} />}
            validationError={validationErrors.start_date}
            helpText="First day of work"
          />

          <FormField
            label="Contract Duration"
            name="contract_duration"
            value={formData.contract_duration || "PERMANENT"}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Calendar size={12} className={textMuted} />}
            options={contractDurationOptions}
            validationError={validationErrors.contract_duration}
            helpText="Contract type"
            dropdownPosition="auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Contract Start"
            name="contract_start_date"
            value={formData.contract_start_date || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={12} className={textMuted} />}
            validationError={validationErrors.contract_start_date}
            helpText="If different from start date"
            min={formData.start_date}
          />

          <FormField
            label="End Date"
            name="end_date"
            value={formData.end_date || ""}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={12} className={textMuted} />}
            validationError={validationErrors.end_date}
            helpText="For fixed contracts"
            min={getMinEndDate()}
            disabled={formData.contract_duration === 'PERMANENT'}
          />
        </div>

        {/* Auto-calculated contract end date display */}
        {formData.contract_end_date && formData.contract_duration !== 'PERMANENT' && (
          <div className={`p-2 ${bgInfo} border border-almet-sapphire/20 dark:border-blue-800 rounded-md`}>
            <div className="flex items-center">
              <Info className="h-3 w-3 text-almet-sapphire mr-2" />
              <span className="text-xs text-almet-sapphire">
                <strong>Contract End:</strong> {new Date(formData.contract_end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Organizational Structure Section */}
      <div className="space-y-3">
        <h3 className={`text-xs font-semibold ${textSecondary} flex items-center`}>
          <Building size={12} className="mr-1" />
          Organization
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <FormField
              label="Business Function"
              name="business_function"
              value={formData.business_function || ""}
              onChange={handleInputChange}
              type="select"
              required={true}
              icon={<Building size={12} className={textMuted} />}
              options={businessFunctions}
              validationError={validationErrors.business_function}
              helpText="Top-level unit"
              loading={loading.businessFunctions}
              placeholder={loading.businessFunctions ? "Loading..." : "Select function"}
              dropdownPosition="auto"
              maxHeight="200px"
            />
          </div>

          <div className="relative">
            <FormField
              label="Department"
              name="department"
              value={formData.department || ""}
              onChange={handleInputChange}
              type="select"
              required={true}
              icon={<Users size={12} className={textMuted} />}
              options={departments}
              validationError={validationErrors.department}
              helpText="Department"
              disabled={!formData.business_function}
              loading={loading.departments}
              placeholder={getPlaceholder('departments', 'Business Function', formData.business_function)}
              dropdownPosition="auto"
              maxHeight="200px"
            />
          </div>

          <div className="relative">
            <FormField
              label="Unit"
              name="unit"
              value={formData.unit || ""}
              onChange={handleInputChange}
              type="select"
              icon={<Users size={12} className={textMuted} />}
              options={units}
              validationError={validationErrors.unit}
              helpText="Unit (optional)"
              disabled={!formData.department}
              loading={loading.units}
              placeholder={getPlaceholder('units', 'Department', formData.department)}
              clearable={true}
              dropdownPosition="auto"
              maxHeight="200px"
            />
          </div>
        </div>

        {/* Organization hierarchy warnings */}
        {!hasOptions(departments) && formData.business_function && !loading.departments && (
          <div className={`p-2 ${bgWarning} border border-amber-200 dark:border-amber-800 rounded-md`}>
            <div className="flex items-center">
              <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-xs text-amber-800 dark:text-amber-300">
                No departments found. Contact administrator.
              </span>
            </div>
          </div>
        )}

        {!hasOptions(units) && formData.department && !loading.units && (
          <div className={`p-2 ${bgWarning} border border-amber-200 dark:border-amber-800 rounded-md`}>
            <div className="flex items-center">
              <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-xs text-amber-800 dark:text-amber-300">
                No units found. You can leave this empty.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Section */}
      <div className="space-y-3">
        <h3 className={`text-xs font-semibold ${textSecondary} flex items-center`}>
          <Briefcase size={12} className="mr-1" />
          Job Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <FormField
              label="Job Function"
              name="job_function"
              value={formData.job_function || ""}
              onChange={handleInputChange}
              type="select"
              required={true}
              icon={<Briefcase size={12} className={textMuted} />}
              options={jobFunctions}
              validationError={validationErrors.job_function}
              helpText="Functional area"
              loading={loading.jobFunctions}
              placeholder={loading.jobFunctions ? "Loading..." : "Select function"}
              dropdownPosition="auto"
              maxHeight="200px"
            />
          </div>

          <FormField
            label="Job Title"
            name="job_title"
            value={formData.job_title || ""}
            onChange={handleInputChange}
            required={true}
            placeholder="Enter job title"
            icon={<Briefcase size={12} className={textMuted} />}
            validationError={validationErrors.job_title}
            helpText="Specific role title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <FormField
              label="Position Group"
              name="position_group"
              value={formData.position_group || ""}
              onChange={handleInputChange}
              type="select"
              required={true}
              icon={<Award size={12} className={textMuted} />}
              options={positionGroups}
              validationError={validationErrors.position_group}
              helpText="Determines grading"
              loading={loading.positionGroups}
              placeholder={loading.positionGroups ? "Loading..." : "Select group"}
              dropdownPosition="auto"
              maxHeight="200px"
            />
          </div>

          <div className="relative">
            <FormField
              label="Grading Level"
              name="grading_level"
              value={formData.grading_level || ""}
              onChange={handleInputChange}
              type="select"
              required={true}
              icon={<Award size={12} className={textMuted} />}
              options={gradeOptions}
              validationError={validationErrors.grading_level}
              helpText="Salary grade"
              disabled={!formData.position_group || loadingGradingLevels}
              loading={loadingGradingLevels}
              placeholder={getPlaceholder('gradeOptions', 'Position Group', formData.position_group)}
              dropdownPosition="auto"
              maxHeight="200px"
            />
          </div>
        </div>

        {/* Grading Level Information */}
        {formData.grading_level && gradeOptions.length > 0 && (
          <div className={`p-2 ${bgInfo} border border-almet-sapphire/20 dark:border-blue-800 rounded-md`}>
            <div className="flex items-start">
              <Info className="h-3 w-3 text-almet-sapphire mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-almet-sapphire mb-1">
                  Selected Grade
                </h4>
                {(() => {
                  const selectedGrade = gradeOptions.find(g => g.value === formData.grading_level);
                  return selectedGrade ? (
                    <div className="text-xs text-almet-sapphire space-y-0.5">
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
          <div className={`p-2 ${bgWarning} border border-amber-200 dark:border-amber-800 rounded-md`}>
            <div className="flex items-center">
              <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400 mr-2" />
              <span className="text-xs text-amber-800 dark:text-amber-300">
                No grading levels found. Contact administrator.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Loading States Info */}
      {Object.values(loading || {}).some(Boolean) && (
        <div className="flex items-center justify-center p-3 bg-almet-mystic dark:bg-gray-800 rounded-md">
          <Loader className="animate-spin h-4 w-4 text-almet-sapphire mr-2" />
          <span className={`text-xs ${textSecondary}`}>
            Loading reference data...
          </span>
        </div>
      )}

  

      {/* Custom CSS for better dropdown positioning */}
      <style jsx>{`
        .relative .dropdown-container {
          position: relative;
          z-index: 50;
        }
        
        .dropdown-container select {
          position: relative;
          z-index: 10;
        }
        
        .dropdown-container .dropdown-options {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          max-height: 200px;
          overflow-y: auto;
          z-index: 60;
        }
        
        .dark .dropdown-container .dropdown-options {
          background: #374151;
          border-color: #4b5563;
        }
        
        @media (max-height: 600px) {
          .dropdown-container .dropdown-options {
            max-height: 150px;
          }
        }
        
        .dropdown-container .dropdown-options::-webkit-scrollbar {
          width: 4px;
        }
        
        .dropdown-container .dropdown-options::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        .dropdown-container .dropdown-options::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        
        .dark .dropdown-container .dropdown-options::-webkit-scrollbar-track {
          background: #4b5563;
        }
        
        .dark .dropdown-container .dropdown-options::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default FormStep2JobInfo;