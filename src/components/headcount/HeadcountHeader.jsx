// src/components/headcount/HeadcountHeader.jsx - Sadələşdirilmiş və Təkmilləşdirilmiş Dizayn
import { useState } from "react";
import { 
  Plus, 
  Filter, 
  MoreVertical, 
  Users, 
  UserCheck, 
  TrendingUp,
  Upload,
  RefreshCw,
  ChevronDown,
  Download
} from "lucide-react";
import { useRouter } from "next/navigation";
/**
 * Sadə və təmiz dizaynlı Headcount Header
 * Azaldılmış vizual qarışıqlıq, təmiz tipografiya və sadə spacing
 */
const HeadcountHeader = ({ 
  onToggleAdvancedFilter,
  onToggleActionMenu,
  isActionMenuOpen,
  selectedEmployees,
  onBulkImportComplete,
  statistics = {},
  onBulkImport,
  darkMode = false
}) => {
  const [refreshing, setRefreshing] = useState(false);


  const router = useRouter();
  // Sadələşdirilmiş tema klassları
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Statistikalar
  const {
    total_employees = 0,
    recent_hires_30_days = 0,
    upcoming_contract_endings_30_days = 0
  } = statistics;

  // Refresh funksiyası
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

  return (
    <div className="space-y-4">
      {/* Ana Header */}
      <div className={`${bgCard} rounded-lg border ${borderColor} p-6`}>
        <div className="flex items-center justify-between">
          {/* Sol tərəf - Başlıq və statistikalar */}
          <div className="flex items-center space-x-6">
            {/* Başlıq */}
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
                </p>
              </div>
            </div>

          </div>

          {/* Sağ tərəf - Action düymələri */}
          <div className="flex items-center space-x-3">
            
            <button
              onClick={onBulkImport}
              className={`flex items-center px-3 py-2 text-sm border ${borderColor} rounded-lg transition-colors ${textSecondary} ${hoverBg}`}
            >
              <Upload size={16} className="mr-2" />
              Import
            </button>

            <button
              onClick={onToggleAdvancedFilter}
              className={`flex items-center px-3 py-2 text-sm border ${borderColor} rounded-lg transition-colors ${textSecondary} ${hoverBg}`}
            >
              <Filter size={16} className="mr-2" />
              Filters
            </button>

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

            <button
              onClick={() => router.push('/structure/add-employee')}
              className="flex items-center px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium"
            >
              <Plus size={16} className="mr-2" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default HeadcountHeader;