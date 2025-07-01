// src/components/headcount/ActionMenu.jsx - Enhanced Bulk Operations Menu
import { useState } from "react";
import { 
  Download, 
  Trash2, 
  Edit3, 
  Tag, 
  UserCheck, 
  Upload,
  MoreHorizontal,
  X,
  Plus,
  Minus,
  FileSpreadsheet,
  Users
} from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { useReferenceData } from "../../hooks/useReferenceData";

/**
 * Enhanced Action Menu for bulk operations on selected employees
 * Supports all bulk operations with proper API integration
 */
const ActionMenu = ({ isOpen, onClose, onAction, selectedCount = 0 }) => {
  const { darkMode } = useTheme();
  const [subMenuOpen, setSubMenuOpen] = useState(null);
  
  // Get reference data for bulk operations
  const { employeeStatuses, employeeTags } = useReferenceData();

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  if (!isOpen) return null;

  // Handle action with options
  const handleActionWithOptions = (action, options = {}) => {
    onAction(action, options);
    onClose();
  };

  // Handle sub-menu toggle
  const handleSubMenuToggle = (menuType) => {
    setSubMenuOpen(subMenuOpen === menuType ? null : menuType);
  };

  // Tag type options for bulk tag operations
  const tagTypeOptions = [
    { value: "skill", label: "Skills", color: "text-blue-600" },
    { value: "department", label: "Department Tags", color: "text-green-600" },
    { value: "project", label: "Projects", color: "text-purple-600" },
    { value: "certification", label: "Certifications", color: "text-yellow-600" },
    { value: "other", label: "Other", color: "text-gray-600" }
  ];

  // Available status options for bulk update
  const statusOptions = employeeStatuses.filter(status => status.is_active);

  return (
    <div className="relative">
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      <div className={`absolute right-0 top-0 z-50 ${bgCard} rounded-lg shadow-xl border ${borderColor} min-w-64 max-w-80`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className={`text-sm font-semibold ${textPrimary}`}>Bulk Actions</h3>
            <p className={`text-xs ${textMuted}`}>
              {selectedCount} employee{selectedCount !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded ${bgHover} transition-colors`}
          >
            <X size={16} className={textSecondary} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {/* Export Options */}
          <div className="px-2">
            <button
              onClick={() => handleActionWithOptions('export')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
            >
              <Download size={16} className="mr-3 text-blue-500" />
              <div className="flex-1 text-left">
                <div>Export Data</div>
                <div className={`text-xs ${textMuted}`}>Export selected employees</div>
              </div>
            </button>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Status Update */}
          <div className="px-2">
            <button
              onClick={() => handleSubMenuToggle('status')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
            >
              <UserCheck size={16} className="mr-3 text-green-500" />
              <div className="flex-1 text-left">
                <div>Update Status</div>
                <div className={`text-xs ${textMuted}`}>Change employment status</div>
              </div>
              <MoreHorizontal size={14} className={textMuted} />
            </button>

            {/* Status Sub-menu */}
            {subMenuOpen === 'status' && (
              <div className={`mt-2 ml-6 ${bgCard} border ${borderColor} rounded-lg shadow-lg`}>
                {statusOptions.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleActionWithOptions('updateStatus', { newStatus: status.name })}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: status.color }}
                    />
                    <div className="flex-1 text-left">
                      <div>{status.name}</div>
                      {status.description && (
                        <div className={`text-xs ${textMuted}`}>{status.description}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tag Management */}
          <div className="px-2">
            <button
              onClick={() => handleSubMenuToggle('tags')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
            >
              <Tag size={16} className="mr-3 text-purple-500" />
              <div className="flex-1 text-left">
                <div>Manage Tags</div>
                <div className={`text-xs ${textMuted}`}>Add or remove tags</div>
              </div>
              <MoreHorizontal size={14} className={textMuted} />
            </button>

            {/* Tags Sub-menu */}
            {subMenuOpen === 'tags' && (
              <div className={`mt-2 ml-6 ${bgCard} border ${borderColor} rounded-lg shadow-lg`}>
                {/* Add Tags */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className={`text-xs font-medium ${textSecondary} mb-2`}>Add Tags</div>
                  {tagTypeOptions.map((tagType) => {
                    const tagsOfType = employeeTags.filter(tag => tag.tag_type === tagType.value);
                    if (tagsOfType.length === 0) return null;
                    
                    return (
                      <div key={`add-${tagType.value}`} className="mb-2">
                        <button
                          onClick={() => handleSubMenuToggle(`addTags-${tagType.value}`)}
                          className={`w-full flex items-center px-2 py-1 text-xs rounded transition-colors ${bgHover} ${textSecondary}`}
                        >
                          <Plus size={12} className={`mr-2 ${tagType.color}`} />
                          <span>{tagType.label}</span>
                          <MoreHorizontal size={10} className="ml-auto" />
                        </button>
                        
                        {subMenuOpen === `addTags-${tagType.value}` && (
                          <div className={`mt-1 ml-4 ${bgCard} border ${borderColor} rounded max-h-32 overflow-y-auto`}>
                            {tagsOfType.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => handleActionWithOptions('addTags', { tagIds: [tag.id] })}
                                className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${bgHover} ${textSecondary}`}
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Remove Tags */}
                <div className="p-2">
                  <div className={`text-xs font-medium ${textSecondary} mb-2`}>Remove Tags</div>
                  {tagTypeOptions.map((tagType) => {
                    const tagsOfType = employeeTags.filter(tag => tag.tag_type === tagType.value);
                    if (tagsOfType.length === 0) return null;
                    
                    return (
                      <div key={`remove-${tagType.value}`} className="mb-2">
                        <button
                          onClick={() => handleSubMenuToggle(`removeTags-${tagType.value}`)}
                          className={`w-full flex items-center px-2 py-1 text-xs rounded transition-colors ${bgHover} ${textSecondary}`}
                        >
                          <Minus size={12} className={`mr-2 text-red-500`} />
                          <span>{tagType.label}</span>
                          <MoreHorizontal size={10} className="ml-auto" />
                        </button>
                        
                        {subMenuOpen === `removeTags-${tagType.value}` && (
                          <div className={`mt-1 ml-4 ${bgCard} border ${borderColor} rounded max-h-32 overflow-y-auto`}>
                            {tagsOfType.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => handleActionWithOptions('removeTags', { tagIds: [tag.id] })}
                                className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${bgHover} ${textSecondary}`}
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bulk Edit */}
          <div className="px-2">
            <button
              onClick={() => handleSubMenuToggle('bulkEdit')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
            >
              <Edit3 size={16} className="mr-3 text-orange-500" />
              <div className="flex-1 text-left">
                <div>Bulk Edit</div>
                <div className={`text-xs ${textMuted}`}>Update multiple fields</div>
              </div>
              <MoreHorizontal size={14} className={textMuted} />
            </button>

            {/* Bulk Edit Sub-menu */}
            {subMenuOpen === 'bulkEdit' && (
              <div className={`mt-2 ml-6 ${bgCard} border ${borderColor} rounded-lg shadow-lg`}>
                <button
                  onClick={() => handleActionWithOptions('bulkUpdate', { field: 'line_manager' })}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
                >
                  <Users size={14} className="mr-3 text-blue-500" />
                  <div className="text-left">
                    <div>Update Line Manager</div>
                    <div className={`text-xs ${textMuted}`}>Assign new line manager</div>
                  </div>
                </button>

                <button
                  onClick={() => handleActionWithOptions('bulkUpdate', { field: 'department' })}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
                >
                  <Users size={14} className="mr-3 text-green-500" />
                  <div className="text-left">
                    <div>Transfer Department</div>
                    <div className={`text-xs ${textMuted}`}>Move to different department</div>
                  </div>
                </button>

                <button
                  onClick={() => handleActionWithOptions('bulkUpdate', { field: 'position_group' })}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
                >
                  <Users size={14} className="mr-3 text-purple-500" />
                  <div className="text-left">
                    <div>Update Position Group</div>
                    <div className={`text-xs ${textMuted}`}>Change position group</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Import/Upload */}
          <div className="px-2">
            <button
              onClick={() => handleActionWithOptions('bulkImport')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
            >
              <Upload size={16} className="mr-3 text-blue-500" />
              <div className="flex-1 text-left">
                <div>Bulk Import</div>
                <div className={`text-xs ${textMuted}`}>Import from Excel/CSV</div>
              </div>
            </button>
          </div>

          {/* Template Download */}
          <div className="px-2">
            <button
              onClick={() => handleActionWithOptions('downloadTemplate')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors ${bgHover} ${textPrimary}`}
            >
              <FileSpreadsheet size={16} className="mr-3 text-green-500" />
              <div className="flex-1 text-left">
                <div>Download Template</div>
                <div className={`text-xs ${textMuted}`}>Excel template for import</div>
              </div>
            </button>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Delete */}
          <div className="px-2">
            <button
              onClick={() => handleActionWithOptions('delete')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400`}
            >
              <Trash2 size={16} className="mr-3" />
              <div className="flex-1 text-left">
                <div>Delete Employees</div>
                <div className={`text-xs ${textMuted}`}>Permanently remove selected</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        {selectedCount > 0 && (
          <div className={`px-4 py-3 border-t ${borderColor} bg-gray-50 dark:bg-gray-800/50`}>
            <div className={`text-xs ${textMuted} text-center`}>
              Actions will be applied to {selectedCount} employee{selectedCount !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionMenu;