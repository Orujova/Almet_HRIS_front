// src/components/headcount/EmployeeDetail/EmployeeAdditionalInfo.jsx
import { useTheme } from "../../common/ThemeProvider";
import EmployeeStatusBadge from "../EmployeeStatusBadge";
import EmployeeTag from "../EmployeeTag";

/**
 * Additional Information component for employee detail page
 * @param {Object} props - Component props
 * @param {Object} props.employee - Employee data
 * @returns {JSX.Element} - Employee additional information component
 */
const EmployeeAdditionalInfo = ({ employee }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const shadowClass = darkMode ? "" : "shadow-md";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-gray-100";

  return (
    <div className={`${bgCard} rounded-lg p-6 ${shadowClass} h-full`}>
      <h3 className={`text-lg font-medium ${textPrimary} mb-4 border-b ${borderColor} pb-2`}>
        Additional Information
      </h3>

      <div className="space-y-6">
        {/* Status */}
        <div>
          <p className={`${textMuted} text-sm mb-2`}>Status</p>
          <div className="flex">
            <EmployeeStatusBadge status={employee.status} />
          </div>
        </div>

        {/* Tags */}
        {employee.tags && employee.tags.length > 0 && (
          <div>
            <p className={`${textMuted} text-sm mb-2`}>Tags</p>
            <div className="flex flex-wrap gap-2">
              {employee.tags.map((tag, index) => (
                <EmployeeTag key={index} tag={tag} />
              ))}
            </div>
          </div>
        )}

        {/* Expertise/Skills */}
        {employee.expertise && employee.expertise.length > 0 && (
          <div>
            <p className={`${textMuted} text-sm mb-2`}>Expertise/Skills</p>
            <div className="flex flex-wrap gap-2">
              {employee.expertise.map((skill, index) => (
                <span
                  key={index}
                  className={`${bgAccent} ${textPrimary} px-2 py-1 rounded-md text-xs`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Direct Reports Count */}
        {employee.directReports !== undefined && (
          <div>
            <p className={`${textMuted} text-sm mb-1`}>Direct Reports</p>
            <p className={`${textPrimary}`}>
              {employee.directReports} employee(s)
            </p>
          </div>
        )}

        {/* Notes */}
        {employee.notes && (
          <div>
            <p className={`${textMuted} text-sm mb-1`}>Notes</p>
            <div className={`p-3 rounded-md ${bgAccent} ${textPrimary}`}>
              {employee.notes}
            </div>
          </div>
        )}

        {/* Performance Rating - if applicable */}
        {employee.performanceRating && (
          <div>
            <p className={`${textMuted} text-sm mb-1`}>Performance Rating</p>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${employee.performanceRating * 20}%` }}
                ></div>
              </div>
              <span className={`ml-2 ${textPrimary}`}>{employee.performanceRating}/5</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAdditionalInfo;