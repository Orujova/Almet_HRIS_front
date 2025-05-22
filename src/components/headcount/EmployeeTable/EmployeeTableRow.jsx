// src/components/headcount/EmployeeTable/EmployeeTableRow.jsx
"use client";
import Link from "next/link";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles, getEmployeeColors } from "../utils/themeStyles";
import EmployeeStatusBadge from "../EmployeeStatusBadge";
import EmployeeTag from "../EmployeeTag";
import EmployeeVisibilityToggle from "../EmployeeVisibilityToggle";
import ActionsDropdown from "../ActionsDropdown";
import { Eye, Edit } from "lucide-react";

/**
 * Employee sətiri - yalnız sol border rəngli
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
  
  // Yalnız border rəngi üçün
  const employeeColors = getEmployeeColors(employee, darkMode);

  // Generate initials from employee name
  const getInitials = (name) => {
    if (!name) return "NA";
    
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0);
    
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  };

  const initials = getInitials(employee.name);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "2-digit" 
    });
  };

  // Yalnız border və seçilmiş vəziyyət üçün style
  const rowStyle = {
    borderLeft: `4px solid ${employeeColors.borderColor}`,
    backgroundColor: isSelected 
      ? (darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
      : 'transparent'
  };

  // Avatar üçün rəng (border rəngindən)
  const avatarStyle = {
    backgroundColor: employeeColors.borderColor,
    color: 'white'
  };

  // Dot üçün rəng
  const dotStyle = {
    backgroundColor: employeeColors.dotColor
  };

  return (
    <tr
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150`}
      style={rowStyle}
    >
      {/* Employee Info - Name & HC Number */}
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
            <div 
              className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2"
              style={avatarStyle}
            >
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
              <div className={`text-xs font-medium ${styles.textPrimary} truncate max-w-[120px]`}>
                {employee.name}
              </div>
              <div className={`text-[10px] ${styles.textMuted}`}>
                HC: {employee.empNo}
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Contact Info - Email & Birthdate */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[120px]`}>
            {employee.email}
          </div>
          <div className={`text-[10px] ${styles.textMuted}`}>
            DOB: {employee.dateOfBirth ? formatDate(employee.dateOfBirth) : "N/A"}
          </div>
        </div>
      </td>

      {/* Organization - Business Function & Department */}
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

      {/* Unit & Function - Unit & Job Function */}
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

      {/* Hierarchy & Grade - Position Group & Grade */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            <div 
              className="w-2 h-2 rounded-full mr-1"
              style={dotStyle}
            ></div>
            <div className={`text-xs ${styles.textSecondary} truncate max-w-[100px]`}>
              {employee.positionGroup}
            </div>
          </div>
          <div className={`text-[10px] ${styles.textMuted} text-center mt-1`}>
            Grade: {employee.grade}
          </div>
        </div>
      </td>

      {/* Job Title */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className={`text-xs ${styles.textSecondary} truncate max-w-[120px]`}>
          {employee.jobTitle}
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

      {/* Employment Dates */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col">
          <div className={`text-xs ${styles.textSecondary}`}>
            Start: {formatDate(employee.startDate)}
          </div>
          {employee.endDate && (
            <div className={`text-[10px] ${styles.textMuted}`}>
              End: {formatDate(employee.endDate)}
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
        <div className="flex items-center justify-center gap-1">
          <ActionsDropdown
            employeeId={employee.id}
            onAction={(action) => onAction(employee.id, action)}
          />
        </div>
      </td>
    </tr>
  );
};

export default EmployeeTableRow;