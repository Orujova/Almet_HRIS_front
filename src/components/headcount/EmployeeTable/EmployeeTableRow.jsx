// src/components/headcount/EmployeeTable/EmployeeTableRow.jsx
"use client";
import Link from "next/link";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles, getDepartmentColor } from "../utils/themeStyles";
import EmployeeStatusBadge from "../EmployeeStatusBadge";
import EmployeeTag from "../EmployeeTag";
import EmployeeVisibilityToggle from "../EmployeeVisibilityToggle";
import ActionsDropdown from "../ActionsDropdown";

/**
 * Təkmilləşdirilmiş əməkdaş sətiri komponenti (profil şəkli ilə)
 * @param {Object} props - Komponent parametrləri
 * @param {Object} props.employee - Əməkdaş məlumatları
 * @param {boolean} props.isSelected - Əməkdaş seçilib ya yox
 * @param {Function} props.onToggleSelection - Əməkdaşın seçim vəziyyətini dəyişən funksiya
 * @param {boolean} props.isVisible - Əməkdaş görünürdür ya yox
 * @param {Function} props.onVisibilityChange - Əməkdaşın görünmə vəziyyətini dəyişən funksiya
 * @param {Function} props.onAction - Əməkdaş üzərində əməliyyat seçildikdə çağrılan funksiya
 * @returns {JSX.Element} - Əməkdaş sətiri komponenti
 */
const EmployeeTableRow = ({
  employee,
  isSelected,
  onToggleSelection,
  isVisible,
  onVisibilityChange,
  onAction,
}) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);
  const departmentColor = getDepartmentColor(employee.department, darkMode);

  // Generate initials from employee name
  const getInitials = (name) => {
    if (!name) return "NA";
    
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0);
    
    // Get first letter of first name and first letter of last name
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  };

  // Function to get avatar background color based on department
  const getAvatarColor = (department) => {
    const departmentColors = {
      ADMINISTRATIVE: "bg-yellow-500",
      COMPLIANCE: "bg-red-500",
      FINANCE: "bg-green-500",
      HR: "bg-purple-500",
      OPERATIONS: "bg-orange-500",
      "PROJECTS MANAGEMENT": "bg-teal-500",
      TRADE: "bg-indigo-500",
      "STOCK SALES": "bg-pink-500",
      "BUSINESS DEVELOPMENT": "bg-blue-500",
    };

    // Default to a color if department not found
    return departmentColors[department] || "bg-almet-sapphire";
  };

  const avatarColor = getAvatarColor(employee.department);
  const initials = getInitials(employee.name);

  return (
    <tr
      className={`${
        isSelected
          ? darkMode
            ? "bg-almet-sapphire/20"
            : "bg-almet-sapphire/10"
          : departmentColor
      } ${styles.hoverBg} transition-colors duration-150`}
    >
      {/* Employee Info with Avatar */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-3 w-3 text-blue-600 rounded"
            checked={isSelected}
            onChange={() => onToggleSelection(employee.id)}
          />
          <div className="flex items-center ml-2">
            {/* Avatar/Image */}
            <div className={`h-7 w-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-medium mr-2`}>
              {employee.profileImage ? (
                <img
                  src={employee.profileImage}
                  alt={employee.name}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <Link href={`/structure/employee/${employee.id}`}>
                <div
                  className={`text-xs font-medium ${styles.textPrimary} hover:underline truncate max-w-[120px]`}
                >
                  {employee.name}
                </div>
              </Link>
              <div className={`text-[10px] ${styles.textMuted}`}>
                {employee.empNo}
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Grade/Email */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col">
          <div className={`text-xs ${styles.textSecondary} text-center`}>
            {employee.grade}
          </div>
          <div className={`text-[10px] ${styles.textMuted} truncate max-w-[120px]`}>
            {employee.email}
          </div>
        </div>
      </td>

      {/* Business Info */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[100px]`}>
            {employee.businessFunction}
          </div>
          <div className={`text-[10px] ${styles.textMuted} truncate max-w-[100px]`}>
            {employee.department}
          </div>
        </div>
      </td>

      {/* Unit / Job Function */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[100px]`}>
            {employee.unit}
          </div>
          <div className={`text-[10px] ${styles.textMuted} truncate max-w-[100px]`}>
            {employee.jobFunction}
          </div>
        </div>
      </td>

      {/* Job Title / Position */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[100px]`}>
            {employee.jobTitle.split(" ").slice(0, 2).join(" ")}
            {employee.jobTitle.split(" ").length > 2 && "..."}
          </div>
          <div className={`text-[10px] ${styles.textMuted} truncate max-w-[100px]`}>
            {employee.positionGroup}
          </div>
        </div>
      </td>

      {/* Line Manager */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[120px]`}>
            {employee.lineManager || "N/A"}
          </div>
          <div className={`text-[10px] ${styles.textMuted}`}>
            HC: {employee.lineManagerHcNumber || "N/A"}
          </div>
        </div>
      </td>

      {/* Dates */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col">
          <div className={`text-xs ${styles.textSecondary}`}>
            Start: {new Date(employee.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
          </div>
          {employee.endDate && (
            <div className={`text-[10px] ${styles.textMuted}`}>
              End: {new Date(employee.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
            </div>
          )}
        </div>
      </td>

      {/* Status & Tags */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col justify-center space-y-1">
          <EmployeeStatusBadge status={employee.status} />
          <div className="flex flex-wrap justify-center gap-1">
            {employee.tags &&
              employee.tags.map((tag, idx) => (
                <EmployeeTag key={idx} tag={tag} />
              ))}
          </div>
        </div>
      </td>

      {/* Visibility Toggle */}
      <td className="px-2 py-2 whitespace-nowrap">
        <EmployeeVisibilityToggle
          employeeId={employee.id}
          initialVisibility={isVisible}
          onVisibilityChange={(newVisibility) => onVisibilityChange(employee.id, newVisibility)}
        />
      </td>

      {/* Actions */}
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <ActionsDropdown
          employeeId={employee.id}
          onAction={(action) => onAction(employee.id, action)}
        />
      </td>
    </tr>
  );
};

export default EmployeeTableRow;