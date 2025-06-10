// src/components/headcount/FormSteps/FormStep2JobInfo.jsx - Updated with backend integration
import { Calendar, Building, Briefcase, Info } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

const FormStep2JobInfo = ({ 
  formData, 
  handleInputChange, 
  validationErrors = {},
  businessFunctions = [],
  departments = [],
  units = [],
  jobFunctions = [],
  positionGroups = []
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Format date to YYYY-MM-DD for input[type=date]
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Grade options
  const gradeOptions = Array.from({ length: 8 }, (_, i) => ({
    value: i + 1,
    label: `Grade ${i + 1}`
  }));

  // Contract duration options
  const contractDurationOptions = [
    { value: 'PERMANENT', label: 'Permanent' },
    { value: '1_YEAR', label: '1 Year' },
    { value: '6_MONTHS', label: '6 Months' },
    { value: '3_MONTHS', label: '3 Months' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        <h2 className={`text-lg font-bold ${textPrimary}`}>
          Job Information
        </h2>
        <div className="text-xs px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded font-medium">
          Step 2 of 4
        </div>
      </div>

      {/* Employment Dates Section */}
      <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
          <Calendar className="mr-1.5 text-almet-sapphire" size={16} />
          Employment Dates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Start Date"
            name="start_date"
            value={formatDate(formData.start_date)}
            onChange={handleInputChange}
            type="date"
            required={true}
            icon={<Calendar size={14} className={textMuted} />}
            validationError={validationErrors.start_date}
          />

          <FormField
            label="End Date (if applicable)"
            name="end_date"
            value={formatDate(formData.end_date)}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            helpText="Only fill this for employees who are no longer with the company"
          />
        </div>
      </div>

      {/* Contract Information Section */}
      <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
          <Briefcase className="mr-1.5 text-almet-sapphire" size={16} />
          Contract Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Contract Duration"
            name="contract_duration"
            value={formData.contract_duration}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} className={textMuted} />}
            options={contractDurationOptions}
            helpText="Affects automatic status management"
          />

          <FormField
            label="Contract Start Date"
            name="contract_start_date"
            value={formatDate(formData.contract_start_date)}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            helpText="Used for probation period calculation"
          />
        </div>
      </div>

      {/* Organizational Structure Section */}
      <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
          <Building className="mr-1.5 text-almet-sapphire" size={16} />
          Organizational Structure
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          />

          <FormField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Building size={14} className={textMuted} />}
            options={departments.map(dept => ({ value: dept.id, label: dept.name }))}
            validationError={validationErrors.department}
          />

          <FormField
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            type="select"
            icon={<Building size={14} className={textMuted} />}
            options={units.map(unit => ({ value: unit.id, label: unit.name }))}
          />

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
          />
        </div>
      </div>

      {/* Job Details Section */}
      <div className={`${bgCard} rounded-lg p-4 border ${borderColor}`}>
        <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center`}>
          <Briefcase className="mr-1.5 text-almet-sapphire" size={16} />
          Job Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Position Group"
            name="position_group"
            value={formData.position_group}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} className={textMuted} />}
            options={positionGroups.map(pg => ({ value: pg.id, label: pg.name }))}
            validationError={validationErrors.position_group}
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
          />

          <FormField
            label="Grade"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} className={textMuted} />}
            options={gradeOptions}
            validationError={validationErrors.grade}
          />
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className={`text-xs font-medium text-amber-800 dark:text-amber-300 mb-1`}>Automatic Status Management</h3>
            <p className={`text-xs text-amber-600 dark:text-amber-400`}>
              Employee status will be automatically managed based on contract duration and employment dates. 
              The system will set status to ONBOARDING, PROBATION, or ACTIVE automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep2JobInfo;