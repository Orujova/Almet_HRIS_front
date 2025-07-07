// src/components/headcount/EmployeeTable/EmployeeTableHeader.jsx - Backend Field Mapping Fixed
"use client";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles } from "../utils/themeStyles";
import SortingIndicator from "../SortingIndicator";

const EmployeeTableHeader = ({
  selectAll,
  onToggleSelectAll,
  onSort,
  getSortDirection,
}) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  // Handle sorting with proper event handling for Ctrl+Click multi-sort
  const handleSort = (field, event) => {
    event.preventDefault();
    onSort(field, event);
  };

  return (
    <thead className={`${styles.theadBg}`}>
      <tr>
        {/* Selection Column */}
        <th scope="col" className="px-2 py-2 text-left">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
              checked={selectAll}
              onChange={onToggleSelectAll}
              title="Select all employees"
            />
            <button
              className={`ml-1 text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
              onClick={(e) => handleSort("full_name", e)}
              title="Sort by employee name (Ctrl+Click for multi-sort)"
            >
              Employee 
              <SortingIndicator direction={getSortDirection("full_name")} />
            </button>
          </div>
        </th>

        {/* Contact Information */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={(e) => handleSort("email", e)}
            title="Sort by email (Ctrl+Click for multi-sort)"
          >
            Contact Info
            <SortingIndicator direction={getSortDirection("email")} />
          </button>
        </th>

        {/* Business Function & Department */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={(e) => handleSort("business_function_name", e)}
            title="Sort by business function (Ctrl+Click for multi-sort)"
          >
            Business Function & Department
            <SortingIndicator direction={getSortDirection("business_function_name")} />
          </button>
        </th>

        {/* Unit & Job Function */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={(e) => handleSort("unit_name", e)}
            title="Sort by unit (Ctrl+Click for multi-sort)"
          >
            Unit & Job Function
            <SortingIndicator direction={getSortDirection("unit_name")} />
          </button>
        </th>

        {/* Position & Grade */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={(e) => handleSort("position_group_level", e)}
            title="Sort by position group level (Ctrl+Click for multi-sort)"
          >
            Position & Grade
            <SortingIndicator direction={getSortDirection("position_group_level")} />
          </button>
        </th>

        {/* Job Title */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={(e) => handleSort("job_title", e)}
            title="Sort by job title (Ctrl+Click for multi-sort)"
          >
            Job Title
            <SortingIndicator direction={getSortDirection("job_title")} />
          </button>
        </th>

        {/* Line Manager */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={(e) => handleSort("line_manager_name", e)}
            title="Sort by line manager (Ctrl+Click for multi-sort)"
          >
            Line Manager
            <SortingIndicator direction={getSortDirection("line_manager_name")} />
          </button>
        </th>

        {/* Employment Dates */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={(e) => handleSort("start_date", e)}
            title="Sort by start date (Ctrl+Click for multi-sort)"
          >
            Employment Dates
            <SortingIndicator direction={getSortDirection("start_date")} />
          </button>
        </th>

        {/* Status & Tags */}
        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center hover:text-blue-600 transition-colors`}
            onClick={(e) => handleSort("status_name", e)}
            title="Sort by status (Ctrl+Click for multi-sort)"
          >
            Status & Tags
            <SortingIndicator direction={getSortDirection("status_name")} />
          </button>
        </th>

        {/* Visibility */}
        <th scope="col" className="px-2 py-2 text-left">
          <span className={`text-xs font-medium ${styles.textMuted} tracking-wider`}>
            Visibility
          </span>
        </th>

        {/* Actions */}
        <th scope="col" className="px-2 py-2 text-right">
          <span className={`text-xs font-medium ${styles.textMuted} tracking-wider`}>
            Actions
          </span>
        </th>
      </tr>
    </thead>
  );
};

export default EmployeeTableHeader;