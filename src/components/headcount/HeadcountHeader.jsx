// src/components/headcount/HeadcountHeader.jsx - Simple Advanced Sorting Integration
import { useState } from "react";
import { 
  Plus, 
  Filter, 
  MoreVertical, 
  Users,
  Upload,
  RefreshCw,
  ChevronDown,
  ArrowUpDown,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Simple Headcount Header with Advanced Multiple Sorting
 * No save/load - just immediate sorting when user makes changes
 */
const HeadcountHeader = ({ 
  onToggleAdvancedFilter,
  onToggleActionMenu,
  isActionMenuOpen,
  selectedEmployees,
  onBulkImportComplete,
  statistics = {},
  onBulkImport,
  darkMode = false,
  
  // Advanced Sorting Props
  onToggleAdvancedSorting,
  isAdvancedSortingOpen,
  currentSorting = [],
  onClearAllSorting
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  
  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Statistics
  const {
    total_employees = 0,
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
                  {total_employees.toLocaleString()} employees
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
            
            {/* Import Button */}
            <button
              onClick={onBulkImport}
              className={`flex items-center px-3 py-2 text-sm border ${borderColor} rounded-lg transition-colors ${textSecondary} ${hoverBg}`}
            >
              <Upload size={16} className="mr-2" />
              Import
            </button>

            {/* Filters Button */}
            <button
              onClick={onToggleAdvancedFilter}
              className={`flex items-center px-3 py-2 text-sm border ${borderColor} rounded-lg transition-colors ${textSecondary} ${hoverBg}`}
            >
              <Filter size={16} className="mr-2" />
              Filters
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
      </div>
    </div>
  );
};

export default HeadcountHeader;