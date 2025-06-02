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
  employeeVisibility = {},
  onVisibilityChange,
  onEmployeeAction,
  hasFilters = false,
  onClearFilters,
  loading = false,
}) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

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
          <EmployeeTableHeader
            selectAll={selectAll}
            onToggleSelectAll={onToggleSelectAll}
            onSort={onSort}
            getSortDirection={getSortDirection}
          />
          <tbody className={`bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700`}>
            {employees && employees.length > 0 ? (
              employees.map((employee) => (
                <EmployeeTableRow
                  key={employee.id}
                  employee={employee}
                  isSelected={selectedEmployees.includes(employee.id)}
                  onToggleSelection={onToggleEmployeeSelection}
                  isVisible={employeeVisibility[employee.id] ?? true}
                  onVisibilityChange={onVisibilityChange}
                  onAction={onEmployeeAction}
                />
              ))
            ) : (
              <EmptyStateMessage
                hasFilters={hasFilters}
                onClearFilters={onClearFilters}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;