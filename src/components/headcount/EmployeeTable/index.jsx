// src/components/headcount/EmployeeTable/index.jsx
"use client";
import { useTheme } from "../../common/ThemeProvider";
import { getThemeStyles } from "../utils/themeStyles";
import EmployeeTableHeader from "./EmployeeTableHeader";
import EmployeeTableRow from "./EmployeeTableRow";
import EmptyStateMessage from "./EmptyStateMessage";

/**
 * Əməkdaşlar cədvəli komponenti
 * @param {Object} props - Komponent parametrləri
 * @param {Array} props.employees - Əməkdaşlar siyahısı
 * @param {Array} props.selectedEmployees - Seçilmiş əməkdaşlar siyahısı
 * @param {boolean} props.selectAll - Bütün əməkdaşlar seçilib ya yox
 * @param {Function} props.onToggleSelectAll - Bütün əməkdaşların seçim vəziyyətini dəyişən funksiya
 * @param {Function} props.onToggleEmployeeSelection - Əməkdaşın seçim vəziyyətini dəyişən funksiya
 * @param {Function} props.onSort - Sıralama parametrini dəyişən funksiya
 * @param {Function} props.getSortDirection - Sahənin sıralama istiqamətini qaytaran funksiya
 * @param {Object} props.employeeVisibility - Əməkdaşların görünmə vəziyyəti
 * @param {Function} props.onVisibilityChange - Əməkdaşın görünmə vəziyyətini dəyişən funksiya
 * @param {Function} props.onEmployeeAction - Əməkdaş üzərində əməliyyat seçildikdə çağrılan funksiya
 * @param {boolean} props.hasFilters - Filtrlər aktivdir ya yox
 * @param {Function} props.onClearFilters - Filtrləri təmizləmək üçün funksiya
 * @returns {JSX.Element} - Əməkdaşlar cədvəli komponenti
 */
const EmployeeTable = ({
  employees,
  selectedEmployees,
  selectAll,
  onToggleSelectAll,
  onToggleEmployeeSelection,
  onSort,
  getSortDirection,
  employeeVisibility,
  onVisibilityChange,
  onEmployeeAction,
  hasFilters,
  onClearFilters,
}) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  return (
    <div className={`${styles.bgCard} rounded-lg ${styles.shadowClass}`}>
      <div >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <EmployeeTableHeader
            selectAll={selectAll}
            onToggleSelectAll={onToggleSelectAll}
            onSort={onSort}
            getSortDirection={getSortDirection}
          />
          <tbody className={`divide-y ${styles.borderColor}`}>
            {employees.length > 0 ? (
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