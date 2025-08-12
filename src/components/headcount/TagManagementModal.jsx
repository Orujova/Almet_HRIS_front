// src/components/headcount/TagManagementModal.jsx - Enhanced Design with Project Colors
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

  // Enhanced theme classes with project colors
  const bgModal = darkMode ? "bg-gray-900" : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-mystic";
  const bgHover = darkMode ? "hover:bg-gray-800" : "hover:bg-almet-mystic/50";
  const bgInput = darkMode ? "bg-gray-800" : "bg-white";
  const bgDropdown = darkMode ? "bg-gray-800" : "bg-white";
  const accentBlue = darkMode ? "text-blue-400" : "text-almet-sapphire";
  const accentPurple = darkMode ? "text-purple-400" : "text-purple-600";

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) return availableTags;
    
    const searchLower = searchTerm.toLowerCase();
    return availableTags.filter(tag => 
      tag.name.toLowerCase().includes(searchLower) ||
      tag.tag_type.toLowerCase().includes(searchLower)
    );
  }, [availableTags, searchTerm]);

  // Enhanced: Analyze current tags for selected employees
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

  // Execute tag operations with proper sequential logic
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
        // Replace tags properly - Remove old tags first, then add new tag
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${bgModal} rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden border ${borderColor}`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mr-3">
              <Tag className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className={`text-base font-semibold ${textPrimary}`}>
                Tag Management
              </h2>
              <p className={`text-xs ${textMuted}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected • Single tag per employee
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefreshTags}
              disabled={isProcessing || isLoading}
              className={`p-1.5 rounded-lg ${bgHover} transition-all duration-200 disabled:opacity-50`}
              title="Refresh tags"
            >
              <RefreshCw 
                className={`w-3.5 h-3.5 ${textSecondary} ${isLoading ? 'animate-spin' : ''}`} 
              />
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`p-1.5 rounded-lg ${bgHover} transition-all duration-200 disabled:opacity-50`}
            >
              <X className={`w-4 h-4 ${textSecondary}`} />
            </button>
          </div>
        </div>

        {/* Operation Mode Selection */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <label className={`text-sm font-medium ${textPrimary}`}>Operation:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setOperationType('replace')}
                disabled={isProcessing}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 ${
                  operationType === 'replace'
                    ? 'bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950 dark:to-sky-950 border-almet-sapphire text-almet-sapphire shadow-sm'
                    : `border-gray-300 dark:border-gray-600 ${textSecondary} ${bgHover}`
                }`}
              >
                Replace Tag
              </button>
              <button
                onClick={() => setOperationType('remove')}
                disabled={isProcessing}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 ${
                  operationType === 'remove'
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-400 text-red-600 shadow-sm'
                    : `border-gray-300 dark:border-gray-600 ${textSecondary} ${bgHover}`
                }`}
              >
                Remove Tags
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-4 h-4 border border-purple-500 border-t-transparent rounded-full animate-spin mr-2.5"></div>
              <span className={`text-sm ${textMuted}`}>Loading tags...</span>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-sm text-red-800 dark:text-red-300 font-medium">
                    Failed to load tags
                  </span>
                </div>
                <button
                  onClick={handleRefreshTags}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Selected Employees Display - Enhanced */}
          {selectedEmployeeData.length > 0 && (
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2.5`}>
                Selected Employees ({selectedEmployeeData.length})
              </label>
              <div className="max-h-28 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 space-y-1.5">
                {selectedEmployeeData.map((emp) => {
                  const currentTag = employeeTagAnalysis.employeeTagMap[emp.id];
                  return (
                    <div key={emp.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900 dark:to-violet-900 rounded-lg flex items-center justify-center mr-2.5">
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
                          <span className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/50 dark:to-sky-950/50 border border-blue-200 dark:border-blue-800 rounded-full text-almet-sapphire font-medium">
                            {currentTag.name}
                          </span>
                        ) : (
                          <span className={`${textMuted} bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full`}>No tag</span>
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
                  className={`w-full px-3.5 py-2.5 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} cursor-pointer flex items-center justify-between transition-all duration-200 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-300'}`}
                >
                  <div className="flex items-center flex-1">
                    <Search className={`w-3.5 h-3.5 mr-2.5 ${textMuted}`} />
                    {selectedTag ? (
                      <div className="flex items-center flex-1">
                        <div 
                          className="w-2.5 h-2.5 rounded-full mr-2.5 border border-white shadow-sm"
                          style={{ backgroundColor: selectedTag.color }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-medium text-sm ${textPrimary}`}>
                              {selectedTag.name}
                            </span>
                            {selectedTag.tag_type && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 ${textMuted}`}>
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
                        className={`bg-transparent outline-none flex-1 text-sm ${textPrimary} disabled:opacity-50 placeholder:${textMuted}`}
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
                        className={`mr-1.5 ${textMuted} hover:text-red-500 transition-colors`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <ChevronDown 
                      className={`w-3.5 h-3.5 ${textMuted} transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && !isProcessing && (
                  <div className={`absolute z-20 w-full mt-1 ${bgDropdown} border ${borderColor} rounded-lg shadow-xl max-h-64 overflow-y-auto`}>
                    {filteredTags.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <Tag className={`w-6 h-6 mx-auto mb-2 ${textMuted}`} />
                        <p className={`text-sm ${textMuted} mb-1`}>
                          {searchTerm ? 'No tags found matching search' : 'No tags available'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-1.5 text-xs text-purple-500 hover:text-purple-600"
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
                            className={`px-3.5 py-2.5 cursor-pointer transition-all duration-200 border-l-3 ${
                              isSelected 
                                ? 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-500' 
                                : `${bgHover} border-transparent hover:border-purple-300`
                            }`}
                          >
                            <div className="flex items-center">
                              <div 
                                className="w-2.5 h-2.5 rounded-full mr-2.5 border border-white shadow-sm"
                                style={{ backgroundColor: tag.color }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-medium text-sm ${textPrimary}`}>
                                    {tag.name}
                                  </span>
                                  {tag.tag_type && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 ${textMuted}`}>
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
              <Tag className={`w-10 h-10 mx-auto mb-4 ${textMuted}`} />
              <h3 className={`text-base font-medium ${textPrimary} mb-2`}>No tags available</h3>
              <p className={`text-sm ${textMuted} mb-4`}>
                No employee tags have been created yet.
              </p>
              <button
                onClick={handleRefreshTags}
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-200 shadow-md"
              >
                Refresh Tags
              </button>
            </div>
          )}

          {/* Tag Operation Preview */}
          {operationType === 'replace' && selectedTag && (
            <div className={`p-3.5 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800 rounded-lg`}>
              <h4 className={`font-medium text-sm ${textPrimary} mb-1.5 flex items-center`}>
                <Tag className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                Tag Assignment Preview
              </h4>
              <p className={`text-xs ${textSecondary}`}>
                <strong>{selectedTag.name}</strong> will be assigned to <strong>{selectedEmployees.length}</strong> employee{selectedEmployees.length !== 1 ? 's' : ''}.
              </p>
              {employeeTagAnalysis.employeesWithTags > 0 && (
                <p className={`text-xs ${textMuted} mt-1.5 flex items-center`}>
                  <span className="text-amber-500 mr-1.5">⚠</span>
                  {employeeTagAnalysis.employeesWithTags} employee{employeeTagAnalysis.employeesWithTags !== 1 ? 's' : ''} will have their current tags replaced.
                </p>
              )}
            </div>
          )}

          {operationType === 'remove' && employeeTagAnalysis.employeesWithTags > 0 && (
            <div className={`p-3.5 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-800 rounded-lg`}>
              <h4 className={`font-medium text-sm ${textPrimary} mb-1.5 flex items-center`}>
                <Minus className="w-3.5 h-3.5 mr-1.5 text-red-600" />
                Tag Removal Preview
              </h4>
              <p className={`text-xs ${textSecondary}`}>
                Tags will be removed from <strong>{employeeTagAnalysis.employeesWithTags}</strong> out of <strong>{selectedEmployees.length}</strong> selected employee{selectedEmployees.length !== 1 ? 's' : ''}.
              </p>
              {employeeTagAnalysis.employeesWithoutTags > 0 && (
                <p className={`text-xs ${textMuted} mt-1.5 flex items-center`}>
                  <span className="text-blue-500 mr-1.5">ℹ</span>
                  {employeeTagAnalysis.employeesWithoutTags} employee{employeeTagAnalysis.employeesWithoutTags !== 1 ? 's' : ''} already have no tags.
                </p>
              )}
            </div>
          )}

          {/* Statistics - Enhanced */}
          {availableTags.length > 0 && (
            <div className={`text-xs ${textMuted} text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg`}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-medium text-xs">Available Tags</div>
                  <div className={`text-sm font-semibold ${accentPurple}`}>{filteredTags.length} / {availableTags.length}</div>
                  <div className="text-xs opacity-75">in system</div>
                </div>
                <div>
                  <div className="font-medium text-xs">Tagged Employees</div>
                  <div className={`text-sm font-semibold ${accentBlue}`}>{employeeTagAnalysis.employeesWithTags} / {selectedEmployeeData.length}</div>
                  <div className="text-xs opacity-75">have tags</div>
                </div>
                <div>
                  <div className="font-medium text-xs">Operation</div>
                  <div className={`text-sm font-semibold capitalize ${operationType === 'replace' ? 'text-blue-600' : 'text-red-600'}`}>{operationType}</div>
                  <div className="text-xs opacity-75">selected</div>
                </div>
              </div>
              {searchTerm && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <strong>{filteredTags.length}</strong> results for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-5 py-3.5 border-t ${borderColor} flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30`}>
          <div className="flex items-center">
            {operationType === 'replace' && selectedTagId ? (
              <span className={`text-xs ${textMuted} font-medium`}>
                Replace tags for {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
              </span>
            ) : operationType === 'remove' ? (
              <span className={`text-xs ${textMuted} font-medium`}>
                Remove tags from {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className={`text-xs ${textMuted}`}>
                Select operation and tag
              </span>
            )}
          </div>
          <div className="flex space-x-2.5">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`px-3.5 py-1.5 text-xs font-medium border ${borderColor} rounded-lg ${textSecondary} ${bgHover} transition-all duration-200 disabled:opacity-50`}
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
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing || 
                selectedEmployees.length === 0 || 
                (operationType === 'replace' && !selectedTagId) ||
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : operationType === 'replace'
                  ? 'bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white shadow-md hover:shadow-lg'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
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