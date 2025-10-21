// components/jobDescription/WorkConditionsTab.jsx - FIXED: Store IDs instead of names
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Shield, 
  Package, 
  Gift,
  Check,
  Search,
  X,
  AlertCircle,
  Info
} from 'lucide-react';

const WorkConditionsTab = ({
  formData,
  dropdownData,
  onFormDataChange,
  darkMode
}) => {
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";
  const bgHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";

  // Search states
  const [searchTerms, setSearchTerms] = useState({
    resources: '',
    access: '',
    benefits: ''
  });

  // Expanded items tracking
  const [expandedParents, setExpandedParents] = useState({
    resources: new Set(),
    access: new Set(),
    benefits: new Set()
  });

  // Toggle parent expansion
  const toggleParentExpansion = (category, parentId) => {
    setExpandedParents(prev => {
      const newExpanded = { ...prev };
      const categorySet = new Set(newExpanded[category]);
      
      if (categorySet.has(parentId)) {
        categorySet.delete(parentId);
      } else {
        categorySet.add(parentId);
      }
      
      newExpanded[category] = categorySet;
      return newExpanded;
    });
  };

 

  // FIXED: Check if parent or any children are selected
  const isParentSelected = (parent, selectedIds) => {
    // Check parent ID
    if (isItemSelected(parent.id, selectedIds)) {
      return true;
    }
    
    // Check if any child items are selected
    if (parent.items && parent.items.length > 0) {
      return parent.items.some(item => isItemSelected(item.id, selectedIds));
    }
    
    return false;
  };

  // FIXED: Handle parent selection (stores IDs)
  const handleParentToggle = (parent, fieldName) => {
    const isSelected = isParentSelected(parent, formData[fieldName]);
    
    if (isSelected) {
      // Deselect parent and all children
      const idsToRemove = [String(parent.id)];
      if (parent.items && parent.items.length > 0) {
        parent.items.forEach(item => idsToRemove.push(String(item.id)));
      }
      
      onFormDataChange(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter(id => 
          !idsToRemove.includes(String(id))
        )
      }));
    } else {
      // Select parent and all children
      const idsToAdd = [String(parent.id)];
      if (parent.items && parent.items.length > 0) {
        parent.items.forEach(item => idsToAdd.push(String(item.id)));
      }
      
      onFormDataChange(prev => ({
        ...prev,
        [fieldName]: [...new Set([...prev[fieldName], ...idsToAdd])]
      }));
    }
  };

  
const handleChildToggle = (childId, fieldName) => {

  
  const isSelected = isItemSelected(childId, formData[fieldName]);

  
  if (isSelected) {
    // Deselecting
    const newSelection = formData[fieldName].filter(id => String(id) !== String(childId));

    
    onFormDataChange(prev => ({
      ...prev,
      [fieldName]: newSelection
    }));
  } else {
    // Selecting
    const newSelection = [...formData[fieldName], String(childId)];

    
    onFormDataChange(prev => ({
      ...prev,
      [fieldName]: newSelection
    }));
  }
};

// Also add debug to isItemSelected:
const isItemSelected = (itemId, selectedIds) => {
  const result = selectedIds.includes(String(itemId)) || selectedIds.includes(itemId);

  return result;
};

  // Filter items based on search
  const filterItems = (items, searchTerm) => {
    if (!searchTerm.trim()) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      const parentMatch = item.name?.toLowerCase().includes(term);
      const childMatch = item.items?.some(child => 
        child.name?.toLowerCase().includes(term)
      );
      
      return parentMatch || childMatch;
    });
  };

  // Get filtered items
  const getFilteredResources = () => filterItems(
    dropdownData.businessResources || [], 
    searchTerms.resources
  );
  
  const getFilteredAccess = () => filterItems(
    dropdownData.accessMatrix || [], 
    searchTerms.access
  );
  
  const getFilteredBenefits = () => filterItems(
    dropdownData.companyBenefits || [], 
    searchTerms.benefits
  );

  // Count selected items
  const getSelectedCount = (fieldName) => {
    return formData[fieldName]?.length || 0;
  };

  // Render section with nested items
  const renderSection = (config) => {
    const {
      title,
      icon: Icon,
      fieldName,
      items,
      searchTerm,
      onSearchChange,
      category,
      description,
      emptyMessage
    } = config;

    const filteredItems = items();
    const selectedCount = getSelectedCount(fieldName);

    return (
      <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
        {/* Section Header */}
        <div className={`p-4 ${bgAccent} border-b ${borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-almet-sapphire" />
              <div>
                <h3 className={`text-sm font-semibold ${textPrimary}`}>{title}</h3>
                {selectedCount > 0 && (
                  <p className="text-xs text-almet-sapphire font-medium mt-0.5">
                    {selectedCount} selected
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <p className={`text-xs ${textSecondary} mb-3`}>{description}</p>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className={`w-full pl-9 pr-8 py-2 text-xs border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${textMuted} hover:${textPrimary}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredItems.map(parent => {
                const isExpanded = expandedParents[category].has(parent.id);
                const hasChildren = parent.items && parent.items.length > 0;
                const parentSelected = isParentSelected(parent, formData[fieldName]);
                const selectedChildrenCount = hasChildren 
                  ? parent.items.filter(child => isItemSelected(child.id, formData[fieldName])).length 
                  : 0;

                return (
                  <div key={parent.id} className={`border ${borderColor} rounded-lg overflow-hidden`}>
                    {/* Parent Item */}
                    <div 
                      className={`flex items-center gap-2 p-3 cursor-pointer transition-colors ${
                        parentSelected 
                          ? 'bg-almet-sapphire/10 border-l-4 border-l-almet-sapphire' 
                          : `${bgHover} hover:bg-opacity-80`
                      }`}
                    >
                      {/* Expand/Collapse Button */}
                      {hasChildren && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleParentExpansion(category, parent.id);
                          }}
                          className={`p-1 ${textMuted} hover:${textPrimary} transition-colors flex-shrink-0`}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      )}
                      
                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={parentSelected}
                          onChange={() => handleParentToggle(parent, fieldName)}
                          className="w-4 h-4 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire cursor-pointer"
                        />
                      </div>

                      {/* Parent Info */}
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => handleParentToggle(parent, fieldName)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${textPrimary} truncate`}>
                            {parent.name}
                          </span>
                          {hasChildren && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${bgAccent} ${textMuted}`}>
                              {selectedChildrenCount > 0 ? `${selectedChildrenCount}/` : ''}{parent.items.length}
                            </span>
                          )}
                        </div>
                        {parent.description && (
                          <p className={`text-xs ${textMuted} truncate mt-0.5`}>
                            {parent.description}
                          </p>
                        )}
                      </div>

                      {/* Selected Indicator */}
                      {parentSelected && (
                        <Check size={16} className="text-almet-sapphire flex-shrink-0" />
                      )}
                    </div>

                    {/* Child Items */}
                    {isExpanded && hasChildren && (
                      <div className={`border-t ${borderColor} ${bgAccent} p-2 space-y-1`}>
                        {parent.items.map(child => {
                          const childSelected = isItemSelected(child.id, formData[fieldName]);

                          return (
                            <div
                              key={child.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                childSelected 
                                  ? 'bg-almet-sapphire/10' 
                                  : `${bgCard} hover:${bgHover}`
                              }`}
                              onClick={() => handleChildToggle(child.id, fieldName)}
                            >
                              <div className="ml-6 flex-shrink-0">
                                <input
                                  type="checkbox"
                                  checked={childSelected}
                                  onChange={() => handleChildToggle(child.id, fieldName)}
                                  className="w-3.5 h-3.5 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm ${textPrimary} truncate`}>
                                    {child.name}
                                  </span>
                                </div>
                                {child.description && (
                                  <p className={`text-xs ${textMuted} truncate mt-0.5`}>
                                    {child.description}
                                  </p>
                                )}
                                {child.full_path && (
                                  <p className={`text-xs ${textMuted} truncate mt-0.5 font-mono`}>
                                    {child.full_path}
                                  </p>
                                )}
                              </div>

                              {childSelected && (
                                <Check size={14} className="text-almet-sapphire flex-shrink-0" />
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
            <div className="p-8 text-center">
              <Icon size={32} className={`mx-auto ${textMuted} mb-3`} />
              <p className={`text-sm ${textMuted}`}>
                {searchTerm ? `No ${title.toLowerCase()} found matching "${searchTerm}"` : emptyMessage}
              </p>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {filteredItems.length > 0 && selectedCount > 0 && (
          <div className={`p-3 border-t ${borderColor} ${bgAccent}`}>
            <div className="flex items-center justify-between text-xs">
              <span className={textSecondary}>
                {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => onFormDataChange(prev => ({ ...prev, [fieldName]: [] }))}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className={`p-4 border border-sky-200 dark:border-sky-800 rounded-lg bg-sky-50 dark:bg-sky-900/20`}>
        <div className="flex items-start gap-3">
          <Info size={18} className="text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className={`text-sm font-semibold text-sky-800 dark:text-sky-300 mb-1`}>
              Resources and Benefits Selection
            </h4>
            <p className={`text-xs text-sky-700 dark:text-sky-400`}>
              Select the resources, access rights, and benefits applicable to this position. 
              You can select parent items to automatically include all nested items, or choose specific items individually.
            </p>
          </div>
        </div>
      </div>

      {/* Three Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Resources */}
        {renderSection({
          title: 'Business Resources',
          icon: Package,
          fieldName: 'business_resources_ids',
          items: getFilteredResources,
          searchTerm: searchTerms.resources,
          onSearchChange: (value) => setSearchTerms(prev => ({ ...prev, resources: value })),
          category: 'resources',
          description: 'Equipment, tools, and resources needed for this position',
          emptyMessage: 'No business resources available'
        })}

        {/* Access Rights */}
        {renderSection({
          title: 'Access Rights',
          icon: Shield,
          fieldName: 'access_rights_ids',
          items: getFilteredAccess,
          searchTerm: searchTerms.access,
          onSearchChange: (value) => setSearchTerms(prev => ({ ...prev, access: value })),
          category: 'access',
          description: 'System access and security clearance levels',
          emptyMessage: 'No access rights available'
        })}

        {/* Company Benefits */}
        {renderSection({
          title: 'Company Benefits',
          icon: Gift,
          fieldName: 'company_benefits_ids',
          items: getFilteredBenefits,
          searchTerm: searchTerms.benefits,
          onSearchChange: (value) => setSearchTerms(prev => ({ ...prev, benefits: value })),
          category: 'benefits',
          description: 'Applicable company benefits and perks',
          emptyMessage: 'No company benefits available'
        })}
      </div>

      {/* Summary Section */}
      {(getSelectedCount('business_resources_ids') > 0 || 
        getSelectedCount('access_rights_ids') > 0 || 
        getSelectedCount('company_benefits_ids') > 0) && (
        <div className={`p-4 border ${borderColor} rounded-lg ${bgAccent}`}>
          <h4 className={`text-sm font-semibold ${textPrimary} mb-3`}>
            Selection Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-almet-sapphire" />
              <span className={textSecondary}>Resources:</span>
              <span className={`font-semibold ${textPrimary}`}>
                {getSelectedCount('business_resources_ids')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-almet-sapphire" />
              <span className={textSecondary}>Access Rights:</span>
              <span className={`font-semibold ${textPrimary}`}>
                {getSelectedCount('access_rights_ids')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-almet-sapphire" />
              <span className={textSecondary}>Benefits:</span>
              <span className={`font-semibold ${textPrimary}`}>
                {getSelectedCount('company_benefits_ids')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkConditionsTab;
