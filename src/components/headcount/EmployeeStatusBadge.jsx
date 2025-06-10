// src/components/headcount/EmployeeStatusBadge.jsx - Updated to handle backend data
"use client";
import { useTheme } from "../common/ThemeProvider";

const EmployeeStatusBadge = ({ status, color }) => {
  const { darkMode } = useTheme();

  // Default colors if not provided
  const getStatusColor = (statusName) => {
    const normalizedStatus = statusName ? statusName.toLowerCase() : "";
    
    switch (normalizedStatus) {
      case "active":
        return darkMode ? "#22c55e" : "#16a34a";
      case "onboarding":
      case "on boarding":
        return darkMode ? "#f59e0b" : "#d97706";
      case "probation":
        return darkMode ? "#8b5cf6" : "#7c3aed";
      case "on leave":
      case "on_leave":
        return darkMode ? "#ef4444" : "#dc2626";
      default:
        return darkMode ? "#6b7280" : "#4b5563";
    }
  };

  const statusColor = color || getStatusColor(status);
  const statusText = status || "Unknown";

  return (
    <span
      className={`inline-flex items-center justify-center text-center px-2 py-0.5 rounded-full text-xs font-medium text-white`}
      style={{ backgroundColor: statusColor }}
    >
      {statusText}
    </span>
  );
};

export default EmployeeStatusBadge;