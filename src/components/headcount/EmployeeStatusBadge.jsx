// src/components/headcount/EmployeeStatusBadge.jsx
import React from "react";
import { useTheme } from "../common/ThemeProvider";

const EmployeeStatusBadge = ({ status }) => {
  const { darkMode } = useTheme();

  let bgColor = "";
  let textColor = "";
  let statusText = status || "Unknown";

  // Normalize status to lowercase for comparison
  const normalizedStatus = status ? status.toLowerCase() : "";

  switch (normalizedStatus) {
    case "active":
      bgColor = darkMode ? "bg-green-900" : "bg-green-100";
      textColor = darkMode ? "text-green-300" : "text-green-800";
      statusText = "ACTIVE";
      break;
    case "on boarding":
    case "onboarding":
    case "on-boarding":
      bgColor = darkMode ? "bg-yellow-900" : "bg-yellow-100";
      textColor = darkMode ? "text-yellow-300" : "text-yellow-800";
      statusText = "ON BOARDING";
      break;
    case "probation":
      bgColor = darkMode ? "bg-purple-900" : "bg-purple-100";
      textColor = darkMode ? "text-purple-300" : "text-purple-800";
      statusText = "PROBATION";
      break;
    case "on leave":
    case "onleave":
    case "on-leave":
      bgColor = darkMode ? "bg-red-900" : "bg-red-100";
      textColor = darkMode ? "text-red-300" : "text-red-800";
      statusText = "ON LEAVE";
      break;
    default:
      bgColor = darkMode ? "bg-gray-900" : "bg-gray-100";
      textColor = darkMode ? "text-gray-300" : "text-gray-800";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {statusText}
    </span>
  );
};

export default EmployeeStatusBadge;
