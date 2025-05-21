// src/components/headcount/FormSteps/FormStep2JobInfo.jsx
import { Calendar, Building, Briefcase } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
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
 * @returns {JSX.Element} - Form step component
 */
const FormStep2JobInfo = ({ formData, handleInputChange }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";

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
    "WAREHOUSE INVENTORY"
  ];
  
  const jobFunctions = [
    "ADMINISTRATION SPECIALIST",
    "DEPUTY CHAIRMAN ON COMMERCIAL ACTIVITIES EUROPE REGION",
    "LEGAL",
    "SENIOR BUDGETING & CONTROLLING SPECIALIST",
    "HR BUSINESS PARTNER",
    "OPERATIONS SPECIALIST",
    "WAREHOUSE FOREMAN",
    "BUSINESS DEVELOPMENT DIRECTOR",
    "OPERATIONS MANAGER",
    "SALES EXECUTIVE",
    "CHIEF ACCOUNTANT"
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
    "Chief Accountant"
  ];
  
  const grades = ["1", "2", "3", "4", "5", "6", "7"];

  // Format date to YYYY-MM-DD for input[type=date]
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className={`text-xl font-bold ${textPrimary}`}>
          Job Information
        </h2>
        <div className="text-sm px-3 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue rounded-md font-medium">
          Step 2 of 4
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className={`text-sm font-medium text-blue-800 dark:text-blue-300`}>Important</h3>
            <p className={`text-sm text-blue-600 dark:text-blue-400 mt-0.5`}>
              The start date is used to calculate employee tenure and benefits. Please ensure it is accurate.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <FormField
          label="Start Date"
          name="startDate"
          value={formatDate(formData.startDate)}
          onChange={handleInputChange}
          type="date"
          required={true}
          icon={<Calendar size={18} className={textMuted} />}
        />

        <FormField
          label="End Date (if applicable)"
          name="endDate"
          value={formatDate(formData.endDate)}
          onChange={handleInputChange}
          type="date"
          icon={<Calendar size={18} className={textMuted} />}
          helpText="Only fill this for employees who are no longer with the company"
        />

        <FormField
          label="Business Function"
          name="businessFunction"
          value={formData.businessFunction}
          onChange={handleInputChange}
          type="select"
          required={true}
          icon={<Building size={18} className={textMuted} />}
          options={businessFunctions}
        />

        <FormField
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          type="select"
          required={true}
          icon={<Building size={18} className={textMuted} />}
          options={departments}
        />

        <FormField
          label="Unit"
          name="unit"
          value={formData.unit}
          onChange={handleInputChange}
          type="select"
          required={true}
          icon={<Building size={18} className={textMuted} />}
          options={units}
        />

        <FormField
          label="Office"
          name="office"
          value={formData.office}
          onChange={handleInputChange}
          type="select"
          required={true}
          icon={<Building size={18} className={textMuted} />}
          options={offices}
        />

        <FormField
          label="Position Group"
          name="positionGroup"
          value={formData.positionGroup}
          onChange={handleInputChange}
          type="select"
          required={true}
          icon={<Briefcase size={18} className={textMuted} />}
          options={positionGroups}
        />

        <FormField
          label="Job Function"
          name="jobFunction"
          value={formData.jobFunction}
          onChange={handleInputChange}
          type="select"
          required={true}
          icon={<Briefcase size={18} className={textMuted} />}
          options={jobFunctions}
        />

        <FormField
          label="Job Title"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleInputChange}
          type="select"
          required={true}
          icon={<Briefcase size={18} className={textMuted} />}
          options={jobTitles}
        />

        <FormField
          label="Grade"
          name="grade"
          value={formData.grade}
          onChange={handleInputChange}
          type="select"
          required={true}
          icon={<Briefcase size={18} className={textMuted} />}
          options={grades}
        />
      </div>
    </div>
  );
};

export default FormStep2JobInfo;