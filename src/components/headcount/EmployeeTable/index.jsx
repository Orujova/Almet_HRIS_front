// src/components/headcount/EmployeeTable/index.jsx - Updated for Modal Actions
"use client";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles } from "../utils/themeStyles";
import EmployeeTableHeader from "./EmployeeTableHeader";
import EmployeeTableRow from "./EmployeeTableRow";
import EmptyStateMessage from "./EmptyStateMessage";

const EmployeeTable = ({
  employees = [],
  selectedEmployees = [],
  selectAll = false,
  onToggleSelectAll,
  onToggleEmployeeSelection,
  onSort,
  getSortDirection,
  isSorted, // ← YENİ
  getSortIndex, // ← YENİ
  employeeVisibility = {},
  onVisibilityChange,
  onEmployeeAction, // ← YENİ: Modal actions üçün
  hasFilters = false,
  onClearFilters,
  loading = false,
  // YENİ: Enhanced props
  isUpdatingVisibility = false,
  showVisibilityConfirmation = false,
  darkMode // ← Bu artıq direct prop kimi gələ bilər
}) => {
  const { darkMode: themeDarkMode } = useTheme();
  const effectiveDarkMode = darkMode !== undefined ? darkMode : themeDarkMode;
  const styles = getThemeStyles(effectiveDarkMode);

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.bgCard} rounded-lg ${styles.shadowClass} overflow-hidden border ${styles.borderColor}`}>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-almet-sapphire"></div>
          <p className={`mt-4 ${styles.textMuted}`}>Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.bgCard} rounded-lg ${styles.shadowClass} overflow-hidden border ${styles.borderColor}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Table Header */}
          <EmployeeTableHeader
            selectAll={selectAll}
            onToggleSelectAll={onToggleSelectAll}
            onSort={onSort}
            getSortDirection={getSortDirection}
            isSorted={isSorted} // ← YENİ: Sorting state
            getSortIndex={getSortIndex} // ← YENİ: Multi-sort index
          />
          
          {/* Table Body */}
          <tbody className={`bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700`}>
            {employees && employees.length > 0 ? (
              employees.map((employee) => (
                <EmployeeTableRow
                  key={employee.id}
                  employee={employee}
                  isSelected={selectedEmployees.includes(employee.id)}
                  onToggleSelection={onToggleEmployeeSelection}
                  isVisible={employeeVisibility[employee.id] ?? employee.is_visible_in_org_chart ?? true}
                  onVisibilityChange={onVisibilityChange}
                  onAction={onEmployeeAction} // ← YENİ: Pass modal action handler
                  // YENİ: Enhanced props
                  isUpdatingVisibility={isUpdatingVisibility}
                  showVisibilityConfirmation={showVisibilityConfirmation}
                />
              ))
            ) : (
              <EmptyStateMessage
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
                colSpan={10} // ← YENİ: Adjust for all columns
              />
            )}
          </tbody>
        </table>
      </div>
      
      {/* YENİ: Table Footer Summary (optional) */}
      {employees.length > 0 && (
        <div className={`px-6 py-3 border-t ${styles.borderColor} bg-gray-50 dark:bg-gray-800`}>
          <div className="flex justify-between items-center text-sm">
            <span className={styles.textMuted}>
              {employees.length} employee{employees.length !== 1 ? 's' : ''} displayed
            </span>
            {selectedEmployees.length > 0 && (
              <span className={`${styles.textPrimary} font-medium`}>
                {selectedEmployees.length} selected
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;