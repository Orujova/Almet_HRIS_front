// src/components/headcount/BulkEditModal.jsx - FIXED with proper data fetching
import { useState, useEffect, useMemo } from 'react';
import { X, Edit3, Users, Building, User, Briefcase } from 'lucide-react';

const BulkEditModal = ({
  isOpen,
  onClose,
  onAction,
  selectedEmployees = [],
  referenceData = {},
  loading = false,
  darkMode = false
}) => {
  const [selectedField, setSelectedField] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract reference data with safe defaults
  const {
    lineManagers = [],
    departments = [],
    units = [],
    positionGroups = [],
    businessFunctions = []
  } = referenceData;

  // Theme classes
  const bgModal = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const bgHover = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedField('');
      setSelectedValue('');
    }
  }, [isOpen]);

  // Field options with their corresponding data
  const fieldOptions = useMemo(() => [
    {
      value: 'line_manager',
      label: 'Line Manager',
      icon: User,
      description: 'Change line manager for selected employees',
      data: lineManagers,
      displayKey: 'name',
      valueKey: 'id'
    },
    {
      value: 'department',
      label: 'Department',
      icon: Building,
      description: 'Move employees to a different department',
      data: departments,
      displayKey: 'label',
      valueKey: 'value'
    },
    {
      value: 'unit',
      label: 'Unit',
      icon: Users,
      description: 'Assign employees to a specific unit',
      data: units,
      displayKey: 'label',
      valueKey: 'value'
    },
    {
      value: 'position_group',
      label: 'Position Group',
      icon: Briefcase,
      description: 'Change position group for employees',
      data: positionGroups,
      displayKey: 'label',
      valueKey: 'value'
    },
    {
      value: 'business_function',
      label: 'Business Function',
      icon: Building,
      description: 'Move employees to different business function',
      data: businessFunctions,
      displayKey: 'label',
      valueKey: 'value'
    }
  ], [lineManagers, departments, units, positionGroups, businessFunctions]);

  // Get current field data
  const currentFieldData = useMemo(() => {
    const field = fieldOptions.find(f => f.value === selectedField);
    if (!field) return [];
    
    return Array.isArray(field.data) ? field.data : [];
  }, [fieldOptions, selectedField]);

  // Handle action execution
  const handleAction = async () => {
    if (!selectedField) {
      alert('Please select a field to edit');
      return;
    }

    if (!selectedValue) {
      alert('Please select a value');
      return;
    }

    if (selectedEmployees.length === 0) {
      alert('No employees selected');
      return;
    }

    setIsProcessing(true);
    
    try {
      await onAction('bulkEdit', {
        field: selectedField,
        value: selectedValue,
        selectedEmployeeIds: selectedEmployees
      });
      
      // Close modal on success
      onClose();
    } catch (error) {
      console.error('Bulk edit failed:', error);
      alert(`Failed to update ${selectedField}: ${error.message}`);
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
      <div className={`relative ${bgModal} rounded-lg shadow-xl w-full max-w-2xl mx-4  overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
              <Edit3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>
                Bulk Edit
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Field Selection */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
              Select Field to Edit
            </label>
            <div className="grid grid-cols-2 gap-3">
              {fieldOptions.map((field) => {
                const Icon = field.icon;
                const isSelected = selectedField === field.value;
                const hasData = Array.isArray(field.data) && field.data.length > 0;
                
                return (
                  <div
                    key={field.value}
                    onClick={() => hasData ? setSelectedField(field.value) : null}
                    className={`p-4 border rounded-lg transition-all ${
                      !hasData 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer ' + (isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
                          : `${bgHover} ${borderColor}`)
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-3 ${isSelected ? 'text-blue-500' : textMuted}`} />
                      <div className="flex-1">
                        <h3 className={`font-medium ${textPrimary}`}>
                          {field.label}
                          {!hasData && (
                            <span className={`ml-2 text-xs ${textMuted}`}>
                              (No data available)
                            </span>
                          )}
                        </h3>
                        <p className={`text-sm ${textMuted}`}>
                          {field.description}
                        </p>
                      </div>
                      {isSelected && hasData && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value Selection */}
          {selectedField && (
            <div>
              <label className={`block text-sm font-medium ${textPrimary} mb-3`}>
                Select New Value
              </label>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className={textMuted}>Loading options...</span>
                </div>
              ) : currentFieldData.length === 0 ? (
                <div className={`p-4 border ${borderColor} rounded-lg text-center`}>
                  <p className={textMuted}>No options available for this field</p>
                </div>
              ) : (
                <select
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Choose an option...</option>
                  {currentFieldData.map((item, index) => {
                    const currentField = fieldOptions.find(f => f.value === selectedField);
                    const value = item[currentField?.valueKey || 'id'];
                    const label = item[currentField?.displayKey || 'name'] || item.label;
                    
                    return (
                      <option key={`${selectedField}-${value}-${index}`} value={value}>
                        {label}
                        {item.employee_count !== undefined && ` (${item.employee_count} employees)`}
                        {item.hierarchy_level !== undefined && ` - Level ${item.hierarchy_level}`}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          )}

          {/* Preview */}
          {selectedField && selectedValue && (
            <div className={`p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg`}>
              <h4 className={`font-medium ${textPrimary} mb-2`}>Preview Changes</h4>
              <p className={`text-sm ${textSecondary}`}>
                This will update the <strong>{fieldOptions.find(f => f.value === selectedField)?.label}</strong> for{' '}
                <strong>{selectedEmployees.length}</strong> employee{selectedEmployees.length !== 1 ? 's' : ''} to{' '}
                <strong>
                  {currentFieldData.find(item => {
                    const currentField = fieldOptions.find(f => f.value === selectedField);
                    return item[currentField?.valueKey || 'id'] == selectedValue;
                  })?.[fieldOptions.find(f => f.value === selectedField)?.displayKey || 'name']}
                </strong>.
              </p>
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
              onClick={handleAction}
              disabled={isProcessing || !selectedField || !selectedValue || selectedEmployees.length === 0}
              className={`px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isProcessing || !selectedField || !selectedValue || selectedEmployees.length === 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Employees'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;