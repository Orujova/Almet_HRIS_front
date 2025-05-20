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
          className={`p-1 rounded-md w-8 h-8 flex items-center justify-center mx-1 ${
            currentPage === i
              ? "bg-almet-sapphire text-white"
              : "bg-gray-700 text-white dark:bg-gray-600"
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
      <div className="flex items-center">
        <button
          className={`bg-gray-700 text-white p-1 rounded-md mr-2 ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </button>

        {renderPageNumbers()}

        {totalPages > 5 && currentPage + 2 < totalPages && (
          <>
            <span className={`${styles.textMuted} mx-1`}>...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="bg-gray-700 text-white p-1 rounded-md w-8 h-8 flex items-center justify-center mx-1"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className={`bg-gray-700 text-white p-1 rounded-md ml-2 ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={`${styles.textMuted} text-sm`}>
        Showing {startIndex + 1} to {endIndex} of {totalItems} employees
      </div>

      <div className="flex items-center">
        <span className={`${styles.textMuted} mr-2`}>Show</span>
        <select
          className={`p-1 rounded border ${styles.borderColor} ${styles.inputBg} ${styles.textPrimary}`}
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