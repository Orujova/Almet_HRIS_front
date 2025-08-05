// src/components/headcount/TagManagementModal.jsx - FIXED Tag Management (Single Tag Logic)
import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Search, Tag, Plus, Minus, Check, AlertCircle, ChevronDown, RefreshCw, User } from 'lucide-react';
import { useReferenceData } from '../../hooks/useReferenceData';

const TagManagementModal = ({
  isOpen,
  onClose,
  onAction,
  selectedEmployees = [],
  selectedEmployeeData = [],
  darkMode = false
}) => {
  const [selectedTagId, setSelectedTagId] = useState('');
  const [operationType, setOperationType] = useState('replace'); // 'replace', 'remove'
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // API data from hooks
  const {
    employeeTags = [],
    loading = {},
    error = {},
    fetchEmployeeTags,
    getFormattedEmployeeTags,
    hasEmployeeTags
  } = useReferenceData();

  // Format tags for use
  const availableTags = useMemo(() => {
    const formatted = getFormattedEmployeeTags?.() || employeeTags;
    
    return formatted
      .filter(tag => tag.is_active !== false)
      .map(tag => ({
        id: tag.id || tag.value,
        value: tag.id || tag.value,
        name: tag.name || tag.label,
        tag_type: tag.tag_type || 'general',
        color: tag.color || '#6B7280',
        employee_count: tag.employee_count || 0
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
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

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) return availableTags;
    
    const searchLower = searchTerm.toLowerCase();
    return availableTags.filter(tag => 
      tag.name.toLowerCase().includes(searchLower) ||
      tag.tag_type.toLowerCase().includes(searchLower)
    );
  }, [availableTags, searchTerm]);

  // FIXED: Analyze current tags for selected employees - Better tag detection
  const employeeTagAnalysis = useMemo(() => {
    if (!selectedEmployeeData || selectedEmployeeData.length === 0) {
      return {
        employeesWithTags: 0,
        employeesWithoutTags: 0,
        currentTags: {},
        employeeTagMap: {}
      };
    }

    const employeeTagMap = {};
    const currentTags = {};
    let employeesWithTags = 0;

    selectedEmployeeData.forEach(emp => {
      // Try multiple ways to get current tag - IMPROVED
      let currentTag = null;
      
      // Method 1: Check tagInfo.tags array
      if (emp.tagInfo?.tags && Array.isArray(emp.tagInfo.tags) && emp.tagInfo.tags.length > 0) {
        currentTag = emp.tagInfo.tags[0];
      }
      // Method 2: Check direct tags array
      else if (emp.tags && Array.isArray(emp.tags) && emp.tags.length > 0) {
        currentTag = emp.tags[0];
      }
      // Method 3: Check tag_names array
      else if (emp.tag_names && Array.isArray(emp.tag_names) && emp.tag_names.length > 0) {
        currentTag = emp.tag_names[0];
      }
      // Method 4: Check single tag properties
      else if (emp.tag_id || emp.tag_name) {
        currentTag = {
          id: emp.tag_id,
          name: emp.tag_name
        };
      }
      
      if (currentTag) {
        employeesWithTags++;
        
        // Normalize tag data
        const tagId = typeof currentTag === 'object' ? 
          (currentTag.id || currentTag.value) : currentTag;
        const tagName = typeof currentTag === 'object' ? 
          (currentTag.name || currentTag.label || currentTag) : currentTag;
        
        employeeTagMap[emp.id] = { 
          id: tagId, 
          name: tagName.toString() // Ensure string
        };
        
        if (!currentTags[tagId]) {
          currentTags[tagId] = { count: 0, name: tagName.toString() };
        }
        currentTags[tagId].count++;
      } else {
        employeeTagMap[emp.id] = null;
      }
    });

    console.log('🏷️ Tag Analysis Result:', {
      employeesWithTags,
      total: selectedEmployeeData.length,
      currentTags,
      employeeTagMap
    });

    return {
      employeesWithTags,
      employeesWithoutTags: selectedEmployeeData.length - employeesWithTags,
      currentTags,
      employeeTagMap
    };
  }, [selectedEmployeeData]);

  // Get selected tag object
  const selectedTag = useMemo(() => {
    return availableTags.find(tag => tag.id === selectedTagId);
  }, [availableTags, selectedTagId]);

  // ========================================
  // INITIALIZATION
  // ========================================
  useEffect(() => {
    if (isOpen) {
      setSelectedTagId('');
      setOperationType('replace');
      setSearchTerm('');
      setDropdownOpen(false);
      
      // Fetch tags if not available
      if (!hasEmployeeTags() && fetchEmployeeTags) {
        console.log('🏷️ Fetching employee tags...');
        fetchEmployeeTags();
      }
    }
  }, [isOpen, hasEmployeeTags, fetchEmployeeTags]);

  // Click outside handler
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
  // EVENT HANDLERS
  // ========================================

  const handleTagSelect = (tag) => {
    setSelectedTagId(tag.id);
    setDropdownOpen(false);
    setSearchTerm('');
  };

  const handleRefreshTags = () => {
    console.log('🔄 Refreshing tags...');
    if (fetchEmployeeTags) {
      fetchEmployeeTags();
    }
  };

  // FIXED: Execute tag operations with proper sequential logic
  const handleExecuteTagOperation = async () => {
    if (operationType === 'replace' && !selectedTagId) {
      alert('Please select a tag to assign');
      return;
    }

    if (selectedEmployees.length === 0) {
      alert('No employees selected');
      return;
    }

    setIsProcessing(true);
    
    try {
      if (operationType === 'remove') {
        // Remove current tags from all selected employees
        console.log('🗑️ Removing tags from employees...');
        
        // Group employees by their current tags and remove each tag
        const removalPromises = [];
        
        Object.entries(employeeTagAnalysis.employeeTagMap).forEach(([empId, tagInfo]) => {
          if (tagInfo && selectedEmployees.includes(parseInt(empId))) {
            // Only add this employee to removal if not already in a batch for this tag
            const existingPromise = removalPromises.find(p => p.tagId === tagInfo.id);
            if (existingPromise) {
              existingPromise.employeeIds.push(parseInt(empId));
            } else {
              removalPromises.push({
                tagId: tagInfo.id,
                employeeIds: [parseInt(empId)]
              });
            }
          }
        });

        // Execute all removals
        for (const removal of removalPromises) {
          if (removal.employeeIds.length > 0) {
            console.log(`🗑️ Removing tag ${removal.tagId} from ${removal.employeeIds.length} employees`);
            await onAction('bulkRemoveTags', {
              employee_ids: removal.employeeIds,
              tag_id: removal.tagId
            });
          }
        }

      } else if (operationType === 'replace') {
        // FIXED: Replace tags properly - Remove old tags first, then add new tag
        console.log('🔄 Replacing tags for employees...');
        
        // Step 1: Remove existing tags ONLY from employees that have tags
        const employeesWithCurrentTags = selectedEmployees.filter(empId => 
          employeeTagAnalysis.employeeTagMap[empId] !== null
        );

        if (employeesWithCurrentTags.length > 0) {
          console.log(`🗑️ First removing existing tags from ${employeesWithCurrentTags.length} employees`);
          
          // Group by current tags and remove them
          const tagGroups = {};
          employeesWithCurrentTags.forEach(empId => {
            const tagInfo = employeeTagAnalysis.employeeTagMap[empId];
            if (tagInfo) {
              if (!tagGroups[tagInfo.id]) {
                tagGroups[tagInfo.id] = [];
              }
              tagGroups[tagInfo.id].push(empId);
            }
          });

          // Remove each tag group
          for (const [tagId, employeeIds] of Object.entries(tagGroups)) {
            console.log(`🗑️ Removing tag ${tagId} from employees: ${employeeIds.join(', ')}`);
            await onAction('bulkRemoveTags', {
              employee_ids: employeeIds,
              tag_id: parseInt(tagId)
            });
          }
          
          // Wait a bit for backend to process
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Step 2: Add new tag to ALL selected employees
        console.log(`➕ Adding new tag ${selectedTagId} to all ${selectedEmployees.length} employees`);
        await onAction('bulkAddTags', {
          employee_ids: selectedEmployees,
          tag_id: selectedTagId
        });
      }
      
      console.log('✅ Tag operations completed successfully');
      onClose();
    } catch (error) {
      console.error('❌ Tag operations failed:', error);
      alert(`Tag operations failed: ${error.message}`);
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
      <div className={`relative ${bgModal} rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden`}>
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
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected • Single tag per employee
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

        {/* Operation Mode Selection */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <label className={`text-sm font-medium ${textPrimary}`}>Operation:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setOperationType('replace')}
                disabled={isProcessing}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors disabled:opacity-50 ${
                  operationType === 'replace'
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                    : `border-gray-300 dark:border-gray-600 ${textSecondary} ${bgHover}`
                }`}
              >
                Replace Tag
              </button>
              <button
                onClick={() => setOperationType('remove')}
                disabled={isProcessing}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors disabled:opacity-50 ${
                  operationType === 'remove'
                    ? 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300'
                    : `border-gray-300 dark:border-gray-600 ${textSecondary} ${bgHover}`
                }`}
              >
                Remove Tags
              </button>
            </div>
          </div>

         
        </div>

        {/* Content */}
        <div className="px-6 pb-4 space-y-4 max-h-96 overflow-y-auto">
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

       
          {/* Selected Employees Display - IMPROVED */}
          {selectedEmployeeData.length > 0 && (
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
                Selected Employees ({selectedEmployeeData.length})
              </label>
              <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                {selectedEmployeeData.map((emp) => {
                  const currentTag = employeeTagAnalysis.employeeTagMap[emp.id];
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
                            {emp.employee_id} • {emp.jobTitle || emp.job_title}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs">
                        {currentTag ? (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-blue-700 dark:text-blue-300">
                            {currentTag.name}
                          </span>
                        ) : (
                          <span className={`${textMuted}`}>No tag</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tag Selection (only for replace mode) */}
          {operationType === 'replace' && !isLoading && !hasError && availableTags.length > 0 && (
            <div ref={dropdownRef}>
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Select Tag to Assign
              </label>
              <div className="relative">
                <div
                  onClick={() => !isProcessing && setDropdownOpen(!dropdownOpen)}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} cursor-pointer flex items-center justify-between ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center flex-1">
                    <Search className={`w-4 h-4 mr-3 ${textMuted}`} />
                    {selectedTag ? (
                      <div className="flex items-center flex-1">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: selectedTag.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${textPrimary}`}>
                              {selectedTag.name}
                            </span>
                            {selectedTag.tag_type && (
                              <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 ${textMuted}`}>
                                {selectedTag.tag_type}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${textMuted}`}>
                            {selectedTag.employee_count} employees currently have this tag
                          </div>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Search tags by name or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(true);
                        }}
                        disabled={isProcessing}
                        className={`bg-transparent outline-none flex-1 ${textPrimary} disabled:opacity-50 placeholder:${textMuted}`}
                      />
                    )}
                  </div>
                  <div className="flex items-center ml-2">
                    {selectedTag && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTagId('');
                          setSearchTerm('');
                        }}
                        className={`mr-2 ${textMuted} hover:text-red-500 transition-colors`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronDown 
                      className={`w-4 h-4 ${textMuted} transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </div>
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
                        const isSelected = selectedTagId === tag.id;
                        
                        return (
                          <div
                            key={`dropdown-${tag.id}`}
                            onClick={() => handleTagSelect(tag)}
                            className={`px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                              isSelected 
                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500' 
                                : `${bgHover} border-transparent`
                            }`}
                          >
                            <div className="flex items-center">
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
                                </div>
                                <div className={`text-xs ${textMuted} mt-0.5`}>
                                  {tag.employee_count || 0} employees currently have this tag
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-purple-500" />
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
          {!isLoading && !hasError && availableTags.length === 0 && (
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

          {/* Statistics */}
          {availableTags.length > 0 && (
            <div className={`text-xs ${textMuted} text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg`}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-medium">Available Tags</div>
                  <div>{filteredTags.length} / {availableTags.length}</div>
                </div>
                <div>
                  <div className="font-medium">Employees with Tags</div>
                  <div>{employeeTagAnalysis.employeesWithTags} / {selectedEmployeeData.length}</div>
                </div>
                <div>
                  <div className="font-medium">Operation</div>
                  <div className="capitalize">{operationType}</div>
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
            {operationType === 'replace' && selectedTagId ? (
              <span className={`text-sm ${textMuted}`}>
                Replace tags for {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
              </span>
            ) : operationType === 'remove' ? (
              <span className={`text-sm ${textMuted}`}>
                Remove tags from {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className={`text-sm ${textMuted}`}>
                Select operation and tag
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
              onClick={handleExecuteTagOperation}
              disabled={
                isProcessing || 
                selectedEmployees.length === 0 || 
                (operationType === 'replace' && !selectedTagId) ||
                isLoading
              }
              className={`px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing || 
                selectedEmployees.length === 0 || 
                (operationType === 'replace' && !selectedTagId) ||
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : operationType === 'replace'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                operationType === 'replace' 
                  ? `Replace Tags (${selectedEmployees.length})` 
                  : `Remove Tags (${selectedEmployees.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagManagementModal;