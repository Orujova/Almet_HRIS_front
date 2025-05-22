// src/components/headcount/Pagination.jsx
"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { getThemeStyles } from "./utils/themeStyles";

/**
 * Səhifələmə komponenti
 * @param {Object} props - Komponent parametrləri
 * @param {number} props.currentPage - Cari səhifə
 * @param {number} props.totalPages - Ümumi səhifə sayı
 * @param {number} props.itemsPerPage - Səhifə başına element sayı
 * @param {number} props.totalItems - Ümumi element sayı
 * @param {number} props.startIndex - İlk elementin indeksi
 * @param {number} props.endIndex - Son elementin indeksi
 * @param {Function} props.onPageChange - Səhifə dəyişdikdə çağrılan funksiya
 * @param {Function} props.onItemsPerPageChange - Səhifə başına element sayı dəyişdikdə çağrılan funksiya
 * @returns {JSX.Element} - Səhifələmə komponenti
 */
const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  // Səhifə rəqəmlərini render etmək
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`p-1 rounded-md w-5 h-5 flex items-center justify-center mx-0.5 text-xs transition-colors ${
            currentPage === i
              ? "bg-almet-sapphire text-white"
              : "bg-gray-700 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2">
      {/* Left side - Navigation */}
      <div className="flex items-center">
        <button
          className={`bg-gray-700 text-white p-1.5 rounded-md mr-2 transition-colors ${
            currentPage === 1 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
          }`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={14} />
        </button>

        {renderPageNumbers()}

        {totalPages > 5 && currentPage + 2 < totalPages && (
          <>
            <span className={`${styles.textMuted} mx-1 text-xs`}>...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="bg-gray-700 text-white p-1 rounded-md w-5 h-5 text-xs flex items-center justify-center mx-0.5 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className={`bg-gray-700 text-white p-1.5 rounded-md ml-2 transition-colors ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
          }`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Center - Item count info */}
      <div className={`${styles.textMuted} text-xs`}>
        {startIndex + 1}-{endIndex} of {totalItems}
      </div>

      {/* Right side - Items per page selector */}
      <div className="flex items-center text-xs">
        <span className={`${styles.textMuted} mr-2`}>Show</span>
        <select
          className={`p-1 text-xs rounded border ${styles.borderColor} ${styles.inputBg} ${styles.textPrimary} focus:outline-none focus:ring-1 focus:ring-almet-sapphire`}
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;