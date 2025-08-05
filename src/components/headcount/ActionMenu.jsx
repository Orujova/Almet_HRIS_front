// src/components/headcount/ActionMenu.jsx - Complete Rewrite for Fixed Modal Integration
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
  Loader,
  Users
} from "lucide-react";

// Import fixed modals
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

  // Get reference data and employee functions
  const {
    employeeTags = [],
    loading = {},
    error = {},
    fetchEmployeeTags,
    hasEmployeeTags
  } = useReferenceData();

  const {
    formattedEmployees = [],
    exportEmployees,
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
      // Pre-load tags if not available
      if (!hasEmployeeTags() && fetchEmployeeTags) {
        fetchEmployeeTags();
      }
    }
  }, [isOpen, hasEmployeeTags, fetchEmployeeTags]);

  if (!isOpen) return null;

  // ========================================
  // DIRECT ACTION HANDLERS - Simplified
  // ========================================

  const handleDirectAction = async (action, options = {}) => {
    console.log('🚀 Direct action triggered:', action, 'Selected:', selectedCount);
    
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Handle different action types
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
          if (!confirm(`Are you sure you want to soft delete ${selectedCount} employee${selectedCount !== 1 ? 's' : ''}?\n\nThey can be restored later.`)) {
            setIsProcessing(false);
            return;
          }
          console.log('🗑️ Starting soft delete...');
          await onAction('softDelete', {
            employee_ids: selectedEmployees
          });
          break;

        case 'permanentDelete':
          const confirmText = `⚠️ PERMANENT DELETE WARNING!\n\nThis will permanently delete ${selectedCount} employee${selectedCount !== 1 ? 's' : ''} and CANNOT be undone!\n\nType "DELETE" to confirm:`;
          const userInput = prompt(confirmText);
          if (userInput !== 'DELETE') {
            setIsProcessing(false);
            return;
          }
          console.log('⚠️ Starting permanent delete...');
          await onAction('delete', {
            employee_ids: selectedEmployees
          });
          break;

       

        default:
          // Generic action handler
          await onAction(action, {
            ...options,
            employee_ids: selectedEmployees,
            selectedCount
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

  // ========================================
  // MODAL ACTION HANDLERS - Fixed for Backend API
  // ========================================

  const handleModalAction = async (action, options) => {
    try {
      console.log(`🔄 Executing modal action: ${action}`, options);
      
      // These actions are already properly formatted by the modals
      // The modals send the correct payload format for backend API
      await onAction(action, options);
      
      // Close modals after successful action
      setIsTagModalOpen(false);
      setIsBulkEditModalOpen(false);
      onClose();
      
    } catch (error) {
      console.error('❌ Modal action failed:', error);
      throw error; // Let modal handle the error display
    }
  };

  // ========================================
  // MODAL TRIGGER HANDLERS
  // ========================================

  const openTagModal = () => {
    if (selectedCount === 0) {
      alert('Please select at least one employee first');
      return;
    }
    setIsTagModalOpen(true);
  };

  const openBulkEditModal = () => {
    if (selectedCount === 0) {
      alert('Please select at least one employee first');
      return;
    }
    setIsBulkEditModalOpen(true);
  };

  return (
    <>
      <div className="relative">
        <div 
          className="fixed inset-0 z-40" 
          onClick={onClose}
        />
        
        <div className={`absolute right-0 top-0 z-50 ${bgCard} rounded-lg shadow-xl border ${borderColor} w-72 overflow-hidden`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b ${borderColor} bg-gray-50 dark:bg-gray-700/50`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${textPrimary} flex items-center`}>
                  {isProcessing && (
                    <Loader className="w-3 h-3 animate-spin mr-2 text-blue-500" />
                  )}
                  <Users className="w-4 h-4 mr-2" />
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
          <div className="py-2 max-h-96 overflow-y-auto">
            {/* Export Section */}
            <div className="px-3 mb-2">
              <div className={`text-xs font-medium ${textMuted} uppercase tracking-wide mb-2 px-2`}>
                Export 
              </div>
              
              <button
                onClick={() => handleDirectAction('export')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${bgHover} ${textPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Download size={16} className="mr-3 text-blue-500 flex-shrink-0" />
                <span className="flex-1 text-left">Export Selected ({selectedCount})</span>
              </button>

             
            </div>

            <div className={`h-px bg-gray-200 dark:bg-gray-700 mx-3 my-2`} />

            {/* Bulk Edit Section */}
            <div className="px-3 mb-2">
              <div className={`text-xs font-medium ${textMuted} uppercase tracking-wide mb-2 px-2`}>
                Bulk Operations
              </div>
              
              <button
                onClick={openTagModal}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${bgHover} ${textPrimary} disabled:opacity-50`}
              >
                <Tag size={16} className="mr-3 text-purple-500 flex-shrink-0" />
                <span className="flex-1 text-left">Manage Tags</span>
                <ChevronRight size={12} className={`${textMuted}`} />
              </button>

              <button
                onClick={openBulkEditModal}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${bgHover} ${textPrimary} disabled:opacity-50 mt-1`}
              >
                <Edit3 size={16} className="mr-3 text-orange-500 flex-shrink-0" />
                <span className="flex-1 text-left">Assign Line Manager</span>
                <ChevronRight size={12} className={`${textMuted}`} />
              </button>
            </div>

            <div className={`h-px bg-gray-200 dark:bg-gray-700 mx-3 my-2`} />

            {/* Dangerous Actions */}
            <div className="px-3">
              <div className={`text-xs font-medium ${textMuted} uppercase tracking-wide mb-2 px-2`}>
                Delete Operations
              </div>
              
              <button
                onClick={() => handleDirectAction('softDelete')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 disabled:opacity-50`}
              >
                <Trash2 size={16} className="mr-3 flex-shrink-0" />
                <span className="flex-1 text-left">Soft Delete ({selectedCount})</span>
              </button>

              <button
                onClick={() => handleDirectAction('permanentDelete')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 disabled:opacity-50 mt-1`}
              >
                <Trash2 size={16} className="mr-3 flex-shrink-0" />
                <span className="flex-1 text-left">Permanent Delete ({selectedCount})</span>
              </button>
            </div>
          </div>

          {/* Info/Status Section */}
          {selectedCount > 0 && (
            <div className={`px-4 py-3 border-t ${borderColor} bg-gray-50 dark:bg-gray-700/50`}>
              <div className={`text-xs ${textMuted} text-center flex items-center justify-center`}>
                {isProcessing ? (
                  <>
                    <Loader className="w-3 h-3 animate-spin mr-2 text-blue-500" />
                    Processing operation...
                  </>
                ) : (
                  <>
                    <Check size={12} className="mr-2 text-green-500" />
                    <span>
                      Operations will apply to{' '}
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {selectedCount} employee{selectedCount !== 1 ? 's' : ''}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Warning for no selection */}
          {selectedCount === 0 && (
            <div className={`px-4 py-3 border-t ${borderColor} bg-yellow-50 dark:bg-yellow-900/20`}>
              <div className="flex items-center justify-center text-xs text-yellow-700 dark:text-yellow-300">
                <AlertCircle size={12} className="mr-2" />
                Select employees first
              </div>
            </div>
          )}

          {/* Loading/Error States for Tags */}
          {loading?.employeeTags && (
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center">
                <Loader className="w-3 h-3 animate-spin mr-2 text-blue-500" />
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Loading tags...
                </p>
              </div>
            </div>
          )}

          {error?.employeeTags && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <div className="flex items-center justify-center">
                <AlertCircle size={12} className="mr-2 text-red-500" />
                <p className="text-xs text-red-600 dark:text-red-400">
                  Tag loading failed
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

      {/* Bulk Edit Modal (Line Manager Assignment) */}
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