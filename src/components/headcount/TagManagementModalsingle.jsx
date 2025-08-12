// QUICK FIX - Force dropdown to work by simplifying logic completely
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
      console.log('🏷️ QUICK FIX: Modal opened');
      console.log('🏷️ QUICK FIX: Employee data:', employee);
      console.log('🏷️ QUICK FIX: Available tags:', availableTags);
      
      setSelectedOperation("add");
      setShowConfirmation(false);
      setIsDropdownOpen(false);
      setSearchTerm("");
      setSelectedTag(null);
    }
  }, [isOpen]);

  // QUICK FIX: Just get current tag names however they come
  const currentTagNames = useMemo(() => {
    const names = new Set();
    
    // Try multiple ways to get current tags
    if (employee?.tag_names && Array.isArray(employee.tag_names)) {
      employee.tag_names.forEach(item => {
        if (typeof item === 'string') {
          names.add(item.toLowerCase().trim());
        } else if (item && item.name) {
          names.add(item.name.toLowerCase().trim());
        }
      });
    }
    
    if (employee?.tags && Array.isArray(employee.tags)) {
      employee.tags.forEach(tag => {
        if (tag && tag.name) {
          names.add(tag.name.toLowerCase().trim());
        }
      });
    }
    
    const result = Array.from(names);
    console.log('🏷️ QUICK FIX: Current tag names extracted:', result);
    return result;
  }, [employee]);

  // QUICK FIX: Always show available tags for now, ignore filtering temporarily  
  const dropdownTags = useMemo(() => {
    console.log('🏷️ QUICK FIX: Building dropdown tags');
    
    if (!availableTags || availableTags.length === 0) {
      console.log('🏷️ QUICK FIX: No available tags');
      return [];
    }

    // TEMPORARY: Just show all available tags for ADD operation
    let tags = [];
    
    if (selectedOperation === "add") {
      // Show all available tags (ignore current assignments for now)
      tags = availableTags.filter(tag => tag && tag.name);
      console.log('🏷️ QUICK FIX: Showing ALL available tags for add:', tags);
    } else {
      // For remove, try to match with current tags
      tags = availableTags.filter(tag => {
        if (!tag || !tag.name) return false;
        return currentTagNames.includes(tag.name.toLowerCase());
      });
      console.log('🏷️ QUICK FIX: Showing matched tags for remove:', tags);
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      tags = tags.filter(tag => tag.name.toLowerCase().includes(search));
    }

    console.log('🏷️ QUICK FIX: Final dropdown tags:', tags);
    return tags;
  }, [availableTags, currentTagNames, selectedOperation, searchTerm]);

  // QUICK FIX: Force dropdown to open
  const handleDropdownToggle = () => {
    console.log('🏷️ QUICK FIX: Dropdown button clicked');
    console.log('🏷️ QUICK FIX: Current state - isOpen:', isDropdownOpen);
    console.log('🏷️ QUICK FIX: Dropdown tags available:', dropdownTags.length);
    
    // Force open regardless
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
    console.log('🏷️ QUICK FIX: Tag selected:', tag);
    setSelectedTag(tag);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  // Execute operation
  const handleExecuteOperation = () => {
    if (!selectedTag || !selectedTag.id) {
      alert("Please select a valid tag first.");
      return;
    }
    setShowConfirmation(true);
  };

  // Confirm operation
  const confirmOperation = () => {
    if (selectedTag && selectedTag.id) {
      console.log('🏷️ QUICK FIX: Confirming operation:', selectedOperation, selectedTag.id);
      onTagOperation(selectedOperation, selectedTag.id);
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

  const baseClasses = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const borderClasses = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputClasses = darkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  const isLoading = loading.add || loading.remove;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${baseClasses} rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${borderClasses} bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tag Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {employee?.name || employee?.employee_name || `Employee ${employee?.id}`}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* DEBUG INFO */}
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded border text-sm">
            <strong>Quick Fix Debug:</strong><br/>
            Available Tags: {availableTags?.length || 0}<br/>
            Current Tag Names: {currentTagNames.length} - [{currentTagNames.join(', ')}]<br/>
            Dropdown Tags ({selectedOperation}): {dropdownTags.length}<br/>
            Dropdown Open: {isDropdownOpen ? 'YES' : 'NO'}<br/>
            Employee tag_names: {JSON.stringify(employee?.tag_names?.slice(0, 3))}<br/>
          </div>

          {/* Current Tags Display */}
          <div className={`mb-6 p-4 rounded-lg border ${borderClasses} bg-gray-50/50 dark:bg-gray-900/10`}>
            <div className="flex items-center mb-3">
              <Tag size={18} className="text-gray-600 dark:text-gray-400 mr-2" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Currently Assigned Tags ({currentTagNames.length})
              </span>
            </div>
            {currentTagNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentTagNames.map((tagName, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border bg-blue-100 text-blue-800 border-blue-200"
                  >
                    <Hash size={12} className="mr-1" />
                    {tagName}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                No tags assigned to this employee
              </p>
            )}
          </div>

          {/* Operation Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Choose Operation</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  console.log('🏷️ QUICK FIX: Switching to ADD');
                  setSelectedOperation("add");
                  setSelectedTag(null);
                  setSearchTerm("");
                  setIsDropdownOpen(false);
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedOperation === "add"
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Plus size={20} className={`${selectedOperation === "add" ? 'text-green-600' : 'text-gray-500'}`} />
                </div>
                <div className={`font-medium ${selectedOperation === "add" ? 'text-green-900' : 'text-gray-700'}`}>
                  Add Tag
                </div>
                <p className={`text-xs mt-1 ${selectedOperation === "add" ? 'text-green-600' : 'text-gray-500'}`}>
                  {availableTags.length} available
                </p>
              </button>
              
              <button
                onClick={() => {
                  console.log('🏷️ QUICK FIX: Switching to REMOVE');
                  setSelectedOperation("remove");
                  setSelectedTag(null);
                  setSearchTerm("");
                  setIsDropdownOpen(false);
                }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedOperation === "remove"
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 hover:border-red-300'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Minus size={20} className={`${selectedOperation === "remove" ? 'text-red-600' : 'text-gray-500'}`} />
                </div>
                <div className={`font-medium ${selectedOperation === "remove" ? 'text-red-900' : 'text-gray-700'}`}>
                  Remove Tag
                </div>
                <p className={`text-xs mt-1 ${selectedOperation === "remove" ? 'text-red-600' : 'text-gray-500'}`}>
                  {currentTagNames.length} assigned
                </p>
              </button>
            </div>
          </div>

          {/* QUICK FIX: Force Working Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Select Tag to {selectedOperation === "add" ? "Add" : "Remove"}
            </label>
            
            <div className="relative" ref={dropdownRef}>
              {/* FORCE WORKING: Always clickable dropdown button */}
              <button
                onClick={handleDropdownToggle}
                className={`w-full px-4 py-3 border-2 rounded-lg text-left flex items-center justify-between transition-all
                  ${isDropdownOpen ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-300 hover:border-blue-400'}
                  ${inputClasses} cursor-pointer`}
                type="button"
                style={{ minHeight: '50px' }} // Force minimum height
              >
                <div className="flex items-center flex-1 min-w-0">
                  {selectedTag ? (
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full mr-3 bg-green-100 text-green-800">
                        <Hash size={10} className="mr-1" />
                        {selectedTag.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-600">
                      Click to {selectedOperation === "add" ? "add" : "remove"} tags ({dropdownTags.length} available)
                    </span>
                  )}
                </div>
                <ChevronDown size={20} className={`transform transition-transform text-blue-600 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* FORCE DISPLAY: Always show dropdown when open */}
              {isDropdownOpen && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-500 rounded-lg shadow-2xl overflow-hidden"
                  style={{ zIndex: 9999 }}
                >
                  {/* Search */}
                  <div className="p-4 border-b bg-blue-50">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tags..."
                        className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      {dropdownTags.length} tag{dropdownTags.length !== 1 ? 's' : ''} found
                    </div>
                  </div>

                  {/* FORCE SHOW: Always render tag list */}
                  <div className="max-h-60 overflow-y-auto">
                    {dropdownTags.length === 0 ? (
                      <div className="p-6 text-center">
                        <Hash size={24} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedOperation === "add" ? "All tags are assigned" : "No tags to remove"}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedOperation(selectedOperation === "add" ? "remove" : "add");
                            setIsDropdownOpen(false);
                          }}
                          className="text-blue-500 text-sm underline hover:text-blue-700"
                        >
                          Switch to {selectedOperation === "add" ? "Remove" : "Add"} Tags
                        </button>
                      </div>
                    ) : (
                      dropdownTags.map((tag, index) => (
                        <button
                          key={tag.id || index}
                          onClick={() => handleTagSelect(tag)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs rounded-full mr-3 bg-blue-100 text-blue-800">
                                <Hash size={10} className="mr-1" />
                                {tag.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {tag.tag_type || 'OTHER'}
                              </span>
                            </div>
                            {selectedTag?.id === tag.id && (
                              <Check size={16} className="text-green-500" />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Tag */}
          {selectedTag && (
            <div className="mb-6 p-4 rounded-lg border-2 border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-900">
                  Selected: {selectedTag.name}
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-red-500 underline"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderClasses} bg-gray-50`}>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteOperation}
              disabled={!selectedTag || isLoading}
              className={`px-6 py-2 text-sm rounded-lg text-white font-medium ${
                selectedOperation === "add" ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Processing..." : `${selectedOperation === "add" ? "Add" : "Remove"} Tag`}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      {showConfirmation && selectedTag && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Action</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {selectedOperation === "add" ? "Add" : "Remove"} tag "{selectedTag.name}" {selectedOperation === "add" ? "to" : "from"} {employee?.name || employee?.employee_name}?
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmOperation}
                className={`px-4 py-2 text-sm rounded-lg text-white ${
                  selectedOperation === "add" ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManagementModal;