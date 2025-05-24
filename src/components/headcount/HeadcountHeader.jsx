// src/components/headcount/HeadcountHeader.jsx
"use client";
import { Plus, Filter, Download, ChevronDown } from "lucide-react";
import Link from "next/link";
import { forwardRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { getThemeStyles } from "./utils/themeStyles";

const HeadcountHeader = forwardRef(({
  onToggleAdvancedFilter,
  onToggleActionMenu,
  isActionMenuOpen,
  selectedEmployees,
}, ref) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex-1">
        <h1 className={`text-lg font-bold ${styles.textPrimary} mb-0.5`}>
          Employee Directory
        </h1>
        <p className={`text-xs ${styles.textMuted}`}>
          Manage organization headcount
        </p>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/structure/add-employee">
          <button className={`${styles.btnPrimary} text-white px-3 py-1.5 rounded-md flex items-center text-sm font-medium`}>
            <Plus size={14} className="mr-1.5" />
            Add Employee
          </button>
        </Link>

        <button
          onClick={onToggleAdvancedFilter}
          className={`${styles.btnSecondary} ${styles.textPrimary} px-3 py-1.5 rounded-md flex items-center text-sm`}
        >
          <Filter size={14} className="mr-1.5" />
          Filter
        </button>

        <button
          ref={ref}
          onClick={onToggleActionMenu}
          disabled={selectedEmployees.length === 0}
          className={`${styles.btnSecondary} ${styles.textPrimary} px-3 py-1.5 rounded-md flex items-center text-sm ${
            selectedEmployees.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Download size={14} className="mr-1.5" />
          Actions
          {selectedEmployees.length > 0 && (
            <span className="ml-1 bg-almet-sapphire text-white text-xs px-1.5 py-0.5 rounded-full">
              {selectedEmployees.length}
            </span>
          )}
          <ChevronDown size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
});

HeadcountHeader.displayName = "HeadcountHeader";

export default HeadcountHeader;