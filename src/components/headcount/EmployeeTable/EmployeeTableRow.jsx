// src/components/headcount/EmployeeTable/EmployeeTableRow.jsx - Enhanced with Modern Components
"use client";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles, getEmployeeColors } from "../utils/themeStyles";
import EmployeeStatusBadge from "../EmployeeStatusBadge";
import EmployeeTag from "../EmployeeTag";
import EmployeeVisibilityToggle from "../EmployeeVisibilityToggle";
import ActionsDropdown from "../ActionsDropdown";

const EmployeeTableRow = ({
  employee,
  isSelected,
  onToggleSelection,
  isVisible,
  onVisibilityChange,
  onAction,
  // Enhanced functionality props
  isUpdatingVisibility = false,
  showVisibilityConfirmation = false
}) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);
  
  // Local state for visibility operations
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  
  // Get employee colors for border
  const employeeColors = getEmployeeColors(employee, darkMode);

  // Generate initials from employee name
  const getInitials = (name) => {
    if (!name) return "NA";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0);
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  };

  // Use the correct field from backend response
  const employeeName = employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
  const initials = getInitials(employeeName);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "2-digit" 
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return phone;
    }
    return phone;
  };

  // Enhanced visibility change handler with proper state management
  const handleVisibilityChange = async (employeeId, newVisibility) => {
    if (visibilityLoading) return;
    
    setVisibilityLoading(true);
    
    try {
      // Call the parent handler which should handle API call
      await onVisibilityChange(employeeId, newVisibility);
      
      console.log(`✅ Employee ${employeeId} visibility updated to ${newVisibility ? 'visible' : 'hidden'}`);
      
    } catch (error) {
      console.error('❌ Failed to update visibility:', error);
      alert(`Failed to update visibility: ${error.message}`);
    } finally {
      setVisibilityLoading(false);
    }
  };

  // Enhanced action handler - pass to parent
  const handleEmployeeAction = (employeeId, action) => {
    console.log('🔧 ROW: Employee action triggered:', { employeeId, action });
    
    // Call parent action handler
    if (onAction) {
      onAction(employeeId, action);
    } else {
      console.warn('⚠️ ROW: No onAction handler provided');
    }
  };

  // Enhanced tag processing with safe handling
  const getTagsToDisplay = () => {
    const tags = [];
    
    // Handle tag_names array (string names)
    if (employee.tag_names && Array.isArray(employee.tag_names)) {
      employee.tag_names.forEach((tagItem, idx) => {
        if (typeof tagItem === 'string') {
          tags.push({
            id: `tag_name_${idx}`,
            name: tagItem,
            tag_type: 'OTHER',
            color: '#gray'
          });
        } else if (typeof tagItem === 'object' && tagItem.name) {
          tags.push({
            id: tagItem.id || `tag_obj_${idx}`,
            name: tagItem.name,
            tag_type: tagItem.tag_type || tagItem.type || 'OTHER',
            color: tagItem.color || '#gray'
          });
        }
      });
    }
    
    // Handle tags array (full tag objects)
    if (employee.tags && Array.isArray(employee.tags)) {
      employee.tags.forEach((tag, idx) => {
        if (typeof tag === 'object' && tag.name) {
          tags.push({
            id: tag.id || `tag_full_${idx}`,
            name: tag.name,
            tag_type: tag.tag_type || tag.type || 'OTHER',
            color: tag.color || '#gray'
          });
        }
      });
    }
    
    return tags;
  };

  const tagsToDisplay = getTagsToDisplay();

  // Modern row style with soft border and selection state
  const rowStyle = {
    borderLeft: `3px solid ${employeeColors.borderColor}`,
    backgroundColor: isSelected 
      ? (darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
      : 'transparent'
  };

  // Modern avatar style with soft colors
  const avatarStyle = {
    background: `linear-gradient(135deg, ${employeeColors.borderColor}, ${employeeColors.borderColor}95)`,
    color: 'white'
  };

  return (
    <tr
      className={`
        transition-all duration-200 ease-out
        ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50/80'}
        ${visibilityLoading ? 'opacity-75' : ''}
        border-b border-gray-100/50 dark:border-gray-800/50
      `}
      style={rowStyle}
    >
      {/* Employee Info - Name & Employee ID */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500 focus:ring-1 transition-all"
            checked={isSelected}
            onChange={() => onToggleSelection(employee.id)}
          />
          <div className="flex items-center ml-2">
            {/* Compact Avatar */}
            <div 
              className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 shadow-sm backdrop-blur-sm"
              style={avatarStyle}
            >
              {employee.profile_image ? (
                <img
                  src={employee.profile_image}
                  alt={employeeName}
                  className="h-full w-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span style={{ display: employee.profile_image ? 'none' : 'flex' }}>
                {initials}
              </span>
            </div>
            <div>
              {/* Smaller clickable name */}
              <Link href={`/structure/employee/${employee.id}`}>
                <div className={`
                  text-xs font-medium ${styles.textPrimary} truncate max-w-[120px] 
                  hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer 
                  hover:underline transition-colors duration-200
                `}>
                  {employeeName}
                </div>
              </Link>
              <div className={`text-xs ${styles.textMuted} mt-0.5`}>
                {employee.employee_id || 'No ID'}
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Contact Info - Email & Phone */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[120px]`}>
            {employee.email || 'No email'}
          </div>
          <div className={`text-xs ${styles.textMuted}`}>
            {formatPhone(employee.phone)}
          </div>
          {employee.date_of_birth && (
            <div className={`text-xs ${styles.textMuted}`}>
              DOB: {formatDate(employee.date_of_birth)}
            </div>
          )}
        </div>
      </td>

      {/* Business Function & Department */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[100px]`}>
            {employee.business_function_name || 'No BF'}
          </div>
          <div className={`text-xs ${styles.textMuted} truncate max-w-[100px]`}>
            {employee.department_name || 'No Department'}
          </div>
        </div>
      </td>

      {/* Unit & Job Function */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[100px]`}>
            {employee.unit_name || 'No Unit'}
          </div>
          <div className={`text-xs ${styles.textMuted} truncate max-w-[100px]`}>
            {employee.job_function_name || 'No Job Function'}
          </div>
        </div>
      </td>

      {/* Position & Grade */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col items-center space-y-0.5">
          <div className="flex items-center">
            <div className={`text-xs ${styles.textSecondary} truncate max-w-[100px] text-center`}>
              {employee.position_group_name || 'No Position'}
            </div>
          </div>
          <div className={`text-xs ${styles.textMuted} text-center`}>
            {employee.grading_display || employee.grading_level || 'No Grade'}
          </div>
        </div>
      </td>

      {/* Job Title */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className={`text-xs ${styles.textSecondary} truncate max-w-[120px]`}>
          {employee.job_title || 'No Title'}
        </div>
      </td>

      {/* Line Manager */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div className={`text-xs ${styles.textSecondary} truncate max-w-[120px]`}>
            {employee.line_manager_name || 'No Manager'}
          </div>
          {employee.line_manager_hc_number && (
            <div className={`text-xs ${styles.textMuted}`}>
              HC: {employee.line_manager_hc_number}
            </div>
          )}
          {employee.direct_reports_count > 0 && (
            <div className={`text-xs ${styles.textMuted}`}>
              Reports: {employee.direct_reports_count}
            </div>
          )}
        </div>
      </td>

      {/* Employment Dates */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col space-y-0.5">
          <div className={`text-xs ${styles.textSecondary}`}>
            Start: {formatDate(employee.start_date)}
          </div>
          {employee.end_date && (
            <div className={`text-xs ${styles.textMuted}`}>
              End: {formatDate(employee.end_date)}
            </div>
          )}
        </div>
      </td>

      {/* Status & Tags */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex flex-col justify-center space-y-1">
          <div className="flex justify-center">
            <EmployeeStatusBadge 
              status={employee.status_name || employee.current_status_display || 'Unknown'} 
              color={employee.status_color}
              size="xs"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-0.5">
            {tagsToDisplay.slice(0, 3).map((tag, idx) => (
              <EmployeeTag 
                key={`tag-${tag.id || idx}`}
                tag={tag}
                size="xs"
              />
            ))}
            {tagsToDisplay.length > 3 && (
              <span className={`text-xs ${styles.textMuted} px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full`}>
                +{tagsToDisplay.length - 3}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Compact Visibility Toggle */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex justify-center">
          <EmployeeVisibilityToggle
            employeeId={employee.id}
            initialVisibility={employee.is_visible_in_org_chart !== false}
            onVisibilityChange={handleVisibilityChange}
            isLoading={visibilityLoading || isUpdatingVisibility}
            size="xs"
            showTooltip={true}
            confirmToggle={showVisibilityConfirmation}
            disabled={false}
          />
        </div>
      </td>

      {/* Compact Actions */}
      <td className="px-2 py-2 whitespace-nowrap text-center">
        <div className="flex items-center justify-center">
          <ActionsDropdown
            employeeId={employee.id}
            employee={employee}
            onAction={handleEmployeeAction}
            disabled={visibilityLoading}
          />
        </div>
      </td>
    </tr>
  );
};

export default EmployeeTableRow;