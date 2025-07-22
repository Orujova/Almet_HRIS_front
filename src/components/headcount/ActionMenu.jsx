// src/components/headcount/ActionMenu.jsx - FIXED API Integration
import { useState, useEffect } from "react";
import { useReferenceData } from "../../hooks/useReferenceData";
import { useEmployees } from "../../hooks/useEmployees";
import { 
  Download, 
  Trash2, 
  Edit3, 
  Tag, 
  Upload,
  X,
  FileSpreadsheet,
  ChevronRight,
  Check,
  AlertCircle,
  Loader
} from "lucide-react";

// Import modals
import TagManagementModal from "./TagManagementModal";
import BulkEditModal from "./BulkEditModal";

const ActionMenu = ({ 
  isOpen, 
  onClose, 
  onAction, 
  selectedCount = 0,
  selectedEmployees = [],
  selectedEmployeeData = [],
  darkMode = false 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  // Get reference data using the hooks
  const {
    employeeTags = [],
    businessFunctions = [],
    departments = [],
    units = [],
    jobFunctions = [],
    positionGroups = [],
    loading = {},
    error = {},
    fetchEmployeeTags,
    fetchBusinessFunctions,
    hasEmployeeTags,
    hasBusinessFunctions
  } = useReferenceData();

  const {
    formattedEmployees = [],
    exportEmployees,
    downloadEmployeeTemplate,
    softDeleteEmployees,
    deleteEmployee
  } = useEmployees();

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!hasEmployeeTags() && fetchEmployeeTags) {
        fetchEmployeeTags();
      }
      
      if (!hasBusinessFunctions() && fetchBusinessFunctions) {
        fetchBusinessFunctions();
      }
    }
  }, [isOpen, hasEmployeeTags, hasBusinessFunctions, fetchEmployeeTags, fetchBusinessFunctions]);

  if (!isOpen) return null;

  // ========================================
  // ACTION HANDLERS - Fixed for Backend API
  // ========================================

  const handleActionWithAPI = async (action, options = {}) => {
    console.log('🚀 Action triggered:', action, 'Options:', options, 'Selected:', selectedCount);
    
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Modal-based actions
      if (action === 'manageTags') {
        setIsTagModalOpen(true);
        setIsProcessing(false);
        return;
      }
      
      if (action === 'bulkEdit') {
        setIsBulkEditModalOpen(true);
        setIsProcessing(false);
        return;
      }
      
      // Direct API actions with proper backend endpoints
      switch (action) {
        case 'export':
          console.log('📤 Starting export...');
          await onAction('export', {
            type: 'selected',
            format: 'excel',
            employee_ids: selectedEmployees
          });
          break;

        case 'softDelete':
          console.log('🗑️ Starting soft delete...');
          await onAction('softDelete', {
            employee_ids: selectedEmployees,
            confirmMessage: options.confirmMessage
          });
          break;

        case 'delete':
          console.log('⚠️ Starting permanent delete...');
          await onAction('delete', {
            employee_ids: selectedEmployees,
            confirmMessage: options.confirmMessage
          });
          break;

        case 'downloadTemplate':
          console.log('📄 Downloading template...');
          await downloadEmployeeTemplate();
          alert('✅ Template downloaded successfully!');
          break;

        default:
          await onAction(action, {
            ...options,
            selectedCount,
            selectedEmployeeIds: selectedEmployees
          });
      }
      
      onClose();
      
    } catch (error) {
      console.error('❌ Action failed:', error);
      alert(`❌ Action failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Modal action handler with proper API mapping
  const handleModalAction = async (action, options) => {
    try {
      let mappedAction = action;
      let mappedOptions = { ...options };
      
      // Map modal actions to backend API actions
      switch (action) {
        case 'addTags':
        case 'removeTags':
          mappedAction = action === 'addTags' ? 'bulkAddTags' : 'bulkRemoveTags';
          mappedOptions = {
            employee_ids: selectedEmployees,
            tag_id: options.tag_id
          };
          break;

        case 'bulkAddTags':
        case 'bulkRemoveTags':
          mappedOptions = {
            employee_ids: selectedEmployees,
            tag_id: options.tag_id
          };
          break;

        case 'bulkAssignLineManager':
          mappedOptions = {
            employee_ids: selectedEmployees,
            line_manager_id: options.line_manager_id
          };
          break;

        default:
          mappedOptions = {
            employee_ids: selectedEmployees,
            ...options
          };
      }
      
      console.log(`🔄 Executing modal action: ${mappedAction}`, mappedOptions);
      await onAction(mappedAction, mappedOptions);
      
      // Close modals
      setIsTagModalOpen(false);
      setIsBulkEditModalOpen(false);
      onClose();
    } catch (error) {
      console.error('❌ Modal action failed:', error);
      throw error;
    }
  };

  return (
    <>
      <div className="relative">
        <div 
          className="fixed inset-0 z-40" 
          onClick={onClose}
        />
        
        <div className={`absolute right-0 top-0 z-50 ${bgCard} rounded-lg shadow-xl border ${borderColor} w-64 overflow-hidden`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b ${borderColor} bg-gray-50 dark:bg-gray-700/50`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${textPrimary} flex items-center`}>
                  {isProcessing && (
                    <Loader className="w-3 h-3 animate-spin mr-2 text-blue-500" />
                  )}
                  Bulk Operations
                </h3>
                <p className={`text-xs ${textMuted}`}>
                  {selectedCount} employee{selectedCount !== 1 ? 's' : ''} selected
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className={`p-1 rounded ${bgHover} transition-colors disabled:opacity-50`}
              >
                <X size={14} className={textSecondary} />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1 max-h-96 overflow-y-auto">
            {/* Export Section */}
            <div className="px-2">
              <button
                onClick={() => handleActionWithAPI('export', {
                  type: 'selected',
                  format: 'excel'
                })}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors ${bgHover} ${textPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Download size={16} className="mr-3 text-blue-500 flex-shrink-0" />
                <span>Export Selected ({selectedCount})</span>
              </button>

            </div>

            <div className={`h-px ${borderColor} my-2`} />

            {/* Bulk Edit Section */}
            <div className="px-2 space-y-1">
              <button
                onClick={() => handleActionWithAPI('manageTags')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors ${bgHover} ${textPrimary} disabled:opacity-50`}
              >
                <Tag size={16} className="mr-3 text-purple-500 flex-shrink-0" />
                <span className="flex-1 text-left">Tag Management</span>
                <ChevronRight size={12} className={`${textMuted}`} />
              </button>

              <button
                onClick={() => handleActionWithAPI('bulkEdit')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors ${bgHover} ${textPrimary} disabled:opacity-50`}
              >
                <Edit3 size={16} className="mr-3 text-orange-500 flex-shrink-0" />
                <span className="flex-1 text-left">Change Line Manager</span>
                <ChevronRight size={12} className={`${textMuted}`} />
              </button>
            </div>

            <div className={`h-px ${borderColor} my-2`} />

            {/* Dangerous Actions */}
            <div className="px-2 space-y-1">
              <button
                onClick={() => handleActionWithAPI('softDelete', {
                  confirmMessage: `${selectedCount} employee-i soft delete etmək istədiyinizdən əminsiniz? Onlar daha sonra bərpa edilə bilər.`
                })}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 disabled:opacity-50`}
              >
                <Trash2 size={16} className="mr-3 flex-shrink-0" />
                <span>Soft Delete ({selectedCount})</span>
              </button>

              <button
                onClick={() => handleActionWithAPI('delete', {
                  confirmMessage: `⚠️ PERMANENT DELETE: ${selectedCount} employee-i həmişəlik silmək istədiyinizdən əminsiniz? Bu əməliyyat GERİ ALINMAZ!`
                })}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 disabled:opacity-50`}
              >
                <Trash2 size={16} className="mr-3 flex-shrink-0" />
                <span>Permanent Delete ({selectedCount})</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          {selectedCount > 0 && (
            <div className={`px-4 py-3 border-t ${borderColor} bg-gray-50 dark:bg-gray-700/50`}>
              <div className={`text-xs ${textMuted} text-center flex items-center justify-center`}>
                {isProcessing ? (
                  <>
                    <Loader className="w-3 h-3 animate-spin mr-2 text-blue-500" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={12} className="mr-1 text-green-500" />
                    Actions will apply to{' '}
                    <span className="font-medium text-blue-600 dark:text-blue-400 ml-1">
                      {selectedCount} employee{selectedCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {(loading?.employeeTags || loading?.businessFunctions) && (
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center">
                <Loader className="w-3 h-3 animate-spin mr-2 text-blue-500" />
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Loading reference data...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {(error?.employeeTags || error?.businessFunctions) && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <div className="flex items-center justify-center">
                <AlertCircle size={12} className="mr-1 text-red-500" />
                <p className="text-xs text-red-600 dark:text-red-400">
                  Failed to load data. Some features may be limited.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tag Management Modal */}
      <TagManagementModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onAction={handleModalAction}
        selectedEmployees={selectedEmployees}
        selectedEmployeeData={selectedEmployeeData}
        darkMode={darkMode}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        onAction={handleModalAction}
        selectedEmployees={selectedEmployees}
        selectedEmployeeData={selectedEmployeeData}
        darkMode={darkMode}
      />
    </>
  );
};

export default ActionMenu;