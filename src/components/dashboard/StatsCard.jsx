"use client";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";

const StatsCard = ({ title, value, icon, change, comparison }) => {
  const { darkMode } = useTheme();
  const isPositive = !change.includes("-");

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgIcon = darkMode ? "bg-gray-700" : "bg-gray-100";
  const shadowClass = darkMode ? "" : "shadow-md";

  return (
    <div
      className={`${bgCard} rounded-lg p-4 ${shadowClass} transition-colors duration-200`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm ${textMuted} mb-1`}>{title}</p>
          <h3 className={`text-2xl font-bold ${textPrimary}`}>{value}</h3>
        </div>
        <div className={`${bgIcon} p-2 rounded-lg`}>{icon}</div>
      </div>
      <div className="flex items-center mt-4">
        <span
          className={`text-xs flex items-center ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          <ArrowUpRight
            size={14}
            className={`mr-1 ${!isPositive ? "transform rotate-90" : ""}`}
          />{" "}
          {change}
        </span>
        <span className={`${textMuted} text-xs ml-2`}>{comparison}</span>
      </div>
    </div>
  );
};

export default StatsCard;
