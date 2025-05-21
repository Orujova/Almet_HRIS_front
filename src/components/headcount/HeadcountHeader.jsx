// src/components/headcount/HeadcountHeader.jsx
"use client";
import { Plus, Filter, Download, ChevronDown } from "lucide-react";
import Link from "next/link";
import { forwardRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { getThemeStyles } from "./utils/themeStyles";

/**
 * Əməkdaşlar səhifəsinin başlıq komponenti
 * @param {Object} props - Komponent parametrləri
 * @param {Function} props.onToggleAdvancedFilter - Əlavə filtrlərə keçid funksiyası
 * @param {Function} props.onToggleActionMenu - Hərəkətlər menyusuna keçid funksiyası
 * @param {boolean} props.isActionMenuOpen - Hərəkətlər menyusu açıqdır ya yox
 * @param {Array} props.selectedEmployees - Seçilmiş əməkdaşlar siyahısı
 * @param {React.Ref} ref - Actions düyməsinə istinad
 * @returns {JSX.Element} - Başlıq komponenti
 */
const HeadcountHeader = forwardRef(({
  onToggleAdvancedFilter,
  onToggleActionMenu,
  isActionMenuOpen,
  selectedEmployees,
}, ref) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className={`text-2xl font-bold ${styles.textPrimary}`}>Employees</h1>
        <p className={`text-sm ${styles.textMuted}`}>
          Manage your organization's employee database
        </p>
      </div>
      <div className="flex space-x-2">
        <Link href="/structure/add-employee">
          <button
            className={`${styles.btnPrimary} text-white px-4 py-2 rounded-md flex items-center`}
          >
            <Plus size={16} className="mr-2" />
            Add New Employee
          </button>
        </Link>

        <button
          onClick={onToggleAdvancedFilter}
          className={`${styles.btnSecondary} ${styles.textPrimary} px-4 py-2 rounded-md flex items-center`}
        >
          <Filter size={16} className="mr-2" />
          Filters
        </button>

        <button
          ref={ref}
          onClick={onToggleActionMenu}
          disabled={selectedEmployees.length === 0}
          className={`${styles.btnSecondary} ${styles.textPrimary} px-4 py-2 rounded-md flex items-center ${
            selectedEmployees.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Download size={16} className="mr-2" />
          Actions {selectedEmployees.length > 0 ? `(${selectedEmployees.length})` : ""}
          <ChevronDown size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );
});

// DisplayName əlavə et
HeadcountHeader.displayName = "HeadcountHeader";

export default HeadcountHeader;