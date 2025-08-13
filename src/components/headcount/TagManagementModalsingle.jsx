// MODERN DESIGN VERSION - Updated with Almet Colors & Compact Layout
"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { X, Search, Tag, Plus, Minus, CheckCircle, AlertTriangle, Hash, ChevronDown, Check } from "lucide-react";

const TagManagementModal = ({
  isOpen,
  onClose,
  employee,
  availableTags = [],
  onTagOperation,
  loading = { add: false, remove: false },
  darkMode = false
}) => {
  const [selectedOperation, setSelectedOperation] = useState("add");
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  
  const dropdownRef = useRef(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOperation("add");
      setShowConfirmation(false);
      setIsDropdownOpen(false);
      setSearchTerm("");
      setSelectedTag(null);
    }
  }, [isOpen]);

  // Better current tags extraction with multiple fallbacks
  const currentTagNames = useMemo(() => {
    const names = new Set();
    
    const tagSources = [
      employee?.tag_names,
      employee?.tags,
      employee?.tagNames,
      employee?.tag_list,
      employee?.assigned_tags,
      employee?.employee_tags
    ];
    
    tagSources.forEach(source => {
      if (Array.isArray(source)) {
        source.forEach(item => {
          if (typeof item === 'string' && item.trim()) {
            names.add(item.trim().toLowerCase());
          } else if (item && typeof item === 'object') {
            const tagName = item.name || item.tag_name || item.label || item.title || item.value;
            if (tagName && typeof tagName === 'string') {
              names.add(tagName.trim().toLowerCase());
            }
          }
        });
      } else if (typeof source === 'string' && source.trim()) {
        source.split(',').forEach(tag => {
          const cleanTag = tag.trim();
          if (cleanTag) {
            names.add(cleanTag.toLowerCase());
          }
        });
      }
    });
    
    return Array.from(names);
  }, [employee]);

  // Corrected dropdown tags logic
  const dropdownTags = useMemo(() => {
    let validTags = [];
    
    if (Array.isArray(availableTags)) {
      validTags = availableTags.filter(tag => {
        if (!tag || typeof tag !== 'object') return false;
        
        const tagId = tag.id || tag.tag_id || tag.value;
        const tagName = tag.name || tag.tag_name || tag.label;
        
        return tagId && 
               tagName &&
               tagName !== null && 
               tagName !== undefined &&
               tagName.toString().trim() !== '';
      });
    }
    
    let filteredTags = [];
    
    if (selectedOperation === "add") {
      filteredTags = validTags.filter(tag => {
        const tagName = (tag.name || tag.tag_name || tag.label).toString().trim().toLowerCase();
        return !currentTagNames.includes(tagName);
      });
    } else {
      filteredTags = validTags.filter(tag => {
        const tagName = (tag.name || tag.tag_name || tag.label).toString().trim().toLowerCase();
        return currentTagNames.includes(tagName);
      });
    }

    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filteredTags = filteredTags.filter(tag => {
        const tagName = (tag.name || tag.tag_name || tag.label).toString().toLowerCase();
        return tagName.includes(search);
      });
    }

    return filteredTags;
  }, [availableTags, currentTagNames, selectedOperation, searchTerm]);

  // Handle dropdown toggle
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle tag selection
  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  // Execute operation
  const handleExecuteOperation = () => {
    if (!selectedTag) {
      alert("Please select a valid tag first.");
      return;
    }
    
    const tagId = selectedTag.id || selectedTag.tag_id || selectedTag.value;
    if (!tagId) {
      alert("Selected tag does not have a valid ID.");
      return;
    }
    
    setShowConfirmation(true);
  };

  // Confirm operation
  const confirmOperation = () => {
    if (selectedTag) {
      const tagId = selectedTag.id || selectedTag.tag_id || selectedTag.value;
      onTagOperation(selectedOperation, tagId);
      setShowConfirmation(false);
      setSelectedTag(null);
    }
  };

  // Handle close
  const handleClose = () => {
    if (loading.add || loading.remove) return;
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = loading.add || loading.remove;

  // Count available tags for each operation
  const addableTagsCount = availableTags.filter(tag => {
    if (!tag) return false;
    const tagName = (tag.name || tag.tag_name || tag.label);
    if (!tagName) return false;
    const normalizedName = tagName.toString().trim().toLowerCase();
    return !currentTagNames.includes(normalizedName);
  }).length;

  const removableTagsCount = currentTagNames.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-50">
      <div className={`${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'} 
        rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden border`}>
        
        {/* Header */}
        <div className={`px-5 py-4 border-b ${darkMode ? 'border-gray-700 bg-gradient-to-r from-almet-cloud-burst to-almet-san-juan' : 'border-almet-mystic bg-gradient-to-r from-almet-mystic to-white'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                Tag Management
              </h3>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-300' : 'text-almet-waterloo'}`}>
                {employee?.name || employee?.employee_name || `Employee ${employee?.id}`}
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`p-1.5 rounded-full transition-colors ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-almet-cloud-burst/10'
              }`}
              disabled={isLoading}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
          
          {/* Current Tags Display */}
          <div className={`p-3 rounded-lg border ${
            darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-almet-mystic bg-almet-mystic/30'
          }`}>
            <div className="flex items-center mb-2">
              <Tag size={14} className={`mr-2 ${darkMode ? 'text-gray-400' : 'text-almet-waterloo'}`} />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-almet-cloud-burst'}`}>
                Current Tags ({currentTagNames.length})
              </span>
            </div>
            {currentTagNames.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {currentTagNames.map((tagName, index) => (
                  <span 
                    key={index}
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                      darkMode 
                        ? 'bg-almet-sapphire/20 text-almet-astral border border-almet-sapphire/30' 
                        : 'bg-almet-sapphire/10 text-almet-sapphire border border-almet-sapphire/20'
                    }`}
                  >
                    <Hash size={10} className="mr-1" />
                    {tagName}
                  </span>
                ))}
              </div>
            ) : (
              <p className={`text-xs italic ${darkMode ? 'text-gray-400' : 'text-almet-waterloo'}`}>
                No tags assigned
              </p>
            )}
          </div>

          {/* Operation Selection */}
          <div>
            <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-almet-comet'}`}>
              Choose Operation
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedOperation("add");
                  setSelectedTag(null);
                  setSearchTerm("");
                  setIsDropdownOpen(false);
                }}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedOperation === "add"
                    ? darkMode 
                      ? 'border-green-500 bg-green-500/10 shadow-sm' 
                      : 'border-green-500 bg-green-50 shadow-sm'
                    : darkMode
                      ? 'border-gray-600 hover:border-green-400/50'
                      : 'border-almet-mystic hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <Plus size={16} className={`${
                    selectedOperation === "add" 
                      ? 'text-green-500' 
                      : darkMode ? 'text-gray-400' : 'text-almet-waterloo'
                  }`} />
                </div>
                <div className={`text-xs font-medium ${
                  selectedOperation === "add" 
                    ? darkMode ? 'text-green-400' : 'text-green-700'
                    : darkMode ? 'text-gray-300' : 'text-almet-comet'
                }`}>
                  Add Tag
                </div>
                <p className={`text-xs mt-0.5 ${
                  selectedOperation === "add" 
                    ? 'text-green-500' 
                    : darkMode ? 'text-gray-500' : 'text-almet-waterloo'
                }`}>
                  {addableTagsCount} available
                </p>
              </button>
              
              <button
                onClick={() => {
                  setSelectedOperation("remove");
                  setSelectedTag(null);
                  setSearchTerm("");
                  setIsDropdownOpen(false);
                }}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedOperation === "remove"
                    ? darkMode 
                      ? 'border-red-500 bg-red-500/10 shadow-sm' 
                      : 'border-red-500 bg-red-50 shadow-sm'
                    : darkMode
                      ? 'border-gray-600 hover:border-red-400/50'
                      : 'border-almet-mystic hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <Minus size={16} className={`${
                    selectedOperation === "remove" 
                      ? 'text-red-500' 
                      : darkMode ? 'text-gray-400' : 'text-almet-waterloo'
                  }`} />
                </div>
                <div className={`text-xs font-medium ${
                  selectedOperation === "remove" 
                    ? darkMode ? 'text-red-400' : 'text-red-700'
                    : darkMode ? 'text-gray-300' : 'text-almet-comet'
                }`}>
                  Remove Tag
                </div>
                <p className={`text-xs mt-0.5 ${
                  selectedOperation === "remove" 
                    ? 'text-red-500' 
                    : darkMode ? 'text-gray-500' : 'text-almet-waterloo'
                }`}>
                  {removableTagsCount} assigned
                </p>
              </button>
            </div>
          </div>

          {/* Tag Selection Dropdown */}
          <div>
            <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-almet-comet'}`}>
              Select Tag to {selectedOperation === "add" ? "Add" : "Remove"}
            </label>
            
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Button */}
              <button
                onClick={handleDropdownToggle}
                className={`w-full px-3 py-2.5 border-2 rounded-lg text-left flex items-center justify-between transition-all text-sm ${
                  isDropdownOpen 
                    ? darkMode 
                      ? 'border-almet-astral ring-2 ring-almet-astral/20' 
                      : 'border-almet-astral ring-2 ring-almet-astral/20'
                    : darkMode
                      ? 'border-gray-600 hover:border-almet-astral/50 bg-gray-800'
                      : 'border-almet-mystic hover:border-almet-astral bg-white'
                } cursor-pointer`}
                type="button"
              >
                <div className="flex items-center flex-1 min-w-0">
                  {selectedTag ? (
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full mr-2 ${
                        darkMode 
                          ? 'bg-almet-sapphire/20 text-almet-astral border border-almet-sapphire/30' 
                          : 'bg-almet-sapphire/10 text-almet-sapphire border border-almet-sapphire/20'
                      }`}>
                        <Hash size={8} className="mr-1" />
                        {selectedTag.name || selectedTag.tag_name || selectedTag.label}
                      </span>
                    </div>
                  ) : (
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-almet-waterloo'}`}>
                      Select to {selectedOperation} ({dropdownTags.length} available)
                    </span>
                  )}
                </div>
                <ChevronDown size={16} className={`transform transition-transform ${
                  darkMode ? 'text-almet-astral' : 'text-almet-sapphire'
                } ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {isDropdownOpen && (
                <div 
                  className={`absolute bottom-full left-0 right-0 mb-1 border-2 rounded-lg shadow-xl overflow-hidden ${
                    darkMode 
                      ? 'bg-gray-800 border-almet-astral/50' 
                      : 'bg-white border-almet-astral/30'
                  }`}
                  style={{ zIndex: 9999 }}
                >
                  {/* Search */}
                  <div className={`p-3 border-b ${
                    darkMode 
                      ? 'bg-almet-cloud-burst/20 border-gray-700' 
                      : 'bg-almet-mystic/50 border-almet-mystic'
                  }`}>
                    <div className="relative">
                      <Search size={14} className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${
                        darkMode ? 'text-gray-400' : 'text-almet-waterloo'
                      }`} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tags..."
                        className={`w-full pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-almet-astral/50 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-almet-mystic text-gray-900 placeholder-almet-waterloo'
                        }`}
                        autoFocus
                      />
                    </div>
                    <div className={`mt-1 text-xs ${
                      darkMode ? 'text-almet-astral' : 'text-almet-sapphire'
                    }`}>
                      {dropdownTags.length} tag{dropdownTags.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Tag List */}
                  <div className="max-h-48 overflow-y-auto">
                    {dropdownTags.length === 0 ? (
                      <div className="p-4 text-center">
                        <Hash size={20} className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-almet-waterloo'}`} />
                        <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-almet-waterloo'}`}>
                          {selectedOperation === "add" 
                            ? (addableTagsCount === 0 ? "All tags are assigned" : "No matching tags")
                            : (removableTagsCount === 0 ? "No tags assigned" : "No matching assigned tags")
                          }
                        </p>
                        {((selectedOperation === "add" && addableTagsCount === 0) || (selectedOperation === "remove" && removableTagsCount === 0)) && (
                          <button
                            onClick={() => {
                              setSelectedOperation(selectedOperation === "add" ? "remove" : "add");
                              setIsDropdownOpen(false);
                              setSearchTerm("");
                            }}
                            className={`text-xs underline ${
                              darkMode ? 'text-almet-astral hover:text-blue-400' : 'text-almet-sapphire hover:text-almet-astral'
                            }`}
                          >
                            Switch to {selectedOperation === "add" ? "Remove" : "Add"}
                          </button>
                        )}
                      </div>
                    ) : (
                      dropdownTags.map((tag, index) => {
                        const tagId = tag.id || tag.tag_id || tag.value;
                        const tagName = tag.name || tag.tag_name || tag.label;
                        const selectedTagId = selectedTag?.id || selectedTag?.tag_id || selectedTag?.value;
                        
                        return (
                          <button
                            key={tagId || index}
                            onClick={() => handleTagSelect(tag)}
                            className={`w-full px-3 py-2 text-left border-b last:border-b-0 transition-colors ${
                              darkMode 
                                ? 'hover:bg-almet-cloud-burst/20 border-gray-700' 
                                : 'hover:bg-almet-mystic/30 border-almet-mystic'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full mr-2 ${
                                  darkMode 
                                    ? 'bg-almet-sapphire/20 text-almet-astral border border-almet-sapphire/30' 
                                    : 'bg-almet-sapphire/10 text-almet-sapphire border border-almet-sapphire/20'
                                }`}>
                                  <Hash size={8} className="mr-1" />
                                  {tagName}
                                </span>
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-almet-waterloo'}`}>
                                  {tag.tag_type || tag.type || 'OTHER'}
                                </span>
                              </div>
                              {selectedTagId === tagId && (
                                <Check size={14} className="text-green-500" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Tag Display */}
          {selectedTag && (
            <div className={`p-3 rounded-lg border-2 ${
              darkMode 
                ? 'border-green-500/30 bg-green-500/10' 
                : 'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-green-400' : 'text-green-800'
                }`}>
                  Selected: {selectedTag.name || selectedTag.tag_name || selectedTag.label}
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-red-500 underline hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-almet-mystic bg-almet-mystic/20'
        }`}>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleClose}
              className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                darkMode 
                  ? 'border-gray-600 hover:bg-gray-700' 
                  : 'border-almet-mystic hover:bg-almet-mystic/50'
              }`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteOperation}
              disabled={!selectedTag || isLoading}
              className={`px-4 py-1.5 text-xs rounded-lg text-white font-medium transition-colors ${
                selectedOperation === "add" 
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400' 
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
              } disabled:cursor-not-allowed`}
            >
              {isLoading ? "Processing..." : `${selectedOperation === "add" ? "Add" : "Remove"} Tag`}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedTag && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className={`rounded-2xl shadow-2xl max-w-sm w-full p-5 ${
            darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-almet-mystic'
          }`}>
            <div className="flex items-center mb-3">
              <AlertTriangle size={20} className="text-orange-500 mr-2" />
              <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                Confirm Action
              </h3>
            </div>
            <p className={`text-xs mb-4 ${darkMode ? 'text-gray-300' : 'text-almet-comet'}`}>
              {selectedOperation === "add" ? "Add" : "Remove"} tag "{selectedTag.name || selectedTag.tag_name || selectedTag.label}" {selectedOperation === "add" ? "to" : "from"} {employee?.name || employee?.employee_name}?
            </p>
            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                  darkMode 
                    ? 'border-gray-600 hover:bg-gray-700' 
                    : 'border-almet-mystic hover:bg-almet-mystic/50'
                }`}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmOperation}
                disabled={isLoading}
                className={`px-3 py-1.5 text-xs rounded-lg text-white transition-colors ${
                  selectedOperation === "add" ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {isLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManagementModal;