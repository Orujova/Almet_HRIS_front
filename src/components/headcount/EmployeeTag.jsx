// src/components/headcount/EmployeeTag.jsx - Updated to handle backend tag structure
"use client";
import { useTheme } from "../common/ThemeProvider";

const EmployeeTag = ({ tag }) => {
  const { darkMode } = useTheme();
  
  // Handle both string tags and object tags from backend
  const tagName = typeof tag === 'string' ? tag : tag?.name || '';
  const tagColor = typeof tag === 'object' ? tag?.color : null;
  const tagType = typeof tag === 'object' ? tag?.type : null;
  
  // Choose color based on tag type or name
  let bgColor = '';
  let textColor = '';
  
  if (tagColor) {
    // Use color from backend
    bgColor = `bg-[${tagColor}]`;
    textColor = 'text-white';
  } else {
    // Fallback to predefined colors
    switch (tagName.toLowerCase()) {
      case 'sick leave':
        bgColor = darkMode ? 'bg-orange-900' : 'bg-orange-100';
        textColor = darkMode ? 'text-orange-300' : 'text-orange-800';
        break;
      case 'maternity':
        bgColor = darkMode ? 'bg-pink-900' : 'bg-pink-100';
        textColor = darkMode ? 'text-pink-300' : 'text-pink-800';
        break;
      case 'suspension':
        bgColor = darkMode ? 'bg-red-900' : 'bg-red-100';
        textColor = darkMode ? 'text-red-300' : 'text-red-800';
        break;
      case 'remote work':
        bgColor = darkMode ? 'bg-blue-900' : 'bg-blue-100';
        textColor = darkMode ? 'text-blue-300' : 'text-blue-800';
        break;
      case 'part-time':
        bgColor = darkMode ? 'bg-yellow-900' : 'bg-yellow-100';
        textColor = darkMode ? 'text-yellow-300' : 'text-yellow-800';
        break;
      default:
        bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-200';
        textColor = darkMode ? 'text-gray-300' : 'text-gray-800';
    }
  }

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${bgColor} ${textColor}`}
      style={tagColor ? { backgroundColor: tagColor, color: 'white' } : {}}
    >
      {tagName}
    </span>
  );
};

export default EmployeeTag;