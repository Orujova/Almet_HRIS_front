// src/components/headcount/BulkEditModal.jsx - FIXED API Integration
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
  const [selectedValue, setSelectedValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ========================================
  // EMPLOYEES DATA FROM HOOK
  // ========================================
  const {
    formattedEmployees = [],
    loading: employeesLoading = {},
    refreshEmployees
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

  // ========================================
  // PREPARE LINE MANAGER OPTIONS
  // ========================================
  const lineManagerOptions = useMemo(() => {
    if (!formattedEmployees || formattedEmployees.length === 0) {
      return [];
    }

    // Seçilmiş employeeləri filter et və line manager options hazırla
    const availableManagers = formattedEmployees
      .filter(emp => !selectedEmployees.includes(emp.id))
      .map(emp => ({
        id: emp.id,
        value: emp.id,
        label: emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        name: emp.fullName || emp.displayName || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        employee_id: emp.employee_id,
        jobTitle: emp.jobTitle || emp.job_title,
        departmentName: emp.departmentInfo || emp.department_name,
        businessFunction: emp.business_function_name,
        email: emp.email,
        isLineManager: emp.managementInfo?.isLineManager || emp.direct_reports_count > 0,
        directReportsCount: emp.managementInfo?.directReportsCount || emp.direct_reports_count || 0
      }))
      .sort((a, b) => {
        // Line managerləri əvvəl, sonra ad ilə sort et
        if (a.isLineManager && !b.isLineManager) return -1;
        if (!a.isLineManager && b.isLineManager) return 1;
        return a.name.localeCompare(b.name);
      });

    return availableManagers;
  }, [formattedEmployees, selectedEmployees]);

  // Axtarış əsasında filter
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return lineManagerOptions;
    
    const searchLower = searchTerm.toLowerCase();
    return lineManagerOptions.filter(option => 
      option.name.toLowerCase().includes(searchLower) ||
      option.employee_id?.toLowerCase().includes(searchLower) ||
      option.email?.toLowerCase().includes(searchLower) ||
      option.jobTitle?.toLowerCase().includes(searchLower) ||
      option.departmentName?.toLowerCase().includes(searchLower) ||
      option.businessFunction?.toLowerCase().includes(searchLower)
    );
  }, [lineManagerOptions, searchTerm]);

  // Seçilmiş manager object
  const selectedManager = useMemo(() => {
    return lineManagerOptions.find(opt => opt.value === selectedValue);
  }, [lineManagerOptions, selectedValue]);

  // Loading state
  const isDataLoading = employeesLoading?.employees;

  // ========================================
  // INITIALIZATION
  // ========================================
  useEffect(() => {
    if (isOpen) {
      setSelectedValue('');
      setSearchTerm('');
      setDropdownOpen(false);
      
      // Data refresh
      if (refreshEmployees && typeof refreshEmployees === 'function') {
        refreshEmployees();
      }
    }
  }, [isOpen, refreshEmployees]);

  // Click outside to close dropdown
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

  // Action handler
  const handleAction = async () => {
    if (!selectedValue) {
      alert('Zəhmət olmasa line manager seçin');
      return;
    }

    if (selectedEmployees.length === 0) {
      alert('Heç bir employee seçilməyib');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Backend-uyğun payload format
      await onAction('bulkAssignLineManager', {
        employee_ids: selectedEmployees,
        line_manager_id: selectedValue
      });
      
      console.log('✅ Line manager təyinatı uğurlu oldu');
      onClose();
    } catch (error) {
      console.error('❌ Line manager təyinatı uğursuz:', error);
      alert(`Line manager təyinatı uğursuz: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manager seçimi
  const handleManagerSelect = (managerId) => {
    setSelectedValue(managerId);
    setDropdownOpen(false);
    setSearchTerm('');
  };

  // Data refresh
  const handleRefreshData = () => {
    if (refreshEmployees && typeof refreshEmployees === 'function') {
      refreshEmployees();
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
      <div className={`relative ${bgModal} rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
              <Edit3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>
                Change Line Manager
              </h2>
              <p className={`text-sm ${textMuted}`}>
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={handleRefreshData}
              disabled={isProcessing || isDataLoading}
              className={`p-2 rounded-lg ${bgHover} transition-colors disabled:opacity-50`}
              title="Refresh employee data"
            >
              <RefreshCw 
                className={`w-4 h-4 ${textSecondary} ${isDataLoading ? 'animate-spin' : ''}`} 
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

        {/* Loading State */}
        {isDataLoading && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm text-blue-800 dark:text-blue-300">
                Employee məlumatları yüklənir...
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Selected Employees Display */}
          {selectedEmployeeData.length > 0 && (
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
                Seçilmiş Employeelər ({selectedEmployeeData.length})
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
                      </div>
                    </div>
                    <div className={`text-xs ${textMuted}`}>
                      {emp.departmentInfo || emp.department_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line Manager Selection */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
              Yeni Line Manager Seçin
            </label>
            
            {isDataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className={textMuted}>Employeelər yüklənir...</span>
              </div>
            ) : lineManagerOptions.length === 0 ? (
              <div className={`p-4 border ${borderColor} rounded-lg text-center`}>
                <Users className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                <p className={textMuted}>Line manager kimi təyin edilə bilən employee yoxdur</p>
                <button
                  onClick={handleRefreshData}
                  className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Yenidən Yüklə
                </button>
              </div>
            ) : (
              <div ref={dropdownRef} className="relative">
                {/* Searchable Dropdown Input */}
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
                          {selectedManager.isLineManager && (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                              Manager
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${textMuted} mt-0.5 flex flex-wrap gap-2`}>
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
                        placeholder="Ad, ID, job title, department ilə axtarın..."
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
                          setSelectedValue('');
                          setSearchTerm('');
                        }}
                        className={`mr-2 ${textMuted} hover:text-red-500 transition-colors`}
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
                    {filteredOptions.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Users className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                        <p className={textMuted}>
                          {searchTerm ? 'Axtarışa uyğun employee tapılmadı' : 'Employee mövcud deyil'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                          >
                            Axtarışı təmizlə
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="py-1">
                        {filteredOptions.map((manager) => (
                          <div
                            key={manager.id}
                            onClick={() => handleManagerSelect(manager.value)}
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
                                  {manager.isLineManager && (
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
                                      {manager.directReportsCount} direct report{manager.directReportsCount !== 1 ? 's' : ''}
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

          {/* Preview */}
          {selectedManager && (
            <div className={`p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg`}>
              <h4 className={`font-medium ${textPrimary} mb-2`}>Dəyişiklik Önizləməsi</h4>
              <p className={`text-sm ${textSecondary}`}>
                <strong>{selectedManager.name}</strong> ({selectedManager.employee_id}) 
                {' '}<strong>{selectedEmployees.length}</strong> employee-in line manager-i olaraq təyin ediləcək.
              </p>
              {selectedManager.isLineManager && (
                <p className={`text-xs ${textMuted} mt-2 flex items-center`}>
                  <span className="text-green-500 mr-1">✓</span>
                  Bu employee artıq {selectedManager.directReportsCount} başqa employee-in manager-idir.
                </p>
              )}
            </div>
          )}

          {/* Statistics */}
          {lineManagerOptions.length > 0 && (
            <div className={`text-xs ${textMuted} text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Ümumi Employeelər</div>
                  <div>{lineManagerOptions.length}</div>
                </div>
                <div>
                  <div className="font-medium">Hazırda Manager</div>
                  <div>{lineManagerOptions.filter(opt => opt.isLineManager).length}</div>
                </div>
              </div>
              {searchTerm && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <strong>{filteredOptions.length}</strong> nəticə "{searchTerm}" üçün
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            {selectedEmployees.length > 0 && (
              <span className={`text-sm ${textMuted}`}>
                {selectedEmployees.length} employee yenilənəcək
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className={`px-4 py-2 text-sm border ${borderColor} rounded-lg ${textSecondary} ${bgHover} transition-colors disabled:opacity-50`}
            >
              Ləğv et
            </button>
            <button
              onClick={handleAction}
              disabled={isProcessing || !selectedValue || selectedEmployees.length === 0}
              className={`px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing || !selectedValue || selectedEmployees.length === 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Təyin edilir...
                </div>
              ) : (
                `Line Manager Təyin Et (${selectedEmployees.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;