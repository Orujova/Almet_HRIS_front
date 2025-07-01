// src/components/headcount/EmployeeTag.jsx - Tag Display Component
import { X } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * Employee Tag Component
 * Displays employee tags with type-based colors and optional remove functionality
 */
const EmployeeTag = ({ 
  tag, 
  size = "md", 
  removable = false, 
  onRemove, 
  className = "",
  onClick
}) => {
  const { darkMode } = useTheme();

  // Tag type color mapping
  const getTagTypeColor = (tagType) => {
    const typeColors = {
      'skill': {
        bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-100',
        text: darkMode ? 'text-blue-300' : 'text-blue-800',
        border: darkMode ? 'border-blue-800' : 'border-blue-200'
      },
      'department': {
        bg: darkMode ? 'bg-green-900/20' : 'bg-green-100',
        text: darkMode ? 'text-green-300' : 'text-green-800',
        border: darkMode ? 'border-green-800' : 'border-green-200'
      },
      'project': {
        bg: darkMode ? 'bg-purple-900/20' : 'bg-purple-100',
        text: darkMode ? 'text-purple-300' : 'text-purple-800',
        border: darkMode ? 'border-purple-800' : 'border-purple-200'
      },
      'certification': {
        bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-100',
        text: darkMode ? 'text-yellow-300' : 'text-yellow-800',
        border: darkMode ? 'border-yellow-800' : 'border-yellow-200'
      },
      'other': {
        bg: darkMode ? 'bg-gray-700' : 'bg-gray-100',
        text: darkMode ? 'text-gray-300' : 'text-gray-800',
        border: darkMode ? 'border-gray-600' : 'border-gray-200'
      }
    };

    return typeColors[tagType] || typeColors['other'];
  };

  // Size variants
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  // Handle tag data - support both object and string formats
  const tagData = typeof tag === 'string' ? { name: tag, tag_type: 'other' } : tag;
  const tagName = tagData.name || tagData.label || 'Unknown';
  const tagType = tagData.tag_type || tagData.type || 'other';
  const tagDescription = tagData.description;

  const colors = getTagTypeColor(tagType);

  // Handle remove click
  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(tag);
    }
  };

  // Handle tag click
  const handleClick = (e) => {
    if (onClick) {
      onClick(tag, e);
    }
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border transition-colors
        ${sizeClasses[size]}
        ${colors.bg}
        ${colors.text}
        ${colors.border}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
      onClick={handleClick}
      title={tagDescription || `${tagType} tag: ${tagName}`}
    >
      {/* Tag type indicator (optional dot) */}
      <span 
        className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${
          tagType === 'skill' ? 'bg-blue-500' :
          tagType === 'department' ? 'bg-green-500' :
          tagType === 'project' ? 'bg-purple-500' :
          tagType === 'certification' ? 'bg-yellow-500' :
          'bg-gray-500'
        }`}
      />
      
      {/* Tag name */}
      <span className="truncate max-w-24">
        {tagName}
      </span>

      {/* Remove button */}
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className={`ml-1 ${colors.text} hover:text-red-500 transition-colors flex-shrink-0`}
          title="Remove tag"
        >
          <X size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} />
        </button>
      )}
    </span>
  );
};

export default EmployeeTag;