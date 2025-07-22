// src/components/headcount/TagManagementModal.jsx - FIXED API Integration
import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Search, Tag, Plus, Minus, Check, AlertCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { useReferenceData } from '../../hooks/useReferenceData';
import { useEmployees } from '../../hooks/useEmployees';

const TagManagementModal = ({
  isOpen,
  onClose,
  onAction,
  selectedEmployees = [],
  selectedEmployeeData = [],
  darkMode = false
}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ========================================
  // API DATA - Fixed
  // ========================================
  const {
    employeeTags = [],
    loading = {},
    error = {},
    fetchEmployeeTags,
    getFormattedEmployeeTags,
    hasEmployeeTags
  } = useReferenceData();

  const {
    formattedEmployees = []
  } = useEmployees();

  // Format tags for backend API compatibility
  const formattedTags = useMemo(() => {
    const formatted = getFormattedEmployeeTags?.() || employeeTags;
    
    return formatted.map(tag => ({
      id: tag.id || tag.value,
      value: tag.id || tag.value, 
      label: tag.name || tag.label,
      name: tag.name || tag.label,
      tag_type: tag.tag_type,
      color: tag.color || '#6B7280',
      employee_count: tag.employee_count || 0,
      is_active: tag.is_active !== false
    }));
  }, [employeeTags, getFormattedEmployeeTags]);

  const isLoading = loading?.employeeTags || false;
  const hasError = error?.employeeTags || false;

  // Theme classes
  const bgModal = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const bgDropdown = darkMode ? "bg-gray-700" : "bg-white";

  // ========================================
  // DATA PROCESSING - Fixed for Employee Tag Data
  // ========================================

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    let filtered = formattedTags.filter(tag => tag.is_active);

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tag => 
        tag.name.toLowerCase().includes(searchLower) ||
        tag.tag_type.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [formattedTags, searchTerm]);

  // Get selected tag objects
  const selectedTagObjects = useMemo(() => {
    return selectedTags.map(tagId => 
      formattedTags.find(tag => tag.id === tagId)
    ).filter(Boolean);
  }, [selectedTags, formattedTags]);

  // ========================================
  // SMART TOGGLE LOGIC - Fixed with actual employee data
  // ========================================

  // Check if selected employees have a specific tag
  const getTagStatusForEmployees = (tagId) => {
    if (!selectedEmployeeData || selectedEmployeeData.length === 0) {
      return { hasTag: 0, total: selectedEmployees.length };
    }

    const employeesWithTag = selectedEmployeeData.filter(emp => {
      // Check different tag data structures from API
      const empTags = emp.tagInfo?.tags || emp.tags || emp.tag_names || [];
      
      return empTags.some(tag => {
        // Handle different tag formats
        if (typeof tag === 'object') {
          return tag.id === tagId || tag.value === tagId;
        }
        return tag === tagId;
      });
    });

    return {
      hasTag: employeesWithTag.length,
      total: selectedEmployeeData.length,
      employeesWithTag: employeesWithTag,
      employeesWithoutTag: selectedEmployeeData.filter(emp => !employeesWithTag.includes(emp))
    };
  };

  // Get action for tag (add/remove based on majority)
  const getTagAction = (tagId) => {
    const status = getTagStatusForEmployees(tagId);
    const percentage = status.total > 0 ? (status.hasTag / status.total) * 100 : 0;
    
    // If more than 50% of employees have this tag, remove it
    // Otherwise add it
    return percentage > 50 ? 'remove' : 'add';
  };

  // ========================================
  // INITIALIZATION
  // ========================================
  useEffect(() => {
    if (isOpen) {
      setSelectedTags([]);
      setSearchTerm('');
      setDropdownOpen(false);
      
      // Fetch employee tags if not available
      if (!hasEmployeeTags() && fetchEmployeeTags) {
        console.log('🏷️ Fetching employee tags...');
        fetchEmployeeTags();
      }
    }
  }, [isOpen, hasEmployeeTags, fetchEmployeeTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ========================================
  // EVENT HANDLERS - Fixed for Backend API
  // ========================================

  // Handle tag selection/deselection
  const handleTagSelect = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag.id)) {
        return prev.filter(id => id !== tag.id);
      } else {
        return [...prev, tag.id];
      }
    });
  };

  // Remove selected tag
  const handleRemoveTag = (tagId) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  // Manual refresh tags
  const handleRefreshTags = () => {
    console.log('🔄 Manually refreshing tags...');
    if (fetchEmployeeTags) {
      fetchEmployeeTags();
    }
  };

  // SMART TOGGLE ACTION - Fixed for Backend API
  const handleSmartToggle = async () => {
    if (selectedTags.length === 0) {
      alert('Please select at least one tag');
      return;
    }

    if (selectedEmployees.length === 0) {
      alert('No employees selected');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Smart action for each tag using proper backend API endpoints
      for (const tagId of selectedTags) {
        const action = getTagAction(tagId);
        const status = getTagStatusForEmployees(tagId);
        const tagName = formattedTags.find(t => t.id === tagId)?.name || tagId;
        
        console.log(`🏷️ Smart Toggle: ${action} tag "${tagName}" (${status.hasTag}/${status.total} employees have it)`);
        
        // Backend API endpoints:
        // POST /employees/bulk-add-tag/ for adding
        // POST /employees/bulk-remove-tag/ for removing
        const payload = {
          employee_ids: selectedEmployees,
          tag_id: tagId
        };

        if (action === 'add') {
          await onAction('bulkAddTags', payload);
        } else {
          await onAction('bulkRemoveTags', payload);
        }
      }
      
      console.log('✅ Smart toggle completed successfully');
      onClose();
    } catch (error) {
      console.error('❌ Smart toggle failed:', error);
      alert(`Smart toggle failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${bgModal} rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
              <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>
                Tag Management
              </h2>
              <p className={`text-sm ${textMuted}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshTags}
              disabled={isProcessing || isLoading}
              className={`p-2 rounded-lg ${bgHover} transition-colors disabled:opacity-50`}
              title="Refresh tags"
            >
              <RefreshCw 
                className={`w-4 h-4 ${textSecondary} ${isLoading ? 'animate-spin' : ''}`} 
              />
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`p-2 rounded-lg ${bgHover} transition-colors disabled:opacity-50`}
            >
              <X className={`w-5 h-5 ${textSecondary}`} />
            </button>
          </div>
        </div>

        {/* Smart Toggle Info */}
        <div className="px-6 pt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Smart Toggle</h4>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Tags will be automatically added or removed. If an employee has the tag, it will be removed; if not, it will be added.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Selected Employees Display */}
          {selectedEmployeeData.length > 0 && (
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
                Selected Employees ({selectedEmployeeData.length})
              </label>
              <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                {selectedEmployeeData.map((emp) => {
                  const empTags = emp.tagInfo?.tags || emp.tags || emp.tag_names || [];
                  return (
                    <div key={emp.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                            {(emp.first_name || emp.fullName || '').charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className={`font-medium ${textPrimary}`}>
                            {emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()}
                          </div>
                          <div className={`text-xs ${textMuted}`}>
                            {emp.employee_id} • {empTags.length} tag{empTags.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {empTags.slice(0, 3).map((tag, index) => {
                          const tagName = typeof tag === 'object' ? tag.name || tag.label : tag;
                          return (
                            <span key={index} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                              {tagName}
                            </span>
                          );
                        })}
                        {empTags.length > 3 && (
                          <span className={`text-xs ${textMuted}`}>+{empTags.length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className={textMuted}>Loading tags...</span>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-sm text-red-800 dark:text-red-300">
                    Failed to load tags
                  </span>
                </div>
                <button
                  onClick={handleRefreshTags}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Selected Tags ({selectedTags.length})
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedTagObjects.map((tag) => {
                  const status = getTagStatusForEmployees(tag.id);
                  const action = getTagAction(tag.id);
                  const percentage = status.total > 0 ? Math.round((status.hasTag / status.total) * 100) : 0;
                  
                  return (
                    <div
                      key={`selected-${tag.id}`}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm border ${
                        action === 'add' 
                          ? 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300'
                      }`}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{tag.name}</span>
                          {action === 'add' ? (
                            <Plus className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                        </div>
                        <div className="text-xs opacity-75">
                          {action === 'add' ? 'Will be added' : 'Will be removed'} • {status.hasTag}/{status.total} ({percentage}%)
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        disabled={isProcessing}
                        className="ml-2 hover:text-red-600 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tag Selection */}
          {!isLoading && !hasError && formattedTags.length > 0 && (
            <div ref={dropdownRef}>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Search and Select Tags
              </label>
              <div className="relative">
                <div
                  onClick={() => !isProcessing && setDropdownOpen(!dropdownOpen)}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} cursor-pointer flex items-center justify-between ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center flex-1">
                    <Search className={`w-4 h-4 mr-3 ${textMuted}`} />
                    <input
                      type="text"
                      placeholder="Search tags by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(true);
                      }}
                      disabled={isProcessing}
                      className={`bg-transparent outline-none flex-1 ${textPrimary} disabled:opacity-50 placeholder:${textMuted}`}
                    />
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 ${textMuted} transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && !isProcessing && (
                  <div className={`absolute z-20 w-full mt-1 ${bgDropdown} border ${borderColor} rounded-lg shadow-lg max-h-64 overflow-y-auto`}>
                    {filteredTags.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Tag className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                        <p className={textMuted}>
                          {searchTerm ? 'No tags found matching search' : 'No tags available'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        const status = getTagStatusForEmployees(tag.id);
                        const action = getTagAction(tag.id);
                        const percentage = status.total > 0 ? Math.round((status.hasTag / status.total) * 100) : 0;
                        
                        return (
                          <div
                            key={`dropdown-${tag.id}`}
                            onClick={() => handleTagSelect(tag)}
                            className={`px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                              isSelected 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
                                : `${bgHover} border-transparent`
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1">
                                <div 
                                  className="w-3 h-3 rounded-full mr-3"
                                  style={{ backgroundColor: tag.color }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${textPrimary}`}>
                                      {tag.name}
                                    </span>
                                    {tag.tag_type && (
                                      <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 ${textMuted}`}>
                                        {tag.tag_type}
                                      </span>
                                    )}
                                    {status.total > 0 && (
                                      <div className={`flex items-center gap-1 text-xs ${
                                        action === 'add' 
                                          ? 'text-green-600 dark:text-green-400'
                                          : 'text-red-600 dark:text-red-400'
                                      }`}>
                                        {action === 'add' ? (
                                          <Plus className="w-3 h-3" />
                                        ) : (
                                          <Minus className="w-3 h-3" />
                                        )}
                                        <span>{action === 'add' ? 'Add' : 'Remove'}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className={`text-xs ${textMuted} mt-0.5 flex items-center gap-2`}>
                                    <span>{tag.employee_count || 0} employees</span>
                                    {status.total > 0 && (
                                      <span>• {status.hasTag}/{status.total} selected ({percentage}%)</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Data State */}
          {!isLoading && !hasError && formattedTags.length === 0 && (
            <div className="text-center py-8">
              <Tag className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
              <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No tags available</h3>
              <p className={`${textMuted} mb-4`}>
                No employee tags have been created yet.
              </p>
              <button
                onClick={handleRefreshTags}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Refresh Tags
              </button>
            </div>
          )}

          {/* Stats */}
          {formattedTags.length > 0 && (
            <div className={`text-xs ${textMuted} text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Available Tags</div>
                  <div>{filteredTags.length} / {formattedTags.length}</div>
                </div>
                <div>
                  <div className="font-medium">Selected Tags</div>
                  <div>{selectedTags.length}</div>
                </div>
              </div>
              {searchTerm && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  Results for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            {selectedTags.length > 0 ? (
              <span className={`text-sm ${textMuted}`}>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected • {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className={`text-sm ${textMuted}`}>
                Select tags and smart toggle them
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`px-4 py-2 text-sm border ${borderColor} rounded-lg ${textSecondary} ${bgHover} transition-colors disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleSmartToggle}
              disabled={
                isProcessing || 
                selectedTags.length === 0 || 
                selectedEmployees.length === 0 || 
                isLoading
              }
              className={`px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing || 
                selectedTags.length === 0 || 
                selectedEmployees.length === 0 || 
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Smart Toggle (${selectedTags.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagManagementModal;