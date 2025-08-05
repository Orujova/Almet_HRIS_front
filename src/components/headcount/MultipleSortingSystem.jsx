// src/components/headcount/AdvancedMultipleSortingSystem.jsx - SIMPLE VERSION
import React, { useState, useMemo, useCallback } from 'react';
import { 
  X, 
  Plus, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grip,
  Trash2,
  AlertCircle
} from 'lucide-react';

// Simple Multiple Sorting Component - NO SAVE/LOAD, just immediate sorting
export const AdvancedMultipleSortingSystem = ({ 
  onSortingChange, 
  currentSorting = [], 
  availableFields = [],
  darkMode = false,
  maxSortLevels = 10
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Theme classes
  const bgInput = darkMode ? "bg-gray-700" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  // Add new sort field with duplicate check
  const addSortField = useCallback((field, direction = 'asc') => {
    const exists = currentSorting.some(sort => sort.field === field);
    if (exists) return; // Skip if already exists
    
    if (currentSorting.length >= maxSortLevels) return; // Skip if max reached

    const newSorting = [...currentSorting, { field, direction }];
    onSortingChange(newSorting);
  }, [currentSorting, maxSortLevels, onSortingChange]);

  // Remove sort field
  const removeSortField = useCallback((index) => {
    const newSorting = currentSorting.filter((_, i) => i !== index);
    onSortingChange(newSorting);
  }, [currentSorting, onSortingChange]);

  // Update sort direction
  const updateSortDirection = useCallback((index, direction) => {
    const newSorting = [...currentSorting];
    newSorting[index] = { ...newSorting[index], direction };
    onSortingChange(newSorting);
  }, [currentSorting, onSortingChange]);

  // Move sort field (drag and drop)
  const moveSortField = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    const newSorting = [...currentSorting];
    const [movedItem] = newSorting.splice(fromIndex, 1);
    newSorting.splice(toIndex, 0, movedItem);
    onSortingChange(newSorting);
  }, [currentSorting, onSortingChange]);

  // Clear all sorting
  const clearAllSorting = useCallback(() => {
    onSortingChange([]);
  }, [onSortingChange]);

  // Available fields for dropdown (excluding already selected)
  const availableFieldsForAdd = useMemo(() => {
    const selectedFields = currentSorting.map(s => s.field);
    return availableFields.filter(field => !selectedFields.includes(field.value));
  }, [availableFields, currentSorting]);

  // Validation
  const canAddMore = availableFieldsForAdd.length > 0 && currentSorting.length < maxSortLevels;
  const hasActiveSorting = currentSorting.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <ArrowUpDown size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className={`font-semibold ${textPrimary}`}>Advanced Multiple Sorting</h3>
            <p className={`text-xs ${textSecondary}`}>Excel-style multi-level sorting</p>
          </div>
        </div>
        {hasActiveSorting && (
          <button
            onClick={clearAllSorting}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Current Sorting List */}
      {hasActiveSorting && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${textSecondary}`}>
              Sort Levels ({currentSorting.length}/{maxSortLevels})
            </span>
          </div>
          
          <div className="space-y-2">
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
                dragOverIndex={dragOverIndex}
                setDragOverIndex={setDragOverIndex}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add New Sort Field */}
      {canAddMore && (
        <div className={`${hasActiveSorting ? 'border-t border-gray-200 dark:border-gray-700 pt-6' : ''}`}>
          <AddSortField
            availableFields={availableFieldsForAdd}
            onAdd={addSortField}
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Empty State */}
      {!hasActiveSorting && !canAddMore && (
        <div className={`text-center py-8 px-4 ${textSecondary}`}>
          <ArrowUpDown size={48} className="mx-auto mb-4 opacity-30" />
          <h4 className="font-medium mb-2">No Sorting Applied</h4>
          <p className="text-sm">Add sorting criteria to organize your data</p>
        </div>
      )}

      {/* Help Section */}
      <div className={`p-4 ${bgInput} rounded-lg`}>
        <div className="space-y-2">
          <h4 className={`text-xs font-semibold ${textPrimary} flex items-center`}>
            <AlertCircle size={12} className="mr-1" />
            Quick Tips
          </h4>
          <ul className={`text-xs ${textSecondary} space-y-1`}>
            <li>• Drag items to reorder priority (higher = more important)</li>
            <li>• Click column headers while holding Ctrl for quick multi-sort</li>
            <li>• First sort level has the highest priority</li>
            <li>• Maximum {maxSortLevels} sort levels allowed</li>
          </ul>
        </div>
      </div>
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
  dragOverIndex,
  setDragOverIndex,
  darkMode 
}) => {
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100";

  const fieldInfo = availableFields.find(f => f.value === sort.field);
  const fieldLabel = fieldInfo?.label || sort.field;

  const handleDragStart = (e) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onMove(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const isDragging = draggedIndex === index;
  const isDragOver = dragOverIndex === index && draggedIndex !== index;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition-all cursor-move ${
        isDragging ? 'opacity-50 border-blue-400' :
        isDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' :
        `${borderColor} ${hoverBg}`
      }`}
    >
      {/* Priority Badge */}
      <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
        index === 0 ? 'bg-blue-500 text-white' :
        index === 1 ? 'bg-blue-400 text-white' :
        'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
      }`}>
        {index + 1}
      </div>

      {/* Drag Handle */}
      <Grip size={16} className={`${textSecondary} cursor-move flex-shrink-0`} />

      {/* Field Info */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${textPrimary} truncate`}>
          {fieldLabel}
        </div>
        {fieldInfo?.description && (
          <div className={`text-xs ${textSecondary} truncate`}>
            {fieldInfo.description}
          </div>
        )}
      </div>

      {/* Direction Toggle */}
      <div className="flex items-center border rounded-lg overflow-hidden">
        <button
          onClick={() => onDirectionChange('asc')}
          className={`px-3 py-2 text-xs font-medium transition-all ${
            sort.direction === 'asc' 
              ? 'bg-blue-500 text-white shadow-sm' 
              : `${textSecondary} ${hoverBg}`
          }`}
          title="Sort Ascending (A→Z, 1→9)"
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={() => onDirectionChange('desc')}
          className={`px-3 py-2 text-xs font-medium transition-all ${
            sort.direction === 'desc' 
              ? 'bg-blue-500 text-white shadow-sm' 
              : `${textSecondary} ${hoverBg}`
          }`}
          title="Sort Descending (Z→A, 9→1)"
        >
          <ArrowDown size={14} />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
        title="Remove this sort level"
      >
        <X size={16} />
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

  const quickAddField = (field) => {
    onAdd(field.value, 'asc');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <Plus size={16} className="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h4 className={`font-medium ${textPrimary}`}>Add Sort Level</h4>
          <p className={`text-xs ${textSecondary}`}>Choose a field to sort by</p>
        </div>
      </div>

      {/* Manual Add */}
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <label className={`block text-xs font-medium ${textSecondary} mb-1`}>
            Field
          </label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className={`w-full px-3 py-2 text-sm border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select field...</option>
            {availableFields.map(field => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-xs font-medium ${textSecondary} mb-1`}>
            Direction
          </label>
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
            className={`px-3 py-2 text-sm border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>
        </div>

        <button
          onClick={handleAdd}
          disabled={!selectedField}
          className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2 ${
            selectedField 
              ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' 
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>

      {/* Quick Add Buttons */}
      {availableFields.length > 0 && (
        <div>
          <label className={`block text-xs font-medium ${textSecondary} mb-2`}>
            Quick Add (A→Z):
          </label>
          <div className="flex flex-wrap gap-2">
            {availableFields.slice(0, 8).map(field => (
              <button
                key={field.value}
                onClick={() => quickAddField(field)}
                className={`px-3 py-1 text-xs rounded-full border ${borderColor} ${textSecondary} hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 transition-colors`}
              >
                {field.label}
              </button>
            ))}
           
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedMultipleSortingSystem;