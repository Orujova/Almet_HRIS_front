// src/components/headcount/FormSteps/FormStep2JobInfo.jsx
import { Calendar, Building, Briefcase, Info } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
import MultiSelectDropdown from "../MultiSelectDropdown";
import { 
  getBusinessFunctions, 
  getDepartments, 
  getOffices,
  getPositionGroups
} from "../utils/mockData";

/**
 * Job information step of the employee form
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleMultiSelectChange - Function to handle multi-select changes
 * @returns {JSX.Element} - Form step component
 */
const FormStep2JobInfo = ({ formData, handleInputChange, handleMultiSelectChange }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Mock data
  const businessFunctions = getBusinessFunctions();
  const departments = getDepartments();
  const offices = getOffices();
  const positionGroups = getPositionGroups();
  
  const units = [
    "ADMINISTRATION", 
    "BUSINESS SUPPORT", 
    "FINANCE OPERATIONS", 
    "FINANCE BUSINESS", 
    "COMMERCE", 
    "LOGISTICS", 
    "WAREHOUSE INVENTORY",
    "STRATEGY EXECUTION",
    "BUSINESS DEVELOPMENT",
    "PRODUCT DEVELOPMENT"
  ];
  
  const jobFunctions = [
    "ADMINISTRATION SPECIALIST",
    "DEPUTY CHAIRMAN ON COMMERCIAL ACTIVITIES EUROPE REGION",
    "DEPUTY CHAIRMAN ON FINANCE & BUSINESS DEVELOPMENT",
    "LEGAL",
    "SENIOR BUDGETING & CONTROLLING SPECIALIST",
    "HR BUSINESS PARTNER",
    "OPERATIONS SPECIALIST",
    "WAREHOUSE FOREMAN",
    "BUSINESS DEVELOPMENT DIRECTOR",
    "OPERATIONS MANAGER",
    "SALES EXECUTIVE",
    "CHIEF ACCOUNTANT",
    "STRATEGY EXECUTION",
    "LOGISTICS",
    "PROJECTS MANAGEMENT"
  ];
  
  const jobTitles = [
    "Direktor müavini",
    "Ofis-menecer",
    "Hüquqşünas - komplayns üzre menecer",
    "Mühasib",
    "Baş mühasib",
    "İnsan resursları üzrə təcrübəçi",
    "Anbar üzrə təcrübəçi",
    "Fəhlə",
    "Satış üzrə mütəxəssis",
    "Operations Manager",
    "Chief Accountant",
    "Administrative Assistant",
    "Sales Representative"
  ];
  
  const grades = ["1", "2", "3", "4", "5", "6", "7", "8"];

  // Format date to YYYY-MM-DD for input[type=date]
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle multi-select changes
  const handleMultiSelect = (fieldName, values) => {
    if (handleMultiSelectChange) {
      handleMultiSelectChange(fieldName, values);
    }
  };

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

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className={`text-xs font-medium text-blue-800 dark:text-blue-300 mb-1`}>Employment Dates</h3>
            <p className={`text-xs text-blue-600 dark:text-blue-400`}>
              The start date is used to calculate employee tenure and benefits. Please ensure it is accurate.
            </p>
          </div>
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
            name="startDate"
            value={formatDate(formData.startDate)}
            onChange={handleInputChange}
            type="date"
            required={true}
            icon={<Calendar size={14} className={textMuted} />}
          />

          <FormField
            label="End Date (if applicable)"
            name="endDate"
            value={formatDate(formData.endDate)}
            onChange={handleInputChange}
            type="date"
            icon={<Calendar size={14} className={textMuted} />}
            helpText="Only fill this for employees who are no longer with the company"
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
          <div>
            <label className={`block ${textSecondary} text-xs font-medium mb-1.5`}>
              Business Function <span className="text-red-500">*</span>
            </label>
            <MultiSelectDropdown
              options={businessFunctions}
              placeholder="Select business functions..."
              selectedValues={formData.businessFunctions || []}
              onChange={(values) => handleMultiSelect("businessFunctions", values)}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-xs font-medium mb-1.5`}>
              Department <span className="text-red-500">*</span>
            </label>
            <MultiSelectDropdown
              options={departments}
              placeholder="Select departments..."
              selectedValues={formData.departments || []}
              onChange={(values) => handleMultiSelect("departments", values)}
            />
          </div>

          <div>
            <label className={`block ${textSecondary} text-xs font-medium mb-1.5`}>
              Unit <span className="text-red-500">*</span>
            </label>
            <MultiSelectDropdown
              options={units}
              placeholder="Select units..."
              selectedValues={formData.units || []}
              onChange={(values) => handleMultiSelect("units", values)}
            />
          </div>

          <FormField
            label="Office"
            name="office"
            value={formData.office}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Building size={14} className={textMuted} />}
            options={offices}
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
            name="positionGroup"
            value={formData.positionGroup}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} className={textMuted} />}
            options={positionGroups}
          />

          <div>
            <label className={`block ${textSecondary} text-xs font-medium mb-1.5`}>
              Job Function <span className="text-red-500">*</span>
            </label>
            <MultiSelectDropdown
              options={jobFunctions}
              placeholder="Select job functions..."
              selectedValues={formData.jobFunctions || []}
              onChange={(values) => handleMultiSelect("jobFunctions", values)}
            />
          </div>

          <FormField
            label="Job Title"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} className={textMuted} />}
            options={jobTitles}
          />

          <FormField
            label="Grade"
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            type="select"
            required={true}
            icon={<Briefcase size={14} className={textMuted} />}
            options={grades}
          />
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className={`text-xs font-medium text-amber-800 dark:text-amber-300 mb-1`}>Multiple Selections Allowed</h3>
            <p className={`text-xs text-amber-600 dark:text-amber-400`}>
              You can select multiple options for Business Function, Department, Unit, and Job Function fields. 
              This allows for more flexible organizational structures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep2JobInfo;