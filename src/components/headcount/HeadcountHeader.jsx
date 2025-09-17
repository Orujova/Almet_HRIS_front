// src/components/headcount/HeadcountHeader.jsx - FIXED VERSION
import { useState } from "react";
import { 
  Plus, 
  Filter, 
  MoreVertical, 
  Users,
  Upload,
  Download,
  ChevronDown,
  ArrowUpDown,
  Briefcase,
  Archive,
  Building2,

} from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Fixed workforce management header
 * Only shows employee-specific buttons when activeTab === 'employees'
 */
const HeadcountHeader = ({ 
  // Tab props
  activeTab = 'employees',
  onTabChange,
  
  // Statistics
  statistics = {},
  vacantPositionsStats = {},
  archiveStats = {},
  
  // Employee-specific props (only passed when activeTab === 'employees')
  hasActiveFilters = false,
  onToggleAdvancedFilter,
  
  // Actions
  selectedEmployees = [],
  onToggleActionMenu,
  isActionMenuOpen,
  onQuickExport,
  onToggleExportModal,
  isExporting = false,
  
  // Import props
  onBulkImport,
  onBulkImportComplete,
  
  // Sorting (for employees tab)
  currentSorting = [],
  onToggleAdvancedSorting,
  hasActiveSorting = false,
  
  // Filter count
  filteredCount = 0,
  totalEmployees = 0,
  
  // Theme
  darkMode = false
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const router = useRouter();
  
  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Tab configurations with simplified design
  const tabs = [
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      count: statistics.total_employees || 0,
      color: 'blue'
    },
    {
      id: 'vacant',
      label: 'Vacant',
      icon: Briefcase,
      count: vacantPositionsStats.total_vacant_positions || 0,
      color: 'orange'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      count: archiveStats.total_archived || 0,
      color: 'gray'
    }
  ];

  // Get primary action based on active tab
  const getPrimaryAction = () => {
    switch (activeTab) {
      case 'employees':
        return {
          label: 'Add Employee',
          icon: Plus,
          onClick: () => router.push('/structure/add-employee'),
          className: 'bg-almet-sapphire text-white hover:bg-almet-astral'
        };
      case 'vacant':
        return null;
      case 'archive':
        return null; // No primary action for archive
      default:
        return null;
    }
  };

  const primaryAction = getPrimaryAction();

  // Quick export handler
  const handleQuickExport = async (type, format = 'excel') => {
    try {
      setIsExportDropdownOpen(false);
      if (onQuickExport) {
        await onQuickExport({ type, format, context: activeTab });
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Check if we should show employee-specific controls
  const showEmployeeControls = activeTab === 'employees';

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm`}>
        <div className="p-4">
          {/* Top Row: Title + Main Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-almet-sapphire/10 rounded-lg mr-3">
                <Building2 className="w-4 h-4 text-almet-sapphire" />
              </div>
              <div>
                <h1 className={`text-lg font-semibold ${textPrimary}`}>
                  Workforce Management
                </h1>
              </div>
            </div>

            {/* Main Actions - Only show export/import for employees tab */}
            <div className="flex items-center space-x-2">
              {/* Export Button - Only for employees tab */}
              {showEmployeeControls && (
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

                  {/* Enhanced Export Menu */}
                  {isExportDropdownOpen && !isExporting && (
                    <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quick Export
                        </div>
                        <button
                          onClick={() => handleQuickExport('all', 'excel')}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start">
                            <Download size={16} className="mt-0.5 mr-3 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${textPrimary}`}>
                                All Employees to Excel
                              </p>
                              <p className={`text-xs ${textMuted} mt-0.5`}>
                                Export all employees
                              </p>
                            </div>
                          </div>
                        </button>
                        {hasActiveFilters && (
                          <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={() => handleQuickExport('filtered', 'excel')}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-blue-50 dark:bg-blue-900/20"
                            >
                              <div className="flex items-start">
                                <Download size={16} className="mt-0.5 mr-3 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${textPrimary}`}>
                                    Filtered Results to Excel
                                  </p>
                                  <p className={`text-xs ${textMuted} mt-0.5`}>
                                    Export filtered employees
                                  </p>
                                </div>
                              </div>
                            </button>
                          </>
                        )}
                        {selectedEmployees.length > 0 && (
                          <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                            <button
                              onClick={() => handleQuickExport('selected', 'excel')}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-blue-50 dark:bg-blue-900/20"
                            >
                              <div className="flex items-start">
                                <Download size={16} className="mt-0.5 mr-3 text-green-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${textPrimary}`}>
                                    Selected Employees to Excel
                                  </p>
                                  <p className={`text-xs ${textMuted} mt-0.5`}>
                                    Export {selectedEmployees.length} selected employees
                                  </p>
                                </div>
                              </div>
                            </button>
                          </>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button
                          onClick={() => {
                            setIsExportDropdownOpen(false);
                            if (onToggleExportModal) {
                              onToggleExportModal();
                            }
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start">
                            <Download size={16} className="mt-0.5 mr-3 text-purple-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${textPrimary}`}>
                                Advanced Export Options...
                              </p>
                              <p className={`text-xs ${textMuted} mt-0.5`}>
                                Custom fields, formats, and filters
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Import Button - Only for employees tab */}
              {showEmployeeControls && (
                <button
                  onClick={onBulkImport}
                  className={`flex items-center px-3 py-2 text-sm border ${borderColor} rounded-lg transition-colors ${textSecondary} ${hoverBg}`}
                  title="Import employees from Excel/CSV"
                >
                  <Upload size={16} className="mr-2" />
                  Import
                </button>
              )}

              {/* Primary Action */}
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors font-medium ${primaryAction.className}`}
                >
                  <primaryAction.icon size={14} className="mr-1" />
                  {primaryAction.label}
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                const Icon = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange && onTabChange(tab.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-700 dark:text-${tab.color}-300 border border-${tab.color}-200 dark:border-${tab.color}-800`
                        : `${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent`
                    }`}
                  >
                    <Icon size={14} className="mr-1.5" />
                    <span>{tab.label}</span>
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                      isActive
                        ? `bg-${tab.color}-100 dark:bg-${tab.color}-800 text-${tab.color}-800 dark:text-${tab.color}-200`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab-specific Actions - Only show for employees tab */}
            {showEmployeeControls && (
              <div className="flex items-center space-x-2">
                {/* Filters */}
                <button
                  onClick={onToggleAdvancedFilter}
                  className={`flex items-center px-3 py-2 text-sm border rounded-lg transition-colors ${
                    hasActiveFilters 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                      : `${borderColor} ${textSecondary} ${hoverBg}`
                  }`}
                >
                  <Filter size={14} className="mr-1" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>

                {/* Sort */}
                <button
                  onClick={onToggleAdvancedSorting}
                  className={`flex items-center px-3 py-2 text-sm border rounded-lg transition-colors ${
                    hasActiveSorting 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                      : `${borderColor} ${textSecondary} ${hoverBg}`
                  }`}
                >
                  <ArrowUpDown size={14} className="mr-1" />
                  Sort
                  {hasActiveSorting && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                      {currentSorting.length}
                    </span>
                  )}
                </button>

                {/* Actions Menu */}
                <button
                  onClick={onToggleActionMenu}
                  className={`flex items-center px-3 py-2 text-sm border rounded-lg transition-colors ${
                    isActionMenuOpen ? 'bg-gray-50 dark:bg-gray-700' : ''
                  } ${borderColor} ${textSecondary} ${hoverBg}`}
                >
                  <MoreVertical size={14} className="mr-1" />
                  Actions
                  {selectedEmployees.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      {selectedEmployees.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters/Sorting Indicator - Only for employees tab */}
        {showEmployeeControls && (hasActiveFilters || hasActiveSorting) && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                {hasActiveFilters && (
                  <span className="text-blue-700 dark:text-blue-300">
                    Filters active
                  </span>
                )}
                {hasActiveSorting && (
                  <span className="text-blue-700 dark:text-blue-300">
                    Sorted by {currentSorting.length} field{currentSorting.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  // Clear all filters and sorting
                  if (hasActiveFilters && onToggleAdvancedFilter) onToggleAdvancedFilter();
                  if (hasActiveSorting && onToggleAdvancedSorting) onToggleAdvancedSorting();
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-xs"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Export Progress Indicator - Only for employees tab */}
        {showEmployeeControls && isExporting && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
            <div className="flex items-center text-sm text-green-700 dark:text-green-300">
              <div className="animate-spin rounded-full h-3 w-3 border border-green-500 border-t-transparent mr-2"></div>
              Preparing export...
            </div>
          </div>
        )}
      </div>

      {/* Click outside handler for export dropdown - Only for employees tab */}
      {showEmployeeControls && isExportDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExportDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default HeadcountHeader;