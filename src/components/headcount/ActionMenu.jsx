// src/components/headcount/ActionMenu.jsx - FIXED with proper API integration
import { useState,useEffect } from "react";
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
  Check
} from "lucide-react";

// Import the new modals
import TagManagementModal from "./TagManagementModal";
import BulkEditModal from "./BulkEditModal";

/**
 * FIXED Action Menu with correct API integration and proper bulk actions
 */
const ActionMenu = ({ 
  isOpen, 
  onClose, 
  onAction, 
  selectedCount = 0,
  selectedEmployees = [],
  darkMode = false 
}) => {
  const [subMenuOpen, setSubMenuOpen] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  // Get reference data from useReferenceData hook
  const {
    employeeTags,
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    loading: refLoading,
    error: refError,
    // Actions to fetch data if not available
    fetchEmployeeTags,
    fetchBusinessFunctions,
    fetchDepartments,
    fetchUnits,
    fetchJobFunctions,
    fetchPositionGroups
  } = useReferenceData();

  // Get employee-specific data including line managers
  const {
    getLineManagers,
    lineManagers
  } = useEmployees();

  // Fetch reference data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Fetch tags if not available
      if (!employeeTags || employeeTags.length === 0) {
        fetchEmployeeTags?.();
      }
      
      // Fetch other reference data if not available
      if (!businessFunctions || businessFunctions.length === 0) {
        fetchBusinessFunctions?.();
      }
      
      if (!departments || departments.length === 0) {
        fetchDepartments?.();
      }
      
      if (!units || units.length === 0) {
        fetchUnits?.();
      }
      
      if (!jobFunctions || jobFunctions.length === 0) {
        fetchJobFunctions?.();
      }
      
      if (!positionGroups || positionGroups.length === 0) {
        fetchPositionGroups?.();
      }
    }
  }, [isOpen, employeeTags, businessFunctions, departments, units, jobFunctions, positionGroups]);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  if (!isOpen) return null;

  // ========================================
  // FIXED API-INTEGRATED ACTION HANDLERS
  // ========================================

  const handleActionWithAPI = async (action, options = {}) => {
    console.log('🚀 API Action triggered:', action, 'Options:', options, 'Selected:', selectedCount);
    
    if (isProcessing) return; // Prevent double clicks
    
    try {
      setIsProcessing(true);
      
      // Handle modal-based actions - FIXED action names
      if (action === 'manageTags') {
        setIsTagModalOpen(true);
        setIsProcessing(false);
        return;
      }
      
      if (action === 'bulkEdit') {
        // Load line managers if not already loaded
        if (getLineManagers && (!lineManagers || lineManagers.length === 0)) {
          try {
            await getLineManagers();
          } catch (error) {
            console.warn('Failed to load line managers:', error);
            // Continue anyway, modal will work without line managers
          }
        }
        setIsBulkEditModalOpen(true);
        setIsProcessing(false);
        return;
      }
      
      // Call the parent's action handler for other actions with CORRECT action names
      await onAction(action, {
        ...options,
        selectedCount,
        selectedEmployeeIds: selectedEmployees
      });
      
      onClose(); // Close menu on successful action
      
    } catch (error) {
      console.error('❌ Action failed:', error);
      // Parent component will handle error display
    } finally {
      setIsProcessing(false);
    }
  };

  // FIXED: Handle modal actions with correct API mapping
  const handleModalAction = async (action, options) => {
    try {
      // Map modal actions to correct bulk actions
      let mappedAction = action;
      let mappedOptions = options;
      
      if (action === 'addTags') {
        mappedAction = 'bulkAddTags';
        mappedOptions = {
          employeeIds: selectedEmployees,
          tagIds: options.tagIds
        };
      } else if (action === 'removeTags') {
        mappedAction = 'bulkRemoveTags'; 
        mappedOptions = {
          employeeIds: selectedEmployees,
          tagIds: options.tagIds
        };
      } else if (action === 'bulkEdit' || action === 'bulkUpdate') {
        mappedAction = 'bulkEdit'; // Use the correct action name
        mappedOptions = {
          ...options,
          selectedEmployeeIds: selectedEmployees
        };
      }
      
      await onAction(mappedAction, mappedOptions);
      
      // Close modals after successful action
      setIsTagModalOpen(false);
      setIsBulkEditModalOpen(false);
      onClose();
    } catch (error) {
      console.error('❌ Modal action failed:', error);
      throw error; // Re-throw to let modal handle the error
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
          {/* Header with processing indicator */}
          <div className={`px-4 py-3 border-b ${borderColor} bg-gray-50 dark:bg-gray-700/50`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${textPrimary} flex items-center`}>
                  {isProcessing && (
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Bulk Actions
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
            {/* Export & Import Section */}
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

              <button
                onClick={() => handleActionWithAPI('downloadTemplate')}
                disabled={isProcessing}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors ${bgHover} ${textPrimary} disabled:opacity-50`}
              >
                <FileSpreadsheet size={16} className="mr-3 text-indigo-500 flex-shrink-0" />
                <span>Download Template</span>
              </button>

          
            </div>

            <div className={`h-px ${borderColor} my-2`} />

            {/* FIXED: Tag Management and Bulk Edit - Opens Modal with correct action names */}
            <div className="px-2">
              <button
                onClick={() => handleActionWithAPI('manageTags')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors ${bgHover} ${textPrimary} disabled:opacity-50`}
              >
                <Tag size={16} className="mr-3 text-purple-500 flex-shrink-0" />
                <span className="flex-1 text-left">Manage Tags</span>
                <ChevronRight size={12} className={`${textMuted}`} />
              </button>

              {/* FIXED: Bulk Edit - correct action name */}
              <button
                onClick={() => handleActionWithAPI('bulkEdit')}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors ${bgHover} ${textPrimary} disabled:opacity-50`}
              >
                <Edit3 size={16} className="mr-3 text-orange-500 flex-shrink-0" />
                <span className="flex-1 text-left">Bulk Edit</span>
                <ChevronRight size={12} className={`${textMuted}`} />
              </button>
            </div>

            <div className={`h-px ${borderColor} my-2`} />

            {/* Dangerous Actions */}
            <div className="px-2">
              <button
                onClick={() => handleActionWithAPI('softDelete', {
                  confirmMessage: `Are you sure you want to soft delete ${selectedCount} employee${selectedCount !== 1 ? 's' : ''}? They can be restored later.`
                })}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 disabled:opacity-50`}
              >
                <Trash2 size={16} className="mr-3 flex-shrink-0" />
                <span>Soft Delete ({selectedCount})</span>
              </button>

              <button
                onClick={() => handleActionWithAPI('delete', {
                  confirmMessage: `⚠️ PERMANENT DELETE: Are you sure you want to permanently delete ${selectedCount} employee${selectedCount !== 1 ? 's' : ''}? This action CANNOT be undone!`
                })}
                disabled={isProcessing || selectedCount === 0}
                className={`w-full flex items-center px-3 py-2.5 text-sm rounded transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 disabled:opacity-50`}
              >
                <Trash2 size={16} className="mr-3 flex-shrink-0" />
                <span>Permanent Delete ({selectedCount})</span>
              </button>
            </div>
          </div>

          {/* Footer with status */}
          {selectedCount > 0 && (
            <div className={`px-4 py-3 border-t ${borderColor} bg-gray-50 dark:bg-gray-700/50`}>
              <div className={`text-xs ${textMuted} text-center flex items-center justify-center`}>
                {isProcessing ? (
                  <>
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={12} className="mr-1 text-green-500" />
                    Actions apply to{' '}
                    <span className="font-medium text-blue-600 dark:text-blue-400 ml-1">
                      {selectedCount} employee{selectedCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {refError?.employeeTags && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-400 text-center">
                ⚠️ Error loading reference data. Some features may be limited.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FIXED: Tag Management Modal with proper data */}
      <TagManagementModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onAction={handleModalAction}
        selectedEmployees={selectedEmployees}
        employeeTags={employeeTags || []}
        loading={refLoading?.employeeTags || false}
        darkMode={darkMode}
      />

      {/* FIXED: Bulk Edit Modal with proper reference data */}
      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        onAction={handleModalAction}
        selectedEmployees={selectedEmployees}
        referenceData={{
          lineManagers: lineManagers || [],
          departments: departments || [],
          units: units || [],
          positionGroups: positionGroups || [],
          businessFunctions: businessFunctions || []
        }}
        loading={refLoading?.departments || refLoading?.lineManagers || false}
        darkMode={darkMode}
      />
    </>
  );
};

export default ActionMenu;