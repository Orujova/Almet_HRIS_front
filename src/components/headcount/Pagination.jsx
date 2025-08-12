// src/components/headcount/Pagination.jsx - DEBUG VƏ DÜZƏLTİLMİŞ VERSİYA
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

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

  // DEBUG: Console log all pagination values
  console.log('🔍 PAGINATION DEBUG:', {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    calculatedTotalPages: Math.ceil(totalItems / pageSize)
  });

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

  // FIX: Düzgün totalPages hesablama
  const actualTotalPages = totalPages > 0 ? totalPages : Math.ceil(totalItems / pageSize);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    
    if (actualTotalPages <= 7) {
      // 7 və ya az səhifə varsa hamısını göstər
      for (let i = 1; i <= actualTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Çox səhifə varsa ağıllı ellipsis
      if (currentPage <= 4) {
        // Başlanğıcda: 1 2 3 4 5 ... 40
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(actualTotalPages);
      } else if (currentPage >= actualTotalPages - 3) {
        // Sonda: 1 ... 36 37 38 39 40
        pages.push(1);
        pages.push('...');
        for (let i = actualTotalPages - 4; i <= actualTotalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ortada: 1 ... 15 16 17 ... 40
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(actualTotalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= actualTotalPages && page !== currentPage && !loading) {
      console.log('📄 Changing to page:', page);
      onPageChange(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    if (onPageSizeChange && newSize !== pageSize) {
      console.log('📏 Changing page size to:', newSize);
      onPageSizeChange(newSize);
    }
  };

  // Don't render if no items
  if (totalItems === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No results to display
      </div>
    );
  }

  // ALWAYS show pagination if there are items
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items Info */}
      <div className={`text-sm ${textSecondary}`}>
        Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of{' '}
        {totalItems.toLocaleString()} results
        {/* DEBUG INFO */}
        <span className="text-xs text-red-500 ml-2">
          (Page {currentPage} of {actualTotalPages})
        </span>
      </div>

      {/* Main Pagination Controls */}
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

        {/* Page Navigation - ALWAYS SHOW IF MORE THAN 1 PAGE */}
        {actualTotalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`px-3 py-2 text-sm rounded border ${borderColor} ${bgCard} ${textSecondary} ${bgHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              title="Previous page"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`dots-${index}`} className={`px-3 py-2 ${textMuted}`}>
                      ...
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
              disabled={currentPage === actualTotalPages || loading}
              className={`px-3 py-2 text-sm rounded border ${borderColor} ${bgCard} ${textSecondary} ${bgHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              title="Next page"
            >
              Next
            </button>
          </div>
        )}

        {/* Quick Jump to Page (for large datasets) */}
        {actualTotalPages > 5 && (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${textMuted}`}>Go to:</span>
            <input
              type="number"
              min={1}
              max={actualTotalPages}
              placeholder={currentPage.toString()}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= actualTotalPages) {
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