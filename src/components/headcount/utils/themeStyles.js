// src/utils/themeStyles.js

/**
 * Üslubların hazırlanması üçün funksiya
 * @param {boolean} darkMode - Qaranlıq rejim fəaldır ya yox
 * @returns {Object} - Üslublar obyekti
 */
export const getThemeStyles = (darkMode) => {
  return {
    bgCard: darkMode ? "bg-gray-800" : "bg-white",
    textPrimary: darkMode ? "text-white" : "text-gray-900",
    textSecondary: darkMode ? "text-gray-300" : "text-gray-700",
    textMuted: darkMode ? "text-gray-400" : "text-gray-500",
    borderColor: darkMode ? "border-gray-700" : "border-gray-200",
    inputBg: darkMode ? "bg-gray-700" : "bg-gray-100",
    btnPrimary: darkMode
      ? "bg-almet-sapphire hover:bg-almet-astral"
      : "bg-almet-sapphire hover:bg-almet-astral",
    btnSecondary: darkMode
      ? "bg-gray-700 hover:bg-gray-600"
      : "bg-gray-200 hover:bg-gray-300",
    hoverBg: darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
    shadowClass: darkMode ? "" : "shadow",
    theadBg: darkMode ? "bg-gray-700" : "bg-gray-50",
  };
};

/**
 * Departament üçün arxa fon rənginin hazırlanması
 * @param {string} department - Departament adı
 * @param {boolean} darkMode - Qaranlıq rejim fəaldır ya yox
 * @returns {string} - Departament üçün tailwind arxa fon sinifi
 */
export const getDepartmentColor = (department, darkMode) => {
  if (department.includes("BUSINESS DEVELOPMENT")) {
    return darkMode ? "bg-blue-900/30" : "bg-blue-50";
  } else if (department.includes("FINANCE")) {
    return darkMode ? "bg-green-900/30" : "bg-green-50";
  } else if (department.includes("COMPLIANCE")) {
    return darkMode ? "bg-red-900/30" : "bg-red-50";
  } else if (department.includes("HR")) {
    return darkMode ? "bg-purple-900/30" : "bg-purple-50";
  } else if (department.includes("ADMINISTRATIVE")) {
    return darkMode ? "bg-yellow-900/30" : "bg-yellow-50";
  } else if (department.includes("OPERATIONS")) {
    return darkMode ? "bg-orange-900/30" : "bg-orange-50";
  } else if (department.includes("PROJECTS MANAGEMENT")) {
    return darkMode ? "bg-teal-900/30" : "bg-teal-50";
  } else if (department.includes("TRADE")) {
    return darkMode ? "bg-indigo-900/30" : "bg-indigo-50";
  } else if (department.includes("STOCK SALES")) {
    return darkMode ? "bg-pink-900/30" : "bg-pink-50";
  } else {
    return "";
  }
};