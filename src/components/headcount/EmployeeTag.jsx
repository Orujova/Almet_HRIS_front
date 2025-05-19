"use client";
import { useTheme } from "../common/ThemeProvider";

const EmployeeTag = ({ tag }) => {
  const { darkMode } = useTheme();
  
  // Choose color based on tag type
  let bgColor = '';
  let textColor = '';
  
  switch (tag.toLowerCase()) {
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
    default:
      bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-200';
      textColor = darkMode ? 'text-gray-300' : 'text-gray-800';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {tag}
    </span>
  );
};

export default EmployeeTag;