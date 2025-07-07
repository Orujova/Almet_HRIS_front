// src/components/headcount/ActionsDropdown.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Tag, Users, FileText, BarChart2, MessageSquare, Trash2 } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { getThemeStyles } from "./utils/themeStyles";
import Link from "next/link";

/**
 * Əməkdaşlar üçün əməliyyatlar açılan menyusu
 * @param {Object} props - Komponent parametrləri
 * @param {string} props.employeeId - Əməkdaşın ID-si
 * @param {Function} props.onAction - Əməliyyat seçildikdə çağrılan funksiya
 * @returns {JSX.Element} - Əməliyyatlar açılan menyusu komponenti
 */
const ActionsDropdown = ({ employeeId, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  // Kənar klikləri izləmək üçün
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Menyu vəziyyətini dəyişdirmək
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Əməliyyatı seçmək və menyunu bağlamaq
  const handleAction = (action) => {
    onAction(employeeId, action);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`p-1 rounded-full ${styles.hoverBg}`}
        aria-label="Actions"
      >
        <MoreVertical size={16} className={styles.textSecondary} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-1 z-50 w-48 rounded-md shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          } ring-1 ring-black ring-opacity-5 overflow-hidden`}
          style={{ zIndex: 9999 }} // Yüksək z-index dəyəri
        >
          <div className="py-1" role="menu">
           <Link href={`/structure/employee/${employeeId}`}>
              <button
                className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left`}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <FileText size={16} className="mr-2 text-blue-500" />
                  <span>View Details</span>
                </div>
              </button>
            </Link>
            <Link href={`/structure/employee/${employeeId}/edit`}>
              <button
                className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left`}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <Edit size={16} className="mr-2 text-green-500" />
                  <span>Edit Employee</span>
                </div>
              </button>
            </Link>
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("addTag")}
            >
              <div className="flex items-center">
                <Tag size={16} className="mr-2 text-purple-500" />
                <span>Add Tag</span>
              </div>
            </button>
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("changeManager")}
            >
              <div className="flex items-center">
                <Users size={16} className="mr-2 text-indigo-500" />
                <span>Change Manager</span>
              </div>
            </button>
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("viewJobDescription")}
            >
              <div className="flex items-center">
                <FileText size={16} className="mr-2 text-amber-500" />
                <span>Job Description</span>
              </div>
            </button>
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("performanceMatrix")}
            >
              <div className="flex items-center">
                <BarChart2 size={16} className="mr-2 text-teal-500" />
                <span>Competency   Matrix</span>
              </div>
            </button>
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left`}
              onClick={() => handleAction("performanceMatrix")}
            >
              <div className="flex items-center">
                <BarChart2 size={16} className="mr-2 text-teal-500" />
                <span>Performance Managament</span>
              </div>
            </button>
           
            <button
              className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left border-t border-gray-200 dark:border-gray-700 mt-1 pt-1`}
              onClick={() => handleAction("delete")}
            >
              <div className="flex items-center">
                <Trash2 size={16} className="mr-2 text-red-500" />
                <span className="text-red-500 dark:text-red-400">Delete</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown;