// src/components/headcount/EmployeeStatusBadge.jsx - Status Display Component
import { useTheme } from "../common/ThemeProvider";

/**
 * Employee Status Badge Component
 * Displays employee status with appropriate colors and styling
 */
const EmployeeStatusBadge = ({ 
  status, 
  color, 
  size = "md", 
  showIcon = false,
  className = "" 
}) => {
  const { darkMode } = useTheme();

  // Default status colors if not provided
  const getStatusColor = (statusName) => {
    const defaultColors = {
      'ACTIVE': '#28A745',
      'ONBOARDING': '#FFA500',
      'PROBATION': '#FFD700',
      'ON LEAVE': '#DC3545',
      'TERMINATED': '#6C757D',
      'INACTIVE': '#6C757D',
      'PENDING': '#17A2B8'
    };
    
    return color || defaultColors[statusName?.toUpperCase()] || '#6C757D';
  };

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  // Get status display text
  const getStatusText = (statusName) => {
    if (!statusName) return 'Unknown';
    
    // Convert underscores to spaces and title case
    return statusName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);

  // Generate background color with appropriate opacity
  const getBgColor = () => {
    if (!statusColor) return darkMode ? 'bg-gray-700' : 'bg-gray-100';
    
    // Convert hex to rgba for background
    const hex = statusColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return darkMode 
      ? `rgba(${r}, ${g}, ${b}, 0.2)` 
      : `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  // Generate text color
  const getTextColor = () => {
    if (!statusColor) return darkMode ? 'text-gray-300' : 'text-gray-700';
    
    // Use the status color directly for text
    return statusColor;
  };

  const bgColor = getBgColor();
  const textColor = getTextColor();

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor: statusColor + '40' // Add transparency to border
      }}
    >
      {/* Status indicator dot */}
      <span
        className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0"
        style={{ backgroundColor: statusColor }}
      />
      
      {/* Status text */}
      <span className="truncate">
        {statusText}
      </span>

      {/* Optional icon based on status */}
      {showIcon && (
        <span className="ml-1.5">
          {getStatusIcon(status)}
        </span>
      )}
    </span>
  );
};

// Helper function to get status icon
const getStatusIcon = (status) => {
  const iconMap = {
    'ACTIVE': '✓',
    'ONBOARDING': '👋',
    'PROBATION': '⏳',
    'ON LEAVE': '🏖️',
    'TERMINATED': '❌',
    'INACTIVE': '⏸️',
    'PENDING': '⏳'
  };
  
  return iconMap[status?.toUpperCase()] || '';
};

export default EmployeeStatusBadge;