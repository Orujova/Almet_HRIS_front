// src/components/headcount/TagManagementModal.jsx - ENHANCED with searchable dropdown
import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Search, Tag, Plus, Minus, Check, AlertCircle, ChevronDown } from 'lucide-react';

const TagManagementModal = ({
  isOpen,
  onClose,
  onAction,
  selectedEmployees = [],
  employeeTags = [],
  loading = false,
  darkMode = false
}) => {
  const [activeTab, setActiveTab] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagType, setSelectedTagType] = useState('ALL');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Theme classes
  const bgModal = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const bgDropdown = darkMode ? "bg-gray-700" : "bg-white";

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTags([]);
      setSearchTerm('');
      setActiveTab('add');
      setSelectedTagType('ALL');
      setDropdownOpen(false);
    }
  }, [isOpen]);

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

  // Filter tags based on search and type
  const filteredTags = useMemo(() => {
    if (!Array.isArray(employeeTags)) {
      console.warn('employeeTags is not an array:', employeeTags);
      return [];
    }

    let filtered = employeeTags;

    // Filter by type
    if (selectedTagType !== 'ALL') {
      filtered = filtered.filter(tag => tag.tag_type === selectedTagType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tag => 
        tag.name?.toLowerCase().includes(searchLower) ||
        tag.label?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [employeeTags, selectedTagType, searchTerm]);

  // Get unique tag types
  const tagTypes = useMemo(() => {
    if (!Array.isArray(employeeTags)) return [];
    
    const types = ['ALL'];
    const uniqueTypes = [...new Set(employeeTags.map(tag => tag.tag_type).filter(Boolean))];
    return types.concat(uniqueTypes);
  }, [employeeTags]);

  // Get selected tag objects
  const selectedTagObjects = useMemo(() => {
    return selectedTags.map(tagId => 
      employeeTags.find(tag => (tag.id || tag.value) === tagId)
    ).filter(Boolean);
  }, [selectedTags, employeeTags]);

  // Handle tag selection/deselection
  const handleTagSelect = (tag) => {
    const tagId = tag.id || tag.value;
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  // Remove selected tag
  const handleRemoveTag = (tagId) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  // Handle action execution
  const handleAction = async () => {
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
      const action = activeTab === 'add' ? 'addTags' : 'removeTags';
      await onAction(action, {
        employeeIds: selectedEmployees,
        tagIds: selectedTags
      });
      
      // Close modal on success
      onClose();
    } catch (error) {
      console.error('Tag action failed:', error);
      alert(`Failed to ${activeTab} tags: ${error.message}`);
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
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`p-2 rounded-lg ${bgHover} transition-colors disabled:opacity-50`}
          >
            <X className={`w-5 h-5 ${textSecondary}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`px-6 pt-4 border-b ${borderColor}`}>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'add'
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : `${textSecondary} ${bgHover}`
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Tags
            </button>
            <button
              onClick={() => setActiveTab('remove')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'remove'
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  : `${textSecondary} ${bgHover}`
              }`}
            >
              <Minus className="w-4 h-4 inline mr-2" />
              Remove Tags
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
         

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                Selected Tags ({selectedTags.length})
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedTagObjects.map((tag) => {
                  if (!tag) return null;
                  const tagId = tag.id || tag.value;
                  const tagName = tag.name || tag.label;
                  
                  return (
                    <div
                      key={`selected-${tagId}`}
                      className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: tag.color || '#6B7280' }}
                      />
                      <span>{tagName}</span>
                      <button
                        onClick={() => handleRemoveTag(tagId)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Searchable Dropdown */}
          <div className="mb-4" ref={dropdownRef}>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Search and Select Tags
            </label>
            <div className="relative">
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} cursor-pointer flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <Search className={`w-4 h-4 mr-2 ${textMuted}`} />
                  <input
                    type="text"
                    placeholder="Type to search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`bg-transparent outline-none flex-1 ${textPrimary}`}
                  />
                </div>
                <ChevronDown 
                  className={`w-4 h-4 ${textMuted} transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                />
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className={`absolute z-10 w-full mt-1 ${bgDropdown} border ${borderColor} rounded-lg shadow-lg max-h-64 overflow-y-auto`}>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className={textMuted}>Loading tags...</span>
                    </div>
                  ) : filteredTags.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Tag className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                      <p className={textMuted}>
                        {searchTerm ? 'No tags found matching your search' : 'No tags available'}
                      </p>
                    </div>
                  ) : (
                    filteredTags.map((tag) => {
                      const tagId = tag.id || tag.value;
                      const tagName = tag.name || tag.label;
                      const isSelected = selectedTags.includes(tagId);
                      
                      return (
                        <div
                          key={`dropdown-${tagId}`}
                          onClick={() => {
                            handleTagSelect(tag);
                            if (!isSelected) {
                              setDropdownOpen(false);
                              setSearchTerm('');
                            }
                          }}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/20' 
                              : bgHover
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-3"
                                style={{ backgroundColor: tag.color || '#6B7280' }}
                              />
                              <div>
                                <span className={`font-medium ${textPrimary}`}>
                                  {tagName}
                                </span>
                                {tag.tag_type && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 ${textMuted}`}>
                                    {tag.tag_type}
                                  </span>
                                )}
                                {tag.employee_count !== undefined && (
                                  <span className={`ml-2 text-xs ${textMuted}`}>
                                    ({tag.employee_count} employees)
                                  </span>
                                )}
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

          {/* No Data State */}
          {!loading && (!employeeTags || employeeTags.length === 0) && (
            <div className="text-center py-8">
              <Tag className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
              <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No Tags Available</h3>
              <p className={textMuted}>No tags have been created yet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            {selectedTags.length > 0 && (
              <span className={`text-sm ${textMuted}`}>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
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
              onClick={handleAction}
              disabled={isProcessing || selectedTags.length === 0}
              className={`px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === 'add'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                `${activeTab === 'add' ? 'Add' : 'Remove'} Tags`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagManagementModal;