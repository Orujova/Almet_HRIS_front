// src/components/headcount/EmployeeDetail/EmployeePersonalInfo.jsx
import { Mail, Phone, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Personal Information component for employee detail page
 * @param {Object} props - Component props
 * @param {Object} props.employee - Employee data
 * @returns {JSX.Element} - Employee personal information component
 */
const EmployeePersonalInfo = ({ employee }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const shadowClass = darkMode ? "" : "shadow-md";

  // Format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const InfoItem = ({ icon, label, value, isEmail, isPhone }) => (
    <div className="mb-4">
      <div className="flex items-center mb-1">
        <span className={`${textMuted} mr-2`}>{icon}</span>
        <p className={`${textMuted} text-sm`}>{label}</p>
      </div>
      {isEmail ? (
        <a 
          href={`mailto:${value}`} 
          className={`${textPrimary} hover:underline break-all`}
        >
          {value || "N/A"}
        </a>
      ) : isPhone ? (
        <a 
          href={`tel:${value}`} 
          className={`${textPrimary} hover:underline`}
        >
          {value || "N/A"}
        </a>
      ) : (
        <p className={`${textPrimary}`}>{value || "N/A"}</p>
      )}
    </div>
  );

  return (
    <div className={`${bgCard} rounded-lg p-6 ${shadowClass} h-full`}>
      <h3 className={`text-lg font-medium ${textPrimary} mb-4 border-b ${borderColor} pb-2`}>
        Personal Information
      </h3>

      <div className="space-y-2">
        <InfoItem 
          icon={<Mail size={16} />}
          label="Email Address"
          value={employee.email}
          isEmail={true}
        />

        <InfoItem 
          icon={<Phone size={16} />}
          label="Phone Number"
          value={employee.phone}
          isPhone={true}
        />

        <InfoItem 
          icon={<Calendar size={16} />}
          label="Date of Birth"
          value={formatDate(employee.dateOfBirth)}
        />

        <InfoItem 
          icon={<MapPin size={16} />}
          label="Address"
          value={employee.address}
        />

        <InfoItem 
          icon={<AlertTriangle size={16} />}
          label="Emergency Contact"
          value={employee.emergencyContact}
        />

        <InfoItem 
          icon={<Calendar size={16} />}
          label="Join Date"
          value={formatDate(employee.joinDate)}
        />

        {employee.endDate && (
          <InfoItem 
            icon={<Calendar size={16} />}
            label="End Date"
            value={formatDate(employee.endDate)}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeePersonalInfo;