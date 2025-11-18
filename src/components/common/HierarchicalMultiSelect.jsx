import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Check,
  Search,
  X,
  Package,
  CheckSquare,
  Square
} from 'lucide-react';

const HierarchicalMultiSelect = ({
  title,
  icon: Icon = Package,
  data = [],
  selectedIds = [],
  onChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No items available",
  darkMode = false,
  idPrefix = '' // 🔥 NEW: Prefix to make IDs unique across different dropdowns
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedParents, setExpandedParents] = useState(new Set());
  const [expandedChildren, setExpandedChildren] = useState(new Set());
  const dropdownRef = React.useRef(null);

  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-mystic";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-almet-mystic/30";
  const bgHover = darkMode ? "bg-gray-600" : "bg-almet-mystic";

  // 🔥 Helper functions to add/remove prefix from IDs
  const addPrefix = (id) => {
    if (!idPrefix) return String(id);
    return `${idPrefix}_${id}`;
  };

  const removePrefix = (id) => {
    if (!idPrefix) return String(id);
    const strId = String(id);
    if (strId.startsWith(`${idPrefix}_`)) {
      return strId.replace(`${idPrefix}_`, '');
    }
    return strId;
  };

  const hasPrefix = (id) => {
    if (!idPrefix) return true;
    return String(id).startsWith(`${idPrefix}_`);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
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

  // 🔥 Detect if data has 3 levels
  const hasThreeLevels = React.useMemo(() => {
    if (!data || data.length === 0) return false;
    
    const firstParent = data[0];
    if (!firstParent || !firstParent.items || firstParent.items.length === 0) return false;
    
    const firstChild = firstParent.items[0];
    return firstChild && Array.isArray(firstChild.items);
  }, [data]);

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    
    if (hasThreeLevels) {
      return data.map(mainGroup => {
        const mainGroupMatch = mainGroup.name?.toLowerCase().includes(term);
        
        const filteredChildGroups = (mainGroup.items || []).map(childGroup => {
          const childGroupMatch = childGroup.name?.toLowerCase().includes(term);
          
          const filteredItems = (childGroup.items || []).filter(item =>
            item.name?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
          
          if (childGroupMatch || filteredItems.length > 0) {
            return {
              ...childGroup,
              items: childGroupMatch ? childGroup.items : filteredItems
            };
          }
          return null;
        }).filter(Boolean);
        
        if (mainGroupMatch || filteredChildGroups.length > 0) {
          return {
            ...mainGroup,
            items: mainGroupMatch ? mainGroup.items : filteredChildGroups
          };
        }
        return null;
      }).filter(Boolean);
    } else {
      return data.filter(parent => {
        const parentMatch = parent.name?.toLowerCase().includes(term);
        const childMatch = parent.items?.some(child => 
          child.name?.toLowerCase().includes(term) ||
          child.description?.toLowerCase().includes(term)
        );
        return parentMatch || childMatch;
      });
    }
  }, [searchTerm, data, hasThreeLevels]);

  // Auto-expand parents/children with matching items
  React.useEffect(() => {
    if (!searchTerm.trim()) return;

    const term = searchTerm.toLowerCase();
    const newExpandedParents = new Set();
    const newExpandedChildren = new Set();
    
    if (hasThreeLevels) {
      filteredData.forEach(mainGroup => {
        (mainGroup.items || []).forEach(childGroup => {
          const hasMatchingItem = (childGroup.items || []).some(item =>
            item.name?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
          
          if (hasMatchingItem || childGroup.name?.toLowerCase().includes(term)) {
            newExpandedParents.add(mainGroup.id);
            newExpandedChildren.add(`${mainGroup.id}-${childGroup.id}`);
          }
        });
        
        if (mainGroup.name?.toLowerCase().includes(term)) {
          newExpandedParents.add(mainGroup.id);
        }
      });
    } else {
      filteredData.forEach(parent => {
        const hasMatchingChild = parent.items?.some(child =>
          child.name?.toLowerCase().includes(term) ||
          child.description?.toLowerCase().includes(term)
        );
        if (hasMatchingChild) {
          newExpandedParents.add(parent.id);
        }
      });
    }
    
    setExpandedParents(newExpandedParents);
    setExpandedChildren(newExpandedChildren);
  }, [searchTerm, filteredData, hasThreeLevels]);

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

  const toggleChildExpansion = (parentId, childId) => {
    const key = `${parentId}-${childId}`;
    setExpandedChildren(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // 🔥 Check if ID is selected (with prefix support)
  const isIdSelected = (id) => {
    const prefixedId = addPrefix(id);
    return selectedIds.some(selectedId => String(selectedId) === prefixedId);
  };

  // 🔥 Get all item IDs from entire data structure
  const getAllAvailableItemIds = () => {
    const ids = [];
    
    if (hasThreeLevels) {
      filteredData.forEach(mainGroup => {
        (mainGroup.items || []).forEach(childGroup => {
          (childGroup.items || []).forEach(item => {
            ids.push(addPrefix(item.id));
          });
        });
      });
    } else {
      filteredData.forEach(parent => {
        (parent.items || []).forEach(item => {
          ids.push(addPrefix(item.id));
        });
      });
    }
    
    return ids;
  };

  // Get all item IDs from a structure
  const getAllItemIds = (parent) => {
    const ids = [];
    
    if (hasThreeLevels) {
      (parent.items || []).forEach(childGroup => {
        (childGroup.items || []).forEach(item => {
          ids.push(addPrefix(item.id));
        });
      });
    } else {
      (parent.items || []).forEach(item => {
        ids.push(addPrefix(item.id));
      });
    }
    
    return ids;
  };

  // Get all item IDs from a child group
  const getChildGroupItemIds = (childGroup) => {
    return (childGroup.items || []).map(item => addPrefix(item.id));
  };

  const isParentChecked = (parent) => {
    const itemIds = getAllItemIds(parent);
    if (itemIds.length === 0) return isIdSelected(parent.id);
    return itemIds.every(id => selectedIds.some(selectedId => String(selectedId) === id));
  };

  const isParentIndeterminate = (parent) => {
    const itemIds = getAllItemIds(parent);
    if (itemIds.length === 0) return false;
    
    const selectedCount = itemIds.filter(id => 
      selectedIds.some(selectedId => String(selectedId) === id)
    ).length;
    return selectedCount > 0 && selectedCount < itemIds.length;
  };

  const isChildGroupChecked = (childGroup) => {
    const itemIds = getChildGroupItemIds(childGroup);
    if (itemIds.length === 0) return false;
    return itemIds.every(id => selectedIds.some(selectedId => String(selectedId) === id));
  };

  const isChildGroupIndeterminate = (childGroup) => {
    const itemIds = getChildGroupItemIds(childGroup);
    if (itemIds.length === 0) return false;
    
    const selectedCount = itemIds.filter(id => 
      selectedIds.some(selectedId => String(selectedId) === id)
    ).length;
    return selectedCount > 0 && selectedCount < itemIds.length;
  };

  const areAllItemsSelected = () => {
    const allIds = getAllAvailableItemIds();
    if (allIds.length === 0) return false;
    return allIds.every(id => selectedIds.some(selectedId => String(selectedId) === id));
  };

  const areSomeItemsSelected = () => {
    const allIds = getAllAvailableItemIds();
    if (allIds.length === 0) return false;
    const selectedCount = allIds.filter(id => 
      selectedIds.some(selectedId => String(selectedId) === id)
    ).length;
    return selectedCount > 0 && selectedCount < allIds.length;
  };

  // Handle parent toggle
  const handleParentToggle = (parent) => {
    const itemIds = getAllItemIds(parent);
    
    if (itemIds.length === 0) {
      const prefixedParentId = addPrefix(parent.id);
      const isSelected = isIdSelected(parent.id);

      if (isSelected) {
        onChange(selectedIds.filter(id => String(id) !== prefixedParentId));
      } else {
        onChange([...selectedIds, prefixedParentId]);
      }
    } else {
      const allSelected = itemIds.every(id => 
        selectedIds.some(selectedId => String(selectedId) === id)
      );

      if (allSelected) {
        onChange(selectedIds.filter(id => !itemIds.includes(String(id))));
      } else {
        const newSelection = [...selectedIds];
        itemIds.forEach(itemId => {
          if (!selectedIds.some(selectedId => String(selectedId) === itemId)) {
            newSelection.push(itemId);
          }
        });
        onChange(newSelection);
      }
    }
  };

  // Handle child group toggle
  const handleChildGroupToggle = (childGroup) => {
    const itemIds = getChildGroupItemIds(childGroup);
    if (itemIds.length === 0) return;

    const allSelected = itemIds.every(id => 
      selectedIds.some(selectedId => String(selectedId) === id)
    );

    if (allSelected) {
      onChange(selectedIds.filter(id => !itemIds.includes(String(id))));
    } else {
      const newSelection = [...selectedIds];
      itemIds.forEach(itemId => {
        if (!selectedIds.some(selectedId => String(selectedId) === itemId)) {
          newSelection.push(itemId);
        }
      });
      onChange(newSelection);
    }
  };

  // Handle item toggle
  const handleItemToggle = (item) => {
    const prefixedItemId = addPrefix(item.id);
    const isSelected = isIdSelected(item.id);

    if (isSelected) {
      onChange(selectedIds.filter(id => String(id) !== prefixedItemId));
    } else {
      onChange([...selectedIds, prefixedItemId]);
    }
  };

  // Handle Select All
  const handleSelectAll = () => {
    const allIds = getAllAvailableItemIds();
    
    if (areAllItemsSelected()) {
      onChange(selectedIds.filter(id => !allIds.includes(String(id))));
    } else {
      const newSelection = [...selectedIds];
      allIds.forEach(itemId => {
        if (!selectedIds.some(selectedId => String(selectedId) === itemId)) {
          newSelection.push(itemId);
        }
      });
      onChange(newSelection);
    }
  };

  const handleClearAll = () => {
    // 🔥 Only clear items with this component's prefix
    if (idPrefix) {
      onChange(selectedIds.filter(id => !hasPrefix(id)));
    } else {
      onChange([]);
    }
  };

  // 🔥 Count only items with correct prefix
  const selectedCount = idPrefix 
    ? selectedIds.filter(id => hasPrefix(id)).length
    : selectedIds.length;

  const allItemsSelected = areAllItemsSelected();

  const getButtonText = () => {
    if (selectedCount === 0) {
      return `Select ${title}`;
    }
    return `${selectedCount} Selected`;
  };

  // Render 3-level structure
  const renderThreeLevel = () => {
    return filteredData.map(mainGroup => {
      const isMainExpanded = expandedParents.has(mainGroup.id);
      const mainChecked = isParentChecked(mainGroup);
      const mainIndeterminate = isParentIndeterminate(mainGroup);
      const totalItems = getAllItemIds(mainGroup).length;
      const selectedItems = getAllItemIds(mainGroup).filter(id => 
        selectedIds.some(selectedId => String(selectedId) === id)
      ).length;

      return (
        <div key={mainGroup.id} className={`border ${borderColor} rounded overflow-hidden transition-all`}>
          <div 
            className={`flex items-center gap-2 p-2 cursor-pointer transition-all duration-150 ${
              mainChecked || mainIndeterminate
                ? 'bg-purple-500/5 border-l-2 border-l-purple-500' 
                : `${bgAccent} hover:bg-opacity-50`
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleParentExpansion(mainGroup.id);
              }}
              className={`p-0.5 ${textMuted} hover:text-purple-500 transition-colors flex-shrink-0`}
            >
              {isMainExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
            
            <div 
              className="flex-shrink-0 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={mainChecked}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = mainIndeterminate;
                  }
                }}
                onChange={() => handleParentToggle(mainGroup)}
                className="w-3.5 h-3.5 text-purple-600 border-almet-bali-hai rounded focus:ring-purple-500 cursor-pointer accent-purple-600"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold ${textPrimary} truncate`}>
                  {mainGroup.name}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${bgAccent} ${textMuted}`}>
                  {selectedItems > 0 ? `${selectedItems}/` : ''}{totalItems}
                </span>
              </div>
              {mainGroup.description && (
                <p className={`text-[10px] ${textMuted} truncate mt-0.5`}>
                  {mainGroup.description}
                </p>
              )}
            </div>

            {mainChecked && (
              <Check size={13} className="text-purple-600 flex-shrink-0" />
            )}
          </div>

          {isMainExpanded && (mainGroup.items || []).length > 0 && (
            <div className={`border-t ${borderColor} ${bgAccent} p-1.5 space-y-1`}>
              {(mainGroup.items || []).map(childGroup => {
                const childKey = `${mainGroup.id}-${childGroup.id}`;
                const isChildExpanded = expandedChildren.has(childKey);
                const childChecked = isChildGroupChecked(childGroup);
                const childIndeterminate = isChildGroupIndeterminate(childGroup);
                const childItems = getChildGroupItemIds(childGroup);
                const selectedChildItems = childItems.filter(id => 
                  selectedIds.some(selectedId => String(selectedId) === id)
                ).length;

                return (
                  <div key={childGroup.id} className={`border ${borderColor} rounded overflow-hidden`}>
                    <div 
                      className={`flex items-center gap-2 p-1.5 cursor-pointer transition-all duration-150 ${
                        childChecked || childIndeterminate
                          ? 'bg-almet-sapphire/5 border-l-2 border-l-almet-sapphire' 
                          : `${bgCard} hover:${bgHover}`
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChildExpansion(mainGroup.id, childGroup.id);
                        }}
                        className={`ml-3 p-0.5 ${textMuted} hover:text-almet-sapphire transition-colors flex-shrink-0`}
                      >
                        {isChildExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                      
                      <div 
                        className="flex-shrink-0 relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={childChecked}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = childIndeterminate;
                            }
                          }}
                          onChange={() => handleChildGroupToggle(childGroup)}
                          className="w-3 h-3 text-almet-sapphire border-almet-bali-hai rounded focus:ring-almet-sapphire cursor-pointer accent-almet-sapphire"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-semibold ${textPrimary} truncate`}>
                            {childGroup.name}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${bgAccent} ${textMuted}`}>
                            {selectedChildItems > 0 ? `${selectedChildItems}/` : ''}{childItems.length}
                          </span>
                        </div>
                      </div>

                      {childChecked && (
                        <Check size={12} className="text-almet-sapphire flex-shrink-0" />
                      )}
                    </div>

                    {isChildExpanded && (childGroup.items || []).length > 0 && (
                      <div className={`border-t ${borderColor} ${bgAccent} p-1 space-y-0.5`}>
                        {(childGroup.items || []).map(item => {
                          const itemSelected = isIdSelected(item.id);

                          return (
                            <div
                              key={item.id}
                              className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all duration-150 ${
                                itemSelected 
                                  ? 'bg-almet-sapphire/5 border border-almet-sapphire/20' 
                                  : `${bgCard} hover:${bgHover}`
                              }`}
                              onClick={() => handleItemToggle(item)}
                            >
                              <div className="ml-8 flex-shrink-0">
                                <input
                                  type="checkbox"
                                  checked={itemSelected}
                                  onChange={() => handleItemToggle(item)}
                                  className="w-2.5 h-2.5 text-almet-sapphire border-almet-bali-hai rounded focus:ring-almet-sapphire cursor-pointer accent-almet-sapphire"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <span className={`text-[10px] ${textPrimary} truncate block`}>
                                  {item.name}
                                </span>
                                {item.description && (
                                  <p className={`text-[9px] ${textMuted} truncate mt-0.5`}>
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              {itemSelected && (
                                <Check size={11} className="text-almet-sapphire flex-shrink-0" />
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
          )}
        </div>
      );
    });
  };

  // Render 2-level structure
  const renderTwoLevel = () => {
    return filteredData.map(parent => {
      const isExpanded = expandedParents.has(parent.id);
      const hasChildren = parent.items?.length > 0;
      const parentChecked = isParentChecked(parent);
      const parentIndeterminate = isParentIndeterminate(parent);
      const selectedChildCount = hasChildren 
        ? parent.items.filter(item => isIdSelected(item.id)).length 
        : 0;

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
            
            <div 
              className="flex-shrink-0 relative"
              onClick={(e) => e.stopPropagation()}
            >
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

            <div className="flex-1 min-w-0">
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
                    onClick={() => handleItemToggle(child)}
                  >
                    <div className="ml-5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={childSelected}
                        onChange={() => handleItemToggle(child)}
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
    });
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
                {hasThreeLevels ? renderThreeLevel() : renderTwoLevel()}
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

          {filteredData.length > 0 && (
            <div className={`p-2.5 border-t ${borderColor} ${bgAccent}`}>
              <div className="flex items-center justify-between gap-3 text-[10px]">
                <div className="flex items-center gap-2">
                  {/* Select All Button */}
                  <button
                    onClick={handleSelectAll}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded ${
                      allItemsSelected 
                        ? 'bg-almet-sapphire text-white hover:bg-almet-astral' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    } font-semibold transition-colors`}
                  >
                    {allItemsSelected ? (
                      <>
                        <CheckSquare size={12} />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <Square size={12} />
                        <span>Select All</span>
                      </>
                    )}
                  </button>
                  
                  {selectedCount > 0 && (
                    <span className={textSecondary}>
                      {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
                
                {selectedCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-red-500 hover:text-red-600 font-semibold transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
 
export default HierarchicalMultiSelect;