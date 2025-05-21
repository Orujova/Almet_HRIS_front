// src/components/headcount/ActionMenu.jsx
"use client";
import { Download, Users, Trash2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { useTheme } from "../common/ThemeProvider";
import { getThemeStyles } from "./utils/themeStyles";


/**
 * Seçilmiş əməkdaşlar üçün əməliyyatlar menyusu
 * @param {Object} props - Komponent parametrləri
 * @param {boolean} props.isOpen - Menyu açıqdır ya yox
 * @param {Function} props.onClose - Menyu bağlandıqda çağrılan funksiya
 * @param {Function} props.onAction - Əməliyyat seçildikdə çağrılan funksiya
 * @returns {JSX.Element} - Əməliyyatlar menyusu
 */
const ActionMenu = ({ isOpen, onClose, onAction }) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={`absolute right-0 z-50 mt-2 w-56 rounded-md shadow-lg ${
        darkMode ? "bg-gray-800" : "bg-white"
      } ring-1 ring-black ring-opacity-5`}
      style={{ 
        zIndex: 9999, 
        top: '100%',
        maxHeight: '300px',
        overflowY: 'auto'
      }}
    >
      <div className="py-1" role="menu">
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left`}
          onClick={() => onAction("export")}
        >
          <div className="flex items-center">
            <Download size={16} className="mr-2 text-blue-500" />
            <span>Export Selected Data</span>
          </div>
        </button>
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left`}
          onClick={() => onAction("changeManager")}
        >
          <div className="flex items-center">
            <Users size={16} className="mr-2 text-green-500" />
            <span>Change Line Manager</span>
          </div>
        </button>
        <button
          className={`${styles.textPrimary} ${styles.hoverBg} block px-4 py-2 text-sm w-full text-left border-t border-gray-200 dark:border-gray-700 mt-1 pt-1`}
          onClick={() => onAction("delete")}
        >
          <div className="flex items-center">
            <Trash2 size={16} className="mr-2 text-red-500" />
            <span className="text-red-500 dark:text-red-400">Delete Selected</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ActionMenu;