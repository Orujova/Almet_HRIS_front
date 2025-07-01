// src/components/headcount/HeadcountHeader.jsx - Header with Actions and Statistics
import { useState } from "react";
import { 
  Plus, 
  Filter, 
  MoreVertical, 
  Users, 
  UserCheck, 
  UserX, 
  Briefcase,
  TrendingUp,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../common/ThemeProvider";

/**
 * Enhanced Headcount Header with statistics and action buttons
 * Displays key metrics and provides access to main actions
 */
const HeadcountHeader = ({ 
  onToggleAdvancedFilter,
  onToggleActionMenu,
  isActionMenuOpen,
  selectedEmployees,
  onBulkImportComplete,
  statistics = {},
  onBulkImport
}) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Extract statistics with fallbacks
  const {
    total_employees = 0,
    active_employees = 0,
    inactive_employees = 0,
    by_status = {},
    recent_hires_30_days = 0,
    upcoming_contract_endings_30_days = 0
  } = statistics;

  // Handle refresh
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

  // Calculate key metrics
  const getStatusCounts = () => {
    const statusMetrics = [];
    
    const activeCount = Object.entries(by_status).reduce((acc, [status, data]) => {
      return data.affects_headcount ? acc + data.count : acc;
    }, 0);
    
    statusMetrics.push({
      label: 'Active',
      value: activeCount,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    });

    const onLeaveCount = by_status['ON LEAVE']?.count || 0;
    if (onLeaveCount > 0) {
      statusMetrics.push({
        label: 'On Leave',
        value: onLeaveCount,
        icon: UserX,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
      });
    }

    const onboardingCount = by_status['ONBOARDING']?.count || 0;
    if (onboardingCount > 0) {
      statusMetrics.push({
        label: 'Onboarding',
        value: onboardingCount,
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20'
      });
    }

    return statusMetrics;
  };

  const statusMetrics = getStatusCounts();

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor} p-6 mb-6`}>
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        {/* Title and Stats */}
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center mb-2">
            <Users className="w-6 h-6 text-almet-sapphire mr-3" />
            <h1 className={`text-2xl font-bold ${textPrimary}`}>
              Employee Directory
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`ml-3 p-1 rounded transition-colors ${textMuted} hover:text-almet-sapphire`}
              title="Refresh data"
            >
              <RefreshCw 
                size={16} 
                className={refreshing ? 'animate-spin' : ''} 
              />
            </button>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${textPrimary}`}>
                {total_employees.toLocaleString()}
              </span>
              <span className={`ml-2 ${textSecondary}`}>Total Employees</span>
            </div>
            
            {recent_hires_30_days > 0 && (
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className={`text-sm ${textSecondary}`}>
                  +{recent_hires_30_days} new this month
                </span>
              </div>
            )}

            {upcoming_contract_endings_30_days > 0 && (
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 text-orange-500 mr-1" />
                <span className={`text-sm ${textSecondary}`}>
                  {upcoming_contract_endings_30_days} contracts ending soon
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Add Employee */}
          <button
            onClick={() => router.push('/structure/add-employee')}
            className="flex items-center px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Employee
          </button>

          {/* Bulk Import */}
          <button
            onClick={onBulkImport}
            className={`flex items-center px-4 py-2 border ${borderColor} rounded-lg transition-colors ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700`}
            title="Import employees from Excel/CSV"
          >
            <Upload size={16} className="mr-2" />
            Bulk Import
          </button>

          {/* Advanced Filters */}
          <button
            onClick={onToggleAdvancedFilter}
            className={`flex items-center px-4 py-2 border ${borderColor} rounded-lg transition-colors ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700`}
          >
            <Filter size={16} className="mr-2" />
            Advanced Filters
          </button>

          {/* Bulk Actions */}
          <button
            onClick={onToggleActionMenu}
            className={`flex items-center px-4 py-2 border ${borderColor} rounded-lg transition-colors ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700 ${
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
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Employees */}
        <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs ${textMuted} uppercase tracking-wide`}>Total</p>
              <p className={`text-xl font-bold ${textPrimary}`}>{total_employees}</p>
            </div>
            <Users className={`w-6 h-6 ${textMuted}`} />
          </div>
        </div>

        {/* Status Metrics */}
        {statusMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className={`p-4 rounded-lg ${metric.bgColor} border ${borderColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs ${textMuted} uppercase tracking-wide`}>{metric.label}</p>
                  <p className={`text-xl font-bold ${textPrimary}`}>{metric.value}</p>
                </div>
                <IconComponent className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          );
        })}

        {/* Recent Hires */}
        {recent_hires_30_days > 0 && (
          <div className={`p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border ${borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${textMuted} uppercase tracking-wide`}>New Hires</p>
                <p className={`text-xl font-bold ${textPrimary}`}>{recent_hires_30_days}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className={`text-xs ${textMuted} mt-1`}>Last 30 days</p>
          </div>
        )}

        {/* Contract Endings */}
        {upcoming_contract_endings_30_days > 0 && (
          <div className={`p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border ${borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${textMuted} uppercase tracking-wide`}>Ending Soon</p>
                <p className={`text-xl font-bold ${textPrimary}`}>{upcoming_contract_endings_30_days}</p>
              </div>
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <p className={`text-xs ${textMuted} mt-1`}>Next 30 days</p>
          </div>
        )}
      </div>

      {/* Quick Actions Bar (if employees selected) */}
      {selectedEmployees.length > 0 && (
        <div className="mt-4 p-3 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 border border-almet-sapphire/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCheck className="w-4 h-4 text-almet-sapphire mr-2" />
              <span className={`text-sm font-medium ${textPrimary}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleActionMenu()}
                className="flex items-center px-3 py-1 text-sm bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors"
              >
                <Download size={14} className="mr-1" />
                Export
              </button>
              
              <button
                onClick={() => onToggleActionMenu()}
                className="flex items-center px-3 py-1 text-sm bg-white dark:bg-gray-700 text-almet-sapphire border border-almet-sapphire rounded hover:bg-almet-sapphire/5 transition-colors"
              >
                <MoreVertical size={14} className="mr-1" />
                More Actions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Breakdown Details (expandable) */}
      {Object.keys(by_status).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <details className="group">
            <summary className={`cursor-pointer flex items-center justify-between ${textSecondary} hover:${textPrimary} transition-colors`}>
              <span className="text-sm font-medium">Detailed Status Breakdown</span>
              <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(by_status).map(([status, data]) => (
                <div key={status} className={`p-3 rounded border ${borderColor} bg-gray-50 dark:bg-gray-700`}>
                  <div className="flex items-center justify-between mb-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: data.color }}
                    />
                    <span className={`text-lg font-bold ${textPrimary}`}>{data.count}</span>
                  </div>
                  <p className={`text-xs ${textSecondary} font-medium`}>{status}</p>
                  <p className={`text-xs ${textMuted}`}>
                    {data.affects_headcount ? 'Affects headcount' : 'Does not affect headcount'}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default HeadcountHeader;