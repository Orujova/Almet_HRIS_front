"use client";
import { useTheme } from "../common/ThemeProvider";

// Status definitions with colors for both light and dark modes
const statusDefinitions = {
  active: {
    label: "Active",
    light: "bg-emerald-100 text-emerald-800",
    dark: "bg-emerald-900 text-emerald-300",
  },
  onboarding: {
    label: "On Boarding",
    light: "bg-yellow-100 text-yellow-800",
    dark: "bg-yellow-900 text-yellow-300",
  },
  probation: {
    label: "Probation",
    light: "bg-purple-100 text-purple-800",
    dark: "bg-purple-900 text-purple-300",
  },
  onLeave: {
    label: "On Leave",
    light: "bg-blue-100 text-blue-800",
    dark: "bg-blue-900 text-blue-300",
  },
  needInvitation: {
    label: "Need Invitation",
    light: "bg-red-100 text-red-800",
    dark: "bg-red-900 text-red-300",
  },
  activated: {
    label: "Activated",
    light: "bg-emerald-100 text-emerald-800",
    dark: "bg-emerald-900 text-emerald-300",
  },
};

const EmployeeStatusBadge = ({ status }) => {
  const { darkMode } = useTheme();

  // Get status data or default to unknown
  const statusData = statusDefinitions[status] || {
    label: "Unknown",
    light: "bg-gray-100 text-gray-800",
    dark: "bg-gray-700 text-gray-300",
  };

  // Apply appropriate color based on theme
  const badgeClasses = darkMode ? statusData.dark : statusData.light;

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${badgeClasses}`}
    >
      {statusData.label}
    </span>
  );
};

export default EmployeeStatusBadge;
