// src/components/headcount/HeadcountHeader.jsx - ENHANCED: Quick Export functionality
import { useState } from "react";
import { 
  Plus, 
  Filter, 
  MoreVertical, 
  Users,
  Upload,
  Download,
  RefreshCw,
  ChevronDown,
  ArrowUpDown,
  Trash2,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * ENHANCED Headcount Header with Quick Export Dropdown
 */
const HeadcountHeader = ({ 
  onToggleAdvancedFilter,
  onToggleActionMenu,
  isActionMenuOpen,
  selectedEmployees = [],
  onBulkImportComplete,
  statistics = {},
  onBulkImport,
  darkMode = false,
  
  // Advanced Sorting Props
  onToggleAdvancedSorting,
  isAdvancedSortingOpen,
  currentSorting = [],
  onClearAllSorting,
  
  // ENHANCED: Export Props
  onQuickExport, // Direct export without modal
  onToggleExportModal, // Open export modal
  isExporting = false,
  hasActiveFilters = false,
  filteredCount = 0,
  totalEmployees = 0
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  const router = useRouter();
  
  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Statistics with fallbacks
  const {
    total_employees = totalEmployees || 0,
    active_employees = 0,
    recent_hires_30_days = 0,
    upcoming_contract_endings_30_days = 0
  } = statistics;

  // Refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onBulkImportComplete) {
        await onBulkImportComplete();
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Check if sorting is active
  const hasActiveSorting = currentSorting && currentSorting.length > 0;

  // ============================================
  // ENHANCED: Quick Export Handlers
  // ============================================

  const handleQuickExport = async (exportType, format = 'excel') => {
    try {
      setIsExportDropdownOpen(false);
      
      const exportOptions = {
        type: exportType,
        format: format,
        // Default field selection for quick export
        fields: {
          basic_info: true,
          job_info: true,
          management_info: true,
          status: true,
          dates: true
        }
      };

      if (onQuickExport) {
        await onQuickExport(exportOptions);
      }
    } catch (error) {
      console.error('Quick export failed:', error);
    }
  };

  const exportMenuItems = [
    {
      type: 'header',
      label: 'Quick Export'
    },
    {
      type: 'item',
      label: 'All Employees to Excel',
      icon: FileSpreadsheet,
      description: `Export all ${total_employees.toLocaleString()} employees`,
      onClick: () => handleQuickExport('all', 'excel'),
      iconColor: 'text-green-600'
    }
  ];

  // Add filtered options if filters are active
  if (hasActiveFilters && filteredCount > 0) {
    exportMenuItems.push(
      { type: 'divider' },
      {
        type: 'item',
        label: 'Filtered Results to Excel',
        icon: FileSpreadsheet,
        description: `Export ${filteredCount.toLocaleString()} filtered employees`,
        onClick: () => handleQuickExport('filtered', 'excel'),
        iconColor: 'text-green-600',
        highlight: true
      },
      {
        type: 'item',
        label: 'Filtered Results to CSV',
        icon: FileText,
        description: `Export ${filteredCount.toLocaleString()} filtered employees`,
        onClick: () => handleQuickExport('filtered', 'csv'),
        iconColor: 'text-blue-600',
        highlight: true
      }
    );
  }

  // Add selected options if employees are selected
  if (selectedEmployees.length > 0) {
    exportMenuItems.push(
      { type: 'divider' },
      {
        type: 'item',
        label: 'Selected Employees to Excel',
        icon: FileSpreadsheet,
        description: `Export ${selectedEmployees.length} selected employees`,
        onClick: () => handleQuickExport('selected', 'excel'),
        iconColor: 'text-green-600',
        highlight: true
      },
      {
        type: 'item',
        label: 'Selected Employees to CSV',
        icon: FileText,
        description: `Export ${selectedEmployees.length} selected employees`,
        onClick: () => handleQuickExport('selected', 'csv'),
        iconColor: 'text-blue-600',
        highlight: true
      }
    );
  }

  // Add advanced export option
  exportMenuItems.push(
    { type: 'divider' },
    {
      type: 'item',
      label: 'Advanced Export Options...',
      icon: Download,
      description: 'Custom fields, formats, and filters',
      onClick: () => {
        setIsExportDropdownOpen(false);
        if (onToggleExportModal) {
          onToggleExportModal();
        }
      },
      iconColor: 'text-purple-600'
    }
  );

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className={`${bgCard} rounded-lg border ${borderColor} p-6`}>
        <div className="flex items-center justify-between">
          {/* Left side - Title and statistics */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-almet-sapphire/10 rounded-lg mr-3">
                <Users className="w-5 h-5 text-almet-sapphire" />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${textPrimary}`}>
                  Employee Directory
                </h1>
                <p className={`text-sm ${textMuted}`}>
                  {hasActiveFilters ? (
                    <>
                      {filteredCount.toLocaleString()} of {total_employees.toLocaleString()} employees
                      <span className="ml-2 text-blue-600 dark:text-blue-400">• Filtered</span>
                    </>
                  ) : (
                    `${total_employees.toLocaleString()} employees`
                  )}
                  {hasActiveSorting && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      • {currentSorting.length} sort level{currentSorting.length !== 1 ? 's' : ''} active
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-3">
            
            {/* ENHANCED: Export Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                disabled={isExporting}
                className={`flex items-center px-4 py-2 text-sm font-medium border ${borderColor} rounded-lg transition-all ${
                  isExporting 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 cursor-not-allowed'
                    : `${textSecondary} ${hoverBg} hover:border-green-300 dark:hover:border-green-600 hover:text-green-700 dark:hover:text-green-300 hover:shadow-md`
                } ${isExportDropdownOpen ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' : ''}`}
                title="Export employee data"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Export
                    <ChevronDown size={14} className={`ml-2 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {/* Export Dropdown Menu */}
              {isExportDropdownOpen && !isExporting && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="py-2">
                    {exportMenuItems.map((item, index) => {
                      if (item.type === 'header') {
                        return (
                          <div key={index} className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {item.label}
                          </div>
                        );
                      } else if (item.type === 'divider') {
                        return <div key={index} className="border-t border-gray-200 dark:border-gray-700 my-1"></div>;
                      } else {
                        const Icon = item.icon;
                        return (
                          <button
                            key={index}
                            onClick={item.onClick}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              item.highlight ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start">
                              <Icon size={16} className={`mt-0.5 mr-3 ${item.iconColor || 'text-gray-400'} flex-shrink-0`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${textPrimary}`}>
                                  {item.label}
                                </p>
                                <p className={`text-xs ${textMuted} mt-0.5`}>
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      }
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Click outside handler for export dropdown */}
            {isExportDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsExportDropdownOpen(false)}
              />
            )}

            {/* Import Button */}
            <button
              onClick={onBulkImport}
              className={`flex items-center px-3 py-2 text-sm border ${borderColor} rounded-lg transition-colors ${textSecondary} ${hoverBg}`}
              title="Import employees from Excel/CSV"
            >
              <Upload size={16} className="mr-2" />
              Import
            </button>

            {/* Filters Button */}
            <button
              onClick={onToggleAdvancedFilter}
              className={`flex items-center px-3 py-2 text-sm border ${borderColor} rounded-lg transition-colors ${textSecondary} ${hoverBg} ${
                hasActiveFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
              }`}
              title="Advanced filters and search"
            >
              <Filter size={16} className="mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                  •
                </span>
              )}
            </button>

            {/* Advanced Sorting Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleAdvancedSorting}
                className={`flex items-center px-4 py-2 text-sm border ${borderColor} rounded-lg transition-all ${textSecondary} ${hoverBg} ${
                  hasActiveSorting ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 shadow-md' : ''
                } ${isAdvancedSortingOpen ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                title="Excel-style Advanced Sorting"
              >
                <ArrowUpDown size={16} className="mr-2" />
                <span className="font-medium">Sort</span>
                {hasActiveSorting && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                    {currentSorting.length}
                  </span>
                )}
                <ChevronDown size={14} className={`ml-1 transition-transform ${isAdvancedSortingOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Quick Clear Button */}
              {hasActiveSorting && (
                <button
                  onClick={onClearAllSorting}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Clear all sorting"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={onToggleActionMenu}
                className={`flex items-center px-3 py-2 text-sm border ${borderColor} rounded-lg transition-colors ${textSecondary} ${hoverBg} ${
                  isActionMenuOpen ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
                title="Bulk actions and operations"
              >
                <MoreVertical size={16} className="mr-2" />
                Actions
                {selectedEmployees.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-almet-sapphire text-white text-xs rounded-full">
                    {selectedEmployees.length}
                  </span>
                )}
                <ChevronDown size={14} className={`ml-1 transition-transform ${isActionMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Add Employee Button */}
            <button
              onClick={() => router.push('/structure/add-employee')}
              className="flex items-center px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium"
              title="Add new employee"
            >
              <Plus size={16} className="mr-2" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Active Sorting Indicator (when dialog is closed) */}
        {hasActiveSorting && !isAdvancedSortingOpen && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ArrowUpDown size={16} className="text-blue-500" />
                <div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Multi-level Sorting Active: {currentSorting.length} level{currentSorting.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    {currentSorting.slice(0, 3).map((sort, index) => (
                      <span 
                        key={sort.field}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                      >
                        {index + 1}. {sort.field} {sort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    ))}
                    {currentSorting.length > 3 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        +{currentSorting.length - 3} more...
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onToggleAdvancedSorting}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 px-2 py-1 rounded"
                >
                  Configure
                </button>
                <button
                  onClick={onClearAllSorting}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 px-2 py-1 rounded"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Status Indicator */}
        {isExporting && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent mr-3"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Preparing export... This may take a few moments for large datasets.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadcountHeader;