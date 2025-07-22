import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  X, 
  Plus, 
  Settings,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grip
} from 'lucide-react';

// Main Multiple Sorting Component
const MultipleSortingSystem = ({ 
  onSortingChange, 
  currentSorting = [], 
  availableFields = [],
  darkMode = false 
}) => {
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Theme classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Add new sort field
  const addSortField = (field, direction = 'asc') => {
    const newSorting = [...currentSorting, { field, direction }];
    onSortingChange(newSorting);
  };

  // Remove sort field
  const removeSortField = (index) => {
    const newSorting = currentSorting.filter((_, i) => i !== index);
    onSortingChange(newSorting);
  };

  // Update sort direction
  const updateSortDirection = (index, direction) => {
    const newSorting = [...currentSorting];
    newSorting[index] = { ...newSorting[index], direction };
    onSortingChange(newSorting);
  };

  // Move sort field (drag and drop)
  const moveSortField = (fromIndex, toIndex) => {
    const newSorting = [...currentSorting];
    const [movedItem] = newSorting.splice(fromIndex, 1);
    newSorting.splice(toIndex, 0, movedItem);
    onSortingChange(newSorting);
  };

  // Clear all sorting
  const clearAllSorting = () => {
    onSortingChange([]);
  };

  // Available fields for dropdown (excluding already selected)
  const availableFieldsForAdd = useMemo(() => {
    const selectedFields = currentSorting.map(s => s.field);
    return availableFields.filter(field => !selectedFields.includes(field.value));
  }, [availableFields, currentSorting]);

  return (
    <div className="relative">
      {/* Sorting Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowSortDialog(!showSortDialog)}
          className={`flex items-center px-3 py-2 text-sm border ${borderColor} rounded-lg transition-colors ${textSecondary} ${hoverBg} ${
            currentSorting.length > 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
          }`}
        >
          <ArrowUpDown size={16} className="mr-2" />
          Sort
          {currentSorting.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {currentSorting.length}
            </span>
          )}
        </button>

        {/* Quick clear button */}
        {currentSorting.length > 0 && (
          <button
            onClick={clearAllSorting}
            className={`p-2 text-red-500 hover:text-red-700 transition-colors`}
            title="Clear all sorting"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Sorting Dialog */}
      {showSortDialog && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <div className={`${bgCard} border ${borderColor} rounded-lg shadow-lg w-96 p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${textPrimary}`}>Multiple Sorting</h3>
              <button
                onClick={() => setShowSortDialog(false)}
                className={`p-1 rounded ${hoverBg}`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Current Sorting List */}
            {currentSorting.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${textSecondary}`}>
                    Sort Order ({currentSorting.length})
                  </span>
                  <button
                    onClick={clearAllSorting}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                </div>
                
                {currentSorting.map((sort, index) => (
                  <SortFieldItem
                    key={`${sort.field}-${index}`}
                    sort={sort}
                    index={index}
                    onDirectionChange={(direction) => updateSortDirection(index, direction)}
                    onRemove={() => removeSortField(index)}
                    onMove={moveSortField}
                    availableFields={availableFields}
                    draggedIndex={draggedIndex}
                    setDraggedIndex={setDraggedIndex}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            )}

            {/* Add New Sort Field */}
            {availableFieldsForAdd.length > 0 && (
              <div className="border-t pt-4">
                <AddSortField
                  availableFields={availableFieldsForAdd}
                  onAdd={addSortField}
                  darkMode={darkMode}
                />
              </div>
            )}

            {/* No fields available */}
            {availableFieldsForAdd.length === 0 && currentSorting.length === 0 && (
              <div className={`text-center py-6 ${textSecondary}`}>
                <ArrowUpDown size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sortable fields available</p>
              </div>
            )}

            {/* Help text */}
            <div className={`mt-4 p-3 ${bgInput} rounded-lg`}>
              <p className={`text-xs ${textSecondary}`}>
                💡 <strong>Tip:</strong> Use Ctrl+Click on column headers for quick multi-sorting, 
                or drag to reorder priority. First field has highest priority.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual Sort Field Item Component
const SortFieldItem = ({ 
  sort, 
  index, 
  onDirectionChange, 
  onRemove, 
  onMove,
  availableFields,
  draggedIndex,
  setDraggedIndex,
  darkMode 
}) => {
  const bgInput = darkMode ? "bg-gray-700" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100";

  const fieldInfo = availableFields.find(f => f.value === sort.field);
  const fieldLabel = fieldInfo?.label || sort.field;

  const handleDragStart = (e) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onMove(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex items-center space-x-2 p-2 border ${borderColor} rounded-lg transition-all ${
        draggedIndex === index ? 'opacity-50' : ''
      } ${hoverBg} cursor-move`}
    >
      {/* Priority Number */}
      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
        {index + 1}
      </div>

      {/* Drag Handle */}
      <Grip size={14} className={`${textSecondary} cursor-move`} />

      {/* Field Name */}
      <div className="flex-1">
        <span className={`text-sm font-medium ${textPrimary}`}>
          {fieldLabel}
        </span>
      </div>

      {/* Direction Toggle */}
      <div className="flex items-center border rounded overflow-hidden">
        <button
          onClick={() => onDirectionChange('asc')}
          className={`px-2 py-1 text-xs transition-colors ${
            sort.direction === 'asc' 
              ? 'bg-blue-500 text-white' 
              : `${textSecondary} ${hoverBg}`
          }`}
        >
          <ArrowUp size={12} />
        </button>
        <button
          onClick={() => onDirectionChange('desc')}
          className={`px-2 py-1 text-xs transition-colors ${
            sort.direction === 'desc' 
              ? 'bg-blue-500 text-white' 
              : `${textSecondary} ${hoverBg}`
          }`}
        >
          <ArrowDown size={12} />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-1 text-red-500 hover:text-red-700 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// Add New Sort Field Component
const AddSortField = ({ availableFields, onAdd, darkMode }) => {
  const [selectedField, setSelectedField] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('asc');

  const bgInput = darkMode ? "bg-gray-700" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";

  const handleAdd = () => {
    if (selectedField) {
      onAdd(selectedField, selectedDirection);
      setSelectedField('');
      setSelectedDirection('asc');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Plus size={16} className="text-green-500" />
        <span className={`text-sm font-medium ${textSecondary}`}>
          Add Sort Field
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Field Selection */}
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value)}
          className={`flex-1 px-3 py-2 text-sm border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="">Select field...</option>
          {availableFields.map(field => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>

        {/* Direction Selection */}
        <select
          value={selectedDirection}
          onChange={(e) => setSelectedDirection(e.target.value)}
          className={`px-3 py-2 text-sm border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          disabled={!selectedField}
          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
            selectedField 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
          }`}
        >
          Add
        </button>
      </div>
    </div>
  );
};

// Demo Component with sample data
const SortingDemo = () => {
  const [sorting, setSorting] = useState([
    { field: 'name', direction: 'asc' },
    { field: 'department', direction: 'desc' }
  ]);

  const availableFields = [
    { value: 'name', label: 'Full Name' },
    { value: 'employee_id', label: 'Employee ID' },
    { value: 'email', label: 'Email' },
    { value: 'department', label: 'Department' },
    { value: 'job_title', label: 'Job Title' },
    { value: 'start_date', label: 'Start Date' },
    { value: 'salary', label: 'Salary' },
    { value: 'years_of_service', label: 'Years of Service' },
    { value: 'status', label: 'Status' },
    { value: 'line_manager', label: 'Line Manager' }
  ];

  const handleSortingChange = (newSorting) => {
    setSorting(newSorting);
    console.log('Sorting changed:', newSorting);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Excel-style Multiple Sorting System</h1>
        
        <div className="mb-6">
          <MultipleSortingSystem
            currentSorting={sorting}
            onSortingChange={handleSortingChange}
            availableFields={availableFields}
            darkMode={false}
          />
        </div>

        {/* Current Sorting Display */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="font-semibold mb-3">Current Sorting Configuration:</h3>
          {sorting.length > 0 ? (
            <div className="space-y-2">
              {sorting.map((sort, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium">
                    {availableFields.find(f => f.value === sort.field)?.label || sort.field}
                  </span>
                  <span className="text-gray-500">
                    ({sort.direction === 'asc' ? 'Ascending' : 'Descending'})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No sorting applied</p>
          )}
        </div>

    
      </div>
    </div>
  );
};

export default SortingDemo;