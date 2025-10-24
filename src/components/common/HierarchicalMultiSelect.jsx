import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Check,
  Search,
  X,
  Package
} from 'lucide-react';

const HierarchicalMultiSelect = ({
  title,
  icon: Icon = Package,
  data = [],
  selectedIds = [],
  onChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No items available",
  darkMode = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedParents, setExpandedParents] = useState(new Set());
  const dropdownRef = React.useRef(null);

  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-mystic";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-almet-mystic/30";
  const bgHover = darkMode ? "bg-gray-600" : "bg-almet-mystic";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    return data.filter(parent => {
      const parentMatch = parent.name?.toLowerCase().includes(term);
      const childMatch = parent.items?.some(child => 
        child.name?.toLowerCase().includes(term) ||
        child.description?.toLowerCase().includes(term)
      );
      return parentMatch || childMatch;
    });
  }, [searchTerm, data]);

  // Auto-expand parents with matching children
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const term = searchTerm.toLowerCase();
    const newExpanded = new Set();
    
    filteredData.forEach(parent => {
      const hasMatchingChild = parent.items?.some(child =>
        child.name?.toLowerCase().includes(term) ||
        child.description?.toLowerCase().includes(term)
      );
      if (hasMatchingChild) {
        newExpanded.add(parent.id);
      }
    });
    
    setExpandedParents(newExpanded);
  }, [searchTerm, filteredData]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setSearchTerm('');
  };

  const toggleParentExpansion = (parentId) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  // Check if an ID is selected (normalize to string for comparison)
  const isIdSelected = (id) => {
    const strId = String(id);
    return selectedIds.some(selectedId => String(selectedId) === strId);
  };

  // Get count of selected children
  const getSelectedChildCount = (parent) => {
    if (!parent.items?.length) return 0;
    return parent.items.filter(item => isIdSelected(item.id)).length;
  };

  // Check if parent checkbox should be checked (all children selected)
  const isParentChecked = (parent) => {
    if (!parent.items?.length) return false;
    return parent.items.every(item => isIdSelected(item.id));
  };

  // Check if parent checkbox should be indeterminate (some children selected)
  const isParentIndeterminate = (parent) => {
    if (!parent.items?.length) return false;
    const selectedCount = getSelectedChildCount(parent);
    return selectedCount > 0 && selectedCount < parent.items.length;
  };

  // Handle parent checkbox toggle
  const handleParentToggle = (parent) => {
    const childIds = (parent.items || []).map(item => String(item.id));
    const allChildrenSelected = parent.items?.every(item => isIdSelected(item.id));
    
    console.log('🔘 Parent Toggle:', { 
      parentId: parent.id, 
      allChildrenSelected, 
      childIds,
      currentSelection: selectedIds 
    });

    if (allChildrenSelected) {
      // Remove all children
      const newSelection = selectedIds.filter(id => 
        !childIds.includes(String(id))
      );
      console.log('➖ Removing all children:', newSelection);
      onChange(newSelection);
    } else {
      // Add all children that aren't already selected
      const newSelection = [...selectedIds];
      childIds.forEach(childId => {
        if (!isIdSelected(childId)) {
          newSelection.push(childId);
        }
      });
      console.log('➕ Adding all children:', newSelection);
      onChange(newSelection);
    }
  };

  // Handle child checkbox toggle
  const handleChildToggle = (child) => {
    const childId = String(child.id);
    const isSelected = isIdSelected(child.id);
    
    console.log('🔘 Child Toggle:', { 
      childId, 
      isSelected,
      currentSelection: selectedIds 
    });

    if (isSelected) {
      // Remove this child
      const newSelection = selectedIds.filter(id => String(id) !== childId);
      console.log('➖ Removing child:', newSelection);
      onChange(newSelection);
    } else {
      // Add this child
      const newSelection = [...selectedIds, childId];
      console.log('➕ Adding child:', newSelection);
      onChange(newSelection);
    }
  };

  const handleClearAll = () => {
    console.log('🗑️ Clearing all selections');
    onChange([]);
  };

  const selectedCount = selectedIds.length;

  const getButtonText = () => {
    if (selectedCount === 0) {
      return `Select ${title}`;
    }
    return `${selectedCount} Selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs border ${borderColor} 
          rounded-md ${bgCard} ${textPrimary} hover:${bgHover} transition-all duration-200 focus:outline-none 
          focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire shadow-sm`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon size={14} className="flex-shrink-0 text-almet-sapphire" />
          <span className="truncate font-medium">{getButtonText()}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-almet-sapphire text-white">
              {selectedCount}
            </span>
          )}
          <ChevronDown 
            size={14} 
            className={`transition-transform duration-200 ${textMuted} ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1.5 border ${borderColor} rounded-md ${bgCard} shadow-lg`}>
          <div className={`p-2.5 border-b ${borderColor}`}>
            <div className="relative">
              <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={13} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full pl-8 pr-7 py-1.5 text-[11px] border ${borderColor} rounded ${bgCard} ${textPrimary} 
                  placeholder:${textMuted} focus:outline-none focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire transition-all`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${textMuted} hover:${textPrimary} transition-colors`}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {filteredData.length > 0 ? (
              <div className="p-1.5 space-y-1">
                {filteredData.map(parent => {
                  const isExpanded = expandedParents.has(parent.id);
                  const hasChildren = parent.items?.length > 0;
                  const parentChecked = isParentChecked(parent);
                  const parentIndeterminate = isParentIndeterminate(parent);
                  const selectedChildCount = getSelectedChildCount(parent);

                  return (
                    <div key={parent.id} className={`border ${borderColor} rounded overflow-hidden transition-all`}>
                      <div 
                        className={`flex items-center gap-2 p-2 cursor-pointer transition-all duration-150 ${
                          parentChecked || parentIndeterminate
                            ? 'bg-almet-sapphire/5 border-l-2 border-l-almet-sapphire' 
                            : `${bgAccent} hover:bg-opacity-50`
                        }`}
                      >
                        {hasChildren && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleParentExpansion(parent.id);
                            }}
                            className={`p-0.5 ${textMuted} hover:text-almet-sapphire transition-colors flex-shrink-0`}
                          >
                            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                          </button>
                        )}
                        
                        <div className="flex-shrink-0 relative">
                          <input
                            type="checkbox"
                            checked={parentChecked}
                            ref={(input) => {
                              if (input) {
                                input.indeterminate = parentIndeterminate;
                              }
                            }}
                            onChange={() => handleParentToggle(parent)}
                            className="w-3.5 h-3.5 text-almet-sapphire border-almet-bali-hai rounded focus:ring-almet-sapphire cursor-pointer accent-almet-sapphire"
                          />
                        </div>

                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => handleParentToggle(parent)}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] font-semibold ${textPrimary} truncate`}>
                              {parent.name}
                            </span>
                            {hasChildren && (
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${bgAccent} ${textMuted}`}>
                                {selectedChildCount > 0 ? `${selectedChildCount}/` : ''}{parent.items.length}
                              </span>
                            )}
                          </div>
                          {parent.description && (
                            <p className={`text-[10px] ${textMuted} truncate mt-0.5`}>
                              {parent.description}
                            </p>
                          )}
                        </div>

                        {parentChecked && (
                          <Check size={13} className="text-almet-sapphire flex-shrink-0" />
                        )}
                      </div>

                      {isExpanded && hasChildren && (
                        <div className={`border-t ${borderColor} ${bgAccent} p-1.5 space-y-0.5`}>
                          {parent.items.map(child => {
                            const childSelected = isIdSelected(child.id);

                            return (
                              <div
                                key={child.id}
                                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all duration-150 ${
                                  childSelected 
                                    ? 'bg-almet-sapphire/5 border border-almet-sapphire/20' 
                                    : `${bgCard} hover:${bgHover}`
                                }`}
                                onClick={() => handleChildToggle(child)}
                              >
                                <div className="ml-5 flex-shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={childSelected}
                                    onChange={() => handleChildToggle(child)}
                                    className="w-3 h-3 text-almet-sapphire border-almet-bali-hai rounded focus:ring-almet-sapphire cursor-pointer accent-almet-sapphire"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[11px] ${textPrimary} truncate`}>
                                      {child.name}
                                    </span>
                                  </div>
                                  {child.description && (
                                    <p className={`text-[10px] ${textMuted} truncate mt-0.5`}>
                                      {child.description}
                                    </p>
                                  )}
                                </div>

                                {childSelected && (
                                  <Check size={12} className="text-almet-sapphire flex-shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <Icon size={28} className={`mx-auto ${textMuted} mb-2`} />
                <p className={`text-[11px] ${textMuted}`}>
                  {searchTerm ? `No items found matching "${searchTerm}"` : emptyMessage}
                </p>
              </div>
            )}
          </div>

          {filteredData.length > 0 && selectedCount > 0 && (
            <div className={`p-2.5 border-t ${borderColor} ${bgAccent}`}>
              <div className="flex items-center justify-between text-[10px]">
                <span className={textSecondary}>
                  {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-red-500 hover:text-red-600 font-semibold transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HierarchicalMultiSelect;