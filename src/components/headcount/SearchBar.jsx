// src/components/headcount/SearchBar.jsx
"use client";
import { Search } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { getThemeStyles } from "./utils/themeStyles";

/**
 * Əməkdaşlar üçün axtarış komponenti
 * @param {Object} props - Komponent parametrləri
 * @param {string} props.searchTerm - Axtarış mətni
 * @param {Function} props.onSearchChange - Axtarış mətni dəyişdikdə çağrılan funksiya
 * @returns {JSX.Element} - Axtarış komponenti
 */
const SearchBar = ({ searchTerm, onSearchChange }) => {
  const { darkMode } = useTheme();
  const styles = getThemeStyles(darkMode);

  const handleChange = (e) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative w-full md:w-1/3 mb-4">
      <input
        type="text"
        placeholder="Search employees by name, email, HC number..."
        value={searchTerm}
        onChange={handleChange}
        className={`w-full p-2 pl-10 pr-4 text-sm rounded-lg border ${styles.borderColor} ${styles.inputBg} ${styles.textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
      />
      <Search
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${styles.textMuted}`}
        size={18}
      />
    </div>
  );
};

export default SearchBar;