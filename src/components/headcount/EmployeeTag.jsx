// src/components/headcount/EmployeeTag.jsx - Modern Soft Design
"use client";
import { X, Hash } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

/**
 * Modern Employee Tag Component with Soft Colors
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

  // Modern soft color palette for tag types
  const getTagTypeColor = (tagType) => {
    const typeColors = {
      'skill': {
        bg: darkMode ? 'bg-slate-900/20' : 'bg-slate-50',
        text: darkMode ? 'text-slate-300' : 'text-slate-700',
        border: darkMode ? 'border-slate-700/30' : 'border-slate-200/60',
        dot: darkMode ? 'text-slate-400' : 'text-slate-500'
      },
      'department': {
        bg: darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50',
        text: darkMode ? 'text-emerald-300' : 'text-emerald-700',
        border: darkMode ? 'border-emerald-700/30' : 'border-emerald-200/60',
        dot: darkMode ? 'text-emerald-400' : 'text-emerald-500'
      },
      'project': {
        bg: darkMode ? 'bg-violet-900/20' : 'bg-violet-50',
        text: darkMode ? 'text-violet-300' : 'text-violet-700',
        border: darkMode ? 'border-violet-700/30' : 'border-violet-200/60',
        dot: darkMode ? 'text-violet-400' : 'text-violet-500'
      },
      'certification': {
        bg: darkMode ? 'bg-amber-900/20' : 'bg-amber-50',
        text: darkMode ? 'text-amber-300' : 'text-amber-700',
        border: darkMode ? 'border-amber-700/30' : 'border-amber-200/60',
        dot: darkMode ? 'text-amber-400' : 'text-amber-500'
      },
      'leave': {
        bg: darkMode ? 'bg-rose-900/20' : 'bg-rose-50',
        text: darkMode ? 'text-rose-300' : 'text-rose-700',
        border: darkMode ? 'border-rose-700/30' : 'border-rose-200/60',
        dot: darkMode ? 'text-rose-400' : 'text-rose-500'
      },
      'maternity': {
        bg: darkMode ? 'bg-pink-900/20' : 'bg-pink-50',
        text: darkMode ? 'text-pink-300' : 'text-pink-700',
        border: darkMode ? 'border-pink-700/30' : 'border-pink-200/60',
        dot: darkMode ? 'text-pink-400' : 'text-pink-500'
      },
      'other': {
        bg: darkMode ? 'bg-gray-800/30' : 'bg-gray-50',
        text: darkMode ? 'text-gray-300' : 'text-gray-600',
        border: darkMode ? 'border-gray-600/30' : 'border-gray-200/60',
        dot: darkMode ? 'text-gray-400' : 'text-gray-500'
      }
    };

    return typeColors[tagType.toLowerCase()] || typeColors['other'];
  };

  // Modern size variants with better spacing
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2'
  };

  const iconSizes = {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 14
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
        inline-flex items-center font-medium rounded-full border backdrop-blur-sm
        transition-all duration-200 ease-out
        ${sizeClasses[size]}
        ${colors.bg}
        ${colors.text}
        ${colors.border}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-sm active:scale-95' : ''}
        ${className}
      `}
      onClick={handleClick}
      title={tagDescription || `${tagType} tag: ${tagName}`}
    >
      {/* Modern hash icon instead of dot */}
      <Hash size={iconSizes[size]} className={`${colors.dot} flex-shrink-0`} />
      
      {/* Tag name with better truncation */}
      <span className="truncate max-w-20 font-medium">
        {tagName}
      </span>

      {/* Soft remove button */}
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className={`
            ml-1 p-0.5 rounded-full transition-all duration-200
            ${colors.text} hover:bg-red-100 dark:hover:bg-red-900/30 
            hover:text-red-600 dark:hover:text-red-400
            flex-shrink-0 hover:scale-110 active:scale-95
          `}
          title="Remove tag"
          aria-label={`Remove ${tagName} tag`}
        >
          <X size={iconSizes[size]} />
        </button>
      )}
    </span>
  );
};

export default EmployeeTag;