// src/components/headcount/EmployeeDetail/EmployeeJobInfo.jsx
import { Briefcase, Users, Building, LayoutGrid, Target, User, Award } from "lucide-react";
import Link from "next/link";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Job Information component for employee detail page
 * @param {Object} props - Component props
 * @param {Object} props.employee - Employee data
 * @returns {JSX.Element} - Employee job information component
 */
const EmployeeJobInfo = ({ employee }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const shadowClass = darkMode ? "" : "shadow-md";

  const InfoItem = ({ icon, label, value, isLink, linkPath }) => (
    <div className="mb-4">
      <div className="flex items-center mb-1">
        <span className={`${textMuted} mr-2`}>{icon}</span>
        <p className={`${textMuted} text-sm`}>{label}</p>
      </div>
      {isLink && linkPath ? (
        <Link 
          href={linkPath}
          className={`${textPrimary} hover:underline`}
        >
          {value || "N/A"}
        </Link>
      ) : (
        <p className={`${textPrimary}`}>{value || "N/A"}</p>
      )}
    </div>
  );

  return (
    <div className={`${bgCard} rounded-lg p-6 ${shadowClass} h-full`}>
      <h3 className={`text-lg font-medium ${textPrimary} mb-4 border-b ${borderColor} pb-2`}>
        Job Information
      </h3>

      <div className="space-y-2">
        <InfoItem 
          icon={<Briefcase size={16} />}
          label="Job Title"
          value={employee.jobTitle}
        />

        <InfoItem 
          icon={<Users size={16} />}
          label="Department"
          value={employee.department}
        />

        <InfoItem 
          icon={<Building size={16} />}
          label="Business Function"
          value={employee.businessFunction}
        />

        <InfoItem 
          icon={<LayoutGrid size={16} />}
          label="Unit"
          value={employee.unit}
        />

        <InfoItem 
          icon={<Target size={16} />}
          label="Job Function"
          value={employee.jobFunction}
        />

        <InfoItem 
          icon={<Award size={16} />}
          label="Position Group"
          value={employee.positionGroup}
        />

        <InfoItem 
          icon={<Building size={16} />}
          label="Office"
          value={employee.office}
        />

        <InfoItem 
          icon={<Award size={16} />}
          label="Grade"
          value={employee.grade}
        />
        
        {employee.lineManager && (
          <InfoItem 
            icon={<User size={16} />}
            label="Line Manager"
            value={employee.lineManager}
            isLink={true}
            linkPath={employee.lineManagerHcNumber ? `/structure/employee/${employee.lineManagerHcNumber}` : "#"}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeJobInfo;