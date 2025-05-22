// src/components/headcount/EmployeeTable/EmployeeTableHeader.jsx
"use client";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles } from "../utils/themeStyles";
import SortingIndicator from "../SortingIndicator";

/**
 * Əməkdaşlar cədvəlinin başlıq komponenti
 * @param {Object} props - Komponent parametrləri
 * @param {boolean} props.selectAll - Bütün əməkdaşlar seçilib ya yox
 * @param {Function} props.onToggleSelectAll - Bütün əməkdaşların seçim vəziyyətini dəyişən funksiya
 * @param {Function} props.onSort - Sıralama parametrini dəyişən funksiya
 * @param {Function} props.getSortDirection - Sahənin sıralama istiqamətini qaytaran funksiya
 * @returns {JSX.Element} - Cədvəl başlığı komponenti
 */
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
              onClick={() => onSort("name")}
            >
              Employee Info
              <SortingIndicator direction={getSortDirection("name")} />
            </button>
          </div>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("email")}
          >
            Contact Info
            <SortingIndicator direction={getSortDirection("email")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("businessFunction")}
          >
            Organization
            <SortingIndicator direction={getSortDirection("businessFunction")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("unit")}
          >
            Unit & Function
            <SortingIndicator direction={getSortDirection("unit")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("positionGroup")}
          >
            Hierarchy & Grade
            <SortingIndicator direction={getSortDirection("positionGroup")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("jobTitle")}
          >
            Job Title
            <SortingIndicator direction={getSortDirection("jobTitle")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("lineManager")}
          >
            Line Manager
            <SortingIndicator direction={getSortDirection("lineManager")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("startDate")}
          >
            Employment Dates
            <SortingIndicator direction={getSortDirection("startDate")} />
          </button>
        </th>

        <th scope="col" className="px-2 py-2 text-left">
          <button
            className={`text-xs font-medium ${styles.textMuted} tracking-wider flex items-center`}
            onClick={() => onSort("status")}
          >
            Status & Tags
            <SortingIndicator direction={getSortDirection("status")} />
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