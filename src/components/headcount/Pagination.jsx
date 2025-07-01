// src/components/headcount/Pagination.jsx - Table Pagination Component
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * Enhanced Pagination Component
 * Features:
 * - Page size selection
 * - Jump to page functionality
 * - Smart page number display
 * - Loading states
 * - Responsive design
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  loading = false,
  className = ""
}) => {
  const { darkMode } = useTheme();

  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Page size options
  const pageSizeOptions = [10, 25, 50, 100];

  // Calculate display range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Calculate start and end of the range around current page
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    // Always include first page
    if (start > 1) {
      range.push(1);
      if (start > 2) {
        range.push('...');
      }
    }

    // Add pages around current page
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Always include last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        range.push('...');
      }
      range.push(totalPages);
    }

    return range;
  };

  const pageNumbers = getPageNumbers();

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    if (onPageSizeChange && newSize !== pageSize) {
      onPageSizeChange(newSize);
    }
  };

  // Don't render if no items or only one page
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items Info */}
      <div className={`text-sm ${textSecondary}`}>
        Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of{' '}
        {totalItems.toLocaleString()} results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className={`text-sm ${textMuted}`}>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            disabled={loading}
            className={`px-3 py-1 text-sm border ${borderColor} rounded ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire disabled:opacity-50`}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className={`text-sm ${textMuted}`}>per page</span>
        </div>

        {/* Page Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`p-2 rounded border ${borderColor} ${bgCard} ${textSecondary} ${bgHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`dots-${index}`} className={`px-3 py-2 ${textMuted}`}>
                      <MoreHorizontal size={16} />
                    </span>
                  );
                }

                const isCurrentPage = page === currentPage;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                      isCurrentPage
                        ? 'bg-almet-sapphire text-white border-almet-sapphire'
                        : `${borderColor} ${bgCard} ${textSecondary} ${bgHover}`
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`p-2 rounded border ${borderColor} ${bgCard} ${textSecondary} ${bgHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Jump to Page (for large datasets) */}
        {totalPages > 10 && (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${textMuted}`}>Go to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              placeholder={currentPage.toString()}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                    e.target.value = '';
                  }
                }
              }}
              disabled={loading}
              className={`w-16 px-2 py-1 text-sm text-center border ${borderColor} rounded ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire disabled:opacity-50`}
            />
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-almet-sapphire">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;