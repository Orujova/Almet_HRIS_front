"use client";
import { useTheme } from "../common/ThemeProvider";

const ApplicationsChart = () => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const bgCircle = darkMode ? "#374151" : "#e5e7eb";
  const innerCircle = darkMode ? "#1f2937" : "#ffffff";
  const shadowClass = darkMode ? "" : "shadow-md";

  return (
    <div
      className={`${bgCard} rounded-lg p-6 ${shadowClass} transition-colors duration-200`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-medium ${textPrimary}`}>
          Job Applications
        </h3>
      </div>
      <div className="flex justify-center items-center h-48">
        {/* Donut Chart - Approximation */}
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill={bgCircle} />

            {/* Segments */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset="70"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset="212"
              transform="rotate(200 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#34d399"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset="226"
              transform="rotate(120 50 50)"
            />

            {/* Inner circle for donut */}
            <circle cx="50" cy="50" r="35" fill={innerCircle} />
          </svg>
        </div>

        {/* Legend */}
        <div className="ml-8 space-y-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
            <span className={`text-sm ${textSecondary}`}>Qualified (45%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-400 mr-2"></div>
            <span className={`text-sm ${textSecondary}`}>Interview (25%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
            <span className={`text-sm ${textSecondary}`}>Hired (30%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsChart;
