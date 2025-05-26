// src/components/headcount/HeadcountHeader.jsx
"use client";
import { useState } from "react";
import { Plus, Filter, Download, ChevronDown, Upload, Users } from "lucide-react";
import Link from "next/link";
import { forwardRef } from "react";
import { useTheme } from "../common/ThemeProvider";
import { getThemeStyles } from "./utils/themeStyles";
import BulkUploadForm from "./BulkUploadForm";

const HeadcountHeader = forwardRef(({
  onToggleAdvancedFilter,
  onToggleActionMenu,
  isActionMenuOpen,
  selectedEmployees,
  onBulkImportComplete
}, ref) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleBulkImportComplete = (results) => {
    console.log("Bulk import completed:", results);
    if (onBulkImportComplete) {
      onBulkImportComplete(results);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <h1 className={`text-2xl font-bold ${styles.textPrimary} mb-2`}>
            Employee Directory
          </h1>
          <p className={`text-sm ${styles.textMuted}`}>
            Manage organization headcount and employee information
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Add Employee Button */}
          <Link href="/structure/add-employee">
            <button className={`${styles.btnPrimary} text-white px-4 py-2.5 rounded-lg flex items-center text-sm font-medium shadow-sm hover:shadow-md transition-all`}>
              <Plus size={16} className="mr-2" />
              Add Employee
            </button>
          </Link>

          {/* Bulk Upload Button */}
          <button
            onClick={() => setShowBulkUpload(true)}
            className={`${styles.btnSecondary} ${styles.textPrimary} px-4 py-2.5 rounded-lg flex items-center text-sm font-medium border ${styles.borderColor} hover:shadow-sm transition-all`}
          >
            <Upload size={16} className="mr-2" />
            Bulk Import
          </button>

          {/* Filter Button */}
          <button
            onClick={onToggleAdvancedFilter}
            className={`${styles.btnSecondary} ${styles.textPrimary} px-4 py-2.5 rounded-lg flex items-center text-sm font-medium border ${styles.borderColor} hover:shadow-sm transition-all`}
          >
            <Filter size={16} className="mr-2" />
            Advanced Filter
          </button>

          {/* Actions Button */}
          <button
            ref={ref}
            onClick={onToggleActionMenu}
            disabled={selectedEmployees.length === 0}
            className={`${styles.btnSecondary} ${styles.textPrimary} px-4 py-2.5 rounded-lg flex items-center text-sm font-medium border ${styles.borderColor} hover:shadow-sm transition-all ${
              selectedEmployees.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Download size={16} className="mr-2" />
            Actions
            {selectedEmployees.length > 0 && (
              <span className="ml-2 bg-almet-sapphire text-white text-xs px-2 py-1 rounded-full">
                {selectedEmployees.length}
              </span>
            )}
            <ChevronDown size={14} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadForm
          onClose={() => setShowBulkUpload(false)}
          onImportComplete={handleBulkImportComplete}
        />
      )}
    </>
  );
});

HeadcountHeader.displayName = "HeadcountHeader";

export default HeadcountHeader;