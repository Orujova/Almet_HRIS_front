// src/components/headcount/LineManagerAssignModal.jsx - Enhanced Design with Project Colors
"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { X, Search, User, CheckCircle, AlertCircle, ChevronDown, Building, Mail, Users, RefreshCw } from "lucide-react";

/**
 * Enhanced Line Manager Modal - Improved Design with Project Colors
 */
const LineManagerModal = ({
  isOpen,
  onClose,
  employee,
  onAssign,
  loading = false,
  darkMode = false,
  onFetchAllEmployees,
  allEmployeesData = null
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  const dropdownRef = useRef(null);

  // Enhanced theme classes with project colors
  const bgModal = darkMode ? "bg-gray-900" : "bg-white";
  const textPrimary = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-mystic";
  const bgHover = darkMode ? "hover:bg-gray-800" : "hover:bg-almet-mystic/50";
  const bgInput = darkMode ? "bg-gray-800" : "bg-white";
  const accentBlue = darkMode ? "text-blue-400" : "text-almet-sapphire";
  const accentGreen = darkMode ? "text-green-400" : "text-emerald-600";

  // Smart initialization and data fetching
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 Enhanced Modal: Modal opened');
      
      setSearchTerm("");
      setSelectedManagerId(employee?.line_manager_id || "");
      setShowConfirmation(false);
      setIsDropdownOpen(false);
      setFetchError(null);
      
      if (!allEmployeesData && onFetchAllEmployees) {
        console.log('📡 Enhanced Modal: Fetching all employees...');
        handleFetchEmployees();
      } else if (allEmployeesData) {
        console.log('✅ Enhanced Modal: Using cached data:', allEmployeesData?.length || 0);
      } else {
        console.warn('⚠️ Enhanced Modal: No fetch function provided');
      }
    }
  }, [isOpen, employee?.line_manager_id]);

  // Enhanced employee fetching with error handling
  const handleFetchEmployees = async (forceRefresh = false) => {
    if (!onFetchAllEmployees) {
      setFetchError('No employee fetch function provided');
      return;
    }

    try {
      setFetchLoading(true);
      setFetchError(null);
      
      console.log('🔄 Enhanced Modal: Fetching employees...', { forceRefresh });
      
      const options = forceRefresh ? { skipCache: true } : {};
      const result = await onFetchAllEmployees(options);
      
      console.log('✅ Enhanced Modal: Fetch successful:', result?.length || 0);
      
    } catch (error) {
      console.error('❌ Enhanced Modal: Fetch failed:', error);
      setFetchError(error.message || 'Failed to load employees');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle dropdown clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safe employee data processing with multiple fallbacks
  const allAvailableEmployees = useMemo(() => {
    if (!allEmployeesData) {
      console.log('📊 Enhanced Modal: No employee data available');
      return [];
    }
    
    let employees = [];
    
    try {
      if (Array.isArray(allEmployeesData)) {
        employees = allEmployeesData;
        console.log('✅ Enhanced Modal: Using direct array format');
      } else if (allEmployeesData.results && Array.isArray(allEmployeesData.results)) {
        employees = allEmployeesData.results;
        console.log('✅ Enhanced Modal: Using results array format');
      } else if (allEmployeesData.data) {
        if (Array.isArray(allEmployeesData.data)) {
          employees = allEmployeesData.data;
          console.log('✅ Enhanced Modal: Using data array format');
        } else if (allEmployeesData.data.results && Array.isArray(allEmployeesData.data.results)) {
          employees = allEmployeesData.data.results;
          console.log('✅ Enhanced Modal: Using data.results format');
        }
      }
      
      const validEmployees = employees.filter(emp => {
        return emp && 
               emp.id && 
               (emp.name || emp.employee_name || emp.first_name || emp.last_name) &&
               emp.id !== employee?.id;
      });
      
      console.log('🎯 Enhanced Modal: Processing employees:', {
        raw: employees.length,
        valid: validEmployees.length,
        currentEmployeeId: employee?.id
      });
      
      return validEmployees;
      
    } catch (error) {
      console.error('❌ Enhanced Modal: Error processing employee data:', error);
      return [];
    }
  }, [allEmployeesData, employee?.id]);

  // Enhanced search with multiple field matching
  const searchableEmployees = useMemo(() => {
    if (!searchTerm.trim()) {
      return allAvailableEmployees;
    }
    
    const search = searchTerm.toLowerCase().trim();
    
    return allAvailableEmployees.filter(manager => {
      try {
        const name = (manager.name || 
                     manager.employee_name || 
                     `${manager.first_name || ''} ${manager.last_name || ''}`.trim() || 
                     'Unknown').toLowerCase();
        
        const email = (manager.email || '').toLowerCase();
        const employeeId = (manager.employee_id || manager.id || '').toString().toLowerCase();
        const jobTitle = (manager.job_title || '').toLowerCase();
        const department = (manager.department_name || '').toLowerCase();
        const businessFunction = (manager.business_function_name || '').toLowerCase();
        
        return name.includes(search) || 
               email.includes(search) || 
               employeeId.includes(search) ||
               jobTitle.includes(search) ||
               department.includes(search) ||
               businessFunction.includes(search);
      } catch (error) {
        console.warn('⚠️ Enhanced Modal: Error filtering employee:', manager, error);
        return false;
      }
    });
  }, [allAvailableEmployees, searchTerm]);

  // Safe selected manager lookup
  const selectedManager = useMemo(() => {
    if (!selectedManagerId) return null;
    
    return allAvailableEmployees.find(manager => 
      manager && manager.id === selectedManagerId
    ) || null;
  }, [allAvailableEmployees, selectedManagerId]);
  
  // Has changes check
  const hasChanges = selectedManagerId !== (employee?.line_manager_id || "");

  // Safe employee name helper
  const getEmployeeName = (emp) => {
    if (!emp) return 'Unknown Employee';
    
    return emp.name || 
           emp.employee_name || 
           `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 
           `Employee ${emp.id}`;
  };

  // Get employee initials safely
  const getEmployeeInitials = (emp) => {
    const name = getEmployeeName(emp);
    const words = name.split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return 'NA';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    
    return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
  };

  // Handle manager selection
  const handleManagerSelect = (manager) => {
    if (!manager || !manager.id) {
      console.warn('⚠️ Enhanced Modal: Invalid manager selected:', manager);
      return;
    }
    
    setSelectedManagerId(manager.id);
    setIsDropdownOpen(false);
    setSearchTerm("");
    
    console.log('✅ Enhanced Modal: Manager selected:', {
      id: manager.id,
      name: getEmployeeName(manager)
    });
  };

  // Handle assign
  const handleAssign = () => {
    if (!selectedManagerId) {
      alert("Please select a line manager first.");
      return;
    }
    
    if (selectedManagerId === employee?.line_manager_id) {
      alert("This manager is already assigned to this employee.");
      return;
    }
    
    setShowConfirmation(true);
  };

  // Confirm assignment
  const confirmAssignment = () => {
    if (selectedManagerId) {
      console.log('🎯 Enhanced Modal: Confirming assignment:', {
        employeeId: employee?.id,
        managerId: selectedManagerId,
        managerName: getEmployeeName(selectedManager)
      });
      
      onAssign(selectedManagerId);
      setShowConfirmation(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (hasChanges && !loading && !fetchLoading) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${bgModal} rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh]  border ${borderColor}`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${borderColor} bg-gradient-to-r from-almet-mystic/50 to-gray-50 dark:from-gray-800 dark:to-gray-700`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg flex items-center justify-center mr-3">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h3 className={`text-base font-semibold ${textPrimary}`}>Assign Line Manager</h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  {getEmployeeName(employee)}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-1.5 rounded-lg ${bgHover} transition-all duration-200`}
              disabled={loading || fetchLoading}
            >
              <X className={`w-4 h-4 ${textSecondary}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Current Manager Info */}
          {employee?.line_manager_name && (
            <div className={`p-3 rounded-lg border ${borderColor} bg-gradient-to-r from-blue-50/50 to-sky-50/50 dark:from-blue-950/20 dark:to-sky-950/20`}>
              <div className="flex items-center">
                <User className={`w-3.5 h-3.5 ${accentBlue} mr-2`} />
                <span className={`text-xs font-medium ${accentBlue}`}>
                  Current Line Manager:
                </span>
              </div>
              <p className={`${accentBlue} mt-1 font-medium text-sm`}>
                {employee.line_manager_name}
              </p>
            </div>
          )}

          {/* Employee Count Info with Status */}
          <div className="text-center">
            <div className="inline-flex items-center px-3.5 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <Users className={`w-3.5 h-3.5 mr-2 ${textMuted}`} />
              <span className={`text-xs ${textSecondary}`}>
                {fetchLoading ? (
                  <>
                    <RefreshCw className="w-3 h-3 inline animate-spin mr-1.5" />
                    Loading employees...
                  </>
                ) : fetchError ? (
                  <span className="text-red-600 dark:text-red-400">
                    Error: {fetchError}
                  </span>
                ) : (
                  `${allAvailableEmployees.length} employees available`
                )}
              </span>
              
              {!fetchLoading && (
                <button
                  onClick={() => handleFetchEmployees(true)}
                  className="ml-2.5 px-2.5 py-1 bg-almet-sapphire text-white text-xs rounded hover:bg-almet-astral transition-colors flex items-center shadow-sm"
                  title="Refresh employee list"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </button>
              )}
            </div>
            
            {/* Error handling with retry */}
            {fetchError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700 rounded-lg text-xs">
                <p className="text-red-700 dark:text-red-300 mb-2 font-medium">Failed to load employees</p>
                <button
                  onClick={() => handleFetchEmployees(true)}
                  className="px-2.5 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Manager Selection Dropdown */}
          <div>
            <label className={`block text-sm font-medium mb-2.5 ${textPrimary}`}>
              Select New Line Manager
            </label>
            
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Button */}
              <button
                onClick={() => !fetchLoading && !fetchError && setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full px-3.5 py-3 border-2 rounded-lg text-left flex items-center justify-between transition-all duration-200 ${
                  isDropdownOpen ? 'border-almet-sapphire ring-2 ring-blue-100 dark:ring-blue-900/50' : borderColor
                } ${bgInput} ${(fetchLoading || fetchError) ? 'cursor-not-allowed opacity-50' : 'hover:border-almet-sapphire/50'}`}
                disabled={fetchLoading || fetchError}
              >
                <div className="flex items-center flex-1 min-w-0">
                  {selectedManager ? (
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg flex items-center justify-center mr-2.5">
                        <span className="text-white font-medium text-xs">
                          {getEmployeeInitials(selectedManager)}
                        </span>
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${textPrimary}`}>
                          {getEmployeeName(selectedManager)}
                        </p>
                        <p className={`text-xs ${textMuted}`}>
                          {selectedManager.job_title || 'No Title'} • {selectedManager.department_name || 'No Department'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-2.5">
                        <User className={`w-4 h-4 ${textMuted}`} />
                      </div>
                      <span className={`text-sm ${textMuted}`}>
                        {fetchLoading ? 'Loading employees...' : 
                         fetchError ? 'Error loading employees' :
                         'Choose a manager...'}
                      </span>
                    </div>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''} ${textMuted}`} />
              </button>

              {/* Dropdown Content */}
              {isDropdownOpen && !fetchLoading && !fetchError && (
                <div className={`absolute top-full left-0 right-0 mt-1 ${bgModal} border-2 border-almet-sapphire rounded-lg shadow-2xl z-50 max-h-80 overflow-hidden`}>
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                    <div className="relative">
                      <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, ID, job title, department..."
                        className={`w-full pl-9 pr-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire ${bgInput} ${textPrimary} placeholder:${textMuted} text-sm`}
                        autoFocus
                      />
                    </div>
                    {searchTerm && (
                      <div className={`mt-1.5 text-xs ${textMuted}`}>
                        Found {searchableEmployees.length} employee{searchableEmployees.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Employees List */}
                  <div className="max-h-64 overflow-y-auto">
                    {searchableEmployees.length === 0 ? (
                      <div className={`p-6 text-center ${textMuted}`}>
                        {searchTerm ? (
                          <div>
                            <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No employees found matching "{searchTerm}"</p>
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-2 text-almet-sapphire hover:text-almet-astral text-xs underline"
                            >
                              Clear search
                            </button>
                          </div>
                        ) : (
                          <div>
                            <User className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No employees available</p>
                            <button
                              onClick={() => handleFetchEmployees(true)}
                              className="mt-2 text-almet-sapphire hover:text-almet-astral text-xs underline"
                            >
                              Reload employees
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      searchableEmployees.map((manager) => {
                        const isSelected = manager.id === selectedManagerId;
                        const isCurrent = manager.id === employee?.line_manager_id;
                        
                        return (
                          <button
                            key={manager.id}
                            onClick={() => handleManagerSelect(manager)}
                            className={`w-full p-3 text-left ${bgHover} transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                              isSelected ? 'bg-almet-mystic/50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1 min-w-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg flex items-center justify-center mr-2.5">
                                  <span className="text-white font-medium text-xs">
                                    {getEmployeeInitials(manager)}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center">
                                    <h4 className={`font-medium text-sm ${textPrimary} truncate`}>
                                      {getEmployeeName(manager)}
                                    </h4>
                                    {isCurrent && (
                                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-almet-sapphire rounded-full font-medium">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-xs ${textMuted} truncate`}>
                                    {manager.job_title || 'No Title'}
                                  </p>
                                  <div className={`flex items-center mt-1 text-xs ${textMuted}`}>
                                    <Building className="w-3 h-3 mr-1" />
                                    <span className="truncate mr-3">{manager.department_name || 'No Department'}</span>
                                    <span>ID: {manager.employee_id || manager.id}</span>
                                  </div>
                                </div>
                              </div>
                              {isSelected && !isCurrent && (
                                <CheckCircle className={`w-4 h-4 ${accentGreen} ml-2`} />
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

          {/* Selected Manager Preview */}
          {selectedManager && (
            <div className={`p-3.5 rounded-lg border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:border-emerald-700 dark:from-emerald-950/20 dark:to-green-950/20`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className={`w-4 h-4 ${accentGreen} mr-2`} />
                  <span className={`font-medium text-sm ${accentGreen}`}>
                    Selected Manager
                  </span>
                </div>
                <button
                  onClick={() => setSelectedManagerId("")}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 underline font-medium"
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
              <div className="mt-2.5 flex items-center">
                <div className={`w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3`}>
                  <span className="text-white font-medium text-sm">
                    {getEmployeeInitials(selectedManager)}
                  </span>
                </div>
                <div>
                  <p className={`font-medium text-sm ${accentGreen}`}>
                    {getEmployeeName(selectedManager)}
                  </p>
                  <p className={`text-xs ${textMuted}`}>
                    {selectedManager.job_title || 'No Title'}
                  </p>
                  <div className={`flex items-center mt-1 text-xs ${textMuted}`}>
                    <Building className="w-3 h-3 mr-1" />
                    <span className="mr-3">{selectedManager.department_name || 'No Department'}</span>
                    <Mail className="w-3 h-3 mr-1" />
                    <span>{selectedManager.email || 'No Email'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-5 py-3.5 border-t ${borderColor} bg-gray-50/50 dark:bg-gray-800/30`}>
          <div className="flex justify-between items-center">
            <div className={`text-xs ${textMuted}`}>
              {hasChanges && selectedManager && "Assignment will be applied immediately"}
            </div>
            <div className="flex space-x-2.5">
              <button
                onClick={handleClose}
                className={`px-3.5 py-1.5 text-xs font-medium border ${borderColor} rounded-lg ${textSecondary} ${bgHover} transition-all duration-200`}
                disabled={loading || fetchLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!hasChanges || loading || fetchLoading || !selectedManagerId || fetchError}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 shadow-md flex items-center ${
                  !hasChanges || loading || fetchLoading || !selectedManagerId || fetchError
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Assign Manager
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && selectedManager && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-60">
          <div className={`${bgModal} rounded-xl shadow-2xl max-w-md w-full border ${borderColor}`}>
            <div className="p-5">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-2.5" />
                <h3 className={`text-base font-semibold ${textPrimary}`}>Confirm Assignment</h3>
              </div>
              <p className={`${textSecondary} mb-5 text-sm`}>
                Are you sure you want to assign <strong>{getEmployeeName(selectedManager)}</strong> as the line manager for <strong>{getEmployeeName(employee)}</strong>?
              </p>
              <div className="flex space-x-2.5 justify-end">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className={`px-3.5 py-1.5 text-xs border ${borderColor} rounded-lg ${textSecondary} ${bgHover} transition-all duration-200`}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAssignment}
                  className="px-3.5 py-1.5 text-xs bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:from-almet-astral hover:to-almet-steel-blue disabled:opacity-50 font-medium transition-all duration-200"
                  disabled={loading}
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineManagerModal;