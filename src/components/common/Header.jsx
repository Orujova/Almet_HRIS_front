"use client";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const Header = () => {
  const { darkMode, toggleTheme } = useTheme();

  // Theme-dependent classes
  const bgHeader = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgInput = darkMode ? "bg-gray-700" : "bg-gray-100";
  const bgButton = darkMode ? "bg-gray-700" : "bg-gray-200";

  return (
    <header
      className={`${bgHeader} border-b ${borderColor} p-4 transition-colors duration-200`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hi, Pristia</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`}
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              className={`${bgInput} ${textPrimary} pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <button className={`${bgButton} p-2 rounded-full relative`}>
            <Bell size={18} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/4 -translate-y-1/4"></span>
          </button>
          <button
            onClick={toggleTheme}
            className={`${bgButton} p-2 rounded-full transition-all duration-300 hover:rotate-12`}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <Sun size={18} className="text-yellow-300" />
            ) : (
              <Moon size={18} className="text-blue-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
