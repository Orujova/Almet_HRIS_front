// src/components/headcount/EmployeeTable/EmployeeTableHeader.jsx - Updated with backend fields
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

  return (
    <thead className={`${styles.theadBg}`}>
      <tr>
        <th scope="col" className="px-2 py-2 text-left">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-3 w-3 text-blue-600 rounded"
              checked={selectAll}
              onChange={onToggleSelectAll}
            />
            <button
              className={`ml-1 text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
              onClick={() => onSort("full_name")}
            >
              Employee 
              <SortingIndicator direction={getSortDirection("full_name")} />
            </button>
          </div>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("user__email")}
          >
            Contact Info
            <SortingIndicator direction={getSortDirection("user__email")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("business_function__name")}
          >
            Business Function & Department
            <SortingIndicator direction={getSortDirection("business_function__name")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("unit__name")}
          >
            Unit & Job Function
            <SortingIndicator direction={getSortDirection("unit__name")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("position_group__hierarchy_level")}
          >
            Position & Grade
            <SortingIndicator direction={getSortDirection("position_group__hierarchy_level")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("job_title")}
          >
            Job Title
            <SortingIndicator direction={getSortDirection("job_title")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("line_manager__full_name")}
          >
            Line Manager
            <SortingIndicator direction={getSortDirection("line_manager__full_name")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("start_date")}
          >
            Employment Dates
            <SortingIndicator direction={getSortDirection("start_date")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-[10px] font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("status__name")}
          >
            Status & Tags
            <SortingIndicator direction={getSortDirection("status__name")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <span className={`text-xs font-medium ${styles.textMuted} tracking-wider`}>
            Visibility
          </span>
        </th>

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
