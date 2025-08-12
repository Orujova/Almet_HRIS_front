// src/components/headcount/BulkEditModal.jsx - Enhanced Design with Project Colors
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
  const accentOrange = darkMode ? "text-orange-400" : "text-orange-600";
  const accentGreen = darkMode ? "text-green-400" : "text-emerald-600";

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${bgModal} rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden border ${borderColor}`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="w-7 h-7 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg flex items-center justify-center mr-3">
              <Edit3 className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className={`text-base font-semibold ${textPrimary}`}>
                Assign Line Manager
              </h2>
              <p className={`text-xs ${textMuted}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefreshData}
              disabled={isProcessing || isLoadingAllEmployees}
              className={`p-1.5 rounded-lg ${bgHover} transition-all duration-200 disabled:opacity-50`}
              title="Refresh employee data"
            >
              <RefreshCw 
                className={`w-3.5 h-3.5 ${textSecondary} ${isLoadingAllEmployees ? 'animate-spin' : ''}`} 
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

        {/* Loading State - Enhanced */}
        {isLoadingAllEmployees && (
          <div className="px-5 py-2.5 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-900">
            <div className="flex items-center">
              <div className="w-3 h-3 border border-almet-sapphire border-t-transparent rounded-full animate-spin mr-2.5"></div>
              <span className="text-xs text-almet-sapphire dark:text-blue-300 font-medium">
                Loading all employees from system...
              </span>
            </div>
            <div className="text-xs text-almet-waterloo dark:text-blue-400 mt-1 ml-5">
              Fetching complete employee directory
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-5 max-h-96 overflow-y-auto">
          {/* Selected Employees Display */}
          {selectedEmployeeData.length > 0 && (
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-2.5`}>
                Selected Employees ({selectedEmployeeData.length})
              </label>
              <div className="max-h-28 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 space-y-1.5">
                {selectedEmployeeData.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-almet-sapphire/20 to-almet-astral/20 rounded-lg flex items-center justify-center mr-2.5">
                        <span className="text-xs font-medium text-almet-sapphire">
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
                    <div className={`text-xs`}>
                      {emp.line_manager_id ? (
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full font-medium">
                          Has Manager
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-full font-medium">
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
            <label className={`block text-sm font-medium ${textPrimary} mb-2.5`}>
              Select New Line Manager
            </label>
            
            {isLoadingAllEmployees ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border border-almet-sapphire border-t-transparent rounded-full animate-spin mr-2.5"></div>
                <span className={`text-sm ${textMuted}`}>Loading all employees...</span>
              </div>
            ) : potentialLineManagers.length === 0 ? (
              <div className={`p-4 border ${borderColor} rounded-lg text-center bg-gray-50 dark:bg-gray-800/30`}>
                <Users className={`w-6 h-6 mx-auto mb-2 ${textMuted}`} />
                <p className={`text-sm ${textMuted} mb-1`}>No available employees to assign as line manager</p>
                <p className={`text-xs ${textMuted}`}>
                  {allEmployees.length > 0 
                    ? `All ${allEmployees.length} active employees are either selected or unavailable.`
                    : 'No active employees found in the system.'
                  }
                </p>
                <button
                  onClick={handleRefreshData}
                  className="mt-2.5 px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <div ref={dropdownRef} className="relative">
                {/* Searchable Dropdown */}
                <div
                  onClick={() => !isProcessing && setDropdownOpen(!dropdownOpen)}
                  className={`w-full px-3.5 py-2.5 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} cursor-pointer flex items-center justify-between transition-all duration-200 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-almet-sapphire/30'}`}
                >
                  <div className="flex items-center flex-1">
                    <Search className={`w-3.5 h-3.5 mr-2.5 ${textMuted}`} />
                    {selectedManager ? (
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className={`font-medium text-sm ${textPrimary}`}>
                            {selectedManager.name}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 ${textMuted}`}>
                            {selectedManager.employee_id}
                          </span>
                          {selectedManager.isCurrentLineManager && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium">
                              Manager
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${textMuted} mt-0.5 flex flex-wrap gap-1.5`}>
                          <span>{selectedManager.jobTitle}</span>
                          {selectedManager.departmentName && (
                            <span>• {selectedManager.departmentName}</span>
                          )}
                          {selectedManager.directReportsCount > 0 && (
                            <span>• {selectedManager.directReportsCount} reports</span>
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
                        className={`bg-transparent outline-none flex-1 text-sm ${textPrimary} disabled:opacity-50 placeholder:${textMuted}`}
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
                        className={`mr-1.5 ${textMuted} hover:text-red-500 transition-colors disabled:opacity-50`}
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
                    {filteredManagers.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <Users className={`w-6 h-6 mx-auto mb-2 ${textMuted}`} />
                        <p className={`text-sm ${textMuted} mb-1`}>
                          {searchTerm ? 'No employees found matching search' : 'No employees available'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-1.5 text-xs text-almet-sapphire hover:text-almet-astral"
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
                            className={`px-3.5 py-2.5 cursor-pointer transition-all duration-200 ${bgHover} border-l-3 border-transparent hover:border-almet-sapphire hover:bg-almet-mystic/30`}
                          >
                            <div className="flex items-center">
                              <User className={`w-3.5 h-3.5 mr-2.5 ${textMuted} flex-shrink-0`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-1.5 mb-1">
                                  <span className={`font-medium text-sm ${textPrimary}`}>
                                    {manager.name}
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 ${textMuted}`}>
                                    {manager.employee_id}
                                  </span>
                                  {manager.isCurrentLineManager && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium">
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
                                    <div className={`${accentGreen} font-medium`}>
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
            <div className={`p-3.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 rounded-lg`}>
              <h4 className={`font-medium text-sm ${textPrimary} mb-1.5`}>Assignment Preview</h4>
              <p className={`text-xs ${textSecondary}`}>
                <strong>{selectedManager.name}</strong> ({selectedManager.employee_id}) 
                will be assigned as line manager for <strong>{selectedEmployees.length}</strong> employee{selectedEmployees.length !== 1 ? 's' : ''}.
              </p>
              {selectedManager.isCurrentLineManager ? (
                <p className={`text-xs ${textMuted} mt-1.5 flex items-center`}>
                  <span className="text-emerald-500 mr-1.5">✓</span>
                  Currently manages {selectedManager.directReportsCount} other employee{selectedManager.directReportsCount !== 1 ? 's' : ''}.
                </p>
              ) : (
                <p className={`text-xs ${textMuted} mt-1.5 flex items-center`}>
                  <span className="text-blue-500 mr-1.5">ℹ</span>
                  This will be their first management role.
                </p>
              )}
              {currentLineManagerAnalysis.hasLineManager > 0 && (
                <p className={`text-xs ${textMuted} mt-1 flex items-center`}>
                  <span className="text-amber-500 mr-1.5">⚠</span>
                  {currentLineManagerAnalysis.hasLineManager} employee{currentLineManagerAnalysis.hasLineManager !== 1 ? 's' : ''} will have their current manager replaced.
                </p>
              )}
            </div>
          )}

          {/* Statistics - Enhanced */}
          {allEmployees.length > 0 && (
            <div className={`text-xs ${textMuted} text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg`}>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <div className="font-medium text-xs">Total Active</div>
                  <div className={`text-sm font-semibold ${accentBlue}`}>{allEmployees.length}</div>
                  <div className="text-xs opacity-75">in system</div>
                </div>
                <div>
                  <div className="font-medium text-xs">Available</div>
                  <div className={`text-sm font-semibold ${accentGreen}`}>{potentialLineManagers.length}</div>
                  <div className="text-xs opacity-75">for selection</div>
                </div>
                <div>
                  <div className="font-medium text-xs">Current Managers</div>
                  <div className={`text-sm font-semibold ${accentOrange}`}>{potentialLineManagers.filter(m => m.isCurrentLineManager).length}</div>
                  <div className="text-xs opacity-75">with reports</div>
                </div>
                <div>
                  <div className="font-medium text-xs">Selected</div>
                  <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">{selectedLineManagerId ? 1 : 0}</div>
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
        <div className={`px-5 py-3.5 border-t ${borderColor} flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30`}>
          <div className="flex items-center">
            {selectedEmployees.length > 0 && (
              <span className={`text-xs ${textMuted} font-medium`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} will be updated
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
              onClick={handleAssignLineManager}
              disabled={isProcessing || !selectedLineManagerId || selectedEmployees.length === 0 || isLoadingAllEmployees}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing || !selectedLineManagerId || selectedEmployees.length === 0 || isLoadingAllEmployees
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-almet-sapphire to-almet-astral hover:from-almet-astral hover:to-almet-steel-blue text-white shadow-md hover:shadow-lg'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                  Assigning...
                </div>
              ) : (
                `Assign Manager (${selectedEmployees.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;