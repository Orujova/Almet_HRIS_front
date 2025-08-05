// src/components/headcount/BulkEditModal.jsx - Line Manager Assignment (Complete Rewrite)
import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Edit3, Users, User, Search, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useEmployees } from '../../hooks/useEmployees';

const BulkEditModal = ({
  isOpen,
  onClose,
  onAction,
  selectedEmployees = [],
  selectedEmployeeData = [],
  darkMode = false
}) => {
  const [selectedLineManagerId, setSelectedLineManagerId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [isLoadingAllEmployees, setIsLoadingAllEmployees] = useState(false);
  const dropdownRef = useRef(null);

  // Employee data from hook  
  const {
    formattedEmployees = [],
    loading: employeesLoading = {},
    refreshAll
  } = useEmployees();

  // Theme classes
  const bgModal = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const bgDropdown = darkMode ? "bg-gray-700" : "bg-white";

  // Fetch ALL employees without pagination or filters - TRULY ALL EMPLOYEES
  const fetchAllEmployees = async () => {
    setIsLoadingAllEmployees(true);
    try {
      let employees = [];
      
      // Method 1: Try multiple API calls to get ALL employees
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
        const baseURL = process.env.NEXT_PUBLIC_API_URL ;
        
        // First, get total count to know how many employees exist
        const countResponse = await fetch(`${baseURL}/employees/?page_size=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!countResponse.ok) {
          throw new Error(`Count API call failed: ${countResponse.status}`);
        }
        
        const countData = await countResponse.json();
        const totalCount = countData.count || 0;
        
        console.log(`📊 Total employees in system: ${totalCount}`);
        
        // Now fetch ALL employees with a very large page size
        const allResponse = await fetch(`${baseURL}/employees/?page_size=${Math.max(totalCount + 100, 10000)}&page=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!allResponse.ok) {
          throw new Error(`All employees API call failed: ${allResponse.status}`);
        }
        
        const allData = await allResponse.json();
        
        // Format employee data from API response - ONLY ACTIVE employees
        employees = (allData.results || [])
          .filter(emp => emp.is_active !== false) // Filter active employees
          .map(emp => ({
            id: emp.id,
            value: emp.id,
            name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
            employee_id: emp.employee_id,
            jobTitle: emp.job_title,
            departmentName: emp.department_name,
            businessFunction: emp.business_function_name,
            email: emp.email,
            isActive: true,
            isCurrentLineManager: emp.direct_reports_count > 0,
            directReportsCount: emp.direct_reports_count || 0,
            currentLineManagerId: emp.line_manager_id,
            currentLineManagerName: emp.line_manager_name
          }));
        
        console.log(`✅ Fetched ${allData.results?.length || 0} total employees, ${employees.length} active employees via API`);
        
      } catch (apiError) {
        console.warn('⚠️ Direct API call failed:', apiError);
        
        // Method 2: Fallback to using formattedEmployees from hook but try to get more data
        if (formattedEmployees && formattedEmployees.length > 0) {
          employees = formattedEmployees
            .filter(emp => emp.is_active !== false) // Only active employees
            .map(emp => ({
              id: emp.id,
              value: emp.id,
              name: emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
              employee_id: emp.employee_id,
              jobTitle: emp.jobTitle || emp.job_title,
              departmentName: emp.departmentInfo || emp.department_name,
              businessFunction: emp.business_function_name,
              email: emp.email,
              isActive: true,
              isCurrentLineManager: emp.managementInfo?.isLineManager || emp.direct_reports_count > 0,
              directReportsCount: emp.managementInfo?.directReportsCount || emp.direct_reports_count || 0,
              currentLineManagerId: emp.line_manager_id,
              currentLineManagerName: emp.line_manager_name
            }));
          
          console.log(`⚠️ Using hook data fallback: ${employees.length} employees`);
          
          // Try to fetch more data in background
          setTimeout(() => {
            if (refreshAll && typeof refreshAll === 'function') {
              console.log('🔄 Triggering background refresh to get more employees...');
              refreshAll();
            }
          }, 1000);
          
        } else {
          throw new Error('No employee data available');
        }
      }
      
      // Final check and log
      if (employees.length === 0) {
        throw new Error('No active employees found');
      }
      
      setAllEmployees(employees);
      console.log(`✅ Successfully loaded ${employees.length} active employees for line manager selection`);
      
    } catch (error) {
      console.error('❌ Failed to fetch all employees:', error);
      
      // Show more detailed error message
      const errorMessage = error.message.includes('fetch') 
        ? 'Failed to connect to the server. Please check your internet connection and try again.'
        : `Failed to load employees: ${error.message}`;
        
      alert(errorMessage);
      setAllEmployees([]);
    } finally {
      setIsLoadingAllEmployees(false);
    }
  };

  // Prepare potential line managers list - EXCLUDE selected employees
  const potentialLineManagers = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) {
      return [];
    }

    // Filter out selected employees and inactive employees
    const availableEmployees = allEmployees.filter(emp => 
      !selectedEmployees.includes(emp.id) && 
      emp.isActive
    );

    return availableEmployees.sort((a, b) => {
      // Sort: Current line managers first, then by name
      if (a.isCurrentLineManager && !b.isCurrentLineManager) return -1;
      if (!a.isCurrentLineManager && b.isCurrentLineManager) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allEmployees, selectedEmployees]);

  // Filter managers based on search term
  const filteredManagers = useMemo(() => {
    if (!searchTerm.trim()) return potentialLineManagers;
    
    const searchLower = searchTerm.toLowerCase();
    return potentialLineManagers.filter(manager => 
      manager.name.toLowerCase().includes(searchLower) ||
      manager.employee_id?.toLowerCase().includes(searchLower) ||
      manager.email?.toLowerCase().includes(searchLower) ||
      manager.jobTitle?.toLowerCase().includes(searchLower) ||
      manager.departmentName?.toLowerCase().includes(searchLower) ||
      manager.businessFunction?.toLowerCase().includes(searchLower)
    );
  }, [potentialLineManagers, searchTerm]);

  // Selected manager object
  const selectedManager = useMemo(() => {
    return potentialLineManagers.find(manager => manager.id === selectedLineManagerId);
  }, [potentialLineManagers, selectedLineManagerId]);

  // Analyze current line manager situation
  const currentLineManagerAnalysis = useMemo(() => {
    if (!selectedEmployeeData || selectedEmployeeData.length === 0) {
      return { hasLineManager: 0, uniqueLineManagers: [] };
    }

    const employeesWithLineManager = selectedEmployeeData.filter(emp => emp.line_manager_id);
    const uniqueLineManagerIds = [...new Set(selectedEmployeeData
      .filter(emp => emp.line_manager_id)
      .map(emp => emp.line_manager_id))];

    const uniqueLineManagers = uniqueLineManagerIds.map(id => {
      // Try to find manager in our all employees list first
      const managerFromList = allEmployees.find(m => m.id === id);
      if (managerFromList) {
        return {
          id: managerFromList.id,
          name: managerFromList.name,
          employee_id: managerFromList.employee_id
        };
      }
      
      // If not found, use the data from employee record
      const employeeWithThisManager = selectedEmployeeData.find(emp => emp.line_manager_id === id);
      return {
        id,
        name: employeeWithThisManager?.line_manager_name || `Manager ${id}`,
        employee_id: null
      };
    }).filter(Boolean);

    return {
      hasLineManager: employeesWithLineManager.length,
      total: selectedEmployeeData.length,
      uniqueLineManagers,
      employeesWithoutLineManager: selectedEmployeeData.filter(emp => !emp.line_manager_id)
    };
  }, [selectedEmployeeData, allEmployees]);

  // ========================================
  // INITIALIZATION
  // ========================================
  useEffect(() => {
    if (isOpen) {
      setSelectedLineManagerId('');
      setSearchTerm('');
      setDropdownOpen(false);
      
      // Always fetch all employees when modal opens
      fetchAllEmployees();
      
      // Also refresh the main employee data if needed
      if (refreshAll && typeof refreshAll === 'function') {
        refreshAll();
      }
    }
  }, [isOpen, refreshAll]);

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

  const handleAssignLineManager = async () => {
    if (!selectedLineManagerId) {
      alert('Please select a line manager');
      return;
    }

    if (selectedEmployees.length === 0) {
      alert('No employees selected');
      return;
    }

    // Confirm assignment
    const selectedManagerName = selectedManager?.name || 'Unknown Manager';
    const confirmMessage = `Are you sure you want to assign "${selectedManagerName}" as line manager for ${selectedEmployees.length} employee${selectedEmployees.length !== 1 ? 's' : ''}?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Backend API call: POST /employees/bulk-assign-line-manager/
      await onAction('bulkAssignLineManager', {
        employee_ids: selectedEmployees,
        line_manager_id: selectedLineManagerId
      });
      
      console.log('✅ Line manager assignment successful');
      onClose();
    } catch (error) {
      console.error('❌ Line manager assignment failed:', error);
      alert(`Line manager assignment failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManagerSelect = (managerId) => {
    setSelectedLineManagerId(managerId);
    setDropdownOpen(false);
    setSearchTerm('');
  };

  const handleRefreshData = () => {
    // Refresh all employees list
    fetchAllEmployees();
    
    // Also refresh the main employee data if the function is available
    if (refreshAll && typeof refreshAll === 'function') {
      refreshAll();
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
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
              <Edit3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>
                Assign Line Manager
              </h2>
              <p className={`text-sm ${textMuted}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshData}
              disabled={isProcessing || isLoadingAllEmployees}
              className={`p-2 rounded-lg ${bgHover} transition-colors disabled:opacity-50`}
              title="Refresh employee data"
            >
              <RefreshCw 
                className={`w-4 h-4 ${textSecondary} ${isLoadingAllEmployees ? 'animate-spin' : ''}`} 
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

        {/* Loading State - IMPROVED */}
        {isLoadingAllEmployees && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm text-blue-800 dark:text-blue-300">
                Loading ALL employees from system (no filters, no pagination)...
              </span>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-6">
              This may take a moment to fetch all active employees
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
         

          {/* Selected Employees Display */}
          {selectedEmployeeData.length > 0 && (
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
                Selected Employees ({selectedEmployeeData.length})
              </label>
              <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                {selectedEmployeeData.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
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
                        {emp.line_manager_name && (
                          <div className={`text-xs ${textMuted}`}>
                            Current: {emp.line_manager_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`text-xs ${textMuted}`}>
                      {emp.line_manager_id ? (
                        <span className="text-green-600 dark:text-green-400">
                          Has Manager
                        </span>
                      ) : (
                        <span className="text-orange-600 dark:text-orange-400">
                          No Manager
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line Manager Selection */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
              Select New Line Manager
            </label>
            
            {isLoadingAllEmployees ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className={textMuted}>Loading all employees...</span>
              </div>
            ) : potentialLineManagers.length === 0 ? (
              <div className={`p-4 border ${borderColor} rounded-lg text-center`}>
                <Users className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                <p className={textMuted}>No available employees to assign as line manager</p>
                <p className={`text-xs ${textMuted} mt-1`}>
                  {allEmployees.length > 0 
                    ? `All ${allEmployees.length} active employees are either selected or unavailable.`
                    : 'No active employees found in the system.'
                  }
                </p>
                <button
                  onClick={handleRefreshData}
                  className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Refresh All Data
                </button>
              </div>
            ) : (
              <div ref={dropdownRef} className="relative">
                {/* Searchable Dropdown */}
                <div
                  onClick={() => !isProcessing && setDropdownOpen(!dropdownOpen)}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} cursor-pointer flex items-center justify-between ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center flex-1">
                    <Search className={`w-4 h-4 mr-3 ${textMuted}`} />
                    {selectedManager ? (
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`font-medium ${textPrimary}`}>
                            {selectedManager.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-600 ${textMuted}`}>
                            {selectedManager.employee_id}
                          </span>
                          {selectedManager.isCurrentLineManager && (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                              Current Manager
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${textMuted} mt-0.5 flex flex-wrap gap-2`}>
                          <span>{selectedManager.jobTitle}</span>
                          {selectedManager.departmentName && (
                            <span>• {selectedManager.departmentName}</span>
                          )}
                          {selectedManager.directReportsCount > 0 && (
                            <span>• {selectedManager.directReportsCount} direct reports</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Search by name, ID, job title, department..."
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
                    {selectedManager && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLineManagerId('');
                          setSearchTerm('');
                        }}
                        disabled={isProcessing}
                        className={`mr-2 ${textMuted} hover:text-red-500 transition-colors disabled:opacity-50`}
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
                    {filteredManagers.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Users className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                        <p className={textMuted}>
                          {searchTerm ? 'No employees found matching search' : 'No employees available'}
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
                      <div className="py-1">
                        {filteredManagers.map((manager) => (
                          <div
                            key={manager.id}
                            onClick={() => handleManagerSelect(manager.id)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${bgHover} border-l-4 border-transparent hover:border-orange-500`}
                          >
                            <div className="flex items-center">
                              <User className={`w-4 h-4 mr-3 ${textMuted} flex-shrink-0`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2 mb-1">
                                  <span className={`font-medium ${textPrimary}`}>
                                    {manager.name}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-600 ${textMuted}`}>
                                    {manager.employee_id}
                                  </span>
                                  {manager.isCurrentLineManager && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                      Manager
                                    </span>
                                  )}
                                </div>
                                <div className={`text-xs ${textMuted} space-y-0.5`}>
                                  <div>{manager.jobTitle}</div>
                                  <div className="flex flex-wrap gap-1">
                                    {manager.departmentName && (
                                      <span>{manager.departmentName}</span>
                                    )}
                                    {manager.businessFunction && manager.departmentName && (
                                      <span>•</span>
                                    )}
                                    {manager.businessFunction && (
                                      <span>{manager.businessFunction}</span>
                                    )}
                                  </div>
                                  {manager.directReportsCount > 0 && (
                                    <div className="text-green-600 dark:text-green-400">
                                      Managing {manager.directReportsCount} employee{manager.directReportsCount !== 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assignment Preview */}
          {selectedManager && (
            <div className={`p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg`}>
              <h4 className={`font-medium ${textPrimary} mb-2`}>Assignment Preview</h4>
              <p className={`text-sm ${textSecondary}`}>
                <strong>{selectedManager.name}</strong> ({selectedManager.employee_id}) 
                will be assigned as line manager for <strong>{selectedEmployees.length}</strong> employee{selectedEmployees.length !== 1 ? 's' : ''}.
              </p>
              {selectedManager.isCurrentLineManager ? (
                <p className={`text-xs ${textMuted} mt-2 flex items-center`}>
                  <span className="text-green-500 mr-1">✓</span>
                  This employee already manages {selectedManager.directReportsCount} other employee{selectedManager.directReportsCount !== 1 ? 's' : ''}.
                </p>
              ) : (
                <p className={`text-xs ${textMuted} mt-2 flex items-center`}>
                  <span className="text-blue-500 mr-1">ℹ</span>
                  This will be their first time as a line manager.
                </p>
              )}
              {currentLineManagerAnalysis.hasLineManager > 0 && (
                <p className={`text-xs ${textMuted} mt-1 flex items-center`}>
                  <span className="text-orange-500 mr-1">⚠</span>
                  {currentLineManagerAnalysis.hasLineManager} employee{currentLineManagerAnalysis.hasLineManager !== 1 ? 's' : ''} currently have different line managers that will be replaced.
                </p>
              )}
            </div>
          )}

          {/* Statistics - IMPROVED */}
          {allEmployees.length > 0 && (
            <div className={`text-xs ${textMuted} text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg`}>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="font-medium">Total Active</div>
                  <div className="text-blue-600 dark:text-blue-400">{allEmployees.length}</div>
                  <div className="text-xs opacity-75">in system</div>
                </div>
                <div>
                  <div className="font-medium">Available</div>
                  <div className="text-green-600 dark:text-green-400">{potentialLineManagers.length}</div>
                  <div className="text-xs opacity-75">for selection</div>
                </div>
                <div>
                  <div className="font-medium">Current Managers</div>
                  <div className="text-orange-600 dark:text-orange-400">{potentialLineManagers.filter(m => m.isCurrentLineManager).length}</div>
                  <div className="text-xs opacity-75">with reports</div>
                </div>
                <div>
                  <div className="font-medium">Selected</div>
                  <div className="text-purple-600 dark:text-purple-400">{selectedLineManagerId ? 1 : 0}</div>
                  <div className="text-xs opacity-75">manager</div>
                </div>
              </div>
              {searchTerm && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <strong>{filteredManagers.length}</strong> results for "{searchTerm}"
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-xs opacity-75">
                Excluded: {selectedEmployees.length} selected employee{selectedEmployees.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            {selectedEmployees.length > 0 && (
              <span className={`text-sm ${textMuted}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} will be updated
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
              onClick={handleAssignLineManager}
              disabled={isProcessing || !selectedLineManagerId || selectedEmployees.length === 0 || isLoadingAllEmployees}
              className={`px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing || !selectedLineManagerId || selectedEmployees.length === 0 || isLoadingAllEmployees
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Assigning...
                </div>
              ) : (
                `Assign Line Manager (${selectedEmployees.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;